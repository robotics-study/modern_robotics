import {IChapterData} from "../../../types/global";
import {BlockMath, InlineMath} from "react-katex";
import {BlockMatrix, InlineMatrix} from "../../components/math/Matrix";
import CoordinateExample from "../../components/pages/chapter2/CoordinateExample";

const Chapter2 = () => {
    return (
        <div className="tracking-wide">
            <p className="text-lg border-b text-orange-700">
                <strong>Intro</strong>
            </p>
            <div className="p-2">
                <p>
                    <strong>A Robot</strong> is composed of <strong>Links</strong> (a set of connected bodies)
                    and <strong>Joints</strong> (which connect more than two links).
                    <strong>Actuators</strong> (motors) provide forces or torques that move the robot's links.

                </p>
                All robots are treated as <strong>rigid bodies</strong> to be address by simple equations. We would
                not consider stresses or fluctuations.
                <p>
                </p>
                <p>
                    <strong>Configuration</strong> is the explanation of where and how robots are located.
                    In two-dimensional configuration, we can describe robot's position by specifying two
                    coordinates <wbr></wbr>
                    <InlineMath math='(x, y)'/>.
                    Then, the robot's orientation is represented by using one more coordinate <wbr></wbr>
                    <InlineMath math='(\theta)'/>.
                    Refer the `coordinate` example displayed below.
                </p>
                <CoordinateExample className="bg-white border rounded-lg h-48"/>
            </div>
            <BlockMath math='\int_{a}^{b} x^2 dx'/>
            <BlockMatrix math={`
                \\cos(\\theta) & -\\sin(\\theta) \\\\ 
                \\sin(\\theta) & \\cos(\\theta)
                `
            }/>
            <div className="text-xs">
                <InlineMatrix math={`
                \\cos(\\theta) & -\\sin(\\theta) \\\\ 
                \\sin(\\theta) & \\cos(\\theta)
                `
                }/>
            </div>
            <p className="text-lg">
                <InlineMath math='\int_{a^2}^{b^3} 2x\sqrt{x^2} \frac{\delta{x}}{\delta{t}}'/>
            </p>
        </div>
    )
}
export default {
    title: "Configuration Space",
    chapter:
        2,
    contents:
    Chapter2,
    supportedExample:
        {
            python: true
        }
} as IChapterData
