// js/home.js
// 首頁：Hero / Actions / Info / Powered
(function () {
  function init(HOME) {
    if (!HOME || !window.Utils) return;
    const { getCountdown, toAbsUrl } = Utils;

    // --- Hero ---
    const heroImg = document.getElementById('heroImg');
    const heroData = HOME.hero || {};
    if (heroImg) {
      const src = heroData.img || '';
      heroImg.src = src;
      heroImg.alt = heroData.alt || 'Hero';
      heroImg.style.display = src ? '' : 'none';
    }
    setText('heroTitle', heroData.title || '');
    setText('heroSubtitle', heroData.subtitle || '');

    const heroCtas = document.getElementById('heroCtas');
    if (heroCtas) {
      heroCtas.innerHTML = '';
      (Array.isArray(heroData.cta) ? heroData.cta : []).forEach(c => {
        const a = document.createElement('a');
        const isHash = (c.link || '').startsWith('#');
        a.textContent = c.text || '';
        a.className = c.primary ? 'btn btn-primary' : 'btn btn-outline';
        a.href = isHash ? (c.link || '#') : toAbsUrl(c.link || '#');
        if (!isHash) { a.target = '_blank'; a.rel = 'noopener'; }
        heroCtas.appendChild(a);
      });
    }

    // --- Actions chips ---
    const actions = document.getElementById('actions');
    if (actions) {
      actions.innerHTML = '';
      (Array.isArray(HOME.actions) ? HOME.actions : []).forEach(c => {
        const a = document.createElement('a');
        const isHash = (c.link || '').startsWith('#');
        a.textContent = c.text || '';
        a.href = isHash ? (c.link || '#') : toAbsUrl(c.link || '#');
        if (!isHash) { a.target = '_blank'; a.rel = 'noopener'; }
        actions.appendChild(a);
      });
    }
    
    // --- Event photo (above info cards) ---
const photoWrap = document.getElementById('eventPhoto');
const photoImg  = document.getElementById('eventPhotoImg');
const photoCap  = document.getElementById('eventPhotoCap');

// 優先順序：HOME.info.photo → HOME.hero.img
const photoSrc = (HOME?.info?.photo) || (HOME?.hero?.img) || '';
const caption  = HOME?.info?.photoCaption || '';

if (photoWrap && photoImg) {
  if (photoSrc) {
    photoImg.src = photoSrc;
    photoWrap.hidden = false;
    photoWrap.setAttribute('aria-hidden','false');
    if (photoCap) {
      photoCap.textContent = caption || '';
      photoCap.style.display = caption ? '' : 'none';
    }
  } else {
    // 沒有圖片就保持隱藏
    photoWrap.hidden = true;
    photoWrap.setAttribute('aria-hidden','true');
  }
}

    // --- Info ---
    const info = HOME.info || {};
    const dateStr = info.date || '';
    setText('infoDate', dateStr);
    setText('infoVenue', info.venue || '');
    setText('infoOrganizer', info.organizer || '');
    setText('infoCountdown', getCountdown(dateStr)); // 文字備援

    // 啟動動態倒數（若有載入 countdown.js 且有 #cdWidget）
    if (window.Countdown && document.getElementById('cdWidget')) {
      Countdown.mount('cdWidget', dateStr);
    }

    // --- Powered ---
    const powered = HOME.powered || {};
    setText('poweredText', powered.text || '');
    const poweredCta = document.getElementById('poweredCta');
    if (poweredCta) {
      poweredCta.textContent = powered?.cta?.text || '';
      poweredCta.href = powered?.cta?.link ? toAbsUrl(powered.cta.link) : '#';
      poweredCta.target = '_blank';
      poweredCta.rel = 'noopener';
    }
  }

  function setText(id, val) {
    const el = document.getElementById(id);
    if (!el) return;
    const s = String(val ?? '');
    if (el.textContent !== s) el.textContent = s;
  }

  window.Home = { init };
})();