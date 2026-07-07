import {BlockMath, InlineMath} from "../../components/math/Tex";
import TwoRDynamics from "../../components/pages/chapter8/TwoRDynamics";
import MassMatrixEllipse from "../../components/pages/chapter8/MassMatrixEllipse";

const Chapter8 = () => {
    return (
        <>
            <h2>The Equations of Motion</h2>
            <p>
                Kinematics answers <em>where</em> a robot can go; <strong>dynamics</strong> answers what forces and
                torques make it go there. For an open chain the relationship between joint torques and joint motion
                is captured by the <strong>equations of motion</strong>,
            </p>
            <BlockMath math={`\\tau = M(\\theta)\\,\\ddot\\theta + h(\\theta, \\dot\\theta)`}/>
            <p>
                Here <InlineMath math='M(\theta)'/> is the <InlineMath math='n \times n'/>{" "}
                <strong>mass matrix</strong> — symmetric and positive-definite, and configuration-dependent because a
                folded arm carries its inertia differently than an extended one. The term{" "}
                <InlineMath math='h(\theta, \dot\theta)'/> lumps together everything that is not proportional to
                acceleration: <strong>centripetal</strong> and <strong>Coriolis</strong> forces (quadratic in{" "}
                <InlineMath math='\dot\theta'/>), <strong>gravity</strong>, and friction. Two dual problems fall out
                of this one equation:
            </p>
            <ul className="list-disc pl-6 space-y-1">
                <li>
                    <strong>Inverse dynamics</strong>: given a desired motion{" "}
                    <InlineMath math='(\theta, \dot\theta, \ddot\theta)'/>, compute the torques{" "}
                    <InlineMath math='\tau'/> that produce it. This is what a controller evaluates to command the
                    motors.
                </li>
                <li>
                    <strong>Forward dynamics</strong>: given the applied torques{" "}
                    <InlineMath math='(\theta, \dot\theta, \tau)'/>, solve for the resulting acceleration{" "}
                    <InlineMath math='\ddot\theta = M^{-1}(\theta)\big(\tau - h(\theta, \dot\theta)\big)'/>. This is
                    the basis of <strong>simulation</strong>.
                </li>
            </ul>
            <p>
                There are two standard routes to these equations. The <strong>Lagrangian</strong> formulation is
                energy-based and elegant for chains with few degrees of freedom: form the Lagrangian{" "}
                <InlineMath math='\mathcal{L} = \mathcal{K} - \mathcal{P}'/> from kinetic and potential energy, and
                the torques follow from
            </p>
            <BlockMath math={`\\tau = \\frac{d}{dt}\\frac{\\partial \\mathcal{L}}{\\partial \\dot\\theta} - \\frac{\\partial \\mathcal{L}}{\\partial \\theta}`}/>
            <p>
                The <strong>Newton–Euler</strong> formulation is recursive and stays efficient for general chains of
                any length. We work the Lagrangian route by hand on a 2R arm next, then meet its recursive
                counterpart.
            </p>

            <h2>Lagrangian Dynamics of a 2R Arm</h2>
            <p>
                Take the planar 2R arm with point masses <InlineMath math='m_1, m_2'/> at the ends of links of
                length <InlineMath math='L_1, L_2'/>, gravity acting in <InlineMath math='-\hat y'/>. The kinetic
                energy is the sum of <InlineMath math='\tfrac12 m v^2'/> over the two masses, and the potential
                energy is <InlineMath math='m g y'/> summed over their heights,
            </p>
            <BlockMath math={`\\mathcal{K} = \\tfrac12 m_1 L_1^2 \\dot\\theta_1^2 + \\tfrac12 m_2\\big(L_1^2\\dot\\theta_1^2 + L_2^2(\\dot\\theta_1+\\dot\\theta_2)^2 + 2 L_1 L_2 \\cos\\theta_2\\, \\dot\\theta_1(\\dot\\theta_1+\\dot\\theta_2)\\big)`}/>
            <p>
                Grinding <InlineMath math='\tau = \tfrac{d}{dt}\partial_{\dot\theta}\mathcal{L} - \partial_\theta\mathcal{L}'/>{" "}
                through this energy gives the three ingredients of{" "}
                <InlineMath math='\tau = M(\theta)\ddot\theta + c(\theta,\dot\theta) + g(\theta)'/>. The mass matrix
                is
            </p>
            <BlockMath math={`M(\\theta) = \\begin{bmatrix} m_1 L_1^2 + m_2\\big(L_1^2 + 2 L_1 L_2 \\cos\\theta_2 + L_2^2\\big) & m_2\\big(L_1 L_2 \\cos\\theta_2 + L_2^2\\big) \\\\[4pt] m_2\\big(L_1 L_2 \\cos\\theta_2 + L_2^2\\big) & m_2 L_2^2 \\end{bmatrix}`}/>
            <p>
                the Coriolis / centripetal vector is
            </p>
            <BlockMath math={`c(\\theta, \\dot\\theta) = \\begin{bmatrix} -m_2 L_1 L_2 \\sin\\theta_2\\,\\big(2\\dot\\theta_1\\dot\\theta_2 + \\dot\\theta_2^2\\big) \\\\[4pt] m_2 L_1 L_2\\,\\dot\\theta_1^2 \\sin\\theta_2 \\end{bmatrix}`}/>
            <p>
                and the gravity vector is
            </p>
            <BlockMath math={`g(\\theta) = \\begin{bmatrix} (m_1 + m_2) L_1 g \\cos\\theta_1 + m_2 g L_2 \\cos(\\theta_1 + \\theta_2) \\\\[4pt] m_2 g L_2 \\cos(\\theta_1 + \\theta_2) \\end{bmatrix}`}/>
            <p>
                Look at the <em>structure</em> rather than the algebra. The equations are <strong>linear in{" "}
                <InlineMath math='\ddot\theta'/></strong>, <strong>quadratic in{" "}
                <InlineMath math='\dot\theta'/></strong> — the <InlineMath math='\dot\theta_i^2'/> terms are
                centripetal, the <InlineMath math='\dot\theta_i\dot\theta_j'/> cross terms are Coriolis — and{" "}
                <strong>trigonometric in <InlineMath math='\theta'/></strong>. Crucially, the off-diagonal entry{" "}
                <InlineMath math='M_{12} = m_2(L_1 L_2 \cos\theta_2 + L_2^2)'/> is generally nonzero: the joints are{" "}
                <strong>inertially coupled</strong>, so an acceleration commanded at joint 1 exerts a reaction
                torque at joint 2, and vice versa. The coupling vanishes only when{" "}
                <InlineMath math='\cos\theta_2 = -L_2/L_1'/>.
            </p>
            <p>
                The figure below integrates exactly these equations in real time. With torques at zero and gravity
                on, the arm is a <strong>double pendulum</strong>: give it an off-vertical start and it swings.
                Nudge the joint torques, toggle gravity, or switch on gravity compensation and watch how the same
                model responds.
            </p>
            <TwoRDynamics/>

            <h2>Newton–Euler Inverse Dynamics</h2>
            <p>
                Forming <InlineMath math='M(\theta)'/> and <InlineMath math='h(\theta,\dot\theta)'/> symbolically, as
                above, becomes hopeless for a six- or seven-joint arm. The <strong>Newton–Euler</strong> algorithm
                sidesteps the symbols with two recursive sweeps along the chain and computes the inverse dynamics in
                time <InlineMath math='O(n)'/> in the number of joints.
            </p>
            <ul className="list-disc pl-6 space-y-1">
                <li>
                    <strong>Forward pass (base → tip)</strong>: starting from the known base motion, propagate each
                    link's configuration outward, together with its twist{" "}
                    <InlineMath math='\mathcal{V}_i'/> and twist acceleration{" "}
                    <InlineMath math='\dot{\mathcal{V}}_i'/>. Each link inherits the motion of its parent and adds
                    the contribution of its own joint velocity and acceleration.
                </li>
                <li>
                    <strong>Backward pass (tip → base)</strong>: starting from any force the tip exerts on the
                    environment, propagate the wrench <InlineMath math='\mathcal{F}_i'/> that each link applies to
                    its parent inward. The joint torque is the component of that wrench along the joint's screw axis,
                    <InlineMath math='\ \tau_i = \mathcal{F}_i^{\mathsf T}\mathcal{A}_i'/>.
                </li>
            </ul>
            <p>
                Each link's mass distribution enters through its <InlineMath math='6\times 6'/>{" "}
                <strong>spatial inertia matrix</strong> <InlineMath math='\mathcal{G}_i = \operatorname{diag}(\mathcal{I}_i,\, m_i I)'/>,
                which packages the rotational inertia <InlineMath math='\mathcal{I}_i'/> and the point-mass block{" "}
                <InlineMath math='m_i I'/> together so that a spatial force relates to a spatial acceleration by{" "}
                <InlineMath math='\mathcal{F} = \mathcal{G}\dot{\mathcal{V}} - [\mathrm{ad}_{\mathcal{V}}]^{\mathsf T}\mathcal{G}\mathcal{V}'/>.
                No explicit <InlineMath math='M(\theta)'/> is ever assembled. Yet the same routine is the workhorse
                for building it when needed: running inverse dynamics with{" "}
                <InlineMath math='\dot\theta = 0'/>, <InlineMath math='g = 0'/> and{" "}
                <InlineMath math='\ddot\theta = e_j'/> returns the <InlineMath math='j'/>-th column of{" "}
                <InlineMath math='M(\theta)'/>, so <InlineMath math='n'/> passes recover the whole mass matrix, and
                one more pass with <InlineMath math='\ddot\theta = 0'/> recovers{" "}
                <InlineMath math='h(\theta,\dot\theta)'/> in closed form.
            </p>

            <h2>Forward Dynamics and Simulation</h2>
            <p>
                To <strong>simulate</strong> a robot we run the equations the other way. At each instant solve the
                forward-dynamics problem for the acceleration,
            </p>
            <BlockMath math={`\\ddot\\theta = M^{-1}(\\theta)\\big(\\tau - c(\\theta,\\dot\\theta) - g(\\theta)\\big)`}/>
            <p>
                then integrate <InlineMath math='(\theta, \dot\theta)'/> forward one time step and repeat, with an
                explicit Euler, semi-implicit Euler, or Runge–Kutta integrator. This loop is exactly what drives the
                live simulation above. With <InlineMath math='\tau = 0'/> and gravity on, that 2R arm is a{" "}
                <strong>double pendulum</strong>: energy-conserving in principle, yet <strong>chaotic</strong> — two
                nearly identical starts diverge to completely different trajectories within a few swings.
            </p>
            <p>
                Setting <InlineMath math='\tau = g(\theta)'/> at every step is <strong>gravity compensation</strong>:
                the applied torque exactly cancels the gravity term, so the arm floats as if weightless and drifts
                only under the torques you add on top. Two caveats about the numerics:
            </p>
            <ul className="list-disc pl-6 space-y-1">
                <li>
                    <strong>Energy drift</strong>: plain Euler integration slowly injects or bleeds energy, so an
                    ideal double pendulum will visibly gain or lose swing. Smaller steps, or symplectic / RK4
                    integrators, keep the energy honest — watch the reported <InlineMath math='E'/> in the figure to
                    see how well it holds.
                </li>
                <li>
                    <strong>Frame-rate independence</strong>: physics is integrated on a fixed small sub-step,
                    decoupled from the display frame rate, so the motion looks the same whether the browser renders
                    at 30 or 120 fps.
                </li>
            </ul>
            <p>
                Finally, the operator that turns torque into acceleration is <InlineMath math='M^{-1}(\theta)'/>
                itself, and it is strongly configuration-dependent. Map the unit circle of joint torques{" "}
                <InlineMath math='\{u : \lVert u\rVert = 1\}'/> through <InlineMath math='M^{-1}'/> and it becomes an{" "}
                <strong>acceleration ellipse</strong> <InlineMath math='\{M^{-1}u\}'/> in the{" "}
                <InlineMath math='(\ddot\theta_1, \ddot\theta_2)'/> plane. A round ellipse means the arm accelerates
                about equally easily in every direction; a stretched one means it is easy to accelerate one way and
                sluggish and coupled the other. Sweep <InlineMath math='\theta_2'/> below: as the arm folds
                (<InlineMath math='\theta_2 \to \pm\pi'/>) the ellipse rounds out, and as it straightens
                (<InlineMath math='\theta_2 \to 0'/>) the growing off-diagonal of <InlineMath math='M'/> stretches
                and tilts it.
            </p>
            <MassMatrixEllipse/>
        </>
    )
}

export default Chapter8
