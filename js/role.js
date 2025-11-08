// js/role.js
// ==========================================================
// ExpoLink Role Selector 模組（Visitor / Exhibitor）
// ==========================================================

const Role = (() => {
  const KEY = 'expo.role'; // 'visitor' | 'exhibitor'

  const el = {
    page: document.getElementById('rolePage'),
    cards: null,
    skip: null,
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
    if (role === 'visitor') {
      location.hash = ''; // 回首頁
    } else {
      location.hash = '#account'; // 去會員中心
    }
  }

  function bind() {
    el.cards = el.page?.querySelectorAll('.role-card');
    el.skip = document.getElementById('roleSkip');

    el.cards?.forEach((btn) =>
      btn.addEventListener('click', () => {
        const role = btn.getAttribute('data-role');
        go(role);
      })
    );

    el.skip?.addEventListener('click', (e) => {
      e.preventDefault();
      go('visitor');
    });
  }

  // 首次開站守門：若無 role → 顯示角色頁
  function guard() {
    const role = get();
    if (!role) {
      show();
      // 隱藏其他主要區塊
      const ids = [
        'hero',
        'expoInfo',
        'ecardPage',
        'brandsPage',
        'contactPage',
        'transportPage',
        'accountPage',
      ];
      const qa = document.querySelector('.quick-actions');
      const powered = document.querySelector('.powered');
      const fab = document.getElementById('scanFab');

      const hideEl = (x) => {
        if (!x) return;
        if ('hidden' in x) {
          x.hidden = true;
          x.setAttribute('aria-hidden', 'true');
        } else {
          x.style.display = 'none';
        }
      };

      ids.forEach((id) => hideEl(document.getElementById(id)));
      qa && (qa.style.display = 'none');
      powered && (powered.style.display = 'none');
      fab && (fab.style.display = 'none');

      document.title = '選擇角色 | ExpoLink';
      return true;
    } else {
      hide();
      return false;
    }
  }

  function reset() {
    clear();
    location.hash = '#role';
    guard();
  }

  function init() {
    bind();
    // 若網址為 #role，也顯示角色頁並清除紀錄
    if ((location.hash || '').replace('#', '') === 'role') {
      clear();
    }
    guard();
  }

  return { init, get, reset, guard };
})();

// 啟動
window.addEventListener('DOMContentLoaded', () => {
  Role.init();
});