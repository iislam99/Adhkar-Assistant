chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['REMINDER_INTERVAL'], (data) => {
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

// Sync local storage to cloud storage on unload
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "popup") {
    port.onDisconnect.addListener(() => {
      chrome.storage.local.get(null, (localData) => {
        chrome.storage.sync.set(localData, () => {
          if (chrome.runtime.lastError) {
            console.error("Failed to sync local to cloud:", chrome.runtime.lastError);
          } else {
            chrome.storage.local.set({ SYNC_NEEDED: false });
          }
        });
      });
    });
  }
});

// Sync cloud data to local storage on launch if cloud data exists
chrome.storage.sync.get(null, function(cloudData) {
  if (cloudData && Object.keys(cloudData).length > 0) {
    chrome.storage.local.set(cloudData, function() {
      if (chrome.runtime.lastError) {
        console.error("Error syncing data:", chrome.runtime.lastError);
      }
    });
  }
});
