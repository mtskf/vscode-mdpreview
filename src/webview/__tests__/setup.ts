import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

// Global mock for postMessage that can be spied on
export const mockVsCodePostMessage = vi.fn();

// Mock VS Code API
Object.defineProperty(window, 'acquireVsCodeApi', {
  value: () => ({
    postMessage: mockVsCodePostMessage,
    getState: vi.fn(),
    setState: vi.fn(),
  }),
  configurable: true,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
