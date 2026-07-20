import {BlockMath, InlineMath} from "../../components/math/Tex";
import DriveControlSets from "../../components/pages/chapter13/DriveControlSets";
import DubinsPlanner from "../../components/pages/chapter13/DubinsPlanner";
import MecanumDrive from "../../components/pages/chapter13/MecanumDrive";
import MobileManipulation from "../../components/pages/chapter13/MobileManipulation";
import OdometryDrift from "../../components/pages/chapter13/OdometryDrift";
import ParallelParking from "../../components/pages/chapter13/ParallelParking";
import TrackingControl from "../../components/pages/chapter13/TrackingControl";
import {T} from "../../libs/i18n";

const Chapter13 = () => {
    return (
        <>
            <T en={<h2>Types of Wheeled Mobile Robots</h2>} ko={<h2>Wheeled Mobile Robot 의 종류</h2>}/>
            <T
                en={<p>
                    This chapter is about robots that roll. We ignore dynamics (wheel torques) and work purely with
                    kinematics (wheel speeds), assuming hard flat ground and no skidding. The chassis is one rigid
                    body with configuration <InlineMath math='q = (\phi, x, y)'/>, a frame {"{b}"} fixed to it, and
                    velocity written either as <InlineMath math='\dot q'/> or as the planar body twist{" "}
                    <InlineMath math='\mathcal{V}_b = (\omega_{bz}, v_{bx}, v_{by})'/>, related by a rotation of the
                    translational part:
                </p>}
                ko={<p>
                    이 챕터의 주인공은 바퀴로 구르는 로봇이다. dynamics(바퀴 토크)는 제쳐 두고 kinematics(바퀴
                    속도)만 다루며, 바닥은 단단하고 평평하고 바퀴는 skid 하지 않는다고 가정한다. 차체는 강체
                    하나로, configuration 은 <InlineMath math='q = (\phi, x, y)'/>, 차체 고정 좌표계는 {"{b}"} 다.
                    속도는 <InlineMath math='\dot q'/>로 쓰기도 하고 평면 body twist{" "}
                    <InlineMath math='\mathcal{V}_b = (\omega_{bz}, v_{bx}, v_{by})'/>로 쓰기도 하는데, 둘은 병진
                    성분의 회전만큼만 다르다:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math={`\\mathcal{V}_b = \\begin{bmatrix} \\omega_{bz} \\\\ v_{bx} \\\\ v_{by} \\end{bmatrix}
                = \\begin{bmatrix} 1 & 0 & 0 \\\\ 0 & \\cos\\phi & \\sin\\phi \\\\ 0 & -\\sin\\phi & \\cos\\phi \\end{bmatrix}
                \\begin{bmatrix} \\dot\\phi \\\\ \\dot x \\\\ \\dot y \\end{bmatrix}`}/>
            </div>
            <T
                en={<p>
                    Wheeled robots split into two families. <strong>Omnidirectional</strong> robots have no equality
                    constraint on <InlineMath math='\dot q'/>: they can translate in any direction while rotating.
                    They use <strong>omniwheels</strong> (free rollers around the rim, sliding direction in the
                    wheel plane, <InlineMath math='\gamma = 0'/>) or <strong>mecanum wheels</strong> (rollers at{" "}
                    <InlineMath math='\gamma = \pm 45°'/>). <strong>Nonholonomic</strong> robots use conventional
                    wheels that cannot slip sideways, which imposes one Pfaffian constraint{" "}
                    <InlineMath math='A(q)\dot q = 0'/> on the chassis. A car cannot move directly sideways, yet it
                    can still reach every <InlineMath math='(\phi, x, y)'/>: the constraint restricts velocities
                    but not configurations, which is exactly what "nonholonomic" means.
                </p>}
                ko={<p>
                    바퀴 로봇은 두 갈래로 나뉜다. <strong>Omnidirectional</strong> 로봇은{" "}
                    <InlineMath math='\dot q'/>에 등식 제약이 없어서 회전하면서 아무 방향으로나 움직일 수 있다.
                    바퀴로는 <strong>omniwheel</strong>(둘레에 자유 롤러, 미끄럼 방향이 바퀴 평면 안,{" "}
                    <InlineMath math='\gamma = 0'/>)이나 <strong>mecanum wheel</strong>(롤러가{" "}
                    <InlineMath math='\gamma = \pm 45°'/>)을 쓴다. <strong>Nonholonomic</strong> 로봇은 옆으로
                    미끄러지지 못하는 보통 바퀴를 쓰고, 그 결과 차체에 Pfaffian 제약{" "}
                    <InlineMath math='A(q)\dot q = 0'/> 하나가 걸린다. 자동차는 옆으로 바로 움직일 수 없지만 그래도
                    모든 <InlineMath math='(\phi, x, y)'/>에 도달할 수 있다. 제약이 속도만 묶고 configuration 은
                    못 묶는 것, 그것이 nonholonomic 의 뜻이다.
                </p>}
            />

            <T en={<h2>Omnidirectional Robots</h2>} ko={<h2>Omnidirectional 로봇</h2>}/>
            <T
                en={<p>
                    Each wheel has one motor (its driving speed), so at least three wheels are needed to command
                    the three-dimensional <InlineMath math='\dot q'/>. The key modeling question: given a desired
                    chassis velocity, how fast must each wheel be driven? Working in the wheel's own frame (
                    <InlineMath math='\hat x_w'/> along the driving direction), the wheel-center velocity{" "}
                    <InlineMath math='v = (v_x, v_y)'/> decomposes into a driven part and a freely sliding part:
                </p>}
                ko={<p>
                    바퀴마다 모터는 하나(구동 속도)뿐이므로, 3차원인 <InlineMath math='\dot q'/>를 마음대로
                    내려면 바퀴가 최소 3개 필요하다. 모델링의 핵심 질문은 "원하는 차체 속도가 주어졌을 때 각
                    바퀴를 얼마나 빨리 돌려야 하는가"이다. 바퀴 좌표계(<InlineMath math='\hat x_w'/>가 구동
                    방향)에서 바퀴 중심 속도 <InlineMath math='v = (v_x, v_y)'/>를 구동 성분과 자유 미끄럼
                    성분으로 나누면:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math={`\\begin{bmatrix} v_x \\\\ v_y \\end{bmatrix}
                = v_{\\mathrm{drive}}\\begin{bmatrix} 1 \\\\ 0 \\end{bmatrix}
                + v_{\\mathrm{slide}}\\begin{bmatrix} -\\sin\\gamma \\\\ \\cos\\gamma \\end{bmatrix}
                \\;\\Rightarrow\\;
                v_{\\mathrm{drive}} = v_x + v_y\\tan\\gamma, \\qquad
                u = \\frac{v_{\\mathrm{drive}}}{r} = \\frac{1}{r}(v_x + v_y\\tan\\gamma)`}/>
            </div>
            <T
                en={<p>
                    The second row solves for <InlineMath math='v_{\mathrm{slide}} = v_y/\cos\gamma'/>, and
                    substituting into the first gives <InlineMath math='v_{\mathrm{drive}}'/>; dividing by the
                    radius <InlineMath math='r'/> gives the driving angular speed <InlineMath math='u'/>. Chaining
                    four transformations, read right to left ((1) <InlineMath math='\dot q \to \mathcal{V}_b'/>,
                    (2) chassis twist <InlineMath math='\to'/> linear velocity at the wheel center, (3) rotate into
                    the wheel frame by the wheel heading <InlineMath math='\beta_i'/>, (4) the formula above),
                    yields one row <InlineMath math='h_i(\phi)'/> per wheel, and stacking rows gives
                </p>}
                ko={<p>
                    둘째 행에서 <InlineMath math='v_{\mathrm{slide}} = v_y/\cos\gamma'/>를 구해 첫 행에 대입하면{" "}
                    <InlineMath math='v_{\mathrm{drive}}'/>가 나오고, 반지름 <InlineMath math='r'/>로 나누면 구동
                    각속도 <InlineMath math='u'/>다. 여기에 변환 네 개를 오른쪽부터 차례로 이으면 ((1){" "}
                    <InlineMath math='\dot q \to \mathcal{V}_b'/>, (2) 차체 twist → 바퀴 중심의 선속도, (3) 바퀴
                    방향 <InlineMath math='\beta_i'/>만큼 돌려 바퀴 좌표계로, (4) 위의 식) 바퀴 하나당 행벡터{" "}
                    <InlineMath math='h_i(\phi)'/>가 나오고, 이를 쌓으면
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math={`u = H(\\phi)\\,\\dot q = H(0)\\,\\mathcal{V}_b, \\qquad H(0) \\in \\mathbb{R}^{m\\times 3}
                \\;\\text{must have rank } 3`}/>
            </div>
            <T
                en={<p>
                    For the four-mecanum robot (<InlineMath math='\gamma = \mp 45°'/>, half-length{" "}
                    <InlineMath math='\ell'/>, half-width <InlineMath math='w'/>):
                </p>}
                ko={<p>
                    mecanum 바퀴 네 개짜리 로봇이라면 (<InlineMath math='\gamma = \mp 45°'/>, 반길이{" "}
                    <InlineMath math='\ell'/>, 반너비 <InlineMath math='w'/>):
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math={`u = \\frac{1}{r}\\begin{bmatrix}
                -\\ell - w & 1 & -1 \\\\ \\ell + w & 1 & 1 \\\\ \\ell + w & 1 & -1 \\\\ -\\ell - w & 1 & 1
                \\end{bmatrix} \\mathcal{V}_b`}/>
            </div>
            <T
                en={<p>
                    Read the columns: to drive forward all four wheels spin the same way; to slide sideways the two
                    diagonals fight in opposite directions; to spin in place the left pair opposes the right pair.
                    Each wheel's speed limit <InlineMath math='|u_i| \le u_{i,\max}'/> slices the twist space
                    between two parallel planes, so the feasible body twists form a convex polyhedron with{" "}
                    <InlineMath math='2m'/> faces. Motion planning and control are easy: any method from Chapters
                    9–11 applies, e.g. feedforward plus PI over <InlineMath math='q'/>, converted to wheel speeds
                    by <InlineMath math='H(\phi)'/>.
                </p>}
                ko={<p>
                    열을 읽어 보면: 전진은 네 바퀴가 같은 방향, 옆걸음은 대각선끼리 편을 먹고, 제자리 회전은
                    왼쪽 짝과 오른쪽 짝이 반대로 돈다. 바퀴 속도 한계 <InlineMath math='|u_i| \le u_{i,\max}'/>는
                    twist 공간을 평행한 평면 두 장 사이로 자르므로, 가능한 body twist 들은 면이{" "}
                    <InlineMath math='2m'/>개인 볼록 다면체가 된다. planning 과 제어는 쉽다. 9~11장의 어떤 방법이든
                    그대로 쓰면 되고, 예를 들어 <InlineMath math='q'/>에 feedforward + PI 를 걸고{" "}
                    <InlineMath math='H(\phi)'/>로 바퀴 속도로 바꾸면 끝이다.
                </p>}
            />
            <MecanumDrive/>

            <T en={<h2>Modeling Nonholonomic Robots</h2>} ko={<h2>Nonholonomic 로봇의 모델링</h2>}/>
            <T
                en={<p>
                    Nonholonomic models are written not by listing forbidden directions but by listing the{" "}
                    <strong>allowed</strong> ones: <InlineMath math='\dot q = G(q)u'/>, where the columns{" "}
                    <InlineMath math='g_i(q)'/> of <InlineMath math='G(q)'/> are <strong>control vector
                    fields</strong> and the coefficients <InlineMath math='u'/> are exactly the controls. Three
                    properties hold throughout: no drift (zero control, zero motion), fields depend on{" "}
                    <InlineMath math='q'/>, and <InlineMath math='\dot q'/> is linear in <InlineMath math='u'/>.
                    The classic examples, ignoring wheel rolling angles:
                </p>}
                ko={<p>
                    nonholonomic 모델은 "금지된 방향"이 아니라 <strong>허용된</strong> 방향을 나열하는 꼴로 쓴다:{" "}
                    <InlineMath math='\dot q = G(q)u'/>. <InlineMath math='G(q)'/>의 열{" "}
                    <InlineMath math='g_i(q)'/>가 <strong>control vector field</strong> 이고, 계수{" "}
                    <InlineMath math='u'/>가 곧 우리가 쥔 제어 입력이다. 세 가지 성질이 늘 성립한다: drift 가
                    없고(입력이 0이면 속도도 0), field 는 <InlineMath math='q'/>의 함수이며,{" "}
                    <InlineMath math='\dot q'/>는 <InlineMath math='u'/>에 선형이다. 바퀴 굴림각을 무시한 대표
                    모델들:
                </p>}
            />
            <T
                en={<ul className="list-disc pl-6 space-y-1">
                    <li><strong>Unicycle</strong> (one rolling wheel): controls are driving speed and heading rate.</li>
                    <li><strong>Diff-drive</strong>: two wheels on one axle, radius <InlineMath math='r'/>,
                        separation <InlineMath math='2d'/>; controls are the wheel speeds{" "}
                        <InlineMath math='(u_L, u_R)'/>. Spinning in place is free:{" "}
                        <InlineMath math='u_L = -u_R'/>.</li>
                    <li><strong>Car</strong>: Ackermann-steered front wheels; controls are forward speed{" "}
                        <InlineMath math='v'/> and steering angle <InlineMath math='\psi'/>, giving turning rate{" "}
                        <InlineMath math='\omega = (v\tan\psi)/\ell'/> for wheelbase <InlineMath math='\ell'/>.</li>
                </ul>}
                ko={<ul className="list-disc pl-6 space-y-1">
                    <li><strong>Unicycle</strong> (구르는 바퀴 하나): 입력은 구동 속도와 방향 회전 속도.</li>
                    <li><strong>Diff-drive</strong>: 같은 축 위의 바퀴 두 개 (반지름 <InlineMath math='r'/>, 간격{" "}
                        <InlineMath math='2d'/>). 입력은 바퀴 속도 <InlineMath math='(u_L, u_R)'/>.{" "}
                        <InlineMath math='u_L = -u_R'/>로 돌리면 제자리 회전이 된다.</li>
                    <li><strong>Car</strong>: 앞바퀴를 Ackermann 방식으로 조향. 입력은 전진 속도{" "}
                        <InlineMath math='v'/>와 조향각 <InlineMath math='\psi'/>이고, 축간거리{" "}
                        <InlineMath math='\ell'/>일 때 회전 속도는{" "}
                        <InlineMath math='\omega = (v\tan\psi)/\ell'/>이다.</li>
                </ul>}
            />
            <T
                en={<p>
                    With control transformations (e.g. <InlineMath math='u_{L,R} = (v \mp \omega d)/r'/> for the
                    diff-drive) all three collapse to one <strong>canonical model</strong>:
                </p>}
                ko={<p>
                    입력 변환을 거치면 (diff-drive 는 <InlineMath math='u_{L,R} = (v \mp \omega d)/r'/>) 세 모델이
                    전부 하나의 <strong>canonical 모델</strong>로 모인다:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math={`\\dot q = \\begin{bmatrix} \\dot\\phi \\\\ \\dot x \\\\ \\dot y \\end{bmatrix}
                = \\begin{bmatrix} 0 & 1 \\\\ \\cos\\phi & 0 \\\\ \\sin\\phi & 0 \\end{bmatrix}
                \\begin{bmatrix} v \\\\ \\omega \\end{bmatrix}`}/>
            </div>
            <T
                en={<p>
                    The Pfaffian constraint follows in two lines: from{" "}
                    <InlineMath math='\dot x = v\cos\phi'/> and <InlineMath math='\dot y = v\sin\phi'/>, eliminate{" "}
                    <InlineMath math='v'/> to get{" "}
                    <InlineMath math='\dot x \sin\phi - \dot y \cos\phi = 0'/>: no sideways velocity. What
                    distinguishes a unicycle from a car is only the shape of the allowed{" "}
                    <InlineMath math='(v, \omega)'/> region <InlineMath math='U'/>: a rectangle for the unicycle, a
                    diamond for the diff-drive (trade speed for turning), and a bowtie for the car (turning rate
                    bounded by <InlineMath math='|\omega| \le |v|/r_{\min}'/>, so no turning in place; a car
                    without reverse keeps only the right half).
                </p>}
                ko={<p>
                    Pfaffian 제약은 두 줄로 나온다. <InlineMath math='\dot x = v\cos\phi'/>,{" "}
                    <InlineMath math='\dot y = v\sin\phi'/>에서 <InlineMath math='v'/>를 소거하면{" "}
                    <InlineMath math='\dot x \sin\phi - \dot y \cos\phi = 0'/>, 즉 옆 방향 속도는 0 이다. 그러면
                    unicycle 과 car 를 가르는 것은 오직 허용된 <InlineMath math='(v, \omega)'/> 영역{" "}
                    <InlineMath math='U'/>의 모양이다. unicycle 은 직사각형, diff-drive 는 마름모(속도와 회전을
                    맞바꾼다), car 는 나비넥타이 (<InlineMath math='|\omega| \le |v|/r_{\min}'/>이라 제자리 회전이
                    안 된다. 후진 없는 차는 그 오른쪽 절반만 쓴다).
                </p>}
            />
            <DriveControlSets/>
            <T
                en={<p>
                    One more useful trick: a point <InlineMath math='P'/> fixed to the chassis at{" "}
                    <InlineMath math='(x_r, y_r)'/> (not on the wheel axis, <InlineMath math='x_r \neq 0'/>) can be
                    steered like a holonomic point. Differentiate{" "}
                    <InlineMath math='p = (x, y) + R(\phi)(x_r, y_r)'/>, substitute{" "}
                    <InlineMath math='\dot\phi = \omega'/> and{" "}
                    <InlineMath math='(\dot x, \dot y) = (v\cos\phi, v\sin\phi)'/>, and solve the resulting{" "}
                    <InlineMath math='2\times 2'/> system for <InlineMath math='(v, \omega)'/>: any desired{" "}
                    <InlineMath math='(\dot x_P, \dot y_P)'/> is achievable. This is the workhorse behind simple
                    mobile-robot controllers.
                </p>}
                ko={<p>
                    쓸모 있는 기술 하나 더. 차체에 고정된 점 <InlineMath math='P'/>가{" "}
                    <InlineMath math='(x_r, y_r)'/>에 있고 바퀴 축 위만 아니면 (<InlineMath math='x_r \neq 0'/>),
                    이 점은 holonomic 점처럼 조종할 수 있다.{" "}
                    <InlineMath math='p = (x, y) + R(\phi)(x_r, y_r)'/>을 미분하고{" "}
                    <InlineMath math='\dot\phi = \omega'/>,{" "}
                    <InlineMath math='(\dot x, \dot y) = (v\cos\phi, v\sin\phi)'/>를 대입한 뒤{" "}
                    <InlineMath math='2\times 2'/> 연립을 <InlineMath math='(v, \omega)'/>에 대해 풀면, 어떤{" "}
                    <InlineMath math='(\dot x_P, \dot y_P)'/>든 만들 수 있다. 단순한 모바일 로봇 제어기들이 모두
                    이 성질 위에 서 있다.
                </p>}
            />

            <T en={<h2>Controllability and the Lie Bracket</h2>} ko={<h2>Controllability 와 Lie Bracket</h2>}/>
            <T
                en={<p>
                    Here is the puzzle. The canonical robot has only two control fields but three configuration
                    variables, and <strong>no continuous time-invariant feedback law can stabilize it to a
                    point</strong> (a classical theorem: <InlineMath math='\mathrm{rank}\,G(0) < \dim q'/> forbids
                    it). Yet everyday experience says a car can park anywhere. The resolution is that the car is
                    still <em>controllable</em> in weaker but crucial senses. With reachable sets confined to a
                    neighborhood <InlineMath math='W'/>: a robot is <strong>STLA</strong> (small-time locally
                    accessible) if the reachable set is full dimensional, and <strong>STLC</strong> (small-time
                    locally controllable) if it is a whole neighborhood of the start. STLC means you can wiggle in{" "}
                    <em>any</em> direction without leaving a tight parking spot.
                </p>}
                ko={<p>
                    여기 수수께끼가 있다. canonical 로봇은 control field 가 둘뿐인데 configuration 은 3차원이고,{" "}
                    <strong>연속인 시불변 feedback 으로는 한 점에 안정화할 수 없다</strong>는 고전 정리가 있다
                    (<InlineMath math='\mathrm{rank}\,G(0) < \dim q'/>이면 불가능). 그런데 경험은 말한다. 차는
                    어디든 주차할 수 있다. 답은 더 약하지만 결정적인 의미의 <em>controllability</em> 들이 여전히
                    성립한다는 것이다. 도달 집합을 작은 이웃 <InlineMath math='W'/> 안으로 제한했을 때, 도달
                    집합이 최대 차원이면 <strong>STLA</strong>(small-time locally accessible), 출발점의 이웃
                    전체를 덮으면 <strong>STLC</strong>(small-time locally controllable)다. STLC 라는 것은 좁은
                    주차 공간을 벗어나지 않고도 <em>어느</em> 방향으로든 조금씩 움직일 수 있다는 뜻이다.
                </p>}
            />
            <T
                en={<p>
                    The tool that unlocks this is the <strong>Lie bracket</strong>. Follow field{" "}
                    <InlineMath math='g_i'/> for a short time <InlineMath math='\epsilon'/>, then{" "}
                    <InlineMath math='g_j'/>, then <InlineMath math='-g_i'/>, then <InlineMath math='-g_j'/>. Does
                    the robot return to the start? Taylor-expand to find out:
                </p>}
                ko={<p>
                    이 수수께끼를 푸는 도구가 <strong>Lie bracket</strong> 이다. field <InlineMath math='g_i'/>를
                    짧은 시간 <InlineMath math='\epsilon'/> 동안 따라가고, 이어서 <InlineMath math='g_j'/>,{" "}
                    <InlineMath math='-g_i'/>, <InlineMath math='-g_j'/>를 차례로 따라가면 로봇은 제자리로
                    돌아올까? Taylor 전개로 확인해 보자:
                </p>}
            />
            <T
                en={<ol className="list-decimal pl-6 space-y-2">
                    <li>Following <InlineMath math='g_i'/> for time <InlineMath math='\epsilon'/>, with{" "}
                        <InlineMath math='\ddot q = (\partial g_i/\partial q)\,g_i'/>:
                        <div className="overflow-x-auto">
                            <BlockMath math={`q(\\epsilon) = q(0) + \\epsilon g_i + \\tfrac{1}{2}\\epsilon^2 \\frac{\\partial g_i}{\\partial q}g_i + O(\\epsilon^3)`}/>
                        </div></li>
                    <li>Then following <InlineMath math='g_j'/>, and expanding{" "}
                        <InlineMath math='g_j(q(\epsilon))'/> about <InlineMath math='q(0)'/>, one cross term
                        appears that remembers the order:{" "}
                        <InlineMath math='\epsilon^2 (\partial g_j/\partial q) g_i'/>.</li>
                    <li>Comparing the two orders (i then j, versus j then i), everything cancels except
                        <div className="overflow-x-auto">
                            <BlockMath math={`\\Delta q = \\epsilon^2\\Big(\\frac{\\partial g_j}{\\partial q}g_i - \\frac{\\partial g_i}{\\partial q}g_j\\Big) + O(\\epsilon^3)
                            \\;=\\; \\epsilon^2\\,[g_i, g_j](q) + O(\\epsilon^3)`}/>
                        </div>
                        The bracket <InlineMath math='[g_i, g_j]'/> is a new vector field: the direction you drift
                        when you cycle the two controls. The drift is <InlineMath math='O(\epsilon^2)'/>, an order
                        slower than the <InlineMath math='O(\epsilon)'/> motions along the original fields, which
                        is why parallel parking feels so tedious.</li>
                </ol>}
                ko={<ol className="list-decimal pl-6 space-y-2">
                    <li><InlineMath math='g_i'/>를 <InlineMath math='\epsilon'/> 동안 따라가면 (
                        <InlineMath math='\ddot q = (\partial g_i/\partial q)\,g_i'/> 이용):
                        <div className="overflow-x-auto">
                            <BlockMath math={`q(\\epsilon) = q(0) + \\epsilon g_i + \\tfrac{1}{2}\\epsilon^2 \\frac{\\partial g_i}{\\partial q}g_i + O(\\epsilon^3)`}/>
                        </div></li>
                    <li>이어서 <InlineMath math='g_j'/>를 따라가면서{" "}
                        <InlineMath math='g_j(q(\epsilon))'/>를 <InlineMath math='q(0)'/> 기준으로 전개하면, 순서를
                        기억하는 교차항 <InlineMath math='\epsilon^2 (\partial g_j/\partial q) g_i'/> 하나가
                        나타난다.</li>
                    <li>두 순서(i 다음 j, j 다음 i)를 빼면 나머지는 전부 지워지고
                        <div className="overflow-x-auto">
                            <BlockMath math={`\\Delta q = \\epsilon^2\\Big(\\frac{\\partial g_j}{\\partial q}g_i - \\frac{\\partial g_i}{\\partial q}g_j\\Big) + O(\\epsilon^3)
                            \\;=\\; \\epsilon^2\\,[g_i, g_j](q) + O(\\epsilon^3)`}/>
                        </div>
                        만 남는다. 이 bracket <InlineMath math='[g_i, g_j]'/>가 새 vector field 다: 두 입력을 한
                        바퀴 돌렸을 때 흘러가는 방향. 크기가 <InlineMath math='O(\epsilon^2)'/>로, 원래 field 를
                        따라가는 <InlineMath math='O(\epsilon)'/> 운동보다 한 차수 느리다. 평행주차가 답답하게
                        느껴지는 이유가 바로 이것이다.</li>
                </ol>}
            />
            <T
                en={<p>
                    For the canonical robot with <InlineMath math='g_1 = (0, \cos\phi, \sin\phi)'/> (drive) and{" "}
                    <InlineMath math='g_2 = (1, 0, 0)'/> (spin), the computation gives
                </p>}
                ko={<p>
                    canonical 로봇의 <InlineMath math='g_1 = (0, \cos\phi, \sin\phi)'/>(주행)과{" "}
                    <InlineMath math='g_2 = (1, 0, 0)'/>(회전)으로 직접 계산하면
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math={`[g_1, g_2](q) = \\frac{\\partial g_2}{\\partial q}g_1 - \\frac{\\partial g_1}{\\partial q}g_2
                = 0 - \\begin{bmatrix} 0 & 0 & 0 \\\\ -\\sin\\phi & 0 & 0 \\\\ \\cos\\phi & 0 & 0 \\end{bmatrix}
                \\begin{bmatrix} 1 \\\\ 0 \\\\ 0 \\end{bmatrix}
                = \\begin{bmatrix} 0 \\\\ \\sin\\phi \\\\ -\\cos\\phi \\end{bmatrix}`}/>
            </div>
            <T
                en={<p>
                    which is exactly the sideways direction. The determinant of{" "}
                    <InlineMath math='[\,g_1\;g_2\;[g_1,g_2]\,]'/> equals 1 everywhere, so drive, spin, and their
                    bracket span all three directions at every <InlineMath math='q'/>. The general statement uses
                    the <strong>Lie algebra</strong> <InlineMath math='\mathrm{Lie}(\mathcal{G})'/>, the span of
                    all nested brackets of all degrees: if{" "}
                    <InlineMath math='\dim \mathrm{Lie}(\mathcal{G})(q) = n'/> and{" "}
                    <InlineMath math='\mathrm{span}(U) = \mathbb{R}^m'/>, the system is STLA; if additionally{" "}
                    <InlineMath math='\mathrm{pos}(U) = \mathbb{R}^m'/> (every field can be followed both ways), it
                    is STLC. Hence unicycle, diff-drive, and reverse-gear car are STLC, while the forward-only car
                    is merely STLA: in a tight spot it can never reach poses directly behind itself. And since the
                    reachable set is full dimensional, the sideways velocity constraint cannot be integrated into a
                    configuration constraint: it really is nonholonomic. The same machinery even shows the unicycle
                    is STLC in its full four-dimensional configuration including the rolling angle, while the
                    diff-drive with both wheel angles (five variables) has Lie algebra dimension only 4: one of its
                    three velocity constraints is actually holonomic.
                </p>}
                ko={<p>
                    정확히 옆 방향이 나온다. 그리고{" "}
                    <InlineMath math='[\,g_1\;g_2\;[g_1,g_2]\,]'/>의 행렬식이 모든 곳에서 1 이므로, 주행·회전·그
                    bracket 이 어느 <InlineMath math='q'/>에서든 세 방향을 전부 span 한다. 일반화는{" "}
                    <strong>Lie algebra</strong> <InlineMath math='\mathrm{Lie}(\mathcal{G})'/>(모든 차수의 중첩
                    bracket 들의 span)로 한다:{" "}
                    <InlineMath math='\dim \mathrm{Lie}(\mathcal{G})(q) = n'/>이고{" "}
                    <InlineMath math='\mathrm{span}(U) = \mathbb{R}^m'/>이면 STLA, 여기에{" "}
                    <InlineMath math='\mathrm{pos}(U) = \mathbb{R}^m'/>(모든 field 를 양방향으로 따라갈 수
                    있음)까지 성립하면 STLC 다. 그래서 unicycle, diff-drive, 후진 되는 car 는 STLC 이고, 전진만
                    되는 car 는 STLA 에 그친다. 좁은 곳에서는 자기 바로 뒤의 자세에 도달할 수 없다. 도달 집합이
                    최대 차원이므로 옆 방향 속도 제약은 configuration 제약으로 적분되지 않는다. 진짜
                    nonholonomic 이라는 것이 이렇게 증명된다. 같은 도구로 더 재미있는 사실도 나온다. 굴림각까지
                    포함한 4차원 configuration 에서도 unicycle 은 STLC 지만, 두 바퀴 각을 포함한 diff-drive
                    (변수 5개)는 Lie algebra 차원이 4 에서 멈춘다. 세 속도 제약 중 하나는 사실 holonomic 인
                    것이다.
                </p>}
            />
            <ParallelParking/>

            <T en={<h2>Shortest Paths: Dubins and Reeds–Shepp</h2>} ko={<h2>Dubins 와 Reeds–Shepp 최단 경로</h2>}/>
            <T
                en={<p>
                    In an obstacle-free plane, what is the <em>shortest</em> path between two poses? For the
                    unicycle and diff-drive the answer is dull (turn, drive straight, turn). For cars it is one of
                    the classic results of optimal control:
                </p>}
                ko={<p>
                    장애물 없는 평면에서 두 자세 사이의 <em>최단</em> 경로는 무엇일까? unicycle 과 diff-drive 는
                    답이 심심하다 (돌고, 직진하고, 돈다). car 에서는 최적 제어의 고전적 결과가 나온다:
                </p>}
            />
            <T
                en={<ul className="list-disc pl-6 space-y-1">
                    <li><strong>Forward-only car (Dubins)</strong>: shortest paths use only minimum-radius arcs (C)
                        and straight segments (S), in patterns <InlineMath math='CSC'/> or{" "}
                        <InlineMath math='CC_\alpha C'/> with <InlineMath math='\alpha > \pi'/>; any segment may
                        have zero length. Splitting C into L/R gives six words: LSL, RSR, LSR, RSL, RLR, LRL.</li>
                    <li><strong>Car with reverse (Reeds–Shepp)</strong>: still only minimum-radius arcs and
                        straight lines, plus cusps (|) where the car reverses; every shortest path falls into nine
                        classes such as <InlineMath math='C|C|C'/>, <InlineMath math='CC|C'/>,{" "}
                        <InlineMath math='C|C_{\pi/2}SC_{\pi/2}|C'/>, <InlineMath math='CSC'/>, giving 48 concrete
                        types.</li>
                    <li><strong>Diff-drive (minimum time)</strong>: only translations and spins in place, 40 types
                        in total. Counterintuitively, spin-drive-spin is not always fastest: for some goals a
                        forward-spin-backward route through a "via point" wins (4.749 s versus
                        5.103 s).</li>
                </ul>}
                ko={<ul className="list-disc pl-6 space-y-1">
                    <li><strong>전진만 되는 car (Dubins)</strong>: 최단 경로는 최소 반지름 원호(C)와 직선(S)만으로
                        이루어지고, 꼴은 <InlineMath math='CSC'/> 또는 <InlineMath math='CC_\alpha C'/> (
                        <InlineMath math='\alpha > \pi'/>) 둘뿐이다. 어느 구간이든 길이 0 이 될 수 있다. C 를
                        L/R 로 나누면 LSL, RSR, LSR, RSL, RLR, LRL 여섯 단어가 된다.</li>
                    <li><strong>후진 되는 car (Reeds–Shepp)</strong>: 역시 최소 반지름 원호와 직선만 쓰되, 전후진을
                        바꾸는 cusp(|)이 추가된다. 모든 최단 경로는 <InlineMath math='C|C|C'/>,{" "}
                        <InlineMath math='CC|C'/>, <InlineMath math='C|C_{\pi/2}SC_{\pi/2}|C'/>,{" "}
                        <InlineMath math='CSC'/> 같은 9개 계열, 구체적으로는 48가지 유형 중 하나다.</li>
                    <li><strong>Diff-drive (최소 시간)</strong>: 병진과 제자리 회전만 쓰며 모두 40가지 유형이다.
                        직관과 달리 "돌고-가고-돌기"가 항상 최선은 아니다. 어떤 목표는 "전진-회전-후진"으로 via
                        point 를 거치는 쪽이 빠르다 (4.749초 vs 5.103초).</li>
                </ul>}
            />
            <DubinsPlanner/>
            <T
                en={<p>
                    With obstacles, grid or sampling planners from Chapter 10 apply directly, discretizing the
                    control set with the extremal controls that optimal paths use anyway. A particularly elegant
                    trick for a reverse-gear car: run <em>any</em> planner that ignores the motion constraints,
                    then repair the path by recursive subdivision, replacing each piece with a shortest Reeds–Shepp
                    path and splitting whenever a replacement collides. Because the car is STLC and free space is
                    open, the recursion terminates: the constraint-free path is always convertible into a feasible
                    one.
                </p>}
                ko={<p>
                    장애물이 있으면 10장의 grid·sampling planner 를 그대로 쓰면 된다. control set 은 어차피 최적
                    경로가 쓰는 극단 입력들로 이산화하면 충분하다. 후진 되는 차에는 특히 우아한 방법이 하나 있다.
                    운동 제약을 <em>무시하는</em> 아무 planner 로나 경로를 찾은 다음, 구간을 Reeds–Shepp 최단
                    경로로 갈아 끼우고 충돌하면 반으로 쪼개기를 재귀적으로 반복한다. 차가 STLC 이고 자유 공간이
                    열린 집합이라 이 재귀는 반드시 끝난다. 제약 없는 경로는 언제나 실행 가능한 경로로 바꿀 수
                    있다.
                </p>}
            />

            <T en={<h2>Trajectory Tracking Control</h2>} ko={<h2>궤적 추종 제어</h2>}/>
            <T
                en={<p>
                    Three feedback problems arise: stabilizing a configuration (impossible with continuous
                    time-invariant laws, as above), tracking a trajectory <InlineMath math='q_d(t)'/>, and tracking
                    a geometric path. Tracking is the tractable one. The simplest idea reuses the point{" "}
                    <InlineMath math='P'/>: track its desired position with a proportional law{" "}
                    <InlineMath math='\dot p = k_p(p_d - p)'/> converted to <InlineMath math='(v, \omega)'/>. It
                    works, but it knows nothing about the chassis angle, and it can converge with the robot{" "}
                    <em>facing backwards</em>, driving in reverse forever. The remedy is to control the full error,
                    written in the reference frame {"{d}"}:
                </p>}
                ko={<p>
                    feedback 문제는 셋이다. configuration 안정화(위에서 본 대로 연속 시불변 법칙으로는 불가능),
                    궤적 <InlineMath math='q_d(t)'/> 추종, 기하학적 경로 추종. 이 중 추종이 풀 만한 문제다. 가장
                    단순한 방법은 점 <InlineMath math='P'/>를 재활용하는 것이다. 원하는 위치를 비례 제어{" "}
                    <InlineMath math='\dot p = k_p(p_d - p)'/>로 쫓게 하고 <InlineMath math='(v, \omega)'/>로
                    변환한다. 작동은 하지만 이 법칙은 차체 방향을 전혀 모르기 때문에, 로봇이{" "}
                    <em>뒤집힌 채</em> 수렴해서 영원히 후진으로 따라가는 일이 생긴다. 처방은 오차 전체를 기준
                    좌표계 {"{d}"} 에서 쓰는 것이다:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math={`\\begin{bmatrix} \\phi_e \\\\ x_e \\\\ y_e \\end{bmatrix}
                = \\begin{bmatrix} 1 & 0 & 0 \\\\ 0 & \\cos\\phi_d & \\sin\\phi_d \\\\ 0 & -\\sin\\phi_d & \\cos\\phi_d \\end{bmatrix}
                \\begin{bmatrix} \\phi - \\phi_d \\\\ x - x_d \\\\ y - y_d \\end{bmatrix}`}/>
            </div>
            <div className="overflow-x-auto">
                <BlockMath math={`\\begin{bmatrix} v \\\\ \\omega \\end{bmatrix}
                = \\begin{bmatrix} (v_d - k_1 |v_d| (x_e + y_e \\tan\\phi_e))/\\cos\\phi_e \\\\
                \\omega_d - (k_2 v_d y_e + k_3 |v_d| \\tan\\phi_e)\\cos^2\\phi_e \\end{bmatrix}`}/>
            </div>
            <T
                en={<p>
                    Read it term by term: with zero error it reduces to the nominal{" "}
                    <InlineMath math='(v_d, \omega_d)'/> (so the reference must use non-saturating controls, leaving
                    effort to correct errors); the <InlineMath math='k_1'/> term speeds up or slows down to kill
                    the along-track error; the <InlineMath math='k_2'/> term steers toward the reference to kill
                    the cross-track error; the <InlineMath math='k_3'/> term aligns the heading. It assumes{" "}
                    <InlineMath math='|\phi_e| < \pi/2'/> and <InlineMath math='v_d \neq 0'/>, so it cannot
                    stabilize spin-in-place maneuvers.
                </p>}
                ko={<p>
                    항별로 읽어 보자. 오차가 0 이면 그대로 명목 입력 <InlineMath math='(v_d, \omega_d)'/>가 된다
                    (그래서 기준 궤적은 입력을 한계까지 쓰면 안 되고, 오차 교정용 여유를 남겨야 한다).{" "}
                    <InlineMath math='k_1'/> 항은 속도를 가감해 진행 방향 오차를 지우고,{" "}
                    <InlineMath math='k_2'/> 항은 기준 쪽으로 방향을 틀어 횡 오차를 지우며,{" "}
                    <InlineMath math='k_3'/> 항은 방향각 자체를 맞춘다. <InlineMath math='|\phi_e| < \pi/2'/>와{" "}
                    <InlineMath math='v_d \neq 0'/>을 가정하므로 제자리 회전은 이 법칙으로 안정화할 수 없다.
                </p>}
            />
            <TrackingControl/>

            <T en={<h2>Odometry and Mobile Manipulation</h2>} ko={<h2>Odometry 와 Mobile Manipulation</h2>}/>
            <T
                en={<p>
                    <strong>Odometry</strong> estimates the chassis configuration by integrating wheel rotations.
                    Between samples the wheel increments <InlineMath math='\Delta\theta'/> are assumed to come from
                    a constant body twist: <InlineMath math='\mathcal{V}_b = F\Delta\theta'/> with{" "}
                    <InlineMath math='F = H^\dagger(0)'/> (for the diff-drive,{" "}
                    <InlineMath math='\omega_{bz} = r(\Delta\theta_R - \Delta\theta_L)/2d'/>,{" "}
                    <InlineMath math='v_{bx} = r(\Delta\theta_R + \Delta\theta_L)/2'/>). A constant twist
                    integrates in closed form (the planar matrix exponential):
                </p>}
                ko={<p>
                    <strong>Odometry</strong> 는 바퀴 회전을 적분해 차체 configuration 을 추정한다. 샘플 사이에서
                    바퀴 증분 <InlineMath math='\Delta\theta'/>가 일정한 body twist 에서 나왔다고 가정하면{" "}
                    <InlineMath math='\mathcal{V}_b = F\Delta\theta'/>,{" "}
                    <InlineMath math='F = H^\dagger(0)'/>이다 (diff-drive 라면{" "}
                    <InlineMath math='\omega_{bz} = r(\Delta\theta_R - \Delta\theta_L)/2d'/>,{" "}
                    <InlineMath math='v_{bx} = r(\Delta\theta_R + \Delta\theta_L)/2'/>). 일정한 twist 는 닫힌
                    식으로 적분된다 (평면 행렬 지수):
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math={`\\Delta q_b = \\begin{cases}
                (0,\\; v_{bx},\\; v_{by}) & \\omega_{bz} = 0 \\\\[4pt]
                \\Big(\\omega_{bz},\\; \\dfrac{v_{bx}\\sin\\omega_{bz} + v_{by}(\\cos\\omega_{bz} - 1)}{\\omega_{bz}},\\;
                \\dfrac{v_{by}\\sin\\omega_{bz} + v_{bx}(1 - \\cos\\omega_{bz})}{\\omega_{bz}}\\Big) & \\omega_{bz} \\neq 0
                \\end{cases}`}/>
            </div>
            <T
                en={<p>
                    Rotate <InlineMath math='\Delta q_b'/> by the current chassis angle and add:{" "}
                    <InlineMath math='q_{k+1} = q_k + \Delta q'/>. Odometry is cheap and smooth but blind: model
                    errors and slip accumulate without bound, so estimates must be fused with or reset by external
                    sensing (GPS, landmarks, range sensors).
                </p>}
                ko={<p>
                    <InlineMath math='\Delta q_b'/>를 현재 차체 각도만큼 돌려 더하면{" "}
                    <InlineMath math='q_{k+1} = q_k + \Delta q'/>. odometry 는 값싸고 매끄럽지만 스스로를 교정할
                    수 없다. 모델 오차와 미끄러짐이 한없이 쌓이므로, GPS·랜드마크·거리 센서 같은 외부 측정과
                    융합하거나 주기적으로 리셋해 줘야 한다.
                </p>}
            />
            <OdometryDrift/>
            <T
                en={<p>
                    Finally, <strong>mobile manipulation</strong>: an arm on a mobile base, with the end-effector
                    pose <InlineMath math='X = T_{sb}(q)\,T_{b0}\,T_{0e}(\theta)'/>. The end-effector twist in{" "}
                    {"{e}"} splits into wheel and joint contributions,
                </p>}
                ko={<p>
                    마지막으로 <strong>mobile manipulation</strong>. 모바일 베이스 위에 팔이 얹혀 있고
                    end-effector 자세는 <InlineMath math='X = T_{sb}(q)\,T_{b0}\,T_{0e}(\theta)'/>다. {"{e}"}{" "}
                    에서 본 end-effector twist 는 바퀴 기여와 관절 기여로 갈라진다:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math={`\\mathcal{V}_e = J_e(\\theta)\\begin{bmatrix} u \\\\ \\dot\\theta \\end{bmatrix}
                = [\\,J_{\\mathrm{base}}(\\theta) \\;\\; J_{\\mathrm{arm}}(\\theta)\\,]\\begin{bmatrix} u \\\\ \\dot\\theta \\end{bmatrix}`}/>
            </div>
            <T
                en={<p>
                    <InlineMath math='J_{\mathrm{arm}}'/> is exactly the body Jacobian of Chapter 5. Building{" "}
                    <InlineMath math='J_{\mathrm{base}}'/>, the map from wheel speeds to the twist they induce at
                    the end-effector, takes three steps:
                </p>}
                ko={<p>
                    <InlineMath math='J_{\mathrm{arm}}'/>은 5장의 body Jacobian 그대로다. 남은 것은 바퀴 속도가
                    end-effector 에 만드는 twist, 즉 <InlineMath math='J_{\mathrm{base}}'/>이고, 세 단계로
                    만들어진다:
                </p>}
            />
            <T
                en={<ol className="list-decimal pl-6 space-y-2">
                    <li><strong>Wheels to chassis.</strong> Odometry already gave the planar relationship{" "}
                        <InlineMath math='\mathcal{V}_b = Fu'/>. For a diff-drive:
                        <div className="overflow-x-auto">
                            <BlockMath math={`\\mathcal{V}_b = \\begin{bmatrix} \\omega_{bz} \\\\ v_{bx} \\\\ v_{by} \\end{bmatrix}
                            = \\underbrace{r\\begin{bmatrix} -1/2d & 1/2d \\\\ 1/2 & 1/2 \\\\ 0 & 0 \\end{bmatrix}}_{F}
                            \\begin{bmatrix} u_L \\\\ u_R \\end{bmatrix}`}/>
                        </div></li>
                    <li><strong>Planar to spatial.</strong> A planar twist is a six-dimensional twist whose{" "}
                        <InlineMath math='\omega_x, \omega_y, v_z'/> components are zero, so pad{" "}
                        <InlineMath math='F'/> with zero rows in exactly those slots:
                        <div className="overflow-x-auto">
                            <BlockMath math={`\\mathcal{V}_{b6} =
                            \\begin{bmatrix} \\omega_x \\\\ \\omega_y \\\\ \\omega_z \\\\ v_x \\\\ v_y \\\\ v_z \\end{bmatrix}
                            = \\underbrace{\\begin{bmatrix} 0_m \\\\ 0_m \\\\ F \\\\ 0_m \\end{bmatrix}}_{F_6}\\, u
                            \\qquad (0_m: \\text{a zero row of width } m)`}/>
                        </div></li>
                    <li><strong>Chassis frame to end-effector frame.</strong> A twist changes frames by the
                        adjoint of the transform between them. From {"{e}"} to {"{b}"} the transform is{" "}
                        <InlineMath math='T_{eb} = (T_{b0}T_{0e}(\theta))^{-1} = T_{0e}^{-1}(\theta)\,T_{b0}^{-1}'/>,
                        so
                        <div className="overflow-x-auto">
                            <BlockMath math={`\\mathcal{V}_{e,\\mathrm{base}} = [\\mathrm{Ad}_{T_{eb}}]\\,\\mathcal{V}_{b6}
                            = \\underbrace{[\\mathrm{Ad}_{T_{0e}^{-1}(\\theta)T_{b0}^{-1}}]\\,F_6}_{J_{\\mathrm{base}}(\\theta)}\\, u`}/>
                        </div>
                        <InlineMath math='T_{eb}'/> involves only the fixed offset{" "}
                        <InlineMath math='T_{b0}'/> and the arm's forward kinematics{" "}
                        <InlineMath math='T_{0e}(\theta)'/>, which is why{" "}
                        <InlineMath math='J_e'/> depends on <InlineMath math='\theta'/> but not on where the base
                        happens to be.</li>
                </ol>}
                ko={<ol className="list-decimal pl-6 space-y-2">
                    <li><strong>바퀴 → 차체.</strong> odometry 에서 이미 평면 관계{" "}
                        <InlineMath math='\mathcal{V}_b = Fu'/>를 만들었다. diff-drive 라면:
                        <div className="overflow-x-auto">
                            <BlockMath math={`\\mathcal{V}_b = \\begin{bmatrix} \\omega_{bz} \\\\ v_{bx} \\\\ v_{by} \\end{bmatrix}
                            = \\underbrace{r\\begin{bmatrix} -1/2d & 1/2d \\\\ 1/2 & 1/2 \\\\ 0 & 0 \\end{bmatrix}}_{F}
                            \\begin{bmatrix} u_L \\\\ u_R \\end{bmatrix}`}/>
                        </div></li>
                    <li><strong>평면 → 공간.</strong> 평면 twist 는{" "}
                        <InlineMath math='\omega_x, \omega_y, v_z'/> 성분이 0 인 6차원 twist 이므로, 정확히 그
                        자리에 0 행을 끼워 넣는다:
                        <div className="overflow-x-auto">
                            <BlockMath math={`\\mathcal{V}_{b6} =
                            \\begin{bmatrix} \\omega_x \\\\ \\omega_y \\\\ \\omega_z \\\\ v_x \\\\ v_y \\\\ v_z \\end{bmatrix}
                            = \\underbrace{\\begin{bmatrix} 0_m \\\\ 0_m \\\\ F \\\\ 0_m \\end{bmatrix}}_{F_6}\\, u
                            \\qquad (0_m: \\text{폭 } m \\text{ 의 0 행})`}/>
                        </div></li>
                    <li><strong>차체 좌표계 → end-effector 좌표계.</strong> twist 의 좌표계는 두 좌표계 사이
                        변환의 adjoint 로 바꾼다. {"{e}"} 에서 {"{b}"} 로 가는 변환은{" "}
                        <InlineMath math='T_{eb} = (T_{b0}T_{0e}(\theta))^{-1} = T_{0e}^{-1}(\theta)\,T_{b0}^{-1}'/>이므로
                        <div className="overflow-x-auto">
                            <BlockMath math={`\\mathcal{V}_{e,\\mathrm{base}} = [\\mathrm{Ad}_{T_{eb}}]\\,\\mathcal{V}_{b6}
                            = \\underbrace{[\\mathrm{Ad}_{T_{0e}^{-1}(\\theta)T_{b0}^{-1}}]\\,F_6}_{J_{\\mathrm{base}}(\\theta)}\\, u`}/>
                        </div>
                        <InlineMath math='T_{eb}'/>에는 고정 오프셋 <InlineMath math='T_{b0}'/>와 팔의 정기구학{" "}
                        <InlineMath math='T_{0e}(\theta)'/>만 들어간다. 그래서 <InlineMath math='J_e'/>는{" "}
                        <InlineMath math='\theta'/>에는 의존해도 베이스가 어디 있는지에는 의존하지 않는다.</li>
                </ol>}
            />
            <T
                en={<p>
                    With the full Jacobian in hand, the task-space controller (11.16) or numerical IK from Chapter
                    6 drives wheels and joints together, and a weighted pseudoinverse can shift the burden between
                    base and arm. Forward kinematics, adjoints, Jacobians, feedback control, and wheeled bases: all
                    the tools built so far meet in this one equation.
                </p>}
                ko={<p>
                    전체 Jacobian 이 손에 들어오면 11장의 task-space 제어기 (11.16)나 6장의 수치 IK 로 바퀴와
                    관절을 한꺼번에 몰 수 있고, 가중 pseudoinverse 로 베이스와 팔의 부담을 조절할 수도 있다.
                    정기구학, adjoint, Jacobian, feedback 제어, 바퀴 베이스까지, 지금까지의 모든 도구가 이 식
                    하나에서 만난다.
                </p>}
            />
            <MobileManipulation/>
        </>
    );
};

export default Chapter13;
