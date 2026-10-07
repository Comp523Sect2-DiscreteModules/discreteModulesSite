import { useEffect, useRef } from 'react';

// Minimal Markdown-ish rendering: this base layer only needs to prove that
// LaTeX renders correctly (per spec 3.3), so it handles headings, bold,
// bullet lists and paragraphs with a light touch rather than pulling in a
// full Markdown library. Swap in `marked` or `react-markdown` once real
// lesson content from Prof. Lytle needs richer formatting.
function renderMarkdownish(md) {
  const lines = md.split('\n');
  const html = [];
  let inList = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.startsWith('### ')) {
      closeList();
      html.push(
        `<h3 class="text-lg font-serif font-semibold mt-6 mb-2">${inline(line.slice(4))}</h3>`,
      );
    } else if (line.startsWith('## ')) {
      closeList();
      html.push(
        `<h2 class="text-2xl font-serif font-semibold mt-8 mb-3">${inline(line.slice(3))}</h2>`,
      );
    } else if (line.startsWith('- ')) {
      if (!inList) {
        html.push('<ul class="list-disc pl-6 space-y-1 my-3">');
        inList = true;
      }
      html.push(`<li>${inline(line.slice(2))}</li>`);
    } else if (line === '') {
      closeList();
    } else {
      closeList();
      html.push(`<p class="my-3">${inline(line)}</p>`);
    }
  }
  closeList();

  function closeList() {
    if (inList) {
      html.push('</ul>');
      inList = false;
    }
  }

  function inline(text) {
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.+?)_/g, '<em>$1</em>');
  }

  return html.join('\n');
}

export default function MathContent({ markdown }) {
  const ref = useRef(null);

  useEffect(() => {
    if (window.MathJax?.typesetPromise) {
      window.MathJax.typesetPromise([ref.current]).catch((err) =>
        console.error('MathJax typeset error:', err),
      );
    }
  }, [markdown]);

  return (
    <div
      ref={ref}
      className="prose-lesson text-ink"
      dangerouslySetInnerHTML={{ __html: renderMarkdownish(markdown) }}
    />
  );
}
