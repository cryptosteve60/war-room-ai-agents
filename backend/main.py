"""
NEXUS STATION — CrewAI Backend
FastAPI server with hierarchical multi-agent crew.

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

from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

from crewai import Crew, LLM, Process, Task
from backend.agents import build_agents

# ── LLM — shared across all agents ───────────────────────────────────────────
# Default: gpt-4o-mini. Override via CREWAI_LLM env var, e.g.:
#   CREWAI_LLM=anthropic/claude-sonnet-4-6
_LLM_MODEL = os.getenv("CREWAI_LLM", "gpt-4o-mini")
SHARED_LLM = LLM(model=_LLM_MODEL)

AGENTS: dict = {}

# Agents that run inside the full hierarchical crew when COMMANDER-1 is invoked
SPECIALIST_IDS = [
    "mediabay", "researchlab", "factory",
    "commsdesk", "warroom", "armory", "quarters",
]

AGENT_NAMES = {
    "bridge":      "COMMANDER-1",
    "mediabay":    "MEDIA-7",
    "researchlab": "ANALYST-3",
    "factory":     "FORGE-2",
    "commsdesk":   "HERALD-5",
    "warroom":     "TACTICIAN-9",
    "armory":      "TOOLSMITH-4",
    "quarters":    "KEEPER-6",
}


@asynccontextmanager
async def lifespan(app: FastAPI):
    global AGENTS
    AGENTS = build_agents(SHARED_LLM)
    yield


app = FastAPI(title="NEXUS STATION API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Models ────────────────────────────────────────────────────────────────────
class CommandRequest(BaseModel):
    agent_id: str
    command: str


class CommandResponse(BaseModel):
    agent_id: str
    agent_name: str
    result: str
    status: str = "ok"


# ── Crew factory ──────────────────────────────────────────────────────────────
def _make_crew(agent_id: str, command: str, step_cb=None) -> tuple[Crew, Task]:
    """
    Bridge (COMMANDER-1) → hierarchical crew: commander manages all specialists.
    Any specialist → sequential crew with just that agent (direct execution).
    """
    agent = AGENTS[agent_id]

    if agent_id == "bridge":
        # Hierarchical crew: manager_agent must NOT appear in agents list
        specialists = [AGENTS[sid] for sid in SPECIALIST_IDS]
        task = Task(
            description=command,
            expected_output=(
                "A comprehensive, actionable response that synthesises input from "
                "all relevant specialists. Break the work into sub-tasks, delegate "
                "each to the appropriate specialist, then combine their outputs."
            ),
        )
        crew = Crew(
            agents=specialists,
            tasks=[task],
            process=Process.hierarchical,
            manager_agent=agent,
            memory=True,
            verbose=True,
            step_callback=step_cb,
        )
    else:
        # Specialist runs alone — fast, focused execution
        task = Task(
            description=command,
            agent=agent,
            expected_output="A thorough, actionable response to the given instruction.",
        )
        crew = Crew(
            agents=[agent],
            tasks=[task],
            process=Process.sequential,
            memory=False,
            verbose=True,
            step_callback=step_cb,
        )

    return crew, task


# ── Sync runner (called from thread) ─────────────────────────────────────────
def _run_sync(agent_id: str, command: str, log_q: queue.Queue) -> None:
    """Run a crew in a background thread, pushing log lines to log_q."""

    def _step(step_output):
        try:
            msg = getattr(step_output, "output", None) or str(step_output)
            log_q.put({"type": "log", "msg": str(msg)[:200]})
        except Exception:
            pass

    try:
        crew, _ = _make_crew(agent_id, command, step_cb=_step)
        result = crew.kickoff()
        log_q.put({"type": "result", "msg": str(result)})
    except Exception as exc:
        log_q.put({"type": "error", "msg": str(exc)})


# ── REST ──────────────────────────────────────────────────────────────────────
@app.get("/api/agents")
async def list_agents():
    return {"agents": [{"id": k, "name": v} for k, v in AGENT_NAMES.items()]}


@app.get("/api/health")
async def health():
    return {"status": "online", "agents": len(AGENTS), "llm": _LLM_MODEL}


@app.post("/api/command", response_model=CommandResponse)
async def send_command(req: CommandRequest):
    if req.agent_id not in AGENTS:
        return CommandResponse(
            agent_id=req.agent_id,
            agent_name="UNKNOWN",
            result=f"No agent for room '{req.agent_id}'",
            status="error",
        )

    log_q: queue.Queue = queue.Queue()
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, _run_sync, req.agent_id, req.command, log_q)

    # Drain queue — pick up result or first error
    result_msg = f"Task complete for {AGENT_NAMES.get(req.agent_id)}"
    status = "ok"
    while not log_q.empty():
        item = log_q.get_nowait()
        if item["type"] == "result":
            result_msg = item["msg"]
        elif item["type"] == "error":
            result_msg = item["msg"]
            status = "error"

    return CommandResponse(
        agent_id=req.agent_id,
        agent_name=AGENT_NAMES.get(req.agent_id, req.agent_id),
        result=result_msg,
        status=status,
    )



# ── WebSocket — real-time step-by-step streaming ──────────────────────────────
@app.websocket("/ws/{agent_id}")
async def agent_ws(websocket: WebSocket, agent_id: str):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            try:
                command = json.loads(data).get("command", "")
            except Exception:
                command = data

            if not command:
                continue

            name = AGENT_NAMES.get(agent_id, agent_id)
            await websocket.send_json({
                "type": "ack",
                "msg": f"{name} received command — thinking…",
            })

            log_q: queue.Queue = queue.Queue()

            thread = threading.Thread(
                target=_run_sync,
                args=(agent_id, command, log_q),
                daemon=True,
            )
            thread.start()

            # Stream every step as it arrives
            while thread.is_alive() or not log_q.empty():
                try:
                    item = log_q.get_nowait()
                    await websocket.send_json(item)
                except queue.Empty:
                    await asyncio.sleep(0.15)

            # Flush anything left after thread exits
            while not log_q.empty():
                await websocket.send_json(log_q.get_nowait())

    except WebSocketDisconnect:
        pass
