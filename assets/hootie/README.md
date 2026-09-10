# Hootie companion — v1

Hootie is shared by all registered Workbench previews and the starter. The synchronization script inserts a versioned external script reference outside the embedded UI blocks. This is an intentional exception to the otherwise self-contained pages: one local sprite URL, one script URL and one stylesheet URL can be reused across page visits.

## Behavior and accessibility

- Bottom-right launcher opens a nonmodal helper panel. Existing applet help is linked when a compatible help button is present; Home navigation comes from the existing site header.
- Idle uses a 12-second CSS cycle: frame 2 appears for 240ms after 4.8 seconds, and frame 4 for 240ms at 11.52 seconds. The neutral frame is held between blinks. Opening the panel waves; Say hello plays Happy; hovering or focusing tool help plays Think; hovering the Home link plays Read. Each interaction plays once for 1.6 seconds, then returns to the gentle Idle cycle. No JavaScript animation loop, polling, audio, or external library.
- Reduced motion forces a static Idle frame in JavaScript and disables CSS animation. Preference changes apply immediately; users cannot override OS reduced motion through the companion.
- Pause and tuck-away preferences use `teacherTools.hootie.v1` in localStorage, shared across the same site origin. Storage failures do not break the page. Tucking removes the entire corner companion. A small owl/glasses icon beside Backup and Appearance in the shared header restores him (and can also tuck him away). Keyboard focus moves to that icon when tucking from the helper panel.
- Keyboard buttons, visible focus, Escape to close and focus restoration. Companion keys do not trigger classroom keyboard shortcuts. The decorative sprite is hidden from screen readers.
- Stops when the tab is hidden. Hides during shared modals, presentation mode and fullscreen. Not printed.
- Uses the site's theme colors within an isolated shadow root, avoiding clashes with applet CSS.

## Assets and caching

`hootie-sprites.v2.webp` is the aligned lossless transparent master: 960 × 960 pixels. Frame artwork was translated by whole source pixels only, with no resampling or clipping. Facial centers share one horizontal anchor; standing feet share a baseline, with the intentional Happy hop retained. The original v1 master is retained for reference. Five rows: Idle, Happy, Wave, Read, Think. Four 240 × 192 frames per row.

The display box is 120 × 96 CSS pixels, with `background-size: 480px 480px` and `image-rendering: pixelated`. Display scaling does not rewrite or blur the source file. All moods use that single WebP; no duplicate per-mood downloads or PNG are loaded.

The script is deferred and mounts Hootie during browser idle time (with a two-second fallback). All preview paths resolve to `/assets/hootie/` on the Workbench server. Normal browser HTTP caching can reuse the files, subject to the host's cache headers, cache eviction and user settings. “Download exactly once forever” cannot be guaranteed. No service worker is necessary for this first version.

Versioned filenames allow future releases to use new URLs when assets change. On a host with configurable headers, use a long cache lifetime for immutable versioned files; do not overwrite published immutable files. GitHub Pages controls its own cache headers. The local Python preview server is for functional checks, not production caching measurements.

## Future applet reactions

```js
window.Hootie?.happy(); // after a successful save
window.Hootie?.think();
window.Hootie?.read();
window.Hootie?.wave();
window.Hootie?.setMood('idle');
```

These optional calls respect pause, reduced motion, visibility and tuck-away settings. They only animate; they do not announce success or replace accessible status text. Save-specific integrations are not wired yet.

## Preview and release

From Workbench, run `python3 -m http.server 8765`, then open `/previews/teacher-tools-home/index.html`. Run `python3 scripts/sync_shared_ui.py --check` before release.

The shared asset directory is published at `ALT-Resources/assets/hootie/`, and every published page should reference `/assets/hootie/hootie.v1.js` for the current custom-domain deployment. Keep all pages on the identical URL; do not copy the sprite into each applet directory. The existing release workflow still owns commit/push.

## Verification

Checked in the local browser: desktop (1280px) and narrow mobile (320px), helper open/close, pause and tuck persistence between Home and Timer, restoring Hootie, Space toggling pause without starting Timer, and opening Timer's existing help with Hootie hidden behind the modal. Shared UI sync check passes for all eight targets. Reduced-motion protection is present in both CSS and JavaScript; OS-level motion emulation was not available in the browser test interface. The shared runtime and five non-Home, non-Calendar applet pages were prepared in the live folder on September 10, 2026; Home and Class Calendar remain part of their separate rollout.
