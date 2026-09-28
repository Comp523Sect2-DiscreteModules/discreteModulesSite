import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api.js';
import MathContent from '../../components/MathContent.jsx';

export default function LecturePage() {
  const { moduleId } = useParams();
  const [module, setModule] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getModule(moduleId).then(setModule).catch((err) => setError(err.message));
  }, [moduleId]);

  if (error) {
    return <p className="max-w-3xl mx-auto px-6 py-10 text-warn">Couldn't load this module: {error}</p>;
  }
  if (!module) {
    return <p className="max-w-3xl mx-auto px-6 py-10 text-ink/60">Loading…</p>;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link to="/" className="text-sm text-accent-dark hover:underline">
        &larr; All modules
      </Link>

      <h1 className="font-serif text-3xl font-semibold mt-3 mb-1">{module.title}</h1>
      {module.description && <p className="text-ink/60 mb-8">{module.description}</p>}

      {module.lessons.length === 0 && (
        <p className="text-ink/60">This module doesn't have any lessons yet.</p>
      )}

      {module.lessons.map((lesson) => (
        <article key={lesson.id} className="mb-12 pb-12 border-b border-line last:border-0">
          <h2 className="font-serif text-xl font-semibold mb-4">{lesson.title}</h2>

          {lesson.video_url && (
            <div className="aspect-video mb-6 bg-ink/5 border border-line rounded overflow-hidden">
              <iframe
                src={lesson.video_url}
                title={lesson.title}
                className="w-full h-full"
                allowFullScreen
              />
            </div>
          )}

          <MathContent markdown={lesson.content_md} />
        </article>
      ))}

      <Link
        to={`/modules/${module.id}/quiz`}
        className="inline-block bg-accent-dark text-white rounded px-4 py-2 font-medium hover:bg-accent-dark/90"
      >
        Try the practice quiz
      </Link>
    </div>
  );
}
