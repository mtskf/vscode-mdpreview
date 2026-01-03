import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';

// Mock CSS imports used by App/Preview
vi.mock('katex/dist/katex.min.css', () => ({}));
vi.mock('remark-github-blockquote-alert/alert.css', () => ({}));
vi.mock('../index.css', () => ({}));

describe('App acquireVsCodeApi fallback', () => {
  it('defines acquireVsCodeApi when missing', async () => {
    const original = window.acquireVsCodeApi;
    // @ts-expect-error Test cleanup
    delete window.acquireVsCodeApi;

    vi.resetModules();
    const { default: App } = await import('../App');

    render(<App />);

    expect(typeof window.acquireVsCodeApi).toBe('function');
    expect(() => window.acquireVsCodeApi().postMessage({ type: 'toggle' })).not.toThrow();

    if (original) {
      window.acquireVsCodeApi = original;
    } else {
      // @ts-expect-error Restore to undefined
      delete window.acquireVsCodeApi;
    }
  });
});
