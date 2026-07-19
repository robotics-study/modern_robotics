import {Fragment, useEffect, useMemo, useRef, useState} from "react";
import {Circle, Line} from "react-konva";
import CoordinateSystem from "../../2d/CoordinateCanvas";
import CanvasFigure from "../../CanvasFigure";
import {useTr} from "../../../libs/i18n";
import {globalToMap, mapToGlobal} from "../../../libs/konvaUtils";
import {ik2R, Vec2} from "../../../libs/planarArm";
import {useCanvasColors} from "../../../libs/useTheme";

// IK 해의 개수가 "무한"이 되는 경우를 손에 잡히게 한다. 3R 팔이 tip 위치만 맞추면
// 관절이 하나 남으므로(3 관절, 제약 2), 해는 1차원 가족을 이룬다. 마지막 링크의 방향 ψ 를
// 매개변수로 잡으면: 손목 W = 목표 − L3(cosψ, sinψ) 를 2R IK 로 풀 수 있는 모든 ψ 가
// 해 하나씩을 준다. ▶ 를 누르면 tip 을 목표에 붙인 채 팔 전체가 그 가족을 훑는다.
const L1 = 2, L2 = 1.6, L3 = 1.1;
const RESOLUTION = 0.05;
const GOAL_COLOR = "#e0533d";
const GHOST_N = 90;         // 유효 ψ 탐색 해상도 (고스트는 그중 일부만 그린다)

interface Solution {
    psi: number;
    joints: Vec2[];         // base, joint2, wrist, tip
}

// 주어진 ψ 에서의 해 (righty 가지). 손목이 2R 로 못 닿으면 null.
const solveAt = (goal: Vec2, psi: number): Solution | null => {
    const w: Vec2 = {x: goal.x - L3 * Math.cos(psi), y: goal.y - L3 * Math.sin(psi)};
    const s = ik2R(w.x, w.y, L1, L2);
    if (!s.reachable || !s.righty) return null;
    const {theta1, theta2} = s.righty;
    const j2: Vec2 = {x: L1 * Math.cos(theta1), y: L1 * Math.sin(theta1)};
    return {psi, joints: [{x: 0, y: 0}, j2, w, goal]};
};

interface SceneProps {
    width: number;
    height: number;
}

const RedundantScene = ({width, height}: SceneProps) => {
    const colors = useCanvasColors();
    const t = useTr();
    const [goal, setGoal] = useState<Vec2>({x: 2.6, y: 1.4});
    const [psi, setPsi] = useState(1.2);
    const [playing, setPlaying] = useState(true);
    const rafRef = useRef<number>();
    const dirRef = useRef(1);

    // 유효 ψ 집합과 고스트 가족. 목표가 바뀔 때만 재계산.
    const family = useMemo(() => {
        const sols: Solution[] = [];
        for (let i = 0; i < GHOST_N; i++) {
            const p = -Math.PI + (i / GHOST_N) * 2 * Math.PI;
            const s = solveAt(goal, p);
            if (s) sols.push(s);
        }
        return sols;
    }, [goal]);

    // ▶ 동안 ψ 를 유효 범위 안에서 좌우로 쓸어 준다.
    useEffect(() => {
        if (!playing || family.length === 0) return;
        const tick = () => {
            setPsi((prev) => {
                // 표시용 슬라이더 범위 [-π, π] 를 유지하도록 감아 준다.
                const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
                let next = wrap(prev + dirRef.current * 0.02);
                // 유효한 ψ 만 통과: 다음 값이 풀리지 않으면 방향을 뒤집는다.
                if (!solveAt(goal, next)) {
                    dirRef.current = -dirRef.current;
                    next = wrap(prev + dirRef.current * 0.02);
                    if (!solveAt(goal, next)) next = family[0].psi;
                }
                return next;
            });
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [playing, goal, family]);

    const current = solveAt(goal, psi) ?? family[Math.floor(family.length / 2)] ?? null;
    const toPx = (p: Vec2) => globalToMap(width, height, p.x, p.y, RESOLUTION);
    const goalPx = toPx(goal);

    const drawArm = (sol: Solution, opacity: number, strokeW: number, withJoints: boolean) => {
        const px = sol.joints.map(toPx);
        return (
            <>
                {px.slice(0, -1).map((p, i) => (
                    <Line key={`s${sol.psi.toFixed(3)}-${i}`}
                          points={[p.x, p.y, px[i + 1].x, px[i + 1].y]}
                          stroke={colors.accent} strokeWidth={strokeW} lineCap="round"
                          opacity={opacity}/>
                ))}
                {withJoints && px.slice(0, -1).map((p, i) => (
                    <Circle key={`j${i}`} x={p.x} y={p.y} radius={5} fill={colors.surface}
                            stroke={colors.text} strokeWidth={2}/>
                ))}
            </>
        );
    };

    return (
        <div className="flex flex-col gap-2 items-center" style={{width}}>
            <CoordinateSystem
                width={width}
                height={height}
                resolution={RESOLUTION}
                className="bg-surface border border-border rounded-lg"
            >
                {/* 해 가족의 고스트: 전부 같은 목표점에 tip 을 붙이고 있다 */}
                {family.filter((_, i) => i % 6 === 0).map((s) => (
                    <Fragment key={s.psi.toFixed(4)}>{drawArm(s, 0.13, 3, false)}</Fragment>
                ))}
                {/* 현재 해 */}
                {current && drawArm(current, 1, 4.5, true)}
                {/* 목표점 (드래그) */}
                <Circle
                    x={goalPx.x} y={goalPx.y} radius={8} fill={GOAL_COLOR}
                    stroke={colors.surface} strokeWidth={2} draggable
                    dragBoundFunc={(pos) => ({
                        x: Math.max(10, Math.min(width - 10, pos.x)),
                        y: Math.max(10, Math.min(height - 10, pos.y)),
                    })}
                    onDragMove={(e) => {
                        setGoal(mapToGlobal(width, height, e.target.x(), e.target.y(), RESOLUTION));
                    }}
                />
            </CoordinateSystem>

            <div className="w-full flex flex-col gap-1 text-xs text-muted">
                <label className="flex items-center gap-2">
                    <span className="w-8 shrink-0">ψ</span>
                    <input type="range" min={-Math.PI} max={Math.PI} step={0.01} value={psi}
                           disabled={playing}
                           onChange={(e) => setPsi(parseFloat(e.target.value))}
                           className="w-full accent-[var(--accent)]"
                           aria-label={t("self-motion parameter", "자기운동 파라미터")}/>
                    <span className="w-12 shrink-0 text-right tabular-nums">
                        {Math.round(psi * 180 / Math.PI)}°
                    </span>
                </label>
                <div className="flex items-center justify-center gap-3 pt-0.5">
                    <button
                        type="button"
                        onClick={() => setPlaying((p) => !p)}
                        className="px-2.5 py-1 rounded border border-[var(--accent)] text-[var(--accent)] font-semibold"
                    >
                        {playing ? "❚❚ Pause" : `▶ ${t("sweep the family", "해 가족 훑기")}`}
                    </button>
                    <span className="tabular-nums">
                        {family.length === 0
                            ? t("goal unreachable: 0 solutions", "목표 도달 불가: 해 0개")
                            : t("solutions: infinitely many (a 1-D family)", "해: 무한히 많음 (1차원 가족)")}
                    </span>
                </div>
            </div>
        </div>
    );
};

const RedundantIKFamily = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "a redundant 3R arm: the tip stays glued to the goal while the whole arm sweeps its family of IK solutions",
            "redundant 3R 팔: tip 은 목표에 붙인 채, 팔 전체가 IK 해의 가족을 훑는다",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<RedundantScene width={460} height={460}/>}
    >
        <RedundantScene width={320} height={320}/>
    </CanvasFigure>;
};

export default RedundantIKFamily;
