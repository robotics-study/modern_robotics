import {useState} from "react";
import {Arrow, Circle, Layer, Line, Rect, Stage, Text} from "react-konva";
import CanvasFigure from "../../CanvasFigure";
import {useTr} from "../../../libs/i18n";
import {useCanvasColors} from "../../../libs/useTheme";

// 책 예제 3.28: 로봇 손이 사과를 든 채 힘–토크 센서가 읽는 wrench.
// 두 중력 wrench 를 센서 프레임 {f} 로 옮겨 더한다: Ff = [Ad_Thf]ᵀFh + [Ad_Taf]ᵀFa.
// 평면에서 이는 모멘트 팔 × 힘의 합이 되어, 슬라이더로 L1·L2·질량을 바꾸면 즉시 검산된다.
const G = 10;           // m/s², 책과 같은 근사값
const M_HAND = 0.5;     // kg
const W = 340, H = 210;
const FORCE_COLOR = "#e0533d";
const MOMENT_COLOR = "#f2a63a";

const WrenchScene = () => {
    const colors = useCanvasColors();
    const t = useTr();
    const [L1, setL1] = useState(0.1);      // 센서 → 손 질량중심 (m)
    const [L2, setL2] = useState(0.15);     // 손 → 사과 (m)
    const [mApple, setMApple] = useState(0.1);

    const fy = -(M_HAND + mApple) * G;
    const mz = -(M_HAND * L1 + mApple * (L1 + L2)) * G;

    // m → px: 0.4 m 를 폭에 맞춘다. 팔은 왼쪽 센서에서 오른쪽으로.
    const scale = 620;
    const x0 = 46, yArm = 84;
    const xHand = x0 + L1 * scale;
    const xApple = x0 + (L1 + L2) * scale;
    const fArrow = (x: number, mass: number) => [x, yArm + 14, x, yArm + 14 + mass * G * 7];

    return (
        <div className="flex flex-col gap-2 items-center" style={{width: W}}>
            <Stage width={W} height={H} className="bg-surface border border-border rounded-lg overflow-hidden">
                <Layer>
                    {/* 팔 + 센서 */}
                    <Line points={[x0, yArm, xApple, yArm]} stroke={colors.text} strokeWidth={4}
                          lineCap="round"/>
                    <Rect x={x0 - 26} y={yArm - 13} width={26} height={26} cornerRadius={4}
                          fill={colors.surface} stroke={colors.accent} strokeWidth={2.5}/>
                    <Text x={x0 - 30} y={yArm + 18} text="{f}" fontSize={12} fontStyle="bold"
                          fill={colors.accent}/>
                    {/* 손 (질량중심) */}
                    <Circle x={xHand} y={yArm} radius={9} fill={colors.muted}/>
                    <Text x={xHand - 10} y={yArm - 30} text={`hand ${M_HAND}kg`} fontSize={11}
                          fill={colors.muted}/>
                    {/* 사과 */}
                    <Circle x={xApple} y={yArm} radius={7} fill={FORCE_COLOR}/>
                    <Text x={xApple - 12} y={yArm - 30} text={`${mApple.toFixed(2)}kg`} fontSize={11}
                          fill={FORCE_COLOR}/>
                    {/* 중력 힘 화살표 */}
                    <Arrow points={fArrow(xHand, M_HAND)} stroke={FORCE_COLOR} fill={FORCE_COLOR}
                           strokeWidth={2.5} pointerLength={7} pointerWidth={7}/>
                    <Arrow points={fArrow(xApple, mApple)} stroke={FORCE_COLOR} fill={FORCE_COLOR}
                           strokeWidth={2.5} pointerLength={7} pointerWidth={7}/>
                    {/* 센서가 받는 모멘트: 센서 둘레 원호 화살표 (음수 = 시계 방향으로 비틀린다) */}
                    <Arrow
                        points={Array.from({length: 9}, (_, i) => {
                            const a = -2.4 + (i / 8) * 1.9;
                            return [x0 - 13 + 24 * Math.cos(a), yArm + 24 * Math.sin(a)];
                        }).flat()}
                        stroke={MOMENT_COLOR} fill={MOMENT_COLOR} strokeWidth={2.5}
                        pointerLength={7} pointerWidth={7} tension={0.5}/>
                    <Text x={x0 + 4} y={yArm - 52} text={`m = ${mz.toFixed(2)} N·m`} fontSize={12}
                          fontStyle="bold" fill={MOMENT_COLOR}/>
                    <Text x={x0 + 4} y={H - 26} text={`f = ${fy.toFixed(1)} N`} fontSize={12}
                          fontStyle="bold" fill={FORCE_COLOR}/>
                </Layer>
            </Stage>

            <div className="w-full flex flex-col gap-1 text-xs text-muted">
                {([
                    ["L1", L1, 0.05, 0.2, (v: number) => setL1(v), "m"],
                    ["L2", L2, 0.05, 0.25, (v: number) => setL2(v), "m"],
                    [t("apple", "사과"), mApple, 0, 0.3, (v: number) => setMApple(v), "kg"],
                ] as const).map(([label, val, min, max, set, unit]) => (
                    <label key={label} className="flex items-center gap-2">
                        <span className="w-10 shrink-0">{label}</span>
                        <input type="range" min={min} max={max} step={0.01} value={val}
                               onChange={(e) => set(parseFloat(e.target.value))}
                               className="w-full accent-[var(--accent)]"
                               aria-label={`${label}`}/>
                        <span className="w-16 shrink-0 text-right tabular-nums">
                            {val.toFixed(2)} {unit}
                        </span>
                    </label>
                ))}
                <div className="text-center pt-0.5 tabular-nums">
                    F<sub>f</sub> = (m, f) = ({mz.toFixed(2)} N·m, {fy.toFixed(1)} N) = [Ad<sub>Thf</sub>]ᵀF<sub>h</sub> + [Ad<sub>Taf</sub>]ᵀF<sub>a</sub>
                </div>
            </div>
        </div>
    );
};

const WrenchBalance = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "the force–torque sensor reads one wrench: gravity wrenches moved to {f} and summed",
            "힘–토크 센서가 읽는 것은 wrench 하나: 중력 wrench 들을 {f} 로 옮겨 더한 것",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<WrenchScene/>}
    >
        <WrenchScene/>
    </CanvasFigure>;
};

export default WrenchBalance;
