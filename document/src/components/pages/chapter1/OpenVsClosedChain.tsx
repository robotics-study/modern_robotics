import {useEffect, useRef, useState} from "react";
import {Circle, Layer, Line, Stage, Text} from "react-konva";
import CanvasFigure from "../../CanvasFigure";
import {useTr} from "../../../libs/i18n";
import {circleCircleIntersect, planarFk} from "../../../libs/planarArm";
import {useCanvasColors} from "../../../libs/useTheme";

// 개방연쇄 vs 폐연쇄 미리보기. 왼쪽 3R 팔은 모든 관절이 구동(actuated)되어 제각기 움직이고,
// 오른쪽 4절 링크는 크랭크 하나만 구동하면 나머지 관절이 loop closure 로 따라온다 — Ch.2/7 의
// 심화(자유도 계산, 조립 모드/특이점)에 앞서 두 구조의 차이만 눈에 담게 한다.
const ARM_BASE = {x: -2.9, y: 0};
const ARM_LINKS = [1.4, 1.05, 0.75];

// Grashof crank-rocker (s+l ≤ p+q, 최단 링크가 크랭크): 크랭크가 완전 회전할 수 있는 길이 조합.
const FB_A = {x: 1.35, y: 0};       // 크랭크 지면 피벗
const FB_D = {x: 3.55, y: 0};       // 로커 지면 피벗
const FB_CRANK = 0.7;
const FB_COUPLER = 2.2;
const FB_ROCKER = 1.5;

const PASSIVE_COLOR = "#f2a63a";

interface SceneProps {
    width: number;
    height: number;
}

const OpenVsClosedScene = ({width, height}: SceneProps) => {
    const colors = useCanvasColors();
    const [playing, setPlaying] = useState(true);
    const [t, setT] = useState(0.8);
    const rafRef = useRef<number>();
    const baseRef = useRef(0.8);

    useEffect(() => {
        if (!playing) return;
        const start = performance.now();
        const offset = baseRef.current;
        const tick = (now: number) => {
            const cur = offset + (now - start) / 1000;
            baseRef.current = cur;
            setT(cur);
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [playing]);

    // 세계좌표(단위 링크 길이) → 픽셀. 지면선을 캔버스 아래쪽 1/4 지점에 둔다.
    const s = width / 10;
    const groundY = height * 0.74;
    const toPx = (x: number, y: number) => ({x: width / 2 + x * s, y: groundY - y * s});

    // 개방연쇄: 관절마다 독립된 사인 파형 — "관절 수 = 자유도 수" 를 움직임으로 보여준다.
    const theta = [
        1.35 + 0.45 * Math.sin(0.9 * t),
        -0.55 + 0.65 * Math.sin(1.4 * t + 1.1),
        0.35 + 0.8 * Math.sin(1.9 * t + 2.3),
    ];
    const arm = planarFk(theta, ARM_LINKS).points.map((p) =>
        toPx(ARM_BASE.x + p.x, ARM_BASE.y + p.y));

    // 폐연쇄: 크랭크 각 하나가 입력이고 B 는 loop closure(원-원 교점)로 결정된다.
    const phi = 1.1 * t;
    const A = {x: FB_A.x + FB_CRANK * Math.cos(phi), y: FB_A.y + FB_CRANK * Math.sin(phi)};
    const hit = circleCircleIntersect(A, FB_COUPLER, FB_D, FB_ROCKER, 1);
    const aPx = toPx(A.x, A.y);
    const fbA = toPx(FB_A.x, FB_A.y);
    const fbD = toPx(FB_D.x, FB_D.y);
    const bPx = hit ? toPx(hit.p.x, hit.p.y) : aPx;

    const ground = toPx(0, 0).y;

    return (
        <div className="flex flex-col gap-2 items-center" style={{width}}>
            <Stage width={width} height={height}
                   className="bg-surface border border-border rounded-lg overflow-hidden">
                <Layer>
                    {/* 왼쪽: 팔 받침 지면 / 오른쪽: 두 피벗을 잇는 지면 링크(점선) — Ch.7 four-bar 와 같은 표기 */}
                    <Line points={[8, ground, width * 0.42, ground]} stroke={colors.border} strokeWidth={2}/>
                    <Line points={[fbA.x, fbA.y, fbD.x, fbD.y]} stroke={colors.muted} strokeWidth={3}
                          dash={[6, 5]} lineCap="round"/>
                    <Text x={0} y={10} width={width / 2} align="center" text="open chain"
                          fontSize={13} fontStyle="bold" fill={colors.muted}/>
                    <Text x={width / 2} y={10} width={width / 2} align="center" text="closed chain"
                          fontSize={13} fontStyle="bold" fill={colors.muted}/>

                    {/* 3R 개방연쇄 — 링크 */}
                    {arm.slice(0, -1).map((p, i) => (
                        <Line key={`arm-${i}`} points={[p.x, p.y, arm[i + 1].x, arm[i + 1].y]}
                              stroke={colors.accent} strokeWidth={4} lineCap="round"/>
                    ))}
                    {/* 구동 관절(모두) */}
                    {arm.slice(0, -1).map((p, i) => (
                        <Circle key={`armj-${i}`} x={p.x} y={p.y} radius={5.5} fill={colors.accent}
                                stroke={colors.surface} strokeWidth={1.5}/>
                    ))}
                    {/* end-effector */}
                    <Circle x={arm[arm.length - 1].x} y={arm[arm.length - 1].y} radius={6}
                            fill={colors.surface} stroke={colors.accent} strokeWidth={2}/>

                    {/* 4절 폐연쇄 — 크랭크(구동)만 accent, 나머지는 수동 */}
                    {hit && (
                        <>
                            <Line points={[aPx.x, aPx.y, bPx.x, bPx.y]} stroke={colors.text}
                                  strokeWidth={4} lineCap="round"/>
                            <Line points={[fbD.x, fbD.y, bPx.x, bPx.y]} stroke={PASSIVE_COLOR}
                                  strokeWidth={4} lineCap="round"/>
                        </>
                    )}
                    <Line points={[fbA.x, fbA.y, aPx.x, aPx.y]} stroke={colors.accent}
                          strokeWidth={4} lineCap="round"/>
                    <Circle x={fbA.x} y={fbA.y} radius={5.5} fill={colors.accent}
                            stroke={colors.surface} strokeWidth={1.5}/>
                    <Circle x={fbD.x} y={fbD.y} radius={5} fill={colors.surface}
                            stroke={PASSIVE_COLOR} strokeWidth={2}/>
                    <Circle x={aPx.x} y={aPx.y} radius={5} fill={colors.surface}
                            stroke={PASSIVE_COLOR} strokeWidth={2}/>
                    {hit && (
                        <Circle x={bPx.x} y={bPx.y} radius={5} fill={colors.surface}
                                stroke={PASSIVE_COLOR} strokeWidth={2}/>
                    )}
                </Layer>
            </Stage>
            <div className="w-full flex items-center justify-center gap-3 text-xs text-muted">
                <button
                    type="button"
                    onClick={() => setPlaying((p) => !p)}
                    className="px-2 py-1 rounded border border-[var(--accent)] text-[var(--accent)] font-semibold"
                >
                    {playing ? "❚❚ Pause" : "▶ Play"}
                </button>
                <span>
                    <span className="text-[var(--accent)] font-semibold">●</span> actuated ·{" "}
                    <span style={{color: PASSIVE_COLOR}} className="font-semibold">○</span> passive
                </span>
            </div>
        </div>
    );
};

const OpenVsClosedChain = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "open chain (all joints actuated) vs. closed chain (one crank drives the loop)",
            "open chain(모든 관절 구동) vs. closed chain(크랭크 하나가 루프 전체를 구동)",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<OpenVsClosedScene width={560} height={380}/>}
    >
        <OpenVsClosedScene width={360} height={250}/>
    </CanvasFigure>;
};

export default OpenVsClosedChain;
