import {useEffect, useMemo, useRef, useState} from "react";
import Physics3DCanvas from "../../3d/Physics3DCanvas";
import CanvasFigure from "../../CanvasFigure";
import AxisTriad from "../../3d/AxisTriad";
import {Color3, Quaternion, TransformNode, Vector3} from "@babylonjs/core";

// 지수 좌표 R = e^[ω̂]θ 의 기하: 고정된 회전축 ω̂(주황 선) 둘레로 body frame 이 각 θ 만큼 돈다.
// 슬라이더로 θ 를 직접 돌려 축-각 파라미터가 회전을 어떻게 만드는지 본다.
const AXIS = new Vector3(0.35, 1, 0.3).normalize();

const RotationAxisLine = () => (
    <lines
        name="omega-axis"
        points={[AXIS.scale(-9), AXIS.scale(9)]}
        color={new Color3(0.95, 0.65, 0.2)}
    />
);

interface SceneProps {
    canvasClassName: string;
}

const ExpRotationScene = ({canvasClassName}: SceneProps) => {
    const [theta, setTheta] = useState(Math.PI / 2);
    const nodeRef = useRef<TransformNode | null>(null);
    const pose = useMemo(() => Quaternion.RotationAxis(AXIS, theta), [theta]);

    useEffect(() => {
        if (nodeRef.current) nodeRef.current.rotationQuaternion = pose;
    }, [pose]);

    return (
        <div className="flex flex-col gap-2 w-full">
            <Physics3DCanvas
                className={canvasClassName}
                initialView={{radius: 15, at: {x: 6, y: 6, z: 8}}}
                axis
                ground={{opacity: 0.6}}
            >
                <RotationAxisLine/>
                <AxisTriad name="exp-body" size={5} onReady={(node: TransformNode) => {
                    nodeRef.current = node;
                    node.rotationQuaternion = pose;
                }}/>
            </Physics3DCanvas>
            <div className="px-2 pb-1">
                <input
                    type="range"
                    min={0}
                    max={2 * Math.PI}
                    step={0.01}
                    value={theta}
                    onChange={(e) => setTheta(parseFloat(e.target.value))}
                    className="w-full accent-[var(--accent)]"
                    aria-label="rotation angle theta"
                />
                <div className="text-xs text-muted text-center">
                    θ = {theta.toFixed(2)} rad ({(theta * 180 / Math.PI).toFixed(0)}°) · ω̂ fixed
                </div>
            </div>
        </div>
    );
};

const ExponentialRotation = () => {
    return <CanvasFigure
        label="exponential coordinates · R = e^[ω̂]θ"
        className="w-full sm:w-2/3 mx-auto"
        bodyClassName="w-[min(80vmin,520px)]"
        modal={<ExpRotationScene canvasClassName="aspect-square w-full rounded-lg"/>}
    >
        <ExpRotationScene canvasClassName="aspect-square w-full rounded-lg"/>
    </CanvasFigure>;
};

export default ExponentialRotation;
