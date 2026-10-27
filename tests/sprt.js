const {chromium}=require('playwright'); const fs=require('fs');
(async()=>{
  const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']}); const errs=[];
  const ctx=await b.newContext({viewport:{width:1320,height:900}});
  await ctx.route('https://cdn.jsdelivr.net/**',r=>{const u=r.request().url(); r.fulfill({body:fs.readFileSync(u.includes('Orbit')?'vendor/package/examples/js/controls/OrbitControls.js':'vendor/package/build/three.min.js'),contentType:'application/javascript'})});
  const pg=await ctx.newPage(); pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await pg.goto('file:///home/user/helteludo/helteludo.html'); await pg.evaluate(()=>{localStorage.clear(); localStorage.setItem('helteludo.vejledning','1'); localStorage.setItem('helteludo.grafik','hoj')}); await pg.reload();
  await pg.click('[data-act="spritedemo"]');
  await pg.waitForFunction(()=>V3D.active,null,{timeout:20000});
  await pg.evaluate(()=>{const put=(t,i,rel)=>{const p=S.teams[t].pieces[i]; p.state='track'; p.rel=rel}; put(0,0,3); put(0,1,5); put(0,2,8); put(1,0,40); put(1,1,44); put(1,2,47); S.phase='roll'; render()});
  await pg.waitForTimeout(1200);
  await pg.evaluate(()=>{V3D.cam.position.set(-4,3.2,5.2); V3D.ctl.target.set(-4.5,.5,.2); V3D.ctl.update()});
  await pg.waitForTimeout(800); await (await pg.$('#board')).screenshot({path:'sprite-close.png'});
  await pg.evaluate(()=>V3D.resetCamera()); await pg.waitForTimeout(600); await (await pg.$('#board')).screenshot({path:'sprite-wide.png'});
  // spil lidt
  for(let i=0;i<6;i++){await pg.evaluate(()=>{if(!team().ai){if(S.phase==='roll') act(doRoll); else if(S.phase==='choose'&&S.options.length) act(()=>execute(0)); else act(endTurn)}}); await pg.waitForTimeout(1500)}
  console.log('kinds', await pg.evaluate(()=>allPieces().map(p=>figureKind(p).id+(V3D.pieces[p.id].rig.sprite?'*':'')).join(',')));
  console.log('errors',errs.slice(0,6)); await b.close();
})();
