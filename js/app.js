// 載 JSON → 初始化各模組 → 綁 UI → 路由一次
(async function () {
  try{
    const res = await fetch('data/home.json');
    window.HOME = await res.json();
  }catch(e){
    console.error('無法載入 data/home.json', e);
    window.HOME = {};
  }

  // 首頁與各模組初始化（需要資料的傳 HOME）
  Home.init(HOME);
  Ecard.init(HOME);
  Brands.init(HOME);
  Contact.init(HOME);
  Transport.init(HOME);

  // 輕量帳戶 UI（若你用另一支 account.js，這行拿掉）
  if (window.AccountUI) AccountUI.init();

  // Drawer / Scanner 綁定 & 首次路由
  PageRouter.bindUI();
  PageRouter.route();
})();