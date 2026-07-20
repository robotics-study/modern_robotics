import {useMemo, useRef, useState} from "react";
import {Arrow, Circle, Layer, Line, Stage, Text} from "react-konva";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";

// 평행이동만 하는 육각형을 손가락들이 막는 상황 (책 예제 12.3). 육각형을 직접 끌어 보라.
// 손가락이 없는 방향으로는 끌리는 대로 따라오지만, 손가락을 뚫는 방향으로는 그 성분만
// 걸러져서 미끄러지듯 움직인다. 잘려 나간(막힌) 성분은 빨간 화살표로 보여 준다.
// 오른쪽 패널은 같은 상황을 속도 공간에서 보여 준다: 접촉 하나 = 반평면 하나.
const N1: [number, number] = [0.5, -0.866];   // 왼쪽 위 손가락의 안쪽 normal
const N2: [number, number] = [0.5, 0.866];    // 왼쪽 아래 손가락
const N3: [number, number] = [-1, 0];         // 오른쪽 손가락
const EPS = 0.04;

// 반평면 {v | n·v ≥ 0} 들의 교집합(볼록 원뿔)으로의 사영: 위반한 성분을 돌아가며 깎는다.
const projectToCone = (v: [number, number], normals: Array<[number, number]>): [number, number] => {
    let x = v[0], y = v[1];
    for (let it = 0; it < 24; it++) {
        let ok = true;
        for (const [nx, ny] of normals) {
            const d = nx * x + ny * y;
            if (d < 0) {
                x -= d * nx;
                y -= d * ny;
                ok = false;
            }
        }
        if (ok) break;
    }
    // 수치 오차로 아주 살짝 남은 위반은 0 으로 본다.
    return [x, y];
};

const clipHalfPlane = (poly: Array<[number, number]>, n: [number, number]) => {
    const out: Array<[number, number]> = [];
    for (let i = 0; i < poly.length; i++) {
        const a = poly[i], c = poly[(i + 1) % poly.length];
        const da = n[0] * a[0] + n[1] * a[1];
        const dc = n[0] * c[0] + n[1] * c[1];
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
    const [nFingers, setNFingers] = useState(2);
    const [desired, setDesired] = useState<[number, number]>([0, 0]);
    const dragNode = useRef<{position: (p: {x: number; y: number}) => void} | null>(null);

    const normals = useMemo(() => {
        const list: Array<[number, number]> = [N1];
        if (nFingers >= 2) list.push(N2);
        if (nFingers >= 3) list.push(N3);
        return list;
    }, [nFingers]);

    const feasible = useMemo(() => {
        let poly: Array<[number, number]> = [[-1.1, -1.1], [1.1, -1.1], [1.1, 1.1], [-1.1, 1.1]];
        for (const n of normals) {
            poly = clipHalfPlane(poly, n);
            if (poly.length === 0) break;
        }
        return poly;
    }, [normals]);

    const actual = useMemo(() => projectToCone(desired, normals), [desired, normals]);
    const blockedAmt = Math.hypot(desired[0] - actual[0], desired[1] - actual[1]);
    const moving = Math.hypot(actual[0], actual[1]) > EPS;
    const tried = Math.hypot(desired[0], desired[1]) > EPS;

    // 접촉 라벨: 실제 움직임 기준.
    const labels = normals.map((n) => {
        const d = n[0] * actual[0] + n[1] * actual[1];
        if (!tried) return "R";
        if (d > EPS) return "B";
        return moving ? "S" : "R";
    });

    const W = panel, H = panel;
    const cx = W / 2, cy = H / 2, R = panel * 0.26;
    const S2 = panel / 2.6;
    const shift: [number, number] = [actual[0] * S2 * 0.55, -actual[1] * S2 * 0.55];

    const hexPts = (dx: number, dy: number) => {
        const pts: number[] = [];
        for (let i = 0; i < 6; i++) {
            const a = (Math.PI / 180) * (30 + 60 * i);
            pts.push(cx + dx + R * Math.cos(a), cy + dy - R * Math.sin(a));
        }
        return pts;
    };
    const fingerAt = (n: [number, number]) => {
        const px = cx - n[0] * R * 0.92, py = cy + n[1] * R * 0.92;
        const bx = px - n[0] * R * 0.55, by = py + n[1] * R * 0.55;
        const tx = -n[1], ty = n[0];
        return [px, py, bx + tx * R * 0.3, by - ty * R * 0.3, bx - tx * R * 0.3, by + ty * R * 0.3];
    };

    const vx2px = (v: [number, number]): [number, number] => [W / 2 + v[0] * S2, H / 2 - v[1] * S2];

    const btn = (n: number, label: string) => (
        <button key={n} onClick={() => {
            setNFingers(n);
            setDesired([0, 0]);
        }}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${
                    nFingers === n
                        ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10"
                        : "border-border text-muted hover:text-[var(--text)]"
                }`}>
            {label}
        </button>
    );

    return (
        <div className="flex flex-col gap-2 items-center">
            <div className="flex flex-row flex-wrap gap-1.5 justify-center">
                {btn(1, t("1 finger", "손가락 1개"))}
                {btn(2, t("2 fingers", "손가락 2개"))}
                {btn(3, t("3 fingers", "손가락 3개"))}
            </div>
            <div className="flex flex-row flex-wrap gap-3 items-start justify-center">
                {/* 장면: 육각형을 직접 끈다 */}
                <div className="flex flex-col items-center gap-0.5">
                    <Stage width={W} height={H}
                           className="bg-surface border border-border rounded-lg overflow-hidden">
                        <Layer>
                            {/* 원래 자리 */}
                            <Line points={hexPts(0, 0)} closed stroke={colors.muted} strokeWidth={1.5}
                                  dash={[5, 4]}/>
                            {/* 실제로 움직인 육각형 */}
                            <Line points={hexPts(shift[0], shift[1])} closed
                                  stroke={colors.text} strokeWidth={2}
                                  fill={colors.accent} opacity={0.85} listening={false}/>
                            {normals.map((n, i) => (
                                <Line key={i} points={fingerAt(n)} closed fill={colors.text}
                                      opacity={0.8}/>
                            ))}
                            {/* 막힌 성분 (빨간 화살표): 여기로는 더 못 간다 */}
                            {blockedAmt > EPS && (
                                <Arrow points={[cx + shift[0], cy + shift[1],
                                    cx + desired[0] * S2 * 0.55, cy - desired[1] * S2 * 0.55]}
                                       stroke="#e0533d" fill="#e0533d" strokeWidth={3}
                                       pointerLength={9} pointerWidth={8} dash={[6, 4]}/>
                            )}
                            {/* 드래그 손잡이 (육각형 중심) */}
                            <Circle x={cx + shift[0]} y={cy + shift[1]} radius={14}
                                    fill={colors.text} opacity={0.25} draggable
                                    ref={(node) => {
                                        dragNode.current = node;
                                    }}
                                    onDragMove={(e) => {
                                        setDesired([
                                            (e.target.x() - cx) / (S2 * 0.55),
                                            (cy - e.target.y()) / (S2 * 0.55),
                                        ]);
                                    }}
                                    onDragEnd={(e) => {
                                        setDesired([0, 0]);
                                        e.target.position({x: cx, y: cy});
                                    }}/>
                            <Text x={6} y={6}
                                  text={t("grab the hexagon and pull it around",
                                      "육각형을 잡고 이리저리 끌어 보라")}
                                  fontSize={11} fill={colors.muted}/>
                            {blockedAmt > EPS && (
                                <Text x={6} y={H - 20}
                                      text={t("red = the part of your pull the fingers block",
                                          "빨강 = 손가락이 막아 버린 성분")}
                                      fontSize={11} fill="#e0533d"/>
                            )}
                        </Layer>
                    </Stage>
                    <span className="text-xs text-muted">{t("scene (translation only)", "장면 (평행이동만)")}</span>
                </div>
                {/* 속도 공간 (수동 표시) */}
                <div className="flex flex-col items-center gap-0.5">
                    <Stage width={W} height={H}
                           className="bg-surface border border-border rounded-lg overflow-hidden">
                        <Layer>
                            <Line points={[0, H / 2, W, H / 2]} stroke={colors.border} strokeWidth={1}/>
                            <Line points={[W / 2, 0, W / 2, H]} stroke={colors.border} strokeWidth={1}/>
                            {feasible.length >= 3 ? (
                                <Line points={feasible.flatMap((p) => vx2px(p))} closed
                                      fill={colors.accent} opacity={0.18}
                                      stroke={colors.accent} strokeWidth={1.5}/>
                            ) : (
                                <Circle x={W / 2} y={H / 2} radius={5} fill={colors.accent}/>
                            )}
                            {/* 끌려는 방향과 실제 방향 */}
                            {tried && (
                                <>
                                    <Arrow points={[W / 2, H / 2, vx2px(desired)[0], vx2px(desired)[1]]}
                                           stroke="#e0533d" fill="#e0533d" strokeWidth={2}
                                           pointerLength={8} pointerWidth={7} dash={[5, 4]}/>
                                    <Arrow points={[W / 2, H / 2, vx2px(actual)[0], vx2px(actual)[1]]}
                                           stroke={colors.accent} fill={colors.accent} strokeWidth={2.5}
                                           pointerLength={8} pointerWidth={7}/>
                                </>
                            )}
                            <Text x={6} y={6}
                                  text={t("velocity space: shaded = allowed", "속도 공간: 칠해진 곳 = 허용")}
                                  fontSize={11} fill={colors.muted}/>
                            <Text x={6} y={20}
                                  text={t("dashed red = your pull, solid = what actually happens",
                                      "빨간 점선 = 끌려던 방향, 실선 = 실제 움직임")}
                                  fontSize={11} fill={colors.muted}/>
                        </Layer>
                    </Stage>
                    <span className="text-xs text-muted">
                        {t("each finger cuts this space in half", "손가락 하나가 이 공간을 반씩 자른다")}
                    </span>
                </div>
            </div>
            <div className="text-xs text-muted text-center tabular-nums">
                {nFingers === 3 && !tried
                    ? t("with three fingers the shaded region is a single point: v = 0. try pulling",
                        "손가락 셋이면 허용 영역이 점 하나, v = 0 이다. 끌어 보면 안다")
                    : tried
                        ? <span>
                            {t("contact labels", "접촉 라벨")}{" "}
                            <span className="font-semibold" style={{color: "var(--accent)"}}>
                                {labels.map((l, i) => `${i + 1}:${l}`).join("  ")}
                            </span>
                            {blockedAmt > EPS && (
                                <span className="font-semibold" style={{color: "#e0533d"}}>
                                    {" · "}{t("part of the pull is blocked", "끌던 힘의 일부가 막혔다")}
                                </span>
                            )}
                        </span>
                        : t("B = breaking, S = sliding along a finger, R = stuck", "B = 떨어짐, S = 손가락에 붙은 채 미끄러짐, R = 고정")}
            </div>
        </div>
    );
};

const TwistConeExplorer = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "pull the hexagon with your mouse: free directions follow your hand, blocked components are cut away (red). one finger = one half-plane of allowed velocities",
            "육각형을 마우스로 끌어 보라. 빈 방향으로는 손을 따라오고, 손가락을 뚫는 성분은 잘려 나간다 (빨강). 손가락 하나 = 허용 속도의 반평면 하나",
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
