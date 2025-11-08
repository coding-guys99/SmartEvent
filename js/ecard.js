// 電子名片（初始化 + 翻面 + vCard）
(function () {
  function init(HOME) {
    const ec = HOME?.ecard;
    if (!ec) return;

    const logo = document.getElementById('ecLogo');
    const mono = document.getElementById('ecMonogram');
    if (ec.logo && logo) {
      logo.src = ec.logo; logo.style.display = 'block';
      mono && (mono.style.display = 'none');
    } else if (mono) {
      const t = (ec.org || ec.name || 'E')[0]?.toUpperCase() || 'E';
      mono.textContent = t; mono.style.display = 'grid';
    }

    const qr = document.getElementById('ecQr');
    const qrPh = document.getElementById('ecQrPh');
    if (ec.qr && qr) {
      qr.src = ec.qr; qr.style.display = 'block';
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

    if (phoneEl){ ec.phone ? (phoneEl.href = `tel:${ec.phone}`, phoneEl.textContent = ec.phone) : (phoneEl.removeAttribute('href'), phoneEl.textContent = '—'); }
    if (mailEl){  ec.email ? (mailEl.href  = `mailto:${ec.email}`, mailEl.textContent  = ec.email) : (mailEl.removeAttribute('href'),  mailEl.textContent  = '—'); }
    if (siteEl){  ec.site  ? (siteEl.href  = ec.site, siteEl.textContent  = ec.site.replace(/^https?:\/\//,'')) : (siteEl.removeAttribute('href'), siteEl.textContent = '—'); }
    if (addrEl){ addrEl.textContent = ec.address || '—'; }

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
          try { await navigator.share({ title: ec.name, text, url: location.href.split('#')[0] + '#ecard' }); } catch(e){}
        });
      } else { shareBtn.disabled = true; shareBtn.textContent = '分享（不支援）'; }
    }

    // 反面
    const back = ec.back || {};
    const bt = document.getElementById('ecBackTitle'); if (bt) bt.textContent = back.title || 'About this Expo';
    const bs = document.getElementById('ecBackSub');   if (bs) bs.textContent = back.subtitle || '展會亮點 / 注意事項';

    const ul = document.getElementById('ecBackBullets');
    if (ul) {
      ul.innerHTML = '';
      (back.bullets || []).forEach(t => { const li = document.createElement('li'); li.textContent = t; ul.appendChild(li); });
    }
    const mapBox = document.getElementById('ecMapBox');
    const mapImg = document.getElementById('ecMapImg');
    const mapBtn = document.getElementById('ecMapBtn');
    const hasMap = back.mapImg || back.mapUrl;
    if (mapBox) {
      mapBox.style.display = hasMap ? 'flex' : 'none';
      if (mapImg) back.mapImg ? (mapImg.src = back.mapImg, mapImg.style.display = 'block') : (mapImg.style.display = 'none');
      if (mapBtn) back.mapUrl ? (mapBtn.href = back.mapUrl, mapBtn.style.display = 'inline-flex') : (mapBtn.style.display='none');
    }

    // 翻轉
    const inner = document.getElementById('ecInner');
    const flipBtn = document.getElementById('ecFlipBtn');
    const flip = () => inner?.classList.toggle('is-back');
    document.getElementById('ecFlip')?.addEventListener('click', (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'a' || tag === 'button' || e.target.closest?.('.btn')) return;
      flip();
    });
    flipBtn?.addEventListener('click', flip);
  }

  window.Ecard = { init };
})();