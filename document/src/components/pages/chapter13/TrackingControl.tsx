import {useEffect, useRef, useState} from "react";
import {Arrow, Layer, Line, Stage, Text} from "react-konva";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";

// 직선 도로를 달리는 기준 자세(회색 유령)를 쫓아가는 diff-drive 의 추종 제어 비교.
//  - 선형 P (책 13.29): 몸 앞의 점 P 만 기준점으로 끌어당긴다. 방향에 대한 항이 없어서,
//    거꾸로 보고 시작하면 "점은 잘 쫓아가는데 몸은 뒤집힌 채" 영원히 후진으로 달린다
//    (책 그림 13.19 의 cusp). 검은 화살표(몸이 보는 방향)와 주황 화살표(실제 진행 방향)가
//    반대를 가리키는 것이 그 상태다.
//  - 비선형 (책 13.31): 방향 오차 φe 가 법칙 안에 들어 있어 몸을 돌려 세운 뒤 전진으로
//    수렴한다.
type Law = "linear" | "nonlinear";
type Start = "mild" | "reversed";

const VD = 0.28;               // 기준 전진 속도 (직선, ωd = 0)
const ROAD_Y = 0;
const XR = 0.28;               // 점 P 를 몸 앞에 멀찍이 두면 cusp 현상이 잘 보인다
const KP_LIN = 2.2;
const K1 = 2.5, K2 = 16, K3 = 5;

interface SimState {
    phi: number; x: number; y: number;
    xd: number;                 // 기준 자세의 x (도로 위, 오른쪽으로 등속)
    trail: Array<[number, number]>;
    cusps: Array<[number, number]>;   // 전후진이 뒤집힌 지점들
    lastV: number;
    backward: boolean;
}

const startPose = (kind: Start): SimState => kind === "mild"
    ? {phi: 0.9, x: -0.75, y: -0.4, xd: -0.55, trail: [], cusps: [], lastV: 0, backward: false}
    // 도로 위에서 정확히 반대를 보고 시작: 점 추종 법칙이 로봇을 한참 뒤로 끌고 간다.
    : {phi: Math.PI, x: -0.45, y: -0.04, xd: -0.55, trail: [], cusps: [], lastV: 0, backward: false};

interface SceneProps {
    panel?: number;
}

const TrackingScene = ({panel = 360}: SceneProps) => {
    const colors = useCanvasColors();
    const t = useTr();
    const [law, setLaw] = useState<Law>("linear");
    const [start, setStart] = useState<Start>("reversed");
    const [, setTick] = useState(0);
    const stateRef = useRef<SimState>(startPose("reversed"));
    const cfgRef = useRef({law, start});
    cfgRef.current = {law, start};

    useEffect(() => {
        let raf = 0, last: number | null = null;
        const loop = (ts: number) => {
            if (last === null) last = ts;
            const dt = Math.min((ts - last) / 1000, 0.04);
            last = ts;
            const s = stateRef.current;
            const {law: lw} = cfgRef.current;
            s.xd += VD * dt;
            const phid = 0, xd = s.xd, yd = ROAD_Y;
            let v = 0, w = 0;
            if (lw === "linear") {
                // 순수 P 점 추종 (13.29) → (13.21) 변환. 방향 오차는 등장하지 않는다.
                const px = s.x + XR * Math.cos(s.phi), py = s.y + XR * Math.sin(s.phi);
                const pdx = xd + XR, pdy = yd;
                const dpx = KP_LIN * (pdx - px), dpy = KP_LIN * (pdy - py);
                v = Math.cos(s.phi) * dpx + Math.sin(s.phi) * dpy;
                w = (-Math.sin(s.phi) * dpx + Math.cos(s.phi) * dpy) / XR;
            } else {
                // 비선형 (13.31). 이 법칙은 |φe| < π/2 를 가정하므로, 그 밖에서는 먼저
                // 제자리에서 몸을 돌려 세운다 (diff-drive 라서 가능한 처치).
                const xe = s.x - xd;
                const ye = s.y - yd;
                let phie = s.phi - phid;
                phie = Math.atan2(Math.sin(phie), Math.cos(phie));
                if (Math.abs(phie) > 1.2) {
                    v = 0;
                    w = -2.4 * Math.sign(phie);
                } else {
                    const c = Math.cos(phie);
                    v = (VD - K1 * Math.abs(VD) * (xe + ye * Math.tan(phie))) / c;
                    w = -(K2 * VD * ye + K3 * Math.abs(VD) * Math.tan(phie)) * c * c;
                    v = Math.max(-0.8, Math.min(0.8, v));
                    w = Math.max(-4, Math.min(4, w));
                }
            }
            s.backward = v < -0.01;
            // 전후진이 뒤집히는 순간이 cusp: 자취에 영구 표시한다.
            if (s.lastV * v < -1e-4 && Math.abs(v - s.lastV) > 0.05) {
                s.cusps.push([s.x, s.y]);
                if (s.cusps.length > 8) s.cusps.shift();
            }
            s.lastV = v;
            s.phi += w * dt;
            s.x += v * Math.cos(s.phi) * dt;
            s.y += v * Math.sin(s.phi) * dt;
            s.trail.push([s.x, s.y]);
            if (s.trail.length > 400) s.trail.shift();
            setTick((n) => n + 1);
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, []);

    const s = stateRef.current;
    let phie = Math.atan2(Math.sin(s.phi), Math.cos(s.phi));
    const phieAbs = Math.abs(phie);
    const posErr = Math.hypot(s.x - s.xd, s.y - ROAD_Y);
    const cusp = s.backward && posErr < 0.12;

    const W = panel, H = Math.round(panel * 0.72);
    const S = panel / 2.6;
    // 카메라가 기준 자세를 따라간다: 유령은 항상 화면 중앙 근처, 로봇은 그 주위에 보인다.
    const camX = s.xd;
    const sx = (x: number) => W / 2 + (x - camX) * S;
    const sy = (y: number) => H / 2 - y * S;

    const robot = (phi: number, x: number, y: number) => {
        const c = Math.cos(phi), si = Math.sin(phi);
        return {
            pts: [[0.1, 0.065], [0.1, -0.065], [-0.1, -0.065], [-0.1, 0.065]]
                .flatMap(([a, b]) => [sx(x + a * c - b * si), sy(y + a * si + b * c)]),
            base: [sx(x + 0.1 * c), sy(y + 0.1 * si)] as [number, number],
            tip: [sx(x + 0.2 * c), sy(y + 0.2 * si)] as [number, number],
        };
    };
    const act = robot(s.phi, s.x, s.y);
    const ref = robot(0, s.xd, ROAD_Y);
    // 실제 진행 방향 화살표 (뒷걸음질이면 heading 과 반대).
    const moveDir = s.backward ? s.phi + Math.PI : s.phi;
    const mv = {
        a: [sx(s.x + 0.12 * Math.cos(moveDir)), sy(s.y + 0.12 * Math.sin(moveDir))] as [number, number],
        b: [sx(s.x + 0.26 * Math.cos(moveDir)), sy(s.y + 0.26 * Math.sin(moveDir))] as [number, number],
    };

    const btn = (active: boolean, label: string, onClick: () => void) => (
        <button key={label} onClick={onClick}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${
                    active
                        ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10"
                        : "border-border text-muted hover:text-[var(--text)]"
                }`}>
            {label}
        </button>
    );
    const reset = () => {
        stateRef.current = startPose(cfgRef.current.start);
    };

    return (
        <div className="flex flex-col gap-2 items-center">
            <div className="flex flex-row flex-wrap gap-1.5 justify-center">
                {btn(law === "linear", t("linear P (point tracking)", "선형 P (점 추종)"), () => {
                    setLaw("linear");
                    window.setTimeout(reset, 0);
                })}
                {btn(law === "nonlinear", t("nonlinear (13.31)", "비선형 (식 13.31)"), () => {
                    setLaw("nonlinear");
                    window.setTimeout(reset, 0);
                })}
                {btn(start === "mild", t("start: tilted", "시작: 비스듬히"), () => {
                    setStart("mild");
                    stateRef.current = startPose("mild");
                })}
                {btn(start === "reversed", t("start: facing backwards", "시작: 거꾸로 보고"), () => {
                    setStart("reversed");
                    stateRef.current = startPose("reversed");
                })}
            </div>
            <Stage width={W} height={H}
                   className="bg-surface border border-border rounded-lg overflow-hidden">
                <Layer>
                    {/* 도로: 점선이 카메라 이동에 따라 흐른다 */}
                    <Line points={[0, sy(ROAD_Y), W, sy(ROAD_Y)]} stroke={colors.muted}
                          strokeWidth={1.5} dash={[9, 7]} dashOffset={(camX * S) % 16}/>
                    <Text x={W - 96} y={sy(ROAD_Y) - 18}
                          text={t("road (reference path)", "도로 (기준 경로)")} fontSize={10}
                          fill={colors.muted}/>
                    {/* 자취 */}
                    {s.trail.length > 1 && (
                        <Line points={s.trail.flatMap(([x, y]) => [sx(x), sy(y)])}
                              stroke={colors.accent} strokeWidth={2} opacity={0.4}
                              lineCap="round" lineJoin="round"/>
                    )}
                    {/* cusp 지점: 뒤로 끌려가다 방향이 꺾인 흔적 */}
                    {s.cusps.map(([cx2, cy2], i) => (
                        <Text key={i} x={sx(cx2) - 5} y={sy(cy2) - 7} text="✕" fontSize={13}
                              fontStyle="bold" fill="#e0533d"/>
                    ))}
                    {/* 기준 유령 */}
                    <Line points={ref.pts} closed fill={colors.muted} opacity={0.35}/>
                    <Arrow points={[ref.base[0], ref.base[1], ref.tip[0], ref.tip[1]]}
                           stroke={colors.muted} fill={colors.muted} strokeWidth={2}
                           pointerLength={7} pointerWidth={6} opacity={0.55}/>
                    {/* 실제 로봇 */}
                    <Line points={act.pts} closed
                          fill={cusp ? "#e0533d" : colors.accent} opacity={0.85}
                          stroke={colors.text} strokeWidth={1.5}/>
                    {/* 몸이 보는 방향 (검정) */}
                    <Arrow points={[act.base[0], act.base[1], act.tip[0], act.tip[1]]}
                           stroke={colors.text} fill={colors.text} strokeWidth={2.5}
                           pointerLength={8} pointerWidth={7}/>
                    {/* 실제 진행 방향 (주황) */}
                    {Math.hypot(mv.b[0] - mv.a[0], mv.b[1] - mv.a[1]) > 2 && (
                        <Arrow points={[mv.a[0], mv.a[1], mv.b[0], mv.b[1]]}
                               stroke="#e0a33d" fill="#e0a33d" strokeWidth={2.5}
                               pointerLength={8} pointerWidth={7} dash={s.backward ? [5, 4] : undefined}/>
                    )}
                    <Text x={6} y={6}
                          text={t("black arrow = heading · orange arrow = actual travel direction",
                              "검정 화살표 = 몸이 보는 방향 · 주황 화살표 = 실제 진행 방향")}
                          fontSize={11} fill={colors.muted}/>
                </Layer>
            </Stage>
            <div className="text-xs text-muted text-center tabular-nums">
                {t("position error", "위치 오차")}{" "}
                <span className="font-semibold"
                      style={{color: posErr < 0.16 ? "var(--accent)" : "#e0a33d"}}>
                    {posErr.toFixed(3)}
                </span>
                {" · "}|φe| = {(phieAbs * 180 / Math.PI).toFixed(0)}°
                {" · "}
                {s.backward
                    ? <span className="font-semibold" style={{color: "#e0533d"}}>
                        {t("being dragged backwards: the law tracks the point and ignores the heading",
                            "뒤로 끌려가는 중: 이 법칙은 점만 쫓고 방향은 신경 쓰지 않는다")}
                    </span>
                    : posErr < 0.16 && phieAbs < 0.35
                        ? <span className="font-semibold" style={{color: "var(--accent)"}}>
                            {s.cusps.length > 0
                                ? t("converged, but the ✕ cusps show where it was dragged backwards",
                                    "수렴했지만, 자취의 ✕ 가 뒤로 끌려갔던 cusp 지점이다")
                                : t("tracking forward, heading aligned", "전진 추종, 방향까지 맞음")}
                        </span>
                        : t("converging...", "수렴하는 중...")}
            </div>
        </div>
    );
};

const TrackingControl = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "start the robot facing backwards: the linear point-tracking law drags it in reverse and leaves cusps (✕) in the trail, while the nonlinear law turns the body around first",
            "거꾸로 보고 시작시켜 보라. 선형 점 추종 법칙은 로봇을 한동안 뒤로 끌고 다니며 자취에 cusp(✕)를 남기고, 비선형 법칙은 몸부터 돌려 세운다",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<TrackingScene panel={Math.min(modalCanvasSize(1.35).width, 760)}/>}
    >
        <TrackingScene panel={380}/>
    </CanvasFigure>;
};

export default TrackingControl;
