import {useEffect, useRef, useState} from "react";
import {Arrow, Circle, Layer, Line, Stage, Text} from "react-konva";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";

// 책 12.2.3.2 의 실험 그대로: 책(판) 위에 동전을 얹고 천천히 기울인다. 접촉이 낼 수 있는
// 힘은 friction cone (반각 tan⁻¹μ) 안뿐이므로, 중력을 지탱하려면 중력의 반대 방향이 cone
// 안에 있어야 한다. 판의 기울기 α 가 tan⁻¹μ 를 넘는 순간 cone 이 중력을 더 못 담고
// 동전이 미끄러진다. cone 이 판과 함께 기울어지는 것을 보라.
const G = 9.81;
const DT = 0.002;
const PLANK_LEN = 1.0;
const S0 = 0.62;               // 판 위 초기 위치 (경첩에서부터, 판 길이 비율)

interface SceneProps {
    panel?: number;
}

const InclineScene = ({panel = 340}: SceneProps) => {
    const colors = useCanvasColors();
    const t = useTr();
    const [alphaDeg, setAlphaDeg] = useState(12);
    const [mu, setMu] = useState(0.4);
    const [, setTick] = useState(0);

    const stateRef = useRef({s: S0, v: 0});
    const paramsRef = useRef({alphaDeg, mu});
    paramsRef.current = {alphaDeg, mu};

    useEffect(() => {
        let raf = 0, last: number | null = null;
        const loop = (ts: number) => {
            if (last === null) last = ts;
            const real = Math.min((ts - last) / 1000, 0.05);
            last = ts;
            const st = stateRef.current;
            const p = paramsRef.current;
            const a = (p.alphaDeg * Math.PI) / 180;
            const steps = Math.max(1, Math.round(real / DT));
            for (let i = 0; i < steps; i++) {
                const sliding = st.v > 1e-6 || Math.tan(a) > p.mu;
                if (sliding) {
                    // 아래로 미끄러지는 방향이 +. 마찰은 운동 반대 방향으로 μN.
                    const acc = G * (Math.sin(a) - p.mu * Math.cos(a));
                    st.v += acc * DT;
                    if (st.v < 0) st.v = 0;
                    st.s += st.v * 0.22 * DT;
                    if (st.s > 0.97) {
                        st.s = 0.97;
                        st.v = 0;
                    }
                } else {
                    st.v = 0;
                }
            }
            setTick((n) => n + 1);
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, []);

    const st = stateRef.current;
    const alpha = (alphaDeg * Math.PI) / 180;
    const fricAngle = Math.atan(mu);
    const slipping = Math.tan(alpha) > mu;

    const W = panel, H = Math.round(panel * 0.78);
    // 경첩(왼쪽 아래)을 중심으로 판을 기울인다.
    const hx = W * 0.14, hy = H * 0.82;
    const L = W * 0.74;
    const dir: [number, number] = [Math.cos(-alpha), Math.sin(-alpha)];   // 화면 좌표 (아래가 +y)
    const plankEnd: [number, number] = [hx + L * dir[0], hy + L * dir[1]];
    // 동전 위치 (판 위 st.s 비율), 판의 법선 방향으로 반지름만큼 띄운다.
    const nrm: [number, number] = [Math.sin(-alpha), -Math.cos(-alpha)];
    const coinR = panel * 0.045;
    const coin: [number, number] = [
        hx + L * (1 - st.s) * PLANK_LEN * dir[0] + nrm[0] * coinR,
        hy + L * (1 - st.s) * PLANK_LEN * dir[1] + nrm[1] * coinR,
    ];
    const contact: [number, number] = [coin[0] - nrm[0] * coinR, coin[1] - nrm[1] * coinR];

    // friction cone: 접촉점에서 법선 축 ± tan⁻¹μ.
    const coneLen = panel * 0.32;
    const coneEdge = (sign: number): [number, number] => {
        const a = -alpha + Math.PI / 2 + sign * fricAngle;
        return [contact[0] + coneLen * Math.cos(-a), contact[1] + coneLen * Math.sin(-a)];
    };
    // 중력을 지탱하는 힘 방향은 수직 위 (0,−1): cone 안이면 버틴다.
    const upEnd: [number, number] = [contact[0], contact[1] - coneLen * 0.85];

    const slider = (label: string, val: number, set: (v: number) => void,
                    min: number, max: number, step: number, fmt: string) => (
        <label key={label} className="flex items-center gap-2 text-xs text-muted">
            <span className="w-6 shrink-0">{label}</span>
            <input type="range" min={min} max={max} step={step} value={val}
                   onChange={(e) => set(parseFloat(e.target.value))}
                   className="w-full accent-[var(--accent)]" aria-label={label}/>
            <span className="w-12 shrink-0 text-right tabular-nums">{fmt}</span>
        </label>
    );

    return (
        <div className="flex flex-col gap-2 items-center">
            <div className="flex flex-row gap-1.5">
                <button onClick={() => {
                    stateRef.current.s = S0;
                    stateRef.current.v = 0;
                }}
                        className="px-2.5 py-1 rounded-md text-xs font-semibold border border-border text-muted hover:text-[var(--text)] transition-colors">
                    {t("put the coin back", "동전 다시 올리기")}
                </button>
            </div>
            <Stage width={W} height={H}
                   className="bg-surface border border-border rounded-lg overflow-hidden">
                <Layer>
                    {/* 바닥과 경첩 */}
                    <Line points={[W * 0.05, hy, W * 0.95, hy]} stroke={colors.border} strokeWidth={1.5}/>
                    <Circle x={hx} y={hy} radius={5} fill={colors.text}/>
                    {/* 판 */}
                    <Line points={[hx, hy, plankEnd[0], plankEnd[1]]} stroke={colors.text}
                          strokeWidth={5} lineCap="round"/>
                    {/* friction cone (판과 함께 기운다) */}
                    <Line points={[contact[0], contact[1], coneEdge(1)[0], coneEdge(1)[1],
                        coneEdge(-1)[0], coneEdge(-1)[1]]} closed
                          fill={slipping ? "#e0533d" : colors.accent} opacity={0.2}/>
                    <Line points={[contact[0], contact[1], coneEdge(1)[0], coneEdge(1)[1]]}
                          stroke={slipping ? "#e0533d" : colors.accent} strokeWidth={1.5}/>
                    <Line points={[contact[0], contact[1], coneEdge(-1)[0], coneEdge(-1)[1]]}
                          stroke={slipping ? "#e0533d" : colors.accent} strokeWidth={1.5}/>
                    {/* 중력을 지탱해야 하는 방향 (수직 위) */}
                    <Arrow points={[contact[0], contact[1], upEnd[0], upEnd[1]]}
                           stroke={colors.text} fill={colors.text} strokeWidth={2}
                           pointerLength={8} pointerWidth={7} dash={[5, 4]}/>
                    <Text x={upEnd[0] + 6} y={upEnd[1]} text="-mg" fontSize={11} fill={colors.muted}/>
                    {/* 동전 */}
                    <Circle x={coin[0]} y={coin[1]} radius={coinR} fill="#e0a33d"
                            stroke={colors.text} strokeWidth={1.5}/>
                    <Text x={6} y={6}
                          text={t("the cone tilts with the plank", "cone 은 판과 함께 기울어진다")}
                          fontSize={11} fill={colors.muted}/>
                </Layer>
            </Stage>
            <div className="w-full flex flex-col gap-1">
                {slider("α", alphaDeg, setAlphaDeg, 0, 40, 0.5, `${alphaDeg.toFixed(1)}°`)}
                {slider("μ", mu, setMu, 0.1, 1, 0.01, mu.toFixed(2))}
            </div>
            <div className="text-xs text-muted text-center tabular-nums">
                {t("friction angle", "friction angle")} tan⁻¹μ = {(fricAngle * 180 / Math.PI).toFixed(1)}°
                {" · "}
                {slipping
                    ? <span className="font-semibold" style={{color: "#e0533d"}}>
                        {t("α is past the cone: the coin slides", "α 가 cone 을 벗어났다. 동전이 미끄러진다")}
                    </span>
                    : <span className="font-semibold" style={{color: "var(--accent)"}}>
                        {t("gravity still fits inside the cone: the coin sticks", "중력이 아직 cone 안에 담긴다. 동전은 붙어 있다")}
                    </span>}
            </div>
        </div>
    );
};

const FrictionConeIncline = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "Coulomb friction as a cone: tilt the plank and the coin slips at exactly α = tan⁻¹μ, the cone's half-angle",
            "cone 으로 본 Coulomb 마찰: 판을 기울이면 정확히 cone 의 반각 α = tan⁻¹μ 에서 동전이 미끄러지기 시작한다",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<InclineScene panel={Math.min(modalCanvasSize(1.28).width, 720)}/>}
    >
        <InclineScene panel={360}/>
    </CanvasFigure>;
};

export default FrictionConeIncline;
