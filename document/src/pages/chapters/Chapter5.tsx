import {BlockMath, InlineMath} from "../../components/math/Tex";
import JacobianColumns from "../../components/pages/chapter5/JacobianColumns";
import ManipulabilityEllipse from "../../components/pages/chapter5/ManipulabilityEllipse";

const Chapter5 = () => {
    return (
        <>
            <h2>Manipulator Jacobian</h2>
            <p>
                Forward kinematics answers <em>where</em> the end-effector is for a given set of joint
                positions. Velocity kinematics answers the related question: given the joint <em>velocities</em>{" "}
                <InlineMath math='\dot\theta'/>, how fast and in what direction does the end-effector move? Writing
                the forward kinematics as <InlineMath math='x = f(\theta)'/> and differentiating by the chain rule,
            </p>
            <BlockMath math={`\\dot{x} = \\frac{\\partial f(\\theta)}{\\partial \\theta}\\,\\dot\\theta = J(\\theta)\\,\\dot\\theta`}/>
            <p>
                The matrix <InlineMath math='J(\theta)'/> is the <strong>Jacobian</strong>. It is the linear map
                from joint velocities to end-effector velocity, and — because the trigonometric terms depend on the
                configuration — it changes as the robot moves.
            </p>
            <p>
                For the 2R planar chain the tip velocity is <InlineMath math='v_\text{tip} = J_1(\theta)\dot\theta_1 + J_2(\theta)\dot\theta_2'/>.
                Each column <InlineMath math='J_i(\theta)'/> has a direct physical meaning: it is the tip velocity
                produced when joint <InlineMath math='i'/> turns at unit speed and the others are held still. Drag
                the sliders below — the two arrows are exactly <InlineMath math='J_1'/> and <InlineMath math='J_2'/>.
                When they line up (at <InlineMath math='\theta_2 = 0'/> or <InlineMath math='\pm\pi'/>) the tip can
                no longer move sideways, <InlineMath math='\det J = L_1 L_2 \sin\theta_2'/> vanishes, and the arm is
                at a <strong>singularity</strong>.
            </p>
            <JacobianColumns/>
            <p>
                In the general spatial case the tip velocity is the six-dimensional twist{" "}
                <InlineMath math='\mathcal{V}'/>, and the same idea holds: column <InlineMath math='i'/> of the
                Jacobian is the screw axis of joint <InlineMath math='i'/>, expressed for the <em>current</em>{" "}
                configuration rather than the zero configuration used by the product-of-exponentials formula.
            </p>

            <h2>Space and Body Jacobian</h2>
            <p>
                Just as a twist can be written in the fixed frame (<InlineMath math='\mathcal{V}_s'/>) or the
                end-effector frame (<InlineMath math='\mathcal{V}_b'/>), there are two Jacobians. The{" "}
                <strong>space Jacobian</strong> <InlineMath math='J_s(\theta)'/> satisfies{" "}
                <InlineMath math='\mathcal{V}_s = J_s(\theta)\dot\theta'/>, with columns
            </p>
            <BlockMath math={`J_{si}(\\theta) = \\big[\\mathrm{Ad}_{e^{[\\mathcal{S}_1]\\theta_1}\\cdots e^{[\\mathcal{S}_{i-1}]\\theta_{i-1}}}\\big]\\,\\mathcal{S}_i, \\qquad J_{s1} = \\mathcal{S}_1`}/>
            <p>
                Each column is the joint screw axis <InlineMath math='\mathcal{S}_i'/> after it has been carried
                along by the first <InlineMath math='i-1'/> joints. The <strong>body Jacobian</strong>{" "}
                <InlineMath math='J_b(\theta)'/> satisfies <InlineMath math='\mathcal{V}_b = J_b(\theta)\dot\theta'/>,
                with columns built the same way from the body screw axes <InlineMath math='\mathcal{B}_i'/>, working
                inward from the last joint. The two are related by the adjoint map,
            </p>
            <BlockMath math={`J_b(\\theta) = \\big[\\mathrm{Ad}_{T_{bs}}\\big] J_s(\\theta), \\qquad J_s(\\theta) = \\big[\\mathrm{Ad}_{T_{sb}}\\big] J_b(\\theta)`}/>
            <p>
                Since the adjoint map is always invertible, <InlineMath math='J_s(\theta)'/> and{" "}
                <InlineMath math='J_b(\theta)'/> always have the <strong>same rank</strong> — singularities are a
                property of the configuration, not of the frame we chose to describe it in.
            </p>

            <h2>Statics of Open Chains</h2>
            <p>
                The Jacobian also governs statics. By conservation of power, at static equilibrium the power
                delivered by the joint torques equals the power the end-effector exerts on its environment,{" "}
                <InlineMath math='\tau^{\mathsf T}\dot\theta = \mathcal{F}^{\mathsf T}\mathcal{V}'/>. Substituting{" "}
                <InlineMath math='\mathcal{V} = J(\theta)\dot\theta'/> and requiring this for all{" "}
                <InlineMath math='\dot\theta'/> gives the central relation
            </p>
            <BlockMath math={`\\tau = J^{\\mathsf T}(\\theta)\\,\\mathcal{F}`}/>
            <p>
                So the same Jacobian that maps joint velocities to a twist maps an end-effector wrench{" "}
                <InlineMath math='\mathcal{F}'/> back to the joint torques needed to balance it. A wrench in the
                null space of <InlineMath math='J^{\mathsf T}'/> requires no joint torque at all: the structure
                carries it. This is why an outstretched arm supports a heavy suitcase most easily when the elbow is
                straight — at that singularity the load passes directly through the joints.
            </p>

            <h2>Singularities</h2>
            <p>
                A <strong>kinematic singularity</strong> is a configuration where <InlineMath math='J(\theta)'/>{" "}
                loses rank, so the end-effector loses the ability to move instantaneously in one or more directions.
                For a spatial 6R arm several geometric patterns force a rank drop, for example:
            </p>
            <ul className="list-disc pl-6 space-y-1">
                <li>two revolute joint axes become <strong>collinear</strong>;</li>
                <li>three revolute axes become <strong>parallel and coplanar</strong>;</li>
                <li>four revolute axes <strong>intersect at a common point</strong>;</li>
                <li>six revolute axes all <strong>intersect a common line</strong>.</li>
            </ul>
            <p>
                In every case two or more Jacobian columns become linearly dependent. Because{" "}
                <InlineMath math='J_s'/> and <InlineMath math='J_b'/> share their rank, and relocating the base or
                the end-effector frame leaves the Jacobian's rank unchanged, singularities are intrinsic to the
                mechanism's posture.
            </p>

            <h2>Manipulability and Force Ellipsoids</h2>
            <p>
                How close is a posture to a singularity, and in which directions is the arm nimble or clumsy? Map
                the unit circle of "iso-effort" joint velocities through the Jacobian: it becomes the{" "}
                <strong>manipulability ellipsoid</strong>, whose principal axes are the eigenvectors of{" "}
                <InlineMath math='J J^{\mathsf T}'/> and whose semi-axis lengths are the singular values{" "}
                <InlineMath math='\ell_i'/> of <InlineMath math='J'/>. A round ellipse means the tip moves equally
                well in all directions; a thin one means it is nearly singular; at a singularity it collapses to a
                line segment.
            </p>
            <p>
                Sweep the sliders and watch the ellipse stretch and flatten. The ratio{" "}
                <InlineMath math='\ell_\text{max}/\ell_\text{min}'/> measures the distance from a singularity — it
                runs off to infinity as <InlineMath math='\theta_2 \to 0'/>. Toggle the <strong>force
                ellipsoid</strong>: its axes are the <em>reciprocals</em> of the manipulability axes, so a
                direction that is easy to move is hard to push in, and vice versa. At a singularity the
                manipulability ellipse thins to a segment while the force ellipse grows without bound along the
                orthogonal direction.
            </p>
            <ManipulabilityEllipse/>
        </>
    )
}

export default Chapter5
