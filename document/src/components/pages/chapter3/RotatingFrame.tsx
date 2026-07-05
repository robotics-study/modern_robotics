import Physics3DCanvas from "../../3d/Physics3DCanvas";
import CanvasFigure from "../../CanvasFigure";
import AxisTriad from "../../3d/AxisTriad";
import {Animation, TransformNode} from "@babylonjs/core";
import {useScene} from "react-babylonjs";

// body frame {b} 가 고정 space frame {s} 대비 각속도 ω 로 연속 회전한다 (ω = ω̂ θ̇, 여기선 ω̂ = ŷ).
const SpinningTriad = () => {
    const scene = useScene();
    return <AxisTriad name="rotating-body" size={5} onReady={(node: TransformNode) => {
        const animation = new Animation(
            "spin", "rotation.y", 30,
            Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE,
        );
        animation.setKeys([
            {frame: 0, value: 0},
            {frame: 240, value: 2 * Math.PI},
        ]);
        node.animations = [animation];
        scene?.beginAnimation(node, 0, 240, true);
    }}/>;
};

const RotatingFrame = () => {
    return <CanvasFigure label="rotating frame · ω about ŷ" className="w-full sm:w-2/3 mx-auto">
        <Physics3DCanvas
            className="aspect-square w-full rounded-lg"
            initialView={{radius: 16, at: {x: 6, y: 6, z: 8}}}
            axis
            ground={{opacity: 0.6}}
        >
            <SpinningTriad/>
        </Physics3DCanvas>
    </CanvasFigure>;
};

export default RotatingFrame;
