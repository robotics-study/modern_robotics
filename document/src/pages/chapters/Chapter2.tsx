import {IChapterData} from "../../../types/global";
import {BlockMath, InlineMath} from "react-katex";
import {BlockMatrix, InlineMatrix} from "../../components/math/Matrix";
import CoordinateExample from "../../components/pages/chapter2/CoordinateExample";
import Physics3DCanvas from "../../components/Physics3DCanvas";

const Chapter2 = () => {
    return (
        <>
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
                <div className="flex flex-wrap gap-5 justify-around">
                    <Physics3DCanvas className="aspect-square w-56 rounded-lg" axisFloor/>
                    <Physics3DCanvas className="aspect-square w-56 rounded-lg" axisFloor/>
                </div>
            </div>
            <p className="justify-center flex gap-5">
                <InlineMath math='x = r \sdot \cos\omega'/>
                <InlineMath math='y = r \sdot \sin\omega'/>
            </p>
        </>
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
