import {InlineMath} from "../../components/math/Tex";

const Chapter1 = () => {
    return (
        <>
            <p>
                This book is about the <strong>mechanics</strong>, <strong>planning</strong>, and{" "}
                <strong>control</strong> of robot mechanisms. This chapter previews the ideas that the
                following chapters build on.
            </p>

            <h2>What Is a Robot?</h2>
            <p>
                A robot mechanism is built from rigid bodies, called <strong>links</strong>, connected by{" "}
                <strong>joints</strong> so that relative motion between adjacent links is possible.{" "}
                <strong>Actuators</strong> (typically electric motors) drive the joints, causing the robot to
                move and to exert forces.
            </p>
            <p>
                The links may be arranged in a serial <strong>open chain</strong> (a familiar robot arm, where
                every joint is actuated) or they may form <strong>closed loops</strong> (such as the
                Stewart–Gough platform, where only some joints are actuated).
            </p>
            <p>
                Real links flex and real joints have elasticity, backlash, and friction. Throughout this book we
                ignore those effects and treat every link as a perfect <strong>rigid body</strong>.
            </p>

            <h2>Configuration and Degrees of Freedom</h2>
            <p>
                The <strong>configuration</strong> of a robot is a specification of the position of every one of
                its points. A rigid body in the plane needs three numbers to pin down — two for position and one
                for orientation <InlineMath math='(x, y, \theta)'/> — while a rigid body in space needs six
                (three for position, three for orientation).
            </p>
            <p>
                That count is the number of <strong>degrees of freedom</strong> (DOF), which is also the
                dimension of the <strong>configuration space</strong> (C-space) — the set of all configurations
                the body can take. A robot's DOF is the sum of its links' freedoms minus the constraints imposed
                by its joints.
            </p>

            <h2>Chapter Roadmap</h2>
            <p>The rest of these notes follow the book's development:</p>
            <ul className="list-disc pl-6 space-y-1">
                <li>
                    <strong>Ch.2 · Configuration Space</strong> — DOF of bodies and robots, Grübler's formula,
                    the topology and representation of the C-space, task space and workspace.
                </li>
                <li>
                    <strong>Ch.3 · Rigid-Body Motions</strong> — rotation matrices{" "}
                    <InlineMath math='SO(3)'/>, angular velocity, the exponential-coordinate (screw) description
                    of rotations, homogeneous transforms <InlineMath math='SE(3)'/>, and twists.
                </li>
                <li>
                    <strong>Ch.4 · Forward Kinematics</strong> — computing the end-effector pose from the joint
                    values with the product of exponentials (PoE) formula.
                </li>
                <li className="text-muted">
                    <strong>Coming soon</strong> — Ch.5 Velocity Kinematics &amp; Statics (the Jacobian), Ch.6
                    Inverse Kinematics.
                </li>
            </ul>
        </>
    )
}

export default Chapter1
