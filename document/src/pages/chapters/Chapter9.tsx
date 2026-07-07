import {BlockMath, InlineMath} from "../../components/math/Tex";
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
                    <strong>singularity</strong>, where the required joint velocities blow up. Whichever path is chosen,
                    the remaining freedom is the time scaling below.
                </p>}
                ko={<p>
                    이 경로는 볼록(convex)이라 상자 모양의 관절 한계를 자동으로 지킨다: 모든 중간 configuration이 두
                    합법적 configuration의 가중 평균이기 때문이다. <em>task</em> 공간의 직선이 지정하기에는 더
                    자연스러운 경우가 많지만, 도달 가능한 작업 공간을 벗어나거나 관절 속도가 폭발하는{" "}
                    <strong>Singularity</strong> 근처를 지날 수 있다. 어떤 경로를 택하든, 남은 자유는 아래의 Time Scaling이다.
                </p>}
            />
            <TimeScalingProfiles/>

            <T en={<h2>Polynomial Time Scaling</h2>} ko={<h2>다항식 Time Scaling</h2>}/>
            <T
                en={<p>
                    A point-to-point motion must start and end at rest, so <InlineMath math='s(0)=0'/>,{" "}
                    <InlineMath math='s(T)=1'/>, and <InlineMath math='\dot s(0)=\dot s(T)=0'/>. Four conditions fix a{" "}
                    <strong>cubic</strong> (third-order) time scaling <InlineMath math='s(t) = a_0 + a_1 t + a_2 t^2 + a_3 t^3'/>,
                    which works out to
                </p>}
                ko={<p>
                    점대점(point-to-point) 운동은 정지 상태에서 시작해 정지 상태로 끝나야 하므로{" "}
                    <InlineMath math='s(0)=0'/>, <InlineMath math='s(T)=1'/>, 그리고{" "}
                    <InlineMath math='\dot s(0)=\dot s(T)=0'/> 이다. 네 개의 조건이 <strong>3차</strong>(third-order)
                    Time Scaling <InlineMath math='s(t) = a_0 + a_1 t + a_2 t^2 + a_3 t^3'/> 을 정하며, 그 결과는
                    다음과 같다
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
                    <InlineMath math='\tfrac{10}{\sqrt 3\,T^2}'/> — the arm must move a little faster in the middle to make
                    up for its gentler starts and stops. Selecting <em>quintic</em> in the figure above overlays the cubic
                    as a faint dashed reference so the difference in the <InlineMath math='\ddot s'/> plot is visible.
                </p>}
                ko={<p>
                    이 스케일링의 가속도는 정지 상태로 부드럽게 들고 나며 저크 스파이크를 없앤다. 그 대가는 더 높은
                    최대 속도 <InlineMath math='\dot s_\text{max} = \tfrac{15}{8T}'/> 와 최대 가속도{" "}
                    <InlineMath math='\tfrac{10}{\sqrt 3\,T^2}'/> 이다 — 더 완만한 출발과 정지를 보상하려면 팔이
                    가운데서 조금 더 빨리 움직여야 한다. 위 그림에서 <em>quintic</em> 을 선택하면 cubic 이 흐린 점선
                    참조로 겹쳐져 <InlineMath math='\ddot s'/> 그래프의 차이를 볼 수 있다.
                </p>}
            />

            <T en={<h2>Trapezoidal and S-Curve Profiles</h2>} ko={<h2>Trapezoidal·S-Curve 프로파일</h2>}/>
            <T
                en={<p>
                    When the goal is the <em>fastest</em> straight-line motion under velocity and acceleration limits, the
                    polynomial scalings are wasteful — they touch their peak speed only for an instant. The{" "}
                    <strong>trapezoidal velocity profile</strong> instead accelerates at a constant{" "}
                    <InlineMath math='a'/>, <strong>coasts</strong> at a constant <InlineMath math='v'/>, then
                    decelerates at <InlineMath math='-a'/>. Its <InlineMath math='\dot s'/> is a trapezoid and its{" "}
                    <InlineMath math='s'/> is a parabola, then a line, then a parabola:
                </p>}
                ko={<p>
                    속도와 가속도 한계 아래에서 <em>가장 빠른</em> 직선 운동이 목표라면, 다항식 스케일링은 낭비다 —
                    최대 속도에 순간적으로만 닿기 때문이다. 대신 <strong>Trapezoidal 속도 프로파일</strong>은 일정한{" "}
                    <InlineMath math='a'/> 로 가속하고, 일정한 <InlineMath math='v'/> 로 <strong>정속 주행(coast)</strong>한
                    뒤, <InlineMath math='-a'/> 로 감속한다. 그 <InlineMath math='\dot s'/> 는 사다리꼴이고{" "}
                    <InlineMath math='s'/> 는 포물선-직선-포물선이다:
                </p>}
            />
            <BlockMath math={`\\dot s(t) = \\begin{cases} a\\,t, & 0 \\le t \\le v/a \\\\[2pt] v, & v/a < t \\le T - v/a \\\\[2pt] a\\,(T - t), & T - v/a < t \\le T \\end{cases}`}/>
            <T
                en={<p>
                    With <InlineMath math='v'/> and <InlineMath math='a'/> set to the largest values the joints allow,
                    this is the time-optimal straight-line motion. The coast phase exists only while{" "}
                    <InlineMath math='v^2/a \le 1'/>; if <InlineMath math='v^2/a > 1'/> the trapezoid loses its flat top
                    and degenerates into a triangular <strong>bang-bang</strong> profile that accelerates for the first
                    half and decelerates for the second. Either way the acceleration is <strong>discontinuous</strong> at
                    the switching instants — finite, but with infinite jerk at each corner. Slide <InlineMath math='v'/>{" "}
                    in the trapezoidal figure to watch the coast phase widen, then collapse.
                </p>}
                ko={<p>
                    <InlineMath math='v'/> 와 <InlineMath math='a'/> 를 관절이 허용하는 최대값으로 두면, 이것이 시간 최적
                    직선 운동이다. 정속 구간은 <InlineMath math='v^2/a \le 1'/> 일 때만 존재한다;{" "}
                    <InlineMath math='v^2/a > 1'/> 이면 사다리꼴은 평평한 윗변을 잃고, 전반부에는 가속하고 후반부에는
                    감속하는 삼각형 <strong>bang-bang</strong> 프로파일로 퇴화한다. 어느 쪽이든 가속도는 전환 순간에{" "}
                    <strong>불연속</strong>이다 — 유한하지만 각 모서리에서 저크가 무한하다. 사다리꼴 그림에서{" "}
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
                    a sequence of <strong>via points</strong> at specified times — for example to clear obstacles or touch
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
                    <strong>통과</strong>하기만 하면 된다 — 예를 들어 장애물을 피하거나 여러 공작물을 차례로 건드리는
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
                    both position and velocity at every via point, though <em>not</em> in acceleration — fifth-order
                    segments would fix that at the cost of more coefficients. The interior via{" "}
                    <strong>velocities</strong> are free parameters that shape the curve: reasonable choices round the
                    corners smoothly, while setting the velocities to zero at just two endpoints reduces the whole thing
                    to the straight-line cubic time scaling of the first section. Drag the sliders below to steer the two
                    interior via velocities and watch the path bend to follow them.
                </p>}
                ko={<p>
                    각 구간의 끝점 위치와 속도를 맞추면, 조립된 Trajectory가 모든 Via Point에서 위치와 속도 모두 연속이 된다 —
                    다만 가속도는 <em>연속이 아니다</em>. 5차 구간이라면 계수가 더 늘어나는 대가로 이를 해결한다. 내부
                    Via Point의 <strong>속도</strong>는 곡선을 빚는 자유 매개변수다: 적절히 고르면 모서리가 부드럽게
                    둥글어지고, 양 끝점 두 곳에서만 속도를 0 으로 두면 전체가 앞 절의 직선 3차 Time Scaling으로
                    줄어든다. 아래 슬라이더를 끌어 두 내부 Via Point 속도를 조종하고, 경로가 그에 따라 휘는 것을 지켜보라.
                </p>}
            />
            <ViaPointTrajectory/>
        </>
    )
}

export default Chapter9
