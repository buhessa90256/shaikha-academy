importScripts('./voice-clips.js','./media-range.js');
const CACHE='shaikha-academy-v5';
const ASSETS=['./','./index.html','./style.css','./app.js','./strokes.js','./trace-engine.js','./sound.js','./voice-clips.js','./media-range.js','./assets/characters/shaikha-welcome.png','./assets/characters/shaikha-celebrate.png','./assets/characters/shaikha-listening.png','./assets/characters/shaikha-reading.png','./assets/characters/shaikha-thinking.png','./assets/characters/shaikha-painting.png','./icon.svg','./icon.png','./manifest.webmanifest',...Object.values(globalThis.ShaikhaVoiceClips).flatMap(clips=>Object.values(clips))];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('shaikha-academy-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==location.origin||!url.pathname.startsWith(new URL('./',self.location).pathname))return;
 const range=event.request.headers.get('Range');
 if(range&&url.pathname.endsWith('.mp3')){
  event.respondWith((async()=>{
   const cached=await caches.match(event.request.url);
   if(cached){const partial=ShaikhaMediaRange(await cached.arrayBuffer(),range,cached.headers.get('Content-Type')||'audio/mpeg');if(partial)return partial;}
   return fetch(event.request);
  })());return;
 }
 event.respondWith(fetch(event.request).then(response=>{
  if(response.status===200){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)));}
  return response;
 }).catch(()=>caches.match(event.request).then(cached=>cached||(event.request.mode==='navigate'?caches.match('./index.html'):Response.error()))));
});
