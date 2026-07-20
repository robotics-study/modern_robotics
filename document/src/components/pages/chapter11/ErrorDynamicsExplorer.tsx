import {useMemo, useState} from "react";
import {Circle, Layer, Line, Stage, Text} from "react-konva";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";

// 2차 오차 동역학 θ̈e + 2ζωn θ̇e + ωn²θe = 0 을 두 패널로 잇는다. 왼쪽은 특성방정식의 근이
// 놓인 s-평면, 오른쪽은 단위 오차 응답 θe(t). ζ, ωn 슬라이더를 움직이면 근이 이동하고 응답이
// 따라 변한다: 왼쪽으로 갈수록 settling 이 짧고, 실축에서 멀수록 overshoot 가 커진다.
const T_END = 6;
const N_PTS = 240;

// 단위 오차 응답의 해석해 (θe(0)=1, θ̇e(0)=0). 세 감쇠 경우를 그대로 옮겼다.
const errorResponse = (zeta: number, wn: number, t: number): number => {
    if (zeta > 1.0001) {
        const rt = Math.sqrt(zeta * zeta - 1);
        const s1 = -zeta * wn + wn * rt, s2 = -zeta * wn - wn * rt;
        const c1 = 0.5 + zeta / (2 * rt), c2 = 0.5 - zeta / (2 * rt);
        return c1 * Math.exp(s1 * t) + c2 * Math.exp(s2 * t);
    }
    if (zeta > 0.9999) {
        return (1 + wn * t) * Math.exp(-wn * t);
    }
    const wd = wn * Math.sqrt(1 - zeta * zeta);
    return (Math.cos(wd * t) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(wd * t))
        * Math.exp(-zeta * wn * t);
};

interface SceneProps {
    panel?: number;
}

const ErrorScene = ({panel = 300}: SceneProps) => {
    const colors = useCanvasColors();
    const t = useTr();
    const [zeta, setZeta] = useState(0.5);
    const [wn, setWn] = useState(3);

    const {roots, curve, overshoot, settling} = useMemo(() => {
        let roots: Array<{re: number; im: number}>;
        if (zeta >= 1) {
            const rt = Math.sqrt(Math.max(0, zeta * zeta - 1));
            roots = [{re: -zeta * wn + wn * rt, im: 0}, {re: -zeta * wn - wn * rt, im: 0}];
        } else {
            const wd = wn * Math.sqrt(1 - zeta * zeta);
            roots = [{re: -zeta * wn, im: wd}, {re: -zeta * wn, im: -wd}];
        }
        const curve: number[] = [];
        for (let i = 0; i <= N_PTS; i++) curve.push(errorResponse(zeta, wn, (i / N_PTS) * T_END));
        const overshoot = zeta < 1 ? Math.exp(-Math.PI * zeta / Math.sqrt(1 - zeta * zeta)) * 100 : 0;
        // 정착 시간 ≈ 4t: 과감쇠면 느린 근, 아니면 4/(ζωn).
        const slow = Math.max(...roots.map((r) => r.re));
        const settling = 4 / Math.abs(slow);
        return {roots, curve, overshoot, settling};
    }, [zeta, wn]);

    // s-평면 패널: 실축 [-12, 2], 허축 [-11, 11].
    const S_RE0 = -12, S_RE1 = 2, S_IM = 11;
    const sX = (re: number) => ((re - S_RE0) / (S_RE1 - S_RE0)) * panel;
    const sY = (im: number) => (1 - (im + S_IM) / (2 * S_IM)) * panel;
    // 응답 패널: t ∈ [0, T_END], θe ∈ [-1.1, 1.1].
    const rX = (i: number) => (i / N_PTS) * panel;
    const rY = (v: number) => (1 - (v + 1.1) / 2.2) * panel;

    const slider = (label: string, val: number, set: (v: number) => void,
                    min: number, max: number, step: number, fmt: string) => (
        <label key={label} className="flex items-center gap-2 text-xs text-muted">
            <span className="w-8 shrink-0">{label}</span>
            <input type="range" min={min} max={max} step={step} value={val}
                   onChange={(e) => set(parseFloat(e.target.value))}
                   className="w-full accent-[var(--accent)]" aria-label={label}/>
            <span className="w-10 shrink-0 text-right tabular-nums">{fmt}</span>
        </label>
    );

    return (
        <div className="flex flex-col gap-2 items-center">
            <div className="flex flex-row flex-wrap gap-3 items-start justify-center">
                {/* s-평면 */}
                <div className="flex flex-col items-center gap-0.5">
                    <Stage width={panel} height={panel}
                           className="bg-surface border border-border rounded-lg overflow-hidden">
                        <Layer>
                            {/* 불안정 반평면 */}
                            <Line points={[sX(0), 0, sX(0), panel, panel, panel, panel, 0]} closed
                                  fill="#e0533d" opacity={0.08}/>
                            <Line points={[0, sY(0), panel, sY(0)]} stroke={colors.border} strokeWidth={1}/>
                            <Line points={[sX(0), 0, sX(0), panel]} stroke={colors.text} strokeWidth={1.5}/>
                            <Text x={sX(0) + 4} y={6} text="Re(s) = 0" fontSize={10} fill={colors.muted}/>
                            <Text x={6} y={sY(0) - 16} text="Re" fontSize={11} fill={colors.muted}/>
                            <Text x={sX(0) - 22} y={6} text="Im" fontSize={11} fill={colors.muted}/>
                            {roots.map((r, i) => (
                                <Circle key={i} x={sX(Math.max(r.re, S_RE0))} y={sY(r.im)} radius={6}
                                        fill={colors.accent}/>
                            ))}
                        </Layer>
                    </Stage>
                    <span className="text-xs text-muted">{t("roots in the s-plane", "s-평면의 근")}</span>
                </div>
                {/* 오차 응답 */}
                <div className="flex flex-col items-center gap-0.5">
                    <Stage width={panel} height={panel}
                           className="bg-surface border border-border rounded-lg overflow-hidden">
                        <Layer>
                            <Line points={[0, rY(0), panel, rY(0)]} stroke={colors.border} strokeWidth={1}/>
                            <Line points={[0, rY(1), panel, rY(1)]} stroke={colors.border} strokeWidth={1}
                                  dash={[4, 4]}/>
                            <Text x={4} y={rY(1) + 3} text="θe(0) = 1" fontSize={10} fill={colors.muted}/>
                            <Line points={curve.flatMap((v, i) => [rX(i), rY(v)])}
                                  stroke={colors.accent} strokeWidth={2.5}
                                  lineCap="round" lineJoin="round"/>
                            <Text x={panel - 34} y={rY(0) + 4} text="t →" fontSize={11} fill={colors.muted}/>
                        </Layer>
                    </Stage>
                    <span className="text-xs text-muted">{t("unit error response θe(t)", "단위 오차 응답 θe(t)")}</span>
                </div>
            </div>
            <div className="w-full flex flex-col gap-1">
                {slider("ζ", zeta, setZeta, 0.05, 2, 0.01, zeta.toFixed(2))}
                {slider("ωn", wn, setWn, 1, 10, 0.1, wn.toFixed(1))}
            </div>
            <div className="text-xs text-muted text-center tabular-nums">
                {zeta < 1
                    ? t("underdamped", "underdamped")
                    : zeta === 1 ? t("critically damped", "critically damped") : t("overdamped", "overdamped")}
                {" · overshoot "}
                <span className="font-semibold" style={{color: "var(--accent)"}}>{overshoot.toFixed(1)}%</span>
                {" · "}
                {t("2% settling", "2% 정착")} ≈{" "}
                <span className="font-semibold">{settling.toFixed(2)} s</span>
            </div>
        </div>
    );
};

const ErrorDynamicsExplorer = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "slide ζ and ωn: roots further left settle faster, roots further off the real axis overshoot more",
            "ζ 와 ωn 을 움직여 보라. 근이 왼쪽으로 갈수록 빨리 정착하고, 실축에서 멀어질수록 overshoot 가 커진다",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<ErrorScene panel={Math.floor(modalCanvasSize(2.1).width / 2) - 16}/>}
    >
        <ErrorScene panel={280}/>
    </CanvasFigure>;
};

export default ErrorDynamicsExplorer;
