/**
 * DesignSeed Screenshot Module
 */

const { chromium } = require('playwright-core');
const path = require('path');
const fs2 = require('fs');

class Screenshotter {
  constructor(options = {}) {
    this.viewport = options.viewport || { width: 1440, height: 900 };
    this.deviceScaleFactor = options.deviceScaleFactor || 2;
    this.format = options.format || 'png';
    this.quality = options.quality || 90;
    this.fullPage = options.fullPage !== false;
    this.timeout = options.timeout || 30000;
    this._browser = null;
  }

  async _ensureBrowser() {
    if (this._browser) return this._browser;
    const execPath = this._findChromium();
    this._browser = await chromium.launch({
      executablePath: execPath,
      headless: true,
      args: ['--no-sandbox', '--disable-gpu'],
    });
    return this._browser;
  }

  _findChromium() {
    const localAppData = process.env.LOCALAPPDATA || '';
    const home = process.env.HOME || process.env.USERPROFILE || '';
    const candidates = [
      path.join(localAppData, 'ms-playwright', 'chromium-1217', 'chrome-win', 'chrome.exe'),
      path.join(localAppData, 'ms-playwright', 'chromium-1208', 'chrome-win', 'chrome.exe'),
    ];
    for (const p of candidates) {
      if (fs2.existsSync(p)) return p;
    }
    return undefined;
  }

  _toFileUrl(absPath) {
    return 'file:///' + absPath.split(path.sep).join('/');
  }

  async screenshotFile(htmlPath, outputPath) {
    const absHtml = path.resolve(htmlPath);
    const absOutput = path.resolve(outputPath);
    const outDir = path.dirname(absOutput);
    if (!fs2.existsSync(outDir)) fs2.mkdirSync(outDir, { recursive: true });

    const browser = await this._ensureBrowser();
    const page = await browser.newPage({
      viewport: this.viewport,
      deviceScaleFactor: this.deviceScaleFactor,
    });

    try {
      await page.goto(this._toFileUrl(absHtml), {
        waitUntil: 'networkidle',
        timeout: this.timeout,
      });
      await page.waitForTimeout(500);

      await page.screenshot({
        path: absOutput,
        fullPage: this.fullPage,
        type: this.format,
        quality: this.format === 'jpeg' ? this.quality : undefined,
      });

      const stat = fs2.statSync(absOutput);
      return {
        width: this.viewport.width,
        height: this.fullPage ? await page.evaluate(() => document.body.scrollHeight) : this.viewport.height,
        size: stat.size,
        path: absOutput,
      };
    } finally {
      await page.close();
    }
  }

  async screenshotHTML(htmlContent, outputPath) {
    const absOutput = path.resolve(outputPath);
    const outDir = path.dirname(absOutput);
    if (!fs2.existsSync(outDir)) fs2.mkdirSync(outDir, { recursive: true });

    const browser = await this._ensureBrowser();
    const page = await browser.newPage({
      viewport: this.viewport,
      deviceScaleFactor: this.deviceScaleFactor,
    });

    try {
      await page.setContent(htmlContent, { waitUntil: 'networkidle', timeout: this.timeout });
      await page.waitForTimeout(500);

      await page.screenshot({
        path: absOutput,
        fullPage: this.fullPage,
        type: this.format,
        quality: this.format === 'jpeg' ? this.quality : undefined,
      });

      const stat = fs2.statSync(absOutput);
      return {
        width: this.viewport.width,
        height: this.fullPage ? await page.evaluate(() => document.body.scrollHeight) : this.viewport.height,
        size: stat.size,
        path: absOutput,
      };
    } finally {
      await page.close();
    }
  }

  async screenshotBatch(tasks) {
    const results = [];
    const browser = await this._ensureBrowser();
    for (const task of tasks) {
      const page = await browser.newPage({
        viewport: this.viewport,
        deviceScaleFactor: this.deviceScaleFactor,
      });
      try {
        const absHtml = path.resolve(task.html);
        await page.goto(this._toFileUrl(absHtml), {
          waitUntil: 'networkidle',
          timeout: this.timeout,
        });
        await page.waitForTimeout(500);
        const absOutput = path.resolve(task.output);
        const outDir = path.dirname(absOutput);
        if (!fs2.existsSync(outDir)) fs2.mkdirSync(outDir, { recursive: true });
        await page.screenshot({ path: absOutput, fullPage: this.fullPage, type: this.format });
        const stat = fs2.statSync(absOutput);
        results.push({ ...task, size: stat.size, success: true });
      } catch (err) {
        results.push({ ...task, error: err.message, success: false });
      } finally {
        await page.close();
      }
    }
    return results;
  }

  async close() {
    if (this._browser) {
      await this._browser.close();
      this._browser = null;
    }
  }
}

module.exports = { Screenshotter };