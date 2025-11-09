// js/ecard.js
// ExpoLink 名片頁：對應新版版型（左上 Logo、右上 QR、公司/姓名、底部一欄三列）

(function () {
  function init(HOME) {
    const ec = HOME?.ecard || {};
    if (!document.getElementById('ecardPage')) return;

    // -------- 左上 Logo（有圖用圖；否則用首字母 monogram） --------
    const logo = byId('ecLogo');
    const mono = byId('ecMonogram');
    if (ec.logo && logo) {
      logo.src = ec.logo;
      logo.style.display = 'block';
      mono && (mono.style.display = 'none');
    } else if (mono) {
      const t = (ec.org || ec.name || 'E').trim().charAt(0).toUpperCase() || 'E';
      mono.textContent = t;
      mono.style.display = 'grid';
      logo && (logo.style.display = 'none');
    }

    // -------- 右上 QR --------
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

    // -------- 中央：公司 + 姓名 --------
    setText('ecOrgTop', ec.org || '');
    setText('ecNameMain', ec.name || '');

    // -------- 底部三列：電話 / 地址 / Email（空值會自動隱藏） --------
    // 每一列的包裝元素 id：ecRowPhone / ecRowAddr / ecRowEmail
    fillLinkRow({
      rowId: 'ecRowPhone',
      aId: 'ecPhone',
      icon: 'tel',
      value: ec.phone,
      href: (v) => `tel:${v}`
    });

    fillLinkRow({
      rowId: 'ecRowAddr',
      aId: 'ecAddr',
      icon: 'map',
      value: ec.address,
      href: (v) => '#'   // 你要導地圖可換成 google map：`https://maps.google.com/?q=${encodeURIComponent(v)}`
    });

    fillLinkRow({
      rowId: 'ecRowEmail',
      aId: 'ecEmail',
      icon: 'mail',
      value: ec.email,
      href: (v) => `mailto:${v}`
    });

    // -------- vCard / 分享（沿用） --------
    mountVcard(ec);
    mountShare(ec);

    // -------- 翻面控制（沿用） --------
    const inner = byId('ecInner');
    const flipBtn = byId('ecFlipBtn');
    const flip = () => inner?.classList.toggle('is-back');

    byId('ecFlip')?.addEventListener('click', (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'a' || tag === 'button' || e.target.closest?.('.btn')) return;
      flip();
    });
    flipBtn?.addEventListener('click', flip);
  }

  // -------- helpers --------
  function byId(id) { return document.getElementById(id); }
  function setText(id, val) {
    const el = byId(id);
    if (el) el.textContent = String(val ?? '');
  }

  // 依值填入一列；沒值則隱藏整列
  function fillLinkRow({ rowId, aId, value, href }) {
    const row = byId(rowId);
    const a = byId(aId);
    if (!row) return;
    const v = (value || '').trim();
    if (!v) {
      row.style.display = 'none';
      a && (a.textContent = '—', a.removeAttribute('href'));
      return;
    }
    row.style.display = ''; // 顯示
    if (a) {
      a.textContent = v;
      const link = href ? href(v) : '#';
      if (link && link !== '#') {
        a.href = link;
      } else {
        a.removeAttribute('href');
      }
    }
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
        const text = `${ec.name||''}｜${ec.org||''}\n${ec.email||''}\n${ec.phone||''}`;
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