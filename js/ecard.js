// js/ecard.js
// 名片頁（對齊你的 HTML：ecOrg / ecName / ecPhone / ecAddr / ecEmail）

(function () {
  function init(HOME) {
    const ec = HOME?.ecard || {};
    if (!document.getElementById('ecardPage')) return;

    // ---------- 左上：Logo / Monogram ----------
    const logo = byId('ecLogo');
    const mono = byId('ecMonogram');
    if (ec.logo && logo) {
      logo.src = ec.logo;
      logo.style.display = 'block';
      mono && (mono.style.display = 'none');
    } else {
      if (mono) {
        const t = (ec.org || ec.name || 'E').trim().charAt(0).toUpperCase() || 'E';
        mono.textContent = t;
        mono.style.display = 'grid';
      }
      logo && (logo.style.display = 'none');
    }

    // ---------- 右上：QR ----------
    const qr = byId('ecQr');
    const qrPh = byId('ecQrPh');
    if (ec.qr && qr) {
      qr.src = ec.qr;
      qr.style.display = 'block';
      qrPh && (qrPh.style.display = 'none');
    } else {
      qr && (qr.style.display = 'none');
      qrPh && (qrPh.style.display = 'grid');
    }

    // ---------- 中央：公司名 / 人名 ----------
    setText('ecOrg', ec.org || '');
    setText('ecName', ec.name || '');

    // ---------- 底部三列：電話 / 地址 / Email（空值自動隱藏整列） ----------
    fillRowLink({
      nodeId: 'ecPhone',
      value: ec.phone,
      href: v => `tel:${v}`
    });

    // 地址是 <span id="ecAddr">，預設不連結；要改成開地圖可自行把 <span> 換成 <a>
    fillRowText({
      nodeId: 'ecAddr',
      value: ec.address
    });

    fillRowLink({
      nodeId: 'ecEmail',
      value: ec.email,
      href: v => `mailto:${v}`
    });

    // ---------- vCard / 分享 ----------
    mountVcard(ec);
    mountShare(ec);

    // ---------- 翻面控制 ----------
    const flipWrap = document.querySelector('.ec-flip');
    const inner = byId('ecInner');
    const flipBtn = byId('ecFlipBtn');
    const flip = () => inner?.classList.toggle('is-back');

    // 點整張卡（但避開按鈕/連結）
    flipWrap?.addEventListener('click', (e) => {
      const t = e.target;
      if (!t) return;
      const tag = (t.tagName || '').toLowerCase();
      if (tag === 'a' || tag === 'button' || t.closest?.('.btn')) return;
      flip();
    });
    flipBtn?.addEventListener('click', flip);
  }

  // ===== helpers =====
  function byId(id) { return document.getElementById(id); }
  function setText(id, val) {
    const el = byId(id);
    if (!el) return;
    el.textContent = String(val ?? '');
  }

  // <a id="..."> ；沒值就隱藏父 .row
  function fillRowLink({ nodeId, value, href }) {
    const a = byId(nodeId);
    if (!a) return;
    const row = a.closest('.row');
    const v = (value || '').trim();
    if (!v) {
      row && (row.style.display = 'none');
      a.removeAttribute('href');
      a.textContent = '—';
      return;
    }
    a.textContent = v;
    const link = href ? href(v) : '';
    if (link) a.href = link; else a.removeAttribute('href');
    row && (row.style.display = '');
  }

  // <span id="..."> ；沒值就隱藏父 .row
  function fillRowText({ nodeId, value }) {
    const el = byId(nodeId);
    if (!el) return;
    const row = el.closest('.row');
    const v = (value || '').trim();
    if (!v) {
      row && (row.style.display = 'none');
      el.textContent = '—';
      return;
    }
    el.textContent = v;
    row && (row.style.display = '');
  }

  function mountVcard(ec) {
    const v = [
      'BEGIN:VCARD','VERSION:3.0',
      `N:${ec.name||''};;;`,
      `FN:${ec.name||''}`,
      `ORG:${ec.org||''}`,
      ec.phone ? `TEL;TYPE=CELL:${ec.phone}` : '',
      ec.email ? `EMAIL;TYPE=INTERNET:${ec.email}` : '',
      ec.address ? `ADR;TYPE=WORK:;;${ec.address};;;;` : '',
      ec.site ? `URL:${ec.site}` : '',
      'END:VCARD'
    ].filter(Boolean).join('\n');
    const url = URL.createObjectURL(new Blob([v], { type: 'text/vcard' }));
    const vcf = byId('ecVcf');
    if (vcf) vcf.href = url;
  }

  function mountShare(ec) {
    const shareBtn = byId('ecShare');
    if (!shareBtn) return;
    if (navigator.share) {
      shareBtn.disabled = false;
      shareBtn.addEventListener('click', async () => {
        const text = `${ec.org || ''}\n${ec.name || ''}\n${ec.email || ''}\n${ec.phone || ''}`;
        try {
          await navigator.share({
            title: ec.name || '我的名片',
            text,
            url: location.href.split('#')[0] + '#ecard'
          });
        } catch (_) {}
      });
    } else {
      shareBtn.disabled = true;
      shareBtn.textContent = '分享（不支援）';
    }
  }

  window.Ecard = { init };
})();