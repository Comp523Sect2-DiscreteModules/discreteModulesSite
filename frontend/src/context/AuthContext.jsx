import { createContext, useContext, useEffect, useState } from 'react';

// This is a stand-in for real Onyen/SSO-based authentication (see spec
// section 3.3). For the base layer, "signing in" just means picking a role
// on a local screen; the chosen role is sent to the API as the x-user-role
// header (see backend/src/server.js) so admin routes can be gated.
// Replace this whole file with a real session once SSO integration lands.

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('dmra_mock_user');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('dmra_mock_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('dmra_mock_user');
    }
  }, [user]);

  const signIn = (name, role) => setUser({ name, role });
  const signOut = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
