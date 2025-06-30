-- =====================================================
-- CORREÇÃO: Remover função vote_product duplicada
-- =====================================================

-- Primeiro, vamos ver quantas funções vote_product existem
SELECT 
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments,
    p.oid
FROM pg_proc p 
WHERE p.proname = 'vote_product';

-- Remover TODAS as versões da função vote_product
DROP FUNCTION IF EXISTS vote_product(UUID, UUID, BOOLEAN, INET, TEXT);
DROP FUNCTION IF EXISTS vote_product(UUID, UUID, BOOLEAN);

-- Recriar apenas a versão correta (sem parâmetros extras)
CREATE OR REPLACE FUNCTION vote_product(
    p_user_id UUID,
    p_product_id UUID,
    p_is_positive BOOLEAN
)
RETURNS JSONB AS $$
DECLARE
    v_existing_vote user_votes%ROWTYPE;
    v_product_exists BOOLEAN := false;
    v_user_exists BOOLEAN := false;
    v_result JSONB;
    v_new_vote_score INTEGER;
    v_total_votes INTEGER;
    v_positive_votes INTEGER;
    v_negative_votes INTEGER;
    v_action TEXT;
BEGIN
    -- Validar se o produto existe e está ativo
    SELECT EXISTS(
        SELECT 1 FROM products 
        WHERE id = p_product_id 
        AND status = 'approved' 
        AND is_active = true
    ) INTO v_product_exists;
    
    IF NOT v_product_exists THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'product_not_found',
            'message', 'Produto não encontrado ou não está ativo'
        );
    END IF;
    
    -- Validar se o usuário existe e está ativo
    SELECT EXISTS(
        SELECT 1 FROM users 
        WHERE id = p_user_id 
        AND is_active = true
    ) INTO v_user_exists;
    
    IF NOT v_user_exists THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'user_not_found',
            'message', 'Usuário não encontrado ou não está ativo'
        );
    END IF;

    -- Verificar se já existe um voto deste usuário para este produto
    SELECT * INTO v_existing_vote 
    FROM user_votes 
    WHERE user_id = p_user_id AND product_id = p_product_id;

    IF FOUND THEN
        -- Se o voto já existe e é igual ao novo voto, remover (toggle)
        IF v_existing_vote.is_positive = p_is_positive THEN
            DELETE FROM user_votes WHERE id = v_existing_vote.id;
            v_action := 'removed';
            
            -- Decrementar contador de votos do usuário
            UPDATE users 
            SET total_votes_cast = GREATEST(0, total_votes_cast - 1)
            WHERE id = p_user_id;
            
            v_result := jsonb_build_object(
                'success', true,
                'action', v_action,
                'message', 'Voto removido com sucesso'
            );
        ELSE
            -- Se o voto existe mas é diferente, atualizar
            UPDATE user_votes 
            SET is_positive = p_is_positive,
                updated_at = NOW()
            WHERE id = v_existing_vote.id;
            
            v_action := 'updated';
            
            v_result := jsonb_build_object(
                'success', true,
                'action', v_action,
                'message', 'Voto atualizado com sucesso'
            );
        END IF;
    ELSE
        -- Se não existe voto, inserir novo
        INSERT INTO user_votes (user_id, product_id, is_positive)
        VALUES (p_user_id, p_product_id, p_is_positive);
        
        v_action := 'created';
        
        -- Atualizar contador de votos do usuário
        UPDATE users 
        SET total_votes_cast = total_votes_cast + 1
        WHERE id = p_user_id;
        
        -- Dar recompensa por votar (apenas para novos votos)
        INSERT INTO user_rewards (user_id, product_id, reward_type, points, description)
        VALUES (p_user_id, p_product_id, 'vote_cast', 1, 'Voted on product');
        
        v_result := jsonb_build_object(
            'success', true,
            'action', v_action,
            'message', 'Voto criado com sucesso'
        );
    END IF;
    
    -- SEMPRE recalcular contadores do produto após qualquer mudança
    SELECT 
        COALESCE(COUNT(*), 0) as total,
        COALESCE(COUNT(*) FILTER (WHERE is_positive = true), 0) as positive,
        COALESCE(COUNT(*) FILTER (WHERE is_positive = false), 0) as negative
    INTO v_total_votes, v_positive_votes, v_negative_votes
    FROM user_votes 
    WHERE product_id = p_product_id;
    
    -- Garantir que os valores nunca sejam negativos
    v_total_votes := GREATEST(0, v_total_votes);
    v_positive_votes := GREATEST(0, v_positive_votes);
    v_negative_votes := GREATEST(0, v_negative_votes);
    
    -- Atualizar contadores na tabela products
    UPDATE products 
    SET 
        total_votes = v_total_votes,
        positive_votes = v_positive_votes,
        negative_votes = v_negative_votes,
        updated_at = NOW()
    WHERE id = p_product_id;

    -- Recalcular heat score
    SELECT calculate_heat_score(p_product_id) INTO v_new_vote_score;
    
    -- Adicionar informações do produto atualizado ao resultado
    v_result := v_result || jsonb_build_object(
        'product_id', p_product_id,
        'vote_counts', jsonb_build_object(
            'total', v_total_votes,
            'positive', v_positive_votes,
            'negative', v_negative_votes,
            'heat_score', v_new_vote_score
        ),
        'user_action', v_action
    );
    
    -- Log para debug
    RAISE NOTICE 'Vote processed: user=%, product=%, action=%, total_votes=%', 
        p_user_id, p_product_id, v_action, v_total_votes;
    
    RETURN v_result;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error in vote_product: %', SQLERRM;
        RETURN jsonb_build_object(
            'success', false,
            'error', 'database_error',
            'message', 'Erro interno do servidor',
            'details', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar se a função foi criada corretamente
SELECT 
    p.proname as function_name,
    pg_get_function_identity_arguments(p.oid) as arguments
FROM pg_proc p 
WHERE p.proname = 'vote_product';

-- Teste simples da função
SELECT vote_product(
    '20000000-0000-0000-0000-000000000002'::uuid,
    '30000000-0000-0000-0000-000000000001'::uuid, 
    true
) as test_result;

-- =====================================================
-- FUNÇÃO PARA RECALCULAR TODOS OS CONTADORES
-- =====================================================

CREATE OR REPLACE FUNCTION recalculate_product_counters()
RETURNS JSONB AS $$
DECLARE
    v_product_record RECORD;
    v_total_updated INTEGER := 0;
    v_errors INTEGER := 0;
BEGIN
    -- Recalcular contadores para todos os produtos
    FOR v_product_record IN 
        SELECT id FROM products WHERE is_active = true
    LOOP
        BEGIN
            -- Recalcular votos
            UPDATE products 
            SET 
                total_votes = (
                    SELECT COALESCE(COUNT(*), 0) 
                    FROM user_votes 
                    WHERE product_id = v_product_record.id
                ),
                positive_votes = (
                    SELECT COALESCE(COUNT(*), 0) 
                    FROM user_votes 
                    WHERE product_id = v_product_record.id AND is_positive = true
                ),
                negative_votes = (
                    SELECT COALESCE(COUNT(*), 0) 
                    FROM user_votes 
                    WHERE product_id = v_product_record.id AND is_positive = false
                ),
                comment_count = (
                    SELECT COALESCE(COUNT(*), 0) 
                    FROM comments 
                    WHERE product_id = v_product_record.id AND is_approved = true
                )
            WHERE id = v_product_record.id;
            
            -- Recalcular heat score
            PERFORM calculate_heat_score(v_product_record.id);
            
            v_total_updated := v_total_updated + 1;
            
        EXCEPTION
            WHEN OTHERS THEN
                v_errors := v_errors + 1;
                RAISE NOTICE 'Error updating product %: %', v_product_record.id, SQLERRM;
        END;
    END LOOP;
    
    RETURN jsonb_build_object(
        'success', true,
        'products_updated', v_total_updated,
        'errors', v_errors,
        'message', format('Recalculados contadores de %s produtos com %s erros', v_total_updated, v_errors)
    );
END;
$$ LANGUAGE plpgsql; 