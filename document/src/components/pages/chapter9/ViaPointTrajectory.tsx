import {useEffect, useMemo, useRef, useState} from "react";
import {Arrow, Circle, Line, Text} from "react-konva";
import type Konva from "konva";
import CoordinateSystem from "../../2d/CoordinateCanvas";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {globalToMap, mapToGlobal} from "../../../libs/konvaUtils";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";

// via point 궤적: 정해진 시각에 네 점을 지나는 곡선을 x(t)·y(t) 각각 piecewise cubic 으로 보간한다.
// "via 를 지정한 속도 방향으로 찍고 지나간다"를 체감시키는 것이 목적: 내부 via 의 주황 접선
// 화살표를 드래그해 통과 방향을 정하고 ▶ 를 누르면, 움직이는 점의 실제 속도(빨강 화살표)가
// via 를 지나는 순간 지정한 화살표와 정확히 겹친다. 통과 순간에는 해당 via 가 켜진다.
const XS = [0, 0, 1, 1] as const;      // 네 via 점의 x 좌표
const YS = [0, 1, 1, 0] as const;      // 네 via 점의 y 좌표
const DT = 1;                          // 각 구간 지속 시간 (시각 T=0,1,2,3)
const TOTAL = DT * (XS.length - 1);    // 궤적 전체 시간
const RESOLUTION = 0.013;
const CX = 0.5, CY = 0.5;              // via 점 bounding box 중심을 원점에 맞춘다
const ARROW_SCALE = 0.35;              // 속도(데이터 단위) → 표시 길이 배율
const V_MAX = 3;
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
const evalCubicDot = (c: Coeffs, dt: number) =>
    c[1] + 2 * c[2] * dt + 3 * c[3] * dt * dt;

interface SceneProps {
    width: number;
    height: number;
}

const ViaScene = ({width, height}: SceneProps) => {
    // 큰 모달 캔버스에서는 world 스케일(resolution)도 함께 키운다 (460px 기준 유지).
    const res = RESOLUTION * Math.min(1, 460 / width);
    const colors = useCanvasColors();
    const t = useTr();
    // 내부 via P2, P3 의 속도 벡터. 양 끝점 속도는 0 으로 고정.
    const [vel, setVel] = useState({vx2: 1, vy2: 0, vx3: 0, vy3: -1});
    const [playing, setPlaying] = useState(true);
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

    // 전체 시각 t → 위치/속도. 구간을 찾아 국소 시간으로 3차식을 평가한다.
    const at = (t0: number) => {
        const tc = Math.max(0, Math.min(TOTAL, t0));
        const j = Math.min(XS.length - 2, Math.floor(tc / DT));
        const dt = tc - j * DT;
        return {
            x: evalCubic(xc[j], dt), y: evalCubic(yc[j], dt),
            vx: evalCubicDot(xc[j], dt), vy: evalCubicDot(yc[j], dt),
        };
    };

    useEffect(() => {
        if (!playing) return;
        startRef.current = performance.now();
        const tick = (now: number) => {
            // 통과 순간이 잘 보이도록 실제 시간의 절반 속도로 재생한다.
            setTNow(((now - startRef.current) / 1800) % TOTAL);
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [playing]);

    const toPx = (x: number, y: number) => globalToMap(width, height, x - CX, y - CY, res);
    const fromPx = (px: number, py: number) => {
        const g = mapToGlobal(width, height, px, py, res);
        return {x: g.x + CX, y: g.y + CY};
    };

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

    // via i (1 또는 2) 를 지나는 순간인지: 통과 시각 근처 ±0.18s.
    const passing = playing
        ? [1, 2].find((i) => Math.abs(tNow - i * DT) < 0.18) ?? null
        : null;

    // 내부 via 점의 속도 접선 화살표 + 드래그 핸들.
    const tangentEnd = (i: number, vx: number, vy: number) =>
        toPx(XS[i] + ARROW_SCALE * vx, YS[i] + ARROW_SCALE * vy);

    const onDragTangent = (i: 1 | 2) => (e: Konva.KonvaEventObject<DragEvent>) => {
        const g = fromPx(e.target.x(), e.target.y());
        const clamp = (v: number) => Math.max(-V_MAX, Math.min(V_MAX, v));
        const vx = clamp((g.x - XS[i]) / ARROW_SCALE);
        const vy = clamp((g.y - YS[i]) / ARROW_SCALE);
        setVel((p) => (i === 1 ? {...p, vx2: vx, vy2: vy} : {...p, vx3: vx, vy3: vy}));
    };

    const interior: Array<{i: 1 | 2; vx: number; vy: number}> = [
        {i: 1, vx: vel.vx2, vy: vel.vy2},
        {i: 2, vx: vel.vx3, vy: vel.vy3},
    ];

    return (
        <div className="flex flex-col gap-2 items-center" style={{width}}>
            <CoordinateSystem
                width={width}
                height={height}
                resolution={res}
                className="bg-surface border border-border rounded-lg"
            >
                <Line points={path} stroke={colors.accent} strokeWidth={3} lineCap="round" lineJoin="round"/>
                {/* 지정한 통과 속도 (주황, 드래그): 통과 순간에는 굵어진다 */}
                {interior.map(({i, vx, vy}) => {
                    const base = vias[i];
                    const end = tangentEnd(i, vx, vy);
                    const hot = passing === i;
                    return (
                        <Arrow key={`t-${i}`} points={[base.x, base.y, end.x, end.y]}
                               stroke={ARROW_COLOR} fill={ARROW_COLOR}
                               strokeWidth={hot ? 5 : 2.5}
                               pointerLength={hot ? 11 : 8} pointerWidth={hot ? 11 : 8}/>
                    );
                })}
                {/* 접선 드래그 핸들 */}
                {interior.map(({i, vx, vy}) => {
                    const end = tangentEnd(i, vx, vy);
                    return (
                        <Circle key={`h-${i}`} x={end.x} y={end.y} radius={9}
                                fill={colors.surface} stroke={ARROW_COLOR} strokeWidth={2.5}
                                draggable onDragMove={onDragTangent(i)}/>
                    );
                })}
                {vias.map((p, i) => (
                    <Circle key={i} x={p.x} y={p.y} radius={passing === i ? 9 : 6}
                            fill={passing === i ? ARROW_COLOR : colors.surface}
                            stroke={colors.text} strokeWidth={2}/>
                ))}
                {vias.map((p, i) => (
                    <Text key={`l-${i}`} x={p.x + 11} y={p.y - 6} text={`P${i + 1}`} fontSize={12}
                          fontStyle="bold" fill={colors.muted}/>
                ))}
                {/* 움직이는 점 + 실제 속도 (빨강): via 를 지나는 순간 주황 화살표와 겹친다 */}
                {playing && (
                    <>
                        <Arrow points={(() => {
                            const end = toPx(dot.x + ARROW_SCALE * dot.vx, dot.y + ARROW_SCALE * dot.vy);
                            return [dotPx.x, dotPx.y, end.x, end.y];
                        })()}
                               stroke={DOT_COLOR} fill={DOT_COLOR} strokeWidth={2.5}
                               pointerLength={8} pointerWidth={8} opacity={0.9}/>
                        <Circle x={dotPx.x} y={dotPx.y} radius={6} fill={DOT_COLOR} stroke={colors.surface}
                                strokeWidth={2}/>
                    </>
                )}
            </CoordinateSystem>

            <div className="w-full flex items-center justify-center gap-3 text-xs text-muted">
                <button
                    type="button"
                    onClick={() => setPlaying((p) => !p)}
                    className="px-2 py-1 rounded border border-[var(--accent)] text-[var(--accent)] font-semibold"
                >
                    {playing ? "❚❚ Pause" : "▶ Play"}
                </button>
                <span className="tabular-nums font-semibold" style={{minWidth: 190}}>
                    {passing
                        ? <span style={{color: ARROW_COLOR}}>
                            {t(`passing P${passing + 1} exactly along its arrow`,
                                `P${passing + 1} 를 지정한 화살표 방향 그대로 통과 중`)}
                        </span>
                        : <span>t = {tNow.toFixed(2)} s</span>}
                </span>
            </div>
            <div className="w-full text-xs text-muted text-center">
                <span style={{color: ARROW_COLOR}} className="font-semibold">
                    → {t("drag: the velocity to stamp at each via", "드래그: 각 via 에서 찍을 통과 속도")}
                </span>
                {" · "}
                <span style={{color: DOT_COLOR}} className="font-semibold">
                    → {t("the moving dot's actual velocity", "움직이는 점의 실제 속도")}
                </span>
            </div>
        </div>
    );
};

const ViaPointTrajectory = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "via-point trajectory · drag the orange arrows, press play, and watch the dot stamp through each via in exactly that direction",
            "Via Point Trajectory · 주황 화살표를 끌어 놓고 재생하면, 점이 각 via 를 정확히 그 방향으로 찍고 지나간다"
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<ViaScene {...modalCanvasSize()}/>}
    >
        <ViaScene width={320} height={320}/>
    </CanvasFigure>;
};

export default ViaPointTrajectory;
