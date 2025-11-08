// js/utils.js
(function (global) {
  const $  = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  function setVisible(el, show){
    if (!el) return;
    el.hidden = !show;
    el.setAttribute('aria-hidden', String(!show));
  }

  // 之前 app.js 裡的版本：日期區間字串 "YYYY-MM-DD ~ YYYY-MM-DD"
  function getCountdown(range){
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

  // 通用防抖
  function debounce(fn, delay=180){
    let t=null;
    return function(...args){ clearTimeout(t); t=setTimeout(()=>fn.apply(this,args), delay); };
  }

  // 安全轉絕對網址（選用）
  function toAbsUrl(url){
    if (!url) return '';
    try { return new URL(url, location.href).href; } catch (e) { return url; }
  }

  global.Utils = { $, $$, setVisible, getCountdown, debounce, toAbsUrl };
})(window);