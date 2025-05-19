const defaultAdhkarList = [
  { text: 'SubhanAllah', arabic: 'سبحان الله', transliteration: 'SubhanAllah', translation: 'Glory be to Allah', enabled: true, count: 0 },
  { text: 'Alhamdulillah', arabic: 'الحمد لله', transliteration: 'Alhamdulillah', translation: 'All praise is due to Allah', enabled: true, count: 0 },
  { text: 'Allahu Akbar', arabic: 'الله أكبر', transliteration: 'Allahu Akbar', translation: 'Allah is the Greatest', enabled: true, count: 0 },
  { text: 'La ilaha illallah', arabic: 'لا إله إلا الله', transliteration: 'La ilaha illallah', translation: 'There is no deity but Allah', enabled: false, count: 0 }
];

function renderDhikrItem(dhikr, index) {
  return `
    <div class="dhikr-row" data-index="${index}">
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


function renderDhikrList(list) {
  const container = document.getElementById('dhikr-list');
  container.innerHTML = list
    .map((dhikr, i) => ({ dhikr, i }))
    .filter(item => item.dhikr.enabled)
    .map(item => renderDhikrItem(item.dhikr, item.i))
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


// Load and render from storage
function loadAndRender() {
  chrome.storage.sync.get(['adhkarList'], (data) => {
    const list = (data.adhkarList || defaultAdhkarList).map(dhikr =>
      ({ ...dhikr, count: dhikr.count ?? 0 })
    );
    window.adhkarList = list; // Store globally for button handlers
    renderDhikrList(list);
  });
}

// Button handlers
window.incrementDhikr = function(index) {
  console.log('Incrementing index:', index, window.adhkarList[index]);
  window.adhkarList[index].count++;
  chrome.storage.sync.set({ adhkarList: window.adhkarList }, loadAndRender);
};

window.decrementDhikr = function(index) {
  if (window.adhkarList[index].count > 0) window.adhkarList[index].count--;
  chrome.storage.sync.set({ adhkarList: window.adhkarList }, loadAndRender);
};

function setupSettingsView() {
  const intervalInput = document.getElementById('interval');
  const container = document.getElementById('dhikr-settings');

  chrome.storage.sync.get(['reminderInterval', 'adhkarList'], (data) => {
    const interval = data.reminderInterval || 180;
    const adhkarList = data.adhkarList || defaultAdhkarList;

    intervalInput.value = interval;
    intervalInput.addEventListener('input', () => {
      const val = parseInt(intervalInput.value, 10);
      if (!isNaN(val) && val > 0) {
        chrome.storage.sync.set({ reminderInterval: val }, () => {
          chrome.runtime.sendMessage({ type: 'update-interval', interval: val });
        });
      }
    });

    container.innerHTML = '';
    adhkarList.forEach((dhikr, i) => {
      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = dhikr.enabled;
      checkbox.addEventListener('change', () => {
        adhkarList[i].enabled = checkbox.checked;
        chrome.storage.sync.set({ adhkarList }, loadAndRender); // Update UI on toggle
      });
      label.appendChild(checkbox);
      label.append(` ${dhikr.text}`);
      container.appendChild(label);
    });
  });
}


// View handling
function showView(view) {
  document.getElementById('main-view').style.display = view === 'main' ? '' : 'none';
  document.getElementById('settings-view').style.display = view === 'settings' ? '' : 'none';
  document.getElementById('add-custom-view').style.display = view === 'add' ? '' : 'none';

  if (view === 'settings') {
    setupSettingsView();
  }
}

document.getElementById('settings-icon').addEventListener('click', function() {
  showView('settings');
});

document.getElementById('add-custom-btn').addEventListener('click', function() {
  showView('add');
});

document.getElementById('back-from-settings').addEventListener('click', function() {
  showView('main');
});

document.getElementById('back-from-add').addEventListener('click', function() {
  showView('main');
});

// Handle custom dhikr form
document.getElementById('custom-dhikr-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const arabic = document.getElementById('custom-arabic').value.trim();
  const transliteration = document.getElementById('custom-transliteration').value.trim();
  const translation = document.getElementById('custom-translation').value.trim();
  if (!arabic || !transliteration) return;

  chrome.storage.sync.get(['adhkarList'], (data) => {
    const list = data.adhkarList || defaultAdhkarList;
    list.push({
      text: transliteration,
      arabic,
      transliteration,
      translation,
      enabled: true,
      count: 0
    });
    chrome.storage.sync.set({ adhkarList: list }, () => {
      showView('main');
      loadAndRender();
      // Optionally clear form fields
      document.getElementById('custom-arabic').value = '';
      document.getElementById('custom-transliteration').value = '';
      document.getElementById('custom-translation').value = '';
    });
  });
});

// Initial render
loadAndRender();