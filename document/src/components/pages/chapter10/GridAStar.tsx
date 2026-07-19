import {useEffect, useMemo, useRef, useState} from "react";
import {Circle, Layer, Line, Rect, Stage, Text} from "react-konva";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";

// A* 를 grid 위에서 눈으로 확인한다. 셀을 클릭해 벽을 그리면 즉시 다시 탐색하고,
// 탐색된(CLOSED) 셀이 순서대로 차오른 뒤 최단 경로가 굵게 그려진다. heuristic 을
// 0 (Dijkstra) ↔ Manhattan ↔ 과대평가(탐욕)로 바꾸면, 같은 문제에서 탐색한 셀 수가
// 어떻게 달라지는지가 핵심 볼거리다 (낙관적 heuristic 만 최적 경로를 보장한다).
const N = 20;                      // N×N grid
const START = {x: 1, y: N - 2};
const GOAL = {x: N - 2, y: 1};

type Heuristic = "dijkstra" | "manhattan" | "greedy";

// 기본 벽: 통로가 두 개 있는 ㄷ자 미로 느낌.
const defaultWalls = (): boolean[] => {
    const w = new Array(N * N).fill(false);
    const set = (x: number, y: number) => {
        if (x >= 0 && x < N && y >= 0 && y < N) w[y * N + x] = true;
    };
    for (let y = 3; y < 15; y++) set(6, y);
    for (let y = 6; y < N - 2; y++) set(12, y);
    for (let x = 12; x < 18; x++) set(x, 6);
    return w;
};

interface SearchResult {
    order: number[];               // CLOSED 로 닫힌 셀 순서
    path: number[];                // 경로 셀 index 열 (없으면 빈 배열)
    cost: number;
}

// 4-connected A*. heuristic 에 따라 Dijkstra / Manhattan / 과대평가(×3) 로 동작한다.
const runAStar = (walls: boolean[], h: Heuristic): SearchResult => {
    const idx = (x: number, y: number) => y * N + x;
    const hCost = (x: number, y: number) => {
        if (h === "dijkstra") return 0;
        const m = Math.abs(x - GOAL.x) + Math.abs(y - GOAL.y);
        return h === "manhattan" ? m : 3 * m;
    };
    const past = new Array(N * N).fill(Infinity);
    const parent = new Array(N * N).fill(-1);
    const closed = new Array(N * N).fill(false);
    const open: Array<{i: number; est: number; g: number}> = [];
    const s = idx(START.x, START.y);
    past[s] = 0;
    open.push({i: s, est: hCost(START.x, START.y), g: 0});
    const order: number[] = [];
    while (open.length > 0) {
        // f 동률이면 g 가 큰(더 깊이 간) 노드 우선: unit grid 의 f-동률 corridor 에서
        // 낭비 탐색을 막는 표준 tie-break 다. 이것이 없으면 A* 가 Dijkstra 보다 못해 보일 수 있다.
        open.sort((a, b) => (a.est - b.est) || (b.g - a.g));
        const {i: cur} = open.shift()!;
        if (closed[cur]) continue;
        closed[cur] = true;
        order.push(cur);
        if (cur === idx(GOAL.x, GOAL.y)) {
            const path: number[] = [];
            let p = cur;
            while (p >= 0) {
                path.unshift(p);
                p = parent[p];
            }
            return {order, path, cost: past[cur]};
        }
        const cx = cur % N, cy = Math.floor(cur / N);
        const nbrs = [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]];
        for (const [nx, ny] of nbrs) {
            if (nx < 0 || nx >= N || ny < 0 || ny >= N) continue;
            const ni = idx(nx, ny);
            if (walls[ni] || closed[ni]) continue;
            const tentative = past[cur] + 1;
            if (tentative < past[ni]) {
                past[ni] = tentative;
                parent[ni] = cur;
                open.push({i: ni, est: tentative + hCost(nx, ny), g: tentative});
            }
        }
    }
    return {order, path: [], cost: Infinity};
};

interface SceneProps {
    panel?: number;
}

const AStarScene = ({panel = 340}: SceneProps) => {
    const colors = useCanvasColors();
    const t = useTr();
    const [walls, setWalls] = useState<boolean[]>(defaultWalls);
    const [heu, setHeu] = useState<Heuristic>("manhattan");
    const [frame, setFrame] = useState(0);
    const timerRef = useRef<number>();

    const result = useMemo(() => runAStar(walls, heu), [walls, heu]);

    // 탐색 애니메이션: CLOSED 순서대로 차오른다. 벽/heuristic 이 바뀌면 처음부터.
    useEffect(() => {
        setFrame(0);
        timerRef.current = window.setInterval(() => {
            setFrame((f) => {
                if (f >= result.order.length + 12) {
                    window.clearInterval(timerRef.current);
                    return f;
                }
                return f + Math.max(2, Math.ceil(result.order.length / 90));
            });
        }, 30);
        return () => window.clearInterval(timerRef.current);
    }, [result]);

    const cell = panel / N;
    const done = frame >= result.order.length;
    const visible = Math.min(frame, result.order.length);

    const toggleWall = (x: number, y: number) => {
        if ((x === START.x && y === START.y) || (x === GOAL.x && y === GOAL.y)) return;
        setWalls((prev) => {
            const next = [...prev];
            next[y * N + x] = !next[y * N + x];
            return next;
        });
    };

    const heuBtn = (key: Heuristic, label: string) => (
        <button
            key={key}
            type="button"
            onClick={() => setHeu(key)}
            className={`px-2 py-0.5 rounded border ${heu === key
                ? "border-[var(--accent)] text-[var(--accent)] font-semibold"
                : "border-border hover:bg-surface"}`}
        >
            {label}
        </button>
    );

    return (
        <div className="flex flex-col gap-2 items-center">
            <Stage width={panel} height={panel}
                   className="bg-surface border border-border rounded-lg overflow-hidden"
                   onClick={(e) => {
                       const pos = e.target.getStage()?.getPointerPosition();
                       if (pos) toggleWall(Math.floor(pos.x / cell), Math.floor(pos.y / cell));
                   }}>
                <Layer>
                    {/* 탐색된 셀 (순서대로) */}
                    {result.order.slice(0, visible).map((i) => (
                        <Rect key={`c${i}`} x={(i % N) * cell} y={Math.floor(i / N) * cell}
                              width={cell} height={cell} fill={colors.accent} opacity={0.22}/>
                    ))}
                    {/* 벽 */}
                    {walls.map((w, i) => w && (
                        <Rect key={`w${i}`} x={(i % N) * cell} y={Math.floor(i / N) * cell}
                              width={cell} height={cell} fill={colors.text} opacity={0.75}/>
                    ))}
                    {/* grid 선 (성능상 굵직하게 4칸마다) */}
                    {Array.from({length: N / 4 + 1}, (_, k) => (
                        <Line key={`gv${k}`} points={[k * 4 * cell, 0, k * 4 * cell, panel]}
                              stroke={colors.border} strokeWidth={1} opacity={0.5}/>
                    ))}
                    {Array.from({length: N / 4 + 1}, (_, k) => (
                        <Line key={`gh${k}`} points={[0, k * 4 * cell, panel, k * 4 * cell]}
                              stroke={colors.border} strokeWidth={1} opacity={0.5}/>
                    ))}
                    {/* 경로 */}
                    {done && result.path.length > 0 && (
                        <Line
                            points={result.path.flatMap((i) => [(i % N + 0.5) * cell, (Math.floor(i / N) + 0.5) * cell])}
                            stroke="#e0533d" strokeWidth={Math.max(3, cell * 0.3)}
                            lineCap="round" lineJoin="round"/>
                    )}
                    {/* 시작/목표 */}
                    <Circle x={(START.x + 0.5) * cell} y={(START.y + 0.5) * cell} radius={cell * 0.33}
                            fill={colors.accent}/>
                    <Circle x={(GOAL.x + 0.5) * cell} y={(GOAL.y + 0.5) * cell} radius={cell * 0.33}
                            fill="#e0533d"/>
                    <Text x={(START.x + 1) * cell} y={(START.y) * cell} text="start" fontSize={11}
                          fill={colors.muted}/>
                    <Text x={(GOAL.x - 2.6) * cell} y={(GOAL.y + 0.2) * cell} text="goal" fontSize={11}
                          fill={colors.muted}/>
                </Layer>
            </Stage>

            <div className="flex items-center justify-center gap-1.5 text-xs text-muted flex-wrap">
                {heuBtn("dijkstra", "h = 0 (Dijkstra)")}
                {heuBtn("manhattan", "h = Manhattan (A*)")}
                {heuBtn("greedy", "h ×3 (greedy)")}
            </div>
            <div className="text-xs text-muted text-center tabular-nums">
                {t("explored", "탐색한 셀")}{" "}
                <span className="font-semibold" style={{color: "var(--accent)"}}>{result.order.length}</span>
                {" · "}
                {result.path.length > 0
                    ? <>{t("path length", "경로 길이")}{" "}
                        <span className="font-semibold" style={{color: "#e0533d"}}>{result.cost}</span></>
                    : <span className="font-semibold">{t("no path", "경로 없음")}</span>}
                {" · "}
                {t("click cells to draw/erase walls", "셀을 클릭해 벽을 그리거나 지운다")}
            </div>
        </div>
    );
};

const GridAStar = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "A* on a grid: switch the heuristic and compare how many cells each search explores for the same shortest path",
            "grid 위의 A*: heuristic 을 바꿔 가며, 같은 최단 경로를 찾는 데 몇 칸을 탐색하는지 비교해 보라",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<AStarScene panel={Math.min(modalCanvasSize(1).width, 640)}/>}
    >
        <AStarScene panel={340}/>
    </CanvasFigure>;
};

export default GridAStar;
