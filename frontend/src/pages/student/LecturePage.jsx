import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api.js';
import MathContent from '../../components/MathContent.jsx';

export default function LecturePage() {
  const { moduleId } = useParams();
  const [module, setModule] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getModule(moduleId)
      .then(setModule)
      .catch((err) => setError(err.message));
  }, [moduleId]);

  if (error) {
    return (
      <p className="mx-auto max-w-3xl px-6 py-10 text-warn">
        Couldn't load this module: {error}
      </p>
    );
  }
  if (!module) {
    return <p className="mx-auto max-w-3xl px-6 py-10 text-ink/60">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link to="/" className="text-sm text-accent-dark hover:underline">
        &larr; All modules
      </Link>

      <h1 className="mb-1 mt-3 font-serif text-3xl font-semibold">
        {module.title}
      </h1>
      {module.description && (
        <p className="mb-8 text-ink/60">{module.description}</p>
      )}

      {module.lessons.length === 0 && (
        <p className="text-ink/60">This module doesn't have any lessons yet.</p>
      )}

      {module.lessons.map((lesson) => (
        <article
          key={lesson.id}
          className="mb-12 border-b border-line pb-12 last:border-0"
        >
          <h2 className="mb-4 font-serif text-xl font-semibold">
            {lesson.title}
          </h2>

          {lesson.video_url && (
            <div className="mb-6 aspect-video overflow-hidden rounded border border-line bg-ink/5">
              <iframe
                src={lesson.video_url}
                title={lesson.title}
                className="h-full w-full"
                allowFullScreen
              />
            </div>
          )}

          <MathContent markdown={lesson.content_md} />
        </article>
      ))}

      <Link
        to={`/modules/${module.id}/quiz`}
        className="inline-block rounded bg-accent-dark px-4 py-2 font-medium text-white hover:bg-accent-dark/90"
      >
        Try the practice quiz
      </Link>
    </div>
  );
}
