"use client";

import { useMemo } from "react";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const renderedContent = useMemo(() => {
    if (!content) return null;

    // Convert markdown to JSX elements
    const processMarkdown = (text: string) => {
      // Split text by line breaks to handle paragraphs
      const paragraphs = text.split('\n\n');
      
      return paragraphs.map((paragraph, index) => {
        // Process bold text (**text**)
        let processedParagraph = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Process italic text (*text* or _text_)
        processedParagraph = processedParagraph.replace(/\*(.*?)\*/g, '<em>$1</em>');
        processedParagraph = processedParagraph.replace(/_(.*?)_/g, '<em>$1</em>');
        
        // Process inline code (`code`)
        processedParagraph = processedParagraph.replace(/`(.*?)`/g, '<code>$1</code>');
        
        return (
          <p 
            key={index}
            dangerouslySetInnerHTML={{ __html: processedParagraph }}
            className="markdown-paragraph"
          />
        );
      });
    };

    return processMarkdown(content);
  }, [content]);

  return (
    <div className="markdown-content">
      {renderedContent}
    </div>
  );
}