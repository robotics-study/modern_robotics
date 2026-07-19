import {useMemo, useState} from "react";
import {Circle, Layer, Line, Rect, Stage, Text} from "react-konva";
import CoordinateSystem from "../../2d/CoordinateCanvas";
import CanvasFigure from "../../CanvasFigure";
import {useTr} from "../../../libs/i18n";
import {globalToMap} from "../../../libs/konvaUtils";
import {planarFk} from "../../../libs/planarArm";
import {useCanvasColors} from "../../../libs/useTheme";

// C-space 미리보기: 2R 팔은 각도 두 개면 로봇의 "모든 점" 위치가 정해진다(= configuration).
// 오른쪽 사각형은 (θ1, θ2) 전체 집합 — 각 축이 원(±180° 는 같은 각)이므로 마주보는 변이
// 이어붙는 torus 라는 것까지만 맛보기로 보여준다. 위상·표현의 본론은 Ch.2 에서 다룬다.
const LINKS = [2.5, 2];
const RESOLUTION = 0.05;

const degrees = (rad: number) => {
    const d = Math.round(rad * 180 / Math.PI);
    return d === 0 ? 0 : d;
};

// C-space 패널: [-π,π]² 사각형. FourBarLinkage 의 미니플롯과 같은 고정 크기 규약.
const CS_W = 320, CS_H = 190, CS_PAD = 30;
const csX = (t1: number) => CS_PAD + ((t1 + Math.PI) / (2 * Math.PI)) * (CS_W - 2 * CS_PAD);
const csY = (t2: number) => CS_PAD + (1 - (t2 + Math.PI) / (2 * Math.PI)) * (CS_H - 2 * CS_PAD);

interface SceneProps {
    width: number;
    height: number;
}

const CSpaceScene = ({width, height}: SceneProps) => {
    const colors = useCanvasColors();
    const [theta, setTheta] = useState<[number, number]>([0.9, 1.1]);

    const world = useMemo(() => planarFk(theta, LINKS).points, [theta]);
    const px = world.map((p) => globalToMap(width, height, p.x, p.y, RESOLUTION));

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
                {px.slice(0, -1).map((p, i) => (
                    <Line key={`link-${i}`} points={[p.x, p.y, px[i + 1].x, px[i + 1].y]}
                          stroke={colors.accent} strokeWidth={4} lineCap="round"/>
                ))}
                {px.slice(0, -1).map((p, i) => (
                    <Circle key={`joint-${i}`} x={p.x} y={p.y} radius={5} fill={colors.surface}
                            stroke={colors.text} strokeWidth={2}/>
                ))}
                <Circle x={px[px.length - 1].x} y={px[px.length - 1].y} radius={7} fill={colors.accent}/>
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
                        <span className="w-12 shrink-0 text-right tabular-nums">
                            {degrees(theta[i])}°
                        </span>
                    </label>
                ))}
            </div>

            {/* C-space 패널: 점 하나 = 로봇 자세 하나. 점선 변은 반대편과 이어붙음(wrap). */}
            <Stage width={CS_W} height={CS_H} className="bg-surface border border-border rounded-lg overflow-hidden">
                <Layer>
                    <Rect x={CS_PAD} y={CS_PAD} width={CS_W - 2 * CS_PAD} height={CS_H - 2 * CS_PAD}
                          stroke={colors.border} strokeWidth={1.5} dash={[5, 4]}/>
                    <Text x={CS_PAD - 22} y={CS_H - CS_PAD + 6} text="−180°" fontSize={10} fill={colors.muted}/>
                    <Text x={CS_W - CS_PAD - 14} y={CS_H - CS_PAD + 6} text="180°" fontSize={10} fill={colors.muted}/>
                    <Text x={CS_W / 2 - 6} y={CS_H - CS_PAD + 6} text="θ1" fontSize={11}
                          fontStyle="bold" fill={colors.text}/>
                    <Text x={4} y={CS_PAD - 4} text="180°" fontSize={10} fill={colors.muted}/>
                    <Text x={2} y={CS_H - CS_PAD - 8} text="−180°" fontSize={10} fill={colors.muted}/>
                    <Text x={8} y={CS_H / 2 - 6} text="θ2" fontSize={11} fontStyle="bold" fill={colors.text}/>
                    <Circle x={csX(theta[0])} y={csY(theta[1])} radius={5.5} fill={colors.accent}/>
                    <Text x={CS_PAD} y={6} width={CS_W - 2 * CS_PAD} align="center"
                          text="C-space · dashed edges wrap around (a torus)" fontSize={11} fill={colors.muted}/>
                </Layer>
            </Stage>
        </div>
    );
};

const CSpacePreview2R = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "2R arm · two numbers (θ1, θ2) specify the whole configuration; the square of all (θ1, θ2) is the C-space",
            "2R 팔 · 두 수 (θ1, θ2)가 configuration 전체를 지정한다; 모든 (θ1, θ2)의 정사각형이 곧 C-space다",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<CSpaceScene width={460} height={460}/>}
    >
        <CSpaceScene width={320} height={320}/>
    </CanvasFigure>;
};

export default CSpacePreview2R;
