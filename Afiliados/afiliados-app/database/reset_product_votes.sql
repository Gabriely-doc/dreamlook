-- =====================================================
-- SCRIPT PARA RESETAR E RECALCULAR VOTOS DOS PRODUTOS
-- Zera contadores e recalcula baseado nos votos reais
-- =====================================================

-- =====================================================
-- 1. BACKUP DOS DADOS ATUAIS (OPCIONAL)
-- =====================================================
-- Criar tabela de backup antes de fazer alterações
CREATE TABLE IF NOT EXISTS products_backup AS 
SELECT 
    id, 
    total_votes, 
    positive_votes, 
    negative_votes, 
    heat_score,
    NOW() as backup_timestamp
FROM products;

-- =====================================================
-- 2. RESETAR TODOS OS CONTADORES PARA ZERO
-- =====================================================
UPDATE products 
SET 
    total_votes = 0,
    positive_votes = 0,
    negative_votes = 0,
    heat_score = 0,
    click_count = COALESCE(click_count, 0),
    comment_count = 0
WHERE is_active = true;

-- =====================================================
-- 3. RECALCULAR CONTADORES BASEADO NOS DADOS REAIS
-- =====================================================

-- Recalcular votos baseado na tabela user_votes
UPDATE products 
SET 
    total_votes = (
        SELECT COALESCE(COUNT(*), 0) 
        FROM user_votes 
        WHERE product_id = products.id
    ),
    positive_votes = (
        SELECT COALESCE(COUNT(*), 0) 
        FROM user_votes 
        WHERE product_id = products.id AND is_positive = true
    ),
    negative_votes = (
        SELECT COALESCE(COUNT(*), 0) 
        FROM user_votes 
        WHERE product_id = products.id AND is_positive = false
    )
WHERE is_active = true;

-- Recalcular comentários baseado na tabela comments
UPDATE products 
SET comment_count = (
    SELECT COALESCE(COUNT(*), 0) 
    FROM comments 
    WHERE product_id = products.id AND is_approved = true
)
WHERE is_active = true;

-- Recalcular clicks baseado na tabela clicks (se existir)
UPDATE products 
SET click_count = (
    SELECT COALESCE(COUNT(*), 0) 
    FROM clicks 
    WHERE product_id = products.id
)
WHERE is_active = true
AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clicks');

-- =====================================================
-- 4. RECALCULAR HEAT SCORES
-- =====================================================

-- Recalcular heat score para todos os produtos ativos
SELECT calculate_heat_score(id) 
FROM products 
WHERE is_active = true AND status = 'approved';

-- =====================================================
-- 5. VERIFICAÇÃO DOS RESULTADOS
-- =====================================================

-- Comparar resultados antes e depois
SELECT 
    'BEFORE' as period,
    COUNT(*) as total_products,
    SUM(total_votes) as sum_total_votes,
    SUM(positive_votes) as sum_positive_votes,
    SUM(negative_votes) as sum_negative_votes,
    AVG(heat_score) as avg_heat_score
FROM products_backup

UNION ALL

SELECT 
    'AFTER' as period,
    COUNT(*) as total_products,
    SUM(total_votes) as sum_total_votes,
    SUM(positive_votes) as sum_positive_votes,
    SUM(negative_votes) as sum_negative_votes,
    AVG(heat_score) as avg_heat_score
FROM products 
WHERE is_active = true;

-- =====================================================
-- 6. PRODUTOS COM DISCREPÂNCIAS (PARA DEBUG)
-- =====================================================

-- Mostrar produtos onde houve mudanças significativas
SELECT 
    p.id,
    p.title,
    pb.total_votes as old_total_votes,
    p.total_votes as new_total_votes,
    pb.positive_votes as old_positive_votes,
    p.positive_votes as new_positive_votes,
    pb.negative_votes as old_negative_votes,
    p.negative_votes as new_negative_votes,
    (SELECT COUNT(*) FROM user_votes WHERE product_id = p.id) as actual_votes_in_db
FROM products p
LEFT JOIN products_backup pb ON p.id = pb.id
WHERE p.is_active = true
AND (
    pb.total_votes != p.total_votes OR
    pb.positive_votes != p.positive_votes OR
    pb.negative_votes != p.negative_votes
)
ORDER BY ABS(pb.total_votes - p.total_votes) DESC;

-- =====================================================
-- 7. ATUALIZAR CONTADORES DOS USUÁRIOS
-- =====================================================

-- Recalcular total de votos dos usuários
UPDATE users 
SET total_votes_cast = (
    SELECT COALESCE(COUNT(*), 0) 
    FROM user_votes 
    WHERE user_id = users.id
)
WHERE is_active = true;

-- =====================================================
-- 8. LOGS E ESTATÍSTICAS FINAIS
-- =====================================================

-- Estatísticas finais
SELECT 
    'ESTATÍSTICAS FINAIS' as info,
    COUNT(*) as total_products,
    COUNT(*) FILTER (WHERE total_votes > 0) as products_with_votes,
    COUNT(*) FILTER (WHERE positive_votes > negative_votes) as products_with_positive_score,
    MAX(total_votes) as max_votes_on_product,
    AVG(total_votes) as avg_votes_per_product
FROM products 
WHERE is_active = true AND status = 'approved';

-- Top 10 produtos mais votados
SELECT 
    title,
    total_votes,
    positive_votes,
    negative_votes,
    heat_score
FROM products 
WHERE is_active = true AND status = 'approved'
ORDER BY total_votes DESC, heat_score DESC
LIMIT 10;

-- =====================================================
-- 9. LIMPEZA (OPCIONAL)
-- =====================================================

-- Remover tabela de backup após verificação (descomente se desejar)
-- DROP TABLE IF EXISTS products_backup;

-- =====================================================
-- 10. FUNÇÃO PARA EXECUTAR TUDO DE UMA VEZ
-- =====================================================

CREATE OR REPLACE FUNCTION reset_and_recalculate_all_counters()
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
    v_products_updated INTEGER;
    v_users_updated INTEGER;
BEGIN
    -- Resetar contadores
    UPDATE products 
    SET 
        total_votes = 0,
        positive_votes = 0,
        negative_votes = 0,
        heat_score = 0,
        comment_count = 0
    WHERE is_active = true;
    
    GET DIAGNOSTICS v_products_updated = ROW_COUNT;
    
    -- Recalcular usando a função existente
    SELECT recalculate_product_counters() INTO v_result;
    
    -- Recalcular contadores de usuários
    UPDATE users 
    SET total_votes_cast = (
        SELECT COALESCE(COUNT(*), 0) 
        FROM user_votes 
        WHERE user_id = users.id
    )
    WHERE is_active = true;
    
    GET DIAGNOSTICS v_users_updated = ROW_COUNT;
    
    RETURN jsonb_build_object(
        'success', true,
        'products_reset', v_products_updated,
        'users_updated', v_users_updated,
        'recalculation_result', v_result,
        'message', 'Todos os contadores foram resetados e recalculados com sucesso'
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- EXECUTAR RESET COMPLETO (DESCOMENTE PARA EXECUTAR)
-- =====================================================

-- SELECT reset_and_recalculate_all_counters(); 