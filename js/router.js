// js/router.js
// 單一真相來源：這支負責所有區塊的顯示/隱藏（含 role）
(function () {
  // 抓一次 DOM（避免每次重撈）
  const el = {
    // 首頁模組
    hero:       document.getElementById('hero'),
    qa:         document.querySelector('.quick-actions'),
    info:       document.getElementById('expoInfo'),
    powered:    document.querySelector('.powered'),
    cd:         document.getElementById('cdWidget'),      // 倒數
    activity:   document.getElementById('activityCard'),  // 你新增的活動圖片槽（若沒有也沒關係）
    // 子頁
    ecard:      document.getElementById('ecardPage'),
    brands:     document.getElementById('brandsPage'),
    contact:    document.getElementById('contactPage'),
    transport:  document.getElementById('transportPage'),
    account:    document.getElementById('accountPage'),
    about:      document.getElementById('aboutPage'),
    role:       document.getElementById('rolePage'),
    // 其他
    fab:        document.getElementById('scanFab')
  };

  // 小工具
  const setVisible = (node, show) => {
    if (!node) return;
    node.hidden = !show;
    node.setAttribute('aria-hidden', String(!show));
    // 兼容你有些用 style.display 的地方
    if ('style' in node) node.style.display = show ? '' : (node.tagName === 'SECTION' || node.tagName === 'MAIN' ? '' : 'none');
  };

  function showHome() {
    setVisible(el.hero, true);
    if (el.qa)      el.qa.style.display = '';
    setVisible(el.info, true);
    setVisible(el.cd, !!el.cd);           // 有就顯示
    setVisible(el.activity, !!el.activity);
    setVisible(el.powered, true);

    // 關掉子頁
    ['ecard','brands','contact','transport','account','about','role']
      .forEach(k => setVisible(el[k], false));

    if (el.fab) el.fab.style.display = '';
    document.title = 'ExpoLink';
  }

  function showOnly(pageEl, title) {
    // 隱藏所有首頁模組（確保首頁專屬圖/倒數不會外溢）
    if (el.hero)     el.hero.style.display = 'none';
    if (el.qa)       el.qa.style.display = 'none';
    setVisible(el.info, false);
    setVisible(el.cd, false);
    setVisible(el.activity, false);
    setVisible(el.powered, false);

    // 顯示指定頁，其餘子頁隱藏
    ['ecard','brands','contact','transport','account','about','role'].forEach(k => {
      setVisible(el[k], el[k] === pageEl);
    });

    if (el.fab) el.fab.style.display = 'none';
    if (title) document.title = title;
  }

  function needRoleGate() {
    // 未選身分 & 不在 #role → 導向 #role
    try {
      return !!(window.Role && !Role.get() && (location.hash || '') !== '#role');
    } catch { return false; }
  }

  function route() {
    const hash = (location.hash || '').replace('#','');

    // 初次與每次切換，若需要 role → 導頁
    if (needRoleGate()) {
      location.hash = '#role';
      return;
    }

    // 明確的 #role
    if (hash === 'role' && el.role) {
      showOnly(el.role, '選擇角色 | ExpoLink');
      // 確保 Role 模組把自己的面板顯示
      window.Role?.mountIfHashIsRole?.();
      return;
    } else {
      // 只要不是 #role，就把 role 隱藏
      setVisible(el.role, false);
    }

    // 二級：account（含子路徑）
    if ((/^account(\/|$)/).test(hash) && el.account) {
      showOnly(el.account, '會員中心 | ExpoLink');
      return;
    }

    if (hash === 'ecard' && el.ecard)     return showOnly(el.ecard, '電子名片 | ExpoLink');
    if (hash === 'brands' && el.brands)   return showOnly(el.brands, '參展品牌 | ExpoLink');
    if (hash === 'contact' && el.contact) return showOnly(el.contact, '聯絡主辦 | ExpoLink');
    if (hash === 'transport' && el.transport) return showOnly(el.transport, '交通資訊 | ExpoLink');
    if (hash === 'about' && el.about)     return showOnly(el.about, '關於 ExpoLink | ExpoLink');

    // 其他 / 空 → 首頁
    showHome();
  }

  function bindUI() {
    // Drawer & Scanner 若你另外初始化，這裡只負責監聽 hash
    window.addEventListener('hashchange', () => {
      route();
      window.scrollTo({ top: 0, behavior: 'auto' });
    });
  }

  window.PageRouter = { bindUI, route };
})();