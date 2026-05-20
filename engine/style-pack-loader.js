/**
 * DesignSeed - Style Pack Loader
 * Loads style packs from style-packs/ and converts to renderer format
 */
const fs2 = require("fs");
const path = require("path");
const PACKS_DIR = path.join(__dirname, "../style-packs");

function listPacks() {
  if (!fs2.existsSync(PACKS_DIR)) return [];
  return fs2.readdirSync(PACKS_DIR).filter(d => fs2.existsSync(path.join(PACKS_DIR, d, "pack.json")));
}

function loadPack(packId) {
  const dir = path.join(PACKS_DIR, packId);
  const pp = path.join(dir, "pack.json");
  if (!fs2.existsSync(pp)) throw new Error("Pack not found: " + packId);
  const pack = JSON.parse(fs2.readFileSync(pp, "utf8"));
  const r = { meta: pack, palettes: {}, templates: {}, fonts: {}, assets: {} };
  const cp = path.join(dir, "palette/colors.json");
  if (fs2.existsSync(cp)) {
    JSON.parse(fs2.readFileSync(cp, "utf8")).palettes.forEach(p => r.palettes[p.id] = p);
  }
  const tp = path.join(dir, "layout/templates.json");
  if (fs2.existsSync(tp)) {
    JSON.parse(fs2.readFileSync(tp, "utf8")).templates.forEach(t => r.templates[t.id] = t);
  }
  const fp = path.join(dir, "typography/fonts.json");
  if (fs2.existsSync(fp)) r.fonts = JSON.parse(fs2.readFileSync(fp, "utf8"));
  const ap = path.join(dir, "assets/index.json");
  if (fs2.existsSync(ap)) r.assets = JSON.parse(fs2.readFileSync(ap, "utf8"));
  if (pack.decorations) r.decorations = pack.decorations;
  return r;
}


/**
 * Derive tone from pack metadata (mood/tags).
 * @param {object} meta - pack.json metadata
 * @returns {object} tone with formality, warmth, complexity, innovation
 */
function deriveTone(meta) {
  if (!meta) return { formality: 0.5, warmth: 0.5, complexity: 0.5, innovation: 0.5 };
  const mood = (meta.mood || '').toLowerCase();
  const tags = (meta.tags || []).map(t => t.toLowerCase()).join(' ');
  const all = mood + ' ' + tags;
  
  // Tech feeling
  let innovation = 0.5;
  if (/科技|tech|赛博|cyber|未来|neon|霓虹/.test(all)) innovation = 0.8;
  else if (/传统|国潮|guochao|手作|hand|复古|retro/.test(all)) innovation = 0.2;
  
  // Warmth
  let warmth = 0.5;
  if (/温暖|warm|可爱|cute|柔和|soft|粉色|pink|桃/.test(all)) warmth = 0.8;
  else if (/冷|cool|极简|minimal|科技|tech|赛博/.test(all)) warmth = 0.2;
  
  // Formality
  let formality = 0.5;
  if (/商务|biz|正式|formal|专业/.test(all)) formality = 0.8;
  else if (/可爱|cute|手作|hand|活泼/.test(all)) formality = 0.2;
  
  // Complexity
  let complexity = 0.5;
  if (/赛博|cyber|霓虹|neon|国潮|guochao|装饰/.test(all)) complexity = 0.8;
  else if (/极简|minimal|纯净|pure/.test(all)) complexity = 0.2;
  
  return { formality, warmth, complexity, innovation };
}

function paletteToRendererStyle(palette, fonts, packMeta) {
  return {
    name: palette.name,
    colors: { primary: palette.primary, secondary: palette.secondary, background: palette.background, surface: palette.surface, accent: palette.accent, border: palette.border, text: palette.text, textSecondary: palette.textSecondary },
    typography: { fontFamily: (fonts && fonts.fontStack) ? fonts.fontStack.zh : "sans-serif", scale: (fonts && fonts.scale) ? Object.values(fonts.scale).map(function(s) { return parseInt(s.size); }) : [12,14,16,20,24,32], lineHeight: 1.6, fontWeight: { normal: 400, medium: 500, bold: 700 } },
    layout: { maxWidth: "1200px", spacing: (fonts && fonts.spacing) ? fonts.spacing.cardGap : "16px", sectionSpacing: (fonts && fonts.spacing) ? fonts.spacing.sectionGap : "40px", borderRadius: "20px", grid: 12 },
    shadows: palette.shadows || { small: "0 2px 8px rgba(0,0,0,0.06)", medium: "0 4px 16px rgba(0,0,0,0.08)", large: "0 8px 32px rgba(0,0,0,0.1)" },
    components: { card: { padding: "24px", border: "2px dashed " + (palette.border || "#eee"), borderRadius: "20px", background: palette.surface || "#fff" }, button: { padding: "12px 24px", borderRadius: "20px", fontWeight: 600, background: palette.primary, color: palette.textOnBg || "#fff" }, hero: { padding: "80px 0", textAlign: "center" }, nav: { height: "64px", borderBottom: "1px solid " + (palette.border || "#eee") } },
    gradients: palette.gradients || {},
    tone: { formality: 0.3, warmth: 0.8, complexity: 0.4, innovation: 0.5 },
  };
}


/**
 * Get a style pack by ID (returns null if not found, does not throw).
 * @param {string} packId
 * @returns {object|null}
 */
function getPack(packId) {
  try {
    return loadPack(packId);
  } catch (e) {
    return null;
  }
}

module.exports = { listPacks, loadPack, getPack, paletteToRendererStyle };