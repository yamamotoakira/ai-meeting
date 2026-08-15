// Headless Playwright デモ: GIGAZINEの最新記事を自動取得
// 講義デモ用スクリプト
//
// 事前準備:
//   npm install playwright
//   npx playwright install chromium
//
// 実行:
//   node demo-playwright.js

const { chromium } = require('playwright');

(async () => {
  console.log('ブラウザを起動しています...\n');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });

  console.log('GIGAZINEにアクセスしています...\n');
  await page.goto('https://gigazine.net/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // スクリーンショットを保存
  await page.screenshot({ path: 'gigazine-screenshot.png', fullPage: false });
  console.log('スクリーンショットを保存しました → gigazine-screenshot.png\n');

  // 記事の見出しを取得
  const articles = await page.evaluate(() => {
    const items = [];
    document.querySelectorAll('h2 a').forEach(a => {
      const title = a.textContent.trim();
      const href = a.href;
      if (title && !items.find(x => x.title === title) && items.length < 10) {
        items.push({ title, href });
      }
    });
    return items;
  });

  console.log('========================================');
  console.log(' GIGAZINEの最新記事（自動取得）');
  console.log('========================================\n');

  articles.forEach((article, i) => {
    console.log(`${i + 1}. ${article.title}`);
    console.log(`   ${article.href}\n`);
  });

  console.log(`取得件数: ${articles.length}件`);
  console.log('\n※ これはAIがブラウザを自動操作して取得した結果です');

  await browser.close();
})();
