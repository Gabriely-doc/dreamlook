-- =====================================================
-- DEALS HUB - DATABASE SCHEMA
-- Sistema de afiliados com votação e curadoria social
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. TABELA DE USUÁRIOS (integra com Supabase Auth)
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- Campos sincronizados com auth.users
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    
    -- Campos específicos da aplicação
    username VARCHAR(50) UNIQUE,
    bio TEXT,
    reputation_score INTEGER DEFAULT 0,
    total_votes_cast INTEGER DEFAULT 0,
    total_products_submitted INTEGER DEFAULT 0,
    
    -- Configurações do usuário
    notification_preferences JSONB DEFAULT '{
        "email_notifications": true,
        "push_notifications": true,
        "weekly_digest": true
    }'::jsonb,
    
    -- Metadados
    metadata JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    last_active_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_reputation ON users(reputation_score DESC);
CREATE INDEX idx_users_active ON users(is_active, last_active_at);

-- =====================================================
-- 2. SISTEMA DE ROLES E PERMISSÕES
-- =====================================================
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}'::jsonb,
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id),
    expires_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(user_id, role_id)
);

-- Índices para roles
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);

-- =====================================================
-- 3. NICHOS DE PRODUTOS
-- =====================================================
CREATE TABLE niches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    
    -- Configurações visuais
    theme_color VARCHAR(7) DEFAULT '#8b5cf6',
    secondary_color VARCHAR(7) DEFAULT '#a855f7',
    icon_url TEXT,
    banner_url TEXT,
    
    -- Configurações do nicho
    settings JSONB DEFAULT '{
        "auto_approve_products": false,
        "min_votes_for_hot": 10,
        "heat_decay_hours": 24,
        "allow_anonymous_votes": false
    }'::jsonb,
    
    -- Métricas
    total_products INTEGER DEFAULT 0,
    total_users INTEGER DEFAULT 0,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para niches
CREATE INDEX idx_niches_slug ON niches(slug);
CREATE INDEX idx_niches_active ON niches(is_active);

-- =====================================================
-- 4. PRODUTOS PRINCIPAIS
-- =====================================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    niche_id UUID REFERENCES niches(id) ON DELETE CASCADE,
    
    -- Informações básicas do produto
    title VARCHAR(255) NOT NULL,
    description TEXT,
    brand VARCHAR(100),
    category VARCHAR(100),
    
    -- Preços e ofertas
    original_price DECIMAL(10,2),
    current_price DECIMAL(10,2),
    discount_percentage INTEGER GENERATED ALWAYS AS (
        CASE 
            WHEN original_price > 0 AND current_price > 0 
            THEN ROUND(((original_price - current_price) / original_price * 100)::numeric, 0)::integer
            ELSE 0 
        END
    ) STORED,
    
    -- Links e mídia
    affiliate_url TEXT NOT NULL,
    product_url TEXT, -- URL original sem afiliação
    image_url TEXT,
    images JSONB DEFAULT '[]'::jsonb, -- Array de URLs de imagens
    
    -- Sistema de votação
    heat_score INTEGER DEFAULT 0,
    total_votes INTEGER DEFAULT 0,
    positive_votes INTEGER DEFAULT 0,
    negative_votes INTEGER DEFAULT 0,
    
    -- Métricas de engajamento
    click_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    
    -- Metadados e configurações
    metadata JSONB DEFAULT '{}'::jsonb,
    tags TEXT[] DEFAULT '{}',
    
    -- Moderação
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'archived')),
    moderation_notes TEXT,
    
    -- Auditoria
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Soft delete
    is_active BOOLEAN DEFAULT true,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Índices para products
CREATE INDEX idx_products_niche_id ON products(niche_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_heat_score ON products(heat_score DESC);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_products_active ON products(is_active, deleted_at);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_tags ON products USING GIN(tags);

-- =====================================================
-- 5. SISTEMA DE VOTAÇÃO
-- =====================================================
CREATE TABLE user_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    
    is_positive BOOLEAN NOT NULL, -- true = upvote, false = downvote
    
    -- Metadados do voto
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Um usuário só pode votar uma vez por produto
    UNIQUE(user_id, product_id)
);

-- Índices para user_votes
CREATE INDEX idx_user_votes_user_id ON user_votes(user_id);
CREATE INDEX idx_user_votes_product_id ON user_votes(product_id);
CREATE INDEX idx_user_votes_positive ON user_votes(is_positive);
CREATE INDEX idx_user_votes_created_at ON user_votes(created_at);

-- =====================================================
-- 6. SISTEMA DE COMENTÁRIOS
-- =====================================================
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- Para replies
    
    content TEXT NOT NULL,
    
    -- Sistema de likes nos comentários
    likes_count INTEGER DEFAULT 0,
    
    -- Moderação
    is_approved BOOLEAN DEFAULT false,
    is_flagged BOOLEAN DEFAULT false,
    moderation_notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Soft delete
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Índices para comments
CREATE INDEX idx_comments_product_id ON comments(product_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_approved ON comments(is_approved);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- =====================================================
-- 7. LIKES NOS COMENTÁRIOS
-- =====================================================
CREATE TABLE comment_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Um usuário só pode curtir um comentário uma vez
    UNIQUE(comment_id, user_id)
);

-- Índices para comment_likes
CREATE INDEX idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user_id ON comment_likes(user_id);

-- =====================================================
-- 8. RASTREAMENTO DE CLICKS
-- =====================================================
CREATE TABLE clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Pode ser NULL para usuários anônimos
    
    -- Dados da sessão
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    
    -- Geolocalização (opcional)
    country_code VARCHAR(2),
    city VARCHAR(100),
    
    -- Metadados adicionais
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para clicks
CREATE INDEX idx_clicks_product_id ON clicks(product_id);
CREATE INDEX idx_clicks_user_id ON clicks(user_id);
CREATE INDEX idx_clicks_created_at ON clicks(created_at);
CREATE INDEX idx_clicks_ip_address ON clicks(ip_address);

-- =====================================================
-- 9. SISTEMA DE RECOMPENSAS
-- =====================================================
CREATE TABLE user_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    
    reward_type VARCHAR(50) NOT NULL, -- 'post_approved', 'vote_cast', 'comment_liked', etc.
    points INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    
    -- Metadados da recompensa
    metadata JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para user_rewards
CREATE INDEX idx_user_rewards_user_id ON user_rewards(user_id);
CREATE INDEX idx_user_rewards_type ON user_rewards(reward_type);
CREATE INDEX idx_user_rewards_created_at ON user_rewards(created_at);

-- =====================================================
-- 10. POSTS PENDENTES PARA REDES SOCIAIS
-- =====================================================
CREATE TABLE pending_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    
    platform VARCHAR(50) NOT NULL, -- 'instagram', 'whatsapp', 'telegram'
    post_type VARCHAR(50) DEFAULT 'image', -- 'image', 'video', 'story', 'reel'
    
    -- Conteúdo do post
    content JSONB NOT NULL, -- Texto, hashtags, mídia, etc.
    
    -- Status do post
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'scheduled', 'published', 'failed')),
    
    -- Agendamento
    scheduled_for TIMESTAMP WITH TIME ZONE,
    
    -- Metadados
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Auditoria
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para pending_posts
CREATE INDEX idx_pending_posts_product_id ON pending_posts(product_id);
CREATE INDEX idx_pending_posts_platform ON pending_posts(platform);
CREATE INDEX idx_pending_posts_status ON pending_posts(status);
CREATE INDEX idx_pending_posts_scheduled ON pending_posts(scheduled_for);

-- =====================================================
-- 11. POSTS PUBLICADOS
-- =====================================================
CREATE TABLE published_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pending_post_id UUID REFERENCES pending_posts(id),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    
    platform VARCHAR(50) NOT NULL,
    external_id VARCHAR(255), -- ID do post na plataforma externa
    post_url TEXT,
    
    -- Métricas do post
    metrics JSONB DEFAULT '{
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "views": 0,
        "clicks": 0
    }'::jsonb,
    
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_metrics_update TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para published_posts
CREATE INDEX idx_published_posts_pending_id ON published_posts(pending_post_id);
CREATE INDEX idx_published_posts_product_id ON published_posts(product_id);
CREATE INDEX idx_published_posts_platform ON published_posts(platform);
CREATE INDEX idx_published_posts_published_at ON published_posts(published_at);

-- =====================================================
-- 12. TRIGGERS PARA UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas relevantes
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_niches_updated_at BEFORE UPDATE ON niches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_votes_updated_at BEFORE UPDATE ON user_votes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pending_posts_updated_at BEFORE UPDATE ON pending_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 