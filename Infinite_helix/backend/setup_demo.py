#!/usr/bin/env python3
"""
Infinite Helix — One‑command Demo Setup
========================================
Run:  python setup_demo.py
Then: python run.py          (in one terminal)
      cd ../frontend && npm start   (in another terminal)

This script:
  1. Creates .env with DEMO_MODE=true if missing
  2. Installs Python dependencies (minimal set for demo)
  3. Verifies the Flask server can start
"""

import os
import sys
import subprocess
import shutil

ROOT = os.path.dirname(os.path.abspath(__file__))
ENV_FILE = os.path.join(ROOT, '.env')
ENV_EXAMPLE = os.path.join(ROOT, '.env.example')
REQUIREMENTS = os.path.join(ROOT, 'requirements.txt')

DEMO_REQUIREMENTS = [
    'flask>=3.0.0',
    'flask-cors>=4.0.0',
    'psutil>=5.9.0',
    'python-dotenv>=1.0.0',
    'plyer>=2.1.0',
]

DEMO_ENV = """FLASK_ENV=development
FLASK_PORT=5000
FLASK_DEBUG=True
SECRET_KEY=helix-demo-secret-key

DEMO_MODE=true
DESKTOP_NOTIFICATIONS=true

FIREBASE_CREDENTIALS_PATH=./config/firebase-credentials.json

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

EMOTION_MODEL=j-hartmann/emotion-english-distilroberta-base
SENTIMENT_MODEL=cardiffnlp/twitter-roberta-base-sentiment
MODEL_CACHE_DIR=./model_cache

TRACKER_INTERVAL_SECONDS=30
NUDGE_COOLDOWN_MINUTES=5
IDLE_THRESHOLD_SECONDS=60
FATIGUE_THRESHOLD_MINUTES=120
"""


def print_banner():
    print()
    print('=' * 56)
    print('   Infinite Helix — Demo Setup')
    print('   AI Micro Wellness Assistant for Women Employees')
    print('=' * 56)
    print()


def setup_env():
    if os.path.exists(ENV_FILE):
        print('[ok] .env file exists')
        return

    print('[setup] Creating .env with DEMO_MODE=true ...')
    with open(ENV_FILE, 'w') as f:
        f.write(DEMO_ENV)
    print('[ok] .env created')


def install_deps():
    print('[setup] Installing Python dependencies (demo-minimal) ...')
    try:
        subprocess.check_call(
            [sys.executable, '-m', 'pip', 'install', '--quiet'] + DEMO_REQUIREMENTS,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        print('[ok] Core dependencies installed')
    except subprocess.CalledProcessError:
        print('[warn] pip install failed — trying without --quiet')
        subprocess.call([sys.executable, '-m', 'pip', 'install'] + DEMO_REQUIREMENTS)

    print('[setup] Attempting optional dependencies (pynput, transformers) ...')
    for pkg in ['pynput>=1.7.6']:
        try:
            subprocess.check_call(
                [sys.executable, '-m', 'pip', 'install', '--quiet', pkg],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
        except subprocess.CalledProcessError:
            print(f'  [skip] {pkg} — not available on this platform')


def create_dirs():
    for d in ['model_cache', 'config']:
        path = os.path.join(ROOT, d)
        os.makedirs(path, exist_ok=True)
    print('[ok] Directories ready')


def verify_start():
    print('[verify] Testing Flask import ...')
    try:
        subprocess.check_call(
            [sys.executable, '-c', 'from app import create_app; app = create_app(); print("[ok] Flask app created")'],
            cwd=ROOT,
        )
    except subprocess.CalledProcessError:
        print('[error] Flask app failed to create — check errors above')
        return False
    return True


def print_instructions():
    print()
    print('-' * 56)
    print('  Setup complete! Start the demo:')
    print()
    print('  Terminal 1 (Backend):')
    print('    cd Infinite_helix/backend')
    print('    python run.py')
    print()
    print('  Terminal 2 (Frontend):')
    print('    cd Infinite_helix/frontend')
    print('    npm install && npm run dev')
    print()
    print('  Then open http://localhost:3000')
    print('-' * 56)
    print()


def main():
    print_banner()
    setup_env()
    create_dirs()
    install_deps()
    ok = verify_start()
    if ok:
        print_instructions()
    else:
        print('\n[!] Setup completed with warnings. Check errors above.\n')


if __name__ == '__main__':
    main()
