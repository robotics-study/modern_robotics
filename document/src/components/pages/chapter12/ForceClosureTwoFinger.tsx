import {useEffect, useMemo, useRef, useState} from "react";
import {Arrow, Circle, Layer, Line, Stage, Text} from "react-konva";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";
import {Wrench3, contactWrench, positiveSpanTest} from "./graspUtils";

// 두 손가락으로 삼각형을 집어 드는 실험 (책 그림 12.22). 빗변의 안쪽 normal 은 살짝
// 아래를 향하므로, 위로 드는 힘은 오로지 마찰이 만들어야 한다. friction cone 의 반각이
// 빗변 기울기 30° 를 넘어야, 즉 μ ≥ tan30° ≈ 0.577 이어야 cone 이 위쪽을 덮고 삼각형이
// 잡힌다. 그 아래에서는 쥐는 힘을 아무리 키워도 힘의 방향 자체가 안 나오기 때문에
// 삼각형이 미끄러져 빠진다. 이것이 force closure 다: 접촉이 "어떤 방향의 wrench 든"
// 만들 수 있는가의 문제이지, 힘의 크기 문제가 아니다.
const TOP: [number, number] = [0, 1];
const BL: [number, number] = [-0.866, -0.5];
const BR: [number, number] = [0.866, -0.5];

const lerp = (a: [number, number], b: [number, number], f: number): [number, number] =>
    [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];

// CCW 다각형에서 변 a→b 의 안쪽 normal (방향벡터를 +90° 회전).
const inwardNormal = (a: [number, number], b: [number, number]): [number, number] => {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const l = Math.hypot(dx, dy);
    return [-dy / l, dx / l];
};

const rotate = (v: [number, number], a: number): [number, number] => [
    v[0] * Math.cos(a) - v[1] * Math.sin(a),
    v[0] * Math.sin(a) + v[1] * Math.cos(a),
];

interface SceneProps {
    panel?: number;
}

const ForceClosureScene = ({panel = 340}: SceneProps) => {
    const colors = useCanvasColors();
    const t = useTr();
    const [mu, setMu] = useState(0.3);
    const [squeeze, setSqueeze] = useState(0.5);
    const [fL, setFL] = useState(0.5);
    const [fR, setFR] = useState(0.5);
    const [drop, setDrop] = useState(0);
    const dropRef = useRef(0);
    const closedRef = useRef(false);

    const alpha = Math.atan(mu);
    const pL = lerp(TOP, BL, fL);
    const pR = lerp(BR, TOP, fR);
    const nL = inwardNormal(TOP, BL);
    const nR = inwardNormal(BR, TOP);

    const {closed} = useMemo(() => {
        const wrenches: Wrench3[] = [];
        for (const [p, n] of [[pL, nL], [pR, nR]] as Array<[[number, number], [number, number]]>) {
            for (const s of [1, -1]) {
                const e = rotate(n, s * alpha);
                wrenches.push(contactWrench(p[0], p[1], e[0], e[1]));
            }
        }
        return positiveSpanTest(wrenches, 1);
    }, [pL, pR, nL, nR, alpha]);
    closedRef.current = closed;

    // 잡혔으면 제자리, 아니면 아래로 미끄러진다 (빠져나가면 위에서 다시 놓아 본다).
    useEffect(() => {
        let raf = 0, last: number | null = null;
        const loop = (ts: number) => {
            if (last === null) last = ts;
            const dt = Math.min((ts - last) / 1000, 0.05);
            last = ts;
            if (closedRef.current) {
                dropRef.current = Math.max(0, dropRef.current - dt * 2.5);
            } else {
                dropRef.current += dt * 0.55;
                if (dropRef.current > 1.6) dropRef.current = 0;
            }
            setDrop(dropRef.current);
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, []);

    // "서로 보이는가": 시선이 양쪽 cone 안에 드는가.
    const sight = useMemo(() => {
        const d: [number, number] = [pR[0] - pL[0], pR[1] - pL[1]];
        const l = Math.hypot(d[0], d[1]);
        const dn: [number, number] = [d[0] / l, d[1] / l];
        const angL = Math.acos(Math.max(-1, Math.min(1, dn[0] * nL[0] + dn[1] * nL[1])));
        const angR = Math.acos(Math.max(-1, Math.min(1, -dn[0] * nR[0] - dn[1] * nR[1])));
        return angL <= alpha + 1e-9 && angR <= alpha + 1e-9;
    }, [pL, pR, nL, nR, alpha]);

    const W = panel, H = panel;
    const cx = W / 2, cy = H / 2 - panel * 0.02, S = panel / 3.4;
    const sx = (x: number) => cx + x * S;
    const sy = (y: number, dy = 0) => cy - (y - dy) * S;

    const conePoly = (p: [number, number], n: [number, number]) => {
        const e1 = rotate(n, alpha), e2 = rotate(n, -alpha);
        const L = 0.8;
        return [sx(p[0]), sy(p[1]),
            sx(p[0] + e1[0] * L), sy(p[1] + e1[1] * L),
            sx(p[0] + e2[0] * L), sy(p[1] + e2[1] * L)];
    };

    const dragEdge = (which: "L" | "R") => (e: {target: {x: () => number; y: () => number; position: (p: {x: number; y: number}) => void}}) => {
        const wx2 = (e.target.x() - cx) / S, wy2 = (cy - e.target.y()) / S;
        const [a, b] = which === "L" ? [TOP, BL] : [BR, TOP];
        const abx = b[0] - a[0], aby = b[1] - a[1];
        const len2 = abx * abx + aby * aby;
        const f = Math.max(0.12, Math.min(0.88,
            ((wx2 - a[0]) * abx + (wy2 - a[1]) * aby) / len2));
        if (which === "L") setFL(f);
        else setFR(f);
        const np = lerp(a, b, f);
        e.target.position({x: sx(np[0]), y: sy(np[1])});
    };

    const fadeOut = drop > 1.1 ? Math.max(0, (1.6 - drop) / 0.5) : 1;
    const sqLen = 0.25 + squeeze * 0.45;

    const slider = (label: string, val: number, set: (v: number) => void,
                    min: number, max: number, step: number, fmt: string) => (
        <label key={label} className="flex items-center gap-2 text-xs text-muted">
            <span className="w-16 shrink-0">{label}</span>
            <input type="range" min={min} max={max} step={step} value={val}
                   onChange={(e) => set(parseFloat(e.target.value))}
                   className="w-full accent-[var(--accent)]" aria-label={label}/>
            <span className="w-12 shrink-0 text-right tabular-nums">{fmt}</span>
        </label>
    );

    return (
        <div className="flex flex-col gap-2 items-center">
            <Stage width={W} height={H}
                   className="bg-surface border border-border rounded-lg overflow-hidden">
                <Layer>
                    {/* 떨어지는(또는 잡힌) 삼각형 */}
                    <Line points={[sx(TOP[0]), sy(TOP[1], drop), sx(BL[0]), sy(BL[1], drop),
                        sx(BR[0]), sy(BR[1], drop)]}
                          closed fill={closed ? colors.accent : "#e0a33d"}
                          opacity={(closed ? 0.8 : 0.6) * fadeOut}
                          stroke={colors.text} strokeWidth={2 * fadeOut}/>
                    {/* 중력 화살표 */}
                    <Arrow points={[sx(0), sy(0, drop), sx(0), sy(0, drop) + 34]}
                           stroke={colors.muted} fill={colors.muted} strokeWidth={2}
                           pointerLength={7} pointerWidth={6} opacity={fadeOut}/>
                    <Text x={sx(0) + 6} y={sy(0, drop) + 20} text="mg" fontSize={11}
                          fill={colors.muted} opacity={fadeOut}/>
                    {/* friction cones (손가락 위치 기준, 고정) */}
                    <Line points={conePoly(pL, nL)} closed
                          fill={closed ? colors.accent : "#e0533d"} opacity={0.25}/>
                    <Line points={conePoly(pR, nR)} closed
                          fill={closed ? colors.accent : "#e0533d"} opacity={0.25}/>
                    {/* 쥐는 힘 화살표 (크기는 슬라이더, 방향은 normal) */}
                    <Arrow points={[sx(pL[0] - nL[0] * sqLen), sy(pL[1] - nL[1] * sqLen),
                        sx(pL[0]), sy(pL[1])]}
                           stroke={colors.text} fill={colors.text} strokeWidth={2.5}
                           pointerLength={9} pointerWidth={8}/>
                    <Arrow points={[sx(pR[0] - nR[0] * sqLen), sy(pR[1] - nR[1] * sqLen),
                        sx(pR[0]), sy(pR[1])]}
                           stroke={colors.text} fill={colors.text} strokeWidth={2.5}
                           pointerLength={9} pointerWidth={8}/>
                    {/* 시선 */}
                    <Line points={[sx(pL[0]), sy(pL[1]), sx(pR[0]), sy(pR[1])]}
                          stroke={sight ? colors.accent : colors.muted}
                          strokeWidth={sight ? 2.5 : 1.5}
                          dash={sight ? undefined : [5, 5]}/>
                    {/* 손가락 (드래그) */}
                    <Circle x={sx(pL[0])} y={sy(pL[1])} radius={10} fill={colors.text}
                            draggable onDragMove={dragEdge("L")}/>
                    <Circle x={sx(pR[0])} y={sy(pR[1])} radius={10} fill={colors.text}
                            draggable onDragMove={dragEdge("R")}/>
                    <Text x={6} y={6}
                          text={closed
                              ? t("held: the cones cover the upward direction", "잡혔다. cone 이 위쪽 방향을 덮는다")
                              : t("slipping out: no force inside the cones points up enough",
                                  "빠져나간다. cone 안 어떤 힘도 충분히 위를 향하지 못한다")}
                          fontSize={11} fill={closed ? "var(--accent)" : "#e0533d"}/>
                </Layer>
            </Stage>
            <div className="w-full flex flex-col gap-1">
                {slider("μ", mu, setMu, 0.05, 1.2, 0.005, mu.toFixed(2))}
                {slider(t("squeeze", "쥐는 힘"), squeeze, setSqueeze, 0.1, 1, 0.01,
                    `${Math.round(squeeze * 100)}%`)}
            </div>
            <div className="text-xs text-muted text-center tabular-nums">
                {closed
                    ? <span className="font-semibold" style={{color: "var(--accent)"}}>
                        {t("force closure: any wrench can be resisted", "force closure: 어떤 wrench 든 막을 수 있다")}
                    </span>
                    : <span className="font-semibold" style={{color: "#e0533d"}}>
                        {t("try raising the squeeze: it never helps. only μ ≥ tan30° ≈ 0.58 saves this grasp",
                            "쥐는 힘을 올려 봐도 소용없다. 이 grasp 를 살리는 것은 μ ≥ tan30° ≈ 0.58 뿐이다")}
                    </span>}
                {" · "}
                {sight
                    ? t("the contacts see each other through both cones", "두 접촉이 cone 을 통해 서로 보인다")
                    : t("line of sight outside a cone", "시선이 cone 을 벗어나 있다")}
            </div>
        </div>
    );
};

const ForceClosureTwoFinger = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "pick up a triangle with two fingers: below μ = tan 30° it slips out no matter how hard you squeeze, because force closure is about force directions, not magnitudes",
            "두 손가락으로 삼각형 집어 들기: μ 가 tan30° 보다 작으면 아무리 세게 쥐어도 빠져나간다. force closure 는 힘의 크기가 아니라 방향의 문제이기 때문이다",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<ForceClosureScene panel={Math.min(modalCanvasSize(1).width, 640)}/>}
    >
        <ForceClosureScene panel={340}/>
    </CanvasFigure>;
};

export default ForceClosureTwoFinger;
