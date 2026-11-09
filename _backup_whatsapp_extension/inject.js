/**
 * inject.js — web.whatsapp.com er MAIN world e chole.
 * Strategy: (A) executed module cache scan, (B) factory scan,
 * (C) UI-based DOM check fallback.
 */

(() => {
  'use strict';

  const BRIDGE_SRC = 'wa-checker-bridge';
  const INJECT_SRC = 'wa-checker-inject';
  const FN_NAMES = ['queryExist', 'queryExists'];

  let webpackRequire = null;
  let chunkKey = null;
  let candidates = [];
  let working = null;
  let lastError = null;
  let lastPush = 0;
  let uiBusy = false;
  let tick = 0;
  const searched = new Set();
  const stats = { cache: 0, factories: 0, executed: 0 };

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function postMsg(obj) {
    try { window.postMessage(Object.assign({ source: INJECT_SRC }, obj), '*'); } catch (e) {}
  }

  /* ---------- webpack discovery ---------- */

  function findChunkArray() {
    const keys = Object.getOwnPropertyNames(window);
    for (let i = 0; i < keys.length; i++) {
      if (keys[i].indexOf('webpackChunk') === 0) {
        const arr = window[keys[i]];
        if (Array.isArray(arr)) { chunkKey = keys[i]; return arr; }
      }
    }
    return null;
  }

  function pushParasite() {
    if (webpackRequire) return;
    const now = Date.now();
    if (now - lastPush < 5000) return;
    const arr = findChunkArray();
    if (!arr) return;
    lastPush = now;
    try {
      arr.push([
        ['wa-checker-' + Math.random().toString(36).slice(2)],
        {},
        function (require) {
          if (require && typeof require === 'function' && require.m) {
            webpackRequire = require;
          }
        }
      ]);
    } catch (e) {
      lastError = 'push: ' + String(e && e.message).slice(0, 100);
    }
  }

  /* ---------- module scanning ---------- */

  function deepFindFn(obj, names, depth, seen) {
    if (obj === null || obj === undefined || depth < 0) return null;
    if (typeof obj !== 'object' && typeof obj !== 'function') return null;
    seen = seen || new Set();
    if (seen.has(obj)) return null;
    seen.add(obj);
    let keys;
    try { keys = Object.getOwnPropertyNames(obj); } catch (e) { return null; }
    for (let i = 0; i < keys.length; i++) {
      try {
        if (names.indexOf(keys[i]) !== -1 && typeof obj[keys[i]] === 'function') {
          return { owner: obj, key: keys[i], fn: obj[keys[i]] };
        }
      } catch (e) {}
    }
    for (let i = 0; i < keys.length; i++) {
      let v;
      try { v = obj[keys[i]]; } catch (e) { continue; }
      if (v && (typeof v === 'object' || typeof v === 'function')) {
        const hit = deepFindFn(v, names, depth - 1, seen);
        if (hit) return hit;
      }
    }
    return null;
  }

  function addCandidate(hit) {
    if (!hit) return;
    for (let i = 0; i < candidates.length; i++) {
      if (candidates[i].fn === hit.fn) return;
    }
    candidates.push(hit);
  }

  // Strategy A: already-executed module cache (kono execution lagbe na — safe)
  function scanCache() {
    if (!webpackRequire || !webpackRequire.c || candidates.length) return;
    let ids;
    try { ids = Object.keys(webpackRequire.c); } catch (e) { return; }
    for (let i = 0; i < ids.length; i++) {
      let mod;
      try { mod = webpackRequire.c[ids[i]]; } catch (e) { continue; }
      stats.cache = i + 1;
      const exps = mod && mod.exports;
      if (!exps) continue;
      addCandidate(deepFindFn(exps, FN_NAMES, 3, null));
      if (candidates.length >= 5) return;
    }
  }

  // Strategy B: factory source scan (only matching module execute kore)
  function scanFactories() {
    if (!webpackRequire || !webpackRequire.m || candidates.length) return;
    let ids;
    try { ids = Object.keys(webpackRequire.m); } catch (e) { return; }
    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      if (searched.has(id)) continue;
      searched.add(id);
      stats.factories++;
      let src = '';
      try { src = String(webpackRequire.m[id]); } catch (e) { continue; }
      if (src.indexOf('queryExist') === -1) continue; // queryExists o ei substring ache
      let mod = null;
      try { mod = webpackRequire(id); stats.executed++; } catch (e) { continue; }
      addCandidate(deepFindFn(mod, FN_NAMES, 4, null));
      if (candidates.length >= 5) return;
    }
  }

  /* ---------- state ---------- */

  function loginState() {
    try {
      if (document.querySelector('.landing-wrapper, .landing-main, [data-ref], [data-testid="qrcode"]')) return 'qr';
      if (document.querySelector('#side, [data-testid="chat-list"], .app-wrapper-web')) return 'ready';
      if (localStorage.getItem('last-wid')) return 'ready';
    } catch (e) {}
    return 'loading';
  }

  function buildState() {
    return {
      ok: true,
      ready: candidates.length > 0,
      login: loginState(),
      diag: {
        chunk: chunkKey || '(none)',
        webpack: !!webpackRequire,
        cache: stats.cache,
        factories: stats.factories,
        executed: stats.executed,
        candidates: candidates.length,
        working: working ? ('#' + working.index + ' "' + working.suffix + '"') : null,
        lastError: lastError ? String(lastError).slice(0, 200) : null
      }
    };
  }

  function broadcastState() {
    postMsg({ type: 'STATE', state: buildState() });
  }

  setInterval(() => {
    tick++;
    if (!candidates.length && (tick % 3 === 1)) {
      if (!webpackRequire) pushParasite();
      scanCache();
      scanFactories();
    }
    broadcastState();
  }, 2000);

  /* ---------- internal query ---------- */

  function errText(e) {
    try {
      if (e === null || e === undefined) return '';
      if (typeof e === 'string') return e;
      if (e.message) return String(e.message);
      if (e.error) return String(e.error);
      if (e.text) return String(e.text);
      return JSON.stringify(e).slice(0, 150);
    } catch (x) { return '(unreadable)'; }
  }

  function safeJson(v) {
    try { return JSON.stringify(v).slice(0, 100); } catch (e) { return String(v).slice(0, 100); }
  }

  function interpOk(r) {
    if (r === null || r === undefined) return null;
    if (r.status === 200 || r.status === 201 || r.status === 204) return { exists: true, via: 'status' + r.status };
    if (r.status === 404) return { exists: false, via: 'status404' };
    if (typeof r.exists === 'boolean') return { exists: r.exists, via: 'exists' };
    if (typeof r.numberExists === 'boolean') return { exists: r.numberExists, via: 'numberExists' };
    if (r.wid || r.jid || r.ejson) return { exists: true, via: 'object' };
    return null;
  }

  function interpErr(e) {
    let status = null;
    try {
      status = e && (e.status != null ? e.status : (e.statusCode != null ? e.statusCode : (e.data && e.data.status)));
    } catch (x) {}
    const msg = errText(e);
    if (status === 404) return { exists: false, via: 'err404' };
    if (status === 400) return { exists: false, via: 'err400' };
    if (/\b404\b/.test(msg)) return { exists: false, via: 'txt404' };
    if (/not[\s_-]*(found|exist|registered)|no[\s_-]*such|isn'?t\s+on\s+whatsapp|shared\s+via\s+url/i.test(msg)) return { exists: false, via: 'txt' };
    if (/\b400\b|invalid|malformed/i.test(msg)) return { exists: false, via: 'txt-invalid' };
    return null;
  }

  async function handleCheck(id, number) {
    if (loginState() === 'qr') return postMsg({ id: id, payload: { ok: false, error: 'LOGGED_OUT' } });

    if (!candidates.length) { scanCache(); scanFactories(); }
    if (!candidates.length) return postMsg({ id: id, payload: { ok: false, error: 'NOT_READY' } });

    const num = String(number).replace(/\D/g, '');
    const suffixes = ['@c.us', ''];
    const errs = [];

    for (let ci = 0; ci < candidates.length; ci++) {
      for (let si = 0; si < suffixes.length; si++) {
        const suf = suffixes[si];
        let out;
        try {
          out = await Promise.resolve(candidates[ci].fn.call(candidates[ci].owner, num + suf)).then(
            (res) => ({ res: res }),
            (err) => ({ err: err })
          );
        } catch (e) { out = { err: e }; }

        const interp = out.err ? interpErr(out.err) : interpOk(out.res);
        if (interp) {
          working = { index: ci, suffix: suf };
          return postMsg({
            id: id,
            payload: { ok: true, exists: !!interp.exists, via: (out.err ? 'rej/' : 'res/') + interp.via }
          });
        }
        errs.push('c' + ci + suf + '=' + (out.err ? 'E:' + errText(out.err).slice(0, 60) : safeJson(out.res)));
      }
    }
    lastError = errs.join(' | ').slice(0, 250);
    postMsg({ id: id, payload: { ok: false, error: 'QUERY_FAILED: ' + lastError } });
  }

  /* ---------- UI-based check (fallback) ---------- */

  const ERR_DIALOG_SEL = '[role="dialog"], [role="alert"], [data-animate-modal-body], [data-testid*="alert"], [data-testid*="popup"], [data-testid*="dialog"]';

  function findErrorDialog() {
    try {
      const nodes = document.querySelectorAll(ERR_DIALOG_SEL);
      for (let i = 0; i < nodes.length; i++) {
        let t = '';
        try { t = (nodes[i].innerText || '').slice(0, 400); } catch (e) { continue; }
        if (!t) continue;
        const low = t.toLowerCase();
        if (/shared via url|not on whatsapp|isn'?t on whatsapp|phone number you entered/.test(low)) {
          return t.slice(0, 60).replace(/\s+/g, ' ');
        }
        if (/whatsapp/.test(low) && /নেই|নাই|শেয়ার/.test(t)) {
          return t.slice(0, 60).replace(/\s+/g, ' ');
        }
      }
    } catch (e) {}
    return null;
  }

  function chatOpen() {
    try {
      return !!document.querySelector(
        '#main footer, [data-testid="conversation-panel"], [data-testid="chat-footer"], #main footer div[contenteditable="true"]'
      );
    } catch (e) { return false; }
  }

  async function uiCheck(id, number) {
    if (uiBusy) return postMsg({ id: id, payload: { ok: false, error: 'UI_BUSY' } });
    uiBusy = true;
    try {
      const started = Date.now();
      while (Date.now() - started < 40000) {
        if (loginState() === 'qr') {
          return postMsg({ id: id, payload: { ok: false, error: 'LOGGED_OUT' } });
        }
        const err = findErrorDialog();
        if (err) return postMsg({ id: id, payload: { ok: true, exists: false, via: 'ui:' + err } });
        if (chatOpen()) return postMsg({ id: id, payload: { ok: true, exists: true, via: 'ui:chat-open' } });
        await sleep(500);
      }
      postMsg({ id: id, payload: { ok: false, error: 'UI_TIMEOUT' } });
    } finally {
      uiBusy = false;
    }
  }

  /* ---------- message listener ---------- */

  window.addEventListener('message', function (ev) {
    if (ev.source !== window) return;
    const d = ev.data;
    if (!d || d.source !== BRIDGE_SRC || !d.id) return;

    if (d.type === 'CHECK') {
      handleCheck(d.id, d.number).catch(function (e) {
        postMsg({ id: d.id, payload: { ok: false, error: 'EXC:' + errText(e) } });
      });
    } else if (d.type === 'UI_CHECK') {
      uiCheck(d.id, d.number);
    }
  });

  broadcastState();

  window.__WA_CHECKER_DEBUG = {
    state: buildState,
    login: loginState
  };
})();