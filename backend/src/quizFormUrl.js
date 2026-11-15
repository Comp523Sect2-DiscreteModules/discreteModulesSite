// Validation for a module's practice-quiz link.
//
// Two kinds of link are accepted:
//   * A Google Form. It is rendered as an <iframe src> on the student quiz
//     page, so it must never be an arbitrary URL: only published form links
//     pass, and they are rewritten into one canonical embeddable shape.
//   * Any other http(s) site. It is never embedded; students just get a link
//     that opens it in a new tab, so it is stored as given.

const MAX_LENGTH = 2048;

// Published form links look like
//   https://docs.google.com/forms/d/e/<FORM_ID>/viewform?embedded=true
// (older Workspace links can have an /a/<domain> prefix or a /u/<n> segment).
// The editor link (/forms/d/<ID>/edit) deliberately does NOT match: students
// can't open it.
const PUBLISHED_FORM_PATH =
  /^\/(?:a\/[^/]+\/)?forms\/(?:u\/\d+\/)?d\/e\/[A-Za-z0-9_-]+\/viewform\/?$/;

// Anything under docs.google.com/forms is treated as a Google Form (and so must
// be a shareable one). Everything else is an ordinary external link.
const GOOGLE_FORMS_PATH = /^\/(?:a\/[^/]+\/)?forms\//;

const FORMAT_HELP =
  'In Google Forms choose Send, click the < > (embed) tab, and paste the ' +
  'embed code or the URL inside it.';

/**
 * Turns whatever an admin pasted into a clean embed URL.
 *
 * Accepts a plain URL or the full <iframe ...> snippet from Google's
 * Send > Embed tab. Google Forms are normalized for embedding; any other
 * http(s) link is kept as is. An empty value means "remove the quiz".
 *
 * @param {unknown} input
 * @returns {{ value: string | null } | { error: string }}
 */
export function normalizeQuizFormUrl(input) {
  if (input === null || input === undefined) return { value: null };
  if (typeof input !== 'string') {
    return { error: 'quiz_form_url must be a string.' };
  }

  let raw = input.trim();
  if (raw === '') return { value: null };
  if (raw.length > MAX_LENGTH) {
    return { error: 'That quiz link is too long.' };
  }

  // Pasted embed code: pull the URL out of src="...". Google writes
  // ampersands as &amp; inside the attribute.
  if (raw.startsWith('<')) {
    const match = raw.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
    if (!match) {
      return {
        error: `Couldn't find a link in that embed code. ${FORMAT_HELP}`,
      };
    }
    raw = match[1].replace(/&amp;/gi, '&').trim();
  }

  let url;
  try {
    url = new URL(raw);
  } catch {
    return {
      error:
        "That doesn't look like a valid link. Paste a full URL starting with " +
        'https://, or the embed code from Google Forms.',
    };
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return { error: 'The quiz link must start with https:// or http://.' };
  }

  // Not a Google Form: a plain link to wherever the quiz lives.
  if (
    url.hostname !== 'docs.google.com' ||
    !GOOGLE_FORMS_PATH.test(url.pathname)
  ) {
    url.username = '';
    url.password = '';
    return { value: url.toString() };
  }

  if (url.protocol !== 'https:' || url.port !== '') {
    return {
      error: `Google Forms must use a plain https://docs.google.com link. ${FORMAT_HELP}`,
    };
  }

  if (!PUBLISHED_FORM_PATH.test(url.pathname)) {
    return {
      error:
        "That isn't a shareable Google Form link. Editor links (ending in " +
        `/edit) won't work for students. ${FORMAT_HELP}`,
    };
  }

  // Canonical embeddable form: no fragment, no credentials, embedded=true.
  url.hash = '';
  url.username = '';
  url.password = '';
  url.searchParams.set('embedded', 'true');

  return { value: url.toString() };
}
