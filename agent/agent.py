import logging
from dotenv import load_dotenv
from livekit.agents import JobContext, AgentServer, cli, Agent, AgentSession
from livekit.plugins import openai, deepgram, elevenlabs

# Load environment variables from .env.local
load_dotenv(".env.local")

logger = logging.getLogger("pipeline-translator")
logger.setLevel(logging.INFO)

server = AgentServer()

class TranslatorAgent(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions="""
            You are a translator. You translate the user's speech from English to the target language.
            Every message you receive, translate it directly into the target language.
            Do not respond with anything else but the translation.
            """
        )

    async def on_enter(self):
        # We don't want the agent to speak first, just listen.
        pass

@server.rtc_session(agent_name="my-translator-agent")
async def entrypoint(ctx: JobContext):
    ctx.log_context_fields = {"room": ctx.room.name}

    # The session orchestrates the STT -> LLM -> TTS pipeline
    session = AgentSession(
        stt=deepgram.STT(model="nova-2"),
        llm=openai.LLM(model="gpt-4o-mini"),
        tts=elevenlabs.TTS(model="eleven_multilingual_v2"),
        preemptive_generation=True,
    )

    await session.start(
        agent=TranslatorAgent(),
        room=ctx.room,
    )
    await ctx.connect()
    await ctx.room.local_participant.set_name("Polyglot AI")

if __name__ == "__main__":
    cli.run_app(server)
