import Physics3DCanvas from "../../3d/Physics3DCanvas";
import CanvasFigure from "../../CanvasFigure";
import {Animation, Color3, IAnimationKey, TransformNode, Vector3} from "@babylonjs/core";
import {useScene} from "react-babylonjs";
import {ReactNode} from "react";
import {InlineMath} from "../../math/Tex";
import CodeFigure from "../../CodeFigure";
import {T, useTr} from "../../../libs/i18n";

// URDF 가 기술하는 것: link(질량·형상) 들이 joint(타입·축·부모/자식) 로 이어진 트리.
// base → joint → link 를 3단 중첩 부모관계로 세우고 관절을 회전시켜 정방향 기구학을 보인다.
// 산업용 협동로봇 스타일로 렌더한다: 밝은 회색 튜브 = link, 파란 링을 두른 어두운 하우징 = joint.
const LINK_GRAY = new Color3(0.8, 0.81, 0.83);
const HOUSING_DARK = new Color3(0.3, 0.31, 0.35);
const RING_BLUE = new Color3(0.2, 0.5, 0.85);
const TOOL_RED = new Color3(0.85, 0.25, 0.22);

const oscillation = (property: "rotation.y" | "rotation.z", amplitude: number): Animation => {
    const anim = new Animation("joint", property, 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
    const keys: IAnimationKey[] = [
        {frame: 0, value: 0},
        {frame: 60, value: amplitude},
        {frame: 120, value: 0},
        {frame: 180, value: -amplitude},
        {frame: 240, value: 0},
    ];
    anim.setKeys(keys);
    return anim;
};

// 헤미스피어 라이트 하나뿐인 씬에서 그늘진 면이 죽지 않도록 약한 자체발광을 더한다.
const Metal = ({name, color}: {name: string; color: Color3}) => (
    <standardMaterial name={`${name}-mat`} diffuseColor={color} emissiveColor={color.scale(0.28)}
                      specularColor={new Color3(0.35, 0.35, 0.38)} specularPower={48}/>
);

// 양 끝이 둥근 튜브(캡슐) — link 몸통. +Y 방향으로 length 만큼 뻗는다.
const Tube = ({name, radius, length, position}: {name: string; radius: number; length: number; position: Vector3}) => (
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

// 평행 그리퍼 손가락: 안팎으로 여닫는 왕복 애니메이션 (URDF 라면 prismatic joint 로 기술될 부분).
const fingerStroke = (side: number, open: number, closed: number): Animation => {
    const anim = new Animation("finger", "position.x", 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
    anim.setKeys([
        {frame: 0, value: side * open},
        {frame: 55, value: side * closed},
        {frame: 120, value: side * closed},
        {frame: 175, value: side * open},
        {frame: 240, value: side * open},
    ]);
    return anim;
};

const Gripper = () => {
    const scene = useScene();
    return (
        <transformNode name="gripper" position={new Vector3(0, 0.8, 0)}>
            {/* 손바닥 */}
            <box name="palm" width={0.78} height={0.3} depth={0.5} position={new Vector3(0, 0.15, 0)}>
                <Metal name="palm" color={HOUSING_DARK}/>
            </box>
            {/* 손가락 두 개 (여닫이) */}
            {[-1, 1].map((s) => (
                <box key={s} name={`finger${s}`} width={0.13} height={0.66} depth={0.3}
                     position={new Vector3(s * 0.31, 0.63, 0)}
                     onCreated={(node) => {
                         node.animations = [fingerStroke(s, 0.31, 0.17)];
                         scene?.beginAnimation(node, 0, 240, true);
                     }}>
                    <Metal name={`finger${s}`} color={LINK_GRAY}/>
                </box>
            ))}
            {/* 쥐고 있는 물체 — end-effector 프레임의 시각적 기준점 */}
            <sphere name="ee" diameter={0.3} position={new Vector3(0, 0.72, 0)}>
                <standardMaterial name="ee-mat" diffuseColor={TOOL_RED}
                                  emissiveColor={TOOL_RED.scale(0.35)}/>
            </sphere>
        </transformNode>
    );
};

// 관절 하우징: 회전축 방향으로 누운 어두운 원통 + 파란 식별 링. vertical 이면 축이 +Y.
const Housing = ({name, radius, width, vertical}: {name: string; radius: number; width: number; vertical?: boolean}) => {
    const rot = vertical ? Vector3.Zero() : new Vector3(Math.PI / 2, 0, 0);
    return (
        <transformNode name={`${name}-root`}>
            <cylinder name={`${name}-body`} diameter={radius * 2} height={width} tessellation={28} rotation={rot}>
                <Metal name={`${name}-body`} color={HOUSING_DARK}/>
            </cylinder>
            <cylinder name={`${name}-ring`} diameter={radius * 2.04} height={width * 0.22}
                      tessellation={28} rotation={rot}>
                <standardMaterial name={`${name}-ring-mat`} diffuseColor={RING_BLUE}
                                  emissiveColor={RING_BLUE.scale(0.25)}/>
            </cylinder>
        </transformNode>
    );
};

interface JointProps {
    name: string;
    property: "rotation.y" | "rotation.z";
    amplitude: number;
    children?: ReactNode;
}

// joint 회전 노드: URDF 의 axis 대로 진동 애니메이션을 건다. 시각 하우징은 자식으로 배치.
const Joint = ({name, property, amplitude, children}: JointProps) => {
    const scene = useScene();
    return (
        <transformNode name={name} onCreated={(node: TransformNode) => {
            node.animations = [oscillation(property, amplitude)];
            scene?.beginAnimation(node, 0, 240, true);
        }}>
            {children}
        </transformNode>
    );
};

// 3관절 협동로봇 팔: 받침대 → J1(요) → 어깨 J2(피치) → 상완 → 팔꿈치 J3(피치) → 전완 →
// 손목 뭉치(마지막 link 에 고정된 플랜지)와 공구 표식.
const Arm = () => (
    <>
        {/* 바닥 받침대 (base_link) */}
        <cylinder name="pedestal" diameter={2.3} height={0.4} tessellation={32}
                  position={new Vector3(0, 0.2, 0)}>
            <Metal name="pedestal" color={HOUSING_DARK}/>
        </cylinder>
        <transformNode name="j1-origin" position={new Vector3(0, 0.4, 0)}>
            <Joint name="joint1" property="rotation.y" amplitude={0.6}>
                {/* J1 하우징(수직 축) + 몸통 기둥 */}
                <transformNode name="j1-housing" position={new Vector3(0, 0.55, 0)}>
                    <Housing name="j1" radius={0.66} width={1.1} vertical/>
                </transformNode>
                <transformNode name="j2-origin" position={new Vector3(0, 1.35, 0)}>
                    <Housing name="j2" radius={0.6} width={1.35}/>
                    <Joint name="joint2" property="rotation.z" amplitude={-0.65}>
                        {/* 상완: 어깨에서 옆으로 살짝 비켜 뻗는다 (협동로봇 특유의 오프셋) */}
                        <Tube name="upperarm" radius={0.42} length={3.1} position={new Vector3(0, 0, 0.62)}/>
                        <transformNode name="j3-origin" position={new Vector3(0, 3.1, 0.62)}>
                            <Housing name="j3" radius={0.5} width={1.05}/>
                            <Joint name="joint3" property="rotation.z" amplitude={0.8}>
                                {/* 전완: 안쪽으로 되돌아오며 가늘어진다 */}
                                <Tube name="forearm" radius={0.34} length={2.6} position={new Vector3(0, 0, -0.3)}/>
                                {/* 손목 뭉치 + 플랜지 + 그리퍼 (마지막 link 에 고정) */}
                                <transformNode name="wrist" position={new Vector3(0, 2.6, -0.3)}>
                                    <Housing name="wrist1" radius={0.36} width={0.8}/>
                                    <cylinder name="flange" diameter={0.54} height={0.5} tessellation={24}
                                              position={new Vector3(0, 0.55, 0)}>
                                        <Metal name="flange" color={LINK_GRAY}/>
                                    </cylinder>
                                    <Gripper/>
                                </transformNode>
                            </Joint>
                        </transformNode>
                    </Joint>
                </transformNode>
            </Joint>
        </transformNode>
    </>
);

// 시각화된 3-링크 팔에 대응하는 xacro. property/macro 로 링크를 재사용하고, 각 joint 가
// parent/child·axis·origin(링크 간 변환)을 명시하는 URDF 트리 구조를 보인다. (\${...} 는 xacro 식)
const XACRO = `<?xml version="1.0"?>
<robot name="arm3" xmlns:xacro="http://ros.org/wiki/xacro">
  <!-- one place to tune the chain -->
  <xacro:property name="l1" value="3.0"/>
  <xacro:property name="l2" value="2.5"/>
  <xacro:property name="l3" value="1.8"/>

  <!-- reusable link: a bar of length L along +Z -->
  <xacro:macro name="bar_link" params="name length">
    <link name="\${name}">
      <visual>
        <origin xyz="0 0 \${length/2}"/>
        <geometry><box size="0.7 0.7 \${length}"/></geometry>
      </visual>
      <inertial>
        <mass value="1.0"/>
        <inertia ixx="0.1" iyy="0.1" izz="0.1" ixy="0" ixz="0" iyz="0"/>
      </inertial>
    </link>
  </xacro:macro>

  <link name="base_link"/>
  <xacro:bar_link name="link1" length="\${l1}"/>
  <xacro:bar_link name="link2" length="\${l2}"/>
  <xacro:bar_link name="link3" length="\${l3}"/>

  <joint name="joint1" type="revolute">
    <parent link="base_link"/>  <child link="link1"/>
    <axis xyz="0 0 1"/>  <origin xyz="0 0 0"/>
    <limit lower="-3.14" upper="3.14" effort="10" velocity="2"/>
  </joint>
  <joint name="joint2" type="revolute">
    <parent link="link1"/>  <child link="link2"/>
    <axis xyz="0 1 0"/>  <origin xyz="0 0 \${l1}"/>
    <limit lower="-3.14" upper="3.14" effort="10" velocity="2"/>
  </joint>
  <joint name="joint3" type="revolute">
    <parent link="link2"/>  <child link="link3"/>
    <axis xyz="0 1 0"/>  <origin xyz="0 0 \${l2}"/>
    <limit lower="-3.14" upper="3.14" effort="10" velocity="2"/>
  </joint>
</robot>`;

// 코드블록 아래 각주: xacro/URDF 핵심 요소가 무엇을 하는지 매핑한다.
const NOTES: {tag: string; body: ReactNode}[] = [
    {
        tag: "xacro:property",
        body: <T
            en={<>named constants for the chain's dimensions, referenced as <code>${"{l1}"}</code>.</>}
            ko={<>체인 치수를 위한 이름 붙은 상수들로, <code>${"{l1}"}</code> 처럼 참조된다.</>}
        />,
    },
    {
        tag: "xacro:macro",
        body: <T
            en={<>a parameterized, reusable block: <code>bar_link</code> stamps out all three links from one definition instead of repeating them.</>}
            ko={<>매개변수화된 재사용 블록. <code>bar_link</code> 가 반복 없이 하나의 정의로 세 링크를 모두 찍어낸다.</>}
        />,
    },
    {
        tag: "link",
        body: <T
            en={<>a rigid body: <code>visual</code> geometry plus <code>inertial</code> mass and inertia.</>}
            ko={<>강체: <code>visual</code> 형상과 <code>inertial</code> 질량·관성.</>}
        />,
    },
    {
        tag: "joint type=\"revolute\"",
        body: <T
            en={<>a rotating joint. <code>parent</code>→<code>child</code> builds the tree, <code>axis</code> is
                the rotation axis, <code>origin</code> is the fixed transform to the parent link (the{" "}
                <InlineMath math='T_{i-1,i}'/> forward kinematics multiplies), and <code>limit</code> bounds its
                travel.</>}
            ko={<>Revolute Joint. <code>parent</code>→<code>child</code> 가 트리를 세우고, <code>axis</code> 는
                회전 축, <code>origin</code> 은 부모 링크로의 고정 변환(Forward Kinematics가 곱하는{" "}
                <InlineMath math='T_{i-1,i}'/>), <code>limit</code> 은 그 가동 범위를 제한한다.</>}
        />,
    },
    {
        tag: "build",
        body: <T
            en={<>at build time xacro expands every property and macro into plain URDF.</>}
            ko={<>빌드 시점에 xacro 가 모든 property 와 macro 를 순수 URDF 로 전개한다.</>}
        />,
    },
];

const UrdfRobot = () => {
    const t = useTr();
    return <div className="my-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-stretch">
            <div className="lg:w-1/2 flex">
                <CanvasFigure label={t("serial-chain robot · links + joints", "Serial Chain 로봇 · 링크 + 관절")} className="w-full">
                    <Physics3DCanvas
                        className="aspect-square w-full rounded-lg"
                        initialView={{radius: 16, at: {x: 8, y: 7, z: 9}, to: {x: 0, y: 4.2, z: 0}}}
                        axis
                        ground={{opacity: 0.6}}
                    >
                        <Arm/>
                    </Physics3DCanvas>
                </CanvasFigure>
            </div>
            <div className="lg:w-1/2 min-w-0 flex">
                <CodeFigure code={XACRO} label="arm3.urdf.xacro" className="w-full"
                            codeClassName="max-h-[440px] overflow-auto text-xs"/>
            </div>
        </div>
        <dl className="mt-3 text-sm text-muted border border-border rounded-lg p-4 space-y-1.5">
            {NOTES.map(({tag, body}) => (
                <div key={tag} className="flex flex-col sm:flex-row sm:gap-2">
                    <dt className="shrink-0"><code>{tag}</code></dt>
                    <dd>{body}</dd>
                </div>
            ))}
        </dl>
    </div>;
};

export default UrdfRobot;
