import os
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

try:
    from google.cloud.firestore_v1.base_query import FieldFilter
except ImportError:
    FieldFilter = None

_BACKEND_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

_db = None
_initialized = False


def init_firebase():
    """Initialize Firebase Admin SDK. Safe to call multiple times."""
    global _db, _initialized
    if _initialized:
        return _db

    try:
        import firebase_admin
        from firebase_admin import credentials, firestore

        cred_path = os.getenv('FIREBASE_CREDENTIALS_PATH', './config/firebase-credentials.json')
        if not os.path.isabs(cred_path):
            cred_path = os.path.join(_BACKEND_ROOT, cred_path)
        cred_path = os.path.normpath(cred_path)

        if os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            _db = firestore.client()
            logger.info('Firebase Admin SDK initialized successfully')
        else:
            logger.warning(
                'Firebase credentials not found at %s. '
                'Running with in-memory storage (data will not persist).', cred_path
            )
            _db = None
    except Exception as e:
        logger.warning(
            'Firebase initialization failed: %s. '
            'Running with in-memory storage (data will not persist).', e
        )
        _db = None

    _initialized = True
    return _db


def get_db():
    return init_firebase()


_in_memory_store = {
    'journal_entries': [],
    'hydration_logs': [],
    'mood_logs': [],
    'work_sessions': [],
}


def save_journal_entry(user_id, entry):
    db = get_db()
    doc = {
        'user_id': user_id,
        'text': entry['text'],
        'emotion': entry.get('emotion', 'neutral'),
        'confidence': entry.get('confidence', 0),
        'sentiment': entry.get('sentiment', 'neutral'),
        'reframe': entry.get('reframe'),
        'all_emotions': entry.get('all_emotions', []),
        'all_sentiments': entry.get('all_sentiments', []),
        'timestamp': datetime.utcnow().isoformat(),
    }

    if db:
        try:
            db.collection('journal_entries').add(doc)
        except Exception as e:
            logger.warning('Firestore write failed for journal entry: %s', e)
            doc['id'] = len(_in_memory_store['journal_entries']) + 1
            _in_memory_store['journal_entries'].append(doc)
    else:
        doc['id'] = len(_in_memory_store['journal_entries']) + 1
        _in_memory_store['journal_entries'].append(doc)

    return doc


def get_journal_entries(user_id, limit=20):
    db = get_db()
    if db:
        try:
            query = db.collection('journal_entries')
            if FieldFilter:
                query = query.where(filter=FieldFilter('user_id', '==', user_id))
            else:
                query = query.where('user_id', '==', user_id)
            docs = (query
                    .order_by('timestamp', direction='DESCENDING')
                    .limit(limit)
                    .stream())
            return [{'id': d.id, **d.to_dict()} for d in docs]
        except Exception as e:
            logger.warning('Firestore query failed for journal entries: %s', e)
            return []

    return sorted(
        [e for e in _in_memory_store['journal_entries'] if e.get('user_id') == user_id],
        key=lambda x: x.get('timestamp', ''), reverse=True
    )[:limit]


DEFAULT_AMOUNT_ML = 250


def log_hydration(user_id, amount_ml=None):
    if amount_ml is None:
        amount_ml = DEFAULT_AMOUNT_ML
    amount_ml = max(1, int(amount_ml))

    db = get_db()
    doc = {
        'user_id': user_id,
        'amount_ml': amount_ml,
        'timestamp': datetime.utcnow().isoformat(),
        'date': datetime.utcnow().strftime('%Y-%m-%d'),
    }

    if db:
        try:
            db.collection('hydration_logs').add(doc)
        except Exception as e:
            logger.warning('Firestore write failed for hydration log: %s', e)
            _in_memory_store['hydration_logs'].append(doc)
    else:
        _in_memory_store['hydration_logs'].append(doc)

    return doc


def get_hydration_today(user_id):
    today = datetime.utcnow().strftime('%Y-%m-%d')
    db = get_db()

    if db:
        try:
            query = db.collection('hydration_logs')
            if FieldFilter:
                query = (query
                         .where(filter=FieldFilter('user_id', '==', user_id))
                         .where(filter=FieldFilter('date', '==', today)))
            else:
                query = (query
                         .where('user_id', '==', user_id)
                         .where('date', '==', today))
            docs = list(query.stream())
            total_ml = sum(d.to_dict().get('amount_ml', DEFAULT_AMOUNT_ML) for d in docs)
            return {'ml_today': total_ml, 'entries': len(docs)}
        except Exception as e:
            logger.warning('Firestore query failed for hydration: %s', e)
            return {'ml_today': 0, 'entries': 0}

    today_logs = [e for e in _in_memory_store['hydration_logs']
                  if e.get('user_id') == user_id and e.get('date') == today]
    total_ml = sum(e.get('amount_ml', DEFAULT_AMOUNT_ML) for e in today_logs)
    return {'ml_today': total_ml, 'entries': len(today_logs)}


def save_mood_log(user_id, mood_data):
    db = get_db()
    doc = {
        'user_id': user_id,
        'emotion': mood_data.get('emotion'),
        'sentiment': mood_data.get('sentiment'),
        'confidence': mood_data.get('confidence'),
        'source': mood_data.get('source', 'auto-detect'),
        'timestamp': datetime.utcnow().isoformat(),
    }

    if db:
        try:
            db.collection('mood_logs').add(doc)
        except Exception as e:
            logger.warning('Firestore write failed for mood log: %s', e)
            _in_memory_store['mood_logs'].append(doc)
    else:
        _in_memory_store['mood_logs'].append(doc)

    return doc
