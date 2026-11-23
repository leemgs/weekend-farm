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
      /* 배경: 수채화 하늘 + 초원 번짐 */
      '#wf-gate{position:fixed;inset:0;z-index:99999;display:grid;place-items:center;padding:24px;overflow:hidden;',
      'background:radial-gradient(70% 55% at 18% 12%,rgba(168,201,210,.85) 0%,transparent 62%),',
      'radial-gradient(60% 50% at 88% 8%,rgba(240,223,168,.8) 0%,transparent 60%),',
      'radial-gradient(90% 60% at 50% 108%,rgba(122,155,110,.85) 0%,transparent 66%),',
      'linear-gradient(180deg,#e6f0ea 0%,#f6efd9 58%,#dfe5c0 100%);',
      "font-family:Pretendard,'Noto Sans KR',system-ui,sans-serif;}",
      '#wf-gate::before{content:"";position:absolute;inset:-6%;pointer-events:none;filter:blur(18px);opacity:.75;',
      'background:radial-gradient(22% 28% at 15% 70%,rgba(127,160,112,.5) 0%,transparent 70%),',
      'radial-gradient(24% 26% at 85% 35%,rgba(213,150,126,.4) 0%,transparent 70%),',
      'radial-gradient(20% 24% at 60% 85%,rgba(150,187,199,.5) 0%,transparent 70%);}',
      /* 하단 언덕 + 오두막 일러스트 */
      '#wf-gate .wf-scene{position:absolute;left:0;right:0;bottom:0;width:100%;height:42vh;min-height:220px;',
      'max-height:380px;pointer-events:none;}',
      /* 구름 */
      '#wf-gate .wf-cloud{position:absolute;height:34px;border-radius:50px;background:rgba(255,255,255,.7);filter:blur(4px);',
      'animation:wfDrift 14s ease-in-out infinite alternate;}',
      '#wf-gate .wf-cloud::before,#wf-gate .wf-cloud::after{content:"";position:absolute;background:inherit;border-radius:50%;}',
      '#wf-gate .wf-cloud::before{width:46px;height:46px;left:22px;bottom:8px;}',
      '#wf-gate .wf-cloud::after{width:58px;height:50px;right:16px;bottom:6px;}',
      '#wf-gate .wf-cloud.c1{width:120px;left:8%;top:12%;}',
      '#wf-gate .wf-cloud.c2{width:96px;right:10%;top:20%;animation-duration:18s;animation-direction:alternate-reverse;}',
      '@keyframes wfDrift{to{transform:translateX(34px)}}',
      '#wf-gate .wf-house-wide{display:none;}',
      '@media (min-width:900px){#wf-gate .wf-house{display:none;}#wf-gate .wf-house-wide{display:inline;}}',
      /* 카드 */
      '#wf-gate .wf-card{position:relative;z-index:2;width:min(420px,100%);padding:42px 34px 28px;border-radius:30px 20px 32px 20px;',
      'background:linear-gradient(165deg,rgba(255,252,244,.95),rgba(246,238,216,.92));',
      'backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.7);text-align:center;',
      'box-shadow:0 34px 60px -30px rgba(40,70,48,.55),0 0 0 1px rgba(74,107,82,.08);',
      'animation:wfRise .7s cubic-bezier(.2,.8,.2,1) both;}',
      '@keyframes wfRise{from{opacity:0;transform:translateY(22px) scale(.97)}to{opacity:1;transform:none}}',
      '#wf-gate .wf-card.wf-shake{animation:wfShake .45s ease both;}',
      '@keyframes wfShake{20%{transform:translateX(-9px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(3px)}}',
      /* 로고 메달 */
      '#wf-gate .wf-mark{position:absolute;left:50%;top:-34px;width:68px;height:68px;margin-left:-34px;display:grid;place-items:center;',
      'border-radius:56% 44% 52% 48%;color:#fff;font-size:32px;border:3px solid #fffaf0;',
      'background:radial-gradient(circle at 35% 30%,#8fb27f,#4a6b52 78%);',
      'box-shadow:0 14px 24px -10px rgba(40,70,48,.7);animation:wfSway 5s ease-in-out infinite alternate;}',
      '@keyframes wfSway{from{transform:rotate(-5deg)}to{transform:rotate(5deg)}}',
      '#wf-gate .wf-eyebrow{display:block;margin-bottom:8px;font-size:10px;font-weight:800;letter-spacing:.2em;color:#c17a55;}',
      '#wf-gate h1{margin:0 0 10px;font-size:25px;line-height:1.25;color:#2c4536;letter-spacing:-.02em;',
      "font-family:'Nanum Myeongjo','Noto Serif KR',Georgia,serif;}",
      '#wf-gate .wf-lead{margin:0 0 22px;font-size:13.5px;line-height:1.75;color:#68756a;}',
      /* 입력 */
      '#wf-gate form{display:flex;flex-direction:column;gap:12px;}',
      '#wf-gate .wf-field{position:relative;display:block;}',
      '#wf-gate .wf-field svg{position:absolute;left:15px;top:50%;width:19px;height:19px;margin-top:-9.5px;color:#7fa070;pointer-events:none;}',
      '#wf-gate input{width:100%;padding:15px 16px 15px 44px;border:1.5px solid rgba(74,107,82,.22);border-radius:16px;',
      'font:inherit;font-size:15px;letter-spacing:.04em;background:rgba(255,255,255,.85);color:#2c4536;',
      'transition:border-color .2s,box-shadow .2s,background .2s;}',
      '#wf-gate input::placeholder{color:#a7b1a6;letter-spacing:0;}',
      '#wf-gate input:focus{outline:0;border-color:#7fa070;background:#fff;box-shadow:0 0 0 4px rgba(127,160,112,.22);}',
      '#wf-gate button{border:0;border-radius:16px;padding:15px 20px;font:inherit;font-size:15px;font-weight:800;cursor:pointer;',
      'color:#fff;background:linear-gradient(135deg,#6f9366,#4a6b52);letter-spacing:.04em;',
      'box-shadow:0 16px 26px -14px rgba(40,70,48,.85);transition:transform .2s,box-shadow .2s;}',
      '#wf-gate button:hover{transform:translateY(-2px);box-shadow:0 20px 30px -14px rgba(40,70,48,.85);}',
      '#wf-gate button:disabled{opacity:.6;cursor:progress;transform:none;}',
      '#wf-gate .wf-msg{min-height:20px;margin:12px 0 0;font-size:12.5px;font-weight:700;color:#b0472f;}',
      '#wf-gate .wf-note{margin:6px 0 0;padding-top:14px;border-top:1px dashed rgba(74,107,82,.2);font-size:11px;line-height:1.6;color:#9aa69c;}',
      '@media (max-width:480px){#wf-gate .wf-card{padding:42px 22px 22px;}#wf-gate h1{font-size:22px;}}',
      '@media (prefers-reduced-motion:reduce){#wf-gate *,#wf-gate .wf-card{animation:none !important;}}'
    ].join('');
    document.head.appendChild(style);

    var scene =
      '<svg class="wf-scene" viewBox="0 0 1200 380" preserveAspectRatio="xMidYMax slice" aria-hidden="true">' +
      '<defs>' +
      '<filter id="wf-wc" x="-5%" y="-10%" width="110%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="2" seed="5" result="n"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="n" scale="12"/></filter>' +
      '<linearGradient id="wf-h1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9c48a"/><stop offset="1" stop-color="#7fa070"/></linearGradient>' +
      '<linearGradient id="wf-h2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6f9366"/><stop offset="1" stop-color="#4a6b52"/></linearGradient>' +
      '</defs>' +
      '<g filter="url(#wf-wc)">' +
      '<path d="M0 230 Q220 120 460 220 T900 190 T1200 170 V380 H0Z" fill="url(#wf-h1)" opacity=".85"/>' +
      '<path d="M0 290 Q260 200 520 280 T1010 255 T1200 240 V380 H0Z" fill="url(#wf-h2)"/>' +
      '<g fill="#3d6948"><path d="M90 300l30-92 30 92z"/><path d="M128 304l24-76 26 76z"/><path d="M1020 270l28-88 31 88z"/><path d="M1064 280l25-76 27 76z"/></g>' +
      '<g class="wf-house" transform="translate(560 190)"><rect x="0" y="58" width="132" height="94" rx="4" fill="#ecd29a"/>' +
      '<path d="M-16 66L66 4l82 62z" fill="#c1583f"/><rect x="50" y="94" width="34" height="58" rx="17 17 0 0" fill="#4a6b52"/>' +
      '<rect x="14" y="82" width="26" height="30" fill="#9fc3c8" stroke="#fff3cf" stroke-width="5"/>' +
      '<rect x="94" y="82" width="26" height="30" fill="#9fc3c8" stroke="#fff3cf" stroke-width="5"/>' +
      '<rect x="100" y="14" width="15" height="34" fill="#7a5442"/></g>' +
      '<g class="wf-house-wide" transform="translate(905 175) scale(1.1)"><rect x="0" y="58" width="132" height="94" rx="4" fill="#ecd29a"/>' +
      '<path d="M-16 66L66 4l82 62z" fill="#c1583f"/><rect x="50" y="94" width="34" height="58" rx="17 17 0 0" fill="#4a6b52"/>' +
      '<rect x="14" y="82" width="26" height="30" fill="#9fc3c8" stroke="#fff3cf" stroke-width="5"/>' +
      '<rect x="94" y="82" width="26" height="30" fill="#9fc3c8" stroke="#fff3cf" stroke-width="5"/>' +
      '<rect x="100" y="14" width="15" height="34" fill="#7a5442"/></g>' +
      '<g fill="#fff3bc"><circle cx="260" cy="300" r="5"/><circle cx="330" cy="288" r="5"/><circle cx="800" cy="296" r="5"/><circle cx="880" cy="284" r="5"/></g>' +
      '<g fill="#f2a58e"><circle cx="292" cy="312" r="5"/><circle cx="840" cy="308" r="5"/></g>' +
      '</g></svg>';

    var keyIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<circle cx="8" cy="15" r="4"/><path d="M10.8 12.2L20 3M16 7l3 3M13.5 9.5l2 2"/></svg>';

    var gate = document.createElement('div');
    gate.id = 'wf-gate';
    gate.setAttribute('role', 'dialog');
    gate.setAttribute('aria-modal', 'true');
    gate.setAttribute('aria-labelledby', 'wf-gate-title');
    gate.innerHTML =
      '<span class="wf-cloud c1" aria-hidden="true"></span><span class="wf-cloud c2" aria-hidden="true"></span>' +
      scene +
      '<div class="wf-card">' +
      '<div class="wf-mark" aria-hidden="true">葉</div>' +
      '<span class="wf-eyebrow">WEEKEND FARM RETREAT</span>' +
      '<h1 id="wf-gate-title">초대받은 분만 들어올 수 있는<br>작은 농장이에요</h1>' +
      '<p class="wf-lead">초대 때 받은 접속 코드를 입력하고<br>바람이 쉬어가는 아지트로 들어오세요.</p>' +
      '<form id="wf-gate-form" autocomplete="off">' +
      '<label class="wf-field">' + keyIcon +
      '<input id="wf-gate-input" type="password" inputmode="text" aria-label="접속 코드" placeholder="접속 코드를 입력하세요" autofocus></label>' +
      '<button type="submit" id="wf-gate-submit">아지트 입장하기</button>' +
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
    var card = document.querySelector('#wf-gate .wf-card');
    if (card && text) {
      card.classList.remove('wf-shake');
      void card.offsetWidth;
      card.classList.add('wf-shake');
    }
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
