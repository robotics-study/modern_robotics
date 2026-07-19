import {useMemo, useState} from "react";
import {Circle, Line, Ring, Text} from "react-konva";
import type Konva from "konva";
import CoordinateSystem from "../../2d/CoordinateCanvas";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {globalToMap, mapToGlobal} from "../../../libs/konvaUtils";
import {ik2R, IkSolution, planarFk} from "../../../libs/planarArm";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";

// 2R 위치 역기구학: 목표점(주황)을 드래그하면 그 점에 도달하는 두 해(righty·lefty)를 실시간으로 그린다.
// 작업공간(annulus) 밖으로 끌면 해가 없어지고 목표점이 회색으로 바뀐다.
const L1 = 2.2, L2 = 1.3;
const RESOLUTION = 0.033;
const LEFTY_COLOR = "#f2a63a";

interface SceneProps {
    width: number;
    height: number;
}

const IkScene = ({width, height}: SceneProps) => {
    // 큰 모달 캔버스에서는 world 스케일(resolution)도 함께 키운다 (460px 기준 유지).
    const res = RESOLUTION * Math.min(1, 460 / width);
    const colors = useCanvasColors();
    const t = useTr();
    const [target, setTarget] = useState({x: 2.0, y: 1.4});

    const sol = useMemo(() => ik2R(target.x, target.y, L1, L2), [target]);

    // 한 해(관절각)를 맵 좌표 링크 폴리라인으로 변환한다.
    const armPoints = (s: IkSolution) => {
        const {points} = planarFk([s.theta1, s.theta2], [L1, L2]);
        return points.flatMap((p) => {
            const m = globalToMap(width, height, p.x, p.y, res);
            return [m.x, m.y];
        });
    };

    const tPx = globalToMap(width, height, target.x, target.y, res);
    const center = globalToMap(width, height, 0, 0, res);
    const scale = 1 / res;

    // 각 호를 월드 좌표로 샘플해 폴리라인으로 그린다 (화면 y 반전에 따른 방향 혼동 방지).
    const arcPts = (cx: number, cy: number, radius: number, a0: number, a1: number) => {
        const pts: number[] = [];
        for (let i = 0; i <= 16; i++) {
            const a = a0 + (i / 16) * (a1 - a0);
            const m = globalToMap(width, height, cx + radius * Math.cos(a), cy + radius * Math.sin(a), res);
            pts.push(m.x, m.y);
        }
        return pts;
    };
    const labelAt = (cx: number, cy: number, radius: number, a: number) =>
        globalToMap(width, height, cx + radius * Math.cos(a), cy + radius * Math.sin(a), res);

    // 공식에 등장하는 세 각: γ = 목표 방위각, α = 목표 방향과 링크 1 사이, β = 팔꿈치 내부각.
    // 호는 항상 두 방향 사이의 짧은 쪽으로 감아 그린다.
    const wrapDelta = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
    const gamma = Math.atan2(target.y, target.x);
    const angleMarks = (() => {
        if (!sol.reachable || !sol.righty) return null;
        const th1 = sol.righty.theta1;                 // = γ − α
        const elbow = planarFk([th1, 0], [L1]).points[1];
        const tipDir = Math.atan2(target.y - elbow.y, target.x - elbow.x);
        const baseDir = Math.atan2(-elbow.y, -elbow.x);
        const dAlpha = wrapDelta(gamma - th1);
        const dBeta = wrapDelta(tipDir - baseDir);
        return {
            gammaArc: arcPts(0, 0, 0.6, 0, gamma),
            alphaArc: arcPts(0, 0, 1.15, th1, th1 + dAlpha),
            betaArc: arcPts(elbow.x, elbow.y, 0.5, baseDir, baseDir + dBeta),
            gLbl: labelAt(0, 0, 0.9, gamma / 2),
            aLbl: labelAt(0, 0, 1.5, th1 + dAlpha / 2),
            bLbl: labelAt(elbow.x, elbow.y, 0.85, baseDir + dBeta / 2),
        };
    })();

    const onDrag = (e: Konva.KonvaEventObject<DragEvent>) => {
        const g = mapToGlobal(width, height, e.target.x(), e.target.y(), res);
        setTarget({x: g.x, y: g.y});
    };

    return (
        <div className="flex flex-col gap-2 items-center" style={{width}}>
            <CoordinateSystem
                width={width}
                height={height}
                resolution={res}
                className="bg-surface border border-border rounded-lg"
            >
                {/* 작업공간 annulus: 안쪽 |L1−L2|, 바깥 L1+L2 */}
                <Ring x={center.x} y={center.y} innerRadius={Math.abs(L1 - L2) * scale}
                      outerRadius={(L1 + L2) * scale} fill={colors.accent} opacity={0.08}/>
                <Circle x={center.x} y={center.y} radius={(L1 + L2) * scale} stroke={colors.border} strokeWidth={1}/>
                <Circle x={center.x} y={center.y} radius={Math.abs(L1 - L2) * scale} stroke={colors.border}
                        strokeWidth={1}/>

                {/* 목표선 + 공식의 세 각 표시 */}
                {angleMarks && (
                    <>
                        <Line points={[center.x, center.y, tPx.x, tPx.y]} stroke={colors.muted}
                              strokeWidth={1.5} dash={[5, 5]}/>
                        <Line points={angleMarks.gammaArc} stroke={colors.muted} strokeWidth={2}/>
                        <Text x={angleMarks.gLbl.x - 4} y={angleMarks.gLbl.y - 7} text="γ" fontSize={14}
                              fontStyle="bold" fill={colors.muted}/>
                        <Line points={angleMarks.alphaArc} stroke={colors.accent} strokeWidth={2}/>
                        <Text x={angleMarks.aLbl.x - 4} y={angleMarks.aLbl.y - 7} text="α" fontSize={14}
                              fontStyle="bold" fill={colors.accent}/>
                        <Line points={angleMarks.betaArc} stroke="#e0533d" strokeWidth={2}/>
                        <Text x={angleMarks.bLbl.x - 4} y={angleMarks.bLbl.y - 7} text="β" fontSize={14}
                              fontStyle="bold" fill="#e0533d"/>
                    </>
                )}
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
                <span className="font-semibold">γ</span>{" "}
                {t("angle from the x-axis to the target", "x축에서 목표점까지의 방위각")} ·{" "}
                <span className="text-[var(--accent)] font-semibold">α</span>{" "}
                {t("between the target line and link 1", "목표선과 링크 1 사이")} ·{" "}
                <span style={{color: "#e0533d"}} className="font-semibold">β</span>{" "}
                {t("interior elbow angle", "팔꿈치 내부각")}
            </div>
            <div className="w-full text-xs text-muted text-center">
                {sol.reachable && sol.righty && sol.lefty ? (
                    <span>
                        <span className="text-[var(--accent)] font-semibold">{t("righty", "오른손잡이(righty)")}</span>{" "}
                        θ = ({(sol.righty.theta1 * 180 / Math.PI).toFixed(0)}°,{" "}
                        {(sol.righty.theta2 * 180 / Math.PI).toFixed(0)}°) ·{" "}
                        <span style={{color: LEFTY_COLOR}} className="font-semibold">{t("lefty", "왼손잡이(lefty)")}</span>{" "}
                        θ = ({(sol.lefty.theta1 * 180 / Math.PI).toFixed(0)}°,{" "}
                        {(sol.lefty.theta2 * 180 / Math.PI).toFixed(0)}°)
                    </span>
                ) : (
                    <span>{t("outside the workspace: no solution. Drag the target back into the annulus.", "작업 공간 밖: 해가 없다. 목표점을 환형 영역 안으로 다시 끌어 놓아라.")}</span>
                )}
            </div>
        </div>
    );
};

const AnalyticIK2R = () => {
    const t = useTr();
    return <CanvasFigure
        label={t("analytic IK · drag the target for lefty / righty solutions", "해석적 Inverse Kinematics · 목표점을 드래그해 왼손잡이 / 오른손잡이 해를 확인")}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<IkScene {...modalCanvasSize()}/>}
    >
        <IkScene width={320} height={320}/>
    </CanvasFigure>;
};

export default AnalyticIK2R;
