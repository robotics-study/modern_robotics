import {InlineMath} from "../../components/math/Tex";
import CoordinateExample from "../../components/pages/chapter2/CoordinateExample";
import UniversalJoint from "../../components/pages/chapter2/UniversalJoint";
import RevoluteJoint from "../../components/pages/chapter2/RevoluteJoint";
import PrismaticJoint from "../../components/pages/chapter2/PrismaticJoint";
import HelicalJoint from "../../components/pages/chapter2/HelicalJoint";
import CylindricalJoint from "../../components/pages/chapter2/CylindricalJoint";
import SphericalJoint from "../../components/pages/chapter2/SphericalJoint";

const Chapter2 = () => {
    return (
        <>
            <h2>Intro</h2>
            <p>
                    <strong>A Robot</strong> is composed of <strong>Links</strong> (a set of connected bodies)
                    and <strong>Joints</strong> (which connect more than two links).
                    <strong> Actuators</strong> (motors) provide forces or torques that move the robot's links.
                </p>
                <p>
                    All robots are treated as <strong>rigid bodies</strong> to be addressed by simple equations. We would
                    not consider stresses or fluctuations.
                </p>
                <p>
                    <strong>Configuration</strong> is the explanation of where and how robots are located.
                    In two-dimensional configuration, we can describe robot's position by specifying two
                    coordinates <wbr/>
                    <InlineMath math='(x, y)'/>.
                    Then, the robot's orientation is represented by using one more coordinate <wbr/>
                    <InlineMath math='(\theta)'/>.
                    Refer the `coordinate` example displayed below.
                </p>
                <p className="justify-center flex gap-5">
                    <InlineMath math='x = r \cdot \cos\theta'/>
                    <InlineMath math='y = r \cdot \sin\theta'/>
                </p>
            <CoordinateExample className="bg-white border border-border rounded-lg h-48"/>

            <h2>Degree of Freedom (DOF)</h2>
            <div className="flex flex-wrap justify-around">
                <RevoluteJoint/>
                <PrismaticJoint/>
                <HelicalJoint/>
                <CylindricalJoint/>
                <UniversalJoint/>
                <SphericalJoint/>
            </div>
        </>
    )
}

export default Chapter2
