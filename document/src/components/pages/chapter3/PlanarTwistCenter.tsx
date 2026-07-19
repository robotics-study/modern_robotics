import {useEffect, useRef, useState} from "react";
import {Arrow, Circle, Group, Line, Text} from "react-konva";
import CoordinateSystem from "../../2d/CoordinateCanvas";
import CanvasFigure from "../../CanvasFigure";
import {useTr} from "../../../libs/i18n";
import {globalToMap, mapToGlobal} from "../../../libs/konvaUtils";
import {Vec2} from "../../../libs/planarArm";
import {useCanvasColors} from "../../../libs/useTheme";

// 평면 twist 의 기하: 순간적으로 모든 평면 운동은 어떤 점 q 둘레의 회전이다 (병진은 q 가 무한대).
// 몸체 위 점들의 속도 v = ω ẑ×(x−q) 를 화살표로 보여주고, 특히 "무한히 큰 몸체에서 지금 {s} 원점을
// 지나는 점"의 속도가 twist 의 vs 라는 — 책에서 가장 오해하기 쉬운 — 해석을 그대로 그린다.
const RESOLUTION = 0.05;
const VS_COLOR = "#e0533d";
const VEL_COLOR = "#f2a63a";
const BODY_W = 2.6, BODY_H = 1.5;

interface SceneProps {
    width: number;
    height: number;
}

const PlanarTwistScene = ({width, height}: SceneProps) => {
    const colors = useCanvasColors();
    const t = useTr();
    const [q, setQ] = useState<Vec2>({x: -1.5, y: 1});
    const [omega, setOmega] = useState(0.8);
    const [playing, setPlaying] = useState(true);
    // 몸체 자세: 중심 c 와 각 α. q 둘레 회전을 적분한다 (q 를 끌면 그 순간부터 새 중심 기준).
    const [pose, setPose] = useState({c: {x: 1.6, y: -0.6} as Vec2, alpha: 0});
    const rafRef = useRef<number>();
    const lastRef = useRef<number | null>(null);
    const stateRef = useRef({q, omega});
    stateRef.current = {q, omega};

    useEffect(() => {
        if (!playing) {
            lastRef.current = null;
            return;
        }
        const tick = (now: number) => {
            const dt = lastRef.current === null ? 0 : Math.min(0.05, (now - lastRef.current) / 1000);
            lastRef.current = now;
            const {q: qq, omega: w} = stateRef.current;
            setPose((prev) => {
                // q 둘레 정확한 회전으로 한 스텝 전진한다 (오일러 적분은 반경이 서서히 커진다).
                const da = w * dt;
                const ca = Math.cos(da), sa = Math.sin(da);
                const rx = prev.c.x - qq.x, ry = prev.c.y - qq.y;
                return {
                    c: {x: qq.x + ca * rx - sa * ry, y: qq.y + sa * rx + ca * ry},
                    alpha: prev.alpha + da,
                };
            });
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [playing]);

    const toPx = (p: Vec2) => globalToMap(width, height, p.x, p.y, RESOLUTION);
    const qPx = toPx(q);
    const origin = toPx({x: 0, y: 0});
    const cPx = toPx(pose.c);

    // 속도 화살표: v(x) = ω ẑ×(x−q) = ω(−(y−qy), x−qx). 화살표 길이는 0.55 배 축소.
    const vel = (p: Vec2): Vec2 => ({x: omega * -(p.y - q.y), y: omega * (p.x - q.x)});
    const velArrow = (p: Vec2) => {
        const v = vel(p);
        const a = toPx(p), b = toPx({x: p.x + 0.55 * v.x, y: p.y + 0.55 * v.y});
        return [a.x, a.y, b.x, b.y];
    };
    // 몸체 모서리 (자세 α 적용)
    const corners: Vec2[] = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([sx, sy]) => {
        const lx = sx * BODY_W / 2, ly = sy * BODY_H / 2;
        return {
            x: pose.c.x + lx * Math.cos(pose.alpha) - ly * Math.sin(pose.alpha),
            y: pose.c.y + lx * Math.sin(pose.alpha) + ly * Math.cos(pose.alpha),
        };
    });
    const vs = vel({x: 0, y: 0});
    const rOrigin = Math.hypot(q.x, q.y);

    return (
        <div className="flex flex-col gap-2 items-center" style={{width}}>
            <CoordinateSystem
                width={width}
                height={height}
                resolution={RESOLUTION}
                className="bg-surface border border-border rounded-lg"
            >
                {/* 원점이 그리는 원 (반지름 |q|): "원점에 있는 몸체 점"의 궤적 */}
                <Circle x={qPx.x} y={qPx.y} radius={rOrigin / RESOLUTION} stroke={colors.border}
                        strokeWidth={1.5} dash={[6, 5]}/>
                {/* 몸체 */}
                <Group>
                    <Line points={corners.flatMap((p) => { const m = toPx(p); return [m.x, m.y]; })}
                          closed fill={colors.accent} opacity={0.18}
                          stroke={colors.accent} strokeWidth={2}/>
                    {corners.map((p, i) => (
                        <Arrow key={`v${i}`} points={velArrow(p)} stroke={VEL_COLOR} fill={VEL_COLOR}
                               strokeWidth={2} pointerLength={6} pointerWidth={6}/>
                    ))}
                    <Circle x={cPx.x} y={cPx.y} radius={3.5} fill={colors.accent}/>
                </Group>
                {/* {s} 원점의 vs — 몸체를 무한히 키웠을 때 지금 원점을 지나는 점의 속도 */}
                <Arrow points={velArrow({x: 0, y: 0})} stroke={VS_COLOR} fill={VS_COLOR}
                       strokeWidth={2.5} pointerLength={7} pointerWidth={7}/>
                <Circle x={origin.x} y={origin.y} radius={5} fill={colors.surface}
                        stroke={VS_COLOR} strokeWidth={2}/>
                <Text x={origin.x + 8} y={origin.y + 6} text="vs" fontSize={13} fontStyle="bold"
                      fill={VS_COLOR}/>
                {/* 회전 중심 q (드래그 가능) */}
                <Circle
                    x={qPx.x}
                    y={qPx.y}
                    radius={8}
                    fill={colors.accent}
                    stroke={colors.surface}
                    strokeWidth={2}
                    draggable
                    dragBoundFunc={(pos) => ({
                        x: Math.max(20, Math.min(width - 20, pos.x)),
                        y: Math.max(20, Math.min(height - 20, pos.y)),
                    })}
                    onDragMove={(e) => {
                        setQ(mapToGlobal(width, height, e.target.x(), e.target.y(), RESOLUTION));
                    }}
                />
                <Text x={qPx.x + 10} y={qPx.y - 8} text="q" fontSize={14} fontStyle="bold"
                      fill={colors.accent} listening={false}/>
            </CoordinateSystem>

            <div className="w-full flex flex-col gap-1 text-xs text-muted">
                <label className="flex items-center gap-2">
                    <span className="w-8 shrink-0">ω</span>
                    <input type="range" min={-2} max={2} step={0.05} value={omega}
                           onChange={(e) => setOmega(parseFloat(e.target.value))}
                           className="w-full accent-[var(--accent)]"
                           aria-label={t("angular velocity", "각속도")}/>
                    <span className="w-12 shrink-0 text-right tabular-nums">{omega.toFixed(2)}</span>
                </label>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-0.5">
                    <button
                        type="button"
                        onClick={() => setPlaying((p) => !p)}
                        className="px-2 py-0.5 rounded border border-[var(--accent)] text-[var(--accent)] font-semibold"
                    >
                        {playing ? "❚❚ Pause" : "▶ Play"}
                    </button>
                    <span className="tabular-nums">
                        𝒱s = (ω, v<sub>s</sub>) = ({omega.toFixed(2)}, {vs.x.toFixed(2)}, {vs.y.toFixed(2)})
                    </span>
                </div>
                <div className="text-center">
                    {t("drag q — vs is the velocity of the (imagined) body point now at the origin",
                        "q 를 끌어 보라 — vs 는 (상상으로 키운) 몸체에서 지금 원점에 있는 점의 속도다")}
                </div>
            </div>
        </div>
    );
};

const PlanarTwistCenter = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "a planar twist is rotation about a point q · 𝒱s = (ω, vs) with vs = ω ẑ×(0−q)",
            "평면 twist 는 점 q 둘레의 회전 · 𝒱s = (ω, vs), vs = ω ẑ×(0−q)",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<PlanarTwistScene width={460} height={460}/>}
    >
        <PlanarTwistScene width={320} height={320}/>
    </CanvasFigure>;
};

export default PlanarTwistCenter;
