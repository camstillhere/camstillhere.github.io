import { loadSettings, loadResume } from './config.js';
import { applyBranding, toggleTheme } from './branding.js';
import { renderHero, renderOverview, renderPrinciples, renderProofPoints, renderSkills, renderExperience, renderEducation, renderReferences, renderFooter } from './render.js';
import { renderCharts } from './charts.js';

function countUp(node) {
  const target = Number(node.dataset.count);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || target === 0) { node.textContent = target; return; }
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min((now - start) / 1100, 1);
    node.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function observeReveals() {
  const targets = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { targets.forEach((t) => t.classList.add('visible')); return; }
  const observer = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
  }), { threshold: 0.08 });
  targets.forEach((t) => observer.observe(t));
}

function setupControls(resume) {
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  document.getElementById('printButton').addEventListener('click', () => window.print());
  document.addEventListener('themechange', () => renderCharts(resume));
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => renderCharts(resume));
  document.querySelectorAll('[data-detail]').forEach((button) => button.addEventListener('click', () => {
    document.body.dataset.detail = button.dataset.detail;
    document.querySelectorAll('[data-detail]').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
  }));
}

async function start() {
  try {
    const settings = await loadSettings();
    const resume = await loadResume(settings);
    const { branding } = settings;
    applyBranding(branding, resume);

    const show = branding.sections;
    renderHero(resume, branding);
    renderOverview(resume);
    const extras = { principles: renderPrinciples, proofPoints: renderProofPoints, skills: renderSkills };
    Object.entries(extras).forEach(([key, render]) => {
      if (show[key] && resume[key]) render(resume);
      else document.getElementById(key).hidden = true;
    });
    if (show.experience) renderExperience(resume);
    if (show.education) renderEducation(resume);
    if (show.references) renderReferences(resume);
    renderFooter(branding, resume);

    document.body.dataset.detail = branding.defaultDetail;
    document.querySelectorAll('[data-detail]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.detail === String(branding.defaultDetail))));
    document.querySelector('.segmented').hidden = !branding.detailSwitcher;
    document.getElementById('stats').hidden = !show.stats;
    document.getElementById('charts').hidden = !show.charts;
    ['experience', 'education', 'references'].forEach((id) => { document.getElementById(`nav-${id}`).hidden = !show[id]; });
    document.body.classList.add('ready');

    setupControls(resume);
    if (show.charts) renderCharts(resume);
    if (show.stats) document.querySelectorAll('[data-count]').forEach(countUp);
    observeReveals();
  } catch (err) {
    console.error(err);
    document.getElementById('error').hidden = false;
    document.getElementById('error').textContent = `Could not load the résumé: ${err.message}`;
  }
}

start();
