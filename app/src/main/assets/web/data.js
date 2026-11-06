/* =========================================================
   AURA — mock catalogue (fictional artists & releases)
   UI-only data. No network, no playback.
   ========================================================= */
(function (global) {
  'use strict';

  const ARTISTS = [
    { id: 'ar1', name: 'Nova Kaur', seed: 'nova-kaur', tag: 'Dream pop' },
    { id: 'ar2', name: 'Aria Vale', seed: 'aria-vale', tag: 'Alt R&B' },
    { id: 'ar3', name: 'Kite & Ember', seed: 'kite-ember', tag: 'Indie folk' },
    { id: 'ar4', name: 'Selene', seed: 'selene-moon', tag: 'Ambient' },
    { id: 'ar5', name: 'Mira Sol', seed: 'mira-sol', tag: 'Neo soul' },
    { id: 'ar6', name: 'Ravi Anand', seed: 'ravi-anand', tag: 'Fusion' },
    { id: 'ar7', name: 'Lumen', seed: 'lumen-trio', tag: 'Electronic' },
    { id: 'ar8', name: 'Ishaan Verma', seed: 'ishaan-verma', tag: 'Lo-fi' },
    { id: 'ar9', name: 'Paper Moons', seed: 'paper-moons', tag: 'Synthwave' },
    { id: 'ar10', name: 'Zayn Ode', seed: 'zayn-ode', tag: 'Hip hop' },
    { id: 'ar11', name: 'Tara & the Tide', seed: 'tara-tide', tag: 'Indie rock' },
    { id: 'ar12', name: 'Kavi Rao', seed: 'kavi-rao', tag: 'Classical' }
  ];

  const ALBUMS = [
    { id: 'al1', title: 'Neon Monsoon', artist: 'Nova Kaur', year: 2026, seed: 'neon-monsoon', motif: 'orb', tracks: 11 },
    { id: 'al2', title: 'Glass Horizon', artist: 'Nova Kaur', year: 2025, seed: 'glass-horizon', motif: 'arc', tracks: 9 },
    { id: 'al3', title: 'Midnight Bloom', artist: 'Aria Vale', year: 2026, seed: 'midnight-bloom', motif: 'bloom', tracks: 12 },
    { id: 'al4', title: 'Slow Static', artist: 'Lumen', year: 2025, seed: 'slow-static', motif: 'wave', tracks: 8 },
    { id: 'al5', title: 'Aurora Drift', artist: 'Selene', year: 2026, seed: 'aurora-drift', motif: 'prism', tracks: 10 },
    { id: 'al6', title: 'Velvet Circuit', artist: 'Paper Moons', year: 2024, seed: 'velvet-circuit', motif: 'grid', tracks: 7 },
    { id: 'al7', title: 'Paper Sky', artist: 'Kite & Ember', year: 2025, seed: 'paper-sky', motif: 'arc', tracks: 9 },
    { id: 'al8', title: 'Afterglow', artist: 'Mira Sol', year: 2026, seed: 'afterglow-sol', motif: 'orb', tracks: 11 },
    { id: 'al9', title: 'Cobalt Hours', artist: 'Ravi Anand', year: 2025, seed: 'cobalt-hours', motif: 'wave', tracks: 10 },
    { id: 'al10', title: 'Silver Rain', artist: 'Ishaan Verma', year: 2026, seed: 'silver-rain', motif: 'grid', tracks: 14 },
    { id: 'al11', title: 'Echo Lake', artist: 'Tara & the Tide', year: 2024, seed: 'echo-lake', motif: 'bloom', tracks: 8 },
    { id: 'al12', title: 'Parallel Hearts', artist: 'Zayn Ode', year: 2026, seed: 'parallel-hearts', motif: 'prism', tracks: 12 },
    { id: 'al13', title: 'Monsoon Ragas', artist: 'Kavi Rao', year: 2025, seed: 'monsoon-ragas', motif: 'arc', tracks: 6 },
    { id: 'al14', title: 'Low Tide Lullaby', artist: 'Selene', year: 2023, seed: 'low-tide', motif: 'wave', tracks: 9 }
  ];

  const TRACKS = [
    { id: 't1', title: 'Glass Horizon', artist: 'Nova Kaur', album: 'Glass Horizon', dur: 222, seed: 'neon-monsoon' },
    { id: 't2', title: 'Neon Monsoon', artist: 'Nova Kaur', album: 'Neon Monsoon', dur: 245, seed: 'neon-monsoon' },
    { id: 't3', title: 'Midnight Bloom', artist: 'Aria Vale', album: 'Midnight Bloom', dur: 198, seed: 'midnight-bloom' },
    { id: 't4', title: 'Slow Static', artist: 'Lumen', album: 'Slow Static', dur: 261, seed: 'slow-static' },
    { id: 't5', title: 'Aurora Drift', artist: 'Selene', album: 'Aurora Drift', dur: 312, seed: 'aurora-drift' },
    { id: 't6', title: 'Velvet Circuit', artist: 'Paper Moons', album: 'Velvet Circuit', dur: 234, seed: 'velvet-circuit' },
    { id: 't7', title: 'Paper Sky', artist: 'Kite & Ember', album: 'Paper Sky', dur: 207, seed: 'paper-sky' },
    { id: 't8', title: 'Afterglow', artist: 'Mira Sol', album: 'Afterglow', dur: 219, seed: 'afterglow-sol' },
    { id: 't9', title: 'Cobalt Hours', artist: 'Ravi Anand', album: 'Cobalt Hours', dur: 276, seed: 'cobalt-hours' },
    { id: 't10', title: 'Silver Rain', artist: 'Ishaan Verma', album: 'Silver Rain', dur: 189, seed: 'silver-rain' },
    { id: 't11', title: 'Echo Lake', artist: 'Tara & the Tide', album: 'Echo Lake', dur: 243, seed: 'echo-lake' },
    { id: 't12', title: 'Parallel Hearts', artist: 'Zayn Ode', album: 'Parallel Hearts', dur: 201, seed: 'parallel-hearts' },
    { id: 't13', title: 'Monsoon Ragas', artist: 'Kavi Rao', album: 'Monsoon Ragas', dur: 358, seed: 'monsoon-ragas' },
    { id: 't14', title: 'Low Tide Lullaby', artist: 'Selene', album: 'Low Tide Lullaby', dur: 228, seed: 'low-tide' },
    { id: 't15', title: 'Saffron Skies', artist: 'Ravi Anand', album: 'Cobalt Hours', dur: 254, seed: 'saffron-skies' },
    { id: 't16', title: 'Quiet Machines', artist: 'Lumen', album: 'Slow Static', dur: 216, seed: 'quiet-machines' },
    { id: 't17', title: 'Sea of Lanterns', artist: 'Mira Sol', album: 'Afterglow', dur: 268, seed: 'sea-lanterns' },
    { id: 't18', title: 'Half Light', artist: 'Kite & Ember', album: 'Paper Sky', dur: 232, seed: 'half-light' },
    { id: 't19', title: 'Neon Monsoon (Reprise)', artist: 'Nova Kaur', album: 'Neon Monsoon', dur: 176, seed: 'neon-reprise' },
    { id: 't20', title: 'Velvet Hours', artist: 'Aria Vale', album: 'Midnight Bloom', dur: 249, seed: 'velvet-hours' }
  ];

  const PLAYLISTS = [
    { id: 'p1', name: 'Late Night Drive', desc: '42 tracks · synth & neon', seed: 'pl-late-night', motif: 'grid' },
    { id: 'p2', name: 'Monsoon Lo-fi', desc: '68 tracks · rain & tape', seed: 'pl-monsoon', motif: 'wave' },
    { id: 'p3', name: 'Focus Flow', desc: '31 tracks · ambient', seed: 'pl-focus', motif: 'orb' },
    { id: 'p4', name: 'Sunday Slow', desc: '24 tracks · neo soul', seed: 'pl-sunday', motif: 'bloom' },
    { id: 'p5', name: 'Glass Piano', desc: '19 tracks · instrumental', seed: 'pl-piano', motif: 'prism' },
    { id: 'p6', name: 'Indie Sunrise', desc: '53 tracks · guitars', seed: 'pl-sunrise', motif: 'arc' },
    { id: 'p7', name: 'Deep Bass Club', desc: '37 tracks · electronic', seed: 'pl-bass', motif: 'grid' },
    { id: 'p8', name: 'Aura Favourites', desc: '112 tracks · everything', seed: 'pl-favs', motif: 'orb' }
  ];

  const CATEGORIES = [
    { name: 'Chill', sub: 'Slow & soft', h1: 190, h2: 265 },
    { name: 'Focus', sub: 'Deep work', h1: 260, h2: 210 },
    { name: 'Party', sub: 'Turn it up', h1: 330, h2: 20 },
    { name: 'Acoustic', sub: 'Unplugged', h1: 30, h2: 340 },
    { name: 'Workout', sub: 'High energy', h1: 10, h2: 300 },
    { name: 'Sleep', sub: 'Night drift', h1: 240, h2: 200 }
  ];

  const RECENT = ['t2', 't5', 't8', 't11', 't3', 't16', 't12', 't1'];
  const TRENDING = ['t5', 't2', 't9', 't3', 't12'];
  const RECENT_SEARCHES = ['Nova Kaur', 'Midnight Bloom', 'Lo-fi monsoon', 'Selene', 'Velvet Circuit'];
  const TRENDING_SEARCHES = ['Aurora Drift', 'Neon Monsoon', 'Kavi Rao', 'Paper Moons', 'Afterglow'];

  const LYRICS = [
    'City lights in a glass horizon',
    'Every hour a softer shade of blue',
    'I keep the echo of your voice',
    'Folded in the static of the room',
    '',
    'And the rain comes down like neon',
    'Painting rivers on the windowpane',
    'We were only ever passing through',
    'But the light remembers your name',
    '',
    'Hold the moment, let it blur',
    'Let it bend and let it glow',
    'Nothing here is solid',
    'Everything is light and echo',
    '',
    'Glass horizon, hold me slow',
    'Glass horizon, don\'t let go'
  ];

  const QUEUE = ['t2', 't5', 't9', 't3', 't12', 't8', 't16'];

  const DOWNLOADS = ['t2', 't5', 't9', 't16', 't10'];

  global.DATA = {
    ARTISTS, ALBUMS, TRACKS, PLAYLISTS, CATEGORIES,
    RECENT, TRENDING, RECENT_SEARCHES, TRENDING_SEARCHES,
    LYRICS, QUEUE, DOWNLOADS,
    trackById: function (id) { return TRACKS.find(function (t) { return t.id === id; }); },
    albumByTitle: function (title) { return ALBUMS.find(function (a) { return a.title === title; }); }
  };
})(window);
