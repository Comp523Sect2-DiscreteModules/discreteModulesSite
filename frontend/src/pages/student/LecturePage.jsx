import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api.js';
import { getModuleProgress } from '../../progress.js';
import MathContent, { extractHeadings } from '../../components/MathContent.jsx';
import { ArrowLeftIcon, ArrowRightIcon } from '../../components/Icons.jsx';
import {
  EmptyState,
  ErrorState,
  ProgressBadge,
  Skeleton,
} from '../../components/ui.jsx';

export default function LecturePage() {
  const { moduleId } = useParams();
  const [module, setModule] = useState(null);
  const [error, setError] = useState(null);

  function load() {
    setError(null);
    setModule(null);
    api
      .getModule(moduleId)
      .then(setModule)
      .catch((err) => setError(err.message));
  }

  useEffect(load, [moduleId]);

  // Outline: each lesson, then its "##" / "###" headings.
  const outline = useMemo(() => {
    if (!module) return [];
    return module.lessons.map((lesson, i) => ({
      id: `lesson-${lesson.id}`,
      n: i + 1,
      title: lesson.title,
      headings: extractHeadings(lesson.content_md, `l${lesson.id}-`),
    }));
  }, [module]);

  const allIds = useMemo(
    () => outline.flatMap((l) => [l.id, ...l.headings.map((h) => h.id)]),
    [outline],
  );
  const { progress, activeId } = useReadingPosition(allIds);

  if (error) {
    return (
      <div className="mx-auto max-w-reading px-4 py-10 sm:px-6">
        <ErrorState
          title="Couldn't load this module"
          message={error}
          onRetry={load}
        />
        <Link
          to="/"
          className="link mt-6 inline-flex items-center gap-1.5 text-sm"
        >
          <ArrowLeftIcon /> All modules
        </Link>
      </div>
    );
  }
  if (!module) return <LectureSkeleton />;

  const hasVideo = module.lessons.some((l) => l.video_url);
  const status = getModuleProgress(module.id).status;

  return (
    <>
      <div
        role="progressbar"
        aria-label="Reading progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        className="fixed inset-x-0 top-15 z-20 h-[3px] bg-surface-3"
      >
        <div
          className="h-full bg-primary transition-[width] duration-100 ease-linear"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="bg-surface">
        <div className="mx-auto flex max-w-shell items-start justify-center gap-10 px-4 sm:px-6 lg:gap-16 lg:px-8">
          <aside className="sticky top-[63px] hidden w-[236px] shrink-0 flex-col gap-6 py-10 lg:flex">
            <Link
              to="/"
              className="link inline-flex items-center gap-1.5 self-start text-sm"
            >
              <ArrowLeftIcon /> All modules
            </Link>
            <div className="flex flex-col gap-0.5">
              <span className="eyebrow text-muted">Module</span>
              <span className="font-serif text-lg font-semibold leading-[26px]">
                {module.title}
              </span>
            </div>
            {outline.length > 0 && (
              <nav aria-label="Lesson outline" className="flex flex-col gap-2">
                <span className="eyebrow text-muted">In this module</span>
                <Outline outline={outline} activeId={activeId} />
              </nav>
            )}
            {module.quiz_form_url && (
              <Link
                to={`/modules/${module.id}/quiz`}
                className="btn btn-secondary justify-between rounded-lg"
              >
                Practice quiz{' '}
                <ArrowRightIcon className="h-4 w-4 text-primary" />
              </Link>
            )}
          </aside>

          <article className="min-w-0 max-w-reading flex-1 pb-24 pt-6 sm:pt-12">
            <Link
              to="/"
              className="link mb-4 inline-flex items-center gap-1.5 text-sm lg:hidden"
            >
              <ArrowLeftIcon /> All modules
            </Link>

            <header className="mb-8 flex flex-col gap-3 border-b border-line pb-7">
              <span className="eyebrow text-primary-ink">Module</span>
              <h1 className="font-serif text-[32px] font-semibold leading-[1.15] tracking-[-0.015em] sm:text-[42px]">
                {module.title}
              </h1>
              {module.description && (
                <p className="text-[17px] leading-[1.55] text-muted sm:text-[19px]">
                  {module.description}
                </p>
              )}
              <div className="mt-1 flex flex-wrap gap-2">
                <ProgressBadge status={status} />
                <Chip>
                  {module.lessons.length}{' '}
                  {module.lessons.length === 1 ? 'lesson' : 'lessons'}
                </Chip>
                {hasVideo && <Chip>Video</Chip>}
                {module.quiz_form_url && <Chip>Practice quiz</Chip>}
              </div>
            </header>

            {outline.length > 0 && (
              <details className="mb-7 rounded-lg border border-line bg-surface-2 lg:hidden">
                <summary className="cursor-pointer px-4 py-3 text-[15px] font-semibold">
                  On this page
                </summary>
                <div className="px-2 pb-3">
                  <Outline outline={outline} activeId={activeId} />
                </div>
              </details>
            )}

            {module.lessons.length === 0 && (
              <EmptyState title="No lessons yet">
                This module doesn't have any lessons yet.
              </EmptyState>
            )}

            {module.lessons.map((lesson, i) => (
              <section
                key={lesson.id}
                aria-labelledby={`lesson-${lesson.id}`}
                className="mb-12 border-b border-line pb-12 last:mb-0 last:border-0 last:pb-0"
              >
                <span className="eyebrow text-muted">Lesson {i + 1}</span>
                <h2
                  id={`lesson-${lesson.id}`}
                  className="mb-6 mt-1.5 font-serif text-[25px] font-semibold leading-[1.25] tracking-[-0.01em] sm:text-[29px]"
                >
                  {lesson.title}
                </h2>

                {lesson.video_url && (
                  <div className="mb-8 aspect-video overflow-hidden rounded-lg border border-line bg-surface-3">
                    <iframe
                      src={lesson.video_url}
                      title={lesson.title}
                      className="h-full w-full"
                      allowFullScreen
                    />
                  </div>
                )}

                <MathContent
                  markdown={lesson.content_md}
                  idPrefix={`l${lesson.id}-`}
                />
              </section>
            ))}

            {module.quiz_form_url && (
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4 rounded-xl border border-primary-line bg-primary-soft p-5 sm:p-7">
                <div className="flex min-w-[16rem] flex-1 flex-col gap-1">
                  <h3 className="font-serif text-[21px] font-semibold leading-7">
                    Check your understanding
                  </h3>
                  <p className="text-[15px] leading-[22px] text-ink-2">
                    Try the practice quiz for this module.
                  </p>
                </div>
                <Link
                  to={`/modules/${module.id}/quiz`}
                  className="btn btn-primary"
                >
                  Start practice quiz <ArrowRightIcon />
                </Link>
              </div>
            )}
          </article>
        </div>
      </div>
    </>
  );
}

function Chip({ children }) {
  return (
    <span className="whitespace-nowrap rounded-full border border-line px-2.5 py-0.5 text-meta font-semibold text-ink-2">
      {children}
    </span>
  );
}

function Outline({ outline, activeId }) {
  return (
    <ol className="flex flex-col gap-2">
      {outline.map((l) => (
        <li key={l.id} className="flex flex-col gap-1">
          <a
            href={`#${l.id}`}
            aria-current={activeId === l.id ? 'location' : undefined}
            className="flex items-start gap-2.5 rounded-md py-1.5 pl-1 pr-2 hover:bg-surface-3"
          >
            <span className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-[6px] bg-primary text-xs font-semibold text-primary-fg">
              {l.n}
            </span>
            <span className="text-[15px] font-semibold leading-[21px] text-ink">
              {l.title}
            </span>
          </a>
          {l.headings.length > 0 && (
            <ol className="ml-[11px] flex flex-col gap-0.5 border-l border-line pl-2.5">
              {l.headings.map((h) => {
                const on = activeId === h.id;
                return (
                  <li key={h.id}>
                    <a
                      href={`#${h.id}`}
                      aria-current={on ? 'location' : undefined}
                      className={`block rounded-md py-1.5 pr-2.5 text-sm leading-5 transition-colors ${
                        h.level === 2 ? 'pl-[22px]' : 'pl-2.5'
                      } ${
                        on
                          ? 'bg-primary-soft font-semibold text-primary-ink'
                          : 'font-medium text-ink-2 hover:bg-surface-3 hover:text-ink'
                      }`}
                    >
                      {h.text}
                    </a>
                  </li>
                );
              })}
            </ol>
          )}
        </li>
      ))}
    </ol>
  );
}

// Tracks scroll progress (0–1) and which outline target the reader is on.
function useReadingPosition(ids) {
  const [state, setState] = useState({ progress: 0, activeId: null });

  useEffect(() => {
    let frame = null;
    function update() {
      frame = null;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const progress =
        max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      let activeId = ids[0] ?? null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < 140) activeId = id;
      }
      setState((s) =>
        Math.abs(s.progress - progress) > 0.002 || s.activeId !== activeId
          ? { progress, activeId }
          : s,
      );
    }
    function onScroll() {
      if (frame == null) frame = requestAnimationFrame(update);
    }
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame != null) cancelAnimationFrame(frame);
    };
  }, [ids]);

  return state;
}

function LectureSkeleton() {
  return (
    <div role="status" aria-live="polite" className="bg-surface">
      <span className="sr-only">Loading module…</span>
      <div
        className="mx-auto flex max-w-reading flex-col gap-4 px-4 py-12 sm:px-6"
        aria-hidden="true"
      >
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="mt-8 aspect-video w-full rounded-lg" />
        <Skeleton className="mt-4 h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
