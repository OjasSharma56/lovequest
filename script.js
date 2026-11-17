/* =========================================================
   CUSTOMIZE ME — everything a person would want to edit
   (the Hindi word bank lives in words.js)
   ========================================================= */
const OJAS_PHONE = "+15875775519";
const SEND_LABEL = 'SEND TO OJAS 💌';
const SEND_DONE_LABEL = 'SENT 💌 ✓';
const LOCK_LABEL = 'पक्का · LOCK IT IN';

/* auto-books straight onto Ojas's real Google Calendar and checks for conflicts —
   backed by a Google Apps Script web app tied to his account, so no credentials
   ever reach this page or her browser. The same backend also answers "when's our
   next date?" (the countdown) and emails Ojas when she finishes a Hindi round. */
const CAL_BACKEND_URL = "https://script.google.com/macros/s/AKfycbzYLMwnOmgXwu7UlsCLW-cs6YImwYEws3Wm4pBPa9C1Fl0_VoaT46rbH-fhsbAFUOwd/exec";
const CAL_SECRET = "4fZw434IrwPNuwyfK7i2M0-9";
const TOD_START_HOUR = { morning: 10, afternoon: 14, evening: 18, night: 20 };
const EVENT_DURATION_HOURS = 2;

/* Hindi class — words per round */
const DATE_ROUND_SIZE = 5;     // the short version inside the date path
const DAILY_ROUND_SIZE = 5;    // today's word + 4 more
const LEARN_ROUND_SIZE = 10;   // "I'm just here to learn Hindi"
const POINTS_PER_WORD = 10;
const SEASON_SHARE = 0.4;      // share of each round given to the current season's words

/* the app starts completely fresh every time it's opened. If she leaves it open in the
   background and comes back after this long, it resets too (as if she'd closed it). */
const RESET_AFTER_HIDDEN_MS = 2 * 60 * 1000;

/* Voice notes from Ojas, unlocked at milestones. A note only appears once its recording
   exists at notes/<id>.m4a AND its id is listed in NOTES_READY. */
const NOTES = [
  { id:'first',    title:'Your first lesson',  need:{ rounds:1 } },
  { id:'streak3',  title:'3 days in a row',    need:{ streak:3 } },
  { id:'streak7',  title:'A whole week',       need:{ streak:7 } },
  { id:'words25',  title:'25 words',           need:{ words:25 } },
  { id:'words50',  title:'50 words',           need:{ words:50 } },
  { id:'streak30', title:'30 days in a row',   need:{ streak:30 } },
  { id:'allwords', title:'Every single word',  need:{ words:'all' } }
];
const NOTES_READY = [];

/* Looks. index.html picks the theme by date (see the top of that file). */
const THEMES = {
  bollywood: { mqHi:'एक नई कहानी',   mqRm:'ek nayi kahani',                  tag:'EK NAYI KAHANI',      foot:'from Ojas, with love',     dateEmoji:'💌', season:'' },
  xmas:      { mqHi:'मेरी क्रिसमस',   mqRm:'merry christmas · ek nayi kahani', tag:'CHRISTMAS EDITION',   foot:'Merry Christmas, Choti',   dateEmoji:'🎁', season:'xmas' },
  newyear:   { mqHi:'नया साल मुबारक', mqRm:'naya saal mubarak · happy new year', tag:'NEW YEAR EDITION',  foot:'Happy New Year, Choti',    dateEmoji:'🥂', season:'' },
  valentine: { mqHi:'मेरी वैलेंटाइन',  mqRm:'meri valentine · my valentine',   tag:'VALENTINE’S EDITION', foot:'Happy Valentine’s, Choti', dateEmoji:'💌', season:'' }
};
const THEME = THEMES[document.documentElement.getAttribute('data-theme')] ? document.documentElement.getAttribute('data-theme') : 'bollywood';
const T = THEMES[THEME];
const SEASON = T.season;

/* the activities, each with a Hindi word and a line of the love note it unlocks */
const CONFIG = {
  activities: [
    { id:"cook", em:"🍳", en:"Cooking together", hi:"खाना", rm:"khaana", text:"Cooking together",
      verse:{ hi:"तुम्हारे साथ खाना बनाना — सबसे मीठा समय।",
              rm:"Tumhaare saath khaana banaana — sabse meetha samay.",
              en:"Cooking with you — the sweetest time." } },
    { id:"cuddle", em:"🎬", en:"Cuddle & movie", hi:"फ़िल्म", rm:"film", text:"Cuddle & movie",
      verse:{ hi:"फ़िल्म तो बस बहाना है, असली बात तुम्हारे पास बैठना है।",
              rm:"Film toh bas bahaana hai, asli baat tumhaare paas baithna hai.",
              en:"The movie is just an excuse — sitting next to you is the real thing." } },
    { id:"study", em:"📚", en:"Study date", hi:"किताब", rm:"kitaab", text:"Study date",
      verse:{ hi:"तुम्हारे साथ पढ़ाई भी अच्छी लगती है।",
              rm:"Tumhaare saath padhaai bhi achhi lagti hai.",
              en:"Even studying feels good with you." } },
    { id:"boulder", em:"🧗", en:"Bouldering", hi:"पहाड़", rm:"pahaad", text:"Bouldering",
      verse:{ hi:"चढ़ती रहो, गिरोगी तो मैं हूँ न।",
              rm:"Chadhti raho, girogi toh main hoon na.",
              en:"Keep climbing — if you fall, I'm right here." } },
    { id:"football", em:"⚽", en:"Football", hi:"खेल", rm:"khel", text:"Football",
      verse:{ hi:"तुम गोल करो, जश्न मैं मनाऊँगा।",
              rm:"Tum goal karo, jashn main manaaunga.",
              en:"You score the goal — I'll do the celebrating." } },
    { id:"escape", em:"🔐", en:"Escape room", hi:"ताला", rm:"taala", text:"Escape room",
      verse:{ hi:"तुम्हारे साथ तो ताले में बंद होना भी मंज़ूर है।",
              rm:"Tumhaare saath toh taale mein band hona bhi manzoor hai.",
              en:"Being locked in a room with you? Fine by me." } }
  ],
  opening: { hi:"छोटी, तीन महीने हो गए — और मैं अब भी तुम्हें देखकर मुस्कुराता हूँ।",
             rm:"Choti, teen mahine ho gaye — aur main ab bhi tumhe dekhkar muskurata hoon.",
             en:"Choti, it's been three months — and I still smile when I see you." },
  closing: { hi:"तुम ख़ास हो, छोटी।", rm:"Tum khaas ho, Choti.", en:"You're special, Choti." },
  signoff: "— तुम्हारा ओजस ♥"
};

/* screens */
const L = { MENU:0, ASK:1, CLASS:2, DATE:3, PLAN:4, FIN:5, RESULT:6, STREAK:7, NOTES:8 };

/* ---------------- pixel pig (her favourite animal), dressed for the season ---------------- */
function drawPixels(svgEl, rows, palette){
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
const PAL = { k:'#24101a', d:'#b4435f', p:'#f7b1c1', r:'#d42a3c', w:'#ffffff', g:'#e6c260', y:'#a8862e', h:'#e8537a' };
const PIG_BODY = [
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
const PIG_TOPS = {
  bollywood: [                       // plain ears
    ".kkkkk.......kkkkk.",
    "kppppk.......kppppk",
    "kppppkk.....kkppppk",
    "kpppppkk...kkpppppk" ],
  xmas: [                            // Santa hat
    "...........ww......",
    ".........rrww......",
    ".kkkkk..rrr..kkkkk.",
    "kppppk.rrrrr.kppppk",
    "kppppkrrrrrrrkppppk",
    "kpppppwwwwwwwpppppk" ],
  newyear: [                         // party hat
    ".........w.........",
    "........ggg........",
    ".kkkkk..gyg..kkkkk.",
    "kppppk.gygyg.kppppk",
    "kppppkgygygygkppppk",
    "kpppppyyyyyyypppppk" ],
  valentine: [                       // a heart above its head
    ".......hh.hh.......",
    ".......hhhhh.......",
    ".kkkkk..hhh..kkkkk.",
    "kppppk...h...kppppk",
    "kppppkk.....kkppppk",
    "kpppppkk...kkpppppk" ]
};
const PIG = PIG_TOPS[THEME].concat(PIG_BODY);

/* ---------------- elements + state ---------------- */
const $ = id => document.getElementById(id);
const yesBtn = $('yesBtn'), noBtn = $('noBtn'), evadeCounter = $('evadeCounter');
const askLevel = document.querySelector(`[data-level="${L.ASK}"]`);
const quizNext = $('quizNext');
const dateInput = $('dateInput'), dateNext = $('dateNext'), lockIn = $('lockIn');
const backBtn = $('backBtn'), nextBtn = $('nextBtn');

let mode = 'date';      // 'date' = the full story · 'daily' = today's word · 'learn' = just the Hindi class
let evadeCount = 0;
let selectedTod = null;
let selectedActs = new Set();
let customActivity = '';
let soundOn = false;
let achievementShown = false;
let calendarBooked = false;
let quiz = [];          // [{ id, opts:[ids], picked:null|index }]
let quizIndex = 0;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* nothing about a single visit is saved. What IS kept: which words she's met, her streak,
   her progress, and which voice notes she's unlocked. Clear out older keys. */
try{ ['kahani_state_v2', 'kahani_state_v1', 'lovequest_state_v1'].forEach(k => localStorage.removeItem(k)); }catch(e){}

let toastTimer;
function showToast(text, ms=2600){
  const toast = $('toast');
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> toast.classList.remove('show'), ms);
}

/* ---------------- small storage helpers ---------------- */
function readJSON(key, fallback){
  try{ const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; }catch(e){ return fallback; }
}
function writeJSON(key, value){
  try{ localStorage.setItem(key, JSON.stringify(value)); }catch(e){}
}

/* ---------------- dates ---------------- */
const pad2 = n => String(n).padStart(2, '0');
function dayKey(d){ return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`; }
function today0(){ const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); }
function shiftDay(d, n){ return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
function dayNumber(d){ return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000); }
const HINDI_DAYS = ['रवि','सोम','मंगल','बुध','गुरु','शुक्र','शनि'];   // Sun … Sat

/* ---------------- the word bank ---------------- */
const WORD_BY_ID = Object.fromEntries(WORDS.map(w => [w.rm, w]));
const SEEN_KEY = 'kahani_seen_v1';        // words met in the current cycle (resets when she's seen them all)

function shuffle(a){
  for(let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function seededOrder(list, seed){
  const a = list.slice();
  let s = seed >>> 0;
  const rnd = () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for(let i = a.length - 1; i > 0; i--){
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function loadSeen(){ return readJSON(SEEN_KEY, []).filter(id => WORD_BY_ID[id]); }
function saveSeen(list){ writeJSON(SEEN_KEY, list); }
function markSeen(id){ saveSeen([...new Set(loadSeen().concat(id))]); }

/* ---------------- progress (kept forever) ---------------- */
const STATS_KEY = 'kahani_stats_v1';
const stats = Object.assign({ rounds:0, learned:[], unlocked:[], heard:[] }, readJSON(STATS_KEY, {}));
if(!stats.learned.length) stats.learned = loadSeen();          // carry over what she already knew
function saveStats(){ writeJSON(STATS_KEY, stats); }
function learnedCount(){ return stats.learned.filter(id => WORD_BY_ID[id]).length; }
function markLearned(id){ if(!stats.learned.includes(id)){ stats.learned.push(id); saveStats(); } }

/* ---------------- streak ---------------- */
const STREAK_KEY = 'kahani_streak_v1';
function loadStreak(){ return Object.assign({ days:[], best:0 }, readJSON(STREAK_KEY, {})); }
function streakInfo(){
  const s = loadStreak();
  const set = new Set(s.days);
  const t = today0();
  const doneToday = set.has(dayKey(t));
  let cur = doneToday ? t : shiftDay(t, -1);       // an unfinished today doesn't break it yet
  let count = 0;
  while(set.has(dayKey(cur))){ count++; cur = shiftDay(cur, -1); }
  return { count, doneToday, best: Math.max(s.best || 0, count), set };
}
function markToday(){
  const s = loadStreak();
  const k = dayKey(today0());
  if(!s.days.includes(k)) s.days.push(k);
  s.days = s.days.slice(-400);
  writeJSON(STREAK_KEY, s);
  const info = streakInfo();
  s.best = Math.max(s.best || 0, info.count);
  writeJSON(STREAK_KEY, s);
  return info;
}

/* ---------------- today's word ---------------- */
const GENERAL_ORDER = seededOrder(WORDS.filter(w => !w.season), 2026);
function todaysWord(){
  const n = dayNumber(today0());
  const seasonal = SEASON ? WORDS.filter(w => w.season === SEASON) : [];
  if(seasonal.length && n % 2 === 0){
    const order = seededOrder(seasonal, 7);
    return order[(n / 2) % order.length];
  }
  return GENERAL_ORDER[n % GENERAL_ORDER.length];
}

/* ---------------- rounds ---------------- */
/* words she hasn't got right yet come first; once she's been through the whole bank it starts over */
function newRound(size, firstId){
  const pool = WORDS.filter(w => w.rm !== firstId);
  const seen = loadSeen();
  const fresh = pool.filter(w => !seen.includes(w.rm));
  const need = firstId ? size - 1 : size;
  let picked;
  if(fresh.length >= need){
    const seasonal = SEASON
      ? shuffle(fresh.filter(w => w.season === SEASON)).slice(0, Math.ceil(need * SEASON_SHARE))
      : [];
    const rest = shuffle(fresh.filter(w => !seasonal.includes(w))).slice(0, need - seasonal.length);
    picked = shuffle(seasonal.concat(rest));
  } else {
    const filler = shuffle(pool.filter(w => !fresh.includes(w))).slice(0, need - fresh.length);
    picked = shuffle(fresh.concat(filler));
    saveSeen([]);                       // new cycle begins
  }
  if(firstId && WORD_BY_ID[firstId]) picked.unshift(WORD_BY_ID[firstId]);
  quiz = picked.map(w => {
    const others = shuffle(WORDS.filter(o => o.rm !== w.rm && o.en !== w.en)).slice(0, 2);
    return { id: w.rm, opts: shuffle([w, ...others]).map(o => o.rm), picked: null };
  });
  quizIndex = 0;
  warmAudio();
}
function isRight(q){ return q.picked !== null && q.opts[q.picked] === q.id; }
function quizScore(){
  return quiz.reduce((s, q) => s + (isRight(q) ? POINTS_PER_WORD : 0), 0);
}

/* ---------------- audio: a real recording for every word (audio/<rm>.m4a) ---------------- */
let currentAudio = null;
function warmAudio(){
  quiz.forEach(q => { fetch(`audio/${q.id}.m4a`).catch(()=>{}); });
}
function speakFallback(w, note){
  /* last resort only — the recordings are the real thing */
  if('speechSynthesis' in window){
    const u = new SpeechSynthesisUtterance(w.hi);
    u.lang = 'hi-IN'; u.rate = 0.75;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  } else if(note){
    note.textContent = 'couldn’t play audio — try again';
  }
}
function playSrc(src, btn, onFail){
  if(currentAudio){ currentAudio.pause(); currentAudio = null; }
  const a = new Audio(src);
  currentAudio = a;
  if(btn) btn.classList.add('playing');
  const done = () => { if(btn) btn.classList.remove('playing'); };
  a.addEventListener('ended', done);
  a.addEventListener('error', () => { done(); if(onFail) onFail(); });
  const p = a.play();
  if(p && p.catch) p.catch(() => { done(); if(onFail) onFail(); });
}
function playWord(w, btn, note){
  if(note) note.textContent = '';
  playSrc(`audio/${w.rm}.m4a`, btn, () => speakFallback(w, note));
}
$('qListen').addEventListener('click', () => {
  if(quiz[quizIndex]) playWord(WORD_BY_ID[quiz[quizIndex].id], $('qListen'), $('qListenNote'));
});

/* sound effects: tiny synthesized blips, no external files */
let actx;
function blip(freq=660, dur=0.08, type='triangle'){
  if(!soundOn) return;
  actx = actx || new (window.AudioContext || window.webkitAudioContext)();
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.value = 0.06;
  o.connect(g); g.connect(actx.destination);
  o.start();
  g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + dur);
  o.stop(actx.currentTime + dur);
}

/* ---------------- navigation ---------------- */
function activeLevel(){ return Number(document.querySelector('.level.active').dataset.level); }

function canForward(n){
  if(n === L.ASK) return true;
  if(n === L.CLASS) return !quizNext.disabled;
  if(n === L.DATE) return !dateNext.disabled;
  if(n === L.PLAN) return !lockIn.disabled;
  return false;
}
function backTarget(n){
  if(n === L.ASK) return L.MENU;
  if(n === L.CLASS) return mode === 'date' ? L.ASK : L.MENU;
  if(n === L.DATE) return L.CLASS;
  if(n === L.PLAN) return L.DATE;
  if(n === L.RESULT || n === L.STREAK || n === L.NOTES) return L.MENU;
  return null;                          // start screen and the finale have no "back"
}
function refreshRemote(){
  const n = activeLevel();
  backBtn.disabled = backTarget(n) === null;
  nextBtn.disabled = !canForward(n);
}
const CLASS_TAGS = { date:'ACT II — HINDI CLASS', learn:'HINDI CLASS', daily:'TODAY’S WORD + 4 MORE' };
function setLevel(n){
  if(currentAudio){ currentAudio.pause(); currentAudio = null; }
  document.querySelectorAll('.level').forEach(el=>{
    el.classList.toggle('active', Number(el.dataset.level) === n);
  });
  /* progress pips only make sense on the date path (acts I–V) */
  const showPips = mode === 'date' && n >= L.ASK && n <= L.FIN;
  $('pips').classList.toggle('off', !showPips);
  document.querySelectorAll('.pip').forEach(p=>{
    p.classList.toggle('done', showPips && Number(p.dataset.pip) <= n - 1);
  });
  $('classTag').textContent = CLASS_TAGS[mode];
  if(n === L.MENU) refreshStart();
  refreshRemote();
  if(n === L.ASK) placeNo();
  if(window.__fitPoster) window.__fitPoster();
}
function goForward(){
  const n = activeLevel();
  if(!canForward(n)){ blip(180, 0.08, 'sawtooth'); return; }
  if(n === L.ASK) yesBtn.click();
  else if(n === L.CLASS) quizNext.click();
  else if(n === L.DATE) dateNext.click();
  else if(n === L.PLAN) lockIn.click();
}
function goBack(){
  const t = backTarget(activeLevel());
  if(t === null){ blip(180, 0.08, 'sawtooth'); return; }
  blip(320, 0.06);
  setLevel(t);
}
backBtn.addEventListener('click', goBack);
nextBtn.addEventListener('click', goForward);
document.addEventListener('keydown', (e)=>{
  const t = e.target;
  if(t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
  if(e.key === 'ArrowRight') goForward();
  else if(e.key === 'ArrowLeft') goBack();
});

/* ---------------- start screen ---------------- */
drawPixels($('pigSprite'), PIG, PAL);
drawPixels($('pigSprite2'), PIG, PAL);
$('mqHi').textContent = T.mqHi;
$('mqRm').textContent = T.mqRm;
$('startTag').textContent = T.tag;
$('footFestive').textContent = T.foot;
$('dateEmoji').textContent = T.dateEmoji;

function refreshStart(){
  const s = streakInfo();
  $('chipCount').textContent = s.count;
  $('chipText').textContent = s.count === 0 ? 'start a streak' : (s.count === 1 ? 'day streak' : 'day streak');
  $('streakChip').classList.toggle('lit', s.doneToday);
  const mini = $('weekMini');
  mini.innerHTML = '';
  for(let i = 6; i >= 0; i--){
    const d = shiftDay(today0(), -i);
    const dot = document.createElement('i');
    if(s.set.has(dayKey(d))) dot.classList.add('on');
    if(i === 0) dot.classList.add('today');
    mini.appendChild(dot);
  }
  const badge = $('dailyBadge');
  badge.classList.toggle('done', s.doneToday);
  badge.textContent = s.doneToday ? '✓ done' : (s.count > 0 ? 'keep 🔥' : 'start');
  refreshNotesLink();
}

function startDaily(){
  mode = 'daily';
  newRound(DAILY_ROUND_SIZE, todaysWord().rm);
  setLevel(L.CLASS);
  renderQuiz({ autoplay:true });
}
function startLearn(){
  mode = 'learn';
  newRound(LEARN_ROUND_SIZE);
  setLevel(L.CLASS);
  renderQuiz({ autoplay:true });
}
$('optDate').addEventListener('click', ()=>{
  blip(880, 0.12);
  mode = 'date';
  newRound(DATE_ROUND_SIZE);
  renderQuiz();
  setLevel(L.ASK);
});
$('optDaily').addEventListener('click', ()=>{
  blip(880, 0.12);
  if(streakInfo().doneToday){ mode = 'daily'; showStreak({}); setLevel(L.STREAK); }
  else startDaily();
});
$('optLearn').addEventListener('click', ()=>{ blip(880, 0.12); startLearn(); });
$('streakChip').addEventListener('click', ()=>{ blip(660, 0.08); showStreak({}); setLevel(L.STREAK); });

/* ---------------- countdown to the next date (read from Ojas's calendar) ---------------- */
function loadCountdown(){
  if(!window.fetch) return;
  const ctl = window.AbortController ? new AbortController() : null;
  const timer = ctl && setTimeout(() => ctl.abort(), 7000);
  const params = new URLSearchParams({ key: CAL_SECRET, action: 'next' });
  fetch(`${CAL_BACKEND_URL}?${params.toString()}`, { signal: ctl ? ctl.signal : undefined })
    .then(r => r.json())
    .then(j => {
      if(timer) clearTimeout(timer);
      if(!j || j.status !== 'ok' || !j.next) return;
      const start = new Date(j.next);
      if(isNaN(start)) return;
      const day0 = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const diff = Math.round((day0 - today0()) / 86400000);
      const time = start.toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit' }).replace(':00', '');
      const el = $('countdown');
      el.innerHTML = '';
      const hi = document.createElement('span'); hi.lang = 'hi'; hi.textContent = 'अगली डेट';
      const b = document.createElement('b');
      b.textContent = diff <= 0 ? `today, ${time}` : diff === 1 ? `tomorrow, ${time}` : `in ${diff} days`;
      el.append(hi, document.createTextNode(' · next date '), b, document.createTextNode(diff <= 0 ? ' 💕' : ''));
      el.hidden = false;
      if(window.__fitPoster) window.__fitPoster();
    })
    .catch(()=>{});
}

/* ---------------- Act I: the ask ---------------- */
function rectsOverlap(a, b, pad){
  return !(a.right + pad < b.left || a.left - pad > b.right || a.bottom + pad < b.top || a.top - pad > b.bottom);
}
function dodge(){
  if(reduceMotion) return;
  const hostRect = askLevel.getBoundingClientRect();
  const noW = noBtn.offsetWidth, noH = noBtn.offsetHeight;
  const padX = 14, safeBottom = 34;
  const toLocal = (r) => ({
    left: r.left - hostRect.left, right: r.right - hostRect.left,
    top: r.top - hostRect.top, bottom: r.bottom - hostRect.top
  });
  const yesLocal = toLocal(yesBtn.getBoundingClientRect());
  const headlineLocal = toLocal($('question').getBoundingClientRect());
  const askLocal = toLocal(askLevel.querySelector('.ask-row').getBoundingClientRect());
  const minY = Math.max(askLocal.top - 26, headlineLocal.bottom + 40);
  const maxX = Math.max(hostRect.width - noW - padX*2, 20);
  const maxY = Math.max(hostRect.height - noH - safeBottom - minY, 20);
  let x, y, tries = 0;
  do{
    x = padX + Math.random() * maxX;
    y = minY + Math.random() * maxY;
    tries++;
  } while(
    (rectsOverlap({left:x, right:x+noW, top:y, bottom:y+noH}, yesLocal, 14) ||
     rectsOverlap({left:x, right:x+noW, top:y, bottom:y+noH}, headlineLocal, 10))
    && tries < 40
  );
  noBtn.style.left = (x - askLocal.left) + 'px';
  noBtn.style.top = (y - askLocal.top) + 'px';
  evadeCount++;
  blip(300 + Math.random()*200, 0.06, 'triangle');
  evadeCounter.textContent = evadeCounterText(evadeCount);
  if(evadeCount === 15 && !achievementShown){
    achievementShown = true;
    showToast('🏆 SHABAASH — UNCATCHABLE');
    blip(1200, 0.15, 'square');
  }
}
function evadeCounterText(n){
  if(n < 3) return 'haan = yes · nahi = no';
  if(n < 10) return `“nahi” has dodged ${n} times`;
  if(n < 15) return `okay this is getting ridiculous (${n})`;
  return `“nahi” remains undefeated (${n} dodges)`;
}
noBtn.addEventListener('pointerenter', dodge);
noBtn.addEventListener('pointerdown', (e)=>{ e.preventDefault(); dodge(); });
noBtn.addEventListener('click', (e)=>{ e.preventDefault(); dodge(); });

function placeNo(){
  if(evadeCount > 0) return;
  const row = askLevel.querySelector('.ask-row');
  const rowRect = row.getBoundingClientRect();
  const yesRect = yesBtn.getBoundingClientRect();
  const noW = noBtn.offsetWidth || 56, noH = noBtn.offsetHeight || 44;
  const desiredLeft = yesRect.right - rowRect.left + 12;
  const maxLeft = rowRect.width - noW - 6;
  noBtn.style.left = Math.min(desiredLeft, Math.max(maxLeft, 6)) + 'px';
  noBtn.style.top = (yesRect.top - rowRect.top + (yesRect.height - noH) / 2) + 'px';
}
window.addEventListener('load', placeNo);
if(document.fonts && document.fonts.ready) document.fonts.ready.then(placeNo);

yesBtn.addEventListener('click', ()=>{
  blip(880, 0.12);
  setLevel(L.CLASS);
  renderQuiz({ autoplay:true });
});

/* ---------------- Hindi class ---------------- */
const qOpts = $('qOpts'), qFeedback = $('qFeedback');
const LISTEN_KEY = 'kahani_listen_v1';
let listenMode = readJSON(LISTEN_KEY, false) === true;

function pointsText(){
  return `PYAAR POINTS ♥ ${quizScore()} / ${quiz.length * POINTS_PER_WORD}`;
}
function setListenMode(on){
  listenMode = on;
  writeJSON(LISTEN_KEY, on);
  $('modeRead').classList.toggle('on', !on);  $('modeRead').setAttribute('aria-pressed', String(!on));
  $('modeListen').classList.toggle('on', on); $('modeListen').setAttribute('aria-pressed', String(on));
}
$('modeRead').addEventListener('click', ()=>{ blip(500, 0.05); setListenMode(false); renderQuiz(); });
$('modeListen').addEventListener('click', ()=>{ blip(500, 0.05); setListenMode(true); renderQuiz({ autoplay:true }); });

/* listening mode hides the word until she answers; the recording does the teaching */
function showWord(w, hidden){
  $('qWord').textContent = hidden ? '?' : w.hi;
  $('qWord').classList.toggle('hidden-word', hidden);
  $('qRoman').textContent = hidden ? 'listen, then pick' : w.rm;
}
function renderQuiz(opts){
  opts = opts || {};
  const q = quiz[quizIndex];
  const w = WORD_BY_ID[q.id];
  if(currentAudio){ currentAudio.pause(); currentAudio = null; }
  $('qListen').classList.remove('playing');
  $('qListen').classList.toggle('big', listenMode);
  $('qListen').textContent = listenMode ? '🔊 play again' : '🔊 listen';
  $('qListenNote').textContent = '';
  const first = mode === 'daily' && quizIndex === 0;
  $('qStep').innerHTML = '';
  $('qStep').append(document.createTextNode(`WORD ${quizIndex + 1} / ${quiz.length}`));
  if(first){
    const tag = document.createElement('span'); tag.lang = 'hi'; tag.textContent = ' · आज का शब्द';
    $('qStep').append(tag);
  }
  showWord(w, listenMode && q.picked === null);
  qOpts.innerHTML = '';
  q.opts.forEach((id, i)=>{
    const o = WORD_BY_ID[id];
    const b = document.createElement('button');
    b.className = 'opt';
    b.dataset.i = i;
    const em = document.createElement('span');
    em.className = 'em'; em.setAttribute('aria-hidden', 'true'); em.textContent = o.e;
    const tx = document.createElement('span');
    tx.textContent = o.en;
    b.append(em, tx);
    qOpts.appendChild(b);
  });
  qFeedback.innerHTML = '';
  const last = quizIndex === quiz.length - 1;
  quizNext.textContent = !last ? 'अगला शब्द · NEXT WORD →'
    : mode === 'learn' ? 'नतीजा · SEE HOW I DID →'
    : mode === 'daily' ? 'पूरा · FINISH 🔥'
    : 'आगे चलें · CONTINUE →';
  if(q.picked !== null) revealAnswer(q.picked);
  else quizNext.disabled = true;
  $('qPoints').textContent = pointsText();
  refreshRemote();
  if(opts.autoplay && listenMode && q.picked === null) playWord(w, $('qListen'), $('qListenNote'));
}
function revealAnswer(pickedIndex){
  const q = quiz[quizIndex];
  const w = WORD_BY_ID[q.id];
  const answerIndex = q.opts.indexOf(q.id);
  const right = pickedIndex === answerIndex;
  showWord(w, false);
  qOpts.querySelectorAll('.opt').forEach((b, i)=>{
    b.disabled = true;
    if(i === answerIndex) b.classList.add('right');
    else if(i === pickedIndex) b.classList.add('wrong');
  });
  qFeedback.innerHTML = '';
  const hi = document.createElement('span');
  hi.className = 'hi'; hi.lang = 'hi';
  hi.textContent = right ? 'शाबाश!' : 'कोई बात नहीं';
  const line = document.createElement('span');
  line.textContent = (right ? 'Shabaash, Choti — ' : 'Koi baat nahi (no worries) — ')
    + `${w.rm} means “${w.en}”.` + (w.after ? ' ' + w.after : '');
  qFeedback.append(hi, line);
  quizNext.disabled = false;
}
qOpts.addEventListener('click', (e)=>{
  const btn = e.target.closest('.opt');
  const q = quiz[quizIndex];
  if(!btn || btn.disabled || q.picked !== null) return;
  const i = Number(btn.dataset.i);
  q.picked = i;
  const right = q.opts[i] === q.id;
  if(right){ markSeen(q.id); markLearned(q.id); }   // missed words stay "new" so they come back
  blip(right ? 880 : 240, right ? 0.14 : 0.12, right ? 'triangle' : 'sawtooth');
  revealAnswer(i);
  $('qPoints').textContent = pointsText();
  refreshRemote();
});
quizNext.addEventListener('click', ()=>{
  blip(700, 0.08);
  if(quizIndex < quiz.length - 1){
    quizIndex++;
    renderQuiz({ autoplay:true });
    if(window.__fitPoster) window.__fitPoster();
  } else {
    finishRound();
  }
});

/* a round is done: count it toward the streak, check for voice notes, tell Ojas */
function finishRound(){
  const before = streakInfo();
  stats.rounds++;
  saveStats();
  const after = markToday();
  const fresh = checkNotes();
  reportRound(mode, after.count);
  const firstToday = !before.doneToday;

  if(mode === 'date'){
    setLevel(L.DATE);
    if(fresh.length) showToast('🎁 new voice note from Ojas');
    else if(firstToday) showToast(`🔥 ${after.count}-day streak`);
  } else if(mode === 'learn'){
    showResults(fresh.length > 0);
    setLevel(L.RESULT);
    if(firstToday) showToast(`🔥 ${after.count}-day streak`);
  } else {
    showStreak({ gift: fresh.length > 0, celebrate: firstToday });
    setLevel(L.STREAK);
    if(firstToday) launchConfetti();
  }
}
function reportRound(m, streak){
  const right = [], missed = [];
  quiz.forEach(q => {
    const w = WORD_BY_ID[q.id];
    (isRight(q) ? right : missed).push(`${w.rm} (${w.en})`);
  });
  const params = new URLSearchParams({
    key: CAL_SECRET, action: 'progress', mode: m,
    score: String(quizScore() / POINTS_PER_WORD), total: String(quiz.length),
    streak: String(streak), learned: String(learnedCount()), bank: String(WORDS.length),
    right: right.join(', '), missed: missed.join(', ')
  });
  fetch(`${CAL_BACKEND_URL}?${params.toString()}`).catch(()=>{});
}

/* ---------------- learn-only path: results ---------------- */
function showResults(gift){
  const total = quiz.length * POINTS_PER_WORD;
  $('resScore').textContent = `${quizScore()} / ${total} pyaar points ♥`;
  $('resGift').hidden = !gift;
  const list = $('resWords');
  list.innerHTML = '';
  quiz.forEach(q => {
    const w = WORD_BY_ID[q.id];
    const li = document.createElement('li');
    if(isRight(q)) li.className = 'ok';
    const hi = document.createElement('span'); hi.className = 'rh'; hi.lang = 'hi'; hi.textContent = w.hi;
    const rr = document.createElement('span'); rr.className = 'rr';
    rr.textContent = `${w.rm} · ${w.en}${isRight(q) ? ' ✓' : ''}`;
    li.append(hi, rr);
    list.appendChild(li);
  });
  $('resMet').textContent = `WORDS LEARNED · ${learnedCount()} / ${WORDS.length}`;
}
$('learnAgain').addEventListener('click', ()=>{ blip(880, 0.12); startLearn(); });
$('learnHome').addEventListener('click', ()=>{ blip(320, 0.06); setLevel(L.MENU); });

/* ---------------- streak screen ---------------- */
function showStreak(o){
  o = o || {};
  const s = streakInfo();
  $('stCount').textContent = s.count;
  $('flameBig').classList.toggle('lit', s.doneToday);
  $('stLine').innerHTML = '';
  if(s.count === 0){
    $('stLine').textContent = 'no streak yet — today’s word starts one';
  } else {
    const hi = document.createElement('span'); hi.lang = 'hi'; hi.textContent = `लगातार ${s.count} दिन`;
    $('stLine').append(hi, document.createTextNode(` · ${s.count} day${s.count === 1 ? '' : 's'} in a row`));
  }
  const row = $('weekRow');
  row.innerHTML = '';
  for(let i = 6; i >= 0; i--){
    const d = shiftDay(today0(), -i);
    const li = document.createElement('li');
    if(s.set.has(dayKey(d))) li.classList.add('on');
    if(i === 0) li.classList.add('today');
    const dl = document.createElement('span'); dl.className = 'dl'; dl.lang = 'hi'; dl.textContent = HINDI_DAYS[d.getDay()];
    const dd = document.createElement('span'); dd.className = 'dd'; dd.textContent = '✓';
    li.append(dl, dd);
    row.appendChild(li);
  }
  const w = todaysWord();
  $('twHi').textContent = w.hi;
  $('twRm').textContent = s.doneToday ? `${w.rm} · ${w.en}` : w.rm;
  $('stGift').hidden = !o.gift;
  $('stAction').innerHTML = '';
  const hi = document.createElement('span'); hi.lang = 'hi';
  hi.textContent = s.doneToday ? 'और सीखें' : 'आज का शब्द';
  $('stAction').append(hi, document.createTextNode(s.doneToday ? ' · ANOTHER ROUND' : ' · DO TODAY’S WORD'));
  $('stFine').textContent = s.doneToday
    ? (o.celebrate ? 'शाबाश! see you tomorrow to keep it going 🔥' : 'done for today — come back tomorrow 🔥')
    : (s.count > 0 ? 'do today’s word to keep your streak' : '');
  $('stFine').hidden = !$('stFine').textContent;
}
$('stAction').addEventListener('click', ()=>{
  blip(880, 0.12);
  if(streakInfo().doneToday) startLearn(); else startDaily();
});
$('twListen').addEventListener('click', ()=> playWord(todaysWord(), $('twListen'), null));
$('stHome').addEventListener('click', ()=>{ blip(320, 0.06); setLevel(L.MENU); });

/* ---------------- voice notes from Ojas ---------------- */
function readyNotes(){ return NOTES.filter(n => NOTES_READY.includes(n.id)); }
function noteProgress(n, s){
  if(n.need.rounds) return { have: stats.rounds, need: n.need.rounds, unit: 'lesson' };
  if(n.need.streak) return { have: s.best, need: n.need.streak, unit: 'day streak' };
  const need = n.need.words === 'all' ? WORDS.length : n.need.words;
  return { have: learnedCount(), need, unit: 'words' };
}
/* unlock anything newly earned; returns the notes that just unlocked */
function checkNotes(){
  const s = streakInfo();
  const fresh = [];
  readyNotes().forEach(n => {
    const p = noteProgress(n, s);
    if(!stats.unlocked.includes(n.id) && p.have >= p.need){ stats.unlocked.push(n.id); fresh.push(n); }
  });
  if(fresh.length) saveStats();
  return fresh;
}
function refreshNotesLink(){
  const ready = readyNotes();
  const link = $('notesLink');
  link.hidden = ready.length === 0;
  const unheard = stats.unlocked.filter(id => NOTES_READY.includes(id) && !stats.heard.includes(id)).length;
  link.classList.toggle('new', unheard > 0);
  link.textContent = unheard > 0 ? `🎧 notes from Ojas · ${unheard} new` : '🎧 notes from Ojas';
}
function renderNotes(){
  const s = streakInfo();
  const list = $('notesList');
  list.innerHTML = '';
  readyNotes().forEach(n => {
    const open = stats.unlocked.includes(n.id);
    const p = noteProgress(n, s);
    const li = document.createElement('li');
    if(!open) li.classList.add('locked');
    const text = document.createElement('div'); text.className = 'nt';
    const b = document.createElement('b'); b.textContent = n.title;
    const small = document.createElement('small');
    if(open){
      small.textContent = stats.heard.includes(n.id) ? 'heard ✓ — play it again any time' : 'new — tap to listen';
      text.append(b, small);
      const btn = document.createElement('button');
      btn.className = 'note-play'; btn.setAttribute('aria-label', `Play: ${n.title}`); btn.textContent = '▶';
      btn.addEventListener('click', () => {
        playSrc(`notes/${n.id}.m4a`, null, () => showToast('couldn’t play that one'));
        if(!stats.heard.includes(n.id)){ stats.heard.push(n.id); saveStats(); }
        small.textContent = 'heard ✓ — play it again any time';
      });
      li.append(btn, text);
    } else {
      small.textContent = `${Math.min(p.have, p.need)} / ${p.need} ${p.unit}`;
      const bar = document.createElement('div'); bar.className = 'bar';
      const fill = document.createElement('i'); fill.style.width = Math.min(100, p.have / p.need * 100) + '%';
      bar.appendChild(fill);
      text.append(b, small, bar);
      const lock = document.createElement('span'); lock.className = 'note-lock'; lock.textContent = '🔒';
      li.append(lock, text);
    }
    list.appendChild(li);
  });
}
function openNotes(){ blip(880, 0.12); renderNotes(); setLevel(L.NOTES); }
$('notesLink').addEventListener('click', openNotes);
$('resGift').addEventListener('click', openNotes);
$('stGift').addEventListener('click', openNotes);
$('notesHome').addEventListener('click', ()=>{ blip(320, 0.06); setLevel(L.MENU); });

/* ---------------- Act III: the date ---------------- */
const today = new Date();
dateInput.min = `${today.getFullYear()}-${pad2(today.getMonth()+1)}-${pad2(today.getDate())}`;

function refreshDateNext(){
  dateNext.disabled = !(dateInput.value && selectedTod);
  refreshRemote();
}
dateInput.addEventListener('change', refreshDateNext);
$('todChips').addEventListener('click', (e)=>{
  const chip = e.target.closest('.chip');
  if(!chip) return;
  document.querySelectorAll('#todChips .chip').forEach(c=>c.classList.remove('sel'));
  chip.classList.add('sel');
  selectedTod = chip.dataset.tod;
  blip(500, 0.05);
  refreshDateNext();
});
dateNext.addEventListener('click', ()=>{
  blip(700, 0.08);
  setLevel(L.PLAN);
});

/* ---------------- Act IV: the plan ---------------- */
const grid = $('activityGrid');
CONFIG.activities.forEach(act=>{
  const btn = document.createElement('button');
  btn.className = 'pill';
  btn.dataset.id = act.id;
  const em = document.createElement('span');
  em.className = 'em'; em.setAttribute('aria-hidden', 'true'); em.textContent = act.em;
  const en = document.createElement('span');
  en.className = 'en'; en.textContent = act.en;
  const tag = document.createElement('span');
  tag.className = 'tag'; tag.textContent = `${act.hi} · ${act.rm}`;
  btn.append(em, en, tag);
  grid.appendChild(btn);
});
function refreshLockIn(){
  lockIn.disabled = selectedActs.size === 0 && customActivity.trim() === '';
  refreshRemote();
}
grid.addEventListener('click', (e)=>{
  const pill = e.target.closest('.pill');
  if(!pill) return;
  pill.classList.toggle('sel');
  const id = pill.dataset.id;
  selectedActs.has(id) ? selectedActs.delete(id) : selectedActs.add(id);
  blip(selectedActs.has(id) ? 620 : 260, 0.05);
  refreshLockIn();
});
$('customActivity').addEventListener('input', (e)=>{
  customActivity = e.target.value;
  refreshLockIn();
});
lockIn.addEventListener('click', ()=>{
  blip(988, 0.15);
  lockIn.disabled = true;
  lockIn.textContent = 'CHECKING OJAS’S CALENDAR…';
  bookOnOjasCalendar()
    .then(res => {
      lockIn.textContent = LOCK_LABEL;
      refreshLockIn();
      if (res.status === 'conflict') {
        showConflictModal(res.conflicts);
        return;
      }
      calendarBooked = (res.status === 'ok');
      buildNote();
      setLevel(L.FIN);
      launchConfetti();
    })
    .catch(() => {
      lockIn.textContent = LOCK_LABEL;
      refreshLockIn();
      calendarBooked = false;
      buildNote();
      setLevel(L.FIN);
      launchConfetti();
    });
});

function showConflictModal(conflicts){
  blip(220, 0.2, 'sawtooth');
  const names = (conflicts && conflicts.length) ? conflicts.join(', ') : 'something else';
  $('conflictMsg').textContent =
    `Ojas already has "${names}" booked around then. Pick a different time?`;
  $('conflictModal').classList.add('show');
}
$('conflictBack').addEventListener('click', ()=>{
  $('conflictModal').classList.remove('show');
  setLevel(L.DATE);
});

/* ---------------- Act V: the note ---------------- */
function makeVerse(v){
  const wrap = document.createElement('div');
  wrap.className = 'verse';
  const hi = document.createElement('p'); hi.className = 'vh'; hi.lang = 'hi'; hi.textContent = v.hi;
  const rm = document.createElement('p'); rm.className = 'vr'; rm.textContent = v.rm;
  const en = document.createElement('p'); en.className = 've'; en.textContent = v.en;
  wrap.append(hi, rm, en);
  return wrap;
}

function buildNote(){
  const sendBtn = $('sendToOjas');
  sendBtn.textContent = SEND_LABEL;
  sendBtn.classList.remove('done');

  const calStatus = $('calStatus');
  calStatus.textContent = calendarBooked
    ? '📅 already on Ojas’s calendar'
    : '⚠️ couldn’t reach the calendar — text him just in case';
  calStatus.classList.toggle('warn', !calendarBooked);

  const body = $('noteBody');
  body.innerHTML = '';
  body.appendChild(makeVerse(CONFIG.opening));
  CONFIG.activities.filter(a => selectedActs.has(a.id)).forEach(a => body.appendChild(makeVerse(a.verse)));
  const custom = customActivity.trim();
  if(custom){
    body.appendChild(makeVerse({
      hi: `और तुम्हारा चुना हुआ “${custom}” — वो भी मंज़ूर है।`,
      rm: `Aur tumhaara chuna hua “${custom}” — woh bhi manzoor hai.`,
      en: `And what you picked — “${custom}” — works for me too.`
    }));
  }
  body.appendChild(makeVerse(CONFIG.closing));

  if(quiz.length && quiz.every(q => q.picked !== null)){
    const stamp = document.createElement('div');
    stamp.className = 'stamp';
    stamp.textContent = pointsText();
    body.appendChild(stamp);
  }
  const sign = document.createElement('div');
  sign.className = 'signoff'; sign.lang = 'hi';
  sign.textContent = CONFIG.signoff;
  body.appendChild(sign);
  body.scrollTop = 0;
  buildSendLink();
  updateScrollCue();
}

function updateScrollCue(){
  const body = $('noteBody');
  const more = body.scrollHeight - body.clientHeight - body.scrollTop > 8;
  $('scrollCue').classList.toggle('show', more);
}
$('noteBody').addEventListener('scroll', updateScrollCue);

function formatDateNice(value){
  if(!value) return '';
  const [y,m,d] = value.split('-').map(Number);
  return new Date(y, m-1, d).toLocaleDateString('en-US', { month:'short', day:'numeric' });
}

function getPickSummary(){
  const dateStr = formatDateNice(dateInput.value) || 'no date yet';
  const todStr = selectedTod ? selectedTod[0].toUpperCase() + selectedTod.slice(1) : '';
  const presetLabels = CONFIG.activities.filter(a => selectedActs.has(a.id)).map(a => a.text);
  const custom = customActivity.trim();
  const actsStr = [...presetLabels, ...(custom ? [custom] : [])].join(', ') || 'no plans yet';
  return { dateStr, todStr, actsStr };
}

function buildSendLink(){
  const { dateStr, todStr, actsStr } = getPickSummary();
  const message = `Pakka! 💌 ${dateStr}${todStr ? ', ' + todStr : ''} — ${actsStr} — Choti ♥`;
  const link = $('sendToOjas');
  link.href = `sms:${OJAS_PHONE}&body=${encodeURIComponent(message)}`;
  link.dataset.message = message;
}

function bookOnOjasCalendar(){
  const { actsStr } = getPickSummary();
  const startHour = TOD_START_HOUR[selectedTod] ?? 18;
  const params = new URLSearchParams({
    key: CAL_SECRET,
    date: dateInput.value,
    startHour: String(startHour),
    duration: String(EVENT_DURATION_HOURS),
    details: actsStr
  });
  return fetch(`${CAL_BACKEND_URL}?${params.toString()}`).then(r => r.json());
}

const IS_DESKTOP_NON_APPLE = /Windows NT|Linux/.test(navigator.userAgent) && !/Android/.test(navigator.userAgent);

$('sendToOjas').addEventListener('click', (e)=>{
  blip(988, 0.1);
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

/* "play again" = a completely fresh start */
$('replay').addEventListener('click', ()=> location.reload());

/* ---------------- fresh start every time she opens it ---------------- */
window.addEventListener('pageshow', (e)=>{ if(e.persisted) location.reload(); });
let hiddenAt = null;
document.addEventListener('visibilitychange', ()=>{
  if(document.hidden){ hiddenAt = Date.now(); }
  else {
    /* every time the app comes back to the front, make sure it's the latest version */
    if(window.__checkForUpdate) window.__checkForUpdate();
    if(hiddenAt !== null){
      const away = Date.now() - hiddenAt;
      hiddenAt = null;
      if(away > RESET_AFTER_HIDDEN_MS) location.reload();
    }
  }
});

/* ---------------- confetti, in the season's colours ---------------- */
const CONFETTI = {
  bollywood: { glyphs:['✿','♥','✿'], colors:['#f0b429','#b83a57','#d98a1c'] },
  xmas:      { glyphs:['✦','♥','❄︎'], colors:['#e9b949','#cf3445','#2c7a52'] },
  newyear:   { glyphs:['✦','★','✧'], colors:['#e6c260','#f5e3a6','#ffffff'] },
  valentine: { glyphs:['♥','♥','✦'], colors:['#e8537a','#ff9db2','#f2a9b8'] }
};
function launchConfetti(){
  const screen = $('screen');
  const count = reduceMotion ? 6 : 22;
  const { glyphs, colors } = CONFETTI[THEME];
  for(let i=0;i<count;i++){
    const h = document.createElement('div');
    h.textContent = glyphs[i % glyphs.length];
    h.style.cssText = `position:absolute; left:${Math.random()*100}%; top:-10px; font-size:${9+Math.random()*10}px; color:${colors[i % colors.length]}; z-index:7; pointer-events:none;`;
    screen.appendChild(h);
    const dur = reduceMotion ? 0 : 1500 + Math.random()*1300;
    h.animate([
      { transform:'translateY(0) rotate(0deg)', opacity:1 },
      { transform:`translateY(${420+Math.random()*60}px) rotate(${Math.random()>0.5?360:-360}deg)`, opacity:0.9 }
    ], { duration: dur || 1, easing:'ease-in', fill:'forwards' });
    setTimeout(()=>h.remove(), dur + 100);
  }
}

/* ---------------- sound toggle (effects only — the Listen button always works) ---------------- */
$('soundToggle').addEventListener('click', (e)=>{
  soundOn = !soundOn;
  e.currentTarget.textContent = soundOn ? '♪ on' : '♪ off';
  e.currentTarget.setAttribute('aria-pressed', String(soundOn));
  if(soundOn) blip(660, 0.08);
});

/* ---------------- background: snow, sparkle, hearts or petals ---------------- */
(function ambient(){
  if(reduceMotion) return;
  const host = $('ambient');
  const fallDots = (n, colors, minS, maxS, speed) => {
    for(let i=0;i<n;i++){
      const s = document.createElement('span');
      s.className = 'dot';
      const size = minS + Math.random()*(maxS - minS);
      s.style.width = s.style.height = size.toFixed(1) + 'px';
      s.style.left = Math.random()*100 + '%';
      s.style.setProperty('--c', colors[i % colors.length]);
      s.style.setProperty('--dx', (Math.random()*90-45)+'px');
      s.style.setProperty('--o', (0.35 + Math.random()*0.55).toFixed(2));
      s.style.animationDuration = (speed + Math.random()*13) + 's';
      s.style.animationDelay = (-Math.random()*20) + 's';   // negative = already mid-fall on load
      host.appendChild(s);
    }
  };
  const riseGlyphs = (n, glyphs, colors) => {
    for(let i=0;i<n;i++){
      const s = document.createElement('span');
      s.className = 'glyph';
      s.textContent = glyphs[Math.floor(Math.random()*glyphs.length)];
      s.style.left = Math.random()*100 + '%';
      if(colors) s.style.setProperty('--c', colors[i % colors.length]);
      s.style.setProperty('--dx', (Math.random()*80-40)+'px');
      s.style.animationDuration = (14 + Math.random()*14) + 's';
      s.style.animationDelay = (-Math.random()*14) + 's';
      s.style.fontSize = (10 + Math.random()*10) + 'px';
      host.appendChild(s);
    }
  };
  if(THEME === 'xmas') fallDots(34, ['#ffffff'], 2, 7, 9);
  else if(THEME === 'newyear') fallDots(30, ['#f5e3a6', '#ffffff', '#e6c260'], 1.5, 4, 12);
  else if(THEME === 'valentine') riseGlyphs(16, ['♥', '♥', '·'], ['#ff9db2', '#f2a9b8', '#ffd9e0']);
  else riseGlyphs(14, ['✿', '·', '♥', '✿']);
})();

/* ---------------- boot: always the start screen ---------------- */
setListenMode(listenMode);
checkNotes();
newRound(DATE_ROUND_SIZE);
renderQuiz();
refreshLockIn();
setLevel(L.MENU);
loadCountdown();

/* ---------------- scale the poster to always fit the viewport ---------------- */
(function fitToScreen(){
  const el = document.querySelector('.poster');
  const MARGIN = 28;
  function fit(){
    el.style.transform = 'none';
    el.style.marginTop = el.style.marginBottom = '';
    const vw = (window.visualViewport ? window.visualViewport.width : window.innerWidth);
    const vh = (window.visualViewport ? window.visualViewport.height : window.innerHeight);
    const footerH = document.querySelector('footer').offsetHeight + 16;
    const rect = el.getBoundingClientRect();
    const scale = Math.min(1, (vw - MARGIN) / rect.width, (vh - MARGIN - footerH) / rect.height);
    el.style.transform = scale < 1 ? `scale(${scale})` : 'none';
    /* a scaled element still takes up its full-size space — pull the slack back in so the footer stays on screen */
    if(scale < 1){
      const slack = -(rect.height * (1 - scale) / 2) + 'px';
      el.style.marginTop = slack; el.style.marginBottom = slack;
    }
  }
  window.__fitPoster = fit;
  fit();
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', fit);
  if(window.visualViewport) window.visualViewport.addEventListener('resize', fit);
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  window.addEventListener('load', fit);
})();
