/**
 * bridge.js — ISOLATED world content script.
 * Popup <-> page (inject.js) er message relay.
 */

(() => {
  'use strict';

  const BRIDGE_SRC = 'wa-checker-bridge';
  const INJECT_SRC = 'wa-checker-inject';
  const TIMEOUT_MS = 45000;

  const pending = new Map();

  // page -> extension
  window.addEventListener('message', function (ev) {
    if (ev.source !== window) return;
    const d = ev.data;
    if (!d || d.source !== INJECT_SRC || !d.id) return;
    const cb = pending.get(d.id);
    if (!cb) return;
    pending.delete(d.id);
    try { cb(d.payload); } catch (e) {}
  });

  // extension (popup) -> page
  chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (!msg || !msg.toPage) return;

    const id = msg.id;
    pending.set(id, sendResponse);

    window.postMessage(
      { source: BRIDGE_SRC, id: id, type: msg.type, number: msg.number },
      '*'
    );

    setTimeout(function () {
      if (pending.has(id)) {
        pending.delete(id);
        try { sendResponse({ ok: false, error: 'TIMEOUT' }); } catch (e) {}
      }
    }, TIMEOUT_MS);

    return true; // async reply
  });
})();