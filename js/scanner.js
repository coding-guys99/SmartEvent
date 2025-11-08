// 掃描浮層（UI 模擬）
(function () {
  function init() {
    const fab = document.getElementById('scanFab');
    const sheet = document.getElementById('scanner');
    const close = document.getElementById('closeScanner');
    const btnStart = document.getElementById('btnStartScan');
    const btnMock = document.getElementById('btnMockHit');
    const btnTorch = document.getElementById('btnTorch');
    const result = document.getElementById('scanResult');

    const open = () => sheet?.classList.add('show');
    const hide = () => { sheet?.classList.remove('show'); if (result) result.textContent = ''; };

    fab?.addEventListener('click', open);
    close?.addEventListener('click', hide);

    btnStart?.addEventListener('click', () => {
      if (!result) return;
      result.style.color = 'var(--muted)';
      result.textContent = '正在掃描…（介面模擬，之後可接原生/Barcode）';
    });
    btnMock?.addEventListener('click', () => {
      if (!result) return;
      result.style.color = 'var(--accent)';
      result.textContent = '識別成功：TICKET-EXPO-2025-#A1';
    });

    let torch = false;
    btnTorch?.addEventListener('click', () => {
      torch = !torch;
      if (btnTorch) {
        btnTorch.style.borderColor = torch ? 'var(--primary)' : 'var(--line)';
        btnTorch.title = torch ? '關閉照明' : '開啟照明';
      }
    });
  }

  window.Scanner = { init };
})();