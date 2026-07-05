import {BlockMath, InlineMath} from "../../components/math/Tex";

const Chapter4 = () => {
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
            <p><strong>Definition</strong> : [fig1]</p>
            <BlockMath math='[\omega_s] = \dot{R} R^{-1}'/>
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
            <p className="text-muted text-sm">🚧 Work in progress.</p>

            <h2>Homogeneous Transformation</h2>
            <p className="text-muted text-sm">🚧 Work in progress.</p>
        </>
    )
}

export default Chapter4
