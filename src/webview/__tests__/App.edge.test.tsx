import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import React, { useEffect } from 'react';
import App from '../App';

// Mock VS Code API
const mockVsCodePostMessage = vi.fn();
Object.defineProperty(window, 'acquireVsCodeApi', {
  value: () => ({
    postMessage: mockVsCodePostMessage,
  }),
  writable: true,
});

// Mock dependencies
vi.mock('../components/Editor', () => ({
  default: () => <div data-testid="mock-editor" />,
}));
vi.mock('../components/Toc', () => ({
  default: () => <div data-testid="mock-toc" />,
}));
vi.mock('../components/Preview', () => ({
  default: ({ onTaskToggle }: { onTaskToggle: (index: number, checked: boolean) => void }) => {
    // Expose a way to trigger toggle with invalid index
    return (
      <div data-testid="mock-preview">
        <button
          data-testid="trigger-invalid-toggle"
          onClick={() => onTaskToggle(-1, true)}
        >
          Invalid Toggle
        </button>
        <button
            data-testid="trigger-valid-toggle"
            onClick={() => onTaskToggle(0, true)}
        >
            Valid Toggle
        </button>
      </div>
    );
  },
}));

describe('App Edge Cases', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('ignores invalid line index for task toggle', async () => {
        // Setup initial content
        render(<App />);

        // Send update to set "lines" content
        await act(async () => {
            window.dispatchEvent(new MessageEvent('message', {
                data: { type: 'update', text: '- [ ] Task 1' },
            }));
            // Advance timers for debounce
             vi.advanceTimersByTime(300);
        });

        // Clear any previous calls (like the initial update)
        mockVsCodePostMessage.mockClear();

        // Trigger invalid toggle (-1)
        const invalidBtn = document.querySelector('[data-testid="trigger-invalid-toggle"]');
        expect(invalidBtn).not.toBeNull();

        await act(async () => {
            invalidBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
             // Wait for potential debounce (if it were to happen)
             vi.advanceTimersByTime(1000);
        });

        // Assert no message was sent
        expect(mockVsCodePostMessage).not.toHaveBeenCalled();
    });
});
