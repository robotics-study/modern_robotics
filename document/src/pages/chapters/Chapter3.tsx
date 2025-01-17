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
                <BlockMath math='\R^TR=I and det R = 1'/>
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
                <p>Exponential Coordinate Representation of Rotation
                </p>
                <p>Rigid-Body Motions and Twists | Homogeneous Transformation
                </p>
            </div>
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
