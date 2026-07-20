import {useMemo, useState} from "react";
import {Circle, Layer, Line, Stage, Text} from "react-konva";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";
import {Wrench3, contactWrench, positiveSpanTest} from "./graspUtils";

// 책 그림 12.22: 정삼각형을 양쪽 빗변에서 손가락 두 개로 잡는다. 마찰이 있으니 접촉마다
// friction cone 이 생기고, cone 의 두 모서리 wrench 네 개가 R³ 를 positively span 하면
// force closure 다. 두 접촉이 서로의 friction cone 안으로 "마주 보이면" force closure 라는
// 평면 정리를, μ 슬라이더로 문턱값 tan30° ≈ 0.577 을 직접 찾아 가며 확인한다.
const TOP: [number, number] = [0, 1];
const BL: [number, number] = [-0.866, -0.5];
const BR: [number, number] = [0.866, -0.5];

const lerp = (a: [number, number], b: [number, number], f: number): [number, number] =>
    [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];

// CCW 다각형에서 변 a→b 의 안쪽 normal 은 방향벡터를 +90° 돌린 것.
const inwardNormal = (a: [number, number], b: [number, number]): [number, number] => {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const l = Math.hypot(dx, dy);
    return [-dy / l, dx / l];
};

interface SceneProps {
    panel?: number;
}

const ForceClosureScene = ({panel = 340}: SceneProps) => {
    const colors = useCanvasColors();
    const t = useTr();
    const [mu, setMu] = useState(0.3);
    const [fL, setFL] = useState(0.5);
    const [fR, setFR] = useState(0.5);

    const alpha = Math.atan(mu);
    const pL = lerp(TOP, BL, fL);
    const pR = lerp(BR, TOP, fR);
    const nL = inwardNormal(TOP, BL);
    const nR = inwardNormal(BR, TOP);

    const rotate = (v: [number, number], a: number): [number, number] => [
        v[0] * Math.cos(a) - v[1] * Math.sin(a),
        v[0] * Math.sin(a) + v[1] * Math.cos(a),
    ];

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

    // "서로 보이는가": 시선 방향이 양쪽 cone 안에 있는가.
    const sight = useMemo(() => {
        const d: [number, number] = [pR[0] - pL[0], pR[1] - pL[1]];
        const l = Math.hypot(d[0], d[1]);
        const dn: [number, number] = [d[0] / l, d[1] / l];
        const angL = Math.acos(Math.max(-1, Math.min(1, dn[0] * nL[0] + dn[1] * nL[1])));
        const angR = Math.acos(Math.max(-1, Math.min(1, -dn[0] * nR[0] - dn[1] * nR[1])));
        return angL <= alpha + 1e-9 && angR <= alpha + 1e-9;
    }, [pL, pR, nL, nR, alpha]);

    const W = panel, H = panel;
    const cx = W / 2, cy = H / 2 + panel * 0.04, S = panel / 3.1;
    const sx = (x: number) => cx + x * S;
    const sy = (y: number) => cy - y * S;

    const conePoly = (p: [number, number], n: [number, number]) => {
        const e1 = rotate(n, alpha), e2 = rotate(n, -alpha);
        const L = 0.85;
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

    return (
        <div className="flex flex-col gap-2 items-center">
            <Stage width={W} height={H}
                   className="bg-surface border border-border rounded-lg overflow-hidden">
                <Layer>
                    {/* 삼각형 */}
                    <Line points={[sx(TOP[0]), sy(TOP[1]), sx(BL[0]), sy(BL[1]), sx(BR[0]), sy(BR[1])]}
                          closed fill={colors.accent} opacity={0.25}
                          stroke={colors.text} strokeWidth={2}/>
                    {/* friction cones */}
                    <Line points={conePoly(pL, nL)} closed
                          fill={closed ? colors.accent : "#e0a33d"} opacity={0.3}/>
                    <Line points={conePoly(pR, nR)} closed
                          fill={closed ? colors.accent : "#e0a33d"} opacity={0.3}/>
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
                          text={t("drag the fingers along the edges", "손가락을 빗변을 따라 끌어 보라")}
                          fontSize={11} fill={colors.muted}/>
                </Layer>
            </Stage>
            <div className="w-full flex flex-col gap-1">
                <label className="flex items-center gap-2 text-xs text-muted">
                    <span className="w-6 shrink-0">μ</span>
                    <input type="range" min={0.05} max={1.2} step={0.005} value={mu}
                           onChange={(e) => setMu(parseFloat(e.target.value))}
                           className="w-full accent-[var(--accent)]" aria-label="μ"/>
                    <span className="w-12 shrink-0 text-right tabular-nums">{mu.toFixed(2)}</span>
                </label>
            </div>
            <div className="text-xs text-muted text-center tabular-nums">
                tan⁻¹μ = {(alpha * 180 / Math.PI).toFixed(1)}°
                {" · "}
                {closed
                    ? <span className="font-semibold" style={{color: "var(--accent)"}}>
                        {t("force closure: the two cones can generate any wrench",
                            "force closure: 두 cone 이 어떤 wrench 든 만들 수 있다")}
                    </span>
                    : <span className="font-semibold" style={{color: "#e0a33d"}}>
                        {t("not force closure yet", "아직 force closure 가 아니다")}
                    </span>}
                {" · "}
                {sight
                    ? t("the contacts see each other inside both cones", "두 접촉이 서로의 cone 안으로 마주 보인다")
                    : t("line of sight is outside a cone", "시선이 cone 을 벗어나 있다")}
            </div>
        </div>
    );
};

const ForceClosureTwoFinger = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "two frictional fingers on a triangle: slide μ upward and force closure switches on exactly when the contacts can see each other through their cones (μ = tan 30° here)",
            "삼각형을 잡은 두 마찰 손가락: μ 를 올리다 보면 두 접촉이 cone 을 통해 서로 보이는 순간 (여기서는 μ = tan 30°) force closure 가 켜진다",
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
