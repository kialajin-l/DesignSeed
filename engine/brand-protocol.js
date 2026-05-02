/**
 * DesignSeed — 品牌资产协议
 * Logo / 产品图 / UI 截图的采集和使用流程
 * 
 * v0.3 新增：参考 Huashu Design §1.a 的品牌资产协议
 * 核心原则：涉及具体品牌时，必须走品牌资产协议，不要用 CSS 剪影代替真实产品图
 */

/**
 * 品牌资产协议 — 5 步硬流程
 * 
 * 1. 识别品牌 → 确认是否涉及具体品牌
 * 2. 采集资产 → Logo（必需）+ 产品图（实体产品必需）+ UI 截图（数字产品必需）
 * 3. 验证资产 → 确认图片可用、尺寸合适、版权合规
 * 4. 应用资产 → 按品牌规范使用（最小尺寸、安全区域、色彩搭配）
 * 5. 标注来源 → 非官方物料标注"非官方出品"
 */

const BRAND_PROTOCOL = {
  steps: [
    { id: 1, name: '识别品牌', description: '确认是否涉及具体品牌（公司/产品/服务）' },
    { id: 2, name: '采集资产', description: 'Logo（必需）+ 产品图（实体产品必需）+ UI 截图（数字产品必需）' },
    { id: 3, name: '验证资产', description: '确认图片可用、尺寸合适、版权合规' },
    { id: 4, name: '应用资产', description: '按品牌规范使用（最小尺寸、安全区域、色彩搭配）' },
    { id: 5, name: '标注来源', description: '非官方物料标注"非官方出品"' },
  ],

  rules: {
    logo: {
      required: true,
      minSize: '24px height',
      safeZone: '0.5x logo height on all sides',
      formats: ['SVG preferred', 'PNG with transparency'],
    },
    productImage: {
      required: 'for physical products',
      style: 'real photo, not CSS silhouette',
      background: 'transparent or brand color',
    },
    uiScreenshot: {
      required: 'for digital products',
      style: 'actual UI, not mockup',
      resolution: 'at least 2x for retina',
    },
  },
};

/**
 * 检查品牌资产是否完整
 * @param {object} assets - { logo?, productImage?, uiScreenshot?, brandName }
 * @returns {object} 检查结果
 */
function validateBrandAssets(assets) {
  const issues = [];
  const warnings = [];

  if (!assets.brandName) {
    issues.push('缺少品牌名称');
  }

  if (!assets.logo) {
    issues.push('缺少 Logo（必需）');
  }

  if (assets.hasPhysicalProduct && !assets.productImage) {
    issues.push('实体产品缺少产品图');
  }

  if (assets.hasDigitalProduct && !assets.uiScreenshot) {
    warnings.push('数字产品建议提供 UI 截图');
  }

  return {
    valid: issues.length === 0,
    issues,
    warnings,
    score: Math.max(0, 100 - issues.length * 25 - warnings.length * 10),
  };
}

/**
 * 生成品牌展示区（带 Logo + 产品图 + 标注）
 * @param {object} brand - { name, logo, productImage?, uiScreenshot?, color?, isOfficial? }
 * @param {object} style
 */
function brandShowcase(brand, style = {}) {
  const c = style.colors || {};
  const t = style.typography || {};
  const fontFamily = t.fontFamily || '-apple-system, BlinkMacSystemFont, sans-serif';

  const logoHtml = brand.logo
    ? `<img src="${brand.logo}" alt="${brand.name} Logo" style="height:48px;object-fit:contain;" />`
    : `<div style="height:48px;display:flex;align-items:center;font-size:24px;font-weight:700;color:${brand.color || c.primary || '#000'};font-family:${fontFamily};">${brand.name}</div>`;

  const productHtml = brand.productImage
    ? `<img src="${brand.productImage}" alt="${brand.name} Product" style="max-width:100%;max-height:300px;object-fit:contain;border-radius:12px;" />`
    : '';

  const screenshotHtml = brand.uiScreenshot
    ? `<img src="${brand.uiScreenshot}" alt="${brand.name} UI" style="width:100%;border-radius:12px;border:1px solid ${c.border || '#e8e8e8'};" />`
    : '';

  const officialBadge = brand.isOfficial === false
    ? `<div style="font-size:11px;color:${c.textSecondary || '#888'};font-family:${fontFamily};margin-top:8px;">非官方出品 · 仅供参考</div>`
    : '';

  return `
<div style="background:${c.surface || '#fff'};border-radius:16px;padding:32px;border:1px solid ${c.border || '#e8e8e8'};">
  <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;">
    ${logoHtml}
    <div>
      <div style="font-size:20px;font-weight:600;color:${c.text || '#1a1a1a'};font-family:${fontFamily};">${brand.name}</div>
      ${brand.tagline ? `<div style="font-size:14px;color:${c.textSecondary || '#888'};font-family:${fontFamily};">${brand.tagline}</div>` : ''}
    </div>
  </div>
  ${productHtml ? `<div style="margin-bottom:24px;">${productHtml}</div>` : ''}
  ${screenshotHtml ? `<div style="margin-bottom:16px;">${screenshotHtml}</div>` : ''}
  ${officialBadge}
</div>`;
}

/**
 * 生成品牌色板
 * @param {object} brandColors - { primary, secondary, accent, background, text }
 * @param {object} style
 */
function brandColorPalette(brandColors, style = {}) {
  const t = style.typography || {};
  const fontFamily = t.fontFamily || '-apple-system, BlinkMacSystemFont, sans-serif';

  const swatches = Object.entries(brandColors).map(([name, color]) => `
<div style="text-align:center;">
  <div style="width:80px;height:80px;border-radius:12px;background:${color};border:1px solid rgba(0,0,0,0.08);margin:0 auto 8px;"></div>
  <div style="font-size:12px;font-weight:500;color:#333;font-family:${fontFamily};">${name}</div>
  <div style="font-size:11px;color:#888;font-family:monospace;">${color}</div>
</div>`).join('');

  return `
<div style="display:flex;gap:20px;justify-content:center;padding:20px;">
  ${swatches}
</div>`;
}

module.exports = { BRAND_PROTOCOL, validateBrandAssets, brandShowcase, brandColorPalette };
