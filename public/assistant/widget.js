/*
  BC Real Estate Market \u2014 chat pop-up for your website
  ----------------------------------------------------
  Add ONE line before </body> on every page:

    <script src="/assistant/widget.js" data-app="/assistant/index.html" defer></script>

  data-app = where index.html is hosted. The chat loads only when a visitor opens it.
*/
(function () {
  if (window.__bcreWidget) return; window.__bcreWidget = true;
  var me = document.currentScript;
  var APP = (me && me.getAttribute('data-app')) || '/assistant/index.html';
  var css = ''
  + '.bcre-bubble{position:fixed;z-index:2147483000;right:calc(20px + env(safe-area-inset-right,0px));bottom:calc(20px + env(safe-area-inset-bottom,0px));width:60px;height:60px;border-radius:50%;border:3px solid #fff;background:linear-gradient(135deg,#122e4e,#22558b 55%,#2c6dae);color:#fff;cursor:pointer;display:grid;place-items:center;box-shadow:0 12px 30px -8px rgba(18,46,78,.6);transition:transform .15s}'
  + '.bcre-bubble:after{content:"";position:absolute;top:2px;right:2px;width:13px;height:13px;border-radius:50%;background:#14b514;border:2px solid #fff}.bcre-bubble:hover{transform:scale(1.05)}.bcre-bubble svg{width:26px;height:26px}'
  + '.bcre-hello{position:fixed;z-index:2147483000;right:calc(20px + env(safe-area-inset-right,0px));bottom:calc(92px + env(safe-area-inset-bottom,0px));max-width:min(290px,calc(100vw - 40px));background:#fff;color:#0f1b2d;border:1px solid #e7ebf1;border-radius:16px 16px 4px 16px;padding:12px 34px 12px 14px;font:14.5px/1.45 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;box-shadow:0 14px 34px -14px rgba(18,46,78,.35);cursor:pointer;opacity:0;transform:translateY(8px);pointer-events:none;transition:.25s}'
  + '@keyframes bcreWave{0%,60%,100%{transform:rotate(0)}6%,18%,30%{transform:rotate(16deg)}12%,24%{transform:rotate(-8deg)}36%{transform:rotate(10deg)}}.bcre-wave{display:inline-block;transform-origin:70% 75%;animation:bcreWave 2.6s ease-in-out infinite;font-size:1.15em}.bcre-hi{display:block;font-size:15.5px;margin-bottom:2px;color:#22558b}@media (prefers-reduced-motion:reduce){.bcre-wave{animation:none!important}}'
  + '.bcre-hello.show{opacity:1;transform:none;pointer-events:auto}.bcre-hello b{position:absolute;top:5px;right:9px;font-size:18px;color:#7a889c;font-weight:400;cursor:pointer}'
  + '.bcre-panel{position:fixed;z-index:2147483001;right:calc(20px + env(safe-area-inset-right,0px));bottom:calc(92px + env(safe-area-inset-bottom,0px));width:400px;height:min(680px,calc(100vh - 120px));background:#fff;border:1px solid #e7ebf1;border-radius:20px;overflow:hidden;box-shadow:0 30px 70px -20px rgba(18,46,78,.4);display:none;flex-direction:column}'
  + '.bcre-open .bcre-panel{display:flex;animation:bcreUp .22s ease}@keyframes bcreUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}'
  + '.bcre-head{display:flex;align-items:center;gap:10px;padding:12px 10px 12px 16px;border-bottom:1px solid #f1f4f8;font:14px system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#0f1b2d;position:relative}'
  + '.bcre-head .t{flex:1;line-height:1.25}.bcre-head .t b{display:block;font-size:15px}.bcre-head .t small{color:#0f7b56;font-size:12px}'
  + '.bcre-mark{width:28px;height:28px;border-radius:8px;background:#22558b;display:grid;place-items:center}.bcre-mark svg{width:16px;height:16px}'
  + '.bcre-x{width:36px;height:36px;border:0;border-radius:50%;background:transparent;cursor:pointer;color:#44546b;display:grid;place-items:center}.bcre-x:hover{background:#f1f4f8}.bcre-x svg{width:19px;height:19px}'
  + '.bcre-panel iframe{flex:1;width:100%;border:0}'
  + '.bcre-scrim{display:none}'
  + '@media (max-width:600px){.bcre-panel{left:0;right:0;bottom:0;width:auto;height:86vh;height:86dvh;border-radius:20px 20px 0 0;border-bottom:0}'
  + '.bcre-open .bcre-bubble,.bcre-open .bcre-hello{display:none}.bcre-open .bcre-scrim{display:block;position:fixed;inset:0;z-index:2147483000;background:rgba(15,27,45,.38)}'
  + '.bcre-head{padding-top:16px}.bcre-head:before{content:"";position:absolute;top:6px;left:50%;width:38px;height:4px;margin-left:-19px;border-radius:9px;background:#e7ebf1}}';
  var style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  var house = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></svg>';
  var chat = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>';
  var x = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  var root = document.createElement('div'); root.className = 'bcre-root';
  root.innerHTML = '<div class="bcre-scrim"></div>'
    + '<div class="bcre-hello" role="button"><span class="bcre-msg"><strong class="bcre-hi">Hi there! <span class="bcre-wave">\ud83d\udc4b</span></strong> Looking for a home or curious what yours is worth? Or just ask me anything!</span><b aria-label="Dismiss">\u00d7</b></div>'
    + '<div class="bcre-panel" role="dialog" aria-label="BC Real Estate AI chat"><div class="bcre-head"><span class="bcre-mark">' + house + '</span><div class="t"><b>BC Real Estate AI</b><small>Online \u00b7 replies instantly</small></div><button class="bcre-x" aria-label="Close chat">' + x + '</button></div></div>'
    + '<button class="bcre-bubble" aria-label="Open chat">' + chat + '</button>';
  document.body.appendChild(root);

  var panel = root.querySelector('.bcre-panel'), bubble = root.querySelector('.bcre-bubble'), hello = root.querySelector('.bcre-hello'), frame = null;
  function open() {
    if (!frame) { frame = document.createElement('iframe'); frame.src = APP + '#embed'; frame.title = 'BC Real Estate AI chat'; panel.appendChild(frame); }
    root.classList.add('bcre-open'); hello.classList.remove('show'); bubble.innerHTML = x; bubble.setAttribute('aria-label', 'Close chat');
  }
  var answered = false, saidBye = false;
  var BYES = ['Leaving already? \ud83e\udd7a I enjoyed your company \u2014 come back anytime \ud83d\udc4b', 'Bye for now! \ud83d\ude0a I\u2019ll keep your seat warm \ud83e\ude91', 'See you soon! \ud83c\udfe1 I\u2019ll be right here if you need me.'];
  window.addEventListener('message', function (e) { if (e.data && e.data.bcre === 'answered') answered = true; });
  function close() {
    root.classList.remove('bcre-open'); bubble.innerHTML = chat; bubble.setAttribute('aria-label', 'Open chat');
    if (answered && !saidBye) {
      saidBye = true;
      hello.querySelector('.bcre-msg').textContent = BYES[Math.floor(Math.random() * BYES.length)];
      hello.classList.add('show'); setTimeout(function () { hello.classList.remove('show'); }, 6000);
    }
  }
  bubble.addEventListener('click', function () { root.classList.contains('bcre-open') ? close() : open(); });
  root.querySelector('.bcre-x').addEventListener('click', close);
  root.querySelector('.bcre-scrim').addEventListener('click', close);
  hello.addEventListener('click', function (e) { if (e.target.tagName === 'B') { hello.classList.remove('show'); try { sessionStorage.setItem('bcreHello', '1'); } catch (_) {} } else open(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  var seen = false; try { seen = sessionStorage.getItem('bcreHello') === '1'; } catch (_) {}
  if (!seen) setTimeout(function () { if (!root.classList.contains('bcre-open')) hello.classList.add('show'); }, 3000);
})();
