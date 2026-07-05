import {Color3, TransformNode, Vector3} from "@babylonjs/core";
import {Fragment} from "react";

// body frame(움직이는 좌표계)을 화살표 3축으로 그린다. Physics3DCanvas 의 axis(고정 space frame)와
// 대비되도록 짧은 화살표 + emissive 로 렌더한다. onReady 로 노드를 넘겨 부모가 회전/이동/애니메이션을 건다.
interface AxisTriadProps {
    name: string;
    // 축 길이(홈 프레임 기준). 고정 축보다 짧게 잡아 화살표 끝이 보이게 한다.
    size?: number;
    radius?: number;
    onReady?: (node: TransformNode) => void;
}

// Babylon cylinder 기본 축은 +Y. 각 축은 회전으로 +Y 를 목표 방향에 맞추고, position 으로 축을 따라 민다.
const AXES = [
    {key: "x", color: new Color3(0.9, 0.25, 0.25), rotation: new Vector3(0, 0, -Math.PI / 2), dir: new Vector3(1, 0, 0)},
    {key: "y", color: new Color3(0.3, 0.8, 0.35), rotation: new Vector3(0, 0, 0), dir: new Vector3(0, 1, 0)},
    {key: "z", color: new Color3(0.3, 0.45, 0.95), rotation: new Vector3(Math.PI / 2, 0, 0), dir: new Vector3(0, 0, 1)},
] as const;

const AxisTriad = ({name, size = 5, radius = 0.12, onReady}: AxisTriadProps) => {
    const shaftLen = size * 0.82;
    const tipLen = size * 0.18;
    return (
        <transformNode name={name} onCreated={(node: TransformNode) => onReady?.(node)}>
            {AXES.map(({key, color, rotation, dir}) => (
                <Fragment key={key}>
                    <cylinder
                        name={`${name}-${key}-shaft`}
                        height={shaftLen}
                        diameter={radius * 2}
                        tessellation={16}
                        rotation={rotation}
                        position={dir.scale(shaftLen / 2)}
                    >
                        <standardMaterial name={`${name}-${key}-shaft-mat`} diffuseColor={color}
                                          emissiveColor={color.scale(0.4)}/>
                    </cylinder>
                    <cylinder
                        name={`${name}-${key}-tip`}
                        height={tipLen}
                        diameterTop={0}
                        diameterBottom={radius * 4}
                        tessellation={16}
                        rotation={rotation}
                        position={dir.scale(shaftLen + tipLen / 2)}
                    >
                        <standardMaterial name={`${name}-${key}-tip-mat`} diffuseColor={color}
                                          emissiveColor={color.scale(0.4)}/>
                    </cylinder>
                </Fragment>
            ))}
        </transformNode>
    );
};

export default AxisTriad;
