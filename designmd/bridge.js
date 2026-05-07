'use strict';

/**
 * DesignSeed — design.md ↔ renderer 桥接器
 * 
 * 将 design.md 导入的结构化数据转成 renderer 能用的 style 格式
 * 也可以从种子数据直接生成 renderer 兼容的 style 对象
 */

const { DesignMdImporter } = require('./importer');
const { DesignMdGenerator } = require('./generator');
const { DesignMdValidator } = require('./validator');

/**
 * 从 design.md 内容创建 renderer 兼容的 style 对象
 * @param {string} designMdContent - design.md 文件内容
 * @returns {object} renderer 兼容的 style 对象
 */
function styleFromDesignMd(designMdContent) {
  const imported = DesignMdImporter.import(designMdContent);
  return styleFromImported(imported);
}

/**
 * 从导入的结构化数据创建 renderer 兼容的 style 对象
 * @param {object} imported - DesignMdImporter.import() 的返回值
 * @returns {object} renderer 兼容的 style 对象
 */
function styleFromImported(imported) {
  const colors = imported.colors || {};
  const typo = imported.typography || {};
  const spacing = imported.spacing || {};
  const tone = imported.tone || {};
  const components = imported.components || {};

  // 构建 typography scale
  const scale = [];
  if (typo.scale) {
    for (const [key, val] of Object.entries(typo.scale)) {
      scale.push(parseInt(val.size) || 16);
    }
  }
  if (scale.length === 0) {
    scale.push(12, 14, 16, 20, 24, 32);
  }

  // 构建 fontWeight
  const fontWeight = {
    normal: parseInt(typo.bodyWeight) || 400,
    medium: 500,
    bold: parseInt(typo.headingWeight) || 700,
  };

  // 构建 layout
  const layout = {
    maxWidth: '1200px',
    spacing: `${spacing['space-3'] || 16}px`,
    sectionSpacing: `${spacing['space-6'] || 48}px`,
    borderRadius: `${spacing['radius-md'] || 8}px`,
    grid: 12,
  };

  // 构建 shadows（从 spacing 推断）
  const shadows = {
    small: `0 2px 8px rgba(0, 0, 0, 0.08)`,
    medium: `0 4px 16px rgba(0, 0, 0, 0.12)`,
    large: `0 8px 32px rgba(0, 0, 0, 0.16)`,
  };

  // 构建 components
  const cardComp = components.card || {};
  const buttonComp = components.button || {};
  const navComp = components.nav || {};

  const compStyles = {
    card: {
      padding: cardComp.padding || '24px',
      border: `1px solid ${colors.border || '#E0E0E0'}`,
      borderRadius: `${spacing['radius-md'] || 8}px`,
    },
    button: {
      padding: buttonComp.padding || '12px 24px',
      borderRadius: `${spacing['radius-sm'] || 4}px`,
      fontWeight: fontWeight.bold,
    },
    hero: {
      padding: '120px 0',
      textAlign: 'center',
    },
    nav: {
      height: navComp.height || '64px',
      borderBottom: `1px solid ${colors.border || '#E0E0E0'}`,
    },
  };

  return {
    name: imported.meta?.name || 'DesignSeed',
    nameEn: imported.meta?.slug || 'designseed',
    colors: {
      primary: colors.primary || '#000000',
      secondary: colors.secondary || '#666666',
      background: colors.background || '#FFFFFF',
      surface: colors.surface || '#F5F5F5',
      accent: colors.accent || '#0066CC',
      border: colors.border || '#E0E0E0',
      text: colors.text || '#1A1A1A',
      textSecondary: colors.muted || '#888888',
    },
    typography: {
      fontFamily: typo.fontFamily || 'sans-serif',
      scale,
      lineHeight: parseFloat(typo.lineHeight) || 1.6,
      fontWeight,
      letterSpacing: '0.02em',
    },
    layout,
    shadows,
    components: compStyles,
    tone: {
      formality: tone.formality || 0.5,
      warmth: tone.warmth || 0.5,
      complexity: tone.complexity || 0.5,
      innovation: tone.innovation || 0.5,
    },
    // 保留原始 design.md 数据，供后续使用
    _designMd: imported,
  };
}

/**
 * 从种子设计系统 ID 创建 renderer 兼容的 style 对象
 * @param {string} systemId - 种子设计系统 ID
 * @returns {object} renderer 兼容的 style 对象
 */
function styleFromSeed(systemId) {
  const content = DesignMdGenerator.fromSeed(systemId);
  return styleFromDesignMd(content);
}

/**
 * 从种子设计系统创建 design.md 并验证
 * @param {string} systemId - 种子设计系统 ID
 * @returns {{ style: object, designMd: string, validation: object }}
 */
function fullPipeline(systemId) {
  const designMd = DesignMdGenerator.fromSeed(systemId);
  const validator = new DesignMdValidator();
  const validation = validator.validate(designMd);
  const style = styleFromDesignMd(designMd);

  return { style, designMd, validation };
}

module.exports = {
  styleFromDesignMd,
  styleFromImported,
  styleFromSeed,
  fullPipeline,
};
