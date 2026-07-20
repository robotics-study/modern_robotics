import {useEffect, useRef, useState} from "react";
import {Arrow, Layer, Line, Stage, Text} from "react-konva";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";

// odometry 의 약점을 보여 주는 시뮬레이션. diff-drive 가 원을 돌고, odometry 는 엔코더로
// 잰 바퀴 각도에서 자세를 적분한다. 문제는 모델이 완벽하지 않다는 것: 오른쪽 바퀴의 실제
// 반지름이 모델보다 아주 조금만 달라도 (공기압, 마모) 추정이 매 바퀴 조금씩 어긋나고,
// 오차는 시간이 갈수록 쌓이기만 한다. 그래서 odometry 는 짧은 구간에서는 훌륭하지만
// 주기적으로 다른 센서(GPS, 랜드마크)로 보정해 줘야 한다.
const R_NOM = 0.04, D_HALF = 0.12;
const V_CMD = 0.24, W_CMD = 0.45;

interface SimState {
    truePose: [number, number, number];
    estPose: [number, number, number];
    trueTrail: Array<[number, number]>;
    estTrail: Array<[number, number]>;
    dist: number;
}

const freshState = (): SimState => ({
    truePose: [Math.PI / 2, 0.53, 0], estPose: [Math.PI / 2, 0.53, 0],
    trueTrail: [], estTrail: [], dist: 0,
});

const stepPose = (p: [number, number, number], v: number, w: number, dt: number):
    [number, number, number] => [
    p[0] + w * dt,
    p[1] + v * Math.cos(p[0] + w * dt / 2) * dt,
    p[2] + v * Math.sin(p[0] + w * dt / 2) * dt,
];

interface SceneProps {
    panel?: number;
}

const OdometryScene = ({panel = 360}: SceneProps) => {
    const colors = useCanvasColors();
    const t = useTr();
    const [errPct, setErrPct] = useState(1.0);
    const [, setTick] = useState(0);
    const stateRef = useRef<SimState>(freshState());
    const errRef = useRef(errPct);
    errRef.current = errPct;

    useEffect(() => {
        let raf = 0, last: number | null = null;
        const loop = (ts: number) => {
            if (last === null) last = ts;
            const dt = Math.min((ts - last) / 1000, 0.04);
            last = ts;
            const s = stateRef.current;
            // 명령: 명목 반지름으로 계산한 바퀴 속도 (원을 돌라는 명령).
            const uL = (V_CMD - W_CMD * D_HALF) / R_NOM;
            const uR = (V_CMD + W_CMD * D_HALF) / R_NOM;
            // 실제 오른쪽 바퀴 반지름은 모델과 다르다.
            const rR = R_NOM * (1 + errRef.current / 100);
            const vTrue = (R_NOM * uL + rR * uR) / 2;
            const wTrue = (rR * uR - R_NOM * uL) / (2 * D_HALF);
            // odometry: 엔코더 각도(정확)에 명목 반지름을 곱해 적분 → 완벽한 원이 나온다고 믿는다.
            s.truePose = stepPose(s.truePose, vTrue, wTrue, dt);
            s.estPose = stepPose(s.estPose, V_CMD, W_CMD, dt);
            s.dist += Math.abs(vTrue) * dt;
            s.trueTrail.push([s.truePose[1], s.truePose[2]]);
            s.estTrail.push([s.estPose[1], s.estPose[2]]);
            if (s.trueTrail.length > 900) s.trueTrail.shift();
            if (s.estTrail.length > 900) s.estTrail.shift();
            setTick((n) => n + 1);
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, []);

    const s = stateRef.current;
    const err = Math.hypot(s.truePose[1] - s.estPose[1], s.truePose[2] - s.estPose[2]);

    const W = panel, H = panel;
    const S = panel / 2.6;
    const sx = (x: number) => W / 2 + x * S;
    const sy = (y: number) => H / 2 - y * S;

    const robot = (p: [number, number, number]) => {
        const [phi, x, y] = p;
        const c = Math.cos(phi), si = Math.sin(phi);
        return {
            pts: [[0.09, 0.06], [0.09, -0.06], [-0.09, -0.06], [-0.09, 0.06]]
                .flatMap(([a, b]) => [sx(x + a * c - b * si), sy(y + a * si + b * c)]),
            base: [sx(x + 0.09 * c), sy(y + 0.09 * si)],
            tip: [sx(x + 0.15 * c), sy(y + 0.15 * si)],
        };
    };
    const tr = robot(s.truePose), es = robot(s.estPose);

    return (
        <div className="flex flex-col gap-2 items-center">
            <div className="flex flex-row gap-1.5">
                <button onClick={() => {
                    stateRef.current.estPose = [...stateRef.current.truePose];
                    stateRef.current.estTrail = [];
                }}
                        className="px-2.5 py-1 rounded-md text-xs font-semibold border border-border text-muted hover:text-[var(--text)] transition-colors">
                    {t("external fix (GPS/landmark)", "외부 센서로 보정 (GPS/랜드마크)")}
                </button>
                <button onClick={() => {
                    stateRef.current = freshState();
                }}
                        className="px-2.5 py-1 rounded-md text-xs font-semibold border border-border text-muted hover:text-[var(--text)] transition-colors">
                    {t("reset", "처음부터")}
                </button>
            </div>
            <Stage width={W} height={H}
                   className="bg-surface border border-border rounded-lg overflow-hidden">
                <Layer>
                    {/* odometry 추정 자취 (점선처럼 흐리게) */}
                    {s.estTrail.length > 1 && (
                        <Line points={s.estTrail.flatMap(([x, y]) => [sx(x), sy(y)])}
                              stroke={colors.muted} strokeWidth={2} opacity={0.5}
                              lineCap="round" lineJoin="round"/>
                    )}
                    {/* 실제 자취 */}
                    {s.trueTrail.length > 1 && (
                        <Line points={s.trueTrail.flatMap(([x, y]) => [sx(x), sy(y)])}
                              stroke={colors.accent} strokeWidth={2.5} opacity={0.75}
                              lineCap="round" lineJoin="round"/>
                    )}
                    {/* 오차 연결선 */}
                    <Line points={[sx(s.truePose[1]), sy(s.truePose[2]), sx(s.estPose[1]), sy(s.estPose[2])]}
                          stroke="#e0533d" strokeWidth={1.5} dash={[4, 4]}/>
                    {/* odometry 유령 */}
                    <Line points={es.pts} closed fill={colors.muted} opacity={0.45}/>
                    <Arrow points={[es.base[0], es.base[1], es.tip[0], es.tip[1]]}
                           stroke={colors.muted} fill={colors.muted} strokeWidth={2}
                           pointerLength={6} pointerWidth={6} opacity={0.6}/>
                    {/* 실제 로봇 */}
                    <Line points={tr.pts} closed fill={colors.accent} opacity={0.9}
                          stroke={colors.text} strokeWidth={1.5}/>
                    <Arrow points={[tr.base[0], tr.base[1], tr.tip[0], tr.tip[1]]}
                           stroke={colors.text} fill={colors.text} strokeWidth={2}
                           pointerLength={6} pointerWidth={6}/>
                    <Text x={6} y={6}
                          text={t("solid = actual robot, gray ghost = where odometry thinks it is",
                              "진한 쪽 = 실제 로봇, 회색 유령 = odometry 가 생각하는 위치")}
                          fontSize={11} fill={colors.muted}/>
                </Layer>
            </Stage>
            <div className="w-full flex flex-col gap-1">
                <label className="flex items-center gap-2 text-xs text-muted">
                    <span className="w-40 shrink-0">
                        {t("right wheel radius error", "오른쪽 바퀴 반지름 오차")}
                    </span>
                    <input type="range" min={-3} max={3} step={0.1} value={errPct}
                           onChange={(e) => setErrPct(parseFloat(e.target.value))}
                           className="w-full accent-[var(--accent)]"
                           aria-label={t("right wheel radius error", "오른쪽 바퀴 반지름 오차")}/>
                    <span className="w-12 shrink-0 text-right tabular-nums">{errPct.toFixed(1)}%</span>
                </label>
            </div>
            <div className="text-xs text-muted text-center tabular-nums">
                {t("position error", "위치 오차")}{" "}
                <span className="font-semibold"
                      style={{color: err > 0.1 ? "#e0533d" : "var(--accent)"}}>
                    {err.toFixed(3)}
                </span>
                {" · "}{t("distance driven", "주행 거리")} {s.dist.toFixed(1)}
                {" · "}
                {t("the error only ever grows. press the fix button and watch it start growing again",
                    "오차는 쌓이기만 한다. 보정 버튼을 눌러도 곧 다시 자라기 시작한다")}
            </div>
        </div>
    );
};

const OdometryDrift = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "odometry drift: a 1% wheel radius mismatch bends the believed circle away from the real one, and the error accumulates until an external sensor resets it",
            "odometry drift: 바퀴 반지름이 1% 만 달라도 odometry 가 믿는 원과 실제 원이 갈라지고, 오차는 외부 센서로 보정하기 전까지 쌓이기만 한다",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<OdometryScene panel={Math.min(modalCanvasSize(1).width, 680)}/>}
    >
        <OdometryScene panel={360}/>
    </CanvasFigure>;
};

export default OdometryDrift;
