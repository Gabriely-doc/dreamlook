// Test setup file para configurações globais

import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// Configurar ambiente de teste
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

// Mock global objects para PWA
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock localStorage
const mockLocalStorage = {
  getItem: jasmine.createSpy('getItem'),
  setItem: jasmine.createSpy('setItem'),
  removeItem: jasmine.createSpy('removeItem'),
  clear: jasmine.createSpy('clear'),
  key: jasmine.createSpy('key'),
  length: 0
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

// Mock performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: () => Date.now(),
    mark: () => {},
    measure: () => {},
    getEntriesByName: () => [],
    getEntriesByType: () => []
  },
  writable: true
});

// Mock IntersectionObserver
Object.defineProperty(window, 'IntersectionObserver', {
  value: class MockIntersectionObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  },
  writable: true
});

// Mock ResizeObserver
Object.defineProperty(window, 'ResizeObserver', {
  value: class MockResizeObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  },
  writable: true
});

// Configurar console para testes
const originalConsole = console;
beforeEach(() => {
  spyOn(console, 'log').and.callThrough();
  spyOn(console, 'warn').and.callThrough();
  spyOn(console, 'error').and.callThrough();
});

// Limpar mocks após cada teste
afterEach(() => {
  jasmine.clock().uninstall();
  mockLocalStorage.getItem.calls.reset();
  mockLocalStorage.setItem.calls.reset();
  mockLocalStorage.removeItem.calls.reset();
  mockLocalStorage.clear.calls.reset();
}); 