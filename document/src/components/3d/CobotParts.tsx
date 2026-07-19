import {Color3, Vector3} from "@babylonjs/core";

// 협동로봇 스타일 3D 부품 모음. UrdfRobot(4장)과 PUMA/Stanford(6장) 팔이 공유한다.
export const LINK_GRAY = new Color3(0.8, 0.81, 0.83);
export const HOUSING_DARK = new Color3(0.3, 0.31, 0.35);
export const RING_BLUE = new Color3(0.2, 0.5, 0.85);
export const RING_ORANGE = new Color3(0.95, 0.65, 0.2);
export const TOOL_RED = new Color3(0.85, 0.25, 0.22);

// 헤미스피어 라이트 하나뿐인 씬에서 그늘진 면이 죽지 않도록 약한 자체발광을 더한다.
export const Metal = ({name, color}: {name: string; color: Color3}) => (
    <standardMaterial name={`${name}-mat`} diffuseColor={color} emissiveColor={color.scale(0.28)}
                      specularColor={new Color3(0.35, 0.35, 0.38)} specularPower={48}/>
);

// 양 끝이 둥근 튜브(캡슐) 형태의 link 몸통. +Y 방향으로 length 만큼 뻗는다.
export const Tube = ({name, radius, length, position}: {
    name: string; radius: number; length: number; position: Vector3;
}) => (
    <transformNode name={`${name}-root`} position={position}>
        <cylinder name={`${name}-body`} diameter={radius * 2} height={length} tessellation={28}
                  position={new Vector3(0, length / 2, 0)}>
            <Metal name={`${name}-body`} color={LINK_GRAY}/>
        </cylinder>
        {[0, length].map((y) => (
            <sphere key={y} name={`${name}-cap-${y}`} diameter={radius * 2} segments={20}
                    position={new Vector3(0, y, 0)}>
                <Metal name={`${name}-cap-${y}`} color={LINK_GRAY}/>
            </sphere>
        ))}
    </transformNode>
);

// 관절 하우징: 회전축 방향으로 누운 어두운 원통 + 식별 링. vertical 이면 축이 +Y.
export const Housing = ({name, radius, width, vertical, ring = RING_BLUE}: {
    name: string; radius: number; width: number; vertical?: boolean; ring?: Color3;
}) => {
    const rot = vertical ? Vector3.Zero() : new Vector3(Math.PI / 2, 0, 0);
    return (
        <transformNode name={`${name}-root`}>
            <cylinder name={`${name}-body`} diameter={radius * 2} height={width} tessellation={28} rotation={rot}>
                <Metal name={`${name}-body`} color={HOUSING_DARK}/>
            </cylinder>
            <cylinder name={`${name}-ring`} diameter={radius * 2.04} height={width * 0.22}
                      tessellation={28} rotation={rot}>
                <standardMaterial name={`${name}-ring-mat`} diffuseColor={ring}
                                  emissiveColor={ring.scale(0.25)}/>
            </cylinder>
        </transformNode>
    );
};
