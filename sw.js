const V='factor-v3',CORE=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(CORE.map(u=>fetch(u,{cache:'reload'}).then(r=>r.ok&&c.put(u,r))))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
// Cache-first (instant, works offline / when filtered); refresh in background (bypassing HTTP cache) for next open.
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const same=new URL(r.url).origin===location.origin;
  e.respondWith(caches.open(V).then(c=>c.match(r,{ignoreSearch:true}).then(hit=>{
    const net=(same?fetch(r.url,{cache:'reload'}):fetch(r)).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r.mode==='navigate'?'index.html':r,res.clone());return res}).catch(()=>null);
    if(hit){e.waitUntil(net);return hit}
    return net.then(res=>res||c.match('index.html'));
  })));
});
