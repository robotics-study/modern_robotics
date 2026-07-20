import {useState} from "react";
import {Arrow, Circle, Layer, Line, Stage, Text} from "react-konva";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {useCanvasColors} from "../../../libs/useTheme";
import {useTr} from "../../../libs/i18n";

// 12장 도구 상자의 첫 페이지: 벡터 집합의 span(선형 결합), pos(계수 ≥ 0), conv(계수 ≥ 0,
// 합 = 1)를 화살표 세 개를 끌어 보며 확인한다. 세 화살표가 원점을 둘러싸면 pos 가 평면
// 전체가 되고 (R² 는 3개면 positively span 된다), 모두 한쪽 반평면으로 모으면 부채꼴로
// 줄어드는 것이 즉시 보인다.
type Mode = "span" | "pos" | "conv";

interface SceneProps {
    panel?: number;
}

const SpanScene = ({panel = 340}: SceneProps) => {
    const colors = useCanvasColors();
    const t = useTr();
    const [mode, setMode] = useState<Mode>("pos");
    const [vecs, setVecs] = useState<Array<[number, number]>>([[1.4, 0.4], [-0.4, 1.2], [-0.9, -0.9]]);

    const W = panel, H = panel;
    const cx = W / 2, cy = H / 2;
    const S = panel / 4.4;
    const toPx = (v: [number, number]): [number, number] => [cx + v[0] * S, cy - v[1] * S];

    // pos({vi}) 부채꼴: 각도들의 최대 순환 간격이 π 를 넘으면 부채꼴, 아니면 평면 전체.
    const angles = vecs.map(([x, y]) => Math.atan2(y, x)).sort((a, b) => a - b);
    let maxGap = 2 * Math.PI + angles[0] - angles[angles.length - 1];
    let gapStart = angles[angles.length - 1];
    for (let i = 1; i < angles.length; i++) {
        const g = angles[i] - angles[i - 1];
        if (g > maxGap) {
            maxGap = g;
            gapStart = angles[i - 1];
        }
    }
    const posIsPlane = maxGap <= Math.PI + 1e-9;

    // 부채꼴 폴리곤 (원점에서 큰 반지름까지 호를 샘플링).
    const conePoly: number[] = [];
    if (!posIsPlane) {
        const a0 = gapStart + maxGap, a1 = gapStart + 2 * Math.PI;
        conePoly.push(cx, cy);
        const R = panel;
        for (let i = 0; i <= 40; i++) {
            const a = a0 + ((a1 - a0) * i) / 40;
            conePoly.push(cx + R * Math.cos(a), cy - R * Math.sin(a));
        }
    }

    // conv: 세 점의 볼록 껍질 = 삼각형 (퇴화해도 Konva 가 알아서 그린다).
    const convPoly = vecs.flatMap((v) => toPx(v));

    const modeBtn = (m: Mode, label: string) => (
        <button key={m} onClick={() => setMode(m)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors ${
                    mode === m
                        ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10"
                        : "border-border text-muted hover:text-[var(--text)]"
                }`}>
            {label}
        </button>
    );

    return (
        <div className="flex flex-col gap-2 items-center">
            <div className="flex flex-row gap-1.5">
                {modeBtn("span", "span")}
                {modeBtn("pos", "pos")}
                {modeBtn("conv", "conv")}
            </div>
            <Stage width={W} height={H}
                   className="bg-surface border border-border rounded-lg overflow-hidden">
                <Layer>
                    {/* 채워지는 영역 */}
                    {mode === "span" && (
                        <Line points={[0, 0, W, 0, W, H, 0, H]} closed fill={colors.accent}
                              opacity={0.14}/>
                    )}
                    {mode === "pos" && (posIsPlane
                        ? <Line points={[0, 0, W, 0, W, H, 0, H]} closed fill={colors.accent}
                                opacity={0.14}/>
                        : <Line points={conePoly} closed fill={colors.accent} opacity={0.18}/>)}
                    {mode === "conv" && (
                        <Line points={convPoly} closed fill={colors.accent} opacity={0.2}/>
                    )}
                    {/* 축 */}
                    <Line points={[0, cy, W, cy]} stroke={colors.border} strokeWidth={1}/>
                    <Line points={[cx, 0, cx, H]} stroke={colors.border} strokeWidth={1}/>
                    {/* 벡터 화살표 + 드래그 손잡이 */}
                    {vecs.map((v, i) => {
                        const [px, py] = toPx(v);
                        return (
                            <Arrow key={`a${i}`} points={[cx, cy, px, py]} stroke={colors.text}
                                   fill={colors.text} strokeWidth={2.5} pointerLength={9}
                                   pointerWidth={8}/>
                        );
                    })}
                    {vecs.map((v, i) => {
                        const [px, py] = toPx(v);
                        return (
                            <Circle key={`h${i}`} x={px} y={py} radius={9} fill={colors.accent}
                                    opacity={0.9} draggable
                                    onDragMove={(e) => {
                                        const nx = (e.target.x() - cx) / S;
                                        const ny = (cy - e.target.y()) / S;
                                        setVecs((old) => old.map((o, j) =>
                                            j === i ? [nx, ny] as [number, number] : o));
                                    }}/>
                        );
                    })}
                    <Text x={6} y={6}
                          text={t("drag the arrow tips", "화살표 끝을 끌어 보라")}
                          fontSize={11} fill={colors.muted}/>
                </Layer>
            </Stage>
            <div className="text-xs text-muted text-center">
                {mode === "span" && t(
                    "span: all linear combinations. two independent vectors already cover the plane",
                    "span: 모든 선형 결합. 독립인 두 개만 있어도 이미 평면 전체다",
                )}
                {mode === "pos" && (posIsPlane
                    ? <span className="font-semibold" style={{color: "var(--accent)"}}>
                        {t("pos: the whole plane. three vectors surrounding the origin positively span R²",
                            "pos: 평면 전체. 세 벡터가 원점을 둘러싸면 R² 를 positively span 한다")}
                    </span>
                    : t("pos: a cone. pull the arrows into one half-plane and the span collapses to this wedge",
                        "pos: 부채꼴. 화살표들이 한쪽 반평면에 모이면 이 부채꼴로 줄어든다"))}
                {mode === "conv" && t(
                    "conv: coefficients are nonnegative and sum to 1, giving the polygon spanned by the tips",
                    "conv: 계수가 0 이상이고 합이 1 이라, 끝점들이 만드는 다각형 안이 전부다",
                )}
            </div>
        </div>
    );
};

const SpanExplorer = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "span, positive span, convex span of three draggable vectors. contacts can only push (coefficients ≥ 0), so it is pos, the wedge, that decides what a grasp can and cannot do",
            "화살표 세 개로 보는 span · pos · conv. 접촉은 밀 수만 있어서 (계수 ≥ 0) grasp 가 할 수 있는 일을 결정하는 것은 부채꼴, 즉 pos 다",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<SpanScene panel={Math.min(modalCanvasSize(1).width, 620)}/>}
    >
        <SpanScene panel={320}/>
    </CanvasFigure>;
};

export default SpanExplorer;
