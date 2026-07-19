import {useMemo, useState} from "react";
import {Circle, Line} from "react-konva";
import CoordinateSystem from "../../2d/CoordinateCanvas";
import CanvasFigure from "../../CanvasFigure";
import {useTr} from "../../../libs/i18n";
import {globalToMap} from "../../../libs/konvaUtils";
import {planarFk} from "../../../libs/planarArm";
import {useCanvasColors} from "../../../libs/useTheme";

// 책 그림 2.12(a)(b): 링크 (3,3) 의 2R 팔과 링크 (2,2,2) 의 3R 팔은 C-space 가 T² 와 T³ 로
// 서로 다르지만, tip 이 닿는 작업 공간은 똑같은 반지름 6 의 원판이다 — C-space, task 공간,
// 작업 공간이 서로 다른 개념임을 손으로 확인한다.
const RESOLUTION = 0.05;

interface ArmPanelProps {
    links: number[];
    label: string;
    width: number;
}

const ArmPanel = ({links, label, width}: ArmPanelProps) => {
    const colors = useCanvasColors();
    const [theta, setTheta] = useState<number[]>(links.map((_, i) => 0.7 - 0.3 * i));
    const reach = links.reduce((a, b) => a + b, 0);

    const world = useMemo(() => planarFk(theta, links).points, [theta, links]);
    const px = world.map((p) => globalToMap(width, width, p.x, p.y, RESOLUTION));
    const origin = globalToMap(width, width, 0, 0, RESOLUTION);

    const setJoint = (i: number, v: number) =>
        setTheta((prev) => prev.map((x, j) => (j === i ? v : x)));

    return (
        <div className="flex flex-col gap-1 items-center" style={{width}}>
            <CoordinateSystem
                width={width}
                height={width}
                resolution={RESOLUTION}
                className="bg-surface border border-border rounded-lg"
            >
                {/* 작업 공간: 도달 가능한 tip 위치 전체 (등길이 링크라 원판) */}
                <Circle x={origin.x} y={origin.y} radius={reach / RESOLUTION} fill={colors.accent}
                        opacity={0.13} stroke={colors.accent} strokeWidth={1.5} dash={[7, 6]}/>
                {px.slice(0, -1).map((p, i) => (
                    <Line key={`link-${i}`} points={[p.x, p.y, px[i + 1].x, px[i + 1].y]}
                          stroke={colors.accent} strokeWidth={4} lineCap="round"/>
                ))}
                {px.slice(0, -1).map((p, i) => (
                    <Circle key={`joint-${i}`} x={p.x} y={p.y} radius={5} fill={colors.surface}
                            stroke={colors.text} strokeWidth={2}/>
                ))}
                <Circle x={px[px.length - 1].x} y={px[px.length - 1].y} radius={6.5} fill={colors.accent}/>
            </CoordinateSystem>
            <div className="w-full flex flex-col gap-0.5 text-xs text-muted">
                {theta.map((v, i) => (
                    <label key={i} className="flex items-center gap-2">
                        <span className="w-7 shrink-0">θ{i + 1}</span>
                        <input
                            type="range"
                            min={-Math.PI}
                            max={Math.PI}
                            step={0.01}
                            value={v}
                            onChange={(e) => setJoint(i, parseFloat(e.target.value))}
                            className="w-full accent-[var(--accent)]"
                            aria-label={`${label} joint angle theta ${i + 1}`}
                        />
                    </label>
                ))}
                <div className="text-center pt-0.5 font-semibold">{label}</div>
            </div>
        </div>
    );
};

const WorkspaceScene = ({panel}: {panel: number}) => {
    const t = useTr();
    return (
        <div className="flex flex-wrap justify-center gap-4">
            <ArmPanel width={panel} links={[3, 3]}
                      label={t("2R · L = 3, 3 · C-space T²", "2R · L = 3, 3 · C-space T²")}/>
            <ArmPanel width={panel} links={[2, 2, 2]}
                      label={t("3R · L = 2, 2, 2 · C-space T³", "3R · L = 2, 2, 2 · C-space T³")}/>
        </div>
    );
};

const WorkspaceComparison = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "different C-spaces, same workspace · both tips reach exactly the disk of radius 6",
            "다른 C-space, 같은 작업 공간 · 두 팔의 tip 은 정확히 같은 반지름 6 원판에 닿는다",
        )}
        tight
        bodyClassName="w-fit"
        className="w-full"
        modal={<WorkspaceScene panel={330}/>}
    >
        <WorkspaceScene panel={265}/>
    </CanvasFigure>;
};

export default WorkspaceComparison;
