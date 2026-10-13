import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api.js';

export default function QuizPage() {
  const { moduleId } = useParams();
  const [questions, setQuestions] = useState(null);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    setQuestions(null);
    setAnswers({});

    api
      .getQuiz(moduleId)
      .then(setQuestions)
      .catch(() => setQuestions([]));
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

      {questions === null && <p className="text-ink/60">Loading…</p>}

      {questions?.length === 0 && (
        <div className="rounded border border-dashed border-line px-6 py-10 text-center">
          <p className="mb-1 font-medium text-ink/70">No questions yet</p>
          <p className="text-sm text-ink/50">
            This module doesn't have quiz content yet.
          </p>
        </div>
      )}

      {questions && questions.length > 0 && (
        <ol className="space-y-6">
          {questions.map((question, questionIndex) => (
            <li
              key={question.id}
              className="rounded border border-line bg-white px-5 py-4"
            >
              <h2 className="mb-4 font-medium">
                {questionIndex + 1}. {question.prompt}
              </h2>

              <div className="space-y-3">
                {question.choices.map((choice, choiceIndex) => (
                  <label
                    key={choiceIndex}
                    className="flex cursor-pointer items-center gap-3 rounded border border-line px-3 py-3 hover:border-accent-dark"
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={choiceIndex}
                      checked={answers[question.id] === choiceIndex}
                      onChange={() =>
                        setAnswers((current) => ({
                          ...current,
                          [question.id]: choiceIndex,
                        }))
                      }
                    />

                    <span>{choice}</span>
                  </label>
                ))}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
