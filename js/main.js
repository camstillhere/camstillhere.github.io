import { loadSettings, loadResume } from './config.js';
import { applyBranding, toggleTheme } from './branding.js';
import {
  renderHero, renderOverview, renderFeatured, renderReferences, renderProofPoints, renderPrinciples,
  renderSkills, renderExperience, renderEducation, renderFooter,
} from './render.js';
import { renderCharts } from './charts.js';
import { el } from './render.js';

function observeReveals() {
  const targets = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { targets.forEach((t) => t.classList.add('visible')); return; }
  const observer = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
  }), { threshold: 0.12 });
  targets.forEach((t) => observer.observe(t));
}

function setupNav() {
  const links = [...document.querySelectorAll('.topbar nav a')].filter((a) => !a.hidden);
  const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const link = byId.get(entry.target.id);
    links.forEach((l) => l.removeAttribute('aria-current'));
    link.setAttribute('aria-current', 'true');
    const nav = link.parentElement;
    nav.scrollTo({ left: link.offsetLeft - (nav.clientWidth - link.clientWidth) / 2, behavior: 'smooth' });
  }), { rootMargin: '-30% 0px -65% 0px' });
  byId.forEach((_, id) => { const section = document.getElementById(id); if (section && !section.hidden) observer.observe(section); });
}

function setupDock(resume, branding) {
  const email = resume.bio.contact?.email?.[0];
  const actions = [
    branding.cta && el('a', { class: 'button primary', href: branding.cta.href, target: '_blank', rel: 'noopener', text: branding.cta.label }),
    email && el('a', { class: 'button ghost', href: `mailto:${email.content}`, text: 'Email' }),
  ].filter(Boolean);
  if (!actions.length) return;
  const dock = el('div', { class: 'dock', 'aria-label': 'Quick contact' }, actions);
  document.body.append(dock);
  new IntersectionObserver(([entry]) => dock.classList.toggle('show', !entry.isIntersecting)).observe(document.getElementById('hero'));
}

function setupControls(resume) {
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  document.querySelectorAll('#printButton, [data-print]').forEach((b) => b.addEventListener('click', () => window.print()));

  const pageTitle = document.title;
  window.addEventListener('beforeprint', () => { document.title = `${resume.bio.first} ${resume.bio.last} - CV`; });
  window.addEventListener('afterprint', () => { document.title = pageTitle; });
  document.addEventListener('themechange', () => renderCharts(resume));
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => renderCharts(resume));

  let reopen = [];
  window.addEventListener('beforeprint', () => {
    reopen = [...document.querySelectorAll('details:not([open])')];
    reopen.forEach((d) => { d.open = true; });
  });
  window.addEventListener('afterprint', () => reopen.forEach((d) => { d.open = false; }));
}

async function start() {
  try {
    const settings = await loadSettings();
    const resume = await loadResume(settings);
    const { branding } = settings;
    const show = branding.sections;
    applyBranding(branding, resume);

    renderHero(resume, branding);
    renderOverview(resume);

    const sections = {
      featured: renderFeatured,
      references: renderReferences,
      proofPoints: renderProofPoints,
      principles: renderPrinciples,
      skills: renderSkills,
      experience: (r) => renderExperience(r, branding),
      education: renderEducation,
    };
    Object.entries(sections).forEach(([key, render]) => {
      const dataKey = { experience: 'experiences', education: 'educations' }[key] || key;
      const hasData = Array.isArray(resume[dataKey]) ? resume[dataKey].length : resume[dataKey];
      const section = document.getElementById(key);
      if (show[key] && hasData) render(resume);
      else section.hidden = true;
      const nav = document.getElementById(`nav-${key}`);
      if (nav) nav.hidden = section.hidden;
    });

    renderFooter(branding, resume);
    document.getElementById('stats').hidden = !show.stats;
    document.getElementById('charts').hidden = !show.charts;
    document.body.classList.add('ready');

    setupControls(resume);
    if (show.charts) renderCharts(resume);
    observeReveals();
    setupNav();
    setupDock(resume, branding);
  } catch (err) {
    console.error(err);
    const box = document.getElementById('error');
    box.hidden = false;
    box.textContent = `Could not load the résumé: ${err.message}`;
  }
}

start();
