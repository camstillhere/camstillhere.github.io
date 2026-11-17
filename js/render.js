const SAFE_LINK = /^(https?:|mailto:|tel:)/i;
const SVG = 'http://www.w3.org/2000/svg';

const ICONS = {
  email: 'M3 5h18v14H3zM3 7l9 6 9-6',
  linkedIn: 'M4 9h4v11H4zM6 4a2 2 0 110 4 2 2 0 010-4zM10 9h4v2c.8-1.4 2.2-2.2 4-2.2 3 0 4 2 4 5V20h-4v-5.5c0-1.5-.5-2.5-2-2.5s-2 1-2 2.5V20h-4z',
  github: 'M9 19c-4 1.5-4-2-6-2m12 4v-3.5c0-1 .1-1.4-.5-2 2.800-.3 5.500-1.400 5.500-6a4.600 4.600 0 00-1.300-3.200 4.200 4.200 0 00-.1-3.200s-1.100-.3-3.500 1.300a12.300 12.300 0 00-6.200 0C6.500 2.800 5.400 3.100 5.400 3.100a4.200 4.200 0 00-.1 3.200A4.600 4.600 0 004 9.500c0 4.600 2.700 5.700 5.500 6-.6.600-.6 1.200-.5 2V21',
  website: 'M12 3a9 9 0 100 18 9 9 0 000-18zM3 12h18M12 3c2.500 2.500 3.500 5.500 3.500 9s-1 6.500-3.500 9c-2.500-2.500-3.500-5.500-3.500-9S9.500 5.500 12 3z',
  location: 'M12 21s7-6 7-11a7 7 0 10-14 0c0 5 7 11 7 11zM12 12a2 2 0 100-4 2 2 0 000 4z',
  phone: 'M5 4h4l2 5-2.500 1.500a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z',
};

export function cssUrl(value) {
  const href = new URL(value, window.location.href).href;
  return `url("${href.replace(/["\\]/g, encodeURIComponent)}")`;
}

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
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(SVG, 'path');
  path.setAttribute('d', ICONS[name] || ICONS.website);
  svg.append(path);
  return svg;
}

const list = (items, className) => (items.length ? el('ul', { class: className }, items.map((t) => el('li', { text: t }))) : null);

function shell(id, kicker, title, stacked = false) {
  const content = el('div', { class: 'content' });
  document.getElementById(id).append(
    el('div', { class: `wrap block-grid${stacked ? ' stacked' : ''}` }, [
      el('header', { class: 'block-head' }, [el('p', { class: 'kicker', text: kicker }), el('h2', { text: title })]),
      content,
    ]),
  );
  return content;
}

export function renderHero(resume, branding) {
  const { bio, stats } = resume;
  const links = Object.entries(bio.contact || {}).flatMap(([type, entries]) =>
    entries.map((entry) => {
      const href = type === 'email' ? `mailto:${entry.content}` : type === 'phone' ? `tel:${entry.content.replace(/\s/g, '')}` : entry.content;
      return el('li', {}, el('a', { href, rel: 'noopener', target: type === 'email' || type === 'phone' ? null : '_blank' }, [icon(type), el('span', { text: entry.title })]));
    }));
  if (bio.location) links.unshift(el('li', { class: 'static' }, [icon('location'), el('span', { text: bio.location })]));

  const email = bio.contact?.email?.[0];
  const actions = [
    branding.cta && el('a', { class: 'button primary', href: branding.cta.href, target: '_blank', rel: 'noopener', text: branding.cta.label }),
    email && el('a', { class: 'button ghost', href: `mailto:${email.content}`, text: 'Send an email' }),
    branding.cvButton && el('button', { class: 'button ghost', type: 'button', 'data-print': '', text: branding.cvButton }),
  ];

  document.getElementById('heroGrid').append(
    el('div', { class: 'hero-text' }, [
      el('p', { class: 'eyebrow', text: bio.title }),
      el('h1', {}, [el('span', { text: bio.first }), ' ', el('span', { class: 'surname', text: bio.last })]),
      bio.tagline && el('p', { class: 'tagline', text: bio.tagline }),
      el('div', { class: 'actions' }, actions),
      el('ul', { class: 'meta' }, links),
    ]),
    el('div', { class: 'portrait', style: { backgroundImage: cssUrl(bio.image) }, role: 'img', 'aria-label': `${bio.first} ${bio.last}` }),
  );

  document.getElementById('stats').append(
    ...stats.map(({ value, label }) => el('div', { class: 'stat' }, [el('strong', { text: String(value) }), el('span', { text: label })])),
  );
  document.getElementById('wordmark').textContent = `${bio.first} ${bio.last}`;
}

export function renderOverview({ overview }) {
  const [lead, ...rest] = overview.blurb;
  const content = shell('overview', 'Profile', overview.title);
  content.append(el('p', { class: 'lead', text: lead }), ...rest.map((p) => el('p', { text: p })));
}

export function renderFeatured({ featured }) {
  const { before, after } = featured;
  const max = Math.max(before.value, after.value);
  const bar = (item, kind) => el('div', { class: `bar-row ${kind}` }, [
    el('div', { class: 'bar-label' }, [el('span', { text: item.label }), el('strong', { text: item.display })]),
    el('div', { class: 'bar-track' }, el('div', { class: 'bar-fill', style: { '--w': `${Math.max((item.value / max) * 100, 1.6)}%` } })),
  ]);
  document.getElementById('featured').append(
    el('div', { class: 'wrap featured-grid' }, [
      el('div', { class: 'featured-text' }, [
        el('p', { class: 'kicker', text: featured.kicker }),
        el('h2', { text: featured.title }),
        el('p', { text: featured.text }),
        featured.footnote && el('p', { class: 'footnote', text: featured.footnote }),
      ]),
      el('div', { class: 'bars reveal' }, [bar(before, 'before'), bar(after, 'after')]),
    ]),
  );
}

export function renderReferences({ references }) {
  const content = shell('references', 'Endorsements', 'In their words');
  let picks = references.filter((r) => r.featured);
  if (!picks.length) picks = references.slice(0, 3);
  content.append(
    el('div', { class: 'pull-quotes' }, picks.map((ref) => el('figure', { class: 'pull reveal' }, [
      el('blockquote', { text: ref.excerpt || ref.blurb }),
      el('figcaption', {}, [el('strong', { text: ref.author.name }), el('span', { text: `${ref.author.position}, ${ref.author.organisation}` }), el('time', { text: ref.author.friendlyDate })]),
    ]))),
    el('details', { class: 'all-quotes' }, [
      el('summary', { text: `Read all ${references.length} endorsements` }),
      el('div', { class: 'quote-list' }, references.map((ref) => el('figure', { class: 'quote' }, [
        el('blockquote', { text: ref.blurb }),
        el('figcaption', {}, [el('strong', { text: ref.author.name }), el('span', { text: `${ref.author.position}, ${ref.author.organisation} · ${ref.author.friendlyDate}` })]),
      ]))),
    ]),
  );
}

export function renderProofPoints({ proofPoints, talks }) {
  const content = shell('proofPoints', 'Impact', proofPoints.title);
  content.append(el('div', { class: 'rows' }, proofPoints.items.map((item) => el('article', { class: 'row reveal' }, [el('h3', { text: item.title }), el('p', { text: item.text })]))));
  if (talks) {
    content.append(
      el('h3', { class: 'subhead', text: talks.title }),
      el('ul', { class: 'talks' }, talks.items.map((t) => el('li', {}, [el('strong', { text: t.title }), el('span', { text: t.text })]))),
    );
  }
}

export function renderPrinciples({ principles }) {
  const content = shell('principles', 'Approach', principles.title);
  content.append(el('ol', { class: 'principles' }, principles.items.map((text, i) => el('li', { class: 'reveal' }, [el('span', { text: String(i + 1).padStart(2, '0') }), el('p', { text })]))));
}

export function renderSkills({ skills }) {
  const content = shell('skills', 'Capability', skills.title);
  content.append(el('div', { class: 'skill-groups' }, skills.groups.map((group) => el('div', { class: 'skill-group' }, [
    el('h3', { text: group.name }),
    el('ul', {}, group.items.map((item) => el('li', { text: item }))),
  ]))));
}

function renderRole(position, open) {
  const hasBody = position.blurb.length || position.achievements.length || position.responsibilities.length;
  const heading = [el('h4', { text: position.title }), el('span', { class: 'dates', text: `${position.period.label} · ${position.period.duration}` })];
  if (!hasBody) return el('div', { class: 'role plain' }, el('div', { class: 'role-head' }, heading));
  return el('details', { class: `role${open ? ' lead' : ''}`, open: open ? '' : null }, [
    el('summary', { class: 'role-head' }, heading),
    el('div', { class: 'role-body' }, [
      ...position.blurb.map((p) => el('p', { text: p })),
      position.achievements.length > 0 && list(position.achievements, 'points'),
      position.responsibilities.length > 0 && el('div', { class: 'resp' }, [el('h5', { text: 'Responsibilities' }), list(position.responsibilities, 'points')]),
    ]),
  ]);
}

export function renderExperience({ experiences }, branding) {
  const content = shell('experience', 'Career', 'Experience', true);
  let remaining = branding.expandedRoles;
  experiences.forEach((org) => {
    const roles = org.positions.map((position) => {
      const open = remaining > 0;
      if (open) remaining -= 1;
      return renderRole(position, open);
    });
    content.append(
      el('article', { class: 'org reveal' }, [
        el('a', { class: 'org-header', href: org.link, target: '_blank', rel: 'noopener', title: org.blurb.join('\n\n') }, [
          el('span', { class: 'logo', style: { backgroundImage: cssUrl(org.icon) } }),
          el('span', { class: 'org-title' }, [el('h3', { text: org.organisation }), el('span', { text: `${org.period.label} · ${org.period.duration}` })]),
        ]),
        el('div', { class: 'roles' }, roles),
      ]),
    );
  });
}

export function renderEducation({ educations }) {
  const content = shell('education', 'Foundations', 'Education & certification');
  const items = educations
    .flatMap((org) => org.certifications.map((cert) => ({ org, cert })))
    .sort((a, b) => (b.cert.period.end || 0) - (a.cert.period.end || 0));
  content.append(el('div', { class: 'edu-list' }, items.map(({ org, cert }) => {
    const summary = el('div', { class: 'edu-main' }, [
      el('span', { class: 'edu-year', text: cert.period.end ? String(cert.period.end.getFullYear()) : '' }),
      el('div', {}, [el('h3', { text: cert.title }), el('p', { text: `${cert.qualification} · ${org.organisation}` })]),
    ]);
    if (!cert.blurb.length) return el('div', { class: 'edu' }, summary);
    return el('details', { class: 'edu' }, [
      el('summary', {}, summary),
      el('div', { class: 'edu-detail' }, cert.blurb.map((t) => (/^https?:\/\//.test(t) ? el('p', {}, el('a', { href: t, target: '_blank', rel: 'noopener', text: t })) : el('p', { text: t })))),
    ]);
  })));
}

export function renderFooter(branding, resume) {
  const year = new Date().getFullYear();
  const parts = [`© ${year} ${resume.bio.first} ${resume.bio.last}`, resume.bio.location, branding.footer].filter(Boolean);
  document.getElementById('footer').append(el('p', { text: parts.join(' · ') }));
}
