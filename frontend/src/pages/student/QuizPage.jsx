import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api.js';
import ThemeToggle from '../../components/ThemeToggle.jsx';
import {
  ArrowLeftIcon,
  CloseIcon,
  ExternalIcon,
} from '../../components/Icons.jsx';
import { EmptyState, ErrorState, Skeleton } from '../../components/ui.jsx';

// The embed URL carries ?embedded=true, which hides some Google chrome. The
// "open in a new tab" fallback should show the normal full-page form instead.
function standaloneFormUrl(embedUrl) {
  try {
    const url = new URL(embedUrl);
    url.searchParams.delete('embedded');
    return url.toString();
  } catch {
    return embedUrl;
  }
}

// Focus mode: the global navbar is hidden for this route (see App.jsx), so the
// page brings its own minimal header with a single way out.
export default function QuizPage() {
  const { moduleId } = useParams();
  const [module, setModule] = useState(null);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setModule(null);
    setError(null);

    api
      .getModule(moduleId)
      .then((data) => {
        if (!cancelled) setModule(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [moduleId, attempt]);

  return (
    <div className="flex min-h-screen flex-col bg-page">
      <header className="sticky top-0 z-30 border-b border-line bg-surface">
        <div className="mx-auto grid h-15 max-w-shell grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <Link
            to={`/modules/${moduleId}`}
            className="btn btn-sm btn-ghost -ml-2.5 justify-self-start px-2.5"
          >
            <CloseIcon />
            Exit quiz
          </Link>
          <div className="flex min-w-0 flex-col items-center text-center leading-[18px]">
            <span className="max-w-[46vw] truncate text-[15px] font-semibold">
              {module?.title ?? '\u00A0'}
            </span>
            <span className="text-meta text-muted">Practice quiz</span>
          </div>
          <div className="justify-self-end">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[880px] flex-1 px-4 pb-14 pt-7 sm:px-6 sm:pt-10">
        {error && (
          <div className="flex flex-col gap-6">
            <ErrorState
              title="Couldn't load this quiz"
              message={error}
              onRetry={() => setAttempt((a) => a + 1)}
            />
          </div>
        )}

        {!error && !module && (
          <div role="status" aria-live="polite" className="flex flex-col gap-4">
            <span className="sr-only">Loading quiz…</span>
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="mt-2 h-[70vh] min-h-[560px] w-full rounded-xl" />
          </div>
        )}

        {module && !module.quiz_form_url && (
          <EmptyState
            glyph="?"
            title="No quiz yet"
            action={
              <Link to={`/modules/${moduleId}`} className="btn btn-secondary">
                <ArrowLeftIcon /> Back to lesson
              </Link>
            }
          >
            This module doesn't have a practice quiz yet. Review the lesson in
            the meantime.
          </EmptyState>
        )}

        {module?.quiz_form_url && (
          <>
            <div className="mb-5 flex flex-col gap-1.5">
              <span className="eyebrow text-primary-ink">Practice quiz</span>
              <h1 className="font-serif text-[26px] font-semibold leading-tight tracking-[-0.01em] sm:text-h1">
                {module.title}
              </h1>
            </div>

            {/* Google Forms can't auto-size an iframe, so give it a tall fixed
                frame; longer quizzes scroll inside it. The frame stays white in
                dark mode because the form itself is always light. */}
            <div className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
              <iframe
                src={module.quiz_form_url}
                title={`${module.title} practice quiz`}
                className="block h-[80vh] min-h-[600px] w-full"
              >
                Loading…
              </iframe>
            </div>

            <p className="mt-4 flex flex-wrap items-center gap-1.5 text-sm text-muted">
              Quiz not loading?
              <a
                href={standaloneFormUrl(module.quiz_form_url)}
                target="_blank"
                rel="noopener noreferrer"
                className="link inline-flex items-center gap-1"
              >
                Open it in a new tab
                <ExternalIcon className="h-3.5 w-3.5" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </p>
          </>
        )}
      </main>
    </div>
  );
}
