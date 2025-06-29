-- =====================================================
-- DEALS HUB - FUNÇÕES SQL
-- Lógica de negócio para votação, heat score e recompensas
-- =====================================================

-- =====================================================
-- 1. FUNÇÃO PARA PROCESSAR VOTO (ATUALIZADA)
-- =====================================================
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
        
        -- Atualizar contador de votos do usuário
        UPDATE users 
        SET total_votes_cast = total_votes_cast + 1
        WHERE id = p_user_id;
        
        -- Dar recompensa por votar
        INSERT INTO user_rewards (user_id, product_id, reward_type, points, description)
        VALUES (p_user_id, p_product_id, 'vote_cast', 1, 'Voted on product');
        
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

-- =====================================================
-- 2. FUNÇÃO PARA CALCULAR HEAT SCORE
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_heat_score(p_product_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_product products%ROWTYPE;
    v_age_hours NUMERIC;
    v_base_score NUMERIC;
    v_time_decay NUMERIC;
    v_final_score INTEGER;
    v_niche_settings JSONB;
BEGIN
    -- Buscar produto
    SELECT * INTO v_product
    FROM products 
    WHERE id = p_product_id;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Buscar configurações do nicho
    SELECT settings INTO v_niche_settings
    FROM niches 
    WHERE id = v_product.niche_id;

    -- Calcular idade do produto em horas
    v_age_hours := EXTRACT(EPOCH FROM (NOW() - v_product.created_at)) / 3600;
    
    -- Score base: (upvotes - downvotes) + bonus por clicks e comentários
    v_base_score := v_product.positive_votes - v_product.negative_votes;
    v_base_score := v_base_score + (v_product.click_count * 0.1);
    v_base_score := v_base_score + (v_product.comment_count * 0.5);
    
    -- Decay temporal (configurável por nicho)
    v_time_decay := POWER(0.5, v_age_hours / COALESCE((v_niche_settings->>'heat_decay_hours')::numeric, 24));
    
    -- Score final
    v_final_score := GREATEST(0, ROUND(v_base_score * v_time_decay)::INTEGER);
    
    -- Atualizar produto
    UPDATE products 
    SET heat_score = v_final_score
    WHERE id = p_product_id;
    
    RETURN v_final_score;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. FUNÇÃO PARA REGISTRAR CLICK
-- =====================================================
CREATE OR REPLACE FUNCTION register_click(
    p_product_id UUID,
    p_user_id UUID DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_referrer TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB AS $$
DECLARE
    v_click_id UUID;
    v_points_awarded INTEGER := 0;
BEGIN
    -- Verificar se o produto existe
    IF NOT EXISTS (SELECT 1 FROM products WHERE id = p_product_id AND is_active = true) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Product not found or inactive'
        );
    END IF;

    -- Registrar o click
    INSERT INTO clicks (product_id, user_id, ip_address, user_agent, referrer, metadata)
    VALUES (p_product_id, p_user_id, p_ip_address, p_user_agent, p_referrer, p_metadata)
    RETURNING id INTO v_click_id;
    
    -- Atualizar contador de clicks do produto
    UPDATE products 
    SET click_count = click_count + 1
    WHERE id = p_product_id;
    
    -- Dar recompensa ao criador do produto (se aplicável)
    IF p_user_id IS NOT NULL THEN
        INSERT INTO user_rewards (user_id, product_id, reward_type, points, description)
        SELECT created_by, p_product_id, 'product_clicked', 2, 'Product received a click'
        FROM products 
        WHERE id = p_product_id AND created_by IS NOT NULL AND created_by != p_user_id;
        
        GET DIAGNOSTICS v_points_awarded = ROW_COUNT;
        v_points_awarded := v_points_awarded * 2;
    END IF;
    
    -- Recalcular heat score
    PERFORM calculate_heat_score(p_product_id);
    
    RETURN jsonb_build_object(
        'success', true,
        'click_id', v_click_id,
        'points_awarded', v_points_awarded
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. FUNÇÃO PARA CURTIR COMENTÁRIO
-- =====================================================
CREATE OR REPLACE FUNCTION like_comment(
    p_user_id UUID,
    p_comment_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_existing_like comment_likes%ROWTYPE;
    v_comment comments%ROWTYPE;
    v_like_added BOOLEAN := false;
BEGIN
    -- Verificar se o comentário existe
    SELECT * INTO v_comment FROM comments WHERE id = p_comment_id AND is_approved = true;
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Comment not found or not approved'
        );
    END IF;

    -- Verificar se já curtiu
    SELECT * INTO v_existing_like 
    FROM comment_likes 
    WHERE user_id = p_user_id AND comment_id = p_comment_id;

    IF FOUND THEN
        -- Remover like
        DELETE FROM comment_likes WHERE id = v_existing_like.id;
        
        UPDATE comments 
        SET likes_count = likes_count - 1
        WHERE id = p_comment_id;
        
    ELSE
        -- Adicionar like
        INSERT INTO comment_likes (user_id, comment_id)
        VALUES (p_user_id, p_comment_id);
        
        UPDATE comments 
        SET likes_count = likes_count + 1
        WHERE id = p_comment_id;
        
        v_like_added := true;
        
        -- Dar recompensa ao autor do comentário
        IF v_comment.user_id != p_user_id THEN
            INSERT INTO user_rewards (user_id, product_id, reward_type, points, description)
            VALUES (v_comment.user_id, v_comment.product_id, 'comment_liked', 1, 'Comment received a like');
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'like_added', v_like_added
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. FUNÇÃO PARA ATUALIZAR REPUTAÇÃO DO USUÁRIO
-- =====================================================
CREATE OR REPLACE FUNCTION update_user_reputation()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalcular reputação baseada em recompensas
    UPDATE users 
    SET reputation_score = (
        SELECT COALESCE(SUM(points), 0)
        FROM user_rewards 
        WHERE user_id = NEW.user_id
    )
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar reputação quando recompensas são adicionadas
CREATE TRIGGER trigger_update_user_reputation
    AFTER INSERT ON user_rewards
    FOR EACH ROW
    EXECUTE FUNCTION update_user_reputation();

-- =====================================================
-- 6. FUNÇÃO PARA ATUALIZAR CONTADORES DE COMENTÁRIOS
-- =====================================================
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE products 
        SET comment_count = comment_count + 1
        WHERE id = NEW.product_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE products 
        SET comment_count = comment_count - 1
        WHERE id = OLD.product_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar contador de comentários
CREATE TRIGGER trigger_update_comment_count
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_comment_count();

-- =====================================================
-- 7. FUNÇÃO PARA RECALCULAR HEAT SCORES EM LOTE
-- =====================================================
CREATE OR REPLACE FUNCTION recalculate_all_heat_scores()
RETURNS INTEGER AS $$
DECLARE
    v_product_id UUID;
    v_count INTEGER := 0;
BEGIN
    FOR v_product_id IN 
        SELECT id FROM products WHERE is_active = true
    LOOP
        PERFORM calculate_heat_score(v_product_id);
        v_count := v_count + 1;
    END LOOP;
    
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. FUNÇÃO PARA ESTATÍSTICAS DO USUÁRIO
-- =====================================================
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_votes', COUNT(uv.id),
        'positive_votes', COUNT(uv.id) FILTER (WHERE uv.is_positive = true),
        'negative_votes', COUNT(uv.id) FILTER (WHERE uv.is_positive = false),
        'total_comments', COUNT(c.id),
        'total_products_submitted', COUNT(p.id),
        'total_clicks_generated', COALESCE(SUM(p.click_count), 0),
        'total_reputation', u.reputation_score,
        'member_since', u.created_at
    ) INTO v_stats
    FROM users u
    LEFT JOIN user_votes uv ON u.id = uv.user_id
    LEFT JOIN comments c ON u.id = c.user_id
    LEFT JOIN products p ON u.id = p.created_by
    WHERE u.id = p_user_id
    GROUP BY u.id, u.reputation_score, u.created_at;
    
    RETURN COALESCE(v_stats, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 