import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api.js';
import { STATUS, getModuleProgress } from '../../progress.js';
import { ArrowRightIcon, CheckIcon } from '../../components/Icons.jsx';
import {
  EmptyState,
  ErrorState,
  PageShell,
  ProgressBadge,
  Skeleton,
} from '../../components/ui.jsx';

const ACTION = {
  [STATUS.COMPLETED]: 'Review',
  [STATUS.IN_PROGRESS]: 'Continue',
  [STATUS.NOT_STARTED]: 'Start',
};

export default function ModuleList() {
  const [modules, setModules] = useState(null);
  const [error, setError] = useState(null);

  function load() {
    setError(null);
    setModules(null);
    api
      .getModules()
      .then(setModules)
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  const items = (modules ?? []).map((m, i) => ({
    ...m,
    num: String(i + 1).padStart(2, '0'),
    progress: getModuleProgress(m.id),
  }));

  return (
    <PageShell>
      <header className="mb-7 flex max-w-[720px] flex-col gap-2 sm:mb-9">
        <span className="eyebrow text-primary-ink">Your learning path</span>
        <h1 className="font-serif text-h1 sm:text-display">Modules</h1>
        <p className="text-[17px] leading-[26px] text-muted">
          Pick any module below — there's no order to follow and nothing to
          unlock.
        </p>
      </header>

      {error && (
        <div className="max-w-[760px]">
          <ErrorState
            title="Couldn't load modules"
            message={error}
            onRetry={load}
          />
        </div>
      )}

      {!error && !modules && <ModuleListSkeleton />}

      {modules && modules.length === 0 && (
        <div className="max-w-[760px]">
          <EmptyState title="No modules yet">
            No modules are published yet. Check back soon.
          </EmptyState>
        </div>
      )}

      {items.length > 0 && (
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1">
            <ProgressSummary items={items} />
            <NextUpCard items={items} />
          </aside>

          <ol className="flex min-w-0 flex-col lg:col-start-1 lg:row-start-1">
            {items.map((m, i) => (
              <PathItem key={m.id} module={m} isLast={i === items.length - 1} />
            ))}
          </ol>
        </div>
      )}
    </PageShell>
  );
}

function PathMarker({ status, num }) {
  if (status === STATUS.COMPLETED) {
    return (
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-success text-primary-fg">
        <CheckIcon className="h-4 w-4" />
      </span>
    );
  }
  if (status === STATUS.IN_PROGRESS) {
    return (
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-fg ring-4 ring-primary-soft-2">
        {num}
      </span>
    );
  }
  return (
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-[1.5px] border-line-strong bg-surface text-sm font-semibold text-ink-2">
      {num}
    </span>
  );
}

function PathItem({ module: m, isLast }) {
  const { status, percent, bestScore } = m.progress;

  return (
    <li className="grid grid-cols-[36px_minmax(0,1fr)] gap-3 sm:gap-[18px]">
      <div className="flex flex-col items-center pt-5" aria-hidden="true">
        <PathMarker status={status} num={m.num} />
        {!isLast && <span className="mt-1.5 min-h-5 w-0.5 flex-1 bg-line" />}
      </div>

      <Link
        to={`/modules/${m.id}`}
        className="group mb-3.5 flex flex-col gap-3 rounded-[14px] border border-line bg-surface px-4 py-[18px] shadow-xs transition-[border-color,box-shadow] duration-200 hover:border-primary-line hover:shadow-md sm:px-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="eyebrow text-muted">Module {m.num}</span>
            <h2 className="font-serif text-[21px] font-semibold leading-7">
              {m.title}
            </h2>
            {m.description && (
              <p className="text-[15px] leading-[22px] text-muted">
                {m.description}
              </p>
            )}
          </div>
          <ProgressBadge status={status} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          {status === STATUS.IN_PROGRESS && (
            <ProgressBar
              percent={percent}
              className="min-w-[140px] max-w-[320px] flex-1"
            />
          )}
          {status === STATUS.COMPLETED && bestScore && (
            <span className="whitespace-nowrap text-sm text-muted">
              Best quiz score{' '}
              <strong className="text-ink-2">{bestScore}</strong>
            </span>
          )}
          {status === STATUS.NOT_STARTED && (
            <span className="text-sm text-muted">
              Lecture and practice quiz
            </span>
          )}
          <span className="ml-auto inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-primary">
            {ACTION[status]}
            <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </li>
  );
}

function ProgressBar({ percent, className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        role="progressbar"
        aria-label="Module progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3"
      >
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="text-meta font-semibold text-ink-2">{percent}%</span>
    </div>
  );
}

function ProgressSummary({ items }) {
  const count = (s) => items.filter((m) => m.progress.status === s).length;
  const done = count(STATUS.COMPLETED);
  const active = count(STATUS.IN_PROGRESS);
  const fresh = count(STATUS.NOT_STARTED);

  const segColor = {
    [STATUS.COMPLETED]: 'bg-success',
    [STATUS.IN_PROGRESS]: 'bg-primary',
    [STATUS.NOT_STARTED]: 'bg-surface-3',
  };

  return (
    <div className="card flex flex-col gap-3.5 rounded-xl p-5">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold">Your progress</span>
        <span className="text-sm text-muted">
          {done} of {items.length} complete
        </span>
      </div>
      <div className="flex h-2 gap-1" aria-hidden="true">
        {items.map((m) => (
          <span
            key={m.id}
            className={`flex-1 rounded-full ${segColor[m.progress.status]}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-meta text-ink-2">
        <Legend dot="bg-success" label={`${done} completed`} />
        <Legend dot="bg-primary" label={`${active} in progress`} />
        <Legend dot="bg-line-strong" label={`${fresh} not started`} />
      </div>
    </div>
  );
}

function Legend({ dot, label }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden="true" />
      {label}
    </span>
  );
}

// The one obvious next action: resume the first in-progress module, else
// suggest the first one not started yet.
function NextUpCard({ items }) {
  const resume = items.find((m) => m.progress.status === STATUS.IN_PROGRESS);
  const next =
    resume ?? items.find((m) => m.progress.status === STATUS.NOT_STARTED);
  if (!next) return null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-primary-line bg-surface p-5 shadow-md">
      <span className="eyebrow text-primary-ink">
        {resume ? 'Pick up where you left off' : 'Suggested next'}
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="font-serif text-[22px] font-semibold leading-[30px]">
          {next.title}
        </h2>
        {next.description && (
          <p className="text-[15px] leading-[22px] text-muted">
            {next.description}
          </p>
        )}
      </div>
      {resume && <ProgressBar percent={next.progress.percent} />}
      <Link to={`/modules/${next.id}`} className="btn btn-primary w-full">
        {resume ? 'Continue lesson' : 'Start module'}
        <ArrowRightIcon />
      </Link>
    </div>
  );
}

function ModuleListSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex max-w-[760px] flex-col gap-3.5"
    >
      <span className="sr-only">Loading modules…</span>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="grid grid-cols-[36px_minmax(0,1fr)] gap-4"
          aria-hidden="true"
        >
          <Skeleton className="mt-5 h-8 w-8 rounded-full" />
          <div className="card flex flex-col gap-2.5 rounded-[14px] px-6 py-5">
            <Skeleton className="h-2.5 w-[70px]" />
            <Skeleton className="h-[18px] w-[42%]" />
            <Skeleton className="h-3 w-[78%]" />
          </div>
        </div>
      ))}
    </div>
  );
}
