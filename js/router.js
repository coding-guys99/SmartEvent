/* ==========================================================
 * PageRouter — 控管首頁/子頁顯示（含角色頁 #role）
 * 只負責顯示/隱藏，不做資料渲染
 * ========================================================== */
(function () {
  // 取一次 DOM，避免每次 hashchange 都 query
  const el = {
    // 首頁模組
    hero:        document.getElementById('hero'),
    qa:          document.querySelector('.quick-actions'),
    info:        document.getElementById('expoInfo'),
    powered:     document.querySelector('.powered'),
    fab:         document.getElementById('scanFab'),

    // 你新增的「日期上方活動圖」可能使用的 id（擇一會存在）
    activity:    document.getElementById('activityCard')
              || document.getElementById('activityMedia')
              || document.getElementById('activityPhoto')
              || null,

    // 子頁
    ecard:       document.getElementById('ecardPage'),
    brands:      document.getElementById('brandsPage'),
    contact:     document.getElementById('contactPage'),
    transport:   document.getElementById('transportPage'),
    account:     document.getElementById('accountPage'),
    about:       document.getElementById('aboutPage'),

    // 角色
    role:        document.getElementById('rolePage'),
  };

  // 小工具
  function setVisible(node, show) {
    if (!node) return;
    node.hidden = !show;
    node.setAttribute('aria-hidden', String(!show));
  }
  function hideHomeModules() {
    if (el.hero)    el.hero.style.display = 'none';
    if (el.qa)      el.qa.style.display = 'none';
    if (el.info)    el.info.style.display = 'none';
    if (el.powered) el.powered.style.display = 'none';
    if (el.activity) el.activity.style.display = 'none';
  }
  function showHomeModules() {
    if (el.hero)    el.hero.style.display = '';
    if (el.qa)      el.qa.style.display = '';
    if (el.info)    el.info.style.display = '';
    if (el.powered) el.powered.style.display = '';
    if (el.activity) el.activity.style.display = '';  // 只在首頁顯示
  }
  function offAllPages() {
    [el.ecard, el.brands, el.contact, el.transport, el.account, el.about, el.role]
      .forEach(n => setVisible(n, false));
  }

  // 顯示首頁
  function showHome() {
    showHomeModules();
    offAllPages();
    if (el.fab) el.fab.style.display = '';     // FAB在首頁開
    document.title = 'ExpoLink';
  }

  // 僅顯示某頁
  function showOnly(pageEl, title) {
    hideHomeModules();
    if (el.fab) el.fab.style.display = 'none'; // 子頁關掉 FAB
    setVisible(el.role, false);
    [el.ecard, el.brands, el.contact, el.transport, el.account, el.about]
      .forEach(n => setVisible(n, n === pageEl));
    if (title) document.title = title;
  }

  function route() {
    const raw = (location.hash || '').replace(/^#/, '');
    const hash = raw || '';

    // 先把角色頁關掉（避免殘留）
    setVisible(el.role, false);

    // 1) 角色頁
    if (hash === 'role' && el.role) {
      hideHomeModules();
      offAllPages();
      if (el.fab) el.fab.style.display = 'none';
      setVisible(el.role, true);
      document.title = '選擇角色 | ExpoLink';
      return;
    }

    // 2) 會員中心（含子路由）
    const isAccount = hash === 'account' || hash.startsWith('account/');
    if (isAccount && el.account) {
      showOnly(el.account, '會員中心 | ExpoLink');
      return;
    }

    // 3) 其餘子頁
    if (hash === 'ecard'     && el.ecard)     return showOnly(el.ecard,    '電子名片 | ExpoLink');
    if (hash === 'brands'    && el.brands)    return showOnly(el.brands,   '參展品牌 | ExpoLink');
    if (hash === 'contact'   && el.contact)   return showOnly(el.contact,  '聯絡主辦 | ExpoLink');
    if (hash === 'transport' && el.transport) return showOnly(el.transport,'交通資訊 | ExpoLink');
    if (hash === 'about'     && el.about)     return showOnly(el.about,    '關於 ExpoLink | ExpoLink');

    // 4) 預設回首頁
    showHome();
  }

  function bindUI() {
    // Drawer / Scanner 若有模組就初始化（沒有就忽略）
    if (window.Scanner && typeof window.Scanner.init === 'function') window.Scanner.init();
    if (window.Drawer  && typeof window.Drawer.init  === 'function') window.Drawer.init();

    window.addEventListener('hashchange', () => {
      route();
      // 每次切頁回到頂端
      window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
    });
  }

  // 對外
  window.PageRouter = { route, bindUI };
})();