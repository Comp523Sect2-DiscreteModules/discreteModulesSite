import { describe, it, expect, vi } from 'vitest';
import { requireAdmin } from '../src/requireAdmin.js';
import { asyncHandler } from '../src/asyncHandler.js';
import { attachUserRole } from '../src/userRole.js';

function mockRes() {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  return res;
}

describe('requireAdmin', () => {
  // BU-07
  it('returns 403 and does not continue for a student', () => {
    const res = mockRes();
    const next = vi.fn();

    requireAdmin({ userRole: 'student' }, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Admin access required.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next() once for an admin', () => {
    const res = mockRes();
    const next = vi.fn();

    requireAdmin({ userRole: 'admin' }, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe('asyncHandler', () => {
  // BU-08
  it('passes a rejected promise to next(err) instead of leaving it unhandled', async () => {
    const boom = new Error('db is down');
    const next = vi.fn();

    asyncHandler(async () => {
      throw boom;
    })({}, {}, next);
    await new Promise((resolve) => setImmediate(resolve));

    expect(next).toHaveBeenCalledWith(boom);
  });

  it('does not call next() when the handler succeeds', async () => {
    const next = vi.fn();

    asyncHandler(async () => {})({}, {}, next);
    await new Promise((resolve) => setImmediate(resolve));

    expect(next).not.toHaveBeenCalled();
  });
});

describe('attachUserRole', () => {
  function roleFor(header) {
    const req = { header: vi.fn(() => header) };
    const next = vi.fn();
    attachUserRole(req, {}, next);
    expect(req.header).toHaveBeenCalledWith('x-user-role');
    expect(next).toHaveBeenCalledTimes(1);
    return req.userRole;
  }

  // BU-09
  it('grants admin only for the exact string "admin"', () => {
    expect(roleFor('admin')).toBe('admin');
  });

  it.each(['Admin', 'ADMIN', 'root', '', undefined])(
    'treats %j as a student',
    (header) => {
      expect(roleFor(header)).toBe('student');
    },
  );
});
