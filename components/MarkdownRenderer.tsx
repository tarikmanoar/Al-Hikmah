import React from 'react';
import ReactMarkdown from 'react-markdown';

interface Props {
  content: string;
}

const MarkdownRenderer: React.FC<Props> = ({ content }) => {
  return (
    <div className="prose prose-stone font-body prose-headings:font-serif prose-headings:text-emerald-950 prose-a:text-amber-600 prose-a:no-underline prose-a:font-bold hover:prose-a:text-amber-500 prose-strong:text-emerald-900 max-w-none">
      <ReactMarkdown
        components={{
            blockquote: ({node, ...props}) => (
                <blockquote className="border-l-0 bg-amber-50/80 p-6 rounded-3xl italic text-stone-700 my-6 shadow-sm relative overflow-hidden" {...props}>
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-300"></div>
                    {props.children}
                </blockquote>
            ),
            h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-6 mb-4 text-emerald-950" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-8 mb-4 text-emerald-800 border-b border-emerald-100 pb-2" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-6 mb-3 text-emerald-700" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc list-outside ml-6 my-4 space-y-2 marker:text-amber-400" {...props} />,
            li: ({node, ...props}) => <li className="pl-1" {...props} />,
            p: ({node, ...props}) => <p className="leading-relaxed mb-4 text-stone-600" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;