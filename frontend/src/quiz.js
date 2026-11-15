// A module's quiz link is either a Google Form (embedded on the quiz page) or
// any other site (just a link that opens in a new tab). The backend rewrites
// Google Forms into one canonical embed URL, so detecting them here is simple.

export function isEmbeddedForm(url) {
  try {
    const { hostname, pathname } = new URL(url);
    return hostname === 'docs.google.com' && /\/forms\//.test(pathname);
  } catch {
    return false;
  }
}

// Only ever send people to http(s) links.
export function safeExternalUrl(url) {
  try {
    const { protocol } = new URL(url);
    return protocol === 'https:' || protocol === 'http:' ? url : null;
  } catch {
    return null;
  }
}

export function quizHostname(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
