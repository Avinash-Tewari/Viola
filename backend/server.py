# # server.py
# import os

# from livekit import api
# from flask import Flask,request
# from flask_cors import CORS 
# from dotenv import load_dotenv
# from livekit.api import LiveKitAPI,ListRoomsRequest
# import uuid

# load_dotenv()

# app = Flask(__name__)
# CORS(app,resources={r"/*": {"origins": "*" }}) # so frontend can connect from a different port

# async def generate_room_name():
#    name= "room-" +str(uuid.uuid4())[:8]
#    rooms= await get_rooms()
#    while name in rooms:
#       name = "room-" +str(uuid.uuid4())[:8]
#    return name

# async def get_rooms():
#    api= LiveKitAPI()
#    rooms= await api.room.list_rooms(ListRoomsRequest())
#    await api.aclose()
#    return [room.name for room in rooms.rooms]

# @app.route('/getToken')
# async def getToken():
#   name= request.args.get("name", "my name")
#   room= request.args.get("room", None)

#   if not room:
#      room= await generate_room_name()

#   token = api.AccessToken(os.getenv('LIVEKIT_API_KEY'), os.getenv('LIVEKIT_API_SECRET')) \
#     .with_identity(name) \
#     .with_name(name) \
#     .with_grants(api.VideoGrants(
#         room_join=True,
#         room=room,
#     ))
#   return token.to_jwt()

# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=5001, debug=True)

import os
import logging
from livekit import api
from flask import Flask, request
from flask_cors import CORS 
from dotenv import load_dotenv
from livekit.api import LiveKitAPI, ListRoomsRequest
import uuid

load_dotenv()

# setup logging
logging.basicConfig(level=logging.DEBUG)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*" }})

async def generate_room_name():
    name = "room-" + str(uuid.uuid4())[:8]
    rooms = await get_rooms()
    while name in rooms:
        name = "room-" + str(uuid.uuid4())[:8]
    return name

async def get_rooms():
    api_client = LiveKitAPI()
    rooms = await api_client.room.list_rooms(ListRoomsRequest())
    await api_client.aclose()
    return [room.name for room in rooms.rooms]

@app.route("/")
def home():
    return {"status": "ok", "message": "Backend running!"}

@app.route("/getToken")
async def getToken():
    name = request.args.get("name", "my name")
    room = request.args.get("room", None)

    if not room:
        room = await generate_room_name()

    token = api.AccessToken(os.getenv("LIVEKIT_API_KEY"), os.getenv("LIVEKIT_API_SECRET")) \
        .with_identity(name) \
        .with_name(name) \
        .with_grants(api.VideoGrants(
            room_join=True,
            room=room,
        ))

    jwt_token = token.to_jwt()

    # 🔹 log it for debugging
    app.logger.info(f"Generated token for name={name}, room={room}: {jwt_token[:50]}...")

    return jwt_token

# 🔹 new test endpoint just to check token directly
@app.route("/testToken")
def testToken():
    name = "TestUser"
    room = "TestRoom"
    token = api.AccessToken(os.getenv("LIVEKIT_API_KEY"), os.getenv("LIVEKIT_API_SECRET")) \
        .with_identity(name) \
        .with_name(name) \
        .with_grants(api.VideoGrants(
            room_join=True,
            room=room,
        ))
    jwt_token = token.to_jwt()
    return {"test_token": jwt_token}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))  
    app.run(host="0.0.0.0", port=port)
