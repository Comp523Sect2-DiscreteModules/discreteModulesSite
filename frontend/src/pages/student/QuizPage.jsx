import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api.js';

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

export default function QuizPage() {
  const { moduleId } = useParams();
  const [module, setModule] = useState(null);
  const [error, setError] = useState(null);

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
  }, [moduleId]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        to={`/modules/${moduleId}`}
        className="text-sm text-accent-dark hover:underline"
      >
        &larr; Back to lesson
      </Link>

      <h1 className="mb-8 mt-3 font-serif text-3xl font-semibold">
        Practice quiz
      </h1>

      {error && <p className="text-warn">Couldn't load this quiz: {error}</p>}

      {!error && !module && <p className="text-ink/60">Loading…</p>}

      {module && !module.quiz_form_url && (
        <div className="rounded border border-dashed border-line px-6 py-10 text-center">
          <p className="mb-1 font-medium text-ink/70">No quiz yet</p>
          <p className="text-sm text-ink/50">
            This module doesn't have a practice quiz yet.
          </p>
        </div>
      )}

      {module?.quiz_form_url && (
        <>
          {/* Google Forms can't auto-size an iframe, so give it a tall fixed
              frame; longer quizzes scroll inside it. */}
          <iframe
            src={module.quiz_form_url}
            title={`${module.title} practice quiz`}
            className="h-[80vh] min-h-[600px] w-full rounded border border-line bg-white"
          >
            Loading…
          </iframe>

          <p className="mt-3 text-sm text-ink/60">
            Quiz not loading?{' '}
            <a
              href={standaloneFormUrl(module.quiz_form_url)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-dark hover:underline"
            >
              Open it in a new tab
            </a>
            .
          </p>
        </>
      )}
    </div>
  );
}
