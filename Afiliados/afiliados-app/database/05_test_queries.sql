-- =====================================================
-- DEALS HUB - QUERIES DE TESTE
-- Verificar integridade e funcionamento do banco de dados
-- =====================================================

-- =====================================================
-- 1. TESTES BÁSICOS DE ESTRUTURA
-- =====================================================

-- Verificar se todas as tabelas foram criadas
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN (
    'users', 'roles', 'user_roles', 'niches', 'products',
    'user_votes', 'comments', 'comment_likes', 'clicks',
    'user_rewards', 'pending_posts', 'published_posts'
)
ORDER BY table_name;

-- Verificar se as extensões foram habilitadas
SELECT 
    extname,
    extversion
FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'pgcrypto');

-- Verificar se os índices foram criados
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
AND tablename IN ('products', 'user_votes', 'comments')
ORDER BY tablename, indexname;

-- =====================================================
-- 2. TESTES DE DADOS BÁSICOS
-- =====================================================

-- Verificar roles criadas
SELECT 
    name,
    description,
    is_system_role,
    permissions->'can_manage_users' as can_manage_users
FROM roles
ORDER BY name;

-- Verificar nichos criados
SELECT 
    name,
    slug,
    theme_color,
    is_active,
    settings->'min_votes_for_hot' as min_votes_for_hot
FROM niches
ORDER BY name;

-- Verificar produtos de exemplo
SELECT 
    p.title,
    n.name as niche,
    p.original_price,
    p.current_price,
    p.discount_percentage,
    p.total_votes,
    p.heat_score,
    p.status
FROM products p
JOIN niches n ON p.niche_id = n.id
ORDER BY p.created_at;

-- =====================================================
-- 3. TESTES DE FUNÇÕES
-- =====================================================

-- Testar função de cálculo de heat score
SELECT 
    p.title,
    p.heat_score as old_score,
    calculate_heat_score(p.id) as new_score
FROM products p
WHERE p.status = 'approved'
LIMIT 3;

-- Testar função de estatísticas do usuário
SELECT get_user_stats('20000000-0000-0000-0000-000000000001'::uuid);

-- =====================================================
-- 4. TESTES DE RELACIONAMENTOS
-- =====================================================

-- Verificar integridade dos relacionamentos
SELECT 
    'products -> niches' as relationship,
    COUNT(*) as total,
    COUNT(n.id) as valid_references
FROM products p
LEFT JOIN niches n ON p.niche_id = n.id

UNION ALL

SELECT 
    'user_votes -> products',
    COUNT(*),
    COUNT(p.id)
FROM user_votes uv
LEFT JOIN products p ON uv.product_id = p.id

UNION ALL

SELECT 
    'user_votes -> users',
    COUNT(*),
    COUNT(u.id)
FROM user_votes uv
LEFT JOIN users u ON uv.user_id = u.id

UNION ALL

SELECT 
    'comments -> products',
    COUNT(*),
    COUNT(p.id)
FROM comments c
LEFT JOIN products p ON c.product_id = p.id;

-- =====================================================
-- 5. TESTES DE PERFORMANCE
-- =====================================================

-- Testar queries de listagem de produtos (com índices)
EXPLAIN ANALYZE
SELECT 
    p.id,
    p.title,
    p.current_price,
    p.heat_score,
    n.name as niche_name
FROM products p
JOIN niches n ON p.niche_id = n.id
WHERE p.status = 'approved'
AND p.is_active = true
ORDER BY p.heat_score DESC
LIMIT 20;

-- Testar query de produtos por nicho
EXPLAIN ANALYZE
SELECT 
    p.title,
    p.current_price,
    p.total_votes,
    p.heat_score
FROM products p
WHERE p.niche_id = '10000000-0000-0000-0000-000000000001'
AND p.status = 'approved'
ORDER BY p.heat_score DESC;

-- =====================================================
-- 6. TESTES DE VOTAÇÃO
-- =====================================================

-- Simular processo de votação
DO $$
DECLARE
    v_result JSONB;
    v_product_id UUID := '30000000-0000-0000-0000-000000000001';
    v_user_id UUID := '20000000-0000-0000-0000-000000000002';
BEGIN
    -- Testar voto positivo
    SELECT vote_product(v_user_id, v_product_id, true) INTO v_result;
    RAISE NOTICE 'Voto positivo: %', v_result;
    
    -- Testar mudança de voto
    SELECT vote_product(v_user_id, v_product_id, false) INTO v_result;
    RAISE NOTICE 'Mudança de voto: %', v_result;
    
    -- Testar remoção de voto
    SELECT vote_product(v_user_id, v_product_id, false) INTO v_result;
    RAISE NOTICE 'Remoção de voto: %', v_result;
END $$;

-- =====================================================
-- 7. TESTES DE CLICKS
-- =====================================================

-- Simular registro de click
DO $$
DECLARE
    v_result JSONB;
    v_product_id UUID := '30000000-0000-0000-0000-000000000001';
    v_user_id UUID := '20000000-0000-0000-0000-000000000003';
BEGIN
    SELECT register_click(
        v_product_id, 
        v_user_id, 
        '192.168.1.1'::inet, 
        'Mozilla/5.0 Test Browser',
        'https://google.com'
    ) INTO v_result;
    
    RAISE NOTICE 'Click registrado: %', v_result;
END $$;

-- =====================================================
-- 8. TESTES DE COMENTÁRIOS
-- =====================================================

-- Simular like em comentário
DO $$
DECLARE
    v_result JSONB;
    v_comment_id UUID;
    v_user_id UUID := '20000000-0000-0000-0000-000000000003';
BEGIN
    -- Buscar um comentário existente
    SELECT id INTO v_comment_id FROM comments LIMIT 1;
    
    IF v_comment_id IS NOT NULL THEN
        SELECT like_comment(v_user_id, v_comment_id) INTO v_result;
        RAISE NOTICE 'Like no comentário: %', v_result;
    END IF;
END $$;

-- =====================================================
-- 9. TESTES DE VIEWS
-- =====================================================

-- Testar view de produtos completos
SELECT 
    title,
    niche_name,
    creator_name,
    approval_rate,
    heat_score
FROM products_full
WHERE status = 'approved'
ORDER BY heat_score DESC
LIMIT 5;

-- Testar view de estatísticas dos nichos
SELECT 
    name,
    total_products,
    approved_products,
    avg_heat_score,
    total_votes
FROM niche_stats
ORDER BY total_products DESC;

-- Testar view de ranking de usuários
SELECT 
    full_name,
    username,
    products_created,
    votes_cast,
    total_points,
    reputation_score
FROM user_rankings
LIMIT 10;

-- =====================================================
-- 10. TESTES DE TRIGGERS
-- =====================================================

-- Testar trigger de updated_at
UPDATE products 
SET description = description || ' (Atualizado)'
WHERE id = '30000000-0000-0000-0000-000000000001';

SELECT 
    title,
    created_at,
    updated_at,
    (updated_at > created_at) as was_updated
FROM products 
WHERE id = '30000000-0000-0000-0000-000000000001';

-- =====================================================
-- 11. VERIFICAÇÃO DE CONSISTÊNCIA
-- =====================================================

-- Verificar consistência dos contadores de votos
SELECT 
    p.title,
    p.total_votes as stored_total,
    COUNT(uv.id) as actual_total,
    p.positive_votes as stored_positive,
    COUNT(uv.id) FILTER (WHERE uv.is_positive = true) as actual_positive,
    (p.total_votes = COUNT(uv.id)) as total_consistent,
    (p.positive_votes = COUNT(uv.id) FILTER (WHERE uv.is_positive = true)) as positive_consistent
FROM products p
LEFT JOIN user_votes uv ON p.id = uv.product_id
GROUP BY p.id, p.title, p.total_votes, p.positive_votes
HAVING p.total_votes != COUNT(uv.id) OR p.positive_votes != COUNT(uv.id) FILTER (WHERE uv.is_positive = true);

-- Verificar consistência dos contadores de comentários
SELECT 
    p.title,
    p.comment_count as stored_count,
    COUNT(c.id) as actual_count,
    (p.comment_count = COUNT(c.id)) as consistent
FROM products p
LEFT JOIN comments c ON p.id = c.product_id AND c.is_deleted = false
GROUP BY p.id, p.title, p.comment_count
HAVING p.comment_count != COUNT(c.id);

-- =====================================================
-- 12. ESTATÍSTICAS GERAIS
-- =====================================================

-- Resumo geral do sistema
SELECT 
    'Total Users' as metric,
    COUNT(*)::text as value
FROM users
WHERE is_active = true

UNION ALL

SELECT 
    'Total Products',
    COUNT(*)::text
FROM products
WHERE status = 'approved' AND is_active = true

UNION ALL

SELECT 
    'Total Votes',
    COUNT(*)::text
FROM user_votes

UNION ALL

SELECT 
    'Total Comments',
    COUNT(*)::text
FROM comments
WHERE is_approved = true

UNION ALL

SELECT 
    'Total Clicks',
    COUNT(*)::text
FROM clicks

UNION ALL

SELECT 
    'Average Heat Score',
    ROUND(AVG(heat_score), 2)::text
FROM products
WHERE status = 'approved'

ORDER BY metric;

-- =====================================================
-- 13. LIMPEZA DOS TESTES
-- =====================================================

-- Reverter mudanças dos testes (opcional)
-- UPDATE products 
-- SET description = REPLACE(description, ' (Atualizado)', '')
-- WHERE description LIKE '% (Atualizado)';

-- =====================================================
-- RESULTADO ESPERADO
-- =====================================================

/*
Se todos os testes passarem, você deve ver:
✅ 12 tabelas criadas
✅ Extensões uuid-ossp e pgcrypto habilitadas
✅ Índices criados corretamente
✅ 6 roles do sistema inseridas
✅ 3 nichos básicos criados
✅ 6 produtos de exemplo inseridos
✅ Funções de votação, click e comentários funcionando
✅ Views retornando dados consistentes
✅ Triggers atualizando campos automaticamente
✅ Contadores consistentes
✅ Performance adequada nas queries principais

Qualquer erro indica um problema que deve ser investigado.
*/ 