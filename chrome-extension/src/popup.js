const apiBase = import.meta.env.VITE_API_BASE;

const loginSection = document.getElementById('login-section');
const bookmarkSection = document.getElementById('bookmark-section');
const status = document.getElementById('status');
const bookmarkStatus = document.getElementById('bookmark-status');

function showLogin() {
  loginSection.style.display = '';
  bookmarkSection.style.display = 'none';
  status.textContent = '';
  bookmarkStatus.textContent = '';
}

function showBookmark() {
  loginSection.style.display = 'none';
  bookmarkSection.style.display = '';
  status.textContent = '';
  bookmarkStatus.textContent = '';
}

// Check token on load
chrome.storage.local.get(['tekcop_token'], ({ tekcop_token }) => {
  if (tekcop_token) {
    showBookmark();
  } else {
    showLogin();
  }
});

document.getElementById('loginBtn').onclick = async () => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  status.textContent = '';
  try {
    const res = await fetch(`${apiBase}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    await chrome.storage.local.set({ tekcop_token: data.token });
    status.textContent = 'Login successful!';
    status.style.color = 'green';
    showBookmark();
  } catch (err) {
    status.textContent = err.message;
    status.style.color = 'red';
  }
};

document.getElementById('logoutBtn').onclick = async () => {
  await chrome.storage.local.remove('tekcop_token');
  showLogin();
};

document.getElementById('saveBookmarkBtn').onclick = async () => {
  bookmarkStatus.textContent = '';
  chrome.storage.local.get(['tekcop_token'], async ({ tekcop_token }) => {
    if (!tekcop_token) {
      showLogin();
      return;
    }
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0];
      if (!tab || !tab.url || !tab.title) {
        bookmarkStatus.textContent = 'Could not get tab info.';
        bookmarkStatus.style.color = 'red';
        return;
      }
      try {
        const res = await fetch(`${apiBase}/api/bookmarks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tekcop_token}`
          },
          body: JSON.stringify({
            title: tab.title,
            url: tab.url
          })
        });
        if (res.status === 401) throw new Error('Unauthorized');
        const data = await res.json();
        bookmarkStatus.textContent = 'Page saved!';
        bookmarkStatus.style.color = 'green';
      } catch (err) {
        let msg = err.message === 'Unauthorized' ? 'Please log in again.' : 'Failed to save page.';
        bookmarkStatus.textContent = msg;
        bookmarkStatus.style.color = 'red';
        if (err.message === 'Unauthorized') {
          await chrome.storage.local.remove('tekcop_token');
          showLogin();
        }
      }
    });
  });
}; 