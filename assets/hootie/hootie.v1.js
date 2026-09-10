/* Hootie: local, optional companion. No analytics, JavaScript animation loop, or dependencies. */
(() => {
  'use strict';
  if (window.Hootie) return;
  const base = new URL('.', document.currentScript.src);
  const key = 'teacherTools.hootie.v1';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let prefs = { paused: false, tucked: false };
  try { const saved = JSON.parse(localStorage.getItem(key));
    if (saved) prefs = { paused: saved.paused === true, tucked: saved.tucked === true };
  } catch (_) { /* Preferences are optional when storage is unavailable. */ }
  const host = document.createElement('div');
  host.id = 'hootie-companion';
  host.style.visibility = 'hidden';
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = `<link rel="stylesheet">
    <section class="panel" id="hootie-panel" aria-labelledby="hootie-heading" hidden>
      <div class="heading"><h2 id="hootie-heading">Hi, I’m Hootie!</h2><button class="close" aria-label="Close Hootie’s helper panel">×</button></div>
      <p>A little company while you teach. Where shall we go?</p>
      <div class="actions"><button class="help">Help with this tool</button><a class="home">Explore Teacher Tools</a>
      <button class="wave">Say hello</button><button class="pause" aria-pressed="false">Pause animations</button>
      <button class="tuck">Tuck Hootie away</button></div>
      <p class="note"></p>
    </section>
    <button class="launcher" aria-label="Open Hootie’s helper panel" aria-expanded="false" aria-controls="hootie-panel">
      <span class="sprite" data-mood="idle" aria-hidden="true"></span><span class="label">Hootie</span>
    </button>`;
  const $ = selector => root.querySelector(selector);
  const sprite = $('.sprite'), panel = $('.panel'), launcher = $('.launcher');
  const headerButton = document.getElementById('siteHootieButton');
  // Reuse the actual header icon so the two controls always share one identity.
  const greetingIcon = headerButton?.querySelector('svg')?.cloneNode(true);
  if (greetingIcon) $('#hootie-heading').prepend(greetingIcon);
  let timer;
  const stopped = () => motion.matches || prefs.paused || prefs.tucked || document.hidden || !!document.fullscreenElement || document.body.classList.contains('presentation-open') || document.body.classList.contains('modal-open');
  function reset() { clearTimeout(timer); sprite.classList.remove('play'); sprite.dataset.mood = 'idle'; }
  function setMood(mood = 'idle') {
    if (!['idle', 'happy', 'wave', 'read', 'think'].includes(mood)) return;
    reset();
    if (stopped() || mood === 'idle') return;
    sprite.dataset.mood = mood;
    // A single CSS cycle per action; settle on idle with no ongoing timer.
    void sprite.offsetWidth;
    sprite.classList.add('play');
    timer = setTimeout(reset, 1650);
  }
  function close(restoreFocus = false) {
    panel.hidden = true; launcher.setAttribute('aria-expanded', 'false');
    if (restoreFocus) (prefs.tucked ? headerButton : launcher)?.focus();
  }
  function update() {
    host.hidden = prefs.tucked || !!document.fullscreenElement || document.body.classList.contains('presentation-open') || document.body.classList.contains('modal-open');
    if (host.hidden) close();
    if (headerButton) {
      const label = prefs.tucked ? 'Bring Hootie back' : 'Tuck Hootie away';
      headerButton.setAttribute('aria-label', label);
      headerButton.setAttribute('aria-pressed', String(!prefs.tucked));
      headerButton.title = label;
    }
    host.toggleAttribute('data-stopped', stopped());
    $('.pause').setAttribute('aria-pressed', String(prefs.paused));
    $('.pause').textContent = prefs.paused ? 'Resume animations' : 'Pause animations';
    $('.pause').disabled = motion.matches;
    $('.note').textContent = motion.matches ? 'Animations are off to respect your reduced-motion setting.' : 'Your pause and tuck-away choices are remembered on this browser.';
    launcher.setAttribute('aria-label', prefs.tucked ? 'Bring Hootie back' : 'Open Hootie’s helper panel');
    if (stopped()) reset();
  }
  function save() { try { localStorage.setItem(key, JSON.stringify(prefs)); } catch (_) {} update(); }
  launcher.addEventListener('click', () => {
    if (prefs.tucked) { prefs.tucked = false; save(); }
    const open = panel.hidden;
    panel.hidden = !open; launcher.setAttribute('aria-expanded', String(open));
    if (open) { setMood('wave'); $('.close').focus(); }
  });
  headerButton?.addEventListener('click', () => {
    prefs.tucked = !prefs.tucked;
    save();
    close();
    if (!prefs.tucked) setMood('wave');
  });
  headerButton?.addEventListener('keydown', event => event.stopPropagation());
  $('.close').addEventListener('click', () => close(true));
  $('.wave').addEventListener('click', () => setMood('happy'));
  $('.pause').addEventListener('click', () => { prefs.paused = !prefs.paused; save(); });
  $('.tuck').addEventListener('click', () => { prefs.tucked = true; save(); close(true); });
  root.addEventListener('keydown', event => {
    // Do not let classroom shortcuts (such as Space to start a timer) handle companion controls.
    event.stopPropagation();
    if (event.key === 'Escape' && !panel.hidden) { event.preventDefault(); event.stopPropagation(); close(true); }
  });
  document.addEventListener('pointerdown', event => { if (!event.composedPath().includes(host)) close(); });
  document.addEventListener('focusin', event => { if (!event.composedPath().includes(host)) close(); });
  const help = document.querySelector('#helpOpenButton, [data-modal-open*="tutorial" i], [data-modal-open*="help" i]');
  $('.help').hidden = !help;
  $('.help').addEventListener('pointerenter', () => setMood('think'));
  $('.help').addEventListener('focus', () => setMood('think'));
  $('.help').addEventListener('click', () => { close(); help?.click(); });
  $('.home').href = document.querySelector('.site-brand')?.href || new URL('../../previews/teacher-tools-home/index.html', base).href;
  $('.home').addEventListener('pointerenter', () => setMood('read'));
  motion.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);
  document.addEventListener('fullscreenchange', update);
  new MutationObserver(update).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    try { const saved = JSON.parse(event.newValue); prefs = { paused: saved?.paused === true, tucked: saved?.tucked === true }; update(); } catch (_) {}
  });
  window.Hootie = Object.freeze({ setMood, happy: () => setMood('happy'), wave: () => setMood('wave'), read: () => setMood('read'), think: () => setMood('think') });
  const css = $('link');
  css.onload = () => { host.style.visibility = ''; if (headerButton) headerButton.hidden = false; };
  css.onerror = () => host.remove();
  css.href = new URL('hootie.v1.css', base).href;
  update();
  // Schedule after initial page work; background sprites only load once mounted.
  const mount = () => { document.body.append(host); setMood('idle'); };
  if ('requestIdleCallback' in window) requestIdleCallback(mount, { timeout: 2000 });
  else setTimeout(mount, 0);
})();
