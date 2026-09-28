import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api.js';

export default function QuizPage() {
  const { moduleId } = useParams();
  const [questions, setQuestions] = useState(null);

  useEffect(() => {
    api.getQuiz(moduleId).then(setQuestions).catch(() => setQuestions([]));
  }, [moduleId]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link to={`/modules/${moduleId}`} className="text-sm text-accent-dark hover:underline">
        &larr; Back to lesson
      </Link>

      <h1 className="font-serif text-3xl font-semibold mt-3 mb-8">Practice quiz</h1>

      {questions === null && <p className="text-ink/60">Loading…</p>}

      {questions?.length === 0 && (
        <div className="border border-dashed border-line rounded px-6 py-10 text-center">
          <p className="text-ink/70 font-medium mb-1">No questions yet</p>
          <p className="text-sm text-ink/50">
            This module doesn't have quiz content yet. The API and question format are
            ready — this is where auto-graded questions with immediate feedback (US3)
            will render once content is added.
          </p>
        </div>
      )}

      {questions && questions.length > 0 && (
        <ul className="space-y-6">
          {questions.map((q) => (
            <li key={q.id} className="border border-line rounded px-5 py-4">
              {q.prompt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
