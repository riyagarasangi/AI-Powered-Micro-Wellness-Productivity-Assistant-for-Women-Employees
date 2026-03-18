let _permissionGranted = false;

export async function requestPermission() {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported in this browser');
    return false;
  }
  if (Notification.permission === 'granted') {
    _permissionGranted = true;
    return true;
  }
  if (Notification.permission === 'denied') {
    return false;
  }
  const permission = await Notification.requestPermission();
  _permissionGranted = permission === 'granted';
  return _permissionGranted;
}

export function showDesktopNotification(title, body, options = {}) {
  if (!_permissionGranted && Notification.permission !== 'granted') return null;

  try {
    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: options.tag || 'helix-nudge',
      silent: options.silent || false,
      ...options,
    });

    if (options.autoClose !== false) {
      setTimeout(() => notification.close(), options.duration || 6000);
    }

    return notification;
  } catch {
    return null;
  }
}

const NUDGE_TITLES = {
  hydration: 'Hydration Reminder',
  stretch: 'Stretch Break',
  eyes: 'Eye Rest',
  meeting: 'Pre-Meeting Calm',
  emotional: 'Wellness Check',
};

const NUDGE_ICONS = {
  hydration: '💧',
  stretch: '🌿',
  eyes: '👀',
  meeting: '🧘',
  emotional: '💜',
};

export function showNudgeNotification(nudge) {
  const icon = NUDGE_ICONS[nudge.type] || '✨';
  const title = `${icon} ${NUDGE_TITLES[nudge.type] || 'Wellness Nudge'}`;

  return showDesktopNotification(
    title,
    nudge.message,
    { tag: `helix-${nudge.type}-${nudge.id}` }
  );
}
