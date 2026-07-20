import {useEffect, useRef, useState} from "react";
import {Arrow, Circle, Layer, Line, Stage, Text} from "react-konva";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";

// canonical nonholonomic 모델 q̇ = (ω, v cosφ, v sinφ) 에서 로봇 종류의 차이는 오직
// (v, ω) 로 허용되는 영역, 즉 control set 의 모양뿐이다 (책 그림 13.11). 오른쪽에서
// (v, ω) 점을 끌면 영역 밖으로는 못 나가게 잘리고, 왼쪽 로봇이 실제로 그 명령으로 달린다.
// diff-drive 는 마름모라 제자리 회전이 되고, car 는 나비넥타이 모양이라 v = 0 이면
// ω = 0, 즉 제자리 회전이 불가능하다.
type Kind = "unicycle" | "diffdrive" | "car" | "fwdcar";

const V_MAX = 0.3, W_MAX = 1.2;
const K_CAR = W_MAX / V_MAX;      // car: |ω| ≤ K·|v| (최소 회전 반지름 vmax/ωmax)
const WHEELBASE = 0.16;

const clampToSet = (kind: Kind, v: number, w: number): [number, number] => {
    v = Math.max(kind === "fwdcar" ? 0 : -V_MAX, Math.min(V_MAX, v));
    w = Math.max(-W_MAX, Math.min(W_MAX, w));
    if (kind === "diffdrive") {
        const m = Math.abs(v) / V_MAX + Math.abs(w) / W_MAX;
        if (m > 1) {
            v /= m;
            w /= m;
        }
    }
    if (kind === "car" || kind === "fwdcar") {
        const lim = K_CAR * Math.abs(v);
        w = Math.max(-lim, Math.min(lim, w));
    }
    return [v, w];
};

// control set 폴리곤 (ω 가로축, v 세로축).
const setPolygon = (kind: Kind): Array<[number, number]> => {
    switch (kind) {
        case "unicycle":
            return [[-W_MAX, -V_MAX], [W_MAX, -V_MAX], [W_MAX, V_MAX], [-W_MAX, V_MAX]];
        case "diffdrive":
            return [[0, -V_MAX], [W_MAX, 0], [0, V_MAX], [-W_MAX, 0]];
        case "car":
            return [[-W_MAX, -V_MAX], [W_MAX, V_MAX], [-W_MAX, V_MAX], [W_MAX, -V_MAX]];
        default:
            return [[0, 0], [W_MAX, V_MAX], [-W_MAX, V_MAX]];
    }
};

interface SimState {
    phi: number; x: number; y: number;
    trail: Array<[number, number]>;
}

const freshState = (): SimState => ({phi: Math.PI / 2, x: 0, y: -0.3, trail: []});

interface SceneProps {
    panel?: number;
}

const DriveScene = ({panel = 300}: SceneProps) => {
    const colors = useCanvasColors();
    const t = useTr();
    const [kind, setKind] = useState<Kind>("diffdrive");
    const [cmd, setCmd] = useState<[number, number]>([0.2, 0.5]);   // (v, ω)
    const [, setTick] = useState(0);
    const stateRef = useRef<SimState>(freshState());
    const cmdRef = useRef(cmd);
    cmdRef.current = cmd;

    useEffect(() => {
        let raf = 0, last: number | null = null;
        const loop = (ts: number) => {
            if (last === null) last = ts;
            const dt = Math.min((ts - last) / 1000, 0.05);
            last = ts;
            const s = stateRef.current;
            const [v, w] = cmdRef.current;
            s.phi += w * dt;
            s.x += v * Math.cos(s.phi) * dt;
            s.y += v * Math.sin(s.phi) * dt;
            if (s.x > 1.15) s.x = -1.15;
            if (s.x < -1.15) s.x = 1.15;
            if (s.y > 1.15) s.y = -1.15;
            if (s.y < -1.15) s.y = 1.15;
            s.trail.push([s.x, s.y]);
            if (s.trail.length > 300) s.trail.shift();
            setTick((n) => n + 1);
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, []);

    const s = stateRef.current;
    const [v, w] = cmd;
    const psi = Math.abs(v) > 1e-4 ? Math.atan(WHEELBASE * w / v) : 0;

    const W = panel, H = panel;
    const S = panel / 2.6;
    const sx = (x: number) => W / 2 + x * S;
    const sy = (y: number) => H / 2 - y * S;
    const toWorld = (bx: number, by: number): [number, number] => [
        s.x + bx * Math.cos(s.phi) - by * Math.sin(s.phi),
        s.y + bx * Math.sin(s.phi) + by * Math.cos(s.phi),
    ];
    const seg = (a: [number, number], b: [number, number]) => {
        const [x1, y1] = toWorld(a[0], a[1]);
        const [x2, y2] = toWorld(b[0], b[1]);
        return [sx(x1), sy(y1), sx(x2), sy(y2)];
    };

    // control set 패널 좌표.
    const cs = (wv: [number, number]): [number, number] => [
        W / 2 + (wv[0] / W_MAX) * (W / 2 - 26),
        H / 2 - (wv[1] / V_MAX) * (H / 2 - 26),
    ];

    const kinds: Array<{k: Kind; en: string; ko: string}> = [
        {k: "unicycle", en: "unicycle", ko: "unicycle"},
        {k: "diffdrive", en: "diff-drive", ko: "diff-drive"},
        {k: "car", en: "car (reverse gear)", ko: "car (후진 가능)"},
        {k: "fwdcar", en: "forward-only car", ko: "전진만 되는 car"},
    ];

    return (
        <div className="flex flex-col gap-2 items-center">
            <div className="flex flex-row flex-wrap gap-1.5 justify-center">
                {kinds.map(({k, en, ko}) => (
                    <button key={k} onClick={() => {
                        setKind(k);
                        setCmd(clampToSet(k, 0.2, 0.5));
                        stateRef.current = freshState();
                    }}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${
                                kind === k
                                    ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10"
                                    : "border-border text-muted hover:text-[var(--text)]"
                            }`}>
                        {t(en, ko)}
                    </button>
                ))}
            </div>
            <div className="flex flex-row flex-wrap gap-3 items-start justify-center">
                {/* 주행 장면 */}
                <div className="flex flex-col items-center gap-0.5">
                    <Stage width={W} height={H}
                           className="bg-surface border border-border rounded-lg overflow-hidden">
                        <Layer>
                            {s.trail.length > 1 && (
                                <Line points={s.trail.flatMap(([x, y]) => [sx(x), sy(y)])}
                                      stroke={colors.accent} strokeWidth={2} opacity={0.4}
                                      lineCap="round" lineJoin="round"/>
                            )}
                            {/* 몸체 */}
                            <Line points={[
                                ...seg([0.11, 0.07], [0.11, -0.07]).slice(0, 2),
                                ...seg([0.11, -0.07], [-0.11, -0.07]).slice(0, 2),
                                ...seg([-0.11, -0.07], [-0.11, 0.07]).slice(0, 2),
                                ...seg([-0.11, 0.07], [0.11, 0.07]).slice(0, 2),
                            ]} closed fill={colors.accent} opacity={0.8}
                                  stroke={colors.text} strokeWidth={1.5}/>
                            {/* 바퀴 */}
                            {(kind === "car" || kind === "fwdcar") ? (
                                <>
                                    {/* 뒷바퀴 둘 + 조향 앞바퀴 둘 */}
                                    <Line points={seg([-0.08, 0.085], [-0.03, 0.085])}
                                          stroke={colors.text} strokeWidth={4} lineCap="round"/>
                                    <Line points={seg([-0.08, -0.085], [-0.03, -0.085])}
                                          stroke={colors.text} strokeWidth={4} lineCap="round"/>
                                    <Line points={seg(
                                        [0.08 - 0.026 * Math.cos(psi), 0.085 - 0.026 * Math.sin(psi)],
                                        [0.08 + 0.026 * Math.cos(psi), 0.085 + 0.026 * Math.sin(psi)])}
                                          stroke={colors.text} strokeWidth={4} lineCap="round"/>
                                    <Line points={seg(
                                        [0.08 - 0.026 * Math.cos(psi), -0.085 - 0.026 * Math.sin(psi)],
                                        [0.08 + 0.026 * Math.cos(psi), -0.085 + 0.026 * Math.sin(psi)])}
                                          stroke={colors.text} strokeWidth={4} lineCap="round"/>
                                </>
                            ) : (
                                <>
                                    <Line points={seg([0, 0.085], [0.05, 0.085])}
                                          stroke={colors.text} strokeWidth={4} lineCap="round"/>
                                    <Line points={seg([0, -0.085], [0.05, -0.085])}
                                          stroke={colors.text} strokeWidth={4} lineCap="round"/>
                                </>
                            )}
                            {/* 전방 화살표 */}
                            <Arrow points={seg([0.11, 0], [0.2, 0])}
                                   stroke={colors.text} fill={colors.text} strokeWidth={2}
                                   pointerLength={7} pointerWidth={6}/>
                            <Text x={6} y={6}
                                  text={t("driving with your (v, ω)", "고른 (v, ω) 로 달리는 중")}
                                  fontSize={11} fill={colors.muted}/>
                        </Layer>
                    </Stage>
                    <span className="text-xs text-muted">{t("scene", "장면")}</span>
                </div>
                {/* control set */}
                <div className="flex flex-col items-center gap-0.5">
                    <Stage width={W} height={H}
                           className="bg-surface border border-border rounded-lg overflow-hidden">
                        <Layer>
                            <Line points={[0, H / 2, W, H / 2]} stroke={colors.border} strokeWidth={1}/>
                            <Line points={[W / 2, 0, W / 2, H]} stroke={colors.border} strokeWidth={1}/>
                            <Text x={W - 20} y={H / 2 + 6} text="ω" fontSize={12} fill={colors.muted}/>
                            <Text x={W / 2 + 8} y={8} text="v" fontSize={12} fill={colors.muted}/>
                            <Line points={setPolygon(kind).flatMap((p) => cs(p))} closed
                                  fill={colors.accent} opacity={0.18}
                                  stroke={colors.accent} strokeWidth={1.5}/>
                            <Circle x={cs([w, v])[0]} y={cs([w, v])[1]} radius={9}
                                    fill={colors.accent} draggable
                                    onDragMove={(e) => {
                                        const wRaw = ((e.target.x() - W / 2) / (W / 2 - 26)) * W_MAX;
                                        const vRaw = ((H / 2 - e.target.y()) / (H / 2 - 26)) * V_MAX;
                                        const [cv, cw] = clampToSet(kind, vRaw, wRaw);
                                        setCmd([cv, cw]);
                                        const p = cs([cw, cv]);
                                        e.target.position({x: p[0], y: p[1]});
                                    }}/>
                            <Text x={6} y={6}
                                  text={t("drag (v, ω): you cannot leave the set", "(v, ω) 를 끌어 보라. 영역 밖으로는 못 나간다")}
                                  fontSize={11} fill={colors.muted}/>
                        </Layer>
                    </Stage>
                    <span className="text-xs text-muted">
                        {t("the control set is the only difference between these robots",
                            "로봇들의 유일한 차이는 이 control set 모양이다")}
                    </span>
                </div>
            </div>
            <div className="text-xs text-muted text-center tabular-nums">
                v = {v.toFixed(2)} · ω = {w.toFixed(2)}
                {(kind === "car" || kind === "fwdcar") && (
                    <span> · {t("steering", "조향각")} ψ = {(psi * 180 / Math.PI).toFixed(0)}°
                        {Math.abs(v) < 0.02 && (
                            <span className="font-semibold" style={{color: "#e0533d"}}>
                                {" · "}{t("v ≈ 0 forces ω = 0: a car cannot spin in place", "v ≈ 0 이면 ω = 0. car 는 제자리 회전이 안 된다")}
                            </span>
                        )}
                    </span>
                )}
            </div>
        </div>
    );
};

const DriveControlSets = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "unicycle, diff-drive, and car share the same kinematics; only the (v, ω) control set differs. drag the dot: the diamond lets a diff-drive spin in place, the bowtie forbids it for a car",
            "unicycle, diff-drive, car 의 kinematics 는 같고 (v, ω) control set 모양만 다르다. 점을 끌어 보라. 마름모(diff-drive)는 제자리 회전이 되고, 나비넥타이(car)는 안 된다",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<DriveScene panel={Math.floor(modalCanvasSize(2.15).width / 2) - 16}/>}
    >
        <DriveScene panel={300}/>
    </CanvasFigure>;
};

export default DriveControlSets;
