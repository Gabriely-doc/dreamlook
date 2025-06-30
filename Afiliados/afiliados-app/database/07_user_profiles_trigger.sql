-- ========================================
-- TRIGGER AUTOMÁTICO PARA CRIAÇÃO DE PERFIS
-- ========================================
-- Este arquivo implementa o mapeamento automático de usuários
-- do Supabase Auth para a tabela pública 'users'

-- 1. Função para criar perfil público automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SET search_path = ''
AS $$
BEGIN
  -- Inserir novo usuário na tabela pública 'users'
  INSERT INTO public.users (
    id,
    email,
    full_name,
    avatar_url,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), -- Usar full_name ou email como fallback
    NEW.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  );
  
  -- Buscar ou criar role padrão 'user'
  INSERT INTO public.user_roles (user_id, role_id, assigned_at)
  SELECT 
    NEW.id,
    r.id,
    NOW()
  FROM public.roles r 
  WHERE r.name = 'user'
  ON CONFLICT (user_id, role_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Criar trigger que executa após inserção na auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- 3. Migrar usuários existentes (se houver)
-- Esta query cria registros na tabela users para usuários já existentes
INSERT INTO public.users (id, email, full_name, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email) as full_name,
  au.created_at,
  au.updated_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL; -- Apenas usuários que ainda não existem na tabela pública

-- Atribuir role 'user' para usuários migrados
INSERT INTO public.user_roles (user_id, role_id, assigned_at)
SELECT 
  u.id,
  r.id,
  NOW()
FROM public.users u
CROSS JOIN public.roles r
LEFT JOIN public.user_roles ur ON u.id = ur.user_id AND r.id = ur.role_id
WHERE r.name = 'user' AND ur.id IS NULL;

-- 4. Função para atualizar perfil público quando auth.users é atualizado
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS trigger
SET search_path = ''
AS $$
BEGIN
  -- Atualizar dados na tabela pública quando auth.users é modificado
  UPDATE public.users SET
    email = NEW.email,
    full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    avatar_url = NEW.raw_user_meta_data->>'avatar_url',
    updated_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger para sincronizar atualizações
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_user_update();

-- 6. Políticas RLS para tabela users (se não existirem)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Política para leitura: usuários podem ver perfis públicos
DROP POLICY IF EXISTS "Users can view public profiles" ON public.users;
CREATE POLICY "Users can view public profiles" ON public.users
  FOR SELECT USING (true);

-- Política para inserção: apenas o próprio usuário pode criar seu perfil
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Política para atualização: apenas o próprio usuário pode atualizar seu perfil
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- 7. Função auxiliar para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_id 
    AND r.name = 'admin'
    AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
  );
END;
$$;

-- 8. Verificação: Listar usuários criados com suas roles
SELECT 
  u.id,
  u.email,
  u.full_name,
  COALESCE(
    STRING_AGG(r.name, ', ' ORDER BY r.name), 
    'Sem role'
  ) as roles,
  u.created_at
FROM public.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id 
  AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
LEFT JOIN public.roles r ON ur.role_id = r.id
GROUP BY u.id, u.email, u.full_name, u.created_at
ORDER BY u.created_at DESC;

-- 9. Teste do trigger (descomente para testar)
-- SELECT 'Trigger configurado com sucesso!' as status; 