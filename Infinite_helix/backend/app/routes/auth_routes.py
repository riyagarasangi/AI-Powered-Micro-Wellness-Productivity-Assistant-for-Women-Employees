from flask import Blueprint, request, jsonify
from functools import wraps
from datetime import datetime

auth_bp = Blueprint('auth', __name__)

_users_store = {}


def _verify_firebase_token(id_token):
    """Verify Firebase ID token. Returns decoded claims or None."""
    try:
        from app.services.firebase_service import init_firebase
        init_firebase()
        import firebase_admin.auth as fb_auth
        return fb_auth.verify_id_token(id_token)
    except Exception:
        return None


def require_auth(f):
    """Decorator that extracts and verifies the Firebase Bearer token."""
    @wraps(f)
    def decorated(*args, **kwargs):
        header = request.headers.get('Authorization', '')
        if not header.startswith('Bearer '):
            return jsonify({'error': 'Missing authorization token'}), 401

        token = header.split('Bearer ')[1]
        claims = _verify_firebase_token(token)

        if claims is None:
            return jsonify({'error': 'Invalid or expired token'}), 401

        request.uid = claims.get('uid')
        request.email = claims.get('email')
        request.auth_claims = claims
        return f(*args, **kwargs)
    return decorated


@auth_bp.route('/register', methods=['POST'])
def register():
    header = request.headers.get('Authorization', '')
    data = request.get_json(silent=True) or {}

    uid = None
    email = data.get('email', '')

    if header.startswith('Bearer '):
        token = header.split('Bearer ')[1]
        claims = _verify_firebase_token(token)
        if claims:
            uid = claims.get('uid')
            email = claims.get('email', email)

    if not uid:
        uid = f'local-{datetime.utcnow().timestamp()}'

    display_name = data.get('displayName', email.split('@')[0] if email else 'User')

    user_doc = {
        'uid': uid,
        'email': email,
        'display_name': display_name,
        'provider': data.get('provider', 'password'),
        'created_at': datetime.utcnow().isoformat(),
        'updated_at': datetime.utcnow().isoformat(),
        'settings': {
            'notifications': True,
            'cycle_mode': False,
            'hydration_goal': 8,
            'break_interval_minutes': 45,
        },
    }

    _save_user(uid, user_doc)

    return jsonify({
        'status': 'registered',
        'user': {
            'uid': uid,
            'email': email,
            'display_name': display_name,
        },
    }), 201


@auth_bp.route('/sync', methods=['POST'])
def sync_profile():
    """Syncs Firebase user profile to backend on every login."""
    header = request.headers.get('Authorization', '')

    if not header.startswith('Bearer '):
        return jsonify({'status': 'skipped', 'reason': 'no token'}), 200

    token = header.split('Bearer ')[1]
    claims = _verify_firebase_token(token)

    if not claims:
        return jsonify({'status': 'skipped', 'reason': 'invalid token'}), 200

    uid = claims.get('uid')
    email = claims.get('email', '')
    name = claims.get('name', email.split('@')[0] if email else 'User')
    picture = claims.get('picture')
    provider = claims.get('firebase', {}).get('sign_in_provider', 'unknown')

    existing = _get_user(uid)
    if existing:
        existing['updated_at'] = datetime.utcnow().isoformat()
        existing['email'] = email
        if name:
            existing['display_name'] = name
        if picture:
            existing['photo_url'] = picture
        existing['provider'] = provider
        _save_user(uid, existing)
    else:
        user_doc = {
            'uid': uid,
            'email': email,
            'display_name': name,
            'photo_url': picture,
            'provider': provider,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat(),
            'settings': {
                'notifications': True,
                'cycle_mode': False,
                'hydration_goal': 8,
                'break_interval_minutes': 45,
            },
        }
        _save_user(uid, user_doc)

    return jsonify({'status': 'synced', 'uid': uid})


@auth_bp.route('/profile', methods=['GET'])
@require_auth
def get_profile():
    user = _get_user(request.uid)
    if not user:
        return jsonify({
            'uid': request.uid,
            'email': request.email,
            'display_name': request.email.split('@')[0] if request.email else 'User',
        })
    return jsonify({
        'uid': user['uid'],
        'email': user['email'],
        'display_name': user.get('display_name', 'User'),
        'photo_url': user.get('photo_url'),
        'provider': user.get('provider'),
        'created_at': user.get('created_at'),
    })


def _save_user(uid, user_doc):
    from app.services.firebase_service import get_db
    db = get_db()
    if db:
        db.collection('users').document(uid).set(user_doc, merge=True)
    else:
        _users_store[uid] = user_doc


def _get_user(uid):
    from app.services.firebase_service import get_db
    db = get_db()
    if db:
        doc = db.collection('users').document(uid).get()
        return doc.to_dict() if doc.exists else None
    return _users_store.get(uid)
