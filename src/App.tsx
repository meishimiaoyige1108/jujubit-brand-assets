import { useEffect, useState } from 'react';
import { ArrowUpRight, Check, ChevronDown, ChevronLeft, ChevronRight, Clipboard, Download, Image, Layers3, Menu, Palette, Type, AppWindow, Shapes } from 'lucide-react';
import './logo-library.css';

const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

type Tab = 'logos' | 'app-icons' | 'font';
const tabs: { id: Tab; label: string; english: string; icon: typeof Shapes }[] = [
  { id: 'logos', label: 'Logo', english: '品牌标识', icon: Shapes },
  { id: 'app-icons', label: 'App Icon', english: '应用图标', icon: AppWindow },
  { id: 'font', label: 'Font', english: '字体规范', icon: Type },
];

type Logo = { id: string; name: string; english: string; color: string; file: string; surface: 'light' | 'dark'; note: string };
const logos: Logo[] = [
  { id: 'orange', name: '品牌橙', english: 'PRIMARY ORANGE', color: '#FF5A11', file: asset('/assets/logo/jujubit-orange.svg'), surface: 'light', note: '首选版本 · 用于大多数品牌场景' },
  { id: 'black', name: '经典黑', english: 'SOLID BLACK', color: '#000000', file: asset('/assets/logo/jujubit-dark-lower.svg'), surface: 'light', note: '适用于浅色背景与单色印刷' },
  { id: 'gray', name: '柔和灰', english: 'SOFT GRAY', color: '#E8E8E8', file: asset('/assets/logo/jujubit-light.svg'), surface: 'dark', note: '适用于深色背景的低对比场景' },
  { id: 'white', name: '纯净白', english: 'PURE WHITE', color: '#FFFFFF', file: asset('/assets/logo/jujubit-dark-right.svg'), surface: 'dark', note: '适用于深色背景与品牌影像' },
];
const iconFigmaUrl = 'https://www.figma.com/design/pVvAxy9wIEWS6KONJ1KzoI/jujubit%E7%BB%84%E4%BB%B6%E5%BA%93?node-id=515-16620';
const iconRoundedFile = asset('/assets/app-icon/jujubit-rounded.svg');
const figmaUrl = 'https://www.figma.com/design/pVvAxy9wIEWS6KONJ1KzoI/jujubit%E7%BB%84%E4%BB%B6%E5%BA%93?node-id=515-5981';
function save(blob: Blob, name: string) { const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = name; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
async function svgText(logo: Logo) { const response = await fetch(logo.file); if (!response.ok) throw new Error('Logo 资源加载失败'); return response.text(); }
async function pngBlob(logo: Logo, scale: number) { const svg = await svgText(logo); const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })); try { const img = new window.Image(); img.src = url; await img.decode(); const canvas = document.createElement('canvas'); canvas.width = Math.round(483.868 * scale); canvas.height = Math.round(119.774 * scale); const context = canvas.getContext('2d'); if (!context) throw new Error('无法生成图片'); context.drawImage(img, 0, 0, canvas.width, canvas.height); return await new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('PNG 生成失败')), 'image/png')); } finally { URL.revokeObjectURL(url); } }

function withRadius(svg: string, percent: number) {
  const radius = percent === 22.33 ? 114.33 : Number((512 * percent / 100).toFixed(2));
  const oldRect = '<rect width="512" height="512" rx="114.33" fill="#FF5A11"/>';
  if (!svg.includes(oldRect)) throw new Error('图标源文件格式有误');
  return svg.replace(oldRect, `<rect width="512" height="512" rx="${radius}" fill="#FF5A11"/>`);
}
async function iconSvgText(radius: number) {
  const response = await fetch(iconRoundedFile);
  if (!response.ok) throw new Error('图标资源加载失败');
  const svg = await response.text();
  return withRadius(svg, radius);
}
async function iconPngBlob(svg: string, size: number) {
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const image = new window.Image(); image.src = url; await image.decode();
    const canvas = document.createElement('canvas'); canvas.width = size; canvas.height = size;
    const context = canvas.getContext('2d'); if (!context) throw new Error('无法生成图片');
    context.drawImage(image, 0, 0, size, size);
    return await new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('PNG 生成失败')), 'image/png'));
  } finally { URL.revokeObjectURL(url); }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(() => { const hash = window.location.hash.slice(1); return tabs.some(tab => tab.id === hash) ? hash as Tab : 'logos'; });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [background, setBackground] = useState<'auto' | 'light' | 'dark'>('auto');
  const [scale, setScale] = useState(2);
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);
  const [iconRadius, setIconRadius] = useState(22.33);
  const [iconSize, setIconSize] = useState(1024);
  const [customIconUrl, setCustomIconUrl] = useState(iconRoundedFile);
  useEffect(() => { const syncHash = () => { const hash = window.location.hash.slice(1); if (tabs.some(tab => tab.id === hash)) setActiveTab(hash as Tab); }; window.addEventListener('hashchange', syncHash); return () => window.removeEventListener('hashchange', syncHash); }, []);
  function switchTab(tab: Tab) { setActiveTab(tab); setMobileNavOpen(false); window.history.replaceState(null, '', `#${tab}`); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 2600); return () => clearTimeout(timer); }, [toast]);
  useEffect(() => {
    let active = true; let url = '';
    iconSvgText(iconRadius).then(svg => { if (!active) return; url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })); setCustomIconUrl(url); }).catch(() => {});
    return () => { active = false; if (url) URL.revokeObjectURL(url); };
  }, [iconRadius]);
  async function act(task: () => Promise<void>, success: string) { setBusy(true); try { await task(); setToast(success); } catch (error) { setToast(error instanceof Error ? error.message : '操作失败，请重试'); } finally { setBusy(false); } }
  function handleSvg(logo: Logo, mode: 'copy' | 'download') { act(async () => { const svg = await svgText(logo); if (mode === 'copy') await navigator.clipboard.writeText(svg); else save(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }), `JuJuBit-logo-${logo.id}.svg`); }, mode === 'copy' ? 'SVG 代码已复制' : 'SVG 已下载'); }
  function handlePng(logo: Logo, mode: 'copy' | 'download') { act(async () => { const png = await pngBlob(logo, scale); if (mode === 'copy') { if (!navigator.clipboard?.write || !window.ClipboardItem) throw new Error('当前浏览器不支持复制图片，请使用下载'); await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]); } else save(png, `JuJuBit-logo-${logo.id}@${scale}x.png`); }, mode === 'copy' ? 'PNG 图片已复制' : 'PNG 已下载'); }
  function handleIcon(format: 'svg' | 'png', mode: 'copy' | 'download') {
    act(async () => {
      const svg = await iconSvgText(iconRadius);
      const name = `JuJuBit-app-icon-radius-${iconRadius.toString().replace('.', '-')}`;
      if (format === 'svg') {
        if (mode === 'copy') await navigator.clipboard.writeText(svg);
        else save(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }), `${name}.svg`);
      } else {
        const png = await iconPngBlob(svg, iconSize);
        if (mode === 'copy') {
          if (!navigator.clipboard?.write || !window.ClipboardItem) throw new Error('当前浏览器不支持复制图片，请使用下载');
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]);
        } else save(png, `${name}-${iconSize}px.png`);
      }
    }, `${format.toUpperCase()} ${mode === 'copy' ? '已复制' : '已下载'}`);
  }
  return <div className={`library-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
    <aside className={`resource-sidebar ${mobileNavOpen ? 'mobile-open' : ''}`} aria-label="品牌资源导航">
      <div className="sidebar-head"><button className="sidebar-brand" onClick={() => switchTab('logos')} aria-label="JuJuBit 品牌资源首页"><img className="sidebar-logo-full" src={asset("/assets/logo/jujubit-official-logo.svg")} alt=""/><img className="sidebar-logo-compact" src={asset("/assets/app-icon/sidebar-icon.png")} alt=""/></button><span className="sidebar-subtitle">BRAND DESIGN SYSTEM</span></div>
      <nav className="resource-nav" aria-label="资源类别"><div className="nav-group-label">品牌资源</div>{tabs.map(tab => { const Icon = tab.icon; return <button key={tab.id} className={`nav-item ${activeTab === tab.id ? 'active' : ''}`} onClick={() => switchTab(tab.id)} aria-current={activeTab === tab.id ? 'page' : undefined} title={tab.label}><Icon size={18}/><span className="nav-item-text">{tab.label}<small>{tab.english}</small></span></button>; })}<div className="nav-divider"/><div className="nav-group-label">更多资源</div><div className="nav-future">持续更新中</div></nav>
      <div className="sidebar-bottom"><span>JUJUBIT © 2026</span><small>官方品牌资源</small></div>
      <button className="sidebar-collapse" onClick={() => setSidebarCollapsed(value => !value)} aria-label={sidebarCollapsed ? '展开侧边栏' : '折叠侧边栏'}>{sidebarCollapsed ? <ChevronRight size={17}/> : <ChevronLeft size={17}/>}</button>
    </aside>
    {mobileNavOpen && <button className="mobile-overlay" aria-label="关闭导航" onClick={() => setMobileNavOpen(false)}/>}
    <div className="workspace"><header className="workspace-topbar"><button className="mobile-menu" onClick={() => setMobileNavOpen(true)} aria-label="打开导航"><Menu size={22}/></button><div className="breadcrumb">品牌资源 <ChevronRight size={14}/> <strong>{tabs.find(tab => tab.id === activeTab)?.label}</strong></div><span className="topbar-right">JUJUBIT DESIGN SYSTEM <i/> V1.0</span></header>
      <main className={`workspace-main ${activeTab === 'font' ? 'font-main' : ''}`}>
        {activeTab === 'logos' && <div className="content-page"><div className="page-intro"><div className="eyebrow">JUJUBIT / BRAND ASSETS</div><h1>Logo <span>品牌标识</span></h1><p>从官方 Figma 设计稿导出的四款标准版本。选择合适的颜色，一键复制或下载 SVG、PNG 文件。</p><a className="source-link" href={figmaUrl} target="_blank" rel="noreferrer">查看 Logo 设计源文件 <ArrowUpRight size={15}/></a></div>
          <div className="control-bar"><div className="control-group"><span className="control-label"><Palette size={16}/> 预览背景</span><div className="segmented" role="group" aria-label="预览背景">{(['auto','light','dark'] as const).map((value, i) => <button key={value} className={background === value ? 'selected' : ''} onClick={() => setBackground(value)}>{['智能适配','浅色','深色'][i]}</button>)}</div></div><div className="control-group"><label className="control-label" htmlFor="png-size">PNG 尺寸</label><div className="select-wrap"><select id="png-size" value={scale} onChange={e => setScale(Number(e.target.value))}><option value={1}>1× · 484 × 120 px</option><option value={2}>2× · 968 × 240 px</option><option value={4}>4× · 1935 × 479 px</option></select><ChevronDown size={15}/></div></div></div>
          <div className="logo-grid">{logos.map((logo, index) => <article className="logo-card" key={logo.id}><div className={`logo-preview ${background === 'auto' ? logo.surface : background}`}><span className="preview-index">0{index + 1} / 04</span><img src={logo.file} alt={`JuJuBit ${logo.name} Logo`}/><span className="preview-caption">JUJUBIT® — OFFICIAL WORDMARK</span></div><div className="card-content"><div className="card-title"><div><div className="variant-label"><span className="color-swatch" style={{background: logo.color}}/> {logo.english}</div><h3>{logo.name}</h3></div><span className="file-badge">SVG / PNG</span></div><p>{logo.note}</p><div className="action-grid"><div className="action-row"><span className="format-name"><Layers3 size={16}/> SVG <small>矢量格式</small></span><button disabled={busy} onClick={() => handleSvg(logo,'copy')}><Clipboard size={14}/> 复制</button><button disabled={busy} onClick={() => handleSvg(logo,'download')}><Download size={14}/> 下载</button></div><div className="action-row"><span className="format-name"><Image size={16}/> PNG <small>{scale}× 尺寸</small></span><button disabled={busy} onClick={() => handlePng(logo,'copy')}><Clipboard size={14}/> 复制</button><button disabled={busy} onClick={() => handlePng(logo,'download')}><Download size={14}/> 下载</button></div></div></div></article>)}</div></div>}
        {activeTab === 'app-icons' && <div className="content-page"><div className="page-intro"><div className="eyebrow">JUJUBIT / BRAND ASSETS</div><h1>App Icon <span>应用图标</span></h1><p>适用于应用、社交账号和移动端入口。拖动滑块调节圆角，复制或下载当前设置下的文件。</p><a className="source-link" href={iconFigmaUrl} target="_blank" rel="noreferrer">查看 App Icon 设计源文件 <ArrowUpRight size={15}/></a></div>
          <div className="icon-layout"><div className="icon-stage"><div className="icon-stage-head"><span>LIVE PREVIEW / 01</span><span>{iconRadius === 22.33 ? '22.33' : iconRadius}% CORNER RADIUS</span></div><div className="icon-preview-main"><img src={customIconUrl} alt={`JuJuBit 可调圆角 App Icon，圆角 ${iconRadius}%`}/></div><div className="icon-stage-foot"><span>512 × 512 SOURCE</span><span>VECTOR MASTER</span></div></div><div className="icon-panel"><div className="icon-panel-heading"><span className="variant-label">CUSTOMIZE / EXPORT</span><h2>可调圆角</h2><p>实时预览。导出的 SVG 与 PNG 会应用当前圆角，背景保持透明。</p></div><div className="radius-control"><div className="radius-label"><label htmlFor="icon-radius">圆角比例</label><strong>{iconRadius === 22.33 ? '22.33' : iconRadius}%</strong></div><input id="icon-radius" type="range" min="0" max="50" step="1" value={iconRadius} onChange={e => setIconRadius(Number(e.target.value))} style={{'--range-progress': `${iconRadius * 2}%`} as React.CSSProperties}/><div className="radius-presets"><button className={iconRadius === 0 ? 'selected' : ''} onClick={() => setIconRadius(0)}>直角 0%</button><button className={iconRadius === 22.33 ? 'selected' : ''} onClick={() => setIconRadius(22.33)}>设计原版</button><button className={iconRadius === 50 ? 'selected' : ''} onClick={() => setIconRadius(50)}>圆形 50%</button></div></div><div className="icon-size-control"><label className="control-label" htmlFor="icon-size">PNG 尺寸</label><div className="select-wrap"><select id="icon-size" value={iconSize} onChange={e => setIconSize(Number(e.target.value))}><option value={512}>512 × 512 px</option><option value={1024}>1024 × 1024 px</option><option value={2048}>2048 × 2048 px</option></select><ChevronDown size={15}/></div></div><div className="icon-actions"><div className="action-row"><span className="format-name"><Layers3 size={16}/> SVG <small>矢量格式</small></span><button disabled={busy} onClick={() => handleIcon('svg','copy')}><Clipboard size={14}/> 复制</button><button disabled={busy} onClick={() => handleIcon('svg','download')}><Download size={14}/> 下载</button></div><div className="action-row"><span className="format-name"><Image size={16}/> PNG <small>{iconSize}px</small></span><button disabled={busy} onClick={() => handleIcon('png','copy')}><Clipboard size={14}/> 复制</button><button disabled={busy} onClick={() => handleIcon('png','download')}><Download size={14}/> 下载</button></div></div></div></div>
</div>}
        {activeTab === 'font' && <div className="font-frame-wrap"><iframe className="font-frame" title="JuJuBit Instrument Sans 字体规范" src={asset("/typography/index.html")}/></div>}
      </main>
    </div>{toast && <div className="toast" role="status"><Check size={16}/> {toast}</div>}
  </div>;
}
