import {BlockMath, InlineMath} from "../../components/math/Tex";
import PlanarChain3R from "../../components/pages/chapter4/PlanarChain3R";
import PoEBuildUp from "../../components/pages/chapter4/PoEBuildUp";
import UrdfRobot from "../../components/pages/chapter4/UrdfRobot";
import Ur5Urdf from "../../components/pages/chapter4/Ur5Urdf";
import {T} from "../../libs/i18n";

// 책 예제의 screw 축 표들. KaTeX 인라인로 렌더하기엔 표가 잦아 공용 표 컴포넌트로 정리한다.
const ScrewTable = ({rows, axis}: {rows: Array<[string, string, string]>; axis?: string}) => (
    <div className="overflow-x-auto">
        <table className="table-center text-sm">
            <thead>
            <tr className="border-b border-border text-muted">
                <th className="px-4 py-1"><InlineMath math='i'/></th>
                <th className="px-4 py-1"><InlineMath math={`\\omega_{i}`}/></th>
                <th className="px-4 py-1"><InlineMath math={`v_{i}`}/></th>
            </tr>
            </thead>
            <tbody>
            {rows.map(([i, w, v]) => (
                <tr key={`${axis}-${i}`} className="border-b border-border tabular-nums">
                    <td className="px-4 py-1">{i}</td>
                    <td className="px-4 py-1"><InlineMath math={w}/></td>
                    <td className="px-4 py-1"><InlineMath math={v}/></td>
                </tr>
            ))}
            </tbody>
        </table>
    </div>
);

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
                    Trigonometry does not scale to spatial chains, so we systematize. Attach a frame to each
                    link and chain the neighbor-to-neighbor transforms:
                </p>}
                ko={<p>
                    삼각법은 공간 체인으로는 확장되지 않으니 체계화하자. 각 링크에 프레임을 붙이고 이웃끼리의
                    변환을 사슬로 곱하면:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math='T_{04} = T_{01}(\theta_1)\, T_{12}(\theta_2)\, T_{23}(\theta_3)\, T_{34},
\qquad T_{12} = \begin{bmatrix} \cos\theta_2 & -\sin\theta_2 & 0 & L_1 \\ \sin\theta_2 & \cos\theta_2 & 0 & 0 \\ 0 & 0 & 1 & 0 \\ 0 & 0 & 0 & 1 \end{bmatrix},\ \ldots'/>
            </div>
            <T
                en={<p>
                    Each <InlineMath math='T_{i-1,i}'/> depends only on <InlineMath math='\theta_i'/>, and{" "}
                    <InlineMath math='T_{34}'/> is constant. This works — it is the basis of the{" "}
                    <strong>Denavit–Hartenberg</strong> representation — but it drags <InlineMath math='n'/>{" "}
                    link frames along, each placed by fiddly rules. The <strong>product of exponentials
                    (PoE)</strong> formula reaches the same product with <em>no link frames at all</em>: only
                    the base frame, the end-effector frame, and one screw axis per joint.
                </p>}
                ko={<p>
                    각 <InlineMath math='T_{i-1,i}'/> 는 <InlineMath math='\theta_i'/> 에만 의존하고,{" "}
                    <InlineMath math='T_{34}'/> 는 상수다. 이 방식도 통한다 —{" "}
                    <strong>Denavit–Hartenberg</strong> 표현의 바탕이다 — 하지만 까다로운 규칙으로 배치해야 하는
                    링크 프레임 <InlineMath math='n'/> 개를 끌고 다녀야 한다.{" "}
                    <strong>Product of Exponentials(PoE)</strong> 공식은 <em>링크 프레임 없이</em> 같은 곱에
                    도달한다: 베이스 프레임, end-effector 프레임, 그리고 관절마다 screw 축 하나면 끝이다.
                </p>}
            />

            <T en={<h2>Product of Exponentials: Space Form</h2>} ko={<h2>Product of Exponentials(PoE): Space Form</h2>}/>
            <T
                en={<p>
                    The key idea: regard each joint as applying a <strong>screw motion</strong> to all the links
                    outward from it. Watch it build up on the 3R planar arm. Let{" "}
                    <InlineMath math='M \in SE(3)'/> be the end-effector configuration at the home position
                    (all <InlineMath math='\theta_i = 0'/>). Hold joints 1 and 2 at zero and displace only
                    joint 3: the end-effector undergoes the screw motion of joint 3's axis,
                </p>}
                ko={<p>
                    핵심 아이디어: 각 관절을 그 바깥쪽의 모든 링크에 <strong>screw 운동</strong>을 가하는 것으로
                    본다. 3R 평면 팔에서 조립되는 과정을 보자. 홈 자세(모든{" "}
                    <InlineMath math='\theta_i = 0'/>)에서의 end-effector configuration을{" "}
                    <InlineMath math='M \in SE(3)'/> 이라 하자. 관절 1, 2를 0에 고정하고 관절 3만 움직이면
                    end-effector 는 관절 3 축의 screw 운동을 겪는다,
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math='T_{04} = e^{[\mathcal{S}_3]\theta_3} M,
\qquad \mathcal{S}_3 = \begin{bmatrix} \omega_3 \\ v_3 \end{bmatrix} = (0,0,1,\; 0, -(L_1{+}L_2),\, 0)'/>
            </div>
            <T
                en={<p>
                    where <InlineMath math='v_3 = -\omega_3 \times q_3'/> for any point{" "}
                    <InlineMath math='q_3 = (L_1{+}L_2, 0, 0)'/> on the axis — exactly the twist recipe from
                    Chapter 3. Now let joint 2 vary too: it screws the rigid link-2/link-3 assembly, so{" "}
                    <InlineMath math='T_{04} = e^{[\mathcal{S}_2]\theta_2}e^{[\mathcal{S}_3]\theta_3}M'/>.
                    Finally joint 1 screws the whole arm. Induction on the same argument gives, for any open
                    chain of <InlineMath math='n'/> one-DOF joints,
                </p>}
                ko={<p>
                    여기서 <InlineMath math='v_3 = -\omega_3 \times q_3'/> 이고{" "}
                    <InlineMath math='q_3 = (L_1{+}L_2, 0, 0)'/> 는 축 위의 아무 점 — 정확히 3장의 twist
                    레시피다. 이제 관절 2도 움직이자: 관절 2는 링크 2·3 강체 덩어리를 screw 운동시키므로{" "}
                    <InlineMath math='T_{04} = e^{[\mathcal{S}_2]\theta_2}e^{[\mathcal{S}_3]\theta_3}M'/>.
                    마지막으로 관절 1은 팔 전체를 돌린다. 같은 논증의 귀납으로, 1자유도 관절{" "}
                    <InlineMath math='n'/> 개의 어떤 open chain 에 대해서도
                </p>}
            />
            <BlockMath math='T(\theta) = e^{[\mathcal{S}_1]\theta_1} e^{[\mathcal{S}_2]\theta_2} \cdots e^{[\mathcal{S}_n]\theta_n}\, M'/>
            <T
                en={<p>
                    This is the <strong>space form</strong> of the PoE formula — every screw axis expressed in
                    the fixed base frame, read off <em>once</em>, at the home position. Set target angles with
                    the sliders, then press <strong>▶</strong>: the arm starts at <InlineMath math='M'/> and
                    the product is applied one factor at a time, farthest joint first (3 → 2 → 1). The ⊙ marks
                    the axis currently screwing everything outward of it, and the matching factor lights up in
                    the formula:
                </p>}
                ko={<p>
                    이것이 PoE 공식의 <strong>Space Form</strong>이다 — 모든 screw 축을 고정 베이스 프레임에서,
                    홈 자세에서 <em>한 번만</em> 읽으면 된다. 슬라이더로 목표각을 정하고 <strong>▶</strong> 를
                    눌러 보라: 팔이 <InlineMath math='M'/> 에서 출발해 곱의 인자가 하나씩, 가장 먼 관절부터
                    (3 → 2 → 1) 적용된다. ⊙ 는 지금 자기 바깥의 전부를 screw 운동시키고 있는 축이고, 수식에서
                    해당 인자가 함께 켜진다:
                </p>}
            />
            <PoEBuildUp/>
            <T
                en={<p>
                    Computing <InlineMath math='T(\theta)'/> needs only three ingredients:
                </p>}
                ko={<p>
                    <InlineMath math='T(\theta)'/> 계산에는 세 가지 재료만 있으면 된다:
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
                    <InlineMath math='v_i'/> is the unit direction of translation. The 3R planar arm above, for
                    instance, has all axes <InlineMath math='\omega_i = (0,0,1)'/> and:
                </p>}
                ko={<p>
                    <strong>Revolute</strong> Joint에 대해, <InlineMath math='\omega_i'/> 는 관절 축 방향의 단위 벡터이고{" "}
                    <InlineMath math='v_i = -\omega_i \times q_i'/> 이며 <InlineMath math='q_i'/> 는 축 위의 임의의
                    점이다. <strong>Prismatic</strong> Joint에 대해서는 <InlineMath math='\omega_i = 0'/> 이고{" "}
                    <InlineMath math='v_i'/> 는 병진의 단위 방향이다. 예컨대 위의 3R 평면 팔은 모든 축이{" "}
                    <InlineMath math='\omega_i = (0,0,1)'/> 이고:
                </p>}
            />
            <ScrewTable axis="planar3r" rows={[
                ["1", "(0, 0, 1)", "(0, 0, 0)"],
                ["2", "(0, 0, 1)", "(0, -L_1, 0)"],
                ["3", "(0, 0, 1)", String.raw`(0, -(L_1{+}L_2), 0)`],
            ]}/>
            <T
                en={<p>
                    A spatial example (the book's Example 4.1): a 3R chain whose first axis is vertical{" "}
                    (<InlineMath math='\omega_1 = (0,0,1)'/> through the origin), second axis along{" "}
                    <InlineMath math='-\hat{\mathrm{y}}'/> at height offset <InlineMath math='q_2 = (L_1, 0, 0)'/>,
                    third along <InlineMath math='\hat{\mathrm{x}}'/> through{" "}
                    <InlineMath math='q_3 = (0, 0, -L_2)'/>:
                </p>}
                ko={<p>
                    공간 예제 하나(책 예제 4.1): 첫 축이 수직{" "}
                    (<InlineMath math='\omega_1 = (0,0,1)'/>, 원점 통과), 둘째 축이{" "}
                    <InlineMath math='-\hat{\mathrm{y}}'/> 방향으로 <InlineMath math='q_2 = (L_1, 0, 0)'/> 를
                    지나고, 셋째 축이 <InlineMath math='\hat{\mathrm{x}}'/> 방향으로{" "}
                    <InlineMath math='q_3 = (0, 0, -L_2)'/> 를 지나는 3R 체인:
                </p>}
            />
            <ScrewTable axis="spatial3r" rows={[
                ["1", "(0, 0, 1)", "(0, 0, 0)"],
                ["2", "(0, -1, 0)", "(0, 0, -L_1)"],
                ["3", "(1, 0, 0)", "(0, L_2, 0)"],
            ]}/>
            <T
                en={<p>
                    Real robots read the same way. For Universal Robots' <strong>UR5</strong> at its zero pose,
                    the six screw axes and <InlineMath math='M'/> come straight from the arm's geometry, and
                    setting <InlineMath math='\theta_2 = -\pi/2,\ \theta_5 = \pi/2'/> (all others zero) collapses
                    the product — every <InlineMath math='e^0 = I'/> drops out:
                </p>}
                ko={<p>
                    실제 로봇도 같은 방식으로 읽힌다. Universal Robots 의 <strong>UR5</strong> 를 영 자세에 두면
                    여섯 screw 축과 <InlineMath math='M'/> 이 팔의 기하에서 바로 나오고,{" "}
                    <InlineMath math='\theta_2 = -\pi/2,\ \theta_5 = \pi/2'/> (나머지는 0)로 두면 곱이 무너진다 —{" "}
                    <InlineMath math='e^0 = I'/> 가 전부 사라져서:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math='T(\theta) = e^{[\mathcal{S}_1]\theta_1} \cdots e^{[\mathcal{S}_6]\theta_6} M
= e^{-[\mathcal{S}_2]\pi/2}\, e^{[\mathcal{S}_5]\pi/2}\, M
= \begin{bmatrix} 0 & -1 & 0 & 0.095 \\ 1 & 0 & 0 & 0.109 \\ 0 & 0 & 1 & 0.988 \\ 0 & 0 & 0 & 1 \end{bmatrix}'/>
            </div>
            <T
                en={<p>
                    (lengths in meters). Versus D–H: the PoE description is not minimal —{" "}
                    <InlineMath math='6n'/> numbers for the axes instead of D–H's <InlineMath math='3n'/> — but
                    nothing about frame placement needs to be remembered, and the screw axes are exactly the
                    quantities the velocity kinematics of Chapter 5 will need.
                </p>}
                ko={<p>
                    (길이는 미터). D–H 와 비교하면: PoE 기술은 최소가 아니다 — 축에{" "}
                    <InlineMath math='6n'/> 개의 수가 들어 D–H 의 <InlineMath math='3n'/> 보다 많다 — 하지만
                    프레임 배치 규칙을 외울 필요가 전혀 없고, screw 축은 5장의 Velocity Kinematics가 그대로 쓸
                    바로 그 양이다.
                </p>}
            />

            <T en={<h2>Product of Exponentials: Body Form</h2>} ko={<h2>Product of Exponentials(PoE): Body Form</h2>}/>
            <T
                en={<p>
                    A single matrix identity, <InlineMath math='e^{M^{-1}PM} = M^{-1}e^{P}M'/>, rewritten as{" "}
                    <InlineMath math='e^{P}M = M e^{M^{-1}PM}'/>, lets us push <InlineMath math='M'/> through
                    the product one exponential at a time, from the right:
                </p>}
                ko={<p>
                    행렬 항등식 하나 <InlineMath math='e^{M^{-1}PM} = M^{-1}e^{P}M'/> 를{" "}
                    <InlineMath math='e^{P}M = M e^{M^{-1}PM}'/> 로 고쳐 쓰면, <InlineMath math='M'/> 을 곱의
                    오른쪽 끝에서부터 지수 하나씩 통과시킬 수 있다:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math='\begin{aligned}
T(\theta) &= e^{[\mathcal{S}_1]\theta_1} \cdots e^{[\mathcal{S}_{n-1}]\theta_{n-1}}\, e^{[\mathcal{S}_n]\theta_n} M\\
&= e^{[\mathcal{S}_1]\theta_1} \cdots e^{[\mathcal{S}_{n-1}]\theta_{n-1}}\, M e^{M^{-1}[\mathcal{S}_n]M\,\theta_n}\\
&\;\;\vdots\\
&= M\, e^{[\mathcal{B}_1]\theta_1} \cdots e^{[\mathcal{B}_{n-1}]\theta_{n-1}} e^{[\mathcal{B}_n]\theta_n},
\qquad \mathcal{B}_i = [\mathrm{Ad}_{M^{-1}}]\,\mathcal{S}_i
\end{aligned}'/>
            </div>
            <T
                en={<p>
                    This is the <strong>body form</strong>: the same joint axes, now expressed in the
                    end-effector frame at the home position. The two forms differ only in the order of
                    interpretation — flip the toggle in the figure above to see it. In the space form,{" "}
                    <InlineMath math='M'/> is transformed first by the most distal joint, moving inward; a
                    space-frame axis <InlineMath math='\mathcal{S}_i'/> is unaffected by more <em>distal</em>{" "}
                    joints. In the body form, <InlineMath math='M'/> is transformed first by the most proximal
                    joint, moving outward; a body-frame axis <InlineMath math='\mathcal{B}_i'/> is unaffected
                    by more <em>proximal</em> joints. Either way, the axes need only be read at the zero
                    position.
                </p>}
                ko={<p>
                    이것이 <strong>Body Form</strong>이다: 같은 관절 축을 홈 자세의 end-effector 프레임에서
                    표현한 것이다. 두 형식은 해석 순서만 다르다 — 위 figure의 토글을 눌러 보라. Space Form에서는{" "}
                    <InlineMath math='M'/> 이 가장 먼 관절부터 안쪽으로 변환되며, 공간 프레임 축{" "}
                    <InlineMath math='\mathcal{S}_i'/> 는 더 <em>먼</em> 관절의 영향을 받지 않는다. Body
                    Form에서는 가장 가까운 관절부터 바깥쪽으로 변환되며, 물체 프레임 축{" "}
                    <InlineMath math='\mathcal{B}_i'/> 는 더 <em>가까운</em> 관절의 영향을 받지 않는다. 어느
                    쪽이든 축은 영 자세에서 한 번만 읽으면 된다.
                </p>}
            />
            <T
                en={<p>
                    The body form shines for arms described from the tool side. Barrett's <strong>WAM</strong>{" "}
                    7R arm (a <em>redundant</em> arm: seven joints for a six-dimensional task space, leaving a
                    one-dimensional self-motion for obstacle avoidance) has a particularly clean body-frame
                    table — wrist axes close to <InlineMath math='\{b\}'/> get short{" "}
                    <InlineMath math='v_i'/>'s:
                </p>}
                ko={<p>
                    Body Form은 툴 쪽에서 기술되는 팔에서 빛난다. Barrett 의 <strong>WAM</strong> 7R 팔
                    (6차원 task 공간에 관절 일곱 — 장애물 회피에 쓸 1차원 자기운동이 남는 <em>여유자유도</em>{" "}
                    팔)은 body 프레임 표가 특히 깔끔하다 — <InlineMath math='\{b\}'/> 에 가까운 손목 축일수록{" "}
                    <InlineMath math='v_i'/> 가 짧아진다:
                </p>}
            />
            <ScrewTable axis="wam" rows={[
                ["1", "(0, 0, 1)", "(0, 0, 0)"],
                ["2", "(0, 1, 0)", String.raw`(L_1{+}L_2{+}L_3,\, 0,\, 0)`],
                ["3", "(0, 0, 1)", "(0, 0, 0)"],
                ["4", "(0, 1, 0)", String.raw`(L_2{+}L_3,\, 0,\, W_1)`],
                ["5", "(0, 0, 1)", "(0, 0, 0)"],
                ["6", "(0, 1, 0)", "(L_3, 0, 0)"],
                ["7", "(0, 0, 1)", "(0, 0, 0)"],
            ]}/>

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
                    A URDF describes any robot whose links and joints form a <strong>tree</strong> — links are
                    the nodes, joints the edges — which covers serial arms and robot hands but not closed
                    loops like the Stewart–Gough platform. Frame orientations are written as roll–pitch–yaw
                    angles, and together the entries supply exactly what the forward kinematics needs — the
                    joint axes and the home configuration <InlineMath math='M'/> — plus the inertial data that
                    Chapter 8's dynamics will use.
                </p>}
                ko={<p>
                    URDF 는 링크와 관절이 <strong>트리</strong>를 이루는 로봇 — 링크가 노드, 관절이 간선 — 을
                    기술한다. 직렬 팔과 로봇 손은 되지만 Stewart–Gough 플랫폼 같은 닫힌 루프는 안 된다. 프레임
                    방향은 roll–pitch–yaw 각으로 쓰며, 항목들이 모여 Forward Kinematics에 필요한 것 — 관절 축과
                    홈 configuration <InlineMath math='M'/> — 과 8장의 Dynamics가 쓸 관성 데이터를 정확히
                    제공한다.
                </p>}
            />
            <T
                en={<p>
                    The robot below is exactly such a tree: the light-gray tubes are the{" "}
                    <strong>links</strong> and the dark housings with blue rings are the three{" "}
                    <strong>revolute joints</strong> (yaw at the base, pitch at the shoulder and elbow), each
                    rotating its whole subtree — the same nested parent-child structure the URDF on the right
                    encodes.
                </p>}
                ko={<p>
                    아래 로봇이 바로 그런 트리이다: 밝은 회색 튜브가 <strong>링크</strong>이고, 파란 링을 두른
                    어두운 하우징이 세 개의 <strong>revolute 관절</strong>(베이스 요, 어깨·팔꿈치 피치)이다. 각
                    관절이 자신의 서브트리 전체를 회전시킨다 — 오른쪽 URDF 가 부호화하는 것과 동일한 중첩된
                    부모-자식 구조이다.
                </p>}
            />
            <UrdfRobot/>
            <T
                en={<p>
                    And here is a production robot in the same format — the book's URDF for the{" "}
                    <strong>UR5</strong>. Read <code>joint1</code> … <code>joint6</code> against the screw-axis
                    table from the PoE section: each <code>origin</code> is the fixed offset to the next joint
                    frame and each <code>axis</code> is the joint's rotation direction — exactly the data{" "}
                    <InlineMath math='M'/> and <InlineMath math='\mathcal{S}_i'/> are built from. The{" "}
                    <code>link</code> entries carry the masses and inertias that Chapter 8 will need:
                </p>}
                ko={<p>
                    그리고 같은 형식으로 쓰인 실전 로봇 — 책에 실린 <strong>UR5</strong> 의 URDF 다.{" "}
                    <code>joint1</code> … <code>joint6</code> 을 PoE 절의 screw 축 표와 대조해 보라: 각{" "}
                    <code>origin</code> 은 다음 관절 프레임까지의 고정 오프셋이고 <code>axis</code> 는 관절의
                    회전 방향 — 정확히 <InlineMath math='M'/> 과 <InlineMath math='\mathcal{S}_i'/> 를 만드는
                    데이터다. <code>link</code> 항목들은 8장이 쓸 질량·관성을 담는다:
                </p>}
            />
            <Ur5Urdf/>
        </>
    )
}

export default Chapter4
