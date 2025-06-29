# 🚀 Configuração do Supabase - Deals Hub

Este guia explica como configurar o Supabase para o projeto Deals Hub.

## 📋 Pré-requisitos

- Conta no Supabase (gratuita)
- Acesso à internet
- Email válido

## 🔧 Passo a Passo

### 1. Criar Conta no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Clique em **"Start your project"** ou **"Sign Up"**
3. Registre-se usando:
   - Email + senha, ou
   - GitHub OAuth (recomendado para desenvolvedores)

### 2. Criar Novo Projeto

1. No dashboard, clique em **"New Project"**
2. Preencha as informações:
   ```
   Organization: Sua organização (ou pessoal)
   Project Name: deals-hub-afiliados
   Database Password: [Senha forte - ANOTE ESTA SENHA!]
   Region: South America (São Paulo) - para melhor performance no Brasil
   Pricing Plan: Free (até 500MB, 2 projetos)
   ```
3. Clique em **"Create new project"**
4. Aguarde ~2 minutos para o projeto ser provisionado

### 3. Obter Chaves de API

1. No painel do projeto, vá para **Settings > API**
2. Copie as seguintes informações:

   ```typescript
   // Project URL
   url: 'https://[SEU-PROJECT-ID].supabase.co'
   
   // anon/public key (segura para uso no frontend)
   anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
   
   // service_role key (APENAS para backend/admin - manter seguro!)
   serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
   ```

### 4. Configurar Environment

1. Abra `src/environments/environment.ts`
2. Substitua as configurações do Supabase:

   ```typescript
   supabase: {
     url: 'https://[SEU-PROJECT-ID].supabase.co',
     anonKey: 'sua-anon-key-aqui',
     serviceRoleKey: 'sua-service-role-key-aqui'
   }
   ```

### 5. Instalar Dependências

```bash
# Instalar cliente Supabase
npm install @supabase/supabase-js

# Para autenticação (opcional, já incluído)
npm install @supabase/auth-js
```

### 6. Configurar Autenticação (Opcional)

1. No Supabase, vá para **Authentication > Settings**
2. Configure provedores OAuth:
   - **Google**: Adicione Client ID e Secret
   - **GitHub**: Adicione Client ID e Secret
3. Configure URLs de redirecionamento:
   ```
   Site URL: http://localhost:4200
   Redirect URLs: http://localhost:4200/auth/callback
   ```

## 🔒 Segurança

### ⚠️ IMPORTANTE - Chaves de API

- **anon key**: Segura para uso no frontend
- **service_role key**: NUNCA exponha no frontend! Apenas backend/admin

### 🛡️ Row Level Security (RLS)

O Supabase usa RLS para segurança. Por padrão:
- Tabelas são **privadas** (sem acesso público)
- Você deve criar **policies** para permitir acesso
- Exemplo de policy básica:

```sql
-- Permitir que usuários vejam apenas seus próprios dados
CREATE POLICY "Users can view own data" ON profiles
FOR SELECT USING (auth.uid() = user_id);
```

## 📊 Recursos Disponíveis

### Plano Gratuito Inclui:
- ✅ 500MB de banco de dados
- ✅ 1GB de armazenamento de arquivos
- ✅ 2GB de transferência
- ✅ 50MB de edge functions
- ✅ Autenticação ilimitada
- ✅ Realtime ilimitado
- ✅ APIs automáticas

### Limites do Plano Gratuito:
- 2 projetos ativos
- Pausa após 1 semana de inatividade
- Suporte via comunidade

## 🧪 Testar Conexão

Crie um arquivo de teste `src/app/core/services/supabase.service.ts`:

```typescript
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    );
  }

  // Testar conexão
  async testConnection() {
    try {
      const { data, error } = await this.supabase
        .from('_test')
        .select('*')
        .limit(1);
      
      console.log('✅ Supabase conectado com sucesso!');
      return true;
    } catch (error) {
      console.log('❌ Erro na conexão:', error);
      return false;
    }
  }

  get client() {
    return this.supabase;
  }
}
```

## 📚 Próximos Passos

Após configurar o Supabase:

1. ✅ **Configuração concluída**
2. ⏭️ **Próximo**: Modelar banco de dados
3. ⏭️ **Depois**: Implementar autenticação
4. ⏭️ **Por fim**: Criar APIs e realtime

## 🆘 Problemas Comuns

### Erro de CORS
```
Access to fetch at 'https://xxx.supabase.co' from origin 'http://localhost:4200' has been blocked by CORS
```
**Solução**: Verificar se a URL no environment está correta

### Erro 401 Unauthorized
```
{"message":"Invalid API key"}
```
**Solução**: Verificar se a anon key está correta

### Projeto pausado
```
{"message":"Project is paused"}
```
**Solução**: Reativar projeto no dashboard (plano gratuito pausa após inatividade)

## 📞 Suporte

- 📖 [Documentação Oficial](https://supabase.com/docs)
- 💬 [Discord Community](https://discord.supabase.com)
- 🐛 [GitHub Issues](https://github.com/supabase/supabase/issues)
- 📧 [Suporte Oficial](https://supabase.com/support)

---

**✨ Configuração do Supabase concluída! Agora você pode prosseguir para a modelagem do banco de dados.** 