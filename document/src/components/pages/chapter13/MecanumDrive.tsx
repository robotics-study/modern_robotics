import {useEffect, useRef, useState} from "react";
import {Arrow, Layer, Line, Stage, Text} from "react-konva";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";

// 네 바퀴 mecanum 로봇 (책 그림 13.5, youBot 배치). 몸체 속도 (vx, vy, ω) 를 조종하면
// u = H(0)Vb 로 각 바퀴의 구동 속도가 정해지고, 로봇이 실제로 그렇게 움직인다.
// 바퀴 옆의 막대가 구동 속도 ui 다. 옆걸음, 대각선, 제자리 회전에서 네 바퀴가 어떻게
// 역할을 나누는지 preset 버튼으로 확인해 보라.
const L = 0.235, W_HALF = 0.15, R_WHEEL = 0.05;

// u = H(0)Vb (식 13.10). 행 순서: 앞왼(1), 앞오른(2), 뒤오른(3), 뒤왼(4).
const wheelSpeeds = (w: number, vx: number, vy: number): number[] => [
    (-(L + W_HALF) * w + vx - vy) / R_WHEEL,
    ((L + W_HALF) * w + vx + vy) / R_WHEEL,
    ((L + W_HALF) * w + vx - vy) / R_WHEEL,
    (-(L + W_HALF) * w + vx + vy) / R_WHEEL,
];

const PRESETS: Array<{name: {en: string; ko: string}; v: [number, number, number]}> = [
    {name: {en: "forward", ko: "전진"}, v: [0, 0.25, 0]},
    {name: {en: "sideways", ko: "옆걸음"}, v: [0, 0, 0.25]},
    {name: {en: "diagonal", ko: "대각선"}, v: [0, 0.18, 0.18]},
    {name: {en: "spin in place", ko: "제자리 회전"}, v: [1.2, 0, 0]},
    {name: {en: "arc", ko: "곡선 주행"}, v: [0.8, 0.25, 0]},
];

interface SimState {
    phi: number; x: number; y: number;
    trail: Array<[number, number]>;
    spin: number[];              // 바퀴 굴림 각 (시각화용)
}

const freshState = (): SimState => ({phi: 0, x: 0, y: 0, trail: [], spin: [0, 0, 0, 0]});

interface SceneProps {
    panel?: number;
}

const MecanumScene = ({panel = 340}: SceneProps) => {
    const colors = useCanvasColors();
    const t = useTr();
    const [cmd, setCmd] = useState<[number, number, number]>([0, 0.25, 0]);
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
            const [w, vx, vy] = cmdRef.current;
            // body twist 를 world 로 적분.
            s.phi += w * dt;
            s.x += (vx * Math.cos(s.phi) - vy * Math.sin(s.phi)) * dt;
            s.y += (vx * Math.sin(s.phi) + vy * Math.cos(s.phi)) * dt;
            // 화면 밖으로 나가면 반대편에서 돌아온다.
            if (s.x > 1.15) s.x = -1.15;
            if (s.x < -1.15) s.x = 1.15;
            if (s.y > 1.15) s.y = -1.15;
            if (s.y < -1.15) s.y = 1.15;
            const u = wheelSpeeds(w, vx, vy);
            u.forEach((ui, i) => {
                s.spin[i] += ui * dt;
            });
            s.trail.push([s.x, s.y]);
            if (s.trail.length > 240) s.trail.shift();
            setTick((n) => n + 1);
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, []);

    const s = stateRef.current;
    const u = wheelSpeeds(cmd[0], cmd[1], cmd[2]);
    const uMax = 12;

    const W = panel, H = panel;
    const S = panel / 2.6;
    const sx = (x: number) => W / 2 + x * S;
    const sy = (y: number) => H / 2 - y * S;

    // 몸체 좌표 → 화면.
    const toWorld = (bx: number, by: number): [number, number] => [
        s.x + bx * Math.cos(s.phi) - by * Math.sin(s.phi),
        s.y + bx * Math.sin(s.phi) + by * Math.cos(s.phi),
    ];
    // 바퀴 (몸체 좌표): 앞왼, 앞오른, 뒤오른, 뒤왼. 롤러 줄무늬 각도 γ = ∓45°.
    const wheels: Array<{p: [number, number]; gamma: number}> = [
        {p: [L, W_HALF], gamma: -Math.PI / 4},
        {p: [L, -W_HALF], gamma: Math.PI / 4},
        {p: [-L, -W_HALF], gamma: -Math.PI / 4},
        {p: [-L, W_HALF], gamma: Math.PI / 4},
    ];
    // 주의: 화면에서 로봇 전방을 +y(위) 로 그리기 위해 몸체 좌표 (x앞, y왼) 을
    // 화면용 (bx=왼오, by=앞뒤) 로 돌려 쓴다.
    const chassisCorners: Array<[number, number]> = [
        [L + 0.06, W_HALF + 0.05], [L + 0.06, -W_HALF - 0.05],
        [-L - 0.06, -W_HALF - 0.05], [-L - 0.06, W_HALF + 0.05],
    ];

    const slider = (label: string, idx: number, min: number, max: number) => (
        <label key={label} className="flex items-center gap-2 text-xs text-muted">
            <span className="w-8 shrink-0">{label}</span>
            <input type="range" min={min} max={max} step={0.01} value={cmd[idx]}
                   onChange={(e) => {
                       const v = parseFloat(e.target.value);
                       setCmd((old) => old.map((o, i) => (i === idx ? v : o)) as [number, number, number]);
                   }}
                   className="w-full accent-[var(--accent)]" aria-label={label}/>
            <span className="w-12 shrink-0 text-right tabular-nums">{cmd[idx].toFixed(2)}</span>
        </label>
    );

    return (
        <div className="flex flex-col gap-2 items-center">
            <div className="flex flex-row flex-wrap gap-1.5 justify-center">
                {PRESETS.map((p) => (
                    <button key={p.name.en}
                            onClick={() => setCmd(p.v)}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${
                                cmd[0] === p.v[0] && cmd[1] === p.v[1] && cmd[2] === p.v[2]
                                    ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10"
                                    : "border-border text-muted hover:text-[var(--text)]"
                            }`}>
                        {t(p.name.en, p.name.ko)}
                    </button>
                ))}
                <button onClick={() => {
                    stateRef.current = freshState();
                }}
                        className="px-2.5 py-1 rounded-md text-xs font-semibold border border-border text-muted hover:text-[var(--text)] transition-colors">
                    {t("reset", "원위치")}
                </button>
            </div>
            <Stage width={W} height={H}
                   className="bg-surface border border-border rounded-lg overflow-hidden">
                <Layer>
                    {/* 자취 */}
                    {s.trail.length > 1 && (
                        <Line points={s.trail.flatMap(([x, y]) => [sx(x), sy(y)])}
                              stroke={colors.accent} strokeWidth={2} opacity={0.4}
                              lineCap="round" lineJoin="round"/>
                    )}
                    {/* 몸체 */}
                    <Line points={chassisCorners.flatMap((c) => {
                        const [wx2, wy2] = toWorld(c[0], c[1]);
                        return [sx(wx2), sy(wy2)];
                    })} closed fill={colors.accent} opacity={0.75}
                          stroke={colors.text} strokeWidth={1.5}/>
                    {/* 전방 화살표 */}
                    {(() => {
                        const [ax, ay] = toWorld(L + 0.02, 0);
                        const [bx2, by2] = toWorld(L + 0.16, 0);
                        return <Arrow points={[sx(ax), sy(ay), sx(bx2), sy(by2)]}
                                      stroke={colors.text} fill={colors.text} strokeWidth={2}
                                      pointerLength={7} pointerWidth={6}/>;
                    })()}
                    {/* 바퀴 + 롤러 줄무늬 + 속도 막대 */}
                    {wheels.flatMap((wh, i) => {
                        const [cxw, cyw] = toWorld(wh.p[0], wh.p[1]);
                        const wlen = 0.11, wwid = 0.045;
                        const ca = Math.cos(s.phi), sa = Math.sin(s.phi);
                        const corners = [
                            [wlen / 2, wwid / 2], [wlen / 2, -wwid / 2],
                            [-wlen / 2, -wwid / 2], [-wlen / 2, wwid / 2],
                        ].map(([a, b]) => [cxw + a * ca - b * sa, cyw + a * sa + b * ca]);
                        // 롤러 줄무늬: γ = ∓45° 방향 짧은 선들이 바퀴 굴림에 따라 흐른다.
                        const roll = (((s.spin[i] * 0.012) % 0.045) + 0.045) % 0.045 - 0.0225;
                        const g = wh.gamma;
                        const ex = 0.018 * Math.cos(g), ey = 0.018 * Math.sin(g);
                        const nodes = [
                            <Line key={`w${i}`} points={corners.flatMap(([a, b]) => [sx(a), sy(b)])}
                                  closed fill={colors.text} opacity={0.85}/>,
                        ];
                        [-0.03, 0, 0.03].forEach((off, k) => {
                            const o = off + roll;
                            if (Math.abs(o) > 0.042) return;
                            const p1: [number, number] = [cxw + (o - ex) * ca + ey * sa, cyw + (o - ex) * sa - ey * ca];
                            const p2: [number, number] = [cxw + (o + ex) * ca - ey * sa, cyw + (o + ex) * sa + ey * ca];
                            nodes.push(
                                <Line key={`s${i}-${k}`}
                                      points={[sx(p1[0]), sy(p1[1]), sx(p2[0]), sy(p2[1])]}
                                      stroke={colors.border} strokeWidth={1.5} opacity={0.9}/>,
                            );
                        });
                        return nodes;
                    })}
                    {wheels.map((wh, i) => {
                        const outSign = wh.p[1] >= 0 ? 1 : -1;
                        const [b1x, b1y] = toWorld(wh.p[0], wh.p[1] + outSign * 0.1);
                        const [b2x, b2y] = toWorld(wh.p[0] + Math.max(-1, Math.min(1, u[i] / uMax)) * 0.17,
                            wh.p[1] + outSign * 0.1);
                        return (
                            <Arrow key={`u${i}`} points={[sx(b1x), sy(b1y), sx(b2x), sy(b2y)]}
                                   stroke={u[i] >= 0 ? colors.accent : "#e0533d"}
                                   fill={u[i] >= 0 ? colors.accent : "#e0533d"}
                                   strokeWidth={3} pointerLength={7} pointerWidth={6}
                                   opacity={Math.min(1, Math.abs(u[i]) / 1.5 + 0.15)}/>
                        );
                    })}
                    <Text x={6} y={6}
                          text={t("arrows at the wheels = driving speeds u = H(0)Vb",
                              "바퀴 옆 화살표 = 구동 속도 u = H(0)Vb")}
                          fontSize={11} fill={colors.muted}/>
                </Layer>
            </Stage>
            <div className="w-full flex flex-col gap-1">
                {slider("ω", 0, -1.5, 1.5)}
                {slider("vx", 1, -0.3, 0.3)}
                {slider("vy", 2, -0.3, 0.3)}
            </div>
            <div className="text-xs text-muted text-center tabular-nums">
                u = ({u.map((v) => v.toFixed(1)).join(", ")}) rad/s
                {" · "}
                {t("sideways: front pair and rear pair fight each other's rollers",
                    "옆걸음에서는 대각선 바퀴끼리 같은 편이 된다")}
            </div>
        </div>
    );
};

const MecanumDrive = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "four mecanum wheels: choose a chassis velocity (ω, vx, vy) and u = H(0)Vb assigns each wheel its driving speed. sideways and diagonal motion need no steering at all",
            "mecanum 바퀴 네 개: 몸체 속도 (ω, vx, vy) 를 고르면 u = H(0)Vb 가 각 바퀴의 구동 속도를 정해 준다. 조향 없이 옆걸음과 대각선 주행이 된다",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<MecanumScene panel={Math.min(modalCanvasSize(1).width, 640)}/>}
    >
        <MecanumScene panel={340}/>
    </CanvasFigure>;
};

export default MecanumDrive;
