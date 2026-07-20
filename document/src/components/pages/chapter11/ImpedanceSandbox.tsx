import {useEffect, useRef, useState} from "react";
import {Circle, Layer, Line, Stage, Text} from "react-konva";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";

// impedance 제어가 "렌더링"하는 가상 역학 M ẍ + B ẋ + K x = f_ext 를 직접 만져 보는 1자유도
// 샌드박스. 카트를 끌고 있는 동안 로봇이 되밀어야 할 힘 f = Kx + Bẋ 를 화살표로 보여주고,
// 놓으면 선택한 M, B, K 대로 자유 응답이 이어진다. 파라미터를 바꾸면 같은 "놓기"가
// 통통 튀기도, 젤리처럼 눌리기도, 무거운 문처럼 밀리다 서기도 한다.
const DT = 0.002;
const HIST_N = 360;
const X_LIM = 1;

interface SimState {
    x: number; v: number;
    dragging: boolean;
    lastPointerX: number | null;
    hist: number[];
}

interface Params {
    m: number; b: number; k: number;
}

const PRESETS: Array<{name: {en: string; ko: string}; m: number; b: number; k: number}> = [
    {name: {en: "bouncy spring", ko: "통통 스프링"}, m: 1, b: 1, k: 100},
    {name: {en: "jelly (overdamped)", ko: "젤리 (overdamped)"}, m: 2, b: 22, k: 30},
    {name: {en: "heavy door (inertia)", ko: "무거운 문 (관성)"}, m: 10, b: 18, k: 8},
    {name: {en: "stiff wall (the hard case)", ko: "뻣뻣한 벽 (어려운 경우)"}, m: 0.5, b: 1, k: 200},
];

interface SceneProps {
    panel?: number;
}

const ImpedanceScene = ({panel = 340}: SceneProps) => {
    const colors = useCanvasColors();
    const t = useTr();
    const [m, setM] = useState(1);
    const [b, setB] = useState(1);
    const [k, setK] = useState(100);
    const [, setTick] = useState(0);

    const stateRef = useRef<SimState>({x: 0.55, v: 0, dragging: false, lastPointerX: null,
        hist: new Array(HIST_N).fill(0.55)});
    const paramsRef = useRef<Params>({m, b, k});
    paramsRef.current = {m, b, k};

    useEffect(() => {
        let raf = 0, last: number | null = null;
        const loop = (ts: number) => {
            if (last === null) last = ts;
            const real = Math.min((ts - last) / 1000, 0.05);
            last = ts;
            const s = stateRef.current;
            const p = paramsRef.current;
            if (!s.dragging) {
                const steps = Math.max(1, Math.round(real / DT));
                for (let i = 0; i < steps; i++) {
                    const a = (-p.k * s.x - p.b * s.v) / p.m;
                    s.v += a * DT;
                    s.x += s.v * DT;
                    if (Math.abs(s.x) > X_LIM) {
                        s.x = Math.sign(s.x) * X_LIM;
                        s.v = 0;
                    }
                }
            }
            s.hist.push(s.x);
            if (s.hist.length > HIST_N) s.hist.shift();
            setTick((n) => n + 1);
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, []);

    const s = stateRef.current;
    const W = panel, H = Math.round(panel * 0.5);
    const cx = W / 2, cy = H * 0.55;
    const scale = (W / 2 - 30) / X_LIM;
    const cartX = cx + s.x * scale;
    // 끌고 있는 동안 로봇이 내야 하는 렌더링 힘.
    const fRender = -(k * s.x + b * s.v);

    const PLOT_H = Math.round(panel * 0.38);
    const hY = (v: number) => (1 - (v + X_LIM) / (2 * X_LIM)) * PLOT_H;

    const zeta = b / (2 * Math.sqrt(k * m));
    const regime = zeta > 1.02 ? "overdamped" : zeta < 0.98 ? "underdamped" : "critically damped";

    // 스프링 zigzag: 앵커(중앙)에서 카트까지.
    const springPts: number[] = [];
    const nZig = 8;
    for (let i = 0; i <= nZig; i++) {
        const px = cx + (cartX - cx) * (i / nZig);
        const py = cy + (i === 0 || i === nZig ? 0 : (i % 2 === 0 ? -10 : 10));
        springPts.push(px, py);
    }

    const slider = (label: string, val: number, set: (v: number) => void,
                    min: number, max: number, step: number) => (
        <label key={label} className="flex items-center gap-2 text-xs text-muted">
            <span className="w-6 shrink-0">{label}</span>
            <input type="range" min={min} max={max} step={step} value={val}
                   onChange={(e) => set(parseFloat(e.target.value))}
                   className="w-full accent-[var(--accent)]" aria-label={label}/>
            <span className="w-10 shrink-0 text-right tabular-nums">{val.toFixed(1)}</span>
        </label>
    );

    return (
        <div className="flex flex-col gap-2 items-center">
            <div className="flex flex-row flex-wrap gap-1.5 justify-center">
                {PRESETS.map((p) => (
                    <button key={p.name.en}
                            onClick={() => {
                                setM(p.m);
                                setB(p.b);
                                setK(p.k);
                            }}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${
                                m === p.m && b === p.b && k === p.k
                                    ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10"
                                    : "border-border text-muted hover:text-[var(--text)]"
                            }`}>
                        {t(p.name.en, p.name.ko)}
                    </button>
                ))}
                <button onClick={() => {
                    const st = stateRef.current;
                    if (!st.dragging) st.v += 3 / paramsRef.current.m;
                }}
                        className="px-2.5 py-1 rounded-md text-xs font-semibold border border-border text-muted hover:text-[var(--text)] transition-colors">
                    {t("poke it", "툭 치기")}
                </button>
            </div>
            <Stage width={W} height={H}
                   className="bg-surface border border-border rounded-lg overflow-hidden">
                <Layer>
                    {/* 트랙과 평형점 */}
                    <Line points={[16, cy + 22, W - 16, cy + 22]} stroke={colors.border} strokeWidth={2}/>
                    <Line points={[cx, cy - 26, cx, cy + 22]} stroke={colors.muted} strokeWidth={1}
                          dash={[4, 4]}/>
                    <Text x={cx + 5} y={cy - 26} text="x = 0" fontSize={10} fill={colors.muted}/>
                    <Line points={springPts} stroke={colors.muted} strokeWidth={2} lineJoin="round"/>
                    {/* 렌더링 힘 화살표 */}
                    {Math.abs(fRender) > 1 && (
                        <Line points={[cartX, cy - 24,
                            cartX + Math.max(-90, Math.min(90, fRender * 0.8)), cy - 24]}
                              stroke="#e0533d" strokeWidth={3.5} lineCap="round"/>
                    )}
                    <Circle x={cartX} y={cy} radius={13 + m} fill={colors.accent}
                            draggable
                            dragBoundFunc={(pos) => ({
                                x: Math.max(cx - X_LIM * scale, Math.min(cx + X_LIM * scale, pos.x)),
                                y: cy,
                            })}
                            onDragStart={() => {
                                s.dragging = true;
                                s.lastPointerX = null;
                            }}
                            onDragMove={(e) => {
                                const px = e.target.x();
                                const nx = (px - cx) / scale;
                                // 드래그 속도를 유한차분으로 추정해 놓는 순간의 초기 속도로 쓴다.
                                if (s.lastPointerX !== null) s.v = (nx - s.x) / (1 / 60);
                                s.lastPointerX = px;
                                s.x = nx;
                            }}
                            onDragEnd={(e) => {
                                s.dragging = false;
                                s.x = (e.target.x() - cx) / scale;
                            }}/>
                    <Text x={6} y={6}
                          text={t("drag the cart and let go, or press poke", "카트를 끌었다 놓거나, 툭 치기를 눌러 보라")}
                          fontSize={11} fill={colors.muted}/>
                    {s.dragging && (
                        <Text x={6} y={H - 20}
                              text={`${t("force the robot renders", "로봇이 만들어 내는 힘")} f = ${fRender.toFixed(1)} N  (${t("spring", "스프링")} ${(-k * s.x).toFixed(1)} + ${t("damper", "댐퍼")} ${(-b * s.v).toFixed(1)})`}
                              fontSize={11} fill="#e0533d"/>
                    )}
                </Layer>
            </Stage>
            <Stage width={W} height={PLOT_H}
                   className="bg-surface border border-border rounded-lg overflow-hidden">
                <Layer>
                    <Line points={[0, hY(0), W, hY(0)]} stroke={colors.border} strokeWidth={1}/>
                    <Line points={s.hist.flatMap((v, i) => [(i / (HIST_N - 1)) * W, hY(v)])}
                          stroke={colors.accent} strokeWidth={2} lineCap="round" lineJoin="round"/>
                    <Text x={6} y={6} text={t("x(t), rolling", "x(t), 흐르는 기록")} fontSize={11}
                          fill={colors.muted}/>
                </Layer>
            </Stage>
            <div className="w-full flex flex-col gap-1">
                {slider("M", m, setM, 0.5, 12, 0.5)}
                {slider("B", b, setB, 0, 30, 0.5)}
                {slider("K", k, setK, 5, 200, 1)}
            </div>
            <div className="text-xs text-muted text-center tabular-nums">
                {regime} · ζ = {zeta.toFixed(2)} · ωn = {Math.sqrt(k / m).toFixed(1)} rad/s
                {" · "}
                {zeta < 0.3
                    ? t("feels bouncy: it rings after you let go", "통통 튀는 느낌: 놓으면 여운이 남는다")
                    : zeta > 1
                        ? t("feels thick: it oozes back with no bounce", "끈적한 느낌: 튀지 않고 스르륵 돌아온다")
                        : t("light bounce, settles quickly", "살짝 튀고 금방 가라앉는다")}
            </div>
        </div>
    );
};

const ImpedanceSandbox = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "impedance control makes the robot feel like a virtual mass-spring-damper: depending on M, B, K the same cart becomes a bouncy spring, jelly, or a heavy door",
            "impedance 제어의 목표는 로봇이 가상 질량-스프링-댐퍼처럼 느껴지게 만드는 것이다. 같은 카트가 M, B, K 에 따라 통통 스프링이 되기도, 젤리가 되기도, 무거운 문이 되기도 한다",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<ImpedanceScene panel={Math.min(modalCanvasSize(0.95).width, 680)}/>}
    >
        <ImpedanceScene panel={340}/>
    </CanvasFigure>;
};

export default ImpedanceSandbox;
