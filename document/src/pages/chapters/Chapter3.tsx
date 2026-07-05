import {BlockMath, InlineMath} from "../../components/math/Tex";
import {resolvePath} from "../../libs/url";
import RotatingFrame from "../../components/pages/chapter3/RotatingFrame";
import ExponentialRotation from "../../components/pages/chapter3/ExponentialRotation";
import HomogeneousTransform from "../../components/pages/chapter3/HomogeneousTransform";
import ScrewMotion from "../../components/pages/chapter3/ScrewMotion";

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
            <p>
                The body frame <InlineMath math='\{b\}'/> spins relative to the fixed frame{" "}
                <InlineMath math='\{s\}'/> at angular velocity <InlineMath math='\omega'/> — a direction{" "}
                <InlineMath math='\hat{\omega}'/> (here the vertical axis) and a rate{" "}
                <InlineMath math='\dot{\theta}'/>. Drag to orbit and watch the moving axes.
            </p>
            <RotatingFrame/>
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
            <p>
                Drag the slider to sweep the angle <InlineMath math='\theta'/> about a fixed axis{" "}
                <InlineMath math='\hat{\omega}'/> (orange). The body frame traces the one-parameter family of
                rotations <InlineMath math='e^{[\hat{\omega}]\theta}'/>; at <InlineMath math='\theta = 0'/> it
                coincides with the fixed frame.
            </p>
            <ExponentialRotation/>

            <h2>Homogeneous Transformation</h2>
            <p><strong>Definition</strong> : The special Euclidean group <InlineMath math='SE(3)'/>, also known as
                the group of rigid-body motions or homogeneous transformation matrices in <InlineMath
                    math='\mathbb{R}^3'/>, is the set of all <InlineMath math='4 \times 4'/> real matrices <InlineMath
                    math='T'/> of the form
            </p>
            <BlockMath math={`T = \\begin{bmatrix} R & p \\\\ 0 & 1 \\end{bmatrix}, \\quad R \\in SO(3), \\ p \\in \\mathbb{R}^3`}/>
            <p>
                The rotation <InlineMath math='R'/> carries the orientation of the body frame and the vector{" "}
                <InlineMath math='p'/> its origin, packaged into one matrix so a single object represents both
                position and orientation. An element is sometimes written <InlineMath math='T = (R, p)'/>.
            </p>
            <p>
                Below, the body frame sits at position <InlineMath math='p'/> (violet vector from the origin)
                with orientation <InlineMath math='R'/> — a single <InlineMath math='T'/> capturing both. Drag to
                orbit.
            </p>
            <HomogeneousTransform/>
            <p><strong>Inverse</strong> : the inverse of a transformation is itself a transformation,</p>
            <BlockMath math={`T^{-1} = \\begin{bmatrix} R^T & -R^T p \\\\ 0 & 1 \\end{bmatrix}`}/>
            <p><strong>Properties</strong> : closure, associative, not commutative, and identity{" "}
                <InlineMath math='T T^{-1} = T^{-1} T = I'/>.
            </p>
            <p><strong>Uses</strong> : a transformation is used to (1) represent the configuration of a rigid
                body, (2) change the reference frame in which a vector or frame is expressed, and (3) displace a
                vector or frame. Homogeneous coordinates append a 1 to a point, <InlineMath
                    math='\tilde{p} = (p, 1)'/>, so that <InlineMath math='T \tilde{p}'/> applies the rotation and
                translation together, and the subscript-cancellation rule <InlineMath
                    math='T_{ac} = T_{ab} T_{bc}'/> composes motions.
            </p>

            <h2>Rigid-Body Motions and Twists</h2>
            <p><strong>Twist</strong> : the spatial velocity of a rigid body, stacking its angular and linear
                velocity into a single six-vector. Expressed in the body frame it is
            </p>
            <BlockMath math='\mathcal{V}_b = \begin{bmatrix} \omega_b \\ v_b \end{bmatrix} \in \mathbb{R}^6'/>
            <p>
                and in the fixed (space) frame it is <InlineMath math='\mathcal{V}_s'/>. Just as{" "}
                <InlineMath math='[\omega_b] = R^{-1}\dot{R}'/> gives the body angular velocity, the body twist
                comes from <InlineMath math='[\mathcal{V}_b] = T^{-1}\dot{T}'/>, and the two frames are related by
                the adjoint map <InlineMath math='\mathcal{V}_s = [\mathrm{Ad}_{T_{sb}}]\,\mathcal{V}_b'/>. Any
                twist is the scaled screw axis <InlineMath math='\mathcal{V} = \mathcal{S}\dot{\theta}'/>, the
                geometric picture behind the exponential coordinates of rigid-body motion.
            </p>
            <p>
                A screw axis combines rotation about a line with translation along it. The body frame below turns
                about the vertical axis while advancing along it, tracing the helix (orange) that a constant twist
                produces.
            </p>
            <ScrewMotion/>
        </>
    )
}

export default Chapter3
