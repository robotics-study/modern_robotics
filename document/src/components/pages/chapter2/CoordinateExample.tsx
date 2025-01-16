import CoordinateSystem from "../../CoordinateCanvas";
import {Group, Line, Rect, Text, Transformer} from 'react-konva';
import {useEffect, useMemo, useRef} from "react";
import Konva from "konva";
import {globalToMap, mapToGlobal} from "../../../libs/konvaUtils";

interface CoordinateExampleProps {
    className: string
}

const WIDTH = 300
const HEIGHT = 300
const RESOLUTION = 0.05

const CoordinateExample = ({
                               className
                           }: CoordinateExampleProps) => {
    const objectRef = useRef<Konva.Rect | null>(null)
    const transformerRef = useRef<Konva.Transformer | null>(null);
    const lineRef = useRef<Konva.Line | null>(null);
    const positionTextRef = useRef<Konva.Text | null>(null);
    const angleTextRef = useRef<Konva.Text | null>(null);
    const position = useMemo(() => globalToMap(WIDTH, HEIGHT, 5, 5), [])
    const origin = useMemo(() => {
        return globalToMap(WIDTH, HEIGHT, 0, 0)
    }, [])
    useEffect(() => {
        if (objectRef.current && transformerRef.current) {
            transformerRef.current!.nodes([objectRef.current!!])
            transformerRef.current!.getLayer()!.batchDraw()
        }
    }, []);
    return <div className="flex flex-col items-center justify-center py-3 gap-1">
        <CoordinateSystem
            resolution={RESOLUTION}
            className={className}
            width={WIDTH}
            height={HEIGHT}
            draggable
            scale
            offsetY={-100}
            offsetX={100}>
            <Line
                ref={lineRef}
                points={[origin.x, origin.y, position.x, position.y]}
                stroke="blue"
            />
            <Group
                x={position.x}
                y={position.y}
                draggable
                onDragMove={evt => {
                    const x = evt.target!.x()
                    const y = evt.target!.y()
                    const mp = mapToGlobal(WIDTH, HEIGHT, x, y)
                    positionTextRef.current!.text(`[x : ${mp.x.toFixed(2)}] [y: ${mp.y.toFixed(2)}]`)
                    lineRef.current!.points([origin.x, origin.y, x, y])
                }}
            >
                <Text
                    ref={positionTextRef}
                    text={`[x : 5.00] [y: 5.00]`}
                    x={-35}
                    y={40}
                    fontSize={12}
                    fontStyle="bold"
                />
                <Text
                    ref={angleTextRef}
                    text={`[th: 90.00 deg]`}
                    x={-25}
                    y={60}
                    fontSize={12}
                    fontStyle="bold"
                />
                <Rect
                    ref={objectRef}
                    width={30}
                    height={60}
                    x={0}
                    y={0}
                    offsetX={15}
                    offsetY={30}
                    fill="red"
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
        <span className="text-xs text-gray-400">coordinate</span>
    </div>
}

export default CoordinateExample
