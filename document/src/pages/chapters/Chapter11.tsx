import {BlockMath, InlineMath} from "../../components/math/Tex";
import ErrorDynamicsExplorer from "../../components/pages/chapter11/ErrorDynamicsExplorer";
import EraserHybrid from "../../components/pages/chapter11/EraserHybrid";
import ForceControlSim from "../../components/pages/chapter11/ForceControlSim";
import ImpedanceSandbox from "../../components/pages/chapter11/ImpedanceSandbox";
import PdGravityEnergy from "../../components/pages/chapter11/PdGravityEnergy";
import TorqueControlPendulum from "../../components/pages/chapter11/TorqueControlPendulum";
import VelocityControlSim from "../../components/pages/chapter11/VelocityControlSim";
import {T} from "../../libs/i18n";

const Chapter11 = () => {
    return (
        <>
            <T en={<h2>Control System Overview</h2>} ko={<h2>제어 시스템 개관</h2>}/>
            <T
                en={<p>
                    Planning (Chapters 9 and 10) produces a desired behavior; <strong>control</strong> makes the real
                    robot follow it despite disturbances, model errors, and sensor noise. Depending on the task, the
                    desired behavior takes one of four forms:
                </p>}
                ko={<p>
                    9장과 10장에서는 로봇이 해야 할 행동을 계획했다. 이번 장의 주제인 <strong>제어</strong>는 외란,
                    모델 오차, 센서 잡음이 있는 현실에서 실제 로봇이 그 계획대로 움직이게 만드는 일이다. 작업에 따라
                    "원하는 행동"은 네 가지 중 하나의 모습이 된다:
                </p>}
            />
            <T
                en={<ul className="list-disc pl-6 space-y-1">
                    <li><strong>Motion control</strong>: follow a trajectory, like a pick-and-place arm in free
                        space.</li>
                    <li><strong>Force control</strong>: apply a specified wrench, like pressing a grinding wheel
                        against a surface.</li>
                    <li><strong>Hybrid motion–force control</strong>: control motion in some directions and force in
                        others at the same time, like erasing a whiteboard.</li>
                    <li><strong>Impedance control</strong>: behave like a programmable spring-mass-damper, like a
                        haptic interface rendering a virtual wall.</li>
                </ul>}
                ko={<ul className="list-disc pl-6 space-y-1">
                    <li><strong>Motion 제어</strong>: 정해진 궤적을 따라간다. 자유 공간에서 물건을 집어 옮기는 팔이
                        여기에 해당한다.</li>
                    <li><strong>Force 제어</strong>: 지정된 wrench를 낸다. 연마 휠을 표면에 일정한 힘으로 눌러 대는
                        작업.</li>
                    <li><strong>Hybrid motion–force 제어</strong>: 어떤 방향으로는 움직임을, 다른 방향으로는 힘을
                        동시에 제어한다. 화이트보드 지우기가 대표적이다.</li>
                    <li><strong>Impedance 제어</strong>: 정해 둔 스프링-질량-댐퍼처럼 행동한다. 가상 벽을 손에
                        느끼게 해 주는 햅틱 장치가 이 방식이다.</li>
                </ul>}
            />
            <T
                en={<p>
                    A key fact runs through the whole chapter: <strong>you cannot independently command both motion
                    and force in the same direction</strong>. If the robot imposes a motion, the environment decides
                    the force; if it imposes a force, the environment decides the motion. Pushing on a rigid wall
                    fixes your position (the wall's position) and you choose the force; moving your arm in free space
                    fixes the force (zero) and you choose the motion.
                </p>}
                ko={<p>
                    이 챕터 전체에 깔려 있는 사실이 하나 있다. <strong>같은 방향에 대해 움직임과 힘을 동시에 독립적으로
                    명령할 수는 없다</strong>는 것이다. 로봇이 움직임을 강제하면 힘은 환경이 정하고, 힘을 강제하면
                    움직임은 환경이 정한다. 단단한 벽을 밀 때 손의 위치는 벽이 정해 버리므로 우리가 고를 수 있는 것은
                    힘뿐이고, 허공에서 팔을 휘두를 때 접촉힘은 0으로 정해져 있으므로 고를 수 있는 것은 움직임뿐이다.
                </p>}
            />
            <T
                en={<p>
                    A typical control loop runs at 1&nbsp;kHz or faster: sensors (joint encoders for position,
                    tachometers or finite differences for velocity, wrist force-torque sensors for contact wrenches)
                    feed a controller, which commands amplifiers and motors, which drive the arm dynamics, and the
                    loop closes. In this chapter we idealize the actuators and sensors: each joint delivers the
                    commanded torque (Section 11.8 returns to how that is approximated in hardware) and measurements
                    are exact.
                </p>}
                ko={<p>
                    전형적인 제어 루프는 1&nbsp;kHz 이상으로 돈다. 센서가 상태를 재고(위치는 관절 인코더, 속도는
                    타코미터나 유한차분, 접촉 wrench는 손목의 힘-토크 센서), 제어기가 앰프와 모터에 명령을 보내고,
                    모터가 팔의 dynamics를 움직이고, 그 결과를 다시 센서가 재면서 루프가 닫힌다. 이 챕터에서는
                    구동기와 센서를 이상적인 것으로 둔다. 각 관절은 명령받은 토크를 정확히 내고(실제 하드웨어가 이를
                    어떻게 근사하는지는 마지막 절에서 다룬다), 측정에는 오차가 없다고 가정한다.
                </p>}
            />

            <T en={<h2>Error Dynamics</h2>} ko={<h2>오차 동역학</h2>}/>
            <T
                en={<p>
                    Define the joint error <InlineMath math='\theta_e(t) = \theta_d(t) - \theta(t)'/>. A controller
                    is judged by its <strong>error response</strong>: set a unit initial error{" "}
                    <InlineMath math='\theta_e(0) = 1'/> (with zero initial error rates) and watch{" "}
                    <InlineMath math='\theta_e(t)'/> evolve. Three numbers summarize it:
                </p>}
                ko={<p>
                    관절 오차를 <InlineMath math='\theta_e(t) = \theta_d(t) - \theta(t)'/>로 정의하자. 제어기의
                    성능은 <strong>오차 응답</strong>으로 평가한다. 단위 초기 오차{" "}
                    <InlineMath math='\theta_e(0) = 1'/>을 주고(초기 오차 변화율은 0){" "}
                    <InlineMath math='\theta_e(t)'/>가 시간에 따라 어떻게 줄어드는지 보는 것이다. 응답을 요약하는
                    숫자는 셋이다:
                </p>}
            />
            <T
                en={<ul className="list-disc pl-6 space-y-1">
                    <li><strong>Steady-state error</strong> <InlineMath math='e_{\mathrm{ss}}'/>: the error left as{" "}
                        <InlineMath math='t \to \infty'/>.</li>
                    <li><strong>Overshoot</strong>: how far the response crosses past zero,{" "}
                        <InlineMath math='|\theta_{e,\min}| / |\theta_e(0)| \times 100\%'/>.</li>
                    <li><strong>2% settling time</strong>: the first time after which{" "}
                        <InlineMath math='|\theta_e(t)|'/> stays within 2% of{" "}
                        <InlineMath math='|\theta_e(0)|'/>.</li>
                </ul>}
                ko={<ul className="list-disc pl-6 space-y-1">
                    <li><strong>Steady-state error</strong> <InlineMath math='e_{\mathrm{ss}}'/>: 시간이 충분히 지난
                        뒤에도 남아 있는 오차.</li>
                    <li><strong>Overshoot</strong>: 목표를 지나쳐 반대편으로 얼마나 나갔는지.{" "}
                        <InlineMath math='|\theta_{e,\min}| / |\theta_e(0)| \times 100\%'/>로 잰다.</li>
                    <li><strong>2% 정착 시간</strong>: 이후로는 <InlineMath math='|\theta_e(t)|'/>가 처음 오차의
                        2% 안에 계속 머무는 첫 시각.</li>
                </ul>}
            />
            <T
                en={<p>
                    Well-designed controllers often make the error obey a <strong>linear ordinary differential
                    equation</strong>, the <strong>error dynamics</strong>:
                </p>}
                ko={<p>
                    잘 설계한 제어기는 오차가 <strong>선형 상미분방정식</strong>을 따르도록 만드는 경우가 많다. 이
                    방정식을 <strong>오차 동역학</strong>이라고 부른다:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math={`a_p \\theta_e^{(p)} + a_{p-1} \\theta_e^{(p-1)} + \\cdots + a_1 \\dot\\theta_e + a_0 \\theta_e = 0`}/>
            </div>
            <T
                en={<p>
                    Guessing solutions of the form <InlineMath math='\theta_e(t) = e^{st}'/> and dividing by{" "}
                    <InlineMath math='e^{st} \neq 0'/> turns the ODE into the <strong>characteristic
                    equation</strong>{" "}
                    <InlineMath math='a_p s^p + \cdots + a_1 s + a_0 = 0'/> with roots{" "}
                    <InlineMath math='s_1, \ldots, s_p'/>. The general solution is a combination of{" "}
                    <InlineMath math='e^{s_i t}'/> terms, so every term decays to zero, for every initial error, if
                    and only if <strong>all roots have negative real part</strong>:{" "}
                    <InlineMath math='\mathrm{Re}(s_i) < 0'/>. That is the definition of a <strong>stable</strong>{" "}
                    error dynamics; one root with positive real part makes the error blow up.
                </p>}
                ko={<p>
                    <InlineMath math='\theta_e(t) = e^{st}'/> 꼴의 해를 대입하고 양변을{" "}
                    <InlineMath math='e^{st} \neq 0'/>으로 나누면, 미분방정식은 <strong>특성방정식</strong>{" "}
                    <InlineMath math='a_p s^p + \cdots + a_1 s + a_0 = 0'/>이 되고 그 근이{" "}
                    <InlineMath math='s_1, \ldots, s_p'/>다. 일반해는 <InlineMath math='e^{s_i t}'/> 항들의
                    조합이므로, 어떤 초기 오차든 0으로 수렴하려면 <strong>모든 근의 실수부가 음수</strong>여야 하고,
                    그거면 충분하다: <InlineMath math='\mathrm{Re}(s_i) < 0'/>. 이것이 <strong>안정한</strong> 오차
                    동역학의 정의다. 실수부가 양수인 근이 하나라도 있으면 오차는 자라나 폭발한다.
                </p>}
            />
            <T en={<h3>First-order error dynamics</h3>} ko={<h3>1차 오차 동역학</h3>}/>
            <T
                en={<p>
                    The simplest case is a spring <InlineMath math='k'/> pulling against a damper{" "}
                    <InlineMath math='b'/>: <InlineMath math='b\dot\theta_e + k\theta_e = 0'/>. Step by step:
                </p>}
                ko={<p>
                    가장 단순한 경우는 스프링 <InlineMath math='k'/>가 댐퍼 <InlineMath math='b'/>에 맞서 끌어당기는
                    상황이다: <InlineMath math='b\dot\theta_e + k\theta_e = 0'/>. 차례대로 풀어 보면:
                </p>}
            />
            <T
                en={<ol className="list-decimal pl-6 space-y-2">
                    <li>Rewrite as <InlineMath math='\dot\theta_e = -(k/b)\,\theta_e'/>: the error decays at a rate
                        proportional to itself.</li>
                    <li>The solution is <InlineMath math='\theta_e(t) = e^{-(k/b)t}\,\theta_e(0) = e^{-t/\mathfrak{t}}\,\theta_e(0)'/>{" "}
                        where <InlineMath math='\mathfrak{t} = b/k'/> is the <strong>time constant</strong>.</li>
                    <li>The 2% settling time solves <InlineMath math='e^{-t/\mathfrak{t}} = 0.02'/>:{" "}
                        <InlineMath math='t = \mathfrak{t}\,\ln 50 \approx 3.91\,\mathfrak{t} \approx 4\mathfrak{t}'/>.
                        So "settling takes about four time constants," with no overshoot and no steady-state
                        error.</li>
                </ol>}
                ko={<ol className="list-decimal pl-6 space-y-2">
                    <li><InlineMath math='\dot\theta_e = -(k/b)\,\theta_e'/>로 고쳐 쓴다. 오차가 자기 크기에 비례하는
                        속도로 줄어든다는 뜻이다.</li>
                    <li>해는 <InlineMath math='\theta_e(t) = e^{-(k/b)t}\,\theta_e(0) = e^{-t/\mathfrak{t}}\,\theta_e(0)'/>이고,
                        여기서 <InlineMath math='\mathfrak{t} = b/k'/>를 <strong>시간 상수</strong>라고 부른다.</li>
                    <li>2% 정착 시간은 <InlineMath math='e^{-t/\mathfrak{t}} = 0.02'/>가 되는 시각이므로{" "}
                        <InlineMath math='t = \mathfrak{t}\,\ln 50 \approx 3.91\,\mathfrak{t} \approx 4\mathfrak{t}'/>.
                        그래서 "정착까지는 시간 상수의 네 배쯤 걸린다"고 기억해 두면 된다. Overshoot도 잔여 오차도
                        없다.</li>
                </ol>}
            />
            <T en={<h3>Second-order error dynamics</h3>} ko={<h3>2차 오차 동역학</h3>}/>
            <T
                en={<p>
                    Add a mass: <InlineMath math='m\ddot\theta_e + b\dot\theta_e + k\theta_e = 0'/>. Dividing by{" "}
                    <InlineMath math='m'/> and matching to the <strong>standard second-order form</strong>
                </p>}
                ko={<p>
                    여기에 질량이 더해지면 <InlineMath math='m\ddot\theta_e + b\dot\theta_e + k\theta_e = 0'/>이
                    된다. <InlineMath math='m'/>으로 나눠 <strong>표준 2차형</strong>
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math={`\\ddot\\theta_e + 2\\zeta\\omega_n \\dot\\theta_e + \\omega_n^2 \\theta_e = 0,
                \\qquad \\omega_n = \\sqrt{\\tfrac{k}{m}}, \\qquad \\zeta = \\tfrac{b}{2\\sqrt{km}}`}/>
            </div>
            <T
                en={<p>
                    defines the <strong>natural frequency</strong> <InlineMath math='\omega_n'/> (how fast it wants
                    to oscillate) and the <strong>damping ratio</strong> <InlineMath math='\zeta'/> (how strongly
                    oscillation is suppressed). The characteristic equation and its roots:
                </p>}
                ko={<p>
                    에 맞추면 두 파라미터가 나온다. <strong>고유 진동수</strong> <InlineMath math='\omega_n'/>은
                    얼마나 빠르게 진동하려 하는지를, <strong>감쇠비</strong> <InlineMath math='\zeta'/>는 그 진동을
                    얼마나 강하게 누르는지를 나타낸다. 특성방정식과 근은 다음과 같다:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math={`s^2 + 2\\zeta\\omega_n s + \\omega_n^2 = 0 \\;\\Rightarrow\\;
                s_{1,2} = -\\zeta\\omega_n \\pm \\omega_n\\sqrt{\\zeta^2 - 1}`}/>
            </div>
            <T
                en={<p>
                    The sign of <InlineMath math='\zeta^2 - 1'/> splits three regimes. In each, the two constants come
                    from the initial conditions <InlineMath math='\theta_e(0) = 1'/>,{" "}
                    <InlineMath math='\dot\theta_e(0) = 0'/>:
                </p>}
                ko={<p>
                    <InlineMath math='\zeta^2 - 1'/>의 부호에 따라 세 영역으로 갈린다. 각 경우의 상수 두 개는 초기
                    조건 <InlineMath math='\theta_e(0) = 1'/>, <InlineMath math='\dot\theta_e(0) = 0'/>에서
                    정해진다:
                </p>}
            />
            <T
                en={<ol className="list-decimal pl-6 space-y-2">
                    <li><strong>Overdamped</strong> (<InlineMath math='\zeta > 1'/>): two distinct real roots, so{" "}
                        <InlineMath math='\theta_e(t) = c_1 e^{s_1 t} + c_2 e^{s_2 t}'/>. The conditions give the
                        pair of equations <InlineMath math='c_1 + c_2 = 1'/> and{" "}
                        <InlineMath math='s_1 c_1 + s_2 c_2 = 0'/>; solving,{" "}
                        <InlineMath math='c_1 = \tfrac{1}{2} + \tfrac{\zeta}{2\sqrt{\zeta^2-1}}'/>,{" "}
                        <InlineMath math='c_2 = 1 - c_1'/>. Slow, no oscillation.</li>
                    <li><strong>Critically damped</strong> (<InlineMath math='\zeta = 1'/>): a repeated root{" "}
                        <InlineMath math='s = -\omega_n'/>, so{" "}
                        <InlineMath math='\theta_e(t) = (c_1 + c_2 t)e^{-\omega_n t}'/> with{" "}
                        <InlineMath math='c_1 = 1'/>, <InlineMath math='c_2 = \omega_n'/>. The fastest response with
                        no overshoot.</li>
                    <li><strong>Underdamped</strong> (<InlineMath math='\zeta < 1'/>): a complex pair{" "}
                        <InlineMath math='s = -\zeta\omega_n \pm j\omega_d'/> with <strong>damped natural
                        frequency</strong> <InlineMath math='\omega_d = \omega_n\sqrt{1 - \zeta^2}'/>, so{" "}
                        <InlineMath math='\theta_e(t) = \big(\cos\omega_d t + \tfrac{\zeta}{\sqrt{1-\zeta^2}}\sin\omega_d t\big)e^{-\zeta\omega_n t}'/>:
                        a decaying oscillation.</li>
                </ol>}
                ko={<ol className="list-decimal pl-6 space-y-2">
                    <li><strong>Overdamped</strong> (<InlineMath math='\zeta > 1'/>): 서로 다른 실근 두 개가 나와{" "}
                        <InlineMath math='\theta_e(t) = c_1 e^{s_1 t} + c_2 e^{s_2 t}'/>. 초기 조건을 넣으면{" "}
                        <InlineMath math='c_1 + c_2 = 1'/>, <InlineMath math='s_1 c_1 + s_2 c_2 = 0'/>이라는 연립이
                        나오고, 풀면 <InlineMath math='c_1 = \tfrac{1}{2} + \tfrac{\zeta}{2\sqrt{\zeta^2-1}}'/>,{" "}
                        <InlineMath math='c_2 = 1 - c_1'/>. 느리지만 진동하지 않는다.</li>
                    <li><strong>Critically damped</strong> (<InlineMath math='\zeta = 1'/>): 중근{" "}
                        <InlineMath math='s = -\omega_n'/>이 나와{" "}
                        <InlineMath math='\theta_e(t) = (c_1 + c_2 t)e^{-\omega_n t}'/>,{" "}
                        <InlineMath math='c_1 = 1'/>, <InlineMath math='c_2 = \omega_n'/>. Overshoot 없이 가장 빠른
                        응답이다.</li>
                    <li><strong>Underdamped</strong> (<InlineMath math='\zeta < 1'/>): 복소근 쌍{" "}
                        <InlineMath math='s = -\zeta\omega_n \pm j\omega_d'/>이 나온다. 여기서{" "}
                        <InlineMath math='\omega_d = \omega_n\sqrt{1 - \zeta^2}'/>를 <strong>감쇠 고유
                        진동수</strong>라 하고, 해는{" "}
                        <InlineMath math='\theta_e(t) = \big(\cos\omega_d t + \tfrac{\zeta}{\sqrt{1-\zeta^2}}\sin\omega_d t\big)e^{-\zeta\omega_n t}'/>.
                        진동하면서 잦아든다.</li>
                </ol>}
            />
            <T
                en={<p>
                    The <strong>overshoot formula</strong> follows from the underdamped solution, step by step:
                </p>}
                ko={<p>
                    <strong>Overshoot 공식</strong>은 underdamped 해에서 단계별로 유도된다:
                </p>}
            />
            <T
                en={<ol className="list-decimal pl-6 space-y-2">
                    <li>Differentiate <InlineMath math='\theta_e(t)'/> and set{" "}
                        <InlineMath math='\dot\theta_e = 0'/> to find extrema. All the cosine terms cancel and what
                        remains is proportional to <InlineMath math='\sin \omega_d t'/>, so extrema occur at{" "}
                        <InlineMath math='\omega_d t = 0, \pi, 2\pi, \ldots'/></li>
                    <li>The first crossing to the other side is the peak at{" "}
                        <InlineMath math='t_p = \pi / \omega_d'/>.</li>
                    <li>Substitute back: <InlineMath math='\cos \pi = -1'/>,{" "}
                        <InlineMath math='\sin \pi = 0'/>, so{" "}
                        <InlineMath math='\theta_e(t_p) = -e^{-\zeta\omega_n \pi/\omega_d}'/>. Using{" "}
                        <InlineMath math='\omega_d = \omega_n\sqrt{1-\zeta^2}'/>, the{" "}
                        <InlineMath math='\omega_n'/> cancels:</li>
                </ol>}
                ko={<ol className="list-decimal pl-6 space-y-2">
                    <li><InlineMath math='\theta_e(t)'/>를 미분해서 <InlineMath math='\dot\theta_e = 0'/>이 되는
                        곳을 찾는다. 코사인 항이 모두 상쇄되고 <InlineMath math='\sin \omega_d t'/>에 비례하는 항만
                        남으므로, 극값은 <InlineMath math='\omega_d t = 0, \pi, 2\pi, \ldots'/>에서 생긴다.</li>
                    <li>처음으로 0을 지나쳐 반대편 봉우리에 닿는 순간이{" "}
                        <InlineMath math='t_p = \pi / \omega_d'/>다.</li>
                    <li>이 시각을 해에 대입하면 <InlineMath math='\cos \pi = -1'/>,{" "}
                        <InlineMath math='\sin \pi = 0'/>이므로{" "}
                        <InlineMath math='\theta_e(t_p) = -e^{-\zeta\omega_n \pi/\omega_d}'/>.{" "}
                        <InlineMath math='\omega_d = \omega_n\sqrt{1-\zeta^2}'/>를 넣으면{" "}
                        <InlineMath math='\omega_n'/>이 약분되어 사라진다:</li>
                </ol>}
            />
            <div className="overflow-x-auto">
                <BlockMath math={`\\text{overshoot} \\;=\\; e^{-\\pi\\zeta / \\sqrt{1 - \\zeta^2}} \\times 100\\%`}/>
            </div>
            <T
                en={<p>
                    Overshoot depends on <InlineMath math='\zeta'/> alone: 73% at{" "}
                    <InlineMath math='\zeta = 0.1'/>, 16% at <InlineMath math='\zeta = 0.5'/>, 4.3% at{" "}
                    <InlineMath math='\zeta = 0.707'/>, zero from <InlineMath math='\zeta = 1'/>. Settling time is
                    governed by the decay envelope <InlineMath math='e^{-\zeta\omega_n t}'/>, so by the same{" "}
                    <InlineMath math='4\mathfrak{t}'/> argument it is about{" "}
                    <InlineMath math='4/(\zeta\omega_n)'/>: four time constants of the slowest-decaying part. In the
                    s-plane this reads directly off the roots: distance to the left means fast settling, angle off
                    the real axis means overshoot.
                </p>}
                ko={<p>
                    결국 overshoot는 <InlineMath math='\zeta'/>에만 의존한다. <InlineMath math='\zeta = 0.1'/>이면
                    73%, <InlineMath math='0.5'/>면 16%, <InlineMath math='0.707'/>이면 4.3%,{" "}
                    <InlineMath math='1'/>부터는 0이다. 정착 시간은 감쇠 포락선{" "}
                    <InlineMath math='e^{-\zeta\omega_n t}'/>이 결정하므로, 앞의{" "}
                    <InlineMath math='4\mathfrak{t}'/> 논리를 그대로 쓰면 약{" "}
                    <InlineMath math='4/(\zeta\omega_n)'/>, 즉 가장 느리게 사라지는 성분 기준으로 시간 상수 네 배다.
                    이 모든 것은 s-평면에서 근만 보고도 읽을 수 있다. 근이 왼쪽으로 멀리 있을수록 빨리 정착하고,
                    실축에서 벗어난 각도가 클수록 overshoot가 크다.
                </p>}
            />
            <ErrorDynamicsExplorer/>

            <T en={<h2>Motion Control with Velocity Inputs</h2>} ko={<h2>속도 입력 Motion Control</h2>}/>
            <T
                en={<p>
                    Some robots accept <strong>velocity commands</strong> directly: stepper motors driven by pulse
                    rate, or amplifiers in velocity mode with their own fast internal loop. Then the control input is{" "}
                    <InlineMath math='\dot\theta'/> itself and the dynamics disappear from the analysis. The simplest
                    feedback is <strong>P control</strong>:
                </p>}
                ko={<p>
                    <strong>속도 명령</strong>을 그대로 받아 주는 로봇도 있다. 펄스 속도로 도는 스테퍼 모터가
                    그렇고, 자체 고속 루프를 내장한 velocity 모드 앰프도 그렇다. 이 경우 제어 입력이 곧{" "}
                    <InlineMath math='\dot\theta'/>이므로 dynamics는 분석에서 빠진다. 가장 단순한 피드백은{" "}
                    <strong>P 제어</strong>다:
                </p>}
            />
            <BlockMath math={`\\dot\\theta(t) = K_p \\theta_e(t), \\qquad K_p > 0`}/>
            <T
                en={<ol className="list-decimal pl-6 space-y-2">
                    <li><strong>Setpoint</strong> (<InlineMath math='\theta_d'/> constant,{" "}
                        <InlineMath math='\dot\theta_d = 0'/>): then{" "}
                        <InlineMath math='\dot\theta_e = \dot\theta_d - \dot\theta = -K_p\theta_e'/>. This is exactly
                        the first-order error dynamics above: exponential decay with time constant{" "}
                        <InlineMath math='1/K_p'/>. No overshoot, no steady-state error, faster with bigger{" "}
                        <InlineMath math='K_p'/>.</li>
                    <li><strong>Ramp reference</strong> (<InlineMath math='\theta_d(t) = ct'/>): now{" "}
                        <InlineMath math='\dot\theta_e = c - K_p\theta_e'/>. Setting{" "}
                        <InlineMath math='\dot\theta_e = 0'/> gives the equilibrium{" "}
                        <InlineMath math='\theta_e = c/K_p'/>, and solving the full linear ODE:</li>
                </ol>}
                ko={<ol className="list-decimal pl-6 space-y-2">
                    <li><strong>Setpoint</strong> (<InlineMath math='\theta_d'/> 상수,{" "}
                        <InlineMath math='\dot\theta_d = 0'/>): 이때{" "}
                        <InlineMath math='\dot\theta_e = \dot\theta_d - \dot\theta = -K_p\theta_e'/>가 되는데, 위에서
                        본 1차 오차 동역학 그대로다. 시간 상수 <InlineMath math='1/K_p'/>로 지수적으로 줄어들고,
                        overshoot도 잔여 오차도 없으며, <InlineMath math='K_p'/>가 클수록 빠르다.</li>
                    <li><strong>Ramp 기준</strong> (<InlineMath math='\theta_d(t) = ct'/>): 이번에는{" "}
                        <InlineMath math='\dot\theta_e = c - K_p\theta_e'/>다.{" "}
                        <InlineMath math='\dot\theta_e = 0'/>으로 놓으면 평형이{" "}
                        <InlineMath math='\theta_e = c/K_p'/>임을 알 수 있고, 선형 ODE를 끝까지 풀면:</li>
                </ol>}
            />
            <div className="overflow-x-auto">
                <BlockMath math={`\\theta_e(t) = \\frac{c}{K_p} + \\Big(\\theta_e(0) - \\frac{c}{K_p}\\Big)e^{-K_p t}
                \\;\\xrightarrow{\\,t\\to\\infty\\,}\\; \\frac{c}{K_p}`}/>
            </div>
            <T
                en={<p>
                    P control chases a moving target with a permanent lag <InlineMath math='c/K_p'/>. To erase it,
                    add an integral term, <strong>PI control</strong>:
                </p>}
                ko={<p>
                    P 제어는 움직이는 목표를 <InlineMath math='c/K_p'/>만큼 뒤처진 채 영원히 쫓아간다. 이 잔여
                    오차를 없애려면 적분 항을 추가한 <strong>PI 제어</strong>를 쓴다:
                </p>}
            />
            <BlockMath math={`\\dot\\theta(t) = K_p\\theta_e(t) + K_i \\int_0^t \\theta_e(\\mathrm{t})\\,d\\mathrm{t}`}/>
            <T
                en={<ol className="list-decimal pl-6 space-y-2">
                    <li>Insert into <InlineMath math='\dot\theta_e = \dot\theta_d - \dot\theta'/>:{" "}
                        <InlineMath math='\dot\theta_e + K_p\theta_e + K_i\int\theta_e = \dot\theta_d = c'/>.</li>
                    <li>Differentiate once to kill the integral (and the constant{" "}
                        <InlineMath math='c'/>):{" "}
                        <InlineMath math='\ddot\theta_e + K_p\dot\theta_e + K_i\theta_e = 0'/>. Second-order,
                        homogeneous: <em>any</em> constant reference velocity now drives the error to zero.</li>
                    <li>Match the standard form:{" "}
                        <InlineMath math='\omega_n = \sqrt{K_i}'/>,{" "}
                        <InlineMath math='\zeta = K_p / (2\sqrt{K_i})'/>. Both roots have negative real part exactly
                        when <InlineMath math='K_p > 0'/> and <InlineMath math='K_i > 0'/>.</li>
                </ol>}
                ko={<ol className="list-decimal pl-6 space-y-2">
                    <li><InlineMath math='\dot\theta_e = \dot\theta_d - \dot\theta'/>에 넣으면{" "}
                        <InlineMath math='\dot\theta_e + K_p\theta_e + K_i\int\theta_e = \dot\theta_d = c'/>.</li>
                    <li>양변을 한 번 미분해 적분(과 상수 <InlineMath math='c'/>)을 없앤다:{" "}
                        <InlineMath math='\ddot\theta_e + K_p\dot\theta_e + K_i\theta_e = 0'/>. 2차 동차식이 됐다.
                        기준 속도가 상수이기만 하면 <em>어떤 값이든</em> 오차는 0으로 간다.</li>
                    <li>표준형과 맞춰 보면 <InlineMath math='\omega_n = \sqrt{K_i}'/>,{" "}
                        <InlineMath math='\zeta = K_p / (2\sqrt{K_i})'/>. 두 근의 실수부가 모두 음수가 되는 조건은
                        정확히 <InlineMath math='K_p > 0'/>, <InlineMath math='K_i > 0'/>이다.</li>
                </ol>}
            />
            <T
                en={<p>
                    Fix <InlineMath math='K_p'/> and grow <InlineMath math='K_i'/> from zero and you trace a{" "}
                    <strong>root locus</strong>: at <InlineMath math='K_i = 0'/> the roots sit at{" "}
                    <InlineMath math='0'/> and <InlineMath math='-K_p'/>; as <InlineMath math='K_i'/> grows they
                    slide toward each other, meet at <InlineMath math='-K_p/2'/> when{" "}
                    <InlineMath math='K_i = K_p^2/4'/> (critical damping), then split vertically into a complex pair
                    whose real part stays <InlineMath math='-K_p/2'/>: more <InlineMath math='K_i'/> beyond critical
                    buys no settling speed, only overshoot. Finally, if the reference velocity is known, feed it
                    forward instead of making the error generate it:
                </p>}
                ko={<p>
                    <InlineMath math='K_p'/>를 고정하고 <InlineMath math='K_i'/>를 0에서부터 키우면 근이 움직이는
                    길, 즉 <strong>root locus</strong>가 그려진다. <InlineMath math='K_i = 0'/>일 때 근은{" "}
                    <InlineMath math='0'/>과 <InlineMath math='-K_p'/>에 있다가, <InlineMath math='K_i'/>가 커지면
                    서로 가까워져 <InlineMath math='K_i = K_p^2/4'/>에서 <InlineMath math='-K_p/2'/>에 만난다
                    (critical damping). 그보다 커지면 실수부 <InlineMath math='-K_p/2'/>를 유지한 채 위아래로 갈라져
                    복소쌍이 된다. 즉 임계값을 넘긴 <InlineMath math='K_i'/>는 정착을 더 빠르게 해 주지 못하고
                    overshoot만 키운다. 마지막으로, 기준 속도를 미리 알고 있다면 오차가 그 속도를 만들어 내게
                    기다리지 말고 feedforward로 직접 넣어 주는 편이 낫다:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math={`\\dot\\theta(t) = \\dot\\theta_d(t) + K_p\\theta_e(t) + K_i\\int_0^t \\theta_e(\\mathrm{t})\\,d\\mathrm{t}`}/>
            </div>
            <VelocityControlSim/>
            <T
                en={<p>
                    Everything vectorizes for an <InlineMath math='n'/>-joint robot with{" "}
                    <InlineMath math='K_p = k_p I'/>, <InlineMath math='K_i = k_i I'/>. In <strong>task
                    space</strong>, with the desired end-effector twist <InlineMath math='\mathcal{V}_d'/> given in
                    the frame of the <em>desired</em> configuration <InlineMath math='X_d'/>, the same controller
                    reads
                </p>}
                ko={<p>
                    <InlineMath math='n'/>관절 로봇에서는 <InlineMath math='K_p = k_p I'/>,{" "}
                    <InlineMath math='K_i = k_i I'/>로 두고 전부 벡터로 확장하면 된다. <strong>Task 공간</strong>
                    에서도 같은 구조가 성립한다. 원하는 end-effector twist <InlineMath math='\mathcal{V}_d'/>가{" "}
                    <em>목표</em> configuration <InlineMath math='X_d'/>의 좌표계 기준으로 주어졌다고 하면:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math={`\\mathcal{V}_b(t) = [\\mathrm{Ad}_{X^{-1}X_d}]\\,\\mathcal{V}_d(t)
                + K_p X_e(t) + K_i \\int_0^t X_e(\\mathrm{t})\\,d\\mathrm{t},
                \\qquad [X_e] = \\log(X^{-1}X_d)`}/>
            </div>
            <T
                en={<p>
                    Two Chapter 3 tools do the work: the matrix log turns the configuration error{" "}
                    <InlineMath math='X^{-1}X_d'/> into a twist <InlineMath math='X_e'/> that points from the current
                    to the desired pose, and the adjoint re-expresses <InlineMath math='\mathcal{V}_d'/> in the
                    actual body frame. Joint commands then come from{" "}
                    <InlineMath math='\dot\theta = J_b^\dagger(\theta)\mathcal{V}_b'/>.
                </p>}
                ko={<p>
                    3장의 도구 두 개가 여기서 일한다. 행렬 log는 configuration 오차{" "}
                    <InlineMath math='X^{-1}X_d'/>를 "현재 자세에서 목표 자세로 향하는 twist"{" "}
                    <InlineMath math='X_e'/>로 바꿔 주고, adjoint는 <InlineMath math='\mathcal{V}_d'/>를 실제 body
                    좌표계 기준으로 고쳐 쓴다. 관절 명령은{" "}
                    <InlineMath math='\dot\theta = J_b^\dagger(\theta)\mathcal{V}_b'/>로 얻는다.
                </p>}
            />

            <T en={<h2>Motion Control with Torque Inputs</h2>} ko={<h2>토크 입력 Motion Control</h2>}/>
            <T
                en={<p>
                    Most robots are not ideal velocity sources; the controller must command <strong>torques</strong>{" "}
                    and fight the dynamics. The lab bench for this section is a single link rotating in a vertical
                    plane:
                </p>}
                ko={<p>
                    하지만 대부분의 로봇은 이상적인 속도원이 아니다. 제어기는 <strong>토크</strong>를 직접 명령해야
                    하고, 그 사이에 dynamics가 끼어든다. 이 절에서는 수직 평면에서 회전하는 링크 하나를 놓고
                    실험한다:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math={`\\tau = M\\ddot\\theta + mgr\\cos\\theta + b\\dot\\theta`}/>
            </div>
            <T
                en={<p>
                    with inertia <InlineMath math='M = 0.5\ \mathrm{kg\,m^2}'/> about the joint, mass{" "}
                    <InlineMath math='m = 1\ \mathrm{kg}'/> at distance <InlineMath math='r = 0.1\ \mathrm{m}'/>,
                    viscous friction <InlineMath math='b = 0.1\ \mathrm{N\,m\,s/rad}'/>. Here{" "}
                    <InlineMath math='\theta = 0'/> is the horizontal, where gravity's torque{" "}
                    <InlineMath math='mgr\cos\theta \approx 0.98\ \mathrm{N\,m}'/> is largest.
                </p>}
                ko={<p>
                    관절 기준 관성은 <InlineMath math='M = 0.5\ \mathrm{kg\,m^2}'/>, 질량{" "}
                    <InlineMath math='m = 1\ \mathrm{kg}'/>이 거리 <InlineMath math='r = 0.1\ \mathrm{m}'/>에 있고,
                    점성 마찰은 <InlineMath math='b = 0.1\ \mathrm{N\,m\,s/rad}'/>다.{" "}
                    <InlineMath math='\theta = 0'/>이 수평 자세이고, 이때 중력 토크가{" "}
                    <InlineMath math='mgr\cos\theta \approx 0.98\ \mathrm{N\,m}'/>로 가장 크다.
                </p>}
            />
            <T en={<h3>PD control and the gravity residual</h3>} ko={<h3>PD 제어와 중력 잔여 오차</h3>}/>
            <BlockMath math={`\\tau = K_p\\theta_e + K_d\\dot\\theta_e`}/>
            <T
                en={<ol className="list-decimal pl-6 space-y-2">
                    <li>Take a setpoint (<InlineMath math='\dot\theta_d = \ddot\theta_d = 0'/>, so{" "}
                        <InlineMath math='\dot\theta_e = -\dot\theta'/>,{" "}
                        <InlineMath math='\ddot\theta_e = -\ddot\theta'/>) and first ignore gravity ({" "}
                        <InlineMath math='g = 0'/>, the link moves in a horizontal plane). Substituting the control
                        law into the dynamics:
                        <div className="overflow-x-auto">
                            <BlockMath math={`M\\ddot\\theta_e + (b + K_d)\\dot\\theta_e + K_p\\theta_e = 0`}/>
                        </div>
                        Linear, second order. Matching the standard form:{" "}
                        <InlineMath math='\omega_n = \sqrt{K_p/M}'/>,{" "}
                        <InlineMath math='\zeta = (b + K_d)/(2\sqrt{K_p M})'/>. Stable iff{" "}
                        <InlineMath math='K_p > 0'/> and <InlineMath math='b + K_d > 0'/>;{" "}
                        <InlineMath math='K_p'/> sets the speed, <InlineMath math='K_d'/> tunes the damping
                        independently.</li>
                    <li>Now restore gravity and ask where the arm comes to rest: set{" "}
                        <InlineMath math='\ddot\theta = \dot\theta = 0'/> in the closed loop{" "}
                        <InlineMath math='K_p\theta_e + K_d\dot\theta_e = M\ddot\theta + mgr\cos\theta + b\dot\theta'/>:
                        <div className="overflow-x-auto">
                            <BlockMath math={`K_p\\,\\theta_e = mgr\\cos\\theta`}/>
                        </div>
                        The spring force of the P term must hold the arm against gravity, so the error cannot be
                        zero. At <InlineMath math='\theta_d = 0'/> the residual is{" "}
                        <InlineMath math='\theta_e \approx mgr/K_p'/>: bigger <InlineMath math='K_p'/> shrinks it
                        but never kills it, and a stiff <InlineMath math='K_p'/> is dangerous around people.</li>
                </ol>}
                ko={<ol className="list-decimal pl-6 space-y-2">
                    <li>Setpoint를 놓고 (<InlineMath math='\dot\theta_d = \ddot\theta_d = 0'/>이므로{" "}
                        <InlineMath math='\dot\theta_e = -\dot\theta'/>,{" "}
                        <InlineMath math='\ddot\theta_e = -\ddot\theta'/>) 우선 중력이 없는 경우부터 본다 (
                        <InlineMath math='g = 0'/>, 링크가 수평면에서 도는 상황). 제어 법칙을 dynamics에 대입하면:
                        <div className="overflow-x-auto">
                            <BlockMath math={`M\\ddot\\theta_e + (b + K_d)\\dot\\theta_e + K_p\\theta_e = 0`}/>
                        </div>
                        선형 2차식이다. 표준형과 맞춰 보면 <InlineMath math='\omega_n = \sqrt{K_p/M}'/>,{" "}
                        <InlineMath math='\zeta = (b + K_d)/(2\sqrt{K_p M})'/>. 안정 조건은{" "}
                        <InlineMath math='K_p > 0'/>과 <InlineMath math='b + K_d > 0'/>이고,{" "}
                        <InlineMath math='K_p'/>로 응답 속도를, <InlineMath math='K_d'/>로 감쇠를 따로 맞출 수
                        있다.</li>
                    <li>이제 중력을 되살리고, 팔이 결국 어디에서 멈추는지 물어보자. 닫힌 루프{" "}
                        <InlineMath math='K_p\theta_e + K_d\dot\theta_e = M\ddot\theta + mgr\cos\theta + b\dot\theta'/>에{" "}
                        <InlineMath math='\ddot\theta = \dot\theta = 0'/>을 넣으면:
                        <div className="overflow-x-auto">
                            <BlockMath math={`K_p\\,\\theta_e = mgr\\cos\\theta`}/>
                        </div>
                        P 항이 스프링처럼 늘어나서 중력을 떠받쳐야 하니, 오차가 0이 될 수 없다.{" "}
                        <InlineMath math='\theta_d = 0'/>이라면 잔여 오차는 대략{" "}
                        <InlineMath math='\theta_e \approx mgr/K_p'/>. <InlineMath math='K_p'/>를 키우면 줄어들긴
                        하지만 완전히 사라지지는 않고, 그렇게 뻣뻣해진 팔은 사람 곁에서 위험해진다.</li>
                </ol>}
            />
            <T en={<h3>PID control</h3>} ko={<h3>PID 제어</h3>}/>
            <BlockMath math={`\\tau = K_p\\theta_e + K_i\\int_0^t \\theta_e(\\mathrm{t})\\,d\\mathrm{t} + K_d\\dot\\theta_e`}/>
            <T
                en={<ol className="list-decimal pl-6 space-y-2">
                    <li>At a resting equilibrium the P and D terms are frozen, but the <strong>integral keeps
                        growing</strong> as long as any error remains; it winds up until it supplies exactly the
                        gravity torque <InlineMath math='mgr\cos\theta_d'/>, and only then can{" "}
                        <InlineMath math='\theta_e = 0'/> be an equilibrium.</li>
                    <li>Near the setpoint (constant gravity torque), substitute and differentiate once to remove the
                        integral:
                        <div className="overflow-x-auto">
                            <BlockMath math={`M\\theta_e^{(3)} + (b + K_d)\\ddot\\theta_e + K_p\\dot\\theta_e + K_i\\theta_e = 0`}/>
                        </div></li>
                    <li>A cubic <InlineMath math='Ms^3 + (b+K_d)s^2 + K_p s + K_i'/> has all roots in the left half
                        plane iff (Routh's criterion) all coefficients are positive <em>and</em> the middle products
                        dominate:
                        <div className="overflow-x-auto">
                            <BlockMath math={`\\frac{(b + K_d)K_p}{M} > K_i > 0`}/>
                        </div>
                        The integral gain rides on a budget set by the other gains. Push{" "}
                        <InlineMath math='K_i'/> past the bound and the arm oscillates with growing amplitude, as
                        the simulator below will happily demonstrate.</li>
                </ol>}
                ko={<ol className="list-decimal pl-6 space-y-2">
                    <li>정지 평형에서는 P 항도 D 항도 더 변하지 않지만, <strong>적분 항은 오차가 남아 있는 한 계속
                        쌓인다</strong>. 중력 토크 <InlineMath math='mgr\cos\theta_d'/>를 정확히 대신 낼 만큼 쌓이고
                        나면, 그제야 <InlineMath math='\theta_e = 0'/>이 평형이 될 수 있다.</li>
                    <li>Setpoint 근방(중력 토크가 상수)에서 제어 법칙을 대입하고 한 번 미분해 적분을 없애면:
                        <div className="overflow-x-auto">
                            <BlockMath math={`M\\theta_e^{(3)} + (b + K_d)\\ddot\\theta_e + K_p\\dot\\theta_e + K_i\\theta_e = 0`}/>
                        </div></li>
                    <li>3차식 <InlineMath math='Ms^3 + (b+K_d)s^2 + K_p s + K_i'/>의 근이 전부 좌반평면에 있으려면
                        (Routh 판별법) 모든 계수가 양수인 것에 <em>더해</em> 가운데 계수들의 곱이 이겨야 한다:
                        <div className="overflow-x-auto">
                            <BlockMath math={`\\frac{(b + K_d)K_p}{M} > K_i > 0`}/>
                        </div>
                        즉 적분 이득은 마음대로 키울 수 있는 것이 아니라, 다른 이득들이 허용하는 범위 안에서만 쓸 수
                        있다. <InlineMath math='K_i'/>가 이 한계를 넘으면 팔은 점점 크게 진동한다. 아래
                        시뮬레이터에서 직접 넘겨 보라.</li>
                </ol>}
            />
            <T en={<h3>Feedforward and computed torque</h3>} ko={<h3>Feedforward와 computed torque</h3>}/>
            <T
                en={<p>
                    If we have a model <InlineMath math='\tilde M(\theta)'/>,{" "}
                    <InlineMath math='\tilde h(\theta, \dot\theta)'/> of the dynamics{" "}
                    <InlineMath math='\tau = M(\theta)\ddot\theta + h(\theta,\dot\theta)'/>, we can compute the
                    torque a trajectory <em>should</em> need and just play it back,{" "}
                    <InlineMath math='\tau(t) = \tilde M(\theta_d)\ddot\theta_d + \tilde h(\theta_d, \dot\theta_d)'/>.
                    But feedforward alone has no way to notice its own model errors, which accumulate without bound.
                    The right combination is <strong>computed torque control</strong>, derived in three steps:
                </p>}
                ko={<p>
                    dynamics <InlineMath math='\tau = M(\theta)\ddot\theta + h(\theta,\dot\theta)'/>의 모델{" "}
                    <InlineMath math='\tilde M(\theta)'/>, <InlineMath math='\tilde h(\theta, \dot\theta)'/>를 갖고
                    있다면, 궤적에 필요한 토크를 미리 계산해서 그대로 재생할 수 있다:{" "}
                    <InlineMath math='\tau(t) = \tilde M(\theta_d)\ddot\theta_d + \tilde h(\theta_d, \dot\theta_d)'/>.
                    문제는 feedforward만으로는 자기 모델이 틀렸다는 사실을 알아챌 방법이 없어서, 오차가 확인되지 않은
                    채 계속 쌓인다는 것이다. 제대로 된 조합이 <strong>computed torque 제어</strong>이고, 세 단계로
                    만들어진다:
                </p>}
            />
            <T
                en={<ol className="list-decimal pl-6 space-y-2">
                    <li><strong>Choose the acceleration you want.</strong> If we could command{" "}
                        <InlineMath math='\ddot\theta'/> directly, picking
                        <div className="overflow-x-auto">
                            <BlockMath math={`\\ddot\\theta = \\ddot\\theta_d + K_p\\theta_e + K_i\\int\\theta_e + K_d\\dot\\theta_e`}/>
                        </div>
                        would make the error obey{" "}
                        <InlineMath math='\ddot\theta_e + K_d\dot\theta_e + K_p\theta_e + K_i\int\theta_e = 0'/>:
                        linear, homogeneous, gains chosen at will.</li>
                    <li><strong>Buy that acceleration with the model.</strong> Substitute the commanded acceleration
                        into the dynamics model:
                        <div className="overflow-x-auto">
                            <BlockMath math={`\\tau = \\tilde M(\\theta)\\Big(\\ddot\\theta_d + K_p\\theta_e + K_i\\int\\theta_e + K_d\\dot\\theta_e\\Big) + \\tilde h(\\theta, \\dot\\theta)`}/>
                        </div>
                        The model terms are evaluated at the <em>actual</em> state, not the desired one: they cancel
                        the real nonlinearities where the robot actually is.</li>
                    <li><strong>Check the result.</strong> If the model is exact ({" "}
                        <InlineMath math='\tilde M = M'/>, <InlineMath math='\tilde h = h'/>), equating this{" "}
                        <InlineMath math='\tau'/> with the true dynamics cancels{" "}
                        <InlineMath math='\tilde h'/> against <InlineMath math='h'/> and{" "}
                        <InlineMath math='\tilde M'/> against <InlineMath math='M'/>, leaving exactly the linear
                        error dynamics of step 1. Feedforward flies the trajectory; feedback only cleans up model
                        error, so its gains can stay soft.</li>
                </ol>}
                ko={<ol className="list-decimal pl-6 space-y-2">
                    <li><strong>원하는 가속도부터 고른다.</strong> 만약 <InlineMath math='\ddot\theta'/>를 직접
                        명령할 수 있다면,
                        <div className="overflow-x-auto">
                            <BlockMath math={`\\ddot\\theta = \\ddot\\theta_d + K_p\\theta_e + K_i\\int\\theta_e + K_d\\dot\\theta_e`}/>
                        </div>
                        를 고르는 순간 오차는{" "}
                        <InlineMath math='\ddot\theta_e + K_d\dot\theta_e + K_p\theta_e + K_i\int\theta_e = 0'/>을
                        따르게 된다. 선형 동차식이고, 이득도 우리가 정한 값 그대로다.</li>
                    <li><strong>그 가속도를 내는 데 필요한 토크를 모델로 계산한다.</strong> 명령 가속도를 dynamics
                        모델에 넣으면:
                        <div className="overflow-x-auto">
                            <BlockMath math={`\\tau = \\tilde M(\\theta)\\Big(\\ddot\\theta_d + K_p\\theta_e + K_i\\int\\theta_e + K_d\\dot\\theta_e\\Big) + \\tilde h(\\theta, \\dot\\theta)`}/>
                        </div>
                        여기서 모델 항을 목표 상태가 아니라 <em>실제</em> 상태에서 계산한다는 점이 중요하다. 지워야
                        할 비선형성은 로봇이 지금 실제로 있는 자세의 것이기 때문이다.</li>
                    <li><strong>결과를 확인한다.</strong> 모델이 정확하다면 (<InlineMath math='\tilde M = M'/>,{" "}
                        <InlineMath math='\tilde h = h'/>) 이 <InlineMath math='\tau'/>를 실제 dynamics와 놓고 보면{" "}
                        <InlineMath math='\tilde h'/>는 <InlineMath math='h'/>와,{" "}
                        <InlineMath math='\tilde M'/>은 <InlineMath math='M'/>과 지워지고, 1단계에서 골라 둔 선형
                        오차 동역학만 남는다. 궤적을 따라가는 일은 feedforward가 담당하고 feedback은 모델 오차를
                        지우는 일만 맡으므로, feedback 이득을 무리하게 키울 필요가 없다.</li>
                </ol>}
            />
            <TorqueControlPendulum/>
            <T en={<h3>Multi-joint robots and a stability proof</h3>} ko={<h3>다관절 로봇과 안정성 증명</h3>}/>
            <T
                en={<p>
                    For <InlineMath math='n'/> joints everything above holds with matrices:{" "}
                    <InlineMath math='\tau = \tilde M(\theta)(\ddot\theta_d + K_p\theta_e + K_i\int\theta_e + K_d\dot\theta_e) + \tilde h(\theta, \dot\theta)'/>.
                    A <strong>decentralized</strong> controller runs an independent PID per joint, fine when the
                    coupling is weak (highly geared joints, where reflected rotor inertia dominates); a{" "}
                    <strong>centralized</strong> controller uses the full <InlineMath math='M'/> and{" "}
                    <InlineMath math='h'/>, needed for fast, low-geared, human-interactive robots. A beautiful
                    special case is <strong>PD plus gravity compensation</strong>,{" "}
                    <InlineMath math='\tau = K_p\theta_e - K_d\dot\theta + \tilde g(\theta)'/>, whose global
                    convergence follows from an energy argument:
                </p>}
                ko={<p>
                    관절이 <InlineMath math='n'/>개가 되어도 위의 내용은 행렬로 그대로 성립한다:{" "}
                    <InlineMath math='\tau = \tilde M(\theta)(\ddot\theta_d + K_p\theta_e + K_i\int\theta_e + K_d\dot\theta_e) + \tilde h(\theta, \dot\theta)'/>.
                    관절마다 독립적인 PID를 돌리는 방식을 <strong>decentralized</strong> 제어라 하는데, 기어비가 높아
                    반사된 로터 관성이 지배적이고 관절 사이 결합이 약한 로봇이라면 이걸로 충분하다. 반면 빠르게
                    움직이거나 기어비가 낮거나 사람과 접촉하는 로봇은 온전한 <InlineMath math='M'/>과{" "}
                    <InlineMath math='h'/>를 쓰는 <strong>centralized</strong> 제어가 필요하다. 특히 아름다운 특수
                    사례가 <strong>PD + 중력 보상</strong>,{" "}
                    <InlineMath math='\tau = K_p\theta_e - K_d\dot\theta + \tilde g(\theta)'/>이다. 이 제어기의 전역
                    수렴은 에너지 논증으로 증명할 수 있다:
                </p>}
            />
            <T
                en={<ol className="list-decimal pl-6 space-y-2">
                    <li>Define the virtual "error energy," kinetic plus the P-spring's potential:
                        <div className="overflow-x-auto">
                            <BlockMath math={`V = \\tfrac{1}{2}\\dot\\theta^{\\mathrm T} M(\\theta)\\dot\\theta + \\tfrac{1}{2}\\theta_e^{\\mathrm T} K_p \\theta_e`}/>
                        </div></li>
                    <li>Differentiate along trajectories (setpoint, so{" "}
                        <InlineMath math='\dot\theta_e = -\dot\theta'/>):
                        <div className="overflow-x-auto">
                            <BlockMath math={`\\dot V = \\dot\\theta^{\\mathrm T} M\\ddot\\theta + \\tfrac{1}{2}\\dot\\theta^{\\mathrm T}\\dot M\\dot\\theta - \\dot\\theta^{\\mathrm T} K_p\\theta_e`}/>
                        </div></li>
                    <li>Substitute the closed-loop dynamics{" "}
                        <InlineMath math='M\ddot\theta = K_p\theta_e - K_d\dot\theta - C\dot\theta'/> (gravity
                        cancelled by <InlineMath math='\tilde g'/>). The <InlineMath math='K_p'/> terms cancel and
                        <div className="overflow-x-auto">
                            <BlockMath math={`\\dot V = \\tfrac{1}{2}\\dot\\theta^{\\mathrm T}\\big(\\dot M - 2C\\big)\\dot\\theta - \\dot\\theta^{\\mathrm T} K_d \\dot\\theta = -\\dot\\theta^{\\mathrm T} K_d \\dot\\theta \\le 0`}/>
                        </div>
                        because <InlineMath math='\dot M - 2C'/> is skew-symmetric (Chapter 8): passivity does the
                        heavy lifting.</li>
                    <li>Energy only decreases, and it can stop decreasing only where{" "}
                        <InlineMath math='\dot\theta = 0'/>. By the Krasovskii–LaSalle invariance principle the
                        state falls into the largest invariant set with <InlineMath math='\dot\theta \equiv 0'/>:
                        there <InlineMath math='\ddot\theta = 0'/> forces{" "}
                        <InlineMath math='K_p\theta_e = 0'/>, i.e.{" "}
                        <InlineMath math='\theta_e = 0'/>. Any starting state converges to the goal, with no
                        knowledge of <InlineMath math='M'/> or <InlineMath math='C'/> beyond gravity.</li>
                </ol>}
                ko={<ol className="list-decimal pl-6 space-y-2">
                    <li>운동 에너지에 P 스프링에 저장된 에너지를 더해, 가상의 "오차 에너지"를 정의한다:
                        <div className="overflow-x-auto">
                            <BlockMath math={`V = \\tfrac{1}{2}\\dot\\theta^{\\mathrm T} M(\\theta)\\dot\\theta + \\tfrac{1}{2}\\theta_e^{\\mathrm T} K_p \\theta_e`}/>
                        </div></li>
                    <li>시간에 대해 미분한다 (setpoint라서 <InlineMath math='\dot\theta_e = -\dot\theta'/>):
                        <div className="overflow-x-auto">
                            <BlockMath math={`\\dot V = \\dot\\theta^{\\mathrm T} M\\ddot\\theta + \\tfrac{1}{2}\\dot\\theta^{\\mathrm T}\\dot M\\dot\\theta - \\dot\\theta^{\\mathrm T} K_p\\theta_e`}/>
                        </div></li>
                    <li>닫힌 루프 dynamics{" "}
                        <InlineMath math='M\ddot\theta = K_p\theta_e - K_d\dot\theta - C\dot\theta'/>를 대입한다
                        (중력은 <InlineMath math='\tilde g'/>가 이미 지웠다). <InlineMath math='K_p'/> 항이 서로
                        상쇄되고,
                        <div className="overflow-x-auto">
                            <BlockMath math={`\\dot V = \\tfrac{1}{2}\\dot\\theta^{\\mathrm T}\\big(\\dot M - 2C\\big)\\dot\\theta - \\dot\\theta^{\\mathrm T} K_d \\dot\\theta = -\\dot\\theta^{\\mathrm T} K_d \\dot\\theta \\le 0`}/>
                        </div>
                        첫 항이 0이 되는 것은 <InlineMath math='\dot M - 2C'/>가 skew-symmetric이라는 8장의 사실
                        덕분이다.</li>
                    <li>에너지는 줄어들기만 하고, 줄어들기를 멈출 수 있는 곳은{" "}
                        <InlineMath math='\dot\theta = 0'/>뿐이다. Krasovskii–LaSalle 불변 원리에 따라 상태는{" "}
                        <InlineMath math='\dot\theta \equiv 0'/>인 가장 큰 불변 집합으로 빨려 들어가는데, 그 안에서는{" "}
                        <InlineMath math='\ddot\theta = 0'/>이므로 <InlineMath math='K_p\theta_e = 0'/>, 곧{" "}
                        <InlineMath math='\theta_e = 0'/>일 수밖에 없다. 어떤 초기 상태에서 출발해도 목표에
                        도달한다는 뜻이고, 필요한 모델은 중력뿐이다. <InlineMath math='M'/>도{" "}
                        <InlineMath math='C'/>도 몰라도 된다.</li>
                </ol>}
            />
            <PdGravityEnergy/>
            <T
                en={<p>
                    The task-space version of computed torque commands an end-effector acceleration with the same
                    PD structure, converts it to a wrench with the task-space dynamics of Chapter 8, and maps it to
                    joint torques by <InlineMath math='\tau = J^{\mathrm T}(\theta)\mathcal{F}'/>:
                </p>}
                ko={<p>
                    computed torque의 task 공간 버전도 구조는 같다. 같은 PD 꼴로 end-effector 가속도를 명령하고,
                    8장의 task 공간 dynamics로 wrench로 바꾼 뒤,{" "}
                    <InlineMath math='\tau = J^{\mathrm T}(\theta)\mathcal{F}'/>로 관절 토크에 옮긴다:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math={`\\mathcal{F} = \\tilde\\Lambda(\\theta)\\Big(\\frac{d}{dt}\\big([\\mathrm{Ad}_{X^{-1}X_d}]\\mathcal{V}_d\\big) + K_p X_e + K_i\\int X_e + K_d \\mathcal{V}_e\\Big) + \\tilde\\eta(\\theta, \\mathcal{V}_b)`}/>
            </div>

            <T en={<h2>Force Control</h2>} ko={<h2>Force Control</h2>}/>
            <T
                en={<p>
                    When the job <em>is</em> the force (polishing, deburring, holding a constant contact pressure),
                    control the wrench. With the end-effector pressing on the environment, the dynamics gain a term:{" "}
                    <InlineMath math='\tau = M(\theta)\ddot\theta + h(\theta,\dot\theta) + J^{\mathrm T}(\theta)\mathcal{F}_{\mathrm{tip}}'/>.
                    Force-control tasks are nearly static (the environment does not move much), so drop the
                    acceleration and velocity terms: the quasistatic balance is{" "}
                    <InlineMath math='\tau = \tilde g(\theta) + J^{\mathrm T}(\theta)\mathcal{F}_{\mathrm{tip}}'/>.
                    The practical controller adds PI feedback on the measured force error{" "}
                    <InlineMath math='\mathcal{F}_e = \mathcal{F}_d - \mathcal{F}_{\mathrm{tip}}'/> and, because
                    force sensors are noisy and pure force control drifts, <strong>velocity damping</strong>:
                </p>}
                ko={<p>
                    작업의 목적 자체가 힘인 경우도 있다. 연마, 디버링, 일정한 접촉 압력 유지 같은 작업에서는 wrench를
                    직접 제어한다. End-effector가 환경을 누르고 있으면 dynamics에 접촉 항이 하나 붙는다:{" "}
                    <InlineMath math='\tau = M(\theta)\ddot\theta + h(\theta,\dot\theta) + J^{\mathrm T}(\theta)\mathcal{F}_{\mathrm{tip}}'/>.
                    힘 제어 작업에서 로봇은 거의 움직이지 않으므로 가속도·속도 항을 무시하면 준정적 균형{" "}
                    <InlineMath math='\tau = \tilde g(\theta) + J^{\mathrm T}(\theta)\mathcal{F}_{\mathrm{tip}}'/>만
                    남는다. 실전 제어기는 여기에 두 가지를 더 얹는다. 측정한 힘 오차{" "}
                    <InlineMath math='\mathcal{F}_e = \mathcal{F}_d - \mathcal{F}_{\mathrm{tip}}'/>에 대한 PI
                    피드백, 그리고 힘 센서의 잡음과 드리프트 때문에 필요한 <strong>속도 damping</strong>이다:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math={`\\tau = \\tilde g(\\theta) + J^{\\mathrm T}(\\theta)\\Big(\\mathcal{F}_d + K_{fp}\\mathcal{F}_e + K_{fi}\\int \\mathcal{F}_e\\,dt - K_{\\mathrm{damp}}\\mathcal{V}\\Big)`}/>
            </div>
            <T
                en={<p>
                    Read it term by term: gravity compensation keeps statics honest, the feedforward{" "}
                    <InlineMath math='\mathcal{F}_d'/> supplies the bulk of the force, PI trims the measured error
                    (the integrator soaking up unmodeled friction and drift), and the damping term bleeds off any
                    velocity so the arm does not run away while in light contact.
                </p>}
                ko={<p>
                    항을 하나씩 읽어 보자. 중력 보상 <InlineMath math='\tilde g(\theta)'/>는 팔 자체 무게가 힘
                    측정에 섞이지 않게 하고, feedforward <InlineMath math='\mathcal{F}_d'/>가 필요한 힘의 대부분을
                    만들며, PI는 센서로 측정한 오차를 마저 지우고(모델에 없는 마찰이나 드리프트는 적분기가 흡수한다),
                    damping 항은 속도를 계속 깎아서 접촉이 살짝 끊겼을 때 팔이 튀어 나가지 않게 잡아 준다. 아래에서
                    feedforward만 썼을 때와 PI를 더했을 때의 차이를 직접 확인할 수 있다.
                </p>}
            />
            <ForceControlSim/>

            <T en={<h2>Hybrid Motion–Force Control</h2>} ko={<h2>Hybrid Motion–Force Control</h2>}/>
            <T
                en={<p>
                    Erasing a whiteboard needs both at once: force <em>into</em> the board, motion <em>along</em>{" "}
                    it. Rigid contact imposes <InlineMath math='k'/> <strong>natural constraints</strong> on the
                    twist, written as a Pfaffian constraint <InlineMath math='A(\theta)\mathcal{V} = 0'/>, and dual
                    constraints on the wrench (the frictionless board cannot pull the eraser or drag it sideways).
                    The task then supplies <strong>artificial constraints</strong>: the controller chooses the{" "}
                    <InlineMath math='n - k'/> free motion directions and the <InlineMath math='k'/> constrained
                    force components. For the eraser: velocity into the board is zero (natural), sliding velocity is
                    the commanded pattern (artificial), pressing force is 5 N (artificial), sideways friction force
                    is zero (natural).
                </p>}
                ko={<p>
                    화이트보드 지우기는 두 가지를 동시에 요구한다. 보드 <em>안쪽으로는</em> 힘, 보드{" "}
                    <em>표면을 따라서는</em> 움직임. 강체 접촉은 twist에 <InlineMath math='k'/>개의{" "}
                    <strong>natural constraint</strong>를 Pfaffian 형태{" "}
                    <InlineMath math='A(\theta)\mathcal{V} = 0'/>으로 강제하고, wrench에는 그 쌍대 제약을 강제한다
                    (마찰 없는 보드는 지우개를 잡아당길 수도, 옆으로 끌 수도 없다). 여기에 작업이{" "}
                    <strong>artificial constraint</strong>를 얹는다. 즉 제어기는 <InlineMath math='n - k'/>개의 자유
                    운동 방향과 <InlineMath math='k'/>개의 힘 성분을 골라 명령한다. 지우개라면: 보드 안쪽으로
                    파고드는 속도는 0 (natural), 표면을 따라 미끄러지는 속도는 우리가 명령하는 패턴 (artificial),
                    누르는 힘은 5 N (artificial), 옆 방향 마찰력은 0 (natural).
                </p>}
            />
            <T
                en={<p>
                    How do we split the commanded torque so the motion part does not fight the force part? Chapter
                    8's constrained dynamics answer with a projection, derived in three steps:
                </p>}
                ko={<p>
                    그럼 명령 토크를 어떻게 갈라야 motion 담당과 force 담당이 서로 싸우지 않을까? 8장의 constrained
                    dynamics가 projection으로 답을 준다. 세 단계로 따라가 보자:
                </p>}
            />
            <T
                en={<ol className="list-decimal pl-6 space-y-2">
                    <li>With constraints, the dynamics carry Lagrange multipliers{" "}
                        <InlineMath math='\lambda \in \mathbb{R}^k'/> (the contact forces):{" "}
                        <InlineMath math='\tau = M\ddot\theta + h + A^{\mathrm T}\lambda'/>, together with{" "}
                        <InlineMath math='A\dot\theta = 0'/> (here <InlineMath math='A'/> acts on joint rates).</li>
                    <li>Differentiate the constraint (<InlineMath math='A\ddot\theta = -\dot A\dot\theta'/>),
                        substitute <InlineMath math='\ddot\theta'/> from the dynamics, and solve for{" "}
                        <InlineMath math='\lambda'/>: a closed-form function of{" "}
                        <InlineMath math='(\theta, \dot\theta, \tau)'/> through the invertible matrix{" "}
                        <InlineMath math='A M^{-1} A^{\mathrm T}'/>. The contact force the environment must supply
                        is fully determined by the state and the commanded torque.</li>
                    <li>Define the <strong>projection</strong>
                        <div className="overflow-x-auto">
                            <BlockMath math={`P = I - A^{\\mathrm T}\\big(A M^{-1} A^{\\mathrm T}\\big)^{-1} A M^{-1}`}/>
                        </div>
                        <InlineMath math='P\tau'/> is the part of a torque that moves the robot along the
                        constraints; <InlineMath math='(I - P)\tau'/> is the part that only presses against them.
                        The two subspaces are exactly the two halves of the task.</li>
                </ol>}
                ko={<ol className="list-decimal pl-6 space-y-2">
                    <li>제약이 있으면 dynamics에 Lagrange 승수{" "}
                        <InlineMath math='\lambda \in \mathbb{R}^k'/>(접촉력)가 붙는다:{" "}
                        <InlineMath math='\tau = M\ddot\theta + h + A^{\mathrm T}\lambda'/>, 그리고{" "}
                        <InlineMath math='A\dot\theta = 0'/> (여기서는 <InlineMath math='A'/>가 관절 속도에
                        걸린다고 쓰자).</li>
                    <li>제약식을 미분하고 (<InlineMath math='A\ddot\theta = -\dot A\dot\theta'/>) dynamics에서 얻은{" "}
                        <InlineMath math='\ddot\theta'/>를 대입하면 <InlineMath math='\lambda'/>를 풀 수 있다. 가역
                        행렬 <InlineMath math='A M^{-1} A^{\mathrm T}'/>를 거쳐{" "}
                        <InlineMath math='(\theta, \dot\theta, \tau)'/>의 닫힌 형태 함수가 나온다. 즉 환경이 내야 할
                        접촉력은 현재 상태와 명령 토크만으로 완전히 정해진다.</li>
                    <li>이제 <strong>projection</strong>을 정의한다:
                        <div className="overflow-x-auto">
                            <BlockMath math={`P = I - A^{\\mathrm T}\\big(A M^{-1} A^{\\mathrm T}\\big)^{-1} A M^{-1}`}/>
                        </div>
                        <InlineMath math='P\tau'/>는 토크 가운데 제약을 따라 로봇을 실제로 움직이는 성분이고,{" "}
                        <InlineMath math='(I - P)\tau'/>는 제약면을 누르기만 하는 성분이다. 이 두 부분공간이 작업의
                        두 절반, motion과 force에 정확히 대응한다.</li>
                </ol>}
            />
            <T
                en={<p>
                    The hybrid controller is then literally a sum of the two controllers we already built, each
                    passed through its own projection, plus one shared gravity model:
                </p>}
                ko={<p>
                    그래서 hybrid 제어기는 말 그대로, 앞에서 만든 motion 제어기와 force 제어기를 각자의 projection에
                    통과시켜 더한 것이다. 중력 모델 하나만 공유한다:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math={`\\tau = P(\\theta)\\,\\tau_{\\mathrm{motion}} + \\big(I - P(\\theta)\\big)\\,\\tau_{\\mathrm{force}} + \\tilde g(\\theta)`}/>
            </div>
            <EraserHybrid/>

            <T en={<h2>Impedance Control</h2>} ko={<h2>Impedance Control</h2>}/>
            <T
                en={<p>
                    Instead of commanding a motion <em>or</em> a force, command a <strong>relationship</strong>{" "}
                    between them: behave like a chosen mass-spring-damper. For one degree of freedom the target
                    behavior is
                </p>}
                ko={<p>
                    움직임이나 힘 중 하나를 명령하는 대신, 둘 사이의 <strong>관계</strong>를 명령할 수도 있다.
                    "정해 둔 질량-스프링-댐퍼처럼 행동해라"라고 시키는 것이다. 1자유도라면 목표 행동은 이렇다:
                </p>}
            />
            <BlockMath math={`M\\ddot x + B\\dot x + Kx = f_{\\mathrm{ext}}`}/>
            <T
                en={<p>
                    Taking the Laplace transform of the (linearized) behavior gives{" "}
                    <InlineMath math='F(s) = Z(s)\,sX(s)'/> where the <strong>impedance</strong>{" "}
                    <InlineMath math='Z(s)'/> measures how much force a motion provokes; its inverse is the{" "}
                    <strong>admittance</strong> <InlineMath math='Y(s) = Z^{-1}(s)'/>. A good motion controller is a
                    high-impedance robot (motions barely disturbed by forces); a good force controller is a
                    low-impedance one (forces barely disturbed by motions). Impedance control dials in anything in
                    between, and there are two dual implementations:
                </p>}
                ko={<p>
                    이 행동을 (선형화해서) Laplace 변환하면 <InlineMath math='F(s) = Z(s)\,sX(s)'/> 꼴이 되는데,
                    여기서 <strong>impedance</strong> <InlineMath math='Z(s)'/>는 움직임이 얼마나 큰 힘을
                    불러일으키는지를 나타낸다. 그 역수가 <strong>admittance</strong>{" "}
                    <InlineMath math='Y(s) = Z^{-1}(s)'/>다. 좋은 motion 제어기란 impedance가 높은 로봇이고(외부
                    힘이 움직임을 거의 흔들지 못한다), 좋은 force 제어기란 impedance가 낮은 로봇이다(움직임이 힘을
                    거의 흔들지 못한다). Impedance 제어는 그 사이 어디든 원하는 지점을 고를 수 있게 해 주며, 구현
                    방식은 서로 쌍대인 두 가지가 있다:
                </p>}
            />
            <T
                en={<ul className="list-disc pl-6 space-y-1">
                    <li><strong>Impedance-controlled</strong>: sense the motion{" "}
                        (<InlineMath math='x, \dot x, \ddot x'/>), command the force. The control law cancels the
                        robot's own dynamics and substitutes the virtual ones:
                        <div className="overflow-x-auto">
                            <BlockMath math={`\\tau = J^{\\mathrm T}(\\theta)\\Big(\\tilde\\Lambda(\\theta)\\ddot x + \\tilde\\eta(\\theta,\\dot x) - \\big(M\\ddot x + B\\dot x + Kx\\big)\\Big)`}/>
                        </div>
                        Measuring <InlineMath math='\ddot x'/> is noisy, so often <InlineMath math='M'/> is simply
                        left as the robot's own (uncancelled) inertia. Renders <em>soft</em> environments well;
                        rendering a stiff wall demands huge force gains from small motions.</li>
                    <li><strong>Admittance-controlled</strong>: sense the force <InlineMath math='f_{\mathrm{ext}}'/>{" "}
                        with a wrist sensor, command the motion that the virtual dynamics would perform:{" "}
                        <InlineMath math='\ddot x_d = M^{-1}(f_{\mathrm{ext}} - B\dot x - Kx)'/>, then track it with
                        inverse dynamics ({" "}
                        <InlineMath math='\ddot\theta_d = J^\dagger(\ddot x_d - \dot J\dot\theta)'/>). Renders{" "}
                        <em>stiff</em> environments well (especially with high gearing); a low virtual mass is the
                        hard case, since small forces demand large accelerations.</li>
                </ul>}
                ko={<ul className="list-disc pl-6 space-y-1">
                    <li><strong>Impedance 제어형</strong>: 움직임(<InlineMath math='x, \dot x, \ddot x'/>)을 재고,
                        힘을 명령한다. 제어 법칙은 로봇 자신의 dynamics를 지우고 그 자리에 가상 dynamics를 심는다:
                        <div className="overflow-x-auto">
                            <BlockMath math={`\\tau = J^{\\mathrm T}(\\theta)\\Big(\\tilde\\Lambda(\\theta)\\ddot x + \\tilde\\eta(\\theta,\\dot x) - \\big(M\\ddot x + B\\dot x + Kx\\big)\\Big)`}/>
                        </div>
                        <InlineMath math='\ddot x'/> 측정에는 잡음이 많아서, <InlineMath math='M'/>은 지우지 않고
                        로봇 자신의 관성을 그대로 두는 경우가 많다. <em>부드러운</em> 환경을 흉내 내는 데는 강하지만,
                        뻣뻣한 벽을 흉내 내려면 아주 작은 움직임에서 아주 큰 힘을 만들어야 해서 어렵다.</li>
                    <li><strong>Admittance 제어형</strong>: 손목 센서로 힘{" "}
                        <InlineMath math='f_{\mathrm{ext}}'/>을 재고, 가상 dynamics라면 보였을 움직임을 명령한다:{" "}
                        <InlineMath math='\ddot x_d = M^{-1}(f_{\mathrm{ext}} - B\dot x - Kx)'/>. 이 가속도는
                        inverse dynamics로 추종한다 (<InlineMath math='\ddot\theta_d = J^\dagger(\ddot x_d - \dot J\dot\theta)'/>).
                        기어비가 높은 로봇에서 <em>뻣뻣한</em> 환경을 흉내 내는 데 강하다. 반대로 가벼운 가상 질량이
                        어려운 경우인데, 작은 힘에도 큰 가속도를 내야 하기 때문이다.</li>
                </ul>}
            />
            <ImpedanceSandbox/>

            <T en={<h2>Low-Level Torque Control and Other Topics</h2>} ko={<h2>저수준 토크 제어와 기타 주제</h2>}/>
            <T
                en={<p>
                    All of the above assumed each joint delivers its commanded torque. Real electric-motor joints
                    approximate that ideal in one of four ways, each a trade:
                </p>}
                ko={<p>
                    지금까지는 각 관절이 명령받은 토크를 정확히 낸다고 가정했다. 실제 전기 모터 관절은 이 이상을 네
                    가지 방식 중 하나로 근사하는데, 각각 얻는 것과 잃는 것이 있다:
                </p>}
            />
            <T
                en={<ul className="list-disc pl-6 space-y-1">
                    <li><strong>Current control, direct drive</strong>: torque is proportional to current,{" "}
                        <InlineMath math='\tau = k_t I'/>, regulated by a local current loop running an order of
                        magnitude faster than the torque loop (10 kHz vs 1 kHz). Clean torque, but an ungeared motor
                        big enough for the job is often too heavy to carry at a joint.</li>
                    <li><strong>Current control through a gearhead</strong> (<InlineMath math='G > 1'/>): a smaller,
                        faster, more efficient motor delivers <InlineMath math='G k_t I'/>, at the cost of backlash
                        (harmonic drives nearly eliminate it) and friction that makes the delivered torque
                        uncertain.</li>
                    <li><strong>Adding strain-gauge feedback</strong>: sensing the torque actually delivered at the
                        gearhead output and closing a local loop on it compensates the friction, at the cost of
                        complexity and the torsional compliance of the harmonic gearing.</li>
                    <li><strong>Series elastic actuator (SEA)</strong>: deliberately insert a torsional spring
                        between gearhead and output, measure its deflection <InlineMath math='\Delta\phi'/> with
                        encoders, and control current so that <InlineMath math='\tau = k\,\Delta\phi'/> hits the
                        request. Torque sensing becomes a <em>position</em> measurement, the joint turns naturally
                        soft (good for human contact, and it shields the gears from shocks), but the soft spring
                        limits high-frequency motion control. NASA's Robonaut 2, the first humanoid in space, is
                        built around SEAs with hard stops at about 0.07 rad of spring deflection.</li>
                </ul>}
                ko={<ul className="list-disc pl-6 space-y-1">
                    <li><strong>Direct drive + 전류 제어</strong>: 토크가 전류에 비례하므로 (
                        <InlineMath math='\tau = k_t I'/>), 토크 루프보다 열 배쯤 빠른 로컬 전류 루프(10 kHz vs
                        1 kHz)가 전류를 조절한다. 토크는 깨끗하게 나오지만, 기어 없이 충분한 토크를 내는 모터는
                        대개 너무 커서 관절에 싣고 다닐 수 없다.</li>
                    <li><strong>기어헤드 + 전류 제어</strong> (<InlineMath math='G > 1'/>): 더 작고 빠르고 효율 좋은
                        모터로 <InlineMath math='G k_t I'/>를 낼 수 있다. 대신 backlash가 생기고(harmonic drive를
                        쓰면 거의 없앨 수 있다), 기어 마찰 때문에 실제로 전달되는 토크가 불확실해진다.</li>
                    <li><strong>Strain gauge 피드백 추가</strong>: 기어헤드 출력단에서 실제 전달 토크를 재고 그 값으로
                        로컬 루프를 닫으면 마찰의 불확실성이 보상된다. 대가는 구조 복잡도, 그리고 harmonic 기어
                        특유의 비틀림 유연성이다.</li>
                    <li><strong>Series elastic actuator (SEA)</strong>: 기어헤드와 출력 사이에 일부러 부드러운 비틀림
                        스프링을 넣고, 스프링이 비틀린 각 <InlineMath math='\Delta\phi'/>를 인코더로 잰다. 전달
                        토크가 <InlineMath math='\tau = k\,\Delta\phi'/>이므로, 토크 측정이 <em>위치</em> 측정
                        문제로 바뀐다. 관절이 태생적으로 부드러워져 사람과의 접촉에 안전하고 기어도 충격에서
                        보호되지만, 부드러운 스프링 때문에 빠른 motion 제어는 어려워진다. 우주에 간 첫 휴머노이드인
                        NASA의 Robonaut 2가 SEA 기반이고, 스프링이 약 0.07 rad 비틀리면 하드 스탑에 닿도록 설계되어
                        있다.</li>
                </ul>}
            />
            <T
                en={<p>
                    Beyond this chapter: <strong>robust control</strong> guarantees performance under bounded
                    parameter uncertainty; <strong>adaptive control</strong> estimates the parameters online;{" "}
                    <strong>iterative learning control</strong> improves a single repeated trajectory by feeding last
                    run's error into next run's feedforward; <strong>flexible manipulators</strong> add vibration
                    modes and a mismatch between motor angle and link endpoint; and{" "}
                    <strong>variable-impedance actuators</strong> set the joint's <em>passive</em> stiffness
                    mechanically (one motor for torque, one for stiffness), escaping the bandwidth limits of
                    rendering impedance in software.
                </p>}
                ko={<p>
                    이 챕터 너머의 주제들도 짧게 짚어 두자. <strong>Robust control</strong>은 파라미터 불확실성이
                    정해진 범위 안에 있을 때 성능을 보장하는 제어기를 설계하고, <strong>adaptive control</strong>은
                    실행 중에 파라미터를 추정해 제어 법칙에 반영한다. <strong>Iterative learning control</strong>은
                    같은 궤적을 반복하는 작업에서 지난 실행의 오차를 다음 실행의 feedforward에 반영해 점점 나아지게
                    만든다. <strong>유연 매니퓰레이터</strong>는 진동 모드가 생기고 모터 각도와 링크 끝 위치가
                    어긋나는 어려운 제어 문제를 낳는다. <strong>Variable-impedance actuator</strong>는 관절의{" "}
                    <em>수동</em> 강성 자체를 기계적으로 바꾼다(토크용 모터 하나, 강성용 모터 하나). 소프트웨어로
                    impedance를 흉내 낼 때 부딪히는 대역폭 한계를 하드웨어로 피해 가는 것이다.
                </p>}
            />
        </>
    );
};

export default Chapter11;
