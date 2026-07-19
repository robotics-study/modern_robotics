import {BlockMath, InlineMath} from "../../components/math/Tex";
import JacobianColumns from "../../components/pages/chapter5/JacobianColumns";
import ManipulabilityEllipse from "../../components/pages/chapter5/ManipulabilityEllipse";
import VelocityMapping from "../../components/pages/chapter5/VelocityMapping";
import {T} from "../../libs/i18n";

const Chapter5 = () => {
    return (
        <>
            <T en={<h2>Manipulator Jacobian</h2>} ko={<h2>Manipulator Jacobian</h2>}/>
            <T
                en={<p>
                    Forward kinematics answers <em>where</em> the end-effector is for a given set of joint
                    positions. Velocity kinematics answers the related question: given the joint <em>velocities</em>{" "}
                    <InlineMath math='\dot\theta'/>, how fast and in what direction does the end-effector move? Writing
                    the forward kinematics as <InlineMath math='x = f(\theta)'/> and differentiating by the chain rule,
                </p>}
                ko={<p>
                    Forward Kinematics는 주어진 관절 위치에 대해 end-effector가 <em>어디</em>에 있는지를 답한다. Velocity Kinematics는 이와
                    관련된 질문에 답한다: 관절 <em>속도</em> <InlineMath math='\dot\theta'/>가 주어졌을 때, end-effector는
                    얼마나 빠르게 그리고 어느 방향으로 움직이는가? Forward Kinematics를 <InlineMath math='x = f(\theta)'/>로 쓰고
                    연쇄 법칙으로 미분하면,
                </p>}
            />
            <BlockMath math={`\\dot{x} = \\frac{\\partial f(\\theta)}{\\partial \\theta}\\,\\dot\\theta = J(\\theta)\\,\\dot\\theta`}/>
            <T
                en={<p>
                    The matrix <InlineMath math='J(\theta)'/> is the <strong>Jacobian</strong>. It is the linear map
                    from joint velocities to end-effector velocity, and — because the trigonometric terms depend on the
                    configuration — it changes as the robot moves. For the 2R planar chain, differentiate the forward
                    kinematics <InlineMath math='x_1 = L_1\cos\theta_1 + L_2\cos(\theta_1{+}\theta_2)'/>,{" "}
                    <InlineMath math='x_2 = L_1\sin\theta_1 + L_2\sin(\theta_1{+}\theta_2)'/> term by term and collect
                    the <InlineMath math='\dot\theta'/>'s:
                </p>}
                ko={<p>
                    행렬 <InlineMath math='J(\theta)'/>가 <strong>Jacobian</strong>이다. 이는 관절 속도에서 end-effector
                    속도로 가는 linear map이며, 삼각 함수 항이 configuration에 의존하기 때문에 로봇이 움직임에 따라 변한다.
                    2R 평면 체인이라면 Forward Kinematics{" "}
                    <InlineMath math='x_1 = L_1\cos\theta_1 + L_2\cos(\theta_1{+}\theta_2)'/>,{" "}
                    <InlineMath math='x_2 = L_1\sin\theta_1 + L_2\sin(\theta_1{+}\theta_2)'/> 를 항별로 미분해{" "}
                    <InlineMath math='\dot\theta'/> 로 묶으면 된다:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math='\begin{bmatrix} \dot x_1 \\ \dot x_2 \end{bmatrix} =
\underbrace{\begin{bmatrix}
-L_1\sin\theta_1 - L_2\sin(\theta_1{+}\theta_2) & -L_2\sin(\theta_1{+}\theta_2) \\
\;\;\,L_1\cos\theta_1 + L_2\cos(\theta_1{+}\theta_2) & L_2\cos(\theta_1{+}\theta_2)
\end{bmatrix}}_{J(\theta) \,=\, [J_1(\theta)\;\; J_2(\theta)]}
\begin{bmatrix} \dot\theta_1 \\ \dot\theta_2 \end{bmatrix}'/>
            </div>
            <T
                en={<p>
                    For the 2R planar chain the tip velocity is <InlineMath math='v_\text{tip} = J_1(\theta)\dot\theta_1 + J_2(\theta)\dot\theta_2'/>.
                    Each column <InlineMath math='J_i(\theta)'/> has a direct physical meaning: it is the tip velocity
                    produced when joint <InlineMath math='i'/> turns at unit speed and the others are held still. Drag
                    the sliders below — the two arrows are exactly <InlineMath math='J_1'/> and <InlineMath math='J_2'/>.
                    When they line up (at <InlineMath math='\theta_2 = 0'/> or <InlineMath math='\pm\pi'/>) the tip can
                    no longer move sideways, <InlineMath math='\det J = L_1 L_2 \sin\theta_2'/> vanishes, and the arm is
                    at a <strong>singularity</strong>.
                </p>}
                ko={<p>
                    2R 평면 체인에서 팁 속도는 <InlineMath math='v_\text{tip} = J_1(\theta)\dot\theta_1 + J_2(\theta)\dot\theta_2'/>이다.
                    각 열 <InlineMath math='J_i(\theta)'/>는 직접적인 물리적 의미를 갖는다: 관절 <InlineMath math='i'/>가
                    단위 속도로 회전하고 나머지는 정지해 있을 때 만들어지는 팁 속도다. 아래 슬라이더를 드래그해 보라 —
                    두 화살표가 정확히 <InlineMath math='J_1'/>과 <InlineMath math='J_2'/>다. 이들이 나란해질 때
                    (<InlineMath math='\theta_2 = 0'/> 또는 <InlineMath math='\pm\pi'/>에서) 팁은 더 이상 옆으로 움직일
                    수 없고, <InlineMath math='\det J = L_1 L_2 \sin\theta_2'/>가 소멸하며, 팔은 <strong>Singularity</strong>에
                    있게 된다.
                </p>}
            />
            <JacobianColumns/>
            <T
                en={<p>
                    Try it on the arm itself. On the left, drag to choose how fast each joint spins; on the
                    right, the tip immediately shows the resulting velocity <InlineMath math='J\dot\theta'/> —
                    and pressing <strong>▶</strong> actually drives the arm with your chosen{" "}
                    <InlineMath math='\dot\theta'/>, so the tip's trail follows the arrow. The dashed
                    parallelogram hanging on the tip is <em>everything</em> the tip can do with{" "}
                    <InlineMath math='|\dot\theta_i| \le 1'/>, and the dashed ellipse is the image of the
                    "equal-effort" circle — the <strong>manipulability ellipse</strong> we will meet again
                    below. Straighten the elbow (<InlineMath math='\theta_2 \to 0'/>) and watch the whole menu
                    of tip velocities collapse onto a line: that is a singularity, felt rather than defined.
                </p>}
                ko={<p>
                    팔 위에서 직접 해 보자. 왼쪽에서 각 관절을 얼마나 빨리 돌릴지 드래그로 고르면, 오른쪽 팁에 그
                    결과 속도 <InlineMath math='J\dot\theta'/> 가 바로 나타난다 — 그리고 <strong>▶</strong> 를
                    누르면 고른 <InlineMath math='\dot\theta'/> 그대로 팔이 실제로 움직여, 팁의 자취가 화살표를
                    따라간다. 팁에 매달린 점선 평행사변형은 <InlineMath math='|\dot\theta_i| \le 1'/> 로 팁이 낼
                    수 있는 속도의 <em>전부</em>이고, 점선 타원은 "같은 노력" 원의 상 — 아래에서 다시 만날{" "}
                    <strong>manipulability 타원</strong> — 이다. 팔꿈치를 펴 보라(<InlineMath math='\theta_2 \to 0'/>):
                    팁이 낼 수 있는 속도 메뉴 전체가 선 하나로 무너진다. 정의가 아니라 몸으로 느끼는 특이점이다.
                </p>}
            />
            <VelocityMapping/>
            <T
                en={<p>
                    In the general spatial case the tip velocity is the six-dimensional twist{" "}
                    <InlineMath math='\mathcal{V}'/>, and the same idea holds: column <InlineMath math='i'/> of the
                    Jacobian is the screw axis of joint <InlineMath math='i'/>, expressed for the <em>current</em>{" "}
                    configuration rather than the zero configuration used by the product-of-exponentials formula.
                </p>}
                ko={<p>
                    일반적인 공간 경우에 팁 속도는 6차원 twist <InlineMath math='\mathcal{V}'/>이며, 같은 아이디어가
                    성립한다: Jacobian의 <InlineMath math='i'/>번째 열은 관절 <InlineMath math='i'/>의 screw 축으로,
                    Product of Exponentials(PoE) 공식이 사용하는 영 configuration이 아니라 <em>현재</em> configuration에 대해 표현된 것이다.
                </p>}
            />

            <T en={<h2>Space and Body Jacobian</h2>} ko={<h2>Space Jacobian과 Body Jacobian</h2>}/>
            <T
                en={<p>
                    Just as a twist can be written in the fixed frame (<InlineMath math='\mathcal{V}_s'/>) or the
                    end-effector frame (<InlineMath math='\mathcal{V}_b'/>), there are two Jacobians — and both
                    fall straight out of the PoE formula. Differentiate{" "}
                    <InlineMath math='T = e^{[\mathcal{S}_1]\theta_1}\cdots e^{[\mathcal{S}_n]\theta_n}M'/> with
                    the product rule (each factor contributes{" "}
                    <InlineMath math='[\mathcal{S}_i]\dot\theta_i\,e^{[\mathcal{S}_i]\theta_i}'/>) and multiply
                    by <InlineMath math='T^{-1}'/> on the right — the trailing factors cancel term by term:
                </p>}
                ko={<p>
                    twist가 고정 프레임(<InlineMath math='\mathcal{V}_s'/>) 또는 end-effector 프레임
                    (<InlineMath math='\mathcal{V}_b'/>)으로 쓰일 수 있듯이 Jacobian도 둘인데, 둘 다 PoE 공식에서
                    곧장 떨어져 나온다.{" "}
                    <InlineMath math='T = e^{[\mathcal{S}_1]\theta_1}\cdots e^{[\mathcal{S}_n]\theta_n}M'/> 을
                    곱셈 법칙으로 미분하고 (각 인자가{" "}
                    <InlineMath math='[\mathcal{S}_i]\dot\theta_i\,e^{[\mathcal{S}_i]\theta_i}'/> 를 내놓는다)
                    오른쪽에 <InlineMath math='T^{-1}'/> 을 곱하면 — 뒤쪽 인자들이 항마다 소거된다:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math='[\mathcal{V}_s] = \dot TT^{-1}
= [\mathcal{S}_1]\dot\theta_1
+ e^{[\mathcal{S}_1]\theta_1}[\mathcal{S}_2]e^{-[\mathcal{S}_1]\theta_1}\dot\theta_2
+ e^{[\mathcal{S}_1]\theta_1}e^{[\mathcal{S}_2]\theta_2}[\mathcal{S}_3]e^{-[\mathcal{S}_2]\theta_2}e^{-[\mathcal{S}_1]\theta_1}\dot\theta_3 + \cdots'/>
            </div>
            <T
                en={<p>
                    Each term is a conjugation <InlineMath math='T[\mathcal{S}]T^{-1}'/> — exactly the adjoint
                    map from Chapter 3. So <InlineMath math='\mathcal{V}_s'/> is a sum of columns times joint
                    rates, <InlineMath math='\mathcal{V}_s = J_s(\theta)\dot\theta'/>, with
                </p>}
                ko={<p>
                    각 항은 conjugation <InlineMath math='T[\mathcal{S}]T^{-1}'/> — 정확히 3장의 adjoint map이다.
                    따라서 <InlineMath math='\mathcal{V}_s'/> 는 열 벡터 곱하기 관절 속도의 합,{" "}
                    <InlineMath math='\mathcal{V}_s = J_s(\theta)\dot\theta'/> 이 되고, 그 열은
                </p>}
            />
            <BlockMath math={`J_{si}(\\theta) = \\big[\\mathrm{Ad}_{e^{[\\mathcal{S}_1]\\theta_1}\\cdots e^{[\\mathcal{S}_{i-1}]\\theta_{i-1}}}\\big]\\,\\mathcal{S}_i, \\qquad J_{s1} = \\mathcal{S}_1`}/>
            <T
                en={<p>
                    Read it physically: <InlineMath math='J_{si}'/> is the screw axis of joint{" "}
                    <InlineMath math='i'/> after the first <InlineMath math='i-1'/> joints have carried it to
                    the current configuration — joints <em>beyond</em> <InlineMath math='i'/> cannot move axis{" "}
                    <InlineMath math='i'/>, so they never appear. That is why the recipe is the same as reading
                    off the <InlineMath math='\mathcal{S}_i'/> in Chapter 4, just at arbitrary{" "}
                    <InlineMath math='\theta'/> instead of <InlineMath math='\theta = 0'/>. A worked example,
                    the spatial RRRP chain (all revolute axes vertical, prismatic last):
                </p>}
                ko={<p>
                    물리적으로 읽으면: <InlineMath math='J_{si}'/> 는 앞의 <InlineMath math='i-1'/> 개 관절이 현재
                    configuration까지 실어 나른 관절 <InlineMath math='i'/> 의 screw 축이다 —{" "}
                    <InlineMath math='i'/> <em>뒤의</em> 관절들은 축 <InlineMath math='i'/> 를 움직일 수 없으니
                    식에 나타나지 않는다. 그래서 레시피가 4장에서 <InlineMath math='\mathcal{S}_i'/> 를 읽던 것과
                    같고, 다만 <InlineMath math='\theta = 0'/> 이 아니라 임의의 <InlineMath math='\theta'/> 에서
                    읽는다는 점만 다르다. 예제로 공간 RRRP 체인(회전 축은 모두 수직, 마지막은 prismatic):
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math='J_s(\theta) = \begin{bmatrix}
0 & 0 & 0 & 0 \\ 0 & 0 & 0 & 0 \\ 1 & 1 & 1 & 0 \\
0 & L_1 s_1 & L_1 s_1 + L_2 s_{12} & 0 \\
0 & -L_1 c_1 & -L_1 c_1 - L_2 c_{12} & 0 \\
0 & 0 & 0 & 1
\end{bmatrix}'/>
            </div>
            <T
                en={<p>
                    Read it like a story, column by column — each column answers "if <em>only</em> this joint
                    spins at unit speed, what does the tip frame do?" Column 1: rotation about the base's
                    vertical axis through the origin, so <InlineMath math='\omega = (0,0,1)'/>,{" "}
                    <InlineMath math='v = 0'/>. Columns 2 and 3: the same vertical rotation, but about an axis
                    that joints 1 (and 2) have <em>carried away</em> to{" "}
                    <InlineMath math='q_2 = (L_1c_1, L_1s_1, 0)'/> — hence the{" "}
                    <InlineMath math='v = -\omega\times q'/> entries that grow with the reach. Column 4: the
                    prismatic joint just slides everything up, a pure translation{" "}
                    <InlineMath math='(0, 0, 0, 0, 0, 1)'/>. The <strong>body Jacobian</strong>{" "}
                    <InlineMath math='J_b(\theta)'/> comes from the same computation on{" "}
                    <InlineMath math='[\mathcal{V}_b] = T^{-1}\dot T'/> with the body-form PoE: now the factors{" "}
                    <em>after</em> joint <InlineMath math='i'/> survive,
                </p>}
                ko={<p>
                    열 하나하나를 이야기처럼 읽자 — 각 열은 "<em>이 관절만</em> 단위 속도로 돌면 팁 프레임은 무엇을
                    하는가?"에 답한다. 1열: 원점을 지나는 수직축 회전이라 <InlineMath math='\omega = (0,0,1)'/>,{" "}
                    <InlineMath math='v = 0'/>. 2·3열: 같은 수직 회전이지만 관절 1(과 2)이 축을{" "}
                    <InlineMath math='q_2 = (L_1c_1, L_1s_1, 0)'/> 까지 <em>실어 나른</em> 뒤라서, 팔 길이만큼
                    자라는 <InlineMath math='v = -\omega\times q'/> 성분이 붙는다. 4열: prismatic 관절은 전부를
                    위로 밀 뿐 — 순수 병진 <InlineMath math='(0, 0, 0, 0, 0, 1)'/>. <strong>Body Jacobian</strong>{" "}
                    <InlineMath math='J_b(\theta)'/> 는 body-form PoE 에 같은 계산을{" "}
                    <InlineMath math='[\mathcal{V}_b] = T^{-1}\dot T'/> 로 하면 나온다: 이번엔 관절{" "}
                    <InlineMath math='i'/> <em>뒤의</em> 인자들이 살아남아,
                </p>}
            />
            <BlockMath math={`J_{bi}(\\theta) = \\big[\\mathrm{Ad}_{e^{-[\\mathcal{B}_n]\\theta_n}\\cdots e^{-[\\mathcal{B}_{i+1}]\\theta_{i+1}}}\\big]\\,\\mathcal{B}_i, \\qquad J_{bn} = \\mathcal{B}_n`}/>
            <T
                en={<p>
                    — the screw axis of joint <InlineMath math='i'/> seen from the <em>displaced end-effector
                    frame</em>, unaffected by the joints closer to the base. The two Jacobians are related by
                    the adjoint map,
                </p>}
                ko={<p>
                    — 즉 <em>움직인 end-effector 프레임</em>에서 본 관절 <InlineMath math='i'/> 의 screw 축이며,
                    베이스에 더 가까운 관절들의 영향을 받지 않는다. 두 Jacobian은 adjoint map으로 이어진다,
                </p>}
            />
            <BlockMath math={`J_b(\\theta) = \\big[\\mathrm{Ad}_{T_{bs}}\\big] J_s(\\theta), \\qquad J_s(\\theta) = \\big[\\mathrm{Ad}_{T_{sb}}\\big] J_b(\\theta)`}/>
            <T
                en={<p>
                    Since the adjoint map is always invertible, <InlineMath math='J_s(\theta)'/> and{" "}
                    <InlineMath math='J_b(\theta)'/> always have the <strong>same rank</strong> — singularities are a
                    property of the configuration, not of the frame we chose to describe it in.
                </p>}
                ko={<p>
                    adjoint map은 항상 가역이므로, <InlineMath math='J_s(\theta)'/>와{" "}
                    <InlineMath math='J_b(\theta)'/>는 항상 <strong>같은 랭크</strong>를 갖는다 — Singularity는
                    configuration의 성질이지, 그것을 기술하기 위해 우리가 선택한 프레임의 성질이 아니다.
                </p>}
            />
            <T
                en={<p>
                    Two side notes complete the picture. First, if the task is described by a minimal coordinate
                    vector <InlineMath math='q'/> (say <InlineMath math='(x, y, \theta)'/> for a planar task, or
                    position plus exponential coordinates <InlineMath math='r = \hat\omega\theta'/> in space)
                    instead of a twist, the corresponding <strong>analytic Jacobian</strong>{" "}
                    <InlineMath math='J_a'/> in <InlineMath math='\dot q = J_a(\theta)\dot\theta'/> is just the
                    geometric one wearing a change of coordinates, e.g.
                </p>}
                ko={<p>
                    보조 노트 둘이 그림을 완성한다. 첫째, task 를 twist 대신 최소 좌표 벡터{" "}
                    <InlineMath math='q'/> (평면이면 <InlineMath math='(x, y, \theta)'/>, 공간이면 위치 +
                    exponential 좌표 <InlineMath math='r = \hat\omega\theta'/>)로 기술한다면,{" "}
                    <InlineMath math='\dot q = J_a(\theta)\dot\theta'/> 의 <strong>analytic Jacobian</strong>{" "}
                    <InlineMath math='J_a'/> 는 기하 Jacobian에 좌표 변환을 입힌 것일 뿐이다. 예컨대
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math='J_a(\theta) = \begin{bmatrix} A^{-1}(r) & 0 \\ 0 & R_{sb}(\theta) \end{bmatrix} J_b(\theta),
\qquad \omega_b = A(r)\,\dot r'/>
            </div>
            <T
                en={<p>
                    Second, a preview of the inverse question — given a desired twist{" "}
                    <InlineMath math='\mathcal{V}'/>, which <InlineMath math='\dot\theta'/> produces it? If{" "}
                    <InlineMath math='n = 6'/> and <InlineMath math='J'/> is full rank,{" "}
                    <InlineMath math='\dot\theta = J^{-1}\mathcal{V}'/>. With <InlineMath math='n < 6'/> some
                    twists are simply unreachable; with <InlineMath math='n > 6'/> the robot is{" "}
                    <strong>redundant</strong>: six constraints leave <InlineMath math='n - 6'/> freedoms of{" "}
                    <em>internal motion</em> — plant your palm on a table and your elbow can still swing.
                    Chapter 6 takes this up properly.
                </p>}
                ko={<p>
                    둘째, 역질문의 예고 — 원하는 twist <InlineMath math='\mathcal{V}'/> 가 주어지면 어떤{" "}
                    <InlineMath math='\dot\theta'/> 가 그것을 만드는가? <InlineMath math='n = 6'/> 이고{" "}
                    <InlineMath math='J'/> 가 full rank 면{" "}
                    <InlineMath math='\dot\theta = J^{-1}\mathcal{V}'/>. <InlineMath math='n < 6'/> 이면 어떤
                    twist 는 아예 도달 불가능하고, <InlineMath math='n > 6'/> 이면 로봇은{" "}
                    <strong>redundant(여유자유도)</strong>다: 제약 여섯을 빼고도 <InlineMath math='n - 6'/> 개의{" "}
                    <em>내부 운동</em> 자유가 남는다 — 손바닥을 탁자에 붙여도 팔꿈치는 여전히 흔들 수 있다.
                    6장이 이 질문을 본격적으로 다룬다.
                </p>}
            />

            <T en={<h2>Statics of Open Chains</h2>} ko={<h2>Open Chain의 Statics</h2>}/>
            <T
                en={<p>
                    The Jacobian also governs statics. By conservation of power, at static equilibrium the power
                    delivered by the joint torques equals the power the end-effector exerts on its environment,{" "}
                    <InlineMath math='\tau^{\mathsf T}\dot\theta = \mathcal{F}^{\mathsf T}\mathcal{V}'/>. Substituting{" "}
                    <InlineMath math='\mathcal{V} = J(\theta)\dot\theta'/> and requiring this for all{" "}
                    <InlineMath math='\dot\theta'/> gives the central relation
                </p>}
                ko={<p>
                    Jacobian은 Statics도 지배한다. Power 보존에 의해, 정적 평형에서 관절 토크가 전달하는 power는
                    end-effector가 환경에 가하는 power와 같다,{" "}
                    <InlineMath math='\tau^{\mathsf T}\dot\theta = \mathcal{F}^{\mathsf T}\mathcal{V}'/>. 여기에{" "}
                    <InlineMath math='\mathcal{V} = J(\theta)\dot\theta'/>를 대입하고 모든{" "}
                    <InlineMath math='\dot\theta'/>에 대해 성립하도록 요구하면 핵심 관계식이 나온다
                </p>}
            />
            <BlockMath math={`\\tau = J^{\\mathsf T}(\\theta)\\,\\mathcal{F}`}/>
            <T
                en={<p>
                    So the same Jacobian that maps joint velocities to a twist maps an end-effector wrench{" "}
                    <InlineMath math='\mathcal{F}'/> back to the joint torques needed to balance it. A wrench in the
                    null space of <InlineMath math='J^{\mathsf T}'/> requires no joint torque at all: the structure
                    carries it. This is why an outstretched arm supports a heavy suitcase most easily when the elbow is
                    straight — at that singularity the load passes directly through the joints.
                </p>}
                ko={<p>
                    따라서 관절 속도를 twist로 보내는 바로 그 Jacobian이 end-effector wrench{" "}
                    <InlineMath math='\mathcal{F}'/>를 그것을 평형시키는 데 필요한 관절 토크로 되돌려 보낸다.{" "}
                    <InlineMath math='J^{\mathsf T}'/>의 null space에 있는 wrench는 관절 토크를 전혀 필요로 하지 않는다:
                    구조물이 그것을 떠받친다. 이것이 팔을 뻗었을 때 팔꿈치가 곧게 펴져 있으면 무거운 여행 가방을 가장
                    쉽게 지탱하는 이유다 — 그 Singularity에서 하중이 관절을 곧바로 통과한다.
                </p>}
            />
            <T
                en={<p>
                    The joint count matters here too. If <InlineMath math='n = 6'/> and{" "}
                    <InlineMath math='J^{\mathsf T}'/> is invertible, any wrench can be produced:{" "}
                    <InlineMath math='\mathcal{F} = J^{-\mathsf T}\tau'/>. If <InlineMath math='n < 6'/>, the
                    robot can <em>actively</em> generate wrenches only in an <InlineMath math='n'/>-dimensional
                    subspace, yet it <em>resists</em> the remaining <InlineMath math='6-n'/> directions for
                    free — a motorized door (<InlineMath math='n = 1'/>) can only push its knob along the
                    circle of motion, but resists any other wrench without effort. And if{" "}
                    <InlineMath math='n > 6'/>, even an end-effector cast in concrete leaves internal motions
                    possible — statics alone no longer decides what happens, and dynamics must take over.
                </p>}
                ko={<p>
                    여기서도 관절 수가 중요하다. <InlineMath math='n = 6'/> 이고{" "}
                    <InlineMath math='J^{\mathsf T}'/> 가 가역이면 어떤 wrench 든 만들 수 있다:{" "}
                    <InlineMath math='\mathcal{F} = J^{-\mathsf T}\tau'/>. <InlineMath math='n < 6'/> 이면
                    로봇이 <em>능동적으로</em> 낼 수 있는 wrench 는 <InlineMath math='n'/>차원 부분공간뿐이지만,
                    나머지 <InlineMath math='6-n'/> 방향은 공짜로 <em>버틴다</em> — 모터 달린 문
                    (<InlineMath math='n = 1'/>)은 손잡이를 운동 원호 방향으로만 밀 수 있지만 다른 어떤 wrench 도
                    힘들이지 않고 견딘다. 그리고 <InlineMath math='n > 6'/> 이면 end-effector 를 콘크리트에
                    박아도 내부 운동이 남는다 — 정역학만으로는 결론이 나지 않고 동역학이 넘겨받아야 한다.
                </p>}
            />

            <T en={<h2>Singularities</h2>} ko={<h2>Singularity</h2>}/>
            <T
                en={<p>
                    A <strong>kinematic singularity</strong> is a configuration where <InlineMath math='J(\theta)'/>{" "}
                    loses rank, so the end-effector loses the ability to move instantaneously in one or more directions.
                    For a spatial 6R arm several geometric patterns force a rank drop, for example:
                </p>}
                ko={<p>
                    <strong>Kinematic Singularity</strong>는 <InlineMath math='J(\theta)'/>가 랭크를 잃는 configuration으로,
                    이 때 end-effector는 하나 이상의 방향으로 순간적으로 움직일 능력을 잃는다. 공간 6R 팔의 경우 여러
                    기하학적 패턴이 랭크 하강을 강제한다, 예를 들면:
                </p>}
            />
            <T
                en={<ul className="list-disc pl-6 space-y-1">
                    <li>two revolute joint axes become <strong>collinear</strong>;</li>
                    <li>three revolute axes become <strong>parallel and coplanar</strong>;</li>
                    <li>four revolute axes <strong>intersect at a common point</strong>;</li>
                    <li>six revolute axes all <strong>intersect a common line</strong>.</li>
                </ul>}
                ko={<ul className="list-disc pl-6 space-y-1">
                    <li>두 Revolute Joint 축이 <strong>공선(collinear)</strong>이 된다;</li>
                    <li>세 회전 축이 <strong>평행하고 공면(coplanar)</strong>이 된다;</li>
                    <li>네 회전 축이 <strong>한 공통점에서 만난다</strong>;</li>
                    <li>여섯 회전 축이 모두 <strong>한 공통 직선과 만난다</strong>.</li>
                </ul>}
            />
            <T
                en={<p>
                    In every case two or more Jacobian columns become linearly dependent. The collinear case
                    shows how these are proved: with <InlineMath math='\omega_{s1} = \omega_{s2}'/> and both{" "}
                    <InlineMath math='q_1, q_2'/> on the shared axis,{" "}
                    <InlineMath math='\omega_{s1}\times(q_1 - q_2) = 0'/>, so
                </p>}
                ko={<p>
                    모든 경우에 두 개 이상의 Jacobian 열이 선형 종속이 된다. 공선 케이스가 증명 방식을 보여준다:{" "}
                    <InlineMath math='\omega_{s1} = \omega_{s2}'/> 이고 <InlineMath math='q_1, q_2'/> 가 모두
                    공유 축 위에 있으므로 <InlineMath math='\omega_{s1}\times(q_1 - q_2) = 0'/>, 따라서
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math='J_{s1} = \begin{bmatrix} \omega_{s1} \\ -\omega_{s1}\times q_1 \end{bmatrix}
= \begin{bmatrix} \omega_{s2} \\ -\omega_{s2}\times q_2 \end{bmatrix} = J_{s2}
\quad\Longrightarrow\quad \operatorname{rank} J_s < 6'/>
            </div>
            <T
                en={<p>
                    Because <InlineMath math='J_s'/> and <InlineMath math='J_b'/> share their rank, and
                    relocating the base (<InlineMath math="T' = PT"/>) or the end-effector frame{" "}
                    (<InlineMath math="T' = TQ"/>) cancels out of <InlineMath math='T^{-1}\dot T'/> and{" "}
                    <InlineMath math='\dot TT^{-1}'/> respectively, singularities are intrinsic to the
                    mechanism's posture — not to any choice of frames.
                </p>}
                ko={<p>
                    <InlineMath math='J_s'/>와 <InlineMath math='J_b'/>가 랭크를 공유하고, 베이스 이동
                    (<InlineMath math="T' = PT"/>)은 <InlineMath math='T^{-1}\dot T'/> 에서, end-effector 프레임
                    이동(<InlineMath math="T' = TQ"/>)은 <InlineMath math='\dot TT^{-1}'/> 에서 소거되므로,
                    Singularity는 프레임 선택이 아니라 메커니즘의 자세에 내재된 것이다.
                </p>}
            />

            <T en={<h2>Manipulability and Force Ellipsoids</h2>} ko={<h2>Manipulability Ellipsoid와 Force Ellipsoid</h2>}/>
            <T
                en={<p>
                    How close is a posture to a singularity, and in which directions is the arm nimble or clumsy? Map
                    the unit sphere of "iso-effort" joint velocities <InlineMath math='\|\dot\theta\| = 1'/>{" "}
                    through the Jacobian. Substituting <InlineMath math='\dot\theta = J^{-1}\dot q'/>,
                </p>}
                ko={<p>
                    어떤 자세가 Singularity에 얼마나 가까운지, 그리고 어느 방향으로 팔이 민첩하거나 둔한지?
                    "같은 노력"(iso-effort) 관절 속도의 단위 구 <InlineMath math='\|\dot\theta\| = 1'/> 를 Jacobian 으로
                    보내 보자. <InlineMath math='\dot\theta = J^{-1}\dot q'/> 를 대입하면,
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math='1 = \dot\theta^{\mathsf T}\dot\theta
= \dot q^{\mathsf T}\,(JJ^{\mathsf T})^{-1}\dot q
= \dot q^{\mathsf T}A^{-1}\dot q,
\qquad A = JJ^{\mathsf T}'/>
            </div>
            <T
                en={<p>
                    — the equation of an ellipsoid: this is the <strong>manipulability ellipsoid</strong>. Its
                    principal axes are the eigenvectors of <InlineMath math='A'/>, its semi-axis lengths the{" "}
                    <InlineMath math='\sqrt{\lambda_i}'/> (the singular values <InlineMath math='\ell_i'/> of{" "}
                    <InlineMath math='J'/>), and its volume is proportional to{" "}
                    <InlineMath math='\sqrt{\det A}'/>. A round ellipse means the tip moves equally well in all
                    directions; a thin one means nearly singular; at a singularity it collapses to a line
                    segment.
                </p>}
                ko={<p>
                    — ellipsoid(타원체)의 방정식이다: 이것이 <strong>Manipulability Ellipsoid</strong>다. 주축은{" "}
                    <InlineMath math='A'/> 의 고유벡터, 반축 길이는 <InlineMath math='\sqrt{\lambda_i}'/>{" "}
                    (<InlineMath math='J'/> 의 특이값 <InlineMath math='\ell_i'/>), 부피는{" "}
                    <InlineMath math='\sqrt{\det A}'/> 에 비례한다. 둥근 타원은 팁이 모든 방향으로 똑같이 잘
                    움직인다는 뜻이고, 가느다란 타원은 거의 특이 상태라는 뜻이며, Singularity에서는 선분으로
                    붕괴한다.
                </p>}
            />
            <T
                en={<p>
                    Three scalar summaries are in common use — the axis ratio{" "}
                    <InlineMath math='\mu_1 = \sqrt{\lambda_\text{max}/\lambda_\text{min}} \ge 1'/> (isotropy;
                    1 is best), its square <InlineMath math='\mu_2'/> (the <em>condition number</em> of{" "}
                    <InlineMath math='A'/>), and the volume measure{" "}
                    <InlineMath math='\mu_3 = \sqrt{\det A}'/> (bigger is better).
                </p>}
                ko={<p>
                    숫자 하나로 요약하는 지표도 셋이 흔히 쓰인다 — 긴 축 ÷ 짧은 축 비율{" "}
                    <InlineMath math='\mu_1 = \sqrt{\lambda_\text{max}/\lambda_\text{min}} \ge 1'/> (1에 가까울수록 모든 방향이 고르게 쉽다), 그 제곱 <InlineMath math='\mu_2'/> (<InlineMath math='A'/> 의{" "}
                    <em>condition number</em>), 그리고 부피 지표{" "}
                    <InlineMath math='\mu_3 = \sqrt{\det A}'/> (클수록 좋다).
                </p>}
            />
            <T
                en={<p>
                    Sweep the sliders and watch the ellipse stretch and flatten. The ratio{" "}
                    <InlineMath math='\ell_\text{max}/\ell_\text{min}'/> measures the distance from a singularity — it
                    runs off to infinity as <InlineMath math='\theta_2 \to 0'/>. Toggle the <strong>force
                    ellipsoid</strong>: its axes are the <em>reciprocals</em> of the manipulability axes, so a
                    direction that is easy to move is hard to push in, and vice versa. At a singularity the
                    manipulability ellipse thins to a segment while the force ellipse grows without bound along the
                    orthogonal direction.
                </p>}
                ko={<p>
                    슬라이더를 쓸어 타원이 늘어나고 납작해지는 것을 보라. 비율{" "}
                    <InlineMath math='\ell_\text{max}/\ell_\text{min}'/>은 Singularity로부터의 거리를 측정한다 —{" "}
                    <InlineMath math='\theta_2 \to 0'/>일 때 무한대로 치솟는다. <strong>Force Ellipsoid</strong>를 켜 보라:
                    그 축은 Manipulability 축의 <em>역수</em>이므로, 움직이기 쉬운 방향은 밀어내기 어렵고, 그 반대도 마찬가지다.
                    Singularity에서 Manipulability Ellipse는 선분으로 가늘어지는 반면, Force Ellipse는 직교 방향으로 한없이 커진다.
                </p>}
            />
            <ManipulabilityEllipse/>
            <T
                en={<p>
                    The duality is exact: from <InlineMath math='\tau = J^{\mathsf T}\mathcal{F}'/>, the unit
                    torque sphere <InlineMath math='\|\tau\| = 1'/> maps to the force ellipsoid{" "}
                    <InlineMath math='f^{\mathsf T}B^{-1}f = 1'/> with{" "}
                    <InlineMath math='B = (JJ^{\mathsf T})^{-1} = A^{-1}'/> — same eigenvectors as{" "}
                    <InlineMath math='A'/>, reciprocal semi-axes <InlineMath math='1/\sqrt{\lambda_i}'/>. The
                    product of the two ellipsoid volumes is therefore <em>constant</em> over all postures:
                    tuning a posture for velocity manipulability pays for it in force capability, and vice
                    versa — the suitcase carrier's bargain from the statics section.
                </p>}
                ko={<p>
                    쌍대성은 정확하다: <InlineMath math='\tau = J^{\mathsf T}\mathcal{F}'/> 에서 단위 토크 구{" "}
                    <InlineMath math='\|\tau\| = 1'/> 는 force ellipsoid{" "}
                    <InlineMath math='f^{\mathsf T}B^{-1}f = 1'/>,{" "}
                    <InlineMath math='B = (JJ^{\mathsf T})^{-1} = A^{-1}'/> 로 옮겨진다 —{" "}
                    <InlineMath math='A'/> 와 고유벡터는 같고 반축은 역수 <InlineMath math='1/\sqrt{\lambda_i}'/>.
                    따라서 두 ellipsoid 부피의 곱은 어떤 자세에서도 <em>일정</em>하다: 속도 manipulability를 좋게 잡은 자세는
                    힘 능력에서 대가를 치르고, 그 반대도 마찬가지다 — 정역학 절의 여행 가방 이야기가 바로 이
                    거래다.
                </p>}
            />
        </>
    )
}

export default Chapter5
