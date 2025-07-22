import React, { useEffect, useState, useRef } from 'react';
import bookmarkLogo from '../public/bookmark.svg';
import type { Bookmark } from './api';
import {
  fetchBookmarks as apiFetchBookmarks,
  createBookmark as apiCreateBookmark,
  updateBookmark as apiUpdateBookmark,
  deleteBookmark as apiDeleteBookmark,
} from './api';

interface BookmarksPageProps {
  token: string;
  setToken: (token: string) => void;
  version?: string;
}

const BookmarksPage: React.FC<BookmarksPageProps> = ({ token, setToken, version }) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [form, setForm] = useState<Partial<Bookmark>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Bookmark>>({});
  const [showAdd, setShowAdd] = useState(false);
  const addFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem('jwt_token', token);
      fetchBookmarks();
    } else {
      localStorage.removeItem('jwt_token');
    }
    // eslint-disable-next-line
  }, [token]);

  useEffect(() => {
    if (showAdd && addFormRef.current) {
      addFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [showAdd]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.url) return;
    setLoading(true);
    setError(null);
    apiCreateBookmark(token, form as Bookmark)
      .then(() => {
        setForm({});
        setShowAdd(false);
        fetchBookmarks();
      })
      .catch((err) => setError(err.message || 'Failed to add bookmark'))
      .finally(() => setLoading(false));
  };

  const handleDelete = (id: number) => {
    if (!window.confirm('Delete this bookmark?')) return;
    setLoading(true);
    setError(null);
    apiDeleteBookmark(token, id)
      .then(() => fetchBookmarks())
      .catch((err) => setError(err.message || 'Failed to delete bookmark'))
      .finally(() => setLoading(false));
  };

  const startEdit = (bm: Bookmark) => {
    setEditingId(bm.id);
    setEditForm({ title: bm.title, url: bm.url, description: bm.description });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.title || !editForm.url || editingId == null) return;
    setLoading(true);
    setError(null);
    apiUpdateBookmark(token, editingId, editForm as Bookmark)
      .then(() => {
        setEditingId(null);
        setEditForm({});
        fetchBookmarks();
      })
      .catch((err) => setError(err.message || 'Failed to update bookmark'))
      .finally(() => setLoading(false));
  };

  const handleLogout = () => {
    setToken('');
    setBookmarks([]);
    setForm({});
    localStorage.removeItem('jwt_token');
  };

  const handleFabClick = () => {
    if (showAdd) {
      setShowAdd(false);
      setForm({});
    } else {
      setShowAdd(true);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--tekcop-bg)' }}>
      <div className="topbar">
        <span className="topbar-logo">
          <img src={bookmarkLogo} alt="Tekcop Logo" style={{ width: 36, height: 36 }} />
          Tekcop Bookmarks{version ? ` v${version}` : ''}
        </span>
        <button className="topbar-btn" onClick={handleLogout}>Logout</button>
      </div>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '2em 0' }}>
        {showAdd && (
          <form ref={addFormRef} className="card" onSubmit={handleSubmit} style={{ marginBottom: 32 }}>
            <h2 style={{ textAlign: 'center', fontWeight: 700, fontSize: 24, marginBottom: 18 }}>Add a new bookmark</h2>
            <input
              placeholder="Title"
              value={form.title || ''}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              required
            />
            <input
              placeholder="URL"
              value={form.url || ''}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              required
            />
            <input
              placeholder="Description (optional)"
              value={form.description || ''}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
            <button type="submit" disabled={loading} style={{ marginTop: 12 }}>Add</button>
          </form>
        )}
        {error && <div style={{ color: 'crimson', marginBottom: 16, textAlign: 'center' }}>{error}</div>}
        <div>
          {bookmarks.length === 0 && !loading ? (
            <div className="card" style={{ textAlign: 'center', color: '#888' }}>No bookmarks yet.</div>
          ) : (
            bookmarks.map(bm => (
              <div className="card" key={bm.id} style={{ marginBottom: 18, position: 'relative' }}>
                {editingId === bm.id ? (
                  <form onSubmit={handleEdit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input
                      value={editForm.title || ''}
                      onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                      required
                    />
                    <input
                      value={editForm.url || ''}
                      onChange={e => setEditForm(f => ({ ...f, url: e.target.value }))}
                      required
                    />
                    <input
                      value={editForm.description || ''}
                      onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                    />
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button type="submit" disabled={loading}>Save</button>
                      <button type="button" className="topbar-btn" style={{ background: 'none', color: 'var(--tekcop-red)' }} onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 18 }}>{bm.title}</span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          className="topbar-btn"
                          style={{ background: 'none', color: 'var(--tekcop-red)' }}
                          onClick={() => startEdit(bm)}
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="topbar-btn"
                          style={{ background: 'none', color: '#e53e3e' }}
                          onClick={() => handleDelete(bm.id)}
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <a
                      href={bm.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--tekcop-teal)', textDecoration: 'underline', fontSize: 15 }}
                    >
                      {bm.url}
                    </a>
                    {bm.description && <div style={{ fontSize: 14, color: '#555', marginTop: 4 }}>{bm.description}</div>}
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      {/* Floating Action Button for Add (shows/hides add form) */}
      <button
        className="fab"
        title={showAdd ? "Close add bookmark" : "Add bookmark"}
        onClick={handleFabClick}
        style={{ display: 'block' }}
      >
        {showAdd ? '×' : '+'}
      </button>
    </div>
  );
};

export default BookmarksPage; 