import {BlockMath, InlineMath} from "../../components/math/Tex";
import {resolvePath} from "../../libs/url";

const Chapter3 = () => {
    return (
        <>
            <h2>Rigid-Body Motion</h2>
            <p><strong>Definition</strong> : The special orthogonal group <InlineMath math='SO(3)'/>, also known as
                the group of rotation matrices, is the set
                of all 3 x 3 real matrices <InlineMath math='R'/> that satisfy the followings
            </p>
            <BlockMath math='R^TR=I \ \text{and}\ \det R = 1'/>
            <p><strong> Properties of rotation matrices</strong> : inverse, closure, associative, not commutative
            </p>
            <p><strong>Skew-symmetric matrices Definition</strong> : The set of all <InlineMath
                math='3 \times 3'/> real skew-symmetric matrices
                is called <InlineMath math='\mathfrak{so}(3)'/>.
            </p>
            <p><strong>Proposition</strong> : Given any <InlineMath math='\omega \in \mathbb{R}^3'/> and <InlineMath
                math='R \in SO(3)'/> the following always holds:
            </p>
            <BlockMath math='R[\omega]R^T = [R\omega]'/>

            <h2>Angular velocities</h2>
            <p><strong>Definition</strong> :</p>
            <img
                className="w-1/2 mx-auto rounded-lg border border-border"
                src={resolvePath("img/3_1.png")}
                alt="Angular velocity of a rotating frame"
                loading="lazy"
            />
            <p><strong>Angular velocity</strong> :</p>
            <BlockMath math='\omega = \hat{\omega}\dot{\theta}'/>
            <p><strong>Linear velocity</strong> :</p>
            <BlockMath math={`\\begin{gathered}
                            \\dot{\\hat{x}} = \\omega \\times \\hat{x} \\\\
                            \\dot{\\hat{y}} = \\omega \\times \\hat{y} \\\\
                            \\dot{\\hat{z}} = \\omega \\times \\hat{z}
                            \\end{gathered}`}/>
            <p><strong>Angular velocity in different frame</strong>:</p>
            <BlockMath
                math={`\\begin{gathered}
                    \\dot{R} =
                    \\begin{bmatrix}
                    \\omega_s \\times r_1, & \\omega_s \\times r_2, & \\omega_s \\times r_3
                    \\end{bmatrix} = \\omega_s \\times R \\\\[6pt]
                    [\\omega_s] R = \\dot{R} \\\\[6pt]
                    [\\omega_s] = \\dot{R} R^{-1} \\\\[6pt]
                    \\text{Let's write } R \\text{ explicitly as } R_{sb}. \\\\[6pt]
                    \\text{By our subscript cancellation rule, } \\omega_s = R_{sb} \\omega_b, \\text{ therefore} \\\\[6pt]
                    \\omega_b = R_{sb}^{-1} \\omega_s = R^{-1} \\omega_s = R^T \\omega_s
                    \\end{gathered}`}/>

            <BlockMath math={`[\\omega_b] = [R^T \\omega_s]
                    = R^T [\\omega_s] R
                    = R^T (\\dot{R} R^{-1}) R = R^T \\dot{R}
                    = R^{-1} \\dot{R} `}/>

            <p><strong> Properties</strong> : Let <InlineMath math='R(t)'/> denote the orientation of the rotating
                frame as seen from the fixed frame. Denote by <InlineMath math='\omega'/> the angular velocity of the
                rotating frame. Then
            </p>

            <h2>Exponential Coordinate Representation of Rotation</h2>
            <p><strong>Definition</strong> : The exponential coordinates parametrize
                a rotation matrix in terms of a rotation axis (represented by a unit vector <InlineMath
                    math='\hat{\omega}'/>)
                and an angle of rotation <InlineMath math='\theta'/> about that axis; the vector <InlineMath
                    math='\hat{\omega}\theta \in \mathbb{R}^3'/> then
                serves as the three-parameter exponential coordinate representation of the rotation.
            </p>
            <BlockMath math='R = e^{[\hat{\omega}]\theta}'/>

            <h2>Rigid-Body Motions and Twists</h2>
            <p><strong>Twist</strong> : the spatial velocity of a rigid body, stacking angular and linear velocity
                expressed in the body frame.
            </p>
            <BlockMath math='\mathcal{V}_b = \begin{bmatrix} \omega_b \\ v_b \end{bmatrix} \in \mathbb{R}^6'/>

            <h2>Homogeneous Transformation</h2>
            <p className="text-muted text-sm">🚧 Work in progress.</p>
        </>
    )
}

export default Chapter3
