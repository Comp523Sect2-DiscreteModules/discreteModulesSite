import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext.jsx';

function Probe() {
  const { user, signIn, signOut } = useAuth();
  return (
    <div>
      <p data-testid="who">{user ? `${user.name}:${user.role}` : 'nobody'}</p>
      <button onClick={() => signIn('Jo', 'admin')}>in</button>
      <button onClick={signOut}>out</button>
    </div>
  );
}

describe('AuthContext', () => {
  // FU-04
  it('signs in, persists the user, then signs out and clears storage', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    expect(screen.getByTestId('who')).toHaveTextContent('nobody');

    await user.click(screen.getByText('in'));
    expect(screen.getByTestId('who')).toHaveTextContent('Jo:admin');
    expect(JSON.parse(localStorage.getItem('dmra_mock_user'))).toEqual({
      name: 'Jo',
      role: 'admin',
    });

    await user.click(screen.getByText('out'));
    expect(screen.getByTestId('who')).toHaveTextContent('nobody');
    expect(localStorage.getItem('dmra_mock_user')).toBeNull();
  });

  it('restores a previously stored user on load', () => {
    localStorage.setItem(
      'dmra_mock_user',
      JSON.stringify({ name: 'Sam', role: 'student' }),
    );

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );

    expect(screen.getByTestId('who')).toHaveTextContent('Sam:student');
  });

  it('throws when useAuth is used outside the provider', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    expect(() => render(<Probe />)).toThrow(
      'useAuth must be used within AuthProvider',
    );

    consoleError.mockRestore();
  });
});
