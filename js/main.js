// ── DATA ──────────────────────────────────────────────────────────────────────
const ROOMS = [
  {
    id:'bridge', name:'BRIDGE', sub:'Command Center', icon:'🎯', type:'OPS',
    color:'#3af', glow:'rgba(0,160,255,0.35)',
    level:3, xp:4200, xpMax:5000,
    agent:{ name:'COMMANDER-1', role:'Strategic Orchestrator', avatar:'🤖' },
    logs:[
      {t:'09:14:02', m:'Delegating 3 sub-tasks to Factory B', c:'info'},
      {t:'09:13:48', m:'War Room strategy sync complete', c:'ok'},
      {t:'09:12:31', m:'Monitoring all station outputs', c:''},
      {t:'09:10:05', m:'Daily objective parsed: grow revenue 15%', c:'info'},
    ],
    currentTask:'Analyzing station-wide KPIs and coordinating task delegation across 7 active agents…',
    metrics:{ revenue:'$820', tasks:'5/hr', latency:'140ms', successRate:'98%' }
  },
  {
    id:'mediabay', name:'MEDIA BAY', sub:'Content Production Studio', icon:'🎙️', type:'PROD',
    color:'#f90', glow:'rgba(255,140,0,0.3)',
    level:2, xp:2100, xpMax:3000,
    agent:{ name:'MEDIA-7', role:'Content & Publishing Agent', avatar:'✍️' },
    logs:[
      {t:'09:14:10', m:'Blog post "10 AI Trends" published ✓', c:'ok'},
      {t:'09:13:20', m:'SEO score: 92 — exceeds target', c:'ok'},
      {t:'09:12:00', m:'Drafting Twitter thread #3 of 5', c:''},
      {t:'09:10:45', m:'Scheduled: 3 posts queued for tonight', c:'info'},
    ],
    currentTask:'Writing SEO-optimized article on neural interfaces. Target 1,200 words, publish in 8 min…',
    metrics:{ revenue:'$640', tasks:'8/hr', latency:'220ms', successRate:'96%' }
  },
  {
    id:'researchlab', name:'RESEARCH LAB', sub:'Intelligence & Analysis', icon:'🔬', type:'OPS',
    color:'#b06fff', glow:'rgba(160,80,255,0.3)',
    level:2, xp:1800, xpMax:3000,
    agent:{ name:'ANALYST-3', role:'Research & Intel Agent', avatar:'🧠' },
    logs:[
      {t:'09:14:05', m:'Market report: $4.2B TAM confirmed', c:'ok'},
      {t:'09:13:00', m:'Competitor scrape complete — 12 signals', c:'info'},
      {t:'09:11:30', m:'Summarizing 8 arXiv papers on LLM tuning', c:''},
      {t:'09:09:55', m:'Alert: New competitor product launched', c:'warn'},
    ],
    currentTask:'Deep-diving competitor landscape. Indexing 48 pages. Estimated completion: 4 minutes…',
    metrics:{ revenue:'$380', tasks:'4/hr', latency:'310ms', successRate:'94%' }
  },
  {
    id:'factory', name:'FACTORY', sub:'Automation & Production', icon:'⚙️', type:'PROD',
    color:'#0f9', glow:'rgba(0,220,120,0.3)',
    level:3, xp:4800, xpMax:5000,
    agent:{ name:'FORGE-2', role:'Automation & Pipeline Agent', avatar:'🏭' },
    logs:[
      {t:'09:14:12', m:'Product #14 packaged & queued for sale', c:'ok'},
      {t:'09:13:50', m:'Pipeline throughput: 12 units/hr ↑', c:'ok'},
      {t:'09:12:10', m:'Raw input batch received (×40 items)', c:'info'},
      {t:'09:11:00', m:'Retry: item_29 failed validation, reprocessing', c:'warn'},
    ],
    currentTask:'Processing batch #31 — converting raw prompts into product listings. 14/15 complete…',
    metrics:{ revenue:'$960', tasks:'12/hr', latency:'95ms', successRate:'97%' }
  },
  {
    id:'commsdesk', name:'COMMS DECK', sub:'Communications Hub', icon:'📡', type:'OPS',
    color:'#3af', glow:'rgba(0,160,255,0.25)',
    level:2, xp:2400, xpMax:3000,
    agent:{ name:'HERALD-5', role:'Outreach & Comms Agent', avatar:'📨' },
    logs:[
      {t:'09:14:00', m:'Email campaign sent — 240 recipients', c:'ok'},
      {t:'09:13:10', m:'Open rate tracking: 31.2% ↑', c:'ok'},
      {t:'09:12:05', m:'Slack digest posted to #updates', c:'info'},
      {t:'09:10:50', m:'3 replies flagged for human review', c:'warn'},
    ],
    currentTask:'Composing follow-up sequence for 18 warm leads. Personalizing each message with CRM data…',
    metrics:{ revenue:'$420', tasks:'6/hr', latency:'180ms', successRate:'95%' }
  },
  {
    id:'warroom', name:'WAR ROOM', sub:'Strategy & Planning', icon:'⚔️', type:'OPS',
    color:'#ff4466', glow:'rgba(255,50,80,0.3)',
    level:2, xp:2700, xpMax:3000,
    agent:{ name:'TACTICIAN-9', role:'Strategy & Growth Agent', avatar:'♟️' },
    logs:[
      {t:'09:13:55', m:'Q2 growth plan v2 finalized', c:'ok'},
      {t:'09:12:40', m:'Scenario analysis: 3 paths modeled', c:'info'},
      {t:'09:11:15', m:'Risk: supply chain bottleneck flagged', c:'warn'},
      {t:'09:09:30', m:'OKRs synced with Bridge commander', c:'ok'},
    ],
    currentTask:'Running Monte Carlo simulations on 3 pricing models. Preparing recommendation report…',
    metrics:{ revenue:'$290', tasks:'3/hr', latency:'260ms', successRate:'99%' }
  },
  {
    id:'armory', name:'ARMORY', sub:'Tools & Equipment', icon:'🛡️', type:'SPT',
    color:'#0f9', glow:'rgba(0,200,100,0.25)',
    level:1, xp:3800, xpMax:4000,
    agent:{ name:'TOOLSMITH-4', role:'Tool Management Agent', avatar:'🔧' },
    logs:[
      {t:'09:14:08', m:'Browser tool: 12 sessions active', c:'ok'},
      {t:'09:13:35', m:'Code executor: 4 scripts queued', c:'info'},
      {t:'09:12:20', m:'API key rotation complete ✓', c:'ok'},
      {t:'09:10:10', m:'Memory store: 89% capacity — optimize soon', c:'warn'},
    ],
    currentTask:'Provisioning tool stack for Factory agent — web scraper, code sandbox, and file IO ready…',
    metrics:{ revenue:'$210', tasks:'7/hr', latency:'60ms', successRate:'99%' }
  },
  {
    id:'quarters', name:'QUARTERS', sub:'Agent Housing & Morale', icon:'🏠', type:'SPT',
    color:'#0f9', glow:'rgba(0,200,100,0.25)',
    level:1, xp:3200, xpMax:4000,
    agent:{ name:'KEEPER-6', role:'Agent Wellness & Memory Agent', avatar:'🌿' },
    logs:[
      {t:'09:13:45', m:'Memory pruned: 1.2GB freed for agents', c:'ok'},
      {t:'09:12:55', m:'Agent health check: all 8 nominal', c:'ok'},
      {t:'09:11:40', m:'Context windows optimized for 3 agents', c:'info'},
      {t:'09:09:15', m:'Morale index: 94/100 — excellent', c:'ok'},
    ],
    currentTask:'Archiving completed task histories. Updating shared memory store with session learnings…',
    metrics:{ revenue:'$90', tasks:'2/hr', latency:'45ms', successRate:'100%' }
  },
];

let selectedRoom = null;
let logIntervals = {};

// ── STARS ─────────────────────────────────────────────────────────────────────
function makeStars() {
  const el = document.getElementById('stars');
  for (let i = 0; i < 120; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 2 + 0.5;
    s.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random()*100}%;
      top:${Math.random()*100}%;
      animation-duration:${2+Math.random()*4}s;
      animation-delay:${Math.random()*4}s;
      opacity:${Math.random()*0.6}
    `;
    el.appendChild(s);
  }
}

// ── AGENT SIDEBAR LIST ────────────────────────────────────────────────────────
function buildAgentList() {
  const el = document.getElementById('agentList');
  ROOMS.forEach(r => {
    const d = document.createElement('div');
    d.className = 'agent-list-item';
    d.id = 'al_' + r.id;
    d.innerHTML = `
      <div class="agent-dot" style="background:${r.color};box-shadow:0 0 6px ${r.color}"></div>
      <span class="agent-name">${r.agent.name}</span>
      <span class="agent-status-badge badge-run">RUN</span>
    `;
    d.onclick = () => selectRoom(r.id);
    el.appendChild(d);
  });
}

// ── ROOM GRID ─────────────────────────────────────────────────────────────────
function buildGrid() {
  const grid = document.getElementById('roomGrid');
  const slots = 16;
  let ri = 0;
  for (let i = 0; i < slots; i++) {
    const cell = document.createElement('div');
    if (ri < ROOMS.length) {
      const r = ROOMS[ri++];
      cell.className = 'room-cell';
      cell.id = 'cell_' + r.id;
      cell.style.borderColor = r.color + '44';
      cell.style.boxShadow = `inset 0 0 30px ${r.glow}`;
      cell.innerHTML = `
        <div class="room-bg" style="background:radial-gradient(ellipse at center,${r.glow},transparent 70%)"></div>
        <div class="room-pulse" style="background:${r.color};box-shadow:0 0 8px ${r.color}"></div>
        <div class="room-type-tag tag-${r.type.toLowerCase()}">${r.type}</div>
        <div class="room-icon">${r.icon}</div>
        <div class="room-agent-center">
          <div class="room-agent-emoji">${r.agent.avatar}</div>
          <div class="room-agent-id" style="color:${r.color}cc">${r.agent.name}</div>
        </div>
        <div class="room-name">${r.name}</div>
        <div class="room-sublabel">${r.sub}</div>
        <div class="room-activity-bar">
          <div class="room-activity-fill" id="bar_${r.id}"
               style="width:${30+Math.random()*60}%;background:${r.color};box-shadow:0 0 6px ${r.color}"></div>
        </div>
        <div class="room-level">LV${r.level}</div>
      `;
      cell.onclick = () => selectRoom(r.id);
    } else {
      cell.className = 'room-cell empty';
      cell.innerHTML = `<div class="empty-plus">+</div><div class="empty-vacant">VACANT</div>`;
      cell.onclick = () => showToast('🔒 Unlock this room to deploy a new agent');
    }
    grid.appendChild(cell);
  }
}

// ── SELECT ROOM ───────────────────────────────────────────────────────────────
function selectRoom(id) {
  const r = ROOMS.find(x => x.id === id);
  if (!r) return;

  if (selectedRoom) {
    document.getElementById('cell_' + selectedRoom)?.classList.remove('active');
    document.getElementById('al_' + selectedRoom)?.classList.remove('active');
  }
  selectedRoom = id;
  document.getElementById('cell_' + id)?.classList.add('active');
  document.getElementById('al_' + id)?.classList.add('active');

  document.getElementById('detailName').textContent = r.name;
  document.getElementById('detailSub').textContent = r.sub;

  const body = document.getElementById('detailBody');
  body.innerHTML = `
    <div class="agent-card">
      <div class="agent-card-header">
        <div class="agent-avatar" style="background:${r.color}22;border-color:${r.color}55">${r.agent.avatar}</div>
        <div>
          <div class="agent-card-name" style="color:${r.color}">${r.agent.name}</div>
          <div class="agent-card-role">${r.agent.role}</div>
        </div>
      </div>
      <div class="agent-task task-typing" id="taskText">${r.currentTask}</div>
      <div class="xp-bar-wrap">
        <div class="xp-label">
          <span>XP</span>
          <span>${r.xp.toLocaleString()} / ${r.xpMax.toLocaleString()}</span>
        </div>
        <div class="xp-bar">
          <div class="xp-fill" style="width:0%;background:${r.color};box-shadow:0 0 6px ${r.color}"></div>
        </div>
      </div>
    </div>

    <div class="metrics-row">
      <div class="metric-box">
        <div class="metric-label">Revenue</div>
        <div class="metric-val" style="color:var(--glow-gold)">${r.metrics.revenue}</div>
        <div class="metric-sub">this session</div>
      </div>
      <div class="metric-box">
        <div class="metric-label">Tasks/hr</div>
        <div class="metric-val" style="color:${r.color}">${r.metrics.tasks}</div>
        <div class="metric-sub">throughput</div>
      </div>
      <div class="metric-box">
        <div class="metric-label">Latency</div>
        <div class="metric-val" style="color:var(--glow-cyan)">${r.metrics.latency}</div>
        <div class="metric-sub">avg response</div>
      </div>
      <div class="metric-box">
        <div class="metric-label">Success</div>
        <div class="metric-val" style="color:var(--glow-green)">${r.metrics.successRate}</div>
        <div class="metric-sub">completion rate</div>
      </div>
    </div>

    <div class="upgrade-badge">
      <span class="icon">⬆️</span>
      <span>UPGRADE AVAILABLE — Level ${r.level} → ${r.level + 1}</span>
    </div>

    <div>
      <div class="sidebar-section-title" style="margin-bottom:6px">Live Log</div>
      <div class="log-feed" id="logFeed">
        ${r.logs.map(l =>
          `<div class="log-line">
            <span class="log-time">${l.t}</span>
            <span class="log-msg ${l.c}">${l.m}</span>
          </div>`
        ).join('')}
      </div>
    </div>
  `;

  // Animate XP bar after a tick so transition fires
  setTimeout(() => {
    const fill = body.querySelector('.xp-fill');
    if (fill) fill.style.width = (r.xp / r.xpMax * 100).toFixed(1) + '%';
  }, 80);

  startLiveLog(r);
  connectAgentSocket(r.id);
}

// ── LIVE LOG ──────────────────────────────────────────────────────────────────
const LIVE_MSGS = [
  ['Fetching external data source...', ''],
  ['LLM call returned 312 tokens', 'info'],
  ['Sub-task spawned: validate_output', 'info'],
  ['Memory read: 4 relevant chunks', ''],
  ['Tool: browser.fetch() → 200 OK', 'ok'],
  ['Retrying failed subtask (attempt 2/3)', 'warn'],
  ['Output validated ✓ sending to Bridge', 'ok'],
  ['Checkpoint saved to memory store', 'info'],
  ['Rate limit headroom: 87%', ''],
  ['New instruction received from Bridge', 'info'],
];

function startLiveLog(room) {
  Object.values(logIntervals).forEach(clearInterval);
  logIntervals = {};
  logIntervals[room.id] = setInterval(() => {
    const feed = document.getElementById('logFeed');
    if (!feed) { clearInterval(logIntervals[room.id]); return; }
    const msg = LIVE_MSGS[Math.floor(Math.random() * LIVE_MSGS.length)];
    const now = new Date();
    const t = [now.getHours(), now.getMinutes(), now.getSeconds()]
      .map(n => String(n).padStart(2, '0')).join(':');
    const line = document.createElement('div');
    line.className = 'log-line';
    line.innerHTML = `<span class="log-time">${t}</span><span class="log-msg ${msg[1]}">${msg[0]}</span>`;
    feed.appendChild(line);
    feed.scrollTop = feed.scrollHeight;
  }, 1800 + Math.random() * 1200);
}

// ── BACKEND API ───────────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:8000';
let activeSocket = null;

function connectAgentSocket(roomId) {
  if (activeSocket) { activeSocket.close(); activeSocket = null; }
  try {
    const ws = new WebSocket(`ws://localhost:8000/ws/${roomId}`);
    ws.onopen  = () => console.log(`[WS] connected → ${roomId}`);
    ws.onclose = () => { activeSocket = null; };
    ws.onerror = () => { activeSocket = null; };
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        const feed = document.getElementById('logFeed');
        const now  = new Date();
        const t    = [now.getHours(), now.getMinutes(), now.getSeconds()]
          .map(n => String(n).padStart(2, '0')).join(':');

        if (data.type === 'ack') {
          appendLog(feed, t, data.msg, 'info');
          const tt = document.getElementById('taskText');
          if (tt) { tt.textContent = data.msg; tt.classList.add('task-typing'); }
        } else if (data.type === 'result') {
          appendLog(feed, t, '✓ ' + data.msg.slice(0, 120), 'ok');
          const tt = document.getElementById('taskText');
          if (tt) { tt.textContent = data.msg.slice(0, 160) + '…'; tt.classList.remove('task-typing'); }
        } else if (data.type === 'error') {
          appendLog(feed, t, '⚠ ' + data.msg, 'warn');
        }
      } catch {}
    };
    activeSocket = ws;
  } catch (err) {
    console.warn('[WS] backend not reachable, using mock logs');
  }
}

function appendLog(feed, t, msg, cls) {
  if (!feed) return;
  const line = document.createElement('div');
  line.className = 'log-line';
  line.innerHTML = `<span class="log-time">${t}</span><span class="log-msg ${cls}">${msg}</span>`;
  feed.appendChild(line);
  feed.scrollTop = feed.scrollHeight;
}

// ── SEND COMMAND ──────────────────────────────────────────────────────────────
function sendCommand() {
  const inp = document.getElementById('chatInput');
  const val = inp.value.trim();
  if (!val) return;
  if (!selectedRoom) { showToast('⚠️ Select a room first'); return; }
  const r = ROOMS.find(x => x.id === selectedRoom);
  inp.value = '';

  const tt = document.getElementById('taskText');
  if (tt) { tt.textContent = val + '…'; tt.classList.add('task-typing'); }

  // Try backend WebSocket first, fall back gracefully
  if (activeSocket && activeSocket.readyState === WebSocket.OPEN) {
    activeSocket.send(JSON.stringify({ command: val }));
    showToast(`📨 Command sent to ${r.agent.name} via CrewAI`);
  } else {
    // Optimistic mock response if backend offline
    showToast(`📨 Command queued for ${r.agent.name}`);
    setTimeout(() => {
      const feed = document.getElementById('logFeed');
      const now  = new Date();
      const t    = [now.getHours(), now.getMinutes(), now.getSeconds()]
        .map(n => String(n).padStart(2,'0')).join(':');
      appendLog(feed, t, `Command received: "${val.slice(0,60)}"`, 'info');
    }, 600);
  }
}

// ── TOAST ─────────────────────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'notif-toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ── CLOCK ─────────────────────────────────────────────────────────────────────
function updateClock() {
  const el = document.getElementById('clockBar');
  if (el) el.textContent = new Date().toLocaleTimeString();
}

// ── LIVE ACTIVITY BARS ────────────────────────────────────────────────────────
function animateBars() {
  ROOMS.forEach(r => {
    const bar = document.getElementById('bar_' + r.id);
    if (bar) bar.style.width = (20 + Math.random() * 75) + '%';
  });
}

// ── REVENUE TICKER ────────────────────────────────────────────────────────────
let baseRevenue = 4812;
function tickRevenue() {
  baseRevenue += Math.floor(Math.random() * 8);
  const el = document.getElementById('totalRevenue');
  if (el) el.textContent = '$' + baseRevenue.toLocaleString();
}

// ── INIT ──────────────────────────────────────────────────────────────────────
makeStars();
buildAgentList();
buildGrid();

document.getElementById('chatInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') sendCommand();
});
document.getElementById('chatSend').addEventListener('click', sendCommand);

setInterval(updateClock, 1000);
setInterval(animateBars, 3000);
setInterval(tickRevenue, 4000);
updateClock();

setTimeout(() => selectRoom('bridge'), 400);
