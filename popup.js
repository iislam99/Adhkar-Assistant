import { defaultAdhkarList, handleCustomDhikrFormSubmit, renderSettingsView } from './shared.js';
import { renderStatsView } from './stats.js';

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
  chrome.storage.local.get(['ADHKAR_LIST'], (data) => {
    const list = (data.ADHKAR_LIST || defaultAdhkarList).map(dhikr =>
      ({ ...dhikr, count: dhikr.count ?? 0 })
    );
    window.ADHKAR_LIST = list; // Store globally for button handlers
    renderAdhkarList(list);
  });
}

// Button handlers
function logDhikr(dhikrName, operation) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  
  chrome.storage.local.get(['USER_STATS'], ({ stats = {} }) => {
    if (!stats[dhikrName]) {
      stats[dhikrName] = {};
    }

    if (!stats[dhikrName][today]) {
      stats[dhikrName][today] = 0;
    }

    if (operation === 'increment') {
      stats[dhikrName][today] += 1;
    }
    else if (operation === 'decrement' && stats[dhikrName][today] > 0) {
      stats[dhikrName][today] -= 1;
    }

    chrome.storage.local.set({ USER_STATS: stats }, () => {
      console.log(`Logged 1 count for "${dhikrName}" on ${today}. Total: ${stats[dhikrName][today]}`);
    });
  });
}

window.incrementDhikr = function(index) {
  window.ADHKAR_LIST[index].count++;
  logDhikr(window.ADHKAR_LIST[index].arabic, 'increment');
  chrome.storage.local.set({ ADHKAR_LIST: window.ADHKAR_LIST }, loadAndRender);
};

window.decrementDhikr = function(index) {
  if (window.ADHKAR_LIST[index].count > 0) {
    logDhikr(window.ADHKAR_LIST[index].arabic, 'decrement');
    window.ADHKAR_LIST[index].count--;
  }
  chrome.storage.local.set({ ADHKAR_LIST: window.ADHKAR_LIST }, loadAndRender);
};

// View handling
function showView(view) {
  document.getElementById('main-view').style.display = view === 'main' ? '' : 'none';
  document.getElementById('settings-view').style.display = view === 'settings' ? '' : 'none';
  document.getElementById('add-custom-view').style.display = view === 'add' ? '' : 'none';
  document.getElementById('stats-view').style.display = view === 'stats' ? '' : 'none';
}

function syncLocalToCloud() {
  chrome.storage.local.get(null, function(localData) {
    chrome.storage.sync.set(localData, function() {
      if (chrome.runtime.lastError) {
        console.error("Error syncing data:", chrome.runtime.lastError);
      } else {
        console.log("All local data synced to cloud successfully.");
      }
    });
  });
}

document.getElementById('settings-icon').addEventListener('click', function() {
  syncLocalToCloud()
  renderSettingsView();
  showView('settings');
});

document.getElementById('back-from-settings').addEventListener('click', function() {
  syncLocalToCloud()
  loadAndRender();
  showView('main');
});

document.getElementById('back-from-stats').addEventListener('click', function() {
  loadAndRender();
  showView('main');
});

document.getElementById('stats-btn').addEventListener('click', function() {
  syncLocalToCloud()
  renderStatsView();
  showView('stats');
});

document.getElementById('add-custom-btn').addEventListener('click', function() {
  syncLocalToCloud()
  showView('add');
});

document.getElementById('back-from-add').addEventListener('click', function() {
  syncLocalToCloud()
  showView('settings');
});

handleCustomDhikrFormSubmit(() => {
  showView('main');
  loadAndRender();
});

window.addEventListener('beforeunload', syncLocalToCloud());

// Initial render
document.addEventListener('DOMContentLoaded', function () {
  chrome.action.setBadgeText({ text: '' });
  chrome.action.setBadgeBackgroundColor({ color: [0, 0, 0, 0] });
  loadAndRender();
});

loadAndRender();