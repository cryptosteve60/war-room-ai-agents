"""
NEXUS STATION — CrewAI Backend
FastAPI server exposing each station agent via REST + WebSocket.

Requires one of:
  OPENAI_API_KEY=sk-...
  ANTHROPIC_API_KEY=sk-ant-...   (set CREWAI_LLM=anthropic/claude-sonnet-4-6)
"""

import asyncio
import json
import os
import queue
import threading
from contextlib import asynccontextmanager
from io import StringIO
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

load_dotenv()

# ── LLM selection ─────────────────────────────────────────────────────────────
# CrewAI defaults to OpenAI. Override with CREWAI_LLM env var, e.g.:
#   CREWAI_LLM=anthropic/claude-sonnet-4-6
LLM_MODEL = os.getenv("CREWAI_LLM", "gpt-4o-mini")

from crewai import Task, Crew
from backend.agents import build_agents

# Build agents once at startup
AGENTS: dict = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    global AGENTS
    AGENTS = build_agents()
    yield

app = FastAPI(title="NEXUS STATION API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve the frontend from the project root
app.mount("/static", StaticFiles(directory="."), name="static")


# ── Request / Response models ─────────────────────────────────────────────────
class CommandRequest(BaseModel):
    agent_id: str
    command: str


class CommandResponse(BaseModel):
    agent_id: str
    agent_name: str
    result: str
    status: str = "ok"


# ── Helpers ───────────────────────────────────────────────────────────────────
AGENT_NAMES = {
    "bridge":     "COMMANDER-1",
    "mediabay":   "MEDIA-7",
    "researchlab":"ANALYST-3",
    "factory":    "FORGE-2",
    "commsdesk":  "HERALD-5",
    "warroom":    "TACTICIAN-9",
    "armory":     "TOOLSMITH-4",
    "quarters":   "KEEPER-6",
}

def _run_crew_sync(agent_id: str, command: str) -> str:
    """Run a single-agent crew synchronously (called in a thread)."""
    agent = AGENTS.get(agent_id)
    if agent is None:
        return f"Unknown agent: {agent_id}"

    task = Task(
        description=command,
        agent=agent,
        expected_output="A thorough, actionable response to the given instruction.",
    )
    crew = Crew(agents=[agent], tasks=[task], verbose=False)
    result = crew.kickoff()
    return str(result)


# ── REST endpoints ────────────────────────────────────────────────────────────
@app.get("/api/agents")
async def list_agents():
    return {
        "agents": [
            {"id": aid, "name": name}
            for aid, name in AGENT_NAMES.items()
        ]
    }


@app.post("/api/command", response_model=CommandResponse)
async def send_command(req: CommandRequest):
    if req.agent_id not in AGENTS:
        return CommandResponse(
            agent_id=req.agent_id,
            agent_name="UNKNOWN",
            result=f"No agent found for room '{req.agent_id}'",
            status="error",
        )

    # Run CrewAI in a thread so we don't block the event loop
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(None, _run_crew_sync, req.agent_id, req.command)

    return CommandResponse(
        agent_id=req.agent_id,
        agent_name=AGENT_NAMES.get(req.agent_id, req.agent_id),
        result=result,
        status="ok",
    )


# ── WebSocket — streaming agent output ───────────────────────────────────────
@app.websocket("/ws/{agent_id}")
async def agent_ws(websocket: WebSocket, agent_id: str):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                command = msg.get("command", "")
            except Exception:
                command = data

            if not command:
                continue

            # Send an immediate ack
            await websocket.send_json({"type": "ack", "msg": f"Running command on {AGENT_NAMES.get(agent_id, agent_id)}…"})

            # Stream result chunks via queue + thread
            result_queue: queue.Queue = queue.Queue()

            def run():
                try:
                    result = _run_crew_sync(agent_id, command)
                    result_queue.put({"type": "result", "msg": result})
                except Exception as exc:
                    result_queue.put({"type": "error", "msg": str(exc)})

            thread = threading.Thread(target=run, daemon=True)
            thread.start()

            # Poll queue and forward chunks to client
            while thread.is_alive() or not result_queue.empty():
                try:
                    item = result_queue.get_nowait()
                    await websocket.send_json(item)
                except queue.Empty:
                    await asyncio.sleep(0.2)

            # Ensure anything remaining is sent
            while not result_queue.empty():
                await websocket.send_json(result_queue.get_nowait())

    except WebSocketDisconnect:
        pass


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/api/health")
async def health():
    return {"status": "online", "agents": len(AGENTS), "llm": LLM_MODEL}
