/* ============================================================
 * ExpoLink — Account Module (UI Only)
 * 負責：#account 首頁 & 二級頁路由、表單→預覽、名片公開切換、QR 倒數、空狀態
 * 無後端、不碰其他頁；只操作 #accountPage 內的 DOM
 * ============================================================ */
const Account = (() => {
  const state = {
    // 模擬資料（僅 UI 預覽用；不持久化）
    profile: {
      name: '',
      title: '',
      org: '',
      email: '',
      phone: '',
      site: '',
      bio: ''
    },
    visibility: {
      name: true, title: true, org: true,
      email: false, phone: false, site: true, address: false, bio: true
    },
    qr: { seconds: 60, timer: null }
  };

  // ====== DOM 快取 ======
  const $ = (sel, root=document)=> root.querySelector(sel);
  const $$ = (sel, root=document)=> Array.from(root.querySelectorAll(sel));

  let root;              // #accountPage
  let home;              // #accountHome
  let sub = {};          // 各二級頁：profile/visibility/qr/exchanges/linked/prefs
  let fab;               // 浮動掃描 FAB（如果存在就隱藏）
  let progressBar;       // 首頁進度條 <span>
  let progressText;      // 首頁「名片完成度 xx%」

  // 預覽（visibility 子頁）
  let miniCard, miniName, miniTitle, miniMeta;

  // 表單（profile 子頁）
  let F = {};

  // ====== 公開欄位 checkbox 對應表（visibility 子頁） ======
  const visKeysByLabel = {
    '姓名': 'name',
    '職稱': 'title',
    '公司': 'org',
    'Email': 'email',
    '電話': 'phone',
    '網站': 'site',
    '地址': 'address',
    '簡介': 'bio'
  };

  // ====== 初始化 ======
  function init(){
    root = $('#accountPage');
    if (!root) return;

    home = $('#accountHome', root);

    sub.profile    = $('#accountProfile', root);
    sub.visibility = $('#accountVisibility', root);
    sub.qr         = $('#accountQR', root);
    sub.exchanges  = $('#accountExchanges', root);
    sub.linked     = $('#accountLinked', root);
    sub.prefs      = $('#accountPrefs', root);

    progressBar  = $('.ah-progress .bar span', home);
    progressText = $('.ah-progress .k', home);

    fab = document.getElementById('scanFab');

    // 綁路由
    window.addEventListener('hashchange', onHashChange);
    onHashChange(); // 初次

    // 綁定各子頁互動
    bindProfilePage();
    bindVisibilityPage();
    bindQRPage();
    bindExchangesPage();
  }

  // ====== 路由：只處理 #account 與子路由 ======
  function onHashChange(){
    const hash = (location.hash || '').replace(/^#/, '');
    const parts = hash.split('/'); // e.g. ["account", "profile"]
    const isAccount = parts[0] === 'account';

    // 僅當 account 才處理，其餘交給你的主 route
    if (!isAccount){
      // 離開 account 時，清理 QR 計時器
      stopQrTimer();
      return;
    }

    // 顯示 accountPage；隱藏 FAB（安全）
    if (root){ root.hidden = false; root.setAttribute('aria-hidden','false'); }
    if (fab){ fab.style.display = 'none'; }

    // 先關全部區塊
    if (home) home.hidden = true;
    Object.values(sub).forEach(el => el && (el.hidden = true));

    // 哪一頁
    const subKey = parts[1] || ''; // "", "profile", ...
    switch (subKey) {
      case '':
        home.hidden = false;
        document.title = '會員中心 | ExpoLink';
        stopQrTimer();
        break;
      case 'profile':
        sub.profile.hidden = false;
        document.title = '個人資料 | ExpoLink';
        stopQrTimer();
        break;
      case 'visibility':
        sub.visibility.hidden = false;
        document.title = '名片公開 | ExpoLink';
        stopQrTimer();
        // 顯示時刷新預覽
        renderMiniPreview();
        break;
      case 'qr':
        sub.qr.hidden = false;
        document.title = '我的 QR | ExpoLink';
        startQrTimer(); // 進頁就跑倒數
        break;
      case 'exchanges':
        sub.exchanges.hidden = false;
        document.title = '交換名片 | ExpoLink';
        stopQrTimer();
        break;
      case 'linked':
        sub.linked.hidden = false;
        document.title = '登入與綁定 | ExpoLink';
        stopQrTimer();
        break;
      case 'prefs':
        sub.prefs.hidden = false;
        document.title = '偏好設定 | ExpoLink';
        stopQrTimer();
        break;
      default:
        // 未知子頁就回首頁
        home.hidden = false;
        document.title = '會員中心 | ExpoLink';
        stopQrTimer();
    }

    // 更新首頁完成度（無論在首頁或子頁都更新底層數值）
    renderCompletion();
  }

  // ====== 個人資料子頁：表單→狀態→預覽 ======
  function bindProfilePage(){
    const page = sub.profile;
    if (!page) return;

    F = {
      name:  $('input[placeholder="王小明"]', page),
      title: $('input[placeholder="行銷經理"]', page),
      org:   $('input[placeholder="Acme Inc."]', page),
      email: $('input[type="email"]', page),
      phone: $('input[type="tel"]', page),
      site:  $('input[type="url"]', page),
      bio:   $('textarea', page)
    };

    Object.values(F).forEach(el=>{
      if (!el) return;
      el.addEventListener('input', ()=>{
        readFormToState();
        // 若名片公開子頁開著，順手刷新預覽
        renderMiniPreview();
        renderCompletion();
      });
      el.addEventListener('change', ()=>{
        readFormToState();
        renderMiniPreview();
        renderCompletion();
      });
    });
  }

  function readFormToState(){
    const get = el => (el && typeof el.value === 'string') ? el.value.trim() : '';
    state.profile.name  = get(F.name);
    state.profile.title = get(F.title);
    state.profile.org   = get(F.org);
    state.profile.email = get(F.email);
    state.profile.phone = get(F.phone);
    state.profile.site  = get(F.site).replace(/^https?:\/\//,'');
    state.profile.bio   = get(F.bio);
  }

  // ====== 名片公開子頁 ======
  function bindVisibilityPage(){
    const page = sub.visibility;
    if (!page) return;

    miniCard  = $('.ecard-mini', page);
    miniName  = $('.ecard-mini .name', page);
    miniTitle = $('.ecard-mini .title', page);
    miniMeta  = $('.ecard-mini .meta', page);

    // 掛上 checkbox 事件
    $$('.vis-list input[type="checkbox"]', page).forEach(cb=>{
      const label = cb.closest('label');
      const txt = (label?.textContent || '').trim();
      const key = visKeysByLabel[txt];
      if (!key) return;

      // 初始狀態同步
      state.visibility[key] = !!cb.checked;

      cb.addEventListener('change', ()=>{
        state.visibility[key] = !!cb.checked;
        renderMiniPreview();
        renderCompletion();
      });
    });

    // 全部顯示 / 全部隱藏
    const [btnAllOn, btnAllOff] = $$('.vis-actions .btn', page);
    btnAllOn?.addEventListener('click', ()=>{
      $$('.vis-list input[type="checkbox"]', page).forEach(cb=> cb.checked = true);
      Object.keys(state.visibility).forEach(k=> state.visibility[k] = true);
      renderMiniPreview();
      renderCompletion();
    });
    btnAllOff?.addEventListener('click', ()=>{
      $$('.vis-list input[type="checkbox"]', page).forEach(cb=> cb.checked = false);
      Object.keys(state.visibility).forEach(k=> state.visibility[k] = false);
      renderMiniPreview();
      renderCompletion();
    });
  }

  function renderMiniPreview(){
    if (!miniCard) return;
    const v  = state.profile;
    const vis= state.visibility;

    // 姓名
    if (miniName) miniName.textContent = (vis.name && v.name) ? v.name : '—';

    // 職稱 + 公司
    const t = (vis.title && v.title) ? v.title : '';
    const o = (vis.org   && v.org)   ? v.org   : '';
    const titleLine = t && o ? `${t} @ ${o}` : (t || o || '—');
    if (miniTitle) miniTitle.textContent = titleLine;

    // Email / Site
    const metas = [];
    if (vis.email && v.email) metas.push(`<span class="i i-mail"></span> ${esc(v.email)}`);
    if (vis.site  && v.site)  metas.push(`<span class="i i-link"></span> ${esc(v.site)}`);
    if (miniMeta) miniMeta.innerHTML = metas.length ? metas.join('　·　') : `<span class="muted">未公開任何聯絡方式</span>`;

    // 若 #ecard 正在顯示，也同步（只更新文字/連結，不處理圖片/Logo/QR）
    syncEcardPage();
  }

  function esc(s){ return String(s).replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }

  function syncEcardPage(){
    if ((location.hash||'') !== '#ecard') return;
    const v  = state.profile;
    const vis= state.visibility;
    const id = (x)=> document.getElementById(x);

    // 標題區
    id('ecName')  && (id('ecName').textContent  = (vis.name && v.name) ? v.name : '—');
    const title = (vis.title && v.title) ? v.title : '';
    const org   = (vis.org   && v.org)   ? v.org   : '';
    id('ecTitle') && (id('ecTitle').textContent = (title || '—'));
    id('ecOrg')   && (id('ecOrg').textContent   = (org || '—'));

    // 聯絡
    const phoneEl = id('ecPhone');
    const mailEl  = id('ecEmail');
    const siteEl  = id('ecSite');
    const addrEl  = id('ecAddr');

    if (phoneEl){
      if (vis.phone && v.phone){ phoneEl.href = `tel:${v.phone}`; phoneEl.textContent = v.phone; }
      else { phoneEl.removeAttribute('href'); phoneEl.textContent = '—'; }
    }
    if (mailEl){
      if (vis.email && v.email){ mailEl.href = `mailto:${v.email}`; mailEl.textContent = v.email; }
      else { mailEl.removeAttribute('href'); mailEl.textContent = '—'; }
    }
    if (siteEl){
      if (vis.site && v.site){
        const url = /^https?:\/\//.test(v.site) ? v.site : `https://${v.site}`;
        siteEl.href = url; siteEl.textContent = v.site;
      } else { siteEl.removeAttribute('href'); siteEl.textContent = '—'; }
    }
    if (addrEl){
      addrEl.textContent = (vis.address && state.profile.address) ? state.profile.address : '—';
    }
  }

  // ====== QR 子頁：倒數計時（UI 模擬） ======
  function bindQRPage(){
    const page = sub.qr;
    if (!page) return;

    const timerEl = $('.qr-meta .timer', page);
    const btnRegen = $('.qr-actions .btn.btn-primary', page);

    btnRegen?.addEventListener('click', ()=>{
      // 重置 60 秒
      state.qr.seconds = 60;
      renderQrTimer(timerEl);
    });

    // 全螢幕按鈕僅 UI
    const btnFull = $('.qr-actions .btn.btn-outline', page);
    btnFull?.addEventListener('click', ()=>{
      // 純提示：可加全螢幕遮罩；此處只閃爍一下
      const box = $('.qr-box', page);
      if (!box) return;
      box.style.outline = '2px solid var(--primary)';
      setTimeout(()=> box.style.outline = '', 300);
    });
  }

  function startQrTimer(){
    const page = sub.qr;
    if (!page) return;
    const timerEl = $('.qr-meta .timer', page);
    stopQrTimer(); // 防重複
    // 若沒有秒數，重置
    if (!state.qr.seconds || state.qr.seconds <= 0) state.qr.seconds = 60;
    renderQrTimer(timerEl);
    state.qr.timer = setInterval(()=>{
      state.qr.seconds--;
      if (state.qr.seconds <= 0){
        state.qr.seconds = 0;
        renderQrTimer(timerEl);
        stopQrTimer();
      }else{
        renderQrTimer(timerEl);
      }
    }, 1000);
  }

  function renderQrTimer(el){
    if (el) el.textContent = `${state.qr.seconds}s`;
    // 可以順手在 QR 方塊上做淡淡的閃爍
    const box = $('.qr-box', sub.qr);
    if (!box) return;
    box.style.boxShadow = (state.qr.seconds % 2 === 0) ? '0 0 0 1px rgba(0,255,224,.15) inset' : 'none';
  }

  function stopQrTimer(){
    clearInterval(state.qr.timer);
    state.qr.timer = null;
  }

  // ====== 交換名片子頁：空狀態顯示 ======
  function bindExchangesPage(){
    const page = sub.exchanges;
    if (!page) return;
    const items = $$('.ex-list .ex-item', page);
    const empty = $('.empty', page);
    if (empty){
      empty.hidden = items.length > 0;
    }
  }

  // ====== 完成度計算（首頁進度） ======
  function renderCompletion(){
    // 計算「已填寫且被公開」的欄位權重（僅示意）
    const v = state.profile, vis = state.visibility;
    const keys = ['name','title','org','email','phone','site','bio'];
    let have = 0, total = keys.length;

    keys.forEach(k=>{
      const filled = !!String(v[k]||'').trim();
      const shown  = !!vis[k]; // 只有勾選公開才算完成
      if (filled && shown) have++;
    });

    const pct = Math.round((have / total) * 100) || 0;
    if (progressBar) progressBar.style.width = `${pct}%`;
    if (progressText) progressText.textContent = `名片完成度 ${pct}%`;
  }

  // ====== 對外 API（若你想手動刷新也可） ======
  return { init };
})();