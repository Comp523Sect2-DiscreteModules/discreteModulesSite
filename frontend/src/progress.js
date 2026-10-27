// Visual stub for student progress.
//
// The API doesn't track progress yet, so every module reports "not started".
// The module list and lecture page already render all three states, so wiring
// this up later only means replacing the body of getModuleProgress (e.g. with
// data from a future /api/progress endpoint).

export const STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};

// eslint-disable-next-line no-unused-vars
export function getModuleProgress(moduleId) {
  return { status: STATUS.NOT_STARTED, percent: 0, bestScore: null };
}
