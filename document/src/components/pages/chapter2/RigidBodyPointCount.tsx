import {useState} from "react";
import {Circle, Line, Text} from "react-konva";
import CoordinateSystem from "../../2d/CoordinateCanvas";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {useTr} from "../../../libs/i18n";
import {globalToMap, mapToGlobal} from "../../../libs/konvaUtils";
import {circleCircleIntersect, Vec2} from "../../../libs/planarArm";
import {useCanvasColors} from "../../../libs/useTheme";

// 책 그림 2.2 의 자유도 셈을 그대로 조작하게 한다: 동전 위 세 점 A,B,C 중
// A 는 자유(+2), B 는 원 위(+1), C 는 두 원의 교점(+0, heads/tails 두 갈래) —
// 강체 거리 제약이 6개의 겉보기 자유도를 3개로 줄이는 과정을 손으로 확인한다.
const COIN_R = 1.7;
// 동전 좌표계에서의 세 점 (heads 기준). 비대칭으로 두어 heads/tails 가 뒤집힘을 드러낸다.
const A0: Vec2 = {x: -0.8, y: -0.5};
const B0: Vec2 = {x: 0.9, y: -0.4};
const C0: Vec2 = {x: 0.1, y: 0.95};
const dist = (p: Vec2, q: Vec2) => Math.hypot(p.x - q.x, p.y - q.y);
const D_AB = dist(A0, B0), D_AC = dist(A0, C0), D_BC = dist(B0, C0);
// 동전 좌표계에서 벡터 A→B 의 기준각. 슬라이더 φAB 와의 차이가 동전의 회전각이 된다.
const PHI0 = Math.atan2(B0.y - A0.y, B0.x - A0.x);
const RESOLUTION = 0.05;

const B_COLOR = "#f2a63a";
const C_COLOR = "#e0533d";

interface SceneProps {
    width: number;
    height: number;
}

const PointCountScene = ({width, height}: SceneProps) => {
    // 큰 모달 캔버스에서는 world 스케일(resolution)도 함께 키운다 (460px 기준 유지).
    const res = RESOLUTION * Math.min(1, 460 / width);
    const colors = useCanvasColors();
    const t = useTr();
    const [A, setA] = useState<Vec2>({x: -1.2, y: -0.6});
    const [phi, setPhi] = useState(0.5);
    const [heads, setHeads] = useState(true);

    const B: Vec2 = {x: A.x + D_AB * Math.cos(phi), y: A.y + D_AB * Math.sin(phi)};
    const hit = circleCircleIntersect(A, D_AC, B, D_BC, heads ? 1 : -1);
    const C = hit ? hit.p : A;

    // 동전 자세 복원: A 를 앵커로, 회전 α = φAB − φ0. tails 는 AB 축에 대한 반사이므로
    // 중심을 heads 위치에서 AB 직선에 대해 반사시킨다.
    const alpha = phi - PHI0;
    const rot = (p: Vec2): Vec2 => ({
        x: Math.cos(alpha) * p.x - Math.sin(alpha) * p.y,
        y: Math.sin(alpha) * p.x + Math.cos(alpha) * p.y,
    });
    const centerHeads: Vec2 = (() => {
        const d = rot({x: -A0.x, y: -A0.y});
        return {x: A.x + d.x, y: A.y + d.y};
    })();
    const center: Vec2 = heads ? centerHeads : (() => {
        // AB 직선(점 A, 방향 φ)에 대한 반사.
        const ux = Math.cos(phi), uy = Math.sin(phi);
        const vx = centerHeads.x - A.x, vy = centerHeads.y - A.y;
        const s = vx * ux + vy * uy;
        return {x: A.x + 2 * s * ux - vx, y: A.y + 2 * s * uy - vy};
    })();

    const toPx = (p: Vec2) => globalToMap(width, height, p.x, p.y, res);
    const aPx = toPx(A), bPx = toPx(B), cPx = toPx(C), ctrPx = toPx(center);
    const rPx = (r: number) => r / res;

    return (
        <div className="flex flex-col gap-2 items-center" style={{width}}>
            <CoordinateSystem
                width={width}
                height={height}
                resolution={res}
                className="bg-surface border border-border rounded-lg"
            >
                {/* 동전 본체 */}
                <Circle x={ctrPx.x} y={ctrPx.y} radius={rPx(COIN_R)} fill={colors.accent}
                        opacity={0.14} stroke={colors.accent} strokeWidth={1.5}/>
                {/* B 의 제약: A 중심 반지름 dAB 원 */}
                <Circle x={aPx.x} y={aPx.y} radius={rPx(D_AB)} stroke={B_COLOR} strokeWidth={1.5}
                        dash={[6, 5]}/>
                {/* C 의 제약: A·B 중심의 두 원 */}
                <Circle x={aPx.x} y={aPx.y} radius={rPx(D_AC)} stroke={C_COLOR} strokeWidth={1.2}
                        dash={[3, 4]} opacity={0.8}/>
                <Circle x={bPx.x} y={bPx.y} radius={rPx(D_BC)} stroke={C_COLOR} strokeWidth={1.2}
                        dash={[3, 4]} opacity={0.8}/>
                {/* 강체 삼각형 A-B-C */}
                <Line points={[aPx.x, aPx.y, bPx.x, bPx.y, cPx.x, cPx.y]} closed
                      stroke={colors.text} strokeWidth={1.5} opacity={0.7}/>
                {/* 점 B, C */}
                <Circle x={bPx.x} y={bPx.y} radius={6} fill={B_COLOR}/>
                <Text x={bPx.x + 9} y={bPx.y - 7} text="B" fontSize={14} fontStyle="bold" fill={B_COLOR}/>
                <Circle x={cPx.x} y={cPx.y} radius={6} fill={C_COLOR}/>
                <Text x={cPx.x + 9} y={cPx.y - 7} text="C" fontSize={14} fontStyle="bold" fill={C_COLOR}/>
                {/* 점 A (드래그 가능) — 캔버스 밖으로 나가지 않게 픽셀 좌표에서 클램프 */}
                <Circle
                    x={aPx.x}
                    y={aPx.y}
                    radius={8}
                    fill={colors.accent}
                    stroke={colors.surface}
                    strokeWidth={2}
                    draggable
                    dragBoundFunc={(pos) => ({
                        x: Math.max(24, Math.min(width - 24, pos.x)),
                        y: Math.max(24, Math.min(height - 24, pos.y)),
                    })}
                    onDragMove={(e) => {
                        setA(mapToGlobal(width, height, e.target.x(), e.target.y(), res));
                    }}
                />
                <Text x={aPx.x + 10} y={aPx.y - 8} text="A" fontSize={14} fontStyle="bold"
                      fill={colors.accent} listening={false}/>
            </CoordinateSystem>

            <div className="w-full flex flex-col gap-1 text-xs text-muted">
                <label className="flex items-center gap-2">
                    <span className="w-10 shrink-0">φ_AB</span>
                    <input
                        type="range"
                        min={-Math.PI}
                        max={Math.PI}
                        step={0.01}
                        value={phi}
                        onChange={(e) => setPhi(parseFloat(e.target.value))}
                        className="w-full accent-[var(--accent)]"
                        aria-label={t("angle of B around A", "A 둘레 B 의 각도")}
                    />
                    <span className="w-12 shrink-0 text-right tabular-nums">
                        {Math.round(phi * 180 / Math.PI)}°
                    </span>
                </label>
                <div className="flex items-center justify-center gap-3 pt-0.5">
                    <button
                        type="button"
                        onClick={() => setHeads((h) => !h)}
                        className="px-2 py-0.5 rounded border border-border hover:bg-surface"
                    >
                        C: {heads ? "heads ▲" : "tails ▼"}
                    </button>
                    <span>
                        <span className="text-[var(--accent)] font-semibold">A</span> +2 ·{" "}
                        <span style={{color: B_COLOR}} className="font-semibold">B</span> +1 ·{" "}
                        <span style={{color: C_COLOR}} className="font-semibold">C</span> +0 → dof = 3
                    </span>
                </div>
            </div>
        </div>
    );
};

const RigidBodyPointCount = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "counting the DOF of a planar rigid body · drag A (+2), turn φ_AB (+1); C is pinned by two circles (+0)",
            "평면 강체의 자유도 셈 · A 드래그(+2), φ_AB 회전(+1); C 는 두 원이 고정(+0)",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<PointCountScene {...modalCanvasSize()}/>}
    >
        <PointCountScene width={320} height={320}/>
    </CanvasFigure>;
};

export default RigidBodyPointCount;
