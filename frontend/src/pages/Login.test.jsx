import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext.jsx';
import Login from './Login.jsx';

function renderLogin() {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<p>student home</p>} />
          <Route path="/admin" element={<p>admin home</p>} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

const storedUser = () => JSON.parse(localStorage.getItem('dmra_mock_user'));

describe('Login', () => {
  // FU-06
  it('signs in a blank-name student as "Student User" and goes to /', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(
      screen.getByRole('button', { name: 'Continue as Student' }),
    );

    expect(screen.getByText('student home')).toBeInTheDocument();
    expect(storedUser()).toEqual({ name: 'Student User', role: 'student' });
  });

  it('signs in a blank-name admin as "Admin User" and goes to /admin', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('radio', { name: /Admin/ }));
    await user.click(screen.getByRole('button', { name: 'Continue as Admin' }));

    expect(screen.getByText('admin home')).toBeInTheDocument();
    expect(storedUser()).toEqual({ name: 'Admin User', role: 'admin' });
  });

  it('uses the typed name, trimmed', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/^Name/), '  Jo  ');
    await user.click(
      screen.getByRole('button', { name: 'Continue as Student' }),
    );

    expect(storedUser().name).toBe('Jo');
  });
});
