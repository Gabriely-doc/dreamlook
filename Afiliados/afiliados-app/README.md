# 🛍️ Deals Hub - Afiliados

Uma plataforma PWA moderna para descoberta e curadoria de produtos com desconto, focada em nichos específicos como beleza, cozinha e moda.

## 🚀 Características

- **PWA (Progressive Web App)** - Instalável em dispositivos móveis
- **Multitenant** - Suporte a múltiplos nichos (beleza, cozinha, moda)
- **Sistema de Votação** - Comunidade decide os melhores produtos
- **Autenticação** - Login via Google e email
- **Área Administrativa** - Painel para moderação e métricas
- **Responsivo** - Interface otimizada para mobile e desktop

## 🛠️ Tecnologias

- **Frontend**: Angular 18 + TypeScript
- **Styling**: SCSS + CSS Grid/Flexbox
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **PWA**: Angular Service Worker
- **Automação**: n8n (futuro)

## 📁 Estrutura do Projeto

```
src/app/
├── core/                 # Serviços principais e guards
│   ├── services/         # AuthService, ApiService, etc.
│   └── guards/           # AuthGuard, AdminGuard
├── shared/               # Componentes compartilhados
│   └── components/       # VotingButtons, ProductCard, etc.
├── features/             # Módulos por funcionalidade
│   ├── feed/             # Feed principal de produtos
│   ├── auth/             # Autenticação
│   └── admin/            # Área administrativa
└── environments/         # Configurações por ambiente
```

## 🚦 Como Executar

### Pré-requisitos
- Node.js 18+
- Angular CLI 18+

### Instalação
```bash
npm install
```

### Desenvolvimento
```bash
ng serve
# Acesse http://localhost:4200
```

### Build
```bash
ng build
# Arquivos gerados em dist/afiliados-app
```

### PWA Build
```bash
ng build --configuration production
# Para testar PWA funcionalidades
```

## 🔧 Configuração

### Environment
Edite `src/environments/environment.ts`:

```typescript
export const environment = {
  supabase: {
    url: 'SUA_SUPABASE_URL',
    anonKey: 'SUA_SUPABASE_ANON_KEY'
  },
  niches: {
    current: 'beleza' // ou 'cozinha', 'moda'
  }
};
```

## 📱 PWA Features

- ✅ Instalável (Add to Home Screen)
- ✅ Offline básico (Service Worker)
- ✅ Manifest configurado
- ✅ Ícones otimizados
- 🔄 Push Notifications (em desenvolvimento)

## 🎯 Roadmap

### Fase 1 - MVP ✅
- [x] Setup Angular PWA
- [x] Estrutura multitenant
- [x] Componentes básicos
- [x] Navegação e rotas

### Fase 2 - Backend
- [ ] Configurar Supabase
- [ ] Modelar banco de dados
- [ ] Implementar autenticação
- [ ] Sistema de votação

### Fase 3 - Features
- [ ] Feed de produtos
- [ ] Área administrativa
- [ ] Sistema de comentários
- [ ] Dashboard de métricas

### Fase 4 - Automação
- [ ] Integração n8n
- [ ] Scraping automático
- [ ] Geração de conteúdo IA
- [ ] Publicação redes sociais

## 🤝 Contribuição

1. Fork o projeto
2. Crie sua feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para detalhes.

## 📞 Contato

- **Projeto**: Deals Hub - Afiliados
- **Versão**: 1.0.0
- **Status**: Em desenvolvimento ativo
