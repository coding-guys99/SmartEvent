// 載 JSON → 初始化各模組 → 綁 UI → 路由一次
(async function () {
  try{
    const res = await fetch('data/home.json');
    window.HOME = await res.json();
  }catch(e){
    console.error('無法載入 data/home.json', e);
    window.HOME = {};
  }

  // 首頁與各模組初始化
  Home.init(HOME);
  Ecard.init(HOME);
  Brands.init(HOME);
  Contact.init(HOME);
  Transport.init(HOME);

  // ← 你是 account.js，所以要找 Account
  if (window.Account && typeof Account.init === 'function') {
    Account.init();
  }

  // Drawer / Scanner 綁定 & 首次路由
  PageRouter.bindUI();
  PageRouter.route();
})();