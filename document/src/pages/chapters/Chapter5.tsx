import {BlockMath, InlineMath} from "../../components/math/Tex";
import JacobianColumns from "../../components/pages/chapter5/JacobianColumns";
import ManipulabilityEllipse from "../../components/pages/chapter5/ManipulabilityEllipse";
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
                    configuration — it changes as the robot moves.
                </p>}
                ko={<p>
                    행렬 <InlineMath math='J(\theta)'/>가 <strong>Jacobian</strong>이다. 이는 관절 속도에서 end-effector
                    속도로의 선형 사상이며, 삼각 함수 항이 configuration에 의존하기 때문에 로봇이 움직임에 따라 변한다.
                </p>}
            />
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
                    end-effector frame (<InlineMath math='\mathcal{V}_b'/>), there are two Jacobians. The{" "}
                    <strong>space Jacobian</strong> <InlineMath math='J_s(\theta)'/> satisfies{" "}
                    <InlineMath math='\mathcal{V}_s = J_s(\theta)\dot\theta'/>, with columns
                </p>}
                ko={<p>
                    twist가 고정 프레임(<InlineMath math='\mathcal{V}_s'/>) 또는 end-effector 프레임
                    (<InlineMath math='\mathcal{V}_b'/>)으로 쓰일 수 있듯이, 두 개의 Jacobian이 있다.{" "}
                    <strong>Space Jacobian</strong> <InlineMath math='J_s(\theta)'/>는{" "}
                    <InlineMath math='\mathcal{V}_s = J_s(\theta)\dot\theta'/>를 만족하며, 그 열은
                </p>}
            />
            <BlockMath math={`J_{si}(\\theta) = \\big[\\mathrm{Ad}_{e^{[\\mathcal{S}_1]\\theta_1}\\cdots e^{[\\mathcal{S}_{i-1}]\\theta_{i-1}}}\\big]\\,\\mathcal{S}_i, \\qquad J_{s1} = \\mathcal{S}_1`}/>
            <T
                en={<p>
                    Each column is the joint screw axis <InlineMath math='\mathcal{S}_i'/> after it has been carried
                    along by the first <InlineMath math='i-1'/> joints. The <strong>body Jacobian</strong>{" "}
                    <InlineMath math='J_b(\theta)'/> satisfies <InlineMath math='\mathcal{V}_b = J_b(\theta)\dot\theta'/>,
                    with columns built the same way from the body screw axes <InlineMath math='\mathcal{B}_i'/>, working
                    inward from the last joint. The two are related by the adjoint map,
                </p>}
                ko={<p>
                    각 열은 처음 <InlineMath math='i-1'/>개의 관절에 의해 실려 옮겨진 뒤의 관절 screw 축{" "}
                    <InlineMath math='\mathcal{S}_i'/>이다. <strong>Body Jacobian</strong>{" "}
                    <InlineMath math='J_b(\theta)'/>는 <InlineMath math='\mathcal{V}_b = J_b(\theta)\dot\theta'/>를
                    만족하며, 그 열은 물체 screw 축 <InlineMath math='\mathcal{B}_i'/>로부터 마지막 관절에서 안쪽으로
                    같은 방식으로 만들어진다. 둘은 수반 사상으로 관계된다,
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
                    수반 사상은 항상 가역이므로, <InlineMath math='J_s(\theta)'/>와{" "}
                    <InlineMath math='J_b(\theta)'/>는 항상 <strong>같은 랭크</strong>를 갖는다 — Singularity는
                    configuration의 성질이지, 그것을 기술하기 위해 우리가 선택한 프레임의 성질이 아니다.
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
                    Jacobian은 Statics도 지배한다. 일률 보존에 의해, 정적 평형에서 관절 토크가 전달하는 일률은
                    end-effector가 환경에 가하는 일률과 같다,{" "}
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
                    따라서 관절 속도를 twist로 사상하는 바로 그 Jacobian이 end-effector wrench{" "}
                    <InlineMath math='\mathcal{F}'/>를 그것을 평형시키는 데 필요한 관절 토크로 되사상한다.{" "}
                    <InlineMath math='J^{\mathsf T}'/>의 영공간에 있는 wrench는 관절 토크를 전혀 필요로 하지 않는다:
                    구조물이 그것을 떠받친다. 이것이 팔을 뻗었을 때 팔꿈치가 곧게 펴져 있으면 무거운 여행 가방을 가장
                    쉽게 지탱하는 이유다 — 그 Singularity에서 하중이 관절을 곧바로 통과한다.
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
                    In every case two or more Jacobian columns become linearly dependent. Because{" "}
                    <InlineMath math='J_s'/> and <InlineMath math='J_b'/> share their rank, and relocating the base or
                    the end-effector frame leaves the Jacobian's rank unchanged, singularities are intrinsic to the
                    mechanism's posture.
                </p>}
                ko={<p>
                    모든 경우에 두 개 이상의 Jacobian 열이 선형 종속이 된다.{" "}
                    <InlineMath math='J_s'/>와 <InlineMath math='J_b'/>가 랭크를 공유하고, 베이스나 end-effector 프레임을
                    옮겨도 Jacobian의 랭크가 변하지 않기 때문에, Singularity는 메커니즘의 자세에 내재된 것이다.
                </p>}
            />

            <T en={<h2>Manipulability and Force Ellipsoids</h2>} ko={<h2>Manipulability Ellipsoid와 Force Ellipsoid</h2>}/>
            <T
                en={<p>
                    How close is a posture to a singularity, and in which directions is the arm nimble or clumsy? Map
                    the unit circle of "iso-effort" joint velocities through the Jacobian: it becomes the{" "}
                    <strong>manipulability ellipsoid</strong>, whose principal axes are the eigenvectors of{" "}
                    <InlineMath math='J J^{\mathsf T}'/> and whose semi-axis lengths are the singular values{" "}
                    <InlineMath math='\ell_i'/> of <InlineMath math='J'/>. A round ellipse means the tip moves equally
                    well in all directions; a thin one means it is nearly singular; at a singularity it collapses to a
                    line segment.
                </p>}
                ko={<p>
                    어떤 자세가 Singularity에 얼마나 가까운지, 그리고 어느 방향으로 팔이 민첩하거나 둔한지? "등노력(iso-effort)"
                    관절 속도의 단위 원을 Jacobian으로 사상하라: 그것은 <strong>Manipulability Ellipsoid</strong>가 되며, 그 주축은{" "}
                    <InlineMath math='J J^{\mathsf T}'/>의 고유벡터이고 반축 길이는 <InlineMath math='J'/>의 특이값{" "}
                    <InlineMath math='\ell_i'/>이다. 둥근 타원은 팁이 모든 방향으로 똑같이 잘 움직인다는 뜻이고, 가느다란
                    타원은 거의 특이 상태라는 뜻이며, Singularity에서는 선분으로 붕괴한다.
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
        </>
    )
}

export default Chapter5
