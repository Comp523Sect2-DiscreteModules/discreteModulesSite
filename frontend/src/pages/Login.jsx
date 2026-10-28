import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { BrandMark } from '../components/Navbar.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';

const ROLES = [
  { id: 'student', label: 'Student', desc: 'Modules, lectures, and quizzes' },
  { id: 'admin', label: 'Admin', desc: 'Manage modules and lessons' },
];

export default function Login() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const heroMath = useRef(null);

  useEffect(() => {
    if (window.MathJax?.typesetPromise && heroMath.current) {
      window.MathJax.typesetPromise([heroMath.current]).catch(() => {});
    }
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    signIn(
      name.trim() || (role === 'admin' ? 'Admin User' : 'Student User'),
      role,
    );
    navigate(role === 'admin' ? '/admin' : '/');
  }

  const fallbackName = role === 'admin' ? 'Admin User' : 'Student User';

  return (
    <div className="flex min-h-screen bg-page">
      <aside className="relative hidden flex-[0_0_44%] flex-col justify-between gap-10 overflow-hidden bg-hero px-14 py-11 text-[#E7F0F8] lg:flex">
        <div className="flex items-center gap-2.5">
          <span className="grid h-[34px] w-[34px] place-items-center rounded-md bg-carolina-500 font-serif text-[19px] font-semibold leading-none text-[#0E141B]">
            ∀
          </span>
          <span className="font-serif text-lg font-semibold">
            Discrete Math Review
          </span>
        </div>
        <div className="flex max-w-[460px] flex-col gap-7">
          <div
            ref={heroMath}
            className="overflow-x-auto text-[30px] text-carolina-200"
          >
            {'\\[\\forall x \\,\\big(P(x) \\rightarrow Q(x)\\big)\\]'}
          </div>
          <p className="text-balance font-serif text-[30px] leading-10 tracking-[-0.01em]">
            Lectures, worked examples, and practice quizzes for discrete math.
          </p>
        </div>
        <span className="text-sm text-[#9CC7E7]">A COMP 523 project</span>
      </aside>

      <main className="relative flex flex-1 flex-col items-center justify-center gap-5 px-4 py-10 sm:px-8">
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <ThemeToggle />
        </div>

        <div className="flex w-full max-w-[420px] items-center gap-2.5 lg:hidden">
          <BrandMark className="h-8 w-8 text-lg" />
          <span className="font-serif text-lg font-semibold">
            Discrete Math Review
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-[420px] flex-col gap-6 rounded-xl border border-line bg-surface p-6 shadow-md sm:p-9"
        >
          <div className="flex flex-col gap-1.5">
            <h1 className="font-serif text-h1">Sign in</h1>
            <p className="text-muted">Choose a role to explore the app.</p>
          </div>

          <div className="flex items-start gap-2.5 rounded-lg bg-surface-3 px-3 py-2.5 text-sm text-ink-2">
            <span className="mt-px shrink-0 rounded-[4px] bg-warning-soft px-1.5 text-[11px] font-bold leading-4 tracking-[0.06em] text-warning-ink">
              DEV
            </span>
            <span>
              Development sign-in. UNC Onyen SSO replaces this before launch.
            </span>
          </div>

          <div>
            <label htmlFor="login-name" className="label">
              Name <span className="font-normal text-muted">Optional</span>
            </label>
            <input
              id="login-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jordan Smith"
              autoComplete="name"
              className="input h-11"
            />
            <p className="hint">Leave blank to sign in as “{fallbackName}”.</p>
          </div>

          <fieldset>
            <legend className="label">Sign in as</legend>
            <div className="grid grid-cols-1 gap-2.5 min-[400px]:grid-cols-2">
              {ROLES.map((r) => {
                const on = role === r.id;
                return (
                  <label key={r.id} className="relative cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      value={r.id}
                      checked={on}
                      onChange={() => setRole(r.id)}
                      className="peer sr-only"
                    />
                    <span
                      className={`flex h-full flex-col gap-1 rounded-lg border px-3.5 py-3 transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary ${
                        on
                          ? 'border-primary bg-primary-soft shadow-[inset_0_0_0_1px_rgb(var(--c-primary))]'
                          : 'border-line-strong bg-surface hover:bg-surface-2'
                      }`}
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-ink">
                          {r.label}
                        </span>
                        <span
                          aria-hidden="true"
                          className={`h-4 w-4 shrink-0 rounded-full bg-surface ${
                            on
                              ? 'border-[5px] border-primary'
                              : 'border-[1.5px] border-line-strong'
                          }`}
                        />
                      </span>
                      <span className="text-meta text-muted">{r.desc}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <button
            type="submit"
            className="btn btn-primary h-12 w-full text-base"
          >
            Continue as {role === 'admin' ? 'Admin' : 'Student'}
          </button>
        </form>
      </main>
    </div>
  );
}
