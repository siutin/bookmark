import React, { useEffect, useState } from 'react';
import {
  fetchBookmarks as apiFetchBookmarks,
  createBookmark as apiCreateBookmark,
  updateBookmark as apiUpdateBookmark,
  deleteBookmark as apiDeleteBookmark,
} from './api';
import type { Bookmark } from './api';

interface BookmarksPageProps {
  token: string;
  setToken: (token: string) => void;
  version?: string;
}

const BookmarksPage: React.FC<BookmarksPageProps> = ({ token, setToken, version }) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [selected, setSelected] = useState<Bookmark | null>(null);
  const [form, setForm] = useState<Partial<Bookmark>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Bookmark>>({});

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
    apiFetchBookmarks(token)
      .then(data => setBookmarks(data))
      .catch((err) => {
        if (err.message === 'Unauthorized') {
          setToken('');
          localStorage.removeItem('jwt_token');
          setError('Session expired. Please log in again.');
        } else {
          setError(err.message || 'Failed to load bookmarks');
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (token) fetchBookmarks();
    // eslint-disable-next-line
  }, [token]);

  // Handle form submit (create or update)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    (selected
      ? apiUpdateBookmark(token, selected.id, form)
      : apiCreateBookmark(token, form))
      .then(() => {
        setForm({});
        setSelected(null);
        fetchBookmarks();
      })
      .catch((err) => {
        if (err.message === 'Unauthorized') {
          setToken('');
          localStorage.removeItem('jwt_token');
          setError('Session expired. Please log in again.');
        } else {
          setError(err.message || 'Failed to save bookmark');
        }
      })
      .finally(() => setLoading(false));
  };

  // Handle edit (open edit form for item)
  const startEdit = (bm: Bookmark) => {
    setEditingId(bm.id);
    setEditForm({ title: bm.title, url: bm.url, description: bm.description || '' });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };
  const saveEdit = async (bm: Bookmark) => {
    setLoading(true);
    setError(null);
    apiUpdateBookmark(token, bm.id, editForm)
      .then(() => {
        setEditingId(null);
        setEditForm({});
        fetchBookmarks();
      })
      .catch((err) => {
        if (err.message === 'Unauthorized') {
          setToken('');
          localStorage.removeItem('jwt_token');
          setError('Session expired. Please log in again.');
        } else {
          setError(err.message || 'Failed to update bookmark');
        }
      })
      .finally(() => setLoading(false));
  };

  // Handle delete
  const handleDelete = (id: number) => {
    if (!window.confirm('Delete this bookmark?')) return;
    setLoading(true);
    setError(null);
    apiDeleteBookmark(token, id)
      .then(() => fetchBookmarks())
      .catch((err) => {
        if (err.message === 'Unauthorized') {
          setToken('');
          localStorage.removeItem('jwt_token');
          setError('Session expired. Please log in again.');
        } else {
          setError(err.message || 'Failed to delete bookmark');
        }
      })
      .finally(() => setLoading(false));
  };

  // Logout
  const handleLogout = () => {
    setToken('');
    setBookmarks([]);
    setSelected(null);
    setForm({});
    localStorage.removeItem('jwt_token');
  };

  // Drag and drop handlers for the form
  const handleFormDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleFormDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleFormDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Try to get URL from dropped data
    const url = e.dataTransfer.getData('text/uri-list') || e.dataTransfer.getData('text/plain');
    let title = '';
    // Try to get title from HTML if available
    const html = e.dataTransfer.getData('text/html');
    if (html) {
      const match = html.match(/<a [^>]*>(.*?)<\/a>/i);
      if (match) {
        title = match[1];
      }
    }
    if (url) {
      setForm(f => ({ ...f, url, title: title || f.title || '' }));
    }
  };

  // Styles (same as before)
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
    logoutBtn: { ...buttonStyle, background: '#aaa', color: '#222', marginTop: 0, marginBottom: 8 },
  } as const;

  return (
    <div style={styles.root}>
      <div style={styles.container}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h2 style={{ margin: 0 }}>
            Bookmarks{version ? ` v${version}` : ''}
          </h2>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
        <form
          style={{
            ...styles.form,
            outline: isDragging ? '2px solid #3182ce' : undefined,
            outlineOffset: isDragging ? 2 : undefined,
            transition: 'outline 0.2s',
          }}
          onSubmit={handleSubmit}
          onDragOver={handleFormDragOver}
          onDragLeave={handleFormDragLeave}
          onDrop={handleFormDrop}
        >
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
                {editingId === bm.id ? (
                  <form
                    style={{ ...styles.form, margin: 0, gap: 10 }}
                    onSubmit={e => { e.preventDefault(); saveEdit(bm); }}
                  >
                    <input
                      style={styles.input}
                      placeholder="Title"
                      value={editForm.title || ''}
                      onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                      required
                      autoFocus
                    />
                    <input
                      style={styles.input}
                      placeholder="URL"
                      value={editForm.url || ''}
                      onChange={e => setEditForm(f => ({ ...f, url: e.target.value }))}
                      required
                    />
                    <input
                      style={styles.input}
                      placeholder="Description (optional)"
                      value={editForm.description || ''}
                      onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={styles.button} type="submit" disabled={loading}>Save</button>
                      <button
                        type="button"
                        style={{ ...styles.button, background: '#aaa', color: '#222' }}
                        onClick={cancelEdit}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div style={styles.itemRow}>
                      <span style={{ fontWeight: 600, fontSize: 17 }}>{bm.title}</span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          style={{ background: '#eee', color: '#222', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 14, cursor: 'pointer' }}
                          onClick={() => startEdit(bm)}
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button style={styles.deleteBtn} onClick={() => handleDelete(bm.id)} disabled={loading}>Delete</button>
                      </div>
                    </div>
                    <a
                      href={bm.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#06c', textDecoration: 'underline', fontSize: 14 }}
                    >
                      {bm.url}
                    </a>
                    {bm.description && <span style={{ fontSize: 13, color: '#555' }}>{bm.description}</span>}
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BookmarksPage; 