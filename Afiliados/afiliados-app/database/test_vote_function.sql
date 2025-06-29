-- =====================================================
-- TESTES DA FUNÇÃO vote_product
-- Validação completa da lógica idempotente
-- =====================================================

-- Preparar dados de teste
DO $$
DECLARE
    v_test_user_id uuid := '20000000-0000-0000-0000-000000000002';
    v_test_product_id uuid := '30000000-0000-0000-0000-000000000001';
    v_result jsonb;
    v_initial_votes integer;
    v_final_votes integer;
BEGIN
    RAISE NOTICE '🧪 INICIANDO TESTES DA FUNÇÃO vote_product';
    
    -- Limpar votos existentes para teste limpo
    DELETE FROM user_votes WHERE user_id = v_test_user_id AND product_id = v_test_product_id;
    
    -- Obter contagem inicial
    SELECT total_votes INTO v_initial_votes FROM products WHERE id = v_test_product_id;
    
    RAISE NOTICE '📊 Votos iniciais: %', v_initial_votes;
    
    -- =====================================================
    -- TESTE 1: Criar voto positivo
    -- =====================================================
    RAISE NOTICE '🔴 TESTE 1: Criar voto positivo';
    
    SELECT vote_product(v_test_user_id, v_test_product_id, true) INTO v_result;
    
    -- Validar resposta
    ASSERT (v_result->>'success')::boolean = true, 
        'FALHOU: Criação de voto deveria ter sucesso';
    ASSERT v_result->>'action' = 'created', 
        'FALHOU: Ação deveria ser "created"';
    ASSERT (v_result->'vote_counts'->>'total')::integer = v_initial_votes + 1,
        'FALHOU: Total de votos deveria aumentar em 1';
    
    RAISE NOTICE '✅ TESTE 1 PASSOU: Voto positivo criado com sucesso';
    
    -- =====================================================
    -- TESTE 2: Toggle do mesmo voto (remover)
    -- =====================================================
    RAISE NOTICE '🔴 TESTE 2: Toggle do mesmo voto (remover)';
    
    SELECT vote_product(v_test_user_id, v_test_product_id, true) INTO v_result;
    
    -- Validar resposta
    ASSERT (v_result->>'success')::boolean = true, 
        'FALHOU: Toggle deveria ter sucesso';
    ASSERT v_result->>'action' = 'removed', 
        'FALHOU: Ação deveria ser "removed"';
    ASSERT (v_result->'vote_counts'->>'total')::integer = v_initial_votes,
        'FALHOU: Total de votos deveria voltar ao inicial';
    
    RAISE NOTICE '✅ TESTE 2 PASSOU: Toggle de voto funcionando';
    
    -- =====================================================
    -- TESTE 3: Criar voto negativo
    -- =====================================================
    RAISE NOTICE '🔴 TESTE 3: Criar voto negativo';
    
    SELECT vote_product(v_test_user_id, v_test_product_id, false) INTO v_result;
    
    -- Validar resposta
    ASSERT (v_result->>'success')::boolean = true, 
        'FALHOU: Criação de voto negativo deveria ter sucesso';
    ASSERT v_result->>'action' = 'created', 
        'FALHOU: Ação deveria ser "created"';
    ASSERT (v_result->'vote_counts'->>'negative')::integer > 0,
        'FALHOU: Deveria ter pelo menos 1 voto negativo';
    
    RAISE NOTICE '✅ TESTE 3 PASSOU: Voto negativo criado com sucesso';
    
    -- =====================================================
    -- TESTE 4: Mudança de voto (negativo para positivo)
    -- =====================================================
    RAISE NOTICE '🔴 TESTE 4: Mudança de voto (negativo para positivo)';
    
    SELECT vote_product(v_test_user_id, v_test_product_id, true) INTO v_result;
    
    -- Validar resposta
    ASSERT (v_result->>'success')::boolean = true, 
        'FALHOU: Mudança de voto deveria ter sucesso';
    ASSERT v_result->>'action' = 'updated', 
        'FALHOU: Ação deveria ser "updated"';
    ASSERT (v_result->'vote_counts'->>'positive')::integer > 0,
        'FALHOU: Deveria ter pelo menos 1 voto positivo';
    
    RAISE NOTICE '✅ TESTE 4 PASSOU: Mudança de voto funcionando';
    
    -- =====================================================
    -- TESTE 5: Produto inexistente
    -- =====================================================
    RAISE NOTICE '🔴 TESTE 5: Produto inexistente';
    
    SELECT vote_product(v_test_user_id, '99999999-9999-9999-9999-999999999999', true) INTO v_result;
    
    -- Validar resposta
    ASSERT (v_result->>'success')::boolean = false, 
        'FALHOU: Produto inexistente deveria falhar';
    ASSERT v_result->>'error' = 'product_not_found', 
        'FALHOU: Erro deveria ser "product_not_found"';
    
    RAISE NOTICE '✅ TESTE 5 PASSOU: Validação de produto inexistente';
    
    -- =====================================================
    -- TESTE 6: Usuário inexistente
    -- =====================================================
    RAISE NOTICE '🔴 TESTE 6: Usuário inexistente';
    
    SELECT vote_product('99999999-9999-9999-9999-999999999999', v_test_product_id, true) INTO v_result;
    
    -- Validar resposta
    ASSERT (v_result->>'success')::boolean = false, 
        'FALHOU: Usuário inexistente deveria falhar';
    ASSERT v_result->>'error' = 'user_not_found', 
        'FALHOU: Erro deveria ser "user_not_found"';
    
    RAISE NOTICE '✅ TESTE 6 PASSOU: Validação de usuário inexistente';
    
    -- =====================================================
    -- TESTE 7: Verificar heat score atualizado
    -- =====================================================
    RAISE NOTICE '🔴 TESTE 7: Verificar heat score atualizado';
    
    SELECT vote_product(v_test_user_id, v_test_product_id, true) INTO v_result;
    
    -- Validar que heat score foi calculado
    ASSERT (v_result->'vote_counts'->>'heat_score') IS NOT NULL,
        'FALHOU: Heat score deveria ser calculado';
    ASSERT (v_result->'vote_counts'->>'heat_score')::integer >= 0,
        'FALHOU: Heat score deveria ser >= 0';
    
    RAISE NOTICE '✅ TESTE 7 PASSOU: Heat score sendo calculado corretamente';
    
    -- Limpar dados de teste
    DELETE FROM user_votes WHERE user_id = v_test_user_id AND product_id = v_test_product_id;
    
    RAISE NOTICE '🎉 TODOS OS TESTES PASSARAM! Função vote_product está funcionando corretamente.';
    
EXCEPTION
    WHEN ASSERT_FAILURE THEN
        RAISE NOTICE '❌ TESTE FALHOU: %', SQLERRM;
        RAISE;
    WHEN OTHERS THEN
        RAISE NOTICE '💥 ERRO INESPERADO: %', SQLERRM;
        RAISE;
END $$; 