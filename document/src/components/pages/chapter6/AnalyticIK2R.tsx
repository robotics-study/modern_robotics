import {useMemo, useState} from "react";
import {Circle, Line, Ring, Text} from "react-konva";
import type Konva from "konva";
import CoordinateSystem from "../../2d/CoordinateCanvas";
import CanvasFigure from "../../CanvasFigure";
import {globalToMap, mapToGlobal} from "../../../libs/konvaUtils";
import {ik2R, IkSolution, planarFk} from "../../../libs/planarArm";
import {useCanvasColors} from "../../../libs/useTheme";

// 2R 위치 역기구학: 목표점(주황)을 드래그하면 그 점에 도달하는 두 해(righty·lefty)를 실시간으로 그린다.
// 작업공간(annulus) 밖으로 끌면 해가 없어지고 목표점이 회색으로 바뀐다.
const L1 = 2.2, L2 = 1.3;
const RESOLUTION = 0.05;
const LEFTY_COLOR = "#f2a63a";

interface SceneProps {
    width: number;
    height: number;
}

const IkScene = ({width, height}: SceneProps) => {
    const colors = useCanvasColors();
    const [target, setTarget] = useState({x: 2.0, y: 1.4});

    const sol = useMemo(() => ik2R(target.x, target.y, L1, L2), [target]);

    // 한 해(관절각)를 맵 좌표 링크 폴리라인으로 변환한다.
    const armPoints = (s: IkSolution) => {
        const {points} = planarFk([s.theta1, s.theta2], [L1, L2]);
        return points.flatMap((p) => {
            const m = globalToMap(width, height, p.x, p.y, RESOLUTION);
            return [m.x, m.y];
        });
    };

    const tPx = globalToMap(width, height, target.x, target.y, RESOLUTION);
    const center = globalToMap(width, height, 0, 0, RESOLUTION);
    const scale = 1 / RESOLUTION;

    const onDrag = (e: Konva.KonvaEventObject<DragEvent>) => {
        const g = mapToGlobal(width, height, e.target.x(), e.target.y(), RESOLUTION);
        setTarget({x: g.x, y: g.y});
    };

    return (
        <div className="flex flex-col gap-2 items-center" style={{width}}>
            <CoordinateSystem
                width={width}
                height={height}
                resolution={RESOLUTION}
                className="bg-surface border border-border rounded-lg"
            >
                {/* 작업공간 annulus: 안쪽 |L1−L2|, 바깥 L1+L2 */}
                <Ring x={center.x} y={center.y} innerRadius={Math.abs(L1 - L2) * scale}
                      outerRadius={(L1 + L2) * scale} fill={colors.accent} opacity={0.08}/>
                <Circle x={center.x} y={center.y} radius={(L1 + L2) * scale} stroke={colors.border} strokeWidth={1}/>
                <Circle x={center.x} y={center.y} radius={Math.abs(L1 - L2) * scale} stroke={colors.border}
                        strokeWidth={1}/>

                {sol.reachable && sol.lefty && (
                    <Line points={armPoints(sol.lefty)} stroke={LEFTY_COLOR} strokeWidth={4} lineCap="round"
                          dash={[8, 5]} opacity={0.9}/>
                )}
                {sol.reachable && sol.righty && (
                    <Line points={armPoints(sol.righty)} stroke={colors.accent} strokeWidth={4} lineCap="round"/>
                )}
                <Circle x={center.x} y={center.y} radius={5} fill={colors.surface} stroke={colors.text}
                        strokeWidth={2}/>

                {/* 드래그 가능한 목표점 */}
                <Circle
                    x={tPx.x}
                    y={tPx.y}
                    radius={8}
                    draggable
                    fill={sol.reachable ? "#e0533d" : colors.muted}
                    stroke={colors.surface}
                    strokeWidth={2}
                    onDragMove={onDrag}
                />
                <Text x={tPx.x + 12} y={tPx.y - 6} text={`(${target.x.toFixed(2)}, ${target.y.toFixed(2)})`}
                      fontSize={12} fill={colors.muted}/>
            </CoordinateSystem>
            <div className="w-full text-xs text-muted text-center">
                {sol.reachable && sol.righty && sol.lefty ? (
                    <span>
                        <span className="text-[var(--accent)] font-semibold">righty</span>{" "}
                        θ = ({(sol.righty.theta1 * 180 / Math.PI).toFixed(0)}°,{" "}
                        {(sol.righty.theta2 * 180 / Math.PI).toFixed(0)}°) ·{" "}
                        <span style={{color: LEFTY_COLOR}} className="font-semibold">lefty</span>{" "}
                        θ = ({(sol.lefty.theta1 * 180 / Math.PI).toFixed(0)}°,{" "}
                        {(sol.lefty.theta2 * 180 / Math.PI).toFixed(0)}°)
                    </span>
                ) : (
                    <span>outside the workspace — no solution. Drag the target back into the annulus.</span>
                )}
            </div>
        </div>
    );
};

const AnalyticIK2R = () => {
    return <CanvasFigure
        label="analytic IK · drag the target for lefty / righty solutions"
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<IkScene width={460} height={460}/>}
    >
        <IkScene width={320} height={320}/>
    </CanvasFigure>;
};

export default AnalyticIK2R;
