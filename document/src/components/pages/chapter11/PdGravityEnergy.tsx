import {useEffect, useMemo, useRef, useState} from "react";
import {Circle, Layer, Line, Stage, Text} from "react-konva";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";
import {TWO_R, coriolis2R, massMatrix2R} from "../chapter8/twoRModel";

// PD + 중력 보상의 에너지 논증을 8장의 2R 팔로 직접 보여준다. 팔은 흔들리면서 목표로 가지만
// 오차 에너지 V = ½θ̇ᵀMθ̇ + ½θeᵀKpθe 는 한 번도 늘지 않는다 (V̇ = −θ̇ᵀKdθ̇ ≤ 0).
// Kd = 0 으로 두면 V 가 수평선이 되고 팔은 영원히 흔들린다: LaSalle 논증에 Kd > 0 이
// 필요한 이유가 그래프에서 바로 보인다.
const DT = 0.001;
const T_END = 8;
const N_PLOT = 320;
const START: [number, number] = [-1.9, 0.5];
const GOAL: [number, number] = [0.7, 0.9];

interface SimOut {
    q1: number[]; q2: number[]; v: number[]; err: number[];
}

const simulate = (kp: number, kd: number): SimOut => {
    let t1 = START[0], t2 = START[1], d1 = 0, d2 = 0;
    const q1: number[] = [], q2: number[] = [], v: number[] = [], err: number[] = [];
    const steps = Math.round(T_END / DT);
    const stride = Math.round(steps / N_PLOT);
    for (let i = 0; i <= steps; i++) {
        const e1 = GOAL[0] - t1, e2 = GOAL[1] - t2;
        const [m11, m12, m22] = massMatrix2R(t2);
        if (i % stride === 0) {
            q1.push(t1);
            q2.push(t2);
            const kin = 0.5 * (m11 * d1 * d1 + 2 * m12 * d1 * d2 + m22 * d2 * d2);
            v.push(kin + 0.5 * kp * (e1 * e1 + e2 * e2));
            err.push(Math.hypot(e1, e2));
        }
        // τ = Kpθe − Kdθ̇ + g(θ) 를 M(θ)θ̈ + c(θ,θ̇) + g(θ) = τ 에 넣으면 중력이 지워진다.
        const [c1, c2] = coriolis2R(t2, d1, d2);
        const u1 = kp * e1 - kd * d1 - c1;
        const u2 = kp * e2 - kd * d2 - c2;
        const det = m11 * m22 - m12 * m12;
        const a1 = (m22 * u1 - m12 * u2) / det;
        const a2 = (-m12 * u1 + m11 * u2) / det;
        d1 += a1 * DT;
        d2 += a2 * DT;
        t1 += d1 * DT;
        t2 += d2 * DT;
    }
    return {q1, q2, v, err};
};

interface SceneProps {
    panel?: number;
}

const EnergyScene = ({panel = 300}: SceneProps) => {
    const colors = useCanvasColors();
    const t = useTr();
    const [kp, setKp] = useState(25);
    const [kd, setKd] = useState(4);
    const [frame, setFrame] = useState(0);
    const rafRef = useRef<number>();

    const sim = useMemo(() => simulate(kp, kd), [kp, kd]);

    useEffect(() => {
        let start: number | null = null;
        const loop = (ts: number) => {
            if (start === null) start = ts;
            const cycle = (T_END + 1.5) * 1000;
            const el = ((ts - start) % cycle) / 1000;
            setFrame(Math.min(Math.floor((el / T_END) * N_PLOT), N_PLOT));
            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
        return () => {
            if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
        };
    }, [sim]);

    const ARM = panel, PLOT_W = panel, PLOT_H = panel;
    const cx = ARM / 2, cy = ARM * 0.42;
    const S = ARM / 6.2;
    const joints = (t1: number, t2: number) => {
        const x1 = cx + TWO_R.l1 * S * Math.cos(t1), y1 = cy - TWO_R.l1 * S * Math.sin(t1);
        return {
            x1, y1,
            x2: x1 + TWO_R.l2 * S * Math.cos(t1 + t2),
            y2: y1 - TWO_R.l2 * S * Math.sin(t1 + t2),
        };
    };
    const f = Math.min(frame, N_PLOT);
    const now = joints(sim.q1[f], sim.q2[f]);
    const goal = joints(GOAL[0], GOAL[1]);

    const vMax = Math.max(...sim.v) * 1.05;
    const pX = (i: number) => (i / N_PLOT) * PLOT_W;
    const vY = (val: number) => (1 - val / vMax) * (PLOT_H - 24) + 12;
    const eMax = Math.max(...sim.err, 0.01) * 1.1;
    const eY = (val: number) => (1 - val / eMax) * (PLOT_H - 24) + 12;

    const slider = (label: string, val: number, set: (v: number) => void,
                    min: number, max: number, step: number) => (
        <label key={label} className="flex items-center gap-2 text-xs text-muted">
            <span className="w-8 shrink-0">{label}</span>
            <input type="range" min={min} max={max} step={step} value={val}
                   onChange={(e) => set(parseFloat(e.target.value))}
                   className="w-full accent-[var(--accent)]" aria-label={label}/>
            <span className="w-10 shrink-0 text-right tabular-nums">{val.toFixed(1)}</span>
        </label>
    );

    return (
        <div className="flex flex-col gap-2 items-center">
            <div className="flex flex-row flex-wrap gap-3 items-start justify-center">
                <div className="flex flex-col items-center gap-0.5">
                    <Stage width={ARM} height={ARM}
                           className="bg-surface border border-border rounded-lg overflow-hidden">
                        <Layer>
                            {/* 목표 자세 (점선 ghost) */}
                            <Line points={[cx, cy, goal.x1, goal.y1, goal.x2, goal.y2]}
                                  stroke={colors.muted} strokeWidth={4} dash={[7, 6]}
                                  lineCap="round" lineJoin="round"/>
                            <Circle x={goal.x2} y={goal.y2} radius={6} stroke={colors.muted}
                                    strokeWidth={2} dash={[3, 3]}/>
                            {/* 현재 팔 */}
                            <Line points={[cx, cy, now.x1, now.y1]} stroke={colors.accent}
                                  strokeWidth={7} lineCap="round"/>
                            <Line points={[now.x1, now.y1, now.x2, now.y2]} stroke={colors.accent}
                                  strokeWidth={5} lineCap="round"/>
                            <Circle x={cx} y={cy} radius={7} fill={colors.text}/>
                            <Circle x={now.x1} y={now.y1} radius={5} fill={colors.text}/>
                            <Circle x={now.x2} y={now.y2} radius={6} fill={colors.accent}/>
                            <Text x={6} y={6} text={t("2R arm, g ↓", "2R 팔, g ↓")} fontSize={11}
                                  fill={colors.muted}/>
                            <Text x={6} y={ARM - 20}
                                  text={`t = ${((f / N_PLOT) * T_END).toFixed(1)} s`}
                                  fontSize={11} fill={colors.muted}/>
                        </Layer>
                    </Stage>
                    <span className="text-xs text-muted">
                        {t("PD + gravity compensation", "PD + 중력 보상")}
                    </span>
                </div>
                <div className="flex flex-col items-center gap-0.5">
                    <Stage width={PLOT_W} height={PLOT_H}
                           className="bg-surface border border-border rounded-lg overflow-hidden">
                        <Layer>
                            {/* 오차 크기 (배경, 흔들려도 됨) */}
                            <Line points={sim.err.slice(0, f + 1).flatMap((val, i) => [pX(i), eY(val)])}
                                  stroke="#e0a33d" strokeWidth={1.8} opacity={0.65}
                                  lineCap="round" lineJoin="round"/>
                            {/* 에너지 V (주인공, 단조 감소) */}
                            <Line points={sim.v.slice(0, f + 1).flatMap((val, i) => [pX(i), vY(val)])}
                                  stroke={colors.accent} strokeWidth={2.8}
                                  lineCap="round" lineJoin="round"/>
                            <Text x={6} y={6} text={t("V(t): never rises", "V(t): 절대 늘지 않는다")}
                                  fontSize={11} fill={colors.accent}/>
                            <Text x={6} y={20} text={t("|θe|(t): may wiggle", "|θe|(t): 흔들려도 된다")}
                                  fontSize={11} fill="#e0a33d"/>
                        </Layer>
                    </Stage>
                    <span className="text-xs text-muted">
                        V = ½θ̇ᵀMθ̇ + ½θeᵀKpθe
                    </span>
                </div>
            </div>
            <div className="w-full flex flex-col gap-1">
                {slider("Kp", kp, setKp, 5, 60, 1)}
                {slider("Kd", kd, setKd, 0, 15, 0.5)}
            </div>
            <div className="text-xs text-muted text-center tabular-nums">
                {kd === 0
                    ? <span className="font-semibold" style={{color: "#e0533d"}}>
                        {t("Kd = 0: V stays flat, the arm swings forever. LaSalle needs damping.",
                            "Kd = 0: V 가 수평선이 되고 팔은 영원히 흔들린다. LaSalle 논증에는 damping 이 필요하다.")}
                    </span>
                    : <span>
                        {t("V̇ = −θ̇ᵀKdθ̇ ≤ 0 : energy only drains, so the arm must end at θe = 0",
                            "V̇ = −θ̇ᵀKdθ̇ ≤ 0 : 에너지가 새기만 하므로 팔은 θe = 0 에서 끝날 수밖에 없다")}
                    </span>}
            </div>
        </div>
    );
};

const PdGravityEnergy = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "the energy argument, live: joint errors oscillate, but the error energy V only ever goes down. Set Kd = 0 and convergence dies with the damping",
            "에너지 논증 실황: 관절 오차는 출렁이지만 오차 에너지 V 는 내려가기만 한다. Kd = 0 으로 두면 damping 과 함께 수렴도 사라진다",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<EnergyScene panel={Math.floor(modalCanvasSize(2.15).width / 2) - 16}/>}
    >
        <EnergyScene panel={300}/>
    </CanvasFigure>;
};

export default PdGravityEnergy;
