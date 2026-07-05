import {BlockMath, InlineMath} from "../../components/math/Tex";

const Chapter4 = () => {
    return (
        <>
            <h2>Forward Kinematics</h2>
            <p><strong>Definition</strong> : the forward kinematics of a robot is the calculation of the position
                and orientation of its end-effector frame from the joint coordinates{" "}
                <InlineMath math='\theta'/>. For an open chain the end-effector pose is uniquely determined by the
                joint values.
            </p>
            <p>
                For the 3R planar open chain with link lengths <InlineMath math='L_1, L_2, L_3'/>, basic
                trigonometry gives the end-effector position <InlineMath math='(x, y)'/> and orientation{" "}
                <InlineMath math='\phi'/> as
            </p>
            <BlockMath math={`\\begin{gathered}
                x = L_1\\cos\\theta_1 + L_2\\cos(\\theta_1+\\theta_2) + L_3\\cos(\\theta_1+\\theta_2+\\theta_3) \\\\[4pt]
                y = L_1\\sin\\theta_1 + L_2\\sin(\\theta_1+\\theta_2) + L_3\\sin(\\theta_1+\\theta_2+\\theta_3) \\\\[4pt]
                \\phi = \\theta_1 + \\theta_2 + \\theta_3
                \\end{gathered}`}/>
            <p>
                A more systematic route attaches a frame to each link and multiplies the successive homogeneous
                transformations, <InlineMath math='T_{04} = T_{01} T_{12} T_{23} T_{34}'/>. Two standard
                representations build on this idea: the <strong>Denavit–Hartenberg (D–H) parameters</strong>,
                which are minimal but require link frames placed by special rules, and the{" "}
                <strong>product of exponentials (PoE)</strong> formula, which needs no link frames and is the
                preferred choice here.
            </p>

            <h2>Product of Exponentials: Space Form</h2>
            <p>
                The key idea: regard each joint as applying a <strong>screw motion</strong> to all the links
                outward from it. Place the robot at its home position (all joint values zero) and let{" "}
                <InlineMath math='M \in SE(3)'/> be the end-effector frame configuration there. Let{" "}
                <InlineMath math='\mathcal{S}_i = (\omega_i, v_i)'/> be the screw axis of joint{" "}
                <InlineMath math='i'/> expressed in the <strong>fixed base frame</strong>. Then
            </p>
            <BlockMath math='T(\theta) = e^{[\mathcal{S}_1]\theta_1} e^{[\mathcal{S}_2]\theta_2} \cdots e^{[\mathcal{S}_n]\theta_n}\, M'/>
            <p>
                This is the <strong>space form</strong> of the PoE formula. Computing it needs only three things:
            </p>
            <ul className="list-disc pl-6 space-y-1">
                <li>(a) the home configuration <InlineMath math='M \in SE(3)'/> of the end-effector;</li>
                <li>(b) the screw axes <InlineMath math='\mathcal{S}_1, \dots, \mathcal{S}_n'/> in the base
                    frame;
                </li>
                <li>(c) the joint values <InlineMath math='\theta_1, \dots, \theta_n'/>.</li>
            </ul>
            <p>
                For a <strong>revolute</strong> joint, <InlineMath math='\omega_i'/> is a unit vector along the
                joint axis and <InlineMath math='v_i = -\omega_i \times q_i'/> with <InlineMath math='q_i'/> any
                point on the axis. For a <strong>prismatic</strong> joint, <InlineMath math='\omega_i = 0'/> and{" "}
                <InlineMath math='v_i'/> is the unit direction of translation. Unlike the D–H representation, no
                link reference frames are required.
            </p>

            <h2>Product of Exponentials: Body Form</h2>
            <p>
                Re-expressing each screw axis in the end-effector (<strong>body</strong>) frame at the home
                position, <InlineMath math='\mathcal{B}_i = [\mathrm{Ad}_{M^{-1}}]\,\mathcal{S}_i'/>, and using
                the identity <InlineMath math='M e^{M^{-1}[\mathcal{S}]M} = e^{[\mathcal{S}]}M'/> repeatedly gives
                the <strong>body form</strong>:
            </p>
            <BlockMath math='T(\theta) = M\, e^{[\mathcal{B}_1]\theta_1} e^{[\mathcal{B}_2]\theta_2} \cdots e^{[\mathcal{B}_n]\theta_n}'/>
            <p>
                The two forms differ only in the order of transformations. In the space form,{" "}
                <InlineMath math='M'/> is transformed first by the most distal joint, moving inward; in the body
                form, first by the most proximal joint, moving outward. Because a space-frame axis is unaffected
                by more distal joints, and a body-frame axis by more proximal ones, both sets of screw axes need
                only be read off at the robot's zero position.
            </p>

            <h2>Universal Robot Description Format (URDF)</h2>
            <p>
                A <strong>URDF</strong> file is an XML description of a robot used across the robotics ecosystem.
                It lists the robot's <strong>links</strong> — each with mass, inertia, and visual/collision
                geometry — and the <strong>joints</strong> connecting them, each giving a type (revolute,
                prismatic, …), an axis, its parent and child links, and the transform between them.
            </p>
            <p>
                Together these entries supply exactly the data the forward kinematics needs — the joint screw
                axes and the home configuration <InlineMath math='M'/> — and the inertial data that later chapters
                use for dynamics.
            </p>
        </>
    )
}

export default Chapter4
