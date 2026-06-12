# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal website for concert pianist Hanzheng Li. A single static page built on the
**HTML5 UP "Dimension"** template. **No framework, no package.json, no build step** — it's
plain HTML/CSS/JS served as-is.

- Hosted on **GitHub Pages** from `main`. Pushing to `main` deploys.
- Custom domain `hanzhengli.com` is set via the `CNAME` file (repo name is the legacy
  `hanzheng-li.github.io`).

## Local preview & deploy

```bash
python3 -m http.server 8000      # then open http://localhost:8000
```

Just opening `index.html` in a browser also works for most things, but the contact form
(getform.io + reCAPTCHA) only behaves correctly over http(s). **Deploy = commit + push to
`main`**; there is no separate build or publish command.

## Architecture

Everything the visitor sees lives in **`index.html`**. The page is a faux-SPA:

- The landing view is `#header` (name, tagline, nav). Each nav item links to a `#hash`.
- Content sections are `<article>` elements inside `<div id="main">` (`#bio`, `#bio_zh`,
  `#videos`, `#events`, `#contact`). They're hidden by default and shown one at a time as
  full-screen "modal" panels.
- **`assets/js/main.js`** drives all of this by listening to `hashchange`: it shows/hides
  articles, animates the depth transition, wires up the Close button (set `location.hash = ''`),
  and closes on Esc / background click. To add a section you add both an `<article id="x">`
  **and** a `<li><a href="#x">` nav entry — the JS discovers articles automatically.

### Styling: SASS is source, CSS is the served artifact

- The browser loads **`assets/css/main.css`** (committed, pre-compiled) — plus a tiny
  `assets/css/noscript.css` no-JS fallback (also compiled from `assets/sass/`).
- **`assets/sass/`** is the original template's SASS source. There is **no compiler wired up**
  in this repo (no package.json / Gemfile / config). So either:
  - edit `assets/css/main.css` directly (simplest for small tweaks), **or**
  - recompile after editing SASS: `sass assets/sass/main.scss assets/css/main.css` (requires a
    Sass binary you install yourself).
  - If you only edit `.scss`, the change will **not** appear until `main.css` is regenerated.
- Theme constants (colors, fonts, breakpoints) live in `assets/sass/libs/_vars.scss`. The dark
  palette and `Source Sans Pro` font come from there.
- The fullscreen background image is **not** in the HTML — it's `url('../../images/bg.jpg')` in
  `assets/sass/layout/_bg.scss` / `main.css`. Swap the background by replacing `images/bg.jpg`
  (the `bg_orig.jpg` / `bg.jpg.bak*` files are prior versions kept around).

### Vendored libraries (don't hand-edit)

`assets/js/{jquery,browser,breakpoints}.min.js`, the non-minified `assets/js/util.js`, and `assets/css/fontawesome-all.min.css`
+ `assets/webfonts/` are third-party template/Font Awesome files. The logo and contact icons
are Font Awesome classes (e.g. `fas fa-music`, `fas fa-at`).

## Content editing notes

- **Bilingual bio:** `#bio` (English) and `#bio_zh` (中文简历) are separate articles. The Chinese
  one exists but its nav link is **commented out** in the `<nav>` — uncomment the
  `<li><a href="#bio_zh">` line to expose it.
- **Videos** are hardcoded YouTube `<iframe>` embeds in the `#videos` article, each wrapped in a
  `padding-top:60%` responsive box with an optional performer caption below.
- **Events** is a manually maintained `<ul>` grouped by year (`<h1>` year headers + `<hr>`
  separators), newest first.
- **Contact form** posts to a **getform.io** endpoint (`action="https://getform.io/f/..."`) and
  uses **Google reCAPTCHA v3**. The reCAPTCHA site key appears twice in `index.html` (the
  `<script src=...?render=KEY>` tag in `<head>` and the `grecaptcha.execute('KEY', ...)` call at
  the bottom) — keep both in sync if it ever changes.
- Leftover template bits are intentionally inert: the `#elements` nav link is commented out, and
  `images/pic01–03.jpg` are unused demo images.

## Formatting

`index.html` was last tidied with **Prettier** (there's a "prettier formatting" commit but no
config file is committed; the vendored JS/CSS were left untouched). Match the existing
4-space-indented, attribute-per-line style of `index.html` rather than assuming Prettier defaults.
