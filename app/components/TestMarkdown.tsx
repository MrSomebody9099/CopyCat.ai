"use client";

import MarkdownRenderer from "./MarkdownRenderer";

export default function TestMarkdown() {
  const testContent = `
This is a **bold** text and this is *italic* text.

Here's some \`inline code\` and **bold with *nested italic***.

A paragraph with just plain text.

Another paragraph with **more bold** and *more italic* text.
`;

  return (
    <div style={{ padding: '20px', backgroundColor: '#1a1a1a', color: '#ffffff' }}>
      <h2>Markdown Test</h2>
      <MarkdownRenderer content={testContent} />
    </div>
  );
}