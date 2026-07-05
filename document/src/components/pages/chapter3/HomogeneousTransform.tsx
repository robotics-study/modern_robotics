import Physics3DCanvas from "../../3d/Physics3DCanvas";
import CanvasFigure from "../../CanvasFigure";
import AxisTriad from "../../3d/AxisTriad";
import Label3D from "../../3d/Label3D";
import {Animation, Color3, IAnimationKey, LinesMesh, Mesh, MeshBuilder, StandardMaterial, TransformNode, Vector3} from "@babylonjs/core";
import {useRef} from "react";
import {useScene} from "react-babylonjs";

// SE(3) 원소 T = (R, p): body frame {b} 가 방향 R 로 돌면서 위치 p 로 이동하는 강체 운동.
// 프레임이 매 프레임 (R,p) 를 지나가고, 원점→p 이동벡터가 이를 따라간다.
const P_COLOR = new Color3(0.6, 0.55, 0.95);
const TOTAL_FRAMES = 300;

// 이동 경로의 양 끝점 (position 애니메이션 왕복).
const P_A = new Vector3(4.5, 2, -3);
const P_B = new Vector3(-2.5, 5, 2.5);

const MovingFrame = () => {
    const scene = useScene();
    const markerRef = useRef<Mesh | null>(null);
    const labelRef = useRef<Mesh | null>(null);

    return <>
        {/* body frame 원점 표식 (프레임과 함께 움직인다) */}
        <sphere name="p-marker" diameter={0.55} onCreated={(mesh: Mesh) => {
            const mat = new StandardMaterial("p-marker-mat", mesh.getScene());
            mat.diffuseColor = P_COLOR;
            mat.emissiveColor = P_COLOR.scale(0.4);
            mesh.material = mat;
            markerRef.current = mesh;
        }}/>
        <Label3D text="p" color="#a99cf5" position={P_A} size={1.5} onReady={(m) => {labelRef.current = m;}}/>
        <AxisTriad name="se3-body" size={3.5} onReady={(node: TransformNode) => {
            if (!scene) return;
            const positionAnim = new Animation(
                "se3-pos", "position", 30,
                Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CYCLE,
            );
            const positionKeys: IAnimationKey[] = [
                {frame: 0, value: P_A},
                {frame: TOTAL_FRAMES / 2, value: P_B},
                {frame: TOTAL_FRAMES, value: P_A},
            ];
            positionAnim.setKeys(positionKeys);
            const rotationAnim = new Animation(
                "se3-rot", "rotation.y", 30,
                Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE,
            );
            rotationAnim.setKeys([
                {frame: 0, value: 0},
                {frame: TOTAL_FRAMES, value: 2 * Math.PI},
            ]);
            node.animations = [positionAnim, rotationAnim];
            scene.beginAnimation(node, 0, TOTAL_FRAMES, true);

            // 원점→p 이동벡터. updatable 로 만들어 매 프레임 끝점을 프레임 위치에 맞춘다.
            let line: LinesMesh = MeshBuilder.CreateLines(
                "p-vector", {points: [Vector3.Zero(), node.position], updatable: true}, scene);
            line.color = P_COLOR;
            scene.onBeforeRenderObservable.add(() => {
                line = MeshBuilder.CreateLines(
                    "p-vector", {points: [Vector3.Zero(), node.position], instance: line}, scene);
                if (markerRef.current) markerRef.current.position = node.position;
                if (labelRef.current) labelRef.current.position = node.position.add(new Vector3(0, 1.1, 0));
            });
        }}/>
    </>;
};

const HomogeneousTransform = () => {
    return <CanvasFigure label="SE(3) · T = (R, p)" className="w-full sm:w-2/3 mx-auto">
        <Physics3DCanvas
            className="aspect-square w-full rounded-lg"
            initialView={{radius: 18, at: {x: 8, y: 7, z: 10}, to: {x: 0, y: 2, z: 0}}}
            axis
            ground={{opacity: 0.6}}
        >
            <MovingFrame/>
        </Physics3DCanvas>
    </CanvasFigure>;
};

export default HomogeneousTransform;
