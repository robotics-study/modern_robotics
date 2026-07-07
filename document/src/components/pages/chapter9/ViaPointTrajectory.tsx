import {useEffect, useMemo, useRef, useState} from "react";
import {Arrow, Circle, Line, Text} from "react-konva";
import CoordinateSystem from "../../2d/CoordinateCanvas";
import CanvasFigure from "../../CanvasFigure";
import {globalToMap} from "../../../libs/konvaUtils";
import {useCanvasColors} from "../../../libs/useTheme";

// via point 궤적: 정해진 시각에 네 점을 지나는 곡선을 x(t)·y(t) 각각 piecewise cubic 으로 보간한다.
// 내부 via 점의 속도 벡터(슬라이더)를 바꾸면 곡선이 휘어, "via 속도가 경로 모양을 결정한다"를 보게 한다.
const XS = [0, 0, 1, 1] as const;      // 네 via 점의 x 좌표
const YS = [0, 1, 1, 0] as const;      // 네 via 점의 y 좌표
const DT = 1;                          // 각 구간 지속 시간 (시각 T=0,1,2,3)
const TOTAL = DT * (XS.length - 1);    // 궤적 전체 시간
const RESOLUTION = 0.013;
const CX = 0.5, CY = 0.5;              // via 점 bounding box 중심을 원점에 맞춘다
const ARROW_COLOR = "#f2a63a";
const DOT_COLOR = "#e0533d";

// 한 구간의 3차 계수. Δt∈[0,ΔT] 에서 β=a0+a1Δt+a2Δt²+a3Δt³, (βj,β̇j)→(β_{j+1},β̇_{j+1}) 를 잇는다.
const cubicCoeffs = (b0: number, b1: number, bd0: number, bd1: number, dT: number) => {
    const a0 = b0;
    const a1 = bd0;
    const a2 = (3 * b1 - 3 * b0 - 2 * bd0 * dT - bd1 * dT) / (dT * dT);
    const a3 = (2 * b0 + (bd0 + bd1) * dT - 2 * b1) / (dT * dT * dT);
    return [a0, a1, a2, a3] as const;
};

type Coeffs = readonly [number, number, number, number];

const evalCubic = (c: Coeffs, dt: number) =>
    c[0] + c[1] * dt + c[2] * dt * dt + c[3] * dt * dt * dt;

interface SceneProps {
    width: number;
    height: number;
}

const ViaScene = ({width, height}: SceneProps) => {
    const colors = useCanvasColors();
    // 내부 via P2, P3 의 속도 벡터. 양 끝점 속도는 0 으로 고정.
    const [vel, setVel] = useState({vx2: 1, vy2: 0, vx3: 0, vy3: -1});
    const [playing, setPlaying] = useState(false);
    const [tNow, setTNow] = useState(0);
    const rafRef = useRef<number>();
    const startRef = useRef<number>(0);

    const {xc, yc} = useMemo(() => {
        const vx = [0, vel.vx2, vel.vx3, 0];
        const vy = [0, vel.vy2, vel.vy3, 0];
        const xc: Coeffs[] = [], yc: Coeffs[] = [];
        for (let j = 0; j < XS.length - 1; j++) {
            xc.push(cubicCoeffs(XS[j], XS[j + 1], vx[j], vx[j + 1], DT));
            yc.push(cubicCoeffs(YS[j], YS[j + 1], vy[j], vy[j + 1], DT));
        }
        return {xc, yc};
    }, [vel]);

    // 전체 시각 t → (x,y). 구간을 찾아 국소 시간으로 3차식을 평가한다.
    const at = (t: number) => {
        const tc = Math.max(0, Math.min(TOTAL, t));
        const j = Math.min(XS.length - 2, Math.floor(tc / DT));
        const dt = tc - j * DT;
        return {x: evalCubic(xc[j], dt), y: evalCubic(yc[j], dt)};
    };

    useEffect(() => {
        if (!playing) return;
        startRef.current = performance.now();
        const tick = (now: number) => {
            setTNow(((now - startRef.current) / 1000) % TOTAL);
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [playing]);

    const toPx = (x: number, y: number) => globalToMap(width, height, x - CX, y - CY, RESOLUTION);

    // 곡선을 촘촘히 샘플해 폴리라인으로.
    const path = useMemo(() => {
        const N = 120;
        const flat: number[] = [];
        for (let i = 0; i <= N; i++) {
            const {x, y} = at((i / N) * TOTAL);
            const m = toPx(x, y);
            flat.push(m.x, m.y);
        }
        return flat;
    }, [xc, yc]);

    const vias = XS.map((x, i) => toPx(x, YS[i]));
    const dot = at(tNow);
    const dotPx = toPx(dot.x, dot.y);

    // 내부 via 점의 속도 접선 화살표 (데이터 단위 벡터를 0.35배로 축소해 그린다).
    const tangent = (i: number, vx: number, vy: number) => {
        const base = toPx(XS[i], YS[i]);
        const end = toPx(XS[i] + 0.35 * vx, YS[i] + 0.35 * vy);
        return [base.x, base.y, end.x, end.y];
    };

    const setV = (k: keyof typeof vel, val: number) => setVel((p) => ({...p, [k]: val}));

    const sliders: Array<[keyof typeof vel, string]> = [
        ["vx2", "P₂ vx"], ["vy2", "P₂ vy"], ["vx3", "P₃ vx"], ["vy3", "P₃ vy"],
    ];

    return (
        <div className="flex flex-col gap-2 items-center" style={{width}}>
            <CoordinateSystem
                width={width}
                height={height}
                resolution={RESOLUTION}
                className="bg-surface border border-border rounded-lg"
            >
                <Line points={path} stroke={colors.accent} strokeWidth={3} lineCap="round" lineJoin="round"/>
                <Arrow points={tangent(1, vel.vx2, vel.vy2)} stroke={ARROW_COLOR} fill={ARROW_COLOR}
                       strokeWidth={2.5} pointerLength={8} pointerWidth={8}/>
                <Arrow points={tangent(2, vel.vx3, vel.vy3)} stroke={ARROW_COLOR} fill={ARROW_COLOR}
                       strokeWidth={2.5} pointerLength={8} pointerWidth={8}/>
                {vias.map((p, i) => (
                    <Circle key={i} x={p.x} y={p.y} radius={6} fill={colors.surface} stroke={colors.text}
                            strokeWidth={2}/>
                ))}
                {vias.map((p, i) => (
                    <Text key={`l-${i}`} x={p.x + 9} y={p.y - 6} text={`P${i + 1}`} fontSize={12}
                          fontStyle="bold" fill={colors.muted}/>
                ))}
                {playing && (
                    <Circle x={dotPx.x} y={dotPx.y} radius={6} fill={DOT_COLOR} stroke={colors.surface}
                            strokeWidth={2}/>
                )}
            </CoordinateSystem>

            <div className="w-full flex items-center justify-center">
                <button
                    type="button"
                    onClick={() => setPlaying((p) => !p)}
                    className="px-2 py-1 rounded border border-[var(--accent)] text-[var(--accent)] text-xs font-semibold"
                >
                    {playing ? "❚❚ Pause" : "▶ Play"}
                </button>
            </div>

            <div className="w-full grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted">
                {sliders.map(([k, label]) => (
                    <label key={k} className="flex items-center gap-1">
                        <span className="w-12 shrink-0">{label}</span>
                        <input type="range" min={-3} max={3} step={0.1} value={vel[k]}
                               onChange={(e) => setV(k, parseFloat(e.target.value))}
                               className="w-full accent-[var(--accent)]" aria-label={label}/>
                        <span className="w-8 shrink-0 text-right tabular-nums">{vel[k].toFixed(1)}</span>
                    </label>
                ))}
            </div>
            <div className="w-full text-xs text-muted text-center">
                piecewise-cubic interpolation · continuous position &amp; velocity at every via point
            </div>
        </div>
    );
};

const ViaPointTrajectory = () => {
    return <CanvasFigure
        label="via-point trajectory · tune the interior via velocities to bend the path"
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<ViaScene width={460} height={460}/>}
    >
        <ViaScene width={320} height={320}/>
    </CanvasFigure>;
};

export default ViaPointTrajectory;
