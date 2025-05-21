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
      "Time to do some Dhikr and refresh your heart. 💖",
      "Let's take a dhikr break!",
      "Stay mindful of Allah - how about some Adhkar?",
      "Just a minute of dhikr can change your day.",
      "Pause and say SubhanAllah, Alhamdulillah, Allahu Akbar. 💖"
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'assets/kaaba.png',
      title: 'Adhkar Assistant',
      message: randomMessage,
      priority: 2
    });

    chrome.action.setBadgeText({ text: '1' });
    chrome.action.setBadgeTextColor({ color: '#FFFFFF' });
    chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
  }
});
