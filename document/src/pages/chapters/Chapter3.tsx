import {IChapterData} from "../../../types/global";
import {BlockMath, InlineMath} from "react-katex";

const Chapter3 = () => {
    return (
        <>
            <p className="text-lg border-b text-orange-700">
                <strong>Rigid-Body Motion.</strong>
            </p>
            <div className="p-2">
                <p><strong>Definition</strong> : The special orthogonal group <InlineMath math='SO(3)'/>, also known as
                    the group of rotation
                    matrices, is the
                    set
                    of all 3 x 3 real matrices <InlineMath math='R'/> that satisfy the followings
                </p>
                <BlockMath math='\R^TR=I \ and\  \text{det} R = 1'/>
                <p><strong> Properties of rotation matrices</strong> : inverse, clousre, associative, not commutative
                </p>
                <p><strong>Skew-symmetric matrices Definition</strong> : The set of all <InlineMath
                    math='3 \times 3'/> real skew-symmetric matrices
                    is called <InlineMath math='SO(3)'/>.
                </p>
                <p><strong>Proposition</strong> : Given any <InlineMath math='\omega \in \R^3'/> and <InlineMath
                    math='\R \in SO(3)'/> The following always holds:
                </p>
                <BlockMath math='\R[\omega]R^T = [R\omega]'/>
            </div>
            <p className="text-lg border-b text-orange-700">
                <strong>Angular velocities.</strong>
            </p>
            <div className="p-2">
                <p><strong>Definition</strong> : [fig1]
                </p>
                <BlockMath math='\R^TR=I \ and\  \text{det} R = 1'/>
                <p><strong> Properties</strong> : Let <InlineMath math='R(t)'/> denote the orientation of the rotating
                    frame as seen from the fixed frame. Denote by w the angular velocity of the rotating frame . Then
                </p>
            </div>
            <p className="text-lg border-b text-orange-700">
                <strong>Exponential Coordinate Representation of Rotation.</strong>
            </p>
            <div className="p-2">
                <p><strong>Definition</strong> : The exponential coordinates parametrize
                    a rotation matrix in terms of a rotation axis (represented by a unit vector ˆω)
                    and an angle of rotation θ about that axis; the vector <InlineMath math='ωθ ∈ \mathbb{R}^3'/>
                    then serves as the three-parameter exponential coordinate representation of the rotation
                </p>
                <BlockMath math='\R^TR=I \ and\  \text{det} R = 1'/>
                <p><strong> Properties</strong> : Let <InlineMath math='R(t)'/> denote the orientation of the rotating
                    frame as seen from the fixed frame. Denote by w the angular velocity of the rotating frame . Then
                </p>
            </div>
            <p className="text-lg border-b text-orange-700">
                <strong>Rigid-Body Motions and Twists.</strong>
            </p>
            <p className="text-lg border-b text-orange-700">
                <strong>Homogeneous Transformation.</strong>
            </p>
            <img
                className="w-1/2"
                src={"./img_example.png"}
                alt={"예시 이미지"}
                loading="lazy"
            />
            <img
                className="w-1/3"
                src={"https://img.freepik.com/free-vector/vintage-robot-toy-white-background_1308-77501.jpg?semt=ais_incoming"}
                alt={"예시 이미지"}
                loading="lazy"
            />
        </>
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
