import {useEffect, useMemo, useRef, useState} from "react";
import {Circle, Layer, Line, Stage, Text} from "react-konva";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";

// 샘플링 플래너 두 가지를 같은 환경에서 재생한다. RRT 는 시작점에서 트리 하나가 자라며
// 목표를 찾는 single-query 플래너 (goal bias 슬라이더로 샘플이 목표 쪽으로 얼마나 치우칠지
// 조절), PRM 은 샘플 → k-최근접 연결 → A* 질의의 3단계로 roadmap 을 먼저 짓는
// multiple-query 플래너다. 재생할 때마다 난수가 달라 트리/로드맵 모양이 달라진다.
const START = {x: 0.08, y: 0.9};
const GOAL = {x: 0.92, y: 0.1};
const GOAL_R = 0.05;
const STEP = 0.045;                // RRT 한 걸음 d
const MAX_NODES = 700;
const PRM_N = 130;
const PRM_K = 4;

interface P {
    x: number;
    y: number;
}

const OBSTACLES = [
    {x: 0.42, y: 0.68, r: 0.14},
    {x: 0.6, y: 0.32, r: 0.16},
    {x: 0.16, y: 0.35, r: 0.11},
    {x: 0.85, y: 0.6, r: 0.1},
];

const inObstacle = (p: P) => OBSTACLES.some((o) => Math.hypot(p.x - o.x, p.y - o.y) < o.r);
// 선분을 잘게 샘플해 충돌 검사 (보수적이지만 그림 용도로 충분).
const segFree = (a: P, b: P) => {
    const n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 0.015) + 1;
    for (let i = 0; i <= n; i++) {
        const s = i / n;
        if (inObstacle({x: a.x + s * (b.x - a.x), y: a.y + s * (b.y - a.y)})) return false;
    }
    return true;
};

interface TreeNode {
    p: P;
    parent: number;
}

type Mode = "rrt" | "prm";
type PrmPhase = "samples" | "edges" | "query" | "done";

interface SceneProps {
    panel?: number;
}

const SamplingScene = ({panel = 340}: SceneProps) => {
    const colors = useCanvasColors();
    const t = useTr();
    const [mode, setMode] = useState<Mode>("rrt");
    const [bias, setBias] = useState(0.1);
    const [runId, setRunId] = useState(0);
    // RRT 상태
    const [nodes, setNodes] = useState<TreeNode[]>([{p: START, parent: -1}]);
    const [rrtPath, setRrtPath] = useState<number[]>([]);
    // PRM 상태
    const [prm, setPrm] = useState<{pts: P[]; edges: Array<[number, number]>; path: number[]; phase: PrmPhase}>(
        {pts: [], edges: [], path: [], phase: "samples"});
    const timerRef = useRef<number>();

    // PRM 전체 결과를 미리 계산해 두고 (샘플/간선/질의) 단계별로 드러낸다.
    const prmFull = useMemo(() => {
        void runId;
        const pts: P[] = [{...START}, {...GOAL}];
        while (pts.length < PRM_N) {
            const p = {x: Math.random(), y: Math.random()};
            if (!inObstacle(p)) pts.push(p);
        }
        const edges: Array<[number, number]> = [];
        const adj: number[][] = pts.map(() => []);
        for (let i = 0; i < pts.length; i++) {
            const near = pts
                .map((q, j) => ({j, d: Math.hypot(q.x - pts[i].x, q.y - pts[i].y)}))
                .filter((e) => e.j !== i)
                .sort((a, b) => a.d - b.d)
                .slice(0, PRM_K);
            for (const {j} of near) {
                if (adj[i].includes(j)) continue;
                if (segFree(pts[i], pts[j])) {
                    edges.push([i, j]);
                    adj[i].push(j);
                    adj[j].push(i);
                }
            }
        }
        // roadmap 위 A* (heuristic = 목표까지 직선거리)
        const dist = (i: number, j: number) => Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        const past = new Array(pts.length).fill(Infinity);
        const parent = new Array(pts.length).fill(-1);
        const closed = new Array(pts.length).fill(false);
        past[0] = 0;
        const open = [{i: 0, est: dist(0, 1)}];
        let path: number[] = [];
        while (open.length > 0) {
            open.sort((a, b) => a.est - b.est);
            const {i: cur} = open.shift()!;
            if (closed[cur]) continue;
            closed[cur] = true;
            if (cur === 1) {
                let p = 1;
                while (p >= 0) {
                    path.unshift(p);
                    p = parent[p];
                }
                break;
            }
            for (const nb of adj[cur]) {
                if (closed[nb]) continue;
                const tent = past[cur] + dist(cur, nb);
                if (tent < past[nb]) {
                    past[nb] = tent;
                    parent[nb] = cur;
                    open.push({i: nb, est: tent + dist(nb, 1)});
                }
            }
        }
        return {pts, edges, path};
    }, [runId]);

    // 애니메이션 루프: RRT 는 반복을 실행하고, PRM 은 미리 계산한 결과를 단계별로 드러낸다.
    useEffect(() => {
        setNodes([{p: START, parent: -1}]);
        setRrtPath([]);
        setPrm({pts: [], edges: [], path: [], phase: "samples"});
        let localNodes: TreeNode[] = [{p: START, parent: -1}];
        let shown = 0;
        timerRef.current = window.setInterval(() => {
            if (mode === "rrt") {
                if (localNodes.length >= MAX_NODES) {
                    window.clearInterval(timerRef.current);
                    return;
                }
                // 한 tick 에 RRT 3 반복: 샘플 → 최근접 → d 만큼 전진 → 충돌 검사
                for (let k = 0; k < 3; k++) {
                    const samp = Math.random() < bias
                        ? GOAL
                        : {x: Math.random(), y: Math.random()};
                    let best = 0, bd = Infinity;
                    for (let i = 0; i < localNodes.length; i++) {
                        const d = Math.hypot(localNodes[i].p.x - samp.x, localNodes[i].p.y - samp.y);
                        if (d < bd) {
                            bd = d;
                            best = i;
                        }
                    }
                    const from = localNodes[best].p;
                    const len = Math.max(bd, 1e-9);
                    const to = {
                        x: from.x + (STEP * (samp.x - from.x)) / len,
                        y: from.y + (STEP * (samp.y - from.y)) / len,
                    };
                    if (to.x < 0 || to.x > 1 || to.y < 0 || to.y > 1) continue;
                    if (!segFree(from, to)) continue;
                    localNodes.push({p: to, parent: best});
                    if (Math.hypot(to.x - GOAL.x, to.y - GOAL.y) < GOAL_R) {
                        const path: number[] = [];
                        let p = localNodes.length - 1;
                        while (p >= 0) {
                            path.unshift(p);
                            p = localNodes[p].parent;
                        }
                        setNodes([...localNodes]);
                        setRrtPath(path);
                        window.clearInterval(timerRef.current);
                        return;
                    }
                }
                setNodes([...localNodes]);
            } else {
                // PRM: 샘플 → 간선 → 질의 순서로 드러낸다
                shown += mode === "prm" ? 6 : 0;
                if (shown < prmFull.pts.length) {
                    setPrm({pts: prmFull.pts.slice(0, shown), edges: [], path: [], phase: "samples"});
                } else if (shown < prmFull.pts.length + prmFull.edges.length / 2) {
                    const e = Math.min((shown - prmFull.pts.length) * 2, prmFull.edges.length);
                    setPrm({pts: prmFull.pts, edges: prmFull.edges.slice(0, e), path: [], phase: "edges"});
                } else {
                    setPrm({pts: prmFull.pts, edges: prmFull.edges, path: prmFull.path, phase: "done"});
                    window.clearInterval(timerRef.current);
                }
            }
        }, 40);
        return () => window.clearInterval(timerRef.current);
    }, [mode, bias, runId, prmFull]);

    const X = (p: P) => p.x * panel;
    const Y = (p: P) => p.y * panel;

    const modeBtn = (m: Mode, label: string) => (
        <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`px-2 py-0.5 rounded border ${mode === m
                ? "border-[var(--accent)] text-[var(--accent)] font-semibold"
                : "border-border hover:bg-surface"}`}
        >
            {label}
        </button>
    );

    const status = mode === "rrt"
        ? (rrtPath.length > 0
            ? t(`path found with ${nodes.length} nodes`, `노드 ${nodes.length}개로 경로 발견`)
            : t(`growing: ${nodes.length} nodes`, `자라는 중: 노드 ${nodes.length}개`))
        : prm.phase === "samples"
            ? t(`sampling Cfree: ${prm.pts.length}`, `Cfree 샘플링: ${prm.pts.length}개`)
            : prm.phase === "edges"
                ? t(`connecting k = ${PRM_K} neighbors: ${prm.edges.length} edges`, `k = ${PRM_K} 최근접 연결: 간선 ${prm.edges.length}개`)
                : prm.path.length > 0
                    ? t("roadmap built, A* query answered", "roadmap 완성, A* 질의 응답")
                    : t("roadmap built, but start and goal are disconnected", "roadmap 완성, 그러나 시작-목표가 끊겨 있음");

    return (
        <div className="flex flex-col gap-2 items-center">
            <Stage width={panel} height={panel}
                   className="bg-surface border border-border rounded-lg overflow-hidden">
                <Layer>
                    {OBSTACLES.map((o, i) => (
                        <Circle key={i} x={o.x * panel} y={o.y * panel} radius={o.r * panel}
                                fill={colors.muted} opacity={0.55}/>
                    ))}
                    {/* RRT 트리 */}
                    {mode === "rrt" && nodes.map((n, i) => n.parent >= 0 && (
                        <Line key={`e${i}`}
                              points={[X(nodes[n.parent].p), Y(nodes[n.parent].p), X(n.p), Y(n.p)]}
                              stroke={colors.accent} strokeWidth={1.2} opacity={0.55}/>
                    ))}
                    {mode === "rrt" && rrtPath.length > 0 && (
                        <Line points={rrtPath.flatMap((i) => [X(nodes[i].p), Y(nodes[i].p)])}
                              stroke="#e0533d" strokeWidth={3.5} lineCap="round" lineJoin="round"/>
                    )}
                    {/* PRM roadmap */}
                    {mode === "prm" && prm.edges.map(([a, b], i) => (
                        <Line key={`pe${i}`}
                              points={[X(prm.pts[a]), Y(prm.pts[a]), X(prm.pts[b]), Y(prm.pts[b])]}
                              stroke={colors.accent} strokeWidth={1} opacity={0.4}/>
                    ))}
                    {mode === "prm" && prm.pts.map((p, i) => (
                        <Circle key={`pp${i}`} x={X(p)} y={Y(p)} radius={2.2} fill={colors.accent}
                                opacity={0.8}/>
                    ))}
                    {mode === "prm" && prm.path.length > 0 && (
                        <Line points={prm.path.flatMap((i) => [X(prm.pts[i]), Y(prm.pts[i])])}
                              stroke="#e0533d" strokeWidth={3.5} lineCap="round" lineJoin="round"/>
                    )}
                    {/* 시작/목표 */}
                    <Circle x={X(START)} y={Y(START)} radius={7} fill={colors.accent}/>
                    <Circle x={X(GOAL)} y={Y(GOAL)} radius={GOAL_R * panel} stroke="#e0533d"
                            strokeWidth={2} dash={[4, 3]}/>
                    <Circle x={X(GOAL)} y={Y(GOAL)} radius={4} fill="#e0533d"/>
                    <Text x={X(START) + 10} y={Y(START) - 6} text="start" fontSize={11} fill={colors.muted}/>
                    <Text x={X(GOAL) - 34} y={Y(GOAL) + 10} text="goal" fontSize={11} fill={colors.muted}/>
                </Layer>
            </Stage>

            <div className="flex items-center justify-center gap-2 text-xs text-muted flex-wrap">
                {modeBtn("rrt", "RRT")}
                {modeBtn("prm", "PRM")}
                <button type="button" onClick={() => setRunId((r) => r + 1)}
                        className="px-2 py-0.5 rounded border border-border hover:bg-surface">
                    ↻ {t("re-run", "다시 실행")}
                </button>
            </div>
            {mode === "rrt" && (
                <label className="w-full flex items-center gap-2 text-xs text-muted">
                    <span className="w-16 shrink-0">goal bias</span>
                    <input type="range" min={0} max={0.5} step={0.02} value={bias}
                           onChange={(e) => setBias(parseFloat(e.target.value))}
                           className="w-full accent-[var(--accent)]"
                           aria-label={t("goal bias probability", "goal bias 확률")}/>
                    <span className="w-10 shrink-0 text-right tabular-nums">{Math.round(bias * 100)}%</span>
                </label>
            )}
            <div className="text-xs text-muted text-center tabular-nums font-semibold">{status}</div>
        </div>
    );
};

const SamplingPlanners = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "sampling planners: an RRT grows toward the goal (single query), a PRM builds a reusable roadmap then queries it",
            "sampling 플래너: RRT 는 목표를 향해 트리가 자라고 (single query), PRM 은 재사용할 roadmap 을 먼저 짓고 질의한다",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<SamplingScene panel={Math.min(modalCanvasSize(1).width, 640)}/>}
    >
        <SamplingScene panel={340}/>
    </CanvasFigure>;
};

export default SamplingPlanners;
