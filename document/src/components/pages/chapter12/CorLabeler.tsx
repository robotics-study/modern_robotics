import {useEffect, useMemo, useRef, useState} from "react";
import {Arrow, Circle, Layer, Line, Rect, Stage, Text} from "react-konva";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";
import {Wrench3, contactWrench} from "./graspUtils";

// 책 예제 12.5: 테이블 위에 서 있는 사각형 몸체를 왼쪽에서 손가락 하나가 대고 있다.
// 평면에서 twist 는 회전 중심(CoR) 하나로 그릴 수 있으므로, 화면의 아무 점이나 클릭해
// "이 점을 중심으로 + (반시계) 또는 − (시계) 로 돌면 어떻게 되는가"를 직접 확인한다.
// 허용되는 CoR 영역은 미리 색으로 칠해 두고, 클릭하면 몸체가 실제로 흔들리며
// 각 접촉의 라벨 (B/Sl/Sr/R)과 관통 여부를 보여 준다.
const BODY = {x0: -1, x1: 1, y0: 0, y1: 2};
const CONTACTS: Array<{p: [number, number]; n: [number, number]}> = [
    {p: [-1, 0], n: [0, 1]},      // 테이블, 왼쪽 모서리
    {p: [1, 0], n: [0, 1]},       // 테이블, 오른쪽 모서리
    {p: [-1, 1.2], n: [1, 0]},    // 손가락 (왼쪽 면)
];
const WRENCHES: Wrench3[] = CONTACTS.map((c) => contactWrench(c.p[0], c.p[1], c.n[0], c.n[1]));
// 세계 좌표 범위
const WORLD = {x0: -4, x1: 4, y0: -2.2, y1: 4.2};
const EPS = 0.08;

// CoR (cx, cy), 부호 σ 의 twist.
const corTwist = (cx: number, cy: number, sigma: number): [number, number, number] =>
    [sigma, sigma * cy, -sigma * cx];

const feasibleAt = (cx: number, cy: number, sigma: number) => {
    const v = corTwist(cx, cy, sigma);
    return WRENCHES.every((f) => f[0] * v[0] + f[1] * v[1] + f[2] * v[2] >= -1e-9);
};

interface SceneProps {
    panel?: number;
}

const CorScene = ({panel = 340}: SceneProps) => {
    const colors = useCanvasColors();
    const t = useTr();
    const [sel, setSel] = useState<[number, number] | null>([-2.2, 2.2]);
    const [sigma, setSigma] = useState(1);
    const [phase, setPhase] = useState(0);
    const rafRef = useRef<number>();

    useEffect(() => {
        let start: number | null = null;
        const loop = (ts: number) => {
            if (start === null) start = ts;
            // 허용 방향으로만 흔든다 (0 ↔ 최대). 반대쪽 절반은 관통 방향이라 그리지 않는다.
            setPhase((1 - Math.cos(((ts - start) / 1000) * 2.2)) / 2);
            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
        return () => {
            if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    const W = panel, H = Math.round(panel * 0.8);
    const sx = (x: number) => ((x - WORLD.x0) / (WORLD.x1 - WORLD.x0)) * W;
    const sy = (y: number) => (1 - (y - WORLD.y0) / (WORLD.y1 - WORLD.y0)) * H;
    const invx = (px: number) => WORLD.x0 + (px / W) * (WORLD.x1 - WORLD.x0);
    const invy = (py: number) => WORLD.y0 + (1 - py / H) * (WORLD.y1 - WORLD.y0);

    // 허용 CoR 영역 타일 (고정 접촉이라 1회 계산).
    const tiles = useMemo(() => {
        const NX = 56, NY = 44;
        const out: Array<{x: number; y: number; plus: boolean; minus: boolean}> = [];
        for (let i = 0; i < NX; i++) {
            for (let j = 0; j < NY; j++) {
                const x = WORLD.x0 + ((i + 0.5) / NX) * (WORLD.x1 - WORLD.x0);
                const y = WORLD.y0 + ((j + 0.5) / NY) * (WORLD.y1 - WORLD.y0);
                const plus = feasibleAt(x, y, 1);
                const minus = feasibleAt(x, y, -1);
                if (plus || minus) out.push({x, y, plus, minus});
            }
        }
        return out;
    }, []);
    const tileW = W / 56, tileH = H / 44;

    // 선택한 CoR 의 분석.
    const analysis = useMemo(() => {
        if (!sel) return null;
        const v = corTwist(sel[0], sel[1], sigma);
        const labels = CONTACTS.map((c) => {
            const f = contactWrench(c.p[0], c.p[1], c.n[0], c.n[1]);
            const s = f[0] * v[0] + f[1] * v[1] + f[2] * v[2];
            if (s < -EPS) return "!";
            if (s > EPS) return "B";
            // 접촉점 속도: u = σ ẑ × (p − c)
            const ux = -sigma * (c.p[1] - sel[1]);
            const uy = sigma * (c.p[0] - sel[0]);
            if (Math.hypot(ux, uy) < EPS) return "R";
            // 안쪽 normal 의 오른쪽 방향으로 미끄러지면 Sr.
            return ux * c.n[1] - uy * c.n[0] > 0 ? "Sr" : "Sl";
        });
        return {labels, penetrating: labels.includes("!")};
    }, [sel, sigma]);

    // 몸체 ghost: 선택한 CoR 를 중심으로 ±7° 흔들기.
    const theta = sel ? sigma * phase * 0.12 : 0;
    const rot = (x: number, y: number): [number, number] => {
        if (!sel) return [x, y];
        const dx = x - sel[0], dy = y - sel[1];
        const c = Math.cos(theta), s = Math.sin(theta);
        return [sel[0] + c * dx - s * dy, sel[1] + s * dx + c * dy];
    };
    const bodyPts = [
        [BODY.x0, BODY.y0], [BODY.x1, BODY.y0], [BODY.x1, BODY.y1], [BODY.x0, BODY.y1],
    ].map(([x, y]) => rot(x, y));

    return (
        <div className="flex flex-col gap-2 items-center">
            <div className="flex flex-row gap-1.5">
                {[1, -1].map((s) => (
                    <button key={s} onClick={() => setSigma(s)}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${
                                sigma === s
                                    ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10"
                                    : "border-border text-muted hover:text-[var(--text)]"
                            }`}>
                        {s === 1 ? t("+ (counterclockwise)", "+ (반시계)") : t("− (clockwise)", "− (시계)")}
                    </button>
                ))}
            </div>
            <Stage width={W} height={H}
                   className="bg-surface border border-border rounded-lg overflow-hidden"
                   onClick={(e) => {
                       const pos = e.target.getStage()?.getPointerPosition();
                       if (pos) setSel([invx(pos.x), invy(pos.y)]);
                   }}>
                <Layer>
                    {/* 지금 고른 회전 방향으로 돌아도 안 뚫리는 경첩 위치만 칠한다 */}
                    {tiles.map((tl, i) => {
                        const ok = sigma === 1 ? tl.plus : tl.minus;
                        if (!ok) return null;
                        return (
                            <Rect key={i} x={sx(tl.x) - tileW / 2} y={sy(tl.y) - tileH / 2}
                                  width={tileW + 0.5} height={tileH + 0.5}
                                  fill={colors.accent} opacity={0.2}/>
                        );
                    })}
                    {/* 테이블 */}
                    <Line points={[0, sy(0), W, sy(0)]} stroke={colors.text} strokeWidth={2.5}/>
                    {Array.from({length: 16}, (_, i) => (
                        <Line key={i} points={[(i / 16) * W, sy(0), (i / 16) * W + 10, sy(0) + 10]}
                              stroke={colors.text} strokeWidth={1} opacity={0.3}/>
                    ))}
                    {/* 몸체 (흔들리는 ghost) */}
                    <Line points={bodyPts.flatMap(([x, y]) => [sx(x), sy(y)])} closed
                          fill={colors.accent} opacity={analysis?.penetrating ? 0.35 : 0.8}
                          stroke={analysis?.penetrating ? "#e0533d" : colors.text} strokeWidth={2}/>
                    {/* 손가락 */}
                    <Line points={[sx(-1), sy(1.2), sx(-1.7), sy(1.5), sx(-1.7), sy(0.9)]} closed
                          fill={colors.text} opacity={0.75}/>
                    {/* 접촉 normal 화살표 + 현재 라벨을 접촉점 옆에 바로 표시 */}
                    {CONTACTS.map((c, i) => (
                        <Arrow key={i}
                               points={[sx(c.p[0]), sy(c.p[1]),
                                   sx(c.p[0] + c.n[0] * 0.55), sy(c.p[1] + c.n[1] * 0.55)]}
                               stroke={colors.muted} fill={colors.muted} strokeWidth={2}
                               pointerLength={7} pointerWidth={6}/>
                    ))}
                    {analysis && CONTACTS.map((c, i) => (
                        <Text key={`lb${i}`}
                              x={sx(c.p[0]) + (c.n[0] === 0 ? 10 : -34)}
                              y={sy(c.p[1]) + (c.n[1] === 0 ? -22 : 10)}
                              text={analysis.labels[i] === "!" ? "✗" : analysis.labels[i]}
                              fontSize={14} fontStyle="bold"
                              fill={analysis.labels[i] === "!" ? "#e0533d" : "var(--accent)"}/>
                    ))}
                    {/* 선택한 경첩 */}
                    {sel && (
                        <>
                            <Circle x={sx(sel[0])} y={sy(sel[1])} radius={8}
                                    fill={analysis?.penetrating ? "#e0533d" : colors.text}/>
                            <Circle x={sx(sel[0])} y={sy(sel[1])} radius={3.5}
                                    fill={colors.border}/>
                        </>
                    )}
                    <Text x={6} y={6}
                          text={t("click anywhere: put a hinge there and the body rotates about it",
                              "아무 점이나 클릭해 보라. 그 자리에 경첩을 박고 몸을 돌려 본다")}
                          fontSize={11} fill={colors.muted}/>
                </Layer>
            </Stage>
            <div className="text-xs text-muted text-center tabular-nums">
                {t("shaded = hinge positions that work for the chosen direction",
                    "칠해진 곳 = 지금 고른 방향으로 돌려도 안 뚫리는 경첩 위치")}
                {analysis && sel && (
                    analysis.penetrating
                        ? <span className="font-semibold" style={{color: "#e0533d"}}>
                            {" · "}{t("here it digs into a contact (✗)", "여기서는 접촉을 뚫는다 (✗)")}
                        </span>
                        : <span>
                            {" · "}{t("feasible, labels shown at each contact", "가능. 라벨은 각 접촉점 옆에 표시")}
                        </span>
                )}
            </div>
        </div>
    );
};

const CorLabeler = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "every planar motion is a rotation about some hinge point (the CoR): click to place the hinge and see whether the body can swing, with labels B/Sl/Sr/R at each contact",
            "평면 운동은 결국 어딘가에 경첩(CoR)을 박고 도는 회전이다. 경첩 자리를 클릭하면 몸이 돌 수 있는지, 각 접촉이 B/Sl/Sr/R 중 무엇이 되는지 바로 보인다",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<CorScene panel={Math.min(modalCanvasSize(1.25).width, 760)}/>}
    >
        <CorScene panel={380}/>
    </CanvasFigure>;
};

export default CorLabeler;
