import { cssUrl } from './render.js';

const VARIABLES = ['primary', 'accent', 'background', 'surface', 'text', 'muted'];

function cssRule(selector, colors) {
  const lines = VARIABLES.filter((k) => colors[k]).map((k) => `--${k}: ${colors[k]};`);
  return `${selector} { ${lines.join(' ')} }`;
}

function loadFonts({ body, heading }) {
  const families = [...new Set([body, heading].filter(Boolean))];
  const query = families.map((f) => `family=${encodeURIComponent(f).replace(/%20/g, '+')}:wght@400;500;600;700`).join('&');
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?${query}&display=swap`;
  document.head.appendChild(link);
  const style = document.createElement('style');
  style.textContent = `:root { --font-body: '${body}', system-ui, sans-serif; --font-heading: '${heading || body}', system-ui, sans-serif; }`;
  document.head.appendChild(style);
}

export function applyBranding(branding, resume) {
  const { colors, fonts, theme } = branding;
  const { dark, ...light } = colors;
  const style = document.createElement('style');
  style.textContent = [
    cssRule(':root', light),
    cssRule(':root[data-theme="dark"]', dark),
    `@media (prefers-color-scheme: dark) { ${cssRule(':root:not([data-theme="light"])', dark)} }`,
  ].join('\n');
  document.head.appendChild(style);
  loadFonts(fonts);

  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch { /* storage unavailable */ }
  const initial = saved || (theme !== 'auto' ? theme : null);
  if (initial) document.documentElement.dataset.theme = initial;

  document.title = branding.siteTitle || `${resume.bio.first} ${resume.bio.last}`;
  if (branding.favicon) {
    const icon = document.querySelector('link[rel="icon"]') || document.head.appendChild(Object.assign(document.createElement('link'), { rel: 'icon' }));
    icon.href = branding.favicon;
  }
  document.documentElement.dataset.hero = branding.hero;
  if (branding.heroImage) document.documentElement.style.setProperty('--hero-image', cssUrl(branding.heroImage));
}

export function isDark() {
  const explicit = document.documentElement.dataset.theme;
  return explicit ? explicit === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function toggleTheme() {
  const next = isDark() ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch { /* storage unavailable */ }
  document.dispatchEvent(new CustomEvent('themechange'));
}
