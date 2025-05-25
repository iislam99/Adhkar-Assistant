chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['REMINDER_INTERVAL'], (data) => {
    const interval = data.REMINDER_INTERVAL || 180; // default: every 3 hours
    chrome.alarms.create('ADHKAR_REMINDER', { periodInMinutes: interval });
  });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'ADHKAR_REMINDER') {
    const messages = [
      "Take a moment for your daily Adhkar. ✨",
      "Have you remembered Allah today? 🕋",
      "Just a minute of dhikr can change your day.",
      "Pause and say SubhanAllah, Alhamdulillah, Allahu Akbar. 💖",
      "Reset your intentions, renew your dhikr. 🔄",
      "A heart that remembers Allah is never truly alone. 💞",
      "Turn your stress into Sabr with dhikr. 🌧️➡️☀️",
      
      "\"So remember Me; I will remember you.\" (Surah Al-Baqarah, 2:152)",
      "\"Remember your Lord inwardly with humility and reverence and in a moderate tone of voice, both morning and evening.\" (Surah Al-A'raf, 7:205)",
      "\"Surely in the remembrance of Allah do hearts find comfort.\" (Surah Ar-Ra'd, 13:28)",
      "\"O you who have believed, remember Allah with much remembrance.\" (Surah Al-Ahzab, 33:41)",
      "\"And remember Allah often so you may be successful.\" (Surah Al-Anfal, 62:10)",
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'assets/Allah.png',
      title: 'Adhkar Assistant - Let\'s do some dhikr!',
      message: randomMessage,
      priority: 2
    });

    chrome.action.setBadgeText({ text: '1' });
    chrome.action.setBadgeTextColor({ color: '#FFFFFF' });
    chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
  }
});

// Debugging: Log all stored data
chrome.storage.sync.get(null, console.log);