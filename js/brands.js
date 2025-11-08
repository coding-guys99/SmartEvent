// 參展品牌：搜尋 + 類別 + 排序
(function () {
  function init(data){
    const exhibitors = Array.isArray(data?.exhibitors) ? data.exhibitors : [];
    if (!exhibitors.length) return;

    const grid = document.getElementById('brandGrid');
    const sel  = document.getElementById('brandSort');
    const chipsBox = document.getElementById('brandChips');
    const qInput = document.getElementById('brandSearch');
    const qClear = document.getElementById('brandSearchClear');

    if (!grid || !sel || !chipsBox) return;

    let state = { sort: sel.value || 'name_asc', category: '全部', query: '' };

    // 類別 chips
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
        state.category = c; apply();
      });
      chipsBox.appendChild(chip);
    });

    sel.addEventListener('change', () => { state.sort = sel.value; apply(); });

    let t = null;
    const handleSearch = () => { state.query = (qInput?.value || '').trim().toLowerCase(); apply(); };
    qInput?.addEventListener('input', () => { clearTimeout(t); t = setTimeout(handleSearch, 180); });
    qClear?.addEventListener('click', () => { if (qInput) qInput.value = ''; handleSearch(); });

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

      render(list);
    }

    function render(list){
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
  window.Brands = { init };
})();