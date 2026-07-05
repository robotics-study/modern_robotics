import Physics3DCanvas from "../../3d/Physics3DCanvas";
import CanvasFigure from "../../CanvasFigure";
import AxisTriad from "../../3d/AxisTriad";
import Label3D from "../../3d/Label3D";
import {Animation, Color3, Mesh, Quaternion, TransformNode, Vector3} from "@babylonjs/core";
import {useRef} from "react";
import {useScene} from "react-babylonjs";

const OMEGA_COLOR = new Color3(0.95, 0.65, 0.2);
const VEL_COLOR = new Color3(0.13, 0.83, 0.93);
const SIZE = 4;
// 방향만 쓰므로 크기는 1 로 둔다 (v = ω × r 의 방향 = 접선).
const OMEGA = new Vector3(0, 1, 0);

// 회전축이자 각속도 벡터 ω 를 +Y 를 따라 굵은 화살표로 그린다.
const OmegaArrow = () => (
    <>
        <cylinder name="omega-shaft" height={5} diameter={0.18} tessellation={16} position={new Vector3(0, 2.5, 0)}>
            <standardMaterial name="omega-shaft-mat" diffuseColor={OMEGA_COLOR} emissiveColor={OMEGA_COLOR.scale(0.4)}/>
        </cylinder>
        <cylinder name="omega-tip" height={1} diameterTop={0} diameterBottom={0.5} tessellation={16}
                  position={new Vector3(0, 5.5, 0)}>
            <standardMaterial name="omega-tip-mat" diffuseColor={OMEGA_COLOR} emissiveColor={OMEGA_COLOR.scale(0.4)}/>
        </cylinder>
    </>
);

// body 축 끝점이 그리는 원 (속도가 접선임을 보이기 위한 경로).
const CIRCLE = Array.from({length: 65}, (_, i) => {
    const a = (i / 64) * 2 * Math.PI;
    return new Vector3(SIZE * Math.cos(a), 0, SIZE * Math.sin(a));
});

// 고정 길이 속도 화살표(+Y 기준). 매 프레임 위치/방향만 갱신한다.
const VelocityArrow = ({name, onReady}: {name: string; onReady: (n: TransformNode) => void}) => (
    <transformNode name={name} onCreated={(n: TransformNode) => onReady(n)}>
        <cylinder name={`${name}-shaft`} height={1.5} diameter={0.14} tessellation={16} position={new Vector3(0, 0.75, 0)}>
            <standardMaterial name={`${name}-shaft-mat`} diffuseColor={VEL_COLOR} emissiveColor={VEL_COLOR.scale(0.4)}/>
        </cylinder>
        <cylinder name={`${name}-tip`} height={0.45} diameterTop={0} diameterBottom={0.38} tessellation={16}
                  position={new Vector3(0, 1.7, 0)}>
            <standardMaterial name={`${name}-tip-mat`} diffuseColor={VEL_COLOR} emissiveColor={VEL_COLOR.scale(0.4)}/>
        </cylinder>
    </transformNode>
);

// 화살표(+Y)를 위치 at 에 놓고 방향 v 를 향하게 회전. v 가 0 이면 숨긴다(축 위 점은 안 움직임).
const orientArrow = (node: TransformNode | null, at: Vector3, v: Vector3) => {
    if (!node) return;
    const len = v.length();
    if (len < 1e-3) {
        node.setEnabled(false);
        return;
    }
    node.setEnabled(true);
    node.position = at;
    const d = v.scale(1 / len);
    const axis = Vector3.Cross(Vector3.Up(), d);
    const s = axis.length();
    node.rotationQuaternion = s < 1e-6
        ? (d.y >= 0 ? Quaternion.Identity() : Quaternion.RotationAxis(Vector3.Forward(), Math.PI))
        : Quaternion.RotationAxis(axis.scale(1 / s), Math.acos(Math.min(1, Math.max(-1, Vector3.Dot(Vector3.Up(), d)))));
};

// 각속도의 핵심 직관: body 의 각 점 속도는 v = ω × r 로, 원 궤도의 접선이다.
// 회전하는 body 프레임의 x̂·ẑ 축 끝에 속도 화살표를 붙이고, 축(ω) 위의 ŷ 끝은 속도가 0 임을 대비한다.
const AngularVelocityScene = () => {
    const scene = useScene();
    const velXRef = useRef<TransformNode | null>(null);
    const velZRef = useRef<TransformNode | null>(null);
    const vLabelRef = useRef<Mesh | null>(null);

    return <>
        <OmegaArrow/>
        <lines name="tip-circle" points={CIRCLE} color={new Color3(0.4, 0.5, 0.62)}/>
        <VelocityArrow name="vel-x" onReady={(n) => {velXRef.current = n;}}/>
        <VelocityArrow name="vel-z" onReady={(n) => {velZRef.current = n;}}/>
        <Label3D text="ω" color="#f2a63a" position={new Vector3(0.7, 6.2, 0)} size={1.6}/>
        <Label3D text="v = ω × r" color="#3ad4ee" position={new Vector3(SIZE + 0.5, 1.6, 0)} size={1.7}
                 onReady={(m) => {vLabelRef.current = m;}}/>
        <AxisTriad name="rotating-body" size={SIZE} onReady={(node: TransformNode) => {
            const animation = new Animation(
                "spin", "rotation.y", 30,
                Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE,
            );
            animation.setKeys([{frame: 0, value: 0}, {frame: 300, value: 2 * Math.PI}]);
            node.animations = [animation];
            scene?.beginAnimation(node, 0, 300, true);

            scene?.onBeforeRenderObservable.add(() => {
                node.computeWorldMatrix(true);
                const wm = node.getWorldMatrix();
                const tipX = Vector3.TransformCoordinates(new Vector3(SIZE, 0, 0), wm);
                const tipZ = Vector3.TransformCoordinates(new Vector3(0, 0, SIZE), wm);
                orientArrow(velXRef.current, tipX, Vector3.Cross(OMEGA, tipX));
                orientArrow(velZRef.current, tipZ, Vector3.Cross(OMEGA, tipZ));
                // 라벨은 x̂ 끝 속도 화살표를 따라다닌다.
                if (vLabelRef.current) vLabelRef.current.position = tipX.add(new Vector3(0, 1.6, 0));
            });
        }}/>
    </>;
};

const RotatingFrame = () => {
    return <CanvasFigure label="angular velocity · v = ω × r at each point" className="w-full sm:w-2/3 mx-auto">
        <Physics3DCanvas
            className="aspect-square w-full rounded-lg"
            initialView={{radius: 24, at: {x: 9, y: 8, z: 11}, to: {x: 0, y: 2, z: 0}}}
            axis
            ground={{opacity: 0.6}}
        >
            <AngularVelocityScene/>
        </Physics3DCanvas>
    </CanvasFigure>;
};

export default RotatingFrame;
