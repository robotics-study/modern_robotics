import {useEffect, useMemo, useRef, useState} from "react";
import {Circle, Image as KImage, Layer, Line, Rect, Stage, Text} from "react-konva";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";

// occupancy grid 맵 (방 두 개 + 문 + 기둥) 위에 potential 을 costmap 처럼 칠하고, 로봇 점이
// gradient descent 로 내려간다. 파라미터 슬라이더가 핵심 체험이다:
//  - d_range (영향 범위) 와 k_rep 을 키우면 문 주변 반발이 겹쳐 문이 "닫히고" 문 앞이
//    local minimum 이 된다 (기본값에서는 통과).
//  - k_att 를 키우면 문은 뚫지만, goal 옆 기둥의 반발 때문에 정확히 goal 에 못 닿고 그 앞에
//    멈추는 것도 볼 수 있다 (인력+반발의 합은 goal 에서 최소가 아닐 수 있다).
const GOAL = {x: 0.5, y: 0.8};

interface Wall {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
}

// 방 두 개짜리 평면도: 테두리 + 문(폭 0.28)이 뚫린 중간 벽 + goal 옆 기둥.
const WALLS: Wall[] = [
    {x0: 0.0, y0: 0.0, x1: 1.0, y1: 0.04},
    {x0: 0.0, y0: 0.96, x1: 1.0, y1: 1.0},
    {x0: 0.0, y0: 0.0, x1: 0.04, y1: 1.0},
    {x0: 0.96, y0: 0.0, x1: 1.0, y1: 1.0},
    {x0: 0.04, y0: 0.48, x1: 0.36, y1: 0.54},
    {x0: 0.64, y0: 0.48, x1: 0.96, y1: 0.54},
    {x0: 0.74, y0: 0.6, x1: 0.86, y1: 0.72},
];

const rectDist = (x: number, y: number, w: Wall) => {
    const dx = Math.max(w.x0 - x, 0, x - w.x1);
    const dy = Math.max(w.y0 - y, 0, y - w.y1);
    return Math.hypot(dx, dy);
};

// 책의 유계 반발 퍼텐셜: d ≥ d_range 이면 0 (영향 범위 밖 장애물 무시).
const makePotential = (kAtt: number, kRep: number, dRange: number) =>
    (x: number, y: number): number => {
        let p = 0.5 * kAtt * ((x - GOAL.x) ** 2 + (y - GOAL.y) ** 2);
        for (const w of WALLS) {
            const d = rectDist(x, y, w);
            if (d < 1e-3) {
                p += 4;
                continue;
            }
            if (d < dRange) p += 0.5 * kRep * ((dRange - d) / (dRange * d)) ** 2;
        }
        return p;
    };

const GRID = 96;

interface SceneProps {
    panel?: number;
}

const PotentialScene = ({panel = 340}: SceneProps) => {
    const colors = useCanvasColors();
    const t = useTr();
    const [kAtt, setKAtt] = useState(1.0);
    const [kRep, setKRep] = useState(0.004);
    const [dRange, setDRange] = useState(0.12);
    const [start, setStart] = useState({x: 0.5, y: 0.15});
    const [pos, setPos] = useState({x: 0.5, y: 0.15});
    const [running, setRunning] = useState(false);
    const [verdict, setVerdict] = useState<"" | "goal" | "stuck">("");
    const trailRef = useRef<number[]>([]);
    const rafRef = useRef<number>();
    // 애니메이션 루프가 항상 최신 파라미터의 퍼텐셜을 쓰도록 ref 로 미러링한다.
    const potRef = useRef(makePotential(1.0, 0.004, 0.12));
    potRef.current = useMemo(() => makePotential(kAtt, kRep, dRange), [kAtt, kRep, dRange]);

    const toPx = (x: number, y: number) => ({x: x * panel, y: (1 - y) * panel});
    const fromPx = (px: number, py: number) => ({x: px / panel, y: 1 - py / panel});

    // costmap 오버레이: 낮음 = 투명한 파랑, 높음 = 빨강 (ROS inflation 느낌).
    const mapCanvas = useMemo(() => {
        const pot = makePotential(kAtt, kRep, dRange);
        const cv = document.createElement("canvas");
        cv.width = GRID;
        cv.height = GRID;
        const ctx = cv.getContext("2d")!;
        const img = ctx.createImageData(GRID, GRID);
        const CAP = 1.2;
        for (let py = 0; py < GRID; py++) {
            for (let px = 0; px < GRID; px++) {
                const x = px / (GRID - 1);
                const y = 1 - py / (GRID - 1);
                const s = Math.min(pot(x, y), CAP) / CAP;
                const k = (py * GRID + px) * 4;
                img.data[k] = Math.round(59 + (239 - 59) * s);
                img.data[k + 1] = Math.round(130 + (68 - 130) * s);
                img.data[k + 2] = Math.round(246 + (68 - 246) * s);
                img.data[k + 3] = Math.round(25 + 150 * s);
            }
        }
        ctx.putImageData(img, 0, 0);
        return cv;
    }, [kAtt, kRep, dRange]);

    useEffect(() => {
        if (!running) return;
        const h = 0.003;
        const tick = () => {
            setPos((prev) => {
                const pot = potRef.current;
                if (Math.hypot(prev.x - GOAL.x, prev.y - GOAL.y) < 0.03) {
                    setRunning(false);
                    setVerdict("goal");
                    return prev;
                }
                const gx0 = (pot(prev.x + h, prev.y) - pot(prev.x - h, prev.y)) / (2 * h);
                const gy0 = (pot(prev.x, prev.y + h) - pot(prev.x, prev.y - h)) / (2 * h);
                if (Math.hypot(gx0, gy0) < 0.02) {
                    setRunning(false);
                    setVerdict("stuck");
                    return prev;
                }
                // q̇ = −∇P, 스텝 상한. 한 프레임에 몇 걸음씩 걸어 체감 속도를 높인다.
                let x = prev.x, y = prev.y;
                for (let k = 0; k < 4; k++) {
                    const gx = (pot(x + h, y) - pot(x - h, y)) / (2 * h);
                    const gy = (pot(x, y + h) - pot(x, y - h)) / (2 * h);
                    const gn = Math.hypot(gx, gy);
                    if (gn < 0.02) break;
                    const st = Math.min(0.004, 0.008 / gn);
                    x -= gx * st;
                    y -= gy * st;
                }
                const m = toPx(x, y);
                trailRef.current.push(m.x, m.y);
                if (trailRef.current.length > 2400) trailRef.current.splice(0, 2);
                return {x, y};
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

    const slider = (label: string, val: number, set: (v: number) => void,
                    min: number, max: number, stepV: number, fmt: (v: number) => string) => (
        <label key={label} className="flex items-center gap-2 text-xs text-muted">
            <span className="w-16 shrink-0">{label}</span>
            <input type="range" min={min} max={max} step={stepV} value={val}
                   onChange={(e) => set(parseFloat(e.target.value))}
                   className="w-full accent-[var(--accent)]" aria-label={label}/>
            <span className="w-12 shrink-0 text-right tabular-nums">{fmt(val)}</span>
        </label>
    );

    return (
        <div className="flex flex-col gap-2 items-center">
            <Stage width={panel} height={panel}
                   className="bg-surface border border-border rounded-lg overflow-hidden">
                <Layer imageSmoothingEnabled={true}>
                    <KImage image={mapCanvas} width={panel} height={panel}/>
                    {/* occupancy 벽 */}
                    {WALLS.map((w, i) => (
                        <Rect key={i} x={w.x0 * panel} y={(1 - w.y1) * panel}
                              width={(w.x1 - w.x0) * panel} height={(w.y1 - w.y0) * panel}
                              fill={colors.text} opacity={0.85}/>
                    ))}
                    {/* 자취 (테두리 + 본선으로 어느 배경 위에서도 보이게) */}
                    {trailRef.current.length >= 4 && (
                        <Line points={[...trailRef.current]} stroke="#ffffff" strokeWidth={4.5}
                              lineCap="round" lineJoin="round" opacity={0.55}/>
                    )}
                    {trailRef.current.length >= 4 && (
                        <Line points={[...trailRef.current]} stroke="#e0533d" strokeWidth={2.5}
                              lineCap="round" lineJoin="round"/>
                    )}
                    {/* 목표 + */}
                    <Line points={[goalPx.x - 7, goalPx.y, goalPx.x + 7, goalPx.y]} stroke={colors.text}
                          strokeWidth={2.5}/>
                    <Line points={[goalPx.x, goalPx.y - 7, goalPx.x, goalPx.y + 7]} stroke={colors.text}
                          strokeWidth={2.5}/>
                    <Text x={goalPx.x + 9} y={goalPx.y - 7} text="goal" fontSize={11} fill={colors.text}/>
                    {/* 내려가는 점 */}
                    <Circle x={posPx.x} y={posPx.y} radius={6} fill="#e0533d" stroke={colors.surface}
                            strokeWidth={2}/>
                    {/* 시작점 (드래그 → 놓으면 gradient descent 시작) */}
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

            <div className="w-full flex flex-col gap-1">
                {slider("k_att", kAtt, setKAtt, 0.4, 2, 0.05, (v) => v.toFixed(2))}
                {slider("k_rep", kRep, setKRep, 0.001, 0.02, 0.001, (v) => v.toFixed(3))}
                {slider("d_range", dRange, setDRange, 0.08, 0.22, 0.005, (v) => v.toFixed(2))}
            </div>
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
                    {verdict === "" && (running
                        ? t("descending...", "gradient descent 중...")
                        : t("drag the start point and release", "시작점을 끌어다 놓아 보라"))}
                </span>
            </div>
            <div className="text-xs text-muted text-center">
                {t("try k_rep = 0.010, d_range = 0.20: the doorway 'closes' and a local minimum appears in front of it. High k_att pushes through, but the pillar's repulsion then stops the robot short of the goal.",
                    "k_rep = 0.010, d_range = 0.20 으로 올려 보라: 문이 '닫히고' 문 앞이 local minimum 이 된다. k_att 를 키우면 문은 뚫지만, 이번엔 기둥의 반발이 goal 직전에서 로봇을 세운다.")}
            </div>
        </div>
    );
};

const PotentialField = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "potential field as a costmap: tune k_att, k_rep, d_range and watch the landscape and its local minima move",
            "costmap 으로 본 potential field: k_att, k_rep, d_range 를 조절하며 지형과 local minimum 이 움직이는 것을 보라",
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
