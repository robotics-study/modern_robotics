import {useMemo, useState} from "react";
import {Arrow, Circle, Line, Text} from "react-konva";
import CoordinateSystem from "../../2d/CoordinateCanvas";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {globalToMap} from "../../../libs/konvaUtils";
import {det2R, jacobian2R, planarFk, Vec2} from "../../../libs/planarArm";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";

// 2R 팔의 Jacobian 열 시각화. 슬라이더로 관절각을 돌리면 tip 에서 두 화살표가 뻗는다:
// J1(관절1만 θ̇=1), J2(관절2만 θ̇=1). 두 화살표가 나란해지는 θ2=0,π 에서 det J=0 — 특이점이다.
const LINKS = [2.5, 2] as const;
const L1 = LINKS[0], L2 = LINKS[1];
const RESOLUTION = 0.05;

// 열 벡터 색: 관절1 = indigo(accent), 관절2 = orange. 두 색 모두 라이트/다크에서 잘 읽힌다.
const J2_COLOR = "#f2a63a";

const degrees = (rad: number) => {
    const d = Math.round((rad * 180) / Math.PI);
    return d === 0 ? 0 : d;
};

interface SceneProps {
    width: number;
    height: number;
}

const JacobianScene = ({width, height}: SceneProps) => {
    // 큰 모달 캔버스에서는 world 스케일(resolution)도 함께 키운다 (460px 기준 유지).
    const res = RESOLUTION * Math.min(1, 460 / width);
    const colors = useCanvasColors();
    const [theta, setTheta] = useState<[number, number]>([0.6, 0.9]);

    const {world, cols, det} = useMemo(() => {
        const {points} = planarFk(theta, [...LINKS]);
        const cols = jacobian2R(theta[0], theta[1], L1, L2);
        return {world: points, cols, det: det2R(theta[1], L1, L2)};
    }, [theta]);

    const px = world.map((p) => globalToMap(width, height, p.x, p.y, res));
    const tip = world[world.length - 1];
    const tipPx = px[px.length - 1];

    // 열 벡터(단위: length/rad)를 tip 에서 맵 좌표로 그린다. y 는 화면 아래가 +라 부호 반전.
    const arrowEnd = (v: Vec2) => ({x: tipPx.x + v.x / res, y: tipPx.y - v.y / res});
    const e1 = arrowEnd(cols[0]);
    const e2 = arrowEnd(cols[1]);
    const singular = Math.abs(det) < 0.15;

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
                resolution={res}
                className="bg-surface border border-border rounded-lg"
            >
                {px.slice(0, -1).map((p, i) => (
                    <Line
                        key={`link-${i}`}
                        points={[p.x, p.y, px[i + 1].x, px[i + 1].y]}
                        stroke={colors.text}
                        strokeWidth={4}
                        lineCap="round"
                        opacity={0.75}
                    />
                ))}
                {px.slice(0, -1).map((p, i) => (
                    <Circle key={`joint-${i}`} x={p.x} y={p.y} radius={5} fill={colors.surface}
                            stroke={colors.text} strokeWidth={2}/>
                ))}
                <Arrow points={[tipPx.x, tipPx.y, e1.x, e1.y]} stroke={colors.accent} fill={colors.accent}
                       strokeWidth={3} pointerLength={9} pointerWidth={9}/>
                <Arrow points={[tipPx.x, tipPx.y, e2.x, e2.y]} stroke={J2_COLOR} fill={J2_COLOR}
                       strokeWidth={3} pointerLength={9} pointerWidth={9}/>
                <Text x={e1.x + 6} y={e1.y - 6} text="J₁" fontSize={14} fontStyle="bold" fill={colors.accent}/>
                <Text x={e2.x + 6} y={e2.y - 6} text="J₂" fontSize={14} fontStyle="bold" fill={J2_COLOR}/>
                <Circle x={tipPx.x} y={tipPx.y} radius={6} fill={colors.text}/>
                <Text x={tipPx.x + 10} y={tipPx.y + 6} text={`(${tip.x.toFixed(2)}, ${tip.y.toFixed(2)})`}
                      fontSize={12} fill={colors.muted}/>
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
                <div className="text-center pt-1">
                    det&nbsp;J = {det.toFixed(2)}{" "}
                    {singular
                        ? <span className="text-[var(--accent)] font-semibold">· singular: J₁ ∥ J₂</span>
                        : <span>· full rank</span>}
                </div>
            </div>
        </div>
    );
};

const JacobianColumns = () => {
    const t = useTr()
    return <CanvasFigure
        label={t("Jacobian columns · tip velocity of each joint", "Jacobian 열 · 각 관절의 팁 속도")}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<JacobianScene {...modalCanvasSize()}/>}
    >
        <JacobianScene width={320} height={320}/>
    </CanvasFigure>;
};

export default JacobianColumns;
