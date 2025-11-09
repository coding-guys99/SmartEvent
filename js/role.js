// js/role.js
// ExpoLink Role module — 角色選擇（Global / 無匯入依賴）
(function () {
  const KEY = 'expo.role'; // 'visitor' | 'exhibitor' ... 任意字串皆可
  const USE_SLASH = true;  // 統一導頁風格：true -> "#/route"；false -> "#route"

  // ------ helpers ------
  function get() {
    try { return localStorage.getItem(KEY) || ''; } catch(e){ return ''; }
  }
  function set(v) {
    try { localStorage.setItem(KEY, v || ''); } catch(e){}
  }
  function clear() {
    try { localStorage.removeItem(KEY); } catch(e){}
  }

  function parseRouteFromHash(h){
    // "#/role" -> "role" ; "#role" -> "role" ; "" -> ""
    const s = String(h || '');
    if (!s) return '';
    if (s.startsWith('#/')) return s.slice(2);
    if (s.startsWith('#'))  return s.slice(1);
    return s;
  }

  function hashFor(route){
    const r = String(route || '').replace(/^\/+/, '');
    return USE_SLASH ? `#/${r}` : `#${r}`;
  }

  function setHash(route){
    const want = hashFor(route);
    if (location.hash !== want) location.hash = want;
  }

  // ------ DOM refs（延後查找，避免早期為 null） ------
  let elPage = null;
  let elsCards = [];
  let elSkip  = null;

  function ensureRefs(){
    if (!elPage) elPage = document.getElementById('rolePage');
    if (elPage && (!elsCards || !elsCards.length)) {
      elsCards = Array.from(elPage.querySelectorAll('.role-card'));
    }
    if (!elSkip) elSkip = document.getElementById('roleSkip');
  }

  // ------ UI show/hide ------
  function show() {
    ensureRefs();
    elPage?.removeAttribute('hidden');
    elPage?.setAttribute('aria-hidden', 'false');
  }
  function hide() {
    ensureRefs();
    elPage?.setAttribute('hidden', 'true');
    elPage?.setAttribute('aria-hidden', 'true');
  }

  // ------ flow ------
  function go(role) {
    set(role);
    // 交給 Router：這裡只改 hash，不直接操控各頁顯示
    if (role === 'visitor' || !role) {
      setHash('home');          // 回首頁（可改成你的預設頁）
    } else {
      setHash('account');       // 另一種角色導到 account（可依需求調整）
    }
  }

  function bind(){
    ensureRefs();

    // 綁角色卡
    if (elsCards && elsCards.length) {
      elsCards.forEach(btn=>{
        btn.addEventListener('click', ()=>{
          const role = btn.getAttribute('data-role') || '';
          go(role);
        });
      });
    }

    // 綁「跳過」
    if (elSkip) {
      elSkip.addEventListener('click', (e)=>{
        e.preventDefault();
        go('visitor');
      });
    }
  }

  // Router 會呼叫或由本模組自己監聽：當 hash 指到 role 頁面時顯示，否則隱藏
  function mountIfHashIsRole() {
    const r = parseRouteFromHash(location.hash);
    if (r === 'role') {
      // 只有在真正進入 #/role 時，才清掉舊角色，讓使用者可重選
      clear();
      show();
      return true;
    }
    hide();
    return false;
  }

  // ---- init：確保 DOM ready 後再綁 ----
  function init(){
    const run = ()=>{
      bind();
      // 初次依 hash 狀態顯示/隱藏
      mountIfHashIsRole();
      // 之後每次 hash 變更都重新判斷
      window.addEventListener('hashchange', mountIfHashIsRole);
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', run, { once:true });
    } else {
      run();
    }
  }

  // 對外 API
  window.Role = { init, get, set, clear, show, hide, mountIfHashIsRole, go };
})();