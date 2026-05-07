// Haul popup JS.

chrome.runtime.sendMessage({ type: 'GET_PRODUCTS' }, (response) => {
  if (chrome.runtime.lastError) return;
  const products = response.products || [];
  document.getElementById('count').textContent = products.length;
  const compareBtn = document.getElementById('compare-btn');
  if (products.length >= 2) compareBtn.disabled = false;
});

document.getElementById('open-tray-btn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.sidePanel.open({ tabId: tabs[0].id });
      window.close();
    }
  });
});

document.getElementById('compare-btn').addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: 'OPEN_DASHBOARD' });
  window.close();
});
