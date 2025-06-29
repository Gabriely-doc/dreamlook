-- =====================================================
-- DEALS HUB - ROW LEVEL SECURITY POLICIES
-- Políticas de segurança para controle de acesso aos dados
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE niches ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE published_posts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTIONS PARA RLS
-- =====================================================

-- Função para verificar se o usuário é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'super_admin')
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se o usuário é moderador
CREATE OR REPLACE FUNCTION is_moderator()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.name IN ('admin', 'super_admin', 'moderator')
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se o usuário pode moderar um nicho
CREATE OR REPLACE FUNCTION can_moderate_niche(niche_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN is_admin() OR EXISTS (
        SELECT 1 
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = auth.uid()
        AND r.name = 'niche_moderator'
        AND r.permissions->>'niche_id' = niche_id::text
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- POLÍTICAS PARA USERS
-- =====================================================

-- Usuários podem ver todos os perfis públicos
CREATE POLICY "Users can view public profiles" ON users
    FOR SELECT
    USING (is_active = true);

-- Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE
    USING (auth.uid() = id);

-- Apenas admins podem inserir usuários diretamente
CREATE POLICY "Only admins can insert users" ON users
    FOR INSERT
    WITH CHECK (is_admin());

-- Apenas admins podem deletar usuários
CREATE POLICY "Only admins can delete users" ON users
    FOR DELETE
    USING (is_admin());

-- =====================================================
-- POLÍTICAS PARA ROLES
-- =====================================================

-- Todos podem ver roles (para exibir badges)
CREATE POLICY "Anyone can view roles" ON roles
    FOR SELECT
    USING (true);

-- Apenas admins podem gerenciar roles
CREATE POLICY "Only admins can manage roles" ON roles
    FOR ALL
    USING (is_admin());

-- =====================================================
-- POLÍTICAS PARA USER_ROLES
-- =====================================================

-- Usuários podem ver suas próprias roles e roles de outros usuários
CREATE POLICY "Users can view user roles" ON user_roles
    FOR SELECT
    USING (true);

-- Apenas admins podem atribuir roles
CREATE POLICY "Only admins can assign roles" ON user_roles
    FOR INSERT
    WITH CHECK (is_admin());

-- Apenas admins podem remover roles
CREATE POLICY "Only admins can remove roles" ON user_roles
    FOR DELETE
    USING (is_admin());

-- =====================================================
-- POLÍTICAS PARA NICHES
-- =====================================================

-- Todos podem ver nichos ativos
CREATE POLICY "Anyone can view active niches" ON niches
    FOR SELECT
    USING (is_active = true);

-- Apenas admins podem gerenciar nichos
CREATE POLICY "Only admins can manage niches" ON niches
    FOR ALL
    USING (is_admin());

-- =====================================================
-- POLÍTICAS PARA PRODUCTS
-- =====================================================

-- Todos podem ver produtos aprovados e ativos
CREATE POLICY "Anyone can view approved products" ON products
    FOR SELECT
    USING (
        status = 'approved' 
        AND is_active = true 
        AND deleted_at IS NULL
    );

-- Usuários autenticados podem ver seus próprios produtos
CREATE POLICY "Users can view own products" ON products
    FOR SELECT
    USING (auth.uid() = created_by);

-- Moderadores podem ver todos os produtos
CREATE POLICY "Moderators can view all products" ON products
    FOR SELECT
    USING (is_moderator());

-- Usuários autenticados podem criar produtos
CREATE POLICY "Authenticated users can create products" ON products
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);

-- Usuários podem atualizar seus próprios produtos (apenas se não aprovados)
CREATE POLICY "Users can update own pending products" ON products
    FOR UPDATE
    USING (
        auth.uid() = created_by 
        AND status = 'pending'
    );

-- Moderadores podem atualizar qualquer produto
CREATE POLICY "Moderators can update any product" ON products
    FOR UPDATE
    USING (is_moderator());

-- Apenas o criador pode deletar seus próprios produtos pendentes
CREATE POLICY "Users can delete own pending products" ON products
    FOR DELETE
    USING (
        auth.uid() = created_by 
        AND status = 'pending'
    );

-- Moderadores podem deletar qualquer produto
CREATE POLICY "Moderators can delete any product" ON products
    FOR DELETE
    USING (is_moderator());

-- =====================================================
-- POLÍTICAS PARA USER_VOTES
-- =====================================================

-- Usuários podem ver todos os votos (para estatísticas)
CREATE POLICY "Anyone can view votes" ON user_votes
    FOR SELECT
    USING (true);

-- Usuários autenticados podem votar
CREATE POLICY "Authenticated users can vote" ON user_votes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar apenas seus próprios votos
CREATE POLICY "Users can update own votes" ON user_votes
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Usuários podem deletar apenas seus próprios votos
CREATE POLICY "Users can delete own votes" ON user_votes
    FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS PARA COMMENTS
-- =====================================================

-- Todos podem ver comentários aprovados
CREATE POLICY "Anyone can view approved comments" ON comments
    FOR SELECT
    USING (is_approved = true AND is_deleted = false);

-- Usuários podem ver seus próprios comentários
CREATE POLICY "Users can view own comments" ON comments
    FOR SELECT
    USING (auth.uid() = user_id);

-- Moderadores podem ver todos os comentários
CREATE POLICY "Moderators can view all comments" ON comments
    FOR SELECT
    USING (is_moderator());

-- Usuários autenticados podem criar comentários
CREATE POLICY "Authenticated users can create comments" ON comments
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar seus próprios comentários
CREATE POLICY "Users can update own comments" ON comments
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Moderadores podem atualizar qualquer comentário
CREATE POLICY "Moderators can update any comment" ON comments
    FOR UPDATE
    USING (is_moderator());

-- Usuários podem deletar seus próprios comentários
CREATE POLICY "Users can delete own comments" ON comments
    FOR DELETE
    USING (auth.uid() = user_id);

-- Moderadores podem deletar qualquer comentário
CREATE POLICY "Moderators can delete any comment" ON comments
    FOR DELETE
    USING (is_moderator());

-- =====================================================
-- POLÍTICAS PARA COMMENT_LIKES
-- =====================================================

-- Todos podem ver likes de comentários
CREATE POLICY "Anyone can view comment likes" ON comment_likes
    FOR SELECT
    USING (true);

-- Usuários autenticados podem curtir comentários
CREATE POLICY "Authenticated users can like comments" ON comment_likes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Usuários podem remover apenas seus próprios likes
CREATE POLICY "Users can remove own likes" ON comment_likes
    FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- POLÍTICAS PARA CLICKS
-- =====================================================

-- Apenas admins podem ver todos os clicks
CREATE POLICY "Only admins can view all clicks" ON clicks
    FOR SELECT
    USING (is_admin());

-- Usuários podem ver apenas seus próprios clicks
CREATE POLICY "Users can view own clicks" ON clicks
    FOR SELECT
    USING (auth.uid() = user_id);

-- Qualquer um pode registrar clicks (incluindo anônimos)
CREATE POLICY "Anyone can register clicks" ON clicks
    FOR INSERT
    WITH CHECK (true);

-- =====================================================
-- POLÍTICAS PARA USER_REWARDS
-- =====================================================

-- Usuários podem ver apenas suas próprias recompensas
CREATE POLICY "Users can view own rewards" ON user_rewards
    FOR SELECT
    USING (auth.uid() = user_id);

-- Admins podem ver todas as recompensas
CREATE POLICY "Admins can view all rewards" ON user_rewards
    FOR SELECT
    USING (is_admin());

-- Sistema pode inserir recompensas (via funções)
CREATE POLICY "System can insert rewards" ON user_rewards
    FOR INSERT
    WITH CHECK (true);

-- =====================================================
-- POLÍTICAS PARA PENDING_POSTS
-- =====================================================

-- Usuários podem ver seus próprios posts pendentes
CREATE POLICY "Users can view own pending posts" ON pending_posts
    FOR SELECT
    USING (auth.uid() = created_by);

-- Moderadores podem ver todos os posts pendentes
CREATE POLICY "Moderators can view all pending posts" ON pending_posts
    FOR SELECT
    USING (is_moderator());

-- Sistema pode criar posts pendentes
CREATE POLICY "System can create pending posts" ON pending_posts
    FOR INSERT
    WITH CHECK (true);

-- Moderadores podem atualizar posts pendentes
CREATE POLICY "Moderators can update pending posts" ON pending_posts
    FOR UPDATE
    USING (is_moderator());

-- =====================================================
-- POLÍTICAS PARA PUBLISHED_POSTS
-- =====================================================

-- Todos podem ver posts publicados (para métricas públicas)
CREATE POLICY "Anyone can view published posts" ON published_posts
    FOR SELECT
    USING (true);

-- Sistema pode inserir posts publicados
CREATE POLICY "System can insert published posts" ON published_posts
    FOR INSERT
    WITH CHECK (true);

-- Sistema pode atualizar métricas de posts publicados
CREATE POLICY "System can update published posts" ON published_posts
    FOR UPDATE
    WITH CHECK (true);

-- =====================================================
-- GRANTS PARA AUTHENTICATED USERS
-- =====================================================

-- Garantir que usuários autenticados possam usar as funções
GRANT EXECUTE ON FUNCTION vote_product TO authenticated;
GRANT EXECUTE ON FUNCTION register_click TO authenticated;
GRANT EXECUTE ON FUNCTION like_comment TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_stats TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_heat_score TO authenticated;

-- Grants para usuários anônimos (apenas funções específicas)
GRANT EXECUTE ON FUNCTION register_click TO anon; 