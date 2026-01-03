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

import { urlTransform } from '../lib/url-transform';
import CopyButton from './CopyButton';
import type { Element, Root } from 'hast';
import type { Plugin } from 'unified';

import { visit } from 'unist-util-visit';

interface PreviewProps {
  content: string;
  basePath?: string;
  onTaskToggle?: (lineIndex: number, checked: boolean) => void;
}

// Rehype plugin to inject line numbers into task list checkboxes
const rehypeInjectLineNumber: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'element', (node: Element) => {
      // Look for list items
      if (node.tagName === 'li' && node.position) {
        // Check if it has a checkbox input as direct child (GFM structure)
        const checkbox = node.children.find((child) =>
          child.type === 'element' &&
          child.tagName === 'input' &&
          child.properties?.type === 'checkbox'
        ) as Element | undefined;

        if (checkbox && checkbox.properties) {
            // Inject the line number into the checkbox properties
            checkbox.properties.dataLine = node.position.start.line;
        }
      }
    });
  };
};

const Preview: React.FC<PreviewProps> = ({ content, basePath, onTaskToggle }) => {
  return (
    <div className="prose prose-invert max-w-none p-6">
      <Markdown
        urlTransform={(url) => urlTransform(url, basePath)}
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
                    if (onTaskToggle && typeof startLine === 'number') {
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

            return !inline && match ? (
              <div className="relative group">
                <CopyButton text={codeString} />
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
