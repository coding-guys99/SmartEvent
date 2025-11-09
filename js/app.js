
(async function () {
  // 讀資料
  let HOME = {};
  try {
    HOME = await fetch('data/home.json').then(r => r.json());
  } catch(e) { console.warn('home.json 載入失敗', e); }

  // 初始化需要資料的模組
  if (window.Home)      Home.init(HOME);
  if (window.Ecard)     Ecard.init(HOME);
  if (window.Brands)    Brands.init(HOME);
  if (window.Contact)   Contact.init(HOME);
  if (window.Transport) Transport.init(HOME);
  if (window.AccountUI) AccountUI.init?.();

  // 先讓 Role 做首度守門（可能導到 #role）
  if (window.Role) Role.init();

  // 綁定 Drawer/Scanner（可選，router 也會防呆）
  if (window.Scanner?.init) Scanner.init();

  // 啟動路由
  if (window.PageRouter) {
    PageRouter.bindUI();
    PageRouter.route();
  }
})();