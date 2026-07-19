import {BlockMath, InlineMath} from "../../components/math/Tex";
import TwoRDynamics from "../../components/pages/chapter8/TwoRDynamics";
import MassMatrixEllipse from "../../components/pages/chapter8/MassMatrixEllipse";
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
                    기구학은 로봇이 <em>어디로</em> 갈 수 있는지 답하고, <strong>Dynamics</strong>는 어떤 힘과 토크가 로봇을
                    그곳으로 가게 하는지 답한다. Open Chain에서 관절 토크와 관절 운동 사이의 관계는{" "}
                    <strong>운동 방정식</strong>으로 표현된다,
                </p>}
            />
            <BlockMath math={`\\tau = M(\\theta)\\,\\ddot\\theta + h(\\theta, \\dot\\theta)`}/>
            <T
                en={<p>
                    Here <InlineMath math='M(\theta)'/> is the <InlineMath math='n \times n'/>{" "}
                    <strong>mass matrix</strong> — symmetric and positive-definite, and configuration-dependent because a
                    folded arm carries its inertia differently than an extended one. The term{" "}
                    <InlineMath math='h(\theta, \dot\theta)'/> lumps together everything that is not proportional to
                    acceleration: <strong>centripetal</strong> and <strong>Coriolis</strong> forces (quadratic in{" "}
                    <InlineMath math='\dot\theta'/>), <strong>gravity</strong>, and friction. Two dual problems fall out
                    of this one equation:
                </p>}
                ko={<p>
                    여기서 <InlineMath math='M(\theta)'/> 는 <InlineMath math='n \times n'/>{" "}
                    <strong>Mass Matrix</strong>다 — 대칭이고 양의 정부호이며, 접힌 팔은 펼쳐진 팔과 관성을 다르게 지니기
                    때문에 configuration에 의존한다. <InlineMath math='h(\theta, \dot\theta)'/> 항은 가속도에 비례하지 않는
                    모든 것을 한데 묶는다: <strong>구심</strong>력과 <strong>Coriolis</strong>력({" "}
                    <InlineMath math='\dot\theta'/> 에 대한 이차항), <strong>중력</strong>, 그리고 마찰. 이 하나의
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
                        <strong>Inverse Dynamics</strong>: 원하는 운동{" "}
                        <InlineMath math='(\theta, \dot\theta, \ddot\theta)'/> 가 주어지면, 그것을 만들어 내는 토크{" "}
                        <InlineMath math='\tau'/> 를 계산한다. 이는 제어기가 모터에 명령하기 위해 평가하는 것이다.
                    </li>
                    <li>
                        <strong>Forward Dynamics</strong>: 가해진 토크{" "}
                        <InlineMath math='(\theta, \dot\theta, \tau)'/> 가 주어지면, 그 결과인 가속도{" "}
                        <InlineMath math='\ddot\theta = M^{-1}(\theta)\big(\tau - h(\theta, \dot\theta)\big)'/> 를 구한다.
                        이는 <strong>시뮬레이션</strong>의 기초다.
                    </li>
                </ul>}
            />
            <T
                en={<p>
                    There are two standard routes to these equations. The <strong>Lagrangian</strong> formulation is
                    energy-based and elegant for chains with few degrees of freedom: form the Lagrangian{" "}
                    <InlineMath math='\mathcal{L} = \mathcal{K} - \mathcal{P}'/> from kinetic and potential energy, and
                    the torques follow from
                </p>}
                ko={<p>
                    이 방정식에 이르는 두 가지 표준적인 경로가 있다. <strong>Lagrangian</strong> 정식화는 에너지 기반이며
                    자유도가 적은 체인에 대해 우아하다: 운동 에너지와 위치 에너지로부터 Lagrangian{" "}
                    <InlineMath math='\mathcal{L} = \mathcal{K} - \mathcal{P}'/> 을 구성하면, 토크는 다음에서 따라 나온다
                </p>}
            />
            <BlockMath math={`\\tau = \\frac{d}{dt}\\frac{\\partial \\mathcal{L}}{\\partial \\dot\\theta} - \\frac{\\partial \\mathcal{L}}{\\partial \\theta}`}/>
            <T
                en={<p>
                    The <strong>Newton–Euler</strong> formulation is recursive and stays efficient for general chains of
                    any length. We work the Lagrangian route by hand on a 2R arm next, then meet its recursive
                    counterpart.
                </p>}
                ko={<p>
                    <strong>Newton–Euler</strong> 정식화는 재귀적이며 임의 길이의 일반적인 체인에 대해 효율을 유지한다.
                    다음으로 2R 팔에 대해 Lagrangian 경로를 손으로 풀어 보고, 그 재귀적 대응물을 만나 본다.
                </p>}
            />

            <T en={<h2>Lagrangian Dynamics of a 2R Arm</h2>} ko={<h2>2R 팔의 Lagrangian Dynamics</h2>}/>
            <T
                en={<p>
                    Take the planar 2R arm with point masses <InlineMath math='m_1, m_2'/> at the ends of links of
                    length <InlineMath math='L_1, L_2'/>, gravity acting in <InlineMath math='-\hat y'/>. The kinetic
                    energy is the sum of <InlineMath math='\tfrac12 m v^2'/> over the two masses, and the potential
                    energy is <InlineMath math='m g y'/> summed over their heights,
                </p>}
                ko={<p>
                    길이 <InlineMath math='L_1, L_2'/> 인 링크들의 끝에 점질량 <InlineMath math='m_1, m_2'/> 가 달리고,
                    중력이 <InlineMath math='-\hat y'/> 방향으로 작용하는 평면 2R 팔을 생각하자. 운동 에너지는 두 질량에
                    대한 <InlineMath math='\tfrac12 m v^2'/> 의 합이고, 위치 에너지는 그 높이에 대해 합한{" "}
                    <InlineMath math='m g y'/> 다,
                </p>}
            />
            <BlockMath math={`\\mathcal{K} = \\tfrac12 m_1 L_1^2 \\dot\\theta_1^2 + \\tfrac12 m_2\\big(L_1^2\\dot\\theta_1^2 + L_2^2(\\dot\\theta_1+\\dot\\theta_2)^2 + 2 L_1 L_2 \\cos\\theta_2\\, \\dot\\theta_1(\\dot\\theta_1+\\dot\\theta_2)\\big)`}/>
            <T
                en={<p>
                    Grinding <InlineMath math='\tau = \tfrac{d}{dt}\partial_{\dot\theta}\mathcal{L} - \partial_\theta\mathcal{L}'/>{" "}
                    through this energy gives the three ingredients of{" "}
                    <InlineMath math='\tau = M(\theta)\ddot\theta + c(\theta,\dot\theta) + g(\theta)'/>. The mass matrix
                    is
                </p>}
                ko={<p>
                    이 에너지에 <InlineMath math='\tau = \tfrac{d}{dt}\partial_{\dot\theta}\mathcal{L} - \partial_\theta\mathcal{L}'/>{" "}
                    를 갈아 넣으면{" "}
                    <InlineMath math='\tau = M(\theta)\ddot\theta + c(\theta,\dot\theta) + g(\theta)'/> 의 세 가지 구성
                    요소가 나온다. Mass Matrix는
                </p>}
            />
            <BlockMath math={`M(\\theta) = \\begin{bmatrix} m_1 L_1^2 + m_2\\big(L_1^2 + 2 L_1 L_2 \\cos\\theta_2 + L_2^2\\big) & m_2\\big(L_1 L_2 \\cos\\theta_2 + L_2^2\\big) \\\\[4pt] m_2\\big(L_1 L_2 \\cos\\theta_2 + L_2^2\\big) & m_2 L_2^2 \\end{bmatrix}`}/>
            <T
                en={<p>
                    the Coriolis / centripetal vector is
                </p>}
                ko={<p>
                    Coriolis / 구심 벡터는
                </p>}
            />
            <BlockMath math={`c(\\theta, \\dot\\theta) = \\begin{bmatrix} -m_2 L_1 L_2 \\sin\\theta_2\\,\\big(2\\dot\\theta_1\\dot\\theta_2 + \\dot\\theta_2^2\\big) \\\\[4pt] m_2 L_1 L_2\\,\\dot\\theta_1^2 \\sin\\theta_2 \\end{bmatrix}`}/>
            <T
                en={<p>
                    and the gravity vector is
                </p>}
                ko={<p>
                    그리고 중력 벡터는
                </p>}
            />
            <BlockMath math={`g(\\theta) = \\begin{bmatrix} (m_1 + m_2) L_1 g \\cos\\theta_1 + m_2 g L_2 \\cos(\\theta_1 + \\theta_2) \\\\[4pt] m_2 g L_2 \\cos(\\theta_1 + \\theta_2) \\end{bmatrix}`}/>
            <T
                en={<p>
                    Look at the <em>structure</em> rather than the algebra. The equations are <strong>linear in{" "}
                    <InlineMath math='\ddot\theta'/></strong>, <strong>quadratic in{" "}
                    <InlineMath math='\dot\theta'/></strong> — the <InlineMath math='\dot\theta_i^2'/> terms are
                    centripetal, the <InlineMath math='\dot\theta_i\dot\theta_j'/> cross terms are Coriolis — and{" "}
                    <strong>trigonometric in <InlineMath math='\theta'/></strong>. Crucially, the off-diagonal entry{" "}
                    <InlineMath math='M_{12} = m_2(L_1 L_2 \cos\theta_2 + L_2^2)'/> is generally nonzero: the joints are{" "}
                    <strong>inertially coupled</strong>, so an acceleration commanded at joint 1 exerts a reaction
                    torque at joint 2, and vice versa. The coupling vanishes only when{" "}
                    <InlineMath math='\cos\theta_2 = -L_2/L_1'/>.
                </p>}
                ko={<p>
                    대수 계산보다 <em>구조</em>를 보자. 이 방정식은 <strong><InlineMath math='\ddot\theta'/> 에 대해
                    선형</strong>이고, <strong><InlineMath math='\dot\theta'/> 에 대해 이차</strong>다 —{" "}
                    <InlineMath math='\dot\theta_i^2'/> 항은 구심이고, <InlineMath math='\dot\theta_i\dot\theta_j'/>{" "}
                    교차항은 Coriolis다 — 그리고 <strong><InlineMath math='\theta'/> 에 대해 삼각함수적</strong>이다.
                    결정적으로, 비대각 성분{" "}
                    <InlineMath math='M_{12} = m_2(L_1 L_2 \cos\theta_2 + L_2^2)'/> 는 일반적으로 0 이 아니다: 관절들은{" "}
                    <strong>관성적으로 결합</strong>되어 있어, 관절 1 에 명령된 가속도는 관절 2 에 반작용 토크를 가하고,
                    그 반대도 마찬가지다. 이 결합은 <InlineMath math='\cos\theta_2 = -L_2/L_1'/> 일 때만 사라진다.
                </p>}
            />
            <T
                en={<p>
                    The figure below integrates exactly these equations in real time. With torques at zero and gravity
                    on, the arm is a <strong>double pendulum</strong>: give it an off-vertical start and it swings.
                    Nudge the joint torques, toggle gravity, or switch on gravity compensation and watch how the same
                    model responds.
                </p>}
                ko={<p>
                    아래 그림은 바로 이 방정식들을 실시간으로 적분한다. 토크가 0 이고 중력이 켜져 있으면, 팔은{" "}
                    <strong>이중 진자</strong>다: 수직에서 벗어난 초기 상태를 주면 흔들린다. 관절 토크를 살짝 건드리거나,
                    중력을 토글하거나, 중력 보상을 켜고 같은 모델이 어떻게 반응하는지 지켜보라.
                </p>}
            />
            <TwoRDynamics/>

            <T en={<h2>Newton–Euler Inverse Dynamics</h2>} ko={<h2>Newton–Euler Inverse Dynamics</h2>}/>
            <T
                en={<p>
                    Forming <InlineMath math='M(\theta)'/> and <InlineMath math='h(\theta,\dot\theta)'/> symbolically, as
                    above, becomes hopeless for a six- or seven-joint arm. The <strong>Newton–Euler</strong> algorithm
                    sidesteps the symbols with two recursive sweeps along the chain and computes the inverse dynamics in
                    time <InlineMath math='O(n)'/> in the number of joints.
                </p>}
                ko={<p>
                    위처럼 <InlineMath math='M(\theta)'/> 와 <InlineMath math='h(\theta,\dot\theta)'/> 를 기호적으로
                    구성하는 것은 6 관절이나 7 관절 팔에서는 가망이 없어진다. <strong>Newton–Euler</strong> 알고리즘은
                    체인을 따라 두 번의 재귀적 순회로 기호 계산을 우회하고, 관절 개수에 대해{" "}
                    <InlineMath math='O(n)'/> 시간에 Inverse Dynamics를 계산한다.
                </p>}
            />
            <T
                en={<ul className="list-disc pl-6 space-y-1">
                    <li>
                        <strong>Forward pass (base → tip)</strong>: starting from the known base motion, propagate each
                        link's configuration outward, together with its twist{" "}
                        <InlineMath math='\mathcal{V}_i'/> and twist acceleration{" "}
                        <InlineMath math='\dot{\mathcal{V}}_i'/>. Each link inherits the motion of its parent and adds
                        the contribution of its own joint velocity and acceleration.
                    </li>
                    <li>
                        <strong>Backward pass (tip → base)</strong>: starting from any force the tip exerts on the
                        environment, propagate the wrench <InlineMath math='\mathcal{F}_i'/> that each link applies to
                        its parent inward. The joint torque is the component of that wrench along the joint's screw axis,
                        <InlineMath math='\ \tau_i = \mathcal{F}_i^{\mathsf T}\mathcal{A}_i'/>.
                    </li>
                </ul>}
                ko={<ul className="list-disc pl-6 space-y-1">
                    <li>
                        <strong>순방향 패스 (베이스 → 끝단)</strong>: 알려진 베이스 운동에서 시작해, 각 링크의
                        configuration을 그 twist{" "}
                        <InlineMath math='\mathcal{V}_i'/> 및 twist 가속도{" "}
                        <InlineMath math='\dot{\mathcal{V}}_i'/> 와 함께 바깥쪽으로 전파한다. 각 링크는 부모의 운동을
                        물려받고 자신의 관절 속도와 가속도의 기여를 더한다.
                    </li>
                    <li>
                        <strong>역방향 패스 (끝단 → 베이스)</strong>: 끝단이 환경에 가하는 임의의 힘에서 시작해, 각
                        링크가 부모에 가하는 wrench <InlineMath math='\mathcal{F}_i'/> 를 안쪽으로 전파한다. 관절 토크는
                        그 wrench를 관절의 screw 축에 사영한 성분이다,
                        <InlineMath math='\ \tau_i = \mathcal{F}_i^{\mathsf T}\mathcal{A}_i'/>.
                    </li>
                </ul>}
            />
            <T
                en={<p>
                    Each link's mass distribution enters through its <InlineMath math='6\times 6'/>{" "}
                    <strong>spatial inertia matrix</strong> <InlineMath math='\mathcal{G}_i = \operatorname{diag}(\mathcal{I}_i,\, m_i I)'/>,
                    which packages the rotational inertia <InlineMath math='\mathcal{I}_i'/> and the point-mass block{" "}
                    <InlineMath math='m_i I'/> together so that a spatial force relates to a spatial acceleration by{" "}
                    <InlineMath math='\mathcal{F} = \mathcal{G}\dot{\mathcal{V}} - [\mathrm{ad}_{\mathcal{V}}]^{\mathsf T}\mathcal{G}\mathcal{V}'/>.
                    No explicit <InlineMath math='M(\theta)'/> is ever assembled. Yet the same routine is the workhorse
                    for building it when needed: running inverse dynamics with{" "}
                    <InlineMath math='\dot\theta = 0'/>, <InlineMath math='g = 0'/> and{" "}
                    <InlineMath math='\ddot\theta = e_j'/> returns the <InlineMath math='j'/>-th column of{" "}
                    <InlineMath math='M(\theta)'/>, so <InlineMath math='n'/> passes recover the whole mass matrix, and
                    one more pass with <InlineMath math='\ddot\theta = 0'/> recovers{" "}
                    <InlineMath math='h(\theta,\dot\theta)'/> in closed form.
                </p>}
                ko={<p>
                    각 링크의 질량 분포는 그 <InlineMath math='6\times 6'/>{" "}
                    <strong>공간 관성 행렬</strong> <InlineMath math='\mathcal{G}_i = \operatorname{diag}(\mathcal{I}_i,\, m_i I)'/>{" "}
                    을 통해 들어오며, 이는 회전 관성 <InlineMath math='\mathcal{I}_i'/> 와 점질량 블록{" "}
                    <InlineMath math='m_i I'/> 를 함께 담아 공간 힘이 공간 가속도와{" "}
                    <InlineMath math='\mathcal{F} = \mathcal{G}\dot{\mathcal{V}} - [\mathrm{ad}_{\mathcal{V}}]^{\mathsf T}\mathcal{G}\mathcal{V}'/>{" "}
                    로 관계를 맺게 한다. 명시적인 <InlineMath math='M(\theta)'/> 는 결코 조립되지 않는다. 그러나 같은
                    루틴은 필요할 때 그것을 만드는 일꾼이기도 하다:{" "}
                    <InlineMath math='\dot\theta = 0'/>, <InlineMath math='g = 0'/>,{" "}
                    <InlineMath math='\ddot\theta = e_j'/> 로 Inverse Dynamics를 실행하면 <InlineMath math='M(\theta)'/> 의{" "}
                    <InlineMath math='j'/> 번째 열이 나오므로, <InlineMath math='n'/> 번의 패스로 Mass Matrix 전체를
                    복원하고, <InlineMath math='\ddot\theta = 0'/> 으로 한 번 더 패스하면{" "}
                    <InlineMath math='h(\theta,\dot\theta)'/> 를 닫힌 형태로 복원한다.
                </p>}
            />

            <T en={<h2>Forward Dynamics and Simulation</h2>} ko={<h2>Forward Dynamics와 시뮬레이션</h2>}/>
            <T
                en={<p>
                    To <strong>simulate</strong> a robot we run the equations the other way. At each instant solve the
                    forward-dynamics problem for the acceleration,
                </p>}
                ko={<p>
                    로봇을 <strong>시뮬레이션</strong>하려면 방정식을 반대 방향으로 돌린다. 매 순간 가속도에 대한
                    Forward Dynamics 문제를 푼다,
                </p>}
            />
            <BlockMath math={`\\ddot\\theta = M^{-1}(\\theta)\\big(\\tau - c(\\theta,\\dot\\theta) - g(\\theta)\\big)`}/>
            <T
                en={<p>
                    then integrate <InlineMath math='(\theta, \dot\theta)'/> forward one time step and repeat, with an
                    explicit Euler, semi-implicit Euler, or Runge–Kutta integrator. This loop is exactly what drives the
                    live simulation above. With <InlineMath math='\tau = 0'/> and gravity on, that 2R arm is a{" "}
                    <strong>double pendulum</strong>: energy-conserving in principle, yet <strong>chaotic</strong> — two
                    nearly identical starts diverge to completely different trajectories within a few swings.
                </p>}
                ko={<p>
                    그런 다음 <InlineMath math='(\theta, \dot\theta)'/> 를 한 시간 스텝만큼 앞으로 적분하고 반복한다 —
                    명시적 오일러, 준-암시적 오일러, 또는 룽게–쿠타 적분기로. 이 루프가 바로 위의 실시간 시뮬레이션을
                    구동하는 것이다. <InlineMath math='\tau = 0'/> 이고 중력이 켜져 있으면, 그 2R 팔은{" "}
                    <strong>이중 진자</strong>다: 원리상 에너지를 보존하지만 <strong>카오스적</strong>이다 — 거의 동일한
                    두 초기 상태가 몇 번의 흔들림 안에 완전히 다른 Trajectory로 갈라진다.
                </p>}
            />
            <T
                en={<p>
                    Setting <InlineMath math='\tau = g(\theta)'/> at every step is <strong>gravity compensation</strong>:
                    the applied torque exactly cancels the gravity term, so the arm floats as if weightless and drifts
                    only under the torques you add on top. Two caveats about the numerics:
                </p>}
                ko={<p>
                    매 스텝에서 <InlineMath math='\tau = g(\theta)'/> 로 설정하는 것이 <strong>중력 보상</strong>이다:
                    가해진 토크가 중력 항을 정확히 상쇄하므로, 팔은 무중력인 것처럼 뜨고 그 위에 더한 토크에 의해서만
                    움직인다. 수치 계산에 관한 두 가지 유의점:
                </p>}
            />
            <T
                en={<ul className="list-disc pl-6 space-y-1">
                    <li>
                        <strong>Energy drift</strong>: plain Euler integration slowly injects or bleeds energy, so an
                        ideal double pendulum will visibly gain or lose swing. Smaller steps, or symplectic / RK4
                        integrators, keep the energy honest — watch the reported <InlineMath math='E'/> in the figure to
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
                        <strong>에너지 드리프트</strong>: 단순 오일러 적분은 에너지를 서서히 주입하거나 새어 나가게
                        하므로, 이상적인 이중 진자도 눈에 띄게 흔들림이 커지거나 작아진다. 더 작은 스텝, 또는 심플렉틱 /
                        RK4 적분기는 에너지를 정직하게 유지한다 — 그림에 표시된 <InlineMath math='E'/> 를 지켜보며 얼마나
                        잘 유지되는지 확인하라.
                    </li>
                    <li>
                        <strong>프레임률 독립성</strong>: 물리는 디스플레이 프레임률과 분리된 고정된 작은 서브스텝으로
                        적분되므로, 브라우저가 30 또는 120 fps 로 렌더링하든 운동은 동일하게 보인다.
                    </li>
                </ul>}
            />
            <T
                en={<p>
                    Finally, the operator that turns torque into acceleration is <InlineMath math='M^{-1}(\theta)'/>
                    itself, and it is strongly configuration-dependent. Map the unit circle of joint torques{" "}
                    <InlineMath math='\{u : \lVert u\rVert = 1\}'/> through <InlineMath math='M^{-1}'/> and it becomes an{" "}
                    <strong>acceleration ellipse</strong> <InlineMath math='\{M^{-1}u\}'/> in the{" "}
                    <InlineMath math='(\ddot\theta_1, \ddot\theta_2)'/> plane. A round ellipse means the arm accelerates
                    about equally easily in every direction; a stretched one means it is easy to accelerate one way and
                    sluggish and coupled the other. Sweep <InlineMath math='\theta_2'/> below: as the arm folds
                    (<InlineMath math='\theta_2 \to \pm\pi'/>) the ellipse rounds out, and as it straightens
                    (<InlineMath math='\theta_2 \to 0'/>) the growing off-diagonal of <InlineMath math='M'/> stretches
                    and tilts it.
                </p>}
                ko={<p>
                    마지막으로, 토크를 가속도로 바꾸는 연산자는 <InlineMath math='M^{-1}(\theta)'/>
                    자신이며, 이는 configuration에 강하게 의존한다. 관절 토크의 단위 원{" "}
                    <InlineMath math='\{u : \lVert u\rVert = 1\}'/> 을 <InlineMath math='M^{-1}'/> 로 보내면{" "}
                    <InlineMath math='(\ddot\theta_1, \ddot\theta_2)'/> 평면에서{" "}
                    <strong>가속도 타원</strong> <InlineMath math='\{M^{-1}u\}'/> 이 된다. 둥근 타원은 팔이 모든 방향으로
                    거의 똑같이 쉽게 가속함을 뜻하고, 늘어난 타원은 한 방향으로는 가속하기 쉽지만 다른 방향으로는 굼뜨고
                    결합되어 있음을 뜻한다. 아래에서 <InlineMath math='\theta_2'/> 를 훑어 보라: 팔이 접히면
                    (<InlineMath math='\theta_2 \to \pm\pi'/>) 타원이 둥글어지고, 펴지면
                    (<InlineMath math='\theta_2 \to 0'/>) <InlineMath math='M'/> 의 커지는 비대각 성분이 그것을 늘이고
                    기울인다.
                </p>}
            />
            <MassMatrixEllipse/>
        </>
    )
}

export default Chapter8
