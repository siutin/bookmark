const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8787';

export interface Bookmark {
  id: number;
  title: string;
  url: string;
  description?: string;
  previewUrl?: string;
  created_at: string;
  updated_at: string;
}

export async function login(username: string, password: string) {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function register(username: string, password: string, inviteCode: string) {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, inviteCode })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  return data;
}

export async function fetchBookmarks(token: string): Promise<Bookmark[]> {
  const res = await fetch(`${API_BASE}/api/bookmarks`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (res.status === 401) throw new Error('Unauthorized');
  if (!res.ok) throw new Error('Failed to load bookmarks');
  return res.json();
}

export async function createBookmark(token: string, data: Partial<Bookmark>) {
  const res = await fetch(`${API_BASE}/api/bookmarks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (res.status === 401) throw new Error('Unauthorized');
  if (!res.ok) throw new Error('Failed to create bookmark');
  return res.json();
}

export async function updateBookmark(token: string, id: number, data: Partial<Bookmark>) {
  const res = await fetch(`${API_BASE}/api/bookmark/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (res.status === 401) throw new Error('Unauthorized');
  if (!res.ok) throw new Error('Failed to update bookmark');
  return res.json();
}

export async function deleteBookmark(token: string, id: number) {
  const res = await fetch(`${API_BASE}/api/bookmark/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (res.status === 401) throw new Error('Unauthorized');
  if (!res.ok) throw new Error('Failed to delete bookmark');
  return true;
} 