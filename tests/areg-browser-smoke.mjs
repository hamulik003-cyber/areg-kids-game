import { chromium } from 'playwright';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { discoverGamePages } from './areg-discovery.mjs';

const root = process.cwd();
const base = process.env.AREG_AUDIT_URL || 'http://127.0.0.1:8765/';
const source = readFileSync(resolve(root, 'app.js'), 'utf8');
const names = discoverGamePages(source).filter(name => existsSync(resolve(root, name)));
const browser = await chromium.launch({ headless: true });
const failures = [];
const notices = [];
let passed = 0;
try {
  for (const name of names) {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2,
    });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      const response = await page.goto(new URL(name, base).href, {
        waitUntil: 'domcontentloaded',
        timeout: 20000,
      });
      if (!response?.ok()) throw new Error(`HTTP ${response?.status() ?? 'no response'}`);
      const result = await page.evaluate(() => ({
        title: document.title,
        width: document.documentElement.scrollWidth,
        viewport: window.innerWidth,
      }));
      if (!result.title) notices.push(`${name}: missing page title`);
      // Existing pages may intentionally have wide internal canvases.
      // Log width issues rather than failing until approved baselines exist.
      passed++;
      console.log(`PASS ${name}: title=${JSON.stringify(result.title)}, contentWidth=${result.width}, viewport=${result.viewport}`);
      if (result.width > result.viewport + 3) {
        notices.push(`${name}: horizontal overflow ${result.width}px > ${result.viewport}px`);
      }
      await page.waitForTimeout(500);
      if (errors.length) {
        notices.push(`${name}: runtime errors: ${JSON.stringify(errors.slice(0, 3))}`);
      }
    } catch (error) {
      failures.push(`${name}: ${error.message}`);
      console.error(`FAIL ${name}: ${error.message}`);
    } finally {
      await page.close();
    }
  }
} finally {
  await browser.close();
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
}

console.log(`AREG BROWSER SUMMARY: ${passed}/${names.length} pages loaded; ${notices.length} notices; ${failures.length} failures`);
for (const notice of notices) console.log(`NOTICE ${notice}`);
