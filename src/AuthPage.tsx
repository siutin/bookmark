import React, { useState } from 'react';
import bookmarkLogo from '../public/bookmark.svg';

interface AuthPageProps {
  setToken: (token: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ setToken, loading, setLoading }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authUser, setAuthUser] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authInvite, setAuthInvite] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

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
        // @ts-ignore
        await import('./api').then(api => api.register(authUser, authPass, authInvite));
      }
      // Login
      // @ts-ignore
      const data = await import('./api').then(api => api.login(authUser, authPass));
      setToken(data.token);
      setAuthUser('');
      setAuthPass('');
      setAuthInvite('');
      setAuthError(null);
    } catch (e: any) {
      setAuthError(e.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--tekcop-bg)' }}>
      <div className="topbar">
        <span className="topbar-logo">
          <img src={bookmarkLogo} alt="Tekcop Logo" style={{ width: 36, height: 36 }} />
          Tekcop Login
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <form className="card" style={{ maxWidth: 360, width: '100%' }} onSubmit={handleAuth}>
          <h2 style={{ textAlign: 'center', fontWeight: 700, fontSize: 28, marginBottom: 24 }}>
            {authMode === 'login' ? 'Sign in to Tekcop' : 'Create your Tekcop account'}
          </h2>
          <input
            placeholder="Username"
            value={authUser}
            onChange={e => setAuthUser(e.target.value)}
            autoFocus
            required
          />
          <input
            placeholder="Password"
            type="password"
            value={authPass}
            onChange={e => setAuthPass(e.target.value)}
            required
          />
          {authMode === 'register' && (
            <input
              placeholder="Invite Code"
              value={authInvite}
              onChange={e => setAuthInvite(e.target.value)}
              required
            />
          )}
          <button type="submit" disabled={loading} style={{ marginTop: 12 }}>
            {authMode === 'login' ? 'Login' : 'Register'}
          </button>
          <button
            type="button"
            className="topbar-btn"
            style={{ background: 'none', color: 'var(--tekcop-red)', marginTop: 8, boxShadow: 'none' }}
            onClick={() => {
              setAuthMode(authMode === 'login' ? 'register' : 'login');
              setAuthError(null);
            }}
          >
            {authMode === 'login' ? 'No account? Register' : 'Already have an account? Login'}
          </button>
          {authError && <div style={{ color: 'crimson', margin: '0.5rem 0', textAlign: 'center' }}>{authError}</div>}
        </form>
      </div>
    </div>
  );
};

export default AuthPage; 