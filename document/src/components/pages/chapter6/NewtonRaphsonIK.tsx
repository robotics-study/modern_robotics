import {useMemo, useState} from "react";
import {Circle, Line, Text} from "react-konva";
import type Konva from "konva";
import CoordinateSystem from "../../2d/CoordinateCanvas";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {globalToMap, mapToGlobal} from "../../../libs/konvaUtils";
import {jacobian2R, planarFk, Vec2} from "../../../libs/planarArm";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";

// 수치 역기구학(Newton–Raphson): 초기 추정 θ0 에서 시작해 Δθ = J⁻¹(x_d − f(θ)) 를 반복 적용,
// tip 이 목표(goal)로 수렴한다. "Step" 으로 한 번에 한 반복씩 진행하며 tip 궤적과 오차를 보인다.
const L1 = 2, L2 = 1.5;
const RESOLUTION = 0.06;
const GOAL_COLOR = "#e0533d";
const TOL = 1e-3;
const INITIAL_GUESS: [number, number] = [0, 0.5];
// Newton 방향으로 가되 한 스텝의 관절 변화량을 제한한다(trust region). 초기 추정이 멀 때
// 1차 근사가 과도하게 벗어나 다른 해로 튀는 것을 막아 수렴을 부드럽게 보여준다.
const MAX_STEP = 0.5;

const fk = (t: [number, number]): Vec2 => {
    const {points} = planarFk(t, [L1, L2]);
    return points[points.length - 1];
};

// 2×2 좌표 Jacobian 을 역행렬로 풀어 Newton 스텝을 계산한다. 특이점 근처면 스텝을 생략한다.
const newtonStep = (t: [number, number], goal: Vec2): [number, number] | null => {
    const f = fk(t);
    const ex = goal.x - f.x, ey = goal.y - f.y;
    const [j1, j2] = jacobian2R(t[0], t[1], L1, L2);
    const det = j1.x * j2.y - j2.x * j1.y;
    if (Math.abs(det) < 1e-4) return null;
    let d1 = (j2.y * ex - j2.x * ey) / det;
    let d2 = (-j1.y * ex + j1.x * ey) / det;
    const n = Math.hypot(d1, d2);
    if (n > MAX_STEP) {
        d1 *= MAX_STEP / n;
        d2 *= MAX_STEP / n;
    }
    return [t[0] + d1, t[1] + d2];
};

interface SceneProps {
    width: number;
    height: number;
}

const NewtonScene = ({width, height}: SceneProps) => {
    // 큰 모달 캔버스에서는 world 스케일(resolution)도 함께 키운다 (460px 기준 유지).
    const res = RESOLUTION * Math.min(1, 460 / width);
    const colors = useCanvasColors();
    const t = useTr();
    const [goal, setGoal] = useState<Vec2>(() => fk([Math.PI / 6, Math.PI / 2])); // θ_d = (30°, 90°)
    const [theta, setTheta] = useState<[number, number]>(INITIAL_GUESS);
    const [trace, setTrace] = useState<Vec2[]>(() => [fk(INITIAL_GUESS)]);
    const [iter, setIter] = useState(0);

    const err = useMemo(() => {
        const f = fk(theta);
        return Math.hypot(goal.x - f.x, goal.y - f.y);
    }, [theta, goal]);
    const converged = err < TOL;

    const reset = (g: Vec2) => {
        setTheta(INITIAL_GUESS);
        setTrace([fk(INITIAL_GUESS)]);
        setIter(0);
        setGoal(g);
    };

    const step = () => {
        if (converged) return;
        const next = newtonStep(theta, goal);
        if (!next) return;
        setTheta(next);
        setTrace((prev) => [...prev, fk(next)]);
        setIter((i) => i + 1);
    };

    const toPx = (p: Vec2) => globalToMap(width, height, p.x, p.y, res);
    const armPx = planarFk(theta, [L1, L2]).points.flatMap((p) => {
        const m = toPx(p);
        return [m.x, m.y];
    });
    const tracePx = trace.flatMap((p) => {
        const m = toPx(p);
        return [m.x, m.y];
    });
    const gPx = toPx(goal);
    const center = toPx({x: 0, y: 0});

    const onDragGoal = (e: Konva.KonvaEventObject<DragEvent>) => {
        reset(mapToGlobal(width, height, e.target.x(), e.target.y(), res));
    };

    return (
        <div className="flex flex-col gap-2 items-center" style={{width}}>
            <CoordinateSystem
                width={width}
                height={height}
                resolution={res}
                className="bg-surface border border-border rounded-lg"
            >
                {/* tip 궤적: 반복마다 목표로 다가가는 경로 */}
                {trace.length > 1 && (
                    <Line points={tracePx} stroke={colors.muted} strokeWidth={1.5} dash={[4, 4]}/>
                )}
                {trace.map((p, i) => {
                    const m = toPx(p);
                    return <Circle key={`tr-${i}`} x={m.x} y={m.y} radius={3} fill={colors.muted}/>;
                })}
                <Line points={armPx} stroke={colors.accent} strokeWidth={4} lineCap="round"/>
                <Circle x={center.x} y={center.y} radius={5} fill={colors.surface} stroke={colors.text}
                        strokeWidth={2}/>
                <Circle x={gPx.x} y={gPx.y} radius={8} draggable fill={GOAL_COLOR} stroke={colors.surface}
                        strokeWidth={2} onDragMove={onDragGoal}/>
                <Text x={gPx.x + 12} y={gPx.y - 6} text={t("goal", "목표")} fontSize={12} fill={GOAL_COLOR}
                      fontStyle="bold"/>
            </CoordinateSystem>
            <div className="w-full flex items-center justify-between text-xs text-muted">
                <div className="flex gap-2">
                    <button type="button" onClick={step} disabled={converged}
                            className="px-3 py-1 rounded-md bg-[var(--accent)] text-white font-semibold disabled:opacity-40">
                        Step
                    </button>
                    <button type="button" onClick={() => reset(goal)}
                            className="px-3 py-1 rounded-md border border-border">
                        Reset
                    </button>
                </div>
                <div className="text-right tabular-nums">
                    iter {iter} · ‖error‖ = {err.toFixed(4)} m{" "}
                    {converged && <span className="text-[var(--accent)] font-semibold">· converged</span>}
                </div>
            </div>
        </div>
    );
};

const NewtonRaphsonIK = () => {
    const t = useTr();
    return <CanvasFigure
        label={t("numerical IK · Newton–Raphson iteration", "수치적 Inverse Kinematics · Newton–Raphson 반복")}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<NewtonScene {...modalCanvasSize()}/>}
    >
        <NewtonScene width={320} height={320}/>
    </CanvasFigure>;
};

export default NewtonRaphsonIK;
