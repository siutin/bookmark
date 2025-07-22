import React, { useState } from 'react';

interface AuthPageProps {
  setToken: (token: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787';

const AuthPage: React.FC<AuthPageProps> = ({ setToken, loading, setLoading }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authUser, setAuthUser] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authInvite, setAuthInvite] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const styles = {
    root: {
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)',
      margin: 0,
      padding: 0,
      boxSizing: 'border-box' as const,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
    },
    authBox: {
      maxWidth: 340,
      margin: '4rem auto',
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 2px 24px #0002',
      padding: '2rem 1.5rem',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 16,
      alignItems: 'stretch',
    },
    authTitle: { textAlign: 'center', margin: 0, color: '#222' },
    input: {
      padding: 10,
      border: '1px solid #ccc',
      borderRadius: 8,
      fontSize: 16,
      marginBottom: 4,
    },
    button: {
      padding: '10px 0',
      border: 'none',
      borderRadius: 8,
      background: '#222',
      color: '#fff',
      fontWeight: 600,
      cursor: 'pointer',
      marginTop: 8,
      fontSize: 16,
    },
    authSwitch: { color: '#06c', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, marginTop: 8 },
    error: { color: 'crimson', margin: '0.5rem 0' },
  } as const;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!authUser || !authPass || (authMode === 'register' && !authInvite)) {
      setAuthError('Username, password, and invite code required');
      return;
    }
    setLoading(true);
    try {
      if (authMode === 'register') {
        const res = await fetch(`${API_BASE}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: authUser, password: authPass, inviteCode: authInvite })
        });
        if (!res.ok) {
          const data = await res.json();
          setAuthError(data.error || 'Registration failed');
          setLoading(false);
          return;
        }
      }
      // Login
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: authUser, password: authPass })
      });
      const data = await res.json();
      if (!res.ok || !data.token) {
        setAuthError(data.error || 'Login failed');
        setLoading(false);
        return;
      }
      setToken(data.token);
      setAuthUser('');
      setAuthPass('');
      setAuthInvite('');
      setAuthError(null);
    } catch (e) {
      setAuthError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      <form style={styles.authBox} onSubmit={handleAuth}>
        <h2 style={styles.authTitle}>{authMode === 'login' ? 'Login' : 'Register'}</h2>
        <input
          style={styles.input}
          placeholder="Username"
          value={authUser}
          onChange={e => setAuthUser(e.target.value)}
          autoFocus
          required
        />
        <input
          style={styles.input}
          placeholder="Password"
          type="password"
          value={authPass}
          onChange={e => setAuthPass(e.target.value)}
          required
        />
        {authMode === 'register' && (
          <input
            style={styles.input}
            placeholder="Invite Code"
            value={authInvite}
            onChange={e => setAuthInvite(e.target.value)}
            required
          />
        )}
        <button style={styles.button} type="submit" disabled={loading}>
          {authMode === 'login' ? 'Login' : 'Register'}
        </button>
        <button
          type="button"
          style={styles.authSwitch}
          onClick={() => {
            setAuthMode(authMode === 'login' ? 'register' : 'login');
            setAuthError(null);
          }}
        >
          {authMode === 'login' ? 'No account? Register' : 'Already have an account? Login'}
        </button>
        {authError && <div style={styles.error}>{authError}</div>}
      </form>
    </div>
  );
};

export default AuthPage; 