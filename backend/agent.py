from dotenv import load_dotenv
from livekit.agents import ChatContext, ChatMessage
from livekit.plugins import openai
from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions
from livekit.plugins import (
    
    # cartesia,
    # deepgram,
    noise_cancellation,
    # silero,
)
# from livekit.plugins.turn_detector.multilingual import MultilingualModel
from livekit.plugins import google
from prompts import AGENT_INSTRCUTION,SESSION_INSTRUCTION
from tools import get_weather, search_web,email_tool
from livekit.agents import function_tool

load_dotenv()

class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(
                instructions=AGENT_INSTRCUTION,
                llm=google.beta.realtime.RealtimeModel(
                        voice="Aoede",
                        temperature=0.8,
                    ),
                    tools=[
                        get_weather,    
                        search_web,
                        email_tool
                    ]
            )


async def entrypoint(ctx: agents.JobContext):
    session = AgentSession(
        
        # stt=deepgram.STT(model="nova-3", language="multi"),
        llm=openai.LLM(model="gpt-4o-mini"),
        # tts=cartesia.TTS(model="sonic-2", voice="f786b574-daa5-4673-aa0c-cbe3e8534c02"),
        # vad=silero.VAD.load(),
        # turn_detection=MultilingualModel(),
        
    )

    await session.start(
        room=ctx.room,
        agent=Assistant(),
        room_input_options=RoomInputOptions(
            # LiveKit Cloud enhanced noise cancellation
            # - If self-hosting, omit this parameter
            # - For telephony applications, use `BVCTelephony` for best results
            video_enabled= True,
            noise_cancellation=noise_cancellation.BVC(), 
        ),
        
    )

    await session.generate_reply(
        instructions=SESSION_INSTRUCTION
        
    )



if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))