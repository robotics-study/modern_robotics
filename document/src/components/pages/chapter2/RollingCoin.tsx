import {useEffect, useRef, useState} from "react";
import {Group, Line, Rect} from "react-konva";
import CoordinateSystem from "../../2d/CoordinateCanvas";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {useTr} from "../../../libs/i18n";
import {globalToMap} from "../../../libs/konvaUtils";
import {useCanvasColors} from "../../../libs/useTheme";

// 구르는 동전과 똑같은 no-slip 제약을 따르는 자동차(위에서 본 모습) — 원반보다 "옆으로는 못
// 미끄러진다"가 즉각 읽힌다. configuration 은 q = (x, y, φ, θ) 로 4차원이지만 속도 입력은
// 구동 θ̇ 과 조향 φ̇ 둘뿐: ẋ = rθ̇cosφ, ẏ = rθ̇sinφ 가 nonholonomic 제약이다.
// "평행 주차" 시연: 옆으로는 절대 못 미끄러지는데도 조향+구동 조합으로 옆 자리에 도달한다.
const COIN_R = 0.5;       // 바퀴 반지름 r
const RESOLUTION = 0.05;
const HEADING_COLOR = "#f2a63a";
const SPOKE_COLOR = "#e0533d";
// 차체 크기 (world 단위)
const CAR_L = 2.2, CAR_W = 1.2;

interface Q {
    x: number;
    y: number;
    phi: number;
    theta: number;
}

const Q0: Q = {x: -3, y: -2, phi: 0, theta: 0};

// 평행 주차 시연 스크립트. 제자리 회전은 동전 모델에선 합법이지만 실제 자동차로는 불가능하므로,
// 시연은 자동차도 낼 수 있는 궤적만 쓴다: 전진으로 옆 차 옆에 서고 → 후진 아크(조향) →
// 반대 조향의 후진 아크 → 살짝 전진. 두 아크가 서로 heading 변화를 상쇄해, 옆으로는 한 번도
// 미끄러지지 않았는데 차는 옆 자리(아래쪽)로 들어가 있다.
interface Segment {
    dur: number;
    thetaDot: number;
    phiDot: number;
}

const ARC_T = 0.85, ARC_W = 1.0, DRIVE = 3;   // 아크당 heading 변화 = ±ARC_W·ARC_T (≈49°)

// 구간 내 시간 워프: 입력이 0 → 피크 → 0 으로 부드럽게 변한다 (계단식 점프 제거).
// w(s) = 1 − cos(2πs) 는 평균이 1이고 양 끝에서 0 — 두 입력을 같은 비율로 흔들기 때문에
// 그리는 경로 자체는 등속 버전과 동일하고(시간 재매개변수화), 종점도 정확히 유지된다.
const warp = (s: number) => 1 - Math.cos(2 * Math.PI * s);
// warp 의 적분 W(s) = s − sin(2πs)/(2π). 프레임 적분을 해석적으로 해 오차 누적을 없앤다.
const warpInt = (s: number) => s - Math.sin(2 * Math.PI * s) / (2 * Math.PI);

const PARKING: Segment[] = [
    {dur: 0.7, thetaDot: DRIVE, phiDot: 0},              // 전진해 자리 옆에 선다
    {dur: ARC_T, thetaDot: -DRIVE, phiDot: ARC_W},       // 후진 아크 (뒤가 자리 쪽으로 돈다)
    {dur: ARC_T, thetaDot: -DRIVE, phiDot: -ARC_W},      // 반대 조향 후진 아크 — heading 복원
    {dur: 0.45, thetaDot: DRIVE, phiDot: 0},             // 살짝 전진해 자리 중앙으로
];

// PARKING 을 Q0 에서 적분한 종점 (아크 적분의 닫힌형으로 계산한 값) — 목표 주차칸 위치.
const SPOT = {x: -3.53, y: -3.02};

interface SceneProps {
    width: number;
    height: number;
}

const RollingCoinScene = ({width, height}: SceneProps) => {
    // 큰 모달 캔버스에서는 world 스케일(resolution)도 함께 키운다 (460px 기준 유지).
    const res = RESOLUTION * Math.min(1, 460 / width);
    const colors = useCanvasColors();
    const t = useTr();
    const [q, setQ] = useState<Q>(Q0);
    const [thetaDot, setThetaDot] = useState(2);
    const [phiDot, setPhiDot] = useState(1);
    const [playing, setPlaying] = useState(true);
    const [demoOn, setDemoOn] = useState(false);
    const [trace, setTrace] = useState<number[]>([]);
    const rafRef = useRef<number>();
    const lastRef = useRef<number | null>(null);
    // rAF 콜백이 항상 최신 값을 보도록 ref 로 미러링한다.
    const rateRef = useRef({thetaDot, phiDot});
    rateRef.current = {thetaDot, phiDot};
    const demoRef = useRef<{segs: Segment[]; idx: number; left: number} | null>(null);

    const lim = (width / 2) * res - 1;

    useEffect(() => {
        if (!playing) {
            lastRef.current = null;
            return;
        }
        const tick = (now: number) => {
            const dt = lastRef.current === null ? 0 : Math.min(0.05, (now - lastRef.current) / 1000);
            lastRef.current = now;
            // 시연 중이면 스크립트 구간의 속도를, 아니면 슬라이더 값을 쓴다.
            let {thetaDot: td, phiDot: pd} = rateRef.current;
            let dtUse = dt;
            const demo = demoRef.current;
            if (demo) {
                const seg = demo.segs[demo.idx];
                td = seg.thetaDot;
                pd = seg.phiDot;
                // 구간 경계를 넘겨 적분하지 않도록 dt 를 남은 시간으로 자르고,
                // 워프 적분(해석해)으로 유효 적분 시간을 구한다 — 종점이 정확히 유지된다.
                const T = seg.dur;
                const s1 = 1 - demo.left / T;
                const step = Math.min(dt, demo.left);
                demo.left -= step;
                const s2 = 1 - demo.left / T;
                dtUse = (warpInt(s2) - warpInt(s1)) * T;
                if (demo.left <= 1e-9) {
                    demo.idx += 1;
                    if (demo.idx >= demo.segs.length) {
                        // 시연이 끝나면 멈춰서 "옆으로 이동했지만 heading 은 그대로"인 결과를 보여준다.
                        demoRef.current = null;
                        setDemoOn(false);
                        setPlaying(false);
                    } else {
                        demo.left = demo.segs[demo.idx].dur;
                    }
                }
            }
            setQ((prev) => ({
                // no-slip: 접촉점은 반드시 (cosφ, sinφ) 방향으로 rθ̇ 의 속력으로만 움직인다.
                x: Math.max(-lim, Math.min(lim, prev.x + COIN_R * td * Math.cos(prev.phi) * dtUse)),
                y: Math.max(-lim, Math.min(lim, prev.y + COIN_R * td * Math.sin(prev.phi) * dtUse)),
                phi: prev.phi + pd * dtUse,
                theta: prev.theta + td * dtUse,
            }));
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [playing, lim]);

    // 자취는 q 갱신에 맞춰 누적한다 (같은 프레임의 파생 상태라 effect 로 분리).
    useEffect(() => {
        setTrace((prev) => {
            const m = globalToMap(width, height, q.x, q.y, res);
            const next = [...prev, m.x, m.y];
            // 오래된 자취는 잘라 성능/가독을 유지한다.
            return next.length > 1200 ? next.slice(next.length - 1200) : next;
        });
    }, [q.x, q.y, width, height]);

    const c = globalToMap(width, height, q.x, q.y, res);
    const start = globalToMap(width, height, Q0.x, Q0.y, res);
    const px = (v: number) => v / res;
    // 시연 중에는 스크립트 구간의 순간 입력(워프 적용)을 그대로 노출한다 — 슬라이더와
    // 앞바퀴가 함께 부드럽게 움직여 "지금 어떤 (θ̇, φ̇) 를 넣고 있는지"를 보여준다.
    const demo = demoOn ? demoRef.current : null;
    const seg = demo ? demo.segs[Math.min(demo.idx, demo.segs.length - 1)] : null;
    const w = demo && seg ? warp(1 - demo.left / seg.dur) : 1;
    const activeDrive = seg ? seg.thetaDot * w : thetaDot;
    const activeSteer = seg ? seg.phiDot * w : phiDot;
    const frontWheelDeg = Math.max(-32, Math.min(32, -activeSteer * 14)) * (playing ? 1 : 0);

    const reset = () => {
        demoRef.current = null;
        setDemoOn(false);
        setPlaying(false);
        setQ(Q0);
        setTrace([]);
    };
    const startDemo = () => {
        reset();
        demoRef.current = {segs: PARKING, idx: 0, left: PARKING[0].dur};
        setDemoOn(true);
        setPlaying(true);
    };

    const deg = (r: number) => Math.round((((r * 180 / Math.PI) % 360) + 360) % 360);
    const chip = "px-2 py-0.5 rounded bg-surface border border-border tabular-nums";

    return (
        <div className="flex flex-col gap-2 items-center" style={{width}}>
            <CoordinateSystem
                width={width}
                height={height}
                resolution={res}
                className="bg-surface border border-border rounded-lg"
            >
                {/* 목표 주차칸(점선) + 앞뒤로 주차된 차 — 시연이 "평행 주차"로 읽히게 한다 */}
                {(() => {
                    const spot = globalToMap(width, height, SPOT.x, SPOT.y, res);
                    const sw = px(CAR_L + 0.6), sh = px(CAR_W + 0.5);
                    return <>
                        <Rect x={spot.x - sw / 2} y={spot.y - sh / 2} width={sw} height={sh}
                              cornerRadius={5} stroke={colors.muted} strokeWidth={1.5} dash={[7, 6]}/>
                        {[-1, 1].map((s) => (
                            <Rect key={`parked${s}`}
                                  x={spot.x + s * px(CAR_L + 1.1) - px(CAR_L / 2)}
                                  y={spot.y - px(CAR_W / 2)}
                                  width={px(CAR_L)} height={px(CAR_W)} cornerRadius={8}
                                  fill={colors.muted} opacity={0.45}/>
                        ))}
                    </>;
                })()}
                {/* 시작 위치 마커 */}
                <Line points={[start.x - 7, start.y, start.x + 7, start.y]} stroke={colors.muted}
                      strokeWidth={1.5}/>
                <Line points={[start.x, start.y - 7, start.x, start.y + 7]} stroke={colors.muted}
                      strokeWidth={1.5}/>
                {trace.length >= 4 && (
                    <Line points={trace} stroke={colors.accent} strokeWidth={2} opacity={0.55}
                          lineCap="round" lineJoin="round"/>
                )}
                {/* 자동차 (로컬 +x 가 전방, Konva rotation 은 시계 방향 度) */}
                <Group x={c.x} y={c.y} rotation={-q.phi * 180 / Math.PI}>
                    {/* 뒷바퀴 */}
                    {[1, -1].map((s) => (
                        <Rect key={`rw${s}`} x={px(-CAR_L * 0.33) - px(0.25)} y={s * px(CAR_W / 2) - px(0.09)}
                              width={px(0.5)} height={px(0.18)} cornerRadius={2} fill={colors.text}/>
                    ))}
                    {/* 앞바퀴 — 조향 입력만큼 꺾인다 */}
                    {[1, -1].map((s) => (
                        <Rect key={`fw${s}`} x={px(CAR_L * 0.33)} y={s * px(CAR_W / 2)}
                              offsetX={px(0.25)} offsetY={px(0.09)}
                              width={px(0.5)} height={px(0.18)} cornerRadius={2} fill={colors.text}
                              rotation={frontWheelDeg}/>
                    ))}
                    {/* 차체 */}
                    <Rect x={-px(CAR_L / 2)} y={-px(CAR_W / 2)} width={px(CAR_L)} height={px(CAR_W)}
                          cornerRadius={8} fill={colors.accent} opacity={0.92}
                          stroke={colors.surface} strokeWidth={1.5}/>
                    {/* 앞유리 (전방 표시) */}
                    <Rect x={px(CAR_L * 0.12)} y={-px(CAR_W * 0.32)} width={px(0.4)}
                          height={px(CAR_W * 0.64)} cornerRadius={3} fill={colors.surface} opacity={0.85}/>
                    {/* 헤드라이트 */}
                    {[1, -1].map((s) => (
                        <Rect key={`hl${s}`} x={px(CAR_L / 2) - px(0.13)} y={s * px(CAR_W * 0.3) - px(0.05)}
                              width={px(0.13)} height={px(0.13)} cornerRadius={2} fill={HEADING_COLOR}/>
                    ))}
                </Group>
            </CoordinateSystem>

            <div className="w-full flex flex-col gap-1 text-xs text-muted">
                <label className="flex items-center gap-2">
                    <span className="w-16 shrink-0">θ̇ {t("drive", "구동")}</span>
                    <input type="range" min={-6} max={6} step={0.1} value={activeDrive}
                           disabled={demoOn}
                           onChange={(e) => setThetaDot(parseFloat(e.target.value))}
                           className="w-full accent-[var(--accent)]"
                           aria-label={t("driving speed", "구동 속도")}/>
                    <span className="w-10 shrink-0 text-right tabular-nums">{activeDrive.toFixed(1)}</span>
                </label>
                <label className="flex items-center gap-2">
                    <span className="w-16 shrink-0">φ̇ {t("steer", "조향")}</span>
                    <input type="range" min={-3} max={3} step={0.1} value={activeSteer}
                           disabled={demoOn}
                           onChange={(e) => setPhiDot(parseFloat(e.target.value))}
                           className="w-full accent-[var(--accent)]"
                           aria-label={t("steering rate", "조향 속도")}/>
                    <span className="w-10 shrink-0 text-right tabular-nums">{activeSteer.toFixed(1)}</span>
                </label>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <button
                        type="button"
                        onClick={() => setPlaying((p) => !p)}
                        className="px-2.5 py-1 rounded border border-[var(--accent)] text-[var(--accent)] font-semibold"
                    >
                        {playing ? "❚❚ Pause" : "▶ Play"}
                    </button>
                    <button
                        type="button"
                        onClick={startDemo}
                        className="px-2.5 py-1 rounded border border-border font-semibold hover:bg-surface"
                    >
                        ⇥ {t("parallel parking", "평행 주차 시연")}
                    </button>
                    <button
                        type="button"
                        onClick={reset}
                        className="px-2.5 py-1 rounded border border-border hover:bg-surface"
                    >
                        ⟲ Reset
                    </button>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                    <span className={chip}>x {q.x.toFixed(2)}</span>
                    <span className={chip}>y {q.y.toFixed(2)}</span>
                    <span className={chip} style={{color: HEADING_COLOR}}>φ {deg(q.phi)}°</span>
                    <span className={chip} style={{color: SPOKE_COLOR}}>θ {deg(q.theta)}°</span>
                </div>
                <div className="text-center pt-0.5">
                    {demoOn
                        ? t("reverse arc → counter arc: the S-curve slides the car into the spot",
                            "후진 아크 → 반대 아크: S-커브가 차를 옆 자리로 밀어 넣는다")
                        : t("the car can never slide sideways, yet every (x, y, φ, θ) is reachable",
                            "차는 결코 옆으로 미끄러질 수 없지만, 모든 (x, y, φ, θ) 에 도달할 수 있다")}
                </div>
            </div>
        </div>
    );
};

const RollingCoin = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "no sideways sliding · drive θ̇ and steer φ̇ are the only inputs, yet all of (x, y, φ, θ) is reachable",
            "옆으로는 못 미끄러진다 · 입력은 구동 θ̇ 과 조향 φ̇ 뿐이지만 (x, y, φ, θ) 전부에 도달한다",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<RollingCoinScene {...modalCanvasSize()}/>}
    >
        <RollingCoinScene width={320} height={320}/>
    </CanvasFigure>;
};

export default RollingCoin;
