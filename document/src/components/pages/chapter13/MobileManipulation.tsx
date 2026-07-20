import {useEffect, useRef, useState} from "react";
import {Arrow, Circle, Layer, Line, Stage, Text} from "react-konva";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";

// 책 그림 13.24 를 닮은 평면 mobile manipulation: diff-drive 베이스 위에 1R 팔이 얹혀
// 있고, end-effector 가 큰 원 궤적을 따라가야 한다. 팔 하나로는 닿는 범위가 반지름
// L1 뿐이라 어림도 없다. Je = [J_base J_arm] 전체를 써서 (v, ω, θ̇1) 세 입력을 함께
// 풀면, 베이스가 굴러가며 팔이 마무리하는 협조 동작이 나온다. "베이스 고정" 버튼으로
// 팔만 쓰면 어떻게 되는지도 비교해 보라.
const L1 = 0.42;               // 팔 길이
const D0 = 0.22;               // 팔 관절의 베이스 전방 오프셋
const R_TRAJ = 0.8;            // 원하는 EE 궤적 (원)
const T_LOOP = 14;
const KP = 2.4, KPA = 2.0;
const DAMP = 0.003;            // damped least squares

interface SimState {
    phi: number; x: number; y: number; th1: number;
    t: number;
    trail: Array<[number, number]>;
}

const freshState = (): SimState => ({
    phi: Math.PI / 2, x: -0.15, y: -R_TRAJ + 0.15, th1: 0.6, t: 0, trail: [],
});

const eePose = (s: {phi: number; x: number; y: number; th1: number}) => {
    const jx = s.x + D0 * Math.cos(s.phi);
    const jy = s.y + D0 * Math.sin(s.phi);
    const a = s.phi + s.th1;
    return {jx, jy, ex: jx + L1 * Math.cos(a), ey: jy + L1 * Math.sin(a), alpha: a};
};

// 3×3 연립 J u = b 를 damped least squares 로 푼다 (JᵀJ + λI) u = Jᵀ b.
const solve3 = (J: number[][], b: number[]): number[] => {
    const A = [[DAMP, 0, 0], [0, DAMP, 0], [0, 0, DAMP]];
    const rhs = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            for (let k = 0; k < 3; k++) A[i][j] += J[k][i] * J[k][j];
        }
        for (let k = 0; k < 3; k++) rhs[i] += J[k][i] * b[k];
    }
    // 3×3 가우스 소거.
    const M = A.map((row, i) => [...row, rhs[i]]);
    for (let c = 0; c < 3; c++) {
        let p = c;
        for (let r = c + 1; r < 3; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
        [M[c], M[p]] = [M[p], M[c]];
        if (Math.abs(M[c][c]) < 1e-9) return [0, 0, 0];
        for (let r = 0; r < 3; r++) {
            if (r === c) continue;
            const f = M[r][c] / M[c][c];
            for (let k = c; k < 4; k++) M[r][k] -= f * M[c][k];
        }
    }
    return [M[0][3] / M[0][0], M[1][3] / M[1][1], M[2][3] / M[2][2]];
};

interface SceneProps {
    panel?: number;
}

const MobileManipScene = ({panel = 360}: SceneProps) => {
    const colors = useCanvasColors();
    const t = useTr();
    const [baseLocked, setBaseLocked] = useState(false);
    const [, setTick] = useState(0);
    const stateRef = useRef<SimState>(freshState());
    const lockRef = useRef(baseLocked);
    lockRef.current = baseLocked;

    useEffect(() => {
        let raf = 0, last: number | null = null;
        const loop = (ts: number) => {
            if (last === null) last = ts;
            const dt = Math.min((ts - last) / 1000, 0.04);
            last = ts;
            const s = stateRef.current;
            s.t += dt;
            const thT = -Math.PI / 2 + (2 * Math.PI * s.t) / T_LOOP;
            const tx = R_TRAJ * Math.cos(thT), ty = R_TRAJ * Math.sin(thT);
            const ta = thT + Math.PI / 2;
            const dthT = (2 * Math.PI) / T_LOOP;
            const {jx, jy, ex, ey, alpha} = eePose(s);
            // 명령 EE 속도: feedforward + P (자세각 오차 포함).
            const bx = -R_TRAJ * Math.sin(thT) * dthT + KP * (tx - ex);
            const by = R_TRAJ * Math.cos(thT) * dthT + KP * (ty - ey);
            let ea = ta - alpha;
            ea = Math.atan2(Math.sin(ea), Math.cos(ea));
            const ba = dthT + KPA * ea;
            // J 의 열: [v, ω, θ̇1] → (ẋe, ẏe, α̇).
            const J = [
                [Math.cos(s.phi), -(ey - s.y), -(ey - jy)],
                [Math.sin(s.phi), ex - s.x, ex - jx],
                [0, 1, 1],
            ];
            let [v, w, dth1] = solve3(J, [bx, by, ba]);
            if (lockRef.current) {
                // 베이스 고정: 팔 관절 하나로만 풀어 본다 (최소자승 1변수).
                const jc = [-(ey - jy), ex - jx, 1];
                const num = jc[0] * bx + jc[1] * by + jc[2] * ba;
                const den = jc[0] * jc[0] + jc[1] * jc[1] + jc[2] * jc[2] + DAMP;
                v = 0;
                w = 0;
                dth1 = num / den;
            }
            v = Math.max(-0.8, Math.min(0.8, v));
            w = Math.max(-3, Math.min(3, w));
            dth1 = Math.max(-3, Math.min(3, dth1));
            s.phi += w * dt;
            s.x += v * Math.cos(s.phi) * dt;
            s.y += v * Math.sin(s.phi) * dt;
            s.th1 += dth1 * dt;
            const ee = eePose(s);
            s.trail.push([ee.ex, ee.ey]);
            if (s.trail.length > 450) s.trail.shift();
            setTick((n) => n + 1);
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, []);

    const s = stateRef.current;
    const thT = -Math.PI / 2 + (2 * Math.PI * s.t) / T_LOOP;
    const tx = R_TRAJ * Math.cos(thT), ty = R_TRAJ * Math.sin(thT);
    const {jx, jy, ex, ey} = eePose(s);
    const err = Math.hypot(tx - ex, ty - ey);

    const W = panel, H = panel;
    const S = panel / 2.4;
    const sx = (x: number) => W / 2 + x * S;
    const sy = (y: number) => H / 2 - y * S;

    const c = Math.cos(s.phi), si = Math.sin(s.phi);
    const basePts = [[0.14, 0.1], [0.14, -0.1], [-0.14, -0.1], [-0.14, 0.1]]
        .flatMap(([a, b]) => [sx(s.x + a * c - b * si), sy(s.y + a * si + b * c)]);

    return (
        <div className="flex flex-col gap-2 items-center">
            <div className="flex flex-row gap-1.5">
                <button onClick={() => setBaseLocked(false)}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${
                            !baseLocked
                                ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10"
                                : "border-border text-muted hover:text-[var(--text)]"
                        }`}>
                    {t("base + arm together", "베이스 + 팔 협조")}
                </button>
                <button onClick={() => setBaseLocked(true)}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${
                            baseLocked
                                ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10"
                                : "border-border text-muted hover:text-[var(--text)]"
                        }`}>
                    {t("base locked (arm only)", "베이스 고정 (팔만)")}
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
                    {/* 원하는 EE 궤적 */}
                    <Circle x={sx(0)} y={sy(0)} radius={R_TRAJ * S} stroke={colors.muted}
                            strokeWidth={1.5} dash={[6, 5]}/>
                    {/* EE 실제 자취 */}
                    {s.trail.length > 1 && (
                        <Line points={s.trail.flatMap(([x, y]) => [sx(x), sy(y)])}
                              stroke={colors.accent} strokeWidth={2} opacity={0.45}
                              lineCap="round" lineJoin="round"/>
                    )}
                    {/* 목표점 */}
                    <Circle x={sx(tx)} y={sy(ty)} radius={7} stroke="#e0533d" strokeWidth={2.5}/>
                    {/* 베이스 */}
                    <Line points={basePts} closed fill={colors.accent} opacity={0.75}
                          stroke={colors.text} strokeWidth={1.5}/>
                    <Arrow points={[sx(s.x + 0.14 * c), sy(s.y + 0.14 * si),
                        sx(s.x + 0.24 * c), sy(s.y + 0.24 * si)]}
                           stroke={colors.text} fill={colors.text} strokeWidth={2}
                           pointerLength={6} pointerWidth={6}/>
                    {/* 팔 */}
                    <Line points={[sx(jx), sy(jy), sx(ex), sy(ey)]} stroke={colors.text}
                          strokeWidth={5} lineCap="round"/>
                    <Circle x={sx(jx)} y={sy(jy)} radius={5} fill={colors.text}/>
                    <Circle x={sx(ex)} y={sy(ey)} radius={6}
                            fill={err < 0.05 ? colors.accent : "#e0a33d"}/>
                    <Text x={6} y={6}
                          text={t("red ring = desired end-effector target on the big circle",
                              "빨간 고리 = 큰 원 위의 end-effector 목표점")}
                          fontSize={11} fill={colors.muted}/>
                </Layer>
            </Stage>
            <div className="text-xs text-muted text-center tabular-nums">
                {t("EE error", "EE 오차")}{" "}
                <span className="font-semibold"
                      style={{color: err < 0.05 ? "var(--accent)" : "#e0533d"}}>
                    {err.toFixed(3)}
                </span>
                {" · "}
                {baseLocked
                    ? <span className="font-semibold" style={{color: "#e0533d"}}>
                        {t("the arm alone reaches only a tiny circle: it cannot follow", "팔만으로는 반지름 L1 안쪽이 전부다. 못 따라간다")}
                    </span>
                    : t("the base rolls to carry the arm, the arm does the fine work", "베이스가 팔을 실어 나르고, 팔이 마무리를 맡는다")}
            </div>
        </div>
    );
};

const MobileManipulation = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "mobile manipulation: solving Je = [J_base J_arm] drives wheels and joint together so the end-effector tracks a circle far bigger than the arm's reach. lock the base and the task becomes impossible",
            "mobile manipulation: Je = [J_base J_arm] 를 통째로 풀면 바퀴와 관절이 함께 움직여, 팔 길이보다 훨씬 큰 원을 end-effector 가 따라간다. 베이스를 고정하면 불가능해지는 것도 확인해 보라",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<MobileManipScene panel={Math.min(modalCanvasSize(1).width, 680)}/>}
    >
        <MobileManipScene panel={360}/>
    </CanvasFigure>;
};

export default MobileManipulation;
