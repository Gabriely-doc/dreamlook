# 🧪 Guia de Testes - Deals Hub

## 📋 Visão Geral dos Testes

Este projeto implementa uma suíte completa de testes automatizados cobrindo todas as funcionalidades implementadas.

### 🎯 Cobertura de Testes Atual:

- ✅ **SupabaseService** - Conexão, autenticação, configuração
- ✅ **FeedComponent** - Exibição de produtos, votação, layout
- ✅ **LoginComponent** - Interface de autenticação
- ✅ **AdminDashboardComponent** - Painel administrativo
- ✅ **AppComponent** - PWA, navegação, status Supabase
- ✅ **Testes de Integração** - Fluxos completos
- ✅ **Testes de Performance** - Tempo de inicialização
- ✅ **Testes de Acessibilidade** - Estrutura semântica

## 🚀 Comandos de Teste

### Desenvolvimento
```bash
# Executar testes em modo watch (recomendado para desenvolvimento)
npm run test:watch

# Executar testes com debug no Chrome
npm run test:debug
```

### Execução Única
```bash
# Executar todos os testes uma vez
npm test

# Executar testes headless (sem interface)
npm run test:headless

# Executar testes com relatório de cobertura
npm run test:coverage
```

### CI/CD
```bash
# Executar testes para integração contínua
npm run test:ci
```

## 📊 Métricas de Cobertura

### Metas de Cobertura:
- **Statements**: 80%
- **Branches**: 70%
- **Functions**: 80%
- **Lines**: 80%

### Verificar Cobertura:
```bash
npm run test:coverage
# Relatório gerado em: coverage/afiliados-app/index.html
```

## 🧪 Tipos de Teste Implementados

### 1. **Testes Unitários**
Testam componentes individuais isoladamente:

```typescript
// Exemplo: FeedComponent
describe('FeedComponent', () => {
  it('should display all mock products', () => {
    const productCards = fixture.debugElement.queryAll(By.css('.product-card'));
    expect(productCards.length).toBe(component.mockProducts.length);
  });
});
```

### 2. **Testes de Integração**
Testam fluxos completos da aplicação:

```typescript
// Exemplo: Navegação completa
describe('Navigation Flow', () => {
  it('should handle navigation between all pages', async () => {
    await router.navigate(['/feed']);
    expect(location.path()).toBe('/feed');
    
    await router.navigate(['/auth']);
    expect(location.path()).toBe('/auth');
  });
});
```

### 3. **Testes de Serviços**
Testam lógica de negócio e integrações:

```typescript
// Exemplo: SupabaseService
describe('testConnection', () => {
  it('should return true when connection is successful', async () => {
    const result = await service.testConnection();
    expect(result).toBeTrue();
  });
});
```

### 4. **Testes de Interface**
Testam elementos visuais e interações:

```typescript
// Exemplo: Botões e layout
it('should have Google login button', () => {
  const googleBtn = fixture.debugElement.query(By.css('.btn-google'));
  expect(googleBtn.nativeElement.textContent).toContain('Entrar com Google');
});
```

## 🔧 Configuração de Testes

### Arquivos de Configuração:
- `karma.conf.js` - Configuração do Karma
- `src/test-setup.ts` - Setup global de testes
- `*.spec.ts` - Arquivos de teste individuais

### Mocks Globais Configurados:
- ✅ LocalStorage
- ✅ MatchMedia (para PWA)
- ✅ Performance API
- ✅ IntersectionObserver
- ✅ ResizeObserver
- ✅ Console (com spies)

## 📝 Estrutura dos Testes

```
src/
├── app/
│   ├── core/services/
│   │   └── supabase.service.spec.ts
│   ├── features/
│   │   ├── feed/
│   │   │   └── feed.component.spec.ts
│   │   ├── auth/
│   │   │   └── login.component.spec.ts
│   │   └── admin/
│   │       └── admin-dashboard.component.spec.ts
│   ├── integration/
│   │   └── app.integration.spec.ts
│   └── app.component.spec.ts
└── test-setup.ts
```

## 🎯 Boas Práticas Implementadas

### 1. **Padrão AAA (Arrange, Act, Assert)**
```typescript
it('should display product information correctly', () => {
  // Arrange
  const firstProduct = component.mockProducts[0];
  
  // Act
  fixture.detectChanges();
  
  // Assert
  const productName = fixture.debugElement.query(By.css('h3'));
  expect(productName.nativeElement.textContent).toContain(firstProduct.name);
});
```

### 2. **Mocks e Spies**
```typescript
const mockSupabaseService = jasmine.createSpyObj('SupabaseService', [
  'isConfigured', 'testConnection'
]);
```

### 3. **Testes de Acessibilidade**
```typescript
it('should have semantic HTML structure', () => {
  const heading = fixture.debugElement.query(By.css('h2'));
  expect(heading).toBeTruthy();
});
```

### 4. **Testes de Performance**
```typescript
it('should initialize components quickly', async () => {
  const startTime = performance.now();
  await component.ngOnInit();
  const endTime = performance.now();
  expect(endTime - startTime).toBeLessThan(100);
});
```

## 🚨 Executando Testes

### Para Desenvolvimento:
```bash
# Inicia testes em modo watch
npm run test:watch
```

### Para Verificação Rápida:
```bash
# Executa todos os testes uma vez
npm run test:headless
```

### Para Análise de Cobertura:
```bash
# Gera relatório completo
npm run test:coverage
# Abra: coverage/afiliados-app/index.html
```

## 📈 Próximos Passos

Sempre que implementar novas funcionalidades:

1. ✅ **Criar testes unitários** para novos componentes
2. ✅ **Adicionar testes de integração** para novos fluxos
3. ✅ **Verificar cobertura** com `npm run test:coverage`
4. ✅ **Executar todos os testes** antes de commit
5. ✅ **Atualizar este guia** com novas funcionalidades

## 🔍 Debugging de Testes

### Testes Falhando:
```bash
# Execute com debug para investigar
npm run test:debug
```

### Problemas de Performance:
```bash
# Verifique métricas de tempo
npm run test:coverage
```

### Problemas de Mocks:
- Verifique `src/test-setup.ts`
- Confirme se mocks estão configurados corretamente

## ✅ Status Atual

- **Total de Testes**: 50+ testes implementados
- **Cobertura Atual**: Meta de 80%+ statements
- **Componentes Testados**: 100% dos componentes implementados
- **Serviços Testados**: 100% dos serviços implementados
- **Integração**: Fluxos completos testados

Todos os testes estão passando e a cobertura está dentro das metas estabelecidas! 🎉 