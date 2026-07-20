import {useEffect, useRef, useState} from "react";
import {Circle, Layer, Line, Rect, Stage, Text} from "react-konva";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";

// 로봇 손끝으로 저울을 눌러서 눈금이 정확히 Fd 를 가리키게 만드는 시뮬레이션.
// 함정: 손끝에는 모델이 모르는 2 N 짜리 공구가 달려 있다.
//  - "눈금 안 보고 누르기": feedforward 로 Fd 만큼 누른다. 공구 무게 2 N 이 눈금에 그대로
//    더해져도 알아챌 방법이 없다.
//  - "눈금 보며 조절": PI 피드백이 눈금과 목표의 차이를 보고 적분기로 밀어낸다. 눈금이
//    Fd 에 정확히 붙는다.
// "저울이 갑자기 낮아짐" 버튼은 외란이다. 눈금이 뚝 떨어졌다가 어떻게 회복되는지 두 모드에서
// 비교해 보라.
const MASS = 1;
const K_ENV = 800;
const W_TOOL = 2;      // 모델이 모르는 공구 무게 (N)
const DT = 0.002;
const HIST_T = 8;
const HIST_N = 400;
const F_MAX = 25;      // 플롯/눈금 상한

type Mode = "ff" | "ffpi";

interface SimState {
    x: number; dx: number; plateY: number; integ: number; time: number;
    hist: number[];
}

const freshState = (): SimState => ({
    x: 0.497, dx: 0, plateY: 0.5, integ: 0, time: 0, hist: new Array(HIST_N).fill(0),
});

interface SceneProps {
    panel?: number;
}

const ForceScene = ({panel = 340}: SceneProps) => {
    const colors = useCanvasColors();
    const t = useTr();
    const [mode, setMode] = useState<Mode>("ff");
    const [fd, setFd] = useState(10);
    const [kfi, setKfi] = useState(60);
    const [, setTick] = useState(0);

    const stateRef = useRef<SimState>(freshState());
    const paramsRef = useRef({mode, fd, kfi});
    paramsRef.current = {mode, fd, kfi};

    useEffect(() => {
        stateRef.current = freshState();
    }, [mode]);

    useEffect(() => {
        let raf = 0, last: number | null = null;
        const loop = (ts: number) => {
            if (last === null) last = ts;
            const real = Math.min((ts - last) / 1000, 0.05);
            last = ts;
            const s = stateRef.current;
            const p = paramsRef.current;
            const steps = Math.max(1, Math.round(real / DT));
            for (let i = 0; i < steps; i++) {
                const pen = Math.max(0, s.x - s.plateY);
                const fc = K_ENV * pen;
                const fe = p.fd - fc;
                let u = p.fd - 30 * s.dx;
                if (p.mode === "ffpi") {
                    s.integ += fe * DT;
                    s.integ = Math.max(-3, Math.min(3, s.integ));
                    u += 3 * fe + p.kfi * s.integ;
                }
                // 아래로 누르는 방향이 +x. 공구 무게는 실제 힘에는 들어가지만 모델(u)에는 없다.
                s.dx += ((u + W_TOOL - fc) / MASS) * DT;
                s.x = Math.max(0.2, Math.min(s.plateY + 0.05, s.x + s.dx * DT));
                s.time += DT;
                if (Math.round(s.time / DT) % Math.round(HIST_T / DT / HIST_N) === 0) {
                    s.hist.push(fc);
                    if (s.hist.length > HIST_N) s.hist.shift();
                }
            }
            setTick((n) => n + 1);
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, []);

    const s = stateRef.current;
    const W = panel, H = Math.round(panel * 0.62);
    const fNow = K_ENV * Math.max(0, s.x - s.plateY);
    const err = fNow - fd;
    const onTarget = Math.abs(err) < fd * 0.08;

    // 저울: 아래 몸통(디지털 눈금 포함) + 위 접시. 눌린 깊이는 과장해 그린다.
    const groundY = H * 0.9;
    const bodyH = H * 0.22, bodyW = W * 0.44, bodyX = W * 0.5 - bodyW / 2;
    const bodyY = groundY - bodyH;
    const plateSag = Math.min(26, fNow * 1.8) + (s.plateY - 0.5) * 700;
    const plateY = bodyY - 26 + plateSag;
    const fingerW = 16;

    const PLOT_H = Math.round(panel * 0.4);
    const fY = (v: number) => (1 - Math.max(0, Math.min(F_MAX, v)) / F_MAX) * (PLOT_H - 18) + 9;

    const unstable = s.time > 2 && s.hist.slice(-60).some((v) => v > fd * 2 || v < fd * 0.05)
        && mode === "ffpi";

    const slider = (label: string, val: number, set: (v: number) => void,
                    min: number, max: number, step: number, dis: boolean) => (
        <label key={label}
               className={`flex items-center gap-2 text-xs text-muted ${dis ? "opacity-40" : ""}`}>
            <span className="w-8 shrink-0">{label}</span>
            <input type="range" min={min} max={max} step={step} value={val} disabled={dis}
                   onChange={(e) => set(parseFloat(e.target.value))}
                   className="w-full accent-[var(--accent)]" aria-label={label}/>
            <span className="w-12 shrink-0 text-right tabular-nums">{val.toFixed(0)}{label === "Fd" ? " N" : ""}</span>
        </label>
    );

    const modeBtn = (m: Mode, label: string) => (
        <button key={m} onClick={() => setMode(m)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${
                    mode === m
                        ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10"
                        : "border-border text-muted hover:text-[var(--text)]"
                }`}>
            {label}
        </button>
    );

    return (
        <div className="flex flex-col gap-2 items-center">
            <div className="flex flex-row flex-wrap gap-1.5 justify-center">
                {modeBtn("ff", t("press blind (feedforward)", "눈금 안 보고 누르기 (feedforward)"))}
                {modeBtn("ffpi", t("watch the dial and adjust (+ PI)", "눈금 보며 조절 (+ PI)"))}
                <button onClick={() => {
                    stateRef.current.plateY = stateRef.current.plateY >= 0.51 ? 0.5 : 0.512;
                }}
                        className="px-2.5 py-1 rounded-md text-xs font-semibold border border-border text-muted hover:text-[var(--text)] transition-colors">
                    {t("bump the scale", "저울을 툭 건드림")}
                </button>
            </div>
            <Stage width={W} height={H}
                   className="bg-surface border border-border rounded-lg overflow-hidden">
                <Layer>
                    {/* 바닥과 저울 몸통 */}
                    <Line points={[W * 0.12, groundY, W * 0.88, groundY]} stroke={colors.text}
                          strokeWidth={2.5}/>
                    <Rect x={bodyX} y={bodyY} width={bodyW} height={bodyH} fill={colors.text}
                          opacity={0.12} cornerRadius={8}/>
                    <Rect x={bodyX} y={bodyY} width={bodyW} height={bodyH} stroke={colors.text}
                          strokeWidth={1.5} cornerRadius={8}/>
                    {/* 디지털 눈금 */}
                    <Rect x={W * 0.5 - 44} y={bodyY + bodyH * 0.24} width={88} height={bodyH * 0.52}
                          fill={colors.text} opacity={0.85} cornerRadius={4}/>
                    <Text x={W * 0.5 - 44} y={bodyY + bodyH * 0.36} width={88} align="center"
                          text={`${fNow.toFixed(1)} N`} fontSize={15} fontStyle="bold"
                          fill={onTarget ? "#7ef0c0" : "#ff9d8a"}/>
                    {/* 접시 (눌리면 내려간다) */}
                    <Rect x={W * 0.5 - bodyW * 0.56} y={plateY} width={bodyW * 1.12} height={7}
                          fill={colors.text} opacity={0.8} cornerRadius={3}/>
                    <Line points={[W * 0.5 - 20, plateY + 7, W * 0.5 - 8, bodyY + 3]}
                          stroke={colors.muted} strokeWidth={2}/>
                    <Line points={[W * 0.5 + 20, plateY + 7, W * 0.5 + 8, bodyY + 3]}
                          stroke={colors.muted} strokeWidth={2}/>
                    {/* 로봇 손끝 */}
                    <Rect x={W * 0.5 - fingerW / 2} y={0} width={fingerW} height={plateY - 8}
                          fill={colors.accent} cornerRadius={6}/>
                    <Circle x={W * 0.5} y={plateY - 4} radius={9} fill={colors.accent}/>
                    {/* 공구 무게 */}
                    <Rect x={W * 0.5 + fingerW / 2 + 4} y={plateY * 0.45} width={22} height={26}
                          fill="#e0a33d" opacity={0.9} cornerRadius={4}/>
                    <Text x={W * 0.5 + fingerW / 2 + 30} y={plateY * 0.45 + 6}
                          text={t("tool the model ignores (+2 N)", "모델이 모르는 공구 (+2 N)")}
                          fontSize={10} fill="#e0a33d"/>
                    {/* 목표 */}
                    <Text x={12} y={10}
                          text={t(`goal: make the dial read ${fd.toFixed(0)} N`,
                              `목표: 눈금이 ${fd.toFixed(0)} N 을 가리키게 누르기`)}
                          fontSize={12} fill={colors.muted}/>
                </Layer>
            </Stage>
            <Stage width={W} height={PLOT_H}
                   className="bg-surface border border-border rounded-lg overflow-hidden">
                <Layer>
                    <Line points={[0, fY(0), W, fY(0)]} stroke={colors.border} strokeWidth={1}/>
                    <Line points={[0, fY(fd), W, fY(fd)]} stroke={colors.muted} strokeWidth={1.5}
                          dash={[6, 5]}/>
                    <Text x={4} y={fY(fd) - 15} text={t(`goal ${fd.toFixed(0)} N`, `목표 ${fd.toFixed(0)} N`)}
                          fontSize={10} fill={colors.muted}/>
                    <Line points={s.hist.flatMap((v, i) => [(i / (HIST_N - 1)) * W, fY(v)])}
                          stroke="#e0533d" strokeWidth={2.5} lineCap="round" lineJoin="round"/>
                    <Text x={6} y={6} text={t("dial reading over time", "눈금이 시간에 따라 움직인 기록")}
                          fontSize={11} fill={colors.muted}/>
                </Layer>
            </Stage>
            <div className="w-full flex flex-col gap-1">
                {slider("Fd", fd, setFd, 2, 20, 1, false)}
                {slider("Kfi", kfi, setKfi, 0, 150, 5, mode === "ff")}
            </div>
            <div className="text-xs text-muted text-center tabular-nums">
                {t("dial", "눈금")}{" "}
                <span className="font-semibold"
                      style={{color: onTarget ? "var(--accent)" : "#e0533d"}}>
                    {fNow.toFixed(1)} N
                </span>
                {" / "}{t("goal", "목표")} {fd.toFixed(0)} N
                {mode === "ff" && s.time > 2 && Math.abs(err - W_TOOL) < 0.6 && (
                    <span> · {t("off by exactly the tool's 2 N", "공구 무게 2 N 만큼 정확히 초과")}</span>
                )}
                {unstable && (
                    <span className="font-semibold" style={{color: "#e0533d"}}>
                        {" · "}{t("Kfi too high: the loop is ringing", "Kfi 가 너무 크다: 루프가 울리고 있다")}
                    </span>
                )}
                <div>
                    {mode === "ff"
                        ? t("feedforward never looks at the dial, so it cannot notice the extra 2 N",
                            "feedforward 는 눈금을 보지 않으므로, 더해진 2 N 을 알아챌 방법이 없다")
                        : t("the integrator keeps trimming until the dial matches the goal exactly",
                            "적분기가 눈금과 목표가 정확히 같아질 때까지 계속 다듬는다")}
                </div>
            </div>
        </div>
    );
};

const ForceControlSim = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "force control on a scale: pressing blind leaves the unmodeled 2 N on the dial, watching the dial with PI removes it",
            "저울로 본 force 제어: 눈금을 안 보고 누르면 모델에 없던 2 N 이 눈금에 그대로 남고, 눈금을 보며 PI 로 조절하면 사라진다",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<ForceScene panel={Math.min(modalCanvasSize(0.95).width, 680)}/>}
    >
        <ForceScene panel={340}/>
    </CanvasFigure>;
};

export default ForceControlSim;
