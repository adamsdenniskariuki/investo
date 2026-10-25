export type Route =
  | { name: 'home' }
  | { name: 'track'; id: string }
  | { name: 'lesson'; id: string }
  | { name: 'tools' }
  | { name: 'tool'; id: string }
  | { name: 'progress' }
  | { name: 'settings' }
  | { name: 'about' }
  | { name: 'notfound'; path: string };

function decode(s: string): string | null {
  try {
    return decodeURIComponent(s);
  } catch {
    return null;
  }
}

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#/, '').replace(/^\/+/, '').replace(/\/+$/, '').split('?')[0];
  if (path === '') return { name: 'home' };
  const parts = path.split('/').map(decode);
  if (parts.some((p) => p === null || p === '')) return { name: 'notfound', path };
  const [a, b, ...rest] = parts as string[];
  if (rest.length) return { name: 'notfound', path };
  if (b === undefined) {
    if (a === 'tools') return { name: 'tools' };
    if (a === 'progress') return { name: 'progress' };
    if (a === 'settings') return { name: 'settings' };
    if (a === 'about') return { name: 'about' };
    return { name: 'notfound', path };
  }
  if (a === 'track') return { name: 'track', id: b };
  if (a === 'lesson') return { name: 'lesson', id: b };
  if (a === 'tools') return { name: 'tool', id: b };
  return { name: 'notfound', path };
}

export function href(route: Route): string {
  switch (route.name) {
    case 'home':
      return '#/';
    case 'track':
      return `#/track/${encodeURIComponent(route.id)}`;
    case 'lesson':
      return `#/lesson/${encodeURIComponent(route.id)}`;
    case 'tool':
      return `#/tools/${encodeURIComponent(route.id)}`;
    case 'notfound':
      return `#/${route.path}`;
    default:
      return `#/${route.name}`;
  }
}
