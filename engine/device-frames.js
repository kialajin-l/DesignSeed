/**
 * DesignSeed — 设备框架组件
 * 精确像素级的 iOS/Android 设备外壳，用于 App 原型展示
 * 
 * v0.3 新增：追平 Huashu Design 的设备框架能力
 */

/**
 * iOS 设备框架
 * @param {string} content - 内部 HTML 内容
 * @param {object} options - 设备选项
 * @param {string} options.model - 设备型号: 'iphone-16-pro' | 'iphone-16' | 'iphone-se' | 'ipad-pro'
 * @param {string} options.color - 设备颜色: 'black' | 'white' | 'titanium' | 'blue'
 * @param {string} options.orientation - 方向: 'portrait' | 'landscape'
 * @param {boolean} options.showStatusBar - 是否显示状态栏
 * @param {boolean} options.showDynamicIsland - 是否显示灵动岛
 */
function iOSFrame(content, options = {}) {
  const {
    model = 'iphone-16-pro',
    color = 'black',
    orientation = 'portrait',
    showStatusBar = true,
    showDynamicIsland = true,
  } = options;

  const specs = IOS_SPECS[model] || IOS_SPECS['iphone-16-pro'];
  const colors = IOS_COLORS[color] || IOS_COLORS['black'];
  const isLandscape = orientation === 'landscape';
  const frameW = isLandscape ? specs.height : specs.width;
  const frameH = isLandscape ? specs.width : specs.height;
  const screenW = isLandscape ? specs.screenHeight : specs.screenWidth;
  const screenH = isLandscape ? specs.screenWidth : specs.screenHeight;

  const statusBarHtml = showStatusBar ? generateIOSStatusBar(specs) : '';
  const dynamicIslandHtml = showDynamicIsland && specs.hasDynamicIsland
    ? `<div style="position:absolute;top:12px;left:50%;transform:translateX(-50%);width:126px;height:37px;background:#000;border-radius:20px;z-index:10;"></div>`
    : specs.hasNotch
      ? `<div style="position:absolute;top:0;left:50%;transform:translateX(-50%);width:${specs.notchWidth}px;height:${specs.notchHeight}px;background:#000;border-radius:0 0 20px 20px;z-index:10;"></div>`
      : '';

  const homeIndicatorHtml = specs.hasHomeIndicator
    ? `<div style="position:absolute;bottom:8px;left:50%;transform:translateX(-50%);width:134px;height:5px;background:rgba(255,255,255,0.3);border-radius:3px;z-index:10;"></div>`
    : '';

  return `
<div style="display:inline-block;position:relative;width:${frameW}px;height:${frameH}px;background:${colors.frame};border-radius:${specs.borderRadius}px;box-shadow:0 25px 60px rgba(0,0,0,0.3),0 0 0 1px rgba(255,255,255,0.1) inset;overflow:hidden;flex-shrink:0;">
  ${dynamicIslandHtml}
  <div style="position:absolute;top:${specs.bezelTop}px;left:${specs.bezelSide}px;right:${specs.bezelSide}px;bottom:${specs.bezelBottom}px;background:#000;border-radius:${specs.screenRadius}px;overflow:hidden;">
    <div style="position:relative;width:100%;height:100%;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;">
      ${statusBarHtml}
      <div style="padding-top:${showStatusBar ? '44px' : '0'};min-height:100%;">
        ${content}
      </div>
    </div>
  </div>
  ${homeIndicatorHtml}
</div>`;
}

/**
 * Android 设备框架
 * @param {string} content - 内部 HTML 内容
 * @param {object} options - 设备选项
 * @param {string} options.model - 设备型号: 'pixel-9-pro' | 'samsung-s24' | 'xiaomi-15'
 * @param {string} options.color - 设备颜色
 * @param {string} options.orientation - 方向
 * @param {boolean} options.showStatusBar - 是否显示状态栏
 */
function AndroidFrame(content, options = {}) {
  const {
    model = 'pixel-9-pro',
    color = 'black',
    orientation = 'portrait',
    showStatusBar = true,
  } = options;

  const specs = ANDROID_SPECS[model] || ANDROID_SPECS['pixel-9-pro'];
  const colors = ANDROID_COLORS[color] || ANDROID_COLORS['black'];
  const isLandscape = orientation === 'landscape';
  const frameW = isLandscape ? specs.height : specs.width;
  const frameH = isLandscape ? specs.width : specs.height;

  const statusBarHtml = showStatusBar ? generateAndroidStatusBar(specs) : '';

  const punchHoleHtml = specs.hasPunchHole
    ? `<div style="position:absolute;top:${specs.punchHoleY}px;left:50%;transform:translateX(-50%);width:${specs.punchHoleSize}px;height:${specs.punchHoleSize}px;background:#000;border-radius:50%;z-index:10;"></div>`
    : specs.hasPill
      ? `<div style="position:absolute;top:${specs.pillY}px;left:50%;transform:translateX(-50%);width:${specs.pillWidth}px;height:${specs.pillHeight}px;background:#000;border-radius:20px;z-index:10;"></div>`
      : '';

  const navBarHtml = specs.hasNavBar
    ? `<div style="position:absolute;bottom:0;left:0;right:0;height:48px;display:flex;align-items:center;justify-content:center;gap:80px;z-index:10;">
        <div style="width:18px;height:18px;border-left:2px solid rgba(255,255,255,0.5);border-bottom:2px solid rgba(255,255,255,0.5);transform:rotate(45deg);"></div>
        <div style="width:18px;height:18px;border:2px solid rgba(255,255,255,0.5);border-radius:50%;"></div>
        <div style="width:18px;height:18px;border-right:2px solid rgba(255,255,255,0.5);border-top:2px solid rgba(255,255,255,0.5);transform:rotate(45deg);"></div>
      </div>`
    : '';

  return `
<div style="display:inline-block;position:relative;width:${frameW}px;height:${frameH}px;background:${colors.frame};border-radius:${specs.borderRadius}px;box-shadow:0 25px 60px rgba(0,0,0,0.3),0 0 0 1px rgba(255,255,255,0.08) inset;overflow:hidden;flex-shrink:0;">
  ${punchHoleHtml}
  <div style="position:absolute;top:${specs.bezelTop}px;left:${specs.bezelSide}px;right:${specs.bezelSide}px;bottom:${specs.bezelBottom}px;background:#000;border-radius:${specs.screenRadius}px;overflow:hidden;">
    <div style="position:relative;width:100%;height:100%;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;">
      ${statusBarHtml}
      <div style="padding-top:${showStatusBar ? '40px' : '0'};min-height:100%;">
        ${content}
      </div>
    </div>
  </div>
  ${navBarHtml}
</div>`;
}

/**
 * 平板设备框架（iPad / Android Tablet）
 */
function TabletFrame(content, options = {}) {
  const {
    platform = 'ipad-pro',
    orientation = 'landscape',
    showStatusBar = true,
  } = options;

  const specs = platform === 'ipad-pro' ? TABLET_SPECS['ipad-pro'] : TABLET_SPECS['android-tablet'];
  const isLandscape = orientation === 'landscape';
  const frameW = isLandscape ? specs.height : specs.width;
  const frameH = isLandscape ? specs.width : specs.height;

  return `
<div style="display:inline-block;position:relative;width:${frameW}px;height:${frameH}px;background:#1a1a1a;border-radius:${specs.borderRadius}px;box-shadow:0 30px 80px rgba(0,0,0,0.35);overflow:hidden;flex-shrink:0;">
  <div style="position:absolute;top:${specs.bezelTop}px;left:${specs.bezelSide}px;right:${specs.bezelSide}px;bottom:${specs.bezelBottom}px;background:#000;border-radius:${specs.screenRadius}px;overflow:hidden;">
    <div style="position:relative;width:100%;height:100%;overflow-y:auto;overflow-x:hidden;">
      ${showStatusBar ? generateTabletStatusBar(specs) : ''}
      <div style="padding-top:${showStatusBar ? '48px' : '0'};min-height:100%;">
        ${content}
      </div>
    </div>
  </div>
</div>`;
}

// ─── 设备规格数据库 ───

const IOS_SPECS = {
  'iphone-16-pro': {
    width: 393, height: 852,
    screenWidth: 393, screenHeight: 852,
    bezelTop: 0, bezelSide: 0, bezelBottom: 0,
    borderRadius: 55, screenRadius: 48,
    hasDynamicIsland: true, hasNotch: false, hasHomeIndicator: true,
    statusBarStyle: 'light',
  },
  'iphone-16': {
    width: 393, height: 852,
    screenWidth: 393, screenHeight: 852,
    bezelTop: 0, bezelSide: 0, bezelBottom: 0,
    borderRadius: 55, screenRadius: 48,
    hasDynamicIsland: true, hasNotch: false, hasHomeIndicator: true,
    statusBarStyle: 'light',
  },
  'iphone-se': {
    width: 375, height: 667,
    screenWidth: 375, screenHeight: 667,
    bezelTop: 44, bezelSide: 0, bezelBottom: 34,
    borderRadius: 40, screenRadius: 0,
    hasDynamicIsland: false, hasNotch: false, hasHomeIndicator: false,
    statusBarStyle: 'light',
  },
  'ipad-pro': {
    width: 1024, height: 768,
    screenWidth: 1024, screenHeight: 768,
    bezelTop: 12, bezelSide: 12, bezelBottom: 12,
    borderRadius: 20, screenRadius: 12,
    hasDynamicIsland: false, hasNotch: false, hasHomeIndicator: true,
    statusBarStyle: 'light',
  },
};

const IOS_COLORS = {
  black: { frame: '#1a1a1a', bezel: '#000' },
  white: { frame: '#f5f5f7', bezel: '#e8e8e8' },
  titanium: { frame: '#3c3c3c', bezel: '#2a2a2a' },
  blue: { frame: '#2c3e6b', bezel: '#1e2d4d' },
};

const ANDROID_SPECS = {
  'pixel-9-pro': {
    width: 412, height: 915,
    screenWidth: 412, screenHeight: 915,
    bezelTop: 0, bezelSide: 0, bezelBottom: 0,
    borderRadius: 48, screenRadius: 40,
    hasPunchHole: false, hasPill: true,
    pillY: 12, pillWidth: 148, pillHeight: 32,
    hasNavBar: true,
    statusBarStyle: 'light',
  },
  'samsung-s24': {
    width: 360, height: 780,
    screenWidth: 360, screenHeight: 780,
    bezelTop: 0, bezelSide: 0, bezelBottom: 0,
    borderRadius: 44, screenRadius: 36,
    hasPunchHole: true, hasPill: false,
    punchHoleY: 12, punchHoleSize: 12,
    hasNavBar: true,
    statusBarStyle: 'light',
  },
  'xiaomi-15': {
    width: 400, height: 880,
    screenWidth: 400, screenHeight: 880,
    bezelTop: 0, bezelSide: 0, bezelBottom: 0,
    borderRadius: 50, screenRadius: 42,
    hasPunchHole: true, hasPill: false,
    punchHoleY: 14, punchHoleSize: 11,
    hasNavBar: true,
    statusBarStyle: 'light',
  },
};

const ANDROID_COLORS = {
  black: { frame: '#1a1a1a', bezel: '#000' },
  white: { frame: '#f0f0f0', bezel: '#e0e0e0' },
  green: { frame: '#2d4a3e', bezel: '#1e3a2e' },
  blue: { frame: '#1e3a5c', bezel: '#0f2a4c' },
};

const TABLET_SPECS = {
  'ipad-pro': {
    width: 1024, height: 768,
    screenWidth: 1024, screenHeight: 768,
    bezelTop: 12, bezelSide: 12, bezelBottom: 12,
    borderRadius: 20, screenRadius: 12,
  },
  'android-tablet': {
    width: 900, height: 600,
    screenWidth: 900, screenHeight: 600,
    bezelTop: 8, bezelSide: 8, bezelBottom: 8,
    borderRadius: 16, screenRadius: 10,
  },
};

// ─── 状态栏生成 ───

function generateIOSStatusBar(specs) {
  return `
<div style="position:absolute;top:0;left:0;right:0;height:44px;display:flex;align-items:flex-end;justify-content:space-between;padding:0 32px 6px;z-index:5;color:#fff;font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-size:14px;font-weight:600;">
  <span>9:41</span>
  <div style="display:flex;align-items:center;gap:6px;">
    <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor"><path d="M1 4.5C3.5 1.5 7 0 8.5 0s5 1.5 7.5 4.5" stroke="currentColor" fill="none" stroke-width="1.5"/><path d="M3.5 7C5 5 6.5 4 8.5 4s3.5 1 5 3" stroke="currentColor" fill="none" stroke-width="1.5"/><circle cx="8.5" cy="10" r="1.5"/></svg>
    <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><rect x="0" y="3" width="3" height="9" rx="0.5"/><rect x="4.5" y="2" width="3" height="10" rx="0.5"/><rect x="9" y="0" width="3" height="12" rx="0.5"/><rect x="13" y="1" width="3" height="11" rx="0.5" opacity="0.3"/></svg>
    <div style="width:25px;height:12px;border:1.5px solid currentColor;border-radius:3px;padding:1.5px;"><div style="width:60%;height:100%;background:currentColor;border-radius:1px;"></div></div>
  </div>
</div>`;
}

function generateAndroidStatusBar(specs) {
  return `
<div style="position:absolute;top:0;left:0;right:0;height:40px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;z-index:5;color:#fff;font-family:'Roboto',sans-serif;font-size:14px;font-weight:500;">
  <span>12:00</span>
  <div style="display:flex;align-items:center;gap:6px;">
    <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><path d="M1 4.5C3.5 1.5 7 0 8 0s4.5 1.5 7 4.5" stroke="currentColor" fill="none" stroke-width="1.5"/><circle cx="8" cy="10" r="1.5"/></svg>
    <svg width="14" height="12" viewBox="0 0 14 12" fill="currentColor"><rect x="0" y="3" width="3" height="9" rx="0.5"/><rect x="4" y="2" width="3" height="10" rx="0.5"/><rect x="8" y="0" width="3" height="12" rx="0.5"/></svg>
    <div style="width:22px;height:11px;border:1.5px solid currentColor;border-radius:2px;padding:1px;"><div style="width:70%;height:100%;background:currentColor;border-radius:1px;"></div></div>
  </div>
</div>`;
}

function generateTabletStatusBar(specs) {
  return `
<div style="position:absolute;top:0;left:0;right:0;height:48px;display:flex;align-items:center;justify-content:space-between;padding:0 24px;z-index:5;color:#fff;font-family:-apple-system,sans-serif;font-size:15px;font-weight:600;">
  <span>9:41 AM</span>
  <div style="display:flex;align-items:center;gap:8px;">
    <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor"><path d="M1 4.5C3.5 1.5 7 0 8.5 0s5 1.5 7.5 4.5" stroke="currentColor" fill="none" stroke-width="1.5"/><circle cx="8.5" cy="10" r="1.5"/></svg>
    <div style="width:25px;height:12px;border:1.5px solid currentColor;border-radius:3px;padding:1.5px;"><div style="width:60%;height:100%;background:currentColor;border-radius:1px;"></div></div>
  </div>
</div>`;
}

module.exports = { iOSFrame, AndroidFrame, TabletFrame, IOS_SPECS, ANDROID_SPECS };
