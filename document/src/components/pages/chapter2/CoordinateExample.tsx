import CoordinateSystem from "../../2d/CoordinateCanvas";
import {Group, Line, Rect, Text, Transformer} from 'react-konva';
import {useEffect, useMemo, useRef} from "react";
import Konva from "konva";
import {globalToMap, mapToGlobal} from "../../../libs/konvaUtils";
import {useCanvasColors} from "../../../libs/useTheme";
import CanvasFigure, {modalCanvasSize} from "../../CanvasFigure";
import {useTr} from "../../../libs/i18n";

interface CoordinateExampleProps {
    className: string
}

const RESOLUTION = 0.05

interface CoordinateStageProps {
    width: number
    height: number
    className?: string
}

// 드래그 가능한 좌표계 씬. 인라인 썸네일과 모달 확대본이 서로 다른 픽셀 크기로 두 번 렌더된다.
const CoordinateStage = ({width, height, className}: CoordinateStageProps) => {
    // 큰 모달 캔버스에서는 world 스케일도 함께 키운다 (520px 기준 유지).
    const res = RESOLUTION * Math.min(1, 520 / width);
    const colors = useCanvasColors()
    const objectRef = useRef<Konva.Rect | null>(null)
    const transformerRef = useRef<Konva.Transformer | null>(null);
    const lineRef = useRef<Konva.Line | null>(null);
    const positionTextRef = useRef<Konva.Text | null>(null);
    const angleTextRef = useRef<Konva.Text | null>(null);
    const position = useMemo(() => globalToMap(width, height, 5, 5), [width, height])
    const origin = useMemo(() => globalToMap(width, height, 0, 0), [width, height])
    useEffect(() => {
        if (objectRef.current && transformerRef.current) {
            transformerRef.current!.nodes([objectRef.current!!])
            transformerRef.current!.getLayer()!.batchDraw()
        }
    }, []);
    return <CoordinateSystem
        resolution={res}
        className={className}
        width={width}
        height={height}
        draggable
        offsetY={-100}
        offsetX={100}>
        <Line
            ref={lineRef}
            points={[origin.x, origin.y, position.x, position.y]}
            stroke={colors.accent}
        />
        <Group
            x={position.x}
            y={position.y}
            draggable
            onDragMove={evt => {
                const x = evt.target!.x()
                const y = evt.target!.y()
                const mp = mapToGlobal(width, height, x, y)
                positionTextRef.current!.text(`[x : ${mp.x.toFixed(2)}] [y: ${mp.y.toFixed(2)}]`)
                lineRef.current!.points([origin.x, origin.y, x, y])
            }}
        >
            <Group
                x={0}
                y={40}
            >
                <Rect
                    offsetX={75}
                    width={150}
                    height={40}
                    x={0}
                    fill={colors.surface}
                    cornerRadius={10}
                    stroke={colors.border}
                    strokeWidth={1}
                />
                <Text
                    ref={positionTextRef}
                    text={`[x : 5.00] [y: 5.00]`}
                    x={0}
                    y={8}
                    width={150}
                    offsetX={77}
                    fontSize={12}
                    fontStyle="bold"
                    fill={colors.text}
                    align="center"
                />
                <Text
                    ref={angleTextRef}
                    offsetX={77}
                    text={`[th: 90.00 deg]`}
                    x={0}
                    y={22}
                    width={150}
                    fontSize={12}
                    fontStyle="bold"
                    fill={colors.text}
                    align="center"
                />
            </Group>
            <Rect
                ref={objectRef}
                width={30}
                height={60}
                x={0}
                y={0}
                offsetX={15}
                offsetY={30}
                fill={colors.accent}
            />
        </Group>
        <Transformer
            ref={transformerRef}
            rotateEnabled
            onTransform={evt => {
                const th = 90 - evt.target.getAbsoluteRotation()
                angleTextRef.current!.text(`[th : ${th.toFixed(2)} deg]`)
            }}
            resizeEnabled={false}
        >
        </Transformer>
    </CoordinateSystem>
}

const CoordinateExample = ({className}: CoordinateExampleProps) => {
    const t = useTr()
    return <CanvasFigure
        label={t("coordinate", "좌표계")}
        tight
        bodyClassName="w-fit"
        modal={<CoordinateStage {...modalCanvasSize()}
                                className="bg-surface border border-border rounded-lg"/>}
    >
        <CoordinateStage width={300} height={300} className={className}/>
    </CanvasFigure>
}

export default CoordinateExample
