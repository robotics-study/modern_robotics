import Physics3DCanvas from "../../3d/Physics3DCanvas";
import CanvasFigure from "../../CanvasFigure";
import {Animation, Color3, IAnimationKey, TransformNode, Vector3} from "@babylonjs/core";
import {useScene} from "react-babylonjs";
import {ReactNode} from "react";
import {InlineMath} from "../../math/Tex";
import XmlCode from "../../XmlCode";

// URDF 가 기술하는 것: link(질량·형상) 들이 joint(타입·축·부모/자식) 로 이어진 트리.
// 여기선 base → joint → link 를 3단 중첩 부모관계로 세우고 관절을 회전시켜 정방향 기구학을 보인다.
const LINK_COLORS = [new Color3(0.39, 0.4, 0.95), new Color3(0.13, 0.7, 0.85), new Color3(0.6, 0.4, 0.9)];
const JOINT_COLOR = new Color3(0.95, 0.65, 0.2);

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

interface JointProps {
    name: string;
    property: "rotation.y" | "rotation.z";
    amplitude: number;
    linkIndex: number;
    length: number;
    children?: ReactNode;
}

// joint(회전 노드) + 그 자식 link(box). link 끝(+Y)에 다음 joint 를 자식으로 매단다.
const Joint = ({name, property, amplitude, linkIndex, length, children}: JointProps) => {
    const scene = useScene();
    return (
        <transformNode name={name} onCreated={(node: TransformNode) => {
            node.animations = [oscillation(property, amplitude)];
            scene?.beginAnimation(node, 0, 240, true);
        }}>
            {/* joint 표식 */}
            <sphere name={`${name}-marker`} diameter={0.9}>
                <standardMaterial name={`${name}-marker-mat`} diffuseColor={JOINT_COLOR}
                                  emissiveColor={JOINT_COLOR.scale(0.3)}/>
            </sphere>
            {/* link geometry */}
            <box name={`${name}-link`} width={0.7} height={length} depth={0.7} position={new Vector3(0, length / 2, 0)}>
                <standardMaterial name={`${name}-link-mat`} diffuseColor={LINK_COLORS[linkIndex]}/>
            </box>
            {children}
        </transformNode>
    );
};

const Arm = () => (
    <Joint name="joint1" property="rotation.y" amplitude={0.6} linkIndex={0} length={3}>
        <transformNode name="link1-end" position={new Vector3(0, 3, 0)}>
            <Joint name="joint2" property="rotation.z" amplitude={-0.7} linkIndex={1} length={2.5}>
                <transformNode name="link2-end" position={new Vector3(0, 2.5, 0)}>
                    <Joint name="joint3" property="rotation.z" amplitude={0.8} linkIndex={2} length={1.8}>
                        {/* end-effector */}
                        <sphere name="ee" diameter={0.7} position={new Vector3(0, 1.8, 0)}>
                            <standardMaterial name="ee-mat" diffuseColor={new Color3(0.9, 0.25, 0.25)}
                                              emissiveColor={new Color3(0.4, 0.1, 0.1)}/>
                        </sphere>
                    </Joint>
                </transformNode>
            </Joint>
        </transformNode>
    </Joint>
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
    {tag: "xacro:property", body: <>named constants for the chain's dimensions, referenced as <code>${"{l1}"}</code>.</>},
    {tag: "xacro:macro", body: <>a parameterized, reusable block — <code>bar_link</code> stamps out all three links from one definition instead of repeating them.</>},
    {tag: "link", body: <>a rigid body: <code>visual</code> geometry plus <code>inertial</code> mass and inertia.</>},
    {
        tag: "joint type=\"revolute\"",
        body: <>a rotating joint. <code>parent</code>→<code>child</code> builds the tree, <code>axis</code> is
            the rotation axis, <code>origin</code> is the fixed transform to the parent link (the{" "}
            <InlineMath math='T_{i-1,i}'/> forward kinematics multiplies), and <code>limit</code> bounds its
            travel.</>,
    },
    {tag: "build", body: <>at build time xacro expands every property and macro into plain URDF.</>},
];

const UrdfRobot = () => {
    return <div className="my-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-stretch">
            <div className="lg:w-1/2 flex">
                <CanvasFigure label="serial-chain robot · links + joints" className="w-full">
                    <Physics3DCanvas
                        className="aspect-square w-full rounded-lg"
                        initialView={{radius: 18, at: {x: 8, y: 8, z: 10}, to: {x: 0, y: 3, z: 0}}}
                        axis
                        ground={{opacity: 0.6}}
                    >
                        <Arm/>
                    </Physics3DCanvas>
                </CanvasFigure>
            </div>
            <div className="lg:w-1/2 min-w-0 flex flex-col items-center gap-1 p-3">
                <XmlCode code={XACRO} className="w-full !my-0 max-h-[440px] overflow-auto text-xs"/>
                <span className="text-xs text-muted">arm3.urdf.xacro</span>
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
