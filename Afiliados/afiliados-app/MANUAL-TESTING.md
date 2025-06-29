# 🧪 Checklist de Testes Manuais

## 📋 Pré-requisitos
- [ ] `npm start` executando (http://localhost:4200)
- [ ] `npm run build` + `npx http-server dist/afiliados-app -p 8080` para PWA
- [ ] DevTools aberto (F12)

## 🏠 Teste 1: Página Inicial
- [ ] Logo "Deals Hub" visível
- [ ] Status Supabase: "❌ Não configurado"
- [ ] Botão "Entrar" presente
- [ ] Layout responsivo (mobile/desktop)

## 🔐 Teste 2: Sistema de Autenticação
### Navegação para Login
- [ ] Clicar "Entrar" → redireciona para `/auth`
- [ ] URL muda corretamente
- [ ] Componente carrega (lazy loading)

### Interface de Login
- [ ] Campo email presente
- [ ] Campo senha presente
- [ ] Botão "Entrar" presente
- [ ] Botão "Entrar com Google" presente
- [ ] Toggle "Criar conta" funcional

### Validações de Formulário
- [ ] Email vazio → "Campo obrigatório"
- [ ] Email inválido → "Email deve ser válido"
- [ ] Senha vazia → "Campo obrigatório"
- [ ] Senha < 6 chars → "Senha deve ter pelo menos 6 caracteres"
- [ ] Formulário desabilitado quando inválido

### Estados de Loading
- [ ] Botão mostra loading ao submeter
- [ ] Campos desabilitados durante loading
- [ ] Mensagens de erro apropriadas

## 🧭 Teste 3: Navegação e Rotas
### Rotas Básicas
- [ ] `/` → Página inicial carrega
- [ ] `/auth` → Login carrega
- [ ] `/feed` → Feed carrega (lazy)
- [ ] `/admin` → Admin carrega (lazy)

### Lazy Loading
- [ ] DevTools → Network mostra chunks separados
- [ ] Navegação rápida entre rotas
- [ ] Sem recarregamento completo da página

### Navegação por Botões
- [ ] Logo → volta para home
- [ ] Botão "Entrar" → vai para auth
- [ ] Navegação funciona em mobile

## 📱 Teste 4: Responsividade
### Dispositivos Móveis (375px)
- [ ] Layout adapta corretamente
- [ ] Botões têm tamanho adequado (44px+)
- [ ] Texto legível sem zoom
- [ ] Navegação acessível

### Tablet (768px)
- [ ] Layout intermediário funcional
- [ ] Elementos bem distribuídos
- [ ] Navegação fluida

### Desktop (1920px)
- [ ] Layout aproveita espaço disponível
- [ ] Elementos não ficam muito largos
- [ ] Navegação por mouse/teclado

## 🔧 Teste 5: PWA (Produção)
### Service Worker
- [ ] DevTools → Application → Service Workers registrado
- [ ] Cache funcionando
- [ ] Offline fallback (se configurado)

### Manifest
- [ ] DevTools → Application → Manifest válido
- [ ] Ícones carregando corretamente
- [ ] Configurações PWA corretas

### Instalação
- [ ] Banner de instalação (pode não aparecer em localhost)
- [ ] App instalável via menu do navegador
- [ ] Funciona como app nativo

## ⚡ Teste 6: Performance
### Lighthouse Audit
- [ ] Performance Score > 90
- [ ] PWA Score > 90
- [ ] Accessibility Score > 90
- [ ] Best Practices Score > 90

### Métricas Core Web Vitals
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1

### Network Performance
- [ ] Carregamento inicial < 3s
- [ ] Chunks lazy loading funcionando
- [ ] Cache headers apropriados

## 🔄 Teste 7: Estados da Aplicação
### Estados de Loading
- [ ] Indicadores visuais durante carregamento
- [ ] Sem telas brancas durante navegação
- [ ] Transições suaves entre rotas

### Estados de Erro
- [ ] Erro de rede → mensagem apropriada
- [ ] Rota inexistente → 404 ou redirect
- [ ] Erro de validação → feedback claro

### Estados Vazios
- [ ] Componentes sem dados → placeholder
- [ ] Estados vazios informativos
- [ ] CTAs para próximas ações

## 🧪 Teste 8: Integração Supabase
### Configuração
- [ ] Status mostra "❌ Não configurado"
- [ ] Instruções claras para configurar
- [ ] Links para documentação funcionais

### Quando Configurado (Futuro)
- [ ] Status mostra "✅ Conectado"
- [ ] Autenticação real funciona
- [ ] Dados persistem corretamente

## ✅ Critérios de Aceitação
- [ ] Todos os testes básicos passam
- [ ] Performance adequada (Lighthouse > 90)
- [ ] Responsivo em todos os dispositivos
- [ ] PWA instalável e funcional
- [ ] Navegação fluida sem erros
- [ ] Estados de loading/erro apropriados

## 🚨 Red Flags
- ❌ Tela branca por mais de 2s
- ❌ Erro 404 em rotas válidas
- ❌ Layout quebrado em mobile
- ❌ Performance < 80 no Lighthouse
- ❌ Service Worker não registra
- ❌ JavaScript errors no console

---

**📝 Notas:**
- Teste sempre em modo incógnito para cache limpo
- Use diferentes navegadores (Chrome, Firefox, Edge)
- Simule conexões lentas (DevTools → Network → Slow 3G)
- Teste com JavaScript desabilitado para graceful degradation 