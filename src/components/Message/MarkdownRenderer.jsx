import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MarkdownRenderer({ content }) {
  // Strip bold syntax (**) but keep other markdown formatting
  const sanitizedContent = content.replace(/\*\*(.*?)\*\*/g, '$1');

  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {sanitizedContent}
      </ReactMarkdown>
    </div>
  );
}
