export const environment = {
  production: false,
  appName: 'Deals Hub - Afiliados',
  version: '1.0.0',
  
  // Supabase Configuration
  // Para configurar:
  // 1. Acesse https://supabase.com
  // 2. Crie uma conta (gratuita)
  // 3. Clique em "New Project"
  // 4. Preencha: Nome do projeto, Senha do banco, Região (escolha próxima ao Brasil)
  // 5. Copie a URL e anon key do painel Settings > API
  supabase: {
    url: 'https://osmkbbctdpnkmubnxpqp.supabase.co', // Exemplo: 'https://xxxxxxxxxxx.supabase.co'
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zbWtiYmN0ZHBua211Ym54cHFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMDgxNjEsImV4cCI6MjA2Njc4NDE2MX0.i7hQgLT83NDC_TI4PvzhyCp62Z-OaygAHj-g_azg55M', // Exemplo: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zbWtiYmN0ZHBua211Ym54cHFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTIwODE2MSwiZXhwIjoyMDY2Nzg0MTYxfQ.LZCxEWbrmKtH0AKabpk_oTBiue8ZrjhfNzJJmk_ibqQ' // Para operações administrativas (manter seguro)
  },
  
  // API Configuration
  api: {
    baseUrl: 'http://localhost:3000/api',
    timeout: 30000
  },
  
  // Feature Flags
  features: {
    enablePWA: true,
    enableAnalytics: false,
    enablePushNotifications: true,
    enableRealtime: true,
    enableAuth: true
  },
  
  // Social Media Configuration
  social: {
    instagram: {
      enabled: false,
      accessToken: '',
      businessAccountId: ''
    },
    whatsapp: {
      enabled: true,
      businessNumber: '',
      apiToken: ''
    }
  },
  
  // Niches Configuration
  niches: {
    current: 'cozinha', // 'beleza', 'cozinha', 'moda'
    available: ['beleza', 'cozinha', 'moda'],
    themes: {
      beleza: {
        primaryColor: '#ec4899',
        secondaryColor: '#f472b6',
        name: 'Beleza Barata'
      },
      cozinha: {
        primaryColor: '#f59e0b',
        secondaryColor: '#fbbf24',
        name: 'Cozinha Barata'
      },
      moda: {
        primaryColor: '#8b5cf6',
        secondaryColor: '#a78bfa',
        name: 'Moda Barata'
      }
    }
  },
  
  // Debug & Development
  debug: {
    enableConsoleLog: true,
    enablePerformanceMonitoring: true,
    enableErrorReporting: false
  }
}; 