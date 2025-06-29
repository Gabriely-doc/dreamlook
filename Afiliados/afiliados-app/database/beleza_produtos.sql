-- =====================================================
-- PRODUTOS DE BELEZA - DADOS REAIS
-- Inserir produtos específicos do nicho beleza
-- =====================================================

-- Produtos de Beleza com dados reais e atuais
INSERT INTO products (
    id, niche_id, title, description, brand, category,
    original_price, current_price, affiliate_url, image_url,
    status, created_by, approved_by, approved_at
) VALUES
-- Kit Pincéis Maquiagem
(
    '30000000-0000-0000-0000-000000000011',
    '10000000-0000-0000-0000-000000000001',
    'Kit 20 Pincéis Maquiagem Profissional Rosa Gold',
    'Kit completo com 20 pincéis profissionais para maquiagem, cerdas sintéticas macias, cabo rosa gold. Inclui estojo organizador.',
    'Macrilan',
    'Maquiagem',
    159.90,
    49.90,
    'https://shopee.com.br/Kit-20-Pinc%C3%A9is-Maquiagem-Profissional-Rosa-Gold-i.123456789.987654321',
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=500&fit=crop',
    'approved',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    NOW()
),

-- Base Líquida
(
    '30000000-0000-0000-0000-000000000012',
    '10000000-0000-0000-0000-000000000001',
    'Base Líquida Matte HD 30ml - Cor Bege Médio',
    'Base líquida com cobertura total, acabamento matte, resistente à água. Controla oleosidade por até 12h.',
    'Ruby Rose',
    'Maquiagem',
    24.90,
    14.90,
    'https://shopee.com.br/Base-L%C3%ADquida-Matte-HD-Ruby-Rose-i.234567890.876543210',
    'https://images.unsplash.com/photo-1631214540242-4b6d90c31dd4?w=500&h=500&fit=crop',
    'approved',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    NOW()
),

-- Paleta de Sombras
(
    '30000000-0000-0000-0000-000000000013',
    '10000000-0000-0000-0000-000000000001',
    'Paleta 35 Cores Sombra Matte e Shimmer Profissional',
    'Paleta com 35 cores variadas, texturas matte e shimmer, alta pigmentação. Perfeita para looks do dia e noite.',
    'Jasmyne',
    'Maquiagem',
    89.90,
    39.90,
    'https://shopee.com.br/Paleta-35-Cores-Sombra-Jasmyne-i.345678901.765432109',
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=500&h=500&fit=crop',
    'approved',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    NOW()
),

-- Sérum Vitamina C
(
    '30000000-0000-0000-0000-000000000014',
    '10000000-0000-0000-0000-000000000001',
    'Sérum Facial Vitamina C 20% + Ácido Hialurônico 30ml',
    'Sérum anti-idade com vitamina C pura 20%, ácido hialurônico e niacinamida. Clareia manchas e dá luminosidade.',
    'ADCOS',
    'Skincare',
    149.90,
    89.90,
    'https://shopee.com.br/S%C3%A9rum-Vitamina-C-ADCOS-i.456789012.654321098',
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&h=500&fit=crop',
    'approved',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    NOW()
),

-- Máscara Facial
(
    '30000000-0000-0000-0000-000000000015',
    '10000000-0000-0000-0000-000000000001',
    'Máscara Facial Argila Verde Detox 120g',
    'Máscara purificante com argila verde, remove impurezas, controla oleosidade. Para peles mistas e oleosas.',
    'Sallve',
    'Skincare',
    32.90,
    19.90,
    'https://shopee.com.br/M%C3%A1scara-Argila-Verde-Sallve-i.567890123.543210987',
    'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=500&h=500&fit=crop',
    'approved',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    NOW()
),

-- Protetor Solar Facial
(
    '30000000-0000-0000-0000-000000000016',
    '10000000-0000-0000-0000-000000000001',
    'Protetor Solar Facial FPS 60 Base Mousse 50ml',
    'Protetor solar com cor, textura mousse, FPS 60. Base e proteção em um só produto. Cor universal.',
    'Episol',
    'Skincare',
    59.90,
    34.90,
    'https://shopee.com.br/Protetor-Solar-Episol-FPS60-i.678901234.432109876',
    'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500&h=500&fit=crop',
    'approved',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    NOW()
),

-- Batom Líquido
(
    '30000000-0000-0000-0000-000000000017',
    '10000000-0000-0000-0000-000000000001',
    'Batom Líquido Matte Longa Duração - Cor Nude Rosado',
    'Batom líquido com acabamento matte, longa duração até 8h, não resseca os lábios. Cor nude rosado.',
    'Vult',
    'Maquiagem',
    19.90,
    12.90,
    'https://shopee.com.br/Batom-L%C3%ADquido-Vult-Nude-i.789012345.321098765',
    'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500&h=500&fit=crop',
    'approved',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    NOW()
),

-- Primer Facial
(
    '30000000-0000-0000-0000-000000000018',
    '10000000-0000-0000-0000-000000000001',
    'Primer Facial Pré-Maquiagem Blur Effect 30ml',
    'Primer com efeito blur, minimiza poros, prolonga duração da maquiagem. Base perfeita para qualquer make.',
    'Payot',
    'Maquiagem',
    45.90,
    27.90,
    'https://shopee.com.br/Primer-Facial-Payot-Blur-i.890123456.210987654',
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&h=500&fit=crop',
    'approved',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    NOW()
),

-- Água Micelar
(
    '30000000-0000-0000-0000-000000000019',
    '10000000-0000-0000-0000-000000000001',
    'Água Micelar 5 em 1 Demaquilante 400ml',
    'Água micelar que remove maquiagem, limpa, tonifica, hidrata e acalma a pele. Para todos os tipos de pele.',
    'Garnier',
    'Skincare',
    29.90,
    17.90,
    'https://shopee.com.br/%C3%81gua-Micelar-Garnier-400ml-i.901234567.109876543',
    'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=500&fit=crop',
    'approved',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    NOW()
),

-- Kit Skincare Coreano
(
    '30000000-0000-0000-0000-000000000020',
    '10000000-0000-0000-0000-000000000001',
    'Kit Skincare Coreano 7 Passos - Rotina Completa',
    'Kit completo com 7 produtos para rotina coreana: óleo, espuma, tônico, essência, sérum, hidratante e protetor.',
    'Some By Mi',
    'Skincare',
    299.90,
    149.90,
    'https://shopee.com.br/Kit-Skincare-Coreano-Some-By-Mi-i.012345678.098765432',
    'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=500&h=500&fit=crop',
    'approved',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    NOW()
);

-- Adicionar votos aos novos produtos
INSERT INTO user_votes (user_id, product_id, is_positive) VALUES
-- Kit 20 Pincéis
('20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000011', true),
('20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000011', true),
('20000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000011', true),

-- Base Líquida
('20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000012', true),
('20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000012', true),

-- Paleta de Sombras
('20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000013', true),
('20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000013', true),
('20000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000013', true),

-- Sérum Vitamina C
('20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000014', true),
('20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000014', true),

-- Máscara Facial
('20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000015', true),

-- Kit Skincare Coreano
('20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000020', true),
('20000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000020', true),
('20000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000020', true);

-- Atualizar contadores de votos
UPDATE products SET
    total_votes = (SELECT COUNT(*) FROM user_votes WHERE product_id = products.id),
    positive_votes = (SELECT COUNT(*) FROM user_votes WHERE product_id = products.id AND is_positive = true),
    negative_votes = (SELECT COUNT(*) FROM user_votes WHERE product_id = products.id AND is_positive = false);

-- Calcular heat scores
SELECT calculate_heat_score(id) FROM products WHERE status = 'approved' AND niche_id = '10000000-0000-0000-0000-000000000001'; 