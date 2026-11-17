import { el, icon, cssUrl } from './render.js';
import { buildVCard, portraitData, saveVCard } from './vcard.js';

const QR_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js';
const QR_INTEGRITY = 'sha384-mZT2gIty7ZDdOGkxfP6joZcYdMW1Jvj9dRlfpTmaJAKKXTqzygtB22k7FLe+KZC1';
const SVG = 'http://www.w3.org/2000/svg';

let qrLoading;
function loadQr() {
  if (window.qrcode) return Promise.resolve();
  qrLoading ||= new Promise((resolve, reject) => {
    const script = Object.assign(document.createElement('script'), { src: QR_SRC, integrity: QR_INTEGRITY, crossOrigin: 'anonymous' });
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });
  return qrLoading;
}

async function qrElement(text) {
  await loadQr();
  const qr = window.qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  const count = qr.getModuleCount();
  let path = '';
  for (let r = 0; r < count; r += 1) {
    for (let c = 0; c < count; c += 1) if (qr.isDark(r, c)) path += `M${c} ${r}h1v1h-1z`;
  }
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', `-2 -2 ${count + 4} ${count + 4}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'QR code linking to this page');
  const shape = document.createElementNS(SVG, 'path');
  shape.setAttribute('d', path);
  shape.setAttribute('fill', '#0b1424');
  svg.append(shape);
  return svg;
}

function addTilt(card) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const set = (event) => {
    const box = card.getBoundingClientRect();
    const x = Math.min(Math.max((event.clientX - box.left) / box.width, 0), 1);
    const y = Math.min(Math.max((event.clientY - box.top) / box.height, 0), 1);
    card.style.setProperty('--ry', `${(x - 0.5) * 12}deg`);
    card.style.setProperty('--rx', `${(0.5 - y) * 9}deg`);
    card.style.setProperty('--mx', `${x * 100}%`);
    card.style.setProperty('--my', `${y * 100}%`);
  };
  const reset = () => ['--rx', '--ry', '--mx', '--my'].forEach((p) => card.style.removeProperty(p));
  card.addEventListener('pointermove', set);
  card.addEventListener('pointerdown', set);
  card.addEventListener('pointerup', reset);
  card.addEventListener('pointercancel', reset);
  card.addEventListener('pointerleave', reset);
}

function addSwipeToClose(dialog, handle) {
  let startY = null;
  handle.addEventListener('touchstart', (e) => { startY = e.touches[0].clientY; dialog.style.transition = 'none'; }, { passive: true });
  handle.addEventListener('touchmove', (e) => {
    if (startY === null) return;
    dialog.style.transform = `translateY(${Math.max(0, e.touches[0].clientY - startY)}px)`;
  }, { passive: true });
  handle.addEventListener('touchend', (e) => {
    if (startY === null) return;
    const dy = e.changedTouches[0].clientY - startY;
    startY = null;
    dialog.style.transition = '';
    dialog.style.transform = '';
    if (dy > 90) dialog.close();
  });
}

export function setupCard(resume, branding) {
  if (!branding.card) return;
  const { bio } = resume;
  const pageUrl = document.querySelector('link[rel="canonical"]')?.href || window.location.href.split(/[?#]/)[0];
  const fullName = `${bio.first} ${bio.last}`;
  let dialog;
  let status;

  const say = (message) => { if (status) status.textContent = message; };

  async function save() {
    say('Preparing contact…');
    const photo = await portraitData(new URL(bio.image, window.location.href).href);
    saveVCard(buildVCard(resume, { url: pageUrl, photo }), `${bio.first}-${bio.last}.vcf`);
    say('Contact file ready. Open it to add me to your contacts.');
  }

  async function share() {
    const data = { title: fullName, text: `${fullName}: ${bio.title}`, url: pageUrl };
    if (navigator.share) {
      try { await navigator.share(data); } catch { /* dismissed by the user */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(pageUrl);
      say('Link copied.');
    } catch {
      say(pageUrl);
    }
  }

  async function build() {
    status = el('p', { class: 'sheet-status', role: 'status', 'aria-live': 'polite' });
    const qrBox = el('div', { class: 'qr' });
    const card = el('article', { class: 'bizcard' }, [
      el('div', { class: 'bizcard-head' }, [
        el('div', { class: 'bizcard-photo', style: { backgroundImage: cssUrl(bio.image) }, role: 'img', 'aria-label': fullName }),
        el('div', {}, [el('h2', { text: fullName }), el('p', { class: 'bizcard-title', text: bio.title })]),
      ]),
      bio.location && el('p', { class: 'bizcard-meta', text: bio.location }),
      bio.tagline && el('p', { class: 'bizcard-tagline', text: bio.tagline }),
      el('div', { class: 'bizcard-foot' }, [
        qrBox,
        el('p', { class: 'qr-caption', text: 'Scan to open this page on another phone' }),
      ]),
    ]);
    addTilt(card);

    const linkedIn = bio.contact?.linkedIn?.[0];
    const email = bio.contact?.email?.[0];
    const grab = el('div', { class: 'sheet-grab', 'aria-hidden': 'true' }, el('span'));
    const close = el('button', { class: 'sheet-close', type: 'button', 'aria-label': 'Close card', text: '×' });
    const actions = el('div', { class: 'sheet-actions' }, [
      el('button', { class: 'button primary', type: 'button', 'data-action': 'save', text: 'Save to contacts' }),
      el('button', { class: 'button ghost', type: 'button', 'data-action': 'share', text: navigator.share ? 'Share' : 'Copy link' }),
      linkedIn && el('a', { class: 'button ghost', href: linkedIn.content, target: '_blank', rel: 'noopener', text: 'LinkedIn' }),
      email && el('a', { class: 'button ghost', href: `mailto:${email.content}`, text: 'Email' }),
    ]);

    dialog = el('dialog', { class: 'card-sheet', 'aria-label': `${fullName} digital card` }, [grab, close, card, actions, status]);
    actions.querySelector('[data-action="save"]').addEventListener('click', save);
    actions.querySelector('[data-action="share"]').addEventListener('click', share);
    close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => { document.body.classList.remove('sheet-open'); say(''); });
    addSwipeToClose(dialog, grab);
    document.body.append(dialog);

    qrElement(pageUrl).then((svg) => qrBox.append(svg)).catch(() => qrBox.closest('.bizcard-foot')?.remove());
  }

  async function open() {
    if (!dialog) await build();
    document.body.classList.add('sheet-open');
    dialog.showModal();
  }

  const trigger = (className, label) => el('button', { class: className, type: 'button', 'aria-label': label }, icon('card'));
  const heroTrigger = trigger('card-trigger', 'Open digital business card');
  document.querySelector('.meta')?.append(el('li', { class: 'card' }, heroTrigger));
  heroTrigger.addEventListener('click', open);
  const dock = document.querySelector('.dock');
  if (dock) {
    const dockTrigger = trigger('button ghost dock-card', 'Open digital business card');
    dockTrigger.addEventListener('click', open);
    dock.append(dockTrigger);
  }
}
