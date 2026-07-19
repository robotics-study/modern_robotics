import {useMemo, useState} from "react";
import {Circle, Layer, Line, Stage, Text} from "react-konva";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";
import {coriolis2R, gravity2R, massMatrix2R} from "../chapter8/twoRModel";

// 시간 최적 time scaling 을 (s, ṡ) phase plane 에서 실제 수치로 보여준다. 8장의 2R 팔을
// 관절 공간 직선 경로 θ(s) = θs + s·Δ 에 구속하면 m(s)s̈ + c(s)ṡ² + g(s) = τ 가 되고,
// |τᵢ| ≤ τmax 가 s̈ 의 허용 구간 [L, U] 를 준다. U 를 (0,0)에서 앞으로, L 을 (1,0)에서
// 뒤로 적분해 만나는 점이 가속→감속 전환점이고, 그 위쪽 회색 영역(velocity limit curve 위)은
// 어떤 토크로도 경로를 유지할 수 없는 상태다. τmax 슬라이더로 한계를 조이면 곡선 전체가 내려앉는다.
const TH_START: [number, number] = [-0.6, 0.9];
const DELTA: [number, number] = [2.0, -1.6];
const N_GRID = 240;
const SDOT_MAX_SCAN = 40;

const F_COLOR = "#f2a63a";
const SWITCH_COLOR = "#e0533d";

// 경로 구속 동역학의 계수: τ = m(s)s̈ + c(s)ṡ² + g(s) (성분별).
const pathCoeffs = (s: number) => {
    const t1 = TH_START[0] + s * DELTA[0];
    const t2 = TH_START[1] + s * DELTA[1];
    const [m11, m12, m22] = massMatrix2R(t2);
    // m(s) = M(θ)·Δ (θ'' = 0 인 직선 경로), c(s) = θ'ᵀΓθ' 항 = coriolis(θ, Δ).
    const m: [number, number] = [m11 * DELTA[0] + m12 * DELTA[1], m12 * DELTA[0] + m22 * DELTA[1]];
    const c = coriolis2R(t2, DELTA[0], DELTA[1]);
    const g = gravity2R(t1, t2);
    return {m, c, g};
};

// 상태 (s, ṡ) 에서의 허용 가속 구간 [L, U]. mᵢ 부호에 따라 상·하계가 뒤집힌다 (책 9.36).
const bounds = (s: number, sd: number, tauMax: number): {L: number; U: number} => {
    const {m, c, g} = pathCoeffs(s);
    let L = -Infinity, U = Infinity;
    for (let i = 0; i < 2; i++) {
        const rest = c[i] * sd * sd + g[i];
        if (Math.abs(m[i]) < 1e-9) continue;   // zero-inertia 성분은 이 toy 경로에선 발생하지 않는다
        const hi = (tauMax - rest) / m[i];
        const lo = (-tauMax - rest) / m[i];
        L = Math.max(L, Math.min(hi, lo));
        U = Math.min(U, Math.max(hi, lo));
    }
    return {L, U};
};

// 각 s 에서 L ≤ U 가 무너지는 최소 ṡ (velocity limit curve). 없으면 스캔 상한.
const velocityLimit = (s: number, tauMax: number): number => {
    let lo = 0, hi = SDOT_MAX_SCAN;
    const bad = (sd: number) => {
        const {L, U} = bounds(s, sd, tauMax);
        return L > U;
    };
    if (!bad(hi)) return hi;
    for (let k = 0; k < 40; k++) {
        const mid = (lo + hi) / 2;
        if (bad(mid)) hi = mid;
        else lo = mid;
    }
    return lo;
};

interface Curve {
    s: number[];
    sd: number[];
}

// dṡ/ds = s̈/ṡ 를 s 방향으로 적분한다. dir=+1 이면 U 로 전진, −1 이면 L 로 후진.
const integrate = (s0: number, sd0: number, dir: 1 | -1, tauMax: number, vlc: number[]): Curve => {
    const ds = 1 / N_GRID;
    const out: Curve = {s: [s0], sd: [sd0]};
    let s = s0, sd = Math.max(sd0, 0.03);
    for (let k = 0; k < N_GRID * 2; k++) {
        const {L, U} = bounds(s, sd, tauMax);
        const acc = dir > 0 ? U : L;
        sd = Math.sqrt(Math.max(0.0004, sd * sd + 2 * acc * ds * dir));
        s += dir * ds;
        if (s < 0 || s > 1) break;
        out.s.push(s);
        out.sd.push(sd);
        // 한계 곡선을 뚫으면 중단 (단일 전환 사례가 되도록 파라미터를 골랐다)
        const gi = Math.round(s * N_GRID);
        if (sd > (vlc[gi] ?? SDOT_MAX_SCAN)) break;
        if (sd < 0.02 && k > 4) break;
    }
    return out;
};

interface SceneProps {
    width: number;
    height: number;
}

const PhasePlaneScene = ({width, height}: SceneProps) => {
    const colors = useCanvasColors();
    const t = useTr();
    const [tauMax, setTauMax] = useState(60);

    const {vlcPts, aPts, fPts, sw, T, vlcVisible} = useMemo(() => {
        const vlc: number[] = [];
        for (let i = 0; i <= N_GRID; i++) vlc.push(velocityLimit(i / N_GRID, tauMax));
        const A = integrate(0, 0.03, 1, tauMax, vlc);
        const F = integrate(1, 0.03, -1, tauMax, vlc);
        // F 를 s 오름차순 격자로 리샘플해 교점을 찾는다.
        const fGrid: number[] = new Array(N_GRID + 1).fill(NaN);
        for (let i = 0; i < F.s.length; i++) {
            const gi = Math.round(F.s[i] * N_GRID);
            if (gi >= 0 && gi <= N_GRID) fGrid[gi] = F.sd[i];
        }
        let sw: {s: number; sd: number} | null = null;
        for (let i = 0; i < A.s.length; i++) {
            const gi = Math.round(A.s[i] * N_GRID);
            if (Number.isFinite(fGrid[gi]) && A.sd[i] >= fGrid[gi]) {
                sw = {s: A.s[i], sd: A.sd[i]};
                break;
            }
        }
        // 최적 프로파일 ṡ*(s) = (전환 전 A, 전환 후 F) 로 총 시간 T = ∫ ds/ṡ 계산.
        let T = 0;
        const ds = 1 / N_GRID;
        for (let i = 0; i <= N_GRID; i++) {
            const s = i / N_GRID;
            const onA = sw ? s <= sw.s : true;
            const v = onA
                ? A.sd[Math.min(Math.round(s * N_GRID), A.sd.length - 1)]
                : fGrid[i];
            if (Number.isFinite(v) && v > 0.02) T += ds / v;
        }
        return {
            vlcPts: vlc.flatMap((v, i) => [i / N_GRID, v]),
            aPts: A.s.flatMap((s, i) => [s, A.sd[i]]),
            fPts: F.s.flatMap((s, i) => [s, F.sd[i]]),
            sw, T, vlcVisible: vlc.some((v) => v < SDOT_MAX_SCAN - 1),
        };
    }, [tauMax]);

    // 플롯 좌표계: x = s ∈ [0,1], y = ṡ (0 아래, 위로 증가).
    const PAD_L = 46, PAD_B = 30, PAD_T = 12, PAD_R = 12;
    const H = Math.min(Math.round(width * 0.66), height);
    const yMax = useMemo(() => {
        let m = 3;
        for (let i = 1; i < aPts.length; i += 2) m = Math.max(m, aPts[i]);
        for (let i = 1; i < fPts.length; i += 2) m = Math.max(m, fPts[i]);
        return m * 1.2;
    }, [aPts, fPts]);
    const X = (s: number) => PAD_L + s * (width - PAD_L - PAD_R);
    const Y = (sd: number) => H - PAD_B - (Math.min(sd, yMax) / yMax) * (H - PAD_B - PAD_T);
    const mapPts = (pts: number[]) => {
        const out: number[] = [];
        for (let i = 0; i < pts.length; i += 2) out.push(X(pts[i]), Y(pts[i + 1]));
        return out;
    };

    return (
        <div className="flex flex-col gap-2 items-center" style={{width}}>
            <Stage width={width} height={H}
                   className="bg-surface border border-border rounded-lg overflow-hidden">
                <Layer>
                    {/* 축 */}
                    <Line points={[PAD_L, H - PAD_B, width - 6, H - PAD_B]} stroke={colors.text} strokeWidth={1.5}/>
                    <Line points={[PAD_L, H - PAD_B, PAD_L, 6]} stroke={colors.text} strokeWidth={1.5}/>
                    <Text x={width - 60} y={H - PAD_B + 8} text="s (0→1)" fontSize={12} fill={colors.muted}/>
                    <Text x={6} y={8} text="ṡ" fontSize={13} fill={colors.muted}/>
                    {/* 도달 불가 영역: velocity limit curve 위쪽 */}
                    {vlcVisible && (
                        <Line points={[...mapPts(vlcPts), X(1), Y(yMax), X(0), Y(yMax)]}
                              closed fill={colors.muted} opacity={0.16}/>
                    )}
                    {vlcVisible && (
                        <Line points={mapPts(vlcPts)} stroke={colors.muted} strokeWidth={2} dash={[6, 4]}/>
                    )}
                    {/* 전진 가속 곡선 A₀ 와 후진 감속 곡선 F */}
                    <Line points={mapPts(aPts)} stroke={colors.accent} strokeWidth={3} lineCap="round"/>
                    <Line points={mapPts(fPts)} stroke={F_COLOR} strokeWidth={3} lineCap="round"/>
                    {/* 전환점 */}
                    {sw && (
                        <>
                            <Circle x={X(sw.s)} y={Y(sw.sd)} radius={6} fill={SWITCH_COLOR}/>
                            <Text x={X(sw.s) - 26} y={Y(sw.sd) - 22}
                                  text={`s* = ${sw.s.toFixed(2)}`} fontSize={12} fontStyle="bold"
                                  fill={SWITCH_COLOR}/>
                        </>
                    )}
                    <Text x={X(0.06)} y={Y(0) - 18} text="(0,0)" fontSize={11} fill={colors.muted}/>
                    <Text x={X(0.9)} y={Y(0) - 18} text="(1,0)" fontSize={11} fill={colors.muted}/>
                </Layer>
            </Stage>

            <div className="w-full flex flex-col gap-1 text-xs text-muted">
                <label className="flex items-center gap-2">
                    <span className="w-12 shrink-0">τ_max</span>
                    <input type="range" min={25} max={120} step={1} value={tauMax}
                           onChange={(e) => setTauMax(parseInt(e.target.value, 10))}
                           className="w-full accent-[var(--accent)]"
                           aria-label={t("actuator torque limit", "구동기 토크 한계")}/>
                    <span className="w-16 shrink-0 text-right tabular-nums">{tauMax} N·m</span>
                </label>
                <div className="text-center tabular-nums">
                    <span className="font-semibold" style={{color: "var(--accent)"}}>
                        {t("full acceleration from (0,0)", "(0,0)에서 최대 가속")}
                    </span>
                    {" · "}
                    <span className="font-semibold" style={{color: F_COLOR}}>
                        {t("full deceleration into (1,0)", "(1,0)으로 최대 감속")}
                    </span>
                    {" · "}
                    <span className="font-semibold" style={{color: SWITCH_COLOR}}>
                        {t("switch", "전환점")}
                    </span>
                    {" → "}
                    T = {Number.isFinite(T) ? T.toFixed(2) : "—"} s
                </div>
                <div className="text-center">
                    {t("gray: no torque can keep the arm on the path (above the velocity limit curve)",
                        "회색: 어떤 토크로도 팔을 경로에 붙들 수 없는 상태 (velocity limit curve 위)")}
                </div>
            </div>
        </div>
    );
};

const TimeOptimalPhasePlane = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "time-optimal time scaling of the Ch.8 2R arm along a joint-space line: bang-bang in the (s, ṡ) phase plane",
            "8장 2R 팔을 관절 공간 직선에 구속한 시간 최적 time scaling: (s, ṡ) phase plane 의 bang-bang",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<PhasePlaneScene {...modalCanvasSize(1.4)}/>}
    >
        <PhasePlaneScene width={380} height={300}/>
    </CanvasFigure>;
};

export default TimeOptimalPhasePlane;
