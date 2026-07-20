import {useMemo, useState} from "react";
import {Arrow, Circle, Layer, Line, Stage, Text} from "react-konva";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";

// 전진만 되는 차(Dubins car)의 최단 경로. 정리 13.11: 최단 경로는 최소 회전 반지름 원호
// (C)와 직선(S)만으로 이루어지고, CSC 또는 CCC 꼴이다. 시작/도착 자세를 끌면 여섯 후보
// (LSL, RSR, LSR, RSL, RLR, LRL)를 모두 계산해 끝점이 맞는 것 중 가장 짧은 것을 보여
// 준다. 후보마다 끝점을 수치로 재확인하므로 표시되는 경로는 항상 실제로 도착하는 경로다.
const RHO = 0.3;               // 최소 회전 반지름
const TWO_PI = 2 * Math.PI;
const mod2pi = (a: number) => ((a % TWO_PI) + TWO_PI) % TWO_PI;

type Seg = {turn: -1 | 0 | 1; len: number};   // turn: 1=L, -1=R, 0=S. len 은 라디안(호) 또는 거리/ρ

// 표준 Dubins 여섯 단어. 정규화 좌표 (시작 (0,0,α), 도착 (d,0,β)).
const words = (al: number, be: number, d: number): Array<{name: string; segs: Seg[]} | null> => {
    const sa = Math.sin(al), sb = Math.sin(be), ca = Math.cos(al), cb = Math.cos(be);
    const cab = Math.cos(al - be);
    const out: Array<{name: string; segs: Seg[]} | null> = [];
    // LSL
    {
        const p2 = 2 + d * d - 2 * cab + 2 * d * (sa - sb);
        if (p2 >= 0) {
            const tmp = Math.atan2(cb - ca, d + sa - sb);
            out.push({name: "LSL", segs: [
                {turn: 1, len: mod2pi(-al + tmp)}, {turn: 0, len: Math.sqrt(p2)},
                {turn: 1, len: mod2pi(be - tmp)}]});
        } else out.push(null);
    }
    // RSR
    {
        const p2 = 2 + d * d - 2 * cab + 2 * d * (sb - sa);
        if (p2 >= 0) {
            const tmp = Math.atan2(ca - cb, d - sa + sb);
            out.push({name: "RSR", segs: [
                {turn: -1, len: mod2pi(al - tmp)}, {turn: 0, len: Math.sqrt(p2)},
                {turn: -1, len: mod2pi(-be + tmp)}]});
        } else out.push(null);
    }
    // LSR
    {
        const p2 = -2 + d * d + 2 * cab + 2 * d * (sa + sb);
        if (p2 >= 0) {
            const p = Math.sqrt(p2);
            const tmp = Math.atan2(-ca - cb, d + sa + sb) - Math.atan2(-2, p);
            out.push({name: "LSR", segs: [
                {turn: 1, len: mod2pi(-al + tmp)}, {turn: 0, len: p},
                {turn: -1, len: mod2pi(-mod2pi(be) + tmp)}]});
        } else out.push(null);
    }
    // RSL
    {
        const p2 = -2 + d * d + 2 * cab - 2 * d * (sa + sb);
        if (p2 >= 0) {
            const p = Math.sqrt(p2);
            const tmp = Math.atan2(ca + cb, d - sa - sb) - Math.atan2(2, p);
            out.push({name: "RSL", segs: [
                {turn: -1, len: mod2pi(al - tmp)}, {turn: 0, len: p},
                {turn: 1, len: mod2pi(be - tmp)}]});
        } else out.push(null);
    }
    // RLR
    {
        const tmp = (6 - d * d + 2 * cab + 2 * d * (sa - sb)) / 8;
        if (Math.abs(tmp) <= 1) {
            const p = mod2pi(TWO_PI - Math.acos(tmp));
            const th = Math.atan2(ca - cb, d - sa + sb);
            const t0 = mod2pi(al - th + p / 2);
            out.push({name: "RLR", segs: [
                {turn: -1, len: t0}, {turn: 1, len: p},
                {turn: -1, len: mod2pi(al - be - t0 + p)}]});
        } else out.push(null);
    }
    // LRL
    {
        const tmp = (6 - d * d + 2 * cab + 2 * d * (sb - sa)) / 8;
        if (Math.abs(tmp) <= 1) {
            const p = mod2pi(TWO_PI - Math.acos(tmp));
            const th = Math.atan2(-ca + cb, d + sa - sb);
            const t0 = mod2pi(-al + th + p / 2);
            out.push({name: "LRL", segs: [
                {turn: 1, len: t0}, {turn: -1, len: p},
                {turn: 1, len: mod2pi(be - al - t0 + p)}]});
        } else out.push(null);
    }
    return out;
};

// 세그먼트를 앞으로 굴려 경로를 샘플링한다. 끝점 검증에도 쓴다.
const rollout = (start: [number, number, number], segs: Seg[]) => {
    let [phi, x, y] = start;
    const pts: number[] = [x, y];
    for (const sg of segs) {
        const total = sg.len * RHO;
        const n = Math.max(2, Math.ceil(total / 0.02));
        for (let i = 0; i < n; i++) {
            const ds = total / n;
            if (sg.turn === 0) {
                x += ds * Math.cos(phi);
                y += ds * Math.sin(phi);
            } else {
                phi += sg.turn * ds / RHO;
                x += ds * Math.cos(phi);
                y += ds * Math.sin(phi);
            }
            pts.push(x, y);
        }
    }
    return {pts, end: [phi, x, y] as [number, number, number]};
};

interface SceneProps {
    panel?: number;
}

const DubinsScene = ({panel = 360}: SceneProps) => {
    const colors = useCanvasColors();
    const t = useTr();
    const [start, setStart] = useState<[number, number, number]>([Math.PI / 2, -0.6, -0.35]);
    const [goal, setGoal] = useState<[number, number, number]>([0, 0.55, 0.35]);

    const best = useMemo(() => {
        const dx = goal[1] - start[1], dy = goal[2] - start[2];
        const D = Math.hypot(dx, dy);
        const th = Math.atan2(dy, dx);
        const al = mod2pi(start[0] - th), be = mod2pi(goal[0] - th);
        const cands = words(al, be, D / RHO);
        let bestOne: {name: string; pts: number[]; len: number} | null = null;
        for (const c of cands) {
            if (!c) continue;
            const {pts, end} = rollout(start, c.segs);
            // 끝점 수치 검증: 틀린 후보는 버린다.
            const posErr = Math.hypot(end[1] - goal[1], end[2] - goal[2]);
            const angErr = Math.abs(mod2pi(end[0] - goal[0] + Math.PI) - Math.PI);
            if (posErr > 0.02 || angErr > 0.05) continue;
            const len = c.segs.reduce((a, sg) => a + sg.len * RHO, 0);
            if (!bestOne || len < bestOne.len) bestOne = {name: c.name, pts, len};
        }
        return bestOne;
    }, [start, goal]);

    const W = panel, H = panel;
    const S = panel / 2.4;
    const sx = (x: number) => W / 2 + x * S;
    const sy = (y: number) => H / 2 - y * S;

    const poseHandles = (pose: [number, number, number], set: (p: [number, number, number]) => void,
                         color: string, name: string) => {
        const [phi, x, y] = pose;
        const hx = x + 0.22 * Math.cos(phi), hy = y + 0.22 * Math.sin(phi);
        return (
            <>
                <Arrow points={[sx(x), sy(y), sx(hx), sy(hy)]} stroke={color} fill={color}
                       strokeWidth={3} pointerLength={9} pointerWidth={8}/>
                <Circle x={sx(x)} y={sy(y)} radius={10} fill={color} draggable
                        onDragMove={(e) => {
                            set([phi, (e.target.x() - W / 2) / S, (H / 2 - e.target.y()) / S]);
                        }}/>
                <Circle x={sx(hx)} y={sy(hy)} radius={7} fill={color} opacity={0.55} draggable
                        onDragMove={(e) => {
                            const nx = (e.target.x() - W / 2) / S, ny = (H / 2 - e.target.y()) / S;
                            set([Math.atan2(ny - y, nx - x), x, y]);
                            e.target.position({x: sx(x + 0.22 * Math.cos(Math.atan2(ny - y, nx - x))),
                                y: sy(y + 0.22 * Math.sin(Math.atan2(ny - y, nx - x)))});
                        }}/>
                <Text x={sx(x) - 28} y={sy(y) - 6} text={name} fontSize={11} fill={color}/>
            </>
        );
    };

    return (
        <div className="flex flex-col gap-2 items-center">
            <Stage width={W} height={H}
                   className="bg-surface border border-border rounded-lg overflow-hidden">
                <Layer>
                    {/* 최소 회전 반지름 원 (시작 자세 기준 좌/우) */}
                    {[1, -1].map((sgn) => (
                        <Circle key={sgn}
                                x={sx(start[1] - sgn * RHO * Math.sin(start[0]))}
                                y={sy(start[2] + sgn * RHO * Math.cos(start[0]))}
                                radius={RHO * S} stroke={colors.border} strokeWidth={1}
                                dash={[4, 4]}/>
                    ))}
                    {best && (
                        <Line points={best.pts.flatMap((v, i) => (i % 2 === 0 ? [sx(v)] : [sy(v)]))}
                              stroke={colors.accent} strokeWidth={3}
                              lineCap="round" lineJoin="round"/>
                    )}
                    {poseHandles(start, setStart, "#e0a33d", t("start", "출발"))}
                    {poseHandles(goal, setGoal, "#e0533d", t("goal", "도착"))}
                    <Text x={6} y={6}
                          text={t("drag the dots (position) and small dots (heading)",
                              "큰 점 = 위치, 작은 점 = 진행 방향. 끌어 보라")}
                          fontSize={11} fill={colors.muted}/>
                </Layer>
            </Stage>
            <div className="text-xs text-muted text-center tabular-nums">
                {best
                    ? <span>
                        {t("shortest path type", "최단 경로 유형")}{" "}
                        <span className="font-semibold" style={{color: "var(--accent)"}}>{best.name}</span>
                        {" · "}{t("length", "길이")} {best.len.toFixed(2)}
                        {" · "}
                        {best.name.includes("S")
                            ? t("arc, straight, arc (CSC)", "원호, 직선, 원호 (CSC)")
                            : t("three arcs (CCC): the goal is too close to reach with a straight segment",
                                "원호 셋 (CCC): 목표가 너무 가까워 직선을 끼울 수 없는 경우다")}
                    </span>
                    : t("no valid path found for this pose (numerical edge case): move a handle slightly",
                        "이 자세에서는 수치적 경계 사례라 경로를 못 찾았다. 살짝만 움직여 보라")}
            </div>
        </div>
    );
};

const DubinsPlanner = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "shortest paths for a forward-only (Dubins) car are always CSC or CCC, built from minimum-radius arcs and straight lines. drag the poses and watch the type switch",
            "전진만 되는 차(Dubins car)의 최단 경로는 언제나 최소 반지름 원호와 직선으로 만든 CSC 또는 CCC 다. 자세를 끌면 유형이 바뀌는 순간이 보인다",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<DubinsScene panel={Math.min(modalCanvasSize(1).width, 680)}/>}
    >
        <DubinsScene panel={360}/>
    </CanvasFigure>;
};

export default DubinsPlanner;
