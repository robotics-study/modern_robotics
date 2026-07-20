import {useMemo, useState} from "react";
import {Circle, Image as KImage, Layer, Line, Stage, Text} from "react-konva";
import CoordinateSystem from "../../2d/CoordinateCanvas";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {globalToMap} from "../../../libs/konvaUtils";
import {planarFk} from "../../../libs/planarArm";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";

// 작업 공간의 장애물이 C-space 에서 어떤 모양이 되는지 직접 본다. 왼쪽은 2R 팔과 장애물
// A·B·C 가 있는 작업 공간, 오른쪽은 (θ1, θ2) C-space 지도이고, 지도의 색칠된 영역이 그
// 색 장애물과의 충돌 configuration 전체다. 지도 위 점을 끌면 팔이 따라 움직여, "장애물이
// Cfree 를 몇 개의 연결 성분으로 쪼갠다"를 손으로 확인할 수 있다.
const L1 = 1.0, L2 = 0.8;
const RESOLUTION = 0.012;
const GRID = 96;

interface Obstacle {
    x: number;
    y: number;
    r: number;
    color: string;
    label: string;
}

const OBSTACLES: Obstacle[] = [
    {x: 1.15, y: 0.85, r: 0.3, color: "#e0533d", label: "A"},
    {x: -1.15, y: 0.75, r: 0.26, color: "#f2a63a", label: "B"},
    {x: 0.15, y: -1.25, r: 0.3, color: "#8b5cf6", label: "C"},
];

// 점-선분 거리로 링크(두 선분)와 원 장애물의 충돌을 검사한다. 충돌한 장애물 index, 없으면 -1.
const segDist = (px: number, py: number, ax: number, ay: number, bx: number, by: number) => {
    const dx = bx - ax, dy = by - ay;
    const len2 = dx * dx + dy * dy;
    const t = len2 < 1e-12 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
};

const collide = (t1: number, t2: number): number => {
    const x1 = L1 * Math.cos(t1), y1 = L1 * Math.sin(t1);
    const x2 = x1 + L2 * Math.cos(t1 + t2), y2 = y1 + L2 * Math.sin(t1 + t2);
    for (let i = 0; i < OBSTACLES.length; i++) {
        const o = OBSTACLES[i];
        if (segDist(o.x, o.y, 0, 0, x1, y1) < o.r) return i;
        if (segDist(o.x, o.y, x1, y1, x2, y2) < o.r) return i;
    }
    return -1;
};

const hexToRgb = (hex: string): [number, number, number] => [
    parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16),
];

interface SceneProps {
    panel?: number;
}

const CSpaceScene = ({panel = 260}: SceneProps) => {
    const colors = useCanvasColors();
    const t = useTr();
    // C-space 좌표 (θ1, θ2) ∈ [0, 2π)². 초기값은 자유 공간.
    const [th, setTh] = useState<[number, number]>([1.1, 4.9]);
    const res = RESOLUTION * (260 / panel);

    // C-obstacle 지도: 픽셀 하나가 configuration 하나, 색 = 충돌한 장애물.
    const mapCanvas = useMemo(() => {
        const cv = document.createElement("canvas");
        cv.width = GRID;
        cv.height = GRID;
        const ctx = cv.getContext("2d")!;
        const img = ctx.createImageData(GRID, GRID);
        for (let py = 0; py < GRID; py++) {
            const t2 = 2 * Math.PI * (1 - py / (GRID - 1));
            for (let px = 0; px < GRID; px++) {
                const t1 = 2 * Math.PI * (px / (GRID - 1));
                const c = collide(t1, t2);
                const k = (py * GRID + px) * 4;
                if (c >= 0) {
                    const [r, g, b] = hexToRgb(OBSTACLES[c].color);
                    img.data[k] = r;
                    img.data[k + 1] = g;
                    img.data[k + 2] = b;
                    img.data[k + 3] = 175;
                } else {
                    img.data[k + 3] = 0;
                }
            }
        }
        ctx.putImageData(img, 0, 0);
        return cv;
    }, []);

    const hit = collide(th[0], th[1]);
    const {points} = planarFk(th, [L1, L2]);
    const armPx = points.map((p) => globalToMap(panel, panel, p.x, p.y, res));
    const obsPx = OBSTACLES.map((o) => {
        const m = globalToMap(panel, panel, o.x, o.y, res);
        return {...o, px: m.x, py: m.y, pr: o.r / res};
    });

    const thToPx = (t1: number, t2: number) => ({
        x: (t1 / (2 * Math.PI)) * panel,
        y: (1 - t2 / (2 * Math.PI)) * panel,
    });
    const dotPx = thToPx(th[0], th[1]);

    return (
        <div className="flex flex-col gap-2 items-center">
            <div className="flex flex-row flex-wrap gap-3 items-start justify-center">
                {/* 작업 공간 */}
                <div className="flex flex-col items-center gap-0.5">
                    <CoordinateSystem
                        width={panel}
                        height={panel}
                        resolution={res}
                        className="bg-surface border border-border rounded-lg"
                    >
                        {obsPx.map((o) => (
                            <Circle key={o.label} x={o.px} y={o.py} radius={o.pr} fill={o.color}
                                    opacity={0.75}/>
                        ))}
                        {obsPx.map((o) => (
                            <Text key={`l${o.label}`} x={o.px - 5} y={o.py - 7} text={o.label}
                                  fontSize={14} fontStyle="bold" fill="#ffffff"/>
                        ))}
                        {armPx.slice(0, -1).map((p, i) => (
                            <Line key={`a${i}`} points={[p.x, p.y, armPx[i + 1].x, armPx[i + 1].y]}
                                  stroke={hit >= 0 ? OBSTACLES[hit].color : colors.accent}
                                  strokeWidth={5} lineCap="round"/>
                        ))}
                        {armPx.map((p, i) => (
                            <Circle key={`j${i}`} x={p.x} y={p.y} radius={i === 0 ? 6 : 4.5}
                                    fill={colors.surface} stroke={colors.text} strokeWidth={2}/>
                        ))}
                    </CoordinateSystem>
                    <span className="text-xs text-muted">
                        {t("workspace: arm + obstacles A, B, C", "작업 공간: 팔 + 장애물 A, B, C")}
                    </span>
                </div>

                {/* C-space 지도 */}
                <div className="flex flex-col items-center gap-0.5">
                    <Stage width={panel} height={panel}
                           className="bg-surface border border-border rounded-lg overflow-hidden">
                        <Layer imageSmoothingEnabled={false}>
                            <KImage image={mapCanvas} width={panel} height={panel}/>
                            <Circle
                                x={dotPx.x} y={dotPx.y} radius={9}
                                fill={hit >= 0 ? OBSTACLES[hit].color : colors.surface}
                                stroke={colors.text} strokeWidth={2.5} draggable
                                dragBoundFunc={(pos) => ({
                                    x: Math.max(2, Math.min(panel - 2, pos.x)),
                                    y: Math.max(2, Math.min(panel - 2, pos.y)),
                                })}
                                onDragMove={(e) => {
                                    setTh([
                                        (e.target.x() / panel) * 2 * Math.PI,
                                        (1 - e.target.y() / panel) * 2 * Math.PI,
                                    ]);
                                }}
                            />
                            <Text x={6} y={panel - 18} text="θ₁ →" fontSize={11} fill={colors.muted}/>
                            <Text x={6} y={6} text="θ₂ ↑" fontSize={11} fill={colors.muted}/>
                        </Layer>
                    </Stage>
                    <span className="text-xs text-muted">
                        {t("C-space: drag the configuration point", "C-space: configuration 점을 끌어 보라")}
                    </span>
                </div>
            </div>
            <div className="text-xs text-muted text-center tabular-nums">
                θ = ({(th[0] * 180 / Math.PI).toFixed(0)}°, {(th[1] * 180 / Math.PI).toFixed(0)}°) ·{" "}
                {hit >= 0
                    ? <span className="font-semibold" style={{color: OBSTACLES[hit].color}}>
                        {t(`colliding with ${OBSTACLES[hit].label}`, `${OBSTACLES[hit].label} 와 충돌 중`)}
                    </span>
                    : <span className="font-semibold" style={{color: "var(--accent)"}}>
                        {t("collision-free", "충돌 없음")}
                    </span>}
            </div>
        </div>
    );
};

const CSpaceObstacle2R = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "workspace obstacles become C-space obstacles: drag the point and watch Cfree split into islands",
            "작업 공간 장애물이 C-space 장애물이 된다: 점을 끌어 Cfree 가 섬으로 쪼개지는 것을 보라",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<CSpaceScene panel={Math.floor(modalCanvasSize(2.1).width / 2) - 16}/>}
    >
        <CSpaceScene panel={260}/>
    </CanvasFigure>;
};

export default CSpaceObstacle2R;
