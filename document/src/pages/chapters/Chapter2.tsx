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
            <p>
                A robot is a collection of rigid bodies (<strong>links</strong>) connected by{" "}
                <strong>joints</strong>. Its <strong>configuration</strong> specifies the position of every
                point of the robot; the minimum number of real-valued coordinates needed to describe it is the
                number of <strong>degrees of freedom</strong> (DOF), and the space of all configurations is the{" "}
                <strong>configuration space</strong> (C-space).
            </p>

            <h2>Degrees of Freedom of a Rigid Body</h2>
            <p>
                A rigid body confined to the <strong>plane</strong> has three degrees of freedom: two to locate
                a reference point <InlineMath math='(x, y)'/> and one for the orientation{" "}
                <InlineMath math='\theta'/>. A rigid body free to move in <strong>space</strong> has six degrees
                of freedom — three for position and three for orientation.
            </p>
            <p>
                A point constrained to a circle of radius <InlineMath math='r'/> is a small example: a single
                angle <InlineMath math='\theta'/> is enough to place it, so its coordinates follow from
            </p>
            <p className="justify-center flex gap-5">
                <InlineMath math='x = r \cos\theta'/>
                <InlineMath math='y = r \sin\theta'/>
            </p>
            <p>Drag the point below to see position and orientation change together.</p>
            <CoordinateExample className="bg-white border border-border rounded-lg h-48"/>

            <h2>Degrees of Freedom of a Robot</h2>
            <p>
                Each joint connects two links and permits some freedoms while removing others. The DOF a joint
                provides between the bodies it connects is shown with each joint below — a{" "}
                <strong>revolute</strong> or <strong>prismatic</strong> joint gives one, while a{" "}
                <strong>spherical</strong> joint gives three.
            </p>
            <div className="flex flex-wrap justify-around">
                <RevoluteJoint/>
                <PrismaticJoint/>
                <HelicalJoint/>
                <CylindricalJoint/>
                <UniversalJoint/>
                <SphericalJoint/>
            </div>
            <p>
                The DOF of the whole mechanism follows from <strong>Grübler's formula</strong>, which sums the
                link freedoms and subtracts the joint constraints:
            </p>
            <p className="justify-center flex">
                <InlineMath math='\text{dof} = m(N - 1 - J) + \sum_{i=1}^{J} f_i'/>
            </p>
            <p>
                Here <InlineMath math='m = 3'/> for planar and <InlineMath math='m = 6'/> for spatial
                mechanisms, <InlineMath math='N'/> is the number of links (including ground),{" "}
                <InlineMath math='J'/> the number of joints, and <InlineMath math='f_i'/> the DOF of joint{" "}
                <InlineMath math='i'/>. When the joint constraints are not independent, the formula gives a lower
                bound on the DOF.
            </p>

            <h2>Configuration Space: Topology and Representation</h2>
            <p>
                Two C-spaces of the same dimension can still have different <strong>topology</strong> (shape) —
                a plane and the surface of a sphere are both two-dimensional yet clearly different. The shape
                determines how we <strong>represent</strong> the space.
            </p>
            <p>
                An <strong>explicit</strong> parametrization uses the minimum number{" "}
                <InlineMath math='n'/> of coordinates (e.g. latitude and longitude on a sphere). An{" "}
                <strong>implicit</strong> representation uses <InlineMath math='m > n'/> coordinates subject to{" "}
                <InlineMath math='m - n'/> constraints (e.g. <InlineMath math='(x, y, z)'/> with{" "}
                <InlineMath math='x^2 + y^2 + z^2 = 1'/>). This book favors implicit representations of
                rigid-body configurations.
            </p>

            <h2>Configuration and Velocity Constraints</h2>
            <p>
                A <strong>holonomic</strong> constraint restricts the configuration itself and reduces the
                dimension of the C-space (this is how closed loops constrain a mechanism). A{" "}
                <strong>velocity constraint</strong> restricts the allowed velocities; when such a Pfaffian
                constraint cannot be integrated into a configuration constraint it is called{" "}
                <strong>nonholonomic</strong> — the rolling of a wheel without slipping is the classic example.
            </p>

            <h2>Task Space and Workspace</h2>
            <p>
                A robot arm usually carries an <strong>end-effector</strong> (a hand or gripper). The{" "}
                <strong>task space</strong> is the space of positions and orientations of the end-effector frame,
                chosen for the task rather than tied to any particular robot. The{" "}
                <strong>workspace</strong> is the subset of the task space the end-effector frame can actually
                reach.
            </p>
        </>
    )
}

export default Chapter2
