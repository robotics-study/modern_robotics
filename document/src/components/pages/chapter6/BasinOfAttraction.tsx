import {useMemo, useState} from "react";
import {Circle, Image as KImage, Layer, Line, Stage, Text} from "react-konva";
import CoordinateSystem from "../../2d/CoordinateCanvas";
import CanvasFigure from "../../CanvasFigure";
import {useTr} from "../../../libs/i18n";
import {globalToMap, mapToGlobal} from "../../../libs/konvaUtils";
import {ik2R, jacobian2R, planarFk, Vec2} from "../../../libs/planarArm";
import {useCanvasColors} from "../../../libs/useTheme";

// Newton–Raphson 이 "초기 추정에 가장 가까운 해"로 수렴한다는 말을 지도로 보여준다.
// 오른쪽 패널의 각 픽셀은 초기 추정 (θ1, θ2) 하나다. 그 점에서 반복을 돌려 righty 해에
// 도달하면 파랑, lefty 해면 주황, 수렴 실패면 회색으로 칠한다. 목표점을 끌면 두 해와
// 지도가 함께 변한다. 경계가 복잡하게 얽히는 것이 바로 "basin of attraction"의 실체다.
const L1 = 2, L2 = 1.5;
const RESOLUTION = 0.06;
const ARM_W = 250;
const GRID = 96;            // 초기 추정 격자 해상도 (픽셀당 N-R 1회)
const BASIN_W = 250;
const MAX_ITER = 30;
const TOL = 1e-3;
const MAX_STEP = 1.0;       // 스텝 클램프: 1차 근사가 크게 벗어나는 것을 방지
const RIGHTY_COLOR: [number, number, number] = [99, 102, 241];   // accent 계열
const LEFTY_COLOR: [number, number, number] = [242, 166, 58];
const GOAL_COLOR = "#e0533d";

// 각도 차이를 [-π, π] 로 감아 두 관절각 자세 사이의 거리를 잰다.
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
const poseDist = (a: [number, number], b: {theta1: number; theta2: number}) =>
    Math.hypot(wrap(a[0] - b.theta1), wrap(a[1] - b.theta2));

// 위치 전용 2×2 Newton–Raphson: θ ← θ + J⁻¹(x_d − f(θ)). 반환: 0 righty / 1 lefty / -1 실패.
const classify = (
    th0: [number, number],
    goal: Vec2,
    righty: {theta1: number; theta2: number},
    lefty: {theta1: number; theta2: number},
): number => {
    let t1 = th0[0], t2 = th0[1];
    for (let k = 0; k < MAX_ITER; k++) {
        const tip = planarFk([t1, t2], [L1, L2]).points[2];
        const ex = goal.x - tip.x, ey = goal.y - tip.y;
        if (Math.hypot(ex, ey) < TOL) {
            const cur: [number, number] = [t1, t2];
            return poseDist(cur, righty) <= poseDist(cur, lefty) ? 0 : 1;
        }
        const [j1, j2] = jacobian2R(t1, t2, L1, L2);
        const det = j1.x * j2.y - j2.x * j1.y;
        if (Math.abs(det) < 1e-9) return -1;
        let d1 = (j2.y * ex - j2.x * ey) / det;
        let d2 = (-j1.y * ex + j1.x * ey) / det;
        const n = Math.hypot(d1, d2);
        if (n > MAX_STEP) {
            d1 *= MAX_STEP / n;
            d2 *= MAX_STEP / n;
        }
        t1 += d1;
        t2 += d2;
    }
    return -1;
};

const BasinScene = () => {
    const colors = useCanvasColors();
    const t = useTr();
    const [goal, setGoal] = useState<Vec2>({x: 1.8, y: 1.6});

    const sol = useMemo(() => ik2R(goal.x, goal.y, L1, L2), [goal]);

    // 초기 추정 격자 전체를 분류해 오프스크린 캔버스에 그린다. 목표가 바뀔 때만 재계산.
    const basinCanvas = useMemo(() => {
        const cv = document.createElement("canvas");
        cv.width = GRID;
        cv.height = GRID;
        const ctx = cv.getContext("2d")!;
        const img = ctx.createImageData(GRID, GRID);
        if (sol.reachable && sol.righty && sol.lefty) {
            for (let py = 0; py < GRID; py++) {
                // 화면 y 아래 방향 = θ2 감소 방향으로 맞춘다.
                const t2 = Math.PI - (py / (GRID - 1)) * 2 * Math.PI;
                for (let px = 0; px < GRID; px++) {
                    const t1 = -Math.PI + (px / (GRID - 1)) * 2 * Math.PI;
                    const c = classify([t1, t2], goal, sol.righty, sol.lefty);
                    const i = (py * GRID + px) * 4;
                    if (c === 0) {
                        [img.data[i], img.data[i + 1], img.data[i + 2]] = RIGHTY_COLOR;
                        img.data[i + 3] = 175;
                    } else if (c === 1) {
                        [img.data[i], img.data[i + 1], img.data[i + 2]] = LEFTY_COLOR;
                        img.data[i + 3] = 175;
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

    // 왼쪽 팔 패널: 두 해 + 드래그 목표점.
    const toPx = (p: Vec2) => globalToMap(ARM_W, ARM_W, p.x, p.y, RESOLUTION);
    const goalPx = toPx(goal);
    const armPts = (th: {theta1: number; theta2: number}) =>
        planarFk([th.theta1, th.theta2], [L1, L2]).points.map(toPx);

    // 오른쪽 θ-공간 좌표 변환.
    const thToPx = (t1: number, t2: number) => ({
        x: ((t1 + Math.PI) / (2 * Math.PI)) * BASIN_W,
        y: ((Math.PI - t2) / (2 * Math.PI)) * BASIN_W,
    });

    const drawArm = (th: {theta1: number; theta2: number} | undefined, rgb: [number, number, number]) => {
        if (!th) return null;
        const px = armPts(th);
        const color = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
        return (
            <>
                {px.slice(0, -1).map((p, i) => (
                    <Line key={`${color}-${i}`} points={[p.x, p.y, px[i + 1].x, px[i + 1].y]}
                          stroke={color} strokeWidth={4} lineCap="round" opacity={0.8}/>
                ))}
                {px.slice(0, -1).map((p, i) => (
                    <Circle key={`${color}-j${i}`} x={p.x} y={p.y} radius={4.5} fill={colors.surface}
                            stroke={color} strokeWidth={2}/>
                ))}
            </>
        );
    };

    return (
        <div className="flex flex-col gap-2 items-center">
            <div className="flex flex-row flex-wrap gap-3 items-center justify-center">
                <div className="flex flex-col items-center gap-0.5">
                    <CoordinateSystem
                        width={ARM_W}
                        height={ARM_W}
                        resolution={RESOLUTION}
                        className="bg-surface border border-border rounded-lg"
                    >
                        {drawArm(sol.righty, RIGHTY_COLOR)}
                        {drawArm(sol.lefty, LEFTY_COLOR)}
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
                        {t("two IK solutions for the dragged goal", "목표점(드래그)의 두 IK 해")}
                    </span>
                </div>

                <div className="flex flex-col items-center gap-0.5">
                    <Stage width={BASIN_W} height={BASIN_W}
                           className="bg-surface border border-border rounded-lg overflow-hidden">
                        <Layer imageSmoothingEnabled={false}>
                            <KImage image={basinCanvas} width={BASIN_W} height={BASIN_W}/>
                            {sol.reachable && sol.righty && (
                                <Circle {...thToPx(sol.righty.theta1, sol.righty.theta2)} radius={5}
                                        fill={colors.surface} stroke={colors.text} strokeWidth={2}/>
                            )}
                            {sol.reachable && sol.lefty && (
                                <Circle {...thToPx(sol.lefty.theta1, sol.lefty.theta2)} radius={5}
                                        fill={colors.surface} stroke={colors.text} strokeWidth={2}/>
                            )}
                            <Text x={6} y={BASIN_W - 18} text="θ₁ →" fontSize={11} fill={colors.muted}/>
                            <Text x={6} y={6} text="θ₂ ↑" fontSize={11} fill={colors.muted}/>
                        </Layer>
                    </Stage>
                    <span className="text-xs text-muted">
                        {t("initial-guess map: which solution does N-R reach?",
                            "초기 추정 지도: N-R 이 어느 해에 도달하나?")}
                    </span>
                </div>
            </div>
            <div className="text-xs text-muted text-center">
                <span style={{color: `rgb(${RIGHTY_COLOR.join(",")})`}} className="font-semibold">■ righty</span>
                {" · "}
                <span style={{color: `rgb(${LEFTY_COLOR.join(",")})`}} className="font-semibold">■ lefty</span>
                {" · "}
                <span className="font-semibold">■ {t("no convergence", "수렴 실패")}</span>
                {" · ○ "}
                {t("the two solutions in θ-space", "θ-공간에서의 두 해")}
            </div>
        </div>
    );
};

const BasinOfAttraction = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "every initial guess belongs to a basin: Newton-Raphson converges to whichever solution's basin it starts in",
            "모든 초기 추정은 어느 basin 에 속한다: Newton-Raphson 은 출발한 basin 의 해로 수렴한다",
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
