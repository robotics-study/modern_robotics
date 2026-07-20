import {useEffect, useMemo, useRef, useState} from "react";
import {Layer, Line, Rect, Stage, Text} from "react-konva";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";

// 책의 대표 예제인 화이트보드 지우기. 두 그림은 같은 순간, 같은 지우개를 서로 다른 각도에서
// 본 것이고 좌우(x) 위치가 정렬되어 있다.
//  - 위: 정면에서 본 보드. 지우개가 왕복하며 낙서를 지운다 → x 방향은 motion 제어.
//  - 아래: 위에서 내려다본 단면. 지우개가 보드를 파고드는 깊이와 누르는 힘이 보인다
//    → z 방향은 force 제어 (PI 로 Fd 유지).
// 낙서는 "지나가는 순간의 힘 × 머문 시간"만큼 지워지므로, "보드가 덜컹" 버튼으로 힘을
// 잠깐 꺼뜨리면 그 동안 지나간 자리만 덜 지워진 줄무늬로 남는다. 같은 방향에 힘과 움직임을
// 동시에 명령할 수는 없고, 방향을 나눠서 하나씩 맡기는 것이 hybrid 제어다.
const DT = 0.002;
const K_ENV = 300;
const N_BINS = 90;
const BAND = {y0: 0.30, y1: 0.72};   // 낙서 밴드 (정면 뷰 비율 좌표)

// 항상 같은 낙서가 나오도록 LCG 로 생성한다. 칸별 잉크량(선분 길이 합)도 함께 만들어
// "지워진 정도"를 실제 낙서 기준으로 잴 수 있게 한다 (빈 칸은 계산에 안 들어간다).
const makeScribbles = () => {
    let seed = 42;
    const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
    const segs: Array<{x1: number; y1: number; x2: number; y2: number}> = [];
    const ink = new Array(N_BINS).fill(0);
    for (let k = 0; k < 22; k++) {
        let x = 0.16 + rnd() * 0.62;
        let y = BAND.y0 + rnd() * (BAND.y1 - BAND.y0);
        const n = 8 + Math.floor(rnd() * 10);
        for (let i = 0; i < n; i++) {
            const nx = Math.max(0.14, Math.min(0.86, x + (rnd() - 0.45) * 0.09));
            const ny = Math.max(BAND.y0, Math.min(BAND.y1, y + (rnd() - 0.5) * 0.07));
            segs.push({x1: x, y1: y, x2: nx, y2: ny});
            const bin = Math.max(0, Math.min(N_BINS - 1, Math.floor(((x + nx) / 2) * N_BINS)));
            ink[bin] += Math.hypot(nx - x, ny - y);
            x = nx;
            y = ny;
        }
    }
    return {segs, ink};
};

interface SimState {
    x: number; dx: number;          // 보드와 나란한 방향 (motion 제어)
    z: number; dz: number;          // 보드를 파고드는 방향 (force 제어)
    boardZ: number; boardTarget: number; integ: number; time: number;
    phase: number;                  // 왕복 궤적의 위상 (속도 슬라이더가 바뀌어도 연속)
    quality: number[];              // 칸별 지워진 정도 0..1
}

const freshState = (): SimState => ({
    x: 0.5, dx: 0, z: 0.66, dz: 0, boardZ: 0.7, boardTarget: 0.7, integ: 0, time: 0, phase: 0,
    quality: new Array(N_BINS).fill(0),
});

interface SceneProps {
    panel?: number;
}

const EraserScene = ({panel = 340}: SceneProps) => {
    const colors = useCanvasColors();
    const t = useTr();
    const [fd, setFd] = useState(10);
    const [speed, setSpeed] = useState(0.55);
    const [, setTick] = useState(0);
    const {segs, ink} = useMemo(makeScribbles, []);

    const stateRef = useRef<SimState>(freshState());
    const paramsRef = useRef({fd, speed});
    paramsRef.current = {fd, speed};

    useEffect(() => {
        let raf = 0, last: number | null = null;
        const loop = (ts: number) => {
            if (last === null) last = ts;
            const real = Math.min((ts - last) / 1000, 0.05);
            last = ts;
            const s = stateRef.current;
            const p = paramsRef.current;
            const steps = Math.max(1, Math.round(real / DT));
            for (let i = 0; i < steps; i++) {
                // 보드는 목표 위치로 부드럽게 이동한다. 순간이동시키면 복귀 순간에
                // 지우개를 때리면서 튀는 모션이 생긴다.
                s.boardZ += (s.boardTarget - s.boardZ) * Math.min(1, DT * 6);
                // z: force 제어. 접촉힘을 재서 PI 로 Fd 에 붙인다.
                const pen = Math.max(0, s.z - s.boardZ);
                const fc = K_ENV * pen;
                const fe = p.fd - fc;
                s.integ += fe * DT;
                s.integ = Math.max(-3, Math.min(3, s.integ));
                const uz = p.fd + 1.5 * fe + 30 * s.integ - 40 * s.dz;
                s.dz += (uz - fc) * DT;
                s.z = Math.max(0.5, Math.min(s.boardZ + 0.05, s.z + s.dz * DT));
                // x: motion 제어. 왕복 궤적을 PD 로 추종한다. 위상을 누적해 두면
                // 속도 슬라이더를 움직여도 목표 위치가 점프하지 않는다.
                s.phase += p.speed * DT;
                const xd = 0.5 + 0.38 * Math.sin(s.phase);
                const dxd = 0.38 * p.speed * Math.cos(s.phase);
                const ux = 400 * (xd - s.x) + 40 * (dxd - s.dx);
                s.dx += ux * DT;
                const nx = s.x + s.dx * DT;
                if (nx < 0.03 || nx > 0.97) s.dx = 0;
                s.x = Math.max(0.03, Math.min(0.97, nx));
                s.time += DT;
                // 지우개 폭 아래 칸들이 "그 순간의 힘 × 머문 시간"만큼 지워진다.
                const strength = Math.min(1, fc / p.fd);
                const b0 = Math.floor((s.x - 0.045) * N_BINS), b1 = Math.floor((s.x + 0.045) * N_BINS);
                for (let bn = Math.max(0, b0); bn <= Math.min(N_BINS - 1, b1); bn++) {
                    s.quality[bn] = Math.min(1, s.quality[bn] + strength * DT * 0.45);
                }
            }
            setTick((n) => n + 1);
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, []);

    const s = stateRef.current;
    const W = panel;
    const H1 = Math.round(panel * 0.52);    // 정면 뷰
    const H2 = Math.round(panel * 0.34);    // 내려다본 단면
    const fNow = K_ENV * Math.max(0, s.z - s.boardZ);
    const onTarget = Math.abs(fNow - fd) < fd * 0.15;
    const eraserW = W * 0.09;
    // 낙서가 실제로 있는 칸만, 잉크량으로 가중해서 잰다.
    const inkTotal = ink.reduce((a, b) => a + b, 0);
    const erasedPct = (ink.reduce((a, b, i) => a + b * s.quality[i], 0) / inkTotal) * 100;
    const binOf = (x: number) => Math.max(0, Math.min(N_BINS - 1, Math.floor(x * N_BINS)));

    // 단면 뷰: 보드 면이 위쪽 가로선, 지우개가 아래에서 위로 누른다. 눌린 깊이는 과장.
    const boardLineY = H2 * 0.3 + (s.boardZ - 0.7) * 900;
    const penPx = Math.min(22, fNow * 1.6);
    const eraserTopY = boardLineY - penPx + 4;
    const arrowLen = Math.min(H2 * 0.42, 6 + fNow * 3.2);

    const slider = (label: string, val: number, set: (v: number) => void,
                    min: number, max: number, step: number, fmt: string) => (
        <label key={label} className="flex items-center gap-2 text-xs text-muted">
            <span className="w-16 shrink-0">{label}</span>
            <input type="range" min={min} max={max} step={step} value={val}
                   onChange={(e) => set(parseFloat(e.target.value))}
                   className="w-full accent-[var(--accent)]" aria-label={label}/>
            <span className="w-12 shrink-0 text-right tabular-nums">{fmt}</span>
        </label>
    );

    return (
        <div className="flex flex-col gap-2 items-center">
            <div className="flex flex-row flex-wrap gap-1.5 justify-center">
                <button onClick={() => {
                    const st = stateRef.current;
                    st.boardTarget = 0.72;
                    window.setTimeout(() => {
                        st.boardTarget = 0.7;
                    }, 1200);
                }}
                        className="px-2.5 py-1 rounded-md text-xs font-semibold border border-border text-muted hover:text-[var(--text)] transition-colors">
                    {t("jolt the board", "보드가 덜컹")}
                </button>
                <button onClick={() => {
                    stateRef.current.quality = new Array(N_BINS).fill(0);
                }}
                        className="px-2.5 py-1 rounded-md text-xs font-semibold border border-border text-muted hover:text-[var(--text)] transition-colors">
                    {t("redraw the scribbles", "낙서 다시 채우기")}
                </button>
            </div>
            {/* 정면 뷰: 결과 (낙서가 지워진다) */}
            <div className="flex flex-col items-center gap-0.5">
                <Stage width={W} height={H1}
                       className="bg-surface border border-border rounded-lg overflow-hidden">
                    <Layer>
                        <Rect x={W * 0.02} y={H1 * 0.12} width={W * 0.96} height={H1 * 0.82}
                              stroke={colors.border} strokeWidth={2} cornerRadius={6}/>
                        {segs.map((sg, i) => {
                            const q = s.quality[binOf((sg.x1 + sg.x2) / 2)];
                            if (q > 0.96) return null;
                            return (
                                <Line key={i}
                                      points={[sg.x1 * W, sg.y1 * H1, sg.x2 * W, sg.y2 * H1]}
                                      stroke={colors.text} strokeWidth={2.5} opacity={0.85 * (1 - q)}
                                      lineCap="round"/>
                            );
                        })}
                        {/* 지우개 (정면) + 좌우 왕복 화살표 */}
                        <Rect x={s.x * W - eraserW / 2} y={BAND.y0 * H1 - 8}
                              width={eraserW} height={(BAND.y1 - BAND.y0) * H1 + 16}
                              fill={colors.accent} opacity={0.85} cornerRadius={5}/>
                        <Line points={[s.x * W - eraserW, H1 * 0.06 + 8, s.x * W + eraserW, H1 * 0.06 + 8]}
                              stroke={colors.accent} strokeWidth={2.5} lineCap="round"/>
                        <Text x={s.x * W - eraserW - 4} y={H1 * 0.06 + 3} text="◀" fontSize={10}
                              fill={colors.accent}/>
                        <Text x={s.x * W + eraserW - 5} y={H1 * 0.06 + 3} text="▶" fontSize={10}
                              fill={colors.accent}/>
                        <Text x={W * 0.04} y={H1 * 0.02}
                              text={t("front view: motion control sweeps the eraser left-right",
                                  "정면: motion 제어가 지우개를 좌우로 왕복시킨다")}
                              fontSize={11} fill={colors.muted}/>
                    </Layer>
                </Stage>
            </div>
            {/* 내려다본 단면: 원인 (force 제어가 누른다) */}
            <div className="flex flex-col items-center gap-0.5">
                <Stage width={W} height={H2}
                       className="bg-surface border border-border rounded-lg overflow-hidden">
                    <Layer>
                        {/* 보드 (위쪽 벽) */}
                        <Rect x={0} y={0} width={W} height={boardLineY} fill={colors.text}
                              opacity={0.12}/>
                        <Line points={[0, boardLineY, W, boardLineY]} stroke={colors.text}
                              strokeWidth={2.5}/>
                        {Array.from({length: 14}, (_, i) => (
                            <Line key={i}
                                  points={[(i / 14) * W, boardLineY - 3, (i / 14) * W + 12, 2]}
                                  stroke={colors.text} strokeWidth={1} opacity={0.3}/>
                        ))}
                        {/* 지우개 (단면): 위 뷰와 같은 x 위치, 보드를 파고든 깊이만큼 겹친다 */}
                        <Rect x={s.x * W - eraserW / 2} y={eraserTopY}
                              width={eraserW} height={H2 * 0.34}
                              fill={colors.accent} opacity={0.85} cornerRadius={5}/>
                        {/* 누르는 힘 화살표 */}
                        <Line points={[s.x * W, eraserTopY + H2 * 0.36 + arrowLen,
                            s.x * W, eraserTopY + H2 * 0.36]}
                              stroke="#e0533d" strokeWidth={4} lineCap="round"/>
                        <Text x={s.x * W - 5} y={eraserTopY + H2 * 0.3} text="▲" fontSize={13}
                              fill="#e0533d"/>
                        {/* 힘 게이지 */}
                        <Rect x={W - 34} y={H2 * 0.12} width={12} height={H2 * 0.76}
                              stroke={colors.border} strokeWidth={1}/>
                        <Rect x={W - 34} y={H2 * 0.88 - (H2 * 0.76) * Math.min(1, fNow / 25)}
                              width={12} height={(H2 * 0.76) * Math.min(1, fNow / 25)}
                              fill={onTarget ? "#e0533d" : "#e0a33d"}/>
                        <Line points={[W - 39, H2 * 0.88 - (H2 * 0.76) * (fd / 25),
                            W - 17, H2 * 0.88 - (H2 * 0.76) * (fd / 25)]}
                              stroke={colors.text} strokeWidth={2} dash={[3, 2]}/>
                        <Text x={W - 58} y={H2 * 0.88 - (H2 * 0.76) * (fd / 25) - 5} text="Fd"
                              fontSize={10} fill={colors.text}/>
                        <Text x={W * 0.02} y={H2 - 18}
                              text={t("top-down view: force control presses with F = " + fNow.toFixed(1) + " N",
                                  "내려다본 단면: force 제어가 F = " + fNow.toFixed(1) + " N 으로 누른다")}
                              fontSize={11}
                              fill={onTarget ? "#e0533d" : "#e0a33d"}/>
                    </Layer>
                </Stage>
            </div>
            <div className="w-full flex flex-col gap-1">
                {slider("Fd", fd, setFd, 2, 20, 1, `${fd.toFixed(0)} N`)}
                {slider(t("sweep speed", "왕복 속도"), speed, setSpeed, 0.2, 1.4, 0.05, speed.toFixed(2))}
            </div>
            <div className="text-xs text-muted text-center tabular-nums">
                {t("erased", "지워진 정도")}{" "}
                <span className="font-semibold" style={{color: "var(--accent)"}}>
                    {erasedPct.toFixed(0)}%
                </span>
                {" · "}
                {t("the two views share the x axis: one controller owns x, the other owns the pressing direction",
                    "두 그림은 x 축을 공유한다. x 는 motion 제어가, 누르는 방향은 force 제어가 따로 맡는다")}
                <div>
                    {t("try the jolt: the force dies for a moment, and the strip passed during the dip stays darker",
                        "덜컹을 눌러 보라. 힘이 잠깐 꺼지고, 그 사이 지나간 자리만 낙서가 진하게 남는다")}
                </div>
            </div>
        </div>
    );
};

const EraserHybrid = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "hybrid motion-force control as whiteboard erasing: motion along the board, force into the board, at the same instant in different directions",
            "화이트보드 지우기로 본 hybrid motion-force 제어: 보드를 따라서는 motion, 보드 안쪽으로는 force 를 같은 순간, 서로 다른 방향에 건다",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<EraserScene panel={Math.min(modalCanvasSize(0.85).width, 640)}/>}
    >
        <EraserScene panel={340}/>
    </CanvasFigure>;
};

export default EraserHybrid;
