import Physics3DCanvas from "../../3d/Physics3DCanvas";
import CanvasFigure from "../../CanvasFigure";
import AxisTriad from "../../3d/AxisTriad";
import {Animation, Color3, IAnimationKey, TransformNode, Vector3} from "@babylonjs/core";
import {useScene} from "react-babylonjs";

// 트위스트 V = S θ̇: 스크류 축 둘레의 나선 운동. body frame 이 축(수직 ŷ)을 돌면서 동시에 축을 따라
// 병진해 나선을 그린다 — 순수 회전(각속도)과 순수 병진이 결합된 rigid-body velocity.
const RADIUS = 4;
const TURNS = 2;
const RISE = 8;
const Y0 = -4;
const PHI_MAX = TURNS * 2 * Math.PI;
const TOTAL_FRAMES = 300;

const helixPoint = (phi: number) =>
    new Vector3(RADIUS * Math.cos(phi), Y0 + RISE * (phi / PHI_MAX), RADIUS * Math.sin(phi));

// 나선 궤적(정적 참조선)
const HELIX_TRACE = Array.from({length: 121}, (_, i) => helixPoint((i / 120) * PHI_MAX));

const ScrewFrame = () => {
    const scene = useScene();
    return <AxisTriad name="screw-body" size={3} onReady={(node: TransformNode) => {
        const positionKeys: IAnimationKey[] = [];
        const rotationKeys: IAnimationKey[] = [];
        const samples = 60;
        for (let i = 0; i <= samples; i++) {
            const phi = (i / samples) * PHI_MAX;
            const frame = (i / samples) * TOTAL_FRAMES;
            positionKeys.push({frame, value: helixPoint(phi)});
            rotationKeys.push({frame, value: phi});
        }
        const positionAnim = new Animation(
            "screw-pos", "position", 30,
            Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CYCLE,
        );
        positionAnim.setKeys(positionKeys);
        const rotationAnim = new Animation(
            "screw-rot", "rotation.y", 30,
            Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE,
        );
        rotationAnim.setKeys(rotationKeys);
        node.animations = [positionAnim, rotationAnim];
        scene?.beginAnimation(node, 0, TOTAL_FRAMES, true);
    }}/>;
};

const ScrewMotion = () => {
    return <CanvasFigure label="screw motion · twist about ŷ" className="w-full sm:w-2/3 mx-auto">
        <Physics3DCanvas
            className="aspect-square w-full rounded-lg"
            initialView={{radius: 20, at: {x: 8, y: 4, z: 10}}}
            axis
            ground={{opacity: 0.6}}
        >
            <lines name="helix-trace" points={HELIX_TRACE} color={new Color3(0.95, 0.65, 0.2)}/>
            <ScrewFrame/>
        </Physics3DCanvas>
    </CanvasFigure>;
};

export default ScrewMotion;
