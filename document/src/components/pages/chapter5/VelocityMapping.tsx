import {useState} from "react";
import {Arrow, Circle, Ellipse, Layer, Line, Stage, Text} from "react-konva";
import CanvasFigure from "../../CanvasFigure";
import {useTr} from "../../../libs/i18n";
import {det2R, jacobian2R, manipulabilityEllipse, Vec2} from "../../../libs/planarArm";
import {CanvasColors, useCanvasColors} from "../../../libs/useTheme";

// Jacobian 이 "선형 사상"이라는 사실을 그대로 그린다 (책 그림 5.2): 왼쪽은 관절속도 공간의
// 단위 정사각형(A–D)과 등노력 단위원, 오른쪽은 J 로 사상된 평행사변형과 조작성 타원.
// θ̇ 점을 끌면 대응하는 팁 속도 J θ̇ 가 따라 움직이고, 자세 슬라이더로 J 자체가 변한다 —
// 특이점(θ2→0)에서 평행사변형과 타원이 함께 선분으로 붕괴한다.
const L1 = 2.5, L2 = 2;
const PANEL = 230, PAD = 18;
const J1_COLOR = "#f2a63a";
const J2_COLOR = "#e0533d";

// 패널 좌표: 중심 원점, 스케일 s (px per unit), y 위가 +.
const mk = (s: number) => (x: number, y: number) => ({x: PANEL / 2 + x * s, y: PANEL / 2 - y * s});


const axes = (colors: CanvasColors, label1: string, label2: string) => (
    <>
        <Line points={[PAD, PANEL / 2, PANEL - PAD, PANEL / 2]} stroke={colors.border} strokeWidth={1}/>
        <Line points={[PANEL / 2, PAD, PANEL / 2, PANEL - PAD]} stroke={colors.border} strokeWidth={1}/>
        <Text x={PANEL - PAD - 8} y={PANEL / 2 + 6} text={label1} fontSize={11} fill={colors.muted}/>
        <Text x={PANEL / 2 + 6} y={PAD - 4} text={label2} fontSize={11} fill={colors.muted}/>
    </>
);

const VelocityMappingScene = () => {
    const colors = useCanvasColors();
    const t = useTr();
    const [theta, setTheta] = useState<[number, number]>([0.4, 1.2]);
    const [qd, setQd] = useState<Vec2>({x: 0.6, y: 0.8});     // 관절속도 (θ̇1, θ̇2)

    const [j1, j2] = jacobian2R(theta[0], theta[1], L1, L2);
    const v: Vec2 = {x: j1.x * qd.x + j2.x * qd.y, y: j1.y * qd.x + j2.y * qd.y};
    const ell = manipulabilityEllipse(j1, j2);
    const detJ = det2R(theta[1], L1, L2);

    // 왼쪽(관절속도) 패널: 단위원이 넉넉히 보이는 스케일. 오른쪽(팁속도): 최대 |v|≈|J1|+|J2|.
    const sL = (PANEL / 2 - PAD) / 1.6;
    const reach = Math.hypot(j1.x, j1.y) + Math.hypot(j2.x, j2.y);
    const sR = (PANEL / 2 - PAD) / Math.max(reach, 1e-6);
    const pL = mk(sL), pR = mk(sR);

    // 단위 정사각형 꼭짓점 (θ̇ = (±1, ±1)) 과 그 상(像)인 평행사변형 (±J1±J2).
    const squarePts: Vec2[] = [{x: 1, y: 1}, {x: -1, y: 1}, {x: -1, y: -1}, {x: 1, y: -1}];
    const paraPts = squarePts.map((c) => ({
        x: j1.x * c.x + j2.x * c.y,
        y: j1.y * c.x + j2.y * c.y,
    }));

    const setJoint = (i: number, val: number) =>
        setTheta((prev) => {
            const next = [...prev] as [number, number];
            next[i] = val;
            return next;
        });

    const qdPx = pL(qd.x, qd.y);
    const vPx = pR(v.x, v.y);
    const originL = pL(0, 0), originR = pR(0, 0);
    const labels = ["A", "B", "C", "D"];

    return (
        <div className="flex flex-col gap-2 items-center">
            <div className="flex flex-row flex-wrap gap-3 items-center justify-center">
                {/* 관절속도 공간 */}
                <div className="flex flex-col items-center gap-1">
                    <Stage width={PANEL} height={PANEL}
                           className="bg-surface border border-border rounded-lg overflow-hidden">
                        <Layer>
                            {axes(colors, "θ̇₁", "θ̇₂")}
                            <Line points={squarePts.flatMap((c) => { const m = pL(c.x, c.y); return [m.x, m.y]; })}
                                  closed stroke={colors.muted} strokeWidth={1.5} dash={[6, 5]}/>
                            {squarePts.map((c, i) => {
                                const m = pL(c.x, c.y);
                                return <Text key={i} x={m.x + (c.x > 0 ? 5 : -16)} y={m.y + (c.y > 0 ? -16 : 5)}
                                             text={labels[i]} fontSize={12} fontStyle="bold" fill={colors.muted}/>;
                            })}
                            <Circle x={originL.x} y={originL.y} radius={sL} stroke={colors.muted}
                                    strokeWidth={1.5} dash={[2, 4]}/>
                            <Arrow points={[originL.x, originL.y, qdPx.x, qdPx.y]} stroke={colors.accent}
                                   fill={colors.accent} strokeWidth={2.5} pointerLength={7} pointerWidth={7}/>
                            <Circle
                                x={qdPx.x} y={qdPx.y} radius={8} fill={colors.accent}
                                stroke={colors.surface} strokeWidth={2} draggable
                                dragBoundFunc={(pos) => ({
                                    x: Math.max(10, Math.min(PANEL - 10, pos.x)),
                                    y: Math.max(10, Math.min(PANEL - 10, pos.y)),
                                })}
                                onDragMove={(e) => {
                                    setQd({x: (e.target.x() - PANEL / 2) / sL, y: (PANEL / 2 - e.target.y()) / sL});
                                }}
                            />
                            <Text x={8} y={8} text={t("joint velocities", "관절속도 공간")} fontSize={11}
                                  fontStyle="bold" fill={colors.muted}/>
                        </Layer>
                    </Stage>
                </div>

                <div className="text-2xl text-muted font-bold px-1 select-none">
                    →<span className="text-sm font-normal"> J(θ)</span>
                </div>

                {/* 팁속도 공간 */}
                <div className="flex flex-col items-center gap-1">
                    <Stage width={PANEL} height={PANEL}
                           className="bg-surface border border-border rounded-lg overflow-hidden">
                        <Layer>
                            {axes(colors, "ẋ₁", "ẋ₂")}
                            {/* 정사각형의 상: 평행사변형 (모서리 = ±J1±J2) */}
                            <Line points={paraPts.flatMap((c) => { const m = pR(c.x, c.y); return [m.x, m.y]; })}
                                  closed stroke={colors.muted} strokeWidth={1.5} dash={[6, 5]}/>
                            {paraPts.map((c, i) => {
                                const m = pR(c.x, c.y);
                                return <Text key={i} x={m.x + 4} y={m.y - 14} text={labels[i]} fontSize={12}
                                             fontStyle="bold" fill={colors.muted}/>;
                            })}
                            {/* 단위원의 상: 조작성 타원 */}
                            <Ellipse x={originR.x} y={originR.y}
                                     radiusX={Math.max(ell.major * sR, 1)} radiusY={Math.max(ell.minor * sR, 1)}
                                     rotation={(-ell.angle * 180) / Math.PI}
                                     stroke={colors.accent} strokeWidth={1.5} dash={[2, 4]} opacity={0.8}/>
                            {/* J 의 열들 */}
                            <Arrow points={[originR.x, originR.y, pR(j1.x, j1.y).x, pR(j1.x, j1.y).y]}
                                   stroke={J1_COLOR} fill={J1_COLOR} strokeWidth={2} pointerLength={6}
                                   pointerWidth={6}/>
                            <Arrow points={[originR.x, originR.y, pR(j2.x, j2.y).x, pR(j2.x, j2.y).y]}
                                   stroke={J2_COLOR} fill={J2_COLOR} strokeWidth={2} pointerLength={6}
                                   pointerWidth={6}/>
                            {/* 사상된 팁 속도 J θ̇ */}
                            <Arrow points={[originR.x, originR.y, vPx.x, vPx.y]} stroke={colors.accent}
                                   fill={colors.accent} strokeWidth={2.5} pointerLength={7} pointerWidth={7}/>
                            <Circle x={vPx.x} y={vPx.y} radius={4.5} fill={colors.accent}/>
                            <Text x={8} y={8} text={t("tip velocities", "팁속도 공간")} fontSize={11}
                                  fontStyle="bold" fill={colors.muted}/>
                        </Layer>
                    </Stage>
                </div>
            </div>

            <div className="w-full max-w-md flex flex-col gap-1 text-xs text-muted">
                {[0, 1].map((i) => (
                    <label key={i} className="flex items-center gap-2">
                        <span className="w-8 shrink-0">θ{i + 1}</span>
                        <input type="range" min={-Math.PI} max={Math.PI} step={0.01} value={theta[i]}
                               onChange={(e) => setJoint(i, parseFloat(e.target.value))}
                               className="w-full accent-[var(--accent)]"
                               aria-label={`joint angle theta ${i + 1}`}/>
                        <span className="w-12 shrink-0 text-right tabular-nums">
                            {Math.round(theta[i] * 180 / Math.PI)}°
                        </span>
                    </label>
                ))}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-0.5 tabular-nums">
                    <span>θ̇ = ({qd.x.toFixed(2)}, {qd.y.toFixed(2)})</span>
                    <span>J θ̇ = ({v.x.toFixed(2)}, {v.y.toFixed(2)})</span>
                    <span><span style={{color: J1_COLOR}} className="font-semibold">J₁</span> ·{" "}
                        <span style={{color: J2_COLOR}} className="font-semibold">J₂</span></span>
                    <span>det J = {detJ.toFixed(2)}{Math.abs(detJ) < 0.15 &&
                        <span className="text-[var(--accent)] font-semibold"> · {t("near-singular!", "특이점 부근!")}</span>}
                    </span>
                </div>
            </div>
        </div>
    );
};

const VelocityMapping = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "the Jacobian is a linear map · the unit square maps to a parallelogram, the iso-effort circle to the manipulability ellipse",
            "Jacobian 은 선형 사상 · 단위 정사각형은 평행사변형으로, 등노력 원은 조작성 타원으로 사상된다",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<VelocityMappingScene/>}
    >
        <VelocityMappingScene/>
    </CanvasFigure>;
};

export default VelocityMapping;
