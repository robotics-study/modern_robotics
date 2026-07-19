import {useEffect, useRef, useState} from "react";
import {Circle, Line} from "react-konva";
import CoordinateSystem from "../../2d/CoordinateCanvas";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {globalToMap} from "../../../libs/konvaUtils";
import {planarFk} from "../../../libs/planarArm";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";
import {massMatrix2R, TWO_R} from "./twoRModel";

// 2R 팔의 순방향 동역학 실시간 시뮬레이터(이 장의 대표 그림). 책의 점질량 모델을 그대로 쓴다:
// τ = M(θ)θ̈ + c(θ,θ̇) + g(θ) 를 θ̈ = M⁻¹(τ − c − g) 로 풀어 준-암시적(symplectic) Euler 로 적분한다.
// τ=0·중력 on 이면 double pendulum — 에너지는 보존되지만 카오스적이라 초기조건에 민감하다.
const {l1: L1, l2: L2, m1: M1, m2: M2, g: G} = TWO_R;
const RESOLUTION = 0.02;
// 물리를 프레임률과 분리한다: 고정 서브스텝으로 적분하고 프레임 dt 를 클램프해 spiral-of-death 를 막는다.
const SUB_DT = 0.004;
const MAX_FRAME_DT = 0.05;
const MAX_SUBSTEPS = 400;
const TRAIL_MAX = 90;
// 초기 자세: 수직에서 약간 벗어나 있어 중력만으로도 흔들리기 시작한다.
const INIT_THETA: [number, number] = [Math.PI / 2 + 0.4, 0.3];

// 원심(θ̇ᵢ²)·코리올리(θ̇ᵢθ̇ⱼ) 항.
const coriolis = (t2: number, d1: number, d2: number): [number, number] => {
    const s2 = Math.sin(t2);
    return [
        -M2 * L1 * L2 * s2 * (2 * d1 * d2 + d2 * d2),
        M2 * L1 * L2 * d1 * d1 * s2,
    ];
};

// 중력항 g(θ). 중력이 꺼져 있으면 0.
const gravityVec = (t1: number, t2: number, on: boolean): [number, number] => {
    if (!on) return [0, 0];
    const c1 = Math.cos(t1), c12 = Math.cos(t1 + t2);
    return [
        (M1 + M2) * L1 * G * c1 + M2 * G * L2 * c12,
        M2 * G * L2 * c12,
    ];
};

// θ̈ = M⁻¹(τ − c − g). det≈0 이면(수치적 안전장치) 가속도 0 을 반환한다.
const forwardDynamics = (
    theta: [number, number],
    dot: [number, number],
    tau: [number, number],
    gravity: boolean,
): [number, number] => {
    const [m11, m12, m22] = massMatrix2R(theta[1]);
    const [c1, c2] = coriolis(theta[1], dot[0], dot[1]);
    const [g1, g2] = gravityVec(theta[0], theta[1], gravity);
    const r1 = tau[0] - c1 - g1;
    const r2 = tau[1] - c2 - g2;
    const det = m11 * m22 - m12 * m12;
    if (Math.abs(det) < 1e-9) return [0, 0];
    return [(m22 * r1 - m12 * r2) / det, (-m12 * r1 + m11 * r2) / det];
};

const energy = (theta: [number, number], dot: [number, number], gravity: boolean): number => {
    const [m11, m12, m22] = massMatrix2R(theta[1]);
    const ke = 0.5 * (m11 * dot[0] * dot[0] + 2 * m12 * dot[0] * dot[1] + m22 * dot[1] * dot[1]);
    if (!gravity) return ke;
    const {points} = planarFk(theta, [L1, L2]);
    return ke + M1 * G * points[1].y + M2 * G * points[2].y;
};

interface Ctrl {
    tau: [number, number];
    gravity: boolean;
    gravComp: boolean;
}

interface RenderState {
    theta: [number, number];
    dot: [number, number];
}

interface SceneProps {
    width: number;
    height: number;
}

const TwoRScene = ({width, height}: SceneProps) => {
    // 큰 모달 캔버스에서는 world 스케일(resolution)도 함께 키운다 (460px 기준 유지).
    const res = RESOLUTION * Math.min(1, 460 / width);
    const colors = useCanvasColors();
    const t = useTr();
    const [tau, setTau] = useState<[number, number]>([0, 0]);
    const [gravity, setGravity] = useState(true);
    const [gravComp, setGravComp] = useState(false);
    const [running, setRunning] = useState(true);
    const [render, setRender] = useState<RenderState>({theta: [INIT_THETA[0], INIT_THETA[1]], dot: [0, 0]});

    // 물리 상태는 ref 에 두어 프레임마다 setState 없이 적분한다. setState 는 렌더 갱신용으로만 쓴다.
    const thetaRef = useRef<[number, number]>([INIT_THETA[0], INIT_THETA[1]]);
    const dotRef = useRef<[number, number]>([0, 0]);
    const trailRef = useRef<Array<{x: number; y: number}>>([]);
    const rafRef = useRef<number | null>(null);
    const lastRef = useRef<number | null>(null);
    const accRef = useRef(0);

    // 매 렌더마다 최신 컨트롤을 ref 로 넘겨 애니메이션 루프의 stale closure 를 피한다.
    const ctrlRef = useRef<Ctrl>({tau, gravity, gravComp});
    ctrlRef.current = {tau, gravity, gravComp};

    const integrate = (h: number) => {
        const th = thetaRef.current;
        const dq = dotRef.current;
        const {tau: uTau, gravity: gOn, gravComp: comp} = ctrlRef.current;
        // 중력 보상: τ = g(θ) 를 더하면 중력이 상쇄되어 팔이 무중력처럼 뜬다.
        let t1 = uTau[0], t2 = uTau[1];
        if (gOn && comp) {
            const [g1, g2] = gravityVec(th[0], th[1], true);
            t1 += g1;
            t2 += g2;
        }
        const [dd1, dd2] = forwardDynamics(th, dq, [t1, t2], gOn);
        // 준-암시적 Euler: 먼저 속도를 갱신하고 그 속도로 위치를 갱신 → 진자에서 에너지 안정.
        const nd1 = dq[0] + dd1 * h;
        const nd2 = dq[1] + dd2 * h;
        if (!Number.isFinite(nd1) || !Number.isFinite(nd2)) {
            thetaRef.current = [INIT_THETA[0], INIT_THETA[1]];
            dotRef.current = [0, 0];
            trailRef.current = [];
            return;
        }
        dotRef.current = [nd1, nd2];
        thetaRef.current = [th[0] + nd1 * h, th[1] + nd2 * h];
    };

    useEffect(() => {
        if (!running) return;
        lastRef.current = null;
        accRef.current = 0;
        const frame = (now: number) => {
            const last = lastRef.current ?? now;
            lastRef.current = now;
            let frameDt = (now - last) / 1000;
            if (frameDt > MAX_FRAME_DT) frameDt = MAX_FRAME_DT;
            accRef.current += frameDt;
            let steps = 0;
            while (accRef.current >= SUB_DT && steps < MAX_SUBSTEPS) {
                integrate(SUB_DT);
                accRef.current -= SUB_DT;
                steps++;
            }
            const {points} = planarFk(thetaRef.current, [L1, L2]);
            const tip = points[points.length - 1];
            const trail = trailRef.current;
            trail.push({x: tip.x, y: tip.y});
            if (trail.length > TRAIL_MAX) trail.shift();
            setRender({theta: [thetaRef.current[0], thetaRef.current[1]], dot: [dotRef.current[0], dotRef.current[1]]});
            rafRef.current = requestAnimationFrame(frame);
        };
        rafRef.current = requestAnimationFrame(frame);
        return () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        };
    }, [running]);

    const reset = () => {
        thetaRef.current = [INIT_THETA[0], INIT_THETA[1]];
        dotRef.current = [0, 0];
        trailRef.current = [];
        accRef.current = 0;
        lastRef.current = null;
        setRender({theta: [INIT_THETA[0], INIT_THETA[1]], dot: [0, 0]});
    };

    // 이해를 돕는 시나리오 프리셋: 상태를 리셋하고 컨트롤을 한 번에 세팅한다.
    const preset = (nTau: [number, number], nGravity: boolean, nComp: boolean) => {
        reset();
        setTau(nTau);
        setGravity(nGravity);
        setGravComp(nComp);
        setRunning(true);
    };

    const {points} = planarFk(render.theta, [L1, L2]);
    const px = points.map((p) => globalToMap(width, height, p.x, p.y, res));
    const trailPx = trailRef.current.flatMap((p) => {
        const m = globalToMap(width, height, p.x, p.y, res);
        return [m.x, m.y];
    });
    const massRadius = (m: number) => 5 + Math.sqrt(m) * 5;
    const totalE = energy(render.theta, render.dot, gravity);
    // 현재 순간의 관절가속도: 관성 결합을 수치로 보여준다 (τ₂=0 인데 θ̈₂≠0 등).
    const [aNow1, aNow2] = (() => {
        let t1 = tau[0], t2 = tau[1];
        if (gravity && gravComp) {
            const [g1, g2] = gravityVec(render.theta[0], render.theta[1], true);
            t1 += g1;
            t2 += g2;
        }
        return forwardDynamics(render.theta, render.dot, [t1, t2], gravity);
    })();

    const setJointTau = (i: number, v: number) =>
        setTau((prev) => {
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
                {trailPx.length >= 4 && (
                    <Line points={trailPx} stroke={colors.accent} strokeWidth={1.5} opacity={0.3} lineCap="round"/>
                )}
                {px.slice(0, -1).map((p, i) => (
                    <Line key={`link-${i}`} points={[p.x, p.y, px[i + 1].x, px[i + 1].y]}
                          stroke={colors.text} strokeWidth={4} lineCap="round" opacity={0.75}/>
                ))}
                {px.slice(0, -1).map((p, i) => (
                    <Circle key={`joint-${i}`} x={p.x} y={p.y} radius={5} fill={colors.surface}
                            stroke={colors.text} strokeWidth={2}/>
                ))}
                {/* 점질량: 질량 크기에 비례한 반지름의 채워진 원 */}
                <Circle x={px[1].x} y={px[1].y} radius={massRadius(M1)} fill={colors.accent} opacity={0.85}/>
                <Circle x={px[2].x} y={px[2].y} radius={massRadius(M2)} fill={colors.accent} opacity={0.85}/>
            </CoordinateSystem>
            <div className="w-full flex flex-col gap-1 text-xs text-muted">
                {/* 시나리오 프리셋: 무엇을 보라는 건지 이름으로 말해 준다 */}
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                    <button type="button" onClick={() => preset([0, 0], true, false)}
                            className="px-2 py-0.5 rounded border border-border hover:bg-surface">
                        {t("① drop it (double pendulum)", "① 놓아 보기 (이중 진자)")}
                    </button>
                    <button type="button" onClick={() => preset([0, 0], true, true)}
                            className="px-2 py-0.5 rounded border border-border hover:bg-surface">
                        {t("② gravity comp. (floats)", "② 중력 보상 (뜬다)")}
                    </button>
                    <button type="button" onClick={() => preset([5, 0], true, true)}
                            className="px-2 py-0.5 rounded border border-border hover:bg-surface">
                        {t("③ push joint 1 only", "③ 관절 1만 밀기")}
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setRunning((r) => !r)}
                            className="px-3 py-1 rounded-md bg-[var(--accent)] text-white font-semibold">
                        {running ? "Pause" : "Play"}
                    </button>
                    <button type="button" onClick={reset}
                            className="px-3 py-1 rounded-md border border-border">
                        Reset
                    </button>
                    <label className="flex items-center gap-1.5 cursor-pointer ml-auto">
                        <input type="checkbox" checked={gravity}
                               onChange={(e) => setGravity(e.target.checked)}
                               className="accent-[var(--accent)]"/>
                        <span>{t("gravity", "중력")}</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer"
                           style={{opacity: gravity ? 1 : 0.4}}>
                        <input type="checkbox" checked={gravComp} disabled={!gravity}
                               onChange={(e) => setGravComp(e.target.checked)}
                               className="accent-[var(--accent)]"/>
                        <span>{t("grav. comp.", "중력 보상")}</span>
                    </label>
                </div>
                {[0, 1].map((i) => (
                    <label key={i} className="flex items-center gap-2">
                        <span className="w-8 shrink-0">τ{i + 1}</span>
                        <input
                            type="range"
                            min={-20}
                            max={20}
                            step={0.5}
                            value={tau[i]}
                            onChange={(e) => setJointTau(i, parseFloat(e.target.value))}
                            className="w-full accent-[var(--accent)]"
                            aria-label={`joint torque tau ${i + 1}`}
                        />
                        <span className="w-14 shrink-0 text-right tabular-nums">{tau[i].toFixed(1)} N·m</span>
                    </label>
                ))}
                <div className="text-center pt-1 tabular-nums">
                    {running
                        ? <span className="text-[var(--accent)] font-semibold">{t("running", "실행 중")}</span>
                        : <span>{t("paused", "일시정지")}</span>}{" "}
                    · E = {totalE.toFixed(2)} J
                    {" · "}θ̈ = ({aNow1.toFixed(1)}, {aNow2.toFixed(1)})
                </div>
                {tau[0] !== 0 && tau[1] === 0 && Math.abs(aNow2) > 0.05 && (
                    <div className="text-center font-semibold" style={{color: "var(--accent)"}}>
                        {t("coupling: τ₂ = 0, yet θ̈₂ ≠ 0 (off-diagonal M₁₂ at work)",
                            "결합: τ₂ = 0 인데 θ̈₂ ≠ 0 (비대각 M₁₂ 가 하는 일)")}
                    </div>
                )}
            </div>
        </div>
    );
};

const TwoRDynamics = () => {
    const t = useTr();
    return <CanvasFigure
        label={t("forward dynamics · a 2R arm as a double pendulum", "Forward Dynamics · 이중 진자로서의 2R 팔")}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<TwoRScene {...modalCanvasSize()}/>}
    >
        <TwoRScene width={320} height={320}/>
    </CanvasFigure>;
};

export default TwoRDynamics;
