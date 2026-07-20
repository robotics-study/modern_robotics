import {useMemo, useState} from "react";
import {Layer, Line, Stage, Text} from "react-konva";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";

// 속도 입력 1관절이 ramp 기준 θd(t) = c·t 를 쫓는 시뮬레이션. 제어기는 명령 속도를 그대로
// 관절 속도로 만든다고 가정하므로 (θ̇ = 명령), 오차 동역학은 P 면 1차, PI 면 2차가 된다.
// P 는 c/Kp 만큼 뒤처진 채 따라가고, PI 는 그 잔여 오차를 0 으로 지우며, feedforward 를
// 더하면 처음부터 기준 속도를 아는 채로 출발한다.
const C_RAMP = 0.5;
const THETA0 = -0.3;
const T_END = 3;
const DT = 0.001;
const N_PLOT = 300;

type Mode = "P" | "PI" | "FF+PI";
const MODES: Mode[] = ["P", "PI", "FF+PI"];

const simulate = (mode: Mode, kp: number, ki: number) => {
    let theta = THETA0, integ = 0;
    const thetas: number[] = [], errs: number[] = [];
    const stride = Math.round(T_END / DT / N_PLOT);
    for (let i = 0; i <= T_END / DT; i++) {
        const time = i * DT;
        const thetaD = C_RAMP * time;
        const err = thetaD - theta;
        if (i % stride === 0) {
            thetas.push(theta);
            errs.push(err);
        }
        const useI = mode !== "P" ? ki : 0;
        const ff = mode === "FF+PI" ? C_RAMP : 0;
        integ += err * DT;
        theta += (ff + kp * err + useI * integ) * DT;
    }
    return {thetas, errs, ess: errs[errs.length - 1]};
};

interface SceneProps {
    panel?: number;
}

const VelocityScene = ({panel = 300}: SceneProps) => {
    const colors = useCanvasColors();
    const t = useTr();
    const [mode, setMode] = useState<Mode>("P");
    const [kp, setKp] = useState(10);
    const [ki, setKi] = useState(100);

    const {thetas, errs, ess} = useMemo(() => simulate(mode, kp, ki), [mode, kp, ki]);

    // 위 패널: θ(t) 와 θd(t), 아래 패널: θe(t).
    const H_TOP = Math.round(panel * 0.62), H_BOT = Math.round(panel * 0.38);
    const TH_MIN = -0.4, TH_MAX = C_RAMP * T_END + 0.2;
    const pX = (i: number) => (i / (thetas.length - 1)) * panel;
    const tY = (v: number) => (1 - (v - TH_MIN) / (TH_MAX - TH_MIN)) * H_TOP;
    const E_MAX = 0.45;
    const eY = (v: number) => (1 - (v + E_MAX) / (2 * E_MAX)) * H_BOT;

    // PI 오차 동역학 θ̈e + Kp θ̇e + Ki θe = 0 의 감쇠비. 상태줄에서 근의 위치를 알려준다.
    const zeta = ki > 0 ? kp / (2 * Math.sqrt(ki)) : Infinity;
    const regime = mode === "P"
        ? t("1st-order decay toward θe = c/Kp", "1차 감쇠, θe → c/Kp 로 수렴")
        : zeta > 1.02 ? "overdamped" : zeta < 0.98 ? "underdamped" : "critically damped";

    const slider = (label: string, val: number, set: (v: number) => void,
                    min: number, max: number, step: number, dis: boolean) => (
        <label key={label}
               className={`flex items-center gap-2 text-xs text-muted ${dis ? "opacity-40" : ""}`}>
            <span className="w-8 shrink-0">{label}</span>
            <input type="range" min={min} max={max} step={step} value={val} disabled={dis}
                   onChange={(e) => set(parseFloat(e.target.value))}
                   className="w-full accent-[var(--accent)]" aria-label={label}/>
            <span className="w-10 shrink-0 text-right tabular-nums">{val.toFixed(0)}</span>
        </label>
    );

    return (
        <div className="flex flex-col gap-2 items-center">
            <div className="flex flex-row gap-1.5">
                {MODES.map((m) => (
                    <button key={m} onClick={() => setMode(m)}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${
                                mode === m
                                    ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10"
                                    : "border-border text-muted hover:text-[var(--text)]"
                            }`}>
                        {m === "FF+PI" ? "Feedforward + PI" : m}
                    </button>
                ))}
            </div>
            <div className="flex flex-col gap-1.5">
                <Stage width={panel} height={H_TOP}
                       className="bg-surface border border-border rounded-lg overflow-hidden">
                    <Layer>
                        <Line points={[0, tY(0), panel, tY(0)]} stroke={colors.border} strokeWidth={1}/>
                        {/* 기준 ramp θd */}
                        <Line points={thetas.map((_, i) =>
                            [pX(i), tY(C_RAMP * (i / (thetas.length - 1)) * T_END)]).flat()}
                              stroke={colors.muted} strokeWidth={1.5} dash={[6, 5]}/>
                        <Line points={thetas.flatMap((v, i) => [pX(i), tY(v)])}
                              stroke={colors.accent} strokeWidth={2.5} lineCap="round" lineJoin="round"/>
                        <Text x={6} y={6} text={t("θ(t) vs θd(t) (dashed ramp)", "θ(t) 와 θd(t) (점선 ramp)")}
                              fontSize={11} fill={colors.muted}/>
                    </Layer>
                </Stage>
                <Stage width={panel} height={H_BOT}
                       className="bg-surface border border-border rounded-lg overflow-hidden">
                    <Layer>
                        <Line points={[0, eY(0), panel, eY(0)]} stroke={colors.border} strokeWidth={1}/>
                        {mode === "P" && (
                            <Line points={[0, eY(C_RAMP / kp), panel, eY(C_RAMP / kp)]}
                                  stroke="#e0533d" strokeWidth={1} dash={[4, 4]}/>
                        )}
                        <Line points={errs.flatMap((v, i) => [pX(i), eY(v)])}
                              stroke="#e0533d" strokeWidth={2.5} lineCap="round" lineJoin="round"/>
                        <Text x={6} y={6} text={t("error θe(t)", "오차 θe(t)")} fontSize={11}
                              fill={colors.muted}/>
                        {mode === "P" && (
                            <Text x={panel - 92} y={eY(C_RAMP / kp) - 14} text={`c/Kp = ${(C_RAMP / kp).toFixed(3)}`}
                                  fontSize={10} fill="#e0533d"/>
                        )}
                    </Layer>
                </Stage>
            </div>
            <div className="w-full flex flex-col gap-1">
                {slider("Kp", kp, setKp, 1, 40, 1, false)}
                {slider("Ki", ki, setKi, 0, 400, 5, mode === "P")}
            </div>
            <div className="text-xs text-muted text-center tabular-nums">
                {regime}
                {mode !== "P" && Number.isFinite(zeta) && <span> · ζ = {zeta.toFixed(2)}</span>}
                {" · "}
                {t("final error", "최종 오차")}{" "}
                <span className="font-semibold"
                      style={{color: Math.abs(ess) > 0.005 ? "#e0533d" : "var(--accent)"}}>
                    {ess.toFixed(3)}
                </span>
            </div>
        </div>
    );
};

const VelocityControlSim = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "P control chases the ramp with a constant lag c/Kp; adding I erases it; too much Ki brings overshoot",
            "P 제어는 ramp 를 c/Kp 만큼 뒤처진 채 쫓아간다. I 를 더하면 그 오차가 사라지고, Ki 가 지나치면 overshoot 가 생긴다",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<VelocityScene panel={Math.min(modalCanvasSize(1.1).width, 720)}/>}
    >
        <VelocityScene panel={330}/>
    </CanvasFigure>;
};

export default VelocityControlSim;
