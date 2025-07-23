// Helper to check token validity (simple check, can be improved)
async function isTokenValid() {
  const { tekcop_token } = await chrome.storage.local.get('tekcop_token');
  if (!tekcop_token) return false;
  // Optionally, add a real validation (e.g., decode JWT, check expiry)
  return true;
}

// Set popup or not based on token state for the current tab
async function updatePopup(tabId) {
  const valid = await isTokenValid();
  if (valid) {
    // No popup, direct save
    chrome.action.setPopup({ popup: '', tabId });
  } else {
    // Show login popup
    chrome.action.setPopup({ popup: 'popup.html', tabId });
  }
}

// Update popup whenever the active tab changes
chrome.tabs.onActivated.addListener(({ tabId }) => {
  updatePopup(tabId);
});

// Also update when the extension is installed or started
chrome.runtime.onInstalled.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) updatePopup(tabs[0].id);
  });
});

// Handle click: if no popup, do direct save
chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.url || !tab.title) return;
  const valid = await isTokenValid();
  if (!valid) {
    // Should not happen, but fallback: show popup
    chrome.action.setPopup({ popup: 'popup.html', tabId: tab.id });
    chrome.action.openPopup();
    return;
  }
  // Direct save logic (same as before)
  const { tekcop_token } = await chrome.storage.local.get('tekcop_token');
  const apiBase = import.meta.env.VITE_API_BASE;
  fetch(`${apiBase}/api/bookmarks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tekcop_token}`
    },
    body: JSON.stringify({
      title: tab.title,
      url: tab.url
    })
  })
    .then(async res => {
      if (res.status === 401) throw new Error('Unauthorized');
      await res.json();
      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('app_48.png'),
        title: 'Tekcop',
        message: 'Page saved to bookmarks!'
      });
    })
    .catch(err => {
      let msg = err.message === 'Unauthorized' ? 'Please log in again via the Tekcop popup.' : 'Failed to save page.';
      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('app_48.png'),
        title: 'Tekcop',
        message: msg
      });
      if (err.message === 'Unauthorized') {
        chrome.storage.local.remove('tekcop_token');
        chrome.action.setPopup({ popup: 'popup.html', tabId: tab.id });
        chrome.action.openPopup();
      }
    });
}); 