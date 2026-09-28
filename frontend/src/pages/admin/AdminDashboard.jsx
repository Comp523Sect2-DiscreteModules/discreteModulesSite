import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api.js';

export default function AdminDashboard() {
  const [modules, setModules] = useState(null);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newModule, setNewModule] = useState({ slug: '', title: '', description: '' });

  function refresh() {
    api.getModules().then(setModules).catch((err) => setError(err.message));
  }

  useEffect(refresh, []);

  async function handleTogglePublish(mod) {
    await api.updateModule(mod.id, { published: !mod.published });
    refresh();
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!newModule.slug || !newModule.title) return;
    await api.createModule({ ...newModule, published: false });
    setNewModule({ slug: '', title: '', description: '' });
    setCreating(false);
    refresh();
  }

  if (error) return <p className="max-w-4xl mx-auto px-6 py-10 text-warn">{error}</p>;
  if (!modules) return <p className="max-w-4xl mx-auto px-6 py-10 text-ink/60">Loading…</p>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-serif text-3xl font-semibold">Admin dashboard</h1>
        <button
          onClick={() => setCreating((c) => !c)}
          className="text-sm border border-line rounded px-3 py-1.5 hover:border-accent-dark"
        >
          {creating ? 'Cancel' : '+ New module'}
        </button>
      </div>
      <p className="text-ink/60 mb-8">
        Create and edit modules here (US6/US7). Publishing/unpublishing controls whether
        students can see a module — there are no prerequisites or score gates by design.
      </p>

      {creating && (
        <form
          onSubmit={handleCreate}
          className="border border-line rounded px-5 py-4 mb-8 space-y-3 bg-white"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Slug (URL-safe id)</label>
            <input
              value={newModule.slug}
              onChange={(e) => setNewModule({ ...newModule, slug: e.target.value })}
              placeholder="e.g. graph-theory"
              className="w-full border border-line rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              value={newModule.title}
              onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
              placeholder="e.g. Graph Theory"
              className="w-full border border-line rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={newModule.description}
              onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
              className="w-full border border-line rounded px-3 py-2"
              rows={2}
            />
          </div>
          <button
            type="submit"
            className="bg-accent-dark text-white rounded px-4 py-2 text-sm font-medium hover:bg-accent-dark/90"
          >
            Create module (unpublished)
          </button>
        </form>
      )}

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left text-ink/50 border-b border-line">
            <th className="py-2 font-medium">Title</th>
            <th className="py-2 font-medium">Status</th>
            <th className="py-2 font-medium">Lessons</th>
            <th className="py-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {modules.map((m) => (
            <tr key={m.id} className="border-b border-line/60">
              <td className="py-3">
                <div className="font-medium">{m.title}</div>
                <div className="text-ink/50">{m.slug}</div>
              </td>
              <td className="py-3">
                <span
                  className={
                    m.published
                      ? 'inline-block px-2 py-0.5 rounded bg-good/10 text-good text-xs font-medium'
                      : 'inline-block px-2 py-0.5 rounded bg-ink/5 text-ink/50 text-xs font-medium'
                  }
                >
                  {m.published ? 'Published' : 'Draft'}
                </span>
              </td>
              <td className="py-3 text-ink/60">—</td>
              <td className="py-3 text-right space-x-3">
                <Link to={`/admin/modules/${m.id}`} className="text-accent-dark hover:underline">
                  Edit
                </Link>
                <button
                  onClick={() => handleTogglePublish(m)}
                  className="text-ink/60 hover:text-ink"
                >
                  {m.published ? 'Unpublish' : 'Publish'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
