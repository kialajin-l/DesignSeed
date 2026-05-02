/**
 * DesignSeed — 真实图片 Sourcing
 * 从 Wikimedia Commons 和 Unsplash 获取真实图片，告别 placeholder
 * 
 * v0.3 新增：追平 Huashu Design 的真实图片能力
 */

const https = require('https');
const http = require('http');

/**
 * 从 Unsplash 获取图片
 * @param {string} query - 搜索关键词
 * @param {object} options
 * @param {number} options.width - 目标宽度
 * @param {number} options.height - 目标高度
 * @param {string} options.orientation - 'landscape' | 'portrait' | 'square'
 * @returns {string} 图片 URL
 */
function unsplashUrl(query, options = {}) {
  const { width = 800, height = 600, orientation = 'landscape' } = options;
  // Unsplash Source API（无需 API Key 的免费模式）
  const params = new URLSearchParams({
    w: width,
    h: height,
    fit: 'crop',
    orientation,
  });
  return `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(query)}&${params}`;
}

/**
 * 从 Wikimedia Commons 获取图片
 * @param {string} query - 搜索关键词
 * @param {object} options
 * @param {number} options.width - 目标宽度
 * @returns {Promise<string>} 图片 URL
 */
async function wikimediaSearch(query, options = {}) {
  const { width = 800 } = options;
  const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&srlimit=5&format=json&origin=*`;

  return new Promise((resolve, reject) => {
    https.get(searchUrl, { headers: { 'User-Agent': 'DesignSeed/0.3' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const results = json.query?.search || [];
          if (results.length > 0) {
            // 取第一个结果，构造缩略图 URL
            const title = results[0].title.replace(/ /g, '_');
            const thumbUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${title}?width=${width}`;
            resolve(thumbUrl);
          } else {
            resolve(unsplashUrl(query, options));
          }
        } catch (e) {
          resolve(unsplashUrl(query, options));
        }
      });
    }).on('error', () => {
      resolve(unsplashUrl(query, options));
    });
  });
}

/**
 * 根据语义自动获取图片
 * 根据内容描述智能选择最合适的图片来源
 * @param {string} description - 内容描述（如 "team meeting in office"）
 * @param {string} context - 图片用途（如 'hero' | 'avatar' | 'product' | 'background'）
 * @param {object} style - 风格配置
 * @returns {string} HTML img 标签
 */
function autoImage(description, context = 'content', style = {}) {
  const c = style.colors || {};
  const contexts = {
    hero: { width: 1200, height: 600, orientation: 'landscape' },
    content: { width: 800, height: 500, orientation: 'landscape' },
    avatar: { width: 200, height: 200, orientation: 'square' },
    product: { width: 600, height: 600, orientation: 'square' },
    background: { width: 1600, height: 900, orientation: 'landscape' },
    thumbnail: { width: 400, height: 300, orientation: 'landscape' },
    banner: { width: 1200, height: 300, orientation: 'landscape' },
  };
  const cfg = contexts[context] || contexts.content;
  const url = unsplashUrl(description, cfg);

  const borderRadius = style.layout?.borderRadius || '8px';

  return `<img src="${url}" alt="${description}" style="width:100%;height:auto;object-fit:cover;border-radius:${borderRadius};display:block;" loading="lazy" />`;
}

/**
 * 生成带真实图片的图片网格
 * @param {Array} items - [{ query, caption?, link? }]
 * @param {object} options
 * @param {number} options.columns - 列数
 * @param {string} options.context - 图片用途
 * @param {object} style - 风格配置
 */
function imageGrid(items, options = {}, style = {}) {
  const { columns = 3, context = 'thumbnail' } = options;
  const c = style.colors || {};
  const t = style.typography || {};
  const fontFamily = t.fontFamily || '-apple-system, BlinkMacSystemFont, sans-serif';
  const gap = style.layout?.spacing || '16px';

  const cells = items.map(item => {
    const img = autoImage(item.query, context, style);
    const caption = item.caption
      ? `<div style="padding:12px 0 0;font-size:13px;color:${c.textSecondary || '#888'};font-family:${fontFamily};">${item.caption}</div>`
      : '';
    const wrapper = item.link
      ? `<a href="${item.link}" style="text-decoration:none;color:inherit;">${img}${caption}</a>`
      : `${img}${caption}`;
    return `<div>${wrapper}</div>`;
  }).join('\n');

  return `
<div style="display:grid;grid-template-columns:repeat(${columns}, 1fr);gap:${gap};">
  ${cells}
</div>`;
}

/**
 * 品牌产品图展示（带背景和阴影）
 * @param {string} query - 产品描述
 * @param {object} style
 */
function productShowcase(query, style = {}) {
  const c = style.colors || {};
  const url = unsplashUrl(query, { width: 600, height: 400, orientation: 'landscape' });

  return `
<div style="background:linear-gradient(135deg, ${c.primary || '#6c63ff'}15, ${c.accent || '#06b6d4'}10);border-radius:16px;padding:40px;text-align:center;">
  <img src="${url}" alt="${query}" style="max-width:100%;max-height:400px;object-fit:contain;border-radius:12px;box-shadow:0 20px 40px rgba(0,0,0,0.15);" loading="lazy" />
</div>`;
}

module.exports = { unsplashUrl, wikimediaSearch, autoImage, imageGrid, productShowcase };
