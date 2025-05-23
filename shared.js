export const defaultAdhkarList = [
  { transliteration: 'SubhanAllah', arabic: 'سبحان الله', translation: 'Glory be to Allah', enabled: true, count: 0 },
  { transliteration: 'Alhamdulillah', arabic: 'الحمد لله', translation: 'All praise is due to Allah', enabled: true, count: 0 },
  { transliteration: 'Allahu Akbar', arabic: 'الله اكبر', translation: 'Allah is the Greatest', enabled: true, count: 0 },
  { transliteration: 'La ilaha illallah', arabic: 'لا اله الا الله', translation: 'There is no deity but Allah', enabled: false, count: 0 },
  { transliteration: 'Astaghfirullah', arabic: 'استغفر الله', translation: 'I seek forgiveness from Allah', enabled: false, count: 0 },
  { transliteration: 'Rabbighfir li', arabic: 'رب اغفر لي', translation: 'My Lord, forgive me', enabled: false, count: 0 },
  { transliteration: 'Subhana Rabbi al-A\'la', arabic: 'سبحان ربي الأعلى', translation: 'Glory is to my Lord, the Most High', enabled: false, count: 0 },
  { transliteration: 'Subhana Rabbi al-\'Adheem', arabic: 'سبحان ربي العظيم', translation: 'Glory is to my Lord, the Almighty', enabled: false, count: 0 },
  { transliteration: 'Allahumma ajirni min an-nar', arabic: 'اللهم اجرني من النار', translation: 'O Allah, protect me from the Fire', enabled: false, count: 0 },
  { transliteration: 'Rabbana atiq riqabana min an-nar', arabic: 'ربنا اعتق رقابنا من النار', translation: 'Our Lord, save our necks from the Fire', enabled: false, count: 0 },
  { transliteration: 'Allahumma inni as\'aluka al-Jannah', arabic: 'اللهم اني اسالك الجنة', translation: 'O Allah, I ask You for Paradise', enabled: false, count: 0 },
  { transliteration: 'Allahumma inni a\'udhu bika min ʿadhabil-qabr', arabic: 'اللهم إني أعوذ بك من عذاب القبر', translation: 'O Allah, I seek refuge in You from the punishment of the grave', enabled: false, count: 0 },
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
      const wrapper = document.createElement('div');
      wrapper.classList.add('dhikr-toggle-wrapper');

      const label = document.createElement('label');
      label.classList.add('dhikr-toggle-label');

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = dhikr.enabled;
      checkbox.classList.add('dhikr-toggle-checkbox');

      checkbox.addEventListener('change', () => {
        adhkarList[i].enabled = checkbox.checked;
        chrome.storage.sync.set({ ADHKAR_LIST: adhkarList });
      });

      label.appendChild(checkbox);

      const dhikrContainer = document.createElement('div');
      dhikrContainer.classList.add('dhikr-toggle-container');

      const arabicRow = document.createElement('div');
      arabicRow.classList.add('dhikr-toggle-arabic');
      arabicRow.textContent = `${dhikr.arabic} | ${dhikr.transliteration}`;

      const translationRow = document.createElement('div');
      translationRow.classList.add('dhikr-toggle-translation');
      translationRow.textContent = dhikr.translation || '';

      dhikrContainer.appendChild(arabicRow);
      dhikrContainer.appendChild(translationRow);

      label.appendChild(dhikrContainer);
      wrapper.appendChild(label);
      container.appendChild(wrapper);
    });
  });
}