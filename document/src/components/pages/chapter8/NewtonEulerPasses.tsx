import {useEffect, useMemo, useRef, useState} from "react";
import {Arrow, Circle, Line, Text} from "react-konva";
import CoordinateSystem from "../../2d/CoordinateCanvas";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {globalToMap} from "../../../libs/konvaUtils";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";

// Newton–Euler inverse dynamics 의 두 패스를 실제 수치로 재생한다. 평면 3R 팔(링크 끝 점질량)에
// 주어진 (θ, θ̇, θ̈) 에 대해: 순방향 패스는 베이스→끝단으로 각 질량의 가속도(자주색 화살표)를
// 전파하고, 역방향 패스는 끝단→베이스로 각 질량이 요구하는 힘 fᵢ = mᵢ(aᵢ − g) (빨강 화살표)를
// 모멘트로 모아 관절 토크 τᵢ 를 만든다. 스텝이 진행될 때마다 해당 링크/관절이 켜진다.
const L = [1.6, 1.3, 1.0];
const M = [1.0, 0.8, 0.5];
const G_ACC = 9.8;
const RESOLUTION = 0.028;
const ACC_COLOR = "#8b5cf6";
const FORCE_COLOR = "#e0533d";
const TAU_COLOR = "#f2a63a";
const STEP_MS = 1400;

interface Vec {
    x: number;
    y: number;
}

// 링크 끝 점질량의 위치/가속도를 해석적으로 전개한다 (θ̈ 선형 + θ̇ 이차 항).
const compute = (th: number[], dth: number[], ddth: number[]) => {
    const joints: Vec[] = [{x: 0, y: 0}];
    const masses: Vec[] = [];
    const acc: Vec[] = [];
    let ang = 0, w = 0, a = 0;
    let px = 0, py = 0, vx = 0, vy = 0, ax = 0, ay = 0;
    for (let i = 0; i < 3; i++) {
        ang += th[i];
        w += dth[i];
        a += ddth[i];
        const c = Math.cos(ang), s = Math.sin(ang);
        // 링크 i 벡터 r = L(c, s) 의 1·2차 도함수: ṙ = Lw(−s, c), r̈ = La(−s, c) − Lw²(c, s)
        px += L[i] * c;
        py += L[i] * s;
        vx += -L[i] * w * s;
        vy += L[i] * w * c;
        ax += -L[i] * a * s - L[i] * w * w * c;
        ay += L[i] * a * c - L[i] * w * w * s;
        masses.push({x: px, y: py});
        acc.push({x: ax, y: ay});
        joints.push({x: px, y: py});
    }
    // 역방향: fᵢ = mᵢ(aᵢ + g ŷ 보상) = mᵢaᵢ − mᵢg(0,−1). 관절 j 의 토크 = Σ_{i≥j} (pᵢ−jointⱼ)×fᵢ (z성분)
    const forces: Vec[] = masses.map((_, i) => ({
        x: M[i] * acc[i].x,
        y: M[i] * (acc[i].y + G_ACC),
    }));
    const tau = [0, 1, 2].map((j) =>
        forces.reduce((sum, f, i) => {
            if (i < j) return sum;
            const rx = masses[i].x - joints[j].x, ry = masses[i].y - joints[j].y;
            return sum + rx * f.y - ry * f.x;
        }, 0),
    );
    return {joints, masses, acc, forces, tau};
};

interface SceneProps {
    width: number;
    height: number;
}

// 스텝 0~2: 순방향 (링크 1→3 가속도), 3~5: 역방향 (질량 3→1 힘+토크), 6: 결과 τ 전체
const NewtonEulerScene = ({width, height}: SceneProps) => {
    // 큰 모달 캔버스에서는 world 스케일(resolution)도 함께 키운다 (460px 기준 유지).
    const res = RESOLUTION * Math.min(1, 460 / width);
    const colors = useCanvasColors();
    const t = useTr();
    const [step, setStep] = useState(0);
    const [playing, setPlaying] = useState(true);
    const timerRef = useRef<number>();

    const th = [0.9, -0.7, -0.5];
    const dth = [1.2, -0.8, 0.6];
    const ddth = [1.5, 1.0, -1.2];
    const sol = useMemo(() => compute(th, dth, ddth), []);

    useEffect(() => {
        if (!playing) return;
        timerRef.current = window.setInterval(() => setStep((s) => (s + 1) % 8), STEP_MS);
        return () => window.clearInterval(timerRef.current);
    }, [playing]);

    const toPx = (p: Vec) => globalToMap(width, height, p.x, p.y, res);
    const jPx = sol.joints.map(toPx);
    const mPx = sol.masses.map(toPx);
    const scale = 1 / res;

    const fwdActive = (i: number) => step >= i && step <= 6;          // 가속도 화살표 유지
    const bwdActive = (i: number) => step >= 5 - i;                   // i=2 부터 켜짐 (step3)
    const tauActive = (j: number) => step >= 5 - j || step >= 6;

    const phaseLabel = step <= 2
        ? t(`forward pass: link ${step + 1} acceleration`, `순방향 패스: 링크 ${step + 1} 가속도`)
        : step <= 5
            ? t(`backward pass: mass ${6 - step} force → joint torque`, `역방향 패스: 질량 ${6 - step} 힘 → 관절 토크`)
            : t("done: all joint torques known", "완료: 모든 관절 토크 확보");

    // 지금 스텝에서 실제로 계산된 수치를 문장으로 말해 준다.
    const narration = (() => {
        if (step <= 2) {
            const i = step;
            const a = sol.acc[i];
            return t(
                `a${i + 1} = parent's motion + joint ${i + 1}'s θ̇, θ̈ contribution = (${a.x.toFixed(1)}, ${a.y.toFixed(1)}) m/s²`,
                `a${i + 1} = 부모의 운동 + 관절 ${i + 1} 의 θ̇, θ̈ 기여 = (${a.x.toFixed(1)}, ${a.y.toFixed(1)}) m/s²`,
            );
        }
        if (step <= 5) {
            const i = 5 - step;
            const f = sol.forces[i];
            return t(
                `f${i + 1} = m${i + 1}(a${i + 1} − g) = (${f.x.toFixed(1)}, ${f.y.toFixed(1)}) N, its moment joins every joint inboard of it`,
                `f${i + 1} = m${i + 1}(a${i + 1} − g) = (${f.x.toFixed(1)}, ${f.y.toFixed(1)}) N, 이 힘의 모멘트가 안쪽 모든 관절에 더해진다`,
            );
        }
        return t(
            `τ = (${sol.tau.map((v) => v.toFixed(1)).join(", ")}) N·m: the inverse dynamics answer for this (θ, θ̇, θ̈)`,
            `τ = (${sol.tau.map((v) => v.toFixed(1)).join(", ")}) N·m: 이 (θ, θ̇, θ̈) 에 대한 inverse dynamics 의 답`,
        );
    })();

    return (
        <div className="flex flex-col gap-2 items-center" style={{width}}>
            <CoordinateSystem
                width={width}
                height={height}
                resolution={res}
                className="bg-surface border border-border rounded-lg"
            >
                {/* 링크 */}
                {jPx.slice(0, -1).map((p, i) => (
                    <Line key={`l${i}`} points={[p.x, p.y, jPx[i + 1].x, jPx[i + 1].y]}
                          stroke={colors.accent} strokeWidth={5} lineCap="round"
                          opacity={step >= i || step > 2 ? 1 : 0.3}/>
                ))}
                {/* 관절 + 토크 표시 */}
                {jPx.slice(0, -1).map((p, j) => (
                    <Circle key={`j${j}`} x={p.x} y={p.y} radius={6} fill={colors.surface}
                            stroke={tauActive(j) ? TAU_COLOR : colors.text} strokeWidth={2.5}/>
                ))}
                {jPx.slice(0, -1).map((p, j) => tauActive(j) && (
                    <Text key={`tau${j}`} x={p.x - 60} y={p.y + 12}
                          text={`τ${j + 1} = ${sol.tau[j].toFixed(1)}`}
                          fontSize={12} fontStyle="bold" fill={TAU_COLOR}/>
                ))}
                {/* 질량점 */}
                {mPx.map((p, i) => (
                    <Circle key={`m${i}`} x={p.x} y={p.y} radius={7} fill={colors.text}
                            opacity={step >= i ? 1 : 0.3}/>
                ))}
                {/* 순방향: 가속도 화살표 */}
                {mPx.map((p, i) => fwdActive(i) && (
                    <Arrow key={`a${i}`}
                           points={[p.x, p.y,
                               p.x + sol.acc[i].x * scale * 0.045,
                               p.y - sol.acc[i].y * scale * 0.045]}
                           stroke={ACC_COLOR} fill={ACC_COLOR} strokeWidth={2.5}
                           pointerLength={7} pointerWidth={7}/>
                ))}
                {/* 역방향: 질량이 요구하는 힘 화살표 */}
                {mPx.map((p, i) => bwdActive(i) && step >= 3 && (
                    <Arrow key={`f${i}`}
                           points={[p.x, p.y,
                               p.x + sol.forces[i].x * scale * 0.03,
                               p.y - sol.forces[i].y * scale * 0.03]}
                           stroke={FORCE_COLOR} fill={FORCE_COLOR} strokeWidth={2.5}
                           pointerLength={7} pointerWidth={7}/>
                ))}
            </CoordinateSystem>

            <div className="w-full flex flex-col gap-1 text-xs text-muted">
                <div className="text-center tabular-nums">
                    {t("given motion", "주어진 운동")}: θ̇ = ({dth.join(", ")}) rad/s · θ̈ = ({ddth.join(", ")}) rad/s²
                    {" → "}
                    <span className="font-semibold">{t("wanted", "구하려는 것")}: τ = ?</span>
                </div>
                <div className="flex items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={() => setPlaying((p) => !p)}
                        className="px-2.5 py-1 rounded border border-[var(--accent)] text-[var(--accent)] font-semibold"
                    >
                        {playing ? "❚❚ Pause" : "▶ Play"}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setPlaying(false);
                            setStep((s) => (s + 1) % 8);
                        }}
                        className="px-2 py-0.5 rounded border border-border hover:bg-surface"
                    >
                        Step
                    </button>
                    <span className="font-semibold">{phaseLabel}</span>
                </div>
                <div className="text-center tabular-nums">{narration}</div>
                <div className="text-center">
                    <span style={{color: ACC_COLOR}} className="font-semibold">
                        → {t("mass acceleration (forward)", "질량 가속도 (순방향)")}
                    </span>
                    {" · "}
                    <span style={{color: FORCE_COLOR}} className="font-semibold">
                        → {t("required force m(a − g) (backward)", "요구 힘 m(a − g) (역방향)")}
                    </span>
                    {" · "}
                    <span style={{color: TAU_COLOR}} className="font-semibold">
                        ○ {t("joint torque", "관절 토크")}
                    </span>
                </div>
            </div>
        </div>
    );
};

const NewtonEulerPasses = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "Newton–Euler in action: accelerations propagate out (purple), forces collect back in (red), torques appear at each joint",
            "Newton–Euler 실행 장면: 가속도가 밖으로 전파되고 (보라), 힘이 안으로 모이며 (빨강), 관절마다 토크가 나온다",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<NewtonEulerScene {...modalCanvasSize()}/>}
    >
        <NewtonEulerScene width={340} height={340}/>
    </CanvasFigure>;
};

export default NewtonEulerPasses;
