# 🗄️ **Database Schema - Deals Hub**

Este diretório contém todo o schema e configuração do banco de dados PostgreSQL para o projeto Deals Hub.

## 📁 **Estrutura dos Arquivos**

```
database/
├── 01_schema.sql       # Criação de tabelas, índices e triggers
├── 02_functions.sql    # Funções SQL para lógica de negócio
├── 03_rls_policies.sql # Políticas de Row Level Security
├── 04_seed_data.sql    # Dados iniciais (roles, niches, exemplos)
├── 05_test_queries.sql # Queries de teste e verificação
└── README.md          # Esta documentação
```

## 🚀 **Como Executar**

### **Pré-requisitos**
- Projeto Supabase criado e configurado
- Acesso ao SQL Editor do Supabase
- Ou acesso direto ao PostgreSQL via psql/pgAdmin

### **Ordem de Execução**

Execute os scripts **na ordem exata** listada abaixo:

#### **1. Schema Principal**
```sql
-- Executar: 01_schema.sql
-- Cria todas as tabelas, índices, constraints e triggers
```

#### **2. Funções de Negócio**
```sql
-- Executar: 02_functions.sql
-- Implementa lógica de votação, heat score, clicks, etc.
```

#### **3. Políticas de Segurança**
```sql
-- Executar: 03_rls_policies.sql
-- Configura Row Level Security para todas as tabelas
```

#### **4. Dados Iniciais**
```sql
-- Executar: 04_seed_data.sql
-- Popula roles, niches e dados de exemplo
```

#### **5. Testes (Opcional)**
```sql
-- Executar: 05_test_queries.sql
-- Verifica se tudo está funcionando corretamente
```

## 📊 **Diagrama do Banco**

### **Entidades Principais**
- **users**: Usuários do sistema (integra com Supabase Auth)
- **products**: Produtos afiliados com sistema de votação
- **niches**: Categorias de produtos (beleza, cozinha, moda)
- **user_votes**: Sistema de upvote/downvote
- **comments**: Comentários nos produtos
- **clicks**: Rastreamento de clicks nos links afiliados

### **Sistema de Roles**
- **super_admin**: Acesso total
- **admin**: Administração geral
- **moderator**: Moderação de conteúdo
- **niche_moderator**: Moderação específica de nicho
- **user**: Usuário padrão
- **vip_user**: Usuário com privilégios especiais

## 🔧 **Funcionalidades Implementadas**

### **Sistema de Votação**
```sql
-- Votar em um produto
SELECT vote_product(user_id, product_id, is_positive);

-- Resultado: JSON com sucesso/erro e pontos ganhos
```

### **Heat Score Automático**
- Calcula popularidade baseada em votos, clicks e tempo
- Decaimento temporal configurável por nicho
- Recalculado automaticamente em mudanças

### **Sistema de Recompensas**
- Pontos por votar, comentar, ter produtos aprovados
- Reputação calculada automaticamente
- Histórico completo de recompensas

### **Rastreamento de Clicks**
```sql
-- Registrar click no produto
SELECT register_click(product_id, user_id, ip_address, user_agent);
```

### **Row Level Security**
- Usuários só veem dados permitidos
- Moderadores têm acesso ampliado
- Admins veem tudo
- Políticas granulares por tabela

## 📈 **Views Úteis**

### **products_full**
```sql
SELECT * FROM products_full 
WHERE status = 'approved' 
ORDER BY heat_score DESC;
```

### **niche_stats**
```sql
SELECT * FROM niche_stats 
ORDER BY total_products DESC;
```

### **user_rankings**
```sql
SELECT * FROM user_rankings 
LIMIT 10;
```

## 🔍 **Queries Importantes**

### **Produtos Mais Populares**
```sql
SELECT 
    title,
    current_price,
    discount_percentage,
    heat_score,
    total_votes
FROM products 
WHERE status = 'approved' 
AND is_active = true
ORDER BY heat_score DESC
LIMIT 20;
```

### **Produtos por Nicho**
```sql
SELECT p.*
FROM products p
JOIN niches n ON p.niche_id = n.id
WHERE n.slug = 'beleza'
AND p.status = 'approved'
ORDER BY p.heat_score DESC;
```

### **Estatísticas do Usuário**
```sql
SELECT get_user_stats('user-uuid-here');
```

## 🛡️ **Segurança**

### **Row Level Security Habilitado**
- Todas as tabelas têm RLS ativo
- Políticas baseadas em auth.uid()
- Funções helper para verificar roles

### **Funções de Verificação**
```sql
SELECT is_admin();           -- Verifica se é admin
SELECT is_moderator();       -- Verifica se é moderador
SELECT can_moderate_niche(niche_id); -- Verifica moderação de nicho
```

## 🧪 **Testando o Sistema**

Após executar todos os scripts, rode os testes:

```sql
-- Executar 05_test_queries.sql no SQL Editor
-- Verificar se todos retornam resultados esperados
```

### **Testes Incluem:**
- ✅ Estrutura das tabelas
- ✅ Dados básicos inseridos
- ✅ Funções funcionando
- ✅ Relacionamentos íntegros
- ✅ Performance das queries
- ✅ Sistema de votação
- ✅ Registro de clicks
- ✅ Views retornando dados
- ✅ Triggers atualizando campos
- ✅ Consistência dos contadores

## 📋 **Dados de Exemplo Inclusos**

### **Nichos**
- 🎀 **Beleza**: Cosméticos, skincare, maquiagem
- 🍳 **Cozinha**: Utensílios, eletrodomésticos, organização  
- 👗 **Moda**: Roupas, calçados, acessórios

### **Produtos de Exemplo**
- 6 produtos distribuídos nos 3 nichos
- Com votos, comentários e métricas
- Status aprovado para testes

### **Usuários de Teste**
- Admin do sistema
- 3 usuários normais com votos
- Roles atribuídas corretamente

## 🔄 **Manutenção**

### **Recalcular Heat Scores**
```sql
SELECT recalculate_all_heat_scores();
```

### **Atualizar Contadores**
```sql
-- Os triggers mantêm automaticamente, mas se necessário:
UPDATE products SET 
    total_votes = (SELECT COUNT(*) FROM user_votes WHERE product_id = products.id);
```

### **Limpeza de Dados Antigos**
```sql
-- Remover clicks antigos (opcional)
DELETE FROM clicks 
WHERE created_at < NOW() - INTERVAL '90 days';
```

## 🚨 **Troubleshooting**

### **Erro: "relation does not exist"**
- Execute os scripts na ordem correta
- Verifique se o script anterior foi executado completamente

### **Erro: "permission denied"**
- Verifique se está logado como superuser
- No Supabase, use o SQL Editor como proprietário

### **Erro: "function does not exist"**
- Execute `02_functions.sql` antes de usar as funções
- Verifique se não há erros de sintaxe

### **RLS bloqueando queries**
- Verifique se está autenticado
- Confirme se as policies estão corretas
- Use `auth.uid()` nas queries quando necessário

## 📞 **Suporte**

Para problemas com o banco de dados:

1. 🔍 Verifique os logs do Supabase
2. 🧪 Execute os testes em `05_test_queries.sql`
3. 📖 Consulte a documentação do Supabase
4. 💬 Reporte issues no repositório

---

**✨ Schema completo implementado! O banco está pronto para suportar toda a funcionalidade do Deals Hub.** 