// --- Base-layer "auth" ---
// There is no real session/identity system yet (Onyen SSO is a separate,
// larger task). The frontend's mock login screen sets a role and sends it
// on every request as `x-user-role`. This middleware just reads that header
// so route handlers can gate admin-only actions. Replace this with real
// session/JWT-based auth once SSO is wired up.
//
// Only the exact string "admin" grants admin; anything else is a student.
export function attachUserRole(req, _res, next) {
  req.userRole = req.header('x-user-role') === 'admin' ? 'admin' : 'student';
  next();
}
