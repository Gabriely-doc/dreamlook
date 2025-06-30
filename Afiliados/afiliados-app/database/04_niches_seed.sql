-- ========================================
-- NICHOS BÁSICOS DO SISTEMA
-- ========================================
-- Este arquivo cria os nichos necessários para o funcionamento

-- Inserir nichos básicos
INSERT INTO niches (id, name, slug, description, theme_color, secondary_color) VALUES
(
  '10000000-0000-0000-0000-000000000001',
  'Beleza',
  'beleza',
  'Produtos de beleza, maquiagem e skincare',
  '#ec4899',
  '#f472b6'
),
(
  '10000000-0000-0000-0000-000000000002',
  'Cozinha',
  'cozinha',
  'Utensílios e produtos para cozinha',
  '#f59e0b',
  '#fbbf24'
),
(
  '10000000-0000-0000-0000-000000000003',
  'Moda',
  'moda',
  'Roupas, acessórios e produtos de moda',
  '#8b5cf6',
  '#a78bfa'
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  theme_color = EXCLUDED.theme_color,
  secondary_color = EXCLUDED.secondary_color;

-- Verificar nichos criados
SELECT id, name, slug, theme_color FROM niches ORDER BY name; 