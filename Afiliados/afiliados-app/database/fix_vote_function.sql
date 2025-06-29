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
            
            v_result := jsonb_build_object(
                'success', true,
                'action', 'removed',
                'message', 'Voto removido com sucesso'
            );
        ELSE
            -- Se o voto existe mas é diferente, atualizar
            UPDATE user_votes 
            SET is_positive = p_is_positive,
                updated_at = NOW()
            WHERE id = v_existing_vote.id;
            
            v_result := jsonb_build_object(
                'success', true,
                'action', 'updated',
                'message', 'Voto atualizado com sucesso'
            );
        END IF;
    ELSE
        -- Se não existe voto, inserir novo
        INSERT INTO user_votes (user_id, product_id, is_positive)
        VALUES (p_user_id, p_product_id, p_is_positive);
        
        -- Atualizar contador de votos do usuário (se coluna existir)
        UPDATE users 
        SET total_votes_cast = COALESCE(total_votes_cast, 0) + 1
        WHERE id = p_user_id;
        
        -- Dar recompensa por votar (se tabela existir)
        INSERT INTO user_rewards (user_id, product_id, reward_type, points, description)
        VALUES (p_user_id, p_product_id, 'vote_cast', 1, 'Voted on product')
        ON CONFLICT DO NOTHING;
        
        v_result := jsonb_build_object(
            'success', true,
            'action', 'created',
            'message', 'Voto criado com sucesso'
        );
    END IF;
    
    -- Recalcular contadores do produto
    SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_positive = true) as positive,
        COUNT(*) FILTER (WHERE is_positive = false) as negative
    INTO v_total_votes, v_positive_votes, v_negative_votes
    FROM user_votes 
    WHERE product_id = p_product_id;
    
    -- Atualizar contadores na tabela products
    UPDATE products 
    SET 
        total_votes = v_total_votes,
        positive_votes = v_positive_votes,
        negative_votes = v_negative_votes,
        updated_at = NOW()
    WHERE id = p_product_id;

    -- Recalcular heat score (se função existir)
    BEGIN
        SELECT calculate_heat_score(p_product_id) INTO v_new_vote_score;
    EXCEPTION
        WHEN OTHERS THEN
            v_new_vote_score := v_positive_votes - v_negative_votes;
    END;
    
    -- Adicionar informações do produto atualizado ao resultado
    v_result := v_result || jsonb_build_object(
        'product_id', p_product_id,
        'vote_counts', jsonb_build_object(
            'total', v_total_votes,
            'positive', v_positive_votes,
            'negative', v_negative_votes,
            'heat_score', v_new_vote_score
        )
    );
    
    RETURN v_result;
    
EXCEPTION
    WHEN OTHERS THEN
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