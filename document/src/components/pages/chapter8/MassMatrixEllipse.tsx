import {useMemo, useState} from "react";
import {Arrow, Circle, Ellipse, Line, Text} from "react-konva";
import type Konva from "konva";
import CoordinateSystem from "../../2d/CoordinateCanvas";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {planarFk} from "../../../libs/planarArm";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";
import {massMatrix2R, TWO_R} from "./twoRModel";

// "끝점을 잡고 밀면 얼마나 무겁게 느껴지나"를 물리 공간에서 직접 체험하게 한다.
// 팁에 단위 힘 f (드래그)를 가하면 가속도는 ẍ = Λ⁻¹f = (J M⁻¹ Jᵀ) f. 모든 방향의 결과가
// 팁에 그린 가속도 타원이고, 방향별 felt mass = 1/(f̂ᵀ Λ⁻¹ f̂) 가 실시간으로 나온다.
// J M⁻¹ Jᵀ 형태를 쓰므로 J 를 뒤집지 않아, 특이 자세에서는 타원이 선으로 접히는 것까지 보인다.
const {l1: L1, l2: L2} = TWO_R;
const RESOLUTION = 0.02;
const FORCE_R = 0.65;       // 팁 주위 단위 힘 원의 표시 반지름 (world 단위)
const ACC_SCALE = 0.85;     // 가속도 → 표시 길이 배율
const FORCE_COLOR = "#e0533d";

const degrees = (rad: number) => Math.round((rad * 180) / Math.PI);

interface Eig {
    major: number;
    minor: number;
    angle: number;
}

// 대칭 2×2 [[a,b],[b,c]] 의 고유분해 (반축 길이 + 회전각).
const symEig = (a: number, b: number, c: number): Eig => {
    const mid = (a + c) / 2;
    const half = Math.sqrt(Math.max(0, ((a - c) / 2) ** 2 + b * b));
    return {major: mid + half, minor: Math.max(0, mid - half), angle: 0.5 * Math.atan2(2 * b, a - c)};
};

interface SceneProps {
    width: number;
    height: number;
}

const MassMatrixScene = ({width, height}: SceneProps) => {
    // 큰 모달 캔버스에서는 world 스케일(resolution)도 함께 키운다 (460px 기준 유지).
    const res = RESOLUTION * Math.min(1, 460 / width);
    const colors = useCanvasColors();
    const t = useTr();
    const [theta, setTheta] = useState<[number, number]>([0.5, 1.5]);
    // 미는 힘의 방향각 (world 기준).
    const [phi, setPhi] = useState(0.4);

    const {tip, elbow, S, eig} = useMemo(() => {
        const pts = planarFk(theta, [L1, L2]).points;
        const [m11, m12, m22] = massMatrix2R(theta[1]);
        const det = m11 * m22 - m12 * m12;
        const inv = Math.abs(det) < 1e-9 ? 0 : 1 / det;
        const i11 = m22 * inv, i12 = -m12 * inv, i22 = m11 * inv;   // M⁻¹
        // 평면 2R 의 위치 Jacobian.
        const s1 = Math.sin(theta[0]), c1 = Math.cos(theta[0]);
        const s12 = Math.sin(theta[0] + theta[1]), c12 = Math.cos(theta[0] + theta[1]);
        const j11 = -L1 * s1 - L2 * s12, j12 = -L2 * s12;
        const j21 = L1 * c1 + L2 * c12, j22 = L2 * c12;
        // Λ⁻¹ = J M⁻¹ Jᵀ (대칭 2×2).
        const a11 = j11 * (i11 * j11 + i12 * j12) + j12 * (i12 * j11 + i22 * j12);
        const a12 = j21 * (i11 * j11 + i12 * j12) + j22 * (i12 * j11 + i22 * j12);
        const a22 = j21 * (i11 * j21 + i12 * j22) + j22 * (i12 * j21 + i22 * j22);
        const S = {a11, a12, a22};
        return {tip: pts[2], elbow: pts[1], S, eig: symEig(a11, a12, a22)};
    }, [theta]);

    // 단위 힘 f 와 그 결과 가속도 ẍ = Λ⁻¹ f, 방향별 felt mass = 1 / (f̂ᵀ Λ⁻¹ f̂).
    const f = {x: Math.cos(phi), y: Math.sin(phi)};
    const acc = {x: S.a11 * f.x + S.a12 * f.y, y: S.a12 * f.x + S.a22 * f.y};
    const accMag = Math.hypot(acc.x, acc.y);
    const quad = f.x * (S.a11 * f.x + S.a12 * f.y) + f.y * (S.a12 * f.x + S.a22 * f.y);
    const feltMass = quad > 1e-9 ? 1 / quad : Infinity;

    const toPx = (p: {x: number; y: number}) => {
        const scale = 1 / res;
        return {x: width / 2 + p.x * scale, y: height / 2 - p.y * scale};
    };
    const scale = 1 / res;
    const base = toPx({x: 0, y: 0});
    const elbowPx = toPx(elbow);
    const tipPx = toPx(tip);
    const fTipPx = {x: tipPx.x + f.x * FORCE_R * scale, y: tipPx.y - f.y * FORCE_R * scale};
    const accTipPx = {x: tipPx.x + acc.x * ACC_SCALE * scale, y: tipPx.y - acc.y * ACC_SCALE * scale};

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
                {/* 팔 (실공간) */}
                <Line points={[base.x, base.y, elbowPx.x, elbowPx.y, tipPx.x, tipPx.y]}
                      stroke={colors.text} strokeWidth={5} lineCap="round" lineJoin="round" opacity={0.8}/>
                <Circle x={base.x} y={base.y} radius={6} fill={colors.surface} stroke={colors.text}
                        strokeWidth={2}/>
                <Circle x={elbowPx.x} y={elbowPx.y} radius={5} fill={colors.surface} stroke={colors.text}
                        strokeWidth={2}/>

                {/* 팁의 가속도 타원: 모든 방향으로 1 N 씩 밀었을 때 나올 수 있는 가속도 전부 */}
                <Ellipse
                    x={tipPx.x} y={tipPx.y}
                    radiusX={Math.max(eig.major * ACC_SCALE * scale, 1)}
                    radiusY={Math.max(eig.minor * ACC_SCALE * scale, 1)}
                    rotation={(-eig.angle * 180) / Math.PI}
                    fill={colors.accent} opacity={0.2}
                    stroke={colors.accent} strokeWidth={2}
                />
                {/* 단위 힘 원 (연하게) */}
                <Circle x={tipPx.x} y={tipPx.y} radius={FORCE_R * scale} stroke={colors.muted}
                        strokeWidth={1} dash={[4, 4]} opacity={0.6}/>

                {/* 미는 힘 f (드래그) 와 그 결과 가속도 */}
                <Arrow points={[tipPx.x, tipPx.y, fTipPx.x, fTipPx.y]} stroke={colors.muted}
                       fill={colors.muted} strokeWidth={2.5} pointerLength={7} pointerWidth={7}/>
                <Arrow points={[tipPx.x, tipPx.y, accTipPx.x, accTipPx.y]} stroke={FORCE_COLOR}
                       fill={FORCE_COLOR} strokeWidth={3} pointerLength={8} pointerWidth={8}/>
                <Circle
                    x={fTipPx.x} y={fTipPx.y} radius={9}
                    fill={colors.surface} stroke={colors.text} strokeWidth={2.5} draggable
                    dragBoundFunc={(pos) => {
                        // 핸들은 팁 주위 원 위에 묶는다 (미는 "방향"만 고른다).
                        const dx = pos.x - tipPx.x, dy = pos.y - tipPx.y;
                        const d = Math.hypot(dx, dy) || 1;
                        return {
                            x: tipPx.x + (dx / d) * FORCE_R * scale,
                            y: tipPx.y + (dy / d) * FORCE_R * scale,
                        };
                    }}
                    onDragMove={(e: Konva.KonvaEventObject<DragEvent>) => {
                        setPhi(Math.atan2(tipPx.y - e.target.y(), e.target.x() - tipPx.x));
                    }}
                />
                <Text x={fTipPx.x + 8} y={fTipPx.y - 6} text={t("push (1 N)", "밀기 (1 N)")} fontSize={11}
                      fontStyle="bold" fill={colors.muted}/>
                <Text x={accTipPx.x + 8} y={accTipPx.y - 6} text="ẍ" fontSize={13} fontStyle="bold"
                      fill={FORCE_COLOR}/>
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
                <div className="text-center tabular-nums pt-1">
                    {t("push the handle around the tip: this direction feels like",
                        "팁 주위 핸들을 돌려 보라: 이 방향으로 팔은")}{" "}
                    <span className="font-semibold" style={{color: FORCE_COLOR}}>
                        {feltMass === Infinity ? "∞" : feltMass.toFixed(2)} kg
                    </span>
                    {t(", acceleration", " 처럼 무겁고, 가속도는")}{" "}
                    <span className="font-semibold">{accMag.toFixed(2)} m/s²</span>
                </div>
                <div className="text-center">
                    {t("ellipse: accelerations from a 1 N push in every direction. Fold/straighten the arm and it reshapes.",
                        "타원: 모든 방향으로 1 N 씩 밀었을 때의 가속도 전부. 팔을 접거나 펴면 모양이 바뀐다.")}
                </div>
            </div>
        </div>
    );
};

const MassMatrixEllipse = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "grab the tip and push: the same 1 N feels heavy in one direction and light in another",
            "끝점을 잡고 밀어 보라: 같은 1 N 인데 어떤 방향은 무겁고 어떤 방향은 가볍다",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<MassMatrixScene {...modalCanvasSize()}/>}
    >
        <MassMatrixScene width={340} height={340}/>
    </CanvasFigure>;
};

export default MassMatrixEllipse;
