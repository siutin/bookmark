import React, { useState } from 'react';
import AuthPage from './AuthPage';
import BookmarksPage from './BookmarksPage';

const version = import.meta.env.PACKAGE_VERSION;

function App() {
  const [token, setToken] = useState<string>(() => localStorage.getItem('jwt_token') || '');
  const [loading, setLoading] = useState(false);

  if (!token) {
    return <AuthPage setToken={setToken} loading={loading} setLoading={setLoading} />;
  }

  return <BookmarksPage token={token} setToken={setToken} version={version} />;
}

export default App;
