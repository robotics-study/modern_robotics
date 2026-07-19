import {useEffect, useRef, useState} from "react";
import {Arrow, Circle, Ellipse, Layer, Line, Stage, Text} from "react-konva";
import CoordinateSystem from "../../2d/CoordinateCanvas";
import CanvasFigure from "../../CanvasFigure";
import {useTr} from "../../../libs/i18n";
import {globalToMap} from "../../../libs/konvaUtils";
import {det2R, jacobian2R, manipulabilityEllipse, planarFk, Vec2} from "../../../libs/planarArm";
import {CanvasColors, useCanvasColors} from "../../../libs/useTheme";

// "Jacobian = 관절속도 → 팁속도" 를 실제 팔 위에서 체험하게 한다. 왼쪽에서 관절속도 θ̇ 를
// 고르면, 오른쪽 실제 팔의 팁에 그 결과 속도 J θ̇ 화살표가 붙는다 — 팁에 붙은 평행사변형은
// |θ̇i| ≤ 1 로 낼 수 있는 모든 팁 속도, 점선 타원은 등노력 원의 상(조작성 타원)이다.
// ▶ 를 누르면 고른 θ̇ 대로 팔이 실제로 움직여, 팁 자취가 화살표 방향을 그대로 따라간다.
const L1 = 2.5, L2 = 2;
const PANEL = 210, PAD = 16;
const ARM_W = 300;
const RESOLUTION = 0.05;
const J1_COLOR = "#f2a63a";
const J2_COLOR = "#e0533d";
// 속도(단위/s)를 화면 길이로 바꾸는 배율 — 화살표·타원이 팔과 비슷한 크기로 보이게.
const VEL_SCALE = 0.45;

const VelocityMappingScene = () => {
    const colors = useCanvasColors();
    const t = useTr();
    const [theta, setTheta] = useState<[number, number]>([0.4, 1.2]);
    const [qd, setQd] = useState<Vec2>({x: 0.6, y: 0.8});     // 관절속도 (θ̇1, θ̇2)
    const [playing, setPlaying] = useState(false);
    const [trail, setTrail] = useState<number[]>([]);
    const rafRef = useRef<number>();
    const lastRef = useRef<number | null>(null);
    const liveRef = useRef({theta, qd});
    liveRef.current = {theta, qd};

    // ▶ 동안 θ ← θ + θ̇·dt 로 실제 적분 — 팁 자취가 J θ̇ 방향과 접함을 눈으로 확인한다.
    useEffect(() => {
        if (!playing) {
            lastRef.current = null;
            return;
        }
        const tick = (now: number) => {
            const dt = lastRef.current === null ? 0 : Math.min(0.05, (now - lastRef.current) / 1000);
            lastRef.current = now;
            const {qd: v} = liveRef.current;
            setTheta((prev) => [prev[0] + v.x * dt * 0.6, prev[1] + v.y * dt * 0.6]);
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [playing]);

    const [j1, j2] = jacobian2R(theta[0], theta[1], L1, L2);
    const v: Vec2 = {x: j1.x * qd.x + j2.x * qd.y, y: j1.y * qd.x + j2.y * qd.y};
    const ell = manipulabilityEllipse(j1, j2);
    const detJ = det2R(theta[1], L1, L2);
    const world = planarFk(theta, [L1, L2]).points;
    const tip = world[world.length - 1];

    // 팁 자취 누적 (재생 중에만).
    useEffect(() => {
        if (!playing) return;
        setTrail((prev) => {
            const m = globalToMap(ARM_W, ARM_W, tip.x, tip.y, RESOLUTION);
            const next = [...prev, m.x, m.y];
            return next.length > 400 ? next.slice(next.length - 400) : next;
        });
    }, [tip.x, tip.y, playing]);

    // 왼쪽(관절속도) 패널 좌표계.
    const sL = (PANEL / 2 - PAD) / 1.6;
    const pL = (x: number, y: number) => ({x: PANEL / 2 + x * sL, y: PANEL / 2 - y * sL});
    const originL = pL(0, 0);
    const qdPx = pL(qd.x, qd.y);

    // 오른쪽(작업 공간) 좌표계: 속도 오버레이는 팁 기준으로 VEL_SCALE 배.
    const toPx = (p: Vec2) => globalToMap(ARM_W, ARM_W, p.x, p.y, RESOLUTION);
    const armPx = world.map(toPx);
    const tipPx = armPx[armPx.length - 1];
    const velPx = (w: Vec2) => ({
        x: tipPx.x + w.x * VEL_SCALE / RESOLUTION,
        y: tipPx.y - w.y * VEL_SCALE / RESOLUTION,
    });

    // |θ̇i| ≤ 1 정사각형의 상: 팁에서 낼 수 있는 속도의 평행사변형 (±J1±J2).
    const corners: Vec2[] = [{x: 1, y: 1}, {x: -1, y: 1}, {x: -1, y: -1}, {x: 1, y: -1}];
    const paraPx = corners.map((c) => velPx({
        x: j1.x * c.x + j2.x * c.y,
        y: j1.y * c.x + j2.y * c.y,
    }));
    const vTipPx = velPx(v);
    const j1Px = velPx(j1);
    const j2Px = velPx(j2);

    const axes = (c: CanvasColors) => (
        <>
            <Line points={[PAD, PANEL / 2, PANEL - PAD, PANEL / 2]} stroke={c.border} strokeWidth={1}/>
            <Line points={[PANEL / 2, PAD, PANEL / 2, PANEL - PAD]} stroke={c.border} strokeWidth={1}/>
            <Text x={PANEL - PAD - 10} y={PANEL / 2 + 5} text="θ̇₁" fontSize={11} fill={c.muted}/>
            <Text x={PANEL / 2 + 5} y={PAD - 3} text="θ̇₂" fontSize={11} fill={c.muted}/>
        </>
    );

    const setJoint = (i: number, val: number) =>
        setTheta((prev) => {
            const next = [...prev] as [number, number];
            next[i] = val;
            return next;
        });

    return (
        <div className="flex flex-col gap-2 items-center">
            <div className="flex flex-row flex-wrap gap-2 items-center justify-center">
                {/* 관절속도 선택 패널 */}
                <div className="flex flex-col items-center gap-0.5">
                    <Stage width={PANEL} height={PANEL}
                           className="bg-surface border border-border rounded-lg overflow-hidden">
                        <Layer>
                            {axes(colors)}
                            <Line points={corners.flatMap((c) => { const m = pL(c.x, c.y); return [m.x, m.y]; })}
                                  closed stroke={colors.muted} strokeWidth={1.5} dash={[6, 5]}/>
                            <Circle x={originL.x} y={originL.y} radius={sL} stroke={colors.muted}
                                    strokeWidth={1.5} dash={[2, 4]}/>
                            <Arrow points={[originL.x, originL.y, qdPx.x, qdPx.y]} stroke={colors.accent}
                                   fill={colors.accent} strokeWidth={2.5} pointerLength={7} pointerWidth={7}/>
                            <Circle
                                x={qdPx.x} y={qdPx.y} radius={9} fill={colors.accent}
                                stroke={colors.surface} strokeWidth={2} draggable
                                dragBoundFunc={(pos) => ({
                                    x: Math.max(8, Math.min(PANEL - 8, pos.x)),
                                    y: Math.max(8, Math.min(PANEL - 8, pos.y)),
                                })}
                                onDragMove={(e) => {
                                    setQd({x: (e.target.x() - PANEL / 2) / sL, y: (PANEL / 2 - e.target.y()) / sL});
                                }}
                            />
                        </Layer>
                    </Stage>
                    <span className="text-xs text-muted">
                        {t("1. pick joint speeds (drag)", "1. 관절속도를 고른다 (드래그)")}
                    </span>
                </div>

                <div className="text-xl text-muted font-bold px-0.5 select-none">
                    →<div className="text-xs font-normal text-center">J(θ)</div>
                </div>

                {/* 실제 팔 + 팁에 붙은 속도 기하 */}
                <div className="flex flex-col items-center gap-0.5">
                    <CoordinateSystem
                        width={ARM_W}
                        height={ARM_W}
                        resolution={RESOLUTION}
                        className="bg-surface border border-border rounded-lg"
                    >
                        {trail.length >= 4 && (
                            <Line points={trail} stroke={colors.accent} strokeWidth={2} opacity={0.45}
                                  lineCap="round" lineJoin="round"/>
                        )}
                        {/* 팔 */}
                        {armPx.slice(0, -1).map((p, i) => (
                            <Line key={`l${i}`} points={[p.x, p.y, armPx[i + 1].x, armPx[i + 1].y]}
                                  stroke={colors.text} strokeWidth={4} lineCap="round" opacity={0.75}/>
                        ))}
                        {armPx.slice(0, -1).map((p, i) => (
                            <Circle key={`j${i}`} x={p.x} y={p.y} radius={5} fill={colors.surface}
                                    stroke={colors.text} strokeWidth={2}/>
                        ))}
                        {/* 팁에서 낼 수 있는 속도들: 평행사변형(|θ̇|≤1) + 조작성 타원(등노력 원의 상) */}
                        <Line points={paraPx.flatMap((m) => [m.x, m.y])} closed stroke={colors.muted}
                              strokeWidth={1.5} dash={[6, 5]}/>
                        <Ellipse x={tipPx.x} y={tipPx.y}
                                 radiusX={Math.max(ell.major * VEL_SCALE / RESOLUTION, 1)}
                                 radiusY={Math.max(ell.minor * VEL_SCALE / RESOLUTION, 1)}
                                 rotation={(-ell.angle * 180) / Math.PI}
                                 stroke={colors.accent} strokeWidth={1.5} dash={[2, 4]} opacity={0.7}/>
                        {/* J 의 두 열: 관절 1만 / 관절 2만 단위 속도로 돌릴 때의 팁 속도 */}
                        <Arrow points={[tipPx.x, tipPx.y, j1Px.x, j1Px.y]} stroke={J1_COLOR} fill={J1_COLOR}
                               strokeWidth={2} pointerLength={6} pointerWidth={6}/>
                        <Arrow points={[tipPx.x, tipPx.y, j2Px.x, j2Px.y]} stroke={J2_COLOR} fill={J2_COLOR}
                               strokeWidth={2} pointerLength={6} pointerWidth={6}/>
                        <Text x={j1Px.x + 4} y={j1Px.y - 6} text="J₁" fontSize={12} fontStyle="bold"
                              fill={J1_COLOR}/>
                        <Text x={j2Px.x + 4} y={j2Px.y - 6} text="J₂" fontSize={12} fontStyle="bold"
                              fill={J2_COLOR}/>
                        {/* 선택한 θ̇ 의 결과: 팁 속도 J θ̇ */}
                        <Arrow points={[tipPx.x, tipPx.y, vTipPx.x, vTipPx.y]} stroke={colors.accent}
                               fill={colors.accent} strokeWidth={3} pointerLength={8} pointerWidth={8}/>
                        <Circle x={tipPx.x} y={tipPx.y} radius={5} fill={colors.accent}/>
                    </CoordinateSystem>
                    <span className="text-xs text-muted">
                        {t("2. the tip gets velocity J θ̇. Press ▶ to see it really move",
                            "2. 팁이 속도 J θ̇ 를 얻는다. ▶ 를 눌러 진짜로 움직여 보라")}
                    </span>
                </div>
            </div>

            <div className="w-full max-w-md flex flex-col gap-1 text-xs text-muted">
                {[0, 1].map((i) => (
                    <label key={i} className="flex items-center gap-2">
                        <span className="w-8 shrink-0">θ{i + 1}</span>
                        <input type="range" min={-Math.PI} max={Math.PI} step={0.01} value={theta[i]}
                               disabled={playing}
                               onChange={(e) => setJoint(i, parseFloat(e.target.value))}
                               className="w-full accent-[var(--accent)]"
                               aria-label={`joint angle theta ${i + 1}`}/>
                        <span className="w-12 shrink-0 text-right tabular-nums">
                            {Math.round(theta[i] * 180 / Math.PI)}°
                        </span>
                    </label>
                ))}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-0.5 tabular-nums">
                    <button
                        type="button"
                        onClick={() => {
                            if (!playing) setTrail([]);
                            setPlaying((p) => !p);
                        }}
                        className="px-2.5 py-1 rounded border border-[var(--accent)] text-[var(--accent)] font-semibold"
                    >
                        {playing ? "❚❚ Pause" : `▶ ${t("move with θ̇", "θ̇ 로 움직이기")}`}
                    </button>
                    <span>θ̇ = ({qd.x.toFixed(2)}, {qd.y.toFixed(2)})</span>
                    <span>J θ̇ = ({v.x.toFixed(2)}, {v.y.toFixed(2)})</span>
                    <span>det J = {detJ.toFixed(2)}{Math.abs(detJ) < 0.15 &&
                        <span className="text-[var(--accent)] font-semibold"> · {t("near-singular!", "특이점 부근!")}</span>}
                    </span>
                </div>
            </div>
        </div>
    );
};

const VelocityMapping = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "pick joint speeds on the left — the tip gets velocity J θ̇: the parallelogram is everything |θ̇ᵢ| ≤ 1 can do, the dashed ellipse the iso-effort circle's image",
            "왼쪽에서 관절속도를 고르면 팁이 J θ̇ 의 속도를 얻는다: 평행사변형은 |θ̇ᵢ| ≤ 1 로 낼 수 있는 속도 전부, 점선 타원은 같은 노력(‖θ̇‖=1)으로 낼 수 있는 속도들",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<VelocityMappingScene/>}
    >
        <VelocityMappingScene/>
    </CanvasFigure>;
};

export default VelocityMapping;
