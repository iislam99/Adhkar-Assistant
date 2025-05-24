import { defaultAdhkarList, handleCustomDhikrFormSubmit, renderSettingsView } from './shared.js';

function renderDhikrRow(dhikr, index) {
  return `
    <div class="dhikr-row" data-index="${index}" title="${dhikr.translation}">
      <div class="dhikr-controls">
        <button class="increment-btn">+</button>
        <button class="decrement-btn">-</button>
      </div>
      <div class="dhikr-item">
        <div class="dhikr-content">
          <span class="arabic">${dhikr.arabic}</span>
          <span class="transliteration">${dhikr.transliteration}</span>
        </div>
        <div class="dhikr-count">${dhikr.count}</div>
      </div>
    </div>
  `;
}

function renderAdhkarList(list) {
  const container = document.getElementById('dhikr-list');
  if (!container) {
    console.warn("#dhikr-list not found in DOM");
    return;
  }

  container.innerHTML = list
    .map((dhikr, i) => ({ dhikr, i }))
    .filter(item => item.dhikr.enabled)
    .map(item => renderDhikrRow(item.dhikr, item.i))
    .join('');

  // Attach event listeners for increment and decrement buttons
  container.querySelectorAll('.dhikr-row').forEach(row => {
    const index = parseInt(row.dataset.index, 10);
    row.querySelector('.increment-btn').addEventListener('click', () => {
      window.incrementDhikr(index);
    });
    row.querySelector('.decrement-btn').addEventListener('click', () => {
      window.decrementDhikr(index);
    });
  });
}

// Reload and render adhkar list
function loadAndRender() {
  chrome.storage.sync.get(['ADHKAR_LIST'], (data) => {
    const list = (data.ADHKAR_LIST || defaultAdhkarList).map(dhikr =>
      ({ ...dhikr, count: dhikr.count ?? 0 })
    );
    window.ADHKAR_LIST = list; // Store globally for button handlers
    renderAdhkarList(list);
  });
}

// Button handlers
window.incrementDhikr = function(index) {
  window.ADHKAR_LIST[index].count++;
  chrome.storage.sync.set({ ADHKAR_LIST: window.ADHKAR_LIST }, loadAndRender);
};

window.decrementDhikr = function(index) {
  if (window.ADHKAR_LIST[index].count > 0) window.ADHKAR_LIST[index].count--;
  chrome.storage.sync.set({ ADHKAR_LIST: window.ADHKAR_LIST }, loadAndRender);
};

// View handling
function showView(view) {
  document.getElementById('main-view').style.display = view === 'main' ? '' : 'none';
  document.getElementById('settings-view').style.display = view === 'settings' ? '' : 'none';
  document.getElementById('add-custom-view').style.display = view === 'add' ? '' : 'none';
}

document.getElementById('settings-icon').addEventListener('click', function() {
  renderSettingsView();
  showView('settings');
});

document.getElementById('back-from-settings').addEventListener('click', function() {
  loadAndRender();
  showView('main');
});

document.getElementById('add-custom-btn').addEventListener('click', function() {
  showView('add');
});

handleCustomDhikrFormSubmit(() => {
  showView('main');
  loadAndRender();
});

document.getElementById('back-from-add').addEventListener('click', function() {
  showView('main');
  document.getElementById('custom-arabic').value = '';
  document.getElementById('custom-transliteration').value = '';
  document.getElementById('custom-translation').value = '';
});

// Initial render
document.addEventListener('DOMContentLoaded', function () {
  chrome.action.setBadgeText({ text: '' });
  chrome.action.setBadgeBackgroundColor({ color: [0, 0, 0, 0] });
  loadAndRender();
});
