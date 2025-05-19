document.addEventListener('DOMContentLoaded', () => {
  const defaultAdhkarList = [
    { text: 'SubhanAllah', arabic: 'سبحان الله', transliteration: 'SubhanAllah', translation: 'Glory be to Allah', enabled: true },
    { text: 'Alhamdulillah', arabic: 'الحمد لله', transliteration: 'Alhamdulillah', translation: 'All praise is due to Allah', enabled: true },
    { text: 'Allahu Akbar', arabic: 'الله أكبر', transliteration: 'Allahu Akbar', translation: 'Allah is the Greatest', enabled: true },
    { text: 'La ilaha illallah', arabic: 'لا إله إلا الله', transliteration: 'La ilaha illallah', translation: 'There is no deity but Allah', enabled: false }
  ];

  chrome.storage.sync.get(['reminderInterval', 'adhkarList'], (data) => {
    const intervalInput = document.getElementById('interval');
    intervalInput.value = data.reminderInterval || 180;
    intervalInput.addEventListener('input', () => {
      const val = parseInt(intervalInput.value, 10);
      if (!isNaN(val) && val > 0) {
        chrome.storage.sync.set({ reminderInterval: val }, () => {
          chrome.alarms.clearAll(() => {
            chrome.alarms.create('adhkarReminder', { periodInMinutes: val });
          });
        });
      }
    });

    const list = data.adhkarList || defaultAdhkarList;
    const container = document.getElementById('dhikr-settings');
    container.innerHTML = '';

    list.forEach((dhikr, i) => {
      const label = document.createElement('label');

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = dhikr.enabled;
      checkbox.addEventListener('change', () => {
        list[i].enabled = checkbox.checked;
        chrome.storage.sync.set({ adhkarList: list });
      });

      label.appendChild(checkbox);
      label.append(` ${dhikr.text}`);
      container.appendChild(label);
    });
  });
});
