// js/router.js
// 控制 Drawer、hash 路由切頁；可選用 Role/Scanner
(function () {
  function bindUI() {
    // Drawer
    const menuBtn = document.getElementById('menuBtn');
    const drawer  = document.getElementById('drawer');
    const scrim   = document.getElementById('scrim');
    const closeDrawer = document.getElementById('closeDrawer');

    const open = () => { drawer?.classList.add('open'); scrim?.classList.add('show'); };
    const close= () => { drawer?.classList.remove('open'); scrim?.classList.remove('show'); };

    menuBtn && menuBtn.addEventListener('click', open);
    closeDrawer && closeDrawer.addEventListener('click', close);
    scrim && scrim.addEventListener('click', close);
    if (drawer) {
      drawer.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', close));
    }

    // Scanner（存在才初始化）
    if (window.Scanner && typeof Scanner.init === 'function') {
      Scanner.init();
    }

    // 角色守門（存在才執行）
    if (window.Role && typeof Role.guard === 'function') {
      const stopped = Role.guard();
      if (stopped) return; // 顯示 rolePage 就先不跑其他路由
    }

    // Hash
    window.addEventListener('hashchange', () => {
      route();
      window.scrollTo({ top: 0, behavior: 'auto' });
    });
  }

  function route() {
    // 如果在 role 選擇頁，就交給 Role 模組處理
    if (window.Role && typeof Role.guard === 'function') {
      const showingRole = Role.guard();
      if (showingRole) return;
    }

    const hash = (location.hash || '').replace(/^#/, '');
    const isAccount = hash === 'account' || hash.startsWith('account/');

    // 首頁模組
    const hero    = document.getElementById('hero');
    const qa      = document.querySelector('.quick-actions');
    const info    = document.getElementById('expoInfo');
    const powered = document.querySelector('.powered');
    const fab     = document.getElementById('scanFab');
    const eventPhoto= document.getElementById('eventPhoto'); // ← 新增這行

    // 子頁
    const ePage = document.getElementById('ecardPage');
    const bPage = document.getElementById('brandsPage');
    const cPage = document.getElementById('contactPage');
    const tPage = document.getElementById('transportPage');
    const aPage = document.getElementById('accountPage');
    const abPage= document.getElementById('aboutPage');

    const setVisible = (el, show) => {
      if (!el) return;
      el.hidden = !show;
      el.setAttribute('aria-hidden', String(!show));
    };
    const showHome = () => {
      hero && (hero.style.display = '');
      qa && (qa.style.display = '');
      info && (info.style.display = '');
      powered && (powered.style.display = '');
      [ePage,bPage,cPage,tPage,aPage,abPage].forEach(p => setVisible(p, false));
      fab && (fab.style.display = '');
      document.title = 'ExpoLink';
      if (eventPhoto) eventPhoto.hidden = false;
    };
    const showOnly = (pageEl, title) => {
      hero && (hero.style.display = 'none');
      qa && (qa.style.display = 'none');
      info && (info.style.display = 'none');
      powered && (powered.style.display = 'none');
      [ePage,bPage,cPage,tPage,aPage,abPage].forEach(p => setVisible(p, p === pageEl));
      fab && (fab.style.display = 'none');
      if (!isAccount) document.title = title;
      if (eventPhoto) eventPhoto.hidden = true;
    };

    if (isAccount && aPage) { showOnly(aPage, '會員中心 | ExpoLink'); return; }
    if (hash === 'ecard' && ePage){ showOnly(ePage, `${(HOME?.ecard?.name||'電子名片')} | ExpoLink`); return; }
    if (hash === 'brands' && bPage){ showOnly(bPage, '參展品牌 | ExpoLink'); return; }
    if (hash === 'contact' && cPage){ showOnly(cPage, '聯絡主辦 | ExpoLink'); return; }
    if (hash === 'transport' && tPage){ showOnly(tPage, '交通資訊 | ExpoLink'); return; }
    if (hash === 'about' && abPage){ showOnly(abPage, '關於 ExpoLink | ExpoLink'); return; }

    showHome();
  }

  window.PageRouter = { bindUI, route };
})();