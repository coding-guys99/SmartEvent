/* ==========================================================
 * Role — 角色選擇（Visitor / Exhibitor）
 * 規則：
 *  - 未選角色 → 自動導到 #role，由 router 控畫面
 *  - 點選角色 → 存 localStorage 並回首頁
 * ========================================================== */
(function () {
  const KEY = 'expo.role'; // 'visitor' | 'exhibitor'

  function get()  { return localStorage.getItem(KEY) || ''; }
  function set(v) { localStorage.setItem(KEY, v); }
  function clear(){ localStorage.removeItem(KEY); }

  function show() {
    const p = document.getElementById('rolePage');
    p?.removeAttribute('hidden');
    p?.setAttribute('aria-hidden', 'false');
  }
  function hide() {
    const p = document.getElementById('rolePage');
    p?.setAttribute('hidden', 'true');
    p?.setAttribute('aria-hidden', 'true');
  }

  function go(role) {
    if (!role) return;
    set(role);
    hide();                 // 先關掉畫面避免殘影
    location.hash = '';     // 回首頁，讓 router 負責顯示
    document.title = 'ExpoLink';
  }

  // 首次守門：無角色 → 導到 #role
  function guard() {
    const has = !!get();
    if (!has) {
      if ((location.hash || '') !== '#role') {
        location.hash = '#role'; // 交給 router 顯示
      } else {
        show();
      }
    } else {
      hide();
    }
    return !has;
  }

  function bind() {
    const page = document.getElementById('rolePage');
    page?.querySelectorAll('.role-card').forEach(btn => {
      btn.addEventListener('click', () => go(btn.getAttribute('data-role')));
    });
    const skip = document.getElementById('roleSkip');
    skip?.addEventListener('click', (e) => { e.preventDefault(); go('visitor'); });
  }

  function reset() { clear(); location.hash = '#role'; guard(); }

  function init() {
    bind();
    // 若網址就是 #role，當作重選一次，清掉舊值
    if ((location.hash || '').replace('#', '') === 'role') clear();
    guard();
  }

  window.Role = { init, guard, get, reset, set, clear };
})();