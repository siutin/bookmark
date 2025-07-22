chrome.action.onClicked.addListener((tab) => {
  if (!tab.url || !tab.title) return;

  chrome.storage.local.get(['tekcop_token'], ({ tekcop_token }) => {
    if (!tekcop_token) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('app_48.png'),
        title: 'Tekcop',
        message: 'Please log in via the Tekcop extension popup.'
      });
      return;
    }
    const apiBase = 'http://localhost:8787'; // Or use production base
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
        const data = await res.json();
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
      });
  });
}); 