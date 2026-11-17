const SAFE_LINK = /^(https?:|mailto:|tel:)/i;

export function cssUrl(value) {
  const href = new URL(value, window.location.href).href;
  return `url("${href.replace(/["\\]/g, encodeURIComponent)}")`;
}

const ICONS = {
  email: 'M3 5h18v14H3zM3 7l9 6 9-6',
  linkedIn: 'M4 9h4v11H4zM6 4a2 2 0 110 4 2 2 0 010-4zM10 9h4v2c.8-1.4 2.200-2.200 4-2.200 3 0 4 2 4 5V20h-4v-5.500c0-1.500-.5-2.500-2-2.500s-2 1-2 2.500V20h-4z',
  github: 'M9 19c-4 1.500-4-2-6-2m12 4v-3.500c0-1 .1-1.400-.5-2 2.800-.3 5.500-1.400 5.500-6a4.600 4.600 0 00-1.300-3.200 4.200 4.200 0 00-.1-3.200s-1.100-.3-3.500 1.300a12.300 12.300 0 00-6.200 0C6.500 2.800 5.400 3.100 5.400 3.100a4.200 4.200 0 00-.1 3.200A4.600 4.600 0 004 9.500c0 4.600 2.700 5.700 5.500 6-.6.600-.6 1.200-.5 2V21',
  website: 'M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c2.500 2.500 3.500 5.500 3.500 9s-1 6.500-3.500 9c-2.500-2.500-3.500-5.500-3.500-9S9.500 5.500 12 3z',
  phone: 'M5 4h4l2 5-2.500 1.500a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z',
};

export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null || value === false) continue;
    if (key === 'text') node.textContent = value;
    else if (key === 'class') node.className = value;
    else if (key === 'style') Object.assign(node.style, value);
    else if (key === 'href') node.href = SAFE_LINK.test(value) ? value : '#';
    else node.setAttribute(key, value);
  }
  [].concat(children).filter(Boolean).forEach((c) => node.append(c));
  return node;
}

function icon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', ICONS[name] || ICONS.website);
  svg.append(path);
  return svg;
}

const list = (items, className) => (items.length ? el('ul', { class: className }, items.map((t) => el('li', { text: t }))) : null);

export function renderHero(resume) {
  const { bio, stats } = resume;
  const contacts = Object.entries(bio.contact || {}).flatMap(([type, entries]) =>
    entries.map((entry) => {
      const href = type === 'email' ? `mailto:${entry.content}` : type === 'phone' ? `tel:${entry.content.replace(/\s/g, '')}` : entry.content;
      return el('li', {}, el('a', { href, class: 'chip', rel: 'noopener', target: type === 'email' || type === 'phone' ? null : '_blank' }, [icon(type), el('span', { text: entry.title })]));
    }));

  document.getElementById('hero').append(
    el('div', { class: 'hero-inner' }, [
      el('div', { class: 'portrait', style: { backgroundImage: cssUrl(bio.image) }, role: 'img', 'aria-label': `${bio.first} ${bio.last}` }),
      el('div', { class: 'hero-text' }, [
        el('p', { class: 'eyebrow', text: bio.title }),
        el('h1', {}, [el('span', { text: bio.first }), ' ', el('span', { class: 'surname', text: bio.last })]),
        bio.tagline && el('p', { class: 'tagline', text: bio.tagline }),
        el('ul', { class: 'contacts' }, contacts),
      ]),
    ]),
  );

  const statDefs = [
    [stats.years, 'Years in tech'],
    [stats.organisations, 'Organisations'],
    [stats.certifications, 'Qualifications'],
    [stats.references, 'Endorsements'],
  ];
  document.getElementById('stats').append(
    ...statDefs.map(([value, label]) => el('div', { class: 'stat' }, [el('strong', { 'data-count': value, text: '0' }), el('span', { text: label })])),
  );
}

export function renderOverview({ overview }) {
  const section = document.getElementById('overview');
  section.append(el('h2', { text: overview.title }), ...overview.blurb.map((p) => el('p', { text: p })));
}

function renderPosition(position) {
  return el('article', { class: 'position' }, [
    el('header', {}, [
      el('h4', { text: position.title }),
      el('p', { class: 'dates', text: `${position.period.label} · ${position.period.duration}` }),
    ]),
    el('div', { class: 'detail detail-1' }, position.blurb.map((p) => el('p', { text: p }))),
    position.achievements.length > 0 && el('div', { class: 'detail detail-2' }, [el('h5', { text: 'Achievements' }), list(position.achievements, 'points')]),
    position.responsibilities.length > 0 && el('div', { class: 'detail detail-3' }, [el('h5', { text: 'Responsibilities' }), list(position.responsibilities, 'points')]),
  ]);
}

export function renderExperience({ experiences }) {
  const timeline = el('div', { class: 'timeline' });
  experiences.forEach((org) => {
    timeline.append(
      el('section', { class: `org reveal${org.period.current ? ' current' : ''}`, style: { '--org-color': org.color } }, [
        el('a', { class: 'org-header', href: org.link, target: '_blank', rel: 'noopener', title: org.blurb.join('\n\n') }, [
          el('span', { class: 'logo', style: { backgroundImage: cssUrl(org.icon) } }),
          el('span', { class: 'org-title' }, [el('h3', { text: org.organisation }), el('span', { text: `${org.period.label} · ${org.period.duration}` })]),
        ]),
        el('div', { class: 'positions' }, org.positions.map(renderPosition)),
      ]),
    );
  });
  document.getElementById('experience').append(el('h2', { text: 'Experience' }), timeline);
}

export function renderEducation({ educations }) {
  const grid = el('div', { class: 'cards' });
  educations.forEach((org) => org.certifications.forEach((cert) => {
    grid.append(
      el('article', { class: 'card reveal', style: { '--org-color': org.color } }, [
        el('a', { class: 'org-header', href: org.link, target: '_blank', rel: 'noopener', title: org.blurb.join('\n\n') }, [
          el('span', { class: 'logo', style: { backgroundImage: cssUrl(org.icon) } }),
          el('span', { class: 'org-title' }, [el('h3', { text: org.organisation }), el('span', { text: cert.period.end ? String(cert.period.end.getFullYear()) : '' })]),
        ]),
        el('p', { class: 'qualification', text: cert.qualification }),
        el('h4', { text: cert.title }),
        el('div', { class: 'detail detail-1' }, cert.blurb.map((t) => (/^https?:\/\//.test(t) ? el('p', {}, el('a', { href: t, target: '_blank', rel: 'noopener', text: t })) : el('p', { text: t })))),
      ]),
    );
  }));
  document.getElementById('education').append(el('h2', { text: 'Education & certification' }), grid);
}

export function renderReferences({ references }) {
  const grid = el('div', { class: 'quotes' });
  references.forEach((ref) => grid.append(
    el('figure', { class: 'quote reveal' }, [
      el('blockquote', { text: ref.blurb }),
      el('figcaption', {}, [el('strong', { text: ref.author.name }), el('span', { text: `${ref.author.position}, ${ref.author.organisation}` }), el('time', { text: ref.author.friendlyDate })]),
    ]),
  ));
  document.getElementById('references').append(el('h2', { text: 'What people say' }), grid);
}

export function renderFooter(branding, resume) {
  const year = new Date().getFullYear();
  document.getElementById('footer').append(
    el('p', { text: `© ${year} ${resume.bio.first} ${resume.bio.last}` }),
    branding.footer && el('p', { text: branding.footer }),
  );
}
