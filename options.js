document.addEventListener('DOMContentLoaded', () => {
  const defaultAdhkarList = [
    { text: 'SubhanAllah', arabic: 'سبحان الله', transliteration: 'SubhanAllah', translation: 'Glory be to Allah', enabled: true },
    { text: 'Alhamdulillah', arabic: 'الحمد لله', transliteration: 'Alhamdulillah', translation: 'All praise is due to Allah', enabled: true },
    { text: 'Allahu Akbar', arabic: 'الله أكبر', transliteration: 'Allahu Akbar', translation: 'Allah is the Greatest', enabled: true },
    { text: 'La ilaha illallah', arabic: 'لا إله إلا الله', transliteration: 'La ilaha illallah', translation: 'There is no deity but Allah', enabled: false }
  ];

  chrome.storage.sync.get(['reminderInterval', 'adhkarList'], (data) => {
    document.getElementById('interval').value = data.reminderInterval || 180;
    const list = data.adhkarList || defaultAdhkarList;
    const container = document.getElementById('dhikr-settings');
    container.innerHTML = ''; // Clear first, in case of reload

    list.forEach((dhikr, i) => {
      const label = document.createElement('label');
      label.style.display = 'block'; // Make checkboxes vertical, optional styling

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = dhikr.enabled;
      checkbox.onchange = () => {
        dhikr.enabled = checkbox.checked;
      };


      label.appendChild(checkbox);
      label.append(` ${dhikr.text}`);
      container.appendChild(label);
    });
    window.saveSettings = () => {
      const interval = parseInt(document.getElementById('interval').value);
      chrome.storage.sync.set({ reminderInterval: interval, adhkarList: list }, () => {
        chrome.alarms.clearAll(() => {
          chrome.alarms.create('adhkarReminder', { periodInMinutes: interval });
          alert('Settings saved!');
        });
      });
    };
  });
});
