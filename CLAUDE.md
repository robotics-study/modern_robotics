# CLAUDE.md

Guidance for working in this repo. See `README.md` for the full overview, tech stack, and
project structure.

## What this is

Interactive study notes for Lynch & Park's *Modern Robotics*. Two parts:

- `document/` — the deployed web app (React 18 + Vite 6 + TypeScript). All app work happens here.
- `sample_code/` — standalone Python / C++ reference implementations, grouped by chapter.

Chapters are pages addressed by query param: `…/?chapter=<N>`.

## Chapters must be visual

**Every chapter teaches visually, not just in prose.** Each major concept gets an interactive or
animated figure — the way Chapter 2 does. When adding or expanding a chapter, add a visualization
per key concept; do not ship a wall of equations without a figure that lets the reader *see* the
idea.

Choose the medium by the concept:

- **3D / spatial** (rotations, `SE(3)`, screw motion, robot arms) → Babylon.js scene via
  `components/3d/Physics3DCanvas`. Use `AxisTriad` for a movable body-frame axis triad.
- **2D / planar** (coordinate frames, planar chains) → Konva scene via `components/2d/CoordinateCanvas`.

Prefer **interactivity** (sliders / drag) when the concept has parameters the reader should sweep
— e.g. the `e^[ω̂]θ` angle slider (Ch.3) and the 3R planar-chain joint sliders (Ch.4). Otherwise a
looping **animation** (e.g. the rotating frame, screw-motion helix).

## Conventions

- **Wrap figures in `CanvasFigure`** — it adds the caption and the click-to-expand modal. The modal
  mounts a *second, independent* instance, so a figure that keeps its own React state (sliders)
  must be a self-contained component; pass a fresh instance as the `modal` prop.
- **Reuse the shared scaffolding** — `Physics3DCanvas`, `AxisTriad`, `CoordinateCanvas`,
  `konvaUtils` (`globalToMap` / `mapToGlobal`). Don't re-implement axes, grids, or coordinate math.
- **Theme-aware colors** — canvases can't read CSS variables. Read colors from `useCanvasColors()`
  (Konva) or the scene palette in `Physics3DCanvas` (Babylon) so figures render correctly in light
  and dark mode. Never hard-code theme colors in a figure.
- **Placement** — per-chapter figures live in `components/pages/chapter<N>/`; the chapter page
  (`pages/chapters/Chapter<N>.tsx`) imports and drops them inline next to the relevant prose.
- **3D assets** — STL models live in `document/public/`; load them with `LoadedModel` and
  `resolvePath()` (never hard-code the `/modern_robotics` base path).
- **Comments** explain *why*; identifiers and signatures carry the *what*.

## Verify

The dev server runs from `document/` (`yarn dev`). After changing a figure, load the affected
chapter (`?chapter=<N>`) and confirm it renders and animates/reacts with no console errors — a
passing `yarn build` / typecheck alone does not prove a canvas works. Run `yarn build` before
opening a PR.
