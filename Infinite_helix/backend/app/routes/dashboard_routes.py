from flask import Blueprint, jsonify, request
from app.tracker.screen_tracker import ScreenTracker
from app.services.firebase_service import get_hydration_today
import app as app_module
import time

dashboard_bp = Blueprint('dashboard', __name__)
screen_tracker = ScreenTracker()

SESSION_START = time.time()


@dashboard_bp.route('/today', methods=['GET'])
def get_today():
    user_id = request.args.get('user_id', 'demo-user-001')

    screen_data = screen_tracker.get_screen_time()
    monitor = app_module.activity_monitor
    activity = monitor.stats if monitor else {}

    try:
        hydration_data = get_hydration_today(user_id)
        ml_today = hydration_data['ml_today']
    except Exception:
        ml_today = 0
    continuous = activity.get('continuous_work_minutes', 0)
    typing = activity.get('typing_intensity', 0)
    session_min = activity.get('session_duration_minutes', 0)

    focus_score = min(100, int(50 + typing * 0.3 + min(continuous, 90) * 0.2))
    breaks_taken = max(1, int(session_min / 60)) if session_min > 30 else 0
    score = _calculate_wellness_score(focus_score, breaks_taken, ml_today, continuous)

    elapsed_hours = round((time.time() - SESSION_START) / 3600, 2)
    breakdown = screen_data.get('breakdown', {})
    if not breakdown:
        breakdown = {
            'coding': round(elapsed_hours * 0.5 + 2.0, 1),
            'meetings': 1.2,
            'browsing': 0.7,
            'email': 0.5,
        }

    return jsonify({
        'screenTime': {
            'total': round(screen_data.get('total_hours', elapsed_hours + 4.0), 1),
            'goal': 8,
            'breakdown': breakdown,
        },
        'focusSessions': [
            {'start': '09:00', 'end': '10:30', 'score': min(100, focus_score + 14), 'label': 'Deep Work'},
            {'start': '11:00', 'end': '12:15', 'score': max(50, focus_score), 'label': 'Code Review'},
            {'start': '14:00', 'end': '15:00', 'score': min(100, focus_score + 7), 'label': 'Feature Dev'},
            {'start': '15:30', 'end': '16:45', 'score': max(45, focus_score - 8), 'label': 'Documentation'},
        ],
        'breaks': {
            'taken': max(breaks_taken, 4),
            'suggested': 6,
            'lastBreak': '14:55',
            'avgDuration': 8,
        },
        'hydration': {
            'ml_today': ml_today,
            'goal_ml': 2000,
            'default_amount_ml': 250,
        },
        'score': score,
        'mood': 'focused' if typing > 30 else 'relaxed',
        'streakDays': 5,
        'activity': {
            'keystrokes': activity.get('keystrokes_total', 0),
            'typing_intensity': typing,
            'idle_seconds': activity.get('idle_seconds', 0),
            'is_idle': activity.get('is_idle', False),
            'continuous_work_minutes': continuous,
        },
    })


def _calculate_wellness_score(focus, breaks, ml_today, continuous):
    focus_norm = min(focus, 100) * 0.25
    break_norm = min(breaks / 6, 1.0) * 100 * 0.20
    hydration_norm = min(ml_today / 2000, 1.0) * 100 * 0.20
    overwork_penalty = max(0, continuous - 120) * 0.15
    base = focus_norm + break_norm + hydration_norm + 35 - overwork_penalty
    return max(10, min(100, int(base)))
