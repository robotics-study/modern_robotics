import {useMemo, useState} from "react";
import {Layer, Line, Rect, Stage, Text} from "react-konva";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";

// 기어비 G 를 훑으며 두 가지를 동시에 본다: (1) torque–speed 작동 영역이 토크 ×G, 속도 ÷G 로
// 변형되는 것, (2) rotor 관성이 G² 배로 반영되어(apparent inertia) 링크 관성을 압도해 가는 것.
// 파라미터는 소형 DC 모터 급의 값이다.
const KT = 0.05;          // 토크 상수 [N·m/A]
const R_W = 1.2;          // 권선 저항 [Ω]
const V_MAX = 24;         // [V]
const I_MAX = 4;          // [A]
const I_ROTOR = 3e-5;     // rotor 관성 [kg·m²]
const I_LINK = 0.12;      // 링크 관성 [kg·m²]

const MOTOR_COLOR = "#8b5cf6";
const GEARED_COLOR = "#e0533d";

interface SceneProps {
    width: number;
    height: number;
}

const GearedMotorScene = ({width, height}: SceneProps) => {
    const colors = useCanvasColors();
    const t = useTr();
    const [g, setG] = useState(20);

    // 모터 단독 작동 영역 (1사분면): τ ≤ ktImax, 그리고 V 한계선 w = Vmax/kt − (R/kt²)τ
    const w0 = V_MAX / KT;                    // no-load speed [rad/s]
    const tauStall = KT * V_MAX / R_W;        // stall torque
    const tauMax = Math.min(KT * I_MAX, tauStall);
    // G 가 1~100 을 오가면 선형 축에서는 영역이 슬리버로 붕괴한다. log–log 축에서는
    // 토크 ×G / 속도 ÷G 가 "같은 일률 곡선을 따라 미끄러지는 사각형"으로 보인다.
    const plot = useMemo(() => {
        const W = width, H = Math.min(Math.round(width * 0.62), height);
        const padL = 46, padB = 34, padT = 12, padR = 10;
        const TAU_LO = 0.02, TAU_HI = 30;     // log 축 범위
        const W_LO = 2, W_HI = 700;
        const X = (tau: number) =>
            padL + (Math.log10(Math.max(tau, TAU_LO) / TAU_LO) / Math.log10(TAU_HI / TAU_LO)) * (W - padL - padR);
        const Y = (w: number) =>
            H - padB - (Math.log10(Math.max(w, W_LO) / W_LO) / Math.log10(W_HI / W_LO)) * (H - padB - padT);
        const region = (ratio: number) => {
            // 경계: τ ∈ [TAU_LO, τmax·ratio], 위쪽은 V 한계선 w(τ) = (V/kt − (R/kt²)(τ/ratio))/ratio.
            // log 축에서 곡선이 되므로 폴리라인으로 샘플한다. 아래쪽은 w = W_LO 로 닫는다.
            const tm = tauMax * ratio;
            const pts: number[] = [X(TAU_LO), Y(W_LO)];
            const N = 32;
            for (let k = 0; k <= N; k++) {
                const tau = TAU_LO * Math.pow(tm / TAU_LO, k / N);
                const w = (V_MAX / KT - (R_W / (KT * KT)) * (tau / ratio)) / ratio;
                pts.push(X(tau), Y(Math.max(w, W_LO)));
            }
            pts.push(X(tm), Y(W_LO));
            return pts;
        };
        return {W, H, padL, padB, X, Y, motor: region(1), geared: region(g)};
    }, [width, height, g]);

    const appInertia = g * g * I_ROTOR;
    const share = appInertia / (appInertia + I_LINK);

    return (
        <div className="flex flex-col gap-2 items-center" style={{width}}>
            <Stage width={plot.W} height={plot.H}
                   className="bg-surface border border-border rounded-lg overflow-hidden">
                <Layer>
                    {/* 축 */}
                    <Line points={[plot.padL, plot.H - plot.padB, plot.W - 6, plot.H - plot.padB]}
                          stroke={colors.text} strokeWidth={1.5}/>
                    <Line points={[plot.padL, plot.H - plot.padB, plot.padL, 6]}
                          stroke={colors.text} strokeWidth={1.5}/>
                    <Text x={plot.W - 104} y={plot.H - plot.padB + 8} text={t("torque τ (log)", "토크 τ (log)")}
                          fontSize={12} fill={colors.muted}/>
                    <Text x={6} y={8} text={t("speed w (log)", "속도 w (log)")} fontSize={12} fill={colors.muted}/>
                    {/* 모터 단독 영역 */}
                    <Line points={plot.motor} closed fill={MOTOR_COLOR} opacity={0.25}
                          stroke={MOTOR_COLOR} strokeWidth={2}/>
                    <Text x={plot.X(0.03)} y={plot.Y(w0) + 10} text={t("motor alone", "모터 단독")}
                          fontSize={11} fontStyle="bold" fill={MOTOR_COLOR}/>
                    {/* 기어 후 영역 */}
                    <Line points={plot.geared} closed fill={GEARED_COLOR} opacity={0.18}
                          stroke={GEARED_COLOR} strokeWidth={2}/>
                    <Text x={plot.X(tauMax * g) - 44} y={plot.Y(w0 / g) - 16}
                          text={`G = ${g}`} fontSize={12} fontStyle="bold" fill={GEARED_COLOR}/>
                </Layer>
            </Stage>

            <div className="w-full flex flex-col gap-1 text-xs text-muted">
                <label className="flex items-center gap-2">
                    <span className="w-8 shrink-0">G</span>
                    <input type="range" min={1} max={100} step={1} value={g}
                           onChange={(e) => setG(parseInt(e.target.value, 10))}
                           className="w-full accent-[var(--accent)]"
                           aria-label={t("gear ratio G", "기어비 G")}/>
                    <span className="w-12 shrink-0 text-right tabular-nums">{g}×</span>
                </label>
                {/* apparent inertia 구성 바 */}
                <div className="flex items-center gap-2">
                    <span className="w-24 shrink-0 text-right">{t("inertia at joint", "관절에서 본 관성")}</span>
                    <div className="flex-1 h-3 rounded bg-surface border border-border overflow-hidden flex">
                        <div className="h-full" style={{width: `${(1 - share) * 100}%`, background: "var(--accent)"}}/>
                        <div className="h-full" style={{width: `${share * 100}%`, background: GEARED_COLOR}}/>
                    </div>
                    <span className="w-40 shrink-0 tabular-nums">
                        {t("rotor share", "rotor 몫")} {(share * 100).toFixed(0)}%
                    </span>
                </div>
                <div className="text-center tabular-nums">
                    {t("apparent rotor inertia", "반영된 rotor 관성")}{" "}
                    <span style={{color: GEARED_COLOR}} className="font-semibold">
                        G²·I_rotor = {appInertia.toFixed(3)} kg·m²
                    </span>
                    {" vs. "}
                    <span className="font-semibold" style={{color: "var(--accent)"}}>
                        I_link = {I_LINK.toFixed(3)} kg·m²
                    </span>
                </div>
            </div>
        </div>
    );
};

const GearedMotor = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "gearing trades speed for torque, but the rotor inertia comes back multiplied by G²",
            "기어는 속도를 내주고 토크를 얻지만, rotor 관성은 G² 배가 되어 돌아온다",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<GearedMotorScene {...modalCanvasSize(1.4)}/>}
    >
        <GearedMotorScene width={380} height={280}/>
    </CanvasFigure>;
};

export default GearedMotor;
