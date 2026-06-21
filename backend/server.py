import os
import logging
import json
from livekit import api
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from livekit.api import LiveKitAPI, ListRoomsRequest
import uuid

from chat_store import save_session, get_sessions, get_session, delete_session

load_dotenv()

logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

LIVEKIT_URL = os.getenv("LIVEKIT_URL", "wss://viola-psjk9asg.livekit.cloud")


@app.route("/")
def home():
    return jsonify({"status": "ok", "message": "Viola backend running"})


@app.route("/getToken")
def get_token():
    """Generate a LiveKit access token. Returns JSON with token, url, and room."""
    name = request.args.get("name", "user")
    room = request.args.get("room", None)

    if not room:
        room = "viola-" + str(uuid.uuid4())[:8]

    api_key = os.getenv("LIVEKIT_API_KEY")
    api_secret = os.getenv("LIVEKIT_API_SECRET")

    if not api_key or not api_secret:
        return jsonify({"error": "LiveKit credentials not configured"}), 500

    try:
        token = api.AccessToken(api_key, api_secret) \
            .with_identity(name) \
            .with_name(name) \
            .with_grants(api.VideoGrants(
                room_join=True,
                room=room,
            )) \
            .with_room_config(
                api.RoomConfiguration(
                    agents=[
                        api.RoomAgentDispatch(agent_name="")
                    ],
                )
            )

        jwt_token = token.to_jwt()
        app.logger.info(f"Token generated for name={name}, room={room}")

        return jsonify({
            "token": jwt_token,
            "url": LIVEKIT_URL,
            "room": room,
        })
    except Exception as e:
        app.logger.error(f"Token generation failed: {e}")
        return jsonify({"error": str(e)}), 500


# ─── Chat History API ───────────────────────────────────────────
# Note: Vite proxy rewrites /api/* → /* so routes here should NOT have /api prefix

@app.route("/history", methods=["GET"])
def list_history():
    """List all chat sessions."""
    sessions = get_sessions()
    return jsonify(sessions)


@app.route("/history/<session_id>", methods=["GET"])
def get_history(session_id):
    """Get a specific chat session."""
    session = get_session(session_id)
    if not session:
        return jsonify({"error": "Session not found"}), 404
    return jsonify(session)


@app.route("/history", methods=["POST"])
def save_history():
    """Save/update a chat session."""
    data = request.get_json()
    if not data or "id" not in data:
        return jsonify({"error": "Missing session data"}), 400

    result = save_session(
        session_id=data["id"],
        title=data.get("title", "Untitled Chat"),
        messages=data.get("messages", []),
    )
    return jsonify(result)


@app.route("/history/<session_id>", methods=["DELETE"])
def remove_history(session_id):
    """Delete a chat session."""
    success = delete_session(session_id)
    if success:
        return jsonify({"status": "deleted"})
    return jsonify({"error": "Not found"}), 404


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(host="0.0.0.0", port=port, debug=True)