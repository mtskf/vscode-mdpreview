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
import 'remark-github-blockquote-alert/alert.css';

import { visit } from 'unist-util-visit';

interface PreviewProps {
  content: string;
  basePath?: string;
  onTaskToggle?: (lineIndex: number, checked: boolean) => void;
}

// Rehype plugin to inject line numbers into task list checkboxes
const rehypeInjectLineNumber = () => {
  return (tree: any) => {
    visit(tree, 'element', (node: any) => {
      // Look for list items
      if (node.tagName === 'li' && node.position) {
        // Check if it has a checkbox input as direct child (GFM structure)
        const checkbox = node.children.find((child: any) =>
          child.tagName === 'input' && child.properties?.type === 'checkbox'
        );

        if (checkbox) {
            // Inject the line number into the checkbox properties
            checkbox.properties.dataLine = node.position.start.line;
        }
      }
    });
  };
};

const Preview: React.FC<PreviewProps> = ({ content, basePath, onTaskToggle }) => {
  const urlTransform = (url: string) => {
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    if (url.startsWith('/')) {
        return url;
    }
    // Relative path resolution
    if (basePath) {
      try {
        const base = basePath.endsWith('/') ? basePath : `${basePath}/`;
        return new URL(url, base).toString();
      } catch (e) {
        console.warn('Failed to resolve relative URL:', url, e);
        return url;
      }
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
        ]}
        rehypePlugins={[rehypeKatex, rehypeSlug, rehypeInjectLineNumber]}
        components={{
          input({node, type, checked, ...props}: any) {
            if (type === 'checkbox') {
              // Retrieve injected line number
              const startLine = node?.properties?.dataLine;
              return (
                <input
                  {...props}
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    if (onTaskToggle && startLine) {
                      onTaskToggle(startLine - 1, e.target.checked);
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

            const handleCopy = async () => {
              try {
                await navigator.clipboard.writeText(codeString);
              } catch (err) {
                // Fallback for older browsers or permission issues
                const textArea = document.createElement('textarea');
                textArea.value = codeString;
                textArea.style.position = 'fixed';
                textArea.style.left = '-9999px';
                document.body.appendChild(textArea);
                textArea.select();
                try {
                  document.execCommand('copy');
                } catch (e) {
                  console.error('Copy failed:', e);
                }
                document.body.removeChild(textArea);
              }
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
