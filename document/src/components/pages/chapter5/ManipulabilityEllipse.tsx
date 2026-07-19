import {useMemo, useState} from "react";
import {Circle, Ellipse, Line, Text} from "react-konva";
import CoordinateSystem from "../../2d/CoordinateCanvas";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
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
    // 큰 모달 캔버스에서는 world 스케일(resolution)도 함께 키운다 (460px 기준 유지).
    const res = RESOLUTION * Math.min(1, 460 / width);
    const colors = useCanvasColors();
    const t = useTr();
    const [theta, setTheta] = useState<[number, number]>([0.5, 1.1]);
    const [showForce, setShowForce] = useState(false);

    const {world, ell} = useMemo(() => {
        const {points} = planarFk(theta, [...LINKS]);
        const [j1, j2] = jacobian2R(theta[0], theta[1], L1, L2);
        return {world: points, ell: manipulabilityEllipse(j1, j2)};
    }, [theta]);

    const px = world.map((p) => globalToMap(width, height, p.x, p.y, res));
    const tipPx = px[px.length - 1];
    // Konva 회전은 시계방향(+y 아래)이므로 수학적 반시계 각도를 부호 반전한다.
    const rotationDeg = (-ell.angle * 180) / Math.PI;
    const scale = 1 / res;
    const ratio = ell.minor > 1e-4 ? ell.major / ell.minor : Infinity;
    // 타원 축 끝 라벨 위치: 긴 축 = 움직이기 쉬운 방향, 짧은 축 = 어려운 방향.
    const axisEnd = (len: number, ang: number) => ({
        x: tipPx.x + len * scale * Math.cos(ang),
        y: tipPx.y - len * scale * Math.sin(ang),
    });
    const majorEnd = axisEnd(ell.major, ell.angle);
    const minorEnd = axisEnd(ell.minor, ell.angle + Math.PI / 2);

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
                {/* 어느 방향이 쉬운지 즉석 라벨: 긴 축 = 빠름, 짧은 축 = 느림 (force 켜면 반대) */}
                {ell.minor > 1e-4 && (
                    <>
                        <Text x={majorEnd.x + 4} y={majorEnd.y - 6}
                              text={showForce ? t("fast · weak push", "빠름 · 밀기 약함") : t("fast", "빠름")}
                              fontSize={11} fontStyle="bold" fill={colors.accent}/>
                        <Text x={minorEnd.x + 4} y={minorEnd.y - 6}
                              text={showForce ? t("slow · strong push", "느림 · 밀기 강함") : t("slow", "느림")}
                              fontSize={11} fontStyle="bold"
                              fill={showForce ? FORCE_COLOR : colors.muted}/>
                    </>
                )}
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
                        {t("fast ÷ slow", "빠른 방향 ÷ 느린 방향")} ={" "}
                        {ratio === Infinity
                            ? `∞ (${t("singular!", "특이점!")})`
                            : ratio.toFixed(2)}
                    </span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" checked={showForce}
                               onChange={(e) => setShowForce(e.target.checked)}
                               className="accent-[var(--accent)]"/>
                        <span style={{color: FORCE_COLOR}}>
                            {t("force ellipse (easy-to-push directions)", "force 타원 (밀기 좋은 방향)")}
                        </span>
                    </label>
                </div>
            </div>
        </div>
    );
};

const ManipulabilityEllipse = () => {
    const t = useTr()
    return <CanvasFigure
        label={t(
            "manipulability ellipse · in which directions can the tip move fast? long axis = easy, short axis = hard",
            "manipulability 타원 · 팁이 어느 방향으로 빨리 움직일 수 있나? 긴 축 = 쉽다, 짧은 축 = 어렵다",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<ManipulabilityScene {...modalCanvasSize()}/>}
    >
        <ManipulabilityScene width={320} height={320}/>
    </CanvasFigure>;
};

export default ManipulabilityEllipse;
