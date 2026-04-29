/**
 * DesignSeed — 风格模板库
 * 12 种内置风格流派，每种包含 colors、typography、layout、shadows、tone 等维度
 */

module.exports = {
  minimalism: {
    name: '极简主义', nameEn: 'Minimalism',
    colors: { primary: '#000000', secondary: '#666666', background: '#FFFFFF', surface: '#F5F5F5', accent: '#0066CC', border: '#E0E0E0', text: '#1A1A1A', textSecondary: '#888888' },
    typography: { fontFamily: '-apple-system, "Helvetica Neue", "Segoe UI", sans-serif', scale: [12, 14, 16, 20, 24, 32], lineHeight: 1.6, fontWeight: { normal: 400, medium: 500, bold: 700 }, letterSpacing: '0.02em' },
    layout: { maxWidth: '1200px', spacing: '16px', sectionSpacing: '80px', borderRadius: '0px', grid: 12 },
    shadows: { small: 'none', medium: 'none', large: 'none' },
    components: { card: { padding: '32px', border: '1px solid #E0E0E0', borderRadius: '0px' }, button: { padding: '12px 24px', borderRadius: '0px', fontWeight: 600 }, hero: { padding: '120px 0', textAlign: 'center' }, nav: { height: '64px', borderBottom: '1px solid #E0E0E0' } },
    tone: { formality: 0.7, warmth: 0.3, complexity: 0.2, innovation: 0.5 }
  },
  neumorphism: {
    name: '新拟态', nameEn: 'Neumorphism',
    colors: { primary: '#6C63FF', secondary: '#8B85E9', background: '#E8EDF2', surface: '#E8EDF2', accent: '#FF6584', border: '#D1D9E6', text: '#2D3436', textSecondary: '#636E72' },
    typography: { fontFamily: '"Inter", "Segoe UI", -apple-system, sans-serif', scale: [13, 15, 17, 21, 26, 36], lineHeight: 1.65, fontWeight: { normal: 400, medium: 500, bold: 700 }, letterSpacing: '0.01em' },
    layout: { maxWidth: '1100px', spacing: '20px', sectionSpacing: '72px', borderRadius: '20px', grid: 12 },
    shadows: { small: '6px 6px 12px #c8cdd5, -6px -6px 12px #ffffff', medium: '8px 8px 16px #c8cdd5, -8px -8px 16px #ffffff', large: '12px 12px 24px #c8cdd5, -12px -12px 24px #ffffff', inset: 'inset 4px 4px 8px #c8cdd5, inset -4px -4px 8px #ffffff' },
    components: { card: { padding: '28px', border: 'none', borderRadius: '20px' }, button: { padding: '14px 28px', borderRadius: '12px', fontWeight: 600 }, hero: { padding: '100px 0', textAlign: 'center' }, nav: { height: '68px', borderRadius: '0' } },
    tone: { formality: 0.5, warmth: 0.7, complexity: 0.5, innovation: 0.6 }
  },
  glassmorphism: {
    name: '玻璃拟态', nameEn: 'Glassmorphism',
    colors: { primary: '#7C3AED', secondary: '#A78BFA', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', surface: 'rgba(255, 255, 255, 0.15)', accent: '#F472B6', border: 'rgba(255, 255, 255, 0.3)', text: '#FFFFFF', textSecondary: 'rgba(255, 255, 255, 0.7)' },
    typography: { fontFamily: '"Poppins", "Segoe UI", -apple-system, sans-serif', scale: [13, 15, 17, 22, 28, 40], lineHeight: 1.6, fontWeight: { normal: 300, medium: 500, bold: 700 }, letterSpacing: '0.01em' },
    layout: { maxWidth: '1200px', spacing: '20px', sectionSpacing: '80px', borderRadius: '16px', grid: 12 },
    shadows: { small: '0 4px 16px rgba(0, 0, 0, 0.1)', medium: '0 8px 32px rgba(0, 0, 0, 0.15)', large: '0 16px 48px rgba(0, 0, 0, 0.2)' },
    components: { card: { padding: '28px', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '16px', backdropFilter: 'blur(12px)', background: 'rgba(255,255,255,0.15)' }, button: { padding: '14px 28px', borderRadius: '12px', fontWeight: 600 }, hero: { padding: '120px 0', textAlign: 'center' }, nav: { height: '68px', backdropFilter: 'blur(20px)', background: 'rgba(255,255,255,0.1)' } },
    tone: { formality: 0.5, warmth: 0.5, complexity: 0.5, innovation: 0.85 }
  },
  memphis: {
    name: '孟菲斯', nameEn: 'Memphis',
    colors: { primary: '#FF3366', secondary: '#FFCC00', background: '#FFFFFF', surface: '#FFF5E6', accent: '#33CCFF', border: '#222222', text: '#222222', textSecondary: '#555555' },
    typography: { fontFamily: '"Fredoka One", "Comic Sans MS", "Segoe UI", cursive, sans-serif', scale: [14, 16, 18, 24, 32, 48], lineHeight: 1.5, fontWeight: { normal: 400, medium: 600, bold: 800 }, letterSpacing: '0.03em' },
    layout: { maxWidth: '1100px', spacing: '24px', sectionSpacing: '72px', borderRadius: '24px', grid: 12 },
    shadows: { small: '4px 4px 0px #222222', medium: '6px 6px 0px #222222', large: '8px 8px 0px #222222' },
    components: { card: { padding: '28px', border: '3px solid #222222', borderRadius: '24px' }, button: { padding: '14px 28px', borderRadius: '50px', fontWeight: 700, border: '3px solid #222' }, hero: { padding: '100px 0', textAlign: 'center' }, nav: { height: '72px', borderBottom: '3px solid #222' } },
    tone: { formality: 0.2, warmth: 0.85, complexity: 0.8, innovation: 0.8 }
  },
  cyberpunk: {
    name: '赛博朋克', nameEn: 'Cyberpunk',
    colors: { primary: '#00FFFF', secondary: '#FF00FF', background: '#0A0A0F', surface: '#12121A', accent: '#FFE500', border: '#00FFFF', text: '#E0E0E0', textSecondary: '#8888AA' },
    typography: { fontFamily: '"Share Tech Mono", "Fira Code", "Courier New", monospace', scale: [12, 14, 16, 20, 26, 38], lineHeight: 1.55, fontWeight: { normal: 400, medium: 500, bold: 700 }, letterSpacing: '0.05em' },
    layout: { maxWidth: '1200px', spacing: '16px', sectionSpacing: '80px', borderRadius: '2px', grid: 12 },
    shadows: { small: '0 0 8px rgba(0, 255, 255, 0.3)', medium: '0 0 16px rgba(0, 255, 255, 0.4)', large: '0 0 32px rgba(0, 255, 255, 0.5), 0 0 64px rgba(255, 0, 255, 0.2)', glow: '0 0 20px rgba(0, 255, 255, 0.6)' },
    components: { card: { padding: '24px', border: '1px solid #00FFFF', borderRadius: '2px', background: 'rgba(0, 255, 255, 0.03)' }, button: { padding: '12px 24px', borderRadius: '2px', fontWeight: 700, border: '1px solid #00FFFF', background: 'transparent', color: '#00FFFF', textTransform: 'uppercase', letterSpacing: '0.1em' }, hero: { padding: '120px 0', textAlign: 'center' }, nav: { height: '60px', borderBottom: '1px solid #00FFFF' } },
    heroBg: '#0A0A0F',
    tone: { formality: 0.25, warmth: 0.15, complexity: 0.85, innovation: 0.95 }
  },
  ink_wash: {
    name: '水墨风', nameEn: 'Ink Wash',
    colors: { primary: '#2C2C2C', secondary: '#5C5C5C', background: '#F7F3EE', surface: '#EDE8E0', accent: '#8B0000', border: '#C8C0B4', text: '#1A1A1A', textSecondary: '#777777' },
    typography: { fontFamily: '"Noto Serif SC", "Source Han Serif SC", "SimSun", serif', scale: [13, 15, 17, 22, 28, 42], lineHeight: 1.8, fontWeight: { normal: 400, medium: 500, bold: 700 }, letterSpacing: '0.08em' },
    layout: { maxWidth: '960px', spacing: '24px', sectionSpacing: '96px', borderRadius: '4px', grid: 12 },
    shadows: { small: '0 2px 8px rgba(0, 0, 0, 0.06)', medium: '0 4px 16px rgba(0, 0, 0, 0.08)', large: '0 8px 32px rgba(0, 0, 0, 0.1)' },
    components: { card: { padding: '32px', border: '1px solid #C8C0B4', borderRadius: '4px', background: 'rgba(255,255,255,0.6)' }, button: { padding: '12px 28px', borderRadius: '4px', fontWeight: 600 }, hero: { padding: '120px 0', textAlign: 'center' }, nav: { height: '72px', borderBottom: '1px solid #C8C0B4' } },
    heroBg: '#2C2C2C',
    tone: { formality: 0.8, warmth: 0.75, complexity: 0.5, innovation: 0.35 }
  },
  retro_pixel: {
    name: '复古像素', nameEn: 'Retro Pixel',
    colors: { primary: '#00AA00', secondary: '#FF8800', background: '#1A1C2C', surface: '#2A2D3E', accent: '#FF0044', border: '#00AA00', text: '#F4F4F4', textSecondary: '#A0A0B0' },
    typography: { fontFamily: '"Press Start 2P", "VT323", "Courier New", monospace', scale: [10, 12, 14, 16, 20, 28], lineHeight: 1.7, fontWeight: { normal: 400, medium: 400, bold: 400 }, letterSpacing: '0.05em' },
    layout: { maxWidth: '960px', spacing: '16px', sectionSpacing: '64px', borderRadius: '0px', grid: 8 },
    shadows: { small: '4px 4px 0px rgba(0, 0, 0, 0.5)', medium: '6px 6px 0px rgba(0, 0, 0, 0.5)', large: '8px 8px 0px rgba(0, 0, 0, 0.5)' },
    components: { card: { padding: '20px', border: '2px solid #00AA00', borderRadius: '0px', background: '#2A2D3E' }, button: { padding: '12px 20px', borderRadius: '0px', fontWeight: 400, border: '2px solid #00AA00', background: 'transparent', color: '#00AA00', textTransform: 'uppercase' }, hero: { padding: '80px 0', textAlign: 'center' }, nav: { height: '56px', borderBottom: '2px solid #00AA00' } },
    tone: { formality: 0.2, warmth: 0.8, complexity: 0.5, innovation: 0.4 }
  },
  futurism: {
    name: '未来科技', nameEn: 'Futurism',
    colors: { primary: '#00D4FF', secondary: '#7B61FF', background: '#0B0E17', surface: '#131726', accent: '#00FF94', border: 'rgba(0, 212, 255, 0.2)', text: '#E8ECF4', textSecondary: '#7A8BA8' },
    typography: { fontFamily: '"Space Grotesk", "Inter", -apple-system, sans-serif', scale: [13, 15, 17, 22, 30, 44], lineHeight: 1.6, fontWeight: { normal: 300, medium: 500, bold: 700 }, letterSpacing: '0.02em' },
    layout: { maxWidth: '1280px', spacing: '20px', sectionSpacing: '96px', borderRadius: '12px', grid: 12 },
    shadows: { small: '0 2px 12px rgba(0, 212, 255, 0.15)', medium: '0 4px 24px rgba(0, 212, 255, 0.2)', large: '0 8px 48px rgba(0, 212, 255, 0.25)', glow: '0 0 40px rgba(0, 212, 255, 0.3)' },
    components: { card: { padding: '28px', border: '1px solid rgba(0, 212, 255, 0.2)', borderRadius: '12px', background: 'rgba(19, 23, 38, 0.8)' }, button: { padding: '14px 32px', borderRadius: '8px', fontWeight: 600, background: 'linear-gradient(135deg, #00D4FF, #7B61FF)', color: '#FFFFFF' }, hero: { padding: '140px 0', textAlign: 'center' }, nav: { height: '64px', background: 'rgba(11, 14, 23, 0.9)', backdropFilter: 'blur(12px)' } },
    tone: { formality: 0.7, warmth: 0.2, complexity: 0.6, innovation: 0.95 }
  },
  organic: {
    name: '自然有机', nameEn: 'Organic',
    colors: { primary: '#2D6A4F', secondary: '#52B788', background: '#FEFAE0', surface: '#F0EFEB', accent: '#BC6C25', border: '#D4CFC4', text: '#283618', textSecondary: '#606C38' },
    typography: { fontFamily: '"Lora", "Merriweather", "Georgia", serif', scale: [14, 16, 18, 22, 28, 38], lineHeight: 1.75, fontWeight: { normal: 400, medium: 500, bold: 700 }, letterSpacing: '0.01em' },
    layout: { maxWidth: '1080px', spacing: '24px', sectionSpacing: '80px', borderRadius: '24px', grid: 12 },
    shadows: { small: '0 2px 8px rgba(45, 106, 79, 0.08)', medium: '0 4px 16px rgba(45, 106, 79, 0.12)', large: '0 8px 32px rgba(45, 106, 79, 0.16)' },
    components: { card: { padding: '28px', border: '1px solid #D4CFC4', borderRadius: '24px', background: '#FFFFFF' }, button: { padding: '14px 28px', borderRadius: '50px', fontWeight: 600, background: '#2D6A4F', color: '#FFFFFF' }, hero: { padding: '100px 0', textAlign: 'center' }, nav: { height: '68px', borderBottom: '1px solid #D4CFC4' } },
    tone: { formality: 0.45, warmth: 0.85, complexity: 0.25, innovation: 0.35 }
  },
  industrial: {
    name: '工业机械', nameEn: 'Industrial',
    colors: { primary: '#F59E0B', secondary: '#78716C', background: '#1C1917', surface: '#292524', accent: '#EF4444', border: '#44403C', text: '#FAFAF9', textSecondary: '#A8A29E' },
    typography: { fontFamily: '"IBM Plex Sans", "Roboto Condensed", "Arial Narrow", sans-serif', scale: [13, 15, 17, 22, 28, 40], lineHeight: 1.55, fontWeight: { normal: 400, medium: 600, bold: 800 }, letterSpacing: '0.04em' },
    layout: { maxWidth: '1200px', spacing: '16px', sectionSpacing: '72px', borderRadius: '4px', grid: 12 },
    shadows: { small: '2px 2px 0px rgba(0, 0, 0, 0.4)', medium: '4px 4px 0px rgba(0, 0, 0, 0.4)', large: '6px 6px 0px rgba(0, 0, 0, 0.4)' },
    components: { card: { padding: '24px', border: '2px solid #44403C', borderRadius: '4px', background: '#292524' }, button: { padding: '12px 24px', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', background: '#F59E0B', color: '#1C1917' }, hero: { padding: '110px 0', textAlign: 'center' }, nav: { height: '60px', borderBottom: '2px solid #44403C' } },
    tone: { formality: 0.75, warmth: 0.2, complexity: 0.55, innovation: 0.4 }
  },
  hand_drawn: {
    name: '手绘插画', nameEn: 'Hand Drawn',
    colors: { primary: '#E76F51', secondary: '#2A9D8F', background: '#FFF8F0', surface: '#FFF1E6', accent: '#E9C46A', border: '#264653', text: '#264653', textSecondary: '#6B7B8D' },
    typography: { fontFamily: '"Caveat", "Patrick Hand", "Comic Sans MS", cursive, sans-serif', scale: [14, 16, 18, 24, 32, 44], lineHeight: 1.7, fontWeight: { normal: 400, medium: 500, bold: 700 }, letterSpacing: '0.02em' },
    layout: { maxWidth: '1000px', spacing: '24px', sectionSpacing: '72px', borderRadius: '16px', grid: 12 },
    shadows: { small: '2px 3px 0px rgba(38, 70, 83, 0.15)', medium: '3px 4px 0px rgba(38, 70, 83, 0.2)', large: '4px 6px 0px rgba(38, 70, 83, 0.25)' },
    components: { card: { padding: '28px', border: '2px solid #264653', borderRadius: '16px', borderStyle: 'dashed' }, button: { padding: '14px 28px', borderRadius: '50px', fontWeight: 700, border: '2px solid #264653', background: '#E76F51', color: '#FFFFFF' }, hero: { padding: '100px 0', textAlign: 'center' }, nav: { height: '68px', borderBottom: '2px dashed #264653' } },
    tone: { formality: 0.15, warmth: 0.9, complexity: 0.75, innovation: 0.55 }
  },
  data_viz: {
    name: '数据可视化', nameEn: 'Data Visualization',
    colors: { primary: '#3B82F6', secondary: '#10B981', background: '#F8FAFC', surface: '#FFFFFF', accent: '#F59E0B', border: '#E2E8F0', text: '#0F172A', textSecondary: '#64748B' },
    typography: { fontFamily: '"DM Sans", "Inter", -apple-system, sans-serif', scale: [12, 14, 16, 20, 26, 36], lineHeight: 1.6, fontWeight: { normal: 400, medium: 500, bold: 700 }, letterSpacing: '0.01em' },
    layout: { maxWidth: '1280px', spacing: '20px', sectionSpacing: '64px', borderRadius: '8px', grid: 12 },
    shadows: { small: '0 1px 3px rgba(0, 0, 0, 0.08)', medium: '0 4px 12px rgba(0, 0, 0, 0.1)', large: '0 8px 24px rgba(0, 0, 0, 0.12)' },
    components: { card: { padding: '24px', border: '1px solid #E2E8F0', borderRadius: '8px', background: '#FFFFFF' }, button: { padding: '10px 20px', borderRadius: '6px', fontWeight: 600, background: '#3B82F6', color: '#FFFFFF' }, hero: { padding: '80px 0', textAlign: 'center' }, nav: { height: '56px', borderBottom: '1px solid #E2E8F0', background: '#FFFFFF' } },
    tone: { formality: 0.75, warmth: 0.25, complexity: 0.55, innovation: 0.55 }
  },
};

// 风格索引：列出所有可用风格
module.exports.STYLE_INDEX = Object.entries(module.exports)
  .filter(([k]) => !k.startsWith('_'))
  .map(([id, s]) => ({ id, name: s.name, nameEn: s.nameEn, tone: s.tone }));
