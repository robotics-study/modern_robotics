import {useEffect, useRef, useState} from "react";
import {Circle, Layer, Line, Rect, Stage, Text} from "react-konva";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";

// 책 예제 12.10, 자로 하는 마술. 두 손가락 위에 자를 얹고 오른손가락만 왼쪽으로 밀면
// 자가 떨어질 것 같지만 절대 떨어지지 않는다. 준정적 분석: 무게가 덜 실린 접촉이 먼저
// 미끄러진다 (같은 μ 면 마찰 한계 μN 이 작으니까). 무게중심에서 먼 손가락이 항상 가벼운
// 쪽이므로 그쪽만 미끄러지고, 무게중심은 손가락 사이를 벗어날 수 없다. 손가락이 만나는
// 지점이 곧 무게중심이다.
const FINGER_SPEED = 7;      // cm/s
const X_L = 10;

interface SimState {
    xr: number;              // 오른손가락 위치 (cm, world)
    stickShift: number;      // 자가 world 에서 밀려간 거리 (왼쪽 +)
    running: boolean;
    done: boolean;
}

const freshState = (): SimState => ({xr: 60, stickShift: 0, running: false, done: false});

interface SceneProps {
    panel?: number;
}

const StickScene = ({panel = 340}: SceneProps) => {
    const colors = useCanvasColors();
    const t = useTr();
    const [com0, setCom0] = useState(50);
    const [, setTick] = useState(0);
    const stateRef = useRef<SimState>(freshState());
    const comRef = useRef(com0);
    comRef.current = com0;

    useEffect(() => {
        let raf = 0, last: number | null = null;
        const loop = (ts: number) => {
            if (last === null) last = ts;
            const dt = Math.min((ts - last) / 1000, 0.05);
            last = ts;
            const s = stateRef.current;
            if (s.running && !s.done) {
                const c = comRef.current - s.stickShift;
                const nl = s.xr - c;          // N_l ∝ 오른손가락까지의 거리
                const nr = c - X_L;           // N_r ∝ 왼손가락까지의 거리
                const dv = FINGER_SPEED * dt;
                if (Math.abs(nl - nr) < 0.75) {
                    // 무게중심이 가운데: 둘 다 미끄러지고 자는 절반 속도로 따라간다.
                    s.stickShift += dv / 2;
                } else if (nl < nr) {
                    // 왼쪽 접촉이 가볍다 → 왼쪽이 미끄러지고 자는 오른손가락에 붙어 간다.
                    s.stickShift += dv;
                }
                // nl > nr 이면 오른쪽이 미끄러지고 자는 제자리.
                s.xr -= dv;
                if (s.xr - X_L < 1.2) {
                    s.done = true;
                    s.running = false;
                }
            }
            setTick((n) => n + 1);
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, []);

    const s = stateRef.current;
    const c = com0 - s.stickShift;                     // 무게중심의 world 위치
    const span = s.xr - X_L;
    const nl = Math.max(0, (s.xr - c) / span);         // 정규화한 수직력
    const nr = Math.max(0, (c - X_L) / span);
    const bothSlip = Math.abs(nl - nr) < 0.02;
    const leftSlips = bothSlip || nl < nr;
    const rightSlips = bothSlip || nl > nr;
    const mode = `${leftSlips ? "Sl" : "R"}${rightSlips ? "Sr" : "R"}`;

    const W = panel, H = Math.round(panel * 0.62);
    const x2px = (x: number) => W * 0.06 + (x + 14) * (W * 0.88) / 128;
    const stickY = H * 0.42;
    const stick0 = -s.stickShift;                      // 자의 0 cm 눈금 world 위치

    const fingerTri = (x: number) => [
        x2px(x), stickY + 8,
        x2px(x) - 9, stickY + 30,
        x2px(x) + 9, stickY + 30,
    ];

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
                    if (!stateRef.current.done) stateRef.current.running = !stateRef.current.running;
                }, s.running)}
                {btn(t("reset", "처음부터"), () => {
                    stateRef.current = freshState();
                })}
            </div>
            <Stage width={W} height={H}
                   className="bg-surface border border-border rounded-lg overflow-hidden">
                <Layer>
                    {/* 자 (0~100 cm) */}
                    <Rect x={x2px(stick0)} y={stickY - 10} width={x2px(stick0 + 100) - x2px(stick0)}
                          height={18} fill="#e0a33d" opacity={0.55} cornerRadius={3}
                          stroke={colors.text} strokeWidth={1.5}/>
                    {Array.from({length: 11}, (_, i) => (
                        <Line key={i}
                              points={[x2px(stick0 + i * 10), stickY - 10, x2px(stick0 + i * 10), stickY - 2]}
                              stroke={colors.text} strokeWidth={1} opacity={0.6}/>
                    ))}
                    {/* 무게중심 */}
                    <Circle x={x2px(c)} y={stickY - 1} radius={6} fill="#e0533d"/>
                    <Text x={x2px(c) - 24} y={stickY - 32}
                          text={t("center of mass", "무게중심")} fontSize={10} fill="#e0533d"/>
                    {/* 손가락 + 접촉 라벨 + 수직력 바 */}
                    {[{x: X_L, label: leftSlips ? "Sl" : "R", n: nl},
                        {x: s.xr, label: rightSlips ? "Sr" : "R", n: nr}].map((f, i) => (
                        <Text key={`l${i}`} x={x2px(f.x) - 8} y={stickY + 34}
                              text={f.label} fontSize={13} fontStyle="bold"
                              fill={f.label === "R" ? "var(--accent)" : "#e0533d"}/>
                    ))}
                    {[{x: X_L, n: nl}, {x: s.xr, n: nr}].map((f, i) => (
                        <Rect key={`b${i}`} x={x2px(f.x) + 12} y={stickY + 30 - f.n * 34}
                              width={7} height={f.n * 34} fill={colors.accent} opacity={0.8}/>
                    ))}
                    <Line points={fingerTri(X_L)} closed fill={colors.text} opacity={0.8}/>
                    <Line points={fingerTri(s.xr)} closed fill={colors.text} opacity={0.8}/>
                    <Text x={6} y={6}
                          text={t("bars = normal forces. the lighter contact slips",
                              "막대 그래프 = 수직력. 가벼운 쪽이 미끄러진다")}
                          fontSize={11} fill={colors.muted}/>
                </Layer>
            </Stage>
            <div className="w-full flex flex-col gap-1">
                <label className="flex items-center gap-2 text-xs text-muted">
                    <span className="w-28 shrink-0">{t("center of mass (cm)", "무게중심 위치 (cm)")}</span>
                    <input type="range" min={30} max={70} step={1} value={com0}
                           onChange={(e) => {
                               setCom0(parseFloat(e.target.value));
                               stateRef.current = freshState();
                           }}
                           className="w-full accent-[var(--accent)]"
                           aria-label={t("center of mass (cm)", "무게중심 위치 (cm)")}/>
                    <span className="w-8 shrink-0 text-right tabular-nums">{com0}</span>
                </label>
            </div>
            <div className="text-xs text-muted text-center tabular-nums">
                {s.done
                    ? <span className="font-semibold" style={{color: "var(--accent)"}}>
                        {t("the fingers met and the stick never fell. they meet right under the center of mass",
                            "손가락이 만날 때까지 자는 떨어지지 않았다. 만난 곳이 바로 무게중심이다")}
                    </span>
                    : <span>
                        {t("contact mode", "접촉 모드")}{" "}
                        <span className="font-semibold" style={{color: "var(--accent)"}}>{mode}</span>
                        {" · "}
                        {t("only the finger farther from the center of mass slips",
                            "무게중심에서 먼 손가락만 미끄러진다")}
                    </span>}
            </div>
        </div>
    );
};

const MeterStickTrick = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "the meter-stick trick: slide the right finger inward and the stick never falls, because the lightly loaded contact always slips first",
            "자 마술: 오른손가락을 안쪽으로 밀어도 자는 절대 떨어지지 않는다. 무게가 덜 실린 접촉이 항상 먼저 미끄러지기 때문이다",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<StickScene panel={Math.min(modalCanvasSize(1.6).width, 800)}/>}
    >
        <StickScene panel={380}/>
    </CanvasFigure>;
};

export default MeterStickTrick;
