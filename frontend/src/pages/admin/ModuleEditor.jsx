import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api.js';
import MathContent from '../../components/MathContent.jsx';

export default function ModuleEditor() {
  const { moduleId } = useParams();
  const [module, setModule] = useState(null);
  const [error, setError] = useState(null);
  const [savingModule, setSavingModule] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [draftContent, setDraftContent] = useState('');
  const [quizDrafts, setQuizDrafts] = useState([createEmptyQuizQuestion()]);
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [quizMessage, setQuizMessage] = useState(null);
  const [quizError, setQuizError] = useState(null);

  function refresh() {
    api
      .getModule(moduleId)
      .then(setModule)
      .catch((err) => setError(err.message));
  }

  function createEmptyQuizQuestion() {
    return {
      prompt: '',
      choices: ['', '', '', ''],
      correct_choice: 0,
      explanation: '',
    };
  }

  useEffect(refresh, [moduleId]);

  async function handleModuleFieldSave(field, value) {
    setSavingModule(true);
    try {
      await api.updateModule(moduleId, { [field]: value });
      refresh();
    } finally {
      setSavingModule(false);
    }
  }

  function startEditingLesson(lesson) {
    setEditingLessonId(lesson.id);
    setDraftContent(lesson.content_md);
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

  function updateQuizDraft(questionIndex, field, value) {
    setQuizDrafts((current) =>
      current.map((question, index) =>
        index === questionIndex ? { ...question, [field]: value } : question,
      ),
    );
  }

  function updateQuizChoice(questionIndex, choiceIndex, value) {
    setQuizDrafts((current) =>
      current.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              choices: question.choices.map((choice, index) =>
                index === choiceIndex ? value : choice,
              ),
            }
          : question,
      ),
    );
  }

  async function saveQuizQuestions(event) {
    event.preventDefault();

    setSavingQuiz(true);
    setQuizError(null);
    setQuizMessage(null);

    try {
      const questions = quizDrafts.map((question) => ({
        prompt: question.prompt.trim(),
        choices: question.choices.map((choice) => choice.trim()),
        correct_choice: Number(question.correct_choice),
        explanation: question.explanation.trim(),
      }));

      await api.createQuiz(moduleId, questions);

      setQuizMessage(`Successfully saved ${questions.length} question(s).`);

      // Start a fresh form after a successful save.
      setQuizDrafts([createEmptyQuizQuestion()]);
    } catch (err) {
      setQuizError(err.message);
    } finally {
      setSavingQuiz(false);
    }
  }

  if (error)
    return <p className="mx-auto max-w-3xl px-6 py-10 text-warn">{error}</p>;
  if (!module)
    return <p className="mx-auto max-w-3xl px-6 py-10 text-ink/60">Loading…</p>;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link to="/admin" className="text-sm text-accent-dark hover:underline">
        &larr; Admin dashboard
      </Link>

      <h1 className="mb-6 mt-3 font-serif text-3xl font-semibold">
        Edit module
      </h1>

      <div className="mb-10 space-y-4 rounded border border-line bg-white px-5 py-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Title</label>
          <input
            defaultValue={module.title}
            onBlur={(e) => handleModuleFieldSave('title', e.target.value)}
            className="w-full rounded border border-line px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            defaultValue={module.description}
            onBlur={(e) => handleModuleFieldSave('description', e.target.value)}
            rows={2}
            className="w-full rounded border border-line px-3 py-2"
          />
        </div>
        {savingModule && <p className="text-xs text-ink/40">Saving…</p>}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-xl font-semibold">Lessons</h2>
        <button
          onClick={addLesson}
          className="rounded border border-line px-3 py-1.5 text-sm hover:border-accent-dark"
        >
          + Add lesson
        </button>
      </div>

      <div className="space-y-6">
        {module.lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="rounded border border-line bg-white px-5 py-4"
          >
            <h3 className="mb-3 font-medium">{lesson.title}</h3>

            {editingLessonId === lesson.id ? (
              <div className="space-y-3">
                <textarea
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  rows={10}
                  className="w-full rounded border border-line px-3 py-2 font-mono text-sm"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => saveLesson(lesson)}
                    className="rounded bg-accent-dark px-4 py-1.5 text-sm font-medium text-white hover:bg-accent-dark/90"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingLessonId(null)}
                    className="text-sm text-ink/60 hover:text-ink"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-3 border-t border-line pt-3">
                  <MathContent markdown={lesson.content_md} />
                </div>
                <button
                  onClick={() => startEditingLesson(lesson)}
                  className="text-sm text-accent-dark hover:underline"
                >
                  Edit content
                </button>
              </>
            )}
          </div>
        ))}

        {module.lessons.length === 0 && (
          <p className="text-sm text-ink/60">No lessons yet — add one above.</p>
        )}
      </div>
      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold">Quiz questions</h2>

          <button
            type="button"
            onClick={() =>
              setQuizDrafts((current) => [
                ...current,
                createEmptyQuizQuestion(),
              ])
            }
            className="rounded border border-line px-3 py-1.5 text-sm hover:border-accent-dark"
          >
            + Add question
          </button>
        </div>

        <form onSubmit={saveQuizQuestions} className="space-y-6">
          {quizDrafts.map((question, questionIndex) => (
            <div
              key={questionIndex}
              className="space-y-4 rounded border border-line bg-white px-5 py-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Question {questionIndex + 1}</h3>

                <button
                  type="button"
                  disabled={quizDrafts.length === 1}
                  onClick={() =>
                    setQuizDrafts((current) =>
                      current.filter((_, index) => index !== questionIndex),
                    )
                  }
                  className="text-sm text-warn disabled:opacity-40"
                >
                  Remove
                </button>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Question text
                </label>

                <textarea
                  required
                  value={question.prompt}
                  onChange={(event) =>
                    updateQuizDraft(questionIndex, 'prompt', event.target.value)
                  }
                  rows={3}
                  className="w-full rounded border border-line px-3 py-2"
                />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Answer choices</p>

                {question.choices.map((choice, choiceIndex) => (
                  <div key={choiceIndex}>
                    <label className="mb-1 block text-sm text-ink/70">
                      Choice {String.fromCharCode(65 + choiceIndex)}
                    </label>

                    <input
                      required
                      value={choice}
                      onChange={(event) =>
                        updateQuizChoice(
                          questionIndex,
                          choiceIndex,
                          event.target.value,
                        )
                      }
                      className="w-full rounded border border-line px-3 py-2"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Correct answer
                </label>

                <select
                  value={question.correct_choice}
                  onChange={(event) =>
                    updateQuizDraft(
                      questionIndex,
                      'correct_choice',
                      Number(event.target.value),
                    )
                  }
                  className="w-full rounded border border-line px-3 py-2"
                >
                  {question.choices.map((_, choiceIndex) => (
                    <option key={choiceIndex} value={choiceIndex}>
                      Choice {String.fromCharCode(65 + choiceIndex)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Explanation (optional)
                </label>

                <textarea
                  value={question.explanation}
                  onChange={(event) =>
                    updateQuizDraft(
                      questionIndex,
                      'explanation',
                      event.target.value,
                    )
                  }
                  rows={2}
                  className="w-full rounded border border-line px-3 py-2"
                />
              </div>
            </div>
          ))}

          {quizError && <p className="text-sm text-warn">{quizError}</p>}

          {quizMessage && <p className="text-sm text-good">{quizMessage}</p>}

          <button
            type="submit"
            disabled={savingQuiz}
            className="rounded bg-accent-dark px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {savingQuiz ? 'Saving questions…' : 'Save quiz questions'}
          </button>
        </form>
      </section>
    </div>
  );
}
