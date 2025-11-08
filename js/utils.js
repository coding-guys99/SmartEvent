// 小工具 &通用函式
(function () {
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function setVisible(el, show) {
    if (!el) return;
    el.hidden = !show;
    el.setAttribute('aria-hidden', String(!show));
  }

  function getCountdown(range) {
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

  window.Utils = { $, $$, setVisible, getCountdown };
})();