import React, { useMemo } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TocProps {
  content: string;
  onNavigate?: (id: string) => void;
}

// Extract headings from markdown content
function extractHeadings(markdown: string): TocItem[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    // Generate id from text (simple slug)
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    headings.push({ id, text, level });
  }

  return headings;
}

const Toc: React.FC<TocProps> = ({ content, onNavigate }) => {
  const headings = useMemo(() => extractHeadings(content), [content]);

  if (headings.length === 0) {
    return null;
  }

  const minLevel = Math.min(...headings.map(h => h.level));

  return (
    <nav className="toc p-4 border-l border-border">
      <h2 className="text-sm font-semibold mb-3 text-muted-foreground">Table of Contents</h2>
      <ul className="space-y-1 text-sm">
        {headings.map((heading, index) => (
          <li
            key={`${heading.id}-${index}`}
            style={{ paddingLeft: `${(heading.level - minLevel) * 12}px` }}
          >
            <button
              onClick={() => onNavigate?.(heading.id)}
              className="text-left text-muted-foreground hover:text-foreground transition-colors truncate w-full"
              title={heading.text}
            >
              {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Toc;
