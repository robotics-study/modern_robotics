<div align="center">

# 🤖 Modern Robotics · Study

Interactive study notes for **Kevin M. Lynch & Frank C. Park's**
**_[Modern Robotics: Mechanics, Planning, and Control](https://hades.mech.northwestern.edu/index.php/Modern_Robotics)_**
— a single-page app with live 3D joint visualizations, rendered math, and per-chapter sample code.

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
| --------------- | ---------------------------------------------------------------------- |
| `document/`     | The study web app (React + Vite + TypeScript). This is what's deployed. |
| `sample_code/`  | Standalone Python / C++ reference implementations, grouped by chapter.  |

The web app presents each chapter as a page: prose + KaTeX-rendered equations, interactive **Babylon.js** 3D joint demos, and a **Konva** 2D coordinate playground. It ships with a light/dark theme (respecting your system preference) and is fully responsive.

## Chapters

| # | Title                  | Highlights                                                                                   | Sample code |
| - | ---------------------- | -------------------------------------------------------------------------------------------- | ----------- |
| 1 | Preview                | Landing / table of contents                                                                  | —           |
| 2 | Configuration Space    | Degrees of freedom; revolute · prismatic · helical · cylindrical · universal · spherical joints (animated 3D); 2D coordinate example | Python      |
| 3 | Rigid-Body Motions     | `SO(3)`, skew-symmetric `so(3)`, angular & linear velocity, exponential coordinates, twists — with a rotating body frame, an interactive `e^[ω̂]θ` axis-angle slider, an `SE(3)` frame, and a screw-motion helix (animated 3D) | C++         |
| 4 | Forward Kinematics     | Open-chain FK, product of exponentials, URDF — with an interactive 3R planar chain (Konva sliders → live end-effector pose) and an animated serial-chain robot (URDF link/joint tree) | Python      |

> Chapters are addressed by query param, e.g. `…/modern_robotics/?chapter=2`.

## Features

- 🎥 **Animated 3D joints** — each joint type rendered with Babylon.js + Cannon physics.
- 🧮 **Rendered math** — equations via KaTeX (`react-katex`).
- 🖱️ **Interactive 2D coordinate demo** — drag & rotate with Konva.
- 🌗 **Light / dark theme** — follows `prefers-color-scheme`, toggle persists to `localStorage`.
- ⚡ **Code-split** — the heavy 3D bundle loads lazily, only for the chapter that needs it.
- 📱 **Responsive** — mobile-friendly card grid and prose layout.

## Tech stack

- **React 18** + **React Router 6** — SPA, query-param chapter routing
- **Vite 6** + **TypeScript** — build & dev server
- **Tailwind CSS 3** — styling via CSS-variable design tokens
- **Babylon.js** + **react-babylonjs** + **Cannon** — 3D scenes & physics
- **Konva** + **react-konva** — 2D canvas
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
yarn build      # production build → document/dist
yarn preview    # serve the production build locally
```

## Project structure

```
modern_robotics/
├── document/                     # web app (deployed)
│   ├── index.html
│   ├── vite.config.ts            # base path: /modern_robotics in production
│   ├── tailwind.config.js        # semantic color tokens → CSS variables
│   └── src/
│       ├── App.tsx               # router + Suspense boundary
│       ├── index.css             # design tokens (:root vars) + .mr-* component classes
│       ├── components/
│       │   ├── Header.tsx        # topbar: brand, breadcrumb, theme toggle
│       │   ├── ChapterContents.tsx
│       │   ├── 3d/               # Babylon canvas, model loaders, AxisTriad (body-frame axes)
│       │   ├── 2d/               # Konva coordinate canvas
│       │   ├── math/             # KaTeX wrappers
│       │   ├── CanvasFigure.tsx  # figure wrapper: caption + click-to-expand modal
│       │   └── pages/chapter{2,3,4}/  # per-chapter interactive/animated visualizations
│       └── pages/
│           ├── home/             # chapter card grid
│           └── chapters/         # Chapter{1,2,3,4}.tsx + lazy-loaded index
└── sample_code/
    ├── chapter2/python/
    └── chapter3/
```

## Sample code

Reference implementations live under `sample_code/<chapter>/<language>/` and are linked from each chapter card in the app.

| Chapter | Language     | Path                           |
| ------- | ------------ | ------------------------------ |
| 2       | Python       | `sample_code/chapter2/python/` |
| 3       | C++ / Python | `sample_code/chapter3/`        |

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds `document/` and publishes `document/dist` to the **`doc`** branch via GitHub Pages. The production base path is `/modern_robotics`.

## Contributing

1. Fork the repo and create a feature branch (`feature/…`).
2. Make changes under `document/` (and `sample_code/` if adding examples).
3. Verify with `yarn build` and a quick `yarn preview` pass.
4. Open a PR against `robotics-study/modern_robotics` `main`.

### Authoring chapters

Every chapter should **teach visually, not just in prose** — each major concept gets an
interactive or animated figure, the way Chapter 2 does. When adding or expanding a chapter:

- Add a visualization per key concept: a **Babylon.js** 3D scene (`components/3d/`) for
  spatial ideas, or a **Konva** 2D scene (`components/2d/`) for planar ones. Prefer
  interactivity (drag / sliders) where the concept has parameters; otherwise a looping
  animation.
- Wrap each figure in `CanvasFigure` (caption + click-to-expand modal) and reuse the shared
  building blocks (`Physics3DCanvas`, `AxisTriad`, `CoordinateCanvas`) rather than
  re-implementing scaffolding.
- Read theme colors from `useCanvasColors()` / the scene palette so figures work in light and
  dark mode; canvases can't read CSS variables directly.
- Keep per-chapter figures under `components/pages/chapter<N>/`.

## License

The original source code of this project (the web app and sample code) is released under the
[MIT](https://opensource.org/licenses/MIT) license — see [`LICENSE`](./LICENSE).

The MIT license covers only this project's own code. The underlying textbook, _Modern Robotics_
by Lynch & Park (Cambridge University Press, 2017), remains the copyright of its authors and
publisher and is **not** relicensed here.
