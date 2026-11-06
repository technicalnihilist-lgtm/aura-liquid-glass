/* =========================================================
   AURA — procedural artwork engine
   Every cover is generated locally as an SVG data-URI:
   layered light fields, geometry and film grain.
   No external assets, no copyrighted imagery.
   ========================================================= */
(function (global) {
  'use strict';

  function rng(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
  }

  /* [deep, mid, glow, accent] */
  const PALETTES = [
    ['#080820', '#2b1d6b', '#7c5cff', '#45e0d0'],
    ['#04161c', '#0e5560', '#2ee6b4', '#7dd3fc'],
    ['#180611', '#6b1350', '#ff4d8d', '#ffb86b'],
    ['#050b1c', '#123a75', '#3d8bff', '#9be7ff'],
    ['#170a02', '#7a3a08', '#ff9f45', '#ffd98e'],
    ['#0d0620', '#43248f', '#9b7bff', '#ff9de0'],
    ['#03161c', '#0b4a52', '#35d6c0', '#b8f5ff'],
    ['#17040e', '#6b0f2e', '#ff3355', '#ffb0b8'],
    ['#06121d', '#1d4260', '#5fa8d3', '#d7ecff'],
    ['#090914', '#2a2350', '#6b5ce7', '#c9b8ff'],
    ['#081402', '#2c5a12', '#8ede4a', '#e9ffb0'],
    ['#12081c', '#4a1a63', '#c35bff', '#ffd6f5']
  ];

  function art(seedKey, size, motifOverride) {
    const seed = typeof seedKey === 'number' ? seedKey : hash(String(seedKey));
    const r = rng(seed);
    const pal = PALETTES[seed % PALETTES.length];
    const [deep, mid, glow, accent] = pal;
    const S = size || 600;
    const id = 'a' + (seed % 999999);
    const motif = motifOverride || ['orb', 'arc', 'wave', 'bloom', 'prism', 'grid'][seed % 6];

    const lx = 18 + r() * 46;      // key light x %
    const ly = 12 + r() * 40;      // key light y %
    const hz = 58 + r() * 22;      // horizon %
    const rot = Math.floor(r() * 360);

    let geo = '';

    if (motif === 'orb') {
      const cx = 30 + r() * 40, cy = 26 + r() * 30, rad = 20 + r() * 12;
      geo = `
        <circle cx="${cx}%" cy="${cy}%" r="${rad}%" fill="url(#sph${id})"/>
        <circle cx="${cx}%" cy="${cy}%" r="${rad}%" fill="none" stroke="${accent}" stroke-width=".5" opacity=".45"/>
        <circle cx="${cx}%" cy="${cy}%" r="${rad * 1.5}%" fill="none" stroke="${accent}" stroke-width=".35" opacity=".22"/>
        <circle cx="${cx}%" cy="${cy}%" r="${rad * 2.15}%" fill="none" stroke="${accent}" stroke-width=".25" opacity=".12"/>
        <ellipse cx="${cx}%" cy="${cy + rad * 0.95}%" rx="${rad * 1.15}%" ry="${rad * 0.13}%" fill="${deep}" opacity=".55"/>`;
    } else if (motif === 'arc') {
      geo = `
        <g transform="rotate(${rot * 0.12} ${S / 2} ${S / 2})">
          <path d="M ${-S * 0.15} ${S * 0.78} Q ${S / 2} ${S * (0.06 + r() * 0.14)} ${S * 1.15} ${S * 0.78}"
                fill="none" stroke="url(#lin${id})" stroke-width="${S * 0.10}" stroke-linecap="round" opacity=".95"/>
          <path d="M ${-S * 0.15} ${S * 0.90} Q ${S / 2} ${S * (0.30 + r() * 0.12)} ${S * 1.15} ${S * 0.90}"
                fill="none" stroke="${accent}" stroke-width="${S * 0.010}" opacity=".55"/>
          <path d="M ${-S * 0.15} ${S * 0.98} Q ${S / 2} ${S * 0.52} ${S * 1.15} ${S * 0.98}"
                fill="none" stroke="${accent}" stroke-width="${S * 0.005}" opacity=".32"/>
        </g>`;
    } else if (motif === 'wave') {
      let paths = '';
      for (let i = 0; i < 8; i++) {
        const y = S * (0.14 + i * 0.105);
        const amp = S * (0.04 + r() * 0.055);
        paths += `<path d="M ${-S * 0.05} ${y} Q ${S * 0.26} ${y - amp} ${S * 0.5} ${y} T ${S * 1.05} ${y}"
          fill="none" stroke="${i % 2 ? accent : glow}" stroke-width="${S * (0.003 + (i % 3) * 0.004)}"
          opacity="${(0.14 + i * 0.085).toFixed(2)}"/>`;
      }
      geo = paths + `<rect x="0" y="${hz}%" width="${S}" height="${S}" fill="${deep}" opacity=".35"/>`;
    } else if (motif === 'bloom') {
      let petals = '';
      const cx = 50, cy = 44;
      for (let i = 0; i < 11; i++) {
        const a = (i / 11) * 360 + rot * 0.1;
        const rad = 15 + r() * 18;
        petals += `<ellipse cx="${cx}%" cy="${cy}%" rx="${rad}%" ry="${rad * 0.36}%"
          fill="url(#lin${id})" opacity=".30" transform="rotate(${a} ${S / 2} ${S / 2})"/>`;
      }
      geo = petals + `<circle cx="50%" cy="44%" r="6%" fill="${accent}" opacity=".9"/>
        <circle cx="50%" cy="44%" r="13%" fill="none" stroke="${accent}" stroke-width=".5" opacity=".4"/>`;
    } else if (motif === 'prism') {
      geo = `
        <polygon points="${S * 0.5},${S * 0.1} ${S * 0.9},${S * 0.8} ${S * 0.1},${S * 0.8}" fill="url(#sph${id})" opacity=".5"/>
        <polygon points="${S * 0.5},${S * 0.2} ${S * 0.78},${S * 0.74} ${S * 0.22},${S * 0.74}" fill="none" stroke="${accent}" stroke-width="${S * 0.005}" opacity=".6"/>
        <line x1="0" y1="${S * 0.86}" x2="${S}" y2="${S * 0.86}" stroke="${glow}" stroke-width="${S * 0.012}" opacity=".55"/>
        <line x1="0" y1="${S * 0.9}" x2="${S}" y2="${S * 0.9}" stroke="${accent}" stroke-width="${S * 0.003}" opacity=".5"/>`;
    } else {
      let lines = '';
      const step = S / 12;
      for (let i = 0; i <= 12; i++) {
        lines += `<line x1="${i * step}" y1="0" x2="${i * step}" y2="${S}" stroke="${accent}" stroke-width=".8" opacity="${(0.05 + (i % 3) * 0.06).toFixed(2)}"/>`;
        lines += `<line x1="0" y1="${i * step}" x2="${S}" y2="${i * step}" stroke="${accent}" stroke-width=".8" opacity="${(0.04 + (i % 4) * 0.05).toFixed(2)}"/>`;
      }
      geo = lines + `<circle cx="${lx + 22}%" cy="${ly + 26}%" r="26%" fill="url(#sph${id})" opacity=".8"/>
        <circle cx="${lx + 22}%" cy="${ly + 26}%" r="26%" fill="none" stroke="${accent}" stroke-width=".5" opacity=".35"/>`;
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
<defs>
  <linearGradient id="bg${id}" x1="0.1" y1="0" x2="0.9" y2="1">
    <stop offset="0" stop-color="${mid}"/>
    <stop offset=".62" stop-color="${deep}"/>
    <stop offset="1" stop-color="${deep}"/>
  </linearGradient>
  <radialGradient id="key${id}" cx="${lx}%" cy="${ly}%" r="70%">
    <stop offset="0" stop-color="${glow}" stop-opacity=".92"/>
    <stop offset=".48" stop-color="${glow}" stop-opacity=".30"/>
    <stop offset="1" stop-color="${glow}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="rim${id}" cx="86%" cy="92%" r="62%">
    <stop offset="0" stop-color="${accent}" stop-opacity=".55"/>
    <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="sph${id}" cx="34%" cy="28%" r="76%">
    <stop offset="0" stop-color="${accent}" stop-opacity=".95"/>
    <stop offset=".52" stop-color="${glow}" stop-opacity=".55"/>
    <stop offset="1" stop-color="${glow}" stop-opacity=".06"/>
  </radialGradient>
  <linearGradient id="lin${id}" x1="0" y1="1" x2="1" y2="0">
    <stop offset="0" stop-color="${glow}"/>
    <stop offset=".55" stop-color="${accent}"/>
    <stop offset="1" stop-color="${glow}" stop-opacity=".5"/>
  </linearGradient>
  <linearGradient id="vign${id}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity=".13"/>
    <stop offset=".35" stop-color="#000" stop-opacity="0"/>
    <stop offset="1" stop-color="#000" stop-opacity=".42"/>
  </linearGradient>
</defs>
<rect width="${S}" height="${S}" fill="url(#bg${id})"/>
<rect width="${S}" height="${S}" fill="url(#key${id})"/>
<rect width="${S}" height="${S}" fill="url(#rim${id})"/>
${geo}
<rect width="${S}" height="${S}" fill="url(#vign${id})"/>
</svg>`;

    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.replace(/\s+/g, ' '));
  }

  const cache = new Map();
  function artFor(key, size, motif) {
    const k = key + '|' + (size || 600) + '|' + (motif || '');
    if (!cache.has(k)) cache.set(k, art(key, size || 600, motif));
    return cache.get(k);
  }

  global.Art = { art: artFor, palettes: PALETTES, hash: hash };
})(window);
