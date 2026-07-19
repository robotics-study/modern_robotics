import {BlockMath, InlineMath} from "../../components/math/Tex";
import GearedMotor from "../../components/pages/chapter8/GearedMotor";
import MassMatrixEllipse from "../../components/pages/chapter8/MassMatrixEllipse";
import NewtonEulerPasses from "../../components/pages/chapter8/NewtonEulerPasses";
import TwoRDynamics from "../../components/pages/chapter8/TwoRDynamics";
import {T} from "../../libs/i18n";

const Chapter8 = () => {
    return (
        <>
            <T en={<h2>The Equations of Motion</h2>} ko={<h2>운동 방정식</h2>}/>
            <T
                en={<p>
                    Kinematics answers <em>where</em> a robot can go; <strong>dynamics</strong> answers what forces and
                    torques make it go there. For an open chain the relationship between joint torques and joint motion
                    is captured by the <strong>equations of motion</strong>,
                </p>}
                ko={<p>
                    기구학은 로봇이 <em>어디로</em> 갈 수 있는지 답하고, <strong>dynamics</strong>는 어떤 힘과 토크가
                    로봇을 그곳으로 가게 하는지 답한다. Open Chain에서 관절 토크와 관절 운동 사이의 관계는{" "}
                    <strong>운동 방정식</strong>으로 표현된다,
                </p>}
            />
            <BlockMath math={`\\tau = M(\\theta)\\,\\ddot\\theta + h(\\theta, \\dot\\theta)`}/>
            <T
                en={<p>
                    Here <InlineMath math='M(\theta)'/> is the <InlineMath math='n \times n'/>{" "}
                    <strong>mass matrix</strong>: symmetric, positive definite, and configuration-dependent, because a
                    folded arm carries its inertia differently than an extended one. The term{" "}
                    <InlineMath math='h(\theta, \dot\theta)'/> lumps together everything that is not proportional to
                    acceleration: <strong>centripetal</strong> and <strong>Coriolis</strong> forces (quadratic in{" "}
                    <InlineMath math='\dot\theta'/>), <strong>gravity</strong>, and friction. Two dual problems fall out
                    of this one equation:
                </p>}
                ko={<p>
                    여기서 <InlineMath math='M(\theta)'/>는 <InlineMath math='n \times n'/>{" "}
                    <strong>mass matrix</strong>다. 대칭이고 positive definite이며, 접힌 팔은 펼쳐진 팔과 관성을 다르게
                    지니기 때문에 configuration에 의존한다. <InlineMath math='h(\theta, \dot\theta)'/> 항은 가속도에
                    비례하지 않는 모든 것을 한데 묶는다. <strong>구심</strong>력과 <strong>Coriolis</strong>력
                    (<InlineMath math='\dot\theta'/>에 대한 이차항), <strong>중력</strong>, 그리고 마찰이다. 이 하나의
                    방정식에서 서로 쌍을 이루는 두 문제가 나온다:
                </p>}
            />
            <T
                en={<ul className="list-disc pl-6 space-y-1">
                    <li>
                        <strong>Inverse dynamics</strong>: given a desired motion{" "}
                        <InlineMath math='(\theta, \dot\theta, \ddot\theta)'/>, compute the torques{" "}
                        <InlineMath math='\tau'/> that produce it. This is what a controller evaluates to command the
                        motors.
                    </li>
                    <li>
                        <strong>Forward dynamics</strong>: given the applied torques{" "}
                        <InlineMath math='(\theta, \dot\theta, \tau)'/>, solve for the resulting acceleration{" "}
                        <InlineMath math='\ddot\theta = M^{-1}(\theta)\big(\tau - h(\theta, \dot\theta)\big)'/>. This is
                        the basis of <strong>simulation</strong>.
                    </li>
                </ul>}
                ko={<ul className="list-disc pl-6 space-y-1">
                    <li>
                        <strong>Inverse dynamics</strong>: 원하는 운동{" "}
                        <InlineMath math='(\theta, \dot\theta, \ddot\theta)'/>이 주어지면, 그것을 만들어 내는 토크{" "}
                        <InlineMath math='\tau'/>를 계산한다. 제어기가 모터에 명령하기 위해 평가하는 것이 이것이다.
                    </li>
                    <li>
                        <strong>Forward dynamics</strong>: 가해진 토크{" "}
                        <InlineMath math='(\theta, \dot\theta, \tau)'/>가 주어지면, 그 결과인 가속도{" "}
                        <InlineMath math='\ddot\theta = M^{-1}(\theta)\big(\tau - h(\theta, \dot\theta)\big)'/>를 구한다.
                        이것이 <strong>시뮬레이션</strong>의 기초다.
                    </li>
                </ul>}
            />
            <T
                en={<p>
                    There are two standard routes to these equations. The <strong>Lagrangian</strong> formulation is
                    energy-based: choose <strong>generalized coordinates</strong> <InlineMath math='q'/> (for a fully
                    actuated open chain, simply the joint values <InlineMath math='\theta'/>), form the Lagrangian from
                    kinetic minus potential energy, and differentiate:
                </p>}
                ko={<p>
                    이 방정식에 이르는 두 가지 표준 경로가 있다. <strong>Lagrangian</strong> 정식화는 에너지 기반이다.{" "}
                    <strong>일반화 좌표</strong> <InlineMath math='q'/>를 고르고 (모든 관절이 구동되는 Open Chain에서는
                    그냥 관절 값 <InlineMath math='\theta'/>), 운동 에너지에서 위치 에너지를 뺀 Lagrangian을 만들어
                    미분한다:
                </p>}
            />
            <BlockMath math={`\\mathcal{L}(q, \\dot q) = \\mathcal{K}(q, \\dot q) - \\mathcal{P}(q), \\qquad
\\tau = \\frac{d}{dt}\\frac{\\partial \\mathcal{L}}{\\partial \\dot q} - \\frac{\\partial \\mathcal{L}}{\\partial q}`}/>
            <T
                en={<p>
                    A one-line warm-up shows the machinery working. A particle of mass <InlineMath math='m'/> moves on
                    a vertical line with height <InlineMath math='x'/>, pushed up by a force <InlineMath math='f'/>{" "}
                    under gravity <InlineMath math='g'/>:
                </p>}
                ko={<p>
                    한 줄짜리 몸풀기로 이 장치가 도는 것을 보자. 질량 <InlineMath math='m'/>인 질점이 수직선 위에서 높이{" "}
                    <InlineMath math='x'/>로 움직이고, 중력 <InlineMath math='g'/> 아래에서 힘{" "}
                    <InlineMath math='f'/>가 위로 민다:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math={`\\mathcal{L} = \\tfrac12 m\\dot x^2 - mgx
\\;\\;\\Longrightarrow\\;\\;
f = \\frac{d}{dt}\\frac{\\partial \\mathcal{L}}{\\partial \\dot x} - \\frac{\\partial \\mathcal{L}}{\\partial x}
= m\\ddot x + mg`}/>
            </div>
            <T
                en={<p>
                    which is exactly Newton's <InlineMath math='f - mg = m\ddot x'/>. The{" "}
                    <strong>Newton&ndash;Euler</strong> formulation instead applies rigid-body force balances
                    recursively along the chain and stays efficient for any number of joints. We work the Lagrangian
                    route by hand on a 2R arm first.
                </p>}
                ko={<p>
                    Newton의 <InlineMath math='f - mg = m\ddot x'/> 그대로다.{" "}
                    <strong>Newton&ndash;Euler</strong> 정식화는 대신 강체 힘 균형을 체인을 따라 재귀적으로 적용하며,
                    관절이 몇 개든 효율을 유지한다. 먼저 2R 팔에 Lagrangian 경로를 손으로 밟아 보자.
                </p>}
            />

            <T en={<h2>Lagrangian Dynamics of a 2R Arm</h2>} ko={<h2>2R 팔의 Lagrangian Dynamics</h2>}/>
            <T
                en={<p>
                    Take the planar 2R arm with point masses <InlineMath math='m_1, m_2'/> at the ends of links of
                    length <InlineMath math='L_1, L_2'/>, gravity <InlineMath math='g'/> acting in{" "}
                    <InlineMath math='-\hat y'/>. The derivation is five short steps.
                </p>}
                ko={<p>
                    길이 <InlineMath math='L_1, L_2'/>인 링크 끝에 점질량 <InlineMath math='m_1, m_2'/>가 달리고, 중력{" "}
                    <InlineMath math='g'/>가 <InlineMath math='-\hat y'/> 방향으로 작용하는 평면 2R 팔을 잡자. 유도는
                    짧은 다섯 단계다.
                </p>}
            />
            <ol className="list-decimal pl-6 space-y-1">
                <li>
                    <T
                        en={<span>Write the mass positions from the joint angles:</span>}
                        ko={<span>관절 각으로 질량 위치를 적는다:</span>}
                    />
                    <div className="overflow-x-auto">
                        <BlockMath math={`\\begin{bmatrix} x_1 \\\\ y_1 \\end{bmatrix} =
\\begin{bmatrix} L_1\\cos\\theta_1 \\\\ L_1\\sin\\theta_1 \\end{bmatrix}, \\qquad
\\begin{bmatrix} x_2 \\\\ y_2 \\end{bmatrix} =
\\begin{bmatrix} L_1\\cos\\theta_1 + L_2\\cos(\\theta_1{+}\\theta_2) \\\\ L_1\\sin\\theta_1 + L_2\\sin(\\theta_1{+}\\theta_2) \\end{bmatrix}`}/>
                    </div>
                </li>
                <li>
                    <T
                        en={<span>Differentiate in time for the velocities (chain rule through{" "}
                            <InlineMath math='\theta_1(t), \theta_2(t)'/>):</span>}
                        ko={<span>시간 미분으로 속도를 얻는다 (<InlineMath math='\theta_1(t), \theta_2(t)'/>를 통한
                            연쇄 법칙):</span>}
                    />
                    <div className="overflow-x-auto">
                        <BlockMath math={`\\dot x_2 = -L_1\\dot\\theta_1\\sin\\theta_1 - L_2(\\dot\\theta_1{+}\\dot\\theta_2)\\sin(\\theta_1{+}\\theta_2), \\qquad
\\dot y_2 = L_1\\dot\\theta_1\\cos\\theta_1 + L_2(\\dot\\theta_1{+}\\dot\\theta_2)\\cos(\\theta_1{+}\\theta_2)`}/>
                    </div>
                </li>
                <li>
                    <T
                        en={<span>Kinetic energy <InlineMath math='\mathcal{K}_i = \tfrac12 m_i(\dot x_i^2 + \dot y_i^2)'/>.
                            Squaring and adding, the cross terms collect into a{" "}
                            <InlineMath math='\cos\theta_2'/>:</span>}
                        ko={<span>운동 에너지 <InlineMath math='\mathcal{K}_i = \tfrac12 m_i(\dot x_i^2 + \dot y_i^2)'/>.
                            제곱해 더하면 교차항이 <InlineMath math='\cos\theta_2'/>로 모인다:</span>}
                    />
                    <div className="overflow-x-auto">
                        <BlockMath math={`\\mathcal{K}_1 = \\tfrac12 m_1 L_1^2\\dot\\theta_1^2, \\qquad
\\mathcal{K}_2 = \\tfrac12 m_2\\Big( (L_1^2 + 2L_1L_2\\cos\\theta_2 + L_2^2)\\dot\\theta_1^2
+ 2(L_2^2 + L_1L_2\\cos\\theta_2)\\dot\\theta_1\\dot\\theta_2 + L_2^2\\dot\\theta_2^2 \\Big)`}/>
                    </div>
                </li>
                <li>
                    <T
                        en={<span>Potential energy is just <InlineMath math='m g y'/> for each mass:</span>}
                        ko={<span>위치 에너지는 질량마다 <InlineMath math='m g y'/>다:</span>}
                    />
                    <BlockMath math={`\\mathcal{P}_1 = m_1 g L_1\\sin\\theta_1, \\qquad
\\mathcal{P}_2 = m_2 g\\big(L_1\\sin\\theta_1 + L_2\\sin(\\theta_1{+}\\theta_2)\\big)`}/>
                </li>
                <li>
                    <T
                        en={<span>Apply{" "}
                            <InlineMath math='\tau_i = \tfrac{d}{dt}\,\partial\mathcal{L}/\partial\dot\theta_i - \partial\mathcal{L}/\partial\theta_i'/>{" "}
                            for <InlineMath math='i = 1, 2'/>. The time derivative of{" "}
                            <InlineMath math='\partial\mathcal{L}/\partial\dot\theta_i'/> produces the{" "}
                            <InlineMath math='\ddot\theta'/> terms plus <InlineMath math='\dot\theta'/>-squared terms
                            (from differentiating <InlineMath math='\cos\theta_2'/> in time), and{" "}
                            <InlineMath math='\partial\mathcal{L}/\partial\theta_i'/> contributes the rest:</span>}
                        ko={<span><InlineMath math='i = 1, 2'/>에 대해{" "}
                            <InlineMath math='\tau_i = \tfrac{d}{dt}\,\partial\mathcal{L}/\partial\dot\theta_i - \partial\mathcal{L}/\partial\theta_i'/>를
                            적용한다. <InlineMath math='\partial\mathcal{L}/\partial\dot\theta_i'/>의 시간 미분이{" "}
                            <InlineMath math='\ddot\theta'/> 항과 (<InlineMath math='\cos\theta_2'/>를 시간 미분하며
                            나오는) <InlineMath math='\dot\theta'/> 제곱 항들을 만들고,{" "}
                            <InlineMath math='\partial\mathcal{L}/\partial\theta_i'/>가 나머지를 채운다:</span>}
                    />
                    <div className="overflow-x-auto">
                        <BlockMath math={`\\begin{aligned}
\\tau_1 &= \\big(m_1L_1^2 + m_2(L_1^2 + 2L_1L_2\\cos\\theta_2 + L_2^2)\\big)\\ddot\\theta_1
+ m_2(L_1L_2\\cos\\theta_2 + L_2^2)\\ddot\\theta_2\\\\
&\\quad - m_2L_1L_2\\sin\\theta_2\\,(2\\dot\\theta_1\\dot\\theta_2 + \\dot\\theta_2^2)
+ (m_1{+}m_2)L_1g\\cos\\theta_1 + m_2gL_2\\cos(\\theta_1{+}\\theta_2)\\\\[4pt]
\\tau_2 &= m_2(L_1L_2\\cos\\theta_2 + L_2^2)\\ddot\\theta_1 + m_2L_2^2\\ddot\\theta_2
+ m_2L_1L_2\\dot\\theta_1^2\\sin\\theta_2 + m_2gL_2\\cos(\\theta_1{+}\\theta_2)
\\end{aligned}`}/>
                    </div>
                </li>
            </ol>
            <T
                en={<p>
                    Gathering terms into <InlineMath math='\tau = M(\theta)\ddot\theta + c(\theta,\dot\theta) + g(\theta)'/>:
                </p>}
                ko={<p>
                    항을 <InlineMath math='\tau = M(\theta)\ddot\theta + c(\theta,\dot\theta) + g(\theta)'/>로 모으면:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math={`M(\\theta) = \\begin{bmatrix} m_1 L_1^2 + m_2\\big(L_1^2 + 2 L_1 L_2 \\cos\\theta_2 + L_2^2\\big) & m_2\\big(L_1 L_2 \\cos\\theta_2 + L_2^2\\big) \\\\[4pt] m_2\\big(L_1 L_2 \\cos\\theta_2 + L_2^2\\big) & m_2 L_2^2 \\end{bmatrix}`}/>
            </div>
            <div className="overflow-x-auto">
                <BlockMath math={`c(\\theta, \\dot\\theta) = \\begin{bmatrix} -m_2 L_1 L_2 \\sin\\theta_2\\,\\big(2\\dot\\theta_1\\dot\\theta_2 + \\dot\\theta_2^2\\big) \\\\[4pt] m_2 L_1 L_2\\,\\dot\\theta_1^2 \\sin\\theta_2 \\end{bmatrix}, \\qquad
g(\\theta) = \\begin{bmatrix} (m_1 + m_2) L_1 g \\cos\\theta_1 + m_2 g L_2 \\cos(\\theta_1 + \\theta_2) \\\\[4pt] m_2 g L_2 \\cos(\\theta_1 + \\theta_2) \\end{bmatrix}`}/>
            </div>
            <T
                en={<p>
                    Look at the <em>structure</em> rather than the algebra. The equations are <strong>linear in{" "}
                    <InlineMath math='\ddot\theta'/></strong>, <strong>quadratic in{" "}
                    <InlineMath math='\dot\theta'/></strong>, and <strong>trigonometric in{" "}
                    <InlineMath math='\theta'/></strong>. The <InlineMath math='\dot\theta_i^2'/> terms are{" "}
                    <strong>centripetal</strong>: they pull each mass toward the joint it circles, keeping it on its
                    circular path. The <InlineMath math='\dot\theta_i\dot\theta_j'/> cross terms are{" "}
                    <strong>Coriolis</strong>: when joint 2 folds while joint 1 spins, <InlineMath math='m_2'/> moves
                    closer to joint 1, its inertia about joint 1 drops, and joint 1 must brake to keep{" "}
                    <InlineMath math='\dot\theta_1'/> constant, exactly like a skater pulling in her arms. So{" "}
                    <InlineMath math='\ddot\theta = 0'/> does <em>not</em> mean the masses stop accelerating.
                </p>}
                ko={<p>
                    대수보다 <em>구조</em>를 보자. 이 방정식은 <strong><InlineMath math='\ddot\theta'/>에 대해
                    선형</strong>, <strong><InlineMath math='\dot\theta'/>에 대해 이차</strong>,{" "}
                    <strong><InlineMath math='\theta'/>에 대해 삼각함수적</strong>이다.{" "}
                    <InlineMath math='\dot\theta_i^2'/> 항은 <strong>구심</strong> 항이다. 각 질량을 자기가 도는 관절
                    쪽으로 당겨 원 궤도에 붙들어 둔다. <InlineMath math='\dot\theta_i\dot\theta_j'/> 교차항은{" "}
                    <strong>Coriolis</strong> 항이다. 관절 1이 도는 동안 관절 2가 접히면{" "}
                    <InlineMath math='m_2'/>가 관절 1에 가까워지고, 관절 1에 대한 관성이 줄어들어, 관절 1은{" "}
                    <InlineMath math='\dot\theta_1'/>을 일정하게 유지하려면 브레이크를 걸어야 한다. 팔을 끌어당기는
                    스케이터와 정확히 같다. 그래서 <InlineMath math='\ddot\theta = 0'/>이라고 질량의 가속도가 0인 것이{" "}
                    <em>아니다</em>.
                </p>}
            />
            <T
                en={<p>
                    Crucially, the off-diagonal entry{" "}
                    <InlineMath math='M_{12} = m_2(L_1 L_2 \cos\theta_2 + L_2^2)'/> is generally nonzero: the joints
                    are <strong>inertially coupled</strong>, so an acceleration commanded at joint 1 exerts a reaction
                    torque at joint 2, and vice versa. The figure below integrates exactly these equations in real
                    time. With torques at zero and gravity on, the arm is a <strong>double pendulum</strong>. Nudge the
                    joint torques, toggle gravity, or switch on gravity compensation and watch the same model respond.
                </p>}
                ko={<p>
                    결정적으로 비대각 성분{" "}
                    <InlineMath math='M_{12} = m_2(L_1 L_2 \cos\theta_2 + L_2^2)'/>는 일반적으로 0이 아니다. 관절들이{" "}
                    <strong>관성적으로 결합</strong>되어 있어, 관절 1에 명령한 가속도가 관절 2에 반작용 토크를 만들고
                    그 반대도 마찬가지다. 아래 그림은 바로 이 방정식을 실시간으로 적분한다. 토크가 0이고 중력이 켜져
                    있으면 팔은 <strong>이중 진자</strong>다. 관절 토크를 살짝 건드리고, 중력을 토글하고, 중력 보상을
                    켜서 같은 모델이 어떻게 반응하는지 보라.
                </p>}
            />
            <TwoRDynamics/>
            <T
                en={<p>
                    The same recipe runs for any <InlineMath math='n'/>. For rigid links the kinetic energy is always a
                    quadratic form <InlineMath math='\mathcal{K} = \tfrac12\dot\theta^{\mathsf T}M(\theta)\dot\theta'/>{" "}
                    (proved constructively in the Newton&ndash;Euler section below), and grinding the Euler&ndash;Lagrange
                    equation through it produces the general pattern in three steps:
                </p>}
                ko={<p>
                    같은 요리법이 임의의 <InlineMath math='n'/>에서 돈다. 강체 링크라면 운동 에너지는 항상 이차형식{" "}
                    <InlineMath math='\mathcal{K} = \tfrac12\dot\theta^{\mathsf T}M(\theta)\dot\theta'/>이고 (아래
                    Newton&ndash;Euler 절에서 구성적으로 증명한다), 여기에 Euler&ndash;Lagrange 방정식을 돌리면 일반
                    패턴이 세 단계로 나온다:
                </p>}
            />
            <ol className="list-decimal pl-6 space-y-1">
                <li>
                    <T
                        en={<span>Differentiate the kinetic energy in <InlineMath math='\dot\theta_i'/>, then in time.
                            The chain rule through <InlineMath math='m_{ij}(\theta(t))'/> spawns velocity
                            products:</span>}
                        ko={<span>운동 에너지를 <InlineMath math='\dot\theta_i'/>로, 그다음 시간으로 미분한다.{" "}
                            <InlineMath math='m_{ij}(\theta(t))'/>를 통한 연쇄 법칙이 속도 곱을 낳는다:</span>}
                    />
                    <div className="overflow-x-auto">
                        <BlockMath math={`\\frac{d}{dt}\\frac{\\partial \\mathcal{L}}{\\partial \\dot\\theta_i}
= \\frac{d}{dt}\\sum_j m_{ij}\\dot\\theta_j
= \\sum_j m_{ij}\\ddot\\theta_j + \\sum_{j,k}\\frac{\\partial m_{ij}}{\\partial \\theta_k}\\dot\\theta_j\\dot\\theta_k`}/>
                    </div>
                </li>
                <li>
                    <T
                        en={<span>Differentiate in <InlineMath math='\theta_i'/>:</span>}
                        ko={<span><InlineMath math='\theta_i'/>로 미분한다:</span>}
                    />
                    <div className="overflow-x-auto">
                        <BlockMath math={`\\frac{\\partial \\mathcal{L}}{\\partial \\theta_i}
= \\frac12\\sum_{j,k}\\frac{\\partial m_{jk}}{\\partial \\theta_i}\\dot\\theta_j\\dot\\theta_k
- \\frac{\\partial \\mathcal{P}}{\\partial \\theta_i}`}/>
                    </div>
                </li>
                <li>
                    <T
                        en={<span>Subtract, and symmetrize the velocity-product coefficients over{" "}
                            <InlineMath math='j \leftrightarrow k'/> (both orders of{" "}
                            <InlineMath math='\dot\theta_j\dot\theta_k'/> appear in the sum). The symmetrized
                            coefficients are the <strong>Christoffel symbols</strong> of{" "}
                            <InlineMath math='M(\theta)'/>:</span>}
                        ko={<span>빼고, 속도 곱 계수를 <InlineMath math='j \leftrightarrow k'/>에 대해 대칭화한다
                            (합 안에 <InlineMath math='\dot\theta_j\dot\theta_k'/>의 두 순서가 모두 있다). 대칭화된
                            계수가 <InlineMath math='M(\theta)'/>의 <strong>Christoffel 기호</strong>다:</span>}
                    />
                    <div className="overflow-x-auto">
                        <BlockMath math={`\\tau_i = \\sum_j m_{ij}(\\theta)\\ddot\\theta_j
+ \\sum_{j,k}\\Gamma_{ijk}(\\theta)\\dot\\theta_j\\dot\\theta_k + \\frac{\\partial \\mathcal{P}}{\\partial \\theta_i},
\\qquad
\\Gamma_{ijk} = \\frac12\\left(\\frac{\\partial m_{ij}}{\\partial \\theta_k}
+ \\frac{\\partial m_{ik}}{\\partial \\theta_j} - \\frac{\\partial m_{jk}}{\\partial \\theta_i}\\right)`}/>
                    </div>
                </li>
            </ol>
            <T
                en={<p>
                    So the entire Coriolis/centripetal vector <InlineMath math='c(\theta, \dot\theta)'/> is generated
                    by derivatives of the mass matrix alone, and gravity is just{" "}
                    <InlineMath math='g(\theta) = \partial\mathcal{P}/\partial\theta'/>.
                </p>}
                ko={<p>
                    즉 Coriolis/구심 벡터 <InlineMath math='c(\theta, \dot\theta)'/> 전체가 mass matrix의 미분만으로
                    생성되고, 중력은 그저 <InlineMath math='g(\theta) = \partial\mathcal{P}/\partial\theta'/>다.
                </p>}
            />
            <T
                en={<p>
                    How should you <em>feel</em> the mass matrix? For a point mass, <InlineMath math='f = m\ddot x'/>{" "}
                    means acceleration is always parallel to force. With a matrix <InlineMath math='M(\theta)'/> that
                    is no longer true: the effective mass differs by direction, so{" "}
                    <InlineMath math='\ddot\theta'/> is generally <em>not</em> parallel to <InlineMath math='\tau'/>.
                    Mapping the unit circle of torques through <InlineMath math='M^{-1}'/> gives an{" "}
                    <strong>acceleration ellipse</strong>; its principal axes are the eigenvectors of{" "}
                    <InlineMath math='M(\theta)'/>, and only along those axes do torque and acceleration line up. Sweep{" "}
                    <InlineMath math='\theta_2'/> below and watch the ellipse round out as the arm folds and stretch as
                    it straightens:
                </p>}
                ko={<p>
                    Mass matrix는 어떻게 <em>체감</em>해야 할까? 점질량에서는 <InlineMath math='f = m\ddot x'/>라
                    가속도가 항상 힘과 평행하다. 행렬 <InlineMath math='M(\theta)'/>에서는 더 이상 그렇지 않다. 유효
                    질량이 방향마다 달라서 <InlineMath math='\ddot\theta'/>는 일반적으로{" "}
                    <InlineMath math='\tau'/>와 평행하지 <em>않다</em>. 토크의 단위 원을{" "}
                    <InlineMath math='M^{-1}'/>로 보내면 <strong>가속도 타원</strong>이 되고, 그 주축은{" "}
                    <InlineMath math='M(\theta)'/>의 고유벡터이며, 그 축 위에서만 토크와 가속도가 나란해진다. 아래에서{" "}
                    <InlineMath math='\theta_2'/>를 훑으며 팔이 접힐 때 타원이 둥글어지고 펴질 때 늘어나는 것을 보라:
                </p>}
            />
            <MassMatrixEllipse/>
            <T
                en={<p>
                    The same idea transfers to the end-effector. Kinetic energy cannot depend on the coordinates used,
                    so with <InlineMath math='V = J(\theta)\dot\theta'/> (and <InlineMath math='J'/> invertible),
                </p>}
                ko={<p>
                    같은 아이디어가 end-effector로 옮겨진다. 운동 에너지는 어떤 좌표로 쓰든 같아야 하므로,{" "}
                    <InlineMath math='V = J(\theta)\dot\theta'/> (<InlineMath math='J'/> 가역)에 대해,
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math={`\\tfrac12\\dot\\theta^{\\mathsf T}M\\dot\\theta
= \\tfrac12 (J^{-1}V)^{\\mathsf T}M(J^{-1}V)
= \\tfrac12 V^{\\mathsf T}\\underbrace{J^{-\\mathsf T}MJ^{-1}}_{\\Lambda(\\theta)}V`}/>
            </div>
            <T
                en={<p>
                    <InlineMath math='\Lambda(\theta) = J^{-\mathsf T}M(\theta)J^{-1}'/> is the mass the world feels
                    when it grabs the end-effector: grab the tip of a 2R arm and push in different directions, and
                    unless <InlineMath math='\Lambda = cI'/> it feels lighter one way and heavier another. This
                    configuration-dependent apparent mass is a real nuisance for haptic devices, which is one reason
                    their links are made light.
                </p>}
                ko={<p>
                    <InlineMath math='\Lambda(\theta) = J^{-\mathsf T}M(\theta)J^{-1}'/>가 세상이 end-effector를 잡았을
                    때 느끼는 질량이다. 2R 팔의 끝을 잡고 여러 방향으로 밀어 보면,{" "}
                    <InlineMath math='\Lambda = cI'/>가 아닌 한 어떤 방향은 가볍고 어떤 방향은 무겁게 느껴진다. 이
                    configuration 의존 겉보기 질량은 햅틱 장치에 실제 골칫거리이고, 그래서 링크를 가볍게 만든다.
                </p>}
            />

            <T en={<h2>Dynamics of a Single Rigid Body</h2>} ko={<h2>단일 강체의 Dynamics</h2>}/>
            <T
                en={<p>
                    Newton&ndash;Euler builds on the dynamics of one rigid body, so we derive that first. Model the body
                    as point masses <InlineMath math='m_i'/> rigidly glued together at positions{" "}
                    <InlineMath math='r_i'/> in a body frame <InlineMath math='\{b\}'/> whose origin is the{" "}
                    <strong>center of mass</strong>, the unique point where{" "}
                    <InlineMath math='\sum_i m_i r_i = 0'/>. Let the body move with body twist{" "}
                    <InlineMath math='\mathcal{V}_b = (\omega_b, v_b)'/>.
                </p>}
                ko={<p>
                    Newton&ndash;Euler는 강체 하나의 dynamics 위에 세워지므로 그것부터 유도한다. 강체를, 원점이{" "}
                    <strong>질량중심</strong>(<InlineMath math='\sum_i m_i r_i = 0'/>이 되는 유일한 점)인 body frame{" "}
                    <InlineMath math='\{b\}'/>에서 위치 <InlineMath math='r_i'/>에 단단히 붙은 점질량{" "}
                    <InlineMath math='m_i'/>들의 모임으로 모델링한다. 강체가 body twist{" "}
                    <InlineMath math='\mathcal{V}_b = (\omega_b, v_b)'/>로 움직인다고 하자.
                </p>}
            />
            <ol className="list-decimal pl-6 space-y-1">
                <li>
                    <T
                        en={<span>Each point's velocity and acceleration follow from the twist (differentiate{" "}
                            <InlineMath math='\dot p_i = v_b + \omega_b \times p_i'/> once more and substitute{" "}
                            <InlineMath math='r_i'/> for <InlineMath math='p_i'/>):</span>}
                        ko={<span>각 점의 속도/가속도는 twist에서 나온다 (<InlineMath math='\dot p_i = v_b + \omega_b \times p_i'/>를
                            한 번 더 미분하고 <InlineMath math='p_i'/>에 <InlineMath math='r_i'/>를 대입):</span>}
                    />
                    <BlockMath math={`\\ddot p_i = \\dot v_b + [\\dot\\omega_b]r_i + [\\omega_b]v_b + [\\omega_b]^2 r_i`}/>
                </li>
                <li>
                    <T
                        en={<span>Total force: sum <InlineMath math='f_i = m_i\ddot p_i'/>. Every term containing{" "}
                            <InlineMath math='\sum_i m_i r_i'/> vanishes by the center-of-mass choice, leaving only:</span>}
                        ko={<span>총 힘: <InlineMath math='f_i = m_i\ddot p_i'/>를 합한다.{" "}
                            <InlineMath math='\sum_i m_i r_i'/>가 든 항은 질량중심 선택 덕에 전부 사라지고, 이것만
                            남는다:</span>}
                    />
                    <BlockMath math={`f_b = m(\\dot v_b + [\\omega_b]v_b)`}/>
                    <T
                        en={<span>The <InlineMath math='[\omega_b]v_b'/> term exists because a constant{" "}
                            <InlineMath math='v_b'/> in a rotating frame is a <em>changing</em> velocity in an inertial
                            frame.</span>}
                        ko={<span><InlineMath math='[\omega_b]v_b'/> 항이 있는 이유: 회전하는 frame에서 일정한{" "}
                            <InlineMath math='v_b'/>는 관성 frame에서 보면 <em>변하는</em> 속도이기 때문이다.</span>}
                    />
                </li>
                <li>
                    <T
                        en={<span>Total moment: sum <InlineMath math='r_i \times f_i'/>. The{" "}
                            <InlineMath math='\sum m_i r_i'/> terms drop again, and the remaining sums define the{" "}
                            <strong>rotational inertia matrix</strong>{" "}
                            <InlineMath math='\mathcal{I}_b = -\sum_i m_i [r_i]^2'/>:</span>}
                        ko={<span>총 모멘트: <InlineMath math='r_i \times f_i'/>를 합한다.{" "}
                            <InlineMath math='\sum m_i r_i'/> 항이 또 사라지고, 남는 합이{" "}
                            <strong>회전 관성 행렬</strong>{" "}
                            <InlineMath math='\mathcal{I}_b = -\sum_i m_i [r_i]^2'/>을 정의한다:</span>}
                    />
                    <BlockMath math={`m_b = \\mathcal{I}_b\\dot\\omega_b + [\\omega_b]\\mathcal{I}_b\\omega_b`}/>
                    <T
                        en={<span>This is <strong>Euler's equation</strong> for a rotating body: one term linear in
                            angular acceleration, one quadratic in angular velocity, the same pattern as the arm
                            equations.</span>}
                        ko={<span>이것이 회전 강체의 <strong>Euler 방정식</strong>이다. 각가속도에 선형인 항 하나,
                            각속도에 이차인 항 하나. 팔 방정식과 같은 패턴이다.</span>}
                    />
                </li>
            </ol>
            <T
                en={<p>
                    <InlineMath math='\mathcal{I}_b'/> is symmetric positive definite with rotational kinetic energy{" "}
                    <InlineMath math='\tfrac12\omega_b^{\mathsf T}\mathcal{I}_b\omega_b'/>, and unlike{" "}
                    <InlineMath math='M(\theta)'/> it is <em>constant</em>. Its eigenvectors are the{" "}
                    <strong>principal axes</strong> and its eigenvalues the principal moments of inertia; aligning{" "}
                    <InlineMath math='\{b\}'/> with them diagonalizes <InlineMath math='\mathcal{I}_b'/>. Two transport
                    rules cover every other frame: a rotated frame <InlineMath math='\{c\}'/> gives{" "}
                    <InlineMath math='\mathcal{I}_c = R_{bc}^{\mathsf T}\mathcal{I}_b R_{bc}'/> (kinetic energy is
                    frame-independent), and a frame displaced to a point <InlineMath math='q'/> obeys{" "}
                    <strong>Steiner's theorem</strong>{" "}
                    <InlineMath math='\mathcal{I}_q = \mathcal{I}_b + m(q^{\mathsf T}q I - qq^{\mathsf T})'/>, whose
                    scalar shadow is the familiar parallel-axis theorem{" "}
                    <InlineMath math='I_d = I_{\mathrm{cm}} + md^2'/>.
                </p>}
                ko={<p>
                    <InlineMath math='\mathcal{I}_b'/>는 대칭 positive definite이고 회전 운동 에너지는{" "}
                    <InlineMath math='\tfrac12\omega_b^{\mathsf T}\mathcal{I}_b\omega_b'/>이며,{" "}
                    <InlineMath math='M(\theta)'/>와 달리 <em>상수</em>다. 고유벡터가 <strong>주축</strong>, 고유값이 주
                    관성 모멘트이고, <InlineMath math='\{b\}'/>를 주축에 맞추면{" "}
                    <InlineMath math='\mathcal{I}_b'/>가 대각화된다. 다른 frame은 두 이동 규칙이면 전부 된다. 회전된
                    frame <InlineMath math='\{c\}'/>에서는{" "}
                    <InlineMath math='\mathcal{I}_c = R_{bc}^{\mathsf T}\mathcal{I}_b R_{bc}'/> (운동 에너지가 frame과
                    무관하므로), 점 <InlineMath math='q'/>로 옮긴 frame에서는 <strong>Steiner 정리</strong>{" "}
                    <InlineMath math='\mathcal{I}_q = \mathcal{I}_b + m(q^{\mathsf T}q I - qq^{\mathsf T})'/>이며, 그
                    스칼라 그림자가 익숙한 평행축 정리 <InlineMath math='I_d = I_{\mathrm{cm}} + md^2'/>다.
                </p>}
            />
            <T
                en={<p>
                    Now pack the two equations into one 6-vector equation. Stack{" "}
                    <InlineMath math='\mathcal{F}_b = (m_b, f_b)'/> and use the{" "}
                    <strong>spatial inertia matrix</strong>{" "}
                    <InlineMath math='\mathcal{G}_b = \operatorname{diag}(\mathcal{I}_b, mI)'/>, which also gives the
                    kinetic energy the clean form{" "}
                    <InlineMath math='\tfrac12\mathcal{V}_b^{\mathsf T}\mathcal{G}_b\mathcal{V}_b'/>. The two
                    velocity-product terms combine if we borrow the twist version of the cross product. For twists{" "}
                    <InlineMath math='\mathcal{V}_1, \mathcal{V}_2'/>, computing{" "}
                    <InlineMath math='[\mathcal{V}_1][\mathcal{V}_2] - [\mathcal{V}_2][\mathcal{V}_1]'/> (matrix form)
                    yields another twist, the <strong>Lie bracket</strong>, written with the operator
                </p>}
                ko={<p>
                    이제 두 방정식을 6-벡터 방정식 하나로 싼다. <InlineMath math='\mathcal{F}_b = (m_b, f_b)'/>로 쌓고{" "}
                    <strong>spatial inertia matrix</strong>{" "}
                    <InlineMath math='\mathcal{G}_b = \operatorname{diag}(\mathcal{I}_b, mI)'/>를 쓰면 운동 에너지도{" "}
                    <InlineMath math='\tfrac12\mathcal{V}_b^{\mathsf T}\mathcal{G}_b\mathcal{V}_b'/>로 깔끔해진다. 속도
                    곱 항 둘은 twist판 외적을 빌리면 하나로 합쳐진다. Twist{" "}
                    <InlineMath math='\mathcal{V}_1, \mathcal{V}_2'/>에 대해 행렬꼴{" "}
                    <InlineMath math='[\mathcal{V}_1][\mathcal{V}_2] - [\mathcal{V}_2][\mathcal{V}_1]'/>을 계산하면 또
                    다른 twist가 나오는데, 이것이 <strong>Lie bracket</strong>이고 연산자로 쓰면
                </p>}
            />
            <BlockMath math={`[\\mathrm{ad}_{\\mathcal{V}}] = \\begin{bmatrix} [\\omega] & 0 \\\\ [v] & [\\omega] \\end{bmatrix} \\in \\mathbb{R}^{6\\times 6}`}/>
            <T
                en={<p>
                    With it, the rigid-body dynamics condenses to a single line that looks exactly like Euler's
                    equation, lifted to six dimensions:
                </p>}
                ko={<p>
                    이것으로 강체 dynamics는 Euler 방정식을 6차원으로 들어올린 꼴의 한 줄로 압축된다:
                </p>}
            />
            <BlockMath math={`\\mathcal{F}_b = \\mathcal{G}_b\\dot{\\mathcal{V}}_b - [\\mathrm{ad}_{\\mathcal{V}_b}]^{\\mathsf T}\\mathcal{G}_b\\mathcal{V}_b`}/>
            <T
                en={<p>
                    And the form survives a change of frame: since kinetic energy is frame-independent,{" "}
                    <InlineMath math='\mathcal{G}_a = [\mathrm{Ad}_{T_{ba}}]^{\mathsf T}\mathcal{G}_b[\mathrm{Ad}_{T_{ba}}]'/>{" "}
                    (a generalization of Steiner's theorem), and the same equation holds with every subscript{" "}
                    <InlineMath math='b'/> replaced by <InlineMath math='a'/>.
                </p>}
                ko={<p>
                    이 형태는 frame을 바꿔도 살아남는다. 운동 에너지가 frame과 무관하므로{" "}
                    <InlineMath math='\mathcal{G}_a = [\mathrm{Ad}_{T_{ba}}]^{\mathsf T}\mathcal{G}_b[\mathrm{Ad}_{T_{ba}}]'/>{" "}
                    (Steiner 정리의 일반화)이고, 아래첨자 <InlineMath math='b'/>를 <InlineMath math='a'/>로 바꾼 같은
                    방정식이 성립한다.
                </p>}
            />

            <T en={<h2>Newton–Euler Inverse Dynamics</h2>} ko={<h2>Newton–Euler Inverse Dynamics</h2>}/>
            <T
                en={<p>
                    Forming <InlineMath math='M(\theta)'/> and <InlineMath math='h(\theta,\dot\theta)'/> symbolically,
                    as we did for the 2R arm, becomes hopeless for a six- or seven-joint arm. The{" "}
                    <strong>Newton&ndash;Euler</strong> algorithm sidesteps the symbols with two recursive sweeps and
                    computes the inverse dynamics in <InlineMath math='O(n)'/> time. Fix the notation, all in link
                    frame <InlineMath math='\{i\}'/> placed at link <InlineMath math='i'/>'s center of mass:{" "}
                    <InlineMath math='\mathcal{A}_i'/> is joint <InlineMath math='i'/>'s screw axis,{" "}
                    <InlineMath math='\mathcal{V}_i'/> the link twist, <InlineMath math='\mathcal{G}_i'/> the spatial
                    inertia, and <InlineMath math='\mathcal{F}_i'/> the wrench transmitted through joint{" "}
                    <InlineMath math='i'/> to link <InlineMath math='i'/>.
                </p>}
                ko={<p>
                    2R 팔에서 했듯 <InlineMath math='M(\theta)'/>와 <InlineMath math='h(\theta,\dot\theta)'/>를
                    기호로 구성하는 것은 6~7 관절 팔에서는 가망이 없다. <strong>Newton&ndash;Euler</strong> 알고리즘은
                    두 번의 재귀 순회로 기호를 우회하고 <InlineMath math='O(n)'/> 시간에 inverse dynamics를 계산한다.
                    기호부터 못 박자. 전부 링크 <InlineMath math='i'/>의 질량중심에 놓인 링크 frame{" "}
                    <InlineMath math='\{i\}'/> 기준으로: <InlineMath math='\mathcal{A}_i'/>는 관절{" "}
                    <InlineMath math='i'/>의 screw 축, <InlineMath math='\mathcal{V}_i'/>는 링크 twist,{" "}
                    <InlineMath math='\mathcal{G}_i'/>는 spatial inertia,{" "}
                    <InlineMath math='\mathcal{F}_i'/>는 관절 <InlineMath math='i'/>를 통해 링크{" "}
                    <InlineMath math='i'/>로 전달되는 wrench다.
                </p>}
            />
            <ol className="list-decimal pl-6 space-y-1">
                <li>
                    <T
                        en={<span><strong>Twist recursion (base &rarr; tip)</strong>: link <InlineMath math='i'/>{" "}
                            inherits its parent's twist, re-expressed in <InlineMath math='\{i\}'/>, plus its own
                            joint's contribution:</span>}
                        ko={<span><strong>Twist 재귀 (베이스 &rarr; 끝단)</strong>: 링크 <InlineMath math='i'/>는 부모의
                            twist를 <InlineMath math='\{i\}'/>로 옮겨 물려받고, 자기 관절의 기여를 더한다:</span>}
                    />
                    <BlockMath math={`\\mathcal{V}_i = [\\mathrm{Ad}_{T_{i,i-1}}]\\mathcal{V}_{i-1} + \\mathcal{A}_i\\dot\\theta_i`}/>
                </li>
                <li>
                    <T
                        en={<span><strong>Acceleration recursion</strong>: differentiate step 1 in time. The derivative
                            of <InlineMath math='[\mathrm{Ad}_{T_{i,i-1}}]'/> (the frames are moving!) works out to a
                            Lie-bracket term, giving three contributions: the joint's acceleration, the parent's
                            acceleration, and a velocity product:</span>}
                        ko={<span><strong>가속도 재귀</strong>: 1단계를 시간 미분한다.{" "}
                            <InlineMath math='[\mathrm{Ad}_{T_{i,i-1}}]'/>의 미분이 (frame이 움직이고 있으니 0이
                            아니다) Lie bracket 항으로 정리되어, 기여가 셋이 된다. 관절의 가속, 부모의 가속, 그리고
                            속도 곱이다:</span>}
                    />
                    <BlockMath math={`\\dot{\\mathcal{V}}_i = [\\mathrm{Ad}_{T_{i,i-1}}]\\dot{\\mathcal{V}}_{i-1}
+ [\\mathrm{ad}_{\\mathcal{V}_i}]\\mathcal{A}_i\\dot\\theta_i + \\mathcal{A}_i\\ddot\\theta_i`}/>
                </li>
                <li>
                    <T
                        en={<span><strong>Wrench recursion (tip &rarr; base)</strong>: the single-rigid-body equation
                            says what total wrench link <InlineMath math='i'/> needs; that total is supplied by joint{" "}
                            <InlineMath math='i'/> minus what link <InlineMath math='i'/> passes on to link{" "}
                            <InlineMath math='i{+}1'/>. Solve for the one unknown{" "}
                            <InlineMath math='\mathcal{F}_i'/>:</span>}
                        ko={<span><strong>Wrench 재귀 (끝단 &rarr; 베이스)</strong>: 단일 강체 방정식이 링크{" "}
                            <InlineMath math='i'/>가 필요로 하는 총 wrench를 말해 주고, 그 총량은 관절{" "}
                            <InlineMath math='i'/>가 공급하는 것에서 링크 <InlineMath math='i{+}1'/>로 넘겨주는 것을 뺀
                            것이다. 유일한 미지수 <InlineMath math='\mathcal{F}_i'/>로 푼다:</span>}
                    />
                    <div className="overflow-x-auto">
                        <BlockMath math={`\\mathcal{F}_i = [\\mathrm{Ad}_{T_{i+1,i}}]^{\\mathsf T}\\mathcal{F}_{i+1}
+ \\mathcal{G}_i\\dot{\\mathcal{V}}_i - [\\mathrm{ad}_{\\mathcal{V}_i}]^{\\mathsf T}\\mathcal{G}_i\\mathcal{V}_i`}/>
                    </div>
                </li>
                <li>
                    <T
                        en={<span><strong>Project onto the joint</strong>: the joint structure supports five of the six
                            wrench components for free; the actuator supplies only the component along the screw
                            axis:</span>}
                        ko={<span><strong>관절로 사영</strong>: wrench 여섯 성분 중 다섯은 관절 구조가 공짜로 받쳐 주고,
                            구동기는 screw 축 방향 성분만 공급하면 된다:</span>}
                    />
                    <BlockMath math={`\\tau_i = \\mathcal{F}_i^{\\mathsf T}\\mathcal{A}_i`}/>
                </li>
            </ol>
            <T
                en={<p>
                    Initialization encodes gravity for free: set the base acceleration to{" "}
                    <InlineMath math='\dot{\mathcal{V}}_0 = (0, -g)'/>, i.e., pretend the base accelerates upward at{" "}
                    <InlineMath math='g'/>, and every link automatically feels its weight. An end-effector wrench{" "}
                    <InlineMath math='\mathcal{F}_{n+1} = \mathcal{F}_{\mathrm{tip}}'/> seeds the backward pass. The
                    figure below replays both passes with real numbers on a planar 3R arm:
                </p>}
                ko={<p>
                    초기화가 중력을 공짜로 넣어 준다. 베이스 가속도를{" "}
                    <InlineMath math='\dot{\mathcal{V}}_0 = (0, -g)'/>로, 즉 베이스가 위로{" "}
                    <InlineMath math='g'/>만큼 가속하는 척하면 모든 링크가 자동으로 제 무게를 느낀다. End-effector
                    wrench <InlineMath math='\mathcal{F}_{n+1} = \mathcal{F}_{\mathrm{tip}}'/>은 역방향 패스의 씨앗이
                    된다. 아래 그림이 평면 3R 팔에서 두 패스를 실제 수치로 재생한다:
                </p>}
            />
            <NewtonEulerPasses/>
            <T
                en={<p>
                    The recursion also proves the claim we owed from the Lagrangian section, in three lines. Each
                    link's twist is a linear function of the joint rates,{" "}
                    <InlineMath math='\mathcal{V}_i = J_{ib}(\theta)\dot\theta'/> with{" "}
                    <InlineMath math='J_{ib}'/> the body Jacobian of the sub-chain (zero-padded to{" "}
                    <InlineMath math='n'/> columns). Summing the link kinetic energies:
                </p>}
                ko={<p>
                    이 재귀는 Lagrangian 절에서 빚진 주장도 세 줄로 증명한다. 각 링크의 twist는 관절 속도의 선형
                    함수 <InlineMath math='\mathcal{V}_i = J_{ib}(\theta)\dot\theta'/>다{" "}
                    (<InlineMath math='J_{ib}'/>는 부분 체인의 body Jacobian을 <InlineMath math='n'/>열로 0-패딩한
                    것). 링크 운동 에너지를 합하면:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math={`\\mathcal{K} = \\frac12\\sum_{i=1}^{n}\\mathcal{V}_i^{\\mathsf T}\\mathcal{G}_i\\mathcal{V}_i
= \\frac12\\dot\\theta^{\\mathsf T}\\Big(\\sum_{i=1}^{n}J_{ib}^{\\mathsf T}(\\theta)\\,\\mathcal{G}_i\\,J_{ib}(\\theta)\\Big)\\dot\\theta
\\;\\;\\Longrightarrow\\;\\;
M(\\theta) = \\sum_{i=1}^{n}J_{ib}^{\\mathsf T}(\\theta)\\,\\mathcal{G}_i\\,J_{ib}(\\theta)`}/>
            </div>
            <T
                en={<p>
                    So the kinetic energy really is <InlineMath math='\tfrac12\dot\theta^{\mathsf T}M\dot\theta'/>,
                    with each link contributing its spatial inertia pulled back through its own Jacobian. Stacking all
                    the recursions into block-matrix form also yields closed-form expressions for{" "}
                    <InlineMath math='M(\theta)'/>, <InlineMath math='c(\theta,\dot\theta)'/>, and{" "}
                    <InlineMath math='g(\theta)'/>, useful for analysis even though the recursive algorithm is what
                    runs in practice.
                </p>}
                ko={<p>
                    그래서 운동 에너지는 정말{" "}
                    <InlineMath math='\tfrac12\dot\theta^{\mathsf T}M\dot\theta'/>이고, 각 링크가 자기 Jacobian을 통해
                    끌어온 spatial inertia를 기여한다. 재귀식 전체를 블록 행렬로 쌓으면{" "}
                    <InlineMath math='M(\theta)'/>, <InlineMath math='c(\theta,\dot\theta)'/>,{" "}
                    <InlineMath math='g(\theta)'/>의 닫힌 형태 식도 나온다. 실전에서 도는 것은 재귀 알고리즘이지만,
                    분석에는 닫힌 형태가 유용하다.
                </p>}
            />

            <T en={<h2>Forward Dynamics and Simulation</h2>} ko={<h2>Forward Dynamics와 시뮬레이션</h2>}/>
            <T
                en={<p>
                    To <strong>simulate</strong> a robot we run the equations the other way. At each instant solve
                </p>}
                ko={<p>
                    로봇을 <strong>시뮬레이션</strong>하려면 방정식을 반대 방향으로 돌린다. 매 순간
                </p>}
            />
            <BlockMath math={`M(\\theta)\\,\\ddot\\theta = \\tau - h(\\theta,\\dot\\theta) - J^{\\mathsf T}(\\theta)\\mathcal{F}_{\\mathrm{tip}}`}/>
            <T
                en={<p>
                    for <InlineMath math='\ddot\theta'/>. Everything on the right comes from the inverse-dynamics
                    routine itself: calling it with <InlineMath math='\ddot\theta = 0'/> returns{" "}
                    <InlineMath math='h(\theta,\dot\theta)'/>, and calling it <InlineMath math='n'/> times with{" "}
                    <InlineMath math='\dot\theta = 0'/>, <InlineMath math='g = 0'/>,{" "}
                    <InlineMath math='\ddot\theta = e_j'/> returns the columns of <InlineMath math='M(\theta)'/> one by
                    one. Then integrate <InlineMath math='(\theta, \dot\theta)'/> forward one time step and repeat,
                    with an explicit Euler, semi-implicit Euler, or Runge&ndash;Kutta integrator. This loop is exactly
                    what drives the live simulation above. With <InlineMath math='\tau = 0'/> and gravity on, that 2R
                    arm is a <strong>double pendulum</strong>: energy-conserving in principle, yet{" "}
                    <strong>chaotic</strong>. Two nearly identical starts diverge to completely different trajectories
                    within a few swings.
                </p>}
                ko={<p>
                    를 <InlineMath math='\ddot\theta'/>에 대해 푼다. 우변의 모든 것이 inverse dynamics 루틴 자체에서
                    나온다. <InlineMath math='\ddot\theta = 0'/>으로 부르면{" "}
                    <InlineMath math='h(\theta,\dot\theta)'/>가 나오고, <InlineMath math='\dot\theta = 0'/>,{" "}
                    <InlineMath math='g = 0'/>, <InlineMath math='\ddot\theta = e_j'/>로 <InlineMath math='n'/>번
                    부르면 <InlineMath math='M(\theta)'/>의 열이 하나씩 나온다. 그다음{" "}
                    <InlineMath math='(\theta, \dot\theta)'/>를 한 시간 스텝 앞으로 적분하고 반복한다. explicit Euler,
                    semi-implicit Euler, 또는 Runge&ndash;Kutta 적분기로. 이 루프가 바로 위의 실시간 시뮬레이션을
                    구동한다. <InlineMath math='\tau = 0'/>이고 중력이 켜져 있으면 그 2R 팔은{" "}
                    <strong>이중 진자</strong>다. 원리상 에너지를 보존하지만 <strong>카오스적</strong>이어서, 거의
                    동일한 두 초기 상태가 몇 번의 흔들림 안에 완전히 다른 trajectory로 갈라진다.
                </p>}
            />
            <T
                en={<p>
                    Setting <InlineMath math='\tau = g(\theta)'/> at every step is <strong>gravity compensation</strong>:
                    the applied torque exactly cancels the gravity term, so the arm floats as if weightless and drifts
                    only under the torques you add on top. Two caveats about the numerics:
                </p>}
                ko={<p>
                    매 스텝에서 <InlineMath math='\tau = g(\theta)'/>로 두는 것이 <strong>중력 보상</strong>이다. 가한
                    토크가 중력 항을 정확히 상쇄해 팔이 무중력처럼 뜨고, 그 위에 더한 토크에 의해서만 움직인다. 수치
                    계산에 관한 두 가지 유의점:
                </p>}
            />
            <T
                en={<ul className="list-disc pl-6 space-y-1">
                    <li>
                        <strong>Energy drift</strong>: plain Euler integration slowly injects or bleeds energy, so an
                        ideal double pendulum will visibly gain or lose swing. Smaller steps, or symplectic / RK4
                        integrators, keep the energy honest. Watch the reported <InlineMath math='E'/> in the figure to
                        see how well it holds.
                    </li>
                    <li>
                        <strong>Frame-rate independence</strong>: physics is integrated on a fixed small sub-step,
                        decoupled from the display frame rate, so the motion looks the same whether the browser renders
                        at 30 or 120 fps.
                    </li>
                </ul>}
                ko={<ul className="list-disc pl-6 space-y-1">
                    <li>
                        <strong>에너지 드리프트</strong>: 단순 Euler 적분은 에너지를 서서히 주입하거나 새어 나가게
                        하므로, 이상적인 이중 진자도 눈에 띄게 흔들림이 커지거나 작아진다. 더 작은 스텝, 또는
                        symplectic / RK4 적분기가 에너지를 정직하게 유지한다. 그림에 표시된{" "}
                        <InlineMath math='E'/>를 지켜보며 얼마나 잘 유지되는지 확인하라.
                    </li>
                    <li>
                        <strong>프레임률 독립성</strong>: 물리는 디스플레이 프레임률과 분리된 고정된 작은 서브스텝으로
                        적분되므로, 브라우저가 30이든 120 fps든 운동은 동일하게 보인다.
                    </li>
                </ul>}
            />

            <T en={<h2>Task Space and Constrained Dynamics</h2>} ko={<h2>Task Space와 Constrained Dynamics</h2>}/>
            <T
                en={<p>
                    Sometimes the natural coordinates are not the joints but the <strong>end-effector</strong>. For a
                    six-joint arm with invertible <InlineMath math='J(\theta)'/>, the joint-space equations transform
                    into task space in three steps:
                </p>}
                ko={<p>
                    자연스러운 좌표가 관절이 아니라 <strong>end-effector</strong>일 때가 있다. 6관절 팔에서{" "}
                    <InlineMath math='J(\theta)'/>가 가역이면, 관절 공간 방정식이 세 단계로 task space로 옮겨진다:
                </p>}
            />
            <ol className="list-decimal pl-6 space-y-1">
                <li>
                    <T
                        en={<span>Invert the velocity map <InlineMath math='\mathcal{V} = J\dot\theta'/> and its time
                            derivative:</span>}
                        ko={<span>속도 사이 관계 <InlineMath math='\mathcal{V} = J\dot\theta'/>와 그 시간 미분을
                            뒤집는다:</span>}
                    />
                    <BlockMath math={`\\dot\\theta = J^{-1}\\mathcal{V}, \\qquad
\\ddot\\theta = J^{-1}\\dot{\\mathcal{V}} - J^{-1}\\dot J J^{-1}\\mathcal{V}`}/>
                </li>
                <li>
                    <T
                        en={<span>Substitute into{" "}
                            <InlineMath math='\tau = M\ddot\theta + h'/> and premultiply by{" "}
                            <InlineMath math='J^{-\mathsf T}'/>, recognizing{" "}
                            <InlineMath math='J^{-\mathsf T}\tau'/> as the end-effector wrench{" "}
                            <InlineMath math='\mathcal{F}'/> (the same duality as statics):</span>}
                        ko={<span><InlineMath math='\tau = M\ddot\theta + h'/>에 대입하고{" "}
                            <InlineMath math='J^{-\mathsf T}'/>를 앞에 곱한다.{" "}
                            <InlineMath math='J^{-\mathsf T}\tau'/>는 end-effector wrench{" "}
                            <InlineMath math='\mathcal{F}'/>다 (statics와 같은 duality):</span>}
                    />
                    <div className="overflow-x-auto">
                        <BlockMath math={`\\mathcal{F} = \\underbrace{J^{-\\mathsf T}MJ^{-1}}_{\\Lambda(\\theta)}\\dot{\\mathcal{V}}
+ \\underbrace{J^{-\\mathsf T}h(\\theta, J^{-1}\\mathcal{V}) - \\Lambda(\\theta)\\dot J J^{-1}\\mathcal{V}}_{\\eta(\\theta,\\mathcal{V})}`}/>
                    </div>
                </li>
                <li>
                    <T
                        en={<span>The result <InlineMath math='\mathcal{F} = \Lambda(\theta)\dot{\mathcal{V}} + \eta(\theta,\mathcal{V})'/>{" "}
                            is the equation of motion of the end-effector itself, with the same{" "}
                            <InlineMath math='\Lambda'/> we met as the felt end-effector mass. Note both{" "}
                            <InlineMath math='\Lambda'/> and <InlineMath math='\eta'/> still depend on{" "}
                            <InlineMath math='\theta'/>, not just on the end-effector pose: different IK branches feel
                            different.</span>}
                        ko={<span>결과{" "}
                            <InlineMath math='\mathcal{F} = \Lambda(\theta)\dot{\mathcal{V}} + \eta(\theta,\mathcal{V})'/>는
                            end-effector 자체의 운동 방정식이고, <InlineMath math='\Lambda'/>는 앞서 만난 "느껴지는
                            end-effector 질량" 그것이다. <InlineMath math='\Lambda'/>와{" "}
                            <InlineMath math='\eta'/>가 여전히 end-effector 자세가 아니라{" "}
                            <InlineMath math='\theta'/>에 의존한다는 점에 유의하라. IK 가지가 다르면 다르게
                            느껴진다.</span>}
                    />
                </li>
            </ol>
            <T
                en={<p>
                    Now suppose the robot is <strong>constrained</strong>: writing with a pen, holding a door handle.
                    Model this as <InlineMath math='k'/> Pfaffian constraints <InlineMath math='A(\theta)\dot\theta = 0'/>{" "}
                    that do no work. The derivation again runs in short steps:
                </p>}
                ko={<p>
                    이제 로봇이 <strong>구속</strong>되어 있다고 하자. 펜으로 종이에 쓰거나 문 손잡이를 잡고 있는
                    경우다. 이를 일을 하지 않는 <InlineMath math='k'/>개의 Pfaffian 제약{" "}
                    <InlineMath math='A(\theta)\dot\theta = 0'/>으로 모델링한다. 유도는 또 짧은 단계들이다:
                </p>}
            />
            <ol className="list-decimal pl-6 space-y-1">
                <li>
                    <T
                        en={<span>Workless constraint forces satisfy{" "}
                            <InlineMath math='\tau_{\mathrm{con}}^{\mathsf T}\dot\theta = 0'/> for every allowed{" "}
                            <InlineMath math='\dot\theta'/>, so they live in the column space of{" "}
                            <InlineMath math='A^{\mathsf T}'/>:{" "}
                            <InlineMath math='\tau_{\mathrm{con}} = A^{\mathsf T}(\theta)\lambda'/>. The equations of
                            motion gain that term:</span>}
                        ko={<span>일을 하지 않는 구속력은 허용되는 모든 <InlineMath math='\dot\theta'/>에 대해{" "}
                            <InlineMath math='\tau_{\mathrm{con}}^{\mathsf T}\dot\theta = 0'/>이어야 하므로,{" "}
                            <InlineMath math='A^{\mathsf T}'/>의 열공간에 산다:{" "}
                            <InlineMath math='\tau_{\mathrm{con}} = A^{\mathsf T}(\theta)\lambda'/>. 운동 방정식에 그
                            항이 붙는다:</span>}
                    />
                    <BlockMath math={`\\tau = M(\\theta)\\ddot\\theta + h(\\theta,\\dot\\theta) + A^{\\mathsf T}(\\theta)\\lambda,
\\qquad A(\\theta)\\dot\\theta = 0`}/>
                </li>
                <li>
                    <T
                        en={<span>Differentiate the constraint in time ({" "}
                            <InlineMath math='\dot A\dot\theta + A\ddot\theta = 0'/>), solve the dynamics for{" "}
                            <InlineMath math='\ddot\theta'/>, substitute, and solve for the multipliers:</span>}
                        ko={<span>제약을 시간 미분하고 (<InlineMath math='\dot A\dot\theta + A\ddot\theta = 0'/>),
                            운동 방정식을 <InlineMath math='\ddot\theta'/>로 풀어 대입한 뒤,{" "}
                            승수에 대해 푼다:</span>}
                    />
                    <BlockMath math={`\\lambda = (AM^{-1}A^{\\mathsf T})^{-1}\\big(AM^{-1}(\\tau - h) - A\\ddot\\theta\\big)`}/>
                </li>
                <li>
                    <T
                        en={<span>Substituting back eliminates <InlineMath math='\lambda'/> entirely and leaves a{" "}
                            <strong>projected</strong> equation of motion:</span>}
                        ko={<span>되대입하면 <InlineMath math='\lambda'/>가 완전히 사라지고{" "}
                            <strong>사영된</strong> 운동 방정식이 남는다:</span>}
                    />
                    <BlockMath math={`P\\tau = P\\big(M\\ddot\\theta + h\\big), \\qquad
P = I - A^{\\mathsf T}(AM^{-1}A^{\\mathsf T})^{-1}AM^{-1}`}/>
                </li>
            </ol>
            <T
                en={<p>
                    The rank-<InlineMath math='(n-k)'/> projection <InlineMath math='P(\theta)'/> keeps the torque
                    components that do work on the robot and throws away the components that merely push against the
                    constraints. The robot ends up with <InlineMath math='n-k'/> motion freedoms and{" "}
                    <InlineMath math='k'/> force freedoms: it can add any <InlineMath math='A^{\mathsf T}\lambda'/>{" "}
                    (press the pen harder) without changing its motion, the seed of hybrid motion&ndash;force control.
                </p>}
                ko={<p>
                    Rank <InlineMath math='(n-k)'/>인 사영 <InlineMath math='P(\theta)'/>는 로봇에 일을 하는 토크
                    성분만 남기고, 제약을 미는 데만 쓰이는 성분을 버린다. 로봇에는{" "}
                    <InlineMath math='n-k'/>개의 운동 자유와 <InlineMath math='k'/>개의 힘 자유가 남는다. 운동을 바꾸지
                    않으면서 아무 <InlineMath math='A^{\mathsf T}\lambda'/>든 더할 수 있고 (펜을 더 세게 누르기), 이것이
                    hybrid motion&ndash;force 제어의 씨앗이다.
                </p>}
            />

            <T en={<h2>Motors, Gearing, and Friction</h2>} ko={<h2>모터, 기어, 마찰</h2>}/>
            <T
                en={<p>
                    So far the "actuator" was an abstraction that delivers any commanded <InlineMath math='\tau'/>.
                    Real joints are usually <strong>geared DC motors</strong>, and their physics changes the dynamics
                    the controller actually sees. A DC motor produces torque proportional to current,{" "}
                    <InlineMath math='\tau = k_t I'/>. Balancing electrical power in against mechanical power out plus
                    losses gives its voltage equation in two steps:
                </p>}
                ko={<p>
                    지금까지 "구동기"는 명령한 <InlineMath math='\tau'/>를 그대로 내주는 추상적 존재였다. 실제 관절은
                    대개 <strong>기어 달린 DC 모터</strong>이고, 그 물리가 제어기가 실제로 보는 dynamics를 바꾼다. DC
                    모터는 전류에 비례하는 토크 <InlineMath math='\tau = k_t I'/>를 낸다. 들어오는 전기 일률과 나가는
                    기계 일률 + 손실의 수지를 맞추면 전압 방정식이 두 단계로 나온다:
                </p>}
            />
            <ol className="list-decimal pl-6 space-y-1">
                <li>
                    <T
                        en={<span>Power balance: input <InlineMath math='IV'/> equals mechanical power{" "}
                            <InlineMath math='\tau w = k_t I w'/>, heating <InlineMath math='I^2R'/>, and inductive
                            storage:</span>}
                        ko={<span>일률 수지: 입력 <InlineMath math='IV'/>가 기계 일률{" "}
                            <InlineMath math='\tau w = k_t I w'/>, 발열 <InlineMath math='I^2R'/>, 인덕턴스 저장으로
                            나뉜다:</span>}
                    />
                    <BlockMath math={`IV = k_t I w + I^2 R + LI\\frac{dI}{dt}`}/>
                </li>
                <li>
                    <T
                        en={<span>Divide by <InlineMath math='I'/>, and drop the inductance term (exact at constant
                            current). The <InlineMath math='k_t w'/> term is the <strong>back-emf</strong>, the voltage
                            the spinning motor generates against you:</span>}
                        ko={<span><InlineMath math='I'/>로 나누고, 인덕턴스 항을 버린다 (전류 일정이면 정확).{" "}
                            <InlineMath math='k_t w'/> 항이 <strong>back-emf</strong>, 도는 모터가 거꾸로 만들어 내는
                            전압이다:</span>}
                    />
                    <BlockMath math={`V = k_t w + IR
\\;\\;\\Longrightarrow\\;\\;
w = \\frac{V}{k_t} - \\frac{R}{k_t^2}\\,\\tau`}/>
                </li>
            </ol>
            <T
                en={<p>
                    At fixed <InlineMath math='V_{\max}'/> this is a straight <strong>speed&ndash;torque line</strong>{" "}
                    from the no-load speed <InlineMath math='w_0 = V_{\max}/k_t'/> down to the stall torque{" "}
                    <InlineMath math='\tau_{\mathrm{stall}} = k_t V_{\max}/R'/>; current and thermal limits carve out
                    the usable region. Motor torque is typically far too small for a robot joint, so a{" "}
                    <strong>gearhead</strong> with ratio <InlineMath math='G'/> trades speed for torque:
                </p>}
                ko={<p>
                    <InlineMath math='V_{\max}'/> 고정이면 이는 no-load 속도{" "}
                    <InlineMath math='w_0 = V_{\max}/k_t'/>에서 stall 토크{" "}
                    <InlineMath math='\tau_{\mathrm{stall}} = k_t V_{\max}/R'/>까지 내려가는 직선{" "}
                    <strong>speed&ndash;torque 선</strong>이고, 전류·열 한계가 사용 가능 영역을 깎아 낸다. 모터 토크는
                    로봇 관절에 쓰기엔 대개 턱없이 작아서, 기어비 <InlineMath math='G'/>의{" "}
                    <strong>기어헤드</strong>가 속도를 내주고 토크를 얻는다:
                </p>}
            />
            <BlockMath math={`w_{\\mathrm{gear}} = \\frac{w_{\\mathrm{motor}}}{G}, \\qquad
\\tau_{\\mathrm{gear}} = \\eta\\, G\\,\\tau_{\\mathrm{motor}} \\;\\;(\\eta \\le 1)`}/>
            <T
                en={<p>
                    But gearing has a dynamic price. The rotor spins <InlineMath math='G'/> times faster than the
                    joint, so its kinetic energy is
                </p>}
                ko={<p>
                    그러나 기어에는 dynamics 쪽 대가가 있다. Rotor는 관절보다 <InlineMath math='G'/>배 빨리 돌므로, 그
                    운동 에너지는
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math={`\\mathcal{K} = \\tfrac12 I_{\\mathrm{rotor}}(G\\dot\\theta)^2
= \\tfrac12\\,\\underbrace{G^2 I_{\\mathrm{rotor}}}_{\\text{apparent inertia}}\\,\\dot\\theta^2`}/>
            </div>
            <T
                en={<p>
                    Seen from the joint, the rotor inertia is multiplied by <InlineMath math='G^2'/>: this{" "}
                    <strong>apparent (reflected) inertia</strong> can rival or exceed the whole link's inertia once{" "}
                    <InlineMath math='G'/> reaches typical values of 100 or more. That is not all bad: a joint
                    dominated by its own <InlineMath math='G^2 I_{\mathrm{rotor}}'/> hardly feels the
                    configuration-dependence and coupling of <InlineMath math='M(\theta)'/>, which simplifies control
                    at the cost of speed, efficiency, and back-drivability. Sweep <InlineMath math='G'/> below and
                    watch both effects at once:
                </p>}
                ko={<p>
                    관절에서 보면 rotor 관성이 <InlineMath math='G^2'/>배가 된다. 이{" "}
                    <strong>apparent (reflected) inertia</strong>는 <InlineMath math='G'/>가 통상값인 100쯤 되면 링크
                    전체 관성과 맞먹거나 넘어선다. 나쁘기만 한 것은 아니다. 자기{" "}
                    <InlineMath math='G^2 I_{\mathrm{rotor}}'/>가 지배하는 관절은{" "}
                    <InlineMath math='M(\theta)'/>의 configuration 의존성과 결합을 거의 느끼지 못해 제어가 단순해진다.
                    대신 속도, 효율, back-drivability를 내준다. 아래에서 <InlineMath math='G'/>를 훑으며 두 효과를
                    동시에 보라:
                </p>}
            />
            <GearedMotor/>
            <T
                en={<p>
                    Bookkeeping notes to close the chapter. The rotor's inertia belongs to a different link than its
                    stator, and with gearing the Newton&ndash;Euler recursion can be extended to account for the fast
                    rotor twists. <strong>Friction</strong> at gears and bearings adds torque terms that the rigid-body
                    model omits: a velocity-independent Coulomb term, a viscous term proportional to{" "}
                    <InlineMath math='\dot\theta'/>, static friction exceeding kinetic, and load- and
                    temperature-dependence; heavily geared joints can lose a large fraction of their torque to it.
                    Joint and link <strong>flexibility</strong> add vibration modes beyond our rigid model. Finally,
                    everything the dynamics algorithms need about each link (mass, center-of-mass frame, and the six
                    entries of the symmetric rotational inertia matrix) is exactly what a URDF's{" "}
                    <InlineMath math='\texttt{inertial}'/> element stores, alongside the joint origins and axes we
                    already used for kinematics in Chapter 4.
                </p>}
                ko={<p>
                    챕터를 닫는 정리 노트. Rotor의 관성은 stator와 다른 링크 소속이며, 기어가 있으면
                    Newton&ndash;Euler 재귀를 빠른 rotor twist까지 계산하도록 확장할 수 있다. 기어·베어링의{" "}
                    <strong>마찰</strong>은 강체 모델이 빠뜨리는 토크 항을 더한다. 속도와 무관한 Coulomb 항,{" "}
                    <InlineMath math='\dot\theta'/>에 비례하는 점성 항, 운동 마찰보다 큰 정지 마찰, 하중·온도 의존성.
                    기어비가 큰 관절은 토크의 상당 부분을 여기에 잃기도 한다. 관절·링크의 <strong>유연성</strong>은
                    강체 모델 밖의 진동 모드를 더한다. 끝으로, dynamics 알고리즘이 링크마다 필요로 하는 것 (질량,
                    질량중심 frame, 대칭 회전 관성 행렬의 여섯 성분)은 정확히 URDF의{" "}
                    <InlineMath math='\texttt{inertial}'/> 요소가 담는 것이며, 관절 origin/axis는 4장 kinematics에서
                    이미 쓴 그대로다.
                </p>}
            />
        </>
    )
}

export default Chapter8
