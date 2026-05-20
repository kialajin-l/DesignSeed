/**
 * DesignSeed — 装饰素材扩展包
 * 4 类 25+ 装饰元素：cultural / stickers / frames / effects
 */

function _px(v){if(v==null||v==='')return'';if(typeof v==='number')return v+'px';var s=String(v);return(s.endsWith('px')||s.endsWith('%')||s.endsWith('em'))?s:s+'px';}
function _rgba(h,a){if(!h)h='#000000';h=h.replace('#','');if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];return'rgba('+parseInt(h.substr(0,2),16)+','+parseInt(h.substr(2,2),16)+','+parseInt(h.substr(4,2),16)+','+a+')';}

var cultural={};

cultural['seal-stamp']=function(o){o=o||{};var c=o.color||'#C41E3A',s=_px(o.size||80),t=o.text||'印',sh=o.shape||'square',bw=_px(o.borderWidth||3),br=sh==='circle'?'50%':'4px';return'<div style="position:absolute;display:inline-flex;align-items:center;justify-content:center;border-radius:'+br+';width:'+s+';height:'+s+';border:'+bw+' solid '+c+';"><span style="color:'+c+';font-size:'+(parseInt(s)*0.45)+'px;font-weight:900;letter-spacing:0.1em;line-height:1;">'+t+'</span></div>';};

cultural['calligraphy-brush']=function(o){o=o||{};var c=o.color||'#1A1A2E',d=o.direction||'heng';var P={heng:'M5,8 C20,2 50,0 100,1 C150,2 180,4 195,6 C198,7 200,8 195,9 C180,11 150,12 100,11 C50,10 20,12 5,10 Z',shu:'M8,5 C2,20 0,50 1,100 C2,150 4,180 6,195 C7,198 8,200 9,195 C11,180 12,150 11,100 C10,50 12,20 10,5 Z',pie:'M180,5 C160,20 130,50 100,80 C70,110 40,150 15,185 C12,188 8,190 10,185 C30,150 60,110 90,80 C120,50 155,20 175,10 Z',na:'M20,5 C40,20 70,50 100,80 C130,110 160,150 185,185 C188,188 192,190 190,185 C170,150 140,110 110,80 C80,50 45,20 25,10 Z'};var vb=d==='heng'?'0 0 200 16':d==='shu'?'0 0 16 200':'0 0 200 200';var w=o.width||(d==='heng'?200:12),h=o.height||(d==='heng'?12:200);return'<div style="position:absolute;display:inline-block;"><svg width="'+_px(w)+'" height="'+_px(h)+'" viewBox="'+vb+'" xmlns="http://www.w3.org/2000/svg"><path d="'+(P[d]||P.heng)+'" fill="'+c+'" opacity="0.85"/></svg></div>';};

cultural['cloud-pattern']=function(o){o=o||{};var c=o.color||'#C41E3A',s=_px(o.size||60),op=o.opacity||0.6;return'<div style="position:absolute;display:inline-block;"><svg width="'+s+'" height="'+_px(parseInt(s)*0.6)+'" viewBox="0 0 100 60" xmlns="http://www.w3.org/2000/svg"><path d="M20,40 C10,40 5,32 12,26 C8,18 18,10 28,14 C32,4 48,4 52,14 C58,8 72,10 72,20 C82,16 90,24 84,32 C92,36 88,48 78,44 L20,40 Z" fill="'+c+'" opacity="'+op+'"/></svg></div>';};

cultural['wave-pattern']=function(o){o=o||{};var c=o.color||'#4A90D9',w=_px(o.width||200),h=_px(o.height||30),op=o.opacity||0.5;return'<div style="position:absolute;display:inline-block;"><svg width="'+w+'" height="'+h+'" viewBox="0 0 200 30" xmlns="http://www.w3.org/2000/svg"><path d="M0,15 C25,5 25,25 50,15 C75,5 75,25 100,15 C125,5 125,25 150,15 C175,5 175,25 200,15" fill="none" stroke="'+c+'" stroke-width="2" opacity="'+op+'"/><path d="M0,22 C25,12 25,32 50,22 C75,12 75,32 100,22 C125,12 125,32 150,22 C175,12 175,32 200,22" fill="none" stroke="'+c+'" stroke-width="1.5" opacity="'+(op*0.6)+'"/></svg></div>';};

cultural['bamboo-shoot']=function(o){o=o||{};var c=o.color||'#2D5016',s=_px(o.size||80),op=o.opacity||0.7;return'<div style="position:absolute;display:inline-block;"><svg width="'+s+'" height="'+s+'" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><path d="M40,75 L40,25" stroke="'+c+'" stroke-width="2" fill="none" opacity="'+op+'"/><path d="M40,30 C30,20 15,18 10,25 C15,22 28,24 38,32" fill="'+c+'" opacity="'+op+'"/><path d="M40,40 C50,30 65,28 70,35 C65,32 52,34 42,42" fill="'+c+'" opacity="'+op+'"/><path d="M40,50 C30,42 18,42 14,48 C18,45 28,46 38,52" fill="'+c+'" opacity="'+(op*0.8)+'"/></svg></div>';};

cultural['plum-blossom']=function(o){o=o||{};var c=o.color||'#E94560',s=_px(o.size||80),op=o.opacity||0.7;return'<div style="position:absolute;display:inline-block;"><svg width="'+s+'" height="'+s+'" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="25" r="8" fill="'+c+'" opacity="'+op+'"/><circle cx="55" cy="35" r="8" fill="'+c+'" opacity="'+op+'"/><circle cx="50" cy="52" r="8" fill="'+c+'" opacity="'+op+'"/><circle cx="30" cy="52" r="8" fill="'+c+'" opacity="'+op+'"/><circle cx="25" cy="35" r="8" fill="'+c+'" opacity="'+op+'"/><circle cx="40" cy="40" r="4" fill="#FFD700" opacity="0.9"/></svg></div>';};

cultural['chinese-knot']=function(o){o=o||{};var c=o.color||'#C41E3A',s=_px(o.size||50);return'<div style="position:absolute;display:inline-block;"><svg width="'+s+'" height="'+_px(parseInt(s)*1.5)+'" viewBox="0 0 50 75" xmlns="http://www.w3.org/2000/svg"><rect x="12" y="15" width="26" height="26" rx="3" fill="none" stroke="'+c+'" stroke-width="2.5"/><line x1="25" y1="0" x2="25" y2="15" stroke="'+c+'" stroke-width="2"/><line x1="25" y1="41" x2="25" y2="55" stroke="'+c+'" stroke-width="2"/><path d="M20,55 L15,72" stroke="'+c+'" stroke-width="1.5" fill="none"/><path d="M30,55 L35,72" stroke="'+c+'" stroke-width="1.5" fill="none"/><circle cx="25" cy="28" r="5" fill="'+c+'" opacity="0.3"/></svg></div>';};

cultural['ink-splash']=function(o){o=o||{};var c=o.color||'#1A1A2E',s=_px(o.size||80),op=o.opacity||0.7;return'<div style="position:absolute;display:inline-block;"><svg width="'+s+'" height="'+s+'" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="18" fill="'+c+'" opacity="'+op+'"/><circle cx="28" cy="30" r="6" fill="'+c+'" opacity="'+(op*0.7)+'"/><circle cx="55" cy="35" r="4" fill="'+c+'" opacity="'+(op*0.6)+'"/><circle cx="35" cy="55" r="5" fill="'+c+'" opacity="'+(op*0.5)+'"/><circle cx="50" cy="50" r="3" fill="'+c+'" opacity="'+(op*0.4)+'"/></svg></div>';};

cultural['paper-cut']=function(o){o=o||{};var c=o.color||'#C41E3A',w=_px(o.width||120),h=_px(o.height||120),bw=_px(o.borderWidth||2);return'<div style="position:absolute;display:inline-block;"><svg width="'+w+'" height="'+h+'" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="5" width="110" height="110" rx="2" fill="none" stroke="'+c+'" stroke-width="'+bw+'"/><path d="M10,10 L20,5 L30,10 L20,15 Z" fill="'+c+'" opacity="0.5"/><path d="M90,10 L100,5 L110,10 L100,15 Z" fill="'+c+'" opacity="0.5"/><path d="M10,110 L20,105 L30,110 L20,115 Z" fill="'+c+'" opacity="0.5"/><path d="M90,110 L100,105 L110,110 L100,115 Z" fill="'+c+'" opacity="0.5"/><circle cx="60" cy="60" r="20" fill="none" stroke="'+c+'" stroke-width="1" opacity="0.3"/></svg></div>';};
var stickers={};

stickers['star-burst']=function(o){o=o||{};var c=o.color||'#FFD700',s=_px(o.size||50),n=o.points||8,oR=24,iR=14,pts=[];for(var i=0;i<n*2;i++){var r=i%2===0?oR:iR;var a=(Math.PI*i)/n-Math.PI/2;pts.push((25+r*Math.cos(a)).toFixed(1)+','+(25+r*Math.sin(a)).toFixed(1));}return'<div style="position:absolute;display:inline-block;"><svg width="'+s+'" height="'+s+'" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg"><polygon points="'+pts.join(' ')+'" fill="'+c+'"/></svg></div>';};

stickers['ribbon-banner']=function(o){o=o||{};var c=o.color||'#E94560',w=_px(o.width||200),h=_px(o.height||40),t=o.text||'';return'<div style="position:absolute;display:inline-block;"><svg width="'+w+'" height="'+h+'" viewBox="0 0 200 40" xmlns="http://www.w3.org/2000/svg"><path d="M0,8 L15,0 L185,0 L200,8 L200,32 L185,40 L15,40 L0,32 Z" fill="'+c+'"/><text x="100" y="26" text-anchor="middle" fill="white" font-size="14" font-weight="bold" font-family="sans-serif">'+t+'</text></svg></div>';};

stickers['arrow-hand']=function(o){o=o||{};var c=o.color||'#1A1A2E',s=_px(o.size||40),r=o.rotation||0;return'<div style="position:absolute;display:inline-block;transform:rotate('+r+'deg);"><svg width="'+s+'" height="'+s+'" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M5,20 C8,18 15,15 22,12 C25,11 28,10 30,10 C28,14 27,18 28,22 C29,24 30,26 32,28 C26,27 20,28 14,30 C10,31 6,32 5,30 C4,28 5,24 5,20 Z" fill="'+c+'" opacity="0.8"/></svg></div>';};

stickers['underline-wavy']=function(o){o=o||{};var c=o.color||'#E94560',w=_px(o.width||150);return'<div style="position:absolute;display:inline-block;"><svg width="'+w+'" height="10" viewBox="0 0 150 10" xmlns="http://www.w3.org/2000/svg"><path d="M0,5 C12.5,0 12.5,10 25,5 C37.5,0 37.5,10 50,5 C62.5,0 62.5,10 75,5 C87.5,0 87.5,10 100,5 C112.5,0 112.5,10 125,5 C137.5,0 137.5,10 150,5" fill="none" stroke="'+c+'" stroke-width="2"/></svg></div>';};

stickers['highlight-marker']=function(o){o=o||{};var c=o.color||'#FFEB3B',w=_px(o.width||120),h=_px(o.height||16),op=o.opacity||0.4;return'<div style="position:absolute;display:inline-block;background:'+_rgba(c,op)+';width:'+w+';height:'+h+';border-radius:3px;transform:skewX(-2deg);"></div>';};

stickers['sticker-circle']=function(o){o=o||{};var c=o.color||'#E94560',s=_px(o.size||60),t=o.text||'★',r=o.rotation||-5;return'<div style="position:absolute;display:inline-flex;align-items:center;justify-content:center;width:'+s+';height:'+s+';border-radius:50%;background:'+c+';color:white;font-size:'+(parseInt(s)*0.4)+'px;font-weight:bold;box-shadow:2px 3px 8px rgba(0,0,0,0.25);transform:rotate('+r+'deg);">'+t+'</div>';};

stickers['emoji-style']=function(o){o=o||{};var bg=o.bgColor||'#FFD700',s=_px(o.size||50),sym=o.symbol||'😊';return'<div style="position:absolute;display:inline-flex;align-items:center;justify-content:center;width:'+s+';height:'+s+';border-radius:50%;background:'+bg+';font-size:'+(parseInt(s)*0.55)+'px;box-shadow:0 2px 6px rgba(0,0,0,0.2);">'+sym+'</div>';};

var frames={};

frames['frame-rounded']=function(o){o=o||{};var c=o.color||'#E0E0E0',w=_px(o.width||200),h=_px(o.height||150),bw=_px(o.borderWidth||2),br=_px(o.borderRadius||12);return'<div style="position:absolute;display:inline-block;width:'+w+';height:'+h+';border:'+bw+' solid '+c+';border-radius:'+br+';"></div>';};

frames['frame-double']=function(o){o=o||{};var c=o.color||'#1A1A2E',w=_px(o.width||200),h=_px(o.height||150);return'<div style="position:absolute;display:inline-block;width:'+w+';height:'+h+';border:3px double '+c+';"></div>';};

frames['frame-ornate']=function(o){o=o||{};var c=o.color||'#C41E3A',w=_px(o.width||200),h=_px(o.height||150);var d='<svg style="position:absolute;" width="12" height="12" viewBox="0 0 12 12"><path d="M6,0 L12,6 L6,12 L0,6 Z" fill="'+c+'"/></svg>';return'<div style="position:absolute;display:inline-block;width:'+w+';height:'+h+';border:2px solid '+c+';"><div style="position:absolute;top:-6px;left:-6px;">'+d+'</div><div style="position:absolute;top:-6px;right:-6px;">'+d+'</div><div style="position:absolute;bottom:-6px;left:-6px;">'+d+'</div><div style="position:absolute;bottom:-6px;right:-6px;">'+d+'</div></div>';};

frames['frame-dashed']=function(o){o=o||{};var c=o.color||'#999',w=_px(o.width||200),h=_px(o.height||150);return'<div style="position:absolute;display:inline-block;width:'+w+';height:'+h+';border:2px dashed '+c+';"></div>';};

frames['frame-shadow']=function(o){o=o||{};var bg=o.bgColor||'#fff',w=_px(o.width||200),h=_px(o.height||150),br=_px(o.borderRadius||8);return'<div style="position:absolute;display:inline-block;width:'+w+';height:'+h+';background:'+bg+';border-radius:'+br+';box-shadow:0 4px 20px rgba(0,0,0,0.12);"></div>';};

var effects={};

effects['glow-dot']=function(o){o=o||{};var c=o.color||'#E94560',s=_px(o.size||12),n=parseInt(s);return'<div style="position:absolute;display:inline-block;width:'+s+';height:'+s+';border-radius:50%;background:'+c+';box-shadow:0 0 '+(n*1.5)+'px '+(n*0.8)+'px '+_rgba(c,0.5)+';"></div>';};

effects['gradient-overlay']=function(o){o=o||{};var c1=o.color1||'rgba(0,0,0,0)',c2=o.color2||'rgba(0,0,0,0.8)',w=_px(o.width||300),h=_px(o.height||200),d=o.direction||'to bottom';return'<div style="position:absolute;display:inline-block;width:'+w+';height:'+h+';background:linear-gradient('+d+','+c1+','+c2+');"></div>';};

effects['shimmer']=function(o){o=o||{};var c=o.color||'rgba(255,255,255,0.3)',w=_px(o.width||100),h=_px(o.height||4);return'<style>@keyframes ds-shimmer{0%{opacity:0.3;transform:translateX(-20px)}50%{opacity:1;transform:translateX(20px)}100%{opacity:0.3;transform:translateX(-20px)}}</style><div style="position:absolute;display:inline-block;width:'+w+';height:'+h+';background:linear-gradient(90deg,transparent,'+c+',transparent);animation:ds-shimmer 2s infinite;"></div>';};

effects['shadow-drop']=function(o){o=o||{};var w=_px(o.width||100),h=_px(o.height||60),ox=_px(o.offsetX||4),oy=_px(o.offsetY||4),bl=_px(o.blur||10),sp=_px(o.spread||0),c=o.color||'rgba(0,0,0,0.15)';return'<div style="position:absolute;display:inline-block;width:'+w+';height:'+h+';box-shadow:'+ox+' '+oy+' '+bl+' '+sp+' '+c+';"></div>';};

module.exports={cultural:cultural,stickers:stickers,frames:frames,effects:effects};