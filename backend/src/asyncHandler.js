// Express route handlers that are `async` don't have their rejections
// caught automatically (pre-Express 5). If a query throws — bad
// credentials, a missing table, a dropped connection — the rejection goes
// unhandled, and on modern Node that CRASHES THE WHOLE PROCESS rather than
// just failing the one request. Wrapping every async handler with this
// forwards the error to Express's error middleware instead.
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
