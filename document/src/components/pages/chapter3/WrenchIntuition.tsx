import {useState} from "react";
import {Arrow, Circle, Line, Text} from "react-konva";
import CoordinateSystem from "../../2d/CoordinateCanvas";
import CanvasFigure from "../../CanvasFigure";
import {useTr} from "../../../libs/i18n";
import {globalToMap, mapToGlobal} from "../../../libs/konvaUtils";
import {Vec2} from "../../../libs/planarArm";
import {useCanvasColors} from "../../../libs/useTheme";

// wrench 의 최소 직관: 볼트(원점)에서 떨어진 점 r 에 힘 f 를 걸면 볼트는 힘만이 아니라
// 비틀림 m = r×f 도 느낀다. 작용점을 작용선(점선)을 따라 끌면 m 이 변하지 않고,
// 작용선을 벗어나면 변한다 — |m| = |f|·d (d = 원점에서 작용선까지 수직 거리)가 눈에 보인다.
const RESOLUTION = 0.05;
const FORCE_COLOR = "#e0533d";
const MOMENT_COLOR = "#f2a63a";
const F_MAG = 1.6;

interface SceneProps {
    width: number;
    height: number;
}

const WrenchIntuitionScene = ({width, height}: SceneProps) => {
    const colors = useCanvasColors();
    const t = useTr();
    const [r, setR] = useState<Vec2>({x: 2.6, y: 0.9});
    const [phi, setPhi] = useState(1.9);

    const f: Vec2 = {x: F_MAG * Math.cos(phi), y: F_MAG * Math.sin(phi)};
    const m = r.x * f.y - r.y * f.x;               // 평면 모멘트 (z 성분)
    const d = Math.abs(m) / F_MAG;                 // 원점 ↔ 작용선 수직 거리

    const toPx = (p: Vec2) => globalToMap(width, height, p.x, p.y, RESOLUTION);
    const origin = toPx({x: 0, y: 0});
    const rPx = toPx(r);
    // 작용선: r 를 지나고 방향 f̂ 인 직선 (양쪽으로 길게)
    const lineA = toPx({x: r.x - 6 * Math.cos(phi), y: r.y - 6 * Math.sin(phi)});
    const lineB = toPx({x: r.x + 6 * Math.cos(phi), y: r.y + 6 * Math.sin(phi)});
    // 원점에서 작용선에 내린 수선의 발
    const s = (0 - r.x) * Math.cos(phi) + (0 - r.y) * Math.sin(phi);
    const foot = toPx({x: r.x + s * Math.cos(phi), y: r.y + s * Math.sin(phi)});
    const fEnd = toPx({x: r.x + f.x, y: r.y + f.y});

    // 모멘트 호 화살표: m > 0 이면 반시계(화면 기준), m < 0 이면 시계 방향으로 쓸고 지나간다.
    // 호 반지름은 |m| 에 따라 커져 크기도 어림해 보인다.
    const arcR = 22 + Math.min(26, Math.abs(m) * 7);
    const arc = Array.from({length: 9}, (_, i) => {
        const s01 = i / 8;
        const a = m >= 0 ? 2.5 - s01 * 1.9 : 0.6 + s01 * 1.9;
        return [origin.x + arcR * Math.cos(a), origin.y + arcR * Math.sin(a)];
    }).flat();

    return (
        <div className="flex flex-col gap-2 items-center" style={{width}}>
            <CoordinateSystem
                width={width}
                height={height}
                resolution={RESOLUTION}
                className="bg-surface border border-border rounded-lg"
            >
                {/* 작용선과, 원점에서 내린 수직 거리 d */}
                <Line points={[lineA.x, lineA.y, lineB.x, lineB.y]} stroke={colors.muted}
                      strokeWidth={1.5} dash={[7, 6]}/>
                <Line points={[origin.x, origin.y, foot.x, foot.y]} stroke={MOMENT_COLOR}
                      strokeWidth={1.5} dash={[3, 4]}/>
                <Text x={(origin.x + foot.x) / 2 + 6} y={(origin.y + foot.y) / 2}
                      text={`d = ${d.toFixed(2)}`} fontSize={12} fill={MOMENT_COLOR}/>
                {/* 볼트(원점)와 모멘트 호 */}
                <Circle x={origin.x} y={origin.y} radius={9} fill={colors.surface}
                        stroke={colors.text} strokeWidth={2.5}/>
                {Math.abs(m) > 0.05 && (
                    <Arrow points={arc} stroke={MOMENT_COLOR} fill={MOMENT_COLOR}
                           strokeWidth={2.5} pointerLength={7} pointerWidth={7} tension={0.5}/>
                )}
                {/* 힘 f 와 작용점 r (드래그) */}
                <Arrow points={[rPx.x, rPx.y, fEnd.x, fEnd.y]} stroke={FORCE_COLOR} fill={FORCE_COLOR}
                       strokeWidth={3} pointerLength={8} pointerWidth={8}/>
                <Circle
                    x={rPx.x}
                    y={rPx.y}
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
                        setR(mapToGlobal(width, height, e.target.x(), e.target.y(), RESOLUTION));
                    }}
                />
                <Text x={rPx.x + 10} y={rPx.y - 6} text="r" fontSize={14} fontStyle="bold"
                      fill={colors.accent} listening={false}/>
                <Text x={fEnd.x + 6} y={fEnd.y - 6} text="f" fontSize={14} fontStyle="bold"
                      fill={FORCE_COLOR} listening={false}/>
            </CoordinateSystem>

            <div className="w-full flex flex-col gap-1 text-xs text-muted">
                <label className="flex items-center gap-2">
                    <span className="w-14 shrink-0">{t("f direction", "f 방향")}</span>
                    <input type="range" min={-Math.PI} max={Math.PI} step={0.02} value={phi}
                           onChange={(e) => setPhi(parseFloat(e.target.value))}
                           className="w-full accent-[var(--accent)]"
                           aria-label={t("force direction", "힘의 방향")}/>
                    <span className="w-12 shrink-0 text-right tabular-nums">
                        {Math.round(phi * 180 / Math.PI)}°
                    </span>
                </label>
                <div className="text-center tabular-nums">
                    m = r × f = <span style={{color: MOMENT_COLOR}} className="font-semibold">{m.toFixed(2)}</span>
                    {" "}= ±|f|·d · ℱ = (m, f) = ({m.toFixed(2)}, {f.x.toFixed(2)}, {f.y.toFixed(2)})
                </div>
                <div className="text-center">
                    {t("drag r along the dashed line — m stays put; off the line — m changes",
                        "r 를 점선(작용선)을 따라 끌면 m 은 그대로, 선을 벗어나면 m 이 변한다")}
                </div>
            </div>
        </div>
    );
};

const WrenchIntuition = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "a force off the origin twists as well as pushes · m = r × f, |m| = |f|·d",
            "원점을 벗어난 힘은 밀기만 하지 않고 비튼다 · m = r × f, |m| = |f|·d",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<WrenchIntuitionScene width={460} height={460}/>}
    >
        <WrenchIntuitionScene width={320} height={320}/>
    </CanvasFigure>;
};

export default WrenchIntuition;
