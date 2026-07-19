import {BlockMath, InlineMath} from "../../components/math/Tex";
import ScrewVsDecoupled3D from "../../components/pages/chapter9/ScrewVsDecoupled3D";
import TimeOptimalPhasePlane from "../../components/pages/chapter9/TimeOptimalPhasePlane";
import TimeScalingProfiles from "../../components/pages/chapter9/TimeScalingProfiles";
import ViaPointTrajectory from "../../components/pages/chapter9/ViaPointTrajectory";
import {T} from "../../libs/i18n";

const Chapter9 = () => {
    return (
        <>
            <T en={<h2>Paths and Time Scaling</h2>} ko={<h2>경로와 Time Scaling</h2>}/>
            <T
                en={<p>
                    A <strong>trajectory</strong> specifies not just the shape a robot traces but{" "}
                    <em>when</em> it reaches each configuration. It is cleanest to split those two questions.
                    A <strong>path</strong> <InlineMath math='\theta(s)'/> is a purely geometric curve through the
                    joint space, parameterized by a scalar <InlineMath math='s \in [0, 1]'/> that runs from the start{" "}
                    <InlineMath math='(s=0)'/> to the goal <InlineMath math='(s=1)'/>. A <strong>time scaling</strong>{" "}
                    <InlineMath math='s(t)'/>, <InlineMath math='t \in [0, T]'/>, then says how fast the parameter is
                    swept, turning the static path into a motion <InlineMath math='\theta(s(t))'/>.
                </p>}
                ko={<p>
                    <strong>Trajectory</strong>는 로봇이 그리는 모양뿐 아니라 각 configuration에 <em>언제</em> 도달하는지까지
                    지정한다. 이 두 질문을 나누어 보는 것이 가장 깔끔하다. <strong>경로</strong>{" "}
                    <InlineMath math='\theta(s)'/> 는 관절 공간을 지나는 순수한 기하 곡선으로, 시작점{" "}
                    <InlineMath math='(s=0)'/> 에서 목표점 <InlineMath math='(s=1)'/> 까지 가는 스칼라{" "}
                    <InlineMath math='s \in [0, 1]'/> 로 매개변수화된다. 이어서 <strong>Time Scaling</strong>{" "}
                    <InlineMath math='s(t)'/>, <InlineMath math='t \in [0, T]'/> 가 매개변수를 얼마나 빨리 훑는지
                    정해, 정적인 경로를 운동 <InlineMath math='\theta(s(t))'/> 로 바꾼다.
                </p>}
            />
            <T
                en={<p>
                    Differentiating by the chain rule ties the two together. The joint velocities and accelerations are
                </p>}
                ko={<p>
                    연쇄 법칙으로 미분하면 이 둘이 하나로 엮인다. 관절 속도와 가속도는 다음과 같다
                </p>}
            />
            <BlockMath math={`\\dot\\theta = \\frac{d\\theta}{ds}\\,\\dot s, \\qquad \\ddot\\theta = \\frac{d\\theta}{ds}\\,\\ddot s + \\frac{d^2\\theta}{ds^2}\\,\\dot s^{\\,2}`}/>
            <T
                en={<p>
                    so both the path <InlineMath math='\theta(s)'/> and the time scaling <InlineMath math='s(t)'/> must be
                    twice differentiable for the motion to have a well-defined acceleration. The simplest path is the{" "}
                    <strong>straight line in joint space</strong>,
                </p>}
                ko={<p>
                    따라서 운동이 잘 정의된 가속도를 가지려면 경로 <InlineMath math='\theta(s)'/> 와 Time Scaling{" "}
                    <InlineMath math='s(t)'/> 가 모두 두 번 미분 가능해야 한다. 가장 단순한 경로는{" "}
                    <strong>관절 공간의 직선</strong>이다,
                </p>}
            />
            <BlockMath math={`\\theta(s) = \\theta_\\text{start} + s\\,(\\theta_\\text{end} - \\theta_\\text{start})`}/>
            <T
                en={<p>
                    which is convex and therefore automatically respects box-shaped joint limits: every intermediate
                    configuration is a weighted average of two legal ones. A straight line in <em>task</em> space is
                    often more natural to specify, but it can leave the reachable workspace or pass near a{" "}
                    <strong>singularity</strong>, where the required joint velocities blow up.
                </p>}
                ko={<p>
                    이 경로는 볼록(convex)이라 상자 모양의 관절 한계를 자동으로 지킨다: 모든 중간 configuration이 두
                    합법적 configuration의 가중 평균이기 때문이다. <em>task</em> 공간의 직선이 지정하기에는 더
                    자연스러운 경우가 많지만, 도달 가능한 작업 공간을 벗어나거나 관절 속도가 폭발하는{" "}
                    <strong>singularity</strong> 근처를 지날 수 있다.
                </p>}
            />
            <T
                en={<p>
                    And if the endpoints are full poses <InlineMath math='X = (R, p) \in SE(3)'/>, what is a "straight
                    line" at all? The naive blend <InlineMath math='X_{\mathrm{start}} + s(X_{\mathrm{end}} - X_{\mathrm{start}})'/>{" "}
                    leaves <InlineMath math='SE(3)'/>: an average of two rotation matrices is not a rotation matrix.
                    Two honest answers exist, built in three steps from Chapter 3's tools:
                </p>}
                ko={<p>
                    끝점이 완전한 자세 <InlineMath math='X = (R, p) \in SE(3)'/>라면 애초에 "직선"이 무엇일까? 순진한
                    혼합 <InlineMath math='X_{\mathrm{start}} + s(X_{\mathrm{end}} - X_{\mathrm{start}})'/>은{" "}
                    <InlineMath math='SE(3)'/>을 벗어난다. 회전행렬 두 개의 평균은 회전행렬이 아니다. 정직한 답이 둘
                    있고, 3장의 도구로 세 단계면 만든다:
                </p>}
            />
            <ol className="list-decimal pl-6 space-y-1">
                <li>
                    <T
                        en={<span>Express the displacement from start to end in the start frame with the subscript
                            cancellation rule:</span>}
                        ko={<span>시작에서 끝까지의 변위를 아래첨자 소거 규칙으로 시작 frame에서 표현한다:</span>}
                    />
                    <BlockMath math={`X_{\\mathrm{start,end}} = X_{\\mathrm{start},s}X_{s,\\mathrm{end}} = X_{\\mathrm{start}}^{-1}X_{\\mathrm{end}}`}/>
                </li>
                <li>
                    <T
                        en={<span>The matrix log turns that displacement into a single twist (a screw axis and how far
                            to travel along it), and the exponential replays a fraction <InlineMath math='s'/> of
                            it:</span>}
                        ko={<span>행렬 log가 그 변위를 twist 하나(screw 축과 그 축을 따라 갈 양)로 바꾸고, exponential이
                            그중 비율 <InlineMath math='s'/>만큼을 재생한다:</span>}
                    />
                    <BlockMath math={`X(s) = X_{\\mathrm{start}}\\exp\\big(\\log(X_{\\mathrm{start}}^{-1}X_{\\mathrm{end}})\\,s\\big)`}/>
                    <T
                        en={<span>This <strong>screw path</strong> rotates about and translates along one fixed screw
                            axis, so the origin generally traces a curve, not a Cartesian line.</span>}
                        ko={<span>이 <strong>screw path</strong>는 고정 screw 축 하나를 돌면서 그 축을 따라 나아가므로,
                            원점은 일반적으로 직선이 아닌 곡선을 그린다.</span>}
                    />
                </li>
                <li>
                    <T
                        en={<span>If a straight Cartesian tip motion matters, <strong>decouple</strong> translation from
                            rotation: run the origin on a line and the rotation on its own constant-axis geodesic:</span>}
                        ko={<span>팁이 정말 직선으로 가야 한다면 이동과 회전을 <strong>decouple</strong>한다. 원점은
                            직선으로, 회전은 따로 일정 축 geodesic으로 돌린다:</span>}
                    />
                    <div className="overflow-x-auto">
                        <BlockMath math={`p(s) = p_{\\mathrm{start}} + s(p_{\\mathrm{end}} - p_{\\mathrm{start}}), \\qquad
R(s) = R_{\\mathrm{start}}\\exp\\big(\\log(R_{\\mathrm{start}}^{\\mathsf T}R_{\\mathrm{end}})\\,s\\big)`}/>
                    </div>
                </li>
            </ol>
            <T
                en={<p>
                    The figure below runs both paths between the same two poses. Watch the origins: the screw path
                    swings through a curve while the decoupled origin goes straight, yet both frames arrive with the
                    same final orientation.
                </p>}
                ko={<p>
                    아래 그림이 같은 두 자세 사이에서 두 경로를 동시에 재생한다. 원점을 보라. screw path는 곡선을
                    그리며 도는데 decoupled 원점은 곧장 간다. 그런데도 두 frame은 같은 최종 자세로 도착한다.
                </p>}
            />
            <ScrewVsDecoupled3D/>
            <T
                en={<p>
                    Whichever path is chosen, the remaining freedom is the time scaling below.
                </p>}
                ko={<p>
                    어떤 경로를 택하든, 남은 자유는 아래의 time scaling이다.
                </p>}
            />
            <TimeScalingProfiles/>

            <T en={<h2>Polynomial Time Scaling</h2>} ko={<h2>다항식 Time Scaling</h2>}/>
            <T
                en={<p>
                    A point-to-point motion must start and end at rest. That is four conditions, so a{" "}
                    <strong>cubic</strong> (third-order) polynomial{" "}
                    <InlineMath math='s(t) = a_0 + a_1 t + a_2 t^2 + a_3 t^3'/> has exactly enough coefficients. Three
                    short steps pin them down:
                </p>}
                ko={<p>
                    점대점(point-to-point) 운동은 정지 상태에서 시작해 정지 상태로 끝나야 한다. 조건이 네 개이므로{" "}
                    <strong>3차</strong>(third-order) 다항식{" "}
                    <InlineMath math='s(t) = a_0 + a_1 t + a_2 t^2 + a_3 t^3'/>의 계수 수와 정확히 맞는다. 세 단계로
                    계수를 못 박는다:
                </p>}
            />
            <ol className="list-decimal pl-6 space-y-1">
                <li>
                    <T
                        en={<span>State the rest-to-rest boundary conditions:</span>}
                        ko={<span>정지-정지 경계 조건을 적는다:</span>}
                    />
                    <BlockMath math={`s(0) = 0, \\quad \\dot s(0) = 0, \\quad s(T) = 1, \\quad \\dot s(T) = 0`}/>
                </li>
                <li>
                    <T
                        en={<span>Evaluate <InlineMath math='s'/> and{" "}
                            <InlineMath math='\dot s(t) = a_1 + 2a_2t + 3a_3t^2'/> at <InlineMath math='t = 0'/>: the
                            first two conditions give <InlineMath math='a_0 = a_1 = 0'/> immediately.</span>}
                        ko={<span><InlineMath math='s'/>와{" "}
                            <InlineMath math='\dot s(t) = a_1 + 2a_2t + 3a_3t^2'/>를 <InlineMath math='t = 0'/>에서
                            평가한다. 앞의 두 조건이 곧바로 <InlineMath math='a_0 = a_1 = 0'/>을 준다.</span>}
                    />
                </li>
                <li>
                    <T
                        en={<span>The two conditions at <InlineMath math='t = T'/> become a 2&times;2 linear system in{" "}
                            <InlineMath math='a_2, a_3'/>:</span>}
                        ko={<span><InlineMath math='t = T'/>에서의 두 조건이 <InlineMath math='a_2, a_3'/>에 대한
                            2&times;2 선형계가 된다:</span>}
                    />
                    <BlockMath math={`a_2T^2 + a_3T^3 = 1, \\quad 2a_2T + 3a_3T^2 = 0
\\;\\;\\Longrightarrow\\;\\; a_2 = \\frac{3}{T^2}, \\quad a_3 = -\\frac{2}{T^3}`}/>
                </li>
            </ol>
            <T
                en={<p>
                    So the cubic time scaling and its derivatives are
                </p>}
                ko={<p>
                    따라서 3차 time scaling과 그 도함수는
                </p>}
            />
            <BlockMath math={`s(t) = 3\\Big(\\tfrac{t}{T}\\Big)^2 - 2\\Big(\\tfrac{t}{T}\\Big)^3, \\qquad \\dot s(t) = \\frac{6t}{T^2} - \\frac{6t^2}{T^3}, \\qquad \\ddot s(t) = \\frac{6}{T^2} - \\frac{12t}{T^3}`}/>
            <T
                en={<p>
                    The speed peaks at the midpoint with <InlineMath math='\dot s_\text{max} = \tfrac{3}{2T}'/>, so the
                    motion is fast in the middle and slow at the ends. But the acceleration <InlineMath math='\ddot s'/>{" "}
                    is <strong>nonzero at the endpoints</strong> and jumps discontinuously from zero to{" "}
                    <InlineMath math='6/T^2'/> at <InlineMath math='t=0'/> (and back at <InlineMath math='t=T'/>). That
                    step in acceleration is an <strong>infinite jerk</strong> (jerk is <InlineMath math='da/dt'/>), which
                    excites structural vibration in the arm.
                </p>}
                ko={<p>
                    속도는 중간 지점에서 <InlineMath math='\dot s_\text{max} = \tfrac{3}{2T}'/> 로 최대가 되므로, 운동은
                    가운데서 빠르고 양 끝에서 느리다. 그러나 가속도 <InlineMath math='\ddot s'/> 는{" "}
                    <strong>끝점에서 0 이 아니며</strong>, <InlineMath math='t=0'/> 에서 0 에서{" "}
                    <InlineMath math='6/T^2'/> 로 불연속적으로 튄다(<InlineMath math='t=T'/> 에서 다시 돌아온다). 이
                    가속도의 계단은 <strong>무한 저크</strong>(저크는 <InlineMath math='da/dt'/>)이며, 팔에 구조적
                    진동을 일으킨다.
                </p>}
            />
            <T
                en={<p>
                    Adding <InlineMath math='\ddot s(0) = \ddot s(T) = 0'/> gives six conditions and a{" "}
                    <strong>quintic</strong> (fifth-order) time scaling,
                </p>}
                ko={<p>
                    <InlineMath math='\ddot s(0) = \ddot s(T) = 0'/> 을 추가하면 여섯 개의 조건이 되어{" "}
                    <strong>5차</strong>(fifth-order) Time Scaling이 나온다,
                </p>}
            />
            <BlockMath math={`s(t) = 10\\Big(\\tfrac{t}{T}\\Big)^3 - 15\\Big(\\tfrac{t}{T}\\Big)^4 + 6\\Big(\\tfrac{t}{T}\\Big)^5`}/>
            <T
                en={<p>
                    whose acceleration eases in and out of rest smoothly, removing the jerk spikes. The price is a higher
                    peak speed <InlineMath math='\dot s_\text{max} = \tfrac{15}{8T}'/> and peak acceleration{" "}
                    <InlineMath math='\tfrac{10}{\sqrt 3\,T^2}'/>: the arm must move a little faster in the middle to make
                    up for its gentler starts and stops. Selecting <em>quintic</em> in the figure above overlays the cubic
                    as a faint dashed reference so the difference in the <InlineMath math='\ddot s'/> plot is visible.
                </p>}
                ko={<p>
                    이 스케일링의 가속도는 정지 상태로 부드럽게 들고 나며 저크 스파이크를 없앤다. 그 대가는 더 높은
                    최대 속도 <InlineMath math='\dot s_\text{max} = \tfrac{15}{8T}'/> 와 최대 가속도{" "}
                    <InlineMath math='\tfrac{10}{\sqrt 3\,T^2}'/> 이다. 더 완만한 출발과 정지를 보상하려면 팔이
                    가운데서 조금 더 빨리 움직여야 한다. 위 그림에서 <em>quintic</em> 을 선택하면 cubic 이 흐린 점선
                    참조로 겹쳐져 <InlineMath math='\ddot s'/> 그래프의 차이를 볼 수 있다.
                </p>}
            />

            <T en={<h2>Trapezoidal and S-Curve Profiles</h2>} ko={<h2>Trapezoidal·S-Curve 프로파일</h2>}/>
            <T
                en={<p>
                    When the goal is the <em>fastest</em> straight-line motion under velocity and acceleration limits,
                    the polynomial scalings are wasteful: they touch their peak speed only for an instant. The{" "}
                    <strong>trapezoidal velocity profile</strong> instead accelerates at a constant{" "}
                    <InlineMath math='a'/> for a time <InlineMath math='t_a = v/a'/>, <strong>coasts</strong> at a
                    constant <InlineMath math='v'/>, then decelerates at <InlineMath math='-a'/>. Its{" "}
                    <InlineMath math='\dot s'/> is a trapezoid, and integrating each phase makes{" "}
                    <InlineMath math='s'/> a parabola, then a line, then a parabola:
                </p>}
                ko={<p>
                    속도와 가속도 한계 아래에서 <em>가장 빠른</em> 직선 운동이 목표라면, 다항식 스케일링은 낭비다.
                    최대 속도에 순간적으로만 닿기 때문이다. 대신 <strong>trapezoidal 속도 프로파일</strong>은 시간{" "}
                    <InlineMath math='t_a = v/a'/> 동안 일정한 <InlineMath math='a'/> 로 가속하고, 일정한{" "}
                    <InlineMath math='v'/> 로 <strong>정속 주행(coast)</strong>한 뒤, <InlineMath math='-a'/> 로
                    감속한다. 그 <InlineMath math='\dot s'/> 는 사다리꼴이고, 구간마다 적분하면{" "}
                    <InlineMath math='s'/> 는 포물선, 직선, 포물선이 된다:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math={`\\dot s(t) = \\begin{cases} a\\,t, & 0 \\le t \\le v/a \\\\[2pt] v, & v/a < t \\le T - v/a \\\\[2pt] a\\,(T - t), & T - v/a < t \\le T \\end{cases}
\\qquad
s(t) = \\begin{cases} \\tfrac12 a t^2 \\\\[2pt] vt - \\tfrac{v^2}{2a} \\\\[2pt] \\dfrac{2avT - 2v^2 - a^2(t-T)^2}{2a} \\end{cases}`}/>
            </div>
            <T
                en={<p>
                    The three parameters <InlineMath math='v, a, T'/> are tied together by{" "}
                    <InlineMath math='s(T) = 1'/>, so only two can be chosen freely. Each choice comes with a
                    feasibility condition and the third value follows from solving <InlineMath math='s(T) = 1'/>:
                </p>}
                ko={<p>
                    세 파라미터 <InlineMath math='v, a, T'/>는 <InlineMath math='s(T) = 1'/>로 묶여 있어 둘만 자유롭게
                    고를 수 있다. 각 선택에는 실현 가능 조건이 붙고, 나머지 하나는 <InlineMath math='s(T) = 1'/>을
                    풀면 나온다:
                </p>}
            />
            <T
                en={<ul className="list-disc pl-6 space-y-1">
                    <li>Pick <InlineMath math='v, a'/> (with <InlineMath math='v^2/a \le 1'/>):{" "}
                        <InlineMath math='T = \dfrac{a + v^2}{va}'/>. With <InlineMath math='v, a'/> at the joint
                        limits, this is the minimum possible motion time.</li>
                    <li>Pick <InlineMath math='v, T'/> (with <InlineMath math='1 < vT \le 2'/>):{" "}
                        <InlineMath math='a = \dfrac{v^2}{vT - 1}'/>.</li>
                    <li>Pick <InlineMath math='a, T'/> (with <InlineMath math='aT^2 \ge 4'/>):{" "}
                        <InlineMath math='v = \tfrac12\big(aT - \sqrt{a}\sqrt{aT^2 - 4}\big)'/>.</li>
                </ul>}
                ko={<ul className="list-disc pl-6 space-y-1">
                    <li><InlineMath math='v, a'/>를 고르면 (<InlineMath math='v^2/a \le 1'/> 조건):{" "}
                        <InlineMath math='T = \dfrac{a + v^2}{va}'/>. <InlineMath math='v, a'/>를 관절 한계값으로 두면
                        이것이 가능한 최소 운동 시간이다.</li>
                    <li><InlineMath math='v, T'/>를 고르면 (<InlineMath math='1 < vT \le 2'/> 조건):{" "}
                        <InlineMath math='a = \dfrac{v^2}{vT - 1}'/>.</li>
                    <li><InlineMath math='a, T'/>를 고르면 (<InlineMath math='aT^2 \ge 4'/> 조건):{" "}
                        <InlineMath math='v = \tfrac12\big(aT - \sqrt{a}\sqrt{aT^2 - 4}\big)'/>.</li>
                </ul>}
            />
            <T
                en={<p>
                    With <InlineMath math='v'/> and <InlineMath math='a'/> set to the largest values the joints allow,
                    this is the time-optimal straight-line motion. The coast phase exists only while{" "}
                    <InlineMath math='v^2/a \le 1'/>; if <InlineMath math='v^2/a > 1'/> the trapezoid loses its flat top
                    and degenerates into a triangular <strong>bang-bang</strong> profile that accelerates for the first
                    half and decelerates for the second. Either way the acceleration is <strong>discontinuous</strong> at
                    the switching instants: finite, but with infinite jerk at each corner. Slide <InlineMath math='v'/>{" "}
                    in the trapezoidal figure to watch the coast phase widen, then collapse.
                </p>}
                ko={<p>
                    <InlineMath math='v'/> 와 <InlineMath math='a'/> 를 관절이 허용하는 최대값으로 두면, 이것이 시간 최적
                    직선 운동이다. 정속 구간은 <InlineMath math='v^2/a \le 1'/> 일 때만 존재한다;{" "}
                    <InlineMath math='v^2/a > 1'/> 이면 사다리꼴은 평평한 윗변을 잃고, 전반부에는 가속하고 후반부에는
                    감속하는 삼각형 <strong>bang-bang</strong> 프로파일로 퇴화한다. 어느 쪽이든 가속도는 전환 순간에{" "}
                    <strong>불연속</strong>이다. 유한하지만 각 모서리에서 저크가 무한하다. 사다리꼴 그림에서{" "}
                    <InlineMath math='v'/> 를 움직여 정속 구간이 넓어졌다가 사라지는 것을 지켜보라.
                </p>}
            />
            <T
                en={<p>
                    The <strong>S-curve</strong> profile smooths those corners by inserting constant-<em>jerk</em> ramps,
                    so the acceleration itself rises and falls linearly instead of stepping. This splits the motion into
                    seven stages (jerk up, constant accel, jerk down, coast, and the mirror image while decelerating) and
                    is the standard choice in motor control precisely because the bounded jerk avoids exciting vibration.
                </p>}
                ko={<p>
                    <strong>S-Curve</strong> 프로파일은 일정 <em>저크</em> 램프를 끼워 이 모서리들을 매끄럽게 만들어,
                    가속도 자체가 계단이 아니라 선형으로 오르내리게 한다. 이는 운동을 일곱 단계(저크 상승, 등가속, 저크
                    하강, 정속, 그리고 감속하는 동안의 거울상)로 나누며, 유계 저크가 진동 유발을 피하기 때문에 모터
                    제어에서 표준 선택이 된다.
                </p>}
            />

            <T en={<h2>Via Point Trajectories</h2>} ko={<h2>Via Point Trajectory</h2>}/>
            <T
                en={<p>
                    Sometimes the robot need not follow a prescribed path shape but must simply <strong>pass through</strong>{" "}
                    a sequence of <strong>via points</strong> at specified times, for example to clear obstacles or touch
                    a series of workpieces. Given <InlineMath math='k'/> via points at times{" "}
                    <InlineMath math='T_1 = 0, \dots, T_k = T'/>, each with a position <InlineMath math='\beta_i'/> and a
                    velocity <InlineMath math='\dot\beta_i'/>, one interpolates each joint history directly with a{" "}
                    <strong>piecewise cubic</strong>. On segment <InlineMath math='j'/> of duration{" "}
                    <InlineMath math='\Delta T_j = T_{j+1} - T_j'/>, with local time{" "}
                    <InlineMath math='\Delta t \in [0, \Delta T_j]'/>,{" "}
                    <InlineMath math='\beta(T_j + \Delta t) = a_{j0} + a_{j1}\Delta t + a_{j2}\Delta t^2 + a_{j3}\Delta t^3'/>{" "}
                    where
                </p>}
                ko={<p>
                    때로는 로봇이 정해진 경로 모양을 따를 필요는 없고, 정해진 시각에 일련의 <strong>Via Point</strong>를 그저{" "}
                    <strong>통과</strong>하기만 하면 된다. 예를 들어 장애물을 피하거나 여러 공작물을 차례로 건드리는
                    경우다. 시각 <InlineMath math='T_1 = 0, \dots, T_k = T'/> 에 각각 위치 <InlineMath math='\beta_i'/> 와
                    속도 <InlineMath math='\dot\beta_i'/> 를 가진 <InlineMath math='k'/> 개의 Via Point가 주어지면, 각 관절
                    이력을 <strong>구간별 3차식</strong>으로 직접 보간한다. 지속 시간{" "}
                    <InlineMath math='\Delta T_j = T_{j+1} - T_j'/> 인 구간 <InlineMath math='j'/> 에서, 국소 시간{" "}
                    <InlineMath math='\Delta t \in [0, \Delta T_j]'/> 로{" "}
                    <InlineMath math='\beta(T_j + \Delta t) = a_{j0} + a_{j1}\Delta t + a_{j2}\Delta t^2 + a_{j3}\Delta t^3'/>{" "}
                    이며 여기서
                </p>}
            />
            <BlockMath math={`a_{j0} = \\beta_j, \\quad a_{j1} = \\dot\\beta_j, \\quad a_{j2} = \\frac{3\\beta_{j+1} - 3\\beta_j - 2\\dot\\beta_j\\Delta T_j - \\dot\\beta_{j+1}\\Delta T_j}{\\Delta T_j^{\\,2}}, \\quad a_{j3} = \\frac{2\\beta_j + (\\dot\\beta_j + \\dot\\beta_{j+1})\\Delta T_j - 2\\beta_{j+1}}{\\Delta T_j^{\\,3}}`}/>
            <T
                en={<p>
                    Matching each segment's endpoint position and velocity makes the assembled trajectory continuous in
                    both position and velocity at every via point, though <em>not</em> in acceleration (fifth-order
                    segments would fix that at the cost of more coefficients). The interior via{" "}
                    <strong>velocities</strong> are free parameters that shape the curve: reasonable choices round the
                    corners smoothly, while setting the velocities to zero at just two endpoints reduces the whole thing
                    to the straight-line cubic time scaling of the first section. Drag the sliders below to steer the two
                    interior via velocities and watch the path bend to follow them.
                </p>}
                ko={<p>
                    각 구간의 끝점 위치와 속도를 맞추면, 조립된 Trajectory가 모든 Via Point에서 위치와 속도 모두 연속이
                    된다. 다만 가속도는 <em>연속이 아니다</em> (5차 구간이라면 계수가 더 늘어나는 대가로 이를 해결한다). 내부
                    Via Point의 <strong>속도</strong>는 곡선을 빚는 자유 매개변수다: 적절히 고르면 모서리가 부드럽게
                    둥글어지고, 양 끝점 두 곳에서만 속도를 0 으로 두면 전체가 앞 절의 직선 3차 Time Scaling으로
                    줄어든다. 아래 슬라이더를 끌어 두 내부 Via Point 속도를 조종하고, 경로가 그에 따라 휘는 것을 지켜보라.
                </p>}
            />
            <ViaPointTrajectory/>

            <T en={<h2>Time-Optimal Time Scaling</h2>} ko={<h2>시간 최적 Time Scaling</h2>}/>
            <T
                en={<p>
                    Now suppose the <strong>path is fully fixed</strong>, say by an obstacle-avoiding planner, and the
                    only question left is: how fast can the robot traverse it without exceeding its{" "}
                    <strong>actuator limits</strong>{" "}
                    <InlineMath math='\tau_i^{\min}(\theta,\dot\theta) \le \tau_i \le \tau_i^{\max}(\theta,\dot\theta)'/>?
                    The trapezoid assumed constant limits, but real limits change along the path because the dynamics
                    do. Constraining the dynamics to the path takes two steps:
                </p>}
                ko={<p>
                    이제 <strong>경로가 완전히 고정</strong>되어 있다고 하자. 장애물 회피 planner가 내준 경로 같은
                    경우다. 남은 질문은 하나다. <strong>구동기 한계</strong>{" "}
                    <InlineMath math='\tau_i^{\min}(\theta,\dot\theta) \le \tau_i \le \tau_i^{\max}(\theta,\dot\theta)'/>를
                    넘지 않으면서 얼마나 빨리 이 경로를 지날 수 있는가? Trapezoid는 한계가 상수라고 가정했지만, 실제
                    한계는 동역학이 변하니 경로를 따라 함께 변한다. 동역학을 경로에 구속하는 데는 두 단계면 된다:
                </p>}
            />
            <ol className="list-decimal pl-6 space-y-1">
                <li>
                    <T
                        en={<span>Substitute the chain rule{" "}
                            <InlineMath math='\dot\theta = \theta^{\prime}\dot s'/>,{" "}
                            <InlineMath math='\ddot\theta = \theta^{\prime}\ddot s + \theta^{\prime\prime}\dot s^2'/>{" "}
                            (primes are <InlineMath math='d/ds'/>) into{" "}
                            <InlineMath math='M\ddot\theta + \dot\theta^{\mathsf T}\Gamma\dot\theta + g = \tau'/> and
                            group by <InlineMath math='\ddot s'/> and <InlineMath math='\dot s^2'/>:</span>}
                        ko={<span>연쇄 법칙{" "}
                            <InlineMath math='\dot\theta = \theta^{\prime}\dot s'/>,{" "}
                            <InlineMath math='\ddot\theta = \theta^{\prime}\ddot s + \theta^{\prime\prime}\dot s^2'/>{" "}
                            (prime은 <InlineMath math='d/ds'/>)을{" "}
                            <InlineMath math='M\ddot\theta + \dot\theta^{\mathsf T}\Gamma\dot\theta + g = \tau'/>에
                            대입하고 <InlineMath math='\ddot s'/>와 <InlineMath math='\dot s^2'/>로 묶는다:</span>}
                    />
                    <div className="overflow-x-auto">
                        <BlockMath math={`\\underbrace{M(\\theta(s))\\theta^{\\prime}}_{m(s)}\\,\\ddot s
+ \\underbrace{\\big(M\\theta^{\\prime\\prime} + \\theta^{\\prime\\mathsf T}\\Gamma\\theta^{\\prime}\\big)}_{c(s)}\\,\\dot s^2
+ \\underbrace{g(\\theta(s))}_{g(s)} = \\tau`}/>
                    </div>
                    <T
                        en={<span>The whole robot has collapsed to a one-dimensional system along the path:{" "}
                            <InlineMath math='m(s)'/> is its effective inertia there.</span>}
                        ko={<span>로봇 전체가 경로 위의 1차원 시스템으로 접혔다.{" "}
                            <InlineMath math='m(s)'/>가 그 위에서의 유효 관성이다.</span>}
                    />
                </li>
                <li>
                    <T
                        en={<span>Each actuator bound becomes a bound on <InlineMath math='\ddot s'/>. Solving component{" "}
                            <InlineMath math='i'/> for <InlineMath math='\ddot s'/> (flipping the inequality when{" "}
                            <InlineMath math='m_i(s) < 0'/>) and intersecting over all joints:</span>}
                        ko={<span>구동기 한계 하나하나가 <InlineMath math='\ddot s'/>의 한계가 된다. 성분{" "}
                            <InlineMath math='i'/>를 <InlineMath math='\ddot s'/>에 대해 풀고 ({" "}
                            <InlineMath math='m_i(s) < 0'/>이면 부등호가 뒤집힌다) 모든 관절에 대해 교집합을 취하면:</span>}
                    />
                    <BlockMath math={`L(s, \\dot s) \\le \\ddot s \\le U(s, \\dot s), \\qquad
L = \\max_i L_i, \\quad U = \\min_i U_i`}/>
                </li>
            </ol>
            <T
                en={<p>
                    Everything now lives in the <strong><InlineMath math='(s, \dot s)'/> phase plane</strong>: a time
                    scaling is a curve from <InlineMath math='(0,0)'/> to <InlineMath math='(1,0)'/> whose slope stays
                    inside the cone allowed by <InlineMath math='[L, U]'/> at every point. Where the cone squeezes shut
                    (<InlineMath math='L \ge U'/>) no torque can keep the robot on the path; the boundary of that
                    region is the <strong>velocity limit curve</strong>. Why should the curve hug maximum speed? Change
                    the integration variable in the total time:
                </p>}
                ko={<p>
                    이제 모든 것이 <strong><InlineMath math='(s, \dot s)'/> phase plane</strong> 위에 산다. Time
                    scaling은 <InlineMath math='(0,0)'/>에서 <InlineMath math='(1,0)'/>으로 가는 곡선이며, 그 기울기는
                    매 점에서 <InlineMath math='[L, U]'/>가 허용하는 원뿔 안에 있어야 한다. 원뿔이 짓눌려 닫히는 곳
                    (<InlineMath math='L \ge U'/>)에서는 어떤 토크로도 로봇을 경로에 붙들 수 없고, 그 영역의 경계가{" "}
                    <strong>velocity limit curve</strong>다. 왜 곡선이 최대 속도에 붙어야 할까? 총 시간의 적분 변수를
                    바꿔 보면:
                </p>}
            />
            <BlockMath math={`T = \\int_0^T 1\\,dt = \\int_0^T \\frac{ds}{ds}\\,dt = \\int_0^1 \\frac{dt}{ds}\\,ds = \\int_0^1 \\frac{1}{\\dot s(s)}\\,ds`}/>
            <T
                en={<p>
                    Minimizing <InlineMath math='T'/> means making <InlineMath math='\dot s'/> as large as possible at
                    every <InlineMath math='s'/>. So the optimal time scaling always rides one of the two limits, and
                    the only choice is <em>when to switch</em>. The simplest case is <strong>bang-bang</strong>:
                    integrate <InlineMath math='\ddot s = U'/> forward from <InlineMath math='(0,0)'/>, integrate{" "}
                    <InlineMath math='\ddot s = L'/> backward from <InlineMath math='(1,0)'/>, and switch where the two
                    curves meet. The figure below runs this on the Chapter 8 arm, constrained to a joint-space line,
                    with real torque limits:
                </p>}
                ko={<p>
                    <InlineMath math='T'/>를 최소화한다는 것은 모든 <InlineMath math='s'/>에서{" "}
                    <InlineMath math='\dot s'/>를 최대한 크게 만든다는 뜻이다. 그래서 최적 time scaling은 항상 두 한계
                    중 하나에 올라타고, 남은 선택은 <em>언제 갈아탈지</em>뿐이다. 가장 단순한 경우가{" "}
                    <strong>bang-bang</strong>이다. <InlineMath math='\ddot s = U'/>를 <InlineMath math='(0,0)'/>에서
                    앞으로 적분하고, <InlineMath math='\ddot s = L'/>을 <InlineMath math='(1,0)'/>에서 뒤로 적분해, 두
                    곡선이 만나는 곳에서 전환한다. 아래 그림이 8장의 팔을 관절 공간 직선에 구속하고 실제 토크 한계로
                    이것을 돌린다:
                </p>}
            />
            <TimeOptimalPhasePlane/>
            <T
                en={<p>
                    When the velocity limit curve dips low enough to block the single switch, the algorithm gains more
                    steps: find the point where the limit curve is <em>tangent</em> to a feasible motion direction
                    (searching by bisection over speeds), decelerate into it, accelerate out of it, and repeat. Three
                    caveats close the chapter. The algorithm assumes the robot can hold any posture on the path
                    statically; it assumes no <em>zero-inertia points</em> (<InlineMath math='m_i(s) = 0'/>), where an
                    actuator bound turns into a pure velocity bound; and since the result saturates at least one
                    actuator at all times and jumps in acceleration at each switch, real systems back off from it: it
                    leaves no torque margin for feedback and excites vibration. Its real value is revealing the true
                    speed limit of a robot on a path.
                </p>}
                ko={<p>
                    velocity limit curve가 깊이 내려앉아 한 번의 전환을 막으면 알고리즘에 단계가 늘어난다. 한계 곡선이
                    실현 가능한 운동 방향과 <em>접하는</em> 점을 (속도에 대한 이분 탐색으로) 찾아, 그 점으로 감속해
                    들어갔다가 다시 가속해 나오기를 반복한다. 세 가지 주의로 챕터를 닫는다. 이 알고리즘은 로봇이 경로
                    위의 어느 자세든 정적으로 버틸 수 있다고 가정하고, 구동기 한계가 순수 속도 한계로 바뀌는{" "}
                    <em>zero-inertia 점</em> (<InlineMath math='m_i(s) = 0'/>)이 없다고 가정하며, 결과가 항상 구동기
                    최소 하나를 포화시키고 전환마다 가속도가 튀기 때문에 실제 시스템은 여기서 한 발 물러선다. 피드백에
                    쓸 토크 여유가 없고 진동을 유발하기 때문이다. 진짜 가치는 경로 위 로봇의 진짜 속도 한계를 드러내
                    보인다는 데 있다.
                </p>}
            />
        </>
    )
}

export default Chapter9
