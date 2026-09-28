import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api.js';

export default function ModuleList() {
  const [modules, setModules] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getModules().then(setModules).catch((err) => setError(err.message));
  }, []);

  if (error) {
    return <p className="max-w-3xl mx-auto px-6 py-10 text-warn">Couldn't load modules: {error}</p>;
  }
  if (!modules) {
    return <p className="max-w-3xl mx-auto px-6 py-10 text-ink/60">Loading modules…</p>;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="font-serif text-3xl font-semibold mb-2">Modules</h1>
      <p className="text-ink/60 mb-8">
        Pick any module below — there's no order to follow and nothing to unlock.
      </p>

      {modules.length === 0 && (
        <p className="text-ink/60">No modules are published yet. Check back soon.</p>
      )}

      <ul className="space-y-3">
        {modules.map((m) => (
          <li key={m.id}>
            <Link
              to={`/modules/${m.id}`}
              className="block border border-line rounded px-5 py-4 hover:border-accent-dark transition-colors"
            >
              <h2 className="font-serif text-lg font-semibold">{m.title}</h2>
              {m.description && <p className="text-sm text-ink/60 mt-1">{m.description}</p>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
