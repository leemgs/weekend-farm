/*
 * site.js — 간단한 접속 코드 게이트 (client-side access gate)
 *
 * ⚠️ 보안 경고: 이것은 "초대받은 사용자"를 위한 간단한 접근 제한일 뿐,
 *   민감정보 보호 수단이 아닙니다. 접속 코드의 SHA-256 해시가
 *   config/access.json 으로 클라이언트에 그대로 노출되고, 모든 검증이
 *   브라우저에서 이뤄지므로 진짜 보안 경계로 사용하면 안 됩니다.
 *
 * 동작:
 *   1) initAuth()  — 페이지 로드 시 호출. sessionStorage에 허용 상태가 없으면
 *                    전체 화면 게이트를 띄우고 config/access.json의 digest를 읽어둡니다.
 *   2) unlock(code) — 입력한 코드를 브라우저에서 SHA-256으로 해시한 뒤
 *                    access.json의 digest와 비교. 일치하면 sessionStorage에
 *                    접근 허용 상태를 기록하고 게이트를 닫습니다.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'wf_access_granted';
  var CONFIG_URL = 'config/access.json';

  var state = { digests: [], version: null, loaded: false };

  /* ---- 유틸: sessionStorage 안전 접근 ---- */
  function isGranted() {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === 'granted';
    } catch (e) {
      return false;
    }
  }
  function markGranted() {
    try { sessionStorage.setItem(STORAGE_KEY, 'granted'); } catch (e) { /* ignore */ }
  }

  /* ---- 브라우저 SHA-256 → 소문자 hex ---- */
  function sha256Hex(text) {
    var subtle = (window.crypto && window.crypto.subtle) || null;
    if (!subtle) {
      return Promise.reject(new Error('insecure-context'));
    }
    var bytes = new TextEncoder().encode(text);
    return subtle.digest('SHA-256', bytes).then(function (buf) {
      var arr = Array.prototype.slice.call(new Uint8Array(buf));
      return arr.map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    });
  }

  /* ---- access.json 로드 ---- */
  function loadConfig() {
    return fetch(CONFIG_URL, { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('config ' + res.status);
        return res.json();
      })
      .then(function (cfg) {
        // 하나 이상의 접속 코드를 지원: digests(배열) 우선, 단일 digest도 허용.
        var list = [];
        if (Array.isArray(cfg.digests)) list = cfg.digests;
        else if (cfg.digest) list = [cfg.digest];
        state.digests = list
          .map(function (d) { return String(d || '').toLowerCase(); })
          .filter(Boolean);
        state.version = cfg.version;
        state.loaded = true;
        return state;
      });
  }

  /* ---- 게이트 UI ---- */
  function buildGate() {
    if (document.getElementById('wf-gate')) return;

    var style = document.createElement('style');
    style.id = 'wf-gate-style';
    style.textContent = [
      'html.wf-locked, html.wf-locked body { overflow: hidden !important; }',
      '#wf-gate{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;padding:24px;',
      'background:linear-gradient(160deg,#4a6b52 0%,#3f5f48 60%,#33503d 100%);',
      "font-family:Pretendard,'Noto Sans KR',system-ui,sans-serif;}",
      '#wf-gate .wf-card{width:min(420px,100%);padding:34px 30px;border-radius:24px;',
      'background:rgba(253,250,242,.96);box-shadow:0 30px 70px -28px rgba(20,40,28,.7);text-align:center;}',
      '#wf-gate .wf-mark{width:52px;height:52px;margin:0 auto 14px;display:grid;place-items:center;',
      'border-radius:52% 48% 55% 45%;background:radial-gradient(circle at 35% 30%,#7fa070,#4a6b52 80%);',
      'color:#fff;font-size:26px;}',
      '#wf-gate h1{margin:0 0 6px;font-size:21px;color:#2c4536;',
      "font-family:'Nanum Myeongjo','Noto Serif KR',Georgia,serif;}",
      '#wf-gate p{margin:0 0 20px;font-size:13px;line-height:1.7;color:#68756a;}',
      '#wf-gate form{display:flex;gap:8px;}',
      '#wf-gate input{flex:1;min-width:0;padding:13px 15px;border:1px solid rgba(74,107,82,.3);',
      'border-radius:12px;font:inherit;background:#fff;color:#2c4536;}',
      '#wf-gate input:focus{outline:2px solid #7fa070;outline-offset:1px;}',
      '#wf-gate button{border:0;border-radius:12px;padding:13px 20px;font:inherit;font-weight:800;',
      'cursor:pointer;color:#fff;background:linear-gradient(135deg,#5a7d5f,#4a6b52);}',
      '#wf-gate button:disabled{opacity:.6;cursor:progress;}',
      '#wf-gate .wf-msg{min-height:18px;margin:12px 0 0;font-size:12px;font-weight:700;color:#b0472f;}',
      '#wf-gate .wf-note{margin:18px 0 0;font-size:11px;line-height:1.6;color:#9aa69c;}'
    ].join('');
    document.head.appendChild(style);

    var gate = document.createElement('div');
    gate.id = 'wf-gate';
    gate.setAttribute('role', 'dialog');
    gate.setAttribute('aria-modal', 'true');
    gate.setAttribute('aria-labelledby', 'wf-gate-title');
    gate.innerHTML =
      '<div class="wf-card">' +
      '<div class="wf-mark" aria-hidden="true">葉</div>' +
      '<h1 id="wf-gate-title">초대 전용 공간</h1>' +
      '<p>이 사이트는 초대받은 분들을 위한 정보 공간입니다.<br>접속 코드를 입력해 주세요.</p>' +
      '<form id="wf-gate-form" autocomplete="off">' +
      '<input id="wf-gate-input" type="password" inputmode="text" aria-label="접속 코드" placeholder="접속 코드" autofocus>' +
      '<button type="submit" id="wf-gate-submit">입장</button>' +
      '</form>' +
      '<p class="wf-msg" id="wf-gate-msg" aria-live="polite"></p>' +
      '<p class="wf-note">정적 사이트의 간단한 접근 제한이며, 민감정보 보호 수단이 아닙니다.</p>' +
      '</div>';

    document.documentElement.classList.add('wf-locked');
    document.body.appendChild(gate);

    var form = gate.querySelector('#wf-gate-form');
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      unlock();
    });
    var input = gate.querySelector('#wf-gate-input');
    if (input && typeof input.focus === 'function') { try { input.focus(); } catch (e) {} }
  }

  function setMessage(text) {
    var el = document.getElementById('wf-gate-msg');
    if (el) el.textContent = text || '';
  }

  function removeGate() {
    document.documentElement.classList.remove('wf-locked');
    var gate = document.getElementById('wf-gate');
    if (gate && gate.parentNode) gate.parentNode.removeChild(gate);
    var style = document.getElementById('wf-gate-style');
    if (style && style.parentNode) style.parentNode.removeChild(style);
  }

  /* ---- 공개 API ---- */
  function unlock(codeArg) {
    var input = document.getElementById('wf-gate-input');
    var submit = document.getElementById('wf-gate-submit');
    var code = typeof codeArg === 'string' ? codeArg : (input ? input.value : '');

    if (!code) { setMessage('접속 코드를 입력해 주세요.'); return Promise.resolve(false); }
    if (submit) submit.disabled = true;
    setMessage('');

    var ready = state.loaded ? Promise.resolve(state) : loadConfig();

    return ready
      .then(function () {
        if (!state.digests.length) throw new Error('no-digest');
        return sha256Hex(code);
      })
      .then(function (hex) {
        if (state.digests.indexOf(hex) !== -1) {
          markGranted();
          removeGate();
          return true;
        }
        if (submit) submit.disabled = false;
        setMessage('코드가 올바르지 않습니다. 다시 확인해 주세요.');
        if (input) { input.value = ''; try { input.focus(); } catch (e) {} }
        return false;
      })
      .catch(function (err) {
        if (submit) submit.disabled = false;
        if (err && err.message === 'insecure-context') {
          setMessage('이 브라우저 환경에서는 코드 확인이 불가합니다(https 필요).');
        } else {
          setMessage('설정을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
        }
        return false;
      });
  }

  function lock() {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch (e) {}
    initAuth();
  }

  function initAuth() {
    if (isGranted()) { removeGate(); return; }
    buildGate();
    // digest를 미리 받아둡니다(실패해도 unlock 시 재시도).
    loadConfig().catch(function () { /* unlock 시점에 다시 시도 */ });
  }

  window.SiteAuth = { initAuth: initAuth, unlock: unlock, lock: lock };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
  } else {
    initAuth();
  }
})();
