const {chromium}=require('playwright');
(async()=>{
  const b=await chromium.launch(); const errs=[];
  // 1) engine stress: all-AI local games via aiStep
  let pg=await b.newPage({viewport:{width:1300,height:900}});
  pg.on('pageerror',e=>errs.push('local:'+e.message));
  await pg.goto('file:///home/user/helteludo/helteludo.html');
  const r1=await pg.evaluate(()=>{
    const ids=Object.keys(ABIL); let games=0, steps=0, wins={};
    for(let g=0;g<60;g++){
      R=freshRoster(); R.n=[2,3,4][g%3];
      R.seats.forEach(rs=>{rs.rolled=true;rs.ai=true;rs.pieces.forEach(p=>{for(let k=0;k<4;k++){const id=pick(ids);if(canGain(p.abil,id))gain(p.abil,id)}})});
      newGame(SEAT_SETS[R.n].map(s=>({seat:s,...teamData(R.seats[s]),ai:true})));
      let n=0; while(!S.over&&n<8000){aiStep();n++}
      if(S.over){games++; wins[S.finished[0]]=(wins[S.finished[0]]||0)+1} steps+=n;
    }
    return {games,steps};
  });
  console.log('engine',JSON.stringify(r1));
  // 2) real UI loop with timers + animation, 1 human vs AI: click AI toggles via UI
  await pg.evaluate(()=>{try{localStorage.clear()}catch(e){}});
  await pg.reload();
  await pg.click('[data-act="n"][data-n="2"]');
  await pg.click('[data-act="ai"][data-s="0"][data-v="1"]');
  await pg.click('[data-act="ai"][data-s="2"][data-v="1"]');
  await pg.click('[data-act="start"]');
  await pg.waitForTimeout(12000);
  const r2=await pg.evaluate(()=>({turnId:S.turnId,anim:S.anim&&S.anim.seq,log:S.log.length}));
  console.log('ui-ai',JSON.stringify(r2));
  await pg.screenshot({path:'ai.png'});
  // 3) online with mock db
  const pg2=await b.newPage({viewport:{width:1300,height:900}});
  pg2.on('pageerror',e=>errs.push('online:'+e.message));
  await pg2.addInitScript({path:'mock.js'});
  await pg2.goto('file:///home/user/helteludo/helteludo.html');
  await pg2.click('[data-act="mode"][data-m="online"]');
  await pg2.waitForTimeout(300);
  await pg2.click('[data-act="ockind"][data-s="2"][data-v="ai"]');
  await pg2.click('[data-act="create"]');
  await pg2.waitForTimeout(400);
  await pg2.screenshot({path:'lobby.png'});
  await pg2.click('[data-act="ostart"]');
  await pg2.waitForTimeout(500);
  // play my turns by clicking, let AI run
  for(let i=0;i<40;i++){
    const btn=await pg2.$('#rollBtn'); if(btn){await btn.click(); await pg2.waitForTimeout(300); continue}
    const opt=await pg2.$('.opt'); if(opt){await opt.click(); await pg2.waitForTimeout(300); continue}
    await pg2.waitForTimeout(500);
  }
  const r3=await pg2.evaluate(()=>{const d=[...__store.values()][0]; return {status:d.status,rev:d.rev,turn:d.state&&d.state.turnId}});
  console.log('online',JSON.stringify(r3));
  await pg2.screenshot({path:'online.png'});
  console.log('errors',errs.slice(0,10));
  await b.close();
})();
