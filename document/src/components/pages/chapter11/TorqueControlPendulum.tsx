import {useEffect, useMemo, useRef, useState} from "react";
import {Circle, Layer, Line, Stage, Text} from "react-konva";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";

// 책 11.4.1 의 단일 관절 그대로: τ = Mθ̈ + mgr·cosθ + bθ̇, M=0.5 kg·m², m=1 kg,
// r=0.1 m, b=0.1 N·m·s/rad. 실험 두 개를 탭으로 나눈다.
//  - setpoint: 아래로 늘어진 팔(−90°)을 수평(0°)까지 들어 올린다. PD 는 중력에 밀려 목표
//    직전에 멈추고, I 를 더하면 끝까지 올라가지만 Ki 가 (b+Kd)Kp/M 을 넘는 순간 발산한다.
//  - tracking: 모델이 무게중심 r 을 잘못 알고 있을 때 세 제어기를 하나씩 골라 비교한다.
const M_IN = 0.5, MASS = 1, R_TRUE = 0.1, B_FR = 0.1, G = 9.81;
const DT = 0.0005;
const T_SET = 6, T_TRK = 5;
const N_PLOT = 300;

type Tab = "setpoint" | "tracking";

// tracking 기준 궤적: −90° 에서 +90° 까지 2.5초 동안 cosine time scaling, 이후 유지.
const trackRef = (time: number) => {
    const T1 = 2.5;
    if (time >= T1) return {th: Math.PI / 2, dth: 0, ddth: 0};
    const s = (Math.PI / T1) * time;
    return {
        th: -Math.PI / 2 + (Math.PI / 2) * (1 - Math.cos(s)),
        dth: (Math.PI / 2) * Math.sin(s) * (Math.PI / T1),
        ddth: (Math.PI / 2) * Math.cos(s) * (Math.PI / T1) ** 2,
    };
};

interface SimOut {
    thetas: number[];
    errs: number[];
}

const integrate = (tEnd: number,
                   controller: (time: number, th: number, dth: number, integ: {v: number}) => number,
                   ref: (time: number) => number): SimOut => {
    let th = -Math.PI / 2, dth = 0;
    const integ = {v: 0};
    const thetas: number[] = [], errs: number[] = [];
    const steps = Math.round(tEnd / DT);
    const stride = Math.round(steps / N_PLOT);
    let dead = false;
    for (let i = 0; i <= steps; i++) {
        const time = i * DT;
        if (i % stride === 0) {
            thetas.push(th);
            errs.push(ref(time) - th);
        }
        if (dead) continue;
        const tau = controller(time, th, dth, integ);
        const ddth = (tau - MASS * G * R_TRUE * Math.cos(th) - B_FR * dth) / M_IN;
        dth += ddth * DT;
        th += dth * DT;
        if (Math.abs(th) > 60 || !Number.isFinite(th)) {
            dead = true;
            th = Math.sign(th) * 60;
            dth = 0;
        }
    }
    return {thetas, errs};
};

interface SceneProps {
    panel?: number;
}

const PendulumScene = ({panel = 320}: SceneProps) => {
    const colors = useCanvasColors();
    const t = useTr();
    const [tab, setTab] = useState<Tab>("setpoint");
    const [sel, setSel] = useState(2);      // tracking 에서 관찰할 제어기
    const [kp, setKp] = useState(10);
    const [ki, setKi] = useState(0);
    const [kd, setKd] = useState(2);
    const [rModel, setRModel] = useState(0.08);
    const [frame, setFrame] = useState(0);
    const rafRef = useRef<number>();

    const tEnd = tab === "setpoint" ? T_SET : T_TRK;

    const sims = useMemo(() => {
        if (tab === "setpoint") {
            const pid = integrate(T_SET, (_time, th, dth, integ) => {
                const e = 0 - th;
                integ.v += e * DT;
                return kp * e + ki * integ.v + kd * (0 - dth);
            }, () => 0);
            return [pid];
        }
        const gravModel = MASS * G * rModel;
        return [
            // ① feedforward 만: 모델이 계산한 토크를 눈 감고 재생한다.
            integrate(T_TRK, (time) => {
                const d = trackRef(time);
                return M_IN * d.ddth + gravModel * Math.cos(d.th) + B_FR * d.dth;
            }, (time) => trackRef(time).th),
            // ② feedback 만: 모델 없이 오차만 보고 쫓아간다.
            integrate(T_TRK, (time, th, dth, integ) => {
                const d = trackRef(time);
                const e = d.th - th;
                integ.v += e * DT;
                return kp * e + ki * integ.v + kd * (d.dth - dth);
            }, (time) => trackRef(time).th),
            // ③ computed torque: 모델로 비선형을 지우고 남은 오차만 PID 에 맡긴다.
            integrate(T_TRK, (time, th, dth, integ) => {
                const d = trackRef(time);
                const e = d.th - th;
                integ.v += e * DT;
                return M_IN * (d.ddth + kp * e + ki * integ.v + kd * (d.dth - dth))
                    + gravModel * Math.cos(th) + B_FR * dth;
            }, (time) => trackRef(time).th),
        ];
    }, [tab, kp, ki, kd, rModel]);

    // 시뮬레이션 결과를 실시간으로 재생한다 (끝나면 1.5초 쉬고 반복).
    useEffect(() => {
        let start: number | null = null;
        const loop = (ts: number) => {
            if (start === null) start = ts;
            const cycle = (tEnd + 1.5) * 1000;
            const el = ((ts - start) % cycle) / 1000;
            setFrame(Math.min(Math.floor((el / tEnd) * N_PLOT), N_PLOT));
            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
        return () => {
            if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
        };
    }, [tEnd, sims]);

    const PEND = panel, PLOT_W = panel, PLOT_H = panel;
    const cx = PEND / 2, cy = PEND / 2, armLen = PEND * 0.36;
    const tipOf = (th: number) => ({
        x: cx + armLen * Math.cos(th),
        y: cy - armLen * Math.sin(th),
    });
    const frameTime = (frame / N_PLOT) * tEnd;
    const targetTh = tab === "setpoint" ? 0 : trackRef(frameTime).th;

    const E_MAX = tab === "setpoint" ? 1.8 : 0.6;
    const pX = (i: number) => (i / N_PLOT) * PLOT_W;
    const eY = (v: number) => (1 - (Math.max(-E_MAX, Math.min(E_MAX, v)) + E_MAX) / (2 * E_MAX)) * PLOT_H;

    const kiBound = (B_FR + kd) * kp / M_IN;
    const unstable = tab === "setpoint" && ki >= kiBound && ki > 0;

    const TRK_META = [
        {color: "#e0a33d", name: t("① feedforward only", "① feedforward 만")},
        {color: "#e0533d", name: t("② feedback only", "② feedback 만")},
        {color: colors.accent, name: "③ computed torque"},
    ];
    const shownSim = tab === "setpoint" ? sims[0] : sims[sel];
    const shownColor = tab === "setpoint" ? colors.accent : TRK_META[sel].color;

    const slider = (label: string, val: number, set: (v: number) => void,
                    min: number, max: number, step: number, fmt: string, warn = false) => (
        <label key={label} className="flex items-center gap-2 text-xs text-muted">
            <span className="w-8 shrink-0">{label}</span>
            <input type="range" min={min} max={max} step={step} value={val}
                   onChange={(e) => set(parseFloat(e.target.value))}
                   className="w-full accent-[var(--accent)]" aria-label={label}/>
            <span className={`w-14 shrink-0 text-right tabular-nums ${warn ? "font-semibold" : ""}`}
                  style={warn ? {color: "#e0533d"} : undefined}>{fmt}</span>
        </label>
    );

    const tabBtn = (tb: Tab, label: string) => (
        <button key={tb} onClick={() => setTab(tb)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${
                    tab === tb
                        ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10"
                        : "border-border text-muted hover:text-[var(--text)]"
                }`}>
            {label}
        </button>
    );

    return (
        <div className="flex flex-col gap-2 items-center">
            <div className="flex flex-row flex-wrap gap-1.5 justify-center">
                {tabBtn("setpoint", t("lift against gravity", "중력을 이기고 들어 올리기"))}
                {tabBtn("tracking", t("follow a trajectory with a wrong model", "틀린 모델로 궤적 따라가기"))}
            </div>
            {tab === "tracking" && (
                <div className="flex flex-row flex-wrap gap-1.5 justify-center">
                    {TRK_META.map((mt, i) => (
                        <button key={mt.name} onClick={() => setSel(i)}
                                className={`px-2 py-0.5 rounded-md text-xs font-semibold border transition-colors ${
                                    sel === i ? "bg-[var(--surface)]" : "opacity-55 hover:opacity-90"
                                }`}
                                style={{borderColor: mt.color, color: mt.color}}>
                            {mt.name}
                        </button>
                    ))}
                </div>
            )}
            <div className="flex flex-row flex-wrap gap-3 items-start justify-center">
                <Stage width={PEND} height={PEND}
                       className="bg-surface border border-border rounded-lg overflow-hidden">
                    <Layer>
                        {/* 목표 자세 (점선) */}
                        <Line points={[cx, cy, tipOf(targetTh).x, tipOf(targetTh).y]}
                              stroke={colors.muted} strokeWidth={3} dash={[7, 6]} lineCap="round"/>
                        {/* 선택한 제어기의 링크 */}
                        <Line points={[cx, cy,
                            tipOf(shownSim.thetas[Math.min(frame, N_PLOT)]).x,
                            tipOf(shownSim.thetas[Math.min(frame, N_PLOT)]).y]}
                              stroke={shownColor} strokeWidth={7} lineCap="round"/>
                        <Circle x={cx} y={cy} radius={7} fill={colors.text}/>
                        <Text x={6} y={6}
                              text={t("g ↓ · dashed = target", "g ↓ · 점선 = 목표 자세")}
                              fontSize={11} fill={colors.muted}/>
                        <Text x={6} y={PEND - 20} text={`t = ${frameTime.toFixed(1)} s`} fontSize={11}
                              fill={colors.muted}/>
                    </Layer>
                </Stage>
                <div className="flex flex-col items-center gap-0.5">
                    <Stage width={PLOT_W} height={PLOT_H}
                           className="bg-surface border border-border rounded-lg overflow-hidden">
                        <Layer>
                            <Line points={[0, eY(0), PLOT_W, eY(0)]} stroke={colors.border} strokeWidth={1}/>
                            {(tab === "setpoint" ? [0] : [0, 1, 2]).map((idx) => (
                                <Line key={idx}
                                      points={sims[idx].errs.slice(0, frame + 1)
                                          .flatMap((v, i) => [pX(i), eY(v)])}
                                      stroke={tab === "setpoint" ? colors.accent : TRK_META[idx].color}
                                      strokeWidth={tab === "setpoint" || idx === sel ? 2.8 : 1.4}
                                      opacity={tab === "setpoint" || idx === sel ? 1 : 0.45}
                                      lineCap="round" lineJoin="round"/>
                            ))}
                            <Text x={6} y={6} text={t("error θe(t)", "오차 θe(t)")} fontSize={11}
                                  fill={colors.muted}/>
                        </Layer>
                    </Stage>
                    <span className="text-xs text-muted">
                        {tab === "tracking"
                            ? t("all three drawn; the selected one is bold", "세 곡선을 겹쳐 그리고, 고른 것만 진하게")
                            : t("same time axis as the animation", "애니메이션과 같은 시간축")}
                    </span>
                </div>
            </div>
            <div className="w-full flex flex-col gap-1">
                {slider("Kp", kp, setKp, 0, 30, 0.5, kp.toFixed(1))}
                {slider("Ki", ki, setKi, 0, 60, 0.5, ki.toFixed(1), unstable)}
                {slider("Kd", kd, setKd, 0, 10, 0.1, kd.toFixed(1))}
                {tab === "tracking" &&
                    slider("r̃", rModel, setRModel, 0.05, 0.15, 0.005, `${(rModel * 100).toFixed(1)} cm`)}
            </div>
            <div className="text-xs text-muted text-center tabular-nums">
                {tab === "setpoint" ? (
                    <span>
                        {unstable
                            ? <span className="font-semibold" style={{color: "#e0533d"}}>
                                {t("diverging: Ki is past the bound", "발산: Ki 가 안정 한계를 넘었다")}
                            </span>
                            : <span>
                                {t("final error", "최종 오차")}{" "}
                                <span className="font-semibold"
                                      style={{color: Math.abs(sims[0].errs[N_PLOT]) > 0.01 ? "#e0533d" : "var(--accent)"}}>
                                    {sims[0].errs[N_PLOT].toFixed(3)} rad
                                </span>
                                {ki === 0 && <span> ({t("theory", "이론값")} mgr/Kp = {(MASS * G * R_TRUE / Math.max(kp, 0.1)).toFixed(3)})</span>}
                            </span>}
                        {" · "}Ki {t("bound", "안정 한계")} (b+Kd)Kp/M = {kiBound.toFixed(1)}
                    </span>
                ) : (
                    <span>
                        {t("the model believes r̃ = ", "모델은 무게중심을 r̃ = ")}
                        <span className="font-semibold">{(rModel * 100).toFixed(1)} cm</span>
                        {t(" (true 10 cm) · max|θe| ", " 로 알고 있다 (실제 10 cm) · max|θe| ")}
                        {sims.map((sm, i) => (
                            <span key={i}>
                                <span className="font-semibold" style={{color: TRK_META[i].color}}>
                                    {["①", "②", "③"][i]} {Math.max(...sm.errs.map(Math.abs)).toFixed(2)}
                                </span>
                                {i < 2 ? " · " : ""}
                            </span>
                        ))}
                    </span>
                )}
            </div>
        </div>
    );
};

const TorqueControlPendulum = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "a single link fighting gravity: PD stalls just short of the goal and PID finishes the lift (until Ki crosses its bound); with the same wrong model, computed torque tracks far better than feedforward or feedback alone",
            "중력을 받는 단일 링크: PD 는 목표 직전에 멈추고 PID 가 마저 들어 올린다 (Ki 가 한계를 넘기 전까지). 같은 틀린 모델이라도 computed torque 가 feedforward 단독·feedback 단독보다 훨씬 잘 따라간다",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<PendulumScene panel={Math.floor(modalCanvasSize(2.15).width / 2) - 16}/>}
    >
        <PendulumScene panel={300}/>
    </CanvasFigure>;
};

export default TorqueControlPendulum;
