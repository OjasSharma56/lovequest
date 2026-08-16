/* =========================================================
   CUSTOMIZE ME — everything a person would want to edit
   ========================================================= */
const OJAS_PHONE = "+15875775519";
const SEND_LABEL = 'SEND TO OJAS 💌';
const SEND_DONE_LABEL = 'SENT 💌 ✓';
const CAL_LABEL = 'ADD TO CALENDAR 📅';
const CAL_DONE_LABEL = 'ADDED ✓';

const CONFIG = {
  question: "You've been summoned.",
  questionVariants: [
    "You've been summoned.",
    "kenzie, still yes\nto going out with me?",
    "ok but for real,\nwill you go out with me?",
    "kenzie. asking again.\ngo out with me?",
    "one more time for\nthe people in back —\ngo out with me?"
  ],
  activities: [
    { id:"cook",     label:"COOKING\nTOGETHER", icon:"cook" },
    { id:"cuddle",   label:"CUDDLE &\nMOVIE",   icon:"movie" },
    { id:"study",    label:"STUDY\nDATE",       icon:"book" },
    { id:"boulder",  label:"BOULDER-\nING",     icon:"boulder", text:"Bouldering" },
    { id:"football", label:"FOOTBALL",          icon:"football" },
    { id:"escape",   label:"ESCAPE\nROOM",      icon:"lock" },
  ],
  note: [
    "Good girl. You survived Level 1. Add this to the calendar (which you should have made by now) and send me the brief so I can lock it in. I'll handle the rest. Show up looking cute."
  ],
  noteReturning: [
    "back again — I like that.",
    "still cooking, still down for movie night, still yours whenever you actually pick a day.",
    "pick something and let's go do it for real this time 😄"
  ],
  signoff: "— Ojas ♥"
};

/* ---------------- pixel sprite renderer ---------------- */
function drawPixels(svgEl, rows, cell, palette){
  const w = rows[0].length, h = rows.length;
  svgEl.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svgEl.innerHTML = '';
  const ns = 'http://www.w3.org/2000/svg';
  for(let y=0;y<h;y++){
    for(let x=0;x<w;x++){
      const c = rows[y][x];
      if(c === '.') continue;
      const rect = document.createElementNS(ns,'rect');
      rect.setAttribute('x', x); rect.setAttribute('y', y);
      rect.setAttribute('width', 1); rect.setAttribute('height', 1);
      rect.setAttribute('fill', palette[c]);
      svgEl.appendChild(rect);
    }
  }
}

const INK = 'var(--screen-ink)', DARK = 'var(--screen-dark)', TRIM = '#c8447a', WHITE = '#fdf3ef', PIGPINK = 'var(--screen-mid)', BG='none';
const PAL = { '0':BG, 'k':INK, 'd':DARK, 't':TRIM, 'w':WHITE, 'p':PIGPINK };

/* her favorite animal — the mascot on the ask screen */
const PIG = [
".kkkkk.......kkkkk.",
"kppppk.......kppppk",
"kppppkk.....kkppppk",
"kpppppkk...kkpppppk",
".kpppppkkkkkpppppk.",
".kpppppppppppppppk.",
".kppkkppppppkkpppk.",
".kppkkppppppkkpppk.",
".kppppkkkkkkkppppk.",
".kppppkpppppkppppk.",
".kppppkpdpdpkppppk.",
".kppppkkkkkkkppppk.",
"..kppppppppppppk...",
"...kkppppppppkk....",
"....kk.kkkk.kk.....",
"....kk......kk....."
];

const PIG_WINK = [
".kkkkk.......kkkkk.",
"kppppk.......kppppk",
"kppppkk.....kkppppk",
"kpppppkk...kkpppppk",
".kpppppkkkkkpppppk.",
".kpppppppppppppppk.",
".kpppkppppppkkpppk.",
".kpppkppppppkkpppk.",
".kppppkkkkkkkppppk.",
".kppppkpppppkppppk.",
".kppppkpdpdpkppppk.",
".kppppkkkkkkkppppk.",
"..kppppppppppppk...",
"...kkppppppppkk....",
"....kk.kkkk.kk.....",
"....kk......kk....."
];

const CAL = [
".kkkkkkkkkkkkk.",
"kwwwwwwwwwwwwwk",
"kdkkkkkkkkkkdwk",
"kwwwwwwwwwwwwwk",
"kw.tt.tt.tt.wwk",
"kw...........wk",
"kw.tt.tt.tt.wwk",
"kw...........wk",
"kw.tt.tt.tt.wwk",
"kwwwwwwwwwwwwwk",
".kkkkkkkkkkkkk."
];

const ICONS = {
  movie: ["kkkkkkkk","k.kk.kkk","kkkkkkkk","kddddddk","kddddddk","kddddddk","kkkkkkkk"],
  golf:  ["...k....","...k....","..ttt...","...k....","...k....",".kkkkk..","..kkk..."],
  cook:  ["..kkkk..",".k....k.","k......k","k..dd..k","k..dd..k","kkkkkkkk",".kk..kk."],
  stars: ["..t.....","..t.....",".ttttt..","..t.....","..t...t.","......t.","...t...."],
  arcade:["kkkkkkkk","kdddddDk".replace('D','d'),"kd.tt.dk","kdtttt dk".replace(' ',''), "kd.tt.dk","kddddddk","kkkkkkkk"],
  picnic:["........","kkkkkkkk","ktttttdk","ktttttdk","ktttttdk","kkkkkkkk","..kk.kk."],
  book:  [".kkkkkk.","kd....dk","kd.tt.dk","kd....dk","kd.tt.dk","kd....dk",".kkkkkk."],
  boulder:[".....k..","....kdk.","...kddk.","..kdddk.",".kddddk.","kddddddk","kkkkkkkk"],
  football:["..kkkk..",".kddddk.","kdt..tdk","kd.tt.dk","kdt..tdk",".kddddk.","..kkkk.."],
  lock:  ["..kkkk..",".k....k.",".k....k.","kkkkkkkk","kdd..ddk","kd.tt.dk","kkkkkkkk"]
};

/* ---------------- state ---------------- */
let evadeCount = 0;
let selectedTod = null;
let selectedActs = new Set();
let customActivity = '';
let soundOn = false;
let achievementShown = false;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let toastTimer;
function showToast(text, ms=2600){
  const toast = document.getElementById('toast');
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> toast.classList.remove('show'), ms);
}

/* ---------------- remember progress across visits ---------------- */
const STORAGE_KEY = 'lovequest_state_v1';

function saveState(level){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      level,
      date: dateInput.value,
      tod: selectedTod,
      acts: [...selectedActs],
      custom: customActivity
    }));
  }catch(e){}
}

function clearState(){
  try{ localStorage.removeItem(STORAGE_KEY); }catch(e){}
}

function restoreState(){
  let saved;
  try{ saved = JSON.parse(localStorage.getItem(STORAGE_KEY)); }catch(e){ return; }
  if(!saved || typeof saved.level !== 'number' || saved.level < 1) return;

  if(saved.date) dateInput.value = saved.date;
  if(saved.tod){
    selectedTod = saved.tod;
    const chip = document.querySelector(`[data-tod="${saved.tod}"]`);
    if(chip) chip.classList.add('sel');
  }
  refreshDateNext();

  if(Array.isArray(saved.acts)){
    saved.acts.forEach(id=>{
      selectedActs.add(id);
      const pill = document.querySelector(`.pill[data-id="${id}"]`);
      if(pill) pill.classList.add('sel');
    });
  }
  if(saved.custom){
    customActivity = saved.custom;
    document.getElementById('customActivity').value = saved.custom;
  }
  refreshLockIn();

  if(saved.level === 3) buildNote();
  setLevel(saved.level);
}

/* audio: tiny synthesized blips, no external files */
let actx;
function blip(freq=660, dur=0.08, type='square'){
  if(!soundOn) return;
  actx = actx || new (window.AudioContext || window.webkitAudioContext)();
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.value = 0.05;
  o.connect(g); g.connect(actx.destination);
  o.start();
  g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + dur);
  o.stop(actx.currentTime + dur);
}

function setLevel(n){
  document.querySelectorAll('.level').forEach(el=>{
    el.classList.toggle('active', Number(el.dataset.level) === n);
  });
  document.querySelectorAll('.pip').forEach(p=>{
    p.classList.toggle('done', Number(p.dataset.pip) <= n);
  });
  document.getElementById('led').classList.toggle('on', n === 3);
  if(window.__fitConsole) window.__fitConsole();
  saveState(n);
}

/* ---------------- keep it fresh across repeat visits ---------------- */
const VISITS_KEY = 'lovequest_visits_v1';
let visitCount = 1;
try{
  visitCount = parseInt(localStorage.getItem(VISITS_KEY) || '0', 10) + 1;
  localStorage.setItem(VISITS_KEY, String(visitCount));
}catch(e){}

/* ---------------- Level 1: the ask ---------------- */
const questionText = CONFIG.questionVariants[(visitCount - 1) % CONFIG.questionVariants.length];
document.getElementById('question').innerHTML = questionText.replace(/\n/g, '<br>');
drawPixels(document.getElementById('pigSprite'), visitCount % 2 === 0 ? PIG_WINK : PIG, 1, PAL);
drawPixels(document.getElementById('calSprite'), CAL, 1, PAL);
if(visitCount > 1){
  document.getElementById('playCount').textContent = `save file — playthrough #${visitCount}`;
}

const stage1 = document.querySelector('[data-level="0"] .ask-row');
const noBtn = document.getElementById('noBtn');
const yesBtn = document.getElementById('yesBtn');
const evadeCounter = document.getElementById('evadeCounter');

const levelZero = document.querySelector('[data-level="0"]');

function rectsOverlap(a, b, pad){
  return !(a.right + pad < b.left || a.left - pad > b.right || a.bottom + pad < b.top || a.top - pad > b.bottom);
}

function dodge(){
  if(reduceMotion) return;
  const hostRect = levelZero.getBoundingClientRect();
  const noW = noBtn.offsetWidth, noH = noBtn.offsetHeight;
  const padX = 12, padY = 12, safeBottom = 46;
  const maxX = Math.max(hostRect.width - noW - padX*2, 20);
  const maxY = Math.max(hostRect.height - noH - padY - safeBottom, 20);
  const toLocal = (r) => ({
    left: r.left - hostRect.left, right: r.right - hostRect.left,
    top: r.top - hostRect.top, bottom: r.bottom - hostRect.top
  });
  const yesLocal = toLocal(yesBtn.getBoundingClientRect());
  const headlineLocal = toLocal(document.getElementById('question').getBoundingClientRect());
  let x, y, tries = 0;
  do{
    x = padX + Math.random() * maxX;
    y = padY + Math.random() * maxY;
    tries++;
  } while(
    (rectsOverlap({left:x, right:x+noW, top:y, bottom:y+noH}, yesLocal, 14) ||
     rectsOverlap({left:x, right:x+noW, top:y, bottom:y+noH}, headlineLocal, 10))
    && tries < 30
  );
  noBtn.style.left = x + 'px';
  noBtn.style.top = y + 'px';
  evadeCount++;
  blip(300 + Math.random()*200, 0.06, 'triangle');
  evadeCounter.textContent = evadeCounterText(evadeCount);
  if(evadeCount === 15 && !achievementShown){
    achievementShown = true;
    showToast('🏆 ACHIEVEMENT: UNCATCHABLE');
    blip(1200, 0.15, 'square');
  }
}

function evadeCounterText(n){
  if(n < 3) return ' ';
  if(n < 10) return `“no” has evaded love ${n} times`;
  if(n < 15) return `okay this is getting ridiculous (${n})`;
  return `“no” remains undefeated (${n} dodges)`;
}
noBtn.addEventListener('pointerenter', dodge);
noBtn.addEventListener('pointerdown', (e)=>{ e.preventDefault(); dodge(); });
noBtn.addEventListener('click', (e)=>{ e.preventDefault(); dodge(); });

window.addEventListener('load', ()=>{
  const hostRect = levelZero.getBoundingClientRect();
  const yesRect = yesBtn.getBoundingClientRect();
  const noW = noBtn.offsetWidth || 48;
  const desiredLeft = yesRect.right - hostRect.left + 14;
  const maxLeft = hostRect.width - noW - 12;
  noBtn.style.left = Math.min(desiredLeft, Math.max(maxLeft, 12)) + 'px';
  noBtn.style.top = (yesRect.top - hostRect.top + 10) + 'px';
});

yesBtn.addEventListener('click', ()=>{
  blip(880, 0.12, 'square');
  setLevel(1);
});

/* ---------------- Level 2: date ---------------- */
const dateInput = document.getElementById('dateInput');
const dateNext = document.getElementById('dateNext');
const today = new Date();
dateInput.min = today.toISOString().slice(0,10);

function refreshDateNext(){
  dateNext.disabled = !(dateInput.value && selectedTod);
}
dateInput.addEventListener('change', refreshDateNext);
document.getElementById('todChips').addEventListener('click', (e)=>{
  const chip = e.target.closest('.chip');
  if(!chip) return;
  document.querySelectorAll('#todChips .chip').forEach(c=>c.classList.remove('sel'));
  chip.classList.add('sel');
  selectedTod = chip.dataset.tod;
  blip(500, 0.05, 'square');
  refreshDateNext();
  saveState(1);
});
dateNext.addEventListener('click', ()=>{
  blip(700, 0.08, 'square');
  setLevel(2);
});

/* ---------------- Level 3: activities ---------------- */
const grid = document.getElementById('activityGrid');
CONFIG.activities.forEach(act=>{
  const btn = document.createElement('button');
  btn.className = 'pill';
  btn.dataset.id = act.id;
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS,'svg');
  svg.setAttribute('width','28'); svg.setAttribute('height','28');
  svg.classList.add('sprite');
  btn.appendChild(svg);
  const span = document.createElement('span');
  span.style.whiteSpace = 'pre-line';
  span.textContent = act.label;
  btn.appendChild(span);
  grid.appendChild(btn);
  drawPixels(svg, ICONS[act.icon], 1, PAL);
});
function refreshLockIn(){
  document.getElementById('lockIn').disabled = selectedActs.size === 0 && customActivity.trim() === '';
}
grid.addEventListener('click', (e)=>{
  const pill = e.target.closest('.pill');
  if(!pill) return;
  pill.classList.toggle('sel');
  const id = pill.dataset.id;
  selectedActs.has(id) ? selectedActs.delete(id) : selectedActs.add(id);
  blip(selectedActs.has(id) ? 620 : 260, 0.05, 'square');
  refreshLockIn();
  saveState(2);
});
document.getElementById('customActivity').addEventListener('input', (e)=>{
  customActivity = e.target.value;
  refreshLockIn();
  saveState(2);
});
document.getElementById('lockIn').addEventListener('click', ()=>{
  blip(988, 0.15, 'square');
  buildNote();
  setLevel(3);
  launchConfetti();
});

/* ---------------- Level 4: note ---------------- */
function buildNote(){
  const sendBtn = document.getElementById('sendToOjas');
  sendBtn.textContent = SEND_LABEL;
  sendBtn.classList.remove('done');
  const calBtn = document.getElementById('addToCal');
  calBtn.textContent = CAL_LABEL;
  calBtn.classList.remove('done');

  const body = document.getElementById('noteBody');
  body.innerHTML = '';
  const noteLines = (visitCount > 1 && CONFIG.noteReturning) ? CONFIG.noteReturning : CONFIG.note;
  noteLines.forEach(p=>{
    const el = document.createElement('p');
    el.textContent = p;
    body.appendChild(el);
  });
  const sign = document.createElement('div');
  sign.className = 'signoff';
  sign.textContent = CONFIG.signoff;
  body.appendChild(sign);
  buildSendLink();
  buildCalendarLink();
}

function formatDateNice(value){
  if(!value) return '';
  const [y,m,d] = value.split('-').map(Number);
  return new Date(y, m-1, d).toLocaleDateString('en-US', { month:'short', day:'numeric' });
}

function getPickSummary(){
  const dateStr = formatDateNice(dateInput.value) || 'no date yet';
  const todStr = selectedTod ? selectedTod[0].toUpperCase() + selectedTod.slice(1) : '';
  const presetLabels = CONFIG.activities
    .filter(a => selectedActs.has(a.id))
    .map(a => a.text || a.label.replace('\n',' '));
  const custom = customActivity.trim();
  const actsStr = [...presetLabels, ...(custom ? [custom] : [])].join(', ') || 'no plans yet';
  return { dateStr, todStr, actsStr };
}

function buildSendLink(){
  const { dateStr, todStr, actsStr } = getPickSummary();
  const message = `Locked it in 💌 ${dateStr}${todStr ? ', ' + todStr : ''} — ${actsStr}`;
  const link = document.getElementById('sendToOjas');
  link.href = `sms:${OJAS_PHONE}&body=${encodeURIComponent(message)}`;
  link.dataset.message = message;
}

const TOD_START_HOUR = { morning: 10, afternoon: 14, evening: 18, night: 20 };
const EVENT_DURATION_HOURS = 2;
const CAL_EVENT_TITLE = "Date with Ojas ♥";
const pad2 = n => String(n).padStart(2, '0');

function buildCalendarLink(){
  const link = document.getElementById('addToCal');
  if(!dateInput.value){
    link.href = '#';
    return;
  }
  const { actsStr } = getPickSummary();
  const [y, m, d] = dateInput.value.split('-').map(Number);
  const startHour = TOD_START_HOUR[selectedTod] ?? 18;
  const start = `${y}${pad2(m)}${pad2(d)}T${pad2(startHour)}0000`;
  const endDate = new Date(y, m - 1, d, startHour + EVENT_DURATION_HOURS);
  const end = `${endDate.getFullYear()}${pad2(endDate.getMonth() + 1)}${pad2(endDate.getDate())}T${pad2(endDate.getHours())}0000`;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: CAL_EVENT_TITLE,
    dates: `${start}/${end}`,
    details: `${actsStr}\n\nplanned via LOVEQUEST 🎮`
  });
  link.href = `https://calendar.google.com/calendar/render?${params.toString()}`;
}

const IS_DESKTOP_NON_APPLE = /Windows NT|Linux/.test(navigator.userAgent) && !/Android/.test(navigator.userAgent);

document.getElementById('sendToOjas').addEventListener('click', (e)=>{
  blip(988, 0.1, 'square');
  const btn = e.currentTarget;
  if(IS_DESKTOP_NON_APPLE){
    e.preventDefault();
    const text = btn.dataset.message || '';
    if(navigator.clipboard && text){
      navigator.clipboard.writeText(text).then(()=>{
        btn.textContent = 'COPIED — PASTE INTO MESSAGES 📋';
        btn.classList.add('done');
      });
    }
    return;
  }
  btn.textContent = SEND_DONE_LABEL;
  btn.classList.add('done');
});

document.getElementById('addToCal').addEventListener('click', (e)=>{
  blip(760, 0.1, 'square');
  e.currentTarget.textContent = CAL_DONE_LABEL;
  e.currentTarget.classList.add('done');
});

document.getElementById('replay').addEventListener('click', ()=>{
  evadeCount = 0; selectedTod = null; selectedActs = new Set(); customActivity = '';
  achievementShown = false;
  document.querySelectorAll('.chip.sel, .pill.sel').forEach(el=>el.classList.remove('sel'));
  document.getElementById('customActivity').value = '';
  document.getElementById('lockIn').disabled = true;
  dateNext.disabled = true;
  dateInput.value = '';
  evadeCounter.textContent = ' ';
  clearState();
  setLevel(0);
});

/* ---------------- confetti hearts ---------------- */
function launchConfetti(){
  const screen = document.getElementById('screen');
  const count = reduceMotion ? 6 : 18;
  for(let i=0;i<count;i++){
    const h = document.createElement('div');
    h.textContent = '♥';
    h.style.cssText = `position:absolute; left:${Math.random()*100}%; top:-10px; font-size:${8+Math.random()*8}px; color:var(--trim-500); z-index:7; pointer-events:none;`;
    screen.appendChild(h);
    const dur = reduceMotion ? 0 : 1400 + Math.random()*1200;
    h.animate([
      { transform:'translateY(0) rotate(0deg)', opacity:1 },
      { transform:`translateY(${340+Math.random()*40}px) rotate(${Math.random()>0.5?360:-360}deg)`, opacity:0.9 }
    ], { duration: dur || 1, easing:'ease-in', fill:'forwards' });
    setTimeout(()=>h.remove(), dur + 100);
  }
}

/* ---------------- A/B buttons mirror primary actions ---------------- */
document.getElementById('aBtn').addEventListener('click', ()=>{
  const activeLevel = document.querySelector('.level.active').dataset.level;
  if(activeLevel === '0') yesBtn.click();
  else if(activeLevel === '1' && !dateNext.disabled) dateNext.click();
  else if(activeLevel === '2' && !document.getElementById('lockIn').disabled) document.getElementById('lockIn').click();
});
document.getElementById('bBtn').addEventListener('click', ()=> blip(220,0.06,'square'));

/* ---------------- sound toggle ---------------- */
document.getElementById('soundToggle').addEventListener('click', (e)=>{
  soundOn = !soundOn;
  e.target.textContent = soundOn ? 'SND: ON' : 'SND: OFF';
  e.target.setAttribute('aria-pressed', String(soundOn));
  if(soundOn) blip(660,0.08,'square');
});

/* ---------------- ambient floating hearts ---------------- */
(function ambient(){
  if(reduceMotion) return;
  const host = document.getElementById('ambient');
  const glyphs = ['♥','·','✦'];
  for(let i=0;i<14;i++){
    const s = document.createElement('span');
    s.textContent = glyphs[Math.floor(Math.random()*glyphs.length)];
    s.style.left = Math.random()*100 + '%';
    s.style.setProperty('--dx', (Math.random()*80-40)+'px');
    s.style.animationDuration = (14 + Math.random()*14) + 's';
    s.style.animationDelay = (Math.random()*14) + 's';
    s.style.fontSize = (10 + Math.random()*10) + 'px';
    host.appendChild(s);
  }
})();

restoreState();

/* ---------------- scale the console to always fit the viewport ---------------- */
(function fitToScreen(){
  const el = document.querySelector('.console');
  const MARGIN = 16;
  function fit(){
    el.style.transform = 'none';
    const vw = (window.visualViewport ? window.visualViewport.width : window.innerWidth);
    const vh = (window.visualViewport ? window.visualViewport.height : window.innerHeight);
    const rect = el.getBoundingClientRect();
    const scale = Math.min(1, (vw - MARGIN) / rect.width, (vh - MARGIN) / rect.height);
    el.style.transform = scale < 1 ? `scale(${scale})` : 'none';
  }
  window.__fitConsole = fit;
  fit();
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', fit);
  if(window.visualViewport){
    window.visualViewport.addEventListener('resize', fit);
  }
  if(document.fonts && document.fonts.ready){
    document.fonts.ready.then(fit);
  }
  window.addEventListener('load', fit);
})();
