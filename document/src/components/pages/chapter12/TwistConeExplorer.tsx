import {useMemo, useState} from "react";
import {Arrow, Circle, Layer, Line, Stage, Text} from "react-konva";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";

// 평행이동만 하는 육각형을 손가락들이 막는 상황 (책 예제 12.3). 왼쪽은 실제 장면, 오른쪽은
// 속도 (vx, vy) 공간이다. 손가락 하나는 반평면, 둘은 부채꼴, 셋이 모두 대기하면 원점 하나만
// 남는다 (form closure 의 예고편). 속도 점을 끌면 각 접촉의 라벨 B/S/R 이 실시간으로 붙고,
// 허용 영역 밖으로 나가면 관통이라고 알려 준다.
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
    const mode = labels.join("");

    const W = panel, H = panel;
    // 왼쪽 장면: 육각형 + 손가락.
    const cx = W / 2, cy = H / 2, R = panel * 0.27;
    const hexPts: number[] = [];
    for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 180) * (30 + 60 * i);
        hexPts.push(cx + R * Math.cos(a), cy - R * Math.sin(a));
    }
    const fingerAt = (n: [number, number], enabled: boolean, moving: boolean) => {
        // normal 반대쪽(바깥)에서 접촉점으로 향하는 작은 삼각형 손가락.
        const px = cx - n[0] * R * 0.92, py = cy + n[1] * R * 0.92;
        const bx = px - n[0] * R * 0.55, by = py + n[1] * R * 0.55;
        const tx = -n[1], ty = n[0];
        return {px, py, tri: [px, py, bx + tx * R * 0.3, by - ty * R * 0.3, bx - tx * R * 0.3, by + ty * R * 0.3], enabled, moving};
    };
    const fingers = [
        fingerAt(N1, true, false),
        fingerAt(N2, nFingers >= 2, false),
        fingerAt(N3, finger3 !== "none", finger3 === "retreat"),
    ];

    // 오른쪽 속도 공간.
    const S2 = panel / 2.4;
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
                {/* 장면 */}
                <div className="flex flex-col items-center gap-0.5">
                    <Stage width={W} height={H}
                           className="bg-surface border border-border rounded-lg overflow-hidden">
                        <Layer>
                            <Line points={hexPts} closed stroke={colors.text} strokeWidth={2}
                                  fill={colors.accent} opacity={0.9}/>
                            {fingers.map((f, i) => f.enabled && (
                                <Line key={i} points={f.tri} closed fill={colors.text} opacity={0.75}/>
                            ))}
                            {/* 물러나는 손가락의 속도 화살표 */}
                            {finger3 === "retreat" && (
                                <Arrow points={[fingers[2].px, fingers[2].py,
                                    fingers[2].px + V3_RETREAT[0] * S2 * 0.9, fingers[2].py]}
                                       stroke="#e0a33d" fill="#e0a33d" strokeWidth={2.5}
                                       pointerLength={8} pointerWidth={7}/>
                            )}
                            {/* 육각형의 현재 속도 화살표 */}
                            {(Math.abs(vel[0]) > 0.03 || Math.abs(vel[1]) > 0.03) && (
                                <Arrow points={[cx, cy, cx + vel[0] * S2 * 0.8, cy - vel[1] * S2 * 0.8]}
                                       stroke={penetrating ? "#e0533d" : colors.text}
                                       fill={penetrating ? "#e0533d" : colors.text}
                                       strokeWidth={2.5} pointerLength={9} pointerWidth={8}/>
                            )}
                            <Text x={6} y={6}
                                  text={t("hexagon can only translate", "육각형은 평행이동만 한다")}
                                  fontSize={11} fill={colors.muted}/>
                        </Layer>
                    </Stage>
                    <span className="text-xs text-muted">{t("the scene", "장면")}</span>
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
                            {/* 속도 점 */}
                            <Circle x={vx2px(vel)[0]} y={vx2px(vel)[1]} radius={9}
                                    fill={penetrating ? "#e0533d" : colors.accent} draggable
                                    onDragMove={(e) => {
                                        setVel([(e.target.x() - W / 2) / S2, (H / 2 - e.target.y()) / S2]);
                                    }}/>
                            <Text x={6} y={6}
                                  text={t("velocity space (vx, vy): drag the dot",
                                      "속도 공간 (vx, vy): 점을 끌어 보라")}
                                  fontSize={11} fill={colors.muted}/>
                        </Layer>
                    </Stage>
                    <span className="text-xs text-muted">
                        {t("feasible velocities are shaded", "허용되는 속도 영역이 칠해져 있다")}
                    </span>
                </div>
            </div>
            <div className="text-xs text-muted text-center tabular-nums">
                {penetrating
                    ? <span className="font-semibold" style={{color: "#e0533d"}}>
                        {t("penetration! this velocity pushes into a finger", "관통! 이 속도는 손가락을 뚫고 들어간다")}
                    </span>
                    : <span>
                        {t("contact mode", "접촉 모드")}{" "}
                        <span className="font-semibold" style={{color: "var(--accent)"}}>{mode}</span>
                        {finger3 === "hold" && feasible.length < 3 && (
                            <span> · {t("only v = 0 is left: nothing can move", "남은 속도는 v = 0 뿐이다. 아무 데도 못 간다")}</span>
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
            "each finger cuts the velocity space in half: one finger leaves a half-plane, two leave a cone, and three holding fingers leave only v = 0",
            "손가락 하나가 속도 공간을 반으로 자른다. 하나면 반평면, 둘이면 부채꼴, 셋이 모두 대기하면 v = 0 만 남는다",
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
