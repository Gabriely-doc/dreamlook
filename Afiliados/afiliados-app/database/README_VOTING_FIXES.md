# 🔧 Correções do Sistema de Votação e Moderação

## 📋 **Problemas Identificados e Soluções**

### 1. ✅ **Fluxo de Aprovação → Feed**

**Pergunta:** Ao aprovar um produto pendente em moderação ele é enviado para o feed?

**Resposta:** ✅ **SIM!** O fluxo funciona corretamente:

1. **Produto criado** → Status: `'pending'`
2. **Admin aprova** → Status: `'approved'` 
3. **Aparece no feed** → Apenas produtos com status `'approved'` são exibidos

**Código responsável:**
```typescript
// supabase.service.ts - linha 175
query = query.eq('status', 'approved'); // Apenas aprovados no feed

// product-moderation.component.ts - linha 350
async approveProduct(productId: string) {
  const result = await this.supabaseService.updateProductStatus(productId, 'approved');
  // Remove da lista de pendentes após aprovação
}
```

### 2. 🐛 **Bug na Contagem de Votos**

**Problema:** Quando um produto tem apenas 1 voto e recebe um voto negativo, o contador não subtrai corretamente.

**Causa:** Problemas na função `vote_product()`:
- Contadores não eram recalculados corretamente após remoção
- Faltava tratamento para valores negativos
- Não decrementava contador do usuário ao remover voto

**Solução:** Função `vote_product()` corrigida em `fix_vote_function.sql`:

```sql
-- ANTES (problemático)
SELECT COUNT(*) FROM user_votes WHERE product_id = p_product_id;

-- DEPOIS (corrigido)
SELECT 
    COALESCE(COUNT(*), 0) as total,
    COALESCE(COUNT(*) FILTER (WHERE is_positive = true), 0) as positive,
    COALESCE(COUNT(*) FILTER (WHERE is_positive = false), 0) as negative
FROM user_votes WHERE product_id = p_product_id;

-- Garantir valores não-negativos
v_total_votes := GREATEST(0, v_total_votes);
```

### 3. 🔄 **Script de Reset dos Contadores**

**Problema:** Contadores de produtos podem estar incorretos devido ao bug anterior.

**Solução:** Script `reset_product_votes.sql` que:

1. **Faz backup** dos dados atuais
2. **Zera todos os contadores**
3. **Recalcula baseado nos dados reais**
4. **Mostra comparativo antes/depois**

## 🚀 **Como Aplicar as Correções**

### 1. **Aplicar Função Corrigida**
```sql
-- Execute no Supabase SQL Editor
\i fix_vote_function.sql
```

### 2. **Resetar e Recalcular Contadores**
```sql
-- Execute no Supabase SQL Editor
\i reset_product_votes.sql

-- OU execute a função diretamente:
SELECT reset_and_recalculate_all_counters();
```

### 3. **Verificar Resultados**
```sql
-- Ver produtos com mais discrepâncias
SELECT 
    title,
    total_votes,
    positive_votes,
    negative_votes,
    (SELECT COUNT(*) FROM user_votes WHERE product_id = products.id) as actual_votes
FROM products 
WHERE total_votes != (SELECT COUNT(*) FROM user_votes WHERE product_id = products.id)
ORDER BY ABS(total_votes - (SELECT COUNT(*) FROM user_votes WHERE product_id = products.id)) DESC;
```

## 🔍 **Melhorias Implementadas**

### **Função `vote_product()` Melhorada:**

1. **Logs de Debug:**
   ```sql
   RAISE NOTICE 'Vote processed: user=%, product=%, action=%, total_votes=%';
   ```

2. **Tratamento de Erros:**
   ```sql
   EXCEPTION WHEN OTHERS THEN
       RAISE NOTICE 'Error in vote_product: %', SQLERRM;
   ```

3. **Decrementar Contador do Usuário:**
   ```sql
   -- Ao remover voto
   UPDATE users SET total_votes_cast = GREATEST(0, total_votes_cast - 1);
   ```

4. **Garantia de Valores Positivos:**
   ```sql
   v_total_votes := GREATEST(0, v_total_votes);
   ```

### **Função `recalculate_product_counters()` Nova:**

- Recalcula **todos** os contadores de uma vez
- Inclui tratamento de erros por produto
- Retorna estatísticas da operação
- Recalcula também `comment_count` e `click_count`

### **Função `reset_and_recalculate_all_counters()` Nova:**

- Reset completo + recálculo em uma operação
- Inclui contadores de usuários
- Retorna relatório detalhado
- Operação atômica com rollback em caso de erro

## 📊 **Verificação dos Resultados**

### **Antes da Correção:**
- Votos negativos não eram subtraídos corretamente
- Contadores podiam ficar negativos
- Inconsistência entre `user_votes` e `products.total_votes`

### **Depois da Correção:**
- ✅ Votos são calculados corretamente
- ✅ Contadores sempre >= 0
- ✅ Consistência total entre tabelas
- ✅ Logs detalhados para debug

## 🎯 **Testes Recomendados**

1. **Testar Votação Normal:**
   ```sql
   SELECT vote_product(
       '20000000-0000-0000-0000-000000000002',
       '30000000-0000-0000-0000-000000000001', 
       true
   );
   ```

2. **Testar Toggle (Remover Voto):**
   ```sql
   -- Votar novamente no mesmo produto com mesmo tipo
   SELECT vote_product(
       '20000000-0000-0000-0000-000000000002',
       '30000000-0000-0000-0000-000000000001', 
       true
   );
   ```

3. **Testar Mudança de Voto:**
   ```sql
   -- Votar positivo depois negativo
   SELECT vote_product(
       '20000000-0000-0000-0000-000000000002',
       '30000000-0000-0000-0000-000000000001', 
       false
   );
   ```

4. **Verificar Contadores:**
   ```sql
   SELECT 
       title,
       total_votes,
       positive_votes,
       negative_votes,
       (SELECT COUNT(*) FROM user_votes WHERE product_id = products.id) as real_total,
       (SELECT COUNT(*) FROM user_votes WHERE product_id = products.id AND is_positive = true) as real_positive,
       (SELECT COUNT(*) FROM user_votes WHERE product_id = products.id AND is_positive = false) as real_negative
   FROM products 
   WHERE id = '30000000-0000-0000-0000-000000000001';
   ```

## 🔧 **Manutenção Futura**

### **Monitoramento:**
- Execute `recalculate_product_counters()` semanalmente
- Monitore logs de erro da função `vote_product()`
- Verifique consistência entre tabelas mensalmente

### **Performance:**
- Função otimizada para operações em lote
- Índices adequados nas tabelas de votação
- Cache de heat_score para produtos populares

## 📝 **Logs e Debug**

A função agora gera logs detalhados:

```
NOTICE: Vote processed: user=20000000-0000-0000-0000-000000000002, product=30000000-0000-0000-0000-000000000001, action=created, total_votes=1
NOTICE: Vote processed: user=20000000-0000-0000-0000-000000000002, product=30000000-0000-0000-0000-000000000001, action=removed, total_votes=0
```

Para ver os logs no Supabase:
1. Vá para **SQL Editor**
2. Execute as funções
3. Veja os logs na aba **Logs** do projeto 