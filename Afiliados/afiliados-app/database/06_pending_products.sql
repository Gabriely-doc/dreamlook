-- Produtos pendentes para teste de moderação
-- Execute este arquivo após o setup inicial do banco

INSERT INTO products (
  title, description, brand, category, original_price, current_price, 
  affiliate_url, image_url, status, niche_id, created_by
) VALUES 
(
  'Sérum Facial Anti-Idade Pendente',
  'Sérum facial com ácido hialurônico e vitamina C para combater os sinais de envelhecimento. Produto aguardando aprovação.',
  'Beauty Lab',
  'Skincare',
  89.90,
  59.90,
  'https://shopee.com.br/serum-facial-anti-idade',
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
  'pending',
  (SELECT id FROM niches WHERE slug = 'beleza' LIMIT 1),
  (SELECT id FROM users LIMIT 1)
),
(
  'Base Líquida Cobertura Total Pendente',
  'Base líquida com cobertura total e acabamento natural. Disponível em 12 tons. Aguardando moderação.',
  'Makeup Pro',
  'Maquiagem',
  45.00,
  32.90,
  'https://shopee.com.br/base-liquida-cobertura-total',
  'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop',
  'pending',
  (SELECT id FROM niches WHERE slug = 'beleza' LIMIT 1),
  (SELECT id FROM users LIMIT 1)
),
(
  'Kit Pincéis Maquiagem Profissional Pendente',
  'Kit com 12 pincéis profissionais para maquiagem completa. Cerdas sintéticas de alta qualidade. Para aprovação.',
  'Pro Brushes',
  'Acessórios',
  120.00,
  79.90,
  'https://shopee.com.br/kit-pinceis-maquiagem',
  'https://images.unsplash.com/photo-1583241800698-b3b4e4c6e4e7?w=400&h=400&fit=crop',
  'pending',
  (SELECT id FROM niches WHERE slug = 'beleza' LIMIT 1),
  (SELECT id FROM users LIMIT 1)
);

-- Verificar os produtos inseridos
SELECT id, title, status, created_at FROM products WHERE status = 'pending'; 