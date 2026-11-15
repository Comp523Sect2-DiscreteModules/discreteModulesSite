import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api.js';
import MarkdownToolbar, {
  handleFormatShortcut,
} from '../../components/MarkdownToolbar.jsx';
import MathContent from '../../components/MathContent.jsx';
import {
  ArrowLeftIcon,
  CheckIcon,
  ExternalIcon,
  PlusIcon,
} from '../../components/Icons.jsx';
import QuizLink from '../../components/QuizLink.jsx';
import { ErrorState, PublishBadge, Skeleton } from '../../components/ui.jsx';
import { isEmbeddedForm } from '../../quiz.js';

export default function ModuleEditor() {
  const { moduleId } = useParams();
  const [module, setModule] = useState(null);
  const [error, setError] = useState(null);
  const [savingModule, setSavingModule] = useState(false);
  const [savedOnce, setSavedOnce] = useState(false);
  const [fieldError, setFieldError] = useState(null);

  function refresh() {
    api
      .getModule(moduleId)
      .then(setModule)
      .catch((err) => setError(err.message));
  }

  useEffect(refresh, [moduleId]);

  async function handleModuleFieldSave(field, value) {
    if (value === module[field]) return;
    if (field === 'title' && !value.trim()) {
      setFieldError('A module needs a title.');
      return;
    }
    setFieldError(null);
    setSavingModule(true);
    try {
      await api.updateModule(moduleId, { [field]: value });
      setSavedOnce(true);
      refresh();
    } catch (err) {
      setFieldError(err.message);
    } finally {
      setSavingModule(false);
    }
  }

  async function addLesson() {
    await api.createLesson({
      module_id: Number(moduleId),
      title: 'New lesson',
      content_md:
        'Write lesson content here using Markdown. Use `$...$` for inline LaTeX\nand `$$...$$` for display LaTeX, e.g. $$\\int_0^1 x\\,dx = \\tfrac{1}{2}$$.',
    });
    refresh();
  }

  if (error) {
    return (
      <div className="mx-auto max-w-shell px-4 py-10 sm:px-6 lg:px-8">
        <ErrorState title="Couldn't load this module" message={error} />
        <Link to="/admin" className="btn btn-sm btn-secondary mt-6 inline-flex">
          <ArrowLeftIcon /> Back to dashboard
        </Link>
      </div>
    );
  }
  if (!module) return <EditorSkeleton />;

  return (
    <div className="pb-14">
      <div className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-shell flex-col gap-3 px-4 pb-5 pt-[18px] sm:px-6 lg:px-8">
          <Link
            to="/admin"
            className="btn btn-sm btn-secondary h-[34px] self-start"
          >
            <ArrowLeftIcon /> Back to dashboard
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
            <div className="flex min-w-0 flex-wrap items-center gap-3">
              <h1 className="font-serif text-[26px] font-semibold leading-tight tracking-[-0.01em] sm:text-h1">
                {module.title}
              </h1>
              <PublishBadge published={module.published} />
            </div>
            <div className="flex flex-wrap items-center gap-3.5">
              <span
                role="status"
                aria-live="polite"
                className="whitespace-nowrap text-sm font-medium"
              >
                {savingModule ? (
                  <span className="text-muted">Saving…</span>
                ) : fieldError ? (
                  <span className="text-danger-ink">{fieldError}</span>
                ) : savedOnce ? (
                  <span className="inline-flex items-center gap-1.5 text-success-ink">
                    <CheckIcon className="h-3.5 w-3.5" /> All changes saved
                  </span>
                ) : null}
              </span>
              <Link
                to={`/modules/${module.id}`}
                className="btn btn-sm btn-secondary h-[38px]"
              >
                View as student <ExternalIcon className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-shell flex-col gap-8 px-4 pt-6 sm:px-6 lg:px-8">
        {/* Module details stay at the top so the lesson editors below get the
            full page width. */}
        <section
          aria-labelledby="details-h"
          className="card grid gap-x-6 gap-y-4 rounded-[14px] p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 md:col-span-2">
            <h2 id="details-h" className="text-base font-semibold">
              Module details
            </h2>
            <span className="text-meta text-muted">
              Changes save automatically when you leave a field.
              {module.slug && (
                <>
                  {' '}
                  Slug:{' '}
                  <span className="font-mono text-ink-2">{module.slug}</span>
                </>
              )}
            </span>
          </div>
          <div>
            <label htmlFor="me-title" className="label">
              Title
            </label>
            <input
              id="me-title"
              defaultValue={module.title}
              onBlur={(e) => handleModuleFieldSave('title', e.target.value)}
              className="input h-[42px] text-[15px]"
            />
          </div>
          <div>
            <label htmlFor="me-desc" className="label">
              Description
            </label>
            <textarea
              id="me-desc"
              defaultValue={module.description}
              onBlur={(e) =>
                handleModuleFieldSave('description', e.target.value)
              }
              rows={2}
              className="input resize-y py-2.5 text-[15px] leading-normal"
            />
          </div>
        </section>

        <section aria-labelledby="lessons-h" className="flex flex-col gap-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <h2
                id="lessons-h"
                className="font-serif text-[21px] font-semibold leading-7"
              >
                Lessons
              </h2>
              <span className="rounded-full bg-surface-3 px-2 text-meta font-semibold leading-[22px] text-ink-2">
                {module.lessons.length}
              </span>
            </div>
            <button
              type="button"
              onClick={addLesson}
              className="btn btn-sm btn-secondary h-[38px]"
            >
              <PlusIcon /> Add lesson
            </button>
          </div>

          {module.lessons.map((lesson, i) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              index={i}
              onSaved={refresh}
            />
          ))}

          {module.lessons.length === 0 && (
            <div className="flex flex-col items-center gap-2 rounded-[14px] border-[1.5px] border-dashed border-line-strong bg-surface px-6 py-10 text-center">
              <p className="font-semibold">No lessons yet</p>
              <p className="text-sm text-muted">
                Add a lesson to start writing content for this module.
              </p>
            </div>
          )}
        </section>

        <QuizFormSection
          key={module.id}
          moduleId={module.id}
          initialUrl={module.quiz_form_url}
        />
      </div>
    </div>
  );
}

// One lesson. Each card owns its own editing state, so any number of lessons
// can be open for editing at the same time.
function LessonCard({ lesson, index, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  // Which lines of the draft are being edited inside the preview, if any.
  const [range, setRange] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const editorRef = useRef(null);
  const writeRef = useRef(null);

  const dirty = editing && draft !== lesson.content_md;

  function startEditing() {
    setDraft(lesson.content_md);
    setRange(null);
    setSaveError(null);
    setEditing(true);
  }

  // Toolbar buttons format whichever box is being edited: the Write pane or a
  // block opened from the preview. Otherwise they default to the Write pane.
  function formatTarget() {
    const active = document.activeElement;
    return active?.tagName === 'TEXTAREA' && editorRef.current?.contains(active)
      ? active
      : writeRef.current;
  }

  async function save() {
    setSaving(true);
    setSaveError(null);
    try {
      await api.updateLesson(lesson.id, { content_md: draft });
      setEditing(false);
      onSaved();
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="card overflow-hidden rounded-[14px]">
      <div className="flex items-center gap-3.5 px-[18px] py-3.5">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-surface-3 text-meta font-semibold text-ink-2">
          {index + 1}
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="truncate font-semibold">{lesson.title}</h3>
          {lesson.video_url && (
            <span className="text-meta text-muted">Includes video</span>
          )}
        </div>
        {dirty && (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-meta font-semibold text-warning-ink">
            <span
              className="h-[7px] w-[7px] rounded-full bg-warning"
              aria-hidden="true"
            />
            Unsaved changes
          </span>
        )}
        {!editing && (
          <button
            type="button"
            onClick={startEditing}
            className="btn btn-sm btn-secondary h-[34px]"
          >
            Edit content
          </button>
        )}
      </div>

      {editing ? (
        <div
          ref={editorRef}
          onKeyDown={handleFormatShortcut}
          className="border-t border-line"
        >
          <MarkdownToolbar getTarget={formatTarget} />
          <div className="grid lg:grid-cols-2">
            <div className="flex flex-col border-line lg:border-r">
              <label
                htmlFor={`lesson-md-${lesson.id}`}
                className="eyebrow px-[18px] pt-3 text-muted"
              >
                Write
              </label>
              <textarea
                id={`lesson-md-${lesson.id}`}
                ref={writeRef}
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  setRange(null);
                }}
                spellCheck={false}
                className="h-[70vh] min-h-[480px] resize-y border-0 bg-surface px-[18px] pb-[18px] pt-2.5 font-mono text-[13.5px] leading-[1.7] text-ink focus:outline-none focus-visible:shadow-[inset_0_0_0_2px_rgb(var(--c-primary))] focus-visible:outline-none"
              />
            </div>
            <div className="flex min-w-0 flex-col border-t border-line lg:border-t-0">
              <span className="eyebrow px-[22px] pt-3 text-muted">
                Preview{' '}
                <span className="normal-case">· click text to edit</span>
              </span>
              <div className="h-[70vh] min-h-[480px] overflow-auto px-[14px] pb-[18px] pt-2">
                <EditablePreview
                  value={draft}
                  onChange={setDraft}
                  range={range}
                  setRange={setRange}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-line bg-surface-2 px-[18px] py-3">
            <span className="text-meta text-muted">
              {saveError ? (
                <span className="font-semibold text-danger-ink">
                  {saveError}
                </span>
              ) : (
                'Edit on either side; both stay in sync. Math shows as LaTeX while you edit a block.'
              )}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="btn btn-sm btn-ghost"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={!dirty || saving}
                className="btn btn-sm btn-primary"
              >
                {saving ? 'Saving…' : 'Save lesson'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-h-56 overflow-hidden border-t border-line px-[22px] pt-4 [mask-image:linear-gradient(#000_50%,transparent)]">
          <MathContent markdown={lesson.content_md} size="sm" />
        </div>
      )}
    </article>
  );
}

// Splits lines into editable blocks: a run of "- " lines is one block (a
// list); every other non-blank line is its own block. Blank lines are
// separators and don't render.
function toBlocks(lines, offset) {
  const isItem = (l) => l.trim().startsWith('- ');
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    if (lines[i].trim() === '') {
      i++;
      continue;
    }
    const start = i;
    if (isItem(lines[i])) {
      while (i < lines.length && isItem(lines[i])) i++;
    } else {
      i++;
    }
    blocks.push({
      start: offset + start,
      count: i - start,
      text: lines.slice(start, i).join('\n'),
    });
  }
  return blocks;
}

// Rendered preview where clicking a paragraph, heading or list swaps it for a
// text box holding its Markdown source. Edits go straight into the shared
// draft, so the Write pane updates as you type.
function EditablePreview({ value, onChange, range, setRange }) {
  const lines = value.split('\n');
  const editRange =
    range && range.start + range.count <= lines.length ? range : null;

  const before = editRange ? lines.slice(0, editRange.start) : lines;
  const active = editRange
    ? lines.slice(editRange.start, editRange.start + editRange.count)
    : null;
  const afterOffset = editRange ? editRange.start + editRange.count : 0;
  const after = editRange ? lines.slice(afterOffset) : [];

  function handleBlockEdit(text) {
    const next = text.split('\n');
    onChange([...before, ...next, ...after].join('\n'));
    setRange({ start: editRange.start, count: next.length });
  }

  function addParagraph() {
    if (lines.length === 1 && lines[0] === '') {
      setRange({ start: 0, count: 1 });
      return;
    }
    onChange([...lines, ''].join('\n'));
    setRange({ start: lines.length, count: 1 });
  }

  const renderBlock = (b) => (
    <PreviewBlock
      key={b.start}
      text={b.text}
      onEdit={() => setRange({ start: b.start, count: b.count })}
    />
  );

  return (
    <div className="flex flex-col">
      {toBlocks(before, 0).map(renderBlock)}
      {active && (
        <BlockTextarea
          key={editRange.start}
          value={active.join('\n')}
          onChange={handleBlockEdit}
          onDone={() =>
            setRange((r) => (r && r.start === editRange.start ? null : r))
          }
        />
      )}
      {toBlocks(after, afterOffset).map(renderBlock)}
      <button
        type="button"
        onClick={addParagraph}
        className="btn btn-sm btn-ghost mt-3 self-start text-muted"
      >
        <PlusIcon /> Add paragraph
      </button>
    </div>
  );
}

function PreviewBlock({ text, onEdit }) {
  return (
    <div
      role="button"
      tabIndex={0}
      title="Click to edit"
      // mousedown (not click): the block being edited collapses on blur, which
      // would shift this block out from under the pointer before a click lands.
      onMouseDown={(e) => {
        e.preventDefault();
        onEdit();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && e.target === e.currentTarget) onEdit();
      }}
      className="cursor-text rounded-md px-2 py-0.5 transition-colors hover:bg-primary-soft focus-visible:bg-primary-soft [&>.prose-lesson>h3]:!mt-5 [&>.prose-lesson>h4]:!mt-4"
    >
      <MathContent markdown={text} size="sm" />
    </div>
  );
}

function BlockTextarea({ value, onChange, onDone }) {
  const ref = useRef(null);

  // Focus with the cursor at the end when the block opens.
  useEffect(() => {
    const el = ref.current;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, []);

  // Grow with the content so there's no inner scrollbar.
  useLayoutEffect(() => {
    const el = ref.current;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onDone}
      onKeyDown={(e) => e.key === 'Escape' && e.currentTarget.blur()}
      spellCheck={false}
      aria-label="Edit this block"
      className="my-1 block w-full resize-none rounded-md border border-primary bg-surface px-2 py-1.5 font-mono text-[13.5px] leading-[1.7] text-ink focus:outline-none focus:ring-[3px] focus:ring-primary-soft-2"
    />
  );
}

// Lets an admin attach (or remove) this module's practice quiz: a Google Form
// (embedded for students) or a link to any other site (opened in a new tab). Keeps its own draft/saved state so typing here isn't clobbered
// when the rest of the editor reloads the module.
function QuizFormSection({ moduleId, initialUrl }) {
  const [savedUrl, setSavedUrl] = useState(initialUrl ?? '');
  const [draft, setDraft] = useState(initialUrl ?? '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  async function save(value) {
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const updated = await api.updateModule(moduleId, {
        quiz_form_url: value.trim(),
      });
      const url = updated.quiz_form_url ?? '';

      // The server returns the cleaned-up embed URL; show that, not the paste.
      setSavedUrl(url);
      setDraft(url);
      setMessage(url ? 'Quiz saved.' : 'Quiz removed.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    // Saving an empty box is not a removal; that's what Remove quiz is for.
    if (!draft.trim()) {
      setError(null);
      setMessage('No URL provided, link not updated.');
      return;
    }
    save(draft);
  }

  function handleRemove() {
    if (savedUrl) {
      save('');
      return;
    }
    // Nothing is attached yet, so just clear whatever was typed or pasted.
    setDraft('');
    setError(null);
    setMessage('Link cleared.');
  }

  return (
    <section aria-labelledby="quiz-h" className="flex flex-col gap-3.5">
      <div className="flex items-center gap-2.5">
        <h2
          id="quiz-h"
          className="font-serif text-[21px] font-semibold leading-7"
        >
          Practice quiz
        </h2>
        {savedUrl ? (
          <span className="inline-flex items-center gap-1.5 rounded-sm bg-success-soft px-2 py-0.5 text-xs font-semibold text-success-ink">
            <CheckIcon className="h-3 w-3" />{' '}
            {isEmbeddedForm(savedUrl)
              ? 'Google Form attached'
              : 'External link attached'}
          </span>
        ) : (
          <span className="rounded-sm bg-surface-3 px-2 py-0.5 text-xs font-semibold text-ink-2">
            None attached
          </span>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="card flex flex-col gap-4 rounded-[14px] p-5"
      >
        <div className="flex flex-col gap-1.5 text-sm text-ink-2">
          <p>
            <strong className="font-semibold text-ink">Google Form:</strong> in
            the form, choose Send, open the &lt; &gt; tab, and paste the embed
            code (or just its link). It appears inside the page.
          </p>
          <p>
            <strong className="font-semibold text-ink">Any other site:</strong>{' '}
            paste its link. Students get a button that opens it in a new tab.
          </p>
        </div>
        <p className="rounded-md bg-surface-2 px-3 py-2 text-meta text-muted">
          A Google Form must be open to anyone with the link, not restricted to
          an organization, or it won't load inside the page.
        </p>

        <div>
          <label htmlFor="quiz-form-url" className="label">
            Quiz link or Google Form embed code
          </label>
          <textarea
            id="quiz-form-url"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={3}
            placeholder="https://docs.google.com/forms/d/e/…/viewform  or  https://example.com/quiz"
            className="input resize-y py-2.5 font-mono text-sm leading-relaxed"
          />
        </div>

        <div role="status" aria-live="polite">
          {error && (
            <p className="text-sm font-semibold text-danger-ink">{error}</p>
          )}
          {message && (
            <p
              className={`text-sm font-semibold ${
                message.startsWith('No URL') ? 'text-muted' : 'text-success-ink'
              }`}
            >
              {message}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-sm btn-primary h-[38px]"
          >
            {saving ? 'Saving…' : 'Save quiz'}
          </button>

          {savedUrl && (
            <QuizLink
              moduleId={moduleId}
              url={savedUrl}
              className="btn btn-sm btn-secondary h-[38px]"
            >
              {isEmbeddedForm(savedUrl) ? 'Preview as student' : 'Open link'}
            </QuizLink>
          )}

          <button
            type="button"
            disabled={saving || (!savedUrl && !draft.trim())}
            onClick={handleRemove}
            className="btn btn-sm btn-danger-ghost ml-auto h-[38px]"
          >
            Remove quiz
          </button>
        </div>
      </form>
    </section>
  );
}

function EditorSkeleton() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading module…</span>
      <div className="border-b border-line bg-surface" aria-hidden="true">
        <div className="mx-auto flex max-w-shell flex-col gap-3 px-4 py-5 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-1/3" />
        </div>
      </div>
      <div
        className="mx-auto flex max-w-shell flex-col gap-7 px-4 pt-7 sm:px-6 lg:px-8"
        aria-hidden="true"
      >
        <Skeleton className="h-32 rounded-[14px]" />
        <Skeleton className="h-72 rounded-[14px]" />
      </div>
    </div>
  );
}
