import {useEffect, useMemo, useRef, useState} from "react";
import {Circle, Layer, Line, Stage, Text} from "react-konva";
import CanvasFigure from "../../CanvasFigure";
import {useCanvasColors, type CanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";

// 시간 스케일링 s(t) 세 종류(cubic·quintic·trapezoidal)를 s, ṡ, s̈ 세 그래프로 비교한다.
// Play 를 누르면 path θ(s) 위의 점이 s(t) 속도로 움직여, cubic/quintic 은 가운데서 빠르고
// trapezoidal 은 등속 coast 구간을 가진다는 차이를 눈으로 보게 한다.
type Profile = "cubic" | "quintic" | "trapezoidal";

interface Sample {
    s: number;
    sd: number;
    sdd: number;
}

const sampleCubic = (T: number, t: number): Sample => {
    const u = t / T;
    return {
        s: 3 * u * u - 2 * u * u * u,
        sd: 6 * t / (T * T) - 6 * t * t / (T * T * T),
        sdd: 6 / (T * T) - 12 * t / (T * T * T),
    };
};

const sampleQuintic = (T: number, t: number): Sample => {
    const T3 = T ** 3, T4 = T ** 4, T5 = T ** 5;
    return {
        s: 10 * (t / T) ** 3 - 15 * (t / T) ** 4 + 6 * (t / T) ** 5,
        sd: 30 * t * t / T3 - 60 * t ** 3 / T4 + 30 * t ** 4 / T5,
        sdd: 60 * t / T3 - 180 * t * t / T4 + 120 * t ** 3 / T5,
    };
};

interface TrapParams {
    a: number;      // 가·감속 크기
    ta: number;     // 가속(및 감속) 구간 길이
    v: number;      // coast 속도
    triangular: boolean;
}

// 삼각형(bang-bang) 프로파일: coast 가 사라진 극단. s(T)=1 을 만족하는 대칭 가·감속.
const triangular = (T: number): TrapParams => ({a: 4 / (T * T), ta: T / 2, v: 2 / T, triangular: true});

// v, T (vT>1) 로부터 a=v²/(vT−1) 를 풀어 s(T)=1 이 되게 한다. coast 가 남지 않으면 삼각형으로 강등.
const trapParams = (T: number, v: number): TrapParams => {
    const vT = v * T;
    if (vT <= 1) return triangular(T);
    const a = (v * v) / (v * T - 1);
    const ta = v / a;
    if (ta >= T / 2) return triangular(T);
    return {a, ta, v, triangular: false};
};

const sampleTrap = (T: number, p: TrapParams, t: number): Sample => {
    const {a, ta, v} = p;
    if (t <= ta) return {s: 0.5 * a * t * t, sd: a * t, sdd: a};
    if (t <= T - ta) return {s: v * t - v * v / (2 * a), sd: v, sdd: 0};
    return {s: (2 * a * v * T - 2 * v * v - a * a * (t - T) * (t - T)) / (2 * a), sd: a * (T - t), sdd: -a};
};

const makeSampler = (profile: Profile, T: number, v: number): {fn: (t: number) => Sample; trap: TrapParams} => {
    const trap = trapParams(T, v);
    if (profile === "cubic") return {fn: (t) => sampleCubic(T, t), trap};
    if (profile === "quintic") return {fn: (t) => sampleQuintic(T, t), trap};
    return {fn: (t) => sampleTrap(T, trap, t), trap};
};

interface Pt {
    t: number;
    y: number;
}

interface Series {
    pts: Pt[];
    color: string;
    width: number;
    dash?: number[];
}

interface MiniPlotProps {
    width: number;
    height: number;
    T: number;
    series: Series[];
    label: string;
    colors: CanvasColors;
    markerT: number | null;
    markerValue: number | null;
}

// 원점이 화면 중앙인 CoordinateSystem 은 부호 있는 y-범위 그래프에 맞지 않아, 여기서는
// 좌하단 원점의 선형 축을 직접 만든다: 데이터(t,y) → 패딩된 사각형 안의 픽셀로 매핑.
const MiniPlot = ({width, height, T, series, label, colors, markerT, markerValue}: MiniPlotProps) => {
    const padL = 34, padR = 10, padT = 14, padB = 16;
    const allY = series.flatMap((s) => s.pts.map((p) => p.y));
    let yMin = Math.min(0, ...allY);
    let yMax = Math.max(0, ...allY);
    if (yMax - yMin < 1e-9) yMax = yMin + 1;
    const pad = (yMax - yMin) * 0.12;
    yMin -= pad;
    yMax += pad;

    const toX = (t: number) => padL + (t / T) * (width - padL - padR);
    const toY = (y: number) => padT + (1 - (y - yMin) / (yMax - yMin)) * (height - padT - padB);

    const flat = (pts: Pt[]) => pts.flatMap((p) => [toX(p.t), toY(p.y)]);

    return (
        <Stage width={width} height={height} className="overflow-hidden">
            <Layer>
                {/* y-축과 baseline(y=0) */}
                <Line points={[toX(0), toY(yMax), toX(0), toY(yMin)]} stroke={colors.border} strokeWidth={1}/>
                <Line points={[toX(0), toY(0), toX(T), toY(0)]} stroke={colors.border} strokeWidth={1}/>
                <Text x={padL + 2} y={1} text={label} fontSize={12} fontStyle="bold" fill={colors.muted}/>
                <Text x={toX(T) - 8} y={toY(0) + 2} text="T" fontSize={11} fill={colors.muted}/>
                <Text x={toX(0) - 6} y={toY(0) + 2} text="0" fontSize={11} fill={colors.muted}/>
                {series.map((s, i) => (
                    <Line key={i} points={flat(s.pts)} stroke={s.color} strokeWidth={s.width} dash={s.dash}
                          lineCap="round" lineJoin="round"/>
                ))}
                {markerT !== null && (
                    <Line points={[toX(markerT), padT, toX(markerT), height - padB]} stroke={colors.muted}
                          strokeWidth={1} dash={[4, 4]} opacity={0.7}/>
                )}
                {markerT !== null && markerValue !== null && (
                    <Circle x={toX(markerT)} y={toY(markerValue)} radius={4} fill={colors.accent}/>
                )}
            </Layer>
        </Stage>
    );
};

interface PathStripProps {
    width: number;
    height: number;
    s: number;
    colors: CanvasColors;
}

// path θ(s) 를 나타내는 수평 트랙 위에서 s(t) 값만큼 이동하는 점.
const PathStrip = ({width, height, s, colors}: PathStripProps) => {
    const padL = 34, padR = 10;
    const y = height / 2 + 4;
    const x0 = padL, x1 = width - padR;
    const dotX = x0 + Math.max(0, Math.min(1, s)) * (x1 - x0);
    return (
        <Stage width={width} height={height} className="overflow-hidden">
            <Layer>
                <Text x={padL + 2} y={0} text="path θ(s)" fontSize={12} fontStyle="bold" fill={colors.muted}/>
                <Line points={[x0, y, x1, y]} stroke={colors.border} strokeWidth={5} lineCap="round"/>
                <Circle x={x0} y={y} radius={3} fill={colors.muted}/>
                <Circle x={x1} y={y} radius={3} fill={colors.muted}/>
                <Circle x={dotX} y={y} radius={7} fill={colors.accent} stroke={colors.surface} strokeWidth={2}/>
            </Layer>
        </Stage>
    );
};

interface SceneProps {
    width: number;
    height: number;
}

const REF_DASH = [5, 4];

const TimeScalingScene = ({width, height}: SceneProps) => {
    const colors = useCanvasColors();
    const tr = useTr();
    const [profile, setProfile] = useState<Profile>("cubic");
    const [T, setT] = useState(2);
    const [v, setV] = useState(0.85);
    const [playing, setPlaying] = useState(false);
    const [markerT, setMarkerT] = useState(0);
    const rafRef = useRef<number>();
    const startRef = useRef<number>(0);

    useEffect(() => {
        if (!playing) return;
        startRef.current = performance.now();
        const tick = (now: number) => {
            setMarkerT(((now - startRef.current) / 1000) % T);
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [playing, T]);

    const {sdMax, sddMax, trap, sSeries, sdSeries, sddSeries} = useMemo(() => {
        const N = 200;
        const {fn, trap} = makeSampler(profile, T, v);
        const ts = Array.from({length: N + 1}, (_, i) => (i / N) * T);
        const active = ts.map((t) => ({t, ...fn(t)}));
        const mk = (key: keyof Sample, color: string): Series => ({
            pts: active.map((p) => ({t: p.t, y: p[key]})),
            color,
            width: 2.5,
        });
        const sSeries: Series[] = [mk("s", colors.accent)];
        const sdSeries: Series[] = [mk("sd", colors.accent)];
        const sddSeries: Series[] = [mk("sdd", colors.accent)];

        // quintic 선택 시 cubic 을 흐린 점선으로 겹쳐, s̈ 그래프의 끝점 jerk 차이를 대조한다.
        if (profile === "quintic") {
            const ref = ts.map((t) => ({t, ...sampleCubic(T, t)}));
            const refSeries = (key: keyof Sample): Series =>
                ({pts: ref.map((p) => ({t: p.t, y: p[key]})), color: colors.muted, width: 1.5, dash: REF_DASH});
            sSeries.push(refSeries("s"));
            sdSeries.push(refSeries("sd"));
            sddSeries.push(refSeries("sdd"));
        }

        // 이론적 peak: cubic ṡ=3/2T·, s̈=6/T² / quintic ṡ=15/8T, s̈=10/(√3 T²) / trap = v, a.
        let sdMax: number, sddMax: number;
        if (profile === "cubic") {
            sdMax = 3 / (2 * T);
            sddMax = 6 / (T * T);
        } else if (profile === "quintic") {
            sdMax = 15 / (8 * T);
            sddMax = 10 / (Math.sqrt(3) * T * T);
        } else {
            sdMax = trap.v;
            sddMax = trap.a;
        }
        return {sdMax, sddMax, trap, sSeries, sdSeries, sddSeries};
    }, [profile, T, v, colors]);

    const {fn} = useMemo(() => makeSampler(profile, T, v), [profile, T, v]);
    const cur = fn(Math.min(markerT, T));
    // 세로 예산(height)을 path 스트립 + 3개 그래프로 나눈다.
    const stripH = Math.round(height * 0.14);
    const plotH = Math.floor((height - stripH) / 3);

    const btn = (p: Profile, label: string) => (
        <button
            type="button"
            onClick={() => setProfile(p)}
            className={`px-2 py-1 rounded border text-xs ${
                profile === p
                    ? "border-[var(--accent)] text-[var(--accent)] font-semibold"
                    : "border-border text-muted"
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="flex flex-col gap-2 items-center" style={{width}}>
            <div className="bg-surface border border-border rounded-lg p-1 flex flex-col gap-1" style={{width}}>
                <PathStrip width={width - 8} height={stripH} s={cur.s} colors={colors}/>
                <MiniPlot width={width - 8} height={plotH} T={T} series={sSeries} label="s(t)"
                          colors={colors} markerT={playing ? markerT : null} markerValue={cur.s}/>
                <MiniPlot width={width - 8} height={plotH} T={T} series={sdSeries} label="ṡ(t)"
                          colors={colors} markerT={playing ? markerT : null} markerValue={cur.sd}/>
                <MiniPlot width={width - 8} height={plotH} T={T} series={sddSeries} label="s̈(t)"
                          colors={colors} markerT={playing ? markerT : null} markerValue={cur.sdd}/>
            </div>

            <div className="w-full flex flex-wrap items-center gap-2 justify-center">
                {btn("cubic", "cubic")}
                {btn("quintic", "quintic")}
                {btn("trapezoidal", "trapezoidal")}
                <button
                    type="button"
                    onClick={() => setPlaying((p) => !p)}
                    className="px-2 py-1 rounded border border-[var(--accent)] text-[var(--accent)] text-xs font-semibold"
                >
                    {playing ? "❚❚ Pause" : "▶ Play"}
                </button>
            </div>

            <div className="w-full flex flex-col gap-1 text-xs text-muted">
                <label className="flex items-center gap-2">
                    <span className="w-8 shrink-0">T</span>
                    <input type="range" min={0.5} max={4} step={0.1} value={T}
                           onChange={(e) => setT(parseFloat(e.target.value))}
                           className="w-full accent-[var(--accent)]" aria-label={tr("total time T", "전체 시간 T")}/>
                    <span className="w-12 shrink-0 text-right tabular-nums">{T.toFixed(1)} s</span>
                </label>
                {profile === "trapezoidal" && (
                    <label className="flex items-center gap-2">
                        <span className="w-8 shrink-0">v</span>
                        <input type="range" min={0.5} max={3} step={0.05} value={v}
                               onChange={(e) => setV(parseFloat(e.target.value))}
                               className="w-full accent-[var(--accent)]" aria-label={tr("coast speed v", "정속(coast) 속도 v")}/>
                        <span className="w-12 shrink-0 text-right tabular-nums">{v.toFixed(2)}</span>
                    </label>
                )}
            </div>

            <div className="w-full text-xs text-muted text-center">
                peak ṡ = {sdMax.toFixed(2)}/s · peak s̈ = {sddMax.toFixed(2)}/s²
                {profile === "trapezoidal" && (
                    trap.triangular
                        ? <span className="text-[var(--accent)] font-semibold"> · coast vanished → bang-bang</span>
                        : <span> · a = {trap.a.toFixed(2)}, tₐ = {trap.ta.toFixed(2)} s</span>
                )}
                {profile === "cubic" && <span> · s̈ jumps at t=0,T → infinite jerk</span>}
                {profile === "quintic" && <span> · s̈(0)=s̈(T)=0 → no jerk spike</span>}
            </div>
        </div>
    );
};

const TimeScalingProfiles = () => {
    const tr = useTr();
    return <CanvasFigure
        label={tr(
            "time scaling · s(t), ṡ(t), s̈(t) for cubic / quintic / trapezoidal",
            "Time Scaling · cubic / quintic / trapezoidal 의 s(t), ṡ(t), s̈(t)"
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<TimeScalingScene width={460} height={460}/>}
    >
        <TimeScalingScene width={320} height={320}/>
    </CanvasFigure>;
};

export default TimeScalingProfiles;
