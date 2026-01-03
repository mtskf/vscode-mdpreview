import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from '../App';
import { mockVsCodePostMessage } from './setup';

// Mock CSS imports
vi.mock('katex/dist/katex.min.css', () => ({}));
vi.mock('remark-github-blockquote-alert/alert.css', () => ({}));
vi.mock('../index.css', () => ({}));

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
  default: (props: any) => {
    return (
      <textarea
        data-testid="mock-editor"
        value={props.value}
        onChange={(e) => {
          if (props.onChange) {
            props.onChange(e.target.value);
          }
        }}
      />
    );
  },
}));

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVsCodePostMessage.mockClear();
  });

  describe('Initial State', () => {
    it('renders in preview mode by default', () => {
      render(<App />);
      expect(screen.getByText('Markdown Preview')).toBeInTheDocument();
    });

    it('shows toggle switch', () => {
      render(<App />);
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('shows Preview and Edit labels', () => {
      render(<App />);
      expect(screen.getByText('Preview')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });
  });

  describe('Mode Toggle', () => {
    it('toggles to edit mode when switch is clicked', () => {
      render(<App />);
      const toggle = screen.getByRole('switch');
      fireEvent.click(toggle);
      expect(screen.getByTestId('mock-editor')).toBeInTheDocument();
    });

    it('toggles back to preview mode', () => {
      render(<App />);
      const toggle = screen.getByRole('switch');

      // Toggle to edit
      fireEvent.click(toggle);
      expect(screen.getByTestId('mock-editor')).toBeInTheDocument();

      // Toggle back to preview
      fireEvent.click(toggle);
      expect(screen.queryByTestId('mock-editor')).not.toBeInTheDocument();
    });
  });

  describe('Message Handling', () => {
    it('updates content when receiving update message', async () => {
      render(<App />);

      const event = new MessageEvent('message', {
        data: { type: 'update', text: '# Test Content' },
      });

      await act(async () => {
        window.dispatchEvent(event);
      });

      // Use specific name to distinguish from App header
      expect(screen.getByRole('heading', { level: 1, name: 'Test Content' })).toBeInTheDocument();
    });

    it('toggles mode when receiving toggle message', async () => {
      render(<App />);
      const updateEvent = new MessageEvent('message', {
        data: { type: 'update', text: 'Test' },
      });
      await act(async () => {
        window.dispatchEvent(updateEvent);
      });

      const toggleEvent = new MessageEvent('message', {
        data: { type: 'toggle' },
      });
      await act(async () => {
        window.dispatchEvent(toggleEvent);
      });

      expect(screen.getByTestId('mock-editor')).toBeInTheDocument();
    });

    it('updates basePath from update message', async () => {
      render(<App />);

      const event = new MessageEvent('message', {
        data: {
          type: 'update',
          text: '![img](./local.png)',
          base: 'vscode-webview://test-base'
        },
      });

      await act(async () => {
        window.dispatchEvent(event);
      });

      const img = screen.getByAltText('img');
      expect(img).toHaveAttribute('src', 'vscode-webview://test-base/local.png');
    });

    it('renders TOC when content has headings', async () => {
      render(<App />);

      const event = new MessageEvent('message', {
        data: { type: 'update', text: '# Heading 1\n## Heading 2' },
      });

      await act(async () => {
        window.dispatchEvent(event);
      });

      // Check TOC items
      expect(screen.getByRole('button', { name: 'Heading 1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Heading 2' })).toBeInTheDocument();
    });

    it('handles TOC navigation', async () => {
      // Mock scrollIntoView
      const scrollIntoView = vi.fn();
      window.HTMLElement.prototype.scrollIntoView = scrollIntoView;

      render(<App />);
      const event = new MessageEvent('message', {
        data: { type: 'update', text: '# Heading 1' },
      });
      await act(async () => {
        window.dispatchEvent(event);
      });

      const tocItem = screen.getByRole('button', { name: 'Heading 1' });
      fireEvent.click(tocItem);

      expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    });

    it('handles task list toggling and updates content', async () => {
      render(<App />);
      // Initial content with unchecked task
      const event = new MessageEvent('message', {
        data: { type: 'update', text: '- [ ] Task 1' },
      });
      await act(async () => {
        window.dispatchEvent(event);
      });

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(mockVsCodePostMessage).toHaveBeenCalledWith({
        type: 'update',
        text: '- [x] Task 1',
      });
    });
  });

  describe('Content Editing', () => {
    it('posts message when content changes in editor', async () => {
      render(<App />);
      const toggle = screen.getByRole('switch');
      await act(async () => {
        fireEvent.click(toggle);
      });

      const editor = screen.getByTestId('mock-editor');
      await act(async () => {
        fireEvent.change(editor, { target: { value: 'New content' } });
      });

      expect(mockVsCodePostMessage).toHaveBeenCalledWith({
        type: 'update',
        text: 'New content',
      });
    });
  });
});
