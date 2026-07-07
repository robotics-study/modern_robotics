import {BlockMath, InlineMath} from "../../components/math/Tex";
import TimeScalingProfiles from "../../components/pages/chapter9/TimeScalingProfiles";
import ViaPointTrajectory from "../../components/pages/chapter9/ViaPointTrajectory";

const Chapter9 = () => {
    return (
        <>
            <h2>Paths and Time Scaling</h2>
            <p>
                A <strong>trajectory</strong> specifies not just the shape a robot traces but{" "}
                <em>when</em> it reaches each configuration. It is cleanest to split those two questions.
                A <strong>path</strong> <InlineMath math='\theta(s)'/> is a purely geometric curve through the
                joint space, parameterized by a scalar <InlineMath math='s \in [0, 1]'/> that runs from the start{" "}
                <InlineMath math='(s=0)'/> to the goal <InlineMath math='(s=1)'/>. A <strong>time scaling</strong>{" "}
                <InlineMath math='s(t)'/>, <InlineMath math='t \in [0, T]'/>, then says how fast the parameter is
                swept, turning the static path into a motion <InlineMath math='\theta(s(t))'/>.
            </p>
            <p>
                Differentiating by the chain rule ties the two together. The joint velocities and accelerations are
            </p>
            <BlockMath math={`\\dot\\theta = \\frac{d\\theta}{ds}\\,\\dot s, \\qquad \\ddot\\theta = \\frac{d\\theta}{ds}\\,\\ddot s + \\frac{d^2\\theta}{ds^2}\\,\\dot s^{\\,2}`}/>
            <p>
                so both the path <InlineMath math='\theta(s)'/> and the time scaling <InlineMath math='s(t)'/> must be
                twice differentiable for the motion to have a well-defined acceleration. The simplest path is the{" "}
                <strong>straight line in joint space</strong>,
            </p>
            <BlockMath math={`\\theta(s) = \\theta_\\text{start} + s\\,(\\theta_\\text{end} - \\theta_\\text{start})`}/>
            <p>
                which is convex and therefore automatically respects box-shaped joint limits: every intermediate
                configuration is a weighted average of two legal ones. A straight line in <em>task</em> space is
                often more natural to specify, but it can leave the reachable workspace or pass near a{" "}
                <strong>singularity</strong>, where the required joint velocities blow up. Whichever path is chosen,
                the remaining freedom is the time scaling below.
            </p>
            <TimeScalingProfiles/>

            <h2>Polynomial Time Scaling</h2>
            <p>
                A point-to-point motion must start and end at rest, so <InlineMath math='s(0)=0'/>,{" "}
                <InlineMath math='s(T)=1'/>, and <InlineMath math='\dot s(0)=\dot s(T)=0'/>. Four conditions fix a{" "}
                <strong>cubic</strong> (third-order) time scaling <InlineMath math='s(t) = a_0 + a_1 t + a_2 t^2 + a_3 t^3'/>,
                which works out to
            </p>
            <BlockMath math={`s(t) = 3\\Big(\\tfrac{t}{T}\\Big)^2 - 2\\Big(\\tfrac{t}{T}\\Big)^3, \\qquad \\dot s(t) = \\frac{6t}{T^2} - \\frac{6t^2}{T^3}, \\qquad \\ddot s(t) = \\frac{6}{T^2} - \\frac{12t}{T^3}`}/>
            <p>
                The speed peaks at the midpoint with <InlineMath math='\dot s_\text{max} = \tfrac{3}{2T}'/>, so the
                motion is fast in the middle and slow at the ends. But the acceleration <InlineMath math='\ddot s'/>{" "}
                is <strong>nonzero at the endpoints</strong> and jumps discontinuously from zero to{" "}
                <InlineMath math='6/T^2'/> at <InlineMath math='t=0'/> (and back at <InlineMath math='t=T'/>). That
                step in acceleration is an <strong>infinite jerk</strong> (jerk is <InlineMath math='da/dt'/>), which
                excites structural vibration in the arm.
            </p>
            <p>
                Adding <InlineMath math='\ddot s(0) = \ddot s(T) = 0'/> gives six conditions and a{" "}
                <strong>quintic</strong> (fifth-order) time scaling,
            </p>
            <BlockMath math={`s(t) = 10\\Big(\\tfrac{t}{T}\\Big)^3 - 15\\Big(\\tfrac{t}{T}\\Big)^4 + 6\\Big(\\tfrac{t}{T}\\Big)^5`}/>
            <p>
                whose acceleration eases in and out of rest smoothly, removing the jerk spikes. The price is a higher
                peak speed <InlineMath math='\dot s_\text{max} = \tfrac{15}{8T}'/> and peak acceleration{" "}
                <InlineMath math='\tfrac{10}{\sqrt 3\,T^2}'/> — the arm must move a little faster in the middle to make
                up for its gentler starts and stops. Selecting <em>quintic</em> in the figure above overlays the cubic
                as a faint dashed reference so the difference in the <InlineMath math='\ddot s'/> plot is visible.
            </p>

            <h2>Trapezoidal and S-Curve Profiles</h2>
            <p>
                When the goal is the <em>fastest</em> straight-line motion under velocity and acceleration limits, the
                polynomial scalings are wasteful — they touch their peak speed only for an instant. The{" "}
                <strong>trapezoidal velocity profile</strong> instead accelerates at a constant{" "}
                <InlineMath math='a'/>, <strong>coasts</strong> at a constant <InlineMath math='v'/>, then
                decelerates at <InlineMath math='-a'/>. Its <InlineMath math='\dot s'/> is a trapezoid and its{" "}
                <InlineMath math='s'/> is a parabola, then a line, then a parabola:
            </p>
            <BlockMath math={`\\dot s(t) = \\begin{cases} a\\,t, & 0 \\le t \\le v/a \\\\[2pt] v, & v/a < t \\le T - v/a \\\\[2pt] a\\,(T - t), & T - v/a < t \\le T \\end{cases}`}/>
            <p>
                With <InlineMath math='v'/> and <InlineMath math='a'/> set to the largest values the joints allow,
                this is the time-optimal straight-line motion. The coast phase exists only while{" "}
                <InlineMath math='v^2/a \le 1'/>; if <InlineMath math='v^2/a > 1'/> the trapezoid loses its flat top
                and degenerates into a triangular <strong>bang-bang</strong> profile that accelerates for the first
                half and decelerates for the second. Either way the acceleration is <strong>discontinuous</strong> at
                the switching instants — finite, but with infinite jerk at each corner. Slide <InlineMath math='v'/>{" "}
                in the trapezoidal figure to watch the coast phase widen, then collapse.
            </p>
            <p>
                The <strong>S-curve</strong> profile smooths those corners by inserting constant-<em>jerk</em> ramps,
                so the acceleration itself rises and falls linearly instead of stepping. This splits the motion into
                seven stages (jerk up, constant accel, jerk down, coast, and the mirror image while decelerating) and
                is the standard choice in motor control precisely because the bounded jerk avoids exciting vibration.
            </p>

            <h2>Via Point Trajectories</h2>
            <p>
                Sometimes the robot need not follow a prescribed path shape but must simply <strong>pass through</strong>{" "}
                a sequence of <strong>via points</strong> at specified times — for example to clear obstacles or touch
                a series of workpieces. Given <InlineMath math='k'/> via points at times{" "}
                <InlineMath math='T_1 = 0, \dots, T_k = T'/>, each with a position <InlineMath math='\beta_i'/> and a
                velocity <InlineMath math='\dot\beta_i'/>, one interpolates each joint history directly with a{" "}
                <strong>piecewise cubic</strong>. On segment <InlineMath math='j'/> of duration{" "}
                <InlineMath math='\Delta T_j = T_{j+1} - T_j'/>, with local time{" "}
                <InlineMath math='\Delta t \in [0, \Delta T_j]'/>,{" "}
                <InlineMath math='\beta(T_j + \Delta t) = a_{j0} + a_{j1}\Delta t + a_{j2}\Delta t^2 + a_{j3}\Delta t^3'/>{" "}
                where
            </p>
            <BlockMath math={`a_{j0} = \\beta_j, \\quad a_{j1} = \\dot\\beta_j, \\quad a_{j2} = \\frac{3\\beta_{j+1} - 3\\beta_j - 2\\dot\\beta_j\\Delta T_j - \\dot\\beta_{j+1}\\Delta T_j}{\\Delta T_j^{\\,2}}, \\quad a_{j3} = \\frac{2\\beta_j + (\\dot\\beta_j + \\dot\\beta_{j+1})\\Delta T_j - 2\\beta_{j+1}}{\\Delta T_j^{\\,3}}`}/>
            <p>
                Matching each segment's endpoint position and velocity makes the assembled trajectory continuous in
                both position and velocity at every via point, though <em>not</em> in acceleration — fifth-order
                segments would fix that at the cost of more coefficients. The interior via{" "}
                <strong>velocities</strong> are free parameters that shape the curve: reasonable choices round the
                corners smoothly, while setting the velocities to zero at just two endpoints reduces the whole thing
                to the straight-line cubic time scaling of the first section. Drag the sliders below to steer the two
                interior via velocities and watch the path bend to follow them.
            </p>
            <ViaPointTrajectory/>
        </>
    )
}

export default Chapter9
