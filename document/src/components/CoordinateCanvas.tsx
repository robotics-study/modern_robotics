import React, {ReactNode} from 'react';
import {Stage, Layer, Line, Text} from 'react-konva';
import {StageProps} from "react-konva/ReactKonvaCore";
import cn from "../libs/cn";

interface CoordinateSystemProps extends StageProps {
    children?: ReactNode
    resolution?: number
    tickLength?: number
}

const CoordinateSystem = ({
                              className,
                              children,
                              width,
                              height,
                              resolution = 0.05,
                              tickLength = 10,
                              ...props
                          }: CoordinateSystemProps) => {
    const originX = width / 2;
    const originY = height / 2;
    const tickInterval = 1 / resolution; // 눈금 간격

    // x축과 y축에 대한 선 정의
    const xAxis = [
        {x: originX - width, y: originY}, // 시작점
        {x: originX + width, y: originY}  // 끝점
    ];
    const yAxis = [
        {x: originX, y: originY - height}, // 시작점
        {x: originX, y: originY + height}  // 끝점
    ];

    // 눈금 그리기
    const renderTicks = (axis: 'x' | 'y', tickCount: number) => {
        const ticks = [];
        for (let i = -tickCount; i <= tickCount; i++) {
            let x = originX;
            let y = originY;

            if (axis === 'x') {
                x = originX + i * tickInterval;
                ticks.push(
                    <Line
                        key={`tick-${i}`}
                        points={[x, originY - tickLength / 2, x, originY + tickLength / 2]}
                        stroke="black"
                    />
                );
                if (i !== 0) {
                    ticks.push(
                        <Text
                            key={`tick-label-x-${i}`}
                            text={i.toString()}
                            x={x + 5}
                            y={originY + 5}
                            fontSize={tickCount}
                            fill="black"
                        />
                    );
                }
            } else if (axis === 'y') {
                y = originY + i * tickInterval;
                ticks.push(
                    <Line
                        key={`tick-${i}`}
                        points={[originX - tickLength / 2, y, originX + tickLength / 2, y]}
                        stroke="black"
                    />
                );
                if (i !== 0) {
                    ticks.push(
                        <Text
                            key={`tick-label-y-${i}`}
                            text={(-i).toString()}
                            x={originX + tickCount}
                            y={y - 5}
                            fontSize={tickCount}
                            fill="black"
                        />
                    );
                }
            }
        }
        return ticks;
    };

    return (
        <Stage
            width={width}
            height={height}
            className={cn(className, "overflow-hidden w-fit h-fit")}
            {...props}>
            <Layer>
                {/* x축 */}
                <Line points={xAxis.flatMap((p) => [p.x, p.y])} stroke="black"/>
                {/* y축 */}
                <Line points={yAxis.flatMap((p) => [p.x, p.y])} stroke="black"/>

                {/* x축 눈금 */}
                {renderTicks('x', Math.floor(width / tickInterval))}

                {/* y축 눈금 */}
                {renderTicks('y', Math.floor(height / tickInterval))}
                {children}
            </Layer>
            <Layer></Layer>
        </Stage>
    );
};

export default CoordinateSystem;
