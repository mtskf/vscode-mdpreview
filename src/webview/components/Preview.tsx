import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkWikiLink from 'remark-wiki-link';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import 'katex/dist/katex.min.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

import remarkGithubBlockquoteAlert from 'remark-github-blockquote-alert';
import remarkBreaks from 'remark-breaks';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGemoji from 'remark-gemoji';
import remarkSupersub from 'remark-supersub';
import remarkMark from 'remark-mark';
import 'remark-github-blockquote-alert/alert.css';

interface PreviewProps {
  content: string;
  basePath?: string;
  onTaskToggle?: (lineIndex: number, checked: boolean) => void;
}

const Preview: React.FC<PreviewProps> = ({ content, basePath, onTaskToggle }) => {
  const urlTransform = (url: string) => {
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    if (url.startsWith('/')) {
        // If absolute path, might need specific handling or assume relative to workspace root?
        // For now, let's treat it as relative or just leave it.
        // VS Code webview absolute paths usually behave weirdly without mapping.
        return url;
    }
    // Relative path
    if (basePath) {
        // Ensure basePath ends with /
        const base = basePath.endsWith('/') ? basePath : `${basePath}/`;
        return `${base}${url}`;
    }
    return url;
  };

  return (
    <div className="prose prose-invert max-w-none p-6">
      <Markdown
        urlTransform={urlTransform}
        remarkPlugins={[
          remarkGfm,
          remarkWikiLink,
          remarkGithubBlockquoteAlert,
          remarkBreaks,
          remarkFrontmatter,
          remarkGemoji,
          remarkSupersub,
          // remarkMark removed - incompatible with current react-markdown
        ]}
        rehypePlugins={[rehypeKatex, rehypeSlug]}
        components={{
          input({node, type, checked, ...props}: any) {
            if (type === 'checkbox') {
              // Find the position in the original content
              const position = node?.position;
              return (
                <input
                  {...props}
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    if (onTaskToggle && position?.start?.line) {
                      onTaskToggle(position.start.line - 1, e.target.checked);
                    }
                  }}
                  className="cursor-pointer"
                />
              );
            }
            return <input {...props} type={type} checked={checked} />;
          },
          code({node, inline, className, children, ...props}: any) {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');

            const handleCopy = () => {
              navigator.clipboard.writeText(codeString);
            };

            return !inline && match ? (
              <div className="relative group">
                <button
                  onClick={handleCopy}
                  className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded text-xs"
                  title="Copy code"
                >
                  Copy
                </button>
                <SyntaxHighlighter
                  {...props}
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                >
                  {codeString}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code {...props} className={className}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </Markdown>
    </div>
  );
};

export default Preview;
