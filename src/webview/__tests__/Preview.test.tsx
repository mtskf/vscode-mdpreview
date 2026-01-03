import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Preview from '../components/Preview';

// Mock CSS imports
vi.mock('katex/dist/katex.min.css', () => ({}));
vi.mock('remark-github-blockquote-alert/alert.css', () => ({}));

describe('Preview Component', () => {
  describe('Basic Rendering', () => {
    it('renders markdown content', () => {
      render(<Preview content="# Hello World" />);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Hello World');
    });

    it('renders paragraphs', () => {
      render(<Preview content="This is a paragraph." />);
      expect(screen.getByText('This is a paragraph.')).toBeInTheDocument();
    });

    it('renders bold text', () => {
      render(<Preview content="This is **bold** text." />);
      expect(screen.getByText('bold')).toBeInTheDocument();
    });

    it('renders italic text', () => {
      render(<Preview content="This is *italic* text." />);
      expect(screen.getByText('italic')).toBeInTheDocument();
    });
  });

  describe('GFM Features', () => {
    it('renders tables', () => {
      const tableMarkdown = `
| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |
`;
      render(<Preview content={tableMarkdown} />);
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('Header 1')).toBeInTheDocument();
      expect(screen.getByText('Cell 1')).toBeInTheDocument();
    });

    it('renders strikethrough', () => {
      render(<Preview content="~~deleted~~" />);
      const strikeElement = screen.getByText('deleted');
      expect(strikeElement.tagName.toLowerCase()).toBe('del');
    });

    it('renders task lists', () => {
      const taskList = `
- [x] Completed task
- [ ] Incomplete task
`;
      render(<Preview content={taskList} />);
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(2);
      expect(checkboxes[0]).toBeChecked();
      expect(checkboxes[1]).not.toBeChecked();
    });

    it('renders autolinks', () => {
      render(<Preview content="Visit https://example.com for more info." />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://example.com');
    });
  });

  describe('Code Blocks', () => {
    it('renders inline code', () => {
      render(<Preview content="Use `console.log()` for debugging." />);
      expect(screen.getByText('console.log()')).toBeInTheDocument();
    });

    it('renders code blocks with syntax highlighting', () => {
      const codeBlock = `
\`\`\`javascript
const x = 1;
\`\`\`
`;
      render(<Preview content={codeBlock} />);
      expect(screen.getByText('const')).toBeInTheDocument();
    });
  });

  describe('Blockquotes', () => {
    it('renders standard blockquotes', () => {
      render(<Preview content="> This is a quote" />);
      expect(screen.getByText('This is a quote')).toBeInTheDocument();
    });
  });

  describe('Lists', () => {
    it('renders unordered lists', () => {
      const list = `
- Item 1
- Item 2
- Item 3
`;
      render(<Preview content={list} />);
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });

    it('renders ordered lists', () => {
      const list = `
1. First
2. Second
3. Third
`;
      render(<Preview content={list} />);
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });
  });

  describe('Images', () => {
    it('renders remote images', () => {
      render(<Preview content="![Alt text](https://example.com/image.png)" />);
      const img = screen.getByAltText('Alt text');
      expect(img).toHaveAttribute('src', 'https://example.com/image.png');
    });

    it('resolves relative image paths with basePath', () => {
      render(<Preview content="![Local](./image.png)" basePath="vscode-webview://test" />);
      const img = screen.getByAltText('Local');
      expect(img).toHaveAttribute('src', 'vscode-webview://test/./image.png');
    });

    it('does not modify absolute URLs', () => {
      render(<Preview content="![Abs](https://cdn.example.com/img.jpg)" basePath="/base" />);
      const img = screen.getByAltText('Abs');
      expect(img).toHaveAttribute('src', 'https://cdn.example.com/img.jpg');
    });
  });

  describe('Links', () => {
    it('renders external links', () => {
      render(<Preview content="[Click here](https://example.com)" />);
      const link = screen.getByRole('link', { name: 'Click here' });
      expect(link).toHaveAttribute('href', 'https://example.com');
    });
  });
});
