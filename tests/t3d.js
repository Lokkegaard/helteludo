const {chromium}=require('playwright');
const fs=require('fs');
(async()=>{
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--autoplay-policy=no-user-gesture-required']}); const errs=[];
  const pg=await b.newPage({viewport:{width:1320,height:900}});
  await pg.route('https://cdn.jsdelivr.net/**',r=>{const u=r.request().url(); const f=u.includes('Orbit')?'vendor/package/examples/js/controls/OrbitControls.js':'vendor/package/build/three.min.js'; r.fulfill({body:fs.readFileSync(f),contentType:'application/javascript'})});
  pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await pg.goto('file:///home/user/helteludo/helteludo.html');
  await pg.evaluate(()=>{
    R=freshRoster(); R.n=4;
    R.seats[0].pieces[0].abil={hurtig:2,sej:1}; R.seats[1].pieces[0].abil={sej:2}; R.seats[2].pieces[1].abil={selvantaendelig:1}; R.seats[3].pieces[0].abil={langsom:1};
    newGame(SEAT_SETS[4].map(s=>({seat:s,...teamData(R.seats[s]),ai:false})));
    const put=(t,i,rel)=>{const p=S.teams[t].pieces[i]; p.state='track'; p.rel=rel};
    put(0,0,3); put(0,1,9); put(1,0,9); put(2,0,4); put(2,1,8); put(3,0,5); put(3,1,53);
    S.teams[0].pieces[3].state='goal'; S.teams[0].pieces[3].rel=56;
    S.raw=6; S.phase='choose'; S.options=computeOptions(); S.msg='Vælg et træk.';
    UI.screen='game'; document.getElementById('app').innerHTML=''; render();
  });
  await pg.click('[data-act="view"]');
  await pg.waitForFunction(()=>V3D.active,null,{timeout:20000});
  await pg.waitForTimeout(1500);
  await pg.screenshot({path:'g3d-1.png'});
  // star jump move + roll + AI play for a while
  await pg.evaluate(()=>{const i=S.options.findIndex(o=>o.pid==='0-0'&&o.kind==='move'); act(()=>execute(i>=0?i:0));});
  await pg.waitForTimeout(400);
  await pg.screenshot({path:'g3d-2.png'});
  await pg.waitForTimeout(1500);
  // click a piece on canvas via projection
  const sp=await pg.evaluate(()=>{const r=V3D.renderer.domElement.getBoundingClientRect(); const s=V3D.screen('1-0'); return {x:r.left+s.x,y:r.top+s.y+12}});
  await pg.mouse.click(sp.x,sp.y); await pg.waitForTimeout(400);
  console.log('info open for', await pg.evaluate(()=>UI.info));
  await pg.screenshot({path:'g3d-3.png'});
  // let AI play both sides
  await pg.evaluate(()=>{S.teams.forEach(t=>t.ai=true); UI.info=null; S.phase='roll'; render()});
  await pg.waitForTimeout(15000);
  console.log(JSON.stringify(await pg.evaluate(()=>({turn:S.turnId,anim:S.anim&&S.anim.seq,active:V3D.active,fx:V3D.fx.length}))));
  await pg.click('[data-act="view"]'); await pg.waitForTimeout(500);
  console.log('back to 2d', await pg.evaluate(()=>!V3D.active&&!document.querySelector('canvas.c3d')));
  console.log('errors',errs.slice(0,8)); await b.close();
})();
