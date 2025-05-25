
import React, { useEffect, useRef } from 'react';
import katex from 'katex';
// CSS is loaded globally from index.html via CDN link

interface KatexDisplayProps {
  latex: string;
  block?: boolean; // for display mode vs inline
  className?: string;
}

const KatexDisplay: React.FC<KatexDisplayProps> = ({ latex, block = false, className = "" }) => {
  // Fix: Use separate, correctly typed refs for div and span elements
  const divRef = useRef<HTMLDivElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const currentContainer = block ? divRef.current : spanRef.current;
    if (currentContainer) {
      // For debugging in a live environment, one could log:
      // console.log("KatexDisplay - document.compatMode:", document.compatMode);
      try {
        katex.render(latex, currentContainer, {
          throwOnError: false, // Don't halt page on KaTeX error, allow component to display an error
          displayMode: block,
          output: 'html', 
        });
      } catch (error) {
        console.error("KaTeX rendering error:", error, "for LaTeX string:", `"${latex}"`);
        // Display a user-friendly error message in the component itself
        if (currentContainer) { // Check ref again, just in case
          currentContainer.textContent = `Error rendering LaTeX: ${latex.substring(0,30)}... (See console for details)`;
        }
      }
    }
  }, [latex, block]); // className is part of the JSX element, not a direct dep for katex.render

  // The ref is of type HTMLElement, which is compatible with both HTMLDivElement and HTMLSpanElement
  if (block) {
    return <div ref={divRef} className={className} />;
  }
  return <span ref={spanRef} className={className} />;
};

export default KatexDisplay;