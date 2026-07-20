import {useEffect, useRef, useState} from "react";
import {Arrow, Layer, Line, Rect, Stage, Text} from "react-konva";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";

// Lie bracket 을 몸으로 보여 주는 평행주차. 로봇이 할 수 있는 것은 전후진(g1)과 제자리
// 회전(g2)뿐이고 옆으로 가는 vector field 는 없다. 그런데 g1 → g2 → −g1 → −g2 를 한
// 사이클 돌면 순 이동이 옆 방향으로 생긴다. 이것이 [g1, g2] 방향이고, 크기는 ε² 에
// 비례한다 (ε = 한 구간의 이동량). 사이클을 반복하면 차가 조금씩 옆으로 기어 들어가
// 주차 칸에 들어간다. 옆이동/ε² 이 ε 과 무관하게 거의 일정한 것을 readout 으로 확인해 보라.
const V_SPD = 0.5, W_SPD = 2.0;
const GAP_Y = -0.62;           // 주차 칸의 y (연석 쪽)
const START = {phi: 0, x: -0.18, y: 0.3};

interface SimState {
    phi: number; x: number; y: number;
    running: boolean;
    leg: number;                // 0..3, 4 = 사이클 사이 쉼
    tLeg: number;
    cycleStart: {phi: number; x: number; y: number};
    lastNet: [number, number, number] | null;   // (Δφ, Δx전방, Δy옆) 사이클 시작 몸좌표 기준
    parked: boolean;
    trail: Array<[number, number, number]>;     // (x, y, leg) 실제로 지나간 경로
}

const freshState = (): SimState => ({
    ...START, running: false, leg: 4, tLeg: 0,
    cycleStart: {...START}, lastNet: null, parked: false, trail: [],
});

interface SceneProps {
    panel?: number;
}

const ParkingScene = ({panel = 340}: SceneProps) => {
    const colors = useCanvasColors();
    const t = useTr();
    const [eps, setEps] = useState(0.6);
    const [, setTick] = useState(0);
    const stateRef = useRef<SimState>(freshState());
    const epsRef = useRef(eps);
    epsRef.current = eps;

    useEffect(() => {
        let raf = 0, last: number | null = null;
        const loop = (ts: number) => {
            if (last === null) last = ts;
            const dt = Math.min((ts - last) / 1000, 0.05);
            last = ts;
            const s = stateRef.current;
            const T = epsRef.current;
            if (s.running && !s.parked) {
                s.tLeg += dt;
                // legs: g1(전진) → g2(좌회전) → −g1(후진) → −g2(우회전) → 쉼
                const legDur = s.leg < 4 ? T : 0.35;
                const [v, w] = s.leg === 0 ? [V_SPD, 0]
                    : s.leg === 1 ? [0, W_SPD]
                        : s.leg === 2 ? [-V_SPD, 0]
                            : s.leg === 3 ? [0, -W_SPD] : [0, 0];
                s.phi += w * dt;
                s.x += v * Math.cos(s.phi) * dt;
                s.y += v * Math.sin(s.phi) * dt;
                if (s.leg < 4) {
                    s.trail.push([s.x, s.y, s.leg]);
                    if (s.trail.length > 1200) s.trail.shift();
                }
                if (s.tLeg >= legDur) {
                    s.tLeg = 0;
                    s.leg += 1;
                    if (s.leg === 4) {
                        // 사이클 종료: 순 이동을 사이클 시작 몸좌표로 기록.
                        const c = s.cycleStart;
                        const dx = s.x - c.x, dy = s.y - c.y;
                        s.lastNet = [
                            s.phi - c.phi,
                            dx * Math.cos(c.phi) + dy * Math.sin(c.phi),
                            -dx * Math.sin(c.phi) + dy * Math.cos(c.phi),
                        ];
                        if (s.y <= GAP_Y + 0.17) s.parked = true;
                    }
                    if (s.leg > 4) {
                        s.leg = 0;
                        s.cycleStart = {phi: s.phi, x: s.x, y: s.y};
                    }
                }
            }
            setTick((n) => n + 1);
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, []);

    const s = stateRef.current;
    const W = panel, H = Math.round(panel * 0.8);
    const S = panel / 2.6;
    const sx = (x: number) => W / 2 + x * S;
    const sy = (y: number) => H / 2 - y * S * 0.8;

    const carPoly = (phi: number, x: number, y: number, len = 0.34, wid = 0.16) => {
        const c = Math.cos(phi), si = Math.sin(phi);
        return [
            [len / 2, wid / 2], [len / 2, -wid / 2], [-len / 2, -wid / 2], [-len / 2, wid / 2],
        ].flatMap(([a, b]) => [sx(x + a * c - b * si), sy(y + a * si + b * c)]);
    };

    const legNames = [
        t("g1: forward", "g1: 전진"),
        t("g2: spin left", "g2: 좌회전"),
        t("−g1: backward", "−g1: 후진"),
        t("−g2: spin right", "−g2: 우회전"),
        t("…", "…"),
    ];
    const epsLin = V_SPD * eps, epsAng = W_SPD * eps;
    const ratio = s.lastNet ? Math.abs(s.lastNet[2]) / (epsLin * epsAng) : null;

    const btn = (label: string, onClick: () => void, active = false) => (
        <button key={label} onClick={onClick}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${
                    active
                        ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10"
                        : "border-border text-muted hover:text-[var(--text)]"
                }`}>
            {label}
        </button>
    );

    return (
        <div className="flex flex-col gap-2 items-center">
            <div className="flex flex-row gap-1.5">
                {btn(s.running ? "⏸" : "▶", () => {
                    stateRef.current.running = !stateRef.current.running;
                }, s.running)}
                {btn(t("reset", "처음부터"), () => {
                    stateRef.current = freshState();
                })}
            </div>
            <Stage width={W} height={H}
                   className="bg-surface border border-border rounded-lg overflow-hidden">
                <Layer>
                    {/* 연석과 주차된 차들 */}
                    <Line points={[0, sy(GAP_Y - 0.14), W, sy(GAP_Y - 0.14)]} stroke={colors.text}
                          strokeWidth={2.5}/>
                    <Line points={carPoly(0, -0.75, GAP_Y)} closed fill={colors.text} opacity={0.35}/>
                    <Line points={carPoly(0, 0.75, GAP_Y)} closed fill={colors.text} opacity={0.35}/>
                    {/* 실제로 지나간 경로: 전후진은 파랑, 회전(제자리)은 점으로 남는다 */}
                    {s.trail.length > 1 && (
                        <Line points={s.trail.flatMap(([x, y]) => [sx(x), sy(y)])}
                              stroke={colors.accent} strokeWidth={2} opacity={0.45}
                              lineCap="round" lineJoin="round"/>
                    )}
                    {/* 주차 칸 표시 */}
                    <Rect x={sx(-0.35)} y={sy(GAP_Y + 0.12)} width={sx(0.35) - sx(-0.35)}
                          height={sy(GAP_Y - 0.12) - sy(GAP_Y + 0.12)}
                          stroke={s.parked ? colors.accent : colors.muted} strokeWidth={1.5}
                          dash={[6, 5]}/>
                    {/* 우리 차 */}
                    <Line points={carPoly(s.phi, s.x, s.y)} closed
                          fill={colors.accent} opacity={0.85}
                          stroke={colors.text} strokeWidth={1.5}/>
                    <Arrow points={[
                        sx(s.x + 0.17 * Math.cos(s.phi)), sy(s.y + 0.17 * Math.sin(s.phi)),
                        sx(s.x + 0.28 * Math.cos(s.phi)), sy(s.y + 0.28 * Math.sin(s.phi))]}
                           stroke={colors.text} fill={colors.text} strokeWidth={2}
                           pointerLength={7} pointerWidth={6}/>
                    <Text x={6} y={6}
                          text={s.parked
                              ? t("parked! sideways motion built from forward/backward + spins only",
                                  "주차 완료! 전후진과 회전만으로 옆이동을 만들었다")
                              : `${t("current leg", "지금 구간")}: ${legNames[Math.min(s.leg, 4)]}`}
                          fontSize={11}
                          fill={s.parked ? "var(--accent)" : colors.muted}/>
                </Layer>
            </Stage>
            <div className="w-full flex flex-col gap-1">
                <label className="flex items-center gap-2 text-xs text-muted">
                    <span className="w-6 shrink-0">ε</span>
                    <input type="range" min={0.3} max={1.0} step={0.05} value={eps}
                           onChange={(e) => setEps(parseFloat(e.target.value))}
                           className="w-full accent-[var(--accent)]" aria-label="ε"/>
                    <span className="w-10 shrink-0 text-right tabular-nums">{eps.toFixed(2)}</span>
                </label>
            </div>
            <div className="text-xs text-muted text-center tabular-nums">
                {s.lastNet
                    ? <span>
                        {t("net motion per cycle (in body frame): sideways", "사이클당 순 이동 (몸좌표): 옆")}{" "}
                        <span className="font-semibold" style={{color: "var(--accent)"}}>
                            {s.lastNet[2].toFixed(3)}
                        </span>
                        {" · "}{t("forward", "앞")} {s.lastNet[1].toFixed(3)}
                        {" · "}Δφ {s.lastNet[0].toFixed(3)}
                        {ratio !== null && (
                            <span> · |{t("sideways", "옆")}| / ε² ≈{" "}
                                <span className="font-semibold">{ratio.toFixed(2)}</span>{" "}
                                {t("(approaches a constant as ε shrinks: the O(ε²) law)",
                                    "(ε 을 줄일수록 일정한 값으로 다가간다: O(ε²) 법칙)")}
                            </span>
                        )}
                    </span>
                    : t("press ▶: forward, spin, back, spin. no sideways control exists, yet the car crabs sideways",
                        "▶ 를 눌러 보라. 전진·회전·후진·회전뿐인데 차가 옆으로 기어간다")}
            </div>
        </div>
    );
};

const ParallelParking = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "the Lie bracket as parallel parking: cycling g1, g2, −g1, −g2 produces a net sideways motion of size O(ε²), a direction no control field provides",
            "평행주차로 본 Lie bracket: g1, g2, −g1, −g2 를 한 바퀴 돌면 어떤 control field 에도 없는 옆 방향으로 O(ε²) 만큼 순 이동이 생긴다",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<ParkingScene panel={Math.min(modalCanvasSize(1.25).width, 720)}/>}
    >
        <ParkingScene panel={360}/>
    </CanvasFigure>;
};

export default ParallelParking;
