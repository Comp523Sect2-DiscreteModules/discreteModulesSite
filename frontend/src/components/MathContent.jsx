import { useEffect, useRef } from 'react';

// Minimal Markdown-ish rendering: this base layer only needs to prove that
// LaTeX renders correctly (per spec 3.3), so it handles headings, bold,
// bullet lists and paragraphs with a light touch rather than pulling in a
// full Markdown library. Swap in `marked` or `react-markdown` once real
// lesson content from Prof. Lytle needs richer formatting.
//
// Styling lives in index.css under .prose-lesson. Lesson "## " renders as h3
// and "### " as h4 so they sit below the lesson title (h2) in the hierarchy.
// Headings get ids so the lecture outline can link to them.

export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Returns [{ level: 1 | 2, text, id }] for "## " and "### " lines.
export function extractHeadings(md = '', idPrefix = '') {
  return md
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('## ') || l.startsWith('### '))
    .map((l) => {
      const level = l.startsWith('### ') ? 2 : 1;
      const text = l.slice(level === 2 ? 4 : 3);
      return { level, text: stripInline(text), id: idPrefix + slugify(text) };
    });
}

function stripInline(text) {
  return text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/_(.+?)_/g, '$1');
}

function renderMarkdownish(md, idPrefix) {
  const lines = md.split('\n');
  const html = [];
  let inList = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.startsWith('### ')) {
      closeList();
      const text = line.slice(4);
      html.push(`<h4 id="${idPrefix}${slugify(text)}">${inline(text)}</h4>`);
    } else if (line.startsWith('## ')) {
      closeList();
      const text = line.slice(3);
      html.push(`<h3 id="${idPrefix}${slugify(text)}">${inline(text)}</h3>`);
    } else if (line.startsWith('- ')) {
      if (!inList) {
        html.push('<ul>');
        inList = true;
      }
      html.push(`<li>${inline(line.slice(2))}</li>`);
    } else if (line === '') {
      closeList();
    } else {
      closeList();
      html.push(`<p>${inline(line)}</p>`);
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

export default function MathContent({
  markdown,
  idPrefix = '',
  size = 'base',
}) {
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
      className={`prose-lesson ${size === 'sm' ? 'prose-lesson-sm' : ''}`}
      dangerouslySetInnerHTML={{
        __html: renderMarkdownish(markdown ?? '', idPrefix),
      }}
    />
  );
}
