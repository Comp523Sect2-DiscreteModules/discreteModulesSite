import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  function handleSignOut() {
    signOut();
    navigate('/login');
  }

  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link to="/" className="font-serif text-xl font-semibold text-ink">
          Discrete Math Review
        </Link>

        {user && (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-ink/70">
              {user.name} &middot;{' '}
              {user.role === 'admin' ? 'Administrator' : 'Student'}
            </span>
            {user.role === 'admin' && (
              <Link to="/admin" className="text-accent-dark hover:underline">
                Admin dashboard
              </Link>
            )}
            {user.role === 'admin' && (
              <Link to="/" className="text-accent-dark hover:underline">
                Student view
              </Link>
            )}
            <button
              onClick={handleSignOut}
              className="rounded border border-line px-3 py-1 text-ink/60 hover:text-ink"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
