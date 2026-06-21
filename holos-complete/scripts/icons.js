/* ============================================================
   HOLOS — Icons
   All SVG icons in one place. Call icon('name') → SVG string.
   ============================================================ */

const Icons = {
  // Categories
  shoe: `<svg viewBox="0 0 48 48"><path d="M6 32 L6 26 Q 6 22 10 22 L 24 22 Q 28 22 32 18 L 38 14 Q 42 12 42 18 L 42 26 Q 42 32 38 32 Z M6 32 L42 32"/></svg>`,
  bag: `<svg viewBox="0 0 48 48"><path d="M10 16 L10 38 Q 10 42 14 42 L 34 42 Q 38 42 38 38 L 38 16 Z M16 16 L16 12 Q 16 8 20 8 L 28 8 Q 32 8 32 12 L 32 16"/></svg>`,
  shirt: `<svg viewBox="0 0 48 48"><path d="M16 10 L8 14 L10 22 L14 20 L14 40 L34 40 L34 20 L38 22 L40 14 L32 10 L28 12 Q 24 16 20 12 Z"/></svg>`,
  watch: `<svg viewBox="0 0 48 48"><rect x="14" y="14" width="20" height="20" rx="3"/><path d="M18 14 L20 6 L28 6 L30 14 M18 34 L20 42 L28 42 L30 34"/><circle cx="24" cy="24" r="2" fill="currentColor"/></svg>`,
  jewelry: `<svg viewBox="0 0 48 48"><path d="M16 20 L24 8 L32 20 L24 40 Z M16 20 L32 20"/></svg>`,
  food: `<svg viewBox="0 0 48 48"><ellipse cx="24" cy="28" rx="16" ry="4"/><path d="M8 28 Q 24 12 40 28"/></svg>`,
  packaged: `<svg viewBox="0 0 48 48"><path d="M8 16 L24 8 L40 16 L40 36 L24 44 L8 36 Z M8 16 L24 24 L40 16 M24 24 L24 44"/></svg>`,
  toy: `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="16"/><circle cx="18" cy="20" r="2" fill="currentColor"/><circle cx="30" cy="20" r="2" fill="currentColor"/><path d="M18 30 Q 24 34 30 30"/></svg>`,
  decor: `<svg viewBox="0 0 48 48"><path d="M16 40 L16 24 Q 16 16 24 12 Q 32 16 32 24 L 32 40 Z M16 32 L32 32 M12 40 L36 40"/></svg>`,
  furniture: `<svg viewBox="0 0 48 48"><path d="M8 20 L8 36 M40 20 L40 36 M8 24 L40 24 L40 32 L8 32 Z M12 32 L12 40 M36 32 L36 40"/></svg>`,
  electronics: `<svg viewBox="0 0 48 48"><rect x="8" y="12" width="32" height="22" rx="2"/><path d="M16 38 L32 38 M20 34 L20 38 M28 34 L28 38"/></svg>`,
  books: `<svg viewBox="0 0 48 48"><path d="M8 10 L8 38 Q 16 36 24 38 Q 32 36 40 38 L 40 10 Q 32 8 24 10 Q 16 8 8 10 Z M24 10 L24 38"/></svg>`,
  other: `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="16"/><path d="M20 20 Q 24 16 28 20 Q 28 24 24 24 L 24 28 M24 32 L24 32.5"/></svg>`,

  // Actions
  plus: `<svg viewBox="0 0 24 24"><path d="M12 5 L12 19 M5 12 L19 12"/></svg>`,
  arrow_right: `<svg viewBox="0 0 24 24"><path d="M5 12 L19 12 M13 6 L19 12 L13 18"/></svg>`,
  arrow_left: `<svg viewBox="0 0 24 24"><path d="M19 12 L5 12 M11 6 L5 12 L11 18"/></svg>`,
  close: `<svg viewBox="0 0 24 24"><path d="M6 6 L18 18 M18 6 L6 18"/></svg>`,
  check: `<svg viewBox="0 0 24 24"><path d="M5 12 L10 17 L19 7"/></svg>`,
  camera: `<svg viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="14" rx="2"/><circle cx="12" cy="14" r="4"/><path d="M8 7 L9 5 L15 5 L16 7"/></svg>`,
  qr: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><rect x="18" y="14" width="3" height="3"/><rect x="14" y="18" width="3" height="3"/></svg>`,
  bag_cart: `<svg viewBox="0 0 24 24"><path d="M5 8 L19 8 L18 20 L6 20 Z M9 8 L9 5 Q 9 3 12 3 Q 15 3 15 5 L 15 8"/></svg>`,
  heart: `<svg viewBox="0 0 24 24"><path d="M12 20 Q 4 14 4 9 Q 4 5 8 5 Q 11 5 12 8 Q 13 5 16 5 Q 20 5 20 9 Q 20 14 12 20 Z"/></svg>`,
  share: `<svg viewBox="0 0 24 24"><circle cx="6" cy="12" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M7.5 11 L16.5 7 M7.5 13 L16.5 17"/></svg>`,
  whatsapp: `<svg viewBox="0 0 24 24"><path d="M3 21 L4.5 16 Q 3 13 4 10 Q 5.5 5 12 5 Q 19 5 20 12 Q 19 19 12 19 Q 9 19 7.5 18 Z M9 11 Q 10 14 13 15 L14.5 13.5 Q 16 14 16 14.5"/></svg>`,
  settings: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2 L13 5 L16 4 L17 7 L20 8 L19 11 L22 12 L19 13 L20 16 L17 17 L16 20 L13 19 L12 22 L11 19 L8 20 L7 17 L4 16 L5 13 L2 12 L5 11 L4 8 L7 7 L8 4 L11 5 Z"/></svg>`,
  chart: `<svg viewBox="0 0 24 24"><path d="M4 20 L4 4 M4 20 L20 20 M8 16 L8 12 M12 16 L12 8 M16 16 L16 14 M20 16 L20 6"/></svg>`,
  package: `<svg viewBox="0 0 24 24"><path d="M3 8 L12 4 L21 8 L21 17 L12 21 L3 17 Z M3 8 L12 12 L21 8 M12 12 L12 21"/></svg>`,
  user: `<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21 Q 4 14 12 14 Q 20 14 20 21"/></svg>`,
  zap: `<svg viewBox="0 0 24 24"><path d="M13 3 L4 13 L11 13 L10 21 L20 11 L13 11 Z"/></svg>`,
  home: `<svg viewBox="0 0 24 24"><path d="M3 11 L12 3 L21 11 L21 21 L14 21 L14 14 L10 14 L10 21 L3 21 Z"/></svg>`,
  search: `<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M16 16 L21 21"/></svg>`,
  rotate: `<svg viewBox="0 0 24 24"><path d="M3 12 Q 3 4 12 4 Q 19 4 20 11 M20 4 L20 11 L13 11"/><path d="M21 12 Q 21 20 12 20 Q 5 20 4 13 M4 20 L4 13 L11 13"/></svg>`,
  eye: `<svg viewBox="0 0 24 24"><path d="M2 12 Q 7 5 12 5 Q 17 5 22 12 Q 17 19 12 19 Q 7 19 2 12 Z"/><circle cx="12" cy="12" r="3"/></svg>`,
  warning: `<svg viewBox="0 0 24 24"><path d="M12 4 L22 20 L2 20 Z M12 10 L12 15 M12 17.5 L12 18"/></svg>`,
  cube: `<svg viewBox="0 0 24 24"><path d="M3 8 L12 4 L21 8 L21 17 L12 21 L3 17 Z M3 8 L12 12 L21 8 M12 12 L12 21"/></svg>`,
  image: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="M21 15L16 10L5 21"/></svg>`,
  quote: `<svg viewBox="0 0 24 24"><path d="M6 17h2l2-4V7H4v6h2zM14 17h2l2-4V7h-6v6h2z"/></svg>`,
  mail: `<svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,6 12,13 2,6"/></svg>`,
  phone: `<svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>`,
  map: `<svg viewBox="0 0 24 24"><polygon points="1,6 9,2 15,6 23,2 23,18 15,22 9,18 1,22"/><line x1="9" y1="2" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="22"/></svg>`,
  award: `<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="7"/><polyline points="8.21,13.89 7,23 12,20 17,23 15.79,13.88"/></svg>`,
  tabs: `<svg viewBox="0 0 24 24"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"/></svg>`,

  star: `<svg viewBox="0 0 24 24"><polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"/></svg>`,
  cat_fashion: `<svg viewBox="0 0 24 24"><path d="M8 2l4 4 4-4"/><path d="M6 6h12v4c0 3-2 6-6 8-4-2-6-5-6-8V6z"/></svg>`,
  cat_accessories: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 3v9l6 4"/></svg>`,
  cat_electronics: `<svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`,
  cat_home: `<svg viewBox="0 0 24 24"><path d="M3 10l9-7 9 7v10a1 1 0 01-1 1H4a1 1 0 01-1-1V10z"/></svg>`,
  cat_kitchen: `<svg viewBox="0 0 24 24"><path d="M12 3a4 4 0 00-4 4c0 3 4 5 4 5s4-2 4-5a4 4 0 00-4-4z"/><path d="M12 12v9M8 21h8"/></svg>`,
  cat_beauty: `<svg viewBox="0 0 24 24"><path d="M12 3c-3 0-6 3-6 8 0 6 6 10 6 10s6-4 6-10c0-5-3-8-6-8z"/><circle cx="12" cy="11" r="2"/></svg>`,
  cat_grocery: `<svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z"/><path d="M3 6h18M16 10a4 4 0 01-8 0"/></svg>`,
  cat_toys: `<svg viewBox="0 0 24 24"><circle cx="12" cy="10" r="6"/><path d="M12 16v5M9 21h6"/><path d="M9 8l3 3 3-3"/></svg>`,
  cat_sports: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a15 15 0 010 20M12 2a15 15 0 000 20M2 12h20"/></svg>`,
  cat_health: `<svg viewBox="0 0 24 24"><path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3z"/></svg>`,
  cat_automotive: `<svg viewBox="0 0 24 24"><path d="M5 11l2-5h10l2 5"/><rect x="3" y="11" width="18" height="7" rx="2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>`,
  cat_books: `<svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>`,
  cat_baby: `<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="5"/><path d="M4 21c0-4 4-8 8-8s8 4 8 8"/></svg>`,
  cat_pets: `<svg viewBox="0 0 24 24"><circle cx="8" cy="5" r="2"/><circle cx="16" cy="5" r="2"/><circle cx="5" cy="11" r="2"/><circle cx="19" cy="11" r="2"/><path d="M12 22c-2 0-4-3-4-6 0-2 2-4 4-4s4 2 4 4c0 3-2 6-4 6z"/></svg>`,
};

function icon(name, className = '') {
  const svg = Icons[name] || Icons.other;
  return svg.replace('<svg', `<svg class="${className}" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"`);
}

window.icon = icon;
