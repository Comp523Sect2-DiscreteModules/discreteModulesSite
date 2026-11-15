import { describe, it, expect } from 'vitest';
import { normalizeQuizFormUrl } from '../src/quizFormUrl.js';

const FORM = 'https://docs.google.com/forms/d/e/1FAIpQLSabc123/viewform';

describe('normalizeQuizFormUrl', () => {
  // BU-01
  it.each([null, undefined, '', '   '])(
    'treats %j as "remove the quiz"',
    (input) => {
      expect(normalizeQuizFormUrl(input)).toEqual({ value: null });
    },
  );

  // BU-02
  it('rejects non-string input', () => {
    expect(normalizeQuizFormUrl(123)).toEqual({
      error: 'quiz_form_url must be a string.',
    });
  });

  // BU-03
  it('accepts a published form link and adds embedded=true', () => {
    expect(normalizeQuizFormUrl(FORM)).toEqual({
      value: `${FORM}?embedded=true`,
    });
  });

  // BU-04
  it('extracts the URL from a pasted <iframe> snippet and decodes &amp;', () => {
    const snippet = `<iframe src="${FORM}?embedded=true&amp;usp=sf_link" width="640" height="800"></iframe>`;
    const result = normalizeQuizFormUrl(snippet);

    expect(result.error).toBeUndefined();
    const url = new URL(result.value);
    expect(url.origin + url.pathname).toBe(FORM);
    expect(url.searchParams.get('embedded')).toBe('true');
    expect(url.searchParams.get('usp')).toBe('sf_link');
    expect(result.value).not.toContain('&amp;');
  });

  // BU-05
  it.each([
    'https://evil.com/forms/d/e/ABC/viewform',
    'https://docs.google.com.evil.com/forms/d/e/ABC/viewform',
    'http://docs.google.com/forms/d/e/ABC/viewform',
    'https://docs.google.com:8080/forms/d/e/ABC/viewform',
    'javascript:alert(1)',
  ])('rejects %s as not a Google Form', (input) => {
    const result = normalizeQuizFormUrl(input);

    expect(result.value).toBeUndefined();
    expect(result.error).toMatch(
      /^The quiz must be a Google Form \(docs\.google\.com\)\./,
    );
  });

  // BU-06
  it('rejects the form editor link', () => {
    const result = normalizeQuizFormUrl(
      'https://docs.google.com/forms/d/ABC/edit',
    );

    expect(result.error).toMatch(/^That isn't a shareable Google Form link\./);
  });
});
