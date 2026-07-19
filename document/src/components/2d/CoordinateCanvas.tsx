import {ReactNode} from 'react';
import {Stage, Layer, Line, Text} from 'react-konva';
import {StageProps} from "react-konva/ReactKonvaCore";
import cn from "../../libs/cn";
import {useCanvasColors} from "../../libs/useTheme";

// width/height 는 좌표계 렌더에 필수다(originX = width/2 등). Konva StageProps 에서는
// optional 이라 여기서 required 로 좁힌다 — 호출부는 항상 픽셀 크기를 넘긴다.
interface CoordinateSystemProps extends Omit<StageProps, "width" | "height"> {
    width: number
    height: number
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
    const colors = useCanvasColors();
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
    const FONT = 11;
    const renderTicks = (axis: 'x' | 'y', tickCount: number) => {
        // 두 자리 수 라벨이 이웃 눈금과 겹치지 않도록, 눈금 간격이 좁으면 라벨을 건너뛴다.
        const maxLabelW = (String(tickCount).length + 1) * FONT * 0.62;
        const labelStep = Math.max(1, Math.ceil((maxLabelW + 6) / tickInterval));
        const ticks = [];
        for (let i = -tickCount; i <= tickCount; i++) {
            let x = originX;
            let y = originY;
            const labeled = i !== 0 && i % labelStep === 0;

            if (axis === 'x') {
                x = originX + i * tickInterval;
                ticks.push(
                    <Line
                        key={`tick-${i}`}
                        points={[x, originY - tickLength / 2, x, originY + tickLength / 2]}
                        stroke={colors.text}
                    />
                );
                if (labeled) {
                    ticks.push(
                        <Text
                            key={`tick-label-x-${i}`}
                            text={i.toString()}
                            x={x + 3}
                            y={originY + 6}
                            fontSize={FONT}
                            fill={colors.text}
                        />
                    );
                }
            } else if (axis === 'y') {
                y = originY + i * tickInterval;
                ticks.push(
                    <Line
                        key={`tick-${i}`}
                        points={[originX - tickLength / 2, y, originX + tickLength / 2, y]}
                        stroke={colors.text}
                    />
                );
                if (labeled) {
                    ticks.push(
                        <Text
                            key={`tick-label-y-${i}`}
                            text={(-i).toString()}
                            x={originX + tickLength / 2 + 3}
                            y={y - FONT / 2}
                            fontSize={FONT}
                            fill={colors.text}
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
                <Line points={xAxis.flatMap((p) => [p.x, p.y])} stroke={colors.text}/>
                {/* y축 */}
                <Line points={yAxis.flatMap((p) => [p.x, p.y])} stroke={colors.text}/>

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
