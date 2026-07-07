import {useMemo, useState} from "react";
import {Circle, Ellipse, Line} from "react-konva";
import CoordinateSystem from "../../2d/CoordinateCanvas";
import CanvasFigure from "../../CanvasFigure";
import {globalToMap} from "../../../libs/konvaUtils";
import {jacobian2R, manipulabilityEllipse, planarFk} from "../../../libs/planarArm";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";

// 조작성 타원: tip 이 각 방향으로 얼마나 쉽게 움직일 수 있는지를 나타내는 타원.
// 단위 관절속도 원을 Jacobian 으로 사상한 결과다. 특이점(θ2→0,π)에서 선분으로 붕괴한다.
// force 타원(주축이 조작성 타원의 역수)을 겹쳐 velocity↔force 의 상보성을 보인다.
const LINKS = [2.5, 2] as const;
const L1 = LINKS[0], L2 = LINKS[1];
const RESOLUTION = 0.05;
const FORCE_COLOR = "#f2a63a";

const degrees = (rad: number) => {
    const d = Math.round((rad * 180) / Math.PI);
    return d === 0 ? 0 : d;
};

interface SceneProps {
    width: number;
    height: number;
}

const ManipulabilityScene = ({width, height}: SceneProps) => {
    const colors = useCanvasColors();
    const t = useTr();
    const [theta, setTheta] = useState<[number, number]>([0.5, 1.1]);
    const [showForce, setShowForce] = useState(false);

    const {world, ell} = useMemo(() => {
        const {points} = planarFk(theta, [...LINKS]);
        const [j1, j2] = jacobian2R(theta[0], theta[1], L1, L2);
        return {world: points, ell: manipulabilityEllipse(j1, j2)};
    }, [theta]);

    const px = world.map((p) => globalToMap(width, height, p.x, p.y, RESOLUTION));
    const tipPx = px[px.length - 1];
    // Konva 회전은 시계방향(+y 아래)이므로 수학적 반시계 각도를 부호 반전한다.
    const rotationDeg = (-ell.angle * 180) / Math.PI;
    const scale = 1 / RESOLUTION;
    const ratio = ell.minor > 1e-4 ? ell.major / ell.minor : Infinity;

    const setJoint = (i: number, v: number) =>
        setTheta((prev) => {
            const next = [...prev] as [number, number];
            next[i] = v;
            return next;
        });

    return (
        <div className="flex flex-col gap-2 items-center" style={{width}}>
            <CoordinateSystem
                width={width}
                height={height}
                resolution={RESOLUTION}
                className="bg-surface border border-border rounded-lg"
            >
                {/* force 타원: 주축 반지름이 조작성 타원의 역수 — 잘 움직이는 방향이 힘내기 어려운 방향. */}
                {showForce && ell.minor > 1e-4 && (
                    <Ellipse
                        x={tipPx.x}
                        y={tipPx.y}
                        radiusX={(1 / ell.major) * scale}
                        radiusY={(1 / ell.minor) * scale}
                        rotation={rotationDeg}
                        stroke={FORCE_COLOR}
                        strokeWidth={2}
                        dash={[6, 4]}
                    />
                )}
                <Ellipse
                    x={tipPx.x}
                    y={tipPx.y}
                    radiusX={Math.max(ell.major * scale, 1)}
                    radiusY={Math.max(ell.minor * scale, 1)}
                    rotation={rotationDeg}
                    fill={colors.accent}
                    opacity={0.28}
                    stroke={colors.accent}
                    strokeWidth={2}
                />
                {px.slice(0, -1).map((p, i) => (
                    <Line key={`link-${i}`} points={[p.x, p.y, px[i + 1].x, px[i + 1].y]}
                          stroke={colors.text} strokeWidth={4} lineCap="round" opacity={0.75}/>
                ))}
                {px.slice(0, -1).map((p, i) => (
                    <Circle key={`joint-${i}`} x={p.x} y={p.y} radius={5} fill={colors.surface}
                            stroke={colors.text} strokeWidth={2}/>
                ))}
                <Circle x={tipPx.x} y={tipPx.y} radius={5} fill={colors.text}/>
            </CoordinateSystem>
            <div className="w-full flex flex-col gap-1 text-xs text-muted">
                {[0, 1].map((i) => (
                    <label key={i} className="flex items-center gap-2">
                        <span className="w-8 shrink-0">θ{i + 1}</span>
                        <input
                            type="range"
                            min={-Math.PI}
                            max={Math.PI}
                            step={0.01}
                            value={theta[i]}
                            onChange={(e) => setJoint(i, parseFloat(e.target.value))}
                            className="w-full accent-[var(--accent)]"
                            aria-label={`joint angle theta ${i + 1}`}
                        />
                        <span className="w-12 shrink-0 text-right tabular-nums">{degrees(theta[i])}°</span>
                    </label>
                ))}
                <div className="flex items-center justify-between pt-1">
                    <span>
                        ℓ_max/ℓ_min = {ratio === Infinity ? "∞ (singular)" : ratio.toFixed(2)}
                    </span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={showForce}
                               onChange={(e) => setShowForce(e.target.checked)}
                               className="accent-[var(--accent)]"/>
                        <span style={{color: FORCE_COLOR}}>{t("force ellipse", "힘 타원")}</span>
                    </label>
                </div>
            </div>
        </div>
    );
};

const ManipulabilityEllipse = () => {
    const t = useTr()
    return <CanvasFigure
        label={t("manipulability ellipse · isotropy of the 2R tip", "Manipulability 타원 · 2R 팁의 등방성")}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<ManipulabilityScene width={460} height={460}/>}
    >
        <ManipulabilityScene width={320} height={320}/>
    </CanvasFigure>;
};

export default ManipulabilityEllipse;
