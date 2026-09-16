const RELEASE = "teacher-tools-2026-09-16-google-scheduler-1";
const CACHE = `teacher-tools-${RELEASE}`;
const APP_SHELL = [
  "/",
  "/scheduler/",
  "/calendar/",
  "/spinner/",
  "/timer/",
  "/tracker/",
  "/tricks/",
  "/offline/",
  "/assets/hootie/hootie.v1.css",
  "/assets/hootie/hootie.v1.js",
  "/assets/hootie/hootie-sprites.v2.webp",
  "/assets/pwa/teacher-tools-icon.svg",
  "/assets/pwa/teacher-tools-icon-192.png",
  "/assets/pwa/teacher-tools-icon-512.png",
  "/offline.webmanifest"
];

async function cacheShell(onProgress) {
  const cache = await caches.open(CACHE);
  for (let index = 0; index < APP_SHELL.length; index += 1) {
    const url = APP_SHELL[index];
    const response = await fetch(new Request(url, {cache:"reload"}));
    if (!response.ok) throw new Error(`Could not cache ${url} (${response.status})`);
    await cache.put(url, response);
    onProgress?.({completed:index + 1,total:APP_SHELL.length,url});
  }
  return {ready: await shellReady(), release: RELEASE, count: APP_SHELL.length};
}

async function shellReady() {
  const cache = await caches.open(CACHE);
  const matches = await Promise.all(APP_SHELL.map(url => cache.match(url)));
  return matches.every(Boolean);
}

self.addEventListener("install", event => event.waitUntil(cacheShell()));
self.addEventListener("activate", event => event.waitUntil((async () => {
  const keys = await caches.keys();
  await Promise.all(keys.filter(key => key.startsWith("teacher-tools-") && key !== CACHE).map(key => caches.delete(key)));
  await self.clients.claim();
})()));

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  if (event.request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(event.request);
        if (fresh.ok) (await caches.open(CACHE)).put(event.request, fresh.clone());
        return fresh;
      } catch {
        return (await caches.match(event.request)) || (await caches.match("/"));
      }
    })());
    return;
  }
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    const fresh = await fetch(event.request);
    if (fresh.ok) (await caches.open(CACHE)).put(event.request, fresh.clone());
    return fresh;
  })());
});

self.addEventListener("message", event => {
  const reply = value => event.ports[0]?.postMessage(value);
  if (event.data?.type === "STATUS") event.waitUntil(shellReady().then(ready => reply({ready,release:RELEASE,count:APP_SHELL.length})).catch(error => reply({ready:false,error:String(error)})));
  if (event.data?.type === "CACHE_NOW") event.waitUntil(cacheShell(progress => reply({type:"PROGRESS",...progress})).then(reply).catch(error => reply({ready:false,error:String(error)})));
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});
