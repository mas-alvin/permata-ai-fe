import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from './CodeBlock';

export default function MarkdownRenderer({ content = '' }) {
  if (!content) return null;

  const components = {
    code: ({ children, className = '', ...props }) => {
      const rawString = Array.isArray(children)
        ? children.join('')
        : String(children || '');

      // Check if this is an inline code (single line, no language tag)
      const languageMatch = className.match(/language-(\w+)/);
      const isInline = !languageMatch && !rawString.includes('\n');

      if (isInline) {
        return (
          <code
            className="bg-surface-container-high text-primary dark:text-primary-fixed font-mono text-xs px-1.5 py-0.5 rounded border border-outline/10"
            {...props}
          >
            {children}
          </code>
        );
      }

      const language = languageMatch ? languageMatch[1] : '';
      const value = rawString.replace(/\n$/, '');

      return <CodeBlock language={language} value={value} />;
    },
    pre: ({ children }) => {
      // Prevent wrapping CodeBlock component inside an extra <pre> tag
      return <>{children}</>;
    },
  };

  return (
    <div className="prose prose-sm max-w-none text-on-surface dark:prose-invert">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
