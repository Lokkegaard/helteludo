const window={matchMedia:()=>({matches:false})}; const document={querySelector:()=>null};
const localStorage={getItem:()=>null,setItem:()=>{}}; const matchMedia=window.matchMedia;
const KINDS=[{id:'dvaerg'},{id:'elver'},{id:'ork'},{id:'nisse'}]; let S=null,R=null;
const piecePos=()=>({pt:[0,0]}); function relPt(s,rel){if(rel===B.GOAL) return GOALPOS[s]; if(rel>B.LAST) return STRETCH[s][rel-B.LAST-1]; return PATH[relAbs(s,rel)]}
/* ---------- Data ---------- */
const SEATS=[
  {key:'rod', name:'Rød', hex:'#9b2f2a', ink:'#fbf3df', tint:'#d9a59a', team:'Røde Rabalder', pieces:['Rasmus Rædsel','Rikke Raket','Ruben Rustning','Rosa Rap']},
  {key:'gron',name:'Grøn',hex:'#2f6b45', ink:'#fbf3df', tint:'#a9c7a8', team:'Grønne Gnister', pieces:['Gustav Gnist','Grete Grum','Gorm Glad','Gitte Gaffel']},
  {key:'gul', name:'Gul', hex:'#c89a2b', ink:'#2a1f16', tint:'#e6cf8c', team:'Gule Gnavpotter', pieces:['Gunnar Gnav','Gulla Gal','Gylle-Gert','Gry Gummi']},
  {key:'bla', name:'Blå', hex:'#2c4f86', ink:'#fbf3df', tint:'#a3b5d6', team:'Blå Bøller', pieces:['Bent Bølle','Bodil Bang','Bjarke Bjørn','Bitten Blæst']},
];
const SEAT_SETS={2:[0,2],3:[0,1,2],4:[0,1,2,3]};
// Hvert hold har et symbol ud over farven: flamme, blad, sol og bølge.
const SYM_D=[
  '<path d="M0 -5.6 C2.6 -2.6 4.1 -0.6 4.1 1.8 A4.1 4.1 0 0 1 -4.1 1.8 C-4.1 -0.7 -2.5 -1.7 -1.5 -3.5 C-1 -1.7 0 -1.1 .6 -.7 C.9 -2.5 .4 -4.1 0 -5.6 Z"/>',
  '<path d="M-4.8 4.8 C-5.2 -1.6 -1 -5.2 5.2 -5.2 C5.2 1.2 1.6 5.2 -4.8 4.8 Z"/><path d="M-4.8 4.8 L2.2 -2.2" fill="none" stroke="#fbf3df" stroke-width=".9" stroke-linecap="round" opacity=".8"/>',
  '<circle r="2.7"/><path d="M0 -5.7V-4M0 4V5.7M-5.7 0H-4M4 0H5.7M-4 -4L-2.9 -2.9M2.9 2.9L4 4M-4 4L-2.9 2.9M2.9 -2.9L4 -4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  '<path d="M-5.6 -1.2 Q-3.7 -3.4 -1.8 -1.2 T1.8 -1.2 T5.6 -1.2 M-5.6 2.8 Q-3.7 .6 -1.8 2.8 T1.8 2.8 T5.6 2.8" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>'];
const SYM_NAME=['flamme','blad','sol','bølge'];
const symSvg=s=>`<svg class="sym" viewBox="-6 -6 12 12" fill="currentColor" role="img" aria-label="${SYM_NAME[s]}">${SYM_D[s]}</svg>`;

// t: h = Heltetabel, n = Nørdtabel, s = Superheltetabel. lvl = niveaudelt (*)
const ABIL={
  regeneration:{name:'Regeneration',t:'h',lvl:1,desc:'Første gang brikken bliver slået hjem, står den over en tur og kommer tilbage til samme felt. Én gang mere pr. ekstra niveau. Angriberen får ingen point.'},
  selvantaendelig:{name:'Selvantændelig',t:'h',lvl:1,desc:'Kan bruge en tur på at eksplodere. Den selv og alle brikker inden for 3 felter ryger hjem. Én gang pr. spil pr. niveau.'},
  aura:{name:'Aura',t:'h',desc:'Kan bruge holdets tur på at stå i sikkerhed, som på en globus, indtil holdets næste tur.'},
  heldig:{name:'Heldig',t:'h',lvl:1,desc:'Må slå et terningslag om én gang pr. spil pr. niveau. Omslaget skal bruges af den heldige brik.'},
  hurtig:{name:'Hurtig',t:'h',lvl:1,desc:'+1 på alle flytteslag pr. niveau.'},
  hjemve:{name:'Hjemve',t:'h',desc:'Må flytte hele slaget baglæns, når den står i sit farvede målområde.'},
  booster:{name:'Booster',t:'h',lvl:1,desc:'Må én gang pr. spil pr. niveau slå en ekstra terning, når den flytter.'},
  draeber:{name:'Dræber',t:'h',lvl:1,desc:'Må flytte op til ét ekstra felt pr. niveau, hvis den kan slå en modstander hjem ved det.'},
  kampivrig:{name:'Kampivrig',t:'h',lvl:1,desc:'+1 pr. niveau på slaget for at komme ud af hjembasen.'},
  hojdespringer:{name:'Højdespringer',t:'h',desc:'Når den hopper på stjerner, lander den først i holdets næste tur. Lander den på en modstander, ryger modstanderen hjem.'},
  sej:{name:'Sej',t:'h',lvl:1,desc:'Når en modstander angriber, slås en terning. På en 6\'er ryger angriberen hjem i stedet. +1 chance pr. ekstra niveau.'},
  malsogende:{name:'Målsøgende',t:'h',desc:'Kan i stedet for at flytte teleportere baglæns og stille sig lige bag en modstander.'},
  atlet:{name:'Atlet',t:'h',desc:'Lander den på en anden brik, kan den springe buk og flytte slaget én gang til. Den springer over brikken uden at slå den hjem.'},
  hypnotisor:{name:'Hypnotisør',t:'h',lvl:1,desc:'Slår en terning for hver modstander, den passerer. På en 6\'er er modstanderen lammet i 1–6 runder. +1 chance pr. ekstra niveau.'},
  langsom:{name:'Langsom',t:'n',lvl:1,desc:'−1 pr. niveau på alle flytteslag. Går aldrig baglæns af det.'},
  forbandet:{name:'Forbandet',t:'n',desc:'Før spillet slås en terning. Holdet får ekstra slag på det øjental i stedet for på 6\'eren.'},
  ingenstedsans:{name:'Ingen stedsans',t:'n',lvl:1,desc:'Slår en terning før hvert træk. På en 6\'er kan den kun gå baglæns. +1 chance pr. ekstra niveau.'},
  vatarm:{name:'Vatarm',t:'n',lvl:1,desc:'Slår en terning, når den angriber. På en 6\'er ryger den selv hjem. +1 chance pr. ekstra niveau.'},
  aerkefjende:{name:'Ærkefjende',t:'n',lvl:1,desc:'Hader et tilfældigt hold. Står den bag en brik fra det hold på samme sektion af brættet (mellem to startfelter), skal den jage den.',note:'Hedder "Racist" i de trykte regler.'},
  haevner:{name:'Hævner',t:'n',desc:'Skal jage brikker, der har slået den hjem, når de står foran den på samme sektion af brættet (mellem to startfelter).'},
  pacifist:{name:'Pacifist',t:'n',lvl:1,desc:'Slår en terning, når den kan slå en modstander hjem. På 5–6 nægter den og bliver stående. +1 chance pr. ekstra niveau.'},
  neurotiker:{name:'Neurotiker',t:'n',desc:'Vil ikke være den sidste i hjembasen. Bliver den senere alene derhjemme, skal den ud hurtigst muligt.'},
  uheldig:{name:'Uheldig',t:'n',lvl:1,desc:'Hver modstander må én gang pr. spil pr. niveau forlange, at brikken slår sit slag om. Omslaget skal bruges af den uheldige brik.',note:'Computerhold kræver aldrig omslag.'},
  hovmodig:{name:'Hovmodig',t:'n',lvl:1,desc:'Slår en terning, før den går ind i målområdet. På 5–6 løber den en omgang til. +1 chance pr. ekstra niveau.'},
  kryster:{name:'Kryster',t:'n',desc:'Står den på en globus, skal den slå en 6\'er for at turde gå videre.'},
  usynlighed:{name:'Usynlighed',t:'s',desc:'Kan bruge turen på at blive usynlig. Kan ikke slås hjem, før den flytter igen.'},
  turbo:{name:'Turbo',t:'s',lvl:1,desc:'Slår igen på både 5 og 6 (ét øjental mere pr. ekstra niveau). Ekstraslaget skal bruges af brikken selv.'},
  bakgear:{name:'Bakgear',t:'s',desc:'Må flytte hele slaget baglæns (ikke forbi startfeltet).'},
  globetrotter:{name:'Globetrotter',t:'s',desc:'Lander den på en globus, hopper den videre til næste globus, eller i mål fra den sidste.'},
  bersaerk:{name:'Bersærk',t:'s',lvl:1,desc:'Tramper på alle brikker, den passerer, også egne. Én terning pr. brik: på en 6\'er ryger den hjem. +1 pr. ekstra niveau.'},
  bredskuldret:{name:'Bredskuldret',t:'s',desc:'Står i vejen. Andre kan kun passere den ved stjernehop eller ved at slå en 6\'er.'},
  snigmorder:{name:'Snigmorder',t:'s',desc:'Kan slå modstandere hjem, selv om de står på en globus.'},
  kommandosoldat:{name:'Kommandosoldat',t:'s',desc:'Kan svinge ind i en modstanders målområde, når den passerer deres indløb, og slå brikker hjem der. Den skal stadig i mål i sit eget område. Kan også slå modstandere hjem på globussen uden for deres base.'},
  stjernehopper:{name:'Stjernehopper',t:'s',desc:'Hopper 2 stjerner frem i stedet for 1, og i mål hvis målet er inden for rækkevidde.'},
  stifinder:{name:'Stifinder',t:'s',desc:'Må justere alle flytteslag med 1 op eller ned.'},
};
const HERO=[[11,16,'@nord'],[21,22,'regeneration'],[23,23,'selvantaendelig'],[24,25,'aura'],[26,26,'heldig'],[31,32,'hurtig'],[33,33,'hjemve'],[34,36,'booster'],[41,42,'draeber'],[43,45,'kampivrig'],[46,46,'hojdespringer'],[51,53,'sej'],[54,54,'malsogende'],[55,55,'atlet'],[56,56,'hypnotisor'],[61,66,'@super']];
const NORD={2:'langsom',3:'forbandet',4:'ingenstedsans',5:'vatarm',6:'aerkefjende',7:'haevner',8:'pacifist',9:'neurotiker',10:'uheldig',11:'hovmodig',12:'kryster'};
const SUPER={2:'usynlighed',3:'turbo',4:'bakgear',5:'globetrotter',6:'bersaerk',7:'bredskuldret',8:'snigmorder',9:'kommandosoldat',10:'stjernehopper',11:'stifinder',12:'@valg'};
const ORDER=Object.keys(ABIL);

/* ---------- Board geometry (center points in cell units, [y,x]) ---------- */
const rot=([y,x])=>[x,15-y];
const rotN=(pt,n)=>{for(let i=0;i<n;i++)pt=rot(pt);return pt};
// Brættet findes i to udgaver: 'quad' (firkantet, 4 arme, 52 felter) og 'tri' (rundt, 3 arme med 120° imellem, 39 felter).
// Hver arm har tre spor: ind ad (mod næste arm), målvejen i midten og ud ad, så stien følger målvejene, og baserne
// ligger uden for stien mellem armene. En sektion på 13 felter er 5 felter ind ad egen arm, 6 ud ad næste arm og 2 over enden af den. B holder det aktive bræt;
// PATH, STRETCH osv. peger på dets lister. Rel-numre: -1..B.LAST = ydre bane (−1 = feltet før start),
// B.LAST+1..B.LAST+5 = målområde, B.GOAL = mål. (Firkantet: LAST 50, GOAL 56; rundt: LAST 37, GOAL 43.)
const BOARD_KINDS={quad:{arms:4,r0:1.5,baseD:Math.hypot(4.5,4.5),baseR:2.55,slotD:1},tri:{arms:3,round:true,r0:1.15,baseD:5.05,baseR:2.15,slotD:.92}};
function makeBoard(kind){
  const cfg=BOARD_KINDS[kind], n=cfg.arms, C=7.5;
  const ang=k=>(180+360/n*k)*Math.PI/180;                     // armens retning (skærmvinkel, y nedad, med uret)
  const at=(k,lane,i)=>{const a=ang(k), r=cfg.r0+.5+i; return [C+Math.sin(a)*r+Math.sin(a+Math.PI/2)*lane, C+Math.cos(a)*r+Math.cos(a+Math.PI/2)*lane]};
  const TL=13*n, LAST=TL-2, GOAL=LAST+6, polar=(a,r)=>[C+Math.sin(a)*r, C+Math.cos(a)*r];
  const path=[]; if(cfg.ring) for(let a=0;a<TL;a++) path.push(polar(Math.PI+(a+2)*2*Math.PI/TL,cfg.ring));
  else for(let s=0;s<n;s++){const k2=(s+1)%n;
    for(let i=4;i>=0;i--) path.push(at(s,1,i)); for(let i=0;i<=5;i++) path.push(at(k2,-1,i)); path.push(at(k2,0,5),at(k2,1,5))}
  const lane=(s,i)=>cfg.ring?polar(ang(s),cfg.ring-1-.9*(4-i)):at(s,0,i);
  const globes=[], stars=[]; for(let s=0;s<n;s++){globes.push(13*s,13*s+8); stars.push(13*s+5,13*s+11)}
  const basec=[...Array(n)].map((_,s)=>{const a=ang(s)+Math.PI/n; return [C+Math.sin(a)*cfg.baseD, C+Math.cos(a)*cfg.baseD]});
  // Firkantet bræt beholder de nøjagtige gamle koordinater.
  const round=p=>p.map(v=>Math.round(v*1000)/1000);
  return {kind, arms:n, round:!!cfg.round, TL, LAST, GOAL, N:15, C, r0:cfg.r0, baseR:cfg.baseR, baseW:cfg.baseR*2+.3, slotD:cfg.slotD, armAng:[...Array(n)].map((_,k)=>ang(k)),
    PATH:path.map(round), STRETCH:[...Array(n)].map((_,s)=>[4,3,2,1,0].map(i=>round(lane(s,i)))),
    GOALPOS:[...Array(n)].map((_,s)=>round([C+Math.sin(ang(s))*(cfg.r0-.55),C+Math.cos(ang(s))*(cfg.r0-.55)])),
    BASEC:basec.map(round), SLOTS:basec.map(([y,x])=>{const d=cfg.slotD; return [[y-d,x-d],[y-d,x+d],[y+d,x-d],[y+d,x+d]].map(round)}),
    GLOBE_REL:globes, STAR_REL:stars, GLOBE_ABS:new Set(globes), STAR_ABS:new Set(stars), seats:[...Array(n).keys()]};
}
const BOARDS={quad:makeBoard('quad'), tri:makeBoard('tri')};
let B=BOARDS.quad, PATH, STRETCH, SLOTS, GOALPOS, GLOBE_REL, STAR_REL, GLOBE_ABS, STAR_ABS;
function useBoard(kind){B=BOARDS[kind]||BOARDS.quad; ({PATH,STRETCH,SLOTS,GOALPOS,GLOBE_REL,STAR_REL,GLOBE_ABS,STAR_ABS}=B)}
useBoard('quad');
// Spillets bræt: spil med 3 hold (sæde 0, 1 og 2) bruger det runde. Ældre gemte spil har ikke S.board og er firkantede.
const boardOf=st=>st&&st.board==='tri'?'tri':'quad';
function ensureBoard(){const k=boardOf(S); if(B.kind!==k) useBoard(k)}

/* ---------- Helpers ---------- */
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mod=(a,n)=>((a%n)+n)%n;
const d6=()=>1+Math.floor(Math.random()*6);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const clone=x=>JSON.parse(JSON.stringify(x));
const relAbs=(seat,rel)=>mod(rel+13*seat,B.TL);
const isGlobeRel=r=>r>=0&&r<=B.LAST&&GLOBE_REL.includes(r);
const isStarRel=r=>r>=0&&r<=B.LAST&&STAR_REL.includes(r);
const fmtHp=x=>{const v=Math.round(x*10)/10; return (v<0?'−':'')+String(Math.abs(v)).replace('.',',')};
const REDUCED=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
const STEP_MS=150;


const UI={figStyle:(()=>{try{return localStorage.getItem('helteludo.figurer')||'tegnet'}catch(e){return 'tegnet'}})(), gfx:(()=>{try{return localStorage.getItem('helteludo.grafik')||'auto'}catch(e){return 'auto'}})(), view:(()=>{try{return localStorage.getItem('helteludo.visning')==='3d'?'3d':'2d'}catch(e){return '2d'}})(), viewMsg:'', screen:'setup', mode:'local', sel:null, hover:null, confirm:null, rolledFlash:false, leveled:false,
  animSeen:null, animating:false, timer:null, committing:false, online:null, gameList:[], listUnsub:null, names:{}, asked:{},
  oc:{n:2, mine:0, kinds:{}}, codeInput:'', onlineMsg:''};
const NET={ready:false, db:null, user:null, uid:null, canWrite:null};
// Computerens tempo og tekststørrelse. Gemmes i browseren.
const SPEED={langsom:1.7,normal:1,hurtig:.45}, SPEED_TXT={langsom:'langsomt',normal:'normalt',hurtig:'hurtigt'};
const TEXTS={normal:1,stor:1.15,storst:1.3}, TEXT_TXT={normal:'normal',stor:'stor',storst:'størst'};
UI.speed=(()=>{try{return SPEED[localStorage.getItem('helteludo.tempo')]?localStorage.getItem('helteludo.tempo'):'normal'}catch(e){return 'normal'}})();
UI.text=(()=>{try{return TEXTS[localStorage.getItem('helteludo.tekst')]?localStorage.getItem('helteludo.tekst'):'normal'}catch(e){return 'normal'}})();
const aiF=()=>SPEED[UI.speed]||1;
function menuItems(game){
  const b=(act,label,pressed)=>`<button class="btn small" data-act="${act}"${pressed!=null?` aria-pressed="${pressed}"`:''}>${label}</button>`;
  return (game&&UI.view==='3d'?b('figstyle',`Figurer: ${UI.figStyle==='tegnet'?'tegnede':'3D'}`):'')+(game?b('gfx',`Grafik: ${({auto:'auto',hoj:'høj',lav:'lav'})[UI.gfx]}`):'')+
    b('speed',`Computeren spiller ${SPEED_TXT[UI.speed]}`)+b('textsize',`Tekst: ${TEXT_TXT[UI.text]}`)+
    b('music',MUSIC.on?'Musik: til':'Musik: fra',MUSIC.on)+b('sound',SFX.on?'Lyd: til':'Lyd: fra',SFX.on);
}
const menuHtml=game=>`<details class="tbmenu" id="tbmenu" ${UI.menuOpen?'open':''}><summary class="btn ghost small">Indstillinger</summary><div class="tbpop panel">${menuItems(game)}</div></details>`;

/* ---------- Roster (hold der lever videre mellem spil) ---------- */
const LS='helteludo.roster.v1';
// Fantasynavne til nye hold og brikker: fornavn + tilnavn, og et holdnavn der passer til holdets farve.
// (SEATS[s].team og .pieces er de gamle standardnavne; de bruges kun til at genkende og skifte dem ud.)
const FIRST_NAMES=['Aldrik','Brynja','Cedrik','Dagny','Eirik','Freja','Gorm','Hilde','Ivar','Jorun','Kael','Liv','Morwen','Njal','Oda','Ragnhild',
  'Sigurd','Thyra','Ulfrik','Vigdis','Ylva','Elowen','Faramund','Grimbart','Isolde','Lysander','Mira','Rowan','Talia','Torvald','Brom','Eldrid',
  'Fennik','Gwendolin','Halvar','Ingrid','Orla','Perrin','Runa','Silas','Tilde','Bjarke','Saga','Ragnar','Embla','Odin','Alva','Tyr'];
const EPITHETS=['Jernskæg','Stjerneglans','Dragebane','Ravnehjerte','Stormfod','Ulveklo','Skyggeløber','Lynsværd','Guldlok','Tågevandrer','Ildsjæl',
  'Stenhånd','Månestråle','Bjergbryder','Frostånde','Vindrytter','Sølvtunge','Bladsanger','Brandskæg','Natugle','Sortkappe','Gnistøje','Ørneblik',
  'Trolddrøm','Kobberskjold','Rimfrost','Ravnevinge','Egehjerte','Hjortespring','Tordenbrøl','Mosegroet','Flammehår',
  'den Modige','den Kloge','den Uheldige','den Frygtløse','den Lille','den Store','den Grumme','den Glemte'];
const TEAM_NAMES=[
  ['Ildrevens Orden','Drageklanen','Rubingarden','Flammeskjoldene','Røde Ravne'],
  ['Skovens Vogtere','Mosefolket','Smaragdlogen','Egeskjoldene','Grønne Drager'],
  ['Solridderne','Griffegarden','Ravstenslauget','Lynskjoldene','Gyldne Løver'],
  ['Havdragens Klan','Stormvagten','Safirordenen','Bølgeskjoldene','Blå Ugler']];
function fantasyName(used){
  // Helst både et nyt fornavn og et nyt tilnavn, så holdene ikke ligner hinanden.
  const parts=[...used].flatMap(n=>{const i=n.indexOf(' '); return i<0?[n]:[n.slice(0,i),n.slice(i+1)]});
  const freeF=FIRST_NAMES.filter(f=>!parts.includes(f)), freeE=EPITHETS.filter(e=>!parts.includes(e));
  for(let k=0;k<80;k++){const n=`${pick(freeF.length?freeF:FIRST_NAMES)} ${pick(freeE.length?freeE:EPITHETS)}`; if(n.length<=24&&!used.has(n)){used.add(n); return n}}
  return pick(FIRST_NAMES);
}
const rosterNames=()=>new Set(R?R.seats.flatMap(rs=>rs.pieces.map(p=>p.name)):[]);
function freshSeat(s,used=rosterNames()){return {name:pick(TEAM_NAMES[s]), pieces:[0,1,2,3].map(i=>({name:fantasyName(used), abil:{}, alloc:i<2?2:1, kind:''})), rolled:false, log:[], games:0, ai:false}}
function freshRoster(){const used=new Set(); return {n:4, seats:[0,1,2,3].map(s=>freshSeat(s,used))}}
// Nye navne til et hold (evnerne beholdes).
function renameSeat(s){
  const rs=R.seats[s], used=rosterNames(); rs.pieces.forEach(p=>used.delete(p.name));
  rs.name=pick(TEAM_NAMES[s].filter(n=>n!==rs.name)); rs.pieces.forEach(p=>{p.name=fantasyName(used)});
}
function loadRoster(){try{const j=JSON.parse(localStorage.getItem(LS)); if(j&&Array.isArray(j.seats)&&j.seats.length===4) return j}catch(e){} return {...freshRoster(), namesV:2}}
function saveRoster(){try{localStorage.setItem(LS, JSON.stringify(R))}catch(e){}}

function lookupHero(v){for(const [a,b,id] of HERO) if(v>=a&&v<=b) return id}
function canGain(abil,id){const c=abil[id]||0; return !c || (ABIL[id].lvl && c<4)}
function rollAbility(abil){
  const skipped=[];
  for(let g=0; g<80; g++){
    const a=d6(), b=d6(); let id=lookupHero(a*10+b); let txt=`Heltetabel ${a}${b}`;
    if(id==='@nord'){const x=d6()+d6(); id=NORD[x]; txt+=` → Nørdtabel ${x}`}
    else if(id==='@super'){const x=d6()+d6(); id=SUPER[x]; txt+=` → Superheltetabel ${x}`}
    if(id==='@valg') return {txt:txt+' → Vælg selv en evne', id, skipped};
    if(!canGain(abil,id)){skipped.push(ABIL[id].name); continue}
    return {txt:txt+` → ${ABIL[id].name}`, id, skipped};
  }
  return {txt:'Ingen ny evne fundet', id:null, skipped};
}
function gain(abil,id){abil[id]=(abil[id]||0)+1}
// Rul holdets 6 slag. auto = computeren vælger selv ved "Vælg selv".
function rollSeat(rs, auto){
  rs.log=[];
  rs.pieces.forEach((rp,i)=>{for(let k=0;k<rp.alloc;k++){const r=rollAbility(rp.abil); r.pi=i; applyRoll(rp,r,auto); if(!originOf(rp)||!rp.origin) rp.origin=originOf(rp); rs.log.push(r)}});
  rs.rolled=true;
}
function applyRoll(rp,r,auto){
  if(r.id==='@valg'){
    if(auto){const id=pick(['hurtig','sej','heldig','snigmorder','stjernehopper','turbo'].filter(x=>canGain(rp.abil,x))); if(id){gain(rp.abil,id); r.txt+=`: ${ABIL[id].name}`}}
    else r.pending=true;
  } else if(r.id) gain(rp.abil,r.id);
}
// Brikkens art bestemmes af den første evne, den slog på tabellen. Uden evner får den en tilfældig art.
const ABIL_KIND={sej:'dvaerg',kampivrig:'dvaerg',kommandosoldat:'dvaerg', stifinder:'elver',globetrotter:'elver',booster:'elver',
  draeber:'ork',vatarm:'ork', heldig:'nisse',uheldig:'nisse',bakgear:'nisse', hjemve:'trold',kryster:'trold', hypnotisor:'troldmand',forbandet:'troldmand',
  regeneration:'skelet',neurotiker:'skelet', bersaerk:'minotaur',aerkefjende:'minotaur', stjernehopper:'fe',aura:'fe', turbo:'drage',selvantaendelig:'drage',
  atlet:'kat',hojdespringer:'kat', hurtig:'faun',pacifist:'faun', usynlighed:'spoegelse',ingenstedsans:'spoegelse', bredskuldret:'golem',langsom:'golem',
  snigmorder:'varulv',haevner:'varulv', malsogende:'kyklop',hovmodig:'kyklop'};
const originOf=rp=>rp.origin&&rp.abil[rp.origin]?rp.origin:Object.keys(rp.abil)[0]||null;
const kindOfRoster=rp=>{const o=originOf(rp); return o?ABIL_KIND[o]||'':''};
const teamData=rs=>({name:rs.name, pieces:rs.pieces.map(p=>({name:p.name, abil:{...p.abil}, kind:kindOfRoster(p)}))});

/* ---------- Game state helpers ---------- */
// Spilindstillinger: computerens niveau, artsgaver og husregler. Gemmes med holdene og følger med hvert spil.
// v: indstillingernes version. Ved v2 blev "stjernehop i mål fra næstsidste stjerne" slået fra som standard.
const DEF_OPTS={v:2, aiLevel:'normal', house:{globePoint:true, altExtra:false, loseWhole:false, starGoal:false}};
const OPTS=()=>(S&&S.opts)||DEF_OPTS;
const house=k=>{const h=OPTS().house||{}; return k in h?h[k]:DEF_OPTS.house[k]};
const lv=(p,a)=>p.abil[a]||0;
const team=()=>S.teams[S.cur];
const allPieces=()=>S.teams.flatMap(t=>t.pieces);
const pc=id=>{const [t,i]=id.split('-').map(Number); return S.teams[t].pieces[i]};
const seatOf=p=>S.teams[p.team].seat;
const absOf=p=>relAbs(seatOf(p),p.rel);
const onBoard=q=>q.state==='track'&&!q.raid&&q.rel>=-1&&q.rel<=B.LAST;
const visibleAt=(a,ex)=>allPieces().filter(q=>q!==ex&&onBoard(q)&&!q.invisible&&absOf(q)===a);
const extraFace=t=>t.curse||6;
const inPlay=t=>t.pieces.some(p=>['track','regen','air'].includes(p.state));
const circDist=(a,b)=>Math.min(mod(a-b,B.TL),mod(b-a,B.TL));
function log(txt, ti){S.log.unshift({txt, ti:ti??null}); if(S.log.length>100) S.log.length=100}
// En kort tekst, der svæver op fra brikken, når en evne slår til. Ligger i spillets tilstand, så alle skærme ser den.
function pop(p,txt,k='good'){S.popSeq=(S.popSeq||0)+1; (S.pops=S.pops||[]).push({n:S.popSeq,pt:piecePos(p).pt,txt,k}); if(S.pops.length>12) S.pops.shift()}
function once(p,k,fn){const key=p.id+k; if(!(key in S.cache)) S.cache[key]=fn(); return S.cache[key]}

// config: [{seat, name, pieces:[{name,abil}], ai, uid}]
function newGame(config,opts){
  const triBoard=config.length===3&&config.every((c,i)=>c.seat===i);
  useBoard(triBoard?'tri':'quad');
  S={board:triBoard?'tri':'quad', teams:config.map((c,ti)=>({seat:c.seat, name:c.name, curse:0, ai:!!c.ai, uid:c.uid||null,
      pieces:c.pieces.map((p,i)=>({id:`${ti}-${i}`, team:ti, idx:i, name:p.name, abil:{...p.abil}, kind:p.kind||'', state:'base', rel:-1, lap:0, hp:0,
        knocked:false, hasLeft:false, frozen:0, aura:false, invisible:false, wait:0, airRel:null, nemeses:[], hates:null,
        used:{heldig:0,booster:0,selv:0,regen:0,uh:{}}, raid:null, st:{knocks:0,knocked:0,goals:0,homeruns:0}}))})),
    rollSeq:0, cur:0, phase:'roll', raw:null, rollsLeft:0, options:[], restrict:null, boost:null, cache:{}, firstGoal:false,
    finished:[], log:[], over:false, msg:'', forced:'', turnId:0, anim:null, opts:clone(opts||DEF_OPTS), gameId:Math.random().toString(36).slice(2,10)};
  log('Spillet begynder. Held og lykke, helte!');
  // Brikker uden valgt art får en tilfældig, og så vidt muligt en art, ingen anden brik har i spillet.
  const taken=new Set(allPieces().map(p=>p.kind).filter(Boolean));
  allPieces().forEach(p=>{if(KINDS.some(k=>k.id===p.kind)) return; const free=KINDS.filter(k=>!taken.has(k.id)); p.kind=pick(free.length?free:KINDS).id; taken.add(p.kind)});
  S.teams.forEach((t,ti)=>t.pieces.forEach(p=>{
    if(lv(p,'forbandet') && !t.curse){t.curse=d6(); log(`${p.name} er forbandet. ${t.name} slår ekstra på ${t.curse}'ere i stedet for 6'ere.`, ti)}
    if(lv(p,'aerkefjende')){const opp=S.teams.map((_,i)=>i).filter(i=>i!==ti); p.hates=pick(opp); log(`${p.name} har fået ${S.teams[p.hates].name} som ærkefjende.`, ti)}
  }));
  UI.leveled=false; UI.animSeen=null; UI.rollSeen=0; UI.popSeen=0; UI.undo=null; stopAnim();
  startTurn(0);
}

function startTurn(ti){
  S.cur=ti; S.turnId++;
  const t=team();
  S.restrict=null; S.boost=null; S.raw=null; S.options=[]; S.cache={}; S.forced='';
  UI.sel=null; UI.hover=null;
  for(const p of t.pieces){
    p.aura=false;
    if(p.state==='regen'){ if(p.wait>0) p.wait--; else {p.state='track'; log(`${p.name} har regenereret og er tilbage på sit felt.`, p.team)} }
  }
  for(const p of t.pieces) if(p.state==='air'){
    p.state='track'; p.rel=p.airRel; p.airRel=null; log(`${p.name} lander efter sit højdespring.`, p.team);
    visibleAt(absOf(p),p).filter(q=>q.team!==p.team&&!q.aura).forEach(q=>sendHome(q,[p]));
  }
  S.rollsLeft=inPlay(t)?1:3;
  S.phase='roll';
  S.msg=S.rollsLeft===3?'Ingen brikker i spil. Der er 3 forsøg på at slå en 6\'er.':'Slå terningen.';
}

function effMove(p,raw){
  let v=raw+lv(p,'hurtig')-lv(p,'langsom');
  if(S.boost&&S.boost.pid===p.id) v+=S.boost.v;
  return Math.max(0,v);
}
function hovmod(p){
  if(!lv(p,'hovmodig')) return false;
  return once(p,'hov',()=>{const r=d6(), y=r>=6-lv(p,'hovmodig'); log(`Hovmodig (${p.name}) slår ${r}${y?': den vil lige løbe en omgang til!':' og går pænt mod mål.'}`, p.team); return y});
}
function walk(p,start,n,dir){
  let rel=start, lap=0, d=dir; const path=[];
  for(let i=0;i<n;i++){
    if(d>0){
      if(rel===B.LAST && hovmod(p)){rel=-1; lap++}
      else if(rel===B.GOAL){d=-1; rel=B.GOAL-1}
      else rel++;
    } else rel--;
    if(i<n-1) path.push(rel);
  }
  return {rel,lap,path};
}
function blocked(p,path){
  if(S.raw===6) return false;
  return path.some(r=>r>=-1&&r<=B.LAST&&visibleAt(relAbs(seatOf(p),r),p).some(q=>lv(q,'bredskuldret')));
}
function outcomeAt(p,rel){
  if(rel>B.LAST&&rel<B.GOAL){
    // En kommandosoldat, der hærger i vores målområde, kan slås hjem af os.
    const raiders=allPieces().filter(q=>q.raid&&q.raid.seat===seatOf(p)&&q.raid.d===rel-B.LAST&&!q.invisible&&q.state==='track');
    if(!raiders.length) return {type:'safe'};
    return raiders.length>=2?{type:'bounce',who:raiders,why:'mur'}:{type:'knock',who:raiders};
  }
  if(rel<-1||rel>B.LAST) return {type:'safe'};
  const seat=seatOf(p), a=relAbs(seat,rel);
  const occ=visibleAt(a,p).filter(q=>q.team!==p.team);
  if(!occ.length) return {type:'free'};
  if(a===13*seat){const who=occ.filter(q=>!q.aura); return who.length?{type:'knock',who}:{type:'free'}}
  if(occ.length>=2) return {type:'bounce',who:occ,why:'mur'};
  const q=occ[0];
  if(q.aura) return {type:'bounce',who:[q],why:'aura'};
  if(GLOBE_ABS.has(a)){
    const theirStart=a===13*seatOf(q);
    if(lv(p,'snigmorder')||(theirStart&&lv(p,'kommandosoldat'))) return {type:'knock',who:[q]};
    return {type:'bounce',who:[q],why:'globus'};
  }
  return {type:'knock',who:[q]};
}
function landVariants(p,rel){
  if(isStarRel(rel)){
    const out=[];
    if(rel!==B.LAST && outcomeAt(p,rel).type==='knock') out.push({rel,stay:true,note:'bliver på stjernen'});
    let target;
    if(rel===B.LAST) target=B.GOAL;
    else {const j=STAR_REL.indexOf(rel)+(lv(p,'stjernehopper')?2:1), last=STAR_REL.length-1; target=j>last?B.GOAL:j===last?(house('starGoal')?B.GOAL:B.LAST):STAR_REL[j]}
    out.push({rel:target, note:target===B.GOAL?'stjernehop i mål':'stjernehop', air:lv(p,'hojdespringer')&&target!==B.GOAL});
    return out;
  }
  if(lv(p,'globetrotter')&&isGlobeRel(rel)){
    const i=GLOBE_REL.indexOf(rel); const target=i===GLOBE_REL.length-1?B.GOAL:GLOBE_REL[i+1];
    return [{rel:target,note:'globetrotter'}];
  }
  return [{rel}];
}
// Udfaldet bliver gemt som id'er, så det kan sendes over nettet.
function outIds(out){return out&&out.who?{...out,who:out.who.map(q=>q.id)}:out}
function pushVariants(opts,p,plan,n,dir,meta){
  const vs=dir>0?landVariants(p,plan.rel):[{rel:plan.rel}];
  for(const v of vs){
    const o={pid:p.id,kind:'move',n,dir,rel:v.rel,land:plan.rel,lap:plan.lap,path:plan.path,air:!!v.air,stay:!!v.stay,tag:meta.tag||'',note:v.note||''};
    o.out=outIds(v.air?{type:'air'}:v.rel===B.GOAL?{type:'goal'}:outcomeAt(p,v.rel));
    if(meta.mustKnock&&o.out.type!=='knock') continue;
    opts.push(o);
  }
}
function addFwd(opts,p,n,meta){
  const plan=walk(p,p.rel,n,1);
  if(blocked(p,plan.path)) return;
  pushVariants(opts,p,plan,n,1,meta);
  if(!meta.mustKnock && lv(p,'atlet') && plan.rel>=0 && plan.rel<=B.LAST && visibleAt(relAbs(seatOf(p),plan.rel),p).length){
    const p2=walk(p,plan.rel,n,1);
    const path=[...plan.path,plan.rel,...p2.path];
    if(!blocked(p,path)) pushVariants(opts,p,{rel:p2.rel,lap:plan.lap+p2.lap,path},n*2,1,{tag:'Atlet: springer buk'});
  }
}
// Kommandosoldat: kan svinge ind i en modstanders målområde, hvis den passerer deres indløb, og hærge der.
const entryAbs=q=>relAbs(q,B.LAST);
function raidDepth(r){return r<=5?r:r<=9?10-r:0}
function addRaids(opts,p,n){
  if(!lv(p,'kommandosoldat')||p.raid) return;
  const s=seatOf(p), seq=walk(p,p.rel,n,1), cells=[...seq.path,seq.rel];
  for(let k=0;k<cells.length-1;k++){
    const r=cells[k]; if(r<0||r>B.LAST) continue;
    const a=relAbs(s,r), q=S.teams.find(t=>t.seat!==s&&entryAbs(t.seat)===a); if(!q) continue;
    const rest=n-(k+1), d=raidDepth(rest); if(!d) continue;
    if(blocked(p,cells.slice(0,k))) continue;
    const o={pid:p.id,kind:'raid',rel:r,q:q.seat,d,dir:rest<5?1:-1,n,path:cells.slice(0,k),tag:`Kommandosoldat: ind i ${q.name}s målområde`};
    o.out=outIds(raidOutcome(p,q.seat,d)); opts.push(o);
  }
}
function raidOutcome(p,qs,d){
  const owners=allPieces().filter(x=>x.team!==p.team&&seatOf(x)===qs&&x.state==='track'&&!x.raid&&x.rel===B.LAST+d&&!x.invisible);
  const others=allPieces().filter(x=>x!==p&&x.team!==p.team&&x.raid&&x.raid.seat===qs&&x.raid.d===d&&!x.invisible);
  const occ=[...owners,...others];
  if(!occ.length) return {type:'safe'};
  return occ.length>=2?{type:'bounce',who:occ,why:'mur'}:{type:'knock',who:occ};
}
// Gå i et fremmed målområde: ind til bunden, vend og ud igen. Kommer brikken ud, går den videre på banen.
function raidWalk(p,n){
  let d=p.raid.d, dir=p.raid.dir||1; const cells=[];
  for(let i=0;i<n;i++){
    if(dir>0){if(d<5) d++; else {dir=-1; d--}} else d--;
    if(d<=0){const w=walk(p,p.rel,n-i-1,1); return {out:true,rel:n-i-1>0?w.rel:p.rel,lap:n-i-1>0?w.lap:0,cells,trackPath:n-i-1>0?w.path:[]}}
    cells.push(d);
  }
  return {out:false,d,dir,cells};
}
function raidOptions(opts,p){
  const eff=effMove(p,S.raw); if(eff<1) return;
  const w=raidWalk(p,eff), qs=p.raid.seat, qn=S.teams.find(t=>t.seat===qs).name;
  if(w.out){const o={pid:p.id,kind:'raidmove',n:eff,exit:true,rel:w.rel,lap:w.lap,cells:w.cells,path:w.trackPath,tag:`ud af ${qn}s målområde`};
    o.out=outIds(w.rel===B.GOAL?{type:'goal'}:outcomeAt(p,w.rel)); opts.push(o)}
  else {const o={pid:p.id,kind:'raidmove',n:eff,exit:false,d:w.d,dir:w.dir,cells:w.cells,tag:`hærger i ${qn}s målområde`}; o.out=outIds(raidOutcome(p,qs,w.d)); opts.push(o)}
}
function resolveRaid(p){
  const out=raidOutcome(p,p.raid.seat,p.raid.d);
  if(out.type==='bounce'){log(`${p.name} løber ind i en mur i målområdet og ryger selv hjem.`,p.team); sendHome(p,out.who); return}
  if(out.type==='knock') for(const q of out.who){if(p.state!=='track') break; attack(p,q)}
}
function addBack(opts,p,n,tag){
  const plan=walk(p,p.rel,n,-1);
  if(plan.rel<0||blocked(p,plan.path)) return;
  pushVariants(opts,p,plan,n,-1,{tag});
}
function neuroOk(p,t){
  if(!lv(p,'neurotiker')||p.hasLeft) return true;
  if(t.pieces.filter(q=>q.state==='base').length>1) return true;
  return t.pieces.every(q=>q===p||q.state==='goal');
}
function blastVictims(p){const a=absOf(p); return allPieces().filter(q=>onBoard(q)&&(q===p||(!q.invisible&&!q.aura))&&circDist(absOf(q),a)<=3)}
function homingTarget(p){
  const s=seatOf(p); let best=null;
  for(const q of allPieces()){
    if(q.team===p.team||!onBoard(q)||q.invisible) continue;
    const tr=mod(absOf(q)-1-13*s,B.TL);
    if(tr>=0&&tr<p.rel&&(!best||tr>best.rel)) best={q,rel:tr};
  }
  return best;
}
function chaseTarget(p){
  const my=absOf(p);
  return allPieces().find(q=>{
    if(q.team===p.team||!onBoard(q)||q.invisible) return false;
    const hated=(lv(p,'haevner')&&p.nemeses.includes(q.id))||(lv(p,'aerkefjende')&&q.team===p.hates);
    if(!hated) return false;
    const a=absOf(q), d=mod(a-my,B.TL);
    return Math.floor(a/13)===Math.floor(my/13)&&d>=1&&d<=12;
  });
}
function forcedPieces(opts){
  const t=team(), ids=new Set(opts.filter(o=>['move','exit','raid','raidmove'].includes(o.kind)).map(o=>o.pid)), out=[];
  for(const p of t.pieces){
    if(!ids.has(p.id)) continue;
    if(p.state==='base'&&lv(p,'neurotiker')&&p.hasLeft&&t.pieces.filter(q=>q.state==='base').length===1) out.push({p,why:`${p.name} er neurotisk og vil ikke være alene hjemme`});
    if(onBoard(p)){const prey=chaseTarget(p); if(prey) out.push({p,why:`${p.name} skal jage ${prey.name}`})}
  }
  return out;
}

function computeOptions(){
  const t=team(), raw=S.raw; let opts=[];
  for(const p of t.pieces){
    if(S.restrict&&S.restrict!==p.id) continue;
    if(p.frozen>0) continue;
    if(p.state==='base'){
      if(raw+lv(p,'kampivrig')>=6&&neuroOk(p,t)) opts.push({pid:p.id,kind:'exit',rel:0,out:outIds(outcomeAt(p,0)),tag:raw<6?`Kampivrig +${lv(p,'kampivrig')}`:''});
      continue;
    }
    if(p.state!=='track') continue;
    if(p.raid){raidOptions(opts,p); continue}
    if(p.rel<=B.LAST){
      if(lv(p,'aura')&&!p.aura) opts.push({pid:p.id,kind:'aura'});
      if(lv(p,'usynlighed')&&!p.invisible) opts.push({pid:p.id,kind:'invis'});
      if(lv(p,'selvantaendelig')>p.used.selv) opts.push({pid:p.id,kind:'explode',n:blastVictims(p).length-1});
      if(lv(p,'malsogende')){const h=homingTarget(p); if(h) opts.push({pid:p.id,kind:'homing',rel:h.rel,tq:h.q.id})}
    }
    if(lv(p,'kryster')&&isGlobeRel(p.rel)&&raw!==6){once(p,'kry',()=>{log(`${p.name} er en kryster og tør ikke forlade globussen uden en 6'er.`,p.team);return 1}); continue}
    const eff=effMove(p,raw);
    const ns=new Set(); if(eff>=1) ns.add(eff);
    if(lv(p,'stifinder')){if(eff-1>=1) ns.add(eff-1); ns.add(eff+1)}
    const confused=lv(p,'ingenstedsans')&&ns.size?once(p,'conf',()=>{const r=d6(), y=r>=7-lv(p,'ingenstedsans'); log(`Ingen stedsans (${p.name}) slår ${r}${y?' og er forvirret. Den kan kun gå baglæns.':' og finder vej.'}`,p.team); return y}):false;
    for(const n of ns){
      const tag=n!==eff?`Stifinder ${n>eff?'+1':'−1'}`:'';
      if(confused){addBack(opts,p,n,'Forvirret'); continue}
      addFwd(opts,p,n,{tag});
      if(!tag) addRaids(opts,p,n);
      if(lv(p,'bakgear')&&p.rel<=B.LAST) addBack(opts,p,n,'Bakgear');
      if(lv(p,'hjemve')&&p.rel>B.LAST) addBack(opts,p,n,'Hjemve');
    }
    if(!confused&&eff>=1) for(let k=1;k<=lv(p,'draeber');k++) addFwd(opts,p,eff+k,{tag:`Dræber +${k}`,mustKnock:true});
  }
  const seen=new Set();
  opts=opts.filter(o=>{const k=[o.pid,o.kind,o.dir,o.rel,o.air,o.stay,o.q,o.d].join('|'); if(seen.has(k)) return false; seen.add(k); return true});
  S.forced='';
  const f=forcedPieces(opts);
  if(f.length){const ids=new Set(f.map(x=>x.p.id)); opts=opts.filter(o=>ids.has(o.pid)&&['move','exit','raid','raidmove'].includes(o.kind)); S.forced=f.map(x=>x.why).join(' · ')}
  return opts;
}

function rerollActions(){
  const t=team(), acts=[];
  if(S.phase!=='choose') return acts;
  for(const p of t.pieces){
    if(p.state==='goal') continue;
    const h=lv(p,'heldig')-p.used.heldig;
    if(h>0) acts.push({kind:'heldig',pid:p.id,label:`Heldig: ${p.name} slår om (${h} tilbage)`});
    const b=lv(p,'booster')-p.used.booster;
    if(b>0&&!S.boost&&p.state==='track'&&p.frozen===0&&(!S.restrict||S.restrict===p.id)) acts.push({kind:'booster',pid:p.id,label:`Boost: ekstra terning til ${p.name} (${b} tilbage)`});
    const L=lv(p,'uheldig');
    if(L&&S.options.some(o=>o.pid===p.id)&&(!S.restrict||S.restrict===p.id)) S.teams.forEach((ot,ti)=>{
      if(ti===S.cur||ot.ai) return; const left=L-((p.used.uh||{})[ti]||0);
      if(left>0) acts.push({kind:'uheldig',pid:p.id,by:ti,label:`${ot.name}: tving ${p.name} til at slå om (${left} tilbage)`});
    });
  }
  return acts;
}

/* ---------- Actions ---------- */
function doRoll(){
  if(!S||S.phase!=='roll') return;
  S.raw=d6(); S.rollsLeft--; S.cache={}; S.boost=null; UI.undo=null;
  log(`${team().name} slår ${S.raw}.`, S.cur);
  UI.rolledFlash=true; S.rollSeq=(S.rollSeq||0)+1;
  afterRollCompute();
}
function afterRollCompute(){
  const t=team();
  S.options=computeOptions(); UI.sel=null; UI.hover=null;
  if(S.options.length){S.phase='choose'; S.msg=S.restrict?`Slaget skal bruges af ${pc(S.restrict).name}.`:'Vælg et træk: klik på en brik eller et træk herunder.'; return}
  if(S.rollsLeft>0&&S.raw!==extraFace(t)){S.phase='roll'; S.msg=`Ingen træk. Slå igen (${S.rollsLeft} forsøg tilbage).`; return}
  if(S.raw===extraFace(t)){S.phase='roll'; S.rollsLeft=Math.max(S.rollsLeft,1); S.restrict=null; S.msg=`Ingen træk, men en ${S.raw}'er giver et nyt slag.`; return}
  S.phase='choose';
  if(rerollActions().length){S.msg='Ingen mulige træk. Brug en evne, eller afslut turen.'; return}
  S.phase='done'; S.msg='Ingen mulige træk.';
}
function useReroll(i){
  const a=rerollActions()[i]; if(!a) return;
  const p=pc(a.pid); UI.undo=null;
  if(a.kind==='heldig'){p.used.heldig++; S.raw=d6(); S.cache={}; S.boost=null; S.restrict=p.id; log(`${p.name} er heldig og slår om: ${S.raw}.`, p.team); pop(p,`Heldig! Slår om: ${S.raw}`)}
  if(a.kind==='booster'){p.used.booster++; S.boost={pid:p.id,v:d6()}; S.restrict=p.id; log(`${p.name} booster og slår en ekstra terning: +${S.boost.v}.`, p.team); pop(p,`Booster: +${S.boost.v}`)}
  if(a.kind==='uheldig'){p.used.uh=p.used.uh||{}; p.used.uh[a.by]=(p.used.uh[a.by]||0)+1; S.raw=d6(); S.cache={}; S.boost=null; S.restrict=p.id; log(`${p.name} er uheldig. ${S.teams[a.by].name} kræver omslag: ${S.raw}, og ${p.name} skal bruge det.`, p.team); pop(p,`Uheldig! Slår om: ${S.raw}`,'bad')}
  UI.rolledFlash=true; S.rollSeq=(S.rollSeq||0)+1;
  afterRollCompute();
}

function sendHome(q,by){
  if(q.used.regen<lv(q,'regeneration')){
    pop(q,'Regenererer!');
    q.used.regen++; q.state='regen'; q.wait=1; q.aura=false; q.invisible=false; q.raid=null;
    log(`${q.name} regenererer! Står over en tur og kommer så tilbage til samme felt.`, q.team); return;
  }
  pop(q,'Slået hjem!','bad');
  q.raid=null; q.st.knocked++;
  q.state='base'; q.rel=-1; q.lap=0; q.knocked=true; q.aura=false; q.invisible=false; q.frozen=0; q.airRel=null;
  q.hp-=1;
  const foes=by.filter(b=>b.team!==q.team);
  foes.forEach(b=>{b.hp+=1/foes.length; b.st.knocks+=1/foes.length});
  if(lv(q,'haevner')) foes.forEach(b=>{if(!q.nemeses.includes(b.id)) q.nemeses.push(b.id)});
  log(`${q.name} ryger hjem${foes.length?` (slået af ${foes.map(b=>b.name).join(' og ')})`:''}.`, q.team);
}
function attack(p,q){
  if(lv(p,'vatarm')){const r=d6(); if(r>=7-lv(p,'vatarm')){pop(p,'Vatarm! Falder selv om','bad'); log(`Vatarm! ${p.name} slår ${r} og falder selv om.`,p.team); sendHome(p,[q]); return false}}
  if(lv(q,'sej')){const r=d6(); if(r>=7-lv(q,'sej')){pop(q,'Sej! Angriberen ryger hjem'); log(`${q.name} er sej og slår ${r}. Angriberen ryger hjem!`,q.team); sendHome(p,[q]); return false}}
  sendHome(q,[p]); return true;
}
function resolveLanding(p){
  const out=outcomeAt(p,p.rel);
  if(out.type==='bounce'){pop(p,out.why==='mur'?'En mur!':out.why==='aura'?'Aura!':'Globus!','bad'); log(`${p.name} lander på ${out.why==='mur'?'en mur':out.why==='aura'?'en brik med aura':'en globus med en modstander'} og ryger selv hjem.`,p.team);
    sendHome(p,out.why==='mur'||house('globePoint')?out.who:[]); return}
  if(out.type==='knock') for(const q of out.who){if(p.state!=='track') break; attack(p,q)}
}
function pacifistRefuses(p,o){
  if(!lv(p,'pacifist')||!o.out||o.out.type!=='knock') return false;
  const r=d6(); if(r>=6-lv(p,'pacifist')){pop(p,'Pacifist: nægter!','info'); log(`${p.name} er pacifist, slår ${r} og nægter at slå nogen hjem. Den bliver stående.`,p.team); return true}
  return false;
}
function passEffects(p,o){
  const bz=lv(p,'bersaerk'), hy=lv(p,'hypnotisor');
  if(!bz&&!hy) return;
  const s=seatOf(p), cells=[...new Set(o.path.filter(r=>r>=-1&&r<=B.LAST).map(r=>relAbs(s,r)))];
  for(const a of cells) for(const q of visibleAt(a,p)){
    if(bz&&!q.aura){const r=d6(); if(r>=7-bz){pop(q,'Trampet ned af bersærk!','bad'); log(`Bersærk! ${p.name} tramper på ${q.name} (slog ${r}).`,p.team); sendHome(q,q.team!==p.team?[p]:[]); continue}}
    if(hy&&q.team!==p.team&&onBoard(q)){const r=d6(); if(r>=7-hy){q.frozen=d6(); pop(q,`Hypnotiseret i ${q.frozen} runder`,'info'); log(`${p.name} hypnotiserer ${q.name} (slog ${r}). Lammet i ${q.frozen} runder.`,p.team)}}
  }
}
function explode(p){
  p.used.selv++;
  const vs=blastVictims(p);
  pop(p,'BOOM!','bad'); log(`BOOM! ${p.name} eksploderer.`, p.team);
  vs.filter(q=>q!==p).forEach(q=>sendHome(q,q.team!==p.team?[p]:[]));
  sendHome(p,[]);
}
function reachGoal(p){
  p.state='goal'; p.rel=B.GOAL; p.invisible=false; p.aura=false;
  let pts=0; const why=[];
  if(!S.firstGoal){S.firstGoal=true; S.firstGoalPid=p.id; pts+=1; why.push('første i mål +1')}
  if(!p.knocked){pts+=2; why.push('homerun +2'); if(p.lap){pts+=p.lap; why.push(`ekstra omgang +${p.lap}`)}}
  p.hp+=pts; p.st.goals++; if(!p.knocked) p.st.homeruns++;
  pop(p,`I mål!${pts?` +${String(pts).replace('.',',')} ★`:''}`);
  log(`${p.name} er i mål!${why.length?` (${why.join(', ')})`:''}`, p.team);
  const t=S.teams[p.team];
  if(t.pieces.every(q=>q.state==='goal')&&!S.finished.includes(p.team)){
    S.finished.push(p.team);
    if(S.finished.length===1){t.pieces.forEach(q=>q.hp+=1); log(`${t.name} vinder spillet! +1 heltepoint til hele holdet.`, p.team)}
    else log(`${t.name} er i mål som nr. ${S.finished.length}.`, p.team);
    const left=S.teams.map((_,i)=>i).filter(i=>!S.finished.includes(i));
    if(left.length<=1){S.finished.push(...left); S.over=true}
  }
}
// Felterne brikken går igennem, så den kan animeres felt for felt på alle skærme.
function animSteps(p,o){
  const s=seatOf(p);
  if(o.kind!=='move') return [];
  const rels=[...o.path,o.land]; if(o.rel!==o.land) rels.push(o.rel);
  return rels.map(r=>relPt(s,r));
}
function execute(i){
  if(!S||S.phase!=='choose') return;
  const o=S.options[i]; if(!o) return;
  const p=pc(o.pid); let moved=false;
  S.phase='busy'; UI.sel=null; UI.hover=null; UI.info=null;
  S.anim={seq:(S.anim?S.anim.seq:0)+1, pid:p.id, steps:animSteps(p,o), ai:!!team().ai};
  const before={}; allPieces().forEach(q=>{if(onBoard(q)) before[q.id]=piecePos(q).pt});
  switch(o.kind){
    case 'aura': p.aura=true; pop(p,'Aura','info'); log(`${p.name} tænder sin aura og står i sikkerhed til næste tur.`,p.team); break;
    case 'invis': p.invisible=true; pop(p,'Usynlig','info'); log(`${p.name} bliver usynlig.`,p.team); break;
    case 'explode': explode(p); break;
    case 'homing': p.rel=o.rel; p.invisible=false; pop(p,'Målsøgende!','info'); log(`${p.name} teleporterer sig ind lige bag ${pc(o.tq).name}.`,p.team); break;
    case 'exit':
      if(pacifistRefuses(p,o)) break;
      p.state='track'; p.rel=0; p.hasLeft=true; log(`${p.name} kommer ud på brættet.`,p.team);
      resolveLanding(p); moved=true; break;
    case 'raid': {
      if(pacifistRefuses(p,o)){S.anim.steps=[]; break}
      const s=seatOf(p); S.anim.steps=[...o.path.map(r=>relPt(s,r)),relPt(s,o.rel),...Array.from({length:o.d},(_,i)=>STRETCH[o.q][i])];
      p.invisible=false; p.rel=o.rel; p.raid={seat:o.q,d:o.d,dir:o.dir};
      log(`${p.name} svinger ind og hærger i ${S.teams.find(t=>t.seat===o.q).name}s målområde.`,p.team);
      resolveRaid(p); moved=true; break}
    case 'raidmove': {
      if(pacifistRefuses(p,o)){S.anim.steps=[]; break}
      const qs=p.raid.seat, s=seatOf(p);
      S.anim.steps=o.cells.map(d=>STRETCH[qs][d-1]);
      if(o.exit){S.anim.steps.push(relPt(s,p.rel),...o.path.map(r=>relPt(s,r))); if(o.rel!==p.rel) S.anim.steps.push(relPt(s,o.rel));
        p.raid=null; p.lap+=o.lap; p.rel=o.rel; log(`${p.name} forlader målområdet igen.`,p.team);
        if(p.rel===B.GOAL) reachGoal(p); else resolveLanding(p)}
      else {p.raid.d=o.d; p.raid.dir=o.dir; resolveRaid(p)}
      moved=true; break}
    case 'move':
      if(pacifistRefuses(p,o)){S.anim.steps=[]; break}
      p.invisible=false;
      passEffects(p,o);
      if(p.state!=='track') break;
      p.lap+=o.lap;
      if(o.air){p.state='air'; p.airRel=o.rel; p.st.stars=(p.st.stars||0)+1; pop(p,'Højdespring!','info'); log(`${p.name} springer højt fra stjernen og lander i næste tur.`,p.team); moved=true; break}
      p.rel=o.rel;
      if(o.note) log(`${p.name}: ${o.note}.`,p.team);
      if(/stjernehop/.test(o.note)){p.st.stars=(p.st.stars||0)+1; if(o.rel!==B.GOAL) pop(p,'Stjernehop!')}
      if(o.note==='globetrotter') pop(p,'Globetrotter!');
      if(p.rel===B.GOAL) reachGoal(p); else resolveLanding(p);
      moved=true; break;
  }
  S.anim.hits=allPieces().filter(q=>before[q.id]&&(q.state==='base'||q.state==='regen')).map(q=>before[q.id]);
  S.anim.end=['move','exit','homing','raid','raidmove'].includes(o.kind)&&['track','goal','air'].includes(p.state)?piecePos(p).pt:null;
  S.anim.goal=p.state==='goal'&&o.kind!=='explode'; S.anim.boom=o.kind==='explode';
  S.anim.jump=o.kind==='move'&&!o.stay&&o.rel!==o.land&&p.state!=='base'?[relPt(seatOf(p),o.land),relPt(seatOf(p),o.rel)]:null;
  finishAction(p,o,moved);
}
function finishAction(p,o,moved){
  if(S.over){S.phase='over'; S.msg=''; return}
  const t=team();
  if(S.finished.includes(S.cur)||(!['move','exit','raid','raidmove'].includes(o.kind)&&!house('altExtra'))) return endTurn();
  if(S.raw===extraFace(t)){S.phase='roll'; S.rollsLeft=inPlay(t)?1:3; S.restrict=null; S.boost=null; S.options=[]; S.msg=`${S.raw}'er! Slå igen.`; return}
  if(moved&&['move','raid','raidmove'].includes(o.kind)&&lv(p,'turbo')&&p.state==='track'&&S.raw>=6-lv(p,'turbo')){
    S.phase='roll'; S.rollsLeft=1; S.restrict=p.id; S.boost=null; S.options=[]; S.msg=`Turbo! ${p.name} slår igen og skal selv bruge slaget.`; log(`Turbo: ${p.name} får et ekstra slag.`,p.team); pop(p,'Turbo! Slår igen'); return}
  endTurn();
}
function endTurn(){
  if(S.over){S.phase='over'; return}
  for(const p of team().pieces) if(p.frozen>0) p.frozen--;
  let n=S.cur;
  for(let k=0;k<S.teams.length;k++){n=(n+1)%S.teams.length; if(!S.finished.includes(n)) break}
  startTurn(n);
}

/* ---------- Computer opponent ---------- */
// Hvor mange modstandere kan ramme feltet i næste runde?
function threatAt(p,rel){
  if(rel<0||rel>B.LAST) return 0;
  const a=relAbs(seatOf(p),rel);
  if(GLOBE_ABS.has(a)) return 0;
  let n=0;
  for(const q of allPieces()){
    if(q.team===p.team) continue;
    if(onBoard(q)&&!q.invisible){const d=mod(a-absOf(q),B.TL); if(d>=1&&d<=6) n+=1; else if(d>=7&&d<=12) n+=.25}
    else if(q.state==='base'&&a===13*seatOf(q)) n+=.4;
  }
  return n;
}
function scoreOpt(o){
  const hard=OPTS().aiLevel==='svaer', p=pc(o.pid), from=p.state==='base'?-6:p.rel;
  if(o.kind==='raid'||o.kind==='raidmove'){const out=o.out||{}; return (out.type==='knock'?55:out.type==='bounce'?-90:-6)+(o.exit?((o.rel===B.GOAL?B.GOAL+1:o.rel)-p.rel)*1.2:0)+(out.type==='goal'?120:0)}
  switch(o.kind){
    case 'exit': return 32+(inPlay(team())?0:25)+(o.out&&o.out.type==='knock'?35:0);
    case 'aura': case 'invis': return threatAt(p,p.rel)*(hard?22:16)-8;
    case 'explode': {const v=blastVictims(p).filter(q=>q!==p), opp=v.filter(q=>q.team!==p.team).length; return opp*32-(v.length-opp)*40-20-p.rel*.4}
    case 'homing': return -25;
  }
  let s=0; const to=o.rel, out=o.out||{};
  if(out.type==='goal') s+=120;
  if(out.type==='knock') s+=45+out.who.reduce((a,id)=>a+Math.max(0,pc(id).rel)*(hard?.8:.4),0);
  if(out.type==='bounce') s-=90+Math.max(0,from)*.5;
  const progress=((to===B.GOAL?B.GOAL+1:to)-from+B.TL*(o.lap||0));
  s+=progress*1.2;
  if(to>B.LAST&&from<=B.LAST) s+=25;
  if(o.air) s+=4;
  if(isGlobeRel(to)) s+=6;
  if(out.type!=='bounce'&&out.type!=='goal') s-=threatAt(p,to)*(hard?20:13);
  if(from>=0) s+=threatAt(p,from)*(hard?16:10);
  // Svær: bygger mure med egne brikker og presser det hold, der fører.
  if(hard&&to>=0&&to<=B.LAST&&allPieces().some(q=>q!==p&&q.team===p.team&&onBoard(q)&&absOf(q)===relAbs(seatOf(p),to))) s+=12;
  if(hard&&out.type==='knock'){const lead=leader(); if(out.who.some(id=>pc(id).team===lead)) s+=20}
  return s+Math.random()*2;
}
function leader(){let best=-1,bt=null; S.teams.forEach((t,ti)=>{if(S.finished.includes(ti)) return; const v=t.pieces.reduce((a,p)=>a+(p.state==='goal'?60:p.state==='base'?0:Math.max(0,p.rel)+5),0); if(v>best){best=v; bt=ti}}); return bt}
function aiStep(){
  if(S.phase==='roll'){doRoll(); return}
  if(S.phase==='done'){endTurn(); return}
  if(S.phase!=='choose') return;
  const acts=rerollActions(), hel=acts.findIndex(a=>a.kind==='heldig');
  if(!S.options.length){if(hel>=0) useReroll(hel); else endTurn(); return}
  const lvl=OPTS().aiLevel;
  const anyMove=S.options.some(o=>['move','exit','raid','raidmove'].includes(o.kind));
  // Let: vælger ofte et tilfældigt træk.
  if(lvl==='let'&&anyMove&&Math.random()<.6){const ms=S.options.map((o,i)=>[o,i]).filter(([o])=>['move','exit','raid','raidmove'].includes(o.kind)); execute(pick(ms)[1]); return}
  const best=S.options.map((o,i)=>[scoreOpt(o),i]).sort((a,b)=>b[0]-a[0])[0];
  if(best[0]<(lvl==='svaer'?5:-40)&&hel>=0&&lvl!=='let'){useReroll(hel); return}
  if(!anyMove&&best[0]<0){endTurn(); return}
  execute(best[1]);
}


function stopAnim(){}
const OLDQ0=[]; for(let c=1;c<=5;c++)OLDQ0.push([6,c]); for(let r=5;r>=0;r--)OLDQ0.push([r,6]); OLDQ0.push([0,7],[0,8]);
const OLDPATH=[]; for(let s=0;s<4;s++) for(const [r,c] of OLDQ0) OLDPATH.push(rotN([r+.5,c+.5],s));
const same=(a,b)=>a.every((p,i)=>Math.abs(p[0]-b[i][0])<1e-6&&Math.abs(p[1]-b[i][1])<1e-6);
console.log('quad PATH som før:', same(BOARDS.quad.PATH,OLDPATH), 'STRETCH:', JSON.stringify(BOARDS.quad.STRETCH[0])==JSON.stringify([1,2,3,4,5].map(c=>[7.5,c+.5])));
console.log('tri:', BOARDS.tri.TL, BOARDS.tri.LAST, BOARDS.tri.GOAL, 'globus',BOARDS.tri.GLOBE_REL.join(','),'stjerne',BOARDS.tri.STAR_REL.join(','));
// min. afstand mellem felter i tri og afstand mellem naboer
const P=BOARDS.tri.PATH; let mn=9,mx=0; for(let i=0;i<P.length;i++){const q=P[(i+1)%P.length]; const d=Math.hypot(P[i][0]-q[0],P[i][1]-q[1]); mx=Math.max(mx,d)}
const all=[...P,...BOARDS.tri.STRETCH.flat()]; for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++) mn=Math.min(mn,Math.hypot(all[i][0]-all[j][0],all[i][1]-all[j][1]));
const inb=all.every(([y,x])=>y>.4&&y<14.6&&x>.4&&x<14.6);
const bc=BOARDS.tri.BASEC; const clear=bc.map(c=>Math.min(...all.map(p=>Math.hypot(p[0]-c[0],p[1]-c[1]))).toFixed(2));
console.log('tri: største nabo-afstand',mx.toFixed(2),'mindste afstand',mn.toFixed(2),'inden for brættet',inb,'base->nærmeste felt',clear.join(','), 'baser',JSON.stringify(bc));
// spil mange computerspil på begge bræt
function aiTeam(s){const rs=freshSeat(s); rollSeat(rs,true); return teamData(rs)}
for(const n of [2,3,4]){let games=0,turns=0,stuck=0; for(let g=0;g<60;g++){newGame(SEAT_SETS[n].map(s=>({seat:s,...aiTeam(s),ai:true})),DEF_OPTS); let k=0; while(!S.over&&k<8000){if(S.phase==='busy'){stuck++;break} aiStep(); k++} turns+=k; if(S.over) games++}
  console.log(n,'hold, bræt',S.board,': færdige',games,'/60, gns. træk',Math.round(turns/60),'fastlåst',stuck)}
