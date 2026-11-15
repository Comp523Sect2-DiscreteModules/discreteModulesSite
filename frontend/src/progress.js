// Student progress, saved in this browser's localStorage.
//
// The API doesn't track progress yet, so it lives on the device, keyed by the
// signed-in name so two people sharing a browser keep separate progress. When
// a real /api/progress endpoint exists, only the load/save helpers below need
// to change; the rest of the app just calls the exported functions.
//
// Lifecycle of a module:
//   not started -> in progress (student opens it)
//   in progress -> completed   (scrolls to the end, or opens the practice quiz)

export const STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};

// Scrolling this far through a lesson counts as having finished it.
export const FINISHED_AT = 0.97;

function storageKey() {
  try {
    const user = JSON.parse(localStorage.getItem('dmra_mock_user'));
    return `dmra_progress:${user?.name ?? 'anonymous'}`;
  } catch {
    return 'dmra_progress:anonymous';
  }
}

function load() {
  try {
    return JSON.parse(localStorage.getItem(storageKey())) ?? {};
  } catch {
    return {};
  }
}

function save(all) {
  try {
    localStorage.setItem(storageKey(), JSON.stringify(all));
  } catch {
    /* storage unavailable: progress just won't persist */
  }
}

const EMPTY = { status: STATUS.NOT_STARTED, percent: 0, bestScore: null };

export function getModuleProgress(moduleId) {
  const entry = load()[moduleId];
  if (!entry) return EMPTY;
  return {
    status: entry.status ?? STATUS.NOT_STARTED,
    percent: entry.status === STATUS.COMPLETED ? 100 : (entry.percent ?? 0),
    bestScore: entry.bestScore ?? null,
  };
}

function update(moduleId, change) {
  const all = load();
  const current = all[moduleId] ?? { ...EMPTY };
  const next = change(current);
  if (next !== current) {
    all[moduleId] = next;
    save(all);
  }
}

// The student opened the module. Never moves a completed module backwards.
export function markStarted(moduleId) {
  update(moduleId, (p) =>
    p.status === STATUS.NOT_STARTED ? { ...p, status: STATUS.IN_PROGRESS } : p,
  );
}

// Record how far (0-1) the student has read. Only ever moves forward, and
// reaching the end completes the module.
export function recordReading(moduleId, fraction) {
  if (fraction >= FINISHED_AT) return markCompleted(moduleId);
  const percent = Math.round(Math.min(1, Math.max(0, fraction)) * 100);
  update(moduleId, (p) => {
    if (p.status === STATUS.COMPLETED) return p;
    if (p.status === STATUS.IN_PROGRESS && percent <= p.percent) return p;
    return { ...p, status: STATUS.IN_PROGRESS, percent };
  });
}

export function markCompleted(moduleId) {
  update(moduleId, (p) =>
    p.status === STATUS.COMPLETED
      ? p
      : { ...p, status: STATUS.COMPLETED, percent: 100 },
  );
}
