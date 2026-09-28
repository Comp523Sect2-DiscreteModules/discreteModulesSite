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

  function refresh() {
    api.getModule(moduleId).then(setModule).catch((err) => setError(err.message));
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
      content_md: 'Write lesson content here using Markdown. Use `$...$` for inline LaTeX\nand `$$...$$` for display LaTeX, e.g. $$\\int_0^1 x\\,dx = \\tfrac{1}{2}$$.',
    });
    refresh();
  }

  if (error) return <p className="max-w-3xl mx-auto px-6 py-10 text-warn">{error}</p>;
  if (!module) return <p className="max-w-3xl mx-auto px-6 py-10 text-ink/60">Loading…</p>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link to="/admin" className="text-sm text-accent-dark hover:underline">
        &larr; Admin dashboard
      </Link>

      <h1 className="font-serif text-3xl font-semibold mt-3 mb-6">Edit module</h1>

      <div className="space-y-4 mb-10 border border-line rounded px-5 py-4 bg-white">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            defaultValue={module.title}
            onBlur={(e) => handleModuleFieldSave('title', e.target.value)}
            className="w-full border border-line rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            defaultValue={module.description}
            onBlur={(e) => handleModuleFieldSave('description', e.target.value)}
            rows={2}
            className="w-full border border-line rounded px-3 py-2"
          />
        </div>
        {savingModule && <p className="text-xs text-ink/40">Saving…</p>}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl font-semibold">Lessons</h2>
        <button
          onClick={addLesson}
          className="text-sm border border-line rounded px-3 py-1.5 hover:border-accent-dark"
        >
          + Add lesson
        </button>
      </div>

      <div className="space-y-6">
        {module.lessons.map((lesson) => (
          <div key={lesson.id} className="border border-line rounded px-5 py-4 bg-white">
            <h3 className="font-medium mb-3">{lesson.title}</h3>

            {editingLessonId === lesson.id ? (
              <div className="space-y-3">
                <textarea
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  rows={10}
                  className="w-full border border-line rounded px-3 py-2 font-mono text-sm"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => saveLesson(lesson)}
                    className="bg-accent-dark text-white rounded px-4 py-1.5 text-sm font-medium hover:bg-accent-dark/90"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingLessonId(null)}
                    className="text-ink/60 text-sm hover:text-ink"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="border-t border-line pt-3 mb-3">
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
          <p className="text-ink/60 text-sm">No lessons yet — add one above.</p>
        )}
      </div>
    </div>
  );
}
