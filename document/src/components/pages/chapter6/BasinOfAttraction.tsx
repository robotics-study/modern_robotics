import {useEffect, useMemo, useRef, useState} from "react";
import {Circle, Image as KImage, Layer, Line, Stage, Text} from "react-konva";
import CoordinateSystem from "../../2d/CoordinateCanvas";
import CanvasFigure from "../../CanvasFigure";
import {useTr} from "../../../libs/i18n";
import {globalToMap, mapToGlobal} from "../../../libs/konvaUtils";
import {ik2R, jacobian2R, planarFk, Vec2} from "../../../libs/planarArm";
import {useCanvasColors} from "../../../libs/useTheme";

// "Newton–Raphson 은 초기 추정이 속한 basin 의 해로 수렴한다"를 직접 체험하게 한다.
// 오른쪽 지도의 각 픽셀은 초기 추정 (θ1, θ2) 하나이고, 색은 거기서 출발한 반복이 도달하는 해다
// (righty 파랑 / lefty 주황 / 회색 실패). 지도 위의 ✛ 점을 끌면 그 자리에서 출발한 반복 경로가
// 지도에 그려지고, 왼쪽 팔이 그 반복을 한 스텝씩 따라가며 실제로 해에 붙는 모습을 보여준다.
const L1 = 2, L2 = 1.5;
const RESOLUTION = 0.06;
const ARM_W = 250;
const GRID = 96;
const BASIN_W = 250;
const MAX_ITER = 30;
const TOL = 1e-3;
const MAX_STEP = 1.0;
const RIGHTY_COLOR: [number, number, number] = [99, 102, 241];
const LEFTY_COLOR: [number, number, number] = [242, 166, 58];
const GOAL_COLOR = "#e0533d";
const STEP_MS = 450;        // 팔 애니메이션에서 반복 한 스텝의 시간

const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
const poseDist = (a: [number, number], b: {theta1: number; theta2: number}) =>
    Math.hypot(wrap(a[0] - b.theta1), wrap(a[1] - b.theta2));

interface NRResult {
    kind: number;                     // 0 righty / 1 lefty / -1 실패
    trace: Array<[number, number]>;   // 초기 추정부터의 반복 경로
}

// 위치 전용 2×2 Newton–Raphson. 경로를 함께 돌려준다.
const solveNR = (
    th0: [number, number],
    goal: Vec2,
    righty: {theta1: number; theta2: number},
    lefty: {theta1: number; theta2: number},
): NRResult => {
    let t1 = th0[0], t2 = th0[1];
    const trace: Array<[number, number]> = [[t1, t2]];
    for (let k = 0; k < MAX_ITER; k++) {
        const tip = planarFk([t1, t2], [L1, L2]).points[2];
        const ex = goal.x - tip.x, ey = goal.y - tip.y;
        if (Math.hypot(ex, ey) < TOL) {
            const cur: [number, number] = [t1, t2];
            return {kind: poseDist(cur, righty) <= poseDist(cur, lefty) ? 0 : 1, trace};
        }
        const [j1, j2] = jacobian2R(t1, t2, L1, L2);
        const det = j1.x * j2.y - j2.x * j1.y;
        if (Math.abs(det) < 1e-9) return {kind: -1, trace};
        let d1 = (j2.y * ex - j2.x * ey) / det;
        let d2 = (-j1.y * ex + j1.x * ey) / det;
        const n = Math.hypot(d1, d2);
        if (n > MAX_STEP) {
            d1 *= MAX_STEP / n;
            d2 *= MAX_STEP / n;
        }
        t1 += d1;
        t2 += d2;
        trace.push([t1, t2]);
    }
    return {kind: -1, trace};
};

const BasinScene = () => {
    const colors = useCanvasColors();
    const t = useTr();
    const [goal, setGoal] = useState<Vec2>({x: 1.8, y: 1.6});
    const [guess, setGuess] = useState<[number, number]>([-2.2, 0.4]);
    const [step, setStep] = useState(0);
    const timerRef = useRef<number>();

    const sol = useMemo(() => ik2R(goal.x, goal.y, L1, L2), [goal]);

    // 선택한 초기 추정에서의 반복 경로.
    const nr = useMemo(() => {
        if (!sol.reachable || !sol.righty || !sol.lefty) return null;
        return solveNR(guess, goal, sol.righty, sol.lefty);
    }, [guess, goal, sol]);

    // 팔 애니메이션: trace 를 한 스텝씩 순환 재생. 추정/목표가 바뀌면 처음부터.
    useEffect(() => {
        setStep(0);
        if (!nr) return;
        timerRef.current = window.setInterval(() => {
            setStep((s) => (s + 1) % (nr.trace.length + 2));   // 끝에서 2박자 쉬고 반복
        }, STEP_MS);
        return () => window.clearInterval(timerRef.current);
    }, [nr]);

    // basin 지도 (목표가 바뀔 때만 재계산).
    const basinCanvas = useMemo(() => {
        const cv = document.createElement("canvas");
        cv.width = GRID;
        cv.height = GRID;
        const ctx = cv.getContext("2d")!;
        const img = ctx.createImageData(GRID, GRID);
        if (sol.reachable && sol.righty && sol.lefty) {
            for (let py = 0; py < GRID; py++) {
                const t2 = Math.PI - (py / (GRID - 1)) * 2 * Math.PI;
                for (let px = 0; px < GRID; px++) {
                    const t1 = -Math.PI + (px / (GRID - 1)) * 2 * Math.PI;
                    const c = solveNR([t1, t2], goal, sol.righty, sol.lefty).kind;
                    const i = (py * GRID + px) * 4;
                    if (c === 0) {
                        [img.data[i], img.data[i + 1], img.data[i + 2]] = RIGHTY_COLOR;
                        img.data[i + 3] = 165;
                    } else if (c === 1) {
                        [img.data[i], img.data[i + 1], img.data[i + 2]] = LEFTY_COLOR;
                        img.data[i + 3] = 165;
                    } else {
                        img.data[i] = img.data[i + 1] = img.data[i + 2] = 128;
                        img.data[i + 3] = 60;
                    }
                }
            }
        }
        ctx.putImageData(img, 0, 0);
        return cv;
    }, [goal, sol]);

    const toPx = (p: Vec2) => globalToMap(ARM_W, ARM_W, p.x, p.y, RESOLUTION);
    const goalPx = toPx(goal);
    const thToPx = (t1: number, t2: number) => ({
        x: ((wrap(t1) + Math.PI) / (2 * Math.PI)) * BASIN_W,
        y: ((Math.PI - wrap(t2)) / (2 * Math.PI)) * BASIN_W,
    });

    // 현재 스텝의 팔 자세 (trace 범위를 넘으면 마지막 자세 유지).
    const curTh = nr ? nr.trace[Math.min(step, nr.trace.length - 1)] : guess;
    const armPx = planarFk(curTh, [L1, L2]).points.map(toPx);
    const reachedColor = nr && nr.kind === 0 ? `rgb(${RIGHTY_COLOR.join(",")})`
        : nr && nr.kind === 1 ? `rgb(${LEFTY_COLOR.join(",")})`
        : colors.muted;

    const drawSolution = (th: {theta1: number; theta2: number} | undefined, rgb: [number, number, number]) => {
        if (!th) return null;
        const px = planarFk([th.theta1, th.theta2], [L1, L2]).points.map(toPx);
        const color = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
        return px.slice(0, -1).map((p, i) => (
            <Line key={`${color}-${i}`} points={[p.x, p.y, px[i + 1].x, px[i + 1].y]}
                  stroke={color} strokeWidth={3.5} lineCap="round" opacity={0.35}/>
        ));
    };

    // 지도 위 반복 경로: 감기(wrap)로 점프하는 구간은 끊어 그린다.
    const traceSegs = useMemo(() => {
        if (!nr) return [];
        const segs: number[][] = [];
        let cur: number[] = [];
        for (let i = 0; i < nr.trace.length; i++) {
            const p = thToPx(nr.trace[i][0], nr.trace[i][1]);
            if (i > 0) {
                const prev = thToPx(nr.trace[i - 1][0], nr.trace[i - 1][1]);
                if (Math.abs(p.x - prev.x) > BASIN_W / 2 || Math.abs(p.y - prev.y) > BASIN_W / 2) {
                    if (cur.length >= 4) segs.push(cur);
                    cur = [];
                }
            }
            cur.push(p.x, p.y);
        }
        if (cur.length >= 4) segs.push(cur);
        return segs;
    }, [nr]);

    const guessPx = thToPx(guess[0], guess[1]);
    const doneTh = nr ? nr.trace[Math.min(step, nr.trace.length - 1)] : guess;
    const donePx = thToPx(doneTh[0], doneTh[1]);

    return (
        <div className="flex flex-col gap-2 items-center">
            <div className="flex flex-row flex-wrap gap-3 items-center justify-center">
                {/* 팔 공간: 두 해(흐림) + 반복을 따라가는 현재 팔 */}
                <div className="flex flex-col items-center gap-0.5">
                    <CoordinateSystem
                        width={ARM_W}
                        height={ARM_W}
                        resolution={RESOLUTION}
                        className="bg-surface border border-border rounded-lg"
                    >
                        {drawSolution(sol.righty, RIGHTY_COLOR)}
                        {drawSolution(sol.lefty, LEFTY_COLOR)}
                        {armPx.slice(0, -1).map((p, i) => (
                            <Line key={`a${i}`} points={[p.x, p.y, armPx[i + 1].x, armPx[i + 1].y]}
                                  stroke={reachedColor} strokeWidth={4.5} lineCap="round"/>
                        ))}
                        {armPx.slice(0, -1).map((p, i) => (
                            <Circle key={`aj${i}`} x={p.x} y={p.y} radius={4.5} fill={colors.surface}
                                    stroke={colors.text} strokeWidth={2}/>
                        ))}
                        <Circle
                            x={goalPx.x} y={goalPx.y} radius={8} fill={GOAL_COLOR}
                            stroke={colors.surface} strokeWidth={2} draggable
                            dragBoundFunc={(pos) => ({
                                x: Math.max(10, Math.min(ARM_W - 10, pos.x)),
                                y: Math.max(10, Math.min(ARM_W - 10, pos.y)),
                            })}
                            onDragMove={(e) => {
                                setGoal(mapToGlobal(ARM_W, ARM_W, e.target.x(), e.target.y(), RESOLUTION));
                            }}
                        />
                    </CoordinateSystem>
                    <span className="text-xs text-muted">
                        {t("the arm replays the iteration, step by step",
                            "팔이 반복 과정을 한 스텝씩 재생한다")}
                    </span>
                </div>

                {/* θ-공간 지도: 색 = 그 픽셀에서 출발하면 도달하는 해. ✛ 를 끌어 출발점을 고른다 */}
                <div className="flex flex-col items-center gap-0.5">
                    <Stage width={BASIN_W} height={BASIN_W}
                           className="bg-surface border border-border rounded-lg overflow-hidden">
                        <Layer imageSmoothingEnabled={false}>
                            <KImage image={basinCanvas} width={BASIN_W} height={BASIN_W}/>
                            {traceSegs.map((seg, i) => (
                                <Line key={`tr${i}`} points={seg} stroke={colors.text} strokeWidth={1.5}
                                      opacity={0.8} dash={[3, 3]}/>
                            ))}
                            {sol.reachable && sol.righty && (
                                <Circle {...thToPx(sol.righty.theta1, sol.righty.theta2)} radius={6}
                                        fill={`rgb(${RIGHTY_COLOR.join(",")})`}
                                        stroke={colors.surface} strokeWidth={2}/>
                            )}
                            {sol.reachable && sol.lefty && (
                                <Circle {...thToPx(sol.lefty.theta1, sol.lefty.theta2)} radius={6}
                                        fill={`rgb(${LEFTY_COLOR.join(",")})`}
                                        stroke={colors.surface} strokeWidth={2}/>
                            )}
                            {/* 반복의 현재 위치 */}
                            <Circle x={donePx.x} y={donePx.y} radius={4} fill={colors.text}/>
                            {/* 초기 추정 ✛ (드래그) */}
                            <Circle
                                x={guessPx.x} y={guessPx.y} radius={9}
                                fill={colors.surface} stroke={colors.text} strokeWidth={2.5}
                                draggable
                                dragBoundFunc={(pos) => ({
                                    x: Math.max(4, Math.min(BASIN_W - 4, pos.x)),
                                    y: Math.max(4, Math.min(BASIN_W - 4, pos.y)),
                                })}
                                onDragMove={(e) => {
                                    const t1 = (e.target.x() / BASIN_W) * 2 * Math.PI - Math.PI;
                                    const t2 = Math.PI - (e.target.y() / BASIN_W) * 2 * Math.PI;
                                    setGuess([t1, t2]);
                                }}
                            />
                            <Text x={guessPx.x - 4} y={guessPx.y - 6} text="✛" fontSize={12}
                                  fill={colors.text} listening={false}/>
                            <Text x={6} y={BASIN_W - 18} text="θ₁ →" fontSize={11} fill={colors.muted}/>
                            <Text x={6} y={6} text="θ₂ ↑" fontSize={11} fill={colors.muted}/>
                        </Layer>
                    </Stage>
                    <span className="text-xs text-muted">
                        {t("drag ✛ to pick the initial guess", "✛ 를 끌어 초기 추정을 고른다")}
                    </span>
                </div>
            </div>
            <div className="text-xs text-muted text-center tabular-nums">
                <span style={{color: `rgb(${RIGHTY_COLOR.join(",")})`}} className="font-semibold">■ righty</span>
                {" · "}
                <span style={{color: `rgb(${LEFTY_COLOR.join(",")})`}} className="font-semibold">■ lefty</span>
                {" · "}
                <span className="font-semibold">■ {t("no convergence", "수렴 실패")}</span>
                {nr && (
                    <>
                        {" · "}
                        {t("this guess", "이 추정")}: {Math.min(step, nr.trace.length - 1)}/{nr.trace.length - 1}{" "}
                        {t("steps", "스텝")} →{" "}
                        <span style={{color: reachedColor}} className="font-semibold">
                            {nr.kind === 0 ? "righty" : nr.kind === 1 ? "lefty" : t("fails", "실패")}
                        </span>
                    </>
                )}
            </div>
        </div>
    );
};

const BasinOfAttraction = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "pick a starting guess on the map: the dashed path shows the iteration walking to that basin's solution",
            "지도에서 출발점을 고르면, 점선 경로가 그 basin 의 해까지 걸어가는 반복 과정을 보여준다",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<BasinScene/>}
    >
        <BasinScene/>
    </CanvasFigure>;
};

export default BasinOfAttraction;
