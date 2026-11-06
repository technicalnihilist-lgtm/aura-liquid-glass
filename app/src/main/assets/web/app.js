/* =========================================================
   AURA — interaction layer
   Router, spring motion, shared-element transitions,
   Liquid Glass Studio bindings, mock data rendering.
   UI only — no audio, no network.
   ========================================================= */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const root = document.documentElement;
  const D = window.DATA;
  const A = window.Art;

  const params = new URLSearchParams(location.search);
  const SHOT = params.get('shot') === '1';

  /* ---------------- state ---------------- */
  const S = {
    tab: 'home',
    libSeg: 'playlists',
    libLayout: 'grid',
    track: D.trackById('t1'),
    playing: false,
    fav: false,
    shuffle: false,
    repeat: false,
    progress: 0.312,
    recentSearches: D.RECENT_SEARCHES.slice(),
    settings: {
      theme: 'midnight',
      glass: 'dark',
      motion: true,
      parallax: true,
      speed: 55,
      quality: 'high',
      reduce: false,
      glassCfg: null
    }
  };

  const DEFAULTS = {
    alpha: 62, blur: 26, refract: 70, reflect: 80, depth: 65,
    border: 60, shadow: 72, tint: 258, sat: 44, glass: 'dark'
  };

  /* ---------------- utils ---------------- */
  function fmt(t) {
    t = Math.max(0, Math.round(t));
    return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
  }
  function artOf(seed, size, motif) { return A.art(seed, size || 600, motif); }
  function haptic(kind) {
    try {
      if (window.AndroidUI && window.AndroidUI.haptic) window.AndroidUI.haptic(kind || 'light');
      else if (navigator.vibrate) navigator.vibrate(kind === 'heavy' ? 18 : 8);
    } catch (e) { /* no-op */ }
  }
  function store(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* no-op */ }
  }
  function load(k) {
    try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; }
  }
  let toastTimer = null;
  function toast(msg) {
    $('#toastText').textContent = msg;
    const t = $('#toast');
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 1900);
  }

  /* ---------------- render: home ---------------- */
  function cardHTML(track, i) {
    const art = artOf(track.seed, 320, ['orb', 'arc', 'bloom', 'wave', 'prism', 'grid'][i % 6]);
    return `<button class="card" data-track="${track.id}" style="animation:cardIn .5s var(--spring) both;animation-delay:${i * 40}ms">
      <div class="card-art" style="background-image:url('${art}')">
        <span class="card-play"><svg class="ic"><use href="#i-play"/></svg></span>
      </div>
      <p class="card-title">${track.title}</p>
      <p class="card-sub">${track.artist}</p>
    </button>`;
  }

  function renderHome() {
    $('#railRecent').innerHTML = D.RECENT.map((id, i) => cardHTML(D.trackById(id), i)).join('');

    const hero = D.ALBUMS[0];
    $('#heroCard').innerHTML = `
      <button class="hero" data-album="${hero.id}" id="heroEl">
        <div class="hero-img" style="background-image:url('${artOf(hero.seed + '-wide', 900, 'arc')}')"></div>
        <div class="hero-shade"></div>
        <div class="hero-glass">
          <div class="hero-meta">
            <p class="hero-kicker">Featured album</p>
            <p class="hero-title">${hero.title}</p>
            <p class="hero-sub">${hero.artist} · ${hero.year} · ${hero.tracks} tracks</p>
          </div>
          <span class="hero-play"><svg class="ic"><use href="#i-play"/></svg></span>
        </div>
      </button>`;

    $('#trendingList').innerHTML = D.TRENDING.map((id, i) => {
      const t = D.trackById(id);
      return `<button class="trow" data-track="${t.id}">
        <span class="trow-rank">${i + 1}</span>
        <span class="trow-art" style="background-image:url('${artOf(t.seed, 200, 'orb')}')"></span>
        <span class="trow-meta">
          <span class="trow-title">${t.title}</span>
          <span class="trow-sub">${t.artist} · ${t.album}</span>
        </span>
        <span class="trow-dur">${fmt(t.dur)}</span>
      </button>`;
    }).join('');

    $('#railArtists').innerHTML = D.ARTISTS.slice(0, 8).map((a, i) => `
      <button class="artist" data-artist="${a.id}">
        <div class="artist-face" style="background-image:url('${artOf(a.seed, 300, 'bloom')}')"></div>
        <p class="artist-name">${a.name}</p>
      </button>`).join('');

    $('#catGrid').innerHTML = D.CATEGORIES.map(catTile).join('');

    const alb = D.albumByTitle(S.track.album) || D.ALBUMS[0];
    $('#worldArt').style.backgroundImage = `url('${artOf(alb.seed, 500, alb.motif)}')`;
  }

  function catTile(c, i) {
    return `<button class="cat glass" data-cat="${c.name}" style="animation:cardIn .5s var(--spring) both;animation-delay:${i * 45}ms">
      <span class="cat-blob" style="background:radial-gradient(circle at 40% 35%, hsla(${c.h1},90%,66%,.85), hsla(${c.h2},85%,52%,.15) 70%)"></span>
      <span class="cat-name">${c.name}</span>
      <span class="cat-sub">${c.sub}</span>
    </button>`;
  }

  /* ---------------- render: search ---------------- */
  function renderSearchIdle() {
    $('#recentChips').innerHTML = S.recentSearches.map((q, i) =>
      `<button class="chip" data-q="${q}" style="animation-delay:${i * 40}ms">
        <svg class="ic"><use href="#i-clock"/></svg>${q}</button>`).join('');

    $('#trendSearches').innerHTML = D.TRENDING_SEARCHES.map((q, i) => {
      const t = D.TRACKS.find(x => x.title === q) || D.TRACKS[i];
      return `<button class="trow" data-q="${q}">
        <span class="trow-rank">${i + 1}</span>
        <span class="trow-art" style="background-image:url('${artOf(t.seed, 200, 'arc')}')"></span>
        <span class="trow-meta"><span class="trow-title">${q}</span>
        <span class="trow-sub">Trending in India</span></span>
        <svg class="ic chev"><use href="#i-chev"/></svg>
      </button>`;
    }).join('');

    $('#searchCats').innerHTML = D.CATEGORIES.slice(0, 4).map(catTile).join('');
  }

  function runSearch(q) {
    q = q.trim().toLowerCase();
    const idle = $('#searchIdle'), res = $('#searchResults'), empty = $('#searchEmpty');
    if (!q) {
      idle.hidden = false; res.hidden = true;
      return;
    }
    idle.hidden = true; res.hidden = false;

    const songs = D.TRACKS.filter(t => (t.title + ' ' + t.artist + ' ' + t.album).toLowerCase().includes(q)).slice(0, 5);
    const albums = D.ALBUMS.filter(a => (a.title + ' ' + a.artist).toLowerCase().includes(q)).slice(0, 4);
    const artists = D.ARTISTS.filter(a => a.name.toLowerCase().includes(q)).slice(0, 4);

    $('#resSongs').innerHTML = songs.length ? `<p class="result-label">Songs</p>` + songs.map((t, i) => `
      <button class="res-card" data-track="${t.id}" style="animation-delay:${i * 35}ms">
        <span class="res-art" style="background-image:url('${artOf(t.seed, 200, 'orb')}')"></span>
        <span class="res-meta"><span class="res-title">${t.title}</span><span class="res-sub">${t.artist} · ${t.album}</span></span>
        <svg class="ic chev"><use href="#i-chev"/></svg>
      </button>`).join('') : '';

    $('#resAlbums').innerHTML = albums.length ? `<p class="result-label">Albums</p>` + albums.map((a, i) => `
      <button class="res-card" data-album="${a.id}" style="animation-delay:${i * 35}ms">
        <span class="res-art" style="background-image:url('${artOf(a.seed, 200, a.motif)}')"></span>
        <span class="res-meta"><span class="res-title">${a.title}</span><span class="res-sub">${a.artist} · ${a.year}</span></span>
        <svg class="ic chev"><use href="#i-chev"/></svg>
      </button>`).join('') : '';

    $('#resArtists').innerHTML = artists.length ? `<p class="result-label">Artists</p>` + artists.map((a, i) => `
      <button class="res-card" data-artist="${a.id}" style="animation-delay:${i * 35}ms">
        <span class="res-art round" style="background-image:url('${artOf(a.seed, 200, 'bloom')}')"></span>
        <span class="res-meta"><span class="res-title">${a.name}</span><span class="res-sub">${a.tag}</span></span>
        <svg class="ic chev"><use href="#i-chev"/></svg>
      </button>`).join('') : '';

    empty.hidden = !!(songs.length || albums.length || artists.length);
  }

  /* ---------------- render: library ---------------- */
  function libItem(name, sub, img, kind, i) {
    return `<button class="lib-item" data-${kind}="${name}" style="animation-delay:${i * 35}ms">
      <div class="lib-art ${kind === 'artist' ? 'round' : ''}" style="background-image:url('${img}')"></div>
      <div class="lib-text"><p class="lib-name">${name}</p><p class="lib-sub">${sub}</p></div>
    </button>`;
  }

  function renderLibrary() {
    const body = $('#libBody');
    body.className = 'lib-body ' + (S.libLayout === 'list' ? 'lib-list' : (S.libSeg === 'artists' ? 'grid-3' : 'grid-2'));

    if (S.libSeg === 'playlists') {
      body.innerHTML = D.PLAYLISTS.map((p, i) =>
        libItem(p.name, p.desc, artOf(p.seed, 400, p.motif), 'playlist', i)).join('');
    } else if (S.libSeg === 'albums') {
      body.innerHTML = D.ALBUMS.map((a, i) =>
        libItem(a.title, a.artist + ' · ' + a.year, artOf(a.seed, 400, a.motif), 'album', i)).join('');
    } else {
      body.innerHTML = D.ARTISTS.map((a, i) =>
        libItem(a.name, a.tag, artOf(a.seed, 300, 'bloom'), 'artist', i)).join('');
    }

    $('#downloadList').innerHTML = D.DOWNLOADS.map((id, i) => {
      const t = D.trackById(id);
      return `<button class="trow" data-track="${t.id}">
        <span class="trow-art" style="background-image:url('${artOf(t.seed, 200, 'grid')}')"></span>
        <span class="trow-meta"><span class="trow-title">${t.title}</span>
        <span class="trow-sub">${t.artist} · offline</span></span>
        <svg class="ic" style="width:16px;height:16px;color:var(--accent-2)"><use href="#i-check"/></svg>
      </button>`;
    }).join('');
    $('#dlCount').textContent = D.DOWNLOADS.length + ' tracks';
  }

  /* ---------------- navigation ---------------- */
  function setTab(tab, silent) {
    if (S.tab === tab) return;
    S.tab = tab;
    $$('.view').forEach(v => v.classList.toggle('is-active', v.dataset.view === tab));
    $$('.tab').forEach(b => b.classList.toggle('is-active', b.dataset.tab === tab));
    moveDockIndicator();
    if (!silent) haptic('light');
    if (tab === 'search') setTimeout(() => { if (!SHOT) $('#searchInput').focus({ preventScroll: true }); }, 260);
  }

  function moveDockIndicator() {
    const dock = $('#dock'), ind = $('#dockInd');
    const btn = $('.tab.is-active', dock);
    if (!btn) return;
    const tabs = Array.from(dock.querySelectorAll('.tab'));
    const idx = tabs.indexOf(btn);
    ind.style.transform = `translateX(${idx * 100}%)`;
  }

  /* ---------------- player ---------------- */
  function applyTrack(t, animate) {
    S.track = t;
    const alb = D.albumByTitle(t.album) || D.ALBUMS[0];
    const art = artOf(alb.seed, 900, alb.motif);
    $('#pTitle').textContent = t.title;
    $('#pArtist').textContent = t.artist;
    $('#playerSource').textContent = t.album;
    $('#miniTitle').textContent = t.title;
    $('#miniArtist').textContent = t.artist;
    $('#miniArt').style.backgroundImage = `url('${artOf(alb.seed, 200, alb.motif)}')`;
    $('#worldArt').style.backgroundImage = `url('${artOf(alb.seed, 500, alb.motif)}')`;
    $('#playerBg').style.backgroundImage = `url('${art}')`;
    $('#artworkXL').style.backgroundImage = `url('${art}')`;
    $('#tDur').textContent = fmt(t.dur);
    S.progress = 0.0;
    updateProgress();
    if (animate) {
      const el = $('#artworkXL');
      el.animate([{ transform: 'scale(.94) rotateY(-6deg)', opacity: .4 }, { transform: 'none', opacity: 1 }],
        { duration: 520, easing: 'cubic-bezier(.22,1.12,.36,1)' });
    }
  }

  function updateProgress() {
    const t = S.track;
    $('#progress').value = Math.round(S.progress * 1000);
    $('#progress').style.setProperty('--pct', (S.progress * 100) + '%');
    $('#tCur').textContent = fmt(S.progress * t.dur);
    $('#miniBar').style.width = (S.progress * 100) + '%';
  }

  function setPlaying(p) {
    S.playing = p;
    $('#playBtn').classList.toggle('is-playing', p);
    $('#miniPlay').innerHTML = p
      ? '<svg class="ic"><use href="#i-pause"/></svg>'
      : '<svg class="ic"><use href="#i-play"/></svg>';
    if (p) startTicker(); else stopTicker();
  }

  let ticker = null;
  function startTicker() {
    stopTicker();
    ticker = setInterval(() => {
      if (!S.playing) return;
      S.progress += 1 / S.track.dur;
      if (S.progress >= 1) {
        S.progress = 0;
        nextTrack(false);
      }
      updateProgress();
    }, 1000);
  }
  function stopTicker() { if (ticker) clearInterval(ticker); ticker = null; }

  function nextTrack(dir) {
    const list = D.QUEUE;
    let i = list.indexOf(S.track.id);
    i = (i + (dir === -1 ? -1 : 1) + list.length) % list.length;
    applyTrack(D.trackById(list[i]), true);
    haptic('light');
  }

  /* shared-element open / close */
  function openPlayer(fromEl) {
    const player = $('#player');
    const art = $('#artworkXL');
    player.classList.add('is-open');
    player.setAttribute('aria-hidden', 'false');
    $('#dock').classList.add('hide');
    $('#mini').classList.add('hide');

    const startEl = fromEl || $('#miniArt');
    const s = startEl.getBoundingClientRect();
    const e = art.getBoundingClientRect();
    if (SHOT) return;

    const fly = $('#flyer');
    fly.style.backgroundImage = art.style.backgroundImage || `url('${artOf(D.ALBUMS[0].seed, 900, 'orb')}')`;
    fly.style.left = s.left + 'px'; fly.style.top = s.top + 'px';
    fly.style.width = s.width + 'px'; fly.style.height = s.height + 'px';
    fly.style.borderRadius = getComputedStyle(startEl).borderRadius;
    fly.style.opacity = '1';
    art.style.opacity = '0';

    const dx = e.left + e.width / 2 - (s.left + s.width / 2);
    const dy = e.top + e.height / 2 - (s.top + s.height / 2);
    const sc = e.width / s.width;

    const a = fly.animate([
      { transform: 'translate3d(0,0,0) scale(1)', borderRadius: '15px', opacity: 1 },
      { transform: `translate3d(${dx}px,${dy}px,0) scale(${sc})`, borderRadius: '30px', opacity: 1 }
    ], { duration: 640, easing: 'cubic-bezier(.22,1.06,.36,1)', fill: 'forwards' });

    a.onfinish = () => {
      fly.style.opacity = '0';
      fly.getAnimations().forEach(x => x.cancel());
      art.style.transition = 'opacity .18s';
      art.style.opacity = '1';
      setTimeout(() => { art.style.transition = ''; }, 200);
    };
    haptic('medium');
  }

  function closePlayer() {
    const player = $('#player');
    const art = $('#artworkXL');
    const s = art.getBoundingClientRect();
    const targetEl = $('#miniArt');
    $('#mini').classList.remove('hide');
    const e = targetEl.getBoundingClientRect();

    if (!SHOT) {
      const fly = $('#flyer');
      fly.style.backgroundImage = art.style.backgroundImage;
      fly.style.left = s.left + 'px'; fly.style.top = s.top + 'px';
      fly.style.width = s.width + 'px'; fly.style.height = s.height + 'px';
      fly.style.borderRadius = '30px';
      fly.style.opacity = '1';
      const dx = e.left + e.width / 2 - (s.left + s.width / 2);
      const dy = e.top + e.height / 2 - (s.top + s.height / 2);
      const sc = e.width / s.width;
      const a = fly.animate([
        { transform: 'translate3d(0,0,0) scale(1)', borderRadius: '30px', opacity: 1 },
        { transform: `translate3d(${dx}px,${dy}px,0) scale(${sc})`, borderRadius: '15px', opacity: .2 }
      ], { duration: 560, easing: 'cubic-bezier(.3,1.05,.4,1)', fill: 'forwards' });
      a.onfinish = () => { fly.style.opacity = '0'; fly.getAnimations().forEach(x => x.cancel()); };
      art.style.opacity = '0';
      setTimeout(() => { art.style.opacity = ''; }, 560);
    }

    player.classList.remove('is-open');
    player.setAttribute('aria-hidden', 'true');
    player.style.transform = '';
    $('#dock').classList.remove('hide');
    haptic('light');
  }

  /* ---------------- sheets ---------------- */
  function openSheet(id) {
    closeSheets();
    $('#scrim').classList.add('show');
    $(id).classList.add('show');
    $(id).setAttribute('aria-hidden', 'false');
    haptic('light');
  }
  function closeSheets() {
    $('#scrim').classList.remove('show');
    $$('.sheet').forEach(s => { s.classList.remove('show'); s.setAttribute('aria-hidden', 'true'); });
  }

  function renderLyrics() {
    $('#lyricsBody').innerHTML = D.LYRICS.map((l, i) =>
      l ? `<p class="lyric-line ${i > 3 && i < 7 ? 'now' : ''}">${l}</p>` : '<p style="height:10px"></p>').join('');
  }
  function renderQueue() {
    $('#queueBody').innerHTML = D.QUEUE.map((id, i) => {
      const t = D.trackById(id);
      return `<button class="qrow ${id === S.track.id ? 'now' : ''}" data-track="${id}">
        <span class="q-art" style="background-image:url('${artOf(t.seed, 200, 'orb')}')"></span>
        <span class="q-meta"><span class="q-title">${t.title}</span>
        <span class="q-sub">${t.artist} · ${fmt(t.dur)}</span></span>
        ${id === S.track.id ? '<svg class="ic" style="width:15px;height:15px;color:var(--accent)"><use href="#i-volume"/></svg>' : ''}
      </button>`;
    }).join('');
  }

  /* ---------------- studio ---------------- */
  function applyGlass(cfg) {
    root.style.setProperty('--alpha', (cfg.alpha / 100).toFixed(3));
    root.style.setProperty('--blur', cfg.blur + 'px');
    root.style.setProperty('--refract', (cfg.refract / 100).toFixed(3));
    root.style.setProperty('--reflect', (cfg.reflect / 100).toFixed(3));
    root.style.setProperty('--depth', (cfg.depth / 100).toFixed(3));
    root.style.setProperty('--border', (cfg.border / 100).toFixed(3));
    root.style.setProperty('--shadow', (cfg.shadow / 100).toFixed(3));
    root.style.setProperty('--tint-h', cfg.tint);
    root.style.setProperty('--tint-s', cfg.sat + '%');
    root.dataset.glass = cfg.glass;
    // keep both switches in sync
    syncSwitch($('#glassSwitch'), cfg.glass === 'light');
    syncSwitch($('#studioGlassSwitch'), cfg.glass === 'light');
    $('#appearanceSub').textContent = cfg.glass === 'light' ? 'Light material' : 'Dark material';
  }

  function readStudio() {
    return {
      alpha: +$('#sAlpha').value, blur: +$('#sBlur').value, refract: +$('#sRefract').value,
      reflect: +$('#sReflect').value, depth: +$('#sDepth').value, border: +$('#sBorder').value,
      shadow: +$('#sShadow').value, tint: +$('#sTint').value, sat: +$('#sSat').value,
      glass: root.dataset.glass
    };
  }

  function paintLabels(cfg) {
    $('#vAlpha').textContent = cfg.alpha + '%';
    $('#vBlur').textContent = cfg.blur + 'px';
    $('#vRefract').textContent = cfg.refract + '%';
    $('#vReflect').textContent = cfg.reflect + '%';
    $('#vDepth').textContent = cfg.depth + '%';
    $('#vBorder').textContent = cfg.border + '%';
    $('#vShadow').textContent = cfg.shadow + '%';
    $('#vTint').textContent = 'Hue ' + cfg.tint + '°';
    $('#vSat').textContent = cfg.sat + '%';
    ['sAlpha', 'sBlur', 'sRefract', 'sReflect', 'sDepth', 'sBorder', 'sShadow', 'sTint', 'sSat'].forEach(id => {
      const el = $('#' + id), v = +el.value, min = +el.min, max = +el.max;
      el.style.setProperty('--pct', ((v - min) / (max - min) * 100) + '%');
    });
    $('#sTint').style.setProperty('--pct', (cfg.tint / 360 * 100) + '%');
  }

  function setStudioValues(cfg) {
    $('#sAlpha').value = cfg.alpha; $('#sBlur').value = cfg.blur;
    $('#sRefract').value = cfg.refract; $('#sReflect').value = cfg.reflect;
    $('#sDepth').value = cfg.depth; $('#sBorder').value = cfg.border;
    $('#sShadow').value = cfg.shadow; $('#sTint').value = cfg.tint; $('#sSat').value = cfg.sat;
    root.dataset.glass = cfg.glass;
    applyGlass(cfg);
    paintLabels(cfg);
  }

  function openStudio() {
    const el = $('#studio');
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
    $('#dock').classList.add('hide');
    $('#mini').classList.add('hide');
    haptic('medium');
  }
  function closeStudio() {
    const el = $('#studio');
    el.classList.remove('is-open');
    el.setAttribute('aria-hidden', 'true');
    if (!$('#player').classList.contains('is-open')) {
      $('#dock').classList.remove('hide');
      $('#mini').classList.remove('hide');
    }
    haptic('light');
  }

  /* ---------------- switches / settings ---------------- */
  function syncSwitch(el, on) {
    if (!el) return;
    el.dataset.on = on ? 'true' : 'false';
    el.classList.toggle('is-on', !!on);
  }
  function bindSwitch(id, onChange) {
    const el = $('#' + id);
    el.addEventListener('click', () => {
      const on = el.dataset.on !== 'true';
      syncSwitch(el, on);
      haptic('light');
      if (onChange) onChange(on);
    });
  }

  function applyTheme(theme) {
    root.dataset.theme = theme;
    S.settings.theme = theme;
    $$('.theme-swatch').forEach(b => b.classList.toggle('is-on', b.dataset.theme === theme));
    const meta = { midnight: '#05060c', aurora: '#04090c', daylight: '#eef1f8' };
    $('meta[name="theme-color"]').setAttribute('content', meta[theme] || '#05060c');
  }

  function applyQuality(q) {
    root.dataset.quality = q;
    S.settings.quality = q;
    $$('#qualityRow button').forEach(b => b.classList.toggle('is-on', b.dataset.q === q));
    const label = { high: 'High — full glass', medium: 'Balanced — lighter blur', low: 'Battery — no blur' };
    $('#qualityLabel').textContent = label[q];
  }

  function applySpeed(v) {
    S.settings.speed = v;
    const mul = 1.45 - (v / 100) * 0.9;   // 0 → 1.45x slower, 100 → 0.55x faster
    root.style.setProperty('--dur', mul.toFixed(2));
    const label = v < 25 ? 'Cinematic' : v < 50 ? 'Relaxed' : v < 75 ? 'Balanced' : 'Snappy';
    $('#speedLabel').textContent = label;
    // scale every transition that opts in
    document.body.style.setProperty('--speed-mul', mul);
  }

  function persist() {
    S.settings.glassCfg = readStudio();
    store('aura.settings', S.settings);
  }

  /* ---------------- parallax / tilt ---------------- */
  function initParallax() {
    $$('.scroll').forEach(sc => {
      let raf = null;
      sc.addEventListener('scroll', () => {
        if (!S.settings.parallax) return;
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = null;
          const y = sc.scrollTop;
          const hero = $('#heroEl');
          if (hero && sc.contains(hero)) {
            const k = Math.min(y, 260);
            hero.style.transform = `translate3d(0,${k * 0.10}px,0) scale(${1 - k * 0.00016})`;
            hero.style.opacity = String(Math.max(.35, 1 - k / 620));
          }
          const head = sc.querySelector('.home-head');
          if (head) head.style.transform = `translate3d(0,${Math.min(y, 120) * -0.12}px,0)`;
        });
      }, { passive: true });
    });
  }

  function initTilt() {
    const targets = '.card, .cat, .lib-item, .hero, .artist';
    document.addEventListener('pointerdown', e => {
      if (!S.settings.parallax) return;
      const el = e.target.closest(targets);
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - .5;
      const py = (e.clientY - r.top) / r.height - .5;
      el.style.transform = `perspective(700px) rotateY(${px * 7}deg) rotateX(${-py * 7}deg) scale(.975)`;
      el.style.transition = 'transform .12s ease-out';
    }, { passive: true });
    const reset = () => $$(targets).forEach(el => {
      if (!el.style.transform) return;
      el.style.transition = 'transform .55s cubic-bezier(.22,1.12,.36,1)';
      el.style.transform = '';
    });
    document.addEventListener('pointerup', reset, { passive: true });
    document.addEventListener('pointercancel', reset, { passive: true });
  }

  /* ---------------- global click routing ---------------- */
  function initClicks() {
    document.addEventListener('click', e => {
      const t = e.target;

      const trackEl = t.closest('[data-track]');
      if (trackEl) {
        applyTrack(D.trackById(trackEl.dataset.track), true);
        if (S.tab === 'search') $('#searchInput').value = trackEl.dataset.track && '';
        openPlayer($('#miniArt'));
        return;
      }
      const albumEl = t.closest('[data-album]');
      if (albumEl) {
        const alb = D.ALBUMS.find(a => a.id === albumEl.dataset.album);
        const tr = D.TRACKS.find(x => x.album === alb.title) || D.TRACKS[0];
        applyTrack(tr, true);
        openPlayer($('#miniArt'));
        return;
      }
      const artistEl = t.closest('[data-artist]');
      if (artistEl) {
        const ar = D.ARTISTS.find(a => a.id === artistEl.dataset.artist);
        const tr = D.TRACKS.find(x => x.artist === ar.name) || D.TRACKS[0];
        applyTrack(tr, true);
        openPlayer($('#miniArt'));
        return;
      }
      const qEl = t.closest('[data-q]');
      if (qEl) {
        const q = qEl.dataset.q;
        $('#searchInput').value = q;
        $('#searchField').classList.add('has-text');
        runSearch(q);
        if (S.tab !== 'search') setTab('search');
        haptic('light');
        return;
      }
      const catEl = t.closest('[data-cat]');
      if (catEl) {
        toast(catEl.dataset.cat + ' · 24 tracks');
        haptic('light');
        return;
      }
      const segEl = t.closest('.seg');
      if (segEl) {
        S.libSeg = segEl.dataset.seg;
        $$('.seg').forEach(b => b.classList.toggle('is-on', b === segEl));
        moveSegIndicator();
        renderLibrary();
        haptic('light');
        return;
      }
    });
  }

  function moveSegIndicator() {
    const ind = $('#segIndicator');
    const on = $('.seg.is-on');
    if (!ind || !on) return;
    const parent = on.parentElement;
    const idx = Array.from(parent.querySelectorAll('.seg')).indexOf(on);
    ind.style.transform = `translateX(${idx * 100}%)`;
  }

  /* ---------------- boot ---------------- */
  function init() {
    // restore settings
    const saved = load('aura.settings');
    if (saved) Object.assign(S.settings, saved);

    applyTheme(S.settings.theme);
    applyQuality(S.settings.quality);
    applySpeed(S.settings.speed);
    syncSwitch($('#motionSwitch'), S.settings.motion);
    syncSwitch($('#parallaxSwitch'), S.settings.parallax);
    syncSwitch($('#reduceSwitch'), S.settings.reduce);
    syncSwitch($('#glassSwitch'), S.settings.glass === 'light');
    syncSwitch($('#studioGlassSwitch'), S.settings.glass === 'light');
    $('#speedRange').value = S.settings.speed;
    $('#speedRange').style.setProperty('--pct', S.settings.speed + '%');
    root.dataset.reduce = S.settings.reduce ? 'true' : 'false';
    root.dataset.motion = S.settings.motion ? 'on' : 'off';

    // device profile
    const mem = navigator.deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    $('#deviceLabel').textContent = `${cores} cores · ${mem} GB · Android WebView`;
    if (!saved && !SHOT && (mem <= 3 || cores <= 4)) applyQuality('medium');

    // studio defaults
    const cfg = S.settings.glassCfg || Object.assign({}, DEFAULTS, { glass: S.settings.glass });
    setStudioValues(cfg);

    renderHome();
    renderSearchIdle();
    renderLibrary();
    renderLyrics();
    renderQueue();
    applyTrack(S.track, false);
    S.progress = 0.32; updateProgress();
    $('#profileArt').style.backgroundImage = `url('${artOf('nova-kaur', 200, 'bloom')}')`;
    $('#previewArt').style.backgroundImage = `url('${artOf('neon-monsoon', 700, 'orb')}')`;
    $('#previewThumb').style.backgroundImage = `url('${artOf('neon-monsoon', 200, 'orb')}')`;

    moveDockIndicator();
    moveSegIndicator();
    initParallax();
    initTilt();
    initClicks();

    /* dock */
    $$('.tab').forEach(b => b.addEventListener('click', () => setTab(b.dataset.tab)));

    /* home search shortcut */
    $('#homeSearch').addEventListener('click', () => { setTab('search'); haptic('light'); });

    /* search */
    const input = $('#searchInput'), field = $('#searchField');
    input.addEventListener('focus', () => field.classList.add('is-focus'));
    input.addEventListener('blur', () => field.classList.remove('is-focus'));
    input.addEventListener('input', () => {
      const v = input.value;
      field.classList.toggle('has-text', !!v);
      runSearch(v);
    });
    $('#searchClear').addEventListener('click', () => {
      input.value = ''; field.classList.remove('has-text'); runSearch('');
      input.focus({ preventScroll: true });
    });
    $('#clearRecent').addEventListener('click', () => {
      S.recentSearches = [];
      $('#recentChips').innerHTML = '<p class="row-sub" style="padding:2px 0">No recent searches</p>';
      toast('Recent searches cleared');
    });

    /* library */
    $('#layoutToggle').addEventListener('click', () => {
      S.libLayout = S.libLayout === 'grid' ? 'list' : 'grid';
      $('#layoutToggle').innerHTML = `<svg class="ic"><use href="#i-${S.libLayout === 'grid' ? 'grid' : 'list'}"/></svg>`;
      renderLibrary();
      haptic('light');
    });

    /* mini player */
    $('#mini').addEventListener('click', e => {
      if (e.target.closest('#miniPlay') || e.target.closest('#miniNext')) return;
      openPlayer($('#miniArt'));
    });
    $('#miniPlay').addEventListener('click', e => { e.stopPropagation(); setPlaying(!S.playing); haptic('light'); });
    $('#miniNext').addEventListener('click', e => { e.stopPropagation(); nextTrack(1); });

    /* player controls */
    $('#closePlayer').addEventListener('click', closePlayer);
    $('#playBtn').addEventListener('click', () => { setPlaying(!S.playing); haptic('medium'); });
    $('#nextBtn').addEventListener('click', () => nextTrack(1));
    $('#prevBtn').addEventListener('click', () => nextTrack(-1));
    $('#shuffleBtn').addEventListener('click', e => {
      S.shuffle = !S.shuffle; e.currentTarget.classList.toggle('is-on', S.shuffle);
      toast(S.shuffle ? 'Shuffle on' : 'Shuffle off'); haptic('light');
    });
    $('#repeatBtn').addEventListener('click', e => {
      S.repeat = !S.repeat; e.currentTarget.classList.toggle('is-on', S.repeat);
      toast(S.repeat ? 'Repeat all' : 'Repeat off'); haptic('light');
    });
    $('#pFav').addEventListener('click', e => {
      S.fav = !S.fav; e.currentTarget.classList.toggle('is-on', S.fav);
      toast(S.fav ? 'Added to favourites' : 'Removed from favourites'); haptic('medium');
    });
    $('#progress').addEventListener('input', e => {
      S.progress = e.target.value / 1000;
      updateProgress();
    });
    $('#lyricsBtn').addEventListener('click', () => { renderLyrics(); openSheet('#sheetLyrics'); });
    $('#queueBtn').addEventListener('click', () => { renderQueue(); openSheet('#sheetQueue'); });
    $('#shareBtn').addEventListener('click', () => toast('Output · Phone speaker'));
    $('#playerMore').addEventListener('click', () => toast('Track options'));
    $('#scrim').addEventListener('click', closeSheets);
    $$('[data-close-sheet]').forEach(b => b.addEventListener('click', closeSheets));

    /* drag-to-close player */
    let dy = 0, dragging = false, startY = 0;
    const player = $('#player');
    player.addEventListener('touchstart', e => {
      if (e.target.closest('input') || e.target.closest('button')) return;
      startY = e.touches[0].clientY; dragging = true; dy = 0;
      player.style.transition = 'none';
    }, { passive: true });
    player.addEventListener('touchmove', e => {
      if (!dragging) return;
      dy = Math.max(0, e.touches[0].clientY - startY);
      const k = Math.min(dy / 900, .12);
      player.style.transform = `translateY(${dy}px) scale(${1 - k})`;
      player.style.opacity = String(1 - k * 2.2);
    }, { passive: true });
    player.addEventListener('touchend', () => {
      if (!dragging) return;
      dragging = false;
      player.style.transition = '';
      if (dy > 120) { closePlayer(); }
      else { player.style.transform = ''; player.style.opacity = ''; }
    }, { passive: true });

    /* settings */
    $$('.theme-swatch').forEach(b => b.addEventListener('click', () => {
      applyTheme(b.dataset.theme); persist(); haptic('light');
    }));
    bindSwitch('glassSwitch', on => {
      root.dataset.glass = on ? 'light' : 'dark';
      syncSwitch($('#studioGlassSwitch'), on);
      S.settings.glass = on ? 'light' : 'dark';
      $('#appearanceSub').textContent = on ? 'Light material' : 'Dark material';
      persist();
    });
    bindSwitch('motionSwitch', on => {
      S.settings.motion = on;
      root.dataset.motion = on ? 'on' : 'off';
      persist();
    });
    bindSwitch('parallaxSwitch', on => { S.settings.parallax = on; persist(); });
    bindSwitch('reduceSwitch', on => {
      S.settings.reduce = on;
      root.dataset.reduce = on ? 'true' : 'false';
      persist();
    });
    $('#speedRange').addEventListener('input', e => {
      applySpeed(+e.target.value);
      e.target.style.setProperty('--pct', e.target.value + '%');
      persist();
    });
    $$('#qualityRow button').forEach(b => b.addEventListener('click', () => {
      applyQuality(b.dataset.q); persist(); haptic('light');
      toast('Blur quality: ' + b.textContent);
    }));

    /* studio */
    $('#openStudio').addEventListener('click', openStudio);
    $('#closeStudio').addEventListener('click', closeStudio);
    const studioInputs = ['sAlpha', 'sBlur', 'sRefract', 'sReflect', 'sDepth', 'sBorder', 'sShadow', 'sTint', 'sSat'];
    studioInputs.forEach(id => {
      $('#' + id).addEventListener('input', () => {
        const cfg = readStudio();
        applyGlass(cfg);
        paintLabels(cfg);
      });
    });
    bindSwitch('studioGlassSwitch', on => {
      root.dataset.glass = on ? 'light' : 'dark';
      syncSwitch($('#glassSwitch'), on);
      $('#appearanceSub').textContent = on ? 'Light material' : 'Dark material';
      S.settings.glass = on ? 'light' : 'dark';
    });
    const doReset = () => {
      setStudioValues(Object.assign({}, DEFAULTS, { glass: 'dark' }));
      S.settings.glass = 'dark';
      syncSwitch($('#glassSwitch'), false);
      toast('Reset to default glass');
      haptic('medium');
    };
    $('#resetStudio').addEventListener('click', doReset);
    $('#resetStudio2').addEventListener('click', doReset);
    $('#saveStudio').addEventListener('click', () => {
      persist();
      toast('Appearance saved');
      haptic('medium');
      const btn = $('#saveStudio');
      btn.animate([{ transform: 'scale(1)' }, { transform: 'scale(.94)' }, { transform: 'scale(1)' }],
        { duration: 420, easing: 'cubic-bezier(.34,1.42,.64,1)' });
    });

    /* android back */
    window.appBack = function () {
      if ($('#studio').classList.contains('is-open')) { closeStudio(); return true; }
      if ($('.sheet.show')) { closeSheets(); return true; }
      if (player.classList.contains('is-open')) { closePlayer(); return true; }
      if (S.tab !== 'home') { setTab('home'); return true; }
      return false;
    };

    /* keyboard (desktop preview) */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') window.appBack();
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); setTab('search');
      }
      if (e.key === ' ' && !/input|textarea/i.test(document.activeElement.tagName)) {
        e.preventDefault(); setPlaying(!S.playing);
      }
    });

    /* screenshot / deep-link support */
    const screen = params.get('screen');
    if (screen) applyScreenState(screen);

    window.addEventListener('resize', () => { moveDockIndicator(); moveSegIndicator(); });
    setTimeout(moveDockIndicator, 120);
  }

  function applyScreenState(screen) {
    if (screen === 'player') {
      openPlayer($('#miniArt'));
    } else if (screen === 'lyrics') {
      openPlayer($('#miniArt')); renderLyrics(); openSheet('#sheetLyrics');
    } else if (screen === 'queue') {
      openPlayer($('#miniArt')); renderQueue(); openSheet('#sheetQueue');
    } else if (screen === 'studio') {
      openStudio();
    } else if (screen === 'search') {
      setTab('search', true);
      const q = params.get('q');
      if (q) { $('#searchInput').value = q; $('#searchField').classList.add('has-text'); runSearch(q); }
    } else if (['home', 'library', 'settings'].includes(screen)) {
      setTab(screen, true);
    }
    if (params.get('seg')) {
      S.libSeg = params.get('seg');
      $$('.seg').forEach(b => b.classList.toggle('is-on', b.dataset.seg === S.libSeg));
      moveSegIndicator(); renderLibrary();
    }
    if (params.get('theme')) applyTheme(params.get('theme'));
    if (params.get('glass')) {
      root.dataset.glass = params.get('glass');
      syncSwitch($('#glassSwitch'), params.get('glass') === 'light');
      syncSwitch($('#studioGlassSwitch'), params.get('glass') === 'light');
    }
    if (params.get('alpha')) root.style.setProperty('--alpha', params.get('alpha'));
    if (params.get('blur')) root.style.setProperty('--blur', params.get('blur') + 'px');
    if (params.get('scroll')) {
      const sc = $('.view.is-active .scroll');
      if (sc) sc.scrollTop = +params.get('scroll');
    }
    if (params.get('layout')) {
      S.libLayout = params.get('layout');
      $('#layoutToggle').innerHTML = `<svg class="ic"><use href="#i-${S.libLayout === 'grid' ? 'grid' : 'list'}"/></svg>`;
      renderLibrary();
    }
  }

  if (SHOT) {
    const st = document.createElement('style');
    st.textContent = '*,*::before,*::after{animation:none !important;transition:none !important}';
    document.head.appendChild(st);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
