import {useMemo, useState} from "react";
import {Circle, Line, Text} from "react-konva";
import CoordinateSystem from "../../2d/CoordinateCanvas";
import CanvasFigure from "../../CanvasFigure";
import {globalToMap} from "../../../libs/konvaUtils";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";

// 3-RPR 평면 병렬기구: 고정 삼각형 aᵢ 와 가동 플랫폼 삼각형 bᵢ 를 3개의 다리로 잇는다.
// 각 다리는 P(수동)–R(수동)–P(능동, 길이 sᵢ)로, 프리즘 관절 sᵢ 만 구동한다.
// 포즈 (pₓ,p_y,φ) 를 주면 Bᵢ = p + R(φ)bᵢ 로 다리 길이 sᵢ = ‖Bᵢ−aᵢ‖ 가 곧바로 나온다 —
// 역기구학은 단순 대입. (반대로 sᵢ 로부터 포즈를 푸는 정기구학은 6차 다항식이 된다.)
const RESOLUTION = 0.03;

// 고정 베이스 관절 aᵢ ({s} 좌표).
const A_BASE = [
    {x: -2, y: -1.5},
    {x: 2, y: -1.5},
    {x: 0, y: 2.2},
];

// 플랫폼 본체 관절 bᵢ ({b} 좌표) — 작은 삼각형.
const B_BODY = [
    {x: -0.7, y: -0.5},
    {x: 0.7, y: -0.5},
    {x: 0, y: 0.8},
];

const PLATFORM_COLOR = "#f2a63a";

interface SceneProps {
    width: number;
    height: number;
}

const RPRScene = ({width, height}: SceneProps) => {
    const colors = useCanvasColors();
    const t = useTr();
    const [pose, setPose] = useState({px: 0, py: 0, phi: 0});

    const {legs, worldB} = useMemo(() => {
        const c = Math.cos(pose.phi), s = Math.sin(pose.phi);
        // Bᵢ = p + R(φ) bᵢ, 다리 길이 sᵢ = ‖Bᵢ − aᵢ‖.
        const worldB = B_BODY.map((b) => ({
            x: pose.px + c * b.x - s * b.y,
            y: pose.py + s * b.x + c * b.y,
        }));
        const legs = worldB.map((B, i) => Math.hypot(B.x - A_BASE[i].x, B.y - A_BASE[i].y));
        return {legs, worldB};
    }, [pose]);

    const toPx = (p: {x: number; y: number}) => globalToMap(width, height, p.x, p.y, RESOLUTION);
    const aPx = A_BASE.map(toPx);
    const bPx = worldB.map(toPx);
    const platformPts = bPx.flatMap((p) => [p.x, p.y]);
    const centerPx = toPx({x: pose.px, y: pose.py});

    const setField = (k: "px" | "py" | "phi", v: number) =>
        setPose((prev) => ({...prev, [k]: v}));

    return (
        <div className="flex flex-col gap-2 items-center" style={{width}}>
            <CoordinateSystem
                width={width}
                height={height}
                resolution={RESOLUTION}
                className="bg-surface border border-border rounded-lg"
            >
                {/* 세 다리 aᵢ→Bᵢ (능동 프리즘 관절) */}
                {aPx.map((a, i) => (
                    <Line key={`leg-${i}`} points={[a.x, a.y, bPx[i].x, bPx[i].y]}
                          stroke={colors.text} strokeWidth={5} lineCap="round" opacity={0.55}/>
                ))}
                {/* 가동 플랫폼 삼각형: 반투명 채움 + 뚜렷한 외곽선 */}
                <Line points={platformPts} closed fill={PLATFORM_COLOR} opacity={0.18} listening={false}/>
                <Line points={platformPts} closed stroke={PLATFORM_COLOR} strokeWidth={3}/>
                {/* 고정 베이스 관절 */}
                {aPx.map((a, i) => (
                    <Circle key={`a-${i}`} x={a.x} y={a.y} radius={7} fill={colors.text}/>
                ))}
                {aPx.map((a, i) => (
                    <Text key={`al-${i}`} x={a.x + 9} y={a.y - 6} text={`a${i + 1}`} fontSize={12}
                          fill={colors.muted}/>
                ))}
                {/* 플랫폼 관절 Bᵢ */}
                {bPx.map((b, i) => (
                    <Circle key={`b-${i}`} x={b.x} y={b.y} radius={5} fill={colors.surface}
                            stroke={PLATFORM_COLOR} strokeWidth={2}/>
                ))}
                <Circle x={centerPx.x} y={centerPx.y} radius={3} fill={PLATFORM_COLOR}/>
            </CoordinateSystem>

            <div className="w-full flex flex-col gap-1 text-xs text-muted">
                <label className="flex items-center gap-2">
                    <span className="w-8 shrink-0">pₓ</span>
                    <input type="range" min={-1.6} max={1.6} step={0.01} value={pose.px}
                           onChange={(e) => setField("px", parseFloat(e.target.value))}
                           className="w-full accent-[var(--accent)]" aria-label={t("platform x position", "플랫폼 x 위치")}/>
                    <span className="w-12 shrink-0 text-right tabular-nums">{pose.px.toFixed(2)}</span>
                </label>
                <label className="flex items-center gap-2">
                    <span className="w-8 shrink-0">p_y</span>
                    <input type="range" min={-1.2} max={1.4} step={0.01} value={pose.py}
                           onChange={(e) => setField("py", parseFloat(e.target.value))}
                           className="w-full accent-[var(--accent)]" aria-label={t("platform y position", "플랫폼 y 위치")}/>
                    <span className="w-12 shrink-0 text-right tabular-nums">{pose.py.toFixed(2)}</span>
                </label>
                <label className="flex items-center gap-2">
                    <span className="w-8 shrink-0">φ</span>
                    <input type="range" min={-Math.PI / 2} max={Math.PI / 2} step={0.01} value={pose.phi}
                           onChange={(e) => setField("phi", parseFloat(e.target.value))}
                           className="w-full accent-[var(--accent)]" aria-label={t("platform orientation phi", "플랫폼 방향 phi")}/>
                    <span className="w-12 shrink-0 text-right tabular-nums">
                        {Math.round((pose.phi * 180) / Math.PI)}°
                    </span>
                </label>
                <div className="text-center pt-1">
                    inverse kinematics:{" "}
                    <span className="font-semibold" style={{color: PLATFORM_COLOR}}>
                        s₁={legs[0].toFixed(2)} · s₂={legs[1].toFixed(2)} · s₃={legs[2].toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    );
};

const RPRParallel = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "3-RPR parallel mechanism · leg lengths follow directly from the platform pose",
            "3-RPR Parallel Mechanism · 다리 길이는 플랫폼 자세에서 곧바로 나온다"
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<RPRScene width={460} height={460}/>}
    >
        <RPRScene width={320} height={320}/>
    </CanvasFigure>;
};

export default RPRParallel;
