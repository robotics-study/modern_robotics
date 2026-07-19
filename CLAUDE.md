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

## Prose style (EN & KO)

- **No em-dash (`—`) parentheticals in body prose, captions, or UI strings.** Mid-sentence
  `— aside —` insertions break the reading flow. Restructure instead: split into separate
  sentences, use a colon for elaborations, or parentheses for short glosses. (Em dashes as
  structural separators in card/list layouts, e.g. `Ch.N · Title — blurb`, are fine, as are
  hyphens/en-dashes inside names like Denavit–Hartenberg.)
- **Korean prose keeps industry/math terms in English when the English is clearer** (e.g.
  linear map, adjoint map, null space, iso-effort — not 선형 사상/수반 사상/영공간/등노력).
  Prefer plain everyday wording over textbook jargon; figure labels should be as blunt as
  "빠름/느림". Settled Korean terms (자유도, 강체, 자코비안, 정역학/동역학 …) stay Korean.

## Verify

The dev server runs from `document/` (`yarn dev`). After changing a figure, load the affected
chapter (`?chapter=<N>`) and confirm it renders and animates/reacts with no console errors — a
passing `yarn build` / typecheck alone does not prove a canvas works. Run `yarn build` before
opening a PR.
