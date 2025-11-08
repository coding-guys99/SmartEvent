// 單頁路由（含 role 頁守門、About 分支）
(function () {
  function bindUI() {
    const menuBtn = document.getElementById('menuBtn');
    const drawer = document.getElementById('drawer');
    const scrim = document.getElementById('scrim');
    const closeDrawer = document.getElementById('closeDrawer');

    const open = () => { drawer?.classList.add('open'); scrim?.classList.add('show'); };
    const close = () => { drawer?.classList.remove('open'); scrim?.classList.remove('show'); };

    menuBtn?.addEventListener('click', open);
    closeDrawer?.addEventListener('click', close);
    scrim?.addEventListener('click', close);

    if (drawer) drawer.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', close));

    Scanner.init();

    window.addEventListener('hashchange', () => {
      route();
      window.scrollTo({ top: 0, behavior: 'auto' });
    });
  }

  function route(){
    // role 守門：若未選擇身分，跳 role（並隱藏其他區塊與 scanner）
    if (window.Role && Role.get() === '' && location.hash !== '#role') {
      location.hash = '#role';
      return;
    }

    const hashRaw = (location.hash || '').replace(/^#/, '');
    const hash = hashRaw || '';
    const isAccount = hash === 'account' || hash.startsWith('account/');

    const hero     = document.getElementById('hero');
    const qa       = document.querySelector('.quick-actions');
    const info     = document.getElementById('expoInfo');
    const powered  = document.querySelector('.powered');
    const fab      = document.getElementById('scanFab');

    const ePage = document.getElementById('ecardPage');
    const bPage = document.getElementById('brandsPage');
    const cPage = document.getElementById('contactPage');
    const tPage = document.getElementById('transportPage');
    const aPage = document.getElementById('accountPage');
    const abPage= document.getElementById('aboutPage');

    const showHome = ()=>{
      hero && (hero.style.display = '');
      qa && (qa.style.display = '');
      info && (info.style.display = '');
      powered && (powered.style.display = '');
      Utils.setVisible(ePage, false);
      Utils.setVisible(bPage, false);
      Utils.setVisible(cPage, false);
      Utils.setVisible(tPage, false);
      Utils.setVisible(aPage, false);
      if (abPage){ abPage.hidden = true; abPage.setAttribute('aria-hidden','true'); }
      fab && (fab.style.display = '');
      document.title = 'ExpoLink';
    };
    const showOnly = (pageEl, title)=>{
      hero && (hero.style.display = 'none');
      qa && (qa.style.display = 'none');
      info && (info.style.display = 'none');
      powered && (powered.style.display = 'none');
      Utils.setVisible(ePage, pageEl === ePage);
      Utils.setVisible(bPage, pageEl === bPage);
      Utils.setVisible(cPage, pageEl === cPage);
      Utils.setVisible(tPage, pageEl === tPage);
      Utils.setVisible(aPage, pageEl === aPage);
      fab && (fab.style.display = 'none');
      if (!isAccount) document.title = title;
    };

    if (isAccount && aPage){ showOnly(aPage, '會員中心 | ExpoLink'); return; }
    if (hash === 'ecard' && ePage){
      const title = (window.HOME?.ecard?.name ? `${window.HOME.ecard.name} - 名片` : '電子名片') + ' | ExpoLink';
      showOnly(ePage, title); return;
    }
    if (hash === 'brands' && bPage){ showOnly(bPage, '參展品牌 | ExpoLink'); return; }
    if (hash === 'contact' && cPage){ showOnly(cPage, '聯絡主辦 | ExpoLink'); return; }
    if (hash === 'transport' && tPage){ showOnly(tPage, '交通資訊 | ExpoLink'); return; }

    if (abPage){ abPage.hidden = true; abPage.setAttribute('aria-hidden','true'); }
    if (hash === 'about' && abPage){
      hero && (hero.style.display = 'none'); qa && (qa.style.display = 'none');
      info && (info.style.display = 'none'); powered && (powered.style.display = 'none');
      abPage.hidden = false; abPage.setAttribute('aria-hidden','false');
      [ePage,bPage,cPage,tPage,aPage].forEach(p => p && (p.hidden = true, p.setAttribute('aria-hidden','true')));
      fab && (fab.style.display = 'none');
      document.title = '關於 ExpoLink | ExpoLink';
      return;
    }

    showHome();
  }

  window.PageRouter = { bindUI, route };
})();