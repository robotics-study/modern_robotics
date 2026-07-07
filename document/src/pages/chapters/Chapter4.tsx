import {BlockMath, InlineMath} from "../../components/math/Tex";
import PlanarChain3R from "../../components/pages/chapter4/PlanarChain3R";
import UrdfRobot from "../../components/pages/chapter4/UrdfRobot";
import {T} from "../../libs/i18n";

const Chapter4 = () => {
    return (
        <>
            <T en={<h2>Forward Kinematics</h2>} ko={<h2>Forward Kinematics</h2>}/>
            <T
                en={<p><strong>Definition</strong> : the forward kinematics of a robot is the calculation of the position
                    and orientation of its end-effector frame from the joint coordinates{" "}
                    <InlineMath math='\theta'/>. For an open chain the end-effector pose is uniquely determined by the
                    joint values.
                </p>}
                ko={<p><strong>정의</strong> : 로봇의 Forward Kinematics는 관절 좌표{" "}
                    <InlineMath math='\theta'/> 로부터 end-effector 프레임의 위치와 방향을 계산하는 것이다. Open Chain에서는
                    end-effector 자세가 관절 값에 의해 유일하게 결정된다.
                </p>}
            />
            <T
                en={<p>
                    For the 3R planar open chain with link lengths <InlineMath math='L_1, L_2, L_3'/>, basic
                    trigonometry gives the end-effector position <InlineMath math='(x, y)'/> and orientation{" "}
                    <InlineMath math='\phi'/> as
                </p>}
                ko={<p>
                    링크 길이가 <InlineMath math='L_1, L_2, L_3'/> 인 3R 평면 Open Chain에 대해, 기본 삼각법으로
                    end-effector 위치 <InlineMath math='(x, y)'/> 와 방향{" "}
                    <InlineMath math='\phi'/> 을 다음과 같이 얻는다
                </p>}
            />
            <BlockMath math={`\\begin{gathered}
                x = L_1\\cos\\theta_1 + L_2\\cos(\\theta_1+\\theta_2) + L_3\\cos(\\theta_1+\\theta_2+\\theta_3) \\\\[4pt]
                y = L_1\\sin\\theta_1 + L_2\\sin(\\theta_1+\\theta_2) + L_3\\sin(\\theta_1+\\theta_2+\\theta_3) \\\\[4pt]
                \\phi = \\theta_1 + \\theta_2 + \\theta_3
                \\end{gathered}`}/>
            <T
                en={<p>
                    Drag the three joint sliders and watch the end-effector <InlineMath math='(x, y)'/> and
                    orientation <InlineMath math='\phi'/> follow directly from the joint values — this is exactly what
                    forward kinematics computes.
                </p>}
                ko={<p>
                    세 개의 관절 슬라이더를 움직이며 end-effector <InlineMath math='(x, y)'/> 와
                    방향 <InlineMath math='\phi'/> 이 관절 값으로부터 곧바로 따라오는 것을 지켜보라 — 이것이 바로
                    Forward Kinematics가 계산하는 것이다.
                </p>}
            />
            <PlanarChain3R/>
            <T
                en={<p>
                    A more systematic route attaches a frame to each link and multiplies the successive homogeneous
                    transformations, <InlineMath math='T_{04} = T_{01} T_{12} T_{23} T_{34}'/>. Two standard
                    representations build on this idea: the <strong>Denavit–Hartenberg (D–H) parameters</strong>,
                    which are minimal but require link frames placed by special rules, and the{" "}
                    <strong>product of exponentials (PoE)</strong> formula, which needs no link frames and is the
                    preferred choice here.
                </p>}
                ko={<p>
                    더 체계적인 방법은 각 링크에 프레임을 붙이고 연속된 Homogeneous Transformation을 곱하는 것이다,{" "}
                    <InlineMath math='T_{04} = T_{01} T_{12} T_{23} T_{34}'/>. 이 아이디어 위에 두 가지 표준
                    표현이 세워진다: 최소이지만 특별한 규칙으로 배치된 링크 프레임이 필요한{" "}
                    <strong>Denavit–Hartenberg (D–H) 파라미터</strong> 와, 링크 프레임이 전혀 필요 없어 여기서
                    선호하는 <strong>Product of Exponentials(PoE)</strong> 공식이다.
                </p>}
            />

            <T en={<h2>Product of Exponentials: Space Form</h2>} ko={<h2>Product of Exponentials(PoE): Space Form</h2>}/>
            <T
                en={<p>
                    The key idea: regard each joint as applying a <strong>screw motion</strong> to all the links
                    outward from it. Place the robot at its home position (all joint values zero) and let{" "}
                    <InlineMath math='M \in SE(3)'/> be the end-effector frame configuration there. Let{" "}
                    <InlineMath math='\mathcal{S}_i = (\omega_i, v_i)'/> be the screw axis of joint{" "}
                    <InlineMath math='i'/> expressed in the <strong>fixed base frame</strong>. Then
                </p>}
                ko={<p>
                    핵심 아이디어: 각 관절을 그 바깥쪽의 모든 링크에 <strong>screw 운동</strong>을 가하는 것으로
                    본다. 로봇을 홈 위치(모든 관절 값이 영)에 두고,{" "}
                    <InlineMath math='M \in SE(3)'/> 를 그때의 end-effector 프레임 configuration이라 하자.{" "}
                    <InlineMath math='\mathcal{S}_i = (\omega_i, v_i)'/> 를 <strong>고정된 베이스 프레임</strong>에서
                    표현한 관절 <InlineMath math='i'/> 의 screw 축이라 하자. 그러면
                </p>}
            />
            <BlockMath math='T(\theta) = e^{[\mathcal{S}_1]\theta_1} e^{[\mathcal{S}_2]\theta_2} \cdots e^{[\mathcal{S}_n]\theta_n}\, M'/>
            <T
                en={<p>
                    This is the <strong>space form</strong> of the PoE formula. Computing it needs only three things:
                </p>}
                ko={<p>
                    이것이 PoE 공식의 <strong>Space Form</strong>이다. 계산에는 세 가지만 있으면 된다:
                </p>}
            />
            <T
                en={<ul className="list-disc pl-6 space-y-1">
                    <li>(a) the home configuration <InlineMath math='M \in SE(3)'/> of the end-effector;</li>
                    <li>(b) the screw axes <InlineMath math='\mathcal{S}_1, \dots, \mathcal{S}_n'/> in the base
                        frame;
                    </li>
                    <li>(c) the joint values <InlineMath math='\theta_1, \dots, \theta_n'/>.</li>
                </ul>}
                ko={<ul className="list-disc pl-6 space-y-1">
                    <li>(a) end-effector의 홈 configuration <InlineMath math='M \in SE(3)'/>;</li>
                    <li>(b) 베이스 프레임에서의 screw 축 <InlineMath math='\mathcal{S}_1, \dots, \mathcal{S}_n'/>;
                    </li>
                    <li>(c) 관절 값 <InlineMath math='\theta_1, \dots, \theta_n'/>.</li>
                </ul>}
            />
            <T
                en={<p>
                    For a <strong>revolute</strong> joint, <InlineMath math='\omega_i'/> is a unit vector along the
                    joint axis and <InlineMath math='v_i = -\omega_i \times q_i'/> with <InlineMath math='q_i'/> any
                    point on the axis. For a <strong>prismatic</strong> joint, <InlineMath math='\omega_i = 0'/> and{" "}
                    <InlineMath math='v_i'/> is the unit direction of translation. Unlike the D–H representation, no
                    link reference frames are required.
                </p>}
                ko={<p>
                    <strong>Revolute</strong> Joint에 대해, <InlineMath math='\omega_i'/> 는 관절 축 방향의 단위 벡터이고{" "}
                    <InlineMath math='v_i = -\omega_i \times q_i'/> 이며 <InlineMath math='q_i'/> 는 축 위의 임의의
                    점이다. <strong>Prismatic</strong> Joint에 대해서는 <InlineMath math='\omega_i = 0'/> 이고{" "}
                    <InlineMath math='v_i'/> 는 병진의 단위 방향이다. D–H 표현과 달리 링크 기준 프레임이 전혀
                    필요하지 않다.
                </p>}
            />

            <T en={<h2>Product of Exponentials: Body Form</h2>} ko={<h2>Product of Exponentials(PoE): Body Form</h2>}/>
            <T
                en={<p>
                    Re-expressing each screw axis in the end-effector (<strong>body</strong>) frame at the home
                    position, <InlineMath math='\mathcal{B}_i = [\mathrm{Ad}_{M^{-1}}]\,\mathcal{S}_i'/>, and using
                    the identity <InlineMath math='M e^{M^{-1}[\mathcal{S}]M} = e^{[\mathcal{S}]}M'/> repeatedly gives
                    the <strong>body form</strong>:
                </p>}
                ko={<p>
                    홈 위치에서 각 screw 축을 end-effector(<strong>body</strong>) 프레임으로 다시 표현하면,{" "}
                    <InlineMath math='\mathcal{B}_i = [\mathrm{Ad}_{M^{-1}}]\,\mathcal{S}_i'/>, 그리고 항등식{" "}
                    <InlineMath math='M e^{M^{-1}[\mathcal{S}]M} = e^{[\mathcal{S}]}M'/> 을 반복 적용하면{" "}
                    <strong>Body Form</strong>을 얻는다:
                </p>}
            />
            <BlockMath math='T(\theta) = M\, e^{[\mathcal{B}_1]\theta_1} e^{[\mathcal{B}_2]\theta_2} \cdots e^{[\mathcal{B}_n]\theta_n}'/>
            <T
                en={<p>
                    The two forms differ only in the order of transformations. In the space form,{" "}
                    <InlineMath math='M'/> is transformed first by the most distal joint, moving inward; in the body
                    form, first by the most proximal joint, moving outward. Because a space-frame axis is unaffected
                    by more distal joints, and a body-frame axis by more proximal ones, both sets of screw axes need
                    only be read off at the robot's zero position.
                </p>}
                ko={<p>
                    두 형식은 변환의 순서에서만 다르다. Space Form에서는{" "}
                    <InlineMath math='M'/> 이 가장 먼 관절에 의해 먼저 변환되어 안쪽으로 진행하고, Body Form에서는
                    가장 가까운 관절에 의해 먼저 변환되어 바깥쪽으로 진행한다. 공간 프레임 축은 더 먼 관절의 영향을
                    받지 않고, 물체 프레임 축은 더 가까운 관절의 영향을 받지 않으므로, 두 screw 축 집합 모두 로봇의
                    영 위치에서 읽어내기만 하면 된다.
                </p>}
            />

            <T en={<h2>Universal Robot Description Format (URDF)</h2>} ko={<h2>URDF (Universal Robot Description Format)</h2>}/>
            <T
                en={<p>
                    A <strong>URDF</strong> file is an XML description of a robot used across the robotics ecosystem.
                    It lists the robot's <strong>links</strong> — each with mass, inertia, and visual/collision
                    geometry — and the <strong>joints</strong> connecting them, each giving a type (revolute,
                    prismatic, …), an axis, its parent and child links, and the transform between them.
                </p>}
                ko={<p>
                    <strong>URDF</strong> 파일은 로봇 생태계 전반에서 쓰이는 로봇의 XML 기술이다.
                    로봇의 <strong>링크</strong>(각각 질량·관성·visual/collision 형상을 가진다)와 이들을 잇는{" "}
                    <strong>관절</strong>을 나열하며, 각 관절은 타입(revolute, prismatic, …), 축, 부모·자식 링크,
                    그리고 이들 사이의 변환을 제시한다.
                </p>}
            />
            <T
                en={<p>
                    Together these entries supply exactly the data the forward kinematics needs — the joint screw
                    axes and the home configuration <InlineMath math='M'/> — and the inertial data that later chapters
                    use for dynamics.
                </p>}
                ko={<p>
                    이 항목들이 모여 Forward Kinematics에 필요한 데이터 — 관절 screw 축과 홈 configuration{" "}
                    <InlineMath math='M'/> — 그리고 이후 장들이 Dynamics에 쓰는 관성 데이터를 정확히 제공한다.
                </p>}
            />
            <T
                en={<p>
                    The robot below is exactly such a tree: three <strong>links</strong> (colored bars) joined by
                    three <strong>joints</strong> (orange), each joint rotating its subtree — the same nested
                    parent-child structure a URDF encodes.
                </p>}
                ko={<p>
                    아래 로봇이 바로 그런 트리이다: 세 개의 <strong>링크</strong>(색칠된 막대)가 세 개의{" "}
                    <strong>관절</strong>(주황색)로 이어지고, 각 관절이 자신의 서브트리를 회전시킨다 — URDF 가
                    부호화하는 것과 동일한 중첩된 부모-자식 구조이다.
                </p>}
            />
            <UrdfRobot/>
        </>
    )
}

export default Chapter4
