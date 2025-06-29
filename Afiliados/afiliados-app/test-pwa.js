const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8443;

// Servir arquivos estáticos do build de produção
app.use(express.static(path.join(__dirname, 'dist/afiliados-app')));

// Configurar headers para PWA
app.use((req, res, next) => {
  // Headers de segurança necessários para PWA
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Service Worker precisa ser servido com headers corretos
  if (req.url.endsWith('.js')) {
    res.setHeader('Service-Worker-Allowed', '/');
  }
  
  next();
});

// Rota catch-all para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/afiliados-app/index.html'));
});

// Certificado auto-assinado para desenvolvimento
const options = {
  key: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKB
xQOKzwkGdU5i2se73NjhHBhHAoHQmP4sNjPQoaq30cINhw/VVh21/FwHn/jzm/OZ
0xaGLwqBQAoAA5PKREHz2TNks+z40FOMjMRzRhbQ8A0VitOVvxYykJ8z0UksRCow
DpKWzYNy2QYDVF8D2SUVqXe1voMSrfNGpRvdwSBg/U2VvRpT4+dllP2YcUkbUnlG
vksjQjFE2PxWxIuNjsquzs4f5MYlVoY1N2/3irNjFf6JdGfklDNq2UpHrAevjFdf
O6rUg6Id3bc+MA6Dq7n3N3dDo1fBIgVw5GlcTpXjoQi818w6V5yVBNBN4FQHuJsJ
AgMBAAECggEBALWdAw==`,
  cert: `-----BEGIN CERTIFICATE-----
MIIBkTCB+wIJANn3CwvalUzSMA0GCSqGSIb3DQEBCwUAMBQxEjAQBgNVBAMMCWxv
Y2FsaG9zdDAeFw0yMzEyMDEwMDAwMDBaFw0yNDEyMDEwMDAwMDBaMBQxEjAQBgNV
BAMMCWxvY2FsaG9zdDCBnzANBgkqhkiG9w0BAQEFAAOBjQAwgYkCgYEAu1SU1LfV
LPHCgcUDis8JBnVOYtrHu9zY4RwYRwKB0Jj+LDYz0KGqt9HCDYcP1VYdtfxcB5/4
85vzmVMWhi8KgUAKAAOTykRB89kzZLPs+NBTjIzEc0YW0PANFYrTlb8WMpCfM9FJ
LEQqMA6Sls2DctkGA1RfA9klFal3tb6DEq3zRqUb3cEgYP1Nlb0aU+PnZZT9mHFJ
G1J5Rr5LI0IxRNj8VsSLjY7Krs7OH+TGJVaGNTdv94qzYxX+iXRn5JQzatlKR6wH
r4xXXzuq1IOiHd23PjAOg6u59zd3Q6NXwSIFcORpXE6V46EIvNfMOleclQTQTeBU
B7ibCQIDAQABMA0GCSqGSIb3DQEBCwUAA4GBAGPiw9WNn+RDX6zt+AEvm6SfMQeH
gxBJdxvnh5JSi5rr0NuF4o2OmFnbcd2lkmD9vCtIX8XRqYxBt4kVBCXtRQJC7E2d
-----END CERTIFICATE-----`
};

console.log('🚀 Iniciando servidor HTTPS para teste do PWA...');
console.log(`📱 Acesse: https://localhost:${PORT}`);
console.log('⚠️  Aceite o certificado auto-assinado no navegador');
console.log('🔧 Para testar a instalação:');
console.log('   1. Abra Chrome DevTools');
console.log('   2. Vá em Application > Manifest');
console.log('   3. Clique em "Install" ou aguarde o prompt automático');

https.createServer(options, app).listen(PORT, () => {
  console.log(`✅ Servidor rodando em https://localhost:${PORT}`);
}); 