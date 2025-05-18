chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['reminderInterval'], (data) => {
    const interval = data.reminderInterval || 180; // default: every 3 hours
    chrome.alarms.create('adhkarReminder', { periodInMinutes: interval });
  });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'adhkarReminder') {
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
  }
});
