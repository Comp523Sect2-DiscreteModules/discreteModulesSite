import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api.js';
import { CloseIcon, PlusIcon } from '../../components/Icons.jsx';
import {
  ErrorState,
  PageShell,
  PublishBadge,
  Skeleton,
} from '../../components/ui.jsx';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'published', label: 'Published' },
  { id: 'draft', label: 'Drafts' },
];

const slugify = (t) =>
  t
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export default function AdminDashboard() {
  const [modules, setModules] = useState(null);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newModule, setNewModule] = useState({
    slug: '',
    title: '',
    description: '',
  });
  const [slugTouched, setSlugTouched] = useState(false);
  const [filter, setFilter] = useState('all');
  const [pendingId, setPendingId] = useState(null);

  function refresh() {
    api
      .getModules()
      .then(setModules)
      .catch((err) => setError(err.message));
  }

  useEffect(refresh, []);

  async function handleTogglePublish(mod) {
    setPendingId(mod.id);
    try {
      await api.updateModule(mod.id, { published: !mod.published });
      refresh();
    } finally {
      setPendingId(null);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!newModule.slug || !newModule.title) return;
    await api.createModule({ ...newModule, published: false });
    setNewModule({ slug: '', title: '', description: '' });
    setSlugTouched(false);
    setCreating(false);
    refresh();
  }

  if (error) {
    return (
      <PageShell>
        <ErrorState
          title="Couldn't load modules"
          message={error}
          onRetry={() => {
            setError(null);
            refresh();
          }}
        />
      </PageShell>
    );
  }

  const list = modules ?? [];
  const counts = {
    all: list.length,
    published: list.filter((m) => m.published).length,
    draft: list.filter((m) => !m.published).length,
  };
  const visible = list.filter(
    (m) =>
      filter === 'all' || (filter === 'published' ? m.published : !m.published),
  );
  const order = new Map(list.map((m, i) => [m.id, i + 1]));

  return (
    <PageShell>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div className="flex max-w-[640px] flex-col gap-1.5">
          <span className="eyebrow text-primary-ink">Admin</span>
          <h1 className="font-serif text-h1 sm:text-[34px] sm:leading-[1.2]">
            Admin dashboard
          </h1>
          <p className="text-muted">
            Create and edit modules. Publishing controls whether students can
            see a module; there are no prerequisites or score gates by design.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="btn btn-primary"
        >
          <PlusIcon className="h-[18px] w-[18px]" />
          New module
        </button>
      </header>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div
          role="group"
          aria-label="Filter modules"
          className="inline-flex gap-0.5 rounded-lg bg-surface-3 p-[3px]"
        >
          {FILTERS.map((f) => {
            const on = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={on}
                onClick={() => setFilter(f.id)}
                className={`inline-flex h-[34px] items-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors ${
                  on
                    ? 'bg-surface text-ink shadow-xs ring-1 ring-line'
                    : 'text-ink-2 hover:text-ink'
                }`}
              >
                {f.label}
                <span
                  className={`min-w-5 rounded-full px-1.5 text-xs leading-[18px] ${
                    on
                      ? 'bg-primary-soft-2 text-primary-ink'
                      : 'bg-surface text-muted'
                  }`}
                >
                  {modules ? counts[f.id] : '–'}
                </span>
              </button>
            );
          })}
        </div>
        <span className="text-sm text-muted">Sorted by module order</span>
      </div>

      {/* Desktop table */}
      <div
        role="table"
        aria-label="Modules"
        className="card hidden overflow-hidden rounded-[14px] text-sm md:block"
      >
        <div
          role="row"
          className="grid grid-cols-[44px_minmax(0,2.6fr)_minmax(180px,1.3fr)_80px_88px] items-center gap-4 bg-surface-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.06em] text-muted"
        >
          <span role="columnheader">#</span>
          <span role="columnheader">Module</span>
          <span role="columnheader">Visibility</span>
          <span role="columnheader">Lessons</span>
          <span role="columnheader">
            <span className="sr-only">Actions</span>
          </span>
        </div>

        {!modules &&
          [0, 1, 2].map((i) => (
            <div
              key={i}
              className="grid grid-cols-[44px_minmax(0,2.6fr)_minmax(180px,1.3fr)_80px_88px] items-center gap-4 border-t border-line px-5 py-4"
              aria-hidden="true"
            >
              <Skeleton className="h-3 w-5" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3 w-4" />
              <Skeleton className="ml-auto h-8 w-14" />
            </div>
          ))}

        {visible.map((m) => (
          <div
            key={m.id}
            role="row"
            className="grid grid-cols-[44px_minmax(0,2.6fr)_minmax(180px,1.3fr)_80px_88px] items-center gap-4 border-t border-line px-5 py-3.5 transition-colors hover:bg-surface-2"
          >
            <span role="cell" className="font-mono text-meta text-muted">
              {String(order.get(m.id)).padStart(2, '0')}
            </span>
            <div role="cell" className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-[15px] font-semibold text-ink">
                {m.title}
              </span>
              <span className="truncate font-mono text-meta text-muted">
                {m.slug}
              </span>
            </div>
            <div role="cell" className="flex items-center gap-2.5">
              <PublishSwitch
                module={m}
                pending={pendingId === m.id}
                onToggle={handleTogglePublish}
              />
              <PublishBadge published={m.published} />
            </div>
            <span
              role="cell"
              title="Lesson counts aren't returned by the modules API yet"
              className="text-muted"
            >
              —
            </span>
            <div role="cell" className="flex justify-end">
              <Link
                to={`/admin/modules/${m.id}`}
                className="btn btn-sm btn-secondary h-[34px]"
              >
                Edit
              </Link>
            </div>
          </div>
        ))}

        {modules && visible.length === 0 && <EmptyRow filter={filter} />}
      </div>

      {/* Mobile cards */}
      <ul className="flex flex-col gap-2.5 md:hidden">
        {!modules &&
          [0, 1, 2].map((i) => (
            <li
              key={i}
              className="card flex flex-col gap-2 rounded-[14px] p-4"
              aria-hidden="true"
            >
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </li>
          ))}
        {visible.map((m) => (
          <li
            key={m.id}
            className="card flex flex-col gap-3 rounded-[14px] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="font-semibold">{m.title}</span>
                <span className="truncate font-mono text-meta text-muted">
                  {m.slug}
                </span>
              </div>
              <Link
                to={`/admin/modules/${m.id}`}
                className="btn btn-sm btn-secondary"
              >
                Edit
              </Link>
            </div>
            <div className="flex items-center gap-2.5 border-t border-line pt-3">
              <PublishSwitch
                module={m}
                pending={pendingId === m.id}
                onToggle={handleTogglePublish}
              />
              <span className="text-sm font-semibold text-ink-2">
                {m.published ? 'Published' : 'Draft'}
              </span>
            </div>
          </li>
        ))}
        {modules && visible.length === 0 && (
          <li className="card rounded-[14px]">
            <EmptyRow filter={filter} />
          </li>
        )}
      </ul>

      {creating && (
        <NewModuleDrawer
          value={newModule}
          onChange={(next) => {
            if (next.title !== newModule.title && !slugTouched) {
              next = { ...next, slug: slugify(next.title) };
            }
            setNewModule(next);
          }}
          onSlugEdit={() => setSlugTouched(true)}
          onSubmit={handleCreate}
          onClose={() => setCreating(false)}
        />
      )}
    </PageShell>
  );
}

function EmptyRow({ filter }) {
  return (
    <p className="border-t border-line px-5 py-8 text-center text-[15px] text-muted md:border-t">
      {filter === 'draft'
        ? 'No drafts. Every module is visible to students.'
        : filter === 'published'
          ? 'No published modules yet.'
          : 'No modules yet. Create one to get started.'}
    </p>
  );
}

function PublishSwitch({ module: m, pending, onToggle }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={m.published}
      aria-label={`${m.title}: visible to students`}
      disabled={pending}
      onClick={() => onToggle(m)}
      className={`relative h-[22px] w-[38px] shrink-0 rounded-full transition-colors disabled:opacity-60 ${
        m.published ? 'bg-primary' : 'bg-line-strong'
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute left-[3px] top-[3px] h-4 w-4 rounded-full bg-white shadow-[0_1px_2px_rgb(0_0_0/0.25)] transition-transform ${
          m.published ? 'translate-x-4' : ''
        }`}
      />
    </button>
  );
}

function NewModuleDrawer({ value, onChange, onSlugEdit, onSubmit, onClose }) {
  const firstField = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const canCreate = value.title.trim() && value.slug.trim();

  // Runs once on open: focus the first field, close on Escape, lock page scroll.
  useEffect(() => {
    firstField.current?.focus();
    const onKey = (e) => e.key === 'Escape' && closeRef.current();
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div
        className="absolute inset-0 bg-[#0E141B]/45"
        onClick={onClose}
        aria-hidden="true"
      />
      <form
        onSubmit={onSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-module-title"
        className="relative flex h-full w-full max-w-[460px] flex-col bg-surface shadow-drawer"
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-6 py-[18px]">
          <h2
            id="new-module-title"
            className="font-serif text-[22px] font-semibold leading-[30px]"
          >
            New module
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="btn btn-ghost h-9 w-9 p-0"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-6">
          <div>
            <label htmlFor="nm-title" className="label">
              Title
            </label>
            <input
              id="nm-title"
              ref={firstField}
              value={value.title}
              onChange={(e) => onChange({ ...value, title: e.target.value })}
              placeholder="e.g. Graph Theory"
              className="input h-11"
              required
            />
          </div>
          <div>
            <label htmlFor="nm-slug" className="label">
              Slug
            </label>
            <input
              id="nm-slug"
              value={value.slug}
              onChange={(e) => {
                onSlugEdit();
                onChange({ ...value, slug: e.target.value });
              }}
              placeholder="e.g. graph-theory"
              className="input h-11 font-mono text-[15px]"
              required
            />
            <p className="hint">
              URL-safe id. Filled in from the title; you can edit it.
            </p>
          </div>
          <div>
            <label htmlFor="nm-desc" className="label">
              Description{' '}
              <span className="font-normal text-muted">Optional</span>
            </label>
            <textarea
              id="nm-desc"
              value={value.description}
              onChange={(e) =>
                onChange({ ...value, description: e.target.value })
              }
              rows={3}
              placeholder="One line students see on the module list"
              className="input resize-y py-2.5 leading-normal"
            />
          </div>
          <div className="flex items-start gap-2.5 rounded-lg bg-warning-soft px-3.5 py-3 text-sm text-warning-ink">
            <span
              className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-warning"
              aria-hidden="true"
            />
            New modules start as drafts. Students won't see this one until you
            publish it.
          </div>
        </div>

        <div className="flex justify-end gap-2.5 border-t border-line px-6 py-4">
          <button type="button" onClick={onClose} className="btn btn-ghost">
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canCreate}
            className="btn btn-primary"
          >
            Create draft
          </button>
        </div>
      </form>
    </div>
  );
}
