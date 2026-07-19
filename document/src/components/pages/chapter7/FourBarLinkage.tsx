import {useMemo, useState} from "react";
import {Circle, Circle as KCircle, Layer, Line, Line as KLine, Rect, Stage, Text, Text as KText} from "react-konva";
import CoordinateSystem from "../../2d/CoordinateCanvas";
import CanvasFigure from "../../CanvasFigure";
import {globalToMap} from "../../../libs/konvaUtils";
import {circleCircleIntersect} from "../../../libs/planarArm";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";

// 4절 링크(four-bar): 가장 단순한 폐연쇄 — 루프 하나, C-space 1자유도.
// 지면 P0—P3 를 기준으로 크랭크 P0→A 를 슬라이더 θ 로 돌리면, 커플러 b 와 로커 c 가
// 그리는 원 두 개의 교점으로 B 가 결정된다(loop closure). 교점이 둘 → 두 조립 모드(가지).
// change-point(평행사변형) 링크 길이라 두 가지가 θ=0,π 에서 만나며 — 그 지점이
// configuration-space singularity(bifurcation)다.
const GROUND = 3;       // P0—P3 지면 길이
const CRANK = 2;        // P0→A 입력 크랭크
const COUPLER = 3;      // A→B 커플러
const ROCKER = 2;       // P3→B 출력 로커
const RESOLUTION = 0.05;

// P0/P3 를 원점 기준 좌우 대칭으로 두어 그림을 가운데 정렬한다.
const P0 = {x: -GROUND / 2, y: 0};
const P3 = {x: GROUND / 2, y: 0};

const ROCKER_COLOR = "#f2a63a";

interface P {
    x: number;
    y: number;
}

interface Solution {
    reachable: boolean;
    B: P;
    psi: number;
    // 두 교점 사이 거리의 절반(원-원 수직 오프셋). 0 이면 두 가지가 합쳐지는 특이점.
    h: number;
}

// 원(A,COUPLER) 과 원(P3,ROCKER) 의 교점. sign 이 두 조립 모드를 고른다.
const solveFourBar = (theta: number, sign: number): Solution => {
    const A = {x: P0.x + CRANK * Math.cos(theta), y: P0.y + CRANK * Math.sin(theta)};
    // 두 원이 만나지 않으면(너무 멀거나 한쪽이 다른쪽 안) 그 θ 에서는 조립 불가.
    const hit = circleCircleIntersect(A, COUPLER, P3, ROCKER, sign);
    if (!hit) return {reachable: false, B: A, psi: 0, h: 0};
    return {reachable: true, B: hit.p, psi: Math.atan2(hit.p.y - P3.y, hit.p.x - P3.x), h: hit.h};
};

// C-space 미니플롯 좌표계.
const CS_W = 320, CS_H = 150, CS_PAD = 24;
const csX = (theta: number) => CS_PAD + (theta / (2 * Math.PI)) * (CS_W - 2 * CS_PAD);
const csY = (psi: number) => CS_PAD + (1 - (psi + Math.PI) / (2 * Math.PI)) * (CS_H - 2 * CS_PAD);

// 한 가지(sign)의 ψ(θ) 곡선을 flat 배열로. 도달 불가 구간은 끊어 여러 세그먼트로 나눈다.
const branchSegments = (sign: number): number[][] => {
    const segments: number[][] = [];
    let cur: number[] = [];
    const N = 240;
    for (let i = 0; i <= N; i++) {
        const theta = (i / N) * 2 * Math.PI;
        const s = solveFourBar(theta, sign);
        if (!s.reachable) {
            if (cur.length) segments.push(cur);
            cur = [];
            continue;
        }
        cur.push(csX(theta), csY(s.psi));
    }
    if (cur.length) segments.push(cur);
    return segments;
};

interface SceneProps {
    width: number;
    height: number;
}

const FourBarScene = ({width, height}: SceneProps) => {
    const colors = useCanvasColors();
    const t = useTr();
    const [theta, setTheta] = useState(1.1);
    const [sign, setSign] = useState(1);

    const sol = useMemo(() => solveFourBar(theta, sign), [theta, sign]);
    const branches = useMemo(() => ({pos: branchSegments(1), neg: branchSegments(-1)}), []);

    // 두 가지가 만나는 bifurcation: h≈0 인 θ. change-point 링크에선 θ=0, π 에서 발생.
    const bifurcations = useMemo(() => {
        const pts: {theta: number; psi: number}[] = [];
        [0, Math.PI].forEach((th) => {
            const s = solveFourBar(th, 1);
            if (s.reachable) pts.push({theta: th, psi: s.psi});
        });
        return pts;
    }, []);

    const toPx = (p: P) => globalToMap(width, height, p.x, p.y, RESOLUTION);
    const p0 = toPx(P0), p3 = toPx(P3);
    const A = {x: P0.x + CRANK * Math.cos(theta), y: P0.y + CRANK * Math.sin(theta)};
    const aPx = toPx(A);
    const bPx = toPx(sol.B);

    const singular = Math.abs(sol.h) < 0.06;
    const curSeg = sign > 0 ? branches.pos : branches.neg;
    const otherSeg = sign > 0 ? branches.neg : branches.pos;

    return (
        <div className="flex flex-col gap-2 items-center" style={{width}}>
            <CoordinateSystem
                width={width}
                height={height}
                resolution={RESOLUTION}
                className="bg-surface border border-border rounded-lg"
            >
                {/* 지면 P0—P3 */}
                <Line points={[p0.x, p0.y, p3.x, p3.y]} stroke={colors.muted} strokeWidth={3}
                      dash={[6, 5]} lineCap="round"/>
                {sol.reachable && (
                    <>
                        {/* 커플러 A—B */}
                        <Line points={[aPx.x, aPx.y, bPx.x, bPx.y]} stroke={colors.text} strokeWidth={4}
                              lineCap="round"/>
                        {/* 로커 P3—B */}
                        <Line points={[p3.x, p3.y, bPx.x, bPx.y]} stroke={ROCKER_COLOR} strokeWidth={4}
                              lineCap="round"/>
                    </>
                )}
                {/* 크랭크 P0—A (항상 유효) */}
                <Line points={[p0.x, p0.y, aPx.x, aPx.y]} stroke={colors.accent} strokeWidth={4}
                      lineCap="round"/>
                {/* 지면 고정 관절 */}
                <Circle x={p0.x} y={p0.y} radius={6} fill={colors.text}/>
                <Circle x={p3.x} y={p3.y} radius={6} fill={colors.text}/>
                {/* 가동 관절 A, B */}
                <Circle x={aPx.x} y={aPx.y} radius={5} fill={colors.surface} stroke={colors.accent}
                        strokeWidth={2}/>
                {sol.reachable && (
                    <Circle x={bPx.x} y={bPx.y} radius={5} fill={colors.surface}
                            stroke={singular ? colors.muted : ROCKER_COLOR} strokeWidth={2}/>
                )}
                <Text x={aPx.x + 8} y={aPx.y - 16} text="A" fontSize={13} fontStyle="bold" fill={colors.accent}/>
                {sol.reachable && (
                    <Text x={bPx.x + 8} y={bPx.y - 16} text="B" fontSize={13} fontStyle="bold" fill={ROCKER_COLOR}/>
                )}
            </CoordinateSystem>

            <div className="w-full flex flex-col gap-1 text-xs text-muted">
                <label className="flex items-center gap-2">
                    <span className="w-8 shrink-0">θ</span>
                    <input
                        type="range"
                        min={0}
                        max={2 * Math.PI}
                        step={0.01}
                        value={theta}
                        onChange={(e) => setTheta(parseFloat(e.target.value))}
                        className="w-full accent-[var(--accent)]"
                        aria-label={t("driving crank angle theta", "구동 크랭크 각도 theta")}
                    />
                    <span className="w-12 shrink-0 text-right tabular-nums">
                        {Math.round((theta * 180) / Math.PI)}°
                    </span>
                </label>
                <div className="flex items-center justify-center gap-3 pt-0.5">
                    <button
                        type="button"
                        onClick={() => setSign((s) => -s)}
                        className="px-2 py-0.5 rounded border border-border hover:bg-surface"
                    >
                        assembly branch: {sign > 0 ? "▲" : "▼"}
                    </button>
                    <span>
                        ψ = {sol.reachable ? `${Math.round((sol.psi * 180) / Math.PI)}°` : "—"}{" "}
                        {singular
                            ? <span className="text-[var(--accent)] font-semibold">· bifurcation (branches meet)</span>
                            : <span>· regular</span>}
                    </span>
                </div>
            </div>

            {/* C-space 패널: ψ vs θ. 현재 가지는 진하게, 반대 가지는 흐리게; 두 가지의 만남점이 특이점. */}
            <Stage width={CS_W} height={CS_H} className="bg-surface border border-border rounded-lg overflow-hidden">
                <Layer>
                    <Rect x={CS_PAD} y={CS_PAD} width={CS_W - 2 * CS_PAD} height={CS_H - 2 * CS_PAD}
                          stroke={colors.border} strokeWidth={1}/>
                    <KText x={CS_PAD} y={CS_H - CS_PAD + 4} text="θ 0" fontSize={11} fill={colors.muted}/>
                    <KText x={CS_W - CS_PAD - 18} y={CS_H - CS_PAD + 4} text="2π" fontSize={11} fill={colors.muted}/>
                    <KText x={2} y={CS_PAD - 6} text="ψ +π" fontSize={11} fill={colors.muted}/>
                    <KText x={4} y={CS_H - CS_PAD - 10} text="−π" fontSize={11} fill={colors.muted}/>
                    {otherSeg.map((seg, i) => (
                        <KLine key={`other-${i}`} points={seg} stroke={colors.muted} strokeWidth={1.5}
                               dash={[4, 4]} opacity={0.6}/>
                    ))}
                    {curSeg.map((seg, i) => (
                        <KLine key={`cur-${i}`} points={seg} stroke={colors.accent} strokeWidth={2.5}/>
                    ))}
                    {bifurcations.map((b, i) => (
                        <KCircle key={`bif-${i}`} x={csX(b.theta)} y={csY(b.psi)} radius={4}
                                 stroke={colors.text} strokeWidth={1.5} fill={colors.surface}/>
                    ))}
                    {sol.reachable && (
                        <KCircle x={csX(theta)} y={csY(sol.psi)} radius={5} fill={colors.accent}/>
                    )}
                    <KText x={CS_W - CS_PAD - 74} y={4} text="bifurcation ○" fontSize={11} fill={colors.muted}/>
                </Layer>
            </Stage>
        </div>
    );
};

const FourBarLinkage = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "four-bar linkage · sweep θ; the C-space panel shows ψ(θ) and its bifurcations",
            "Four-Bar Linkage · θ 를 훑는다; C-space 패널은 ψ(θ) 와 그 분기점을 보여준다"
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<FourBarScene width={460} height={460}/>}
    >
        <FourBarScene width={320} height={320}/>
    </CanvasFigure>;
};

export default FourBarLinkage;
