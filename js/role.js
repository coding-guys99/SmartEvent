// js/role.js
// ExpoLink Role module — 只負責 role 的存取與選擇
(function () {
  const KEY = 'expo.role'; // 'visitor' | 'exhibitor'

  const el = {
    page: document.getElementById('rolePage'),
    cards: null,
    skip: null
  };

  function get() {
    return localStorage.getItem(KEY) || '';
  }
  function set(v) {
    localStorage.setItem(KEY, v);
  }
  function clear() {
    localStorage.removeItem(KEY);
  }

  function show() {
    el.page?.removeAttribute('hidden');
    el.page?.setAttribute('aria-hidden', 'false');
  }
  function hide() {
    el.page?.setAttribute('hidden', 'true');
    el.page?.setAttribute('aria-hidden', 'true');
  }

  function go(role) {
    set(role);
    // 交給 Router，這裡不做顯示/隱藏
    if (role === 'visitor') {
      location.hash = '';       // 回首頁
    } else {
      location.hash = '#account';
    }
  }

  function bind() {
    el.cards = el.page?.querySelectorAll('.role-card');
    el.skip  = document.getElementById('roleSkip');

    el.cards?.forEach((btn) => {
      btn.addEventListener('click', () => {
        const role = btn.getAttribute('data-role');
        go(role);
      });
    });

    el.skip?.addEventListener('click', (e) => {
      e.preventDefault();
      go('visitor');
    });
  }

  // Router 會呼叫：當 hash === 'role' 時顯示，否則隱藏
  function mountIfHashIsRole() {
    if ((location.hash || '').replace('#','') === 'role') {
      show();
      return true;
    }
    hide();
    return false;
  }

  function init() {
    bind();
    // 若網址為 #role → 清除舊記錄，好讓使用者能重選
    if ((location.hash || '').replace('#','') === 'role') {
      clear();
    }
  }

  window.Role = { init, get, clear, show, hide, mountIfHashIsRole };
})();