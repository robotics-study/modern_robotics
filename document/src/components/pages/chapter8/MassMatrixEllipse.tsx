import {useMemo, useState} from "react";
import {Circle, Ellipse, Line, Text} from "react-konva";
import CoordinateSystem from "../../2d/CoordinateCanvas";
import CanvasFigure from "../../CanvasFigure";
import {planarFk} from "../../../libs/planarArm";
import {useCanvasColors} from "../../../libs/useTheme";
import {massMatrix2R, TWO_R} from "./twoRModel";

// 관성의 자세 의존성: 자세 θ 에서 단위 관절토크 원 {‖u‖=1} 을 M⁻¹ 로 사상하면 관절가속도 타원
// {M⁻¹u} 이 된다. 둥근 타원 = 등방적(가속 쉬움), 늘어난 타원 = 방향 의존·커플링 강함.
// 팔을 접으면(θ2→π) 타원이 둥글어지고 펴면(θ2→0) 가늘어진다.
const {l1: L1, l2: L2} = TWO_R;
// 확장 자세(θ2→0)에서 가속도 타원의 장축이 커지므로, 그때도 캔버스 안에 담기도록 축척을 잡는다.
const RESOLUTION = 0.025;
const SCALE = 1 / RESOLUTION;
// 코너에 그리는 팔 자세 미니어처(가속도 평면과 좌표가 다르므로 픽셀 단위로 따로 그린다).
const ARM_ORIGIN = {x: 42, y: 42};
const ARM_SCALE = 15;

const degrees = (rad: number) => Math.round((rad * 180) / Math.PI);

interface Eig {
    major: number;
    minor: number;
    angle: number;
}

// 대칭 2×2 [[a,b],[b,c]] 의 고유분해. M⁻¹ 은 SPD 라 고윳값이 곧 반축 길이(원→타원 사상)다.
const symEig = (a: number, b: number, c: number): Eig => {
    const mid = (a + c) / 2;
    const half = Math.sqrt(Math.max(0, ((a - c) / 2) ** 2 + b * b));
    return {major: mid + half, minor: Math.max(0, mid - half), angle: 0.5 * Math.atan2(2 * b, a - c)};
};

interface SceneProps {
    width: number;
    height: number;
}

const MassMatrixScene = ({width, height}: SceneProps) => {
    const colors = useCanvasColors();
    const [theta, setTheta] = useState<[number, number]>([0.6, 1.6]);

    const {m11, m12, m22, eig, det} = useMemo(() => {
        const [a, b, c] = massMatrix2R(theta[1]);
        const det = a * c - b * b;
        // M⁻¹ = (1/det)[[M22, −M12], [−M12, M11]] — 대칭. 이 행렬의 고유분해가 가속도 타원을 준다.
        // 점질량 2R 은 항상 SPD 라 det>0 이지만, 0 근처에서의 NaN 을 막는 안전장치를 둔다.
        const inv = Math.abs(det) < 1e-9 ? 0 : 1 / det;
        return {m11: a, m12: b, m22: c, det, eig: symEig(c * inv, -b * inv, a * inv)};
    }, [theta]);

    const rotationDeg = (-eig.angle * 180) / Math.PI;
    const center = {x: width / 2, y: height / 2};
    const ratio = eig.minor > 1e-6 ? eig.major / eig.minor : Infinity;

    // 코너 미니어처 팔: 좌표 눈금과 무관한 자체 축척으로 자세만 보여준다.
    const armPx = planarFk(theta, [L1, L2]).points.map((p) => ({
        x: ARM_ORIGIN.x + p.x * ARM_SCALE,
        y: ARM_ORIGIN.y - p.y * ARM_SCALE,
    }));

    const setJoint = (i: number, v: number) =>
        setTheta((prev) => {
            const next = [...prev] as [number, number];
            next[i] = v;
            return next;
        });

    return (
        <div className="flex flex-col gap-2 items-center" style={{width}}>
            <CoordinateSystem
                width={width}
                height={height}
                resolution={RESOLUTION}
                className="bg-surface border border-border rounded-lg"
            >
                {/* 입력: 단위 관절토크 원 ‖u‖=1 */}
                <Circle x={center.x} y={center.y} radius={SCALE} stroke={colors.muted} strokeWidth={1.5}
                        dash={[5, 4]}/>
                {/* 출력: 관절가속도 타원 {M⁻¹u} */}
                <Ellipse
                    x={center.x}
                    y={center.y}
                    radiusX={Math.max(eig.major * SCALE, 1)}
                    radiusY={Math.max(eig.minor * SCALE, 1)}
                    rotation={rotationDeg}
                    fill={colors.accent}
                    opacity={0.28}
                    stroke={colors.accent}
                    strokeWidth={2}
                />
                <Text x={center.x + SCALE + 6} y={center.y - 4} text="θ̈₁" fontSize={13} fill={colors.muted}/>
                <Text x={center.x + 6} y={center.y - SCALE - 16} text="θ̈₂" fontSize={13} fill={colors.muted}/>

                {/* 코너 팔 자세 */}
                {armPx.slice(0, -1).map((p, i) => (
                    <Line key={`arm-${i}`} points={[p.x, p.y, armPx[i + 1].x, armPx[i + 1].y]}
                          stroke={colors.text} strokeWidth={3} lineCap="round" opacity={0.6}/>
                ))}
                {armPx.map((p, i) => (
                    <Circle key={`arm-j-${i}`} x={p.x} y={p.y} radius={3} fill={colors.text} opacity={0.6}/>
                ))}
                <Text x={ARM_ORIGIN.x - 12} y={ARM_ORIGIN.y - 30} text="posture" fontSize={11} fill={colors.muted}/>
            </CoordinateSystem>
            <div className="w-full flex flex-col gap-1 text-xs text-muted">
                {[0, 1].map((i) => (
                    <label key={i} className="flex items-center gap-2">
                        <span className="w-8 shrink-0">θ{i + 1}</span>
                        <input
                            type="range"
                            min={-Math.PI}
                            max={Math.PI}
                            step={0.01}
                            value={theta[i]}
                            onChange={(e) => setJoint(i, parseFloat(e.target.value))}
                            className="w-full accent-[var(--accent)]"
                            aria-label={`joint angle theta ${i + 1}`}
                        />
                        <span className="w-12 shrink-0 text-right tabular-nums">{degrees(theta[i])}°</span>
                    </label>
                ))}
                <div className="flex items-center justify-between pt-1 tabular-nums">
                    <span>
                        M = [{m11.toFixed(2)}, {m12.toFixed(2)}; {m12.toFixed(2)}, {m22.toFixed(2)}]
                    </span>
                    <span>κ = {ratio === Infinity ? "∞" : ratio.toFixed(2)}</span>
                </div>
                <div className="text-center">det&nbsp;M = {det.toFixed(2)}</div>
            </div>
        </div>
    );
};

const MassMatrixEllipse = () => {
    return <CanvasFigure
        label="acceleration ellipse · configuration-dependence of inertia"
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<MassMatrixScene width={460} height={460}/>}
    >
        <MassMatrixScene width={320} height={320}/>
    </CanvasFigure>;
};

export default MassMatrixEllipse;
