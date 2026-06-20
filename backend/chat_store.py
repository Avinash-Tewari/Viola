"""
Simple JSON file-based chat history store for Viola.
Stores chat sessions as JSON files in a 'chats/' directory.
"""

import json
import os
import uuid
from datetime import datetime

CHATS_DIR = os.path.join(os.path.dirname(__file__), "chats")

def _ensure_dir():
    os.makedirs(CHATS_DIR, exist_ok=True)

def save_session(session_id: str, title: str, messages: list) -> dict:
    """Save or update a chat session."""
    _ensure_dir()
    filepath = os.path.join(CHATS_DIR, f"{session_id}.json")
    
    # Load existing or create new
    if os.path.exists(filepath):
        with open(filepath, "r") as f:
            data = json.load(f)
        data["messages"] = messages
        data["title"] = title
        data["updated_at"] = datetime.now().isoformat()
    else:
        data = {
            "id": session_id,
            "title": title,
            "messages": messages,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        }
    
    with open(filepath, "w") as f:
        json.dump(data, f, indent=2)
    
    return data

def get_sessions() -> list:
    """Get all chat sessions (metadata only, no messages)."""
    _ensure_dir()
    sessions = []
    for fname in os.listdir(CHATS_DIR):
        if fname.endswith(".json"):
            filepath = os.path.join(CHATS_DIR, fname)
            try:
                with open(filepath, "r") as f:
                    data = json.load(f)
                sessions.append({
                    "id": data["id"],
                    "title": data.get("title", "Untitled"),
                    "created_at": data.get("created_at"),
                    "updated_at": data.get("updated_at"),
                    "message_count": len(data.get("messages", [])),
                })
            except (json.JSONDecodeError, KeyError):
                continue
    
    # Sort by updated_at descending
    sessions.sort(key=lambda x: x.get("updated_at", ""), reverse=True)
    return sessions

def get_session(session_id: str) -> dict | None:
    """Get a specific chat session with messages."""
    filepath = os.path.join(CHATS_DIR, f"{session_id}.json")
    if not os.path.exists(filepath):
        return None
    with open(filepath, "r") as f:
        return json.load(f)

def delete_session(session_id: str) -> bool:
    """Delete a chat session."""
    filepath = os.path.join(CHATS_DIR, f"{session_id}.json")
    if os.path.exists(filepath):
        os.remove(filepath)
        return True
    return False
