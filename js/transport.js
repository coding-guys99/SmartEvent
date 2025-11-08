// 交通資訊
(function () {
  function init(data){
    const tp = data?.transport || {};
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
      if (tp.embedUrl && mapEmbed){ mapEmbed.src = tp.embedUrl; mapEmbed.style.display = 'block'; shown = true; }
      if (!shown && tp.mapImage && mapImg){ mapImg.src = tp.mapImage; mapImg.style.display = 'block'; shown = true; }
      if (!shown){ mapBox.style.display = 'none'; }
    }

    // chips
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
        b.classList.add('active'); state.mode = key; render();
      });
      chipsBox.appendChild(b);
    };
    addChip('all', nice.all, true);
    modeKeys.forEach(k => addChip(k, nice[k] || k));

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
        const d = modes[k]; if (!d) return;
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

    const block = (title, innerHtml)=>{
      const d = document.createElement('section');
      d.className = 'tp-block';
      d.innerHTML = `<h3>${title}</h3>${innerHtml}`;
      return d;
    };

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
        <tr><td>${l.name||''}</td><td>${l.type||''}</td><td>${l.fee||''}</td><td>${l.spaces||''}</td><td>${l.open||''}</td></tr>
      `).join('');
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
        <tr><td>${t.from||''}</td><td>${t.to||''}</td><td>${t.interval||''}</td><td>${t.first||''} – ${t.last||''}</td></tr>
      `).join('');
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
  window.Transport = { init };
})();