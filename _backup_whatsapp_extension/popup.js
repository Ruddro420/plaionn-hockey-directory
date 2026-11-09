const $ = (id) => document.getElementById(id);

let running = false;
let stopFlag = false;
let results = [];
let msgSeq = 0;
let lastPingRaw = null;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const nextId = () => 'm' + (++msgSeq) + '-' + Date.now().toString(36);

function setStatus(t) { $('status').textContent = t; }

function showDebug(r) {
  lastPingRaw = r;
  try {
    const s = r && r.state;
    const d = s && s.diag;
    $('debugLine').textContent = d
      ? `api:${s.ready ? '✓' : '✗'} login:${s.login} webpack:${d.webpack ? '✓' : '✗'} modules:${d.cache}/${d.factories} cand:${d.candidates}${d.lastError ? ' | ' + d.lastError : ''}`
      : '';
  } catch (e) {}
}

/* ---------- number parse ---------- */

function parseNumbers(raw) {
  const tokens = String(raw).split(/[\s,;\n]+/).filter(Boolean);
  const seen = new Set();
  const out = [];
  for (const tok of tokens) {
    let n = tok.replace(/\D/g, '');
    if (!n) continue;
    if (n.indexOf('00') === 0) n = n.slice(2);
    if (seen.has(n)) continue;
    seen.add(n);
    out.push({ number: n, invalid: !(n.length >= 7 && n.length <= 15) });
  }
  return out;
}

/* ---------- tab / ping ---------- */

async function getWaTab() {
  let tabs = [];
  try { tabs = await chrome.tabs.query({ url: 'https://web.whatsapp.com/*' }); } catch (e) {}
  let tab = tabs && tabs.length ? tabs[0] : null;
  if (!tab) {
    setStatus('WhatsApp Web khola hocche…');
    tab = await chrome.tabs.create({ url: 'https://web.whatsapp.com/', active: true });
  } else if (tab.status !== 'complete' || tab.discarded) {
    try { await chrome.tabs.reload(tab.id); } catch (e) {}
  }
  return tab;
}

async function ping(tabId) {
  try {
    return await chrome.tabs.sendMessage(tabId, { toPage: true, id: nextId(), type: 'PING' });
  } catch (e) { return null; }
}

async function waitReady(tabId, maxSec) {
  maxSec = maxSec || 240;
  let fails = 0;
  let reloaded = false;
  const start = Date.now();

  while (Date.now() - start < maxSec * 1000) {
    if (stopFlag) throw new Error('STOPPED');

    const r = await ping(tabId);

    if (!r) {
      fails++;
      if (fails >= 4 && !reloaded) {
        reloaded = true;
        setStatus('WhatsApp tab reload korchi…');
        try { await chrome.tabs.reload(tabId); } catch (e) {}
      } else {
        setStatus('WhatsApp Web load hocche…');
      }
    } else if (r.ok) {
      fails = 0;
      showDebug(r);
      const s = r.state || {};
      if (!r.injectAlive) {
        setStatus('Page script load hoy nai — wait korchi (Chrome 111+ lagbe)…');
      } else if (s.login === 'qr') {
        setStatus('WhatsApp Web tab e QR scan kore login koren…');
      } else if (s.login !== 'ready') {
        setStatus('WhatsApp connect hocche…');
      } else {
        return s;
      }
    }
    await sleep(2000);
  }
  throw new Error('WhatsApp Web ready hoy nai — tab khule login check koren.');
}

async function waitForApi(tabId, maxSec) {
  const start = Date.now();
  while (Date.now() - start < maxSec * 1000) {
    if (stopFlag) throw new Error('STOPPED');
    const r = await ping(tabId);
    if (r && r.ok) {
      showDebug(r);
      if (r.state && r.state.ready) return true;
    }
    setStatus('WhatsApp er internal API khujchi…');
    await sleep(2000);
  }
  return false;
}

/* ---------- internal check ---------- */

async function checkOne(tabId, number) {
  let last = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    if (stopFlag) throw new Error('STOPPED');
    try {
      last = await chrome.tabs.sendMessage(tabId, {
        toPage: true, id: nextId(), type: 'CHECK', number
      });
    } catch (e) {
      last = { ok: false, error: 'NO_SCRIPT' };
      try {
        const t = await chrome.tabs.get(tabId);
        if (t.discarded || t.status !== 'complete') {
          await chrome.tabs.reload(tabId);
          await waitReady(tabId, 90);
        }
      } catch (e2) {}
    }
    if (last && last.ok) return last;
    if (last && (last.error === 'LOGGED_OUT' || last.error === 'NOT_READY')) {
      throw new Error('CONNECTION_LOST');
    }
    if (attempt < 3) await sleep(2500);
  }
  return last || { ok: false, error: 'NO_RESPONSE' };
}

/* ---------- UI (safe) mode ---------- */

async function runUiChecks(items, record) {
  let uiTab = null;
  const total = items.length;
  let idx = 0;
  try {
    for (const item of items) {
      idx++;
      if (stopFlag) break;
      if (item.invalid) { record(item, { ok: true, invalid: true }); continue; }

      const url = 'https://web.whatsapp.com/send?phone=' + item.number;
      if (!uiTab) {
        uiTab = await chrome.tabs.create({ url: url, active: false });
      } else {
        await chrome.tabs.update(uiTab.id, { url: url });
      }

      setStatus(`[UI] +${item.number} (${idx}/${total}) — page load hocche…`);

      let loaded = false;
      for (let i = 0; i < 25 && !stopFlag; i++) {
        const r = await ping(uiTab.id);
        if (r && r.ok && r.injectAlive && r.state && r.state.login === 'qr') {
          throw new Error('LOGGED_OUT');
        }
        if (r && r.ok && r.injectAlive && r.state && r.state.login === 'ready') { loaded = true; break; }
        await sleep(2000);
      }

      let res;
      if (!loaded) {
        res = { ok: false, error: 'TAB_LOAD_FAIL' };
      } else {
        setStatus(`[UI] +${item.number} (${idx}/${total}) — result er jonno wait…`);
        res = null;
        for (let a = 0; a < 2 && !stopFlag; a++) {
          try {
            res = await chrome.tabs.sendMessage(uiTab.id, {
              toPage: true, id: nextId(), type: 'UI_CHECK', number: item.number
            });
            if (res && res.ok) break;
          } catch (e) {}
          await sleep(2000);
        }
        res = res || { ok: false, error: 'UI_NO_RESPONSE' };
      }

      record(item, res);
      await sleep(1500);
    }
  } finally {
    if (uiTab) { try { await chrome.tabs.remove(uiTab.id); } catch (e) {} }
  }
}

/* ---------- result render ---------- */

function classify(item, res) {
  if (item.invalid) return { number: item.number, status: 'invalid', label: '⚠️ Invalid format' };
  if (res.ok && res.exists) return { number: item.number, status: 'yes', label: '✅ Available' };
  if (res.ok && !res.exists) return { number: item.number, status: 'no', label: '❌ Not found' };
  return { number: item.number, status: 'err', label: '⚠️ ' + (res.error || 'Error') };
}

function addRow(row) {
  const tr = document.createElement('tr');

  const td1 = document.createElement('td');
  td1.textContent = '+' + row.number;

  const td2 = document.createElement('td');
  td2.textContent = row.label;
  td2.className = row.status === 'yes' ? 'ok' : row.status === 'no' ? 'no' : 'err';

  const td3 = document.createElement('td');
  if (row.status === 'yes') {
    const a = document.createElement('a');
    a.textContent = 'Open chat →';
    a.addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: 'https://wa.me/' + row.number, active: false });
    });
    td3.appendChild(a);
  } else {
    td3.textContent = '—';
  }

  tr.append(td1, td2, td3);
  $('resultBody').appendChild(tr);
  $('resultWrap').scrollTop = $('resultWrap').scrollHeight;
}

function updateSummary() {
  const yes = results.filter((r) => r.status === 'yes').length;
  const no = results.filter((r) => r.status === 'no').length;
  const bad = results.length - yes - no;
  $('summary').textContent = `✅ ${yes}   ❌ ${no}   ⚠️ ${bad}`;
  try { localStorage.setItem('waResults', JSON.stringify(results)); } catch (e) {}
}

/* ---------- main ---------- */

async function startCheck() {
  if (running) return;

  const items = parseNumbers($('numbers').value);
  if (!items.length) { setStatus('Age number likun!'); return; }

  running = true;
  stopFlag = false;
  results = [];
  $('resultBody').innerHTML = '';
  $('progressBar').style.width = '0%';
  $('checkBtn').disabled = true;
  $('stopBtn').disabled = false;

  const method = $('method').value;
  const delaySec = Math.max(1, parseFloat($('delay').value) || 3);
  try { localStorage.setItem('waDelay', String(delaySec)); localStorage.setItem('waMethod', method); } catch (e) {}

  const total = items.length;
  let done = 0;

  const record = (item, res) => {
    const row = classify(item, res);
    results.push(row);
    addRow(row);
    updateSummary();
    done++;
    $('progressBar').style.width = ((done / total) * 100).toFixed(1) + '%';
  };

  try {
    const tab = await getWaTab();
    const state = await waitReady(tab.id);

    let useInternal;
    if (method === 'safe') useInternal = false;
    else if (state.ready) useInternal = true;
    else useInternal = await waitForApi(tab.id, method === 'fast' ? 20 : 25);

    if (useInternal) {
      setStatus('Fast mode: WhatsApp er API diye check hocche…');
      for (const item of items) {
        if (stopFlag) break;
        setStatus(`Checking +${item.number}… (${done + 1}/${total})`);
        let res;
        if (item.invalid) res = { ok: true, invalid: true };
        else res = await checkOne(tab.id, item.number);
        record(item, res);
        if (!item.invalid && done < total) await sleep(delaySec * 1000 + Math.random() * 1500);
      }
    } else {
      if (method === 'fast') throw new Error('FAST_FAIL');
      setStatus('Safe (UI) mode: prottek number e ~10–20s lagbe…');
      await runUiChecks(items, record);
    }

    setStatus(stopFlag ? '⏹ Stopped.' : '✅ Done! (' + total + ' number)');
  } catch (e) {
    const m = e && e.message;
    if (m === 'STOPPED') setStatus('⏹ Stopped.');
    else if (m === 'CONNECTION_LOST') setStatus('⚠️ WhatsApp connection/logout hoye geche — abar start din.');
    else if (m === 'FAST_FAIL') setStatus('⚠️ API pawa jay nai — Method "Safe (UI)" kore run koren.');
    else if (m === 'LOGGED_OUT') setStatus('⚠️ WhatsApp Web e login nei!');
    else setStatus('⚠️ ' + (m || 'Unknown error'));
  } finally {
    running = false;
    stopFlag = false;
    $('checkBtn').disabled = false;
    $('stopBtn').disabled = true;
  }
}

/* ---------- buttons ---------- */

 $('checkBtn').addEventListener('click', startCheck);
 $('stopBtn').addEventListener('click', () => { stopFlag = true; });

 $('clearBtn').addEventListener('click', () => {
  results = [];
  $('resultBody').innerHTML = '';
  $('summary').textContent = '';
  $('progressBar').style.width = '0%';
  try { localStorage.removeItem('waResults'); } catch (e) {}
});

 $('copyBtn').addEventListener('click', () => {
  if (!results.length) return;
  const text = results.map((r) => `+${r.number}\t${r.label}`).join('\n');
  navigator.clipboard.writeText(text).then(() => setStatus('📋 Copied!'));
});

 $('csvBtn').addEventListener('click', () => {
  if (!results.length) return;
  const csv = 'Number,Status\n' + results.map((r) => `"+${r.number}","${r.label}"`).join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'whatsapp_results.csv';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
});

 $('dbgBtn').addEventListener('click', () => {
  const info = {
    when: new Date().toISOString(),
    lastPing: lastPingRaw,
    resultCount: results.length
  };
  navigator.clipboard.writeText(JSON.stringify(info, null, 2))
    .then(() => setStatus('🐞 Debug info copied — chat e paste kore amake pathan.'));
});

/* ---------- restore ---------- */
try {
  const d = localStorage.getItem('waDelay');
  if (d) $('delay').value = d;
  const m = localStorage.getItem('waMethod');
  if (m) $('method').value = m;
  const saved = JSON.parse(localStorage.getItem('waResults') || '[]');
  if (Array.isArray(saved) && saved.length) {
    results = saved;
    saved.forEach(addRow);
    updateSummary();
  }
} catch (e) {}