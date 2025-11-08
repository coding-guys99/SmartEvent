// js/scanner.js
// 浮動掃描 FAB + Overlay（純前端 UI 模擬）
(function () {
  let els = {};

  function init() {
    els.fab       = document.getElementById('scanFab');
    els.sheet     = document.getElementById('scanner');
    els.btnClose  = document.getElementById('closeScanner');
    els.btnStart  = document.getElementById('btnStartScan');
    els.btnMock   = document.getElementById('btnMockHit');
    els.btnTorch  = document.getElementById('btnTorch');
    els.result    = document.getElementById('scanResult');

    // 沒有掃描區塊就直接略過（不報錯）
    if (!els.sheet) return;

    els.fab && els.fab.addEventListener('click', open);
    els.btnClose && els.btnClose.addEventListener('click', hide);

    els.btnStart && els.btnStart.addEventListener('click', () => {
      if (!els.result) return;
      els.result.style.color = 'var(--muted)';
      els.result.textContent = '正在掃描…（介面模擬）';
    });

    els.btnMock && els.btnMock.addEventListener('click', () => {
      if (!els.result) return;
      els.result.style.color = 'var(--accent)';
      els.result.textContent = '識別成功：TICKET-EXPO-2025-#A1';
    });

    let torch = false;
    els.btnTorch && els.btnTorch.addEventListener('click', () => {
      torch = !torch;
      els.btnTorch.style.borderColor = torch ? 'var(--primary)' : 'var(--line)';
      els.btnTorch.title = torch ? '關閉照明' : '開啟照明';
    });
  }

  function open() {
    if (!els.sheet) return;
    els.sheet.classList.add('show');
  }

  function hide() {
    if (!els.sheet) return;
    els.sheet.classList.remove('show');
    if (els.result) els.result.textContent = '';
  }

  // 對外
  window.Scanner = { init, open, hide };
})();