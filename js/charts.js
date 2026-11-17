const charts = [];

const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const alpha = (hex, a) => `${hex}${Math.round(a * 255).toString(16).padStart(2, '0')}`;

function build(id, config) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const chart = new Chart(canvas.getContext('2d'), config);
  charts.push(chart);
}

function baseOptions(title, extra = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: { display: true, text: title, color: css('--text'), font: { size: 15, weight: '600' } },
      legend: { labels: { color: css('--muted'), boxWidth: 12 } },
      ...extra.plugins,
    },
    ...(extra.scales && { scales: extra.scales }),
    ...extra.options,
  };
}

const axis = (title) => ({
  title: title ? { display: true, text: title, color: css('--muted') } : undefined,
  ticks: { color: css('--muted'), stepSize: 1 },
  grid: { color: alpha(css('--muted').slice(0, 7), 0.18) },
});

export function renderCharts(resume) {
  if (typeof Chart === 'undefined') return;
  charts.splice(0).forEach((c) => c.destroy());
  const { experiences, educations, references, organisations } = resume;
  const colorOf = (name) => organisations[name]?.color || '#888888';

  build('chartExperience', {
    type: 'doughnut',
    data: {
      labels: experiences.map((o) => o.organisation),
      datasets: [{
        data: experiences.map((o) => +(o.period.months / 12).toFixed(1)),
        backgroundColor: experiences.map((o) => alpha(o.color, 0.8)),
        borderColor: css('--surface'),
        borderWidth: 2,
      }],
    },
    options: baseOptions('Years of experience by organisation', { plugins: { legend: { position: 'right', labels: { color: css('--muted'), boxWidth: 12 } } } }),
  });

  const years = references.map((r) => r.author.date.getFullYear());
  const labels = [];
  for (let y = Math.min(...years); y <= Math.max(...years); y++) labels.push(String(y));
  const refOrgs = [...new Set(references.map((r) => r.author.organisation))];
  build('chartReferences', {
    type: 'bar',
    data: {
      labels,
      datasets: refOrgs.map((org) => ({
        label: org,
        data: labels.map((y) => references.filter((r) => r.author.organisation === org && String(r.author.date.getFullYear()) === y).length),
        backgroundColor: alpha(colorOf(org), 0.85),
        borderRadius: 4,
      })),
    },
    options: baseOptions('Endorsements by year', { scales: { x: { ...axis(), stacked: true }, y: { ...axis(), stacked: true } } }),
  });

  const qualifications = [...new Set(educations.flatMap((o) => o.certifications.map((c) => c.qualification)))];
  build('chartEducation', {
    type: 'bar',
    data: {
      labels: qualifications,
      datasets: educations.map((org) => ({
        label: org.organisation,
        data: qualifications.map((q) => org.certifications.filter((c) => c.qualification === q).length),
        backgroundColor: alpha(org.color, 0.85),
        borderRadius: 4,
      })),
    },
    options: baseOptions('Qualifications by level and institute', {
      scales: { x: { ...axis(), stacked: true }, y: { ...axis(), stacked: true, ticks: { color: css('--muted') } } },
      options: { indexAxis: 'y' },
      plugins: { legend: { display: false } },
    }),
  });

  build('chartTenure', {
    type: 'bubble',
    data: {
      datasets: experiences.map((org) => ({
        label: org.organisation,
        backgroundColor: alpha(org.color, 0.55),
        borderColor: org.color,
        data: org.positions.map((p) => ({
          x: +(p.period.months / 12).toFixed(1),
          y: +(org.period.months / 12).toFixed(1),
          r: 6 + 3 * references.filter((r) => r.author.organisation === org.organisation && r.author.date >= p.period.start && r.author.date <= p.period.effectiveEnd).length,
        })),
      })),
    },
    options: baseOptions('Time in role vs time at organisation (bubble size: endorsements)', {
      scales: { x: axis('Years in role'), y: axis('Years at organisation') },
    }),
  });
}

