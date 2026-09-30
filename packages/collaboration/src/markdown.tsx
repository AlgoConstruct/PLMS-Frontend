"use client";

import ReactMarkdown from "react-markdown";

/** Markdown without raw HTML (react-markdown escapes HTML by default); links open in a new tab. */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="text-sm break-words [&_a]:text-primary [&_a]:underline [&_p]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-muted [&_pre]:p-2">
      <ReactMarkdown components={{ a: ({ href, children: c }) => <a href={href} target="_blank" rel="noreferrer noopener">{c}</a> }}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
