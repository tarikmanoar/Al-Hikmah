import React from 'react';
import ReactMarkdown from 'react-markdown';

interface Props {
  content: string;
}

const MarkdownRenderer: React.FC<Props> = ({ content }) => {
  return (
    <div className="prose prose-stone dark:prose-invert font-body prose-headings:font-serif prose-headings:text-emerald-950 dark:prose-headings:text-emerald-100 prose-a:text-amber-600 dark:prose-a:text-amber-400 prose-a:no-underline prose-a:font-bold hover:prose-a:text-amber-500 dark:hover:prose-a:text-amber-300 prose-strong:text-emerald-900 dark:prose-strong:text-emerald-200 max-w-none">
      <ReactMarkdown
        components={{
            blockquote: ({node, ...props}) => (
                <blockquote className="border-l-0 bg-amber-50/80 dark:bg-amber-900/20 p-6 rounded-3xl italic text-stone-700 dark:text-stone-300 my-6 shadow-sm relative overflow-hidden" {...props}>
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-300 dark:bg-amber-600"></div>
                    {props.children}
                </blockquote>
            ),
            h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-6 mb-4 text-emerald-950 dark:text-emerald-50" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-8 mb-4 text-emerald-800 dark:text-emerald-200 border-b border-emerald-100 dark:border-emerald-800 pb-2" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-6 mb-3 text-emerald-700 dark:text-emerald-300" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc list-outside ml-6 my-4 space-y-2 marker:text-amber-400 dark:marker:text-amber-600" {...props} />,
            li: ({node, ...props}) => <li className="pl-1" {...props} />,
            p: ({node, ...props}) => <p className="leading-relaxed mb-4 text-stone-600 dark:text-stone-300" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;