document.addEventListener('DOMContentLoaded', () => {
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const status = document.getElementById('status');
  const saveBtn = document.getElementById('saveBtn');
  const clearSessionBtn = document.getElementById('clearSessionBtn');
  const loginForm = document.getElementById('login-form');
  const serverEndpointSpan = document.getElementById('serverEndpoint');
  const extVersionSpan = document.getElementById('extVersion');

  // Display server endpoint
  serverEndpointSpan.textContent = import.meta.env.VITE_API_BASE || 'Not set';

  // Display extension version from manifest
  chrome.runtime.getManifest && extVersionSpan && (extVersionSpan.textContent = chrome.runtime.getManifest().version || '');

  function showLoginForm() {
    loginForm.style.display = '';
    clearSessionBtn.style.display = 'none';
  }

  function showClearSession() {
    loginForm.style.display = 'none';
    clearSessionBtn.style.display = '';
  }

  // Check for token and update UI
  chrome.storage.local.get(['tekcop_token', 'tekcop_username'], ({ tekcop_token, tekcop_username }) => {
    if (tekcop_token) {
      showClearSession();
    } else {
      showLoginForm();
      if (tekcop_username) usernameInput.value = tekcop_username;
    }
  });

  saveBtn.onclick = async () => {
    const username = usernameInput.value;
    const password = passwordInput.value;
    status.textContent = '';
    status.style.color = '';
    if (!username || !password) {
      status.textContent = 'Please enter both username and password.';
      status.style.color = 'red';
      return;
    }
    try {
      const apiBase = import.meta.env.VITE_API_BASE;
      const res = await fetch(`${apiBase}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      await chrome.storage.local.set({ tekcop_token: data.token, tekcop_username: username });
      status.textContent = 'Login successful!';
      status.style.color = 'green';
      showClearSession();
      setTimeout(() => { status.textContent = ''; }, 2000);
    } catch (err) {
      status.textContent = err.message || 'Login failed.';
      status.style.color = 'red';
    }
  };

  clearSessionBtn.onclick = () => {
    chrome.storage.local.remove(['tekcop_token', 'tekcop_username'], () => {
      status.textContent = 'Session cleared!';
      status.style.color = 'green';
      showLoginForm();
      setTimeout(() => { status.textContent = ''; }, 2000);
    });
  };
}); 