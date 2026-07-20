<div align="center">

# 🤖 Modern Robotics · Study

Interactive study notes for **Kevin M. Lynch & Frank C. Park's**
**_[Modern Robotics: Mechanics, Planning, and Control](https://hades.mech.northwestern.edu/index.php/Modern_Robotics)_**
— all 13 chapters, bilingual (EN · 한국어), with an interactive simulation for every key concept.

🔗 **[Open the live site →](https://robotics-study.github.io/modern_robotics/)**

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss&logoColor=white)
![Babylon.js](https://img.shields.io/badge/Babylon.js-7-BB464B?logo=babylondotjs&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

</div>

---

## Contents

- [Overview](#overview)
- [Chapters](#chapters)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Project structure](#project-structure)
- [Sample code](#sample-code)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

> **Disclaimer.** These are unofficial, non-commercial study notes based on Kevin M. Lynch &
> Frank C. Park's _Modern Robotics: Mechanics, Planning, and Control_ (Cambridge University Press,
> 2017). This project is **not affiliated with or endorsed by** the authors or the publisher. All
> explanatory text, code, and interactive figures here are original work; the book's own text and
> figures are not reproduced, and the book PDF is not redistributed. Concepts, equations, and
> algorithms are described in our own words and implementations.

---

## Overview

This repo has two parts:

| Path            | What it is                                                              |
| --------------- | ----------------------------------------------------------------------- |
| `document/`     | The study web app (React + Vite + TypeScript). This is what's deployed. |
| `sample_code/`  | Standalone Python reference implementations, grouped by chapter.        |

Each chapter page combines prose (English and Korean) with KaTeX-rendered derivations and
interactive figures: **Babylon.js** 3D scenes for spatial concepts and **Konva** 2D canvases for
planar ones. Every derivation is worked step by step, and every major concept has a simulation
you can drag, tune, or break.

## Chapters

| #  | Title                          | Highlights                                                                                     | Sample code |
| -- | ------------------------------ | ---------------------------------------------------------------------------------------------- | ----------- |
| 1  | Preview                        | What a robot is; open vs. closed chains; roadmap                                               | —           |
| 2  | Configuration Space            | DOF, Grübler's formula, C-space topology; animated joint types                                 | Python      |
| 3  | Rigid-Body Motions             | SO(3)/SE(3), exponential coordinates, twists and wrenches; screw-motion demos                  | Python      |
| 4  | Forward Kinematics             | Product of exponentials, URDF; interactive 3R chain and an animated cobot                      | —           |
| 5  | Velocity Kinematics & Statics  | Jacobians, singularities, manipulability and force ellipsoids                                  | —           |
| 6  | Inverse Kinematics             | Analytic 6-DOF solutions, Newton–Raphson / pseudoinverse iteration                             | —           |
| 7  | Kinematics of Closed Chains    | Five-bar and Stewart–Gough; multiple FK branches; actuation singularities                      | —           |
| 8  | Dynamics of Open Chains        | Lagrangian & Newton–Euler; mass matrix geometry; motors, gearing, friction                     | —           |
| 9  | Trajectory Generation          | Time scalings, via points, time-optimal scaling along a path                                   | —           |
| 10 | Motion Planning                | A*, grids, RRT/PRM, potential fields, smoothing — all as live planners                         | —           |
| 11 | Robot Control                  | Error dynamics, PID bounds, computed torque, force/hybrid/impedance control sims               | —           |
| 12 | Grasping and Manipulation      | Contact kinematics, form/force closure labs, friction cones, the meter-stick trick             | —           |
| 13 | Wheeled Mobile Robots          | Mecanum kinematics, Lie-bracket parallel parking, Dubins paths, odometry drift, mobile manipulation | —      |

> Chapters live at path URLs, e.g. `…/modern_robotics/chapter/2/`; Korean adds `?lang=ko`.
> Section deep links use `#hash` anchors.

## Features

- 🌏 **Bilingual** — every page in English and Korean (`?lang=ko`), with per-language metadata.
- 🕹️ **A simulation per concept** — draggable, parameterized figures with live readouts; the
  heavy 3D bundles load lazily per chapter.
- 🧮 **Step-by-step math** — every formula is derived in numbered steps, typeset with KaTeX.
- 🔍 **Search** — client-side index over all chapters and sections, in both languages.
- 🌗 **Light / dark** — follows the system `prefers-color-scheme`.
- 📈 **SEO-ready** — per-chapter prerendered HTML shells with baked titles, descriptions,
  canonical/hreflang links and JSON-LD, plus a generated `sitemap.xml` and `robots.txt`.
- 📱 **Responsive** — mobile layout with a collapsible sidebar and full-screen figure modals.

## Tech stack

- **React 18** + **React Router 6** — SPA with path-based chapter routes (`/chapter/N/`)
- **Vite 6** + **TypeScript** — build & dev server
- **Tailwind CSS 3** — styling via CSS-variable design tokens
- **Babylon.js** + **react-babylonjs** — 3D scenes
- **Konva** + **react-konva** — 2D canvas simulations
- **KaTeX** + **react-katex** — math typesetting

## Getting started

**Requirements**

```yaml
node: ">= 18.20.4"
yarn: ">= 1.22.21"
```

**Install & run**

```bash
git clone git@github.com:robotics-study/modern_robotics.git
cd modern_robotics/document
yarn install
yarn dev        # http://localhost:3000
```

**Other scripts** (run inside `document/`)

```bash
yarn build      # sitemap → vite build → per-chapter prerendered shells (document/dist)
yarn preview    # serve the production build locally
npx tsc --noEmit  # typecheck (vite build alone does not typecheck)
```

## Project structure

```
modern_robotics/
├── document/                     # web app (deployed)
│   ├── index.html                # base metadata, JSON-LD, analytics
│   ├── vite.config.ts            # base path: /modern_robotics in production
│   ├── scripts/
│   │   ├── gen-sitemap.mjs       # sitemap.xml from the chapter list (runs before build)
│   │   └── prerender.mjs         # dist/chapter/N/index.html shells (runs after build)
│   └── src/
│       ├── App.tsx               # routes: /, /chapter/:n (+ legacy ?chapter=N redirect)
│       ├── libs/                 # i18n, nav, seo, search, slug helpers
│       ├── components/
│       │   ├── 3d/               # Physics3DCanvas, AxisTriad, CobotParts
│       │   ├── 2d/               # Konva coordinate canvas
│       │   ├── math/             # KaTeX wrappers
│       │   ├── CanvasFigure.tsx  # figure wrapper: caption + full-screen modal
│       │   └── pages/chapter{1..13}/   # per-chapter interactive figures
│       └── pages/
│           ├── home/             # landing: keyword chips, 3D hero, part-grouped cards
│           └── chapters/         # Chapter{1..13}.tsx, metadata index, shared blurbs
└── sample_code/
    ├── chapter2/python/
    └── chapter3/python/
```

## Sample code

Reference implementations live under `sample_code/<chapter>/<language>/` and are linked from the
chapter cards in the app.

| Chapter | Language | Path                           |
| ------- | -------- | ------------------------------ |
| 2       | Python   | `sample_code/chapter2/python/` |
| 3       | Python   | `sample_code/chapter3/python/` |

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds `document/` and publishes
`document/dist` with **GitHub Actions Pages**. The production base path is `/modern_robotics`,
and the build emits `sitemap.xml`, `robots.txt`, per-chapter prerendered shells, and a `404.html`
SPA fallback.

## Contributing

1. Fork the repo and create a feature branch (`feature/…`).
2. Make changes under `document/` (and `sample_code/` if adding examples).
3. Verify with `yarn build` **and** `npx tsc --noEmit`, then check the affected chapter in the
   browser (both `?lang=ko` and English) for console errors.
4. Open a PR against `robotics-study/modern_robotics` `main`.

### Authoring chapters

Every chapter should **teach visually, not just in prose** — each major concept gets an
interactive or animated figure. When adding or expanding a chapter:

- Add a visualization per key concept: a **Babylon.js** 3D scene (`components/3d/`) for
  spatial ideas, or a **Konva** 2D scene (`components/2d/`) for planar ones. Prefer
  interactivity (drag / sliders / live readouts) where the concept has parameters; make the
  object itself move rather than only shading abstract spaces.
- Write both English and Korean prose (`<T en ko/>`), and register the chapter's section
  titles in `pages/chapters/index.ts` — the Korean strings must match the rendered `<h2>`
  text exactly, since the sidebar, TOC, and search anchors derive from them.
- Wrap each figure in `CanvasFigure` (caption + full-screen modal) and reuse the shared
  building blocks (`Physics3DCanvas`, `AxisTriad`, `CobotParts`, `CoordinateCanvas`) rather
  than re-implementing scaffolding.
- Read theme colors from `useCanvasColors()` / the scene palette so figures work in light and
  dark mode; canvases can't read CSS variables directly.
- Keep per-chapter figures under `components/pages/chapter<N>/`, and add a one-line blurb to
  `pages/chapters/roadmap.ts` (it feeds the home cards, Chapter 1 roadmap, and page metadata).

## License

The original source code of this project (the web app and sample code) is released under the
[MIT](https://opensource.org/licenses/MIT) license — see [`LICENSE`](./LICENSE).

The MIT license covers only this project's own code. The underlying textbook, _Modern Robotics_
by Lynch & Park (Cambridge University Press, 2017), remains the copyright of its authors and
publisher and is **not** relicensed here.
