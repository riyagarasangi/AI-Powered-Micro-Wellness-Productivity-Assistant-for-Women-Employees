from flask import Blueprint, request, jsonify
from app.services.firebase_service import log_hydration, get_hydration_today, DEFAULT_AMOUNT_ML

hydration_bp = Blueprint('hydration', __name__)

DAILY_GOAL_ML = 2000


@hydration_bp.route('/log', methods=['POST'])
def log_water():
    data = request.get_json(silent=True) or {}
    user_id = data.get('user_id', 'demo-user-001')
    amount_ml = data.get('amount_ml', DEFAULT_AMOUNT_ML)
    entry = log_hydration(user_id, amount_ml=amount_ml)
    today = get_hydration_today(user_id)
    return jsonify({
        'status': 'logged',
        'ml_today': today['ml_today'],
        'entries_today': today['entries'],
        'goal_ml': DAILY_GOAL_ML,
        'entry': entry,
    })


@hydration_bp.route('/today', methods=['GET'])
def get_today():
    user_id = request.args.get('user_id', 'demo-user-001')
    today = get_hydration_today(user_id)
    goal = DAILY_GOAL_ML
    ml = today['ml_today']
    return jsonify({
        'ml_today': ml,
        'goal_ml': goal,
        'entries_today': today['entries'],
        'default_amount_ml': DEFAULT_AMOUNT_ML,
        'progress': round(ml / goal * 100, 1) if goal else 0,
    })
