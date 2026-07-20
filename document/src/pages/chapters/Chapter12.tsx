import {BlockMath, InlineMath} from "../../components/math/Tex";
import CorLabeler from "../../components/pages/chapter12/CorLabeler";
import ForceClosureTwoFinger from "../../components/pages/chapter12/ForceClosureTwoFinger";
import FormClosureLab from "../../components/pages/chapter12/FormClosureLab";
import FrictionConeIncline from "../../components/pages/chapter12/FrictionConeIncline";
import MeterStickTrick from "../../components/pages/chapter12/MeterStickTrick";
import SpanExplorer from "../../components/pages/chapter12/SpanExplorer";
import TwistConeExplorer from "../../components/pages/chapter12/TwistConeExplorer";
import {T} from "../../libs/i18n";

const Chapter12 = () => {
    return (
        <>
            <T en={<h2>Overview and Mathematical Preliminaries</h2>} ko={<h2>Overview and Mathematical Preliminaries</h2>}/>
            <T
                en={<p>
                    Until now the focus has been the robot itself. This chapter moves the spotlight to the{" "}
                    <strong>interaction between the robot and objects</strong>: grasping, pushing, rolling,
                    throwing, catching. In one phrase, <em>manipulation rather than the manipulator</em>. The robot
                    hand is assumed to execute its motion, force, hybrid, or impedance behavior perfectly (Chapter
                    11); everything interesting now happens at the contacts. Three ingredients are needed to
                    simulate, plan, or control a manipulation task:
                </p>}
                ko={<p>
                    지금까지는 로봇 자체의 kinematics, dynamics, 제어를 다뤘다. 이 챕터의 관심은{" "}
                    <strong>로봇과 물체 사이의 상호작용</strong>이다. 잡기, 밀기, 굴리기, 던지기, 받기처럼
                    물체를 움직이거나 붙잡는 모든 작업, 즉 <em>manipulator 가 아니라 manipulation</em> 이 주제다.
                    end-effector 는 11장의 방법으로 원하는 motion, force, hybrid, impedance 행동을 정확히
                    수행한다고 가정하고, 분석은 접촉면에서 일어나는 일에 집중한다. manipulation 과제를
                    시뮬레이션하고 계획하고 제어하려면 다음 세 가지가 필요하다:
                </p>}
            />
            <T
                en={<ul className="list-disc pl-6 space-y-1">
                    <li><strong>Contact kinematics</strong>: how rigid bodies can move relative to each other
                        without penetrating, and whether each contact rolls, slides, or breaks.</li>
                    <li><strong>Contact force models</strong>: which normal and friction forces a contact can
                        transmit.</li>
                    <li><strong>Rigid-body dynamics</strong> from Chapter 8, tying the two together.</li>
                </ul>}
                ko={<ul className="list-disc pl-6 space-y-1">
                    <li><strong>Contact kinematics</strong>: 강체들이 서로 뚫고 들어가지 않으면서 어떻게 움직일 수
                        있는지, 그리고 각 접촉이 구르는지(R), 미끄러지는지(S), 떨어지는지(B).</li>
                    <li><strong>접촉력 모델</strong>: 접촉이 어떤 수직력과 마찰력을 전달할 수 있는지.</li>
                    <li><strong>강체 dynamics</strong> (8장): 위 둘을 실제 운동으로 묶는다.</li>
                </ul>}
            />
            <T
                en={<p>
                    One linear-algebra toolbox gets used on every page of this chapter. For a set of vectors{" "}
                    <InlineMath math='A = \{a_1, \ldots, a_j\} \subset \mathbb{R}^n'/>:
                </p>}
                ko={<p>
                    시작하기 전에, 이 챕터 전체에서 쓰이는 선형대수 정의를 정리해 두자. 벡터 집합{" "}
                    <InlineMath math='A = \{a_1, \ldots, a_j\} \subset \mathbb{R}^n'/>에 대해:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math={`\\mathrm{span}(A) = \\Big\\{\\sum k_i a_i \\;\\Big|\\; k_i \\in \\mathbb{R}\\Big\\},
                \\quad
                \\mathrm{pos}(A) = \\Big\\{\\sum k_i a_i \\;\\Big|\\; k_i \\ge 0\\Big\\},
                \\quad
                \\mathrm{conv}(A) = \\Big\\{\\sum k_i a_i \\;\\Big|\\; k_i \\ge 0,\\; \\sum k_i = 1\\Big\\}`}/>
            </div>
            <T
                en={<p>
                    Clearly <InlineMath math='\mathrm{conv}(A) \subseteq \mathrm{pos}(A) \subseteq \mathrm{span}(A)'/>.
                    Two facts matter. <strong>Fact 1</strong>: <InlineMath math='\mathbb{R}^n'/> can be linearly
                    spanned by <InlineMath math='n'/> vectors but no fewer. <strong>Fact 2</strong>:{" "}
                    <InlineMath math='\mathbb{R}^n'/> can be <em>positively</em> spanned by{" "}
                    <InlineMath math='n+1'/> vectors but no fewer. Why <InlineMath math='n+1'/>? Given any{" "}
                    <InlineMath math='n'/> vectors, one can always find a direction <InlineMath math='c'/> with{" "}
                    <InlineMath math='a_i^{\mathrm T} c \le 0'/> for every <InlineMath math='i'/>, so no nonnegative
                    combination ever points along <InlineMath math='c'/>. But take an orthogonal basis{" "}
                    <InlineMath math='a_1, \ldots, a_n'/> and add{" "}
                    <InlineMath math='a_{n+1} = -\sum a_i'/>: now every direction is reachable. This little fact
                    will decide how many fingers a grasp needs.
                </p>}
                ko={<p>
                    당연히 <InlineMath math='\mathrm{conv}(A) \subseteq \mathrm{pos}(A) \subseteq \mathrm{span}(A)'/>다.
                    중요한 사실은 둘이다. <strong>사실 1</strong>: <InlineMath math='\mathbb{R}^n'/>을 span 하려면
                    벡터 <InlineMath math='n'/>개가 필요하고 그보다 적으면 안 된다. <strong>사실 2</strong>:{" "}
                    <em>positively</em> span 하려면 <InlineMath math='n+1'/>개가 필요하다. 왜{" "}
                    <InlineMath math='n+1'/>개일까? 벡터가 <InlineMath math='n'/>개뿐이면 모든{" "}
                    <InlineMath math='i'/>에 대해 <InlineMath math='a_i^{\mathrm T} c \le 0'/>인 방향{" "}
                    <InlineMath math='c'/>를 항상 찾을 수 있어서, 계수가 0 이상인 조합으로는{" "}
                    <InlineMath math='c'/> 쪽을 절대 만들 수 없다. 반면 직교 기저{" "}
                    <InlineMath math='a_1, \ldots, a_n'/>에 <InlineMath math='a_{n+1} = -\sum a_i'/>를 하나 더하면
                    모든 방향을 만들 수 있다. 뒤에서 보겠지만, 이 사실이 grasp 에 필요한 최소 접촉 개수를
                    결정한다.
                </p>}
            />
            <SpanExplorer/>

            <T en={<h2>Contact Kinematics</h2>} ko={<h2>Contact Kinematics</h2>}/>
            <T
                en={<p>
                    Let two rigid bodies have configurations <InlineMath math='q_1, q_2'/>, write{" "}
                    <InlineMath math='q = (q_1, q_2)'/>, and define a <strong>distance function</strong>{" "}
                    <InlineMath math='d(q)'/>: positive when separated, zero at touch, negative in penetration.
                    While <InlineMath math='d > 0'/> the bodies move freely. When{" "}
                    <InlineMath math='d = 0'/> the future of the contact is read off the time derivatives: if{" "}
                    <InlineMath math='\dot d > 0'/> the contact is breaking, if{" "}
                    <InlineMath math='\dot d < 0'/> it is penetrating (infeasible), and if{" "}
                    <InlineMath math='\dot d = 0'/> we look at <InlineMath math='\ddot d'/>, and so on. Contact is
                    maintained only when every derivative vanishes.
                </p>}
                ko={<p>
                    두 강체의 configuration 을 <InlineMath math='q_1, q_2'/>라 하고{" "}
                    <InlineMath math='q = (q_1, q_2)'/>로 묶은 뒤, <strong>거리 함수</strong>{" "}
                    <InlineMath math='d(q)'/>를 정의하자. 떨어져 있으면 양수, 닿으면 0, 뚫고 들어가면 음수다.{" "}
                    <InlineMath math='d > 0'/>인 동안은 자유롭게 움직인다. <InlineMath math='d = 0'/>이 되면
                    접촉의 미래는 시간 미분에서 읽는다. <InlineMath math='\dot d > 0'/>이면 떨어지는 중,{" "}
                    <InlineMath math='\dot d < 0'/>이면 관통(불가능), <InlineMath math='\dot d = 0'/>이면{" "}
                    <InlineMath math='\ddot d'/>를 보고, 그다음도 마찬가지다. 모든 미분이 0일 때만 접촉이
                    유지된다.
                </p>}
            />
            <T
                en={<p>
                    Differentiating, <InlineMath math='\dot d = \frac{\partial d}{\partial q}\dot q'/> and{" "}
                    <InlineMath math='\ddot d = \dot q^{\mathrm T}\frac{\partial^2 d}{\partial q^2}\dot q + \frac{\partial d}{\partial q}\ddot q'/>.
                    The gradient <InlineMath math='\partial d/\partial q'/> is the <strong>contact normal</strong>{" "}
                    information; the second derivative carries the <strong>curvature</strong> of the bodies at the
                    contact. In this chapter only the normal is assumed known, so the analysis stops at{" "}
                    <InlineMath math='\dot d'/>: a <strong>first-order analysis</strong>. Let's turn{" "}
                    <InlineMath math='\dot d \ge 0'/> into a usable formula, step by step:
                </p>}
                ko={<p>
                    미분하면 <InlineMath math='\dot d = \frac{\partial d}{\partial q}\dot q'/>,{" "}
                    <InlineMath math='\ddot d = \dot q^{\mathrm T}\frac{\partial^2 d}{\partial q^2}\dot q + \frac{\partial d}{\partial q}\ddot q'/>다.
                    기울기 <InlineMath math='\partial d/\partial q'/>가 <strong>접촉 normal</strong> 정보이고, 2차
                    미분은 접촉점에서 두 몸의 <strong>곡률</strong> 정보다. 이 챕터에서는 normal 만 안다고
                    가정하므로 분석을 <InlineMath math='\dot d'/>에서 끊는다. 그래서 <strong>1차(first-order)
                    분석</strong>이라 부른다. 이제 <InlineMath math='\dot d \ge 0'/>을 쓸 만한 식으로 단계별로
                    바꿔 보자:
                </p>}
            />
            <T
                en={<ol className="list-decimal pl-6 space-y-2">
                    <li>Let <InlineMath math='\hat n \in \mathbb{R}^3'/> be the unit contact normal, chosen to
                        point <em>into body A</em>, and let <InlineMath math='p_A, p_B'/> be the contact points on
                        each body (identical now, but their velocities differ). Then not penetrating means the
                        relative velocity along the normal is nonnegative:
                        <div className="overflow-x-auto">
                            <BlockMath math={`\\hat n^{\\mathrm T}(\\dot p_A - \\dot p_B) \\ge 0`}/>
                        </div></li>
                    <li>Write the point velocities with twists <InlineMath math='\mathcal{V}_A = (\omega_A, v_A)'/>,{" "}
                        <InlineMath math='\mathcal{V}_B'/> (all in the space frame):{" "}
                        <InlineMath math='\dot p_A = v_A + \omega_A \times p_A'/> and likewise for B.</li>
                    <li>Package the normal as the <strong>wrench of a unit normal force</strong>,{" "}
                        <InlineMath math='F = ([p_A]\hat n,\; \hat n) = (m, f)'/>. Substituting step 2 into step 1
                        and rearranging, all the terms collapse into a dot product of{" "}
                        <InlineMath math='F'/> with the relative twist:
                        <div className="overflow-x-auto">
                            <BlockMath math={`F^{\\mathrm T}(\\mathcal{V}_A - \\mathcal{V}_B) \\ge 0
                            \\qquad \\text{(impenetrability)}`}/>
                        </div>
                        No force argument was used; <InlineMath math='F'/> is just convenient bookkeeping that
                        will pay off when forces arrive in the next sections.</li>
                </ol>}
                ko={<ol className="list-decimal pl-6 space-y-2">
                    <li><InlineMath math='\hat n \in \mathbb{R}^3'/>을 단위 접촉 normal 로 잡되 <em>몸 A 안쪽으로</em>{" "}
                        향하게 하고, 각 몸의 접촉점을 <InlineMath math='p_A, p_B'/>라 하자 (지금은 같은 점이지만
                        속도는 다를 수 있다). 뚫고 들어가지 않는다는 것은 normal 방향 상대 속도가 0 이상이라는
                        뜻이다:
                        <div className="overflow-x-auto">
                            <BlockMath math={`\\hat n^{\\mathrm T}(\\dot p_A - \\dot p_B) \\ge 0`}/>
                        </div></li>
                    <li>점의 속도를 twist <InlineMath math='\mathcal{V}_A = (\omega_A, v_A)'/>,{" "}
                        <InlineMath math='\mathcal{V}_B'/>로 쓴다 (이 챕터의 twist·wrench 는 전부 space frame
                        기준이다): <InlineMath math='\dot p_A = v_A + \omega_A \times p_A'/>, B 도 마찬가지.</li>
                    <li>normal 을 <strong>단위 수직력의 wrench</strong>{" "}
                        <InlineMath math='F = ([p_A]\hat n,\; \hat n) = (m, f)'/>로 포장한다. 2단계를 1단계에
                        대입해 정리하면 모든 항이 <InlineMath math='F'/>와 상대 twist 의 내적 하나로 정리된다:
                        <div className="overflow-x-auto">
                            <BlockMath math={`F^{\\mathrm T}(\\mathcal{V}_A - \\mathcal{V}_B) \\ge 0
                            \\qquad \\text{(관통 금지)}`}/>
                        </div>
                        순수하게 kinematic 한 분석이라 힘은 아직 등장하지 않았지만, wrench 표기{" "}
                        <InlineMath math='F'/>를 미리 도입해 두면 다음 절에서 접촉력을 다룰 때 같은 식을 그대로
                        쓸 수 있다.</li>
                </ol>}
            />
            <T
                en={<p>
                    Equality holds exactly when the contact stays active. Twists with{" "}
                    <InlineMath math='F^{\mathrm T}(\mathcal{V}_A - \mathcal{V}_B) = 0'/> are{" "}
                    <strong>roll–slide motions</strong>, split further by whether the contact points move
                    together: <strong>rolling</strong> (label <InlineMath math='\mathsf{R}'/>, includes sticking)
                    when <InlineMath math='\dot p_A = \dot p_B'/>, <strong>sliding</strong> (label{" "}
                    <InlineMath math='\mathsf{S}'/>) otherwise, and <strong>breaking free</strong> (label{" "}
                    <InlineMath math='\mathsf{B}'/>) when the inequality is strict. With{" "}
                    <InlineMath math='n'/> contacts, each contact gets a label and the concatenation is the{" "}
                    <strong>contact mode</strong> of the system: up to <InlineMath math='3^n'/> candidate modes,
                    not all of them kinematically compatible.
                </p>}
                ko={<p>
                    등호가 성립할 때가 접촉이 유지되는 경우다.{" "}
                    <InlineMath math='F^{\mathrm T}(\mathcal{V}_A - \mathcal{V}_B) = 0'/>인 twist 를{" "}
                    <strong>roll–slide 운동</strong>이라 하고, 접촉점이 같이 움직이는지로 다시 나눈다.{" "}
                    <InlineMath math='\dot p_A = \dot p_B'/>면 <strong>구름</strong> (라벨{" "}
                    <InlineMath math='\mathsf{R}'/>, 서로 안 움직이는 sticking 포함), 아니면{" "}
                    <strong>미끄러짐</strong> (라벨 <InlineMath math='\mathsf{S}'/>), 부등호가 엄격하면{" "}
                    <strong>떨어짐</strong> (라벨 <InlineMath math='\mathsf{B}'/>)이다. 접촉이{" "}
                    <InlineMath math='n'/>개면 라벨을 이어 붙인 것이 시스템의 <strong>접촉 모드</strong>가 된다.
                    후보는 최대 <InlineMath math='3^n'/>개지만 전부 기하적으로 가능한 것은 아니다.
                </p>}
            />
            <T
                en={<p>
                    A worked example makes it concrete. Bodies touch at{" "}
                    <InlineMath math='p_A = (1, 2, 0)'/> with normal{" "}
                    <InlineMath math='\hat n = (0, 1, 0)'/> into A. Then{" "}
                    <InlineMath math='[p_A]\hat n = (0,0,1)\times'/> ... just compute:{" "}
                    <InlineMath math='p_A \times \hat n = (2\cdot 0 - 0\cdot 1,\; 0\cdot 0 - 1\cdot 0,\; 1\cdot 1 - 2\cdot 0) = (0, 0, 1)'/>,
                    so <InlineMath math='F = (0, 0, 1, 0, 1, 0)'/> and the constraint reads{" "}
                    <InlineMath math='\omega_{Az} - \omega_{Bz} + v_{Ay} - v_{By} \ge 0'/>: one inequality slicing
                    the twelve-dimensional twist space in half. If B is stationary and A is confined to the plane,
                    it collapses to <InlineMath math='\omega_{Az} + v_{Ay} \ge 0'/>, which you can draw. Each
                    stationary contact contributes one such homogeneous half-space{" "}
                    <InlineMath math='F_i^{\mathrm T}\mathcal{V}_A \ge 0'/>, and their intersection is a{" "}
                    <strong>polyhedral convex cone</strong> of feasible twists rooted at the origin. If moving
                    bodies provide the constraints, the half-spaces shift off the origin and the feasible set
                    becomes a general polytope.
                </p>}
                ko={<p>
                    구체적인 예제로 확인하자. 두 몸이 <InlineMath math='p_A = (1, 2, 0)'/>에서 닿아 있고 normal
                    은 A 안쪽으로 <InlineMath math='\hat n = (0, 1, 0)'/>이다.{" "}
                    <InlineMath math='p_A \times \hat n = (2\cdot 0 - 0\cdot 1,\; 0\cdot 0 - 1\cdot 0,\; 1\cdot 1 - 2\cdot 0) = (0, 0, 1)'/>이므로{" "}
                    <InlineMath math='F = (0, 0, 1, 0, 1, 0)'/>이고, 제약은{" "}
                    <InlineMath math='\omega_{Az} - \omega_{Bz} + v_{Ay} - v_{By} \ge 0'/>이 된다. 12차원 twist
                    공간을 반으로 가르는 부등식 하나다. B 가 고정이고 A 가 평면에 갇혀 있으면{" "}
                    <InlineMath math='\omega_{Az} + v_{Ay} \ge 0'/>으로 줄어서 그림으로 그릴 수 있다. 고정된
                    접촉 하나가 동차 반공간 <InlineMath math='F_i^{\mathrm T}\mathcal{V}_A \ge 0'/> 하나씩을
                    보태고, 그 교집합이 원점에 뿌리를 둔 <strong>polyhedral convex cone</strong>, 즉 허용 twist
                    의 원뿔이다. 움직이는 몸이 제약을 주면 반공간들이 원점에서 밀려나 일반적인 폴리토프가 된다.
                </p>}
            />
            <TwistConeExplorer/>
            <T
                en={<p>
                    Contacts other than a point on a face reduce to collections of point contacts: a
                    convex-vertex-in-concave-vertex contact acts like one point contact per adjacent face, a line
                    contact like its two endpoints, a plane contact like the corners of the contact patch. Purely
                    kinematic stand-ins for friction are also useful: a <strong>frictionless point contact</strong>{" "}
                    imposes only the impenetrability constraint; a <strong>point contact with friction</strong>{" "}
                    additionally imposes rolling (no slip); a <strong>soft contact</strong> further forbids spin
                    about the contact normal, modeling a deformable fingertip's contact patch.
                </p>}
                ko={<p>
                    면 위의 점 접촉이 아닌 다른 접촉도 결국 점 접촉 여러 개로 환원된다. 볼록 꼭짓점이 오목
                    꼭짓점에 닿으면 인접한 면마다 점 접촉 하나씩, 선 접촉은 양 끝점 둘, 면 접촉은 접촉 영역의
                    꼭짓점들로 대신한다. 힘을 명시적으로 다루지 않고 마찰을 흉내 내는 kinematic 모델도 세 가지
                    있다. <strong>마찰 없는 점 접촉</strong>은 관통 금지만 강제하고, <strong>마찰 있는 점
                    접촉</strong>은 거기에 구름(no slip)까지, <strong>soft contact</strong> 는 접촉 normal 축
                    둘레의 스핀까지 금지한다. 말랑한 손끝의 접촉면을 흉내 내는 것이다.
                </p>}
            />

            <T en={<h2>Planar Twists as Rotation Centers</h2>} ko={<h2>평면 twist 와 CoR</h2>}/>
            <T
                en={<p>
                    Planar problems admit a beautiful graphical shortcut. A planar twist{" "}
                    <InlineMath math='\mathcal{V} = (\omega_z, v_x, v_y)'/> is, up to speed, a pure rotation about
                    one point: the <strong>center of rotation (CoR)</strong>. To find it, ask which point{" "}
                    <InlineMath math='c'/> has zero velocity. The velocity of the point at{" "}
                    <InlineMath math='c'/> is <InlineMath math='(v_x - \omega_z c_y,\; v_y + \omega_z c_x)'/>;
                    setting both components to zero gives
                </p>}
                ko={<p>
                    평면 문제는 그림으로 풀 수 있다. 평면 twist{" "}
                    <InlineMath math='\mathcal{V} = (\omega_z, v_x, v_y)'/>는 속도 크기를 무시하면 결국 한 점을
                    중심으로 한 순수 회전이다. 그 점이 <strong>회전 중심 (CoR)</strong>이다. 찾으려면 속도가 0인
                    점 <InlineMath math='c'/>를 물으면 된다. 점 <InlineMath math='c'/>의 속도는{" "}
                    <InlineMath math='(v_x - \omega_z c_y,\; v_y + \omega_z c_x)'/>이고, 두 성분을 0으로 놓으면
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math={`\\mathrm{CoR} = \\Big(-\\frac{v_y}{\\omega_z},\\; \\frac{v_x}{\\omega_z}\\Big)`}/>
            </div>
            <T
                en={<p>
                    (<InlineMath math='\omega_z = 0'/> is a translation: a CoR at infinity.) Discarding speed, a
                    twist becomes a CoR marked '+' (counterclockwise), '−' (clockwise), or a translation direction.
                    The payoff: a homogeneous polyhedral twist cone, which lives in 3D and is hard to draw, becomes
                    a <strong>convex region of signed CoRs in the plane</strong>. Contact labels transfer too: for
                    a single stationary contact, CoRs on the contact normal line are '±', CoRs left of the inward
                    normal are '+', right of it are '−', and each CoR carries the label{" "}
                    <InlineMath math='\mathsf{B}'/>, <InlineMath math='\mathsf{S_l}'/>,{" "}
                    <InlineMath math='\mathsf{S_r}'/> (sliding left or right), or <InlineMath math='\mathsf{R}'/>{" "}
                    of the motion it generates. Multiple contacts just intersect their consistently labeled
                    regions.
                </p>}
                ko={<p>
                    (<InlineMath math='\omega_z = 0'/>이면 평행이동이고, CoR 가 무한대에 있는 경우다.) 속도
                    크기를 무시하면 twist 하나가 '+'(반시계), '−'(시계), 또는 평행이동 방향 하나로 표시된 CoR 가
                    된다. 이 표현의 장점은, 3차원이라 그리기 어려운 동차 twist cone 이{" "}
                    <strong>평면 위 부호 달린 CoR 들의 볼록 영역</strong>으로 바뀐다. 접촉 라벨도 함께 옮겨진다.
                    고정 접촉 하나에 대해 normal 선 위의 CoR 는 '±', 안쪽 normal 의 왼쪽은 '+', 오른쪽은 '−'이고,
                    각 CoR 에는 그 회전이 만들어 내는 접촉 라벨 <InlineMath math='\mathsf{B}'/>,{" "}
                    <InlineMath math='\mathsf{S_l}'/>, <InlineMath math='\mathsf{S_r}'/> (왼쪽/오른쪽으로
                    미끄러짐), <InlineMath math='\mathsf{R}'/> 이 붙는다. 접촉이 여러 개면 일관되게 라벨이 붙는
                    영역만 남기고 지우면 된다.
                </p>}
            />
            <CorLabeler/>
            <T
                en={<p>
                    A caution that runs through this whole chapter: the first-order analysis is blind to curvature.
                    Some motions it calls roll–slide are actually blocked (or freed) once second-order geometry is
                    considered; a body first-order analysis says can rotate may in fact be immobilized by curved
                    contacts. The rules of thumb: breaking and penetrating verdicts are always right; a first-order
                    roll–slide verdict can be overturned by higher-order analysis; and form closure by first-order
                    analysis is form closure, period.
                </p>}
                ko={<p>
                    챕터 전체에 적용되는 주의사항이 하나 있다. 1차 분석은 곡률을 반영하지 못한다. 1차 분석이
                    roll–slide 로 판정한 운동이 곡률까지 고려하면 사실은 불가능하기도 하고, 1차 분석으로는 회전이
                    가능해 보이는 몸이 실제로는 곡면 접촉 때문에 고정되어 있기도 하다. 정리하면: 떨어짐(B)과
                    관통 판정은 어떤 차수의 분석에서도 뒤집히지 않는다. roll–slide 판정만 고차 분석에서 바뀔 수
                    있다. 따라서 1차 분석으로 form closure 라는 결론이 나면 그것은 확정이다.
                </p>}
            />

            <T en={<h2>Form Closure</h2>} ko={<h2>Form Closure</h2>}/>
            <T
                en={<p>
                    A body is in <strong>form closure</strong> when stationary contacts kinematically forbid every
                    motion: the feasible twist cone is the single point <InlineMath math='\mathcal{V} = 0'/>.
                    Equivalently, the contact wrenches must positively span the whole wrench space,
                </p>}
                ko={<p>
                    고정된 접촉들이 몸의 모든 운동을 기하만으로 막으면, 즉 허용 twist cone 이 점{" "}
                    <InlineMath math='\mathcal{V} = 0'/> 하나로 쪼그라들면 그 몸은 <strong>form closure</strong>{" "}
                    상태다. 같은 말을 wrench 쪽에서 하면, 접촉 wrench 들이 wrench 공간 전체를 positively span
                    해야 한다:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math={`\\mathrm{pos}(\\{F_1, \\ldots, F_j\\}) = \\mathbb{R}^n,
                \\qquad n = 3 \\;(\\text{planar}), \\quad n = 6 \\;(\\text{spatial})`}/>
            </div>
            <T
                en={<p>
                    Fact 2 from the toolbox now cashes out: positively spanning{" "}
                    <InlineMath math='\mathbb{R}^n'/> takes at least <InlineMath math='n+1'/> vectors, so{" "}
                    <strong>a planar body needs at least 4 contacts and a spatial body at least 7</strong> for
                    first-order form closure. Some bodies can never be form closed: a disk can always spin about
                    its center no matter how many fingers touch it. Such <em>exceptional</em> bodies include all
                    surfaces of revolution.
                </p>}
                ko={<p>
                    앞에서 정리한 사실 2가 여기서 쓰인다. <InlineMath math='\mathbb{R}^n'/>을 positively span
                    하려면 최소 <InlineMath math='n+1'/>개가 필요하므로, <strong>1차 form closure 에는 평면 몸이면
                    접촉 4개, 공간 몸이면 7개가 최소</strong>다. 접촉을 아무리 늘려도 form closure 가 불가능한
                    몸도 있다. 원판은 몇 개의 접촉으로 잡아도 중심 둘레로 돌 수 있다. 이런 몸을{" "}
                    <em>exceptional</em> 하다고 하며, 구나 타원면 같은 회전면이 모두 여기에 속한다.
                </p>}
            />
            <T
                en={<p>
                    Testing form closure is a small <strong>linear program</strong>. Stack the contact wrenches as
                    columns of <InlineMath math='F \in \mathbb{R}^{n \times j}'/>. If{" "}
                    <InlineMath math='\mathrm{rank}\,F < n'/> there is no closure. Otherwise closure is equivalent
                    to the existence of strictly positive weights with <InlineMath math='Fk = 0'/>:
                </p>}
                ko={<p>
                    form closure 판정은 작은 <strong>linear program</strong> 하나로 끝난다. 접촉 wrench 들을 행렬{" "}
                    <InlineMath math='F \in \mathbb{R}^{n \times j}'/>의 열로 쌓는다.{" "}
                    <InlineMath math='\mathrm{rank}\,F < n'/>이면 당연히 closure 가 아니다. rank 가 차면, closure 는{" "}
                    <InlineMath math='Fk = 0'/>을 만족하는 엄격히 양인 가중치의 존재와 같다:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math={`\\text{find } k \\;\\;\\text{minimizing } \\mathbf{1}^{\\mathrm T}k
                \\;\\;\\text{s.t. } Fk = 0,\\;\\; k_i \\ge 1`}/>
            </div>
            <T
                en={<p>
                    Why does <InlineMath math='k > 0'/> with <InlineMath math='Fk = 0'/> mean closure? Such a{" "}
                    <InlineMath math='k'/> says the wrenches balance each other with room to spare in every
                    coefficient, so tilting the combination slightly can produce any nearby wrench, and with full
                    rank that reaches all of <InlineMath math='\mathbb{R}^n'/>. The book's example: two fingers in
                    a rectangular hole touching four edges give
                </p>}
                ko={<p>
                    왜 <InlineMath math='k > 0'/>이고 <InlineMath math='Fk = 0'/>이면 closure 일까? 그런{" "}
                    <InlineMath math='k'/>가 있다는 것은 wrench 들이 모든 계수에 여유를 남긴 채 서로 균형을
                    이룬다는 뜻이라, 조합을 조금씩 기울이면 주변의 어떤 wrench 든 만들 수 있고, rank 가 차 있으면
                    그것이 <InlineMath math='\mathbb{R}^n'/> 전체에 닿는다. 예제로 확인하자. 사각 구멍에
                    손가락 두 개를 넣어 네 모서리에 대면
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math={`F = \\begin{bmatrix} 0 & 0 & -1 & 2 \\\\ -1 & 0 & 1 & 0 \\\\ 0 & -1 & 0 & 1 \\end{bmatrix}
                \\;\\Rightarrow\\; k = (2, 1, 2, 1) \\;\\text{solves } Fk = 0`}/>
            </div>
            <T
                en={<p>
                    so the grasp is form closure. Move the right finger to the bottom-right corner and the LP
                    becomes infeasible: the body can slide downward. Between two form-closure grasps, quality can
                    be compared by capping each contact force (<InlineMath math='f_i \le f_{i,\max}'/>), looking at
                    the convex set of net wrenches the contacts can produce, and scoring the grasp by the radius of
                    the largest wrench-space ball around the origin that fits inside (after converting moments to
                    forces with a characteristic length <InlineMath math='r'/>). Bigger ball, bigger guaranteed
                    disturbance resistance.
                </p>}
                ko={<p>
                    가 되어 form closure 다. 오른쪽 손가락을 구멍의 오른쪽 아래 구석으로 옮기면 LP 의 해가
                    존재하지 않고, 실제로 몸이 아래로 미끄러질 수 있다. form closure 인 두 grasp 의 품질은
                    다음처럼 비교한다. 접촉력마다 상한 <InlineMath math='f_i \le f_{i,\max}'/>을 두면 접촉들이
                    만들 수 있는 합성 wrench 가 볼록 집합을 이루는데, 원점을 중심으로 이 집합 안에 들어가는 가장
                    큰 공의 반지름을 품질 점수로 삼는다 (모멘트는 특성 길이 <InlineMath math='r'/>로 나눠 힘
                    단위로 맞춘다). 공이 클수록 어느 방향의 외란이든 그 크기까지는 확실히 버틴다는 뜻이다.
                </p>}
            />
            <FormClosureLab/>

            <T en={<h2>Friction and Wrench Cones</h2>} ko={<h2>마찰과 Wrench Cone</h2>}/>
            <T
                en={<p>
                    The <strong>Coulomb friction</strong> law is one inequality: the tangential force satisfies{" "}
                    <InlineMath math='f_t \le \mu f_n'/>, with friction coefficient <InlineMath math='\mu'/>{" "}
                    (typically 0.1 to 1). While sliding, <InlineMath math='f_t = \mu f_n'/> exactly, directed
                    opposite the slip. For a normal along <InlineMath math='\hat z'/>, the transmissible forces
                </p>}
                ko={<p>
                    <strong>Coulomb 마찰</strong> 법칙은 부등식 하나다. 접선력은{" "}
                    <InlineMath math='f_t \le \mu f_n'/>을 만족하고, 마찰 계수 <InlineMath math='\mu'/>는 보통
                    0.1에서 1 사이다. 미끄러지는 동안에는 정확히 <InlineMath math='f_t = \mu f_n'/>이고 방향은
                    미끄러짐의 반대다. normal 이 <InlineMath math='\hat z'/> 방향이면 전달 가능한 힘은
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math={`\\sqrt{f_x^2 + f_y^2} \\le \\mu f_z, \\qquad f_z \\ge 0`}/>
            </div>
            <T
                en={<p>
                    which is a <strong>friction cone</strong> with half-angle{" "}
                    <InlineMath math='\alpha = \tan^{-1}\mu'/>. For linear computations the circular cone is
                    approximated by a polyhedral cone (e.g., the positive span of{" "}
                    <InlineMath math='(\pm\mu, 0, 1)'/> and <InlineMath math='(0, \pm\mu, 1)'/>); an inscribed
                    approximation underestimates friction, which is the safe direction when you must guarantee a
                    grasp. Planar cones need no approximation: they are exactly the span of their two edges.
                </p>}
                ko={<p>
                    이고, 반각 <InlineMath math='\alpha = \tan^{-1}\mu'/>의 <strong>friction cone</strong> 이다.
                    선형 계산에 넣으려면 원뿔을 다면체 뿔로 근사한다 (예:{" "}
                    <InlineMath math='(\pm\mu, 0, 1)'/>, <InlineMath math='(0, \pm\mu, 1)'/> 네 모서리의 positive
                    span). 내접 근사는 마찰을 과소평가하는데, grasp 를 보장해야 하는 입장에서는 그쪽이 안전한
                    방향이다. 평면 cone 은 근사가 필요 없다. 모서리 두 개의 span 그 자체다.
                </p>}
            />
            <FrictionConeIncline/>
            <T
                en={<p>
                    A contact force <InlineMath math='f'/> at point <InlineMath math='p'/> becomes the wrench{" "}
                    <InlineMath math='F = ([p]f, f)'/>, so a friction cone becomes a <strong>wrench cone</strong>,
                    and several contacts give the <strong>composite wrench cone</strong>{" "}
                    <InlineMath math='\mathrm{pos}(\{WC_i\})'/>: everything the contacts can do to the body. Planar
                    wrenches have a lovely graphical calculus. A wrench with nonzero force is an arrow in the
                    plane along its line of action (sliding the arrow along the line changes nothing); two
                    wrenches sum by sliding both arrows to their intersection and adding as vectors. And a{" "}
                    <em>cone</em> of wrenches is drawn with <strong>moment labels</strong>: mark every point of the
                    plane '+' if all basis wrenches make nonnegative moment about it, '−' if all make nonpositive
                    moment, '±' on the lines themselves, blank otherwise. The consistently labeled region encodes
                    the cone exactly, dual to the CoR picture for twists.
                </p>}
                ko={<p>
                    접촉점 <InlineMath math='p'/>의 힘 <InlineMath math='f'/>는 wrench{" "}
                    <InlineMath math='F = ([p]f, f)'/>가 되므로 friction cone 은 <strong>wrench cone</strong> 이
                    되고, 접촉이 여럿이면 <strong>composite wrench cone</strong>{" "}
                    <InlineMath math='\mathrm{pos}(\{WC_i\})'/>, 즉 접촉들이 몸에 가할 수 있는 모든 것의 집합이
                    된다. 평면 wrench 는 그림으로 계산할 수 있다. 힘 성분이 있는 wrench 는 작용선을 따라 놓인
                    화살표 하나다 (작용선 위에서 화살표를 밀어도 같은 wrench 다). 두 wrench 의 합은 두 화살표를
                    작용선의 교점까지 밀고 가서 벡터로 더하면 된다. wrench 의 <em>cone</em> 은{" "}
                    <strong>moment labeling</strong> 으로 그린다. 모든 기저 wrench 가 그 점에 대해 0 이상의
                    모멘트를 만들면 '+', 0 이하면 '−', 작용선 위면 '±', 엇갈리면 빈칸. 일관되게 라벨이 남은
                    영역이 cone 을 정확히 표현한다. twist 를 CoR 로 그리는 것과 쌍대인 방법이다.
                </p>}
            />

            <T en={<h2>Force Closure</h2>} ko={<h2>Force Closure</h2>}/>
            <T
                en={<p>
                    Contacts achieve <strong>force closure</strong> when their composite wrench cone is the entire
                    wrench space: any external wrench can be balanced. The test recycles the form-closure LP with
                    the friction cone <em>edges</em> as the columns of <InlineMath math='F'/> (two per contact in
                    the plane, three or more per contact in space after polyhedral approximation). With{" "}
                    <InlineMath math='\mu = 0'/> force closure degenerates to form closure. The counts drop
                    dramatically: in the plane, <strong>two</strong> frictional contacts can suffice, and they do
                    exactly when the contacts can <em>see each other along a line of sight inside both friction
                    cones</em>. In space, <strong>three</strong> frictional contacts suffice, by a clean theorem:
                </p>}
                ko={<p>
                    접촉들의 composite wrench cone 이 wrench 공간 전체가 되면, 즉 어떤 외란 wrench 든 접촉력으로
                    받아칠 수 있으면 <strong>force closure</strong> 다. 판정은 form closure 의 LP 를 재활용하되{" "}
                    <InlineMath math='F'/>의 열에 friction cone 의 <em>모서리들</em>을 넣는다 (평면은 접촉당 2개,
                    공간은 다면체 근사 후 3개 이상). <InlineMath math='\mu = 0'/>이면 force closure 는 form
                    closure 로 퇴화한다. 필요한 접촉 수는 확 줄어든다. 평면에서는 마찰 접촉 <strong>둘</strong>이면
                    될 수 있는데, 정확히 <em>두 접촉이 서로의 friction cone 안으로 마주 보일 때</em>다. 공간에서는{" "}
                    <strong>셋</strong>이면 되고, 깔끔한 정리가 있다:
                </p>}
            />
            <T
                en={<p>
                    <strong>Theorem.</strong> A spatial body held by three frictional point contacts is in force
                    closure if and only if each friction cone intersects the plane <InlineMath math='S'/> of the
                    three contacts in a planar cone, and <InlineMath math='S'/> is in planar force closure. The
                    proof sketch, in steps:
                </p>}
                ko={<p>
                    <strong>정리.</strong> 마찰 점 접촉 세 개로 잡은 공간 몸이 force closure 일 필요충분조건은, 세
                    접촉이 만드는 평면 <InlineMath math='S'/>에 대해 각 friction cone 이{" "}
                    <InlineMath math='S'/>와 평면 cone 으로 만나고, <InlineMath math='S'/> 자체가 평면 force
                    closure 인 것이다. 증명의 뼈대를 단계로 보면:
                </p>}
            />
            <T
                en={<ol className="list-decimal pl-6 space-y-2">
                    <li><em>Necessity</em> is quick: a slice of a force-closed body is force closed, and if some
                        cone met <InlineMath math='S'/> in only a line or point, moments about the line through
                        the other two contacts could not be resisted.</li>
                    <li><em>Sufficiency</em>: split every force and moment into components in{" "}
                        <InlineMath math='S'/> and along its normal <InlineMath math='N'/>. The balance equations
                        split into an <InlineMath math='S'/>-part and an <InlineMath math='N'/>-part.</li>
                    <li>The <InlineMath math='N'/>-part is three linear equations in the three normal components
                        of the contact forces; non-collinear contacts make it uniquely solvable, friction cones or
                        not.</li>
                    <li>The <InlineMath math='S'/>-part is solvable inside the planar cones because{" "}
                        <InlineMath math='S'/> is in planar force closure, and that same closure supplies{" "}
                        <strong>internal squeezing forces</strong> <InlineMath math='\eta_i'/> (which balance to
                        zero) that can be added as generously as needed to drag every total contact force back
                        inside its spatial friction cone. Squeeze hard enough and the tangential requirements
                        become a small perturbation.</li>
                </ol>}
                ko={<ol className="list-decimal pl-6 space-y-2">
                    <li><em>필요조건</em>은 쉽게 확인된다. force closure 인 몸의 단면도 force closure 여야 하고, 어떤
                        cone 이 <InlineMath math='S'/>와 선이나 점으로만 만난다면 나머지 두 접촉을 잇는 직선
                        둘레의 모멘트를 막을 수 없다.</li>
                    <li><em>충분조건</em>: 모든 힘과 모멘트를 <InlineMath math='S'/> 성분과 normal{" "}
                        <InlineMath math='N'/> 성분으로 쪼갠다. 균형 방정식도{" "}
                        <InlineMath math='S'/> 쪽과 <InlineMath math='N'/> 쪽으로 갈라진다.</li>
                    <li><InlineMath math='N'/> 쪽은 세 접촉력의 normal 성분에 대한 선형 방정식 3개다. 세 접촉이
                        한 직선 위에 있지 않으므로 항상 유일하게 풀리고, cone 제약과도 무관하다.</li>
                    <li><InlineMath math='S'/> 쪽은 <InlineMath math='S'/>가 평면 force closure 라서 평면 cone
                        안에서 풀리고, 같은 closure 가 합이 0인 <strong>내부 조임힘</strong>{" "}
                        <InlineMath math='\eta_i'/>도 준다. 이 조임힘을 넉넉히 더하면 각 접촉의 총 힘을 공간
                        friction cone 안으로 끌어들일 수 있다. 세게 쥘수록 접선 방향 성분이 상대적으로 작아지기
                        때문이다.</li>
                </ol>}
            />
            <ForceClosureTwoFinger/>
            <T
                en={<p>
                    Two caveats close the section. Force closure says the cones <em>can</em> generate any wrench,
                    not that the hand's motors will: a triangle held in force closure can still fall if the
                    fingers cannot squeeze hard enough. And since measured friction coefficients scatter, a
                    sensible grasp quality is simply the smallest <InlineMath math='\mu'/> for which the grasp
                    would still be force closure. Finally, a tidy <strong>duality</strong>: at any contact, the
                    number of motion equality constraints equals the number of wrench freedoms.{" "}
                    <InlineMath math='\mathsf{B}'/> constrains no motion and transmits no force;{" "}
                    <InlineMath math='\mathsf{S}'/> gives one motion constraint and one force freedom (the
                    magnitude on the sliding edge of the cone); <InlineMath math='\mathsf{R}'/> gives full motion
                    constraints and a full cone of force freedoms.
                </p>}
                ko={<p>
                    두 가지를 주의해야 한다. 첫째, force closure 는 cone 들이 어떤 wrench 든 만들{" "}
                    <em>수 있다</em>는 뜻이지, 손의 구동기가 실제로 그 힘을 낸다는 보장이 아니다. force closure 로
                    잡은 삼각형도 손가락이 충분히 조이지 못하면 떨어진다. 둘째, 마찰 계수는 측정할 때마다 값이
                    달라지므로, grasp 품질로는 "이 grasp 가 force closure 를 유지하는 최소{" "}
                    <InlineMath math='\mu'/>"를 쓰는 것이 합리적이다. 마지막으로 운동과 힘 사이의{" "}
                    <strong>쌍대성</strong>이 성립한다. 어느 접촉에서든 운동 등식 제약의 개수와 wrench 자유도의
                    개수가 같다. <InlineMath math='\mathsf{B}'/>는 운동을 제약하지 않는 대신 힘도 전달하지 못한다.{" "}
                    <InlineMath math='\mathsf{S}'/>는 운동 제약 1개에 힘 자유도 1개 (미끄러짐 반대쪽 cone
                    모서리에서 크기만 자유롭다). <InlineMath math='\mathsf{R}'/>은 운동을 전부 제약하는 대신 cone
                    내부의 모든 힘이 허용된다.
                </p>}
            />

            <T en={<h2>Manipulation</h2>} ko={<h2>Manipulation</h2>}/>
            <T
                en={<p>
                    Grasping is only one trick. Carrying a tray of glasses, pivoting a refrigerator, pushing a
                    sofa, the goal is to choose robot motions or forces so that the <em>object</em> does what we
                    want. The recipe couples everything so far with dynamics. For a single rigid body with twist{" "}
                    <InlineMath math='\mathcal{V}'/> and spatial inertia <InlineMath math='\mathcal{G}'/>:
                </p>}
                ko={<p>
                    manipulation 에서 잡기는 한 가지 방법일 뿐이다. 유리잔이 놓인 쟁반 나르기, 냉장고를 한쪽
                    모서리로 세워 돌리기, 소파 밀기처럼 잡지 않고 다루는 작업도 많다. 목표는{" "}
                    <em>물체</em>가 원하는 대로 움직이도록 로봇의 운동이나 힘을 고르는 것이고, 그러려면 지금까지의
                    접촉 kinematics 와 마찰 모델을 강체 dynamics 와 결합해야 한다. twist{" "}
                    <InlineMath math='\mathcal{V}'/>, 공간 관성 <InlineMath math='\mathcal{G}'/>인 강체 하나에
                    대해:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math={`F_{\\mathrm{ext}} + \\sum k_i F_i = \\mathcal{G}\\dot{\\mathcal{V}} - [\\mathrm{ad}_{\\mathcal{V}}]^{\\mathrm T}\\mathcal{G}\\mathcal{V},
                \\qquad k_i \\ge 0, \\; F_i \\in WC_i`}/>
            </div>
            <T
                en={<p>
                    The solution method is a <strong>case analysis over contact modes</strong>: enumerate the
                    plausible label assignments (R/S/B per contact), and for each, check whether some contact
                    wrench inside the cones and some acceleration consistent with the mode's kinematic constraints
                    satisfy the equation. Rigid bodies plus Coulomb friction pay a strange tax here: problems can
                    be <em>ambiguous</em> (several consistent modes) or <em>inconsistent</em> (none), yet for most
                    practical problems exactly one mode survives. When motions are slow, inertial terms drop and
                    the quasistatic balance <InlineMath math='F_{\mathrm{ext}} + \sum k_i F_i = 0'/> is enough.
                    Four classics show the method at work.
                </p>}
                ko={<p>
                    푸는 방법은 <strong>접촉 모드에 대한 경우의 수 분석</strong>이다. 가능한 라벨 조합(접촉마다
                    R/S/B)을 나열하고, 각 모드에 대해 cone 안의 접촉 wrench 와 그 모드의 kinematic 제약에 맞는
                    가속도가 방정식을 만족할 수 있는지 확인한다. 강체와 Coulomb 마찰이라는 이상화의 대가가 여기서
                    드러나는데, 해가 여러 개인 <em>ambiguous</em> 문제도, 하나도 없는 <em>inconsistent</em>{" "}
                    문제도 실제로 만들 수 있다. 다행히 실용적인 문제 대부분에서는 모드가 정확히 하나 남는다.
                    움직임이 충분히 느리면 관성항을 무시하고 준정적 균형{" "}
                    <InlineMath math='F_{\mathrm{ext}} + \sum k_i F_i = 0'/>만 보면 된다. 대표적인 네 예제로
                    확인하자.
                </p>}
            />
            <T
                en={<p>
                    <strong>Dynamic grasp.</strong> A block rests on two fingers, the lower with{" "}
                    <InlineMath math='\mu = 1'/>, the upper frictionless. Stationary fingers cannot hold it: the
                    wrench needed to balance gravity lies outside the composite cone (moment labels show it
                    instantly). But accelerate both fingers leftward at <InlineMath math='a_x'/> and demand the
                    mode RR (block riding along): the fingers must apply{" "}
                    <InlineMath math='(0, ma_x, 0) - (0, 0, -mg)'/>. Writing the three cone-edge wrenches{" "}
                    <InlineMath math='F_1, F_2, F_3'/> and solving{" "}
                    <InlineMath math='k_1F_1 + k_2F_2 + k_3F_3 + (0,0,-mg) = (0, ma_x, 0)'/> gives three equations
                    in three unknowns; nonnegativity of all <InlineMath math='k_i'/> holds exactly for{" "}
                    <InlineMath math='-5g \le a_x \le -g'/>. Inside that window the block is carried by inertia
                    alone: a <strong>dynamic grasp</strong>, no closure of any kind.
                </p>}
                ko={<p>
                    <strong>Dynamic grasp.</strong> 블록이 손가락 두 개 위에 얹혀 있고, 아래 손가락은{" "}
                    <InlineMath math='\mu = 1'/>, 위 손가락은 마찰이 없다. 손가락이 가만히 있으면 블록을 못
                    잡는다. 중력과 균형을 이룰 wrench 가 composite cone 밖에 있기 때문이다 (moment label 로 보면
                    한눈에 보인다). 그런데 두 손가락을 왼쪽으로 <InlineMath math='a_x'/>로 가속하면서 모드 RR
                    (블록이 얹힌 채 같이 감)을 요구하면, 손가락이 내야 할 wrench 는{" "}
                    <InlineMath math='(0, ma_x, 0) - (0, 0, -mg)'/>다. cone 모서리 wrench{" "}
                    <InlineMath math='F_1, F_2, F_3'/>를 쓰고{" "}
                    <InlineMath math='k_1F_1 + k_2F_2 + k_3F_3 + (0,0,-mg) = (0, ma_x, 0)'/>을 풀면 미지수 3개에
                    방정식 3개. 모든 <InlineMath math='k_i \ge 0'/>이 성립하는 구간이 정확히{" "}
                    <InlineMath math='-5g \le a_x \le -g'/>다. 이 범위 안에서는 관성력이 블록을 손가락에 눌러
                    주어 블록이 그대로 실려 간다. 어떤 closure 도 아니지만 잡은 것과 같은 상태, 즉{" "}
                    <strong>dynamic grasp</strong> 다.
                </p>}
            />
            <T
                en={<p>
                    <strong>The meter-stick trick.</strong> Support a stick on two fingers and slide the right
                    finger inward. Quasistatics picks the contact mode: the normal forces satisfy a lever balance,
                    so the finger farther from the center of mass carries less load, its friction budget{" "}
                    <InlineMath math='\mu N'/> is smaller, and <em>it</em> slips while the heavily loaded finger
                    sticks. The center of mass therefore always stays between the fingers, and they meet exactly
                    beneath it. Move fast and the quasistatic assumption breaks, and the stick can fall.
                </p>}
                ko={<p>
                    <strong>자 마술.</strong> 자를 두 손가락에 얹고 오른손가락을 안쪽으로 민다. 어느 접촉이
                    미끄러질지는 준정적 분석이 정해 준다. 수직력은 지렛대 균형을 따르므로 무게중심에서 먼
                    손가락에 무게가 덜 실리고, 마찰 한계 <InlineMath math='\mu N'/>도 그만큼 작다. 그래서{" "}
                    <em>그쪽</em>이 미끄러지고 무겁게 눌린 쪽은 붙는다. 결과적으로 무게중심은 두 손가락 사이를
                    절대 벗어나지 못하고, 손가락들은 정확히 무게중심 밑에서 만난다. 손가락을 빨리 움직이면 준정적
                    가정이 깨지고, 그때는 자가 떨어질 수 있다.
                </p>}
            />
            <MeterStickTrick/>
            <T
                en={<p>
                    <strong>Stability of an assembly.</strong> Is a three-stone arch stable? Graphical methods
                    choke on multiple bodies; instead, assume the all-rolling mode (every contact R) and ask the
                    algebra: do there exist <InlineMath math='k_i \ge 0'/> on all sixteen friction-cone edges
                    satisfying the three wrench-balance equations per stone, with interaction wrenches equal and
                    opposite between touching stones? That is a linear feasibility problem, solvable by linear
                    programming.
                </p>}
                ko={<p>
                    <strong>조립체의 안정성.</strong> 돌 세 개짜리 아치는 서 있을 수 있을까? 움직일 수 있는 몸이
                    여러 개면 그림 방법을 쓰기 어렵다. 대신 모든 접촉을 R 로 두고 대수적으로 확인한다. 돌마다 wrench
                    균형식 3개씩, 맞닿은 돌 사이의 상호작용 wrench 는 크기가 같고 방향이 반대라는 조건 아래, 16개
                    friction cone 모서리의 계수 <InlineMath math='k_i \ge 0'/>가 존재하는가? 이것은 선형 가능성
                    문제이고 linear programming 으로 풀린다.
                </p>}
            />
            <T
                en={<p>
                    <strong>Peg insertion.</strong> A force-controlled peg sits in two-point contact with its hole.
                    If the commanded wrench falls inside the composite cone of the contacts, the hole can balance
                    it: the peg <strong>jams</strong>. A wrench outside the cone keeps the insertion moving. And if
                    the two friction cones see each other (force closure), the contacts may resist{" "}
                    <em>any</em> wrench depending on the internal force: the peg is <strong>wedged</strong>. Good
                    insertion strategies are wrench choices that stay outside the jamming cone.
                </p>}
                ko={<p>
                    <strong>Peg 삽입.</strong> 힘 제어되는 peg 가 구멍과 두 점에서 닿아 있다. 명령한 wrench 가
                    접촉들의 composite cone 안에 들어가면 구멍이 그 wrench 를 받아칠 수 있고, peg 는 그 자리에
                    낀다 (<strong>jamming</strong>). cone 밖의 wrench 를 명령하면 삽입이 계속 진행된다. 나아가 두
                    friction cone 이 서로 보이면 (force closure) 내부력에 따라 접촉이 <em>어떤</em> wrench 든 버틸
                    수 있는데, 이때 peg 는 <strong>wedged</strong> 상태다. 좋은 삽입 전략이란 jamming cone 밖에
                    머무는 wrench 선택이다.
                </p>}
            />
        </>
    );
};

export default Chapter12;
