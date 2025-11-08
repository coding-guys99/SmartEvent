// js/countdown.js
(function () {
  let timer = null;

  function parseStartDate(dateRangeStr){
    if (!dateRangeStr) return null;
    const first = String(dateRangeStr).split('~')[0]?.trim();
    if (!first) return null;
    const d = new Date(first);
    if (isNaN(+d)) return null;
    // 歸零到當地 00:00
    d.setHours(0,0,0,0);
    return d;
  }

  function format(t){
    const dd = Math.floor(t / 86400000);
    const hh = Math.floor((t % 86400000) / 3600000);
    const mm = Math.floor((t % 3600000) / 60000);
    const ss = Math.floor((t % 60000) / 1000);
    return {
      days:  String(dd).padStart(2,'0'),
      hours: String(hh).padStart(2,'0'),
      mins:  String(mm).padStart(2,'0'),
      secs:  String(ss).padStart(2,'0'),
    };
  }

  function textFallback(target, infoEl){
    const today = new Date(); today.setHours(0,0,0,0);
    const days = Math.ceil((target - today)/86400000);
    if (!infoEl) return;
    if (days > 0) infoEl.textContent = `距開展還有 ${days} 天`;
    else if (days === 0) infoEl.textContent = '今天開展';
    else infoEl.textContent = '展會進行中或已結束';
  }

  function mount(container, targetDateStr){
    const box = typeof container === 'string' ? document.getElementById(container) : container;
    const info = document.getElementById('infoCountdown');
    const target = parseStartDate(targetDateStr);
    if (!box || !target){ box && (box.hidden = true); return; }

    // 起跑前先輸出一次
    box.hidden = false;
    tick(box, target, info);
    clearInterval(timer);
    timer = setInterval(() => tick(box, target, info), 1000);
  }

  function tick(box, target, info){
    const now = new Date();
    const remain = +target - +now;
    if (remain <= 0){
      clearInterval(timer);
      textFallback(target, info);
      box.hidden = true; // 以文字顯示
      return;
    }
    const {days, hours, mins, secs} = format(remain);

    updateUnit(box, 'days', days);
    updateUnit(box, 'hours', hours);
    updateUnit(box, 'mins', mins);
    updateUnit(box, 'secs', secs);

    // 同步備援文字（方便 SEO / 讀屏）
    if (info) info.textContent = `${Number(days)} 天 ${hours}:${mins}:${secs}`;
  }

  function updateUnit(box, unit, val){
    const el = box.querySelector(`.cd-num[data-unit="${unit}"]`);
    if (!el) return;
    if (el.textContent !== val){
      el.textContent = val;
      // 觸發一次 flip 動畫
      el.classList.remove('tick');
      // 強制 reflow 以重播動畫
      // eslint-disable-next-line no-unused-expressions
      el.offsetWidth;
      el.classList.add('tick');
    }
  }

  window.Countdown = { mount };
})();