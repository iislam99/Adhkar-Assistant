import { defaultAdhkarList, handleCustomDhikrFormSubmit, renderSettingsView, getLocalDate } from './shared.js';
import { renderStatsView } from './stats.js';

const port = chrome.runtime.connect({ name: "popup" });
window.addEventListener('unload', () => {
  const syncNeeded = localStorage.getItem('SYNC_NEEDED');
  if (syncNeeded) {
    port.postMessage({ action: 'syncLocalToCloud' });
  }
});

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
  const today = getLocalDate(); // YYYY-MM-DD

  chrome.storage.local.get(['ADHKAR_LIST', 'USER_STATS'], ({ ADHKAR_LIST = defaultAdhkarList, USER_STATS = {} }) => {
    const updatedList = ADHKAR_LIST.map(dhikr => {
      const statCount = USER_STATS[dhikr.arabic]?.[today] ?? 0;
      return { ...dhikr, count: statCount };
    });

    window.ADHKAR_LIST = updatedList;
    renderAdhkarList(updatedList);
  });
}

// Button handlers
function logDhikr(dhikrName, operation) {
  localStorage.setItem('SYNC_NEEDED', true);
  const today = getLocalDate(); // YYYY-MM-DD
  
  chrome.storage.local.get(['USER_STATS'], ({ USER_STATS = {} }) => {
    if (!USER_STATS[dhikrName]) {
      USER_STATS[dhikrName] = {};
    }

    if (!USER_STATS[dhikrName][today]) {
      USER_STATS[dhikrName][today] = 0;
    }

    if (operation === 'increment') {
      USER_STATS[dhikrName][today] += 1;
    }
    else if (operation === 'decrement' && USER_STATS[dhikrName][today] > 0) {
      USER_STATS[dhikrName][today] -= 1;
    }

    chrome.storage.local.set({ USER_STATS }, () => {
      loadAndRender();
    });
  });
}

window.incrementDhikr = function(index) {
  const dhikrName = window.ADHKAR_LIST[index].arabic;
  logDhikr(dhikrName, 'increment');
};

window.decrementDhikr = function(index) {
  const dhikrName = window.ADHKAR_LIST[index].arabic;
  logDhikr(dhikrName, 'decrement');
};


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
  localStorage.setItem('SYNC_NEEDED', false);
  syncLocalToCloud()
  renderSettingsView();
  showView('settings');
});

document.getElementById('back-from-settings').addEventListener('click', function() {
  localStorage.setItem('SYNC_NEEDED', false);
  syncLocalToCloud()
  loadAndRender();
  showView('main');
});

document.getElementById('back-from-stats').addEventListener('click', function() {
  loadAndRender();
  showView('main');
});

document.getElementById('stats-btn').addEventListener('click', function() {
  localStorage.setItem('SYNC_NEEDED', false);
  syncLocalToCloud()
  renderStatsView();
  showView('stats');
});

document.getElementById('add-custom-btn').addEventListener('click', function() {
  localStorage.setItem('SYNC_NEEDED', false);
  syncLocalToCloud()
  showView('add');
});

document.getElementById('back-from-add').addEventListener('click', function() {
  localStorage.setItem('SYNC_NEEDED', false);
  syncLocalToCloud()
  showView('settings');
});

handleCustomDhikrFormSubmit(() => {
  showView('main');
  loadAndRender();
});

// Initial render
document.addEventListener('DOMContentLoaded', function () {
  chrome.action.setBadgeText({ text: '' });
  chrome.action.setBadgeBackgroundColor({ color: [0, 0, 0, 0] });
  loadAndRender();
});
