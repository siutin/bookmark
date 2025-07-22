import React, { useEffect, useState } from 'react';

interface Bookmark {
  id: number;
  title: string;
  url: string;
  description?: string;
  previewUrl?: string;
  created_at: string;
  updated_at: string;
}

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787';

function App() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [selected, setSelected] = useState<Bookmark | null>(null);
  const [form, setForm] = useState<Partial<Bookmark>>({});
  const [token, setToken] = useState<string>(() => localStorage.getItem('jwt_token') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Auth state
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authUser, setAuthUser] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authInvite, setAuthInvite] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const version = import.meta.env.PACKAGE_VERSION;

  // Persist token to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('jwt_token', token);
    } else {
      localStorage.removeItem('jwt_token');
    }
  }, [token]);

  // Fetch bookmarks
  const fetchBookmarks = () => {
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/api/bookmarks`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async r => {
        if (r.status === 401) {
          setToken('');
          localStorage.removeItem('jwt_token');
          throw new Error('Unauthorized');
        }
        return r.json();
      })
      .then(data => setBookmarks(data))
      .catch((err) => {
        if (err.message === 'Unauthorized') {
          setError('Session expired. Please log in again.');
        } else {
          setError('Failed to load bookmarks');
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (token) fetchBookmarks();
  }, [token]);

  // Handle form submit (create or update)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const method = selected ? 'PATCH' : 'POST';
    const url = selected
      ? `${API_BASE}/api/bookmark/${selected.id}`
      : `${API_BASE}/api/bookmarks`;
    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(form)
    })
      .then(async r => {
        if (r.status === 401) {
          setToken('');
          localStorage.removeItem('jwt_token');
          throw new Error('Unauthorized');
        }
        return r.json();
      })
      .then(() => {
        setForm({});
        setSelected(null);
        fetchBookmarks();
      })
      .catch((err) => {
        if (err.message === 'Unauthorized') {
          setError('Session expired. Please log in again.');
        } else {
          setError('Failed to save bookmark');
        }
      })
      .finally(() => setLoading(false));
  };

  // Handle edit
  const handleEdit = (bm: Bookmark) => {
    setSelected(bm);
    setForm({ ...bm });
  };

  // Handle delete
  const handleDelete = (id: number) => {
    if (!window.confirm('Delete this bookmark?')) return;
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/api/bookmark/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async r => {
        if (r.status === 401) {
          setToken('');
          localStorage.removeItem('jwt_token');
          throw new Error('Unauthorized');
        }
        return r;
      })
      .then(() => fetchBookmarks())
      .catch((err) => {
        if (err.message === 'Unauthorized') {
          setError('Session expired. Please log in again.');
        } else {
          setError('Failed to delete bookmark');
        }
      })
      .finally(() => setLoading(false));
  };

  // Handle login/register
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

  // Logout
  const handleLogout = () => {
    setToken('');
    setBookmarks([]);
    setSelected(null);
    setForm({});
    localStorage.removeItem('jwt_token');
  };

  // Responsive, full-screen minimalist styles
  const buttonStyle = {
    padding: '10px 0',
    border: 'none',
    borderRadius: 8,
    background: '#222',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 8,
    fontSize: 16,
  };
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
    container: {
      width: '100%',
      maxWidth: 540,
      margin: '0 auto',
      fontFamily: 'system-ui, sans-serif',
      color: '#222',
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 2px 24px #0002',
      padding: '2rem 1rem',
      marginTop: 32,
      marginBottom: 32,
      minHeight: 400,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 24,
    },
    form: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 },
    input: {
      padding: 10,
      border: '1px solid #ccc',
      borderRadius: 8,
      fontSize: 16,
      marginBottom: 4,
    },
    button: buttonStyle,
    deleteBtn: {
      background: '#e53e3e',
      color: '#fff',
      border: 'none',
      borderRadius: 8,
      padding: '6px 12px',
      fontSize: 14,
      cursor: 'pointer',
      marginLeft: 8,
    },
    list: { margin: '0', padding: 0, width: '100%' },
    item: {
      padding: '0.75rem 0',
      borderBottom: '1px solid #eee',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 2,
      position: 'relative' as const,
    },
    itemRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    error: { color: 'crimson', margin: '0.5rem 0' },
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
    authSwitch: { color: '#06c', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, marginTop: 8 },
    logoutBtn: { ...buttonStyle, background: '#aaa', color: '#222', marginTop: 0, marginBottom: 8 },
  } as const;

  if (!token) {
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
  }

  return (
    <div style={styles.root}>
      <div style={styles.container}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h2 style={{ margin: 0 }}>
            Bookmarks{version ? ` v${version}` : ''}
          </h2>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </div>
        <form style={styles.form} onSubmit={handleSubmit}>
          <input
            style={styles.input}
            placeholder="Title"
            value={form.title || ''}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            required
          />
          <input
            style={styles.input}
            placeholder="URL"
            value={form.url || ''}
            onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
            required
          />
          <input
            style={styles.input}
            placeholder="Description (optional)"
            value={form.description || ''}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={styles.button} type="submit" disabled={loading}>
              {selected ? 'Update' : 'Add'} Bookmark
            </button>
            {selected && (
              <button
                type="button"
                style={{ ...styles.button, background: '#aaa', color: '#222' }}
                onClick={() => {
                  setSelected(null);
                  setForm({});
                }}
              >
                Cancel
        </button>
            )}
          </div>
        </form>
        {error && <div style={styles.error}>{error}</div>}
        <div style={styles.list}>
          {loading ? (
            <div>Loading...</div>
          ) : (
            bookmarks.map(bm => (
              <div
                key={bm.id}
                style={styles.item}
              >
                <div style={styles.itemRow}>
                  <span style={{ fontWeight: 600, fontSize: 17, cursor: 'pointer' }} onClick={() => handleEdit(bm)}>{bm.title}</span>
                  <button style={styles.deleteBtn} onClick={() => handleDelete(bm.id)} disabled={loading}>Delete</button>
                </div>
                <a href={bm.url} target="_blank" rel="noopener noreferrer" style={{ color: '#06c', textDecoration: 'underline', fontSize: 14 }}>{bm.url}</a>
                {bm.description && <span style={{ fontSize: 13, color: '#555' }}>{bm.description}</span>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
