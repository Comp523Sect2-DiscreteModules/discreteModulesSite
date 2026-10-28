// Shared presentational pieces: status badges, empty/error/loading states.
import { STATUS } from '../progress.js';
import { AlertIcon, CheckIcon } from './Icons.jsx';

export function ProgressBadge({ status }) {
  if (status === STATUS.COMPLETED) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-success-soft px-2.5 py-0.5 text-meta font-semibold text-success-ink">
        <CheckIcon className="h-3.5 w-3.5" />
        Completed
      </span>
    );
  }
  if (status === STATUS.IN_PROGRESS) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-primary-soft px-2.5 py-0.5 text-meta font-semibold text-primary-ink">
        <span
          className="h-[7px] w-[7px] rounded-full bg-primary"
          aria-hidden="true"
        />
        In progress
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-line px-2.5 py-0.5 text-meta font-semibold text-ink-2">
      <span
        className="h-[7px] w-[7px] rounded-full border-[1.5px] border-faint"
        aria-hidden="true"
      />
      Not started
    </span>
  );
}

export function PublishBadge({ published }) {
  return published ? (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm bg-success-soft px-2 py-0.5 text-xs font-semibold text-success-ink">
      <span
        className="h-1.5 w-1.5 rounded-full bg-success"
        aria-hidden="true"
      />
      Published
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-sm bg-warning-soft px-2 py-0.5 text-xs font-semibold text-warning-ink">
      <span
        className="h-1.5 w-1.5 rounded-full bg-warning"
        aria-hidden="true"
      />
      Draft
    </span>
  );
}

export function EmptyState({ glyph = '∅', title, children, action }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border-[1.5px] border-dashed border-line-strong bg-surface px-6 py-12 text-center">
      <span
        aria-hidden="true"
        className="mb-1 grid h-12 w-12 place-items-center rounded-full bg-primary-soft font-serif text-2xl text-primary"
      >
        {glyph}
      </span>
      <p className="text-[17px] font-semibold text-ink">{title}</p>
      {children && (
        <p className="max-w-md text-[15px] text-muted">{children}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function ErrorState({ title, message, onRetry }) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-4 rounded-lg border border-danger-line bg-danger-soft px-5 py-4"
    >
      <AlertIcon className="h-6 w-6 shrink-0 text-danger" />
      <div className="min-w-[12rem] flex-1">
        <p className="font-semibold text-danger-ink">{title}</p>
        {message && <p className="text-sm text-danger-ink">{message}</p>}
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn btn-sm border border-danger-line bg-surface text-danger-ink hover:bg-danger-soft"
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return (
    <span
      className={`block rounded-sm bg-surface-3 motion-safe:animate-pulse ${className}`}
    />
  );
}

export function PageShell({ children, className = '' }) {
  return (
    <main
      className={`mx-auto max-w-shell px-4 pb-16 pt-7 sm:px-6 sm:pt-10 lg:px-8 ${className}`}
    >
      {children}
    </main>
  );
}
