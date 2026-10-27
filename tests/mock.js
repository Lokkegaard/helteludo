(()=>{
  const store=new Map(), docL=new Map(), colL=[];
  const snap=(path)=>{const v=store.get(path); return {id:path.split('/').pop(),exists:!!v,data:()=>v?JSON.parse(JSON.stringify(v)):undefined,metadata:{fromCache:false,hasPendingWrites:false}}};
  const notify=(path)=>{setTimeout(()=>{(docL.get(path)||[]).forEach(f=>f(snap(path))); colL.forEach(l=>l())},5)};
  const db={
    doc(path){return {path,get:async()=>snap(path),set:async(d)=>{store.set(path,JSON.parse(JSON.stringify(d)));notify(path)},delete:async()=>{store.delete(path);notify(path)},
      acquire:async()=>({acquired:true}),onSnapshot(next){const a=docL.get(path)||[];a.push(next);docL.set(path,a);setTimeout(()=>next(snap(path)),5);return()=>{}}}},
    collection(c){const q={where(){return q},limit(){return q},onSnapshot(next){const run=()=>{const docs=[...store.keys()].filter(k=>k.startsWith(c+'/')&&!k.slice(c.length+1).includes('/')).map(snap);next({docs,size:docs.length,empty:!docs.length,docChanges:()=>[]})};colL.push(run);setTimeout(run,5);return()=>{}}};return q}
  };
  window.__store=store;
  window.claude={use:async(n)=>n==='db'?db:n==='user'?{id:async()=>'u1',can:async()=>true,profiles:async(ids)=>Object.fromEntries([].concat(ids).map(i=>[i,{name:'Test '+i}]))}:null};
})();
