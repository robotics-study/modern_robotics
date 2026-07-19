import {useEffect, useMemo, useRef, useState} from "react";
import {Circle, Image as KImage, Layer, Line, Stage, Text} from "react-konva";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";

// virtual potential field 를 지형처럼 칠하고 (밝음 = 낮음), 로봇 점이 −∇P 를 따라 굴러가게
// 한다. 목표의 이차 "그릇" + 장애물의 반발 퍼텐셜 합이라 대부분의 시작점은 목표로 흘러가지만,
// 왼쪽 두 장애물 사이에서 시작하면 힘이 상쇄되는 local minimum 에 갇힌다. 시작점을 끌어
// 여기저기서 놓아 보는 것이 이 그림의 핵심 체험이다.
const GOAL = {x: 0.55, y: 0.25};
const K_GOAL = 1.0;
// 왼쪽 두 장애물 사이 통로 앞에서 반발이 인력을 이기도록 잡은 값: 그 앞이 local minimum 이 된다.
const K_OBS = 0.008;
const P_CAP = 1.1;                 // 장애물 근처 퍼텐셜 상한 (책의 saturation)
const GRID = 96;

const OBSTACLES = [
    {x: -0.8, y: 0.38, r: 0.28},
    {x: -0.8, y: -0.32, r: 0.28},
    {x: 0.5, y: -0.75, r: 0.28},
];

const potential = (x: number, y: number): number => {
    let p = 0.5 * K_GOAL * ((x - GOAL.x) ** 2 + (y - GOAL.y) ** 2);
    for (const o of OBSTACLES) {
        const d = Math.hypot(x - o.x, y - o.y) - o.r;
        p += d <= 0.01 ? P_CAP : Math.min(P_CAP, K_OBS / (2 * d * d));
    }
    return p;
};

// ∇P 는 유한차분으로 (수식 유도는 본문에; 그림은 수치 gradient 로 충분하다).
const gradient = (x: number, y: number): {gx: number; gy: number} => {
    const h = 0.004;
    return {
        gx: (potential(x + h, y) - potential(x - h, y)) / (2 * h),
        gy: (potential(x, y + h) - potential(x, y - h)) / (2 * h),
    };
};

const WORLD = 1.4;                 // 좌표 범위 [−WORLD, WORLD]²

interface SceneProps {
    panel?: number;
}

const PotentialScene = ({panel = 340}: SceneProps) => {
    const colors = useCanvasColors();
    const t = useTr();
    const [start, setStart] = useState({x: -1.35, y: -0.4});
    const [pos, setPos] = useState({x: -1.35, y: -0.4});
    const [running, setRunning] = useState(false);
    const [verdict, setVerdict] = useState<"" | "goal" | "stuck">("");
    const trailRef = useRef<number[]>([]);
    const rafRef = useRef<number>();

    const toPx = (x: number, y: number) => ({
        x: ((x + WORLD) / (2 * WORLD)) * panel,
        y: ((WORLD - y) / (2 * WORLD)) * panel,
    });
    const fromPx = (px: number, py: number) => ({
        x: (px / panel) * 2 * WORLD - WORLD,
        y: WORLD - (py / panel) * 2 * WORLD,
    });

    // 퍼텐셜 지형 heatmap: 밝을수록 낮다 (목표가 가장 밝은 웅덩이).
    const mapCanvas = useMemo(() => {
        const cv = document.createElement("canvas");
        cv.width = GRID;
        cv.height = GRID;
        const ctx = cv.getContext("2d")!;
        const img = ctx.createImageData(GRID, GRID);
        let pmin = Infinity, pmax = -Infinity;
        const vals: number[] = [];
        for (let py = 0; py < GRID; py++) {
            for (let px = 0; px < GRID; px++) {
                const x = (px / (GRID - 1)) * 2 * WORLD - WORLD;
                const y = WORLD - (py / (GRID - 1)) * 2 * WORLD;
                const p = potential(x, y);
                vals.push(p);
                pmin = Math.min(pmin, p);
                pmax = Math.max(pmax, p);
            }
        }
        for (let i = 0; i < vals.length; i++) {
            const s = (vals[i] - pmin) / (pmax - pmin);
            const k = i * 4;
            // 낮음 = 옅은 보라(accent 계열), 높음 = 진한 남색
            img.data[k] = Math.round(99 + (30 - 99) * s);
            img.data[k + 1] = Math.round(102 + (32 - 102) * s);
            img.data[k + 2] = Math.round(241 + (80 - 241) * s);
            img.data[k + 3] = Math.round(60 + 150 * s);
        }
        ctx.putImageData(img, 0, 0);
        return cv;
    }, []);

    useEffect(() => {
        if (!running) return;
        const tick = () => {
            setPos((prev) => {
                const {gx, gy} = gradient(prev.x, prev.y);
                const gn = Math.hypot(gx, gy);
                const distGoal = Math.hypot(prev.x - GOAL.x, prev.y - GOAL.y);
                if (distGoal < 0.04) {
                    setRunning(false);
                    setVerdict("goal");
                    return prev;
                }
                if (gn < 0.02) {
                    setRunning(false);
                    setVerdict("stuck");
                    return prev;
                }
                // q̇ = −∇P, 스텝 상한으로 안정화
                const step = Math.min(0.012, 0.02 / gn);
                const next = {x: prev.x - gx * step, y: prev.y - gy * step};
                const m = toPx(next.x, next.y);
                trailRef.current.push(m.x, m.y);
                if (trailRef.current.length > 1200) trailRef.current.splice(0, 2);
                return next;
            });
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [running]);

    const launch = (p: {x: number; y: number}) => {
        trailRef.current = [];
        setPos(p);
        setVerdict("");
        setRunning(true);
    };

    const posPx = toPx(pos.x, pos.y);
    const startPx = toPx(start.x, start.y);
    const goalPx = toPx(GOAL.x, GOAL.y);

    return (
        <div className="flex flex-col gap-2 items-center">
            <Stage width={panel} height={panel}
                   className="bg-surface border border-border rounded-lg overflow-hidden">
                <Layer imageSmoothingEnabled={true}>
                    <KImage image={mapCanvas} width={panel} height={panel}/>
                    {OBSTACLES.map((o, i) => {
                        const m = toPx(o.x, o.y);
                        return (
                            <Circle key={i} x={m.x} y={m.y} radius={(o.r / (2 * WORLD)) * panel}
                                    fill={colors.text} opacity={0.8}/>
                        );
                    })}
                    {/* 자취 */}
                    {trailRef.current.length >= 4 && (
                        <Line points={[...trailRef.current]} stroke="#e0533d" strokeWidth={2.5}
                              lineCap="round" lineJoin="round" opacity={0.9}/>
                    )}
                    {/* 목표 + */}
                    <Line points={[goalPx.x - 7, goalPx.y, goalPx.x + 7, goalPx.y]} stroke={colors.text}
                          strokeWidth={2.5}/>
                    <Line points={[goalPx.x, goalPx.y - 7, goalPx.x, goalPx.y + 7]} stroke={colors.text}
                          strokeWidth={2.5}/>
                    <Text x={goalPx.x + 9} y={goalPx.y - 7} text="goal" fontSize={11} fill={colors.text}/>
                    {/* 굴러가는 점 */}
                    <Circle x={posPx.x} y={posPx.y} radius={6} fill="#e0533d" stroke={colors.surface}
                            strokeWidth={2}/>
                    {/* 시작점 (드래그 → 놓으면 발사) */}
                    <Circle
                        x={startPx.x} y={startPx.y} radius={9}
                        fill={colors.surface} stroke={colors.text} strokeWidth={2.5} draggable
                        onDragMove={(e) => setStart(fromPx(e.target.x(), e.target.y()))}
                        onDragEnd={(e) => {
                            const p = fromPx(e.target.x(), e.target.y());
                            setStart(p);
                            launch(p);
                        }}
                    />
                    <Text x={startPx.x + 10} y={startPx.y - 6} text="start" fontSize={11}
                          fill={colors.text}/>
                </Layer>
            </Stage>

            <div className="flex items-center justify-center gap-3 text-xs text-muted">
                <button
                    type="button"
                    onClick={() => launch(start)}
                    className="px-2.5 py-1 rounded border border-[var(--accent)] text-[var(--accent)] font-semibold"
                >
                    ▶ Gradient descent
                </button>
                <span className="font-semibold tabular-nums">
                    {verdict === "goal" && (
                        <span style={{color: "var(--accent)"}}>{t("reached the goal", "목표 도달")}</span>
                    )}
                    {verdict === "stuck" && (
                        <span style={{color: "#e0533d"}}>
                            {t("stuck: ∇P ≈ 0 but not at the goal (local minimum)",
                                "갇힘: ∇P ≈ 0 인데 목표가 아니다 (local minimum)")}
                        </span>
                    )}
                    {verdict === "" && (running ? t("descending...", "gradient descent 중...") : t("drag the start point and release", "시작점을 끌어다 놓아 보라"))}
                </span>
            </div>
            <div className="text-xs text-muted text-center">
                {t("bright = low potential. Try releasing between the two left obstacles.",
                    "밝음 = 낮은 퍼텐셜. 왼쪽 두 장애물 사이에 놓아 보라.")}
            </div>
        </div>
    );
};

const PotentialField = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "virtual potential field: the robot rolls down −∇P toward the goal, unless a local minimum catches it first",
            "virtual potential field: 로봇이 −∇P 를 따라 목표로 굴러간다. local minimum 이 먼저 붙잡지만 않는다면",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<PotentialScene panel={Math.min(modalCanvasSize(1).width, 640)}/>}
    >
        <PotentialScene panel={340}/>
    </CanvasFigure>;
};

export default PotentialField;
