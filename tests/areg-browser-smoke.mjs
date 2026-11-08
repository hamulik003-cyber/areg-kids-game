import { chromium, webkit } from 'playwright';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { discoverGamePages } from './areg-discovery.mjs';

const root = process.cwd();
const base = process.env.AREG_AUDIT_URL || 'http://127.0.0.1:8765/';
const source = readFileSync(resolve(root, 'app.js'), 'utf8');
const names = discoverGamePages(source).filter(name => existsSync(resolve(root, name)));
const engineName = process.env.AREG_BROWSER_ENGINE || 'chromium';
if (!['chromium', 'webkit'].includes(engineName)) throw new Error(`Unsupported browser engine: ${engineName}`);
const browser = await ({ chromium, webkit })[engineName].launch({ headless: true });
const failures = [];
const notices = [];
const results = [];
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
    const missingResources = [];
    page.on('response', response => {
      if (response.status() >= 400 && new URL(response.url()).origin === new URL(base).origin) {
        missingResources.push(`${response.status()} ${new URL(response.url()).pathname}`);
      }
    });
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
      // Read-only interaction probes: synthetic touch and orientation changes.
      // Do not activate game controls or mutate persisted state.
      await page.evaluate(() => {
        document.documentElement.dispatchEvent(new Event('touchstart', { bubbles: false }));
        window.dispatchEvent(new Event('resize'));
      });
      const rotated = await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        viewport: window.innerWidth,
      }));
      if (rotated.width > rotated.viewport + 3) {
        notices.push(`${name}: width overflow after resize event ${rotated.width}px > ${rotated.viewport}px`);
      }
      await page.waitForTimeout(500);
      if (missingResources.length) {
        notices.push(`${name}: failed local requests: ${JSON.stringify([...new Set(missingResources)].slice(0, 10))}`);
      }
      results.push({ game: name, status: 'loaded', ...result, runtimeErrors: errors.slice(0, 10), failedLocalRequests: [...new Set(missingResources)].slice(0, 20) });
      if (errors.length) {
        notices.push(`${name}: runtime errors: ${JSON.stringify(errors.slice(0, 3))}`);
      }
    } catch (error) {
      failures.push(`${name}: ${error.message}`);
      results.push({ game: name, status: 'failed', error: error.message });
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

console.log(`AREG BROWSER SUMMARY [${engineName}]: ${passed}/${names.length} pages loaded; ${notices.length} notices; ${failures.length} failures`);
for (const notice of notices) console.log(`NOTICE ${notice}`);

const reportDir = resolve(root, 'audit-reports');
mkdirSync(reportDir, { recursive: true });
writeFileSync(resolve(reportDir, `browser-${engineName}.json`), JSON.stringify({
  engine: engineName, pages: names.length, passed, notices, failures, results,
}, null, 2) + '\n');
