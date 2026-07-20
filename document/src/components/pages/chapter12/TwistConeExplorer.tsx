import {useEffect, useMemo, useRef, useState} from "react";
import {Arrow, Circle, Layer, Line, Stage, Text} from "react-konva";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";

// 평행이동만 하는 육각형을 손가락들이 막는 상황 (책 예제 12.3). 오른쪽 속도 공간에서 점을
// 끌어 속도를 고르면, 왼쪽에서 육각형이 실제로 그 속도로 흘러가는 것이 보인다. 손가락을
// 뚫는 속도를 고르면 겹치는 순간 빨갛게 표시된다. 손가락 하나는 속도 공간을 반으로 자르고,
// 둘이면 부채꼴, 셋이 모두 대기하면 원점 하나만 남는다 (form closure 의 예고편).
type Finger3 = "none" | "hold" | "retreat";

const N1: [number, number] = [0.5, -0.866];   // 왼쪽 위 손가락의 안쪽 normal
const N2: [number, number] = [0.5, 0.866];    // 왼쪽 아래 손가락
const N3: [number, number] = [-1, 0];         // 오른쪽 손가락
const V3_RETREAT: [number, number] = [0.35, 0];
const EPS = 0.05;

// Sutherland–Hodgman 으로 반평면 {v | n·v ≥ b} 들의 교집합 폴리곤을 만든다.
const clipHalfPlane = (poly: Array<[number, number]>, n: [number, number], b: number) => {
    const out: Array<[number, number]> = [];
    for (let i = 0; i < poly.length; i++) {
        const a = poly[i], c = poly[(i + 1) % poly.length];
        const da = n[0] * a[0] + n[1] * a[1] - b;
        const dc = n[0] * c[0] + n[1] * c[1] - b;
        if (da >= 0) out.push(a);
        if ((da >= 0) !== (dc >= 0)) {
            const s = da / (da - dc);
            out.push([a[0] + (c[0] - a[0]) * s, a[1] + (c[1] - a[1]) * s]);
        }
    }
    return out;
};

interface SceneProps {
    panel?: number;
}

const TwistScene = ({panel = 300}: SceneProps) => {
    const colors = useCanvasColors();
    const t = useTr();
    const [nFingers, setNFingers] = useState(1);
    const [finger3, setFinger3] = useState<Finger3>("none");
    const [vel, setVel] = useState<[number, number]>([0.5, 0.25]);
    const [phase, setPhase] = useState(0);
    const rafRef = useRef<number>();

    // 고른 속도대로 육각형(과 움직이는 손가락)을 실제로 흘려보낸다 (0→1 반복, 페이드).
    useEffect(() => {
        let start: number | null = null;
        const loop = (ts: number) => {
            if (start === null) start = ts;
            setPhase((((ts - start) / 1800) % 1));
            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
        return () => {
            if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    const contacts = useMemo(() => {
        const list: Array<{n: [number, number]; v: [number, number]; name: string}> = [
            {n: N1, v: [0, 0], name: "1"},
        ];
        if (nFingers >= 2) list.push({n: N2, v: [0, 0], name: "2"});
        if (finger3 !== "none") list.push({n: N3, v: finger3 === "retreat" ? V3_RETREAT : [0, 0], name: "3"});
        return list;
    }, [nFingers, finger3]);

    // 허용 영역 폴리곤 (속도 공간 [-1.1, 1.1]²에서 클리핑).
    const feasible = useMemo(() => {
        let poly: Array<[number, number]> = [[-1.1, -1.1], [1.1, -1.1], [1.1, 1.1], [-1.1, 1.1]];
        for (const c of contacts) {
            poly = clipHalfPlane(poly, c.n, c.n[0] * c.v[0] + c.n[1] * c.v[1]);
            if (poly.length === 0) break;
        }
        return poly;
    }, [contacts]);

    // 현재 속도 점의 접촉 라벨.
    const labels = contacts.map((c) => {
        const s = c.n[0] * (vel[0] - c.v[0]) + c.n[1] * (vel[1] - c.v[1]);
        if (s < -EPS) return "!";
        if (s > EPS) return "B";
        const same = Math.hypot(vel[0] - c.v[0], vel[1] - c.v[1]) < EPS;
        return same ? "R" : "S";
    });
    const penetrating = labels.includes("!");
    const mode = labels.map((l, i) => `${contacts[i].name}:${l === "!" ? "관통" : l}`).join("  ");

    const W = panel, H = panel;
    const cx = W / 2, cy = H / 2, R = panel * 0.27;
    const S2 = panel / 2.4;
    // 애니메이션 이동량 (화면 픽셀). 속도 방향으로 조금씩 흘러갔다가 되돌아온다.
    const drift = 0.55 * phase;
    const hexShift: [number, number] = [vel[0] * S2 * drift, -vel[1] * S2 * drift];

    const hexPts = (dx: number, dy: number) => {
        const pts: number[] = [];
        for (let i = 0; i < 6; i++) {
            const a = (Math.PI / 180) * (30 + 60 * i);
            pts.push(cx + dx + R * Math.cos(a), cy + dy - R * Math.sin(a));
        }
        return pts;
    };
    const fingerAt = (n: [number, number], enabled: boolean, moving: boolean) => {
        const shift = moving ? V3_RETREAT[0] * S2 * drift : 0;
        const px = cx - n[0] * R * 0.92 + shift, py = cy + n[1] * R * 0.92;
        const bx = px - n[0] * R * 0.55, by = py + n[1] * R * 0.55;
        const tx = -n[1], ty = n[0];
        return {px, py, tri: [px, py, bx + tx * R * 0.3, by - ty * R * 0.3, bx - tx * R * 0.3, by + ty * R * 0.3], enabled};
    };
    const fingers = [
        fingerAt(N1, true, false),
        fingerAt(N2, nFingers >= 2, false),
        fingerAt(N3, finger3 !== "none", finger3 === "retreat"),
    ];

    const vx2px = (v: [number, number]): [number, number] => [W / 2 + v[0] * S2, H / 2 - v[1] * S2];

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

    return (
        <div className="flex flex-col gap-2 items-center">
            <div className="flex flex-row flex-wrap gap-1.5 justify-center">
                {btn(nFingers === 1 && finger3 === "none", t("1 finger", "손가락 1개"), () => {
                    setNFingers(1);
                    setFinger3("none");
                    setVel([0.5, 0.25]);
                })}
                {btn(nFingers === 2 && finger3 === "none", t("2 fingers", "손가락 2개"), () => {
                    setNFingers(2);
                    setFinger3("none");
                    setVel([0.5, 0.25]);
                })}
                {btn(finger3 === "hold", t("3, all holding", "3개 모두 대기"), () => {
                    setNFingers(2);
                    setFinger3("hold");
                    setVel([0, 0]);
                })}
                {btn(finger3 === "retreat", t("3rd finger retreating", "3번이 물러나는 중"), () => {
                    setNFingers(2);
                    setFinger3("retreat");
                    setVel([0.15, 0.02]);
                })}
            </div>
            <div className="flex flex-row flex-wrap gap-3 items-start justify-center">
                {/* 장면: 육각형이 고른 속도대로 실제로 움직인다 */}
                <div className="flex flex-col items-center gap-0.5">
                    <Stage width={W} height={H}
                           className="bg-surface border border-border rounded-lg overflow-hidden">
                        <Layer>
                            {/* 원래 자리 (점선) */}
                            <Line points={hexPts(0, 0)} closed stroke={colors.muted} strokeWidth={1.5}
                                  dash={[5, 4]}/>
                            {/* 흘러가는 육각형 */}
                            <Line points={hexPts(hexShift[0], hexShift[1])} closed
                                  stroke={penetrating ? "#e0533d" : colors.text} strokeWidth={2}
                                  fill={penetrating ? "#e0533d" : colors.accent}
                                  opacity={penetrating ? 0.55 : 0.85}/>
                            {fingers.map((f, i) => f.enabled && (
                                <Line key={i} points={f.tri} closed fill={colors.text} opacity={0.8}/>
                            ))}
                            {finger3 === "retreat" && (
                                <Arrow points={[fingers[2].px + 8, fingers[2].py,
                                    fingers[2].px + 8 + V3_RETREAT[0] * S2 * 0.7, fingers[2].py]}
                                       stroke="#e0a33d" fill="#e0a33d" strokeWidth={2.5}
                                       pointerLength={8} pointerWidth={7}/>
                            )}
                            <Text x={6} y={6}
                                  text={penetrating
                                      ? t("it punches into a finger!", "손가락을 뚫고 들어간다!")
                                      : t("the hexagon drifts with your chosen velocity",
                                          "고른 속도대로 육각형이 흘러간다")}
                                  fontSize={11} fill={penetrating ? "#e0533d" : colors.muted}/>
                        </Layer>
                    </Stage>
                    <span className="text-xs text-muted">{t("scene (translation only)", "장면 (평행이동만)")}</span>
                </div>
                {/* 속도 공간 */}
                <div className="flex flex-col items-center gap-0.5">
                    <Stage width={W} height={H}
                           className="bg-surface border border-border rounded-lg overflow-hidden">
                        <Layer>
                            <Line points={[0, H / 2, W, H / 2]} stroke={colors.border} strokeWidth={1}/>
                            <Line points={[W / 2, 0, W / 2, H]} stroke={colors.border} strokeWidth={1}/>
                            {feasible.length >= 3 && (
                                <Line points={feasible.flatMap((p) => vx2px(p))} closed
                                      fill={colors.accent} opacity={0.18}
                                      stroke={colors.accent} strokeWidth={1.5}/>
                            )}
                            {feasible.length < 3 && finger3 === "hold" && (
                                <Circle x={W / 2} y={H / 2} radius={5} fill={colors.accent}/>
                            )}
                            <Circle x={vx2px(vel)[0]} y={vx2px(vel)[1]} radius={9}
                                    fill={penetrating ? "#e0533d" : colors.accent} draggable
                                    onDragMove={(e) => {
                                        setVel([(e.target.x() - W / 2) / S2, (H / 2 - e.target.y()) / S2]);
                                    }}/>
                            <Text x={6} y={6}
                                  text={t("velocity space (vx, vy): drag the dot",
                                      "속도 공간 (vx, vy): 점을 끌어 보라")}
                                  fontSize={11} fill={colors.muted}/>
                            <Text x={6} y={20}
                                  text={t("shaded = velocities that hit nothing", "칠해진 곳 = 아무것도 안 뚫는 속도")}
                                  fontSize={11} fill={colors.accent}/>
                        </Layer>
                    </Stage>
                    <span className="text-xs text-muted">
                        {t("each finger cuts this space in half", "손가락 하나가 이 공간을 반씩 자른다")}
                    </span>
                </div>
            </div>
            <div className="text-xs text-muted text-center tabular-nums">
                {penetrating
                    ? <span className="font-semibold" style={{color: "#e0533d"}}>
                        {t("infeasible: pick a velocity inside the shaded region", "불가능한 속도다. 칠해진 영역 안에서 골라 보라")}
                    </span>
                    : <span>
                        {t("contact labels", "접촉 라벨")}{" "}
                        <span className="font-semibold" style={{color: "var(--accent)"}}>{mode}</span>
                        {finger3 === "hold" && (
                            <span> · {t("with three holding fingers only v = 0 remains", "셋이 모두 대기하면 v = 0 만 남는다")}</span>
                        )}
                    </span>}
            </div>
        </div>
    );
};

const TwistConeExplorer = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "pick a velocity on the right and watch the hexagon actually move on the left: fingers slice the velocity space in half, one half-plane each",
            "오른쪽에서 속도를 고르면 왼쪽에서 육각형이 실제로 그렇게 움직인다. 손가락 하나마다 속도 공간이 반씩 잘려 나간다",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<TwistScene panel={Math.floor(modalCanvasSize(2.15).width / 2) - 16}/>}
    >
        <TwistScene panel={300}/>
    </CanvasFigure>;
};

export default TwistConeExplorer;
