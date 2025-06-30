-- ========================================
-- ROLES PADRÃO DO SISTEMA
-- ========================================
-- Este arquivo cria as roles básicas necessárias para o funcionamento

-- Inserir roles padrão do sistema
INSERT INTO public.roles (name, description, permissions, is_system_role) VALUES
(
  'user',
  'Usuário comum do sistema',
  '{
    "vote": true,
    "comment": true,
    "submit_products": false,
    "view_products": true
  }'::jsonb,
  true
),
(
  'moderator',
  'Moderador com permissões de curadoria',
  '{
    "vote": true,
    "comment": true,
    "submit_products": true,
    "view_products": true,
    "moderate_products": true,
    "moderate_comments": true
  }'::jsonb,
  true
),
(
  'admin',
  'Administrador com acesso total',
  '{
    "vote": true,
    "comment": true,
    "submit_products": true,
    "view_products": true,
    "moderate_products": true,
    "moderate_comments": true,
    "manage_users": true,
    "manage_roles": true,
    "view_analytics": true,
    "system_config": true
  }'::jsonb,
  true
)
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  permissions = EXCLUDED.permissions,
  is_system_role = EXCLUDED.is_system_role;

-- Verificar roles criadas
SELECT name, description, is_system_role FROM public.roles ORDER BY name; 