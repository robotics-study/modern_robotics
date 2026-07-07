import {BlockMath, InlineMath} from "../../components/math/Tex";
import FourBarLinkage from "../../components/pages/chapter7/FourBarLinkage";
import RPRParallel from "../../components/pages/chapter7/RPRParallel";

const Chapter7 = () => {
    return (
        <>
            <h2>Closed Chains and Parallel Mechanisms</h2>
            <p>
                Every mechanism so far has been an <strong>open chain</strong>: a single serial string of links
                running from base to end-effector. A <strong>closed chain</strong> instead contains one or more{" "}
                <strong>loops</strong>, so a link can be reached by more than one path. The most important closed
                chains are <strong>parallel mechanisms</strong> — a <strong>fixed platform</strong> and a{" "}
                <strong>moving platform</strong> joined by several <strong>legs</strong>, each usually a short open
                chain. Only some of the joints are <strong>actuated</strong>; the rest are passive and simply go
                along for the ride. Because the legs share the moving platform, the joint variables are not free:
                they must satisfy <strong>loop-closure constraints</strong> that keep every leg attached to the same
                rigid platform.
            </p>
            <p>
                This creates a striking <strong>duality</strong> with serial arms. For an open chain forward
                kinematics is a direct evaluation while inverse kinematics is the hard, multi-solution problem. For a
                parallel mechanism the roles flip: <strong>inverse kinematics is usually easy — the actuator values
                follow directly from the platform pose — while forward kinematics is hard.</strong> A chosen set of
                actuator values may be geometrically infeasible (the legs simply cannot close the loop), or it may
                correspond to several distinct platform poses at once.
            </p>
            <p>
                Mobility is counted the same way as before, with <strong>Grübler's formula</strong>. For a mechanism
                of <InlineMath math='N'/> links (including ground) connected by <InlineMath math='J'/> joints in a{" "}
                <InlineMath math='m'/>-dof space (<InlineMath math='m=3'/> planar, <InlineMath math='m=6'/> spatial),
            </p>
            <BlockMath math={`\\mathrm{dof} = m(N - 1 - J) + \\sum_{i=1}^{J} f_i`}/>
            <p>
                where <InlineMath math='f_i'/> is the number of freedoms at joint <InlineMath math='i'/>. The{" "}
                <strong>four-bar linkage</strong> below is the simplest closed chain: four links (one is ground) and
                four revolute joints form a single loop. Grübler gives{" "}
                <InlineMath math='3(4 - 1 - 4) + 4 = 1'/>, so its entire configuration space is{" "}
                <strong>one-dimensional</strong> — turning the input crank determines everything else through
                loop closure. Sweep the driving angle and watch the coupler and rocker follow.
            </p>
            <FourBarLinkage/>

            <h2>Forward and Inverse Kinematics</h2>
            <p>
                Take the planar <strong>3&times;RPR</strong> mechanism as a case study: a moving platform is held by
                three legs, each an <strong>R</strong>evolute base joint, an actuated <strong>P</strong>rismatic
                leg, and an <strong>R</strong>evolute platform joint. It has three degrees of freedom, matching the
                planar pose <InlineMath math='(p_x, p_y, \phi)'/> of the platform; the three prismatic legs are
                actuated and every revolute joint is passive. Let the fixed base points be{" "}
                <InlineMath math='a_i'/> (in the fixed frame <InlineMath math='\{s\}'/>) and the platform attachment
                points be <InlineMath math='b_i'/> (in the body frame <InlineMath math='\{b\}'/>).
            </p>
            <p>
                Given the pose, each platform point in the fixed frame is{" "}
                <InlineMath math='B_i = p + R(\phi)\,b_i'/>, so the leg length is simply the distance from{" "}
                <InlineMath math='a_i'/> to <InlineMath math='B_i'/>:
            </p>
            <BlockMath math={`s_i^2 = \\big(p_x + b_{ix}\\cos\\phi - b_{iy}\\sin\\phi - a_{ix}\\big)^2 + \\big(p_y + b_{ix}\\sin\\phi + b_{iy}\\cos\\phi - a_{iy}\\big)^2`}/>
            <p>
                <strong>Inverse kinematics is therefore a direct evaluation</strong> — plug in the pose and read off
                the three leg lengths, with no iteration and no branching. Drag the pose sliders below and watch{" "}
                <InlineMath math='s_1, s_2, s_3'/> update instantly; this trivial forward-to-actuator map is the
                whole point of the figure.
            </p>
            <RPRParallel/>
            <p>
                The <strong>forward</strong> problem is the hard direction. Given the three lengths{" "}
                <InlineMath math='s_1, s_2, s_3'/>, finding the pose <InlineMath math='(p_x, p_y, \phi)'/> means
                solving the three constraint equations simultaneously. Applying the{" "}
                <strong>tangent half-angle substitution</strong> <InlineMath math='t = \tan(\phi/2)'/> eliminates
                the trigonometric terms and reduces the system to a single{" "}
                <strong>sixth-order polynomial</strong> — so a given set of leg lengths can correspond to{" "}
                <strong>up to six distinct platform poses</strong>.
            </p>
            <p>
                The spatial analogue is the <strong>6&times;SPS Stewart–Gough platform</strong>, six actuated legs
                each a <strong>S</strong>pherical–<strong>P</strong>rismatic–<strong>S</strong>pherical chain
                between a fixed and a moving platform. Its inverse kinematics is just as trivial —{" "}
                <InlineMath math='s_i = \lVert p + R b_i - a_i \rVert'/> — but its forward kinematics is far worse
                than the planar case: it admits <strong>up to 40 solutions</strong>. This is exactly the serial/
                parallel duality in its most extreme form.
            </p>

            <h2>Differential Kinematics</h2>
            <p>
                Velocity kinematics for a closed chain must respect the loops. Only the <strong>actuated</strong>{" "}
                joints receive commanded velocities; the <strong>passive</strong> joint velocities are then
                determined by the constraints. Partition the joint vector into actuated{" "}
                <InlineMath math='q_a'/> and passive <InlineMath math='q_p'/>. Differentiating the loop-closure
                constraints with respect to time gives a linear relation between the two,
            </p>
            <BlockMath math={`H_a(q)\\,\\dot q_a + H_p(q)\\,\\dot q_p = 0 \\quad\\Longrightarrow\\quad \\dot q_p = -H_p^{-1}(q)\\,H_a(q)\\,\\dot q_a`}/>
            <p>
                valid wherever <InlineMath math='H_p'/> is invertible. Once the passive velocities are recovered,
                the end-effector twist is obtained from any single leg as{" "}
                <InlineMath math='\mathcal{V} = J(q_a, q_p)\,\dot q_a'/>. The <strong>constraint Jacobian</strong> is
                the piece that has no counterpart in an open chain: it is what couples the legs together, and its
                rank governs how the commanded actuator velocities propagate to the platform.
            </p>
            <p>
                Statics gives an especially clean route for the Stewart–Gough platform. Because each leg is a
                prismatic strut, the force it exerts on the platform acts <strong>along the leg</strong>, a pure
                wrench whose screw axis is the leg's line. Collecting these six lines and applying the same
                velocity–force duality used for open chains, <InlineMath math='\tau = J^{\mathsf T}\mathcal{F}'/>,
                yields the <strong>inverse Jacobian</strong> directly from the leg geometry — no differentiation of a
                forward-kinematics map is required.
            </p>

            <h2>Singularities</h2>
            <p>
                Closed chains are richer than open ones near singularities, and it helps to separate three distinct
                kinds.
            </p>
            <ul className="list-disc pl-6 space-y-1">
                <li>
                    <strong>Configuration-space singularities</strong> — points where the constraint-surface itself
                    is not a smooth manifold: self-intersections and bifurcations where the constraint Jacobian{" "}
                    <InlineMath math='\partial f/\partial\theta'/> loses rank. They are a property of the geometry
                    alone and are <strong>independent of which joints are actuated</strong>.
                </li>
                <li>
                    <strong>Actuator singularities</strong> — configurations where <InlineMath math='H_p'/> drops
                    rank (<InlineMath math='\operatorname{rank} H_p < p'/>), so the actuated joints can no longer be
                    controlled independently. A <em>nondegenerate</em> actuator singularity rigidifies the
                    mechanism when the actuators are locked; a <em>degenerate</em> one lets the inner links move
                    even with the actuators locked. These depend on the <strong>choice of actuated joints</strong>{" "}
                    and can often be removed by relocating an actuator.
                </li>
                <li>
                    <strong>End-effector singularities</strong> — the moving platform loses the ability to move
                    instantaneously in some direction, exactly as for an open chain. These depend on the
                    <strong> placement of the end-effector frame</strong>, not on the actuator choice.
                </li>
            </ul>
            <p>
                The four-bar figure above makes the first kind visible. In its C-space panel the two curves are the
                two <strong>assembly branches</strong>, and the marked points where they meet are{" "}
                <strong>configuration-space singularities</strong> — bifurcation points where the coupler and rocker
                become collinear, the two circle intersections merge, and the mechanism can switch from one branch to
                the other. Because the meeting is a feature of the loop-closure surface itself, it stays put no
                matter which joint we choose to drive.
            </p>
        </>
    )
}

export default Chapter7
