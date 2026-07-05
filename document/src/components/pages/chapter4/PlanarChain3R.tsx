import {useMemo, useState} from "react";
import {Circle, Line, Text} from "react-konva";
import CoordinateSystem from "../../2d/CoordinateCanvas";
import CanvasFigure from "../../CanvasFigure";
import {globalToMap} from "../../../libs/konvaUtils";
import {useCanvasColors} from "../../../libs/useTheme";

// 3R 평면 개방연쇄의 정방향 기구학. 슬라이더로 관절각 θ1,θ2,θ3 를 돌리면 링크를 순차 누적해
// end-effector 위치 (x,y) 와 방향 φ 가 실시간 갱신된다.
const LINKS = [2.5, 2, 1.5];
const RESOLUTION = 0.05;

// -0.0001 → "-0" 방지: 반올림 후 0 근처는 0 으로 정규화한다.
const degrees = (rad: number) => {
    const d = Math.round(rad * 180 / Math.PI);
    return d === 0 ? 0 : d;
};

interface SceneProps {
    width: number;
    height: number;
}

const PlanarChainScene = ({width, height}: SceneProps) => {
    const colors = useCanvasColors();
    const [theta, setTheta] = useState<[number, number, number]>([0.6, 0.7, 0.5]);

    const {world, phi} = useMemo(() => {
        let x = 0, y = 0, a = 0;
        const world = [{x, y}];
        for (let i = 0; i < LINKS.length; i++) {
            a += theta[i];
            x += LINKS[i] * Math.cos(a);
            y += LINKS[i] * Math.sin(a);
            world.push({x, y});
        }
        return {world, phi: a};
    }, [theta]);

    const px = world.map((p) => globalToMap(width, height, p.x, p.y, RESOLUTION));
    const ee = world[world.length - 1];

    const setJoint = (i: number, v: number) =>
        setTheta((prev) => {
            const next = [...prev] as [number, number, number];
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
                {px.slice(0, -1).map((p, i) => (
                    <Line
                        key={`link-${i}`}
                        points={[p.x, p.y, px[i + 1].x, px[i + 1].y]}
                        stroke={colors.accent}
                        strokeWidth={4}
                        lineCap="round"
                    />
                ))}
                {px.slice(0, -1).map((p, i) => (
                    <Circle key={`joint-${i}`} x={p.x} y={p.y} radius={5} fill={colors.surface}
                            stroke={colors.text} strokeWidth={2}/>
                ))}
                <Circle x={px[px.length - 1].x} y={px[px.length - 1].y} radius={7} fill={colors.accent}/>
                <Text
                    x={px[px.length - 1].x + 10}
                    y={px[px.length - 1].y - 6}
                    text={`(${ee.x.toFixed(2)}, ${ee.y.toFixed(2)})`}
                    fontSize={13}
                    fontStyle="bold"
                    fill={colors.text}
                />
            </CoordinateSystem>
            <div className="w-full flex flex-col gap-1 text-xs text-muted">
                {[0, 1, 2].map((i) => (
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
                        <span className="w-12 shrink-0 text-right tabular-nums">
                            {degrees(theta[i])}°
                        </span>
                    </label>
                ))}
                <div className="text-center pt-1">
                    x = {ee.x.toFixed(2)} · y = {ee.y.toFixed(2)} · φ = {degrees(phi)}°
                </div>
            </div>
        </div>
    );
};

const PlanarChain3R = () => {
    return <CanvasFigure
        label="3R planar chain · forward kinematics"
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<PlanarChainScene width={460} height={460}/>}
    >
        <PlanarChainScene width={320} height={320}/>
    </CanvasFigure>;
};

export default PlanarChain3R;
