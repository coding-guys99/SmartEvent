// 輕量帳戶 UI（純前端，無持久化）
(function(){
  function setup(){
    const aPage = document.getElementById('accountPage');
    if (!aPage) return;

    const form = aPage.querySelector('#acctForm');
    const visList = aPage.querySelector('#visList');
    const btnAllOn  = aPage.querySelector('.acct-visibility .vis-actions .btn.btn-sm:not(.btn-outline)');
    const btnAllOff = aPage.querySelector('.acct-visibility .vis-actions .btn.btn-sm.btn-outline');

    const mini = aPage.querySelector('.acct-preview .ecard-mini');
    const miniName  = mini?.querySelector('.name');
    const miniTitle = mini?.querySelector('.title');
    const miniMeta  = mini?.querySelector('.meta');

    const F = {
      name:   form?.querySelector('input[placeholder="王小明"]'),
      title:  form?.querySelector('input[placeholder="行銷經理"]'),
      org:    form?.querySelector('input[placeholder="Acme Inc."]'),
      email:  form?.querySelector('input[type="email"]'),
      phone:  form?.querySelector('input[type="tel"]'),
      site:   form?.querySelector('input[type="url"]'),
      bio:    form?.querySelector('textarea')
    };

    const visMap = {};
    (visList?.querySelectorAll('li label') || []).forEach(label=>{
      const txt = (label.textContent || '').trim();
      const cb  = label.querySelector('input[type="checkbox"]');
      const map = { '姓名':'name','職稱':'title','公司':'org','Email':'email','電話':'phone','網站':'site','地址':'address','簡介':'bio' };
      const key = map[txt] || null;
      if (key && cb) visMap[key] = cb;
    });

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

    function escapeHtml(s){ return s.replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }

    function renderPreview(){
      if (!mini) return;
      const v = V();
      const vis = VIS();
      if (miniName)  miniName.textContent = vis.name && v.name ? v.name : '—';
      const t = (vis.title && v.title) ? v.title : '';
      const o = (vis.org && v.org) ? v.org : '';
      const titleLine = t && o ? `${t} @ ${o}` : (t || o || '—');
      if (miniTitle) miniTitle.textContent = titleLine;
      const metas = [];
      if (vis.email && v.email) metas.push(`<span class="i i-mail"></span> ${escapeHtml(v.email)}`);
      if (vis.site  && v.site)  metas.push(`<span class="i i-link"></span> ${escapeHtml(v.site)}`);
      if (miniMeta) miniMeta.innerHTML = metas.length ? metas.join('　·　') : `<span class="muted">未公開任何聯絡方式</span>`;
      syncLiveEcard(v, vis);
    }

    function syncLiveEcard(v, vis){
      if ((location.hash||'') !== '#ecard') return;
      const $ = (id)=>document.getElementById(id);
      const name = vis.name && v.name ? v.name : '—';
      const title= vis.title&& v.title? v.title: '';
      const org  = vis.org  && v.org  ? v.org  : '';
      const line2= title && org ? title : (title || '');
      const line3= org || '';
      $('ecName')  && ( $('ecName').textContent  = name );
      $('ecTitle') && ( $('ecTitle').textContent = line2 || '—' );
      $('ecOrg')   && ( $('ecOrg').textContent   = line3 || '—' );

      const phoneEl = $('ecPhone'), mailEl = $('ecEmail'), siteEl = $('ecSite'), addrEl = $('ecAddr');
      if (phoneEl){ vis.phone && v.phone ? (phoneEl.href = `tel:${v.phone}`, phoneEl.textContent = v.phone) : (phoneEl.removeAttribute('href'), phoneEl.textContent='—'); }
      if (mailEl){  vis.email && v.email ? (mailEl.href = `mailto:${v.email}`, mailEl.textContent = v.email) : (mailEl.removeAttribute('href'), mailEl.textContent='—'); }
      if (siteEl){  vis.site  && v.site  ? (siteEl.href = /^https?:\/\//.test(v.site) ? v.site : `https://${v.site}`, siteEl.textContent = v.site) : (siteEl.removeAttribute('href'), siteEl.textContent='—'); }
      if (addrEl){  addrEl.textContent = (vis.address && v.address) ? v.address : '—'; }
    }

    const onChange = ()=>renderPreview();
    (Object.values(F).filter(Boolean) || []).forEach(el=>{
      el.addEventListener('input', onChange);
      el.addEventListener('change', onChange);
    });
    Object.values(visMap).forEach(cb=> cb.addEventListener('change', onChange));

    btnAllOn?.addEventListener('click', ()=>{ Object.values(visMap).forEach(cb=> cb.checked = true); renderPreview(); });
    btnAllOff?.addEventListener('click', ()=>{ Object.values(visMap).forEach(cb=> cb.checked = false); renderPreview(); });

    renderPreview();
  }

  window.AccountUI = { init: setup };
})();