import {IChapterData} from "../../../types/global";

const Chapter3 = () => {
    return (
    <div>
            Rigid-Body Motion.
            
            <p>Definition : The special orthogonal group SO(3), also known as the group of rotation matrices, is the set of all 3 x 3 real matrices R that satisfy the followings
            </p>
            <BlockMath math='\R^TR=I and det R = 1'/>
            <p>Properties of rotation matrices : inverse, clousre, associative, not commutative
            </p>
            <p>Skew-symmetric matrices Definition : The set of all 3x3 real skew-symmetric matrices is calles so(3).
            </p>
            <p>Proposition : Given any 𝜔∈ℝ^3 and 𝑅∈𝑆𝑂(3) The following always holds:
            </p>
            <BlockMath math='\R[\omega]R^T = [R\omega]'/>
            <p>Angular velocities
            </p>
            <p>Exponential Coordinate Representation of Rotation
            </p>
            <p>Rigid-Body Motions and Twists | Homogeneous Transformation
            </p>
        </div>
    )
}
export default {
    title: "Rigid-Body Motions in the Plane",
    chapter: 3,
    contents: Chapter3,
    supportedExample: {
        "c++": true
    }
} as IChapterData
