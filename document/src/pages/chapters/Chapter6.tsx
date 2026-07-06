import {BlockMath, InlineMath} from "../../components/math/Tex";
import AnalyticIK2R from "../../components/pages/chapter6/AnalyticIK2R";
import NewtonRaphsonIK from "../../components/pages/chapter6/NewtonRaphsonIK";

const Chapter6 = () => {
    return (
        <>
            <h2>Inverse Kinematics</h2>
            <p>
                <strong>Definition</strong> : for an open chain with forward kinematics{" "}
                <InlineMath math='T(\theta)'/>, the inverse kinematics problem is: given a desired end-effector
                configuration <InlineMath math='X \in SE(3)'/>, find the joint values <InlineMath math='\theta'/>{" "}
                that satisfy <InlineMath math='T(\theta) = X'/>.
            </p>
            <p>
                Unlike forward kinematics, which has a single unique answer, inverse kinematics may have{" "}
                <strong>no solution, a finite number, or infinitely many</strong>. Take the 2R arm reaching for a
                point <InlineMath math='(x, y)'/>. Its reachable set — the <strong>workspace</strong> — is the
                annulus between radii <InlineMath math='|L_1 - L_2|'/> and <InlineMath math='L_1 + L_2'/>. A target
                outside the annulus has no solution; one on a boundary circle has exactly one; one strictly inside
                has two, the "elbow-up" and "elbow-down" postures.
            </p>

            <h2>Analytic Inverse Kinematics</h2>
            <p>
                When the geometry is simple enough, the solution can be written in closed form. For the 2R arm the
                law of cosines gives the interior angles directly. With <InlineMath math='r^2 = x^2 + y^2'/>,
            </p>
            <BlockMath math={`\\beta = \\cos^{-1}\\!\\frac{L_1^2 + L_2^2 - r^2}{2 L_1 L_2}, \\qquad \\alpha = \\cos^{-1}\\!\\frac{r^2 + L_1^2 - L_2^2}{2 L_1 r}, \\qquad \\gamma = \\operatorname{atan2}(y, x)`}/>
            <p>
                which yield the two solutions
            </p>
            <BlockMath math={`\\text{righty:}\\ \\theta_1 = \\gamma - \\alpha,\\ \\theta_2 = \\pi - \\beta \\qquad\\qquad \\text{lefty:}\\ \\theta_1 = \\gamma + \\alpha,\\ \\theta_2 = \\beta - \\pi`}/>
            <p>
                The two-argument arctangent <InlineMath math='\operatorname{atan2}(y, x)'/> is essential here: it
                returns the correct quadrant over <InlineMath math='(-\pi, \pi]'/>, unlike{" "}
                <InlineMath math='\tan^{-1}(y/x)'/>. Drag the target below through the workspace and watch both
                solutions track it; drag it outside the annulus and both disappear.
            </p>
            <AnalyticIK2R/>
            <p>
                The same decoupling scales to six-dof arms of special design. For a <strong>PUMA-type</strong> 6R
                arm the wrist axes intersect at a point, so the problem splits into an <strong>inverse-position</strong>{" "}
                subproblem for the first three joints (solved with the same planar-arm trigonometry, giving up to
                four arm postures) and an <strong>inverse-orientation</strong> subproblem for the wrist, solved as a
                set of ZYX Euler angles. A <strong>Stanford-type</strong> arm replaces the elbow with a prismatic
                joint and is handled the same way.
            </p>

            <h2>Numerical Inverse Kinematics</h2>
            <p>
                Most robots have no closed-form solution. The <strong>Newton–Raphson</strong> method solves{" "}
                <InlineMath math='x_d - f(\theta) = 0'/> iteratively. Expanding the forward kinematics to first
                order about a guess <InlineMath math='\theta^0'/> gives{" "}
                <InlineMath math='J(\theta^0)\,\Delta\theta = x_d - f(\theta^0)'/>, so each step corrects the guess
                by
            </p>
            <BlockMath math={`\\theta^{k+1} = \\theta^{k} + J^{\\dagger}(\\theta^{k})\\big(x_d - f(\\theta^{k})\\big)`}/>
            <p>
                where <InlineMath math='J^{\dagger}'/> is the Moore–Penrose <strong>pseudoinverse</strong>, which
                reduces to <InlineMath math='J^{-1}'/> when the Jacobian is square and nonsingular but still gives a
                sensible least-squares (or minimum-norm) answer when the robot is redundant or near a singularity.
                Iteration continues until the error <InlineMath math='\lVert x_d - f(\theta)\rVert'/> falls below a
                tolerance. Step through the iteration below: the tip walks toward the goal, converging in a handful
                of steps. Drag the goal to see the process restart — the method converges to whichever solution's{" "}
                <em>basin of attraction</em> contains the initial guess.
            </p>
            <NewtonRaphsonIK/>
            <p>
                To drive a full pose <InlineMath math='T_{sd} \in SE(3)'/> rather than a coordinate vector, the same
                algorithm uses the body Jacobian <InlineMath math='J_b'/> and replaces the error with the body twist{" "}
                <InlineMath math='[\mathcal{V}_b] = \log\!\big(T_{sb}^{-1}(\theta)\,T_{sd}\big)'/> that would carry
                the current frame to the goal in unit time.
            </p>

            <h2>Inverse Velocity Kinematics</h2>
            <p>
                A related problem underlies trajectory following: given a desired end-effector twist{" "}
                <InlineMath math='\mathcal{V}_d'/>, what joint velocities produce it? Inverting{" "}
                <InlineMath math='J(\theta)\dot\theta = \mathcal{V}_d'/> with the pseudoinverse gives
            </p>
            <BlockMath math={`\\dot\\theta = J^{\\dagger}(\\theta)\\,\\mathcal{V}_d`}/>
            <p>
                For a redundant robot (<InlineMath math='n > 6'/>) this returns the minimum-norm joint velocity,
                leaving an <InlineMath math='(n-6)'/>-dimensional family of internal motions free. Those extra
                degrees of freedom can be used to optimize a secondary criterion — for instance weighting the joints
                by the mass they move, so the solution minimizes kinetic energy while still realizing{" "}
                <InlineMath math='\mathcal{V}_d'/>.
            </p>
        </>
    )
}

export default Chapter6
