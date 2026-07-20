import {useEffect, useRef, useState} from "react";
import {Circle, Layer, Line, Stage, Text} from "react-konva";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";

// 플래너가 내놓은 삐걱대는 경로(회색)를 두 가지 방법으로 다듬는다.
//  - shortcut (subdivide & reconnect): 경로 위 두 점을 무작위로 골라, 직선이 충돌 없으면
//    그 사이를 직선으로 바꿔치기한다. 길이가 단조 감소한다.
//  - elastic band (gradient): 경로를 점열로 보고 Σ‖q_{i+1}−q_i‖² 를 gradient 로 줄인다.
//    고무줄처럼 팽팽해지되, 장애물 반발 항이 통로 밖으로 밀려나는 것을 막는다.
// 두 방법 모두 "전역 탐색은 플래너에게, 다듬기는 후처리에게"라는 분업의 예다.
const OBSTACLES = [
    {x: 0.35, y: 0.62, r: 0.16},
    {x: 0.66, y: 0.33, r: 0.16},
];

// 플래너 출력을 흉내 낸 지그재그 경로 (grid/RRT 가 내놓을 법한 모양).
const RAW_PATH: Array<{x: number; y: number}> = [
    {x: 0.08, y: 0.92}, {x: 0.1, y: 0.78}, {x: 0.2, y: 0.8}, {x: 0.22, y: 0.66},
    {x: 0.14, y: 0.55}, {x: 0.2, y: 0.42}, {x: 0.34, y: 0.4}, {x: 0.36, y: 0.28},
    {x: 0.48, y: 0.3}, {x: 0.52, y: 0.18}, {x: 0.62, y: 0.14}, {x: 0.7, y: 0.2},
    {x: 0.82, y: 0.16}, {x: 0.86, y: 0.1}, {x: 0.92, y: 0.08},
];

type P = {x: number; y: number};

const inObstacle = (p: P, margin = 0) =>
    OBSTACLES.some((o) => Math.hypot(p.x - o.x, p.y - o.y) < o.r + margin);
const segFree = (a: P, b: P) => {
    const n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 0.01) + 1;
    for (let i = 0; i <= n; i++) {
        const s = i / n;
        if (inObstacle({x: a.x + s * (b.x - a.x), y: a.y + s * (b.y - a.y)})) return false;
    }
    return true;
};
const pathLen = (pts: P[]) => {
    let L = 0;
    for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    return L;
};

// elastic band 용으로 경로를 촘촘한 점열로 리샘플한다.
const densify = (pts: P[], n = 56): P[] => {
    const total = pathLen(pts);
    const out: P[] = [pts[0]];
    let seg = 1, acc = 0;
    for (let k = 1; k < n; k++) {
        const target = (k / (n - 1)) * total;
        while (seg < pts.length - 1) {
            const d = Math.hypot(pts[seg].x - pts[seg - 1].x, pts[seg].y - pts[seg - 1].y);
            if (acc + d >= target) break;
            acc += d;
            seg++;
        }
        const a = pts[seg - 1], b = pts[Math.min(seg, pts.length - 1)];
        const d = Math.hypot(b.x - a.x, b.y - a.y) || 1;
        const s = Math.min(1, Math.max(0, (target - acc) / d));
        out.push({x: a.x + s * (b.x - a.x), y: a.y + s * (b.y - a.y)});
    }
    out[out.length - 1] = pts[pts.length - 1];
    return out;
};

type Mode = "shortcut" | "elastic";

interface SceneProps {
    panel?: number;
}

const SmoothingScene = ({panel = 340}: SceneProps) => {
    const colors = useCanvasColors();
    const t = useTr();
    const [mode, setMode] = useState<Mode>("shortcut");
    const [path, setPath] = useState<P[]>(RAW_PATH);
    const [iter, setIter] = useState(0);
    const [runId, setRunId] = useState(0);
    const timerRef = useRef<number>();

    useEffect(() => {
        const init = mode === "shortcut" ? [...RAW_PATH] : densify(RAW_PATH);
        setPath(init);
        setIter(0);
        let cur = init.map((p) => ({...p}));
        let count = 0;
        timerRef.current = window.setInterval(() => {
            if (mode === "shortcut") {
                // 무작위 두 점을 직선으로 바꿔치기 (충돌 없을 때만). 한 tick 에 3회 시도.
                for (let k = 0; k < 3; k++) {
                    if (cur.length <= 2) break;
                    const i = Math.floor(Math.random() * (cur.length - 2));
                    const j = i + 2 + Math.floor(Math.random() * (cur.length - i - 2));
                    if (j >= cur.length) continue;
                    if (segFree(cur[i], cur[j])) cur = [...cur.slice(0, i + 1), ...cur.slice(j)];
                    count++;
                }
            } else {
                // elastic band: 내부 점마다 이웃 평균으로 당기고 (Σ‖Δq‖² 의 gradient),
                // 장애물에 너무 가까우면 밖으로 밀어낸다. 한 tick 에 4 스텝.
                for (let k = 0; k < 4; k++) {
                    const next = cur.map((p) => ({...p}));
                    for (let i = 1; i < cur.length - 1; i++) {
                        let dx = 0.25 * (cur[i - 1].x + cur[i + 1].x - 2 * cur[i].x);
                        let dy = 0.25 * (cur[i - 1].y + cur[i + 1].y - 2 * cur[i].y);
                        for (const o of OBSTACLES) {
                            const d = Math.hypot(cur[i].x - o.x, cur[i].y - o.y);
                            const clearance = o.r + 0.045;
                            if (d < clearance && d > 1e-6) {
                                const push = (clearance - d) * 0.9;
                                dx += ((cur[i].x - o.x) / d) * push;
                                dy += ((cur[i].y - o.y) / d) * push;
                            }
                        }
                        next[i] = {x: cur[i].x + dx, y: cur[i].y + dy};
                    }
                    cur = next;
                    count++;
                }
            }
            setPath(cur.map((p) => ({...p})));
            setIter(count);
            const budget = mode === "shortcut" ? 120 : 240;
            if (count >= budget) window.clearInterval(timerRef.current);
        }, 50);
        return () => window.clearInterval(timerRef.current);
    }, [mode, runId]);

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

    return (
        <div className="flex flex-col gap-2 items-center">
            <Stage width={panel} height={panel}
                   className="bg-surface border border-border rounded-lg overflow-hidden">
                <Layer>
                    {OBSTACLES.map((o, i) => (
                        <Circle key={i} x={o.x * panel} y={o.y * panel} radius={o.r * panel}
                                fill={colors.muted} opacity={0.55}/>
                    ))}
                    {/* 원래의 삐걱대는 경로 */}
                    <Line points={RAW_PATH.flatMap((p) => [X(p), Y(p)])} stroke={colors.muted}
                          strokeWidth={2} dash={[5, 4]} opacity={0.7}
                          lineCap="round" lineJoin="round"/>
                    {/* 다듬어지는 경로 */}
                    <Line points={path.flatMap((p) => [X(p), Y(p)])} stroke={colors.accent}
                          strokeWidth={3.5} lineCap="round" lineJoin="round"/>
                    <Circle x={X(RAW_PATH[0])} y={Y(RAW_PATH[0])} radius={6} fill={colors.accent}/>
                    <Circle x={X(RAW_PATH[RAW_PATH.length - 1])} y={Y(RAW_PATH[RAW_PATH.length - 1])}
                            radius={6} fill="#e0533d"/>
                    <Text x={X(RAW_PATH[0]) + 9} y={Y(RAW_PATH[0]) - 6} text="start" fontSize={11}
                          fill={colors.muted}/>
                    <Text x={X(RAW_PATH[RAW_PATH.length - 1]) - 32} y={Y(RAW_PATH[RAW_PATH.length - 1]) + 8}
                          text="goal" fontSize={11} fill={colors.muted}/>
                </Layer>
            </Stage>

            <div className="flex items-center justify-center gap-2 text-xs text-muted flex-wrap">
                {modeBtn("shortcut", t("shortcut (subdivide & reconnect)", "shortcut (subdivide & reconnect)"))}
                {modeBtn("elastic", t("elastic band (gradient)", "elastic band (gradient)"))}
                <button type="button" onClick={() => setRunId((r) => r + 1)}
                        className="px-2 py-0.5 rounded border border-border hover:bg-surface">
                    ↻ {t("re-run", "다시 실행")}
                </button>
            </div>
            <div className="text-xs text-muted text-center tabular-nums">
                {t("iterations", "반복")} <span className="font-semibold">{iter}</span>
                {" · "}
                {t("path length", "경로 길이")}{" "}
                <span className="font-semibold" style={{color: "var(--accent)"}}>
                    {pathLen(path).toFixed(3)}
                </span>
                {" "}({t("was", "원래")} {pathLen(RAW_PATH).toFixed(3)})
            </div>
        </div>
    );
};

const PathSmoothing = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "smoothing a planner's jerky path: random shortcuts monotonically shorten it, an elastic band relaxes it smooth",
            "플래너의 삐걱대는 경로 다듬기: 무작위 shortcut 은 길이를 단조 감소시키고, elastic band 는 매끄럽게 풀어 준다",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<SmoothingScene panel={Math.min(modalCanvasSize(1).width, 640)}/>}
    >
        <SmoothingScene panel={340}/>
    </CanvasFigure>;
};

export default PathSmoothing;
