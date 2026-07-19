import {Fragment, useEffect, useRef, useState} from "react";
import {Circle, Line, Text} from "react-konva";
import CoordinateSystem from "../../2d/CoordinateCanvas";
import CanvasFigure from "../../CanvasFigure";
import {useTr} from "../../../libs/i18n";
import {globalToMap} from "../../../libs/konvaUtils";
import {planarFk} from "../../../libs/planarArm";
import {useCanvasColors} from "../../../libs/useTheme";

// PoE 공식의 조립 순서를 애니메이션으로 보여준다. ▶ 를 누르면 홈 자세 M 에서 시작해
// 관절이 한 번에 하나씩 목표각까지 차오른다 — space form 은 가장 먼 관절부터(3→2→1),
// body form 은 가장 가까운 관절부터(1→2→3). 지금 돌고 있는 관절의 축(⊙)과 수식의
// 해당 지수 항이 함께 강조되어, 곱의 각 인자가 "무엇을 돌리는지"가 눈에 들어온다.
const LINKS = [2.5, 2, 1.5];
const RESOLUTION = 0.05;
const ACTIVE_COLOR = "#e0533d";
const STAGE_SEC = 1.1;          // 관절 하나가 차오르는 시간

type Mode = "space" | "body";

// 적용 순서 (joint index). space: 먼 관절부터, body: 가까운 관절부터.
const ORDER: Record<Mode, number[]> = {space: [2, 1, 0], body: [0, 1, 2]};
// 구간 내 가감속: 시작·끝에서 속도 0 (계단식 점프 제거).
const ease = (s: number) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, s)));

interface SceneProps {
    width: number;
    height: number;
}

const PoEScene = ({width, height}: SceneProps) => {
    const colors = useCanvasColors();
    const t = useTr();
    const [theta, setTheta] = useState<[number, number, number]>([0.8, 0.7, 0.9]);
    const [mode, setMode] = useState<Mode>("space");
    // anim: 전체 진행 시간(초). null 이면 정지 상태(최종 자세 표시).
    const [animT, setAnimT] = useState<number | null>(null);
    const rafRef = useRef<number>();
    const startRef = useRef(0);

    useEffect(() => {
        if (animT === null) return;
        const tick = (now: number) => {
            const cur = (now - startRef.current) / 1000;
            if (cur >= 3 * STAGE_SEC + 0.4) {
                setAnimT(null);     // 끝나면 최종 자세로 정지
                return;
            }
            setAnimT(cur);
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [animT !== null]);

    const play = () => {
        startRef.current = performance.now();
        setAnimT(0);
    };

    // 현재 표시 각: 완료된 단계는 목표값, 진행 중 단계는 ease 보간, 이후 단계는 0.
    const order = ORDER[mode];
    const stage = animT === null ? 3 : Math.min(2, Math.floor(animT / STAGE_SEC));
    const disp: number[] = [0, 0, 0];
    order.forEach((j, k) => {
        if (animT === null || k < stage) disp[j] = theta[j];
        else if (k === stage) disp[j] = theta[j] * ease(animT / STAGE_SEC - stage);
        else disp[j] = 0;
    });
    const animating = animT !== null;
    const activeJoint = animating ? order[stage] : -1;

    const toPx = (p: {x: number; y: number}) => globalToMap(width, height, p.x, p.y, RESOLUTION);
    const home = planarFk([0, 0, 0], LINKS).points.map(toPx);
    const arm = planarFk(disp, LINKS).points.map(toPx);
    // 지금 돌고 있는 관절의 축 위치: 현재 표시 자세에서의 관절 위치.
    const activeCenter = activeJoint >= 0 ? arm[activeJoint] : null;

    const setJoint = (i: number, v: number) =>
        setTheta((prev) => {
            const next = [...prev] as [number, number, number];
            next[i] = v;
            return next;
        });

    // 수식 항: space 는 [e^S1][e^S2][e^S3][M], body 는 [M][e^B1][e^B2][e^B3].
    // 강조 인덱스 = 현재 단계의 관절.
    const terms = mode === "space"
        ? [["e^[S₁]θ₁", 0], ["e^[S₂]θ₂", 1], ["e^[S₃]θ₃", 2], ["M", -1]] as const
        : [["M", -1], ["e^[B₁]θ₁", 0], ["e^[B₂]θ₂", 1], ["e^[B₃]θ₃", 2]] as const;

    return (
        <div className="flex flex-col gap-2 items-center" style={{width}}>
            <CoordinateSystem
                width={width}
                height={height}
                resolution={RESOLUTION}
                className="bg-surface border border-border rounded-lg"
            >
                {/* 홈 자세 M (흐리게) */}
                {home.slice(0, -1).map((p, i) => (
                    <Line key={`h${i}`} points={[p.x, p.y, home[i + 1].x, home[i + 1].y]}
                          stroke={colors.muted} strokeWidth={3} lineCap="round" opacity={0.35}/>
                ))}
                <Text x={home[home.length - 1].x + 6} y={home[home.length - 1].y - 6} text="M"
                      fontSize={12} fontStyle="bold" fill={colors.muted}/>
                {/* 현재 자세 */}
                {arm.slice(0, -1).map((p, i) => (
                    <Line key={`a${i}`} points={[p.x, p.y, arm[i + 1].x, arm[i + 1].y]}
                          stroke={colors.accent} strokeWidth={4.5} lineCap="round"/>
                ))}
                {arm.slice(0, -1).map((p, i) => (
                    <Circle key={`j${i}`} x={p.x} y={p.y} radius={5} fill={colors.surface}
                            stroke={i === activeJoint ? ACTIVE_COLOR : colors.text}
                            strokeWidth={i === activeJoint ? 3 : 2}/>
                ))}
                <Circle x={arm[arm.length - 1].x} y={arm[arm.length - 1].y} radius={6.5}
                        fill={colors.accent}/>
                {/* 지금 돌고 있는 screw 축 ⊙ */}
                {activeCenter && (
                    <>
                        <Circle x={activeCenter.x} y={activeCenter.y} radius={11}
                                stroke={ACTIVE_COLOR} strokeWidth={2.5}/>
                        <Circle x={activeCenter.x} y={activeCenter.y} radius={2} fill={ACTIVE_COLOR}/>
                    </>
                )}
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
                            disabled={animating}
                            onChange={(e) => setJoint(i, parseFloat(e.target.value))}
                            className="w-full accent-[var(--accent)]"
                            aria-label={`joint angle theta ${i + 1}`}
                        />
                        <span className="w-12 shrink-0 text-right tabular-nums">
                            {Math.round(theta[i] * 180 / Math.PI)}°
                        </span>
                    </label>
                ))}
                <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                        type="button"
                        onClick={play}
                        disabled={animating}
                        className="px-2.5 py-1 rounded border border-[var(--accent)] text-[var(--accent)] font-semibold disabled:opacity-40"
                    >
                        ▶ {t("apply joint by joint", "관절 하나씩 적용")}
                    </button>
                    {(["space", "body"] as const).map((m) => (
                        <button
                            key={m}
                            type="button"
                            onClick={() => { setAnimT(null); setMode(m); }}
                            className={`px-2 py-0.5 rounded border ${
                                mode === m
                                    ? "border-[var(--accent)] text-[var(--accent)] font-semibold"
                                    : "border-border hover:bg-surface"
                            }`}
                        >
                            {m} form
                        </button>
                    ))}
                </div>
                {/* 수식: 지금 적용 중인 인자만 붉게 */}
                <div className="text-center pt-0.5 tabular-nums text-sm">
                    T ={" "}
                    {terms.map(([label, j], k) => (
                        <Fragment key={label}>
                            {k > 0 && <span> · </span>}
                            <span
                                className={animating && j === activeJoint ? "font-bold" : ""}
                                style={animating && j === activeJoint ? {color: ACTIVE_COLOR} : undefined}
                            >
                                {label}
                            </span>
                        </Fragment>
                    ))}
                </div>
                <div className="text-center">
                    {mode === "space"
                        ? t("order 3 → 2 → 1: the farthest joint first, then inward — each factor screws everything outward of it",
                            "순서 3 → 2 → 1: 가장 먼 관절부터 안쪽으로 — 각 인자는 자기 바깥의 전부를 screw 운동시킨다")
                        : t("order 1 → 2 → 3: the nearest joint first, then outward — the final pose is the same",
                            "순서 1 → 2 → 3: 가장 가까운 관절부터 바깥으로 — 최종 자세는 같다")}
                </div>
            </div>
        </div>
    );
};

const PoEBuildUp = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "the PoE product applied one joint at a time · space form goes 3→2→1, body form 1→2→3, same final pose",
            "PoE 곱을 관절 하나씩 적용하기 · space form 은 3→2→1, body form 은 1→2→3, 최종 자세는 동일",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<PoEScene width={460} height={460}/>}
    >
        <PoEScene width={320} height={320}/>
    </CanvasFigure>;
};

export default PoEBuildUp;
