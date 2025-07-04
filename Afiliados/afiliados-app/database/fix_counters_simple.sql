-- Script simples para recalcular contadores de votos
-- Pode ser executado diretamente no Supabase

-- Resetar todos os contadores para 0
UPDATE products 
SET 
    total_votes = 0,
    positive_votes = 0,
    negative_votes = 0
WHERE is_active = true;

-- Recalcular baseado nos votos reais
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

-- Recalcular heat scores
SELECT calculate_heat_score(id) 
FROM products 
WHERE is_active = true AND status = 'approved';

-- Verificar resultados
SELECT 
    id,
    title,
    total_votes,
    positive_votes,
    negative_votes,
    heat_score,
    (SELECT COUNT(*) FROM user_votes WHERE product_id = products.id) as actual_votes
FROM products 
WHERE is_active = true 
ORDER BY total_votes DESC
LIMIT 10; 