# Aura — Liquid Glass Music Player

A premium, next-generation **music player UI prototype for Android**, built around a true layered
Liquid Glass material system, 4D depth, and macOS-style spring motion.

> **UI prototype only.** No audio playback, no streaming, no accounts, no backend.
> Every screen, control and transition is real and interactive — the catalogue is mock data and
> every cover is generated procedurally at runtime.

<p align="center">
  <img src="screenshots/01-home.png" width="260" alt="Home">
  <img src="screenshots/03-now-playing.png" width="260" alt="Now playing">
  <img src="screenshots/13-glass-studio.png" width="260" alt="Liquid Glass Studio">
</p>

---

## Download

| | |
|---|---|
| **Download APK** | **[Aura 1.0.0 — release page](https://github.com/technicalnihilist-lgtm/aura-liquid-glass/releases/latest)** · 207 KB, signed |
| Mirror | [`apk/aura-liquid-glass-1.0.0.apk`](apk/aura-liquid-glass-1.0.0.apk) in the repo |
| **Package** | `ai.aura.liquidglass` |
| **Requires** | Android 7.0 (API 24) and above, arm64 / armeabi-v7a / x86 |
| **Install** | `adb install apk/aura-liquid-glass-1.0.0.apk` (or copy to the phone and tap) |

The APK is signed with a locally generated release key, so it installs on a normal device without
any developer settings.

---

## Screens

| Home | Discovery | Now Playing | Lyrics |
|---|---|---|---|
| ![](screenshots/01-home.png) | ![](screenshots/02-home-discovery.png) | ![](screenshots/03-now-playing.png) | ![](screenshots/04-lyrics.png) |

| Queue | Search | Results | Library |
|---|---|---|---|
| ![](screenshots/05-queue.png) | ![](screenshots/06-search.png) | ![](screenshots/07-search-results.png) | ![](screenshots/08-library-grid.png) |

| Library list | Artists | Settings | Studio entry |
|---|---|---|---|
| ![](screenshots/09-library-list.png) | ![](screenshots/10-library-artists.png) | ![](screenshots/11-settings.png) | ![](screenshots/12-settings-studio.png) |

| Glass Studio | Studio — light | Light appearance |
|---|---|---|
| ![](screenshots/13-glass-studio.png) | ![](screenshots/14-glass-studio-light.png) | ![](screenshots/15-light-appearance.png) |

---

## 1. True Liquid Glass

Every surface is a stack of real layers, not a translucent rectangle:

- **Backdrop sampling** — `backdrop-filter: blur() saturate(180%) brightness()` on the material, so the
  aurora background and the album bloom genuinely show through and respond to what is behind them.
- **Gradient hairline border** — a 1px ring painted with `mask-composite: exclude`, brighter at the
  top-left, dimmer through the middle, catching light again at the bottom-right.
- **Refraction ring** — a 2px inner rim with its *own* backdrop filter (`blur(1px) brightness(1.22)
  saturate(160%) contrast(1.25)`), which bends and brightens the light that passes through the edge
  of the material, exactly where a real glass rim would.
- **Specular + depth shadows** — inset top highlight, inset bottom shadow, an inner tint glow and two
  layers of elevation shadow, all scaled by the depth setting.
- **Dynamic tint** — the fill is `hsla()` driven by hue and saturation, so the whole material can be
  recoloured live.
- **Film grain** — one fixed `feTurbulence` overlay at 5% in `overlay` blend, for a filmic finish.

A subtle detail that matters: glass elements are stacking contexts (`z-index: 0`) but deliberately
**not** `isolation: isolate` — an isolated element becomes its own backdrop root in Chromium, which
silently kills the blur. That one line is the difference between glass and a grey box.

## 2. 4D depth

- Layered elevation: artwork, its bloom, the floating control bar, the sheets and the dock all sit at
  different depths with different shadow spreads.
- **Parallax** — the hero card translates and scales against the scroll, the greeting drifts at a
  different rate; both are rAF-throttled and write only `transform`/`opacity`.
- **Press tilt** — cards, categories and artwork tilt in perspective toward the touch point and spring
  back on release.
- **Layered album artwork** — a procedurally generated cover, a coloured bloom behind it, a specular
  sheen on top, and an edge ring — four layers on one image.
- The full player uses `perspective: 1200px` so the artwork can rotate in Z during transitions.

## 3. Open / close bounce

Every popup, sheet, modal, panel and the full player share one motion language:

- **Open** — scale from 0.94–0.96 with a slight Y offset, opacity 0 → 1, `cubic-bezier(.22, 1.12, .36, 1)`
  which overshoots and settles: a real spring bounce, not an ease.
- **Close** — the reverse spring, with the material fading and losing depth; nothing ever disappears
  instantly.
- The full player uses a **shared-element (FLIP) transition**: the mini-player thumbnail detaches into a
  flying layer, morphs to the artwork's exact rect with its border radius animating 15px → 30px, while
  the screen fades and scales in behind it. Closing reverses it.

## 4. Fluid transitions

- Shared-element mini → full player, and back.
- Tab switching cross-fades and scales views; the dock's active pill slides with a spring.
- Library grid ⇄ list re-layouts with staggered card entrances.
- Segmented control indicator slides on a spring; search states cross-fade between idle and results.
- Drag the player down to dismiss it — the sheet follows your finger, then decides: spring back or close.
- Overscroll is contained, scrolling is native-momentum, no flicker or layout jumps.

## 5. Home

Greeting, glass search bar, recently played carousel, featured album hero with a glass overlay card,
trending chart list, artist circles, mood categories, floating mini player and the glass dock.

## 6. Now Playing

Dominant artwork with a bloom and sheen, track + artist, scrubbable progress with live timecodes,
shuffle / previous / play / next / repeat, favourite, lyrics sheet, queue sheet and an output pill —
all inside floating transparent glass.

## 7. Search

Large glass field that scales and gains an accent focus ring on activation, recent searches, trending
searches, mood categories, and live filtering across songs, albums and artists with staggered results.

## 8. Library

Playlists / Albums / Artists segments, animated grid ⇄ list switching, and a downloaded-tracks list.

## 9. Liquid Glass Studio

The **last item on the Settings screen**, opening a dedicated customisation surface:

| Control | Range | Effect |
|---|---|---|
| Transparency | 0–100% | fill alpha of every glass surface |
| Background blur | 0–60px | backdrop blur radius |
| Glass refraction | 0–100% | intensity of the refractive edge ring |
| Glass reflection | 0–100% | specular highlight strength |
| Glass depth | 0–100% | elevation shadows + inner glow |
| Border highlights | 0–100% | hairline border intensity |
| Shadow intensity | 0–100% | ambient + key shadow |
| Glass tint | hue 0–360° | material hue |
| Tint saturation | 0–100% | material saturation |
| Appearance | light / dark | full light material with its own world, ink and shadows |

All values are written to CSS custom properties on the document root, so **the entire app re-materials
in real time** — dock, mini player, sheets, player and the studio panel itself. `Reset to default` and
`Save appearance` (persisted to local storage) are included.

## 10. Settings

macOS-inspired grouped list: profile, Appearance (theme + glass appearance), Motion (springs, speed,
parallax), Performance (blur quality, reduce transparency, device profile), About — and **Liquid Glass
Studio at the very bottom**.

## 11. Navigation

Floating glass dock with Home / Search / Library / Settings, a sliding glass indicator with spring
physics, icon scale feedback and haptic taps (through the native bridge).

## 12. Performance

- Only `transform` and `opacity` are animated; no layout-triggering properties in motion.
- Parallax and scroll effects are rAF-throttled and read once per frame.
- Backdrop layers are bounded — the ambient background uses soft radial gradients instead of blurred
  blobs, so there is no full-screen blur pass behind the glass.
- **Three quality tiers** (High / Balanced / Battery): Balanced cuts blur to 62%, Battery drops
  backdrop-filter entirely and paints solid material, disables grain and background motion.
- **Reduce transparency** switch for the strongest compatibility mode.
- `@supports not (backdrop-filter)` fallback to solid material, plus `prefers-reduced-motion` and a
  global motion switch.
- Auto-detects low-end devices (`deviceMemory` / `hardwareConcurrency`) and starts in Balanced.
- Layout is fluid from 320 dp phones to tablets, with safe-area insets and cutout support.

---

## Architecture

```
app/src/main/
├── java/ai/aura/liquidglass/MainActivity.java   native shell: edge-to-edge, haptics, back gesture
├── assets/web/                                  the UI
│   ├── index.html                               all screens as one navigable surface
│   ├── styles.css                               design tokens, glass system, motion, screens
│   ├── art.js                                   procedural SVG cover-art generator
│   ├── data.js                                  fictional catalogue (no real artists)
│   └── app.js                                   router, springs, FLIP transitions, studio bindings
└── res/                                         theme, adaptive launcher icon
```

**Why a WebView surface?** The brief asks for an authentic layered-glass material with live
re-materialing, spring physics and shared-element transitions, on low-end hardware. That stack —
`backdrop-filter` with masked refraction rings, CSS custom properties driving every surface, WAAPI
spring curves and GPU-composited transforms — is exactly what a modern Android System WebView renders
natively. The result is a 207 KB APK with zero third-party dependencies, and a design system that can
be re-materialed at runtime without recomposition. The activity is a thin, fully native shell:
edge-to-edge insets, cutout handling, vibration haptics through a JS bridge, and system back routed
into the UI first.

### Build it yourself

```bash
# JDK 17, Android SDK 35 + build-tools 35.0.0
export ANDROID_HOME=/path/to/android-sdk
./gradlew assembleRelease      # or: gradle assembleRelease
# → app/build/outputs/apk/release/app-release.apk
```

Signing is optional and never committed: drop a keystore at `app/keystore/aura-release.jks` and the
release build signs itself (`AURA_STORE_PASS`, `AURA_KEY_ALIAS`, `AURA_KEY_PASS`).

### Try the UI in a browser

The interface is plain HTML/CSS/JS — open `app/src/main/assets/web/index.html` in a Chromium browser
for the full experience (backdrop blur, springs, all screens). Deep links used for the screenshots:

```
index.html?screen=home|search|library|settings|player|studio|lyrics|queue
          &q=nova&seg=albums&layout=list&scroll=660&glass=light&theme=midnight
```

---

## Mock data

Every artist, album and track is fictional ("Nova Kaur", "Aria Vale", "Selene", "Ravi Anand",
"Kite & Ember"…) and every cover is generated from a seed at runtime — layered SVG light fields,
geometry and vignettes. No third-party artwork, no Apple assets, no real catalogue.

## Scope

**Included:** all UI, navigation, animations, responsiveness, the glass material system, the studio.
**Not included by design:** audio playback, streaming services, BitChord, authentication, backend,
downloads, analytics.

## License

MIT — see [LICENSE](LICENSE).
