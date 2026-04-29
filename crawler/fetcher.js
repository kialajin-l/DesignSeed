'use strict';

const fs = require('fs');
const path = require('path');

/**
 * DesignFetcher — 从各种数据源采集设计系统文档
 *
 * 支持的数据源类型：
 *   - URL（直接 HTTP 获取）
 *   - GitHub 仓库（通过 GitHub API 获取文件内容）
 *   - 本地文件
 *
 * 不依赖 node-fetch，使用 Node.js >= 18 内置 fetch。
 */
class DesignFetcher {
  /**
   * @param {Object} options
   * @param {Array}  options.sources  - 数据源列表（可选，也可在 fetchAll 时传入）
   * @param {number} options.cacheTtl - 缓存有效期 ms（默认 10 分钟）
   */
  constructor(options = {}) {
    this.sources = options.sources || [];
    this.cacheTtl = options.cacheTtl || 10 * 60 * 1000;
    /** @type {Map<string, {data: any, ts: number}>} */
    this.cache = new Map();
  }

  // ─── 内部工具 ──────────────────────────────────────────────

  /**
   * 带缓存的 fetch 封装
   * @param {string} url
   * @param {Object} [init] - fetch options
   * @returns {Promise<Response>}
   */
  async _cachedFetch(url, init) {
    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.ts < this.cacheTtl) {
      return cached.data;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    try {
      const res = await fetch(url, {
        ...init,
        signal: controller.signal,
        headers: {
          'User-Agent': 'DesignSeed-Crawler/1.0',
          ...(url.includes('github.com') ? { Accept: 'application/vnd.github.v3+json' } : {}),
          ...(init && init.headers ? init.headers : {}),
        },
      });
      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText} — ${url}`);
      }

      this.cache.set(url, { data: res.clone(), ts: Date.now() });
      return res;
    } catch (err) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        throw new Error(`Request timed out (30s) — ${url}`);
      }
      throw err;
    }
  }

  /**
   * 将采集结果标准化为统一格式
   * @param {Object} params
   * @param {string} params.url      - 来源 URL
   * @param {string} params.content  - 文本内容
   * @param {Object} params.metadata - 元数据
   * @returns {{ url: string, content: string, metadata: Object, fetchedAt: string }}
   */
  _normalize({ url, content, metadata = {} }) {
    return {
      url,
      content,
      metadata,
      fetchedAt: new Date().toISOString(),
    };
  }

  // ─── 公开方法 ──────────────────────────────────────────────

  /**
   * 从 URL 获取内容
   * @param {string} url
   * @returns {Promise<{url: string, content: string, metadata: Object, fetchedAt: string}>}
   */
  async fetchUrl(url) {
    console.log(`[fetcher] Fetching URL: ${url}`);

    const res = await this._cachedFetch(url);
    const contentType = res.headers.get('content-type') || '';
    let content;

    if (contentType.includes('application/json')) {
      const json = await res.json();
      content = typeof json === 'string' ? json : JSON.stringify(json, null, 2);
    } else {
      content = await res.text();
    }

    return this._normalize({
      url,
      content,
      metadata: {
        contentType,
        status: res.status,
        sourceType: 'url',
      },
    });
  }

  /**
   * 从 GitHub 仓库批量采集文件
   *
   * 使用 GitHub API 的 tree 接口遍历仓库文件树，
   * 筛选匹配 pattern 的文件，再逐个获取内容。
   *
   * @param {string} repoUrl  - 仓库地址，如 https://github.com/user/repo
   * @param {string} pattern  - glob 模式，如双星号/DESIGN.md
   * @returns {Promise<Array<{url: string, content: string, metadata: Object, fetchedAt: string}>>}
   */
  async fetchGitHubRepo(repoUrl, pattern = '**/DESIGN.md') {
    console.log(`[fetcher] Fetching GitHub repo: ${repoUrl} (pattern: ${pattern})`);

    // 解析 owner/repo
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      throw new Error(`Invalid GitHub URL: ${repoUrl}`);
    }
    const [, owner, repo] = match;
    const repoFullName = `${owner}/${repo}`;

    // 获取默认分支的 tree（递归）
    const treeUrl = `https://api.github.com/repos/${repoFullName}/git/trees/HEAD?recursive=1`;
    const treeRes = await this._cachedFetch(treeUrl);
    const treeJson = await treeRes.json();

    if (!treeJson.tree || !Array.isArray(treeJson.tree)) {
      throw new Error(
        `Failed to fetch tree for ${repoFullName}: ${JSON.stringify(treeJson).slice(0, 200)}`
      );
    }

    // 简易 glob 匹配：将 ** 转为正则
    const regexStr = pattern
      .replace(/\*\*/g, '{{GLOBSTAR}}')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '[^/]')
      .replace(/\./g, '\\.')
      .replace(/\{\{GLOBSTAR\}\}/g, '.*');
    const regex = new RegExp(`^${regexStr}$`, 'i');

    const matchedFiles = treeJson.tree.filter(
      (item) => item.type === 'blob' && regex.test(item.path)
    );

    console.log(`[fetcher] Found ${matchedFiles.length} matching files in ${repoFullName}`);

    // 逐个获取文件内容
    const results = [];
    for (const file of matchedFiles) {
      try {
        const rawUrl = `https://raw.githubusercontent.com/${repoFullName}/HEAD/${file.path}`;
        const rawRes = await this._cachedFetch(rawUrl);
        const content = await rawRes.text();

        results.push(
          this._normalize({
            url: `${repoUrl}/blob/HEAD/${file.path}`,
            content,
            metadata: {
              repo: repoFullName,
              filePath: file.path,
              sha: file.sha,
              size: file.size,
              sourceType: 'github',
            },
          })
        );
      } catch (err) {
        console.error(`[fetcher] Failed to fetch ${file.path}: ${err.message}`);
        // 单个文件失败不影响其他文件
      }
    }

    return results;
  }

  /**
   * 从本地文件采集
   * @param {string} filePath - 绝对或相对路径
   * @returns {Promise<{url: string, content: string, metadata: Object, fetchedAt: string}>}
   */
  async fetchLocalFile(filePath) {
    console.log(`[fetcher] Reading local file: ${filePath}`);

    const resolved = path.resolve(filePath);

    if (!fs.existsSync(resolved)) {
      throw new Error(`File not found: ${resolved}`);
    }

    const stat = fs.statSync(resolved);
    if (!stat.isFile()) {
      throw new Error(`Not a file: ${resolved}`);
    }

    const content = fs.readFileSync(resolved, 'utf-8');

    return this._normalize({
      url: `file://${resolved}`,
      content,
      metadata: {
        filePath: resolved,
        size: stat.size,
        modified: stat.mtime.toISOString(),
        sourceType: 'local',
      },
    });
  }

  /**
   * 批量采集多个数据源
   *
   * 每个 source 对象需包含 type 字段：
   *   - "url"     → fetchUrl(source.url)
   *   - "github"  → fetchGitHubRepo(source.repo, source.pattern)
   *   - "local"   → fetchLocalFile(source.path)
   *
   * 单个源失败不会影响其他源。
   *
   * @param {Array<Object>} sources
   * @returns {Promise<Array<{url: string, content: string, metadata: Object, fetchedAt: string}>>}
   */
  async fetchAll(sources) {
    const allSources = sources || this.sources;
    console.log(`[fetcher] Batch fetching ${allSources.length} sources...`);

    const results = [];
    const errors = [];

    // 使用 Promise.allSettled 实现并行采集，互不干扰
    const tasks = allSources.map(async (source, index) => {
      try {
        let items;

        switch (source.type) {
          case 'github':
            items = await this.fetchGitHubRepo(source.repo, source.pattern);
            break;

          case 'local':
            items = [await this.fetchLocalFile(source.path)];
            break;

          case 'url':
          default:
            items = [await this.fetchUrl(source.url)];
            break;
        }

        return { index, items, error: null };
      } catch (err) {
        return { index, items: [], error: { source, message: err.message } };
      }
    });

    const settled = await Promise.allSettled(tasks);

    for (const result of settled) {
      if (result.status === 'fulfilled') {
        const { items, error } = result.value;
        results.push(...items);
        if (error) {
          errors.push(error);
        }
      } else {
        errors.push({
          source: 'unknown',
          message: result.reason?.message || String(result.reason),
        });
      }
    }

    if (errors.length > 0) {
      console.warn(`[fetcher] ${errors.length} source(s) failed:`);
      for (const e of errors) {
        console.warn(`  - ${e.source?.name || e.source?.url || 'unknown'}: ${e.message}`);
      }
    }

    console.log(
      `[fetcher] Batch complete: ${results.length} items collected, ${errors.length} errors`
    );
    return results;
  }
}

module.exports = DesignFetcher;
