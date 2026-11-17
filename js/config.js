import { parseDate, formatMonth, describeSpan, formatDuration, monthsBetween, titleCase } from './dates.js';

export const DEFAULT_SETTINGS = {
  config: 'configurables/config.json',
  branding: {
    siteTitle: null,
    favicon: null,
    theme: 'auto',
    fonts: { body: 'Inter', heading: 'Newsreader' },
    colors: {
      primary: '#14284b',
      accent: '#8a6a2b',
      ink: '#0b1424',
      background: '#f3f4f6',
      surface: '#ffffff',
      text: '#171e2e',
      muted: '#586174',
      dark: {
        primary: '#9db8ee',
        accent: '#d2b36f',
        ink: '#060b14',
        background: '#0c121d',
        surface: '#131a28',
        text: '#e8ebf2',
        muted: '#9aa4b8',
      },
    },
    hero: 'gradient',
    heroImage: null,
    footer: null,
    cta: null,
    cvButton: 'Download CV (PDF)',
    card: true,
    expandedRoles: 2,
    sections: {
      stats: true, featured: true, proofPoints: true, principles: true, skills: true,
      charts: true, experience: true, education: true, references: true,
    },
    chartPalette: ['#14284b', '#8a6a2b', '#2f7f79', '#7a3b52', '#4b6a9b', '#b4883a', '#3c5a46', '#6b4f9e', '#9b4a3a', '#5d6678'],
  },
};

const isObject = (v) => v && typeof v === 'object' && !Array.isArray(v);

export function merge(base, override) {
  if (!isObject(override)) return override === undefined ? base : override;
  const out = { ...base };
  for (const key of Object.keys(override)) {
    out[key] = isObject(base?.[key]) ? merge(base[key], override[key]) : override[key];
  }
  return out;
}

async function loadJson(url) {
  const response = await fetch(url, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`Could not load ${url} (${response.status})`);
  return response.json();
}

export async function loadSettings() {
  let custom = {};
  try {
    custom = await loadJson('configurables/settings.json');
  } catch (err) {
    console.warn('No settings.json found, using defaults.', err);
  }
  const settings = merge(DEFAULT_SETTINGS, custom);
  const override = new URLSearchParams(window.location.search).get('config');
  if (override) settings.config = override;
  return settings;
}

export async function loadResume(settings) {
  return normalise(await loadJson(settings.config), settings.branding);
}

function normaliseGroup(entries, organisations, listKey) {
  return entries.map((entry) => {
    const org = organisations[entry.organisation] || {};
    if (!organisations[entry.organisation]) console.warn(`Organisation not defined: ${entry.organisation}`);
    const items = (entry[listKey] || []).map((item) => ({
      ...item,
      blurb: item.blurb || [],
      responsibilities: item.responsibilities || [],
      achievements: item.achievements || [],
      period: describeSpan(item.span),
    }));
    const starts = items.map((i) => i.period.start).filter(Boolean);
    const ends = items.map((i) => i.period.effectiveEnd);
    const start = starts.length ? new Date(Math.min(...starts)) : null;
    const end = ends.length ? new Date(Math.max(...ends)) : new Date();
    const current = items.some((i) => i.period.current);
    const months = start ? monthsBetween(start, end) : 0;
    return {
      ...org,
      ...entry,
      blurb: org.blurb || [],
      icon: org.icon || 'img/orgLogo.png',
      [listKey]: items.sort((a, b) => b.period.effectiveEnd - a.period.effectiveEnd || b.period.start - a.period.start),
      period: {
        start,
        end,
        current,
        months,
        label: start ? `${formatMonth(start)} – ${current ? 'Present' : formatMonth(end)}` : '',
        duration: formatDuration(months),
      },
    };
  });
}

export function normalise(raw, branding) {
  const palette = branding.chartPalette;
  const organisations = raw.organisations || {};
  Object.keys(organisations).forEach((name, i) => {
    organisations[name].color = palette[i % palette.length];
  });

  const experiences = normaliseGroup(raw.experiences || [], organisations, 'positions')
    .sort((a, b) => b.period.end - a.period.end || b.period.start - a.period.start);
  const educations = normaliseGroup(raw.educations || [], organisations, 'certifications')
    .sort((a, b) => b.period.end - a.period.end);
  educations.forEach((org) => org.certifications.forEach((c) => { c.qualification = titleCase(c.qualification); }));

  const references = (raw.references || [])
    .map((ref) => {
      const date = parseDate(ref.author.date);
      return { ...ref, author: { ...ref.author, date, friendlyDate: date ? formatMonth(date) : '' } };
    })
    .sort((a, b) => b.author.date - a.author.date);

  const allStarts = experiences.map((e) => e.period.start).filter(Boolean);
  const careerStart = allStarts.length ? new Date(Math.min(...allStarts)) : new Date();
  const years = Math.floor(monthsBetween(careerStart, new Date()) / 12);

  const overview = raw.overview || { title: 'Overview', blurb: [] };
  overview.blurb = overview.blurb.map((p) => p.replaceAll('{{years}}', years));

  const bio = { ...raw.bio, first: titleCase(raw.bio.first), last: titleCase(raw.bio.last), image: raw.bio.image || 'img/profilePic.png' };

  return {
    bio,
    overview,
    experiences,
    educations,
    references,
    organisations,
    featured: raw.featured,
    principles: raw.principles,
    proofPoints: raw.proofPoints,
    talks: raw.talks,
    skills: raw.skills,
    stats: bio.highlights || [
      { value: years, label: 'Years in tech' },
      { value: experiences.length, label: 'Organisations' },
      { value: educations.reduce((n, o) => n + o.certifications.length, 0), label: 'Qualifications' },
      { value: references.length, label: 'Endorsements' },
    ],
  };
}
