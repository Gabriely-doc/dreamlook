-- =====================================================
-- DEALS HUB - DADOS INICIAIS
-- Popular tabelas básicas com dados necessários
-- =====================================================

-- =====================================================
-- 1. INSERIR ROLES DO SISTEMA
-- =====================================================
INSERT INTO roles (id, name, description, permissions, is_system_role) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    'super_admin',
    'Super administrador com acesso total ao sistema',
    '{
        "can_manage_users": true,
        "can_manage_roles": true,
        "can_manage_niches": true,
        "can_moderate_all": true,
        "can_view_analytics": true,
        "can_manage_system": true
    }'::jsonb,
    true
),
(
    '00000000-0000-0000-0000-000000000002',
    'admin',
    'Administrador com acesso amplo ao sistema',
    '{
        "can_manage_users": true,
        "can_moderate_all": true,
        "can_view_analytics": true,
        "can_manage_content": true
    }'::jsonb,
    true
),
(
    '00000000-0000-0000-0000-000000000003',
    'moderator',
    'Moderador de conteúdo',
    '{
        "can_moderate_products": true,
        "can_moderate_comments": true,
        "can_approve_posts": true,
        "can_view_reports": true
    }'::jsonb,
    true
),
(
    '00000000-0000-0000-0000-000000000004',
    'niche_moderator',
    'Moderador específico de um nicho',
    '{
        "can_moderate_niche_products": true,
        "can_moderate_niche_comments": true,
        "can_approve_niche_posts": true
    }'::jsonb,
    true
),
(
    '00000000-0000-0000-0000-000000000005',
    'user',
    'Usuário padrão do sistema',
    '{
        "can_create_products": true,
        "can_vote": true,
        "can_comment": true,
        "can_share": true
    }'::jsonb,
    true
),
(
    '00000000-0000-0000-0000-000000000006',
    'vip_user',
    'Usuário VIP com privilégios especiais',
    '{
        "can_create_products": true,
        "can_vote": true,
        "can_comment": true,
        "can_share": true,
        "auto_approve_products": true,
        "priority_support": true
    }'::jsonb,
    true
);

-- =====================================================
-- 2. INSERIR NICHOS BÁSICOS
-- =====================================================
INSERT INTO niches (id, name, slug, description, theme_color, secondary_color, settings) VALUES
(
    '10000000-0000-0000-0000-000000000001',
    'Beleza',
    'beleza',
    'Produtos de beleza, cosméticos, cuidados pessoais e maquiagem com os melhores preços',
    '#ec4899',
    '#f472b6',
    '{
        "auto_approve_products": false,
        "min_votes_for_hot": 5,
        "heat_decay_hours": 24,
        "allow_anonymous_votes": false,
        "featured_categories": ["Maquiagem", "Skincare", "Cabelo", "Perfumes", "Unhas"],
        "affiliate_platforms": ["Shopee", "Amazon", "Shein", "AliExpress"]
    }'::jsonb
),
(
    '10000000-0000-0000-0000-000000000002',
    'Cozinha',
    'cozinha',
    'Utensílios domésticos, eletrodomésticos e produtos para cozinha com ótimo custo-benefício',
    '#f59e0b',
    '#fbbf24',
    '{
        "auto_approve_products": false,
        "min_votes_for_hot": 8,
        "heat_decay_hours": 48,
        "allow_anonymous_votes": false,
        "featured_categories": ["Panelas", "Eletrodomésticos", "Utensílios", "Organizadores", "Decoração"],
        "affiliate_platforms": ["Shopee", "Amazon", "Mercado Livre", "Casas Bahia"]
    }'::jsonb
),
(
    '10000000-0000-0000-0000-000000000003',
    'Moda',
    'moda',
    'Roupas, acessórios e calçados femininos e masculinos com preços imperdíveis',
    '#8b5cf6',
    '#a78bfa',
    '{
        "auto_approve_products": false,
        "min_votes_for_hot": 10,
        "heat_decay_hours": 12,
        "allow_anonymous_votes": false,
        "featured_categories": ["Roupas Femininas", "Roupas Masculinas", "Calçados", "Acessórios", "Bolsas"],
        "affiliate_platforms": ["Shein", "Shopee", "Amazon", "AliExpress", "Mercado Livre"]
    }'::jsonb
);

-- =====================================================
-- 3. PRODUTOS DE EXEMPLO (PARA TESTES)
-- =====================================================

-- Primeiro, vamos criar um usuário de exemplo para ser o criador dos produtos
-- (Este será substituído por usuários reais quando a autenticação estiver funcionando)
INSERT INTO users (id, email, full_name, username, bio, reputation_score) VALUES
(
    '20000000-0000-0000-0000-000000000001',
    'admin@dealshub.com',
    'Administrador do Sistema',
    'admin',
    'Conta administrativa do Deals Hub',
    1000
);

-- Atribuir role de super_admin ao usuário admin
INSERT INTO user_roles (user_id, role_id, assigned_by) VALUES
(
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001'
);

-- Produtos de exemplo para BELEZA
INSERT INTO products (
    id, niche_id, title, description, brand, category,
    original_price, current_price, affiliate_url, image_url,
    status, created_by, approved_by, approved_at
) VALUES
(
    '30000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'Kit Pincéis de Maquiagem Profissional 12 Peças',
    'Set completo de pincéis para maquiagem profissional com cerdas sintéticas macias e cabo ergonômico. Ideal para base, pó, sombra, blush e contorno.',
    'Beauty Pro',
    'Maquiagem',
    89.90,
    34.90,
    'https://shopee.com.br/produto-exemplo-1',
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
    'approved',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    NOW()
),
(
    '30000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001',
    'Sérum Vitamina C 30ml Anti-idade',
    'Sérum facial com vitamina C pura para combater sinais de envelhecimento, clarear manchas e dar luminosidade à pele.',
    'Glow Skin',
    'Skincare',
    129.90,
    67.90,
    'https://shopee.com.br/produto-exemplo-2',
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
    'approved',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    NOW()
);

-- Produtos de exemplo para COZINHA
INSERT INTO products (
    id, niche_id, title, description, brand, category,
    original_price, current_price, affiliate_url, image_url,
    status, created_by, approved_by, approved_at
) VALUES
(
    '30000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000002',
    'Jogo de Panelas Antiaderente 5 Peças',
    'Conjunto de panelas com revestimento antiaderente cerâmico, cabos ergonômicos e tampas de vidro temperado.',
    'Kitchen Master',
    'Panelas',
    299.90,
    149.90,
    'https://shopee.com.br/produto-exemplo-3',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
    'approved',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    NOW()
),
(
    '30000000-0000-0000-0000-000000000004',
    '10000000-0000-0000-0000-000000000002',
    'Organizador de Geladeira 6 Peças',
    'Kit organizador para geladeira com potes transparentes de diferentes tamanhos para manter alimentos frescos e organizados.',
    'Home Organizer',
    'Organizadores',
    79.90,
    39.90,
    'https://shopee.com.br/produto-exemplo-4',
    'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400',
    'approved',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    NOW()
);

-- Produtos de exemplo para MODA
INSERT INTO products (
    id, niche_id, title, description, brand, category,
    original_price, current_price, affiliate_url, image_url,
    status, created_by, approved_by, approved_at
) VALUES
(
    '30000000-0000-0000-0000-000000000005',
    '10000000-0000-0000-0000-000000000003',
    'Vestido Midi Floral Manga Longa',
    'Vestido feminino midi com estampa floral delicada, manga longa e tecido fluido. Perfeito para ocasiões casuais e elegantes.',
    'Fashion Style',
    'Roupas Femininas',
    159.90,
    79.90,
    'https://shein.com.br/produto-exemplo-5',
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
    'approved',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    NOW()
),
(
    '30000000-0000-0000-0000-000000000006',
    '10000000-0000-0000-0000-000000000003',
    'Tênis Esportivo Unissex Respirável',
    'Tênis esportivo com tecnologia de ventilação, solado antiderrapante e design moderno. Ideal para corrida e atividades físicas.',
    'Sport Run',
    'Calçados',
    199.90,
    119.90,
    'https://shopee.com.br/produto-exemplo-6',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400',
    'approved',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    NOW()
);

-- =====================================================
-- 4. VOTOS DE EXEMPLO
-- =====================================================

-- Criar alguns usuários de exemplo para votos
INSERT INTO users (id, email, full_name, username, reputation_score) VALUES
('20000000-0000-0000-0000-000000000002', 'user1@example.com', 'Maria Silva', 'maria_silva', 50),
('20000000-0000-0000-0000-000000000003', 'user2@example.com', 'João Santos', 'joao_santos', 75),
('20000000-0000-0000-0000-000000000004', 'user3@example.com', 'Ana Costa', 'ana_costa', 30);

-- Atribuir role de usuário padrão
INSERT INTO user_roles (user_id, role_id) VALUES
('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005'),
('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005'),
('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005');

-- Adicionar votos nos produtos
INSERT INTO user_votes (user_id, product_id, is_positive) VALUES
-- Votos no kit de pincéis
('20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', true),
('20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', true),
('20000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000001', true),

-- Votos no sérum de vitamina C
('20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', true),
('20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000002', false),

-- Votos no jogo de panelas
('20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000003', true),
('20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', true),
('20000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000003', true);

-- =====================================================
-- 5. ATUALIZAR CONTADORES DOS PRODUTOS
-- =====================================================

-- Atualizar contadores de votos dos produtos
UPDATE products SET
    total_votes = (SELECT COUNT(*) FROM user_votes WHERE product_id = products.id),
    positive_votes = (SELECT COUNT(*) FROM user_votes WHERE product_id = products.id AND is_positive = true),
    negative_votes = (SELECT COUNT(*) FROM user_votes WHERE product_id = products.id AND is_positive = false);

-- =====================================================
-- 6. COMENTÁRIOS DE EXEMPLO
-- =====================================================

INSERT INTO comments (product_id, user_id, content, is_approved) VALUES
(
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000002',
    'Excelente qualidade! Os pincéis são super macios e não soltam pelos. Recomendo!',
    true
),
(
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000003',
    'Chegou rápido e bem embalado. Muito bom pelo preço!',
    true
),
(
    '30000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000004',
    'As panelas são ótimas! Nada gruda e são fáceis de limpar.',
    true
);

-- =====================================================
-- 7. CALCULAR HEAT SCORES INICIAIS
-- =====================================================

-- Calcular heat score para todos os produtos
SELECT calculate_heat_score(id) FROM products WHERE status = 'approved';

-- =====================================================
-- 8. ATUALIZAR CONTADORES DOS NICHOS
-- =====================================================

UPDATE niches SET
    total_products = (
        SELECT COUNT(*) 
        FROM products 
        WHERE niche_id = niches.id 
        AND status = 'approved' 
        AND is_active = true
    );

-- =====================================================
-- 9. VIEWS ÚTEIS PARA CONSULTAS
-- =====================================================

-- View para produtos com informações completas
CREATE OR REPLACE VIEW products_full AS
SELECT 
    p.*,
    n.name as niche_name,
    n.slug as niche_slug,
    n.theme_color as niche_color,
    u.full_name as creator_name,
    u.username as creator_username,
    ROUND((p.positive_votes::numeric / NULLIF(p.total_votes, 0) * 100), 1) as approval_rate
FROM products p
LEFT JOIN niches n ON p.niche_id = n.id
LEFT JOIN users u ON p.created_by = u.id;

-- View para estatísticas dos nichos
CREATE OR REPLACE VIEW niche_stats AS
SELECT 
    n.*,
    COUNT(p.id) as current_products,
    COUNT(p.id) FILTER (WHERE p.status = 'approved') as approved_products,
    COUNT(p.id) FILTER (WHERE p.status = 'pending') as pending_products,
    AVG(p.heat_score) as avg_heat_score,
    SUM(p.total_votes) as total_votes,
    SUM(p.click_count) as total_clicks
FROM niches n
LEFT JOIN products p ON n.id = p.niche_id AND p.is_active = true
GROUP BY n.id;

-- View para ranking de usuários
CREATE OR REPLACE VIEW user_rankings AS
SELECT 
    u.*,
    COUNT(p.id) as products_created,
    COUNT(p.id) FILTER (WHERE p.status = 'approved') as products_approved,
    COUNT(uv.id) as votes_cast,
    COUNT(c.id) as comments_made,
    COALESCE(SUM(ur.points), 0) as total_points
FROM users u
LEFT JOIN products p ON u.id = p.created_by
LEFT JOIN user_votes uv ON u.id = uv.user_id
LEFT JOIN comments c ON u.id = c.user_id
LEFT JOIN user_rewards ur ON u.id = ur.user_id
WHERE u.is_active = true
GROUP BY u.id
ORDER BY total_points DESC, u.reputation_score DESC; 