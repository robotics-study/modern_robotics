import Physics3DCanvas from "../../3d/Physics3DCanvas";
import CanvasFigure from "../../CanvasFigure";
import AxisTriad from "../../3d/AxisTriad";
import {Color3, Quaternion, TransformNode, Vector3} from "@babylonjs/core";

// SE(3) 원소 T = (R, p): 고정 space frame {s}(원점) 대비 body frame {b} 가 방향 R 로 돌아가고
// 위치 p 만큼 떨어져 있다. 이동벡터 p 를 선으로, 끝점을 구로 표시한다. 드래그로 궤도 회전.
const P = new Vector3(5, 3, -3);
const R = Quaternion.RotationAxis(new Vector3(0.3, 1, 0.4).normalize(), 0.9);

const HomogeneousTransform = () => {
    return <CanvasFigure label="SE(3) · T = (R, p)" className="w-full sm:w-2/3 mx-auto">
        <Physics3DCanvas
            className="aspect-square w-full rounded-lg"
            initialView={{radius: 16, at: {x: 7, y: 6, z: 9}}}
            axis
            ground={{opacity: 0.6}}
        >
            {/* 원점에서 p 로 향하는 이동벡터 */}
            <lines name="p-vector" points={[Vector3.Zero(), P]} color={new Color3(0.6, 0.55, 0.95)}/>
            <sphere name="p-marker" diameter={0.5} position={P}>
                <standardMaterial name="p-marker-mat" diffuseColor={new Color3(0.6, 0.55, 0.95)}
                                  emissiveColor={new Color3(0.3, 0.28, 0.5)}/>
            </sphere>
            {/* p 에 놓인 body frame, 방향 R */}
            <AxisTriad name="se3-body" size={4} onReady={(node: TransformNode) => {
                node.position = P;
                node.rotationQuaternion = R;
            }}/>
        </Physics3DCanvas>
    </CanvasFigure>;
};

export default HomogeneousTransform;
