import {useEffect, useMemo, useRef, useState} from "react";
import {Arrow, Circle, Layer, Line, Stage, Text} from "react-konva";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";
import {contactWrench, positiveSpanTest} from "./graspUtils";

// 마찰 없는 손가락들로 사각형을 form closure 로 가둘 수 있는지 실험한다. 손가락을 둘레를
// 따라 끌면 매번 pos({Fi}) = R³ 판정을 다시 하고, 실패하면 몸체가 실제로 빠져나가는
// twist 를 찾아 유령으로 움직여 보여 준다. 손가락 3개로는 어떤 배치로도 막을 수 없다는
// 정리 (평면은 최소 4개)도 버튼 하나로 확인된다.
const SIDE = 1;                      // 사각형 반변
const DEFAULT_S = [0.25, 1.8, 2.25, 3.8];

// 둘레 파라미터 s ∈ [0,4): 변 인덱스 + 비율 → 접촉점과 안쪽 normal.
const perimPoint = (s: number): {p: [number, number]; n: [number, number]} => {
    const side = Math.floor(((s % 4) + 4) % 4);
    const f = ((s % 4) + 4) % 4 - side;
    switch (side) {
        case 0: return {p: [-SIDE + 2 * SIDE * f, -SIDE], n: [0, 1]};
        case 1: return {p: [SIDE, -SIDE + 2 * SIDE * f], n: [-1, 0]};
        case 2: return {p: [SIDE - 2 * SIDE * f, SIDE], n: [0, -1]};
        default: return {p: [-SIDE, SIDE - 2 * SIDE * f], n: [1, 0]};
    }
};

// 화면 좌표를 둘레 파라미터로 사영 (가장 가까운 변).
const projectToPerim = (x: number, y: number): number => {
    const cands: Array<[number, number]> = [
        [Math.abs(y + SIDE), 0 + (Math.max(-SIDE, Math.min(SIDE, x)) + SIDE) / (2 * SIDE)],
        [Math.abs(x - SIDE), 1 + (Math.max(-SIDE, Math.min(SIDE, y)) + SIDE) / (2 * SIDE)],
        [Math.abs(y - SIDE), 2 + (SIDE - Math.max(-SIDE, Math.min(SIDE, x))) / (2 * SIDE)],
        [Math.abs(x + SIDE), 3 + (SIDE - Math.max(-SIDE, Math.min(SIDE, y))) / (2 * SIDE)],
    ];
    cands.sort((a, b) => a[0] - b[0]);
    return cands[0][1];
};

interface SceneProps {
    panel?: number;
}

const FormClosureScene = ({panel = 340}: SceneProps) => {
    const colors = useCanvasColors();
    const t = useTr();
    const [params, setParams] = useState<number[]>(DEFAULT_S);
    const [count, setCount] = useState(4);
    const [phase, setPhase] = useState(0);
    const rafRef = useRef<number>();

    useEffect(() => {
        let start: number | null = null;
        const loop = (ts: number) => {
            if (start === null) start = ts;
            setPhase((((ts - start) / 1600) % 1));
            rafRef.current = requestAnimationFrame(loop);
        };
        rafRef.current = requestAnimationFrame(loop);
        return () => {
            if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    const active = params.slice(0, count);
    const {closed, escape} = useMemo(() => {
        const wrenches = active.map((s) => {
            const {p, n} = perimPoint(s);
            return contactWrench(p[0], p[1], n[0], n[1]);
        });
        return positiveSpanTest(wrenches, SIDE);
    }, [active]);

    const W = panel, H = panel;
    const cx = W / 2, cy = H / 2, S = panel / 3.4;
    const sx = (x: number) => cx + x * S;
    const sy = (y: number) => cy - y * S;

    // 탈출 twist 를 따라 몸체 유령을 움직인다 (sawtooth + 페이드).
    const amp = 0.55 * phase;
    const ghost = useMemo(() => {
        if (closed || !escape) return null;
        const [w, vx, vy] = escape;
        const corners: Array<[number, number]> = [
            [-SIDE, -SIDE], [SIDE, -SIDE], [SIDE, SIDE], [-SIDE, SIDE],
        ];
        if (Math.abs(w) > 1e-3) {
            const corX = -vy / w, corY = vx / w;
            const th = w * amp;
            const c = Math.cos(th), s = Math.sin(th);
            return corners.map(([x, y]): [number, number] => {
                const dx = x - corX, dy = y - corY;
                return [corX + c * dx - s * dy, corY + s * dx + c * dy];
            });
        }
        return corners.map(([x, y]): [number, number] => [x + vx * amp, y + vy * amp]);
    }, [closed, escape, amp]);

    return (
        <div className="flex flex-col gap-2 items-center">
            <div className="flex flex-row gap-1.5">
                {[3, 4].map((n) => (
                    <button key={n} onClick={() => setCount(n)}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${
                                count === n
                                    ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10"
                                    : "border-border text-muted hover:text-[var(--text)]"
                            }`}>
                        {t(`${n} fingers`, `손가락 ${n}개`)}
                    </button>
                ))}
                <button onClick={() => setParams(DEFAULT_S)}
                        className="px-2.5 py-1 rounded-md text-xs font-semibold border border-border text-muted hover:text-[var(--text)] transition-colors">
                    {t("reset", "원위치")}
                </button>
            </div>
            <Stage width={W} height={H}
                   className="bg-surface border border-border rounded-lg overflow-hidden">
                <Layer>
                    {/* 탈출 유령 */}
                    {ghost && (
                        <Line points={ghost.flatMap(([x, y]) => [sx(x), sy(y)])} closed
                              fill="#e0533d" opacity={0.25 * (1 - phase) + 0.05}
                              stroke="#e0533d" strokeWidth={1.5} dash={[5, 4]}/>
                    )}
                    {/* 몸체 */}
                    <Line points={[sx(-SIDE), sy(-SIDE), sx(SIDE), sy(-SIDE), sx(SIDE), sy(SIDE),
                        sx(-SIDE), sy(SIDE)]} closed
                          fill={colors.accent} opacity={closed ? 0.85 : 0.45}
                          stroke={colors.text} strokeWidth={2}/>
                    {/* 손가락: 둘레 위 드래그 */}
                    {active.map((s, i) => {
                        const {p, n} = perimPoint(s);
                        return (
                            <Arrow key={`n${i}`}
                                   points={[sx(p[0] - n[0] * 0.5), sy(p[1] - n[1] * 0.5), sx(p[0]), sy(p[1])]}
                                   stroke={colors.text} fill={colors.text} strokeWidth={2.5}
                                   pointerLength={8} pointerWidth={7}/>
                        );
                    })}
                    {active.map((s, i) => {
                        const {p, n} = perimPoint(s);
                        return (
                            <Circle key={`f${i}`} x={sx(p[0] - n[0] * 0.62)} y={sy(p[1] - n[1] * 0.62)}
                                    radius={10} fill={colors.text} opacity={0.85} draggable
                                    onDragMove={(e) => {
                                        const wx2 = (e.target.x() - cx) / S;
                                        const wy2 = (cy - e.target.y()) / S;
                                        const ns = projectToPerim(wx2, wy2);
                                        setParams((old) => old.map((o, j) => (j === i ? ns : o)));
                                        const {p: np, n: nn} = perimPoint(ns);
                                        e.target.x(sx(np[0] - nn[0] * 0.62));
                                        e.target.y(sy(np[1] - nn[1] * 0.62));
                                    }}/>
                        );
                    })}
                    <Text x={6} y={6}
                          text={t("drag the fingers around the boundary", "손가락을 둘레를 따라 끌어 보라")}
                          fontSize={11} fill={colors.muted}/>
                </Layer>
            </Stage>
            <div className="text-xs text-muted text-center">
                {closed
                    ? <span className="font-semibold" style={{color: "var(--accent)"}}>
                        {t("form closure: the four normals positively span the wrench space, no twist survives",
                            "form closure: 네 normal 이 wrench 공간을 positively span 해서 살아남는 twist 가 없다")}
                    </span>
                    : <span className="font-semibold" style={{color: "#e0533d"}}>
                        {count === 3
                            ? t("3 fingers can never form-close a planar body: it always escapes (min. 4 needed)",
                                "손가락 3개로는 어떤 배치도 실패한다. 항상 빠져나간다 (평면은 최소 4개)")
                            : t("not form closure: the body escapes along the ghost motion",
                                "form closure 실패: 몸체가 유령이 보여 주는 twist 로 빠져나간다")}
                    </span>}
            </div>
        </div>
    );
};

const FormClosureLab = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "form closure lab: drag four frictionless fingers around a square until no escaping twist remains; with three fingers the body always leaks out",
            "form closure 실험실: 마찰 없는 손가락 넷을 끌어 사각형을 가둬 보라. 셋으로는 어떻게 놓아도 몸체가 새어 나간다",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<FormClosureScene panel={Math.min(modalCanvasSize(1).width, 640)}/>}
    >
        <FormClosureScene panel={340}/>
    </CanvasFigure>;
};

export default FormClosureLab;
