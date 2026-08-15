// Headless Playwright デモ: GIGAZINEの最新記事を自動取得
//
// 事前準備:
//   npm install playwright
//
// 実行:
//   node demo-playwright.js

const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('ブラウザを起動しています...\n');

  const launchOptions = { headless: true };
  if (process.env.PLAYWRIGHT_CHROMIUM_PATH) {
    launchOptions.executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH;
  }
  if (process.env.HTTPS_PROXY) {
    launchOptions.proxy = { server: process.env.HTTPS_PROXY };
  }

  const browser = await chromium.launch(launchOptions);
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });

  console.log('GIGAZINEにアクセスしています...\n');
  await page.goto('https://gigazine.net/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'gigazine-screenshot.png', fullPage: false });
  console.log('スクリーンショットを保存しました → gigazine-screenshot.png\n');

  const articles = await page.evaluate(() => {
    const items = [];
    document.querySelectorAll('h2 a').forEach(a => {
      const title = a.textContent.trim();
      const href = a.href;
      if (title && !items.find(x => x.title === title) && items.length < 20) {
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

  fs.writeFileSync('gigazine-news.json', JSON.stringify(articles, null, 2), 'utf-8');
  console.log('結果をgigazine-news.jsonに保存しました');

  await browser.close();
})();
