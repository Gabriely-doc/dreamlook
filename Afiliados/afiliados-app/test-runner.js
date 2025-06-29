#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 DEALS HUB - SUITE COMPLETA DE TESTES\n');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const results = [];

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function addResult(test, status, details = '') {
  results.push({ test, status, details });
  if (status === 'PASS') passedTests++;
  else failedTests++;
  totalTests++;
}

// 1. TESTE DE COMPILAÇÃO
log('🔨 1. TESTE DE COMPILAÇÃO', colors.blue);
try {
  execSync('ng build --configuration=development', { stdio: 'pipe' });
  log('✅ Build de desenvolvimento: OK', colors.green);
  addResult('Build Development', 'PASS');
} catch (error) {
  log('❌ Build de desenvolvimento: FALHOU', colors.red);
  addResult('Build Development', 'FAIL', 'Build failed');
}

try {
  execSync('ng build --configuration=production', { stdio: 'pipe' });
  log('✅ Build de produção: OK', colors.green);
  addResult('Build Production', 'PASS');
} catch (error) {
  log('❌ Build de produção: FALHOU', colors.red);
  addResult('Build Production', 'FAIL', 'Build failed');
}

// 2. VALIDAÇÃO DE ESTRUTURA DOS TESTES
log('\n🧪 2. VALIDAÇÃO DA ESTRUTURA DOS TESTES', colors.blue);

const testFiles = [
  'src/app/core/services/auth.service.spec.ts',
  'src/app/core/services/supabase.service.spec.ts',
  'src/app/core/guards/admin.guard.spec.ts',
  'src/app/core/guards/admin.guard.integration.spec.ts',
  'src/app/features/feed/feed.component.spec.ts',
  'src/app/features/feed/feed-produtos.component.spec.ts',
  'src/app/features/auth/login.component.spec.ts',
  'src/app/features/admin/admin-dashboard.component.spec.ts',
  'src/app/app.component.spec.ts',
  'src/app/integration/app.integration.spec.ts'
];

let totalTestCases = 0;
let validTestFiles = 0;

testFiles.forEach(testFile => {
  const fullPath = path.join(__dirname, testFile);
  
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    const hasDescribe = content.includes('describe(');
    const hasIt = content.includes('it(');
    const hasBeforeEach = content.includes('beforeEach(');
    const hasExpect = content.includes('expect(');
    
    const testCount = (content.match(/it\(/g) || []).length;
    
    if (hasDescribe && hasIt && hasBeforeEach && hasExpect) {
      log(`✅ ${testFile} - ${testCount} testes`, colors.green);
      addResult(`Test Structure: ${path.basename(testFile)}`, 'PASS', `${testCount} test cases`);
      validTestFiles++;
    } else {
      log(`❌ ${testFile} - Estrutura inválida`, colors.red);
      addResult(`Test Structure: ${path.basename(testFile)}`, 'FAIL', 'Invalid structure');
    }
    
    totalTestCases += testCount;
  } else {
    log(`❌ ${testFile} - Arquivo não encontrado`, colors.red);
    addResult(`Test File: ${path.basename(testFile)}`, 'FAIL', 'File not found');
  }
});

log(`📊 Total: ${validTestFiles}/${testFiles.length} arquivos válidos, ${totalTestCases} casos de teste`);

// 3. VALIDAÇÃO DE SINTAXE TYPESCRIPT
log('\n📝 3. VALIDAÇÃO DE SINTAXE TYPESCRIPT', colors.blue);
try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  log('✅ Sintaxe TypeScript: OK', colors.green);
  addResult('TypeScript Syntax', 'PASS');
} catch (error) {
  log('❌ Sintaxe TypeScript: ERROS ENCONTRADOS', colors.red);
  addResult('TypeScript Syntax', 'FAIL', 'Compilation errors');
}

// 4. VALIDAÇÃO DE ESTRUTURA DE ARQUIVOS
log('\n📁 4. VALIDAÇÃO DE ESTRUTURA DE ARQUIVOS', colors.blue);

const requiredFiles = [
  'src/app/app.component.ts',
  'src/app/app.routes.ts',
  'src/app/core/services/auth.service.ts',
  'src/app/core/services/supabase.service.ts',
  'src/app/features/auth/login.component.ts',
  'src/app/features/feed/feed.component.ts',
  'src/app/features/admin/admin-dashboard.component.ts',
  'angular.json',
  'package.json',
  'tsconfig.json'
];

let validFiles = 0;
requiredFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    validFiles++;
  } else {
    log(`❌ Arquivo obrigatório ausente: ${file}`, colors.red);
    addResult(`Required File: ${file}`, 'FAIL', 'Missing file');
  }
});

if (validFiles === requiredFiles.length) {
  log(`✅ Estrutura de arquivos: ${validFiles}/${requiredFiles.length} OK`, colors.green);
  addResult('File Structure', 'PASS', `${validFiles}/${requiredFiles.length} files`);
} else {
  log(`❌ Estrutura de arquivos: ${validFiles}/${requiredFiles.length}`, colors.red);
  addResult('File Structure', 'FAIL', `Missing ${requiredFiles.length - validFiles} files`);
}

// 5. VALIDAÇÃO DE DEPENDÊNCIAS
log('\n📦 5. VALIDAÇÃO DE DEPENDÊNCIAS', colors.blue);
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = [
    '@angular/core',
    '@angular/router',
    '@supabase/supabase-js',
    '@angular/service-worker'
  ];
  
  let missingDeps = [];
  requiredDeps.forEach(dep => {
    if (!packageJson.dependencies[dep] && !packageJson.devDependencies[dep]) {
      missingDeps.push(dep);
    }
  });
  
  if (missingDeps.length === 0) {
    log('✅ Dependências: OK', colors.green);
    addResult('Dependencies', 'PASS');
  } else {
    log(`❌ Dependências ausentes: ${missingDeps.join(', ')}`, colors.red);
    addResult('Dependencies', 'FAIL', `Missing: ${missingDeps.join(', ')}`);
  }
} catch (error) {
  log('❌ Erro ao validar dependências', colors.red);
  addResult('Dependencies', 'FAIL', error.message);
}

// 6. VALIDAÇÃO PWA
log('\n📱 6. VALIDAÇÃO PWA', colors.blue);
const pwaFiles = [
  'src/manifest.webmanifest',
  'ngsw-config.json',
  'public/manifest.webmanifest'
];

let pwaValid = false;
pwaFiles.forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    pwaValid = true;
  }
});

if (pwaValid) {
  log('✅ Configuração PWA: OK', colors.green);
  addResult('PWA Configuration', 'PASS');
} else {
  log('❌ Configuração PWA: Arquivos ausentes', colors.red);
  addResult('PWA Configuration', 'FAIL', 'Missing PWA files');
}

// 7. TESTE DE SINTAXE DOS COMPONENTES
log('\n🔧 7. VALIDAÇÃO DE COMPONENTES', colors.blue);
const components = [
  'src/app/app.component.ts',
  'src/app/features/auth/login.component.ts',
  'src/app/features/feed/feed.component.ts',
  'src/app/features/admin/admin-dashboard.component.ts'
];

let validComponents = 0;
components.forEach(comp => {
  if (fs.existsSync(path.join(__dirname, comp))) {
    const content = fs.readFileSync(path.join(__dirname, comp), 'utf8');
    if (content.includes('@Component') && content.includes('export class')) {
      validComponents++;
    }
  }
});

if (validComponents === components.length) {
  log(`✅ Componentes: ${validComponents}/${components.length} OK`, colors.green);
  addResult('Components', 'PASS', `${validComponents}/${components.length} valid`);
} else {
  log(`❌ Componentes: ${validComponents}/${components.length}`, colors.red);
  addResult('Components', 'FAIL', `${components.length - validComponents} invalid`);
}

// RELATÓRIO FINAL
log('\n' + '='.repeat(60), colors.bold);
log('📊 RELATÓRIO FINAL DE TESTES', colors.bold);
log('='.repeat(60), colors.bold);

log(`\n📈 Estatísticas:`, colors.blue);
log(`   Total de testes: ${totalTests}`);
log(`   ✅ Aprovados: ${passedTests}`, colors.green);
log(`   ❌ Reprovados: ${failedTests}`, colors.red);
log(`   📊 Taxa de sucesso: ${Math.round((passedTests/totalTests)*100)}%`);

log(`\n🧪 Casos de teste encontrados: ${totalTestCases}`, colors.blue);

// Mostrar detalhes dos testes que falharam
if (failedTests > 0) {
  log(`\n❌ TESTES QUE FALHARAM:`, colors.red);
  results.filter(r => r.status === 'FAIL').forEach(result => {
    log(`   • ${result.test}: ${result.details}`, colors.red);
  });
}

// Status final
const successRate = Math.round((passedTests/totalTests)*100);
if (successRate >= 90) {
  log(`\n🎉 STATUS: EXCELENTE (${successRate}%)`, colors.green);
  log('✅ Aplicação pronta para produção!', colors.green);
} else if (successRate >= 70) {
  log(`\n⚠️  STATUS: BOM (${successRate}%)`, colors.yellow);
  log('🔧 Alguns ajustes necessários', colors.yellow);
} else {
  log(`\n🚨 STATUS: CRÍTICO (${successRate}%)`, colors.red);
  log('❌ Correções urgentes necessárias', colors.red);
}

log('\n💡 Para executar testes unitários no navegador:');
log('   npm run test:edge (se Edge configurado)');

log('\n🚀 Para testar manualmente:');
log('   npm start → http://localhost:4200');

process.exit(failedTests > 0 ? 1 : 0); 