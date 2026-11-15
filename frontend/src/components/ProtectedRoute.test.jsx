import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

function renderAt(path, storedUser) {
  if (storedUser) {
    localStorage.setItem('dmra_mock_user', JSON.stringify(storedUser));
  }
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<p>login page</p>} />
          <Route path="/" element={<p>student home</p>} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <p>admin page</p>
              </ProtectedRoute>
            }
          />
          <Route
            path="/modules"
            element={
              <ProtectedRoute>
                <p>modules page</p>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('ProtectedRoute', () => {
  // FU-05
  it('redirects to /login when nobody is signed in', () => {
    renderAt('/modules');

    expect(screen.getByText('login page')).toBeInTheDocument();
  });

  it('redirects a student away from an admin route to /', () => {
    renderAt('/admin', { name: 'S', role: 'student' });

    expect(screen.getByText('student home')).toBeInTheDocument();
    expect(screen.queryByText('admin page')).not.toBeInTheDocument();
  });

  it('renders an admin route for an admin', () => {
    renderAt('/admin', { name: 'A', role: 'admin' });

    expect(screen.getByText('admin page')).toBeInTheDocument();
  });

  it('renders a normal protected route for a student', () => {
    renderAt('/modules', { name: 'S', role: 'student' });

    expect(screen.getByText('modules page')).toBeInTheDocument();
  });
});
