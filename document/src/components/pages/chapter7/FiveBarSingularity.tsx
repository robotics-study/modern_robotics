import {useMemo, useState} from "react";
import {Circle, Line, Text} from "react-konva";
import CoordinateSystem from "../../2d/CoordinateCanvas";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {globalToMap} from "../../../libs/konvaUtils";
import {circleCircleIntersect} from "../../../libs/planarArm";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";

// 5절 링크의 actuator singularity 를 손으로 만들어 보게 한다. 지면의 두 크랭크(θ₁, θ₄)만
// 구동하고 가운데 관절 M 은 두 coupler 원의 교점으로 따라온다(수동). 두 크랭크를 당겨
// 두 coupler 가 일직선이 되는 순간, 교점 두 개가 하나로 합쳐지고 M 이 위로 꺾일지 아래로
// 꺾일지 결정할 수 없게 된다. 그 지점이 nondegenerate actuator singularity 다.
const RESOLUTION = 0.05;
const L1 = 1.6, L4 = 1.6;       // 구동 크랭크 (지면 관절)
const L2 = 2.2, L3 = 2.2;       // 수동 coupler
const O1 = {x: -2, y: 0};
const O2 = {x: 2, y: 0};

const PASSIVE_COLOR = "#f2a63a";
const SINGULAR_COLOR = "#e0533d";

interface SceneProps {
    width: number;
    height: number;
}

const FiveBarScene = ({width, height}: SceneProps) => {
    // 큰 모달 캔버스에서는 world 스케일(resolution)도 함께 키운다 (460px 기준 유지).
    const res = RESOLUTION * Math.min(1, 460 / width);
    const colors = useCanvasColors();
    const t = useTr();
    const [th1, setTh1] = useState(1.5);
    const [th4, setTh4] = useState(1.9);
    const [sign, setSign] = useState(1);

    const sol = useMemo(() => {
        const A = {x: O1.x + L1 * Math.cos(th1), y: O1.y + L1 * Math.sin(th1)};
        const B = {x: O2.x + L4 * Math.cos(th4), y: O2.y + L4 * Math.sin(th4)};
        const hit = circleCircleIntersect(A, L2, B, L3, sign);
        const other = circleCircleIntersect(A, L2, B, L3, -sign);
        return {A, B, M: hit?.p ?? null, other: other?.p ?? null, h: hit?.h ?? 0};
    }, [th1, th4, sign]);

    const reachable = sol.M !== null;
    // 두 교점 사이 간격(2h)이 0 에 가까우면 두 coupler 가 일직선: actuator singularity.
    // h 는 접선 근처에서 제곱근 속도로 줄어들어, 슬라이더로 잡을 수 있게 문턱을 넉넉히 둔다.
    const singular = reachable && Math.abs(sol.h) < 0.35;

    const toPx = (p: {x: number; y: number}) => globalToMap(width, height, p.x, p.y, res);
    const o1 = toPx(O1), o2 = toPx(O2);
    const aPx = toPx(sol.A), bPx = toPx(sol.B);
    const mPx = sol.M ? toPx(sol.M) : null;
    const otherPx = sol.other ? toPx(sol.other) : null;
    const couplerColor = singular ? SINGULAR_COLOR : PASSIVE_COLOR;

    return (
        <div className="flex flex-col gap-2 items-center" style={{width}}>
            <CoordinateSystem
                width={width}
                height={height}
                resolution={res}
                className="bg-surface border border-border rounded-lg"
            >
                {/* 지면 O1—O2 */}
                <Line points={[o1.x, o1.y, o2.x, o2.y]} stroke={colors.muted} strokeWidth={3}
                      dash={[6, 5]} lineCap="round"/>
                {/* 반대 가지의 M (희미하게): singularity 에서 현재 해와 합쳐진다 */}
                {mPx && otherPx && (
                    <>
                        <Line points={[aPx.x, aPx.y, otherPx.x, otherPx.y]} stroke={colors.muted}
                              strokeWidth={2.5} lineCap="round" opacity={0.25}/>
                        <Line points={[bPx.x, bPx.y, otherPx.x, otherPx.y]} stroke={colors.muted}
                              strokeWidth={2.5} lineCap="round" opacity={0.25}/>
                        <Circle x={otherPx.x} y={otherPx.y} radius={4} fill={colors.muted} opacity={0.35}/>
                    </>
                )}
                {/* 수동 coupler A—M, B—M */}
                {mPx && (
                    <>
                        <Line points={[aPx.x, aPx.y, mPx.x, mPx.y]} stroke={couplerColor}
                              strokeWidth={4.5} lineCap="round"/>
                        <Line points={[bPx.x, bPx.y, mPx.x, mPx.y]} stroke={couplerColor}
                              strokeWidth={4.5} lineCap="round"/>
                    </>
                )}
                {/* 구동 크랭크 O1—A, O2—B */}
                <Line points={[o1.x, o1.y, aPx.x, aPx.y]} stroke={colors.accent} strokeWidth={5}
                      lineCap="round"/>
                <Line points={[o2.x, o2.y, bPx.x, bPx.y]} stroke={colors.accent} strokeWidth={5}
                      lineCap="round"/>
                {/* 관절 */}
                <Circle x={o1.x} y={o1.y} radius={7} fill={colors.accent}/>
                <Circle x={o2.x} y={o2.y} radius={7} fill={colors.accent}/>
                <Circle x={aPx.x} y={aPx.y} radius={5} fill={colors.surface} stroke={PASSIVE_COLOR}
                        strokeWidth={2}/>
                <Circle x={bPx.x} y={bPx.y} radius={5} fill={colors.surface} stroke={PASSIVE_COLOR}
                        strokeWidth={2}/>
                {mPx && (
                    <Circle x={mPx.x} y={mPx.y} radius={singular ? 8 : 6}
                            fill={singular ? SINGULAR_COLOR : colors.surface}
                            stroke={singular ? SINGULAR_COLOR : PASSIVE_COLOR} strokeWidth={2.5}/>
                )}
                <Text x={o1.x - 26} y={o1.y + 10} text={t("θ₁ (actuated)", "θ₁ (구동)")} fontSize={11}
                      fill={colors.accent}/>
                <Text x={o2.x + 8} y={o2.y + 10} text={t("θ₄ (actuated)", "θ₄ (구동)")} fontSize={11}
                      fill={colors.accent}/>
                {mPx && <Text x={mPx.x + 10} y={mPx.y - 16} text="M" fontSize={13} fontStyle="bold"
                              fill={singular ? SINGULAR_COLOR : PASSIVE_COLOR}/>}
            </CoordinateSystem>

            <div className="w-full flex flex-col gap-1 text-xs text-muted">
                {([["θ₁", th1, setTh1], ["θ₄", th4, setTh4]] as const).map(([label, val, set]) => (
                    <label key={label} className="flex items-center gap-2">
                        <span className="w-8 shrink-0">{label}</span>
                        <input type="range" min={0.15} max={Math.PI - 0.15} step={0.01} value={val}
                               onChange={(e) => set(parseFloat(e.target.value))}
                               className="w-full accent-[var(--accent)]"
                               aria-label={t(`actuated crank angle ${label}`, `구동 크랭크 각도 ${label}`)}/>
                        <span className="w-12 shrink-0 text-right tabular-nums">
                            {Math.round((val * 180) / Math.PI)}°
                        </span>
                    </label>
                ))}
                <div className="flex items-center justify-center gap-3 pt-0.5">
                    <button
                        type="button"
                        onClick={() => setSign((s) => -s)}
                        className="px-2 py-0.5 rounded border border-border hover:bg-surface"
                    >
                        {t("M branch", "M 가지")}: {sign > 0 ? "▲" : "▼"}
                    </button>
                    {!reachable ? (
                        <span className="font-semibold">{t("cannot assemble: the two coupler circles do not meet", "조립 불가: 두 coupler 원이 만나지 않는다")}</span>
                    ) : singular ? (
                        <span className="font-semibold" style={{color: SINGULAR_COLOR}}>
                            {t("actuator singularity: couplers collinear, M can buckle either way", "actuator singularity: coupler 일직선, M 이 어느 쪽으로 꺾일지 결정 불가")}
                        </span>
                    ) : (
                        <span>{t("regular: M follows uniquely (on this branch)", "정상: M 이 (이 가지에서) 유일하게 따라온다")}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

const FiveBarSingularity = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "five-bar linkage · drive the two ground cranks apart until the couplers align: an actuator singularity",
            "5절 링크 · 지면의 두 크랭크를 당겨 coupler 두 개가 일직선이 되게 해 보라: actuator singularity"
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<FiveBarScene {...modalCanvasSize()}/>}
    >
        <FiveBarScene width={320} height={320}/>
    </CanvasFigure>;
};

export default FiveBarSingularity;
