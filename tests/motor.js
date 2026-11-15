// Motortest for Helteludo. Henter spillets script direkte fra helteludo.html og kører det i Node
// med en falsk browser (ingen pakker kræves). Kør:  node tests/motor.js  (eller: node tests/motor.js sti/til/anden.html)
'use strict';
const fs=require('fs'), path=require('path'), vm=require('vm'), assert=require('assert');

// ---------- Indlæs spillet ----------
const html=fs.readFileSync(process.argv[2]||path.join(__dirname,'..','helteludo.html'),'utf8');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const code=scripts.reduce((a,b)=>b.length>a.length?b:a);

// En "alt-objekt": hver egenskab og hvert kald giver et nyt alt-objekt. Nok til, at DOM-koden kan køre uden at gøre noget.
function any(){const f=function(){}; return new Proxy(f,{
  get:(t,k)=>k===Symbol.toPrimitive?(()=>''):k==='then'?undefined:k==='length'?0:k===Symbol.iterator?function*(){}:any(),
  set:()=>true, apply:()=>any(), construct:()=>any(), has:()=>true})}
const store={};
const localStorage={getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]},clear:()=>{for(const k in store) delete store[k]}};
const timers=[];
const ctx={console, Math, JSON, Date, Promise, Object, Array, String, Number, Boolean, Set, Map, WeakMap, Symbol, Error, RegExp, Proxy, Reflect, Intl,
  parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent, structuredClone,
  localStorage, sessionStorage:localStorage,
  setTimeout:(f,ms)=>{timers.push(f); return timers.length}, clearTimeout:()=>{}, setInterval:()=>0, clearInterval:()=>{},
  requestAnimationFrame:()=>0, cancelAnimationFrame:()=>{}, performance:{now:()=>Date.now()},
  document:any(), navigator:{userAgent:'node',maxTouchPoints:0,clipboard:any()}, location:{href:'http://localhost/',search:'',hash:'',hostname:'localhost',protocol:'http:',origin:'http://localhost'},
  matchMedia:()=>({matches:false,addEventListener(){},addListener(){}}), addEventListener(){}, removeEventListener(){},
  innerWidth:1300, innerHeight:900, devicePixelRatio:1, fetch:()=>Promise.reject(new Error('offline')),
  Image:function(){return any()}, AudioContext:undefined, webkitAudioContext:undefined, THREE:undefined};
ctx.window=ctx; ctx.self=ctx; ctx.globalThis=ctx;
vm.createContext(ctx);
vm.runInContext(code,ctx,{filename:'helteludo.html'});
// Top-level let/const (S, R, UI, B …) deles mellem scripts i samme kontekst, så de kan læses med $('S').
const $=c=>vm.runInContext(c,ctx), G=ctx;
$('render=()=>{}'); // vi tester motoren, ikke tegningen
$('UI.screen="game"');

// ---------- Små hjælpere ----------
let passed=0, failed=0;
function test(name,fn){try{fn(); passed++; console.log('  ✓',name)}catch(e){failed++; console.log('  ✗',name,'\n     ',e.stack.split('\n').slice(0,3).join('\n      '))}}
const S=()=>$('S');
function cfg(n,abil,ai=true){return $('SEAT_SETS')[n].map(s=>({seat:s,name:'Hold '+s,ai,pieces:[0,1,2,3].map(i=>({name:`B${s}${i}`,abil:abil?abil(s,i):{},kind:''})),heroRolls:[2,2,1,1]}))}
function playRound(max=30000){let k=0; while(!S().over&&k<max){if(S().phase==='busy') throw new Error('fastlåst i busy'); G.aiStep(); k++} timers.length=0; if(!S().over) throw new Error('runden blev ikke færdig'); return k}
function heroesDone(){let k=0; while(S().heroQ&&k<500){G.aiStep(); k++} timers.length=0}
// Slå et bestemt øjental med næste d6.
function withRoll(v,fn){const r=Math.random; let used=false; Math.random=()=>{if(!used){used=true; return (v-1)/6+0.01} return r()}; try{return fn()}finally{Math.random=r}}
const sum=a=>(a||[]).reduce((x,y)=>x+y,0);

console.log('Helteludo motortest');

// ---------- Brættet ----------
test('brætterne har den rigtige størrelse',()=>{
  const b=$('BOARDS'); assert.strictEqual(b.quad.TL,52); assert.strictEqual(b.tri.TL,39);
  assert.strictEqual(b.quad.PATH.length,52); assert.strictEqual(b.tri.PATH.length,39);
  assert.deepStrictEqual([...b.quad.STAR_REL].slice(0,2),[5,11]);
});

// ---------- Heltetabellen ----------
test('rollAbility giver kun evner, brikken kan få',()=>{
  for(let k=0;k<2000;k++){const abil={hurtig:4,aura:1}; const r=G.rollAbility(abil); if(r.id&&r.id!=='@valg') assert.ok(G.canGain(abil,r.id),r.id)}
});
test('canGain: niveauevner op til 4, andre én gang',()=>{
  assert.ok(G.canGain({hurtig:3},'hurtig')); assert.ok(!G.canGain({hurtig:4},'hurtig')); assert.ok(!G.canGain({aura:1},'aura'));
});

// ---------- Hele computerspil ----------
for(const n of [2,3,4]) test(`20 computerspil med ${n} hold bliver færdige`,()=>{
  for(let g=0;g<20;g++){G.newGame(cfg(n),$('DEF_OPTS')); playRound(); assert.strictEqual(S().finished.length,n)}
  assert.strictEqual(S().board,n===3?'tri':'quad');
});

test('40 serier á 5 runder bliver færdige (evnerne hober sig op uden at låse spillet)',()=>{
  for(let g=0;g<40;g++){G.newGame(cfg(4),$('DEF_OPTS')); for(let r=1;r<=5;r++){playRound(); if(r<5) G.nextRound()}}
});

// ---------- Runde 1 ----------
test('runde 1 starter uden evner og slår 6 gange pr. hold',()=>{
  G.newGame(cfg(4),$('DEF_OPTS'));
  assert.strictEqual(S().round,1); assert.strictEqual(S().phase,'heroes');
  assert.ok(S().teams.every(t=>t.pieces.every(p=>!Object.keys(p.abil).length)));
  assert.deepStrictEqual([0,1,2,3].map(ti=>S().heroQ.filter(x=>x.ti===ti).length),[6,6,6,6]);
  heroesDone();
  assert.strictEqual(S().phase==='roll'||S().phase==='choose',true);
  S().teams.forEach(t=>{const n=sum(t.pieces.map(p=>sum(Object.values(p.abil)))); assert.ok(n>=4&&n<=6,`${t.name} har ${n} evneniveauer`)});
});

// ---------- Runder og opstigning ----------
test('næste runde: opstigning og nedstigning følger heltepointene',()=>{
  G.newGame(cfg(4),$('DEF_OPTS')); playRound();
  const hp=S().teams.map(t=>t.pieces.map(p=>p.hp)), abil=JSON.stringify(S().teams.map(t=>t.pieces.map(p=>p.abil)));
  S().teams[1].pieces[0].hp=-4.5;
  G.nextRound();
  assert.strictEqual(S().round,2); assert.strictEqual(S().over,false);
  S().teams.forEach((t,ti)=>t.pieces.forEach((p,pi)=>{
    const h=ti===1&&pi===0?-4.5:hp[ti][pi], q=S().heroQ||[];
    assert.strictEqual(q.filter(x=>x.ti===ti&&x.pi===pi&&x.type==='gain').length,h>=2?Math.floor(h/2):0);
    assert.strictEqual(q.filter(x=>x.ti===ti&&x.pi===pi&&x.type==='lose').length,h<=-2?Math.floor(-h/2):0);
    assert.strictEqual(p.hp,0);
  }));
  assert.strictEqual(JSON.stringify(S().teams.map(t=>t.pieces.map(p=>p.abil))),abil,'evnerne føres videre');
});
test('fem runder: sejre og historik passer, spillet slutter først ved Afslut',()=>{
  G.newGame(cfg(3),$('DEF_OPTS'));
  for(let r=1;r<=5;r++){playRound(); assert.strictEqual(S().round,r); if(r<5) G.nextRound()}
  assert.strictEqual(sum(Object.values(S().wins)),5); assert.strictEqual(S().history.length,5);
  assert.ok(!S().ended); G.endSeries(); assert.ok(S().ended);
  const id=S().gameId; G.nextRound(); assert.strictEqual(S().gameId,id); assert.strictEqual(S().round,5,'ingen ny runde efter Afslut');
});
test('det startende hold går på skift',()=>{
  G.newGame(cfg(4),$('DEF_OPTS')); const firsts=[];
  for(let r=1;r<=5;r++){firsts.push([S().first,(S().heroQ||[]).map(x=>x.ti)]); heroesDone(); assert.strictEqual(S().cur,S().first); playRound(); G.nextRound()}
  assert.deepStrictEqual(firsts.map(f=>f[0]),[0,1,2,3,0]);
  // Opstigningen går i holdrækkefølge fra det startende hold (et hold uden slag springes bare over).
  firsts.forEach(([f,q])=>{const ord=q.map(ti=>(ti-f+4)%4); assert.strictEqual(JSON.stringify(ord),JSON.stringify([...ord].sort((a,b)=>a-b)))});
});
test('tælleren i opstigningen tæller kun slag på Heltetabellen',()=>{
  G.newGame(cfg(4),$('DEF_OPTS')); playRound();
  S().teams.forEach(t=>t.pieces.forEach(p=>p.hp=0)); S().teams[2].pieces[0].hp=4; S().teams[2].pieces[1].hp=-2;
  G.nextRound(); const msgs=[]; let k=0;
  while(S().heroQ&&k++<50){if(S().cur===2) msgs.push(S().msg); G.aiStep()}
  assert.ok(/slag 1 af 2/.test(msgs[0])&&/slag 2 af 2/.test(msgs[1])&&/Nedstigning/.test(msgs[2]),msgs.join(' | '));
});
test('Forbandet og Ærkefjende beholdes, til evnen mistes',()=>{
  G.newGame(cfg(4,(s,i)=>s===1&&i===0?{forbandet:1,aerkefjende:1}:{}),$('DEF_OPTS'));
  const t=()=>S().teams[1], p=()=>t().pieces[0], c0=t().curse, h0=p().hates;
  assert.ok(c0>=1&&c0<=6); assert.ok(h0!=null&&h0!==1);
  for(let r=0;r<4;r++){playRound(); p().abil.forbandet=1; p().abil.aerkefjende=1; S().teams.forEach(t=>t.pieces.forEach(q=>q.hp=0)); G.nextRound(); assert.strictEqual(t().curse,c0); assert.strictEqual(p().hates,h0)}
  playRound(); t().pieces.forEach(q=>{delete q.abil.forbandet; delete q.abil.aerkefjende}); S().teams.forEach(t=>t.pieces.forEach(q=>q.hp=0)); G.nextRound();
  assert.strictEqual(t().curse,0); assert.strictEqual(p().hates,null);
});
test('nedstigning fjerner et niveau eller en evne',()=>{
  G.newGame(cfg(2),$('DEF_OPTS')); heroesDone(); const p=S().teams[0].pieces[0];
  p.abil={hurtig:3}; G.heroLose(p); assert.deepStrictEqual(p.abil,{hurtig:2});
  p.abil={aura:1}; G.heroLose(p); assert.deepStrictEqual(p.abil,{});
  G.heroLose(p); assert.deepStrictEqual(p.abil,{});
});
test('»Vælg selv« uden evner tilbage går videre',()=>{
  G.newGame(cfg(4),$('DEF_OPTS')); heroesDone(); S().over=true; S().teams.forEach(t=>t.pieces.forEach(q=>q.hp=0)); G.nextRound();
  S().teams[0].ai=false; const p=S().teams[0].pieces[0]; p.abil={}; $('ORDER').forEach(id=>p.abil[id]=$('ABIL')[id].lvl?4:1);
  S().heroQ=[{ti:0,pi:0,of:1,type:'gain'}]; G.heroNext();
  $('globalThis.__ra=rollAbility; rollAbility=()=>({txt:"Heltetabel 66 → Vælg selv en evne",id:"@valg",skipped:[]})');
  try{G.heroRoll()}finally{$('rollAbility=globalThis.__ra')}
  assert.strictEqual(S().heroPick,null); assert.strictEqual(S().heroQ,null);
  assert.strictEqual($('autoValg')({abil:{}})!=null,true);
});

// ---------- Statistik og gemte spil ----------
test('terningstatistikken tælles ikke dobbelt over runder',()=>{
  G.localStorage.clear(); $('R=freshRoster()');
  G.newGame(cfg(4),$('DEF_OPTS'));
  for(let r=1;r<=3;r++){playRound(); G.recordGame(); if(r<3) G.nextRound()}
  S().teams.forEach((t,ti)=>assert.strictEqual(sum($('R').seats[t.seat].dice),sum(S().dice[ti]),t.name));
  assert.ok(sum(S().rdice[0])<sum(S().dice[0]));
});
test('spillet gemmes mellem runderne og fjernes, når det afsluttes',()=>{
  G.localStorage.clear(); G.newGame(cfg(2),$('DEF_OPTS')); playRound(); G.saveGame();
  assert.strictEqual(G.savedGames().length,1); G.nextRound(); G.saveGame();
  assert.strictEqual(G.savedGames()[0].S.round,2); playRound(); G.endSeries(); G.saveGame();
  assert.strictEqual(G.savedGames().length,0);
});

// ---------- Træk og evner ----------
// Stil hold 0 (menneske) klar med brik 0 på rel med evner abil, og slå v.
function humanTurn(abil,rel,v){
  G.newGame(cfg(4,(s,i)=>s===0&&i===0?abil:{},false),$('DEF_OPTS')); heroesDone(); timers.length=0;
  S().teams.forEach(t=>t.ai=t!==S().teams[0]);
  const p=S().teams[0].pieces[0]; p.abil=abil; p.state='track'; p.rel=rel; p.hasLeft=true;
  G.startTurn(0); S().phase='roll'; S().rollsLeft=1; withRoll(v,()=>G.doRoll()); timers.length=0; return p;
}
test('Bakgear ind på en stjerne hopper en stjerne frem',()=>{
  const p=humanTurn({bakgear:1},8,3);
  const o=S().options.find(o=>o.pid===p.id&&o.kind==='move'&&o.dir<0);
  assert.ok(o,'der er et baglæns træk'); assert.strictEqual(o.rel,11);
});
test('Ingen stedsans slår først, når brikken er valgt, og kan ikke fortrydes',()=>{
  const p=humanTurn({ingenstedsans:4},3,4), n0=$('D6N');
  const i=S().options.findIndex(o=>o.pid===p.id&&o.kind==='move'&&o.dir>0); assert.ok(i>=0);
  assert.strictEqual($('D6N'),n0,'ingen slag før valget');
  G.chooseOpt(i); timers.length=0;
  assert.ok($('D6N')>n0,'slaget kommer ved valget'); assert.strictEqual($('UI.undo'),null);
});
test('et almindeligt træk kan fortrydes',()=>{
  const p=humanTurn({},3,4); const i=S().options.findIndex(o=>o.pid===p.id&&o.kind==='move');
  G.chooseOpt(i); timers.length=0; assert.ok($('UI.undo'));
});
test('betinget sikkerhed på et andet holds startfelt',()=>{
  const p=humanTurn({},13,1); // hold 1's startfelt (seat 1)
  assert.strictEqual($('absOf')(p),13);
  assert.strictEqual(G.isSafe(p),'cond');
  S().teams[1].pieces.forEach(q=>{q.state='track'; q.rel=20}); assert.strictEqual(G.isSafe(p),true);
});
test('landingsfeltet markeres som sikkert',()=>{
  const p=humanTurn({},3,5); // 3+5 = globus på rel 8
  assert.ok(G.safeAt(p,8)); assert.ok(!G.safeAt(p,7));
});

// ---------- Online: hvem må fortsætte ----------
test('online: værten fortsætter; er værten væk, den tilstedeværende spiller',()=>{
  const keep=[$('UI.online'),$('NET.uid')];
  $('NET.uid="me"'); S().teams[0].uid='me'; S().teams[0].ai=false;
  $('UI.online={doc:{host:"H"},seen:{}}'); assert.strictEqual($('canLeadOnline')(),true);
  $('UI.online.seen.H=Date.now()'); assert.strictEqual($('canLeadOnline')(),false);
  ctx.__k=keep; $('UI.online=globalThis.__k[0]; NET.uid=globalThis.__k[1]');
});
console.log(`\n${passed} bestået, ${failed} fejlet`); process.exit(failed?1:0);
