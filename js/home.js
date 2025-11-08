// 首頁：Hero / Actions / Info / Powered
(function () {
  function init(HOME) {
    if (!HOME) return;

    // Hero
    const heroImg = document.getElementById('heroImg');
    if (heroImg) heroImg.src = HOME?.hero?.img || '';
    const hTitle = document.getElementById('heroTitle');
    if (hTitle) hTitle.textContent = HOME?.hero?.title || '';
    const hSub = document.getElementById('heroSubtitle');
    if (hSub) hSub.textContent = HOME?.hero?.subtitle || '';

    const heroCtas = document.getElementById('heroCtas');
    if (heroCtas && Array.isArray(HOME?.hero?.cta)) {
      heroCtas.innerHTML = '';
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
      actions.innerHTML = '';
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
    if (infoCountdown) infoCountdown.textContent = Utils.getCountdown(dateStr);

    // Powered
    const poweredText = document.getElementById('poweredText');
    if (poweredText) poweredText.textContent = HOME?.powered?.text || '';
    const poweredCta = document.getElementById('poweredCta');
    if (poweredCta) {
      poweredCta.textContent = HOME?.powered?.cta?.text || '';
      poweredCta.href = HOME?.powered?.cta?.link || '#';
    }
  }

  window.Home = { init };
})();