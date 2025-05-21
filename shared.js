export const defaultAdhkarList = [
  { text: 'SubhanAllah', arabic: 'سبحان الله', transliteration: 'SubhanAllah', translation: 'Glory be to Allah', enabled: true, count: 0 },
  { text: 'Alhamdulillah', arabic: 'الحمد لله', transliteration: 'Alhamdulillah', translation: 'All praise is due to Allah', enabled: true, count: 0 },
  { text: 'Allahu Akbar', arabic: 'الله أكبر', transliteration: 'Allahu Akbar', translation: 'Allah is the Greatest', enabled: true, count: 0 },
  { text: 'La ilaha illallah', arabic: 'لا إله إلا الله', transliteration: 'La ilaha illallah', translation: 'There is no deity but Allah', enabled: false, count: 0 }
];

export function updateAdhkarList(newList) {
  chrome.storage.sync.set({ ADHKAR_LIST: newList });
}

export function renderSettingsView() {
  const intervalInput = document.getElementById('interval');
  const container = document.getElementById('dhikr-settings');

  chrome.storage.sync.get(['REMINDER_INTERVAL', 'ADHKAR_LIST'], (data) => {
    const interval = data.REMINDER_INTERVAL || 180;
    const adhkarList = data.ADHKAR_LIST || defaultAdhkarList;

    intervalInput.value = interval;
    intervalInput.oninput = () => {
      const val = parseInt(intervalInput.value, 10);
      if (!isNaN(val) && val > 0) {
        chrome.storage.sync.set({ REMINDER_INTERVAL: val }, () => {
          chrome.alarms.clearAll(() => {
            chrome.alarms.create('ADHKAR_REMINDER', { periodInMinutes: val });
          });
        });
      }
    };

    container.innerHTML = '';
    adhkarList.forEach((dhikr, i) => {
      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = dhikr.enabled;
      checkbox.addEventListener('change', () => {
        adhkarList[i].enabled = checkbox.checked;
        chrome.storage.sync.set({ ADHKAR_LIST: adhkarList });
      });
      label.appendChild(checkbox);
      label.append(` ${dhikr.text}`);
      container.appendChild(label);
    });
  });
}