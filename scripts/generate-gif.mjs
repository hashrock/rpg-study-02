#!/usr/bin/env node

import puppeteer from 'puppeteer';
import GIFEncoder from 'gifencoder';
import { createCanvas, Image } from 'canvas';
import { createWriteStream } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const WIDTH = 1200;
const HEIGHT = 800;
const FPS = 2; // 2フレーム/秒
const DELAY = 1000 / FPS;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureGameplay() {
  console.log('🚀 ブラウザを起動中...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: {
      width: WIDTH,
      height: HEIGHT,
    },
  });

  const page = await browser.newPage();

  console.log('📱 アプリにアクセス中...');
  // ビルドしたアプリにアクセス（プレビューサーバーが起動している前提）
  await page.goto('http://localhost:4173', {
    waitUntil: 'networkidle2',
  });

  const screenshots = [];

  console.log('📸 スクリーンショット撮影開始...\n');

  // 1. 初期画面
  console.log('  1/10: 初期画面');
  screenshots.push(await page.screenshot());
  await sleep(1000);

  // 2. 仲間を雇う（戦士）
  console.log('  2/10: 戦士を雇用');
  await page.click('button:has-text("雇う")');
  await sleep(500);
  screenshots.push(await page.screenshot());
  await sleep(1000);

  // 3. 仲間を雇う（魔法使い）
  console.log('  3/10: 魔法使いを雇用');
  const hireButtons = await page.$$('button:has-text("雇う")');
  if (hireButtons.length > 1) {
    await hireButtons[1].click();
    await sleep(500);
    screenshots.push(await page.screenshot());
    await sleep(1000);
  }

  // 4. ダンジョンに入る
  console.log('  4/10: ダンジョンに入る');
  const dungeonButton = await page.$('button:has-text("ダンジョンに入る")');
  if (dungeonButton) {
    await dungeonButton.click();
    await sleep(1000);
    screenshots.push(await page.screenshot());
    await sleep(1000);
  }

  // 5. 前進
  console.log('  5/10: 前進');
  const forwardButton = await page.$('button:has-text("前に進む")');
  if (forwardButton) {
    await forwardButton.click();
    await sleep(1000);
    screenshots.push(await page.screenshot());
    await sleep(1000);
  }

  // 6. もう一度前進（イベント発生の可能性）
  console.log('  6/10: さらに前進');
  const forwardButton2 = await page.$('button:has-text("前に進む")');
  if (forwardButton2) {
    await forwardButton2.click();
    await sleep(1000);
    screenshots.push(await page.screenshot());
    await sleep(1500);
  }

  // 7. イベント処理（戦闘開始など）
  console.log('  7/10: イベント処理');
  const battleButton = await page.$('button:has-text("たたかう")');
  const continueButton = await page.$('button:has-text("進む")');
  if (battleButton) {
    await battleButton.click();
    await sleep(1000);
    screenshots.push(await page.screenshot());
  } else if (continueButton) {
    await continueButton.click();
    await sleep(1000);
    screenshots.push(await page.screenshot());
  } else {
    screenshots.push(await page.screenshot());
  }
  await sleep(1000);

  // 8. 戦闘アクション
  console.log('  8/10: 戦闘アクション');
  const attackButtons = await page.$$('button:has-text("こうげき")');
  if (attackButtons.length > 0) {
    // 最初の敵を選択
    await attackButtons[0].click();
    await sleep(500);
    const enemyButtons = await page.$$('button:has-text("敵")');
    if (enemyButtons.length > 0) {
      await enemyButtons[0].click();
      await sleep(1000);
      screenshots.push(await page.screenshot());
    }
  } else {
    screenshots.push(await page.screenshot());
  }
  await sleep(1000);

  // 9. 戦闘継続
  console.log('  9/10: 戦闘継続');
  screenshots.push(await page.screenshot());
  await sleep(1000);

  // 10. 最終画面
  console.log('  10/10: 最終画面');
  screenshots.push(await page.screenshot());

  await browser.close();
  console.log('\n✅ スクリーンショット撮影完了！');

  return screenshots;
}

async function createGif(screenshots) {
  console.log('\n🎨 GIFを作成中...');

  const outputPath = join(__dirname, '../assets/demo.gif');
  const encoder = new GIFEncoder(WIDTH, HEIGHT);

  const stream = createWriteStream(outputPath);
  encoder.createReadStream().pipe(stream);

  encoder.start();
  encoder.setRepeat(0); // 0 = ループ
  encoder.setDelay(DELAY);
  encoder.setQuality(10); // 品質（1-20、低い方が高品質）

  const canvas = createCanvas(WIDTH, HEIGHT);
  const ctx = canvas.getContext('2d');

  for (let i = 0; i < screenshots.length; i++) {
    const img = new Image();
    img.src = screenshots[i];

    ctx.drawImage(img, 0, 0, WIDTH, HEIGHT);
    encoder.addFrame(ctx);

    process.stdout.write(`\r  進捗: ${i + 1}/${screenshots.length} フレーム`);
  }

  encoder.finish();

  return new Promise((resolve) => {
    stream.on('finish', () => {
      console.log(`\n\n✨ GIFを作成しました: ${outputPath}`);
      resolve();
    });
  });
}

async function main() {
  try {
    console.log('='.repeat(60));
    console.log('📹 RPGデモGIF作成ツール');
    console.log('='.repeat(60));
    console.log('\n⚠️  注意: このスクリプトを実行する前に以下を確認してください:');
    console.log('  1. アプリをビルド: pnpm build');
    console.log('  2. プレビューサーバーを起動: pnpm preview');
    console.log('  3. 別のターミナルでこのスクリプトを実行\n');

    const screenshots = await captureGameplay();
    await createGif(screenshots);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 完了！ assets/demo.gif を確認してください。');
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

main();
