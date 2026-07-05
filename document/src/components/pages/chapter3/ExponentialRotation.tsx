import {useEffect, useMemo, useRef, useState} from "react";
import Physics3DCanvas from "../../3d/Physics3DCanvas";
import CanvasFigure from "../../CanvasFigure";
import AxisTriad from "../../3d/AxisTriad";
import Label3D from "../../3d/Label3D";
import {Color3, Quaternion, TransformNode, Vector3} from "@babylonjs/core";

// 지수 좌표 R = e^[ω̂]θ 의 기하: 고정된 회전축 ω̂(주황 막대) 둘레로 body frame 이 각 θ 만큼 돈다.
// 슬라이더로 θ 를 직접 돌려 축-각 파라미터가 회전을 어떻게 만드는지 본다.
// y 축과 확실히 구분되도록 뚜렷하게 기울인다.
const AXIS = new Vector3(0.55, 0.7, 0.45).normalize();
const AXIS_COLOR = new Color3(0.95, 0.65, 0.2);
// 기본 +Y 실린더를 ω̂ 방향으로 회전시키는 쿼터니언.
const AXIS_QUAT = Quaternion.RotationAxis(
    Vector3.Cross(Vector3.Up(), AXIS).normalize(),
    Math.acos(Vector3.Dot(Vector3.Up(), AXIS)),
);

// 회전축을 얇은 선 대신 굵은 막대 + 화살촉으로 그려 한눈에 보이게 한다.
const RotationAxisRod = () => (
    <>
        <cylinder name="omega-rod" height={17} diameter={0.16} tessellation={16} rotationQuaternion={AXIS_QUAT}>
            <standardMaterial name="omega-rod-mat" diffuseColor={AXIS_COLOR} emissiveColor={AXIS_COLOR.scale(0.4)}/>
        </cylinder>
        <cylinder name="omega-rod-tip" height={1} diameterTop={0} diameterBottom={0.5} tessellation={16}
                  rotationQuaternion={AXIS_QUAT} position={AXIS.scale(8.5)}>
            <standardMaterial name="omega-rod-tip-mat" diffuseColor={AXIS_COLOR} emissiveColor={AXIS_COLOR.scale(0.4)}/>
        </cylinder>
    </>
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
                initialView={{radius: 24, at: {x: 9, y: 8, z: 11}, to: {x: 0, y: 1, z: 0}}}
                axis
                ground={{opacity: 0.6}}
            >
                <RotationAxisRod/>
                <Label3D text="ω̂" color="#f2a63a" position={AXIS.scale(9.4)} size={1.7}/>
                <Label3D text={`θ = ${(theta * 180 / Math.PI).toFixed(0)}°`} color="#e8ecf7"
                         position={new Vector3(0, 8, 0)} size={2}/>
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
