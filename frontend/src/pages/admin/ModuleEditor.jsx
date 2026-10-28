import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api.js';
import MathContent from '../../components/MathContent.jsx';
import { CheckIcon, ExternalIcon, PlusIcon } from '../../components/Icons.jsx';
import { ErrorState, PublishBadge, Skeleton } from '../../components/ui.jsx';

const SYNTAX_HINTS = [
  '## Heading',
  '### Subheading',
  '**bold**',
  '_italic_',
  '- list',
  '$inline$',
  '$$display$$',
];

export default function ModuleEditor() {
  const { moduleId } = useParams();
  const [module, setModule] = useState(null);
  const [error, setError] = useState(null);
  const [savingModule, setSavingModule] = useState(false);
  const [savedOnce, setSavedOnce] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [draftContent, setDraftContent] = useState('');
  const [previewContent, setPreviewContent] = useState('');

  function refresh() {
    api
      .getModule(moduleId)
      .then(setModule)
      .catch((err) => setError(err.message));
  }

  useEffect(refresh, [moduleId]);

  // Debounce the live preview so MathJax isn't re-run on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setPreviewContent(draftContent), 250);
    return () => clearTimeout(t);
  }, [draftContent]);

  async function handleModuleFieldSave(field, value) {
    setSavingModule(true);
    try {
      await api.updateModule(moduleId, { [field]: value });
      setSavedOnce(true);
      refresh();
    } finally {
      setSavingModule(false);
    }
  }

  function startEditingLesson(lesson) {
    setEditingLessonId(lesson.id);
    setDraftContent(lesson.content_md);
    setPreviewContent(lesson.content_md);
  }

  async function saveLesson(lesson) {
    await api.updateLesson(lesson.id, { content_md: draftContent });
    setEditingLessonId(null);
    refresh();
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
        <Link to="/admin" className="link mt-6 inline-block text-sm">
          Back to admin dashboard
        </Link>
      </div>
    );
  }
  if (!module) return <EditorSkeleton />;

  return (
    <div className="pb-14">
      <div className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-shell flex-col gap-2 px-4 pb-5 pt-[18px] sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-sm"
          >
            <Link to="/admin" className="link">
              Admin dashboard
            </Link>
            <span aria-hidden="true" className="text-faint">
              /
            </span>
            <span aria-current="page" className="text-muted">
              Edit module
            </span>
          </nav>
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

      <div className="mx-auto flex max-w-shell flex-col gap-7 px-4 pt-7 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:px-8">
        <aside className="card flex flex-col gap-[18px] rounded-[14px] p-5 lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1">
          <h2 className="text-base font-semibold">Module details</h2>
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
              rows={3}
              className="input resize-y py-2.5 text-[15px] leading-normal"
            />
          </div>
          {module.slug && (
            <div>
              <span className="label">Slug</span>
              <span className="block rounded-md border border-line bg-surface-2 px-3 py-2 font-mono text-sm text-ink-2">
                {module.slug}
              </span>
              <p className="hint">Set when the module is created.</p>
            </div>
          )}
          <p className="border-t border-line pt-3.5 text-meta text-muted">
            Changes save automatically when you leave a field.
          </p>
        </aside>

        <div className="flex min-w-0 flex-col gap-10 lg:col-start-1 lg:row-start-1">
          <section
            aria-labelledby="lessons-h"
            className="flex flex-col gap-3.5"
          >
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

            {module.lessons.map((lesson, i) => {
              const editing = editingLessonId === lesson.id;
              const dirty = editing && draftContent !== lesson.content_md;

              return (
                <article
                  key={lesson.id}
                  className="card overflow-hidden rounded-[14px]"
                >
                  <div className="flex items-center gap-3.5 px-[18px] py-3.5">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-surface-3 text-meta font-semibold text-ink-2">
                      {i + 1}
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <h3 className="truncate font-semibold">{lesson.title}</h3>
                      {lesson.video_url && (
                        <span className="text-meta text-muted">
                          Includes video
                        </span>
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
                        onClick={() => startEditingLesson(lesson)}
                        className="btn btn-sm btn-secondary h-[34px]"
                      >
                        Edit content
                      </button>
                    )}
                  </div>

                  {editing ? (
                    <div className="border-t border-line">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 border-b border-line bg-surface-2 px-[18px] py-2.5">
                        <span className="mr-1 text-meta font-semibold text-muted">
                          Markdown + LaTeX
                        </span>
                        {SYNTAX_HINTS.map((h) => (
                          <code
                            key={h}
                            className="rounded-[5px] border border-line bg-surface px-[7px] font-mono text-xs leading-5 text-ink-2"
                          >
                            {h}
                          </code>
                        ))}
                      </div>
                      <div className="grid xl:grid-cols-2">
                        <div className="flex flex-col border-line xl:border-r">
                          <label
                            htmlFor={`lesson-md-${lesson.id}`}
                            className="eyebrow px-[18px] pt-3 text-muted"
                          >
                            Write
                          </label>
                          <textarea
                            id={`lesson-md-${lesson.id}`}
                            value={draftContent}
                            onChange={(e) => setDraftContent(e.target.value)}
                            spellCheck={false}
                            className="min-h-[420px] flex-1 resize-y border-0 bg-surface px-[18px] pb-[18px] pt-2.5 font-mono text-[13.5px] leading-[1.7] text-ink focus:outline-none focus-visible:shadow-[inset_0_0_0_2px_rgb(var(--c-primary))] focus-visible:outline-none"
                          />
                        </div>
                        <div className="flex min-w-0 flex-col border-t border-line xl:border-t-0">
                          <span className="eyebrow px-[22px] pt-3 text-muted">
                            Preview
                          </span>
                          <div className="max-h-[520px] overflow-auto px-[22px] pb-[18px] pt-2">
                            <MathContent markdown={previewContent} size="sm" />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-line bg-surface-2 px-[18px] py-3">
                        <span className="text-meta text-muted">
                          Preview updates as you type, using the same renderer
                          students see.
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingLessonId(null)}
                            className="btn btn-sm btn-ghost"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => saveLesson(lesson)}
                            disabled={!dirty}
                            className="btn btn-sm btn-primary"
                          >
                            Save lesson
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
            })}

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
    </div>
  );
}

// Lets an admin attach (or remove) the Google Form used as this module's
// practice quiz. Keeps its own draft/saved state so typing here isn't clobbered
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
    save(draft);
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
            <CheckIcon className="h-3 w-3" /> Google Form attached
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
        <ol className="flex list-decimal flex-col gap-1 pl-5 text-sm text-ink-2 marker:text-muted">
          <li>Build the quiz in Google Forms.</li>
          <li>In the form, choose Send and open the &lt; &gt; tab.</li>
          <li>Paste the embed code (or just its link) below.</li>
        </ol>
        <p className="rounded-md bg-surface-2 px-3 py-2 text-meta text-muted">
          The form must be open to anyone with the link, not restricted to an
          organization, or it won't load inside the page.
        </p>

        <div>
          <label htmlFor="quiz-form-url" className="label">
            Google Form link or embed code
          </label>
          <textarea
            id="quiz-form-url"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={3}
            placeholder="https://docs.google.com/forms/d/e/…/viewform?embedded=true"
            className="input resize-y py-2.5 font-mono text-sm leading-relaxed"
          />
        </div>

        <div role="status" aria-live="polite">
          {error && (
            <p className="text-sm font-semibold text-danger-ink">{error}</p>
          )}
          {message && (
            <p className="text-sm font-semibold text-success-ink">{message}</p>
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
            <>
              <Link
                to={`/modules/${moduleId}/quiz`}
                className="btn btn-sm btn-secondary h-[38px]"
              >
                Preview as student
              </Link>
              <button
                type="button"
                disabled={saving}
                onClick={() => save('')}
                className="btn btn-sm btn-danger-ghost ml-auto h-[38px]"
              >
                Remove quiz
              </button>
            </>
          )}
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
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-8 w-1/3" />
        </div>
      </div>
      <div
        className="mx-auto grid max-w-shell gap-7 px-4 pt-7 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8"
        aria-hidden="true"
      >
        <Skeleton className="h-72 rounded-[14px]" />
        <Skeleton className="h-72 rounded-[14px]" />
      </div>
    </div>
  );
}
