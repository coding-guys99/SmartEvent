// ====== 載入資料 ======
let HOME = null;

(async function init() {
  HOME = await fetch('data/home.json').then(r => r.json());

  // Hero
  const heroImg = document.getElementById('heroImg');
  if (heroImg) heroImg.src = HOME?.hero?.img || '';
  const hTitle = document.getElementById('heroTitle');
  if (hTitle) hTitle.textContent = HOME?.hero?.title || '';
  const hSub = document.getElementById('heroSubtitle');
  if (hSub) hSub.textContent = HOME?.hero?.subtitle || '';

  const heroCtas = document.getElementById('heroCtas');
  if (heroCtas && Array.isArray(HOME?.hero?.cta)) {
    HOME.hero.cta.forEach(c => {
      const a = document.createElement('a');
      a.href = c.link || '#';
      a.textContent = c.text || '';
      a.className = c.primary ? 'btn btn-primary' : 'btn btn-outline';
      heroCtas.appendChild(a);
    });
  }

  // Actions chips
  const actions = document.getElementById('actions');
  if (actions && Array.isArray(HOME?.actions)) {
    HOME.actions.forEach(c => {
      const a = document.createElement('a');
      a.href = c.link || '#';
      a.textContent = c.text || '';
      actions.appendChild(a);
    });
  }

  // Info
  const dateStr = HOME?.info?.date || '';
  const infoDate = document.getElementById('infoDate');
  if (infoDate) infoDate.textContent = dateStr;
  const infoVenue = document.getElementById('infoVenue');
  if (infoVenue) infoVenue.textContent = HOME?.info?.venue || '';
  const infoOrg = document.getElementById('infoOrganizer');
  if (infoOrg) infoOrg.textContent = HOME?.info?.organizer || '';
  const infoCountdown = document.getElementById('infoCountdown');
  if (infoCountdown) infoCountdown.textContent = getCountdown(dateStr);

  // Powered
  const poweredText = document.getElementById('poweredText');
  if (poweredText) poweredText.textContent = HOME?.powered?.text || '';
  const poweredCta = document.getElementById('poweredCta');
  if (poweredCta) {
    poweredCta.textContent = HOME?.powered?.cta?.text || '';
    poweredCta.href = HOME?.powered?.cta?.link || '#';
  }

  bindUI();
  initEcard();                // 名片初始化
  setupBrandsModule(HOME);    // 品牌模組（搜尋/類別/排序）
  setupContact(HOME);         // ← 移到 route() 之前
  setupTransport(HOME);       // ← 移到 route() 之前
// 新增這行
setupAccountModule();
  route();                    // 初次路由
})();

function getCountdown(range) {
  if (!range) return '';
  const s = range.split('~')[0]?.trim();
  const start = s ? new Date(s) : null;
  if (!start || isNaN(+start)) return '';
  const today = new Date(); today.setHours(0,0,0,0);
  const days = Math.ceil((start - today) / (1000 * 60 * 60 * 24));
  if (days > 0) return `距開展還有 ${days} 天`;
  if (days === 0) return '今天開展';
  return '展會進行中或已結束';
}

// ====== 抽屜 ======
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

  if (drawer) {
    drawer.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', close);
    });
  }

  setupScanner();

  window.addEventListener('hashchange', () => {
    route();
    window.scrollTo({ top: 0, behavior: 'auto' });
  });
}

// ====== 掃描（UI 模擬） ======
function setupScanner() {
  const fab = document.getElementById('scanFab');
  const sheet = document.getElementById('scanner');
  const close = document.getElementById('closeScanner');
  const btnStart = document.getElementById('btnStartScan');
  const btnMock = document.getElementById('btnMockHit');
  const btnTorch = document.getElementById('btnTorch');
  const result = document.getElementById('scanResult');

  const open = () => sheet?.classList.add('show');
  const hide = () => { sheet?.classList.remove('show'); if (result) result.textContent = ''; };

  fab?.addEventListener('click', open);
  close?.addEventListener('click', hide);

  btnStart?.addEventListener('click', () => {
    if (!result) return;
    result.style.color = 'var(--muted)';
    result.textContent = '正在掃描…（介面模擬，之後可接原生/Barcode）';
  });
  btnMock?.addEventListener('click', () => {
    if (!result) return;
    result.style.color = 'var(--accent)';
    result.textContent = '識別成功：TICKET-EXPO-2025-#A1';
  });

  let torch = false;
  btnTorch?.addEventListener('click', () => {
    torch = !torch;
    if (btnTorch) {
      btnTorch.style.borderColor = torch ? 'var(--primary)' : 'var(--line)';
      btnTorch.title = torch ? '關閉照明' : '開啟照明';
    }
  });
}

// ====== 路由：#ecard / #brands / #contact / #transport 子頁，其餘為首頁 ======
function route(){
  const hashRaw = (location.hash || '').replace(/^#/, '');
  const hash = hashRaw || '';
  const isAccount = hash === 'account' || hash.startsWith('account/');

  // 首頁模組
  const hero     = document.getElementById('hero');
  const qa       = document.querySelector('.quick-actions');
  const info     = document.getElementById('expoInfo');
  const powered  = document.querySelector('.powered');
  const fab      = document.getElementById('scanFab');

  // 子頁
  const ePage = document.getElementById('ecardPage');
  const bPage = document.getElementById('brandsPage');
  const cPage = document.getElementById('contactPage');
  const tPage = document.getElementById('transportPage');
  const aPage = document.getElementById('accountPage');

  // 小工具
  const setVisible = (el, show) => {
    if (!el) return;
    el.hidden = !show;
    el.setAttribute('aria-hidden', String(!show));
  };
  const showHome = () => {
    // 顯示首頁模組
    if (hero) hero.style.display = '';
    if (qa) qa.style.display = '';
    if (info) info.style.display = '';
    if (powered) powered.style.display = '';
    // 關掉子頁
    setVisible(ePage, false);
    setVisible(bPage, false);
    setVisible(cPage, false);
    setVisible(tPage, false);
    setVisible(aPage, false);
    // FAB on
    if (fab) fab.style.display = '';
    document.title = 'ExpoLink';
  };
  const showSectionOnly = (pageEl, title) => {
    // 隱藏首頁模組
    if (hero) hero.style.display = 'none';
    if (qa) qa.style.display = 'none';
    if (info) info.style.display = 'none';
    if (powered) powered.style.display = 'none';
    // 僅顯示某頁
    setVisible(ePage, pageEl === ePage);
    setVisible(bPage, pageEl === bPage);
    setVisible(cPage, pageEl === cPage);
    setVisible(tPage, pageEl === tPage);
    setVisible(aPage, pageEl === aPage);
    // FAB off
    if (fab) fab.style.display = 'none';
    // 標題（account 的子頁標題交給 Account 模組內部）
    if (!isAccount) document.title = title;
  };

  // ---- 路由分支 ----

  // 會員中心（含二級）
  if (isAccount && aPage){
    showSectionOnly(aPage, '會員中心 | ExpoLink');
    return;
  }

  // 電子名片
  if (hash === 'ecard' && ePage){
    const title = (HOME?.ecard?.name ? `${HOME.ecard.name} - 名片` : '電子名片') + ' | ExpoLink';
    showSectionOnly(ePage, title);
    return;
  }

  // 參展品牌
  if (hash === 'brands' && bPage){
    showSectionOnly(bPage, '參展品牌 | ExpoLink');
    return;
  }

  // 聯絡主辦
  if (hash === 'contact' && cPage){
    showSectionOnly(cPage, '聯絡主辦 | ExpoLink');
    return;
  }

  // 交通資訊
  if (hash === 'transport' && tPage){
    showSectionOnly(tPage, '交通資訊 | ExpoLink');
    return;
  }

const abPage = document.getElementById('aboutPage');

// showHome 裡也要隱藏它
if (abPage){ abPage.hidden = true; abPage.setAttribute('aria-hidden','true'); }

// 加入新的 hash 分支
if (hash === 'about' && abPage){
  hero && (hero.style.display = 'none'); qa && (qa.style.display = 'none');
  info && (info.style.display = 'none'); powered && (powered.style.display = 'none');
  abPage.hidden = false; abPage.setAttribute('aria-hidden','false');
  [ePage,bPage,cPage,tPage,aPage].forEach(p => p && (p.hidden = true, p.setAttribute('aria-hidden','true')));
  fab && (fab.style.display = 'none');
  document.title = '關於 ExpoLink | ExpoLink';
  return;
}

  // 其他 / 空 hash → 首頁
  showHome();
}

// ====== 電子名片初始化與 vCard 下載 ======
function initEcard() {
  const ec = HOME?.ecard;
  if (!ec) return;

  // === 正面 ===
  const logo = document.getElementById('ecLogo');
  const mono = document.getElementById('ecMonogram');
  if (ec.logo && logo) {
    logo.src = ec.logo;
    logo.style.display = 'block';
    mono && (mono.style.display = 'none');
  } else if (mono) {
    const t = (ec.org || ec.name || 'E')[0]?.toUpperCase() || 'E';
    mono.textContent = t;
    mono.style.display = 'grid';
  }

  const qr = document.getElementById('ecQr');
  const qrPh = document.getElementById('ecQrPh');
  if (ec.qr && qr) {
    qr.src = ec.qr;
    qr.style.display = 'block';
    qrPh && (qrPh.style.display = 'none');
  } else {
    qr && (qr.style.display = 'none');
    qrPh && (qrPh.style.display = 'grid');
  }

  const n = document.getElementById('ecName');   if (n) n.textContent = ec.name || '';
  const t = document.getElementById('ecTitle');  if (t) t.textContent = ec.title || '';
  const o = document.getElementById('ecOrg');    if (o) o.textContent = ec.org || '';

  const phoneEl = document.getElementById('ecPhone');
  const mailEl  = document.getElementById('ecEmail');
  const siteEl  = document.getElementById('ecSite');
  const addrEl  = document.getElementById('ecAddr');

  if (phoneEl) {
    if (ec.phone){ phoneEl.href = `tel:${ec.phone}`; phoneEl.textContent = ec.phone; }
    else { phoneEl.removeAttribute('href'); phoneEl.textContent = '—'; }
  }
  if (mailEl) {
    if (ec.email){ mailEl.href = `mailto:${ec.email}`; mailEl.textContent = ec.email; }
    else { mailEl.removeAttribute('href'); mailEl.textContent = '—'; }
  }
  if (siteEl) {
    if (ec.site){ siteEl.href = ec.site; siteEl.textContent = ec.site.replace(/^https?:\/\//,''); }
    else { siteEl.removeAttribute('href'); siteEl.textContent = '—'; }
  }
  if (addrEl) addrEl.textContent = ec.address || '—';

  // vCard
  const vcard = [
    'BEGIN:VCARD','VERSION:3.0',
    `N:${ec.name||''};;;`,
    `FN:${ec.name||''}`,
    `ORG:${ec.org||''}`,
    `TITLE:${ec.title||''}`,
    ec.phone ? `TEL;TYPE=CELL:${ec.phone}` : '',
    ec.email ? `EMAIL;TYPE=INTERNET:${ec.email}` : '',
    ec.address ? `ADR;TYPE=WORK:;;${ec.address};;;;` : '',
    ec.site ? `URL:${ec.site}` : '',
    'END:VCARD'
  ].filter(Boolean).join('\n');

  const vcfUrl = URL.createObjectURL(new Blob([vcard], { type: 'text/vcard' }));
  const vcf = document.getElementById('ecVcf');
  if (vcf) vcf.href = vcfUrl;

  const shareBtn = document.getElementById('ecShare');
  if (shareBtn) {
    if (navigator.share) {
      shareBtn.disabled = false;
      shareBtn.addEventListener('click', async () => {
        const text = `${ec.name}｜${ec.title} @ ${ec.org}\n${ec.site || ''}\n${ec.email || ''}\n${ec.phone || ''}`;
        try { await navigator.share({ title: ec.name, text, url: location.href.split('#')[0] + '#ecard' }); } catch (e) {}
      });
    } else {
      shareBtn.disabled = true;
      shareBtn.textContent = '分享（不支援）';
    }
  }

  // === 反面 ===
  const back = ec.back || {};
  const bt = document.getElementById('ecBackTitle'); if (bt) bt.textContent = back.title || 'About this Expo';
  const bs = document.getElementById('ecBackSub');   if (bs) bs.textContent = back.subtitle || '展會亮點 / 注意事項';

  const ul = document.getElementById('ecBackBullets');
  if (ul) {
    ul.innerHTML = '';
    (back.bullets || []).forEach(t => {
      const li = document.createElement('li'); li.textContent = t; ul.appendChild(li);
    });
  }

  const mapBox = document.getElementById('ecMapBox');
  const mapImg = document.getElementById('ecMapImg');
  const mapBtn = document.getElementById('ecMapBtn');
  const hasMap = back.mapImg || back.mapUrl;
  if (mapBox) {
    mapBox.style.display = hasMap ? 'flex' : 'none';
    if (mapImg) {
      if (back.mapImg){ mapImg.src = back.mapImg; mapImg.style.display = 'block'; }
      else { mapImg.style.display = 'none'; }
    }
    if (mapBtn) {
      if (back.mapUrl){ mapBtn.href = back.mapUrl; mapBtn.style.display = 'inline-flex'; }
      else { mapBtn.style.display = 'none'; }
    }
  }

  const linkBox = document.getElementById('ecBackLinks');
  if (linkBox) {
    linkBox.innerHTML = '';
    (back.links || []).forEach(x => {
      const a = document.createElement('a');
      a.href = x.url; a.target = '_blank'; a.rel = 'noopener';
      a.textContent = x.text || x.url;
      linkBox.appendChild(a);
    });
  }

  // === 翻轉控制 ===
  const inner = document.getElementById('ecInner');
  const flipBtn = document.getElementById('ecFlipBtn');
  const flip = () => inner?.classList.toggle('is-back');

  document.getElementById('ecFlip')?.addEventListener('click', (e) => {
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'a' || tag === 'button' || e.target.closest?.('.btn')) return; // 避免誤翻
    flip();
  });
  flipBtn?.addEventListener('click', flip);
}

/* ===== 參展品牌：搜尋 + 類別 chips + 排序（整合模組） ===== */
function setupBrandsModule(data){
  const exhibitors = Array.isArray(data?.exhibitors) ? data.exhibitors : [];
  if (!exhibitors.length) return;

  const grid = document.getElementById('brandGrid');
  const sel  = document.getElementById('brandSort');
  const chipsBox = document.getElementById('brandChips');
  const qInput = document.getElementById('brandSearch');
  const qClear = document.getElementById('brandSearchClear');

  if (!grid || !sel || !chipsBox) return;

  // 狀態
  let state = {
    sort: sel.value || 'name_asc',
    category: '全部',
    query: ''
  };

  // 產生類別 chips
  const cats = Array.from(new Set(exhibitors.map(x => (x.category || '未分類')))).sort();
  const allCats = ['全部', ...cats];

  chipsBox.innerHTML = '';
  allCats.forEach(c => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip' + (c === '全部' ? ' active' : '');
    chip.textContent = c;
    chip.dataset.cat = c;
    chip.addEventListener('click', () => {
      chipsBox.querySelectorAll('.chip').forEach(el => el.classList.remove('active'));
      chip.classList.add('active');
      state.category = c;
      apply();
    });
    chipsBox.appendChild(chip);
  });

  // 事件：排序
  sel.addEventListener('change', () => { state.sort = sel.value; apply(); });

  // 事件：搜尋（debounce）
  let t = null;
  const handleSearch = () => { state.query = (qInput?.value || '').trim().toLowerCase(); apply(); };
  qInput?.addEventListener('input', () => { clearTimeout(t); t = setTimeout(handleSearch, 180); });
  qClear?.addEventListener('click', () => { if (qInput) qInput.value = ''; handleSearch(); });

  // 初次渲染
  apply();

  function apply(){
    let list = exhibitors.filter(x => {
      const catOK = state.category === '全部' || (x.category || '未分類') === state.category;
      const q = state.query;
      if (!q) return catOK;
      const name = (x.name || '').toLowerCase();
      const cat  = (x.category || '').toLowerCase();
      const booth= (x.booth || '').toString().toLowerCase();
      return catOK && (name.includes(q) || cat.includes(q) || booth.includes(q));
    });

    switch(state.sort){
      case 'name_asc':  list.sort((a,b)=> (a.name||'').localeCompare(b.name||'')); break;
      case 'name_desc': list.sort((a,b)=> (b.name||'').localeCompare(a.name||'')); break;
      case 'category':  list.sort((a,b)=> (a.category||'').localeCompare(b.category||'') || (a.name||'').localeCompare(b.name||'')); break;
      case 'booth':     list.sort((a,b)=> (a.booth||'').toString().localeCompare((b.booth||'').toString(), undefined, {numeric:true})); break;
    }

    renderBrands(list);
  }

  function renderBrands(list){
    grid.innerHTML = '';
    if (!list.length){
      grid.innerHTML = `<div class="brand-card" style="grid-column: 1/-1; text-align:center; padding:18px;">找不到符合的品牌</div>`;
      return;
    }
    list.forEach(b=>{
      const card = document.createElement('article');
      card.className = 'brand-card';
      card.innerHTML = `
        <div class="brand-thumb">
          <img src="${b.logo || 'https://via.placeholder.com/400x400.png?text=Logo'}" alt="${b.name || 'brand'}">
        </div>
        <div class="brand-body">
          <div class="brand-name">${b.name || ''}</div>
          <div class="brand-meta">
            <span>${b.category || '—'}</span>
            <span>${b.booth ? 'Booth ' + b.booth : ''}</span>
          </div>
          <div class="brand-cta">
            ${b.link ? `<a href="${b.link}" target="_blank" rel="noopener">查看</a>` : ''}
            ${b.contact ? `<a href="${b.contact}">聯絡</a>` : ''}
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }
}

/* ===== 聯絡主辦：初始化 + 送出 ===== */
function setupContact(data){
  const info = data?.contact || {};
  const email = info.email || data?.info?.email || '';
  const phone = info.phone || '';
  const addr  = info.address || '';
  const mapUrl= info.mapUrl || '';

  const emailA = document.getElementById('cEmailCard');
  const phoneA = document.getElementById('cPhoneCard');
  const addrA  = document.getElementById('cAddrCard');
  const emailTxt = document.getElementById('cEmailTxt');
  const phoneTxt = document.getElementById('cPhoneTxt');
  const addrTxt  = document.getElementById('cAddrTxt');

  if (emailA){ emailA.href = email ? `mailto:${email}` : '#'; }
  if (phoneA){ phoneA.href = phone ? `tel:${phone}` : '#'; }
  if (addrA){
    addrA.href = mapUrl || (addr ? `https://maps.google.com/?q=${encodeURIComponent(addr)}` : '#');
    addrA.target = '_blank'; addrA.rel = 'noopener';
  }
  if (emailTxt) emailTxt.textContent = email || '—';
  if (phoneTxt) phoneTxt.textContent = phone || '—';
  if (addrTxt)  addrTxt.textContent  = addr  || '—';

  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('cfSubmit');
  const statusEl = document.getElementById('cfStatus');
  if (!form) return;

  function setErr(id, has){
    const wrap = document.getElementById(id)?.closest('.field');
    if (!wrap) return;
    if (has) wrap.classList.add('invalid'); else wrap.classList.remove('invalid');
  }

  function validate(){
    const name = document.getElementById('cfName')?.value.trim();
    const email = document.getElementById('cfEmail')?.value.trim();
    const subject = document.getElementById('cfSubject')?.value.trim();
    const message = document.getElementById('cfMessage')?.value.trim();
    const emailOK = !!(email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
    setErr('cfName', !name); setErr('cfEmail', !emailOK);
    setErr('cfSubject', !subject); setErr('cfMessage', !message);
    return !!(name && emailOK && subject && message);
  }

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    if (!validate()){
      statusEl.className = 'cf-status fail';
      statusEl.textContent = '請完整填寫必填欄位。';
      return;
    }

    const payload = {
      name: document.getElementById('cfName').value.trim(),
      email: document.getElementById('cfEmail').value.trim(),
      company: document.getElementById('cfCompany').value.trim(),
      subject: document.getElementById('cfSubject').value.trim(),
      message: document.getElementById('cfMessage').value.trim(),
      expo: data?.hero?.title || 'Expo'
    };

    submitBtn.disabled = true;
    submitBtn.textContent = '送出中…';
    statusEl.className = 'cf-status'; statusEl.textContent = '';

    try{
      if (info.endpoint){
        const res = await fetch(info.endpoint, {
          method:'POST', headers:{ 'Content-Type':'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('server');
        statusEl.className = 'cf-status ok';
        statusEl.textContent = '已送出，我們會盡快回覆您！';
        form.reset();
      }else{
        const to = email || '';
        const subject = `[${payload.expo}] ${payload.subject}`;
        const body = `姓名：${payload.name}%0AEmail：${payload.email}%0A公司：${payload.company}%0A----%0A${encodeURIComponent(payload.message)}`;
        window.location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${body}`;
        statusEl.className = 'cf-status ok';
        statusEl.textContent = '已開啟郵件軟體，您也可直接寄信給主辦。';
      }
    }catch(err){
      statusEl.className = 'cf-status fail';
      statusEl.textContent = '送出失敗，請稍後再試或直接使用 Email 聯絡主辦。';
    }finally{
      submitBtn.disabled = false;
      submitBtn.textContent = '送出';
    }
  });

  form.addEventListener('reset', ()=>{
    statusEl.className = 'cf-status';
    statusEl.textContent = '';
    form.querySelectorAll('.field.invalid').forEach(el=> el.classList.remove('invalid'));
  });
}

/* ===== 交通資訊：初始化與渲染 ===== */
function setupTransport(data){
  const tp = data?.transport || {};
  // 會場資訊
  const venueName = document.getElementById('tpVenueName');
  const venueAddr = document.getElementById('tpVenueAddr');
  const mapBtn = document.getElementById('tpMapBtn');
  const mapBox = document.getElementById('tpMapBox');
  const mapEmbed = document.getElementById('tpMapEmbed');
  const mapImg = document.getElementById('tpMapImg');

  if (venueName) venueName.textContent = tp.venueName || data?.info?.venue || '展覽會場';
  if (venueAddr) venueAddr.textContent = tp.address || data?.info?.venueAddress || '';
  const mapHref = tp.mapUrl || (tp.address ? `https://maps.google.com/?q=${encodeURIComponent(tp.address)}` : '#');
  if (mapBtn) { mapBtn.href = mapHref; }

  if (mapBox){
    let shown = false;
    if (tp.embedUrl && mapEmbed){
      mapEmbed.src = tp.embedUrl;
      mapEmbed.style.display = 'block';
      shown = true;
    }
    if (!shown && tp.mapImage && mapImg){
      mapImg.src = tp.mapImage;
      mapImg.style.display = 'block';
      shown = true;
    }
    if (!shown){ mapBox.style.display = 'none'; }
  }

  // 模式 chips
  const chipsBox = document.getElementById('tpChips');
  const modes = tp.modes || {};
  const modeKeys = Object.keys(modes);
  if (!chipsBox || !modeKeys.length) return;

  const nice = {
    all:'全部', metro:'捷運 / 地鐵', bus:'公車', drive:'自行開車',
    parking:'停車', shuttle:'接駁車', taxi:'計程車 / 叫車', bike:'自行車 / YouBike'
  };

  let state = { mode: 'all' };

  chipsBox.innerHTML = '';
  const addChip = (key, label, active=false)=>{
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (active ? ' active' : '');
    b.textContent = label;
    b.dataset.mode = key;
    b.addEventListener('click', ()=>{
      chipsBox.querySelectorAll('.chip').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      state.mode = key;
      render();
    });
    chipsBox.appendChild(b);
  };

  addChip('all', nice.all, true);
  modeKeys.forEach(k => addChip(k, nice[k] || k));

  // 提示
  const tipsBox = document.getElementById('tpTips');
  if (Array.isArray(tp.tips) && tipsBox){
    tipsBox.innerHTML = `<div class="tp-block"><h3>小提醒</h3>${tp.tips.length ? `<ul>${tp.tips.map(t=>`<li>${t}</li>`).join('')}</ul>`:''}</div>`;
  }

  render();

  function render(){
    const el = document.getElementById('tpContent');
    if (!el) return;
    el.innerHTML = '';
    const pick = state.mode === 'all' ? modeKeys : [state.mode];

    pick.forEach(k=>{
      const d = modes[k];
      if (!d) return;
      switch(k){
        case 'metro':   el.appendChild(viewMetro(d)); break;
        case 'bus':     el.appendChild(viewBus(d)); break;
        case 'drive':   el.appendChild(viewDrive(d)); break;
        case 'parking': el.appendChild(viewParking(d)); break;
        case 'shuttle': el.appendChild(viewShuttle(d)); break;
        case 'taxi':    el.appendChild(viewTaxi(d)); break;
        case 'bike':    el.appendChild(viewBike(d)); break;
        default:        el.appendChild(viewGeneric(k, d)); break;
      }
    });
  }

  // 各視圖
  function block(title, innerHtml){
    const d = document.createElement('section');
    d.className = 'tp-block';
    d.innerHTML = `<h3>${title}</h3>${innerHtml}`;
    return d;
  }

  function viewMetro(m){
    const lines = (m.lines||[]).map(l=>{
      const meta = [l.station, l.exit?`出口 ${l.exit}`:'', l.walk?`步行 ${l.walk}`:''].filter(Boolean).join(' · ');
      return `<div class="tp-item"><div class="dot"></div><div class="body"><div>${l.line || ''}</div><div class="tp-meta">${meta}</div></div></div>`;
    }).join('');
    const txt = m.note ? `<div class="tp-meta" style="margin-top:6px">${m.note}</div>` : '';
    return block('捷運 / 地鐵', `<div class="tp-list">${lines}</div>${txt}`);
  }

  function viewBus(b){
    const routes = (b.routes||[]).map(r=>{
      const meta = [r.stop?`站名：${r.stop}`:'', r.freq?`班距：${r.freq}`:''].filter(Boolean).join(' · ');
      return `<div class="tp-item"><div class="dot"></div><div class="body"><div>路線：${r.no || ''}</div><div class="tp-meta">${meta}</div></div></div>`;
    }).join('');
    const txt = b.note ? `<div class="tp-meta" style="margin-top:6px">${b.note}</div>` : '';
    return block('公車', `<div class="tp-list">${routes}</div>${txt}`);
  }

  function viewDrive(d){
    const tips = (d.routes||[]).map(t=>`<div class="tp-item"><div class="dot"></div><div class="body">${t}</div></div>`).join('');
    return block('自行開車', `<div class="tp-list">${tips}</div>`);
  }

  function viewParking(p){
    const rows = (p.lots||[]).map(l=>`
      <tr>
        <td>${l.name || ''}</td>
        <td>${l.type || ''}</td>
        <td>${l.fee || ''}</td>
        <td>${l.spaces || ''}</td>
        <td>${l.open || ''}</td>
      </tr>`).join('');
    const table = `
      <div class="tp-scroll">
        <table class="tp-table">
          <thead><tr><th>停車場</th><th>車種</th><th>費率</th><th>車位</th><th>開放時間</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
    const txt = p.note ? `<div class="tp-meta" style="margin-top:6px">${p.note}</div>` : '';
    return block('停車', table + txt);
  }

  function viewShuttle(s){
    const rows = (s.times||[]).map(t=>`
      <tr>
        <td>${t.from || ''}</td>
        <td>${t.to || ''}</td>
        <td>${t.interval || ''}</td>
        <td>${t.first || ''} – ${t.last || ''}</td>
      </tr>`).join('');
    const table = `
      <table class="tp-table">
        <thead><tr><th>發車點</th><th>目的地</th><th>間距</th><th>營運時間</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
    const stops = (s.stops||[]).map(x=>`<div class="tp-item"><div class="dot"></div><div class="body">${x}</div></div>`).join('');
    const extra = stops ? `<div class="tp-list" style="margin-top:8px">${stops}</div>` : '';
    const txt = s.note ? `<div class="tp-meta" style="margin-top:6px">${s.note}</div>` : '';
    return block('接駁車', table + extra + txt);
  }

  function viewTaxi(t){
    const list = (t.hints||[]).map(x=>`<div class="tp-item"><div class="dot"></div><div class="body">${x}</div></div>`).join('');
    return block('計程車 / 叫車', `<div class="tp-list">${list}</div>`);
  }

  function viewBike(b){
    const list = (b.spots||[]).map(x=>{
      const meta = [x.distance?`距離：${x.distance}`:'', x.spaces?`車位：${x.spaces}`:''].filter(Boolean).join(' · ');
      return `<div class="tp-item"><div class="dot"></div><div class="body"><div>${x.name || ''}</div><div class="tp-meta">${meta}</div></div></div>`;
    }).join('');
    const txt = b.note ? `<div class="tp-meta" style="margin-top:6px">${b.note}</div>` : '';
    return block('自行車 / YouBike', `<div class="tp-list">${list}</div>${txt}`);
  }

  function viewGeneric(title, g){
    if (Array.isArray(g)){
      const list = g.map(x=>`<div class="tp-item"><div class="dot"></div><div class="body">${x}</div></div>`).join('');
      return block(title, `<div class="tp-list">${list}</div>`);
    }
    return block(title, `<div class="tp-meta">${g?.note || ''}</div>`);
  }
}

/* ===== 會員中心：UI 互動（純前端，無後端） ===== */
function setupAccountModule(){
  const aPage = document.getElementById('accountPage');
  if (!aPage) return;

  // 取 DOM
  const form = aPage.querySelector('#acctForm');
  const visList = aPage.querySelector('#visList');
  const btnAllOn  = aPage.querySelector('.acct-visibility .vis-actions .btn.btn-sm:not(.btn-outline)');
  const btnAllOff = aPage.querySelector('.acct-visibility .vis-actions .btn.btn-sm.btn-outline');

  // 迷你名片預覽節點
  const mini = aPage.querySelector('.acct-preview .ecard-mini');
  const miniName  = mini?.querySelector('.name');
  const miniTitle = mini?.querySelector('.title');
  const miniMeta  = mini?.querySelector('.meta');

  // 表單欄位映射（不改 HTML 的前提下用 placeholder/順序/label 文案推斷）
  const F = {
    name:   form?.querySelector('input[placeholder="王小明"]'),
    title:  form?.querySelector('input[placeholder="行銷經理"]'),
    org:    form?.querySelector('input[placeholder="Acme Inc."]'),
    email:  form?.querySelector('input[type="email"]'),
    phone:  form?.querySelector('input[type="tel"]'),
    site:   form?.querySelector('input[type="url"]'),
    bio:    form?.querySelector('textarea')
  };

  // 將「公開到名片」checkbox 以文字對應成 key
  const visMap = {}; // {key: input[type=checkbox]}
  (visList?.querySelectorAll('li label') || []).forEach(label=>{
    const txt = (label.textContent || '').trim();
    const cb  = label.querySelector('input[type="checkbox"]');
    const map = {
      '姓名':'name','職稱':'title','公司':'org','Email':'email',
      '電話':'phone','網站':'site','地址':'address','簡介':'bio'
    };
    const key = map[txt] || null;
    if (key && cb) visMap[key] = cb;
  });

  // 讀值的工具
  const getVal = (el)=> (el && typeof el.value === 'string') ? el.value.trim() : '';
  const V = ()=>({
    name:  getVal(F.name),
    title: getVal(F.title),
    org:   getVal(F.org),
    email: getVal(F.email),
    phone: getVal(F.phone),
    site:  getVal(F.site).replace(/^https?:\/\//,''),
    bio:   getVal(F.bio)
  });
  const VIS = ()=>Object.fromEntries(Object.entries(visMap).map(([k,cb])=>[k, !!cb.checked]));

  // 更新「名片預覽」UI
  function renderPreview(){
    if (!mini) return;
    const v = V();
    const vis = VIS();

    // 姓名
    if (miniName) miniName.textContent = vis.name && v.name ? v.name : '—';

    // 職稱 + 公司（依可見性決定字串組合）
    const t = (vis.title && v.title) ? v.title : '';
    const o = (vis.org && v.org) ? v.org : '';
    const titleLine = t && o ? `${t} @ ${o}` : (t || o || '—');
    if (miniTitle) miniTitle.textContent = titleLine;

    // Meta：Email / Site（依可見性）
    const metas = [];
    if (vis.email && v.email) metas.push(`<span class="i i-mail"></span> ${escapeHtml(v.email)}`);
    if (vis.site  && v.site)  metas.push(`<span class="i i-link"></span> ${escapeHtml(v.site)}`);
    // 你也可加入電話，但通常不預設公開
    if (miniMeta) miniMeta.innerHTML = metas.length ? metas.join('　·　') : `<span class="muted">未公開任何聯絡方式</span>`;

    // 若目前在 #ecard 頁，順手把實際名片也同步（純 DOM，非資料）
    syncLiveEcard(v, vis);
  }

  // 逃逸 HTML（避免輸入含 < >）
  function escapeHtml(s){ return s.replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }

  // 同步 #ecard 頁的顯示（只改現有元素文字，不動圖片/Logo/QR）
  function syncLiveEcard(v, vis){
    if ((location.hash||'') !== '#ecard') return;
    const $ = (id)=>document.getElementById(id);

    const name = vis.name && v.name ? v.name : '—';
    const title= vis.title&& v.title? v.title: '';
    const org  = vis.org  && v.org  ? v.org  : '';
    const line2= title && org ? title : (title || ''); // 第二行：職稱
    const line3= org || '';                            // 第三行：公司（保持你的結構）

    $('ecName')  && ( $('ecName').textContent  = name );
    $('ecTitle') && ( $('ecTitle').textContent = line2 || '—' );
    $('ecOrg')   && ( $('ecOrg').textContent   = line3 || '—' );

    const phoneEl = $('ecPhone');
    const mailEl  = $('ecEmail');
    const siteEl  = $('ecSite');
    const addrEl  = $('ecAddr');

    if (phoneEl){
      if (vis.phone && v.phone){ phoneEl.href = `tel:${v.phone}`; phoneEl.textContent = v.phone; }
      else { phoneEl.removeAttribute('href'); phoneEl.textContent = '—'; }
    }
    if (mailEl){
      if (vis.email && v.email){ mailEl.href = `mailto:${v.email}`; mailEl.textContent = v.email; }
      else { mailEl.removeAttribute('href'); mailEl.textContent = '—'; }
    }
    if (siteEl){
      if (vis.site && v.site){ siteEl.href = /^https?:\/\//.test(v.site) ? v.site : `https://${v.site}`; siteEl.textContent = v.site; }
      else { siteEl.removeAttribute('href'); siteEl.textContent = '—'; }
    }
    if (addrEl){
      addrEl.textContent = (vis.address && v.address) ? v.address : '—';
    }
  }

  // 綁定事件：表單輸入 & 可見性切換
  const onChange = ()=>renderPreview();
  (Object.values(F).filter(Boolean) || []).forEach(el=>{
    el.addEventListener('input', onChange);
    el.addEventListener('change', onChange);
  });
  Object.values(visMap).forEach(cb=> cb.addEventListener('change', onChange));

  // 全部顯示 / 全部隱藏
  btnAllOn?.addEventListener('click', ()=>{
    Object.values(visMap).forEach(cb=> cb.checked = true);
    renderPreview();
  });
  btnAllOff?.addEventListener('click', ()=>{
    Object.values(visMap).forEach(cb=> cb.checked = false);
    renderPreview();
  });

  // 首次渲染
  renderPreview();
}