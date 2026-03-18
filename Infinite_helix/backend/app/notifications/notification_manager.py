import time
import threading


class NotificationManager:
    """
    Multi-channel notification manager.
    Supports in-app notifications and desktop toasts via plyer.
    """

    def __init__(self):
        self._queue = []
        self._history = []
        self._id_counter = 0
        self._plyer_available = False
        self._init_plyer()

    def _init_plyer(self):
        try:
            from plyer import notification as plyer_notif
            self._plyer = plyer_notif
            self._plyer_available = True
        except ImportError:
            self._plyer = None
            self._plyer_available = False

    def send(self, nudge_type, message, priority='gentle', user_id=None):
        self._id_counter += 1
        notification = {
            'id': self._id_counter,
            'type': nudge_type,
            'message': message,
            'priority': priority,
            'user_id': user_id,
            'timestamp': time.time(),
            'read': False,
            'dismissed': False,
        }
        self._queue.append(notification)

        self._send_desktop(nudge_type, message)

        return notification

    def _send_desktop(self, nudge_type, message):
        """Send native desktop toast via plyer (non-blocking)."""
        if not self._plyer_available:
            return

        titles = {
            'hydration': 'Hydration Reminder',
            'stretch': 'Stretch Break',
            'eyes': 'Eye Rest',
            'meeting': 'Pre-Meeting Calm',
            'emotional': 'Wellness Check',
        }

        def _notify():
            try:
                self._plyer.notify(
                    title=f'Infinite Helix — {titles.get(nudge_type, "Wellness Nudge")}',
                    message=message,
                    app_name='Infinite Helix',
                    timeout=8,
                )
            except Exception:
                pass

        threading.Thread(target=_notify, daemon=True).start()

    def get_pending(self, user_id=None):
        return [
            n for n in self._queue
            if not n['dismissed'] and (user_id is None or n.get('user_id') == user_id)
        ]

    def dismiss(self, notification_id):
        for n in self._queue:
            if n['id'] == notification_id:
                n['dismissed'] = True
                self._history.append(n)
                return True
        return False

    def dismiss_all(self, user_id=None):
        for n in self._queue:
            if not n['dismissed'] and (user_id is None or n.get('user_id') == user_id):
                n['dismissed'] = True
                self._history.append(n)

    def get_history(self, user_id=None, limit=50):
        history = [
            n for n in self._history
            if user_id is None or n.get('user_id') == user_id
        ]
        return sorted(history, key=lambda x: x['timestamp'], reverse=True)[:limit]


notification_manager = NotificationManager()
