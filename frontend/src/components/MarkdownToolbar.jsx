// Formatting toolbar for the lesson editor. Each button edits the Markdown in
// a <textarea> for you (wrapping the selection in ** **, prefixing a line with
// "## ", and so on), so authors never have to remember the syntax.
//
// Edits go through document.execCommand('insertText') so the browser's own
// undo (Ctrl+Z) keeps working, and React's onChange fires as if the person had
// typed the result. A plain value assignment is the fallback.

const ACTIONS = {
  bold: { kind: 'wrap', before: '**', after: '**', placeholder: 'bold text' },
  italic: { kind: 'wrap', before: '_', after: '_', placeholder: 'italic text' },
  h2: { kind: 'line', prefix: '## ' },
  h3: { kind: 'line', prefix: '### ' },
  list: { kind: 'line', prefix: '- ' },
  inlineMath: { kind: 'wrap', before: '$', after: '$', placeholder: 'x^2' },
  displayMath: {
    kind: 'wrap',
    before: '$$',
    after: '$$',
    placeholder: '\\int_0^1 x\\,dx',
  },
};

// Heading and list markers are mutually exclusive on a line.
const LINE_MARKER = /^(?:#{2,3} |- )/;

function replaceRange(el, start, end, text, selStart, selEnd) {
  el.focus();
  el.setSelectionRange(start, end);

  let done = false;
  try {
    done = document.execCommand(
      text === '' ? 'delete' : 'insertText',
      false,
      text,
    );
  } catch {
    done = false;
  }
  if (!done) {
    const setValue = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      'value',
    ).set;
    setValue.call(el, el.value.slice(0, start) + text + el.value.slice(end));
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
  el.setSelectionRange(selStart, selEnd);
}

function applyWrap(el, { before, after, placeholder }) {
  const { value, selectionStart: s, selectionEnd: e } = el;
  const selected = value.slice(s, e);

  // Markers just outside the selection: toggle them off.
  if (
    s >= before.length &&
    value.slice(s - before.length, s) === before &&
    value.slice(e, e + after.length) === after
  ) {
    const from = s - before.length;
    replaceRange(
      el,
      from,
      e + after.length,
      selected,
      from,
      from + selected.length,
    );
    return;
  }
  // Markers inside the selection: toggle them off.
  if (
    selected.length >= before.length + after.length &&
    selected.startsWith(before) &&
    selected.endsWith(after)
  ) {
    const inner = selected.slice(before.length, selected.length - after.length);
    replaceRange(el, s, e, inner, s, s + inner.length);
    return;
  }

  const text = selected || placeholder;
  replaceRange(
    el,
    s,
    e,
    before + text + after,
    s + before.length,
    s + before.length + text.length,
  );
}

function applyLinePrefix(el, { prefix }) {
  const { value, selectionStart: s, selectionEnd: e } = el;
  const lineStart = value.lastIndexOf('\n', s - 1) + 1;
  // A selection that ends right after a newline doesn't include the next line.
  const searchFrom = e > s && value[e - 1] === '\n' ? e - 1 : e;
  let lineEnd = value.indexOf('\n', searchFrom);
  if (lineEnd === -1) lineEnd = value.length;

  const lines = value.slice(lineStart, lineEnd).split('\n');
  const filled = lines.filter((l) => l.trim() !== '');
  const targets = filled.length > 0 ? filled : lines;
  const allHave = targets.every((l) => l.startsWith(prefix));

  const text = lines
    .map((l) => {
      if (filled.length > 0 && l.trim() === '') return l;
      return allHave
        ? l.slice(prefix.length)
        : prefix + l.replace(LINE_MARKER, '');
    })
    .join('\n');

  const collapsed = s === e;
  replaceRange(
    el,
    lineStart,
    lineEnd,
    text,
    collapsed ? lineStart + text.length : lineStart,
    lineStart + text.length,
  );
}

export function applyFormat(el, name) {
  const action = ACTIONS[name];
  if (!el || !action) return;
  if (action.kind === 'wrap') applyWrap(el, action);
  else applyLinePrefix(el, action);
}

// Ctrl/Cmd+B and Ctrl/Cmd+I inside an editor textarea. Returns true if handled.
export function handleFormatShortcut(event) {
  if (!(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey) {
    return false;
  }
  if (event.target.tagName !== 'TEXTAREA') return false;
  const name = { b: 'bold', i: 'italic' }[event.key.toLowerCase()];
  if (!name) return false;
  event.preventDefault();
  applyFormat(event.target, name);
  return true;
}

const svgProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  className: 'h-[18px] w-[18px]',
  'aria-hidden': 'true',
  focusable: 'false',
};

const BoldGlyph = () => (
  <span className="font-sans text-[17px] font-extrabold">B</span>
);
const ItalicGlyph = () => (
  <span className="font-serif text-[18px] font-semibold italic">I</span>
);
const H2Glyph = () => (
  <span className="font-sans text-[13px] font-bold tracking-tight">
    H<sub className="text-[10px]">2</sub>
  </span>
);
const H3Glyph = () => (
  <span className="font-sans text-[13px] font-bold tracking-tight">
    H<sub className="text-[10px]">3</sub>
  </span>
);
const ListGlyph = () => (
  <svg {...svgProps}>
    <path d="M9 6h11M9 12h11M9 18h11" />
    <circle cx="4.5" cy="6" r="1" fill="currentColor" />
    <circle cx="4.5" cy="12" r="1" fill="currentColor" />
    <circle cx="4.5" cy="18" r="1" fill="currentColor" />
  </svg>
);
const SigmaGlyph = () => (
  <svg {...svgProps}>
    <path d="M18 5H6l6 7-6 7h12" />
  </svg>
);

const BUTTONS = [
  [
    { name: 'bold', label: 'Bold', hint: 'Ctrl+B', Glyph: BoldGlyph },
    { name: 'italic', label: 'Italic', hint: 'Ctrl+I', Glyph: ItalicGlyph },
  ],
  [
    { name: 'h2', label: 'Heading', Glyph: H2Glyph },
    { name: 'h3', label: 'Subheading', Glyph: H3Glyph },
  ],
  [{ name: 'list', label: 'Bulleted list', Glyph: ListGlyph }],
  [
    {
      name: 'inlineMath',
      label: 'Inline math',
      text: 'Inline math',
      Glyph: SigmaGlyph,
    },
    {
      name: 'displayMath',
      label: 'Display math (centered on its own line)',
      text: 'Display math',
      Glyph: SigmaGlyph,
    },
  ],
];

/**
 * @param {{ getTarget: () => HTMLTextAreaElement | null }} props
 *   getTarget returns the textarea a button should edit.
 */
export default function MarkdownToolbar({ getTarget }) {
  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className="flex flex-wrap items-center gap-x-1 gap-y-1.5 border-b border-line bg-surface-2 px-3 py-2"
    >
      {BUTTONS.map((group, i) => (
        <div key={i} className="flex items-center gap-1">
          {i > 0 && (
            <span
              aria-hidden="true"
              className="mx-1.5 h-5 w-px bg-line-strong"
            />
          )}
          {group.map(({ name, label, hint, text, Glyph }) => (
            <button
              key={name}
              type="button"
              title={hint ? `${label} (${hint})` : label}
              aria-label={label}
              // Keep focus (and the text selection) in the textarea.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyFormat(getTarget(), name)}
              className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-transparent text-ink-2 transition-colors hover:border-line-strong hover:bg-surface hover:text-ink ${
                text ? 'px-2.5 text-sm font-semibold' : 'w-8'
              }`}
            >
              <Glyph />
              {text}
            </button>
          ))}
        </div>
      ))}
      <span className="ml-auto hidden text-meta text-muted md:inline">
        Select text first, or click to insert a placeholder.
      </span>
    </div>
  );
}
