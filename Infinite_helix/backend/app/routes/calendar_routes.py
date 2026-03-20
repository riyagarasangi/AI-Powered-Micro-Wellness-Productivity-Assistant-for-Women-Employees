from flask import Blueprint, jsonify, request, redirect
from app.services.calendar_service import CalendarService

calendar_bp = Blueprint('calendar', __name__)
calendar_service = CalendarService()

FRONTEND_URL = 'http://localhost:3000'


@calendar_bp.route('/meetings', methods=['GET'])
def get_meetings():
    meetings = calendar_service.get_todays_meetings()
    return jsonify(meetings)


@calendar_bp.route('/next', methods=['GET'])
def get_next_meeting():
    meeting = calendar_service.get_next_meeting()
    if meeting:
        return jsonify(meeting)
    return jsonify({'message': 'No upcoming meetings'}), 204


@calendar_bp.route('/status', methods=['GET'])
def connection_status():
    return jsonify(calendar_service.get_connection_status())


@calendar_bp.route('/authorize', methods=['GET'])
def authorize():
    url = calendar_service.get_authorize_url()
    if url:
        return jsonify({'authorize_url': url})
    return jsonify({
        'message': 'Microsoft OAuth not configured. Using demo data.',
        'help': 'Set MS_CLIENT_ID, MS_CLIENT_SECRET in .env to enable Teams integration.',
    }), 200


@calendar_bp.route('/callback', methods=['GET'])
def oauth_callback():
    code = request.args.get('code')
    error = request.args.get('error')

    if error:
        return redirect(f"{FRONTEND_URL}/calendar?error={error}")

    if not code:
        return redirect(f"{FRONTEND_URL}/calendar?error=no_code")

    success, result = calendar_service.handle_callback(code)

    if success:
        return redirect(f"{FRONTEND_URL}/calendar?connected=true")
    return redirect(f"{FRONTEND_URL}/calendar?error={result}")


@calendar_bp.route('/disconnect', methods=['POST'])
def disconnect():
    calendar_service.disconnect()
    return jsonify({'message': 'Disconnected from Microsoft Calendar'})
