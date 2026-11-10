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
   ever reach this page or her browser */
const CAL_BACKEND_URL = "https://script.google.com/macros/s/AKfycbzYLMwnOmgXwu7UlsCLW-cs6YImwYEws3Wm4pBPa9C1Fl0_VoaT46rbH-fhsbAFUOwd/exec";
const CAL_SECRET = "4fZw434IrwPNuwyfK7i2M0-9";
const TOD_START_HOUR = { morning: 10, afternoon: 14, evening: 18, night: 20 };
const EVENT_DURATION_HOURS = 2;

/* Hindi class — words per round */
const DATE_ROUND_SIZE = 5;     // the short version inside the date path
const LEARN_ROUND_SIZE = 10;   // "I'm just here to learn Hindi"
const POINTS_PER_WORD = 10;

/* the app starts completely fresh every time it's opened. If she leaves it open in the
   background and comes back after this long, it resets too (as if she'd closed it). */
const RESET_AFTER_HIDDEN_MS = 2 * 60 * 1000;

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
const L = { MENU:0, ASK:1, CLASS:2, DATE:3, PLAN:4, FIN:5, RESULT:6 };

/* ---------------- pixel pig (her favourite animal) ---------------- */
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
const PAL = { k:'#2b0a17', d:'#b4435f', p:'#f4a6b8' };
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

/* ---------------- elements + state ---------------- */
const $ = id => document.getElementById(id);
const yesBtn = $('yesBtn'), noBtn = $('noBtn'), evadeCounter = $('evadeCounter');
const askLevel = document.querySelector(`[data-level="${L.ASK}"]`);
const quizNext = $('quizNext');
const dateInput = $('dateInput'), dateNext = $('dateNext'), lockIn = $('lockIn');
const backBtn = $('backBtn'), nextBtn = $('nextBtn');

let mode = 'date';      // 'date' = the full story · 'learn' = just the Hindi class
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

/* nothing about a visit is saved — only which words she's already met (so words don't repeat).
   Clear out anything left behind by older versions. */
try{ ['kahani_state_v2', 'kahani_state_v1', 'lovequest_state_v1'].forEach(k => localStorage.removeItem(k)); }catch(e){}

let toastTimer;
function showToast(text, ms=2600){
  const toast = $('toast');
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> toast.classList.remove('show'), ms);
}

/* ---------------- the word bank + a fresh round every time ---------------- */
const WORD_BY_ID = Object.fromEntries(WORDS.map(w => [w.rm, w]));
const SEEN_KEY = 'kahani_seen_v1';

function shuffle(a){
  for(let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function loadSeen(){
  try{ return (JSON.parse(localStorage.getItem(SEEN_KEY)) || []).filter(id => WORD_BY_ID[id]); }
  catch(e){ return []; }
}
function saveSeen(list){
  try{ localStorage.setItem(SEEN_KEY, JSON.stringify(list)); }catch(e){}
}
/* words she hasn't got right yet come first; once she's been through the whole bank it starts over */
function newRound(size){
  const seen = loadSeen();
  const fresh = WORDS.filter(w => !seen.includes(w.rm));
  let picked;
  if(fresh.length >= size){
    picked = shuffle(fresh).slice(0, size);
  } else {
    const filler = shuffle(WORDS.filter(w => !fresh.includes(w))).slice(0, size - fresh.length);
    picked = shuffle(fresh.concat(filler));
    saveSeen([]);                       // new cycle begins
  }
  quiz = picked.map(w => {
    const others = shuffle(WORDS.filter(o => o.rm !== w.rm && o.en !== w.en)).slice(0, 2);
    return { id: w.rm, opts: shuffle([w, ...others]).map(o => o.rm), picked: null };
  });
  quizIndex = 0;
  warmAudio();
}
function markSeen(id){
  saveSeen([...new Set(loadSeen().concat(id))]);
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
  } else {
    note.textContent = 'couldn’t play audio — try again';
  }
}
function playWord(w){
  const btn = $('qListen'), note = $('qListenNote');
  note.textContent = '';
  if(currentAudio){ currentAudio.pause(); currentAudio = null; }
  const a = new Audio(`audio/${w.rm}.m4a`);
  currentAudio = a;
  btn.classList.add('playing');
  const done = () => btn.classList.remove('playing');
  a.addEventListener('ended', done);
  a.addEventListener('error', () => { done(); speakFallback(w, note); });
  const p = a.play();
  if(p && p.catch) p.catch(() => { done(); speakFallback(w, note); });
}
$('qListen').addEventListener('click', () => {
  if(quiz[quizIndex]) playWord(WORD_BY_ID[quiz[quizIndex].id]);
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
  if(n === L.CLASS) return mode === 'learn' ? L.MENU : L.ASK;
  if(n === L.DATE) return L.CLASS;
  if(n === L.PLAN) return L.DATE;
  return null;                          // menu, finale and results have no "back"
}
function refreshRemote(){
  const n = activeLevel();
  backBtn.disabled = backTarget(n) === null;
  nextBtn.disabled = !canForward(n);
}
function setLevel(n){
  document.querySelectorAll('.level').forEach(el=>{
    el.classList.toggle('active', Number(el.dataset.level) === n);
  });
  /* progress pips only make sense on the date path (acts I–V) */
  const showPips = mode === 'date' && n >= L.ASK && n <= L.FIN;
  $('pips').classList.toggle('off', !showPips);
  document.querySelectorAll('.pip').forEach(p=>{
    p.classList.toggle('done', showPips && Number(p.dataset.pip) <= n - 1);
  });
  $('classTag').textContent = mode === 'learn' ? 'HINDI CLASS' : 'ACT II — HINDI CLASS';
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

/* ---------------- start menu ---------------- */
drawPixels($('pigSprite'), PIG, PAL);
drawPixels($('pigSprite2'), PIG, PAL);

$('optDate').addEventListener('click', ()=>{
  blip(880, 0.12);
  mode = 'date';
  if(quiz.length !== DATE_ROUND_SIZE){ newRound(DATE_ROUND_SIZE); renderQuiz(); }
  setLevel(L.ASK);
});
$('optLearn').addEventListener('click', ()=>{
  blip(880, 0.12);
  mode = 'learn';
  newRound(LEARN_ROUND_SIZE);
  renderQuiz();
  setLevel(L.CLASS);
});

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
  // position is relative to the ask-row, so convert from level-local coords
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
});

/* ---------------- Hindi class (Act II of the date path, or the whole point of the learn path) ---------------- */
const qOpts = $('qOpts'), qFeedback = $('qFeedback');

function pointsText(){
  return `PYAAR POINTS ♥ ${quizScore()} / ${quiz.length * POINTS_PER_WORD}`;
}
function renderQuiz(){
  const q = quiz[quizIndex];
  const w = WORD_BY_ID[q.id];
  if(currentAudio){ currentAudio.pause(); currentAudio = null; }
  $('qListen').classList.remove('playing');
  $('qListenNote').textContent = '';
  $('qStep').textContent = `WORD ${quizIndex + 1} / ${quiz.length}`;
  $('qWord').textContent = w.hi;
  $('qRoman').textContent = w.rm;
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
    : (mode === 'learn' ? 'नतीजा · SEE HOW I DID →' : 'आगे चलें · CONTINUE →');
  if(q.picked !== null) revealAnswer(q.picked);
  else quizNext.disabled = true;
  $('qPoints').textContent = pointsText();
  refreshRemote();
}
function revealAnswer(pickedIndex){
  const q = quiz[quizIndex];
  const w = WORD_BY_ID[q.id];
  const answerIndex = q.opts.indexOf(q.id);
  const right = pickedIndex === answerIndex;
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
  if(right) markSeen(q.id);             // missed words stay "new" so they come back
  blip(right ? 880 : 240, right ? 0.14 : 0.12, right ? 'triangle' : 'sawtooth');
  revealAnswer(i);
  $('qPoints').textContent = pointsText();
  refreshRemote();
});
quizNext.addEventListener('click', ()=>{
  blip(700, 0.08);
  if(quizIndex < quiz.length - 1){
    quizIndex++;
    renderQuiz();
    if(window.__fitPoster) window.__fitPoster();
  } else if(mode === 'learn'){
    showResults();
    setLevel(L.RESULT);
  } else {
    setLevel(L.DATE);
  }
});

/* ---------------- learn-only path: results ---------------- */
function showResults(){
  const total = quiz.length * POINTS_PER_WORD;
  const score = quizScore();
  $('resScore').textContent = `${score} / ${total} pyaar points ♥`;
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
  $('resMet').textContent = `WORDS LEARNED · ${loadSeen().length} / ${WORDS.length}`;
}
$('learnAgain').addEventListener('click', ()=>{
  blip(880, 0.12);
  newRound(LEARN_ROUND_SIZE);
  renderQuiz();
  setLevel(L.CLASS);
});
$('learnHome').addEventListener('click', ()=>{
  blip(320, 0.06);
  setLevel(L.MENU);
});

/* ---------------- Act III: the date ---------------- */
const today = new Date();
dateInput.min = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

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
/* coming back from the browser's back/forward cache */
window.addEventListener('pageshow', (e)=>{ if(e.persisted) location.reload(); });
/* coming back to a tab / home-screen app that sat in the background for a while */
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

/* ---------------- confetti: marigold petals + hearts ---------------- */
function launchConfetti(){
  const screen = $('screen');
  const count = reduceMotion ? 6 : 22;
  const glyphs = ['✿', '♥', '✿'];
  const colors = ['#f0b429', '#b83a57', '#d98a1c'];
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

/* ---------------- ambient marigold petals ---------------- */
(function ambient(){
  if(reduceMotion) return;
  const host = $('ambient');
  const glyphs = ['✿', '·', '♥', '✿'];
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

/* ---------------- boot: always the start menu ---------------- */
newRound(DATE_ROUND_SIZE);
renderQuiz();
refreshLockIn();
setLevel(L.MENU);

/* ---------------- scale the poster to always fit the viewport ---------------- */
(function fitToScreen(){
  const el = document.querySelector('.poster');
  const MARGIN = 28;
  function fit(){
    el.style.transform = 'none';
    const vw = (window.visualViewport ? window.visualViewport.width : window.innerWidth);
    const vh = (window.visualViewport ? window.visualViewport.height : window.innerHeight);
    const footerH = document.querySelector('footer').offsetHeight + 16;
    const rect = el.getBoundingClientRect();
    const scale = Math.min(1, (vw - MARGIN) / rect.width, (vh - MARGIN - footerH) / rect.height);
    el.style.transform = scale < 1 ? `scale(${scale})` : 'none';
  }
  window.__fitPoster = fit;
  fit();
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', fit);
  if(window.visualViewport) window.visualViewport.addEventListener('resize', fit);
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  window.addEventListener('load', fit);
})();
