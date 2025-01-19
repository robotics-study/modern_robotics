import {IChapterData} from "../../../types/global";
import {InlineMath} from "react-katex";
import CoordinateExample from "../../components/pages/chapter2/CoordinateExample";
import Physics3DCanvas from "../../components/3d/Physics3DCanvas";
import UniversalJoint from "../../components/pages/chapter2/UniversalJoint";

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
                <p className="justify-center flex gap-5">
                    <InlineMath math='x = r \sdot \cos\omega'/>
                    <InlineMath math='y = r \sdot \sin\omega'/>
                </p>
                <CoordinateExample className="bg-white border rounded-lg h-48"/>

            </div>
            <p className="text-lg border-b text-orange-700">
                <strong>Degree of Freedom (DOF)</strong>
            </p>
            <div>
                <div className="flex flex-wrap gap-5 justify-around">
                    <UniversalJoint/>
                </div>
            </div>
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
