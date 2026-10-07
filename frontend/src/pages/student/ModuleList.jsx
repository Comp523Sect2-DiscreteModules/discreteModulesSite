import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api.js';

export default function ModuleList() {
  const [modules, setModules] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .getModules()
      .then(setModules)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <p className="mx-auto max-w-3xl px-6 py-10 text-warn">
        Couldn't load modules: {error}
      </p>
    );
  }
  if (!modules) {
    return (
      <p className="mx-auto max-w-3xl px-6 py-10 text-ink/60">
        Loading modules…
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-2 font-serif text-3xl font-semibold">Modules</h1>
      <p className="mb-8 text-ink/60">
        Pick any module below — there's no order to follow and nothing to
        unlock.
      </p>

      {modules.length === 0 && (
        <p className="text-ink/60">
          No modules are published yet. Check back soon.
        </p>
      )}

      <ul className="space-y-3">
        {modules.map((m) => (
          <li key={m.id}>
            <Link
              to={`/modules/${m.id}`}
              className="block rounded border border-line px-5 py-4 transition-colors hover:border-accent-dark"
            >
              <h2 className="font-serif text-lg font-semibold">{m.title}</h2>
              {m.description && (
                <p className="mt-1 text-sm text-ink/60">{m.description}</p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
