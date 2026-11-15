import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import MathContent, { slugify, extractHeadings } from './MathContent.jsx';

describe('slugify and extractHeadings', () => {
  // FU-03
  it('turns heading text into a URL-safe id', () => {
    expect(slugify('Logical Connectives!')).toBe('logical-connectives');
  });

  it('lists "##" and "###" headings with their level and a prefixed id', () => {
    const md = '## Truth Tables\nsome text\n### De Morgan **Laws**';

    expect(extractHeadings(md, 'l1-')).toEqual([
      { level: 1, text: 'Truth Tables', id: 'l1-truth-tables' },
      { level: 2, text: 'De Morgan Laws', id: 'l1-de-morgan-laws' },
    ]);
  });
});

describe('MathContent', () => {
  // FU-03
  it('renders headings, lists, bold, italic and paragraphs', () => {
    const md = [
      '## Section',
      '### Subsection',
      '- first',
      '- second',
      '',
      'Plain **bold** and _italic_ text.',
    ].join('\n');

    const { container } = render(<MathContent markdown={md} idPrefix="x-" />);

    expect(container.querySelector('h3')).toHaveTextContent('Section');
    expect(container.querySelector('h3')).toHaveAttribute('id', 'x-section');
    expect(container.querySelector('h4')).toHaveTextContent('Subsection');
    expect(container.querySelectorAll('ul > li')).toHaveLength(2);
    expect(container.querySelector('p strong')).toHaveTextContent('bold');
    expect(container.querySelector('p em')).toHaveTextContent('italic');
  });

  it('leaves LaTeX delimiters in the text for MathJax to typeset', () => {
    const { container } = render(
      <MathContent markdown={'Let $p \\land q$.'} />,
    );

    expect(container).toHaveTextContent('Let $p \\land q$.');
  });
});
