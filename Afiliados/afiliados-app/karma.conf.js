// Karma configuration file
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-edge-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma')
    ],
    client: {
      jasmine: {
        // Configurações do Jasmine
        random: true,
        seed: '4321',
        stopOnSpecFailure: false
      },
      clearContext: false // deixa os resultados dos testes visíveis no navegador
    },
    jasmineHtmlReporter: {
      suppressAll: true // remove traces duplicadas
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/afiliados-app'),
      subdir: '.',
      reporters: [
        { type: 'html' },
        { type: 'text-summary' },
        { type: 'lcov' }
      ],
      check: {
        global: {
          statements: 80,
          branches: 70,
          functions: 80,
          lines: 80
        }
      }
    },
    reporters: ['progress', 'kjhtml', 'coverage'],
    browsers: ['EdgeHeadless'],
    customLaunchers: {
      EdgeHeadless: {
        base: 'Edge',
        flags: ['--headless', '--no-sandbox', '--disable-gpu', '--disable-web-security']
      },
      EdgeHeadlessCI: {
        base: 'Edge',
        flags: ['--headless', '--no-sandbox', '--disable-gpu', '--disable-web-security']
      }
    },
    restartOnFileChange: true,
    singleRun: false,
    autoWatch: true,
    logLevel: config.LOG_INFO,
    
    // Configurações específicas para PWA testing
    files: [
      'src/test-setup.ts'
    ],
    
    // Timeout para testes assíncronos
    browserDisconnectTimeout: 10000,
    browserDisconnectTolerance: 3,
    browserNoActivityTimeout: 60000,
    captureTimeout: 60000,
    
    // Configurações de memória
    browserSocketTimeout: 20000,
    
    // Configurações para CI
    ...(process.env.CI && {
      singleRun: true,
      browsers: ['EdgeHeadlessCI'],
      autoWatch: false
    })
  });
}; 