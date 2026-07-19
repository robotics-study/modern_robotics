import {ReactNode, useEffect, useRef, useState} from "react";
import {Circle, Layer, Line, Rect, Stage, Text} from "react-konva";
import CanvasFigure from "../../CanvasFigure";
import {BlockMath} from "../../math/Tex";
import {Localized} from "../../../../types/global";
import {useLang, useTr} from "../../../libs/i18n";
import {circleCircleIntersect} from "../../../libs/planarArm";
import {CanvasColors, useCanvasColors} from "../../../libs/useTheme";

// Grübler 공식을 책 예제 2.3~2.8 의 메커니즘들에 대입해 보는 갤러리. 각 스키매틱은
// 정확히 자기 자유도 개수만큼의 독립 입력(사인 파형)으로 움직인다 — 구동 관절은 accent,
// loop closure 로 끌려오는 수동 관절은 주황으로 Ch.1 의 범례와 통일한다.
const W = 340, H = 210;
const PASSIVE_COLOR = "#f2a63a";

interface Mech {
    key: string;
    name: Localized<string>;
    counts: Localized<string>;      // N, J, fi 셈 설명
    formula: string;                // KaTeX 대입식
    note?: Localized<string>;       // 하한(lower bound) 등 주의
}

const MECHS: Mech[] = [
    {
        key: "fourbar",
        name: {en: "four-bar", ko: "4절 링크"},
        counts: {
            en: "m = 3 (planar), N = 4 (3 links + ground), J = 4 revolute joints (fᵢ = 1) → 1 input drives all",
            ko: "m = 3 (평면), N = 4 (링크 3 + 그라운드), J = 4 revolute 관절 (fᵢ = 1) → 입력 1개면 전부 움직인다",
        },
        formula: String.raw`\mathrm{dof} = 3(4-1-4) + 4 = 1`,
    },
    {
        key: "slidercrank",
        name: {en: "slider–crank", ko: "슬라이더–크랭크"},
        counts: {
            en: "m = 3, N = 4, J = 4 (3 revolute + 1 prismatic, all fᵢ = 1) → 1 input",
            ko: "m = 3, N = 4, J = 4 (revolute 3 + prismatic 1, 모두 fᵢ = 1) → 입력 1개",
        },
        formula: String.raw`\mathrm{dof} = 3(4-1-4) + 4 = 1`,
    },
    {
        key: "krchain",
        name: {en: "3R serial chain", ko: "3R 직렬 체인"},
        counts: {
            en: "m = 3, N = k+1 = 4, J = k = 3 revolute joints → all 3 joints move independently",
            ko: "m = 3, N = k+1 = 4, J = k = 3 revolute 관절 → 관절 3개가 제각기 독립으로 움직인다",
        },
        formula: String.raw`\mathrm{dof} = 3(4-1-3) + 3 = 3`,
    },
    {
        key: "fivebar",
        name: {en: "five-bar", ko: "5절 링크"},
        counts: {
            en: "m = 3, N = 5 (4 links + ground), J = 5 revolute joints → 2 independent crank inputs",
            ko: "m = 3, N = 5 (링크 4 + 그라운드), J = 5 revolute 관절 → 독립 크랭크 입력 2개",
        },
        formula: String.raw`\mathrm{dof} = 3(5-1-5) + 5 = 2`,
    },
    {
        key: "parallelogram",
        name: {en: "parallelogram", ko: "평행사변형 링크"},
        counts: {
            en: "m = 3, N = 5, J = 6 revolute joints — yet watch it move with 1 DOF!",
            ko: "m = 3, N = 5, J = 6 revolute 관절 — 그런데 보라, 자유도 1 로 움직인다!",
        },
        formula: String.raw`\mathrm{dof} = 3(5-1-6) + 6 = 0 \;\;(\text{actual: } 1)`,
        note: {
            en: "The middle link duplicates a constraint, so the joint constraints are not independent and " +
                "Grübler gives only a lower bound. Remove any one parallel link (N = 4, J = 4) → 1 DOF.",
            ko: "가운데 링크는 이미 있는 제약을 복제할 뿐이라 관절 제약들이 독립이 아니고, Grübler 는 하한만 " +
                "준다. 평행 링크 하나를 지우고 (N = 4, J = 4) 다시 세면 자유도 1 이 나온다.",
        },
    },
    {
        key: "stewart",
        name: {en: "Stewart–Gough", ko: "Stewart–Gough"},
        counts: {
            en: "m = 6 (spatial), N = 14, J = 18: six U (fᵢ=2) + six P (fᵢ=1) + six S (fᵢ=3) → the platform moves with full 6 DOF (3 shown in this side view)",
            ko: "m = 6 (공간), N = 14, J = 18: U 6개 (fᵢ=2) + P 6개 (fᵢ=1) + S 6개 (fᵢ=3) → 플랫폼이 6자유도로 움직인다 (이 측면도에는 3개만 보인다)",
        },
        formula: String.raw`\mathrm{dof} = 6(14-1-18) + 6(1) + 6(2) + 6(3) = 6`,
    },
];

interface P {
    x: number;
    y: number;
}

const link = (key: string, a: P, b: P, color: string, w = 4): ReactNode =>
    <Line key={key} points={[a.x, a.y, b.x, b.y]} stroke={color} strokeWidth={w} lineCap="round"/>;
const joint = (key: string, p: P, colors: CanvasColors, kind: "fixed" | "actuated" | "passive"): ReactNode =>
    <Circle key={key} x={p.x} y={p.y} radius={5}
            fill={kind === "fixed" ? colors.text : colors.surface}
            stroke={kind === "fixed" ? colors.text : kind === "actuated" ? colors.accent : PASSIVE_COLOR}
            strokeWidth={2.5}/>;
// 픽셀 좌표는 y 아래 방향이므로 각도는 (cos, -sin) 으로 편다.
const polar = (o: P, r: number, th: number): P => ({x: o.x + r * Math.cos(th), y: o.y - r * Math.sin(th)});

// 각 메커니즘의 시각 t 에서의 스키매틱. 입력(사인 파형) 수 == 자유도 수.
const Schematic = ({mech, t}: {mech: string; t: number}) => {
    const colors = useCanvasColors();
    const g = colors.muted;
    switch (mech) {
        case "fourbar": {
            // 크랭크-로커 (Grashof): 크랭크 하나(입력 1)가 완전 회전, 커플러·로커는 종속.
            const P0: P = {x: 105, y: 170}, P3: P = {x: 245, y: 170};
            const A = polar(P0, 45, 1.1 * t);
            const hit = circleCircleIntersect(A, 140, P3, 95, -1);
            const B = hit ? hit.p : A;
            return <>
                {link("gnd", P0, P3, g, 3)}
                {hit && link("coupler", A, B, colors.text)}
                {hit && link("rocker", P3, B, PASSIVE_COLOR)}
                {link("crank", P0, A, colors.accent)}
                {joint("p0", P0, colors, "fixed")}{joint("p3", P3, colors, "fixed")}
                {joint("a", A, colors, "actuated")}{hit && joint("b", B, colors, "passive")}
            </>;
        }
        case "slidercrank": {
            const O: P = {x: 95, y: 145}, L = 135, r = 45;
            const A = polar(O, r, 1.2 * t);
            const bx = A.x + Math.sqrt(Math.max(0, L * L - (A.y - O.y) * (A.y - O.y)));
            const B: P = {x: bx, y: O.y};
            return <>
                {link("rail", {x: 60, y: O.y}, {x: 300, y: O.y}, g, 2)}
                {link("rod", A, B, colors.text)}
                <Rect key="block" x={B.x - 18} y={B.y - 12} width={36} height={24} cornerRadius={4}
                      fill={colors.surface} stroke={PASSIVE_COLOR} strokeWidth={2.5}/>
                {link("crank", O, A, colors.accent)}
                {joint("o", O, colors, "fixed")}{joint("a", A, colors, "actuated")}
                {joint("b", B, colors, "passive")}
            </>;
        }
        case "krchain": {
            // 3개의 독립 사인 입력 — 자유도 3.
            const base: P = {x: 100, y: 185};
            const th1 = 1.2 + 0.5 * Math.sin(0.9 * t);
            const th2 = -0.5 + 0.6 * Math.sin(1.4 * t + 1);
            const th3 = 0.4 + 0.7 * Math.sin(1.9 * t + 2);
            const j1 = polar(base, 70, th1);
            const j2 = polar(j1, 60, th1 + th2);
            const ee = polar(j2, 50, th1 + th2 + th3);
            return <>
                {link("l1", base, j1, colors.accent)}
                {link("l2", j1, j2, colors.accent)}
                {link("l3", j2, ee, colors.accent)}
                {joint("b", base, colors, "fixed")}
                {joint("j1", j1, colors, "actuated")}{joint("j2", j2, colors, "actuated")}
                <Circle key="ee" x={ee.x} y={ee.y} radius={6} fill={colors.accent}/>
            </>;
        }
        case "fivebar": {
            // 두 크랭크가 독립 입력(자유도 2), 꼭짓점 B 는 loop closure 로 종속.
            const P0: P = {x: 125, y: 180}, P4: P = {x: 225, y: 180};
            const th1 = 1.9 + 0.55 * Math.sin(0.9 * t);
            const th2 = 1.25 + 0.55 * Math.sin(1.4 * t + 1.3);
            const A = polar(P0, 55, th1);
            const D = polar(P4, 55, th2);
            const hit = circleCircleIntersect(A, 95, D, 95, -1);
            const B = hit ? hit.p : A;
            return <>
                {link("gnd", P0, P4, g, 3)}
                {hit && link("c1", A, B, colors.text)}
                {hit && link("c2", D, B, colors.text)}
                {link("in1", P0, A, colors.accent)}
                {link("in2", P4, D, colors.accent)}
                {joint("p0", P0, colors, "fixed")}{joint("p4", P4, colors, "fixed")}
                {joint("a", A, colors, "actuated")}{joint("d", D, colors, "actuated")}
                {hit && joint("b", B, colors, "passive")}
            </>;
        }
        case "parallelogram": {
            // 실제 자유도 1: 각 ψ 하나가 평행 링크 셋을 함께 움직인다 (Grübler 는 0 이라 답한다).
            const psi = 1.15 + 0.35 * Math.sin(1.1 * t);
            const bases: P[] = [{x: 80, y: 175}, {x: 175, y: 175}, {x: 270, y: 175}];
            const tops = bases.map((b) => polar(b, 115, psi));
            return <>
                {link("gnd", {x: 60, y: 175}, {x: 290, y: 175}, g, 3)}
                {link("top", tops[0], tops[2], colors.text)}
                {link("u1", bases[0], tops[0], colors.accent)}
                {link("u2", bases[1], tops[1], PASSIVE_COLOR)}
                {link("u3", bases[2], tops[2], PASSIVE_COLOR)}
                {bases.map((b, i) => joint(`b${i}`, b, colors, "fixed"))}
                {tops.map((p, i) => joint(`t${i}`, p, colors, i === 0 ? "actuated" : "passive"))}
            </>;
        }
        case "stewart": {
            // 측면도라 6자유도 중 3개(가로 sway·세로 heave·기울기 roll)만 보인다.
            // 다리(UPS)는 프리즘 관절이라 길이가 늘어나는 것으로 구동을 표현한다.
            const dx = 14 * Math.sin(0.8 * t);
            const dy = 10 * Math.sin(1.3 * t + 1);
            const roll = 0.14 * Math.sin(1.7 * t + 2);
            const c: P = {x: 175 + dx, y: 62 + dy};
            const topLocal = [-60, -36, -12, 12, 36, 60];
            const tops = topLocal.map((lx): P => ({
                x: c.x + lx * Math.cos(roll),
                y: c.y + lx * Math.sin(roll),
            }));
            const bottoms: P[] = [80, 110, 162, 188, 240, 270].map((x) => ({x, y: 185}));
            const pair = [1, 0, 3, 2, 5, 4]; // 다리를 엇갈리게 연결해 교차 구조를 만든다
            return <>
                {link("base", {x: 62, y: 185}, {x: 288, y: 185}, colors.text, 6)}
                {bottoms.map((b, i) => link(`leg${i}`, b, tops[pair[i]], colors.accent, 3))}
                {link("plat", tops[0], tops[5], colors.text, 6)}
                {bottoms.map((b, i) => joint(`bj${i}`, b, colors, "fixed"))}
                {tops.map((p, i) => joint(`tj${i}`, p, colors, "passive"))}
            </>;
        }
        default:
            return null;
    }
};

const GrublerScene = () => {
    const colors = useCanvasColors();
    const {lang} = useLang();
    const [sel, setSel] = useState("fourbar");
    const [playing, setPlaying] = useState(true);
    const [t, setT] = useState(0.6);
    const rafRef = useRef<number>();
    const baseRef = useRef(0.6);
    const mech = MECHS.find((m) => m.key === sel)!;

    useEffect(() => {
        if (!playing) return;
        const start = performance.now();
        const offset = baseRef.current;
        const tick = (now: number) => {
            const cur = offset + (now - start) / 1000;
            baseRef.current = cur;
            setT(cur);
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [playing]);

    return (
        <div className="flex flex-col gap-2 items-center" style={{width: W}}>
            <Stage width={W} height={H} className="bg-surface border border-border rounded-lg overflow-hidden">
                <Layer>
                    <Schematic mech={sel} t={t}/>
                    <Text x={8} y={8} text={lang === "ko" ? mech.name.ko : mech.name.en}
                          fontSize={12} fontStyle="bold" fill={colors.muted}/>
                </Layer>
            </Stage>
            <div className="flex flex-wrap justify-center gap-1.5 text-xs">
                {MECHS.map((m) => (
                    <button
                        key={m.key}
                        type="button"
                        onClick={() => setSel(m.key)}
                        className={`px-2 py-0.5 rounded border ${
                            sel === m.key
                                ? "border-[var(--accent)] text-[var(--accent)] font-semibold"
                                : "border-border text-muted hover:bg-surface"
                        }`}
                    >
                        {lang === "ko" ? m.name.ko : m.name.en}
                    </button>
                ))}
            </div>
            <div className="flex items-center justify-center gap-3 text-xs text-muted">
                <button
                    type="button"
                    onClick={() => setPlaying((p) => !p)}
                    className="px-2 py-0.5 rounded border border-[var(--accent)] text-[var(--accent)] font-semibold"
                >
                    {playing ? "❚❚ Pause" : "▶ Play"}
                </button>
                <span>
                    <span className="text-[var(--accent)] font-semibold">●</span> actuated ·{" "}
                    <span style={{color: PASSIVE_COLOR}} className="font-semibold">○</span> passive
                </span>
            </div>
            <div className="w-full text-xs text-muted text-center">
                {lang === "ko" ? mech.counts.ko : mech.counts.en}
            </div>
            <div className="w-full overflow-x-auto text-center">
                <BlockMath math={mech.formula}/>
            </div>
            {mech.note && (
                <div className="w-full text-xs text-center rounded border border-[var(--accent)] px-2 py-1"
                     style={{color: "var(--accent)"}}>
                    {lang === "ko" ? mech.note.ko : mech.note.en}
                </div>
            )}
        </div>
    );
};

const GrublerExplorer = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "Grübler's formula, worked out · each mechanism moves with exactly its DOF's worth of inputs",
            "Grübler 공식 대입 연습 · 각 메커니즘은 정확히 자기 자유도만큼의 입력으로 움직인다",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<GrublerScene/>}
    >
        <GrublerScene/>
    </CanvasFigure>;
};

export default GrublerExplorer;
