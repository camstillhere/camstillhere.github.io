const escapeValue = (value) => String(value).replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/([,;])/g, '\\$1');

function fold(line) {
  const parts = [];
  let rest = line;
  while (rest.length > 74) {
    parts.push(rest.slice(0, 74));
    rest = ` ${rest.slice(74)}`;
  }
  parts.push(rest);
  return parts.join('\r\n');
}

export async function portraitData(source, size = 256) {
  try {
    const response = await fetch(source, { mode: 'cors' });
    if (!response.ok) return null;
    const bitmap = await createImageBitmap(await response.blob());
    const side = Math.min(bitmap.width, bitmap.height);
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    canvas.getContext('2d').drawImage(bitmap, (bitmap.width - side) / 2, 0, side, side, 0, 0, size, size);
    return canvas.toDataURL('image/jpeg', 0.85).split(',')[1];
  } catch {
    return null;
  }
}

export function buildVCard(resume, { url, photo }) {
  const { bio, experiences } = resume;
  const contact = bio.contact || {};
  const current = experiences.find((org) => org.period.current);
  const [city, ...rest] = (bio.location || '').split(',').map((s) => s.trim());

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${escapeValue(bio.last)};${escapeValue(bio.first)};;;`,
    `FN:${escapeValue(`${bio.first} ${bio.last}`)}`,
    current && `ORG:${escapeValue(current.organisation)}`,
    bio.title && `TITLE:${escapeValue(bio.title)}`,
    ...(contact.email || []).map((e) => `EMAIL;TYPE=INTERNET:${e.content}`),
    ...(contact.phone || []).map((p) => `TEL;TYPE=CELL:${p.content}`),
    url && `URL:${url}`,
    ...(contact.linkedIn || []).map((l) => `URL:${l.content}`),
    bio.location && `ADR;TYPE=WORK:;;;${escapeValue(city)};;;${escapeValue(rest.join(', '))}`,
    bio.tagline && `NOTE:${escapeValue(bio.tagline)}`,
    photo && `PHOTO;ENCODING=b;TYPE=JPEG:${photo}`,
    `REV:${new Date().toISOString()}`,
    'END:VCARD',
  ];
  return `${lines.filter(Boolean).map(fold).join('\r\n')}\r\n`;
}

export function saveVCard(text, filename) {
  const blob = new Blob([text], { type: 'text/vcard;charset=utf-8' });
  const href = URL.createObjectURL(blob);
  const isApple = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (isApple) {
    window.location.href = href;
  } else {
    const link = Object.assign(document.createElement('a'), { href, download: filename });
    document.body.append(link);
    link.click();
    link.remove();
  }
  setTimeout(() => URL.revokeObjectURL(href), 60000);
}
