import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    signIn(name.trim() || (role === 'admin' ? 'Admin User' : 'Student User'), role);
    navigate(role === 'admin' ? '/admin' : '/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-2xl font-semibold text-ink mb-1">Discrete Math Review</h1>
        <p className="text-sm text-ink/60 mb-8">
          Base layer sign-in. Replace with UNC Onyen SSO before launch.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jordan Smith"
              className="w-full border border-line rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Sign in as</label>
            <div className="flex gap-3">
              {['student', 'admin'].map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex-1 border rounded px-3 py-2 text-sm capitalize transition-colors ${
                    role === r
                      ? 'border-accent-dark bg-accent/10 text-accent-dark font-medium'
                      : 'border-line text-ink/70 hover:border-ink/30'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-accent-dark text-white rounded px-3 py-2 font-medium hover:bg-accent-dark/90"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
