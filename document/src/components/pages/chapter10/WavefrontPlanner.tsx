import {useEffect, useMemo, useRef, useState} from "react";
import {Circle, Layer, Line, Rect, Stage, Text} from "react-konva";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";

// wavefront 플래너: 목표에서 breadth-first 로 "파도"가 번지며 모든 자유 셀에 목표까지의
// 거리를 새긴다 (애니메이션). 전처리가 끝나면 아무 셀이나 클릭해 보라. 그 자리에서 낮은
// 이웃으로 내려가기만 하는 경로가 즉시 나온다. 같은 목표에 대한 질의가 공짜가 되는
// multiple-query 전처리의 요점이고, 이 퍼텐셜에는 local minimum 이 아예 없다.
const N = 16;
const GOAL = {x: 12, y: 3};

const WALLS = ((): boolean[] => {
    const w = new Array(N * N).fill(false);
    const set = (x: number, y: number) => {
        if (x >= 0 && x < N && y >= 0 && y < N) w[y * N + x] = true;
    };
    for (let x = 3; x <= 10; x++) set(x, 5);
    for (let y = 5; y <= 11; y++) set(10, y);
    for (let x = 2; x <= 6; x++) set(x, 11);
    return w;
})();

// 목표에서의 BFS 거리 지도 + 파도가 도달한 순서.
const buildWavefront = () => {
    const dist = new Array(N * N).fill(Infinity);
    const order: number[] = [];
    const gi = GOAL.y * N + GOAL.x;
    dist[gi] = 0;
    const queue = [gi];
    while (queue.length > 0) {
        const cur = queue.shift()!;
        order.push(cur);
        const cx = cur % N, cy = Math.floor(cur / N);
        for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
            if (nx < 0 || nx >= N || ny < 0 || ny >= N) continue;
            const ni = ny * N + nx;
            if (WALLS[ni] || dist[ni] !== Infinity) continue;
            dist[ni] = dist[cur] + 1;
            queue.push(ni);
        }
    }
    return {dist, order};
};

interface SceneProps {
    panel?: number;
}

const WavefrontScene = ({panel = 340}: SceneProps) => {
    const colors = useCanvasColors();
    const t = useTr();
    const {dist, order} = useMemo(buildWavefront, []);
    const [frame, setFrame] = useState(0);
    const [query, setQuery] = useState<{x: number; y: number} | null>(null);
    const timerRef = useRef<number>();

    useEffect(() => {
        timerRef.current = window.setInterval(() => {
            setFrame((f) => {
                if (f >= order.length) {
                    window.clearInterval(timerRef.current);
                    return f;
                }
                return f + 4;
            });
        }, 40);
        return () => window.clearInterval(timerRef.current);
    }, [order]);

    const cell = panel / N;
    const flooded = Math.min(frame, order.length);
    const maxDist = dist.reduce((m, d) => (Number.isFinite(d) ? Math.max(m, d) : m), 0);
    const ready = flooded >= order.length;

    // 질의: 클릭한 셀에서 "낮은 이웃으로 내려가기"만 반복한다.
    const path = useMemo(() => {
        if (!query || !ready) return [];
        let cur = query.y * N + query.x;
        if (WALLS[cur] || !Number.isFinite(dist[cur])) return [];
        const out = [cur];
        while (dist[cur] > 0) {
            const cx = cur % N, cy = Math.floor(cur / N);
            let best = cur;
            for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
                if (nx < 0 || nx >= N || ny < 0 || ny >= N) continue;
                const ni = ny * N + nx;
                if (dist[ni] < dist[best]) best = ni;
            }
            if (best === cur) break;
            cur = best;
            out.push(cur);
        }
        return out;
    }, [query, ready, dist]);

    return (
        <div className="flex flex-col gap-2 items-center">
            <Stage width={panel} height={panel}
                   className="bg-surface border border-border rounded-lg overflow-hidden"
                   onClick={(e) => {
                       const pos = e.target.getStage()?.getPointerPosition();
                       if (pos && ready) setQuery({x: Math.floor(pos.x / cell), y: Math.floor(pos.y / cell)});
                   }}>
                <Layer>
                    {/* 파도: 거리값으로 색을 칠하고 숫자를 새긴다 */}
                    {order.slice(0, flooded).map((i) => {
                        const d = dist[i];
                        const s = d / Math.max(maxDist, 1);
                        return (
                            <Rect key={`f${i}`} x={(i % N) * cell} y={Math.floor(i / N) * cell}
                                  width={cell} height={cell} fill={colors.accent}
                                  opacity={0.06 + 0.3 * (1 - s)}/>
                        );
                    })}
                    {cell > 16 && order.slice(0, flooded).map((i) => (
                        <Text key={`d${i}`} x={(i % N) * cell + 2} y={Math.floor(i / N) * cell + 2}
                              text={String(dist[i])} fontSize={Math.min(11, cell * 0.42)}
                              fill={colors.muted}/>
                    ))}
                    {/* 벽 */}
                    {WALLS.map((w, i) => w && (
                        <Rect key={`w${i}`} x={(i % N) * cell} y={Math.floor(i / N) * cell}
                              width={cell} height={cell} fill={colors.text} opacity={0.75}/>
                    ))}
                    {/* 질의 경로 */}
                    {path.length > 1 && (
                        <Line points={path.flatMap((i) => [(i % N + 0.5) * cell, (Math.floor(i / N) + 0.5) * cell])}
                              stroke="#e0533d" strokeWidth={Math.max(3, cell * 0.22)}
                              lineCap="round" lineJoin="round"/>
                    )}
                    {query && path.length > 0 && (
                        <Circle x={(query.x + 0.5) * cell} y={(query.y + 0.5) * cell} radius={cell * 0.3}
                                fill="#e0533d"/>
                    )}
                    {/* 목표 */}
                    <Circle x={(GOAL.x + 0.5) * cell} y={(GOAL.y + 0.5) * cell} radius={cell * 0.33}
                            fill={colors.accent}/>
                    <Text x={(GOAL.x + 1.1) * cell} y={(GOAL.y + 0.1) * cell} text="goal" fontSize={11}
                          fill={colors.muted}/>
                </Layer>
            </Stage>
            <div className="text-xs text-muted text-center tabular-nums">
                {ready
                    ? (path.length > 1
                        ? <span>
                            <span className="font-semibold" style={{color: "#e0533d"}}>
                                {t("downhill path", "내리막 경로")} {path.length - 1}
                            </span>
                            {" · "}
                            {t("click another free cell", "다른 자유 셀도 클릭해 보라")}
                        </span>
                        : <span className="font-semibold">
                            {t("preprocessing done: click any free cell to query instantly",
                                "전처리 끝: 아무 자유 셀이나 클릭하면 즉시 질의된다")}
                        </span>)
                    : t("breadth-first wave spreading from the goal...", "목표에서 breadth-first 파도가 번지는 중...")}
            </div>
        </div>
    );
};

const WavefrontPlanner = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "wavefront planner: one breadth-first pass labels every cell, then every query is just walking downhill",
            "wavefront 플래너: breadth-first 한 번이 모든 셀에 거리를 새기면, 이후 모든 질의는 내리막 걷기다",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<WavefrontScene panel={Math.min(modalCanvasSize(1).width, 640)}/>}
    >
        <WavefrontScene panel={340}/>
    </CanvasFigure>;
};

export default WavefrontPlanner;
