import {BlockMath, InlineMath} from "../../components/math/Tex";
import AnalyticIK2R from "../../components/pages/chapter6/AnalyticIK2R";
import BasinOfAttraction from "../../components/pages/chapter6/BasinOfAttraction";
import NewtonRaphsonIK from "../../components/pages/chapter6/NewtonRaphsonIK";
import {Puma3D, Stanford3D} from "../../components/pages/chapter6/PumaStanford3D";
import RedundantIKFamily from "../../components/pages/chapter6/RedundantIKFamily";
import {T} from "../../libs/i18n";

const Chapter6 = () => {
    return (
        <>
            <T en={<h2>Inverse Kinematics</h2>} ko={<h2>Inverse Kinematics</h2>}/>
            <T
                en={<p>
                    <strong>Definition</strong> : for an open chain with forward kinematics{" "}
                    <InlineMath math='T(\theta)'/>, the inverse kinematics problem is: given a desired end-effector
                    configuration <InlineMath math='X \in SE(3)'/>, find the joint values <InlineMath math='\theta'/>{" "}
                    that satisfy <InlineMath math='T(\theta) = X'/>.
                </p>}
                ko={<p>
                    <strong>정의</strong> : Forward Kinematics가 <InlineMath math='T(\theta)'/> 인 Open Chain에 대해, Inverse Kinematics
                    문제는 다음과 같다. 원하는 end-effector configuration <InlineMath math='X \in SE(3)'/> 이 주어졌을 때,{" "}
                    <InlineMath math='T(\theta) = X'/> 를 만족하는 관절 값 <InlineMath math='\theta'/> 를 찾는 것이다.
                </p>}
            />
            <T
                en={<p>
                    Unlike forward kinematics, which has a single unique answer, inverse kinematics may have{" "}
                    <strong>no solution, a finite number, or infinitely many</strong>. Take the 2R arm reaching for a
                    point <InlineMath math='(x, y)'/>. Its reachable set, the <strong>workspace</strong>, is the
                    annulus between radii <InlineMath math='|L_1 - L_2|'/> and <InlineMath math='L_1 + L_2'/>. A target
                    outside the annulus has no solution; one on a boundary circle has exactly one; one strictly inside
                    has two, the "elbow-up" and "elbow-down" postures.
                </p>}
                ko={<p>
                    유일한 하나의 답을 갖는 Forward Kinematics와 달리, Inverse Kinematics는 <strong>해가 없거나, 유한 개이거나, 무한히
                    많을</strong> 수 있다. 점 <InlineMath math='(x, y)'/> 에 도달하려는 2R 팔을 보자. 그 도달 가능
                    집합, 즉 <strong>작업 공간</strong>은 반지름 <InlineMath math='|L_1 - L_2|'/> 와{" "}
                    <InlineMath math='L_1 + L_2'/> 사이의 환형 영역(annulus)이다. 환형 영역 바깥의 목표점은 해가
                    없고, 경계 원 위의 목표점은 정확히 하나의 해를, 내부에 엄격히 들어온 목표점은 두 개의 해,
                    즉 "elbow-up"과 "elbow-down" 자세를 갖는다.
                </p>}
            />
            <T
                en={<p>
                    And "infinitely many" is not exotic. Give the planar arm a third joint and ask only for the
                    tip position: three joints, two constraints, so one joint's worth of freedom is left over.
                    The arm below keeps its tip glued to the goal while the whole body sweeps through a
                    continuous family of solutions. An arm with more joints than the task needs is called{" "}
                    <strong>redundant</strong>:
                </p>}
                ko={<p>
                    그리고 "무한히 많다"는 드문 일이 아니다. 평면 팔에 관절을 하나 더 주고 tip 위치만 요구해
                    보자. 관절 셋에 제약이 둘이니 관절 하나만큼의 자유가 남는다. 아래 팔은 tip 을 목표에 붙인
                    채 몸 전체가 연속적인 해의 가족을 훑는다. task 가 필요로 하는 것보다 관절이 많은 팔을{" "}
                    <strong>redundant</strong> 팔이라 부른다:
                </p>}
            />
            <RedundantIKFamily/>

            <T en={<h2>Analytic Inverse Kinematics</h2>} ko={<h2>해석적 Inverse Kinematics</h2>}/>
            <T
                en={<p>
                    When the geometry is simple enough, the solution can be written in closed form. For the 2R
                    arm everything follows from the law of cosines,{" "}
                    <InlineMath math='c^2 = a^2 + b^2 - 2ab\cos C'/>, applied to the triangle formed by the two
                    links and the line from base to target. Three named angles appear (all marked in the figure
                    below): <InlineMath math='\gamma'/> is the bearing of the target measured from the x-axis,{" "}
                    <InlineMath math='\alpha'/> is the angle between that target line and link 1, and{" "}
                    <InlineMath math='\beta'/> is the interior angle at the elbow. With{" "}
                    <InlineMath math='r^2 = x^2 + y^2'/>,
                </p>}
                ko={<p>
                    기하 구조가 충분히 단순하면 해를 닫힌 형태로 적을 수 있다. 2R 팔에서는 모든 것이 코사인 법칙{" "}
                    <InlineMath math='c^2 = a^2 + b^2 - 2ab\cos C'/> 에서 나온다. 두 링크와 베이스에서 목표점까지의
                    선분이 이루는 삼각형에 적용하면 된다. 이름 붙은 각 셋이 등장한다(아래 그림에 모두 표시되어
                    있다). <InlineMath math='\gamma'/> 는 x축에서 잰 목표점의 방위각,{" "}
                    <InlineMath math='\alpha'/> 는 그 목표선과 링크 1 사이의 각,{" "}
                    <InlineMath math='\beta'/> 는 팔꿈치의 내부각이다.{" "}
                    <InlineMath math='r^2 = x^2 + y^2'/> 이라 하면,
                </p>}
            />
            <BlockMath math={`\\beta = \\cos^{-1}\\!\\frac{L_1^2 + L_2^2 - r^2}{2 L_1 L_2}, \\qquad \\alpha = \\cos^{-1}\\!\\frac{r^2 + L_1^2 - L_2^2}{2 L_1 r}, \\qquad \\gamma = \\operatorname{atan2}(y, x)`}/>
            <T
                en={<p>
                    which yield the two solutions
                </p>}
                ko={<p>
                    이로부터 두 개의 해가 나온다
                </p>}
            />
            <BlockMath math={`\\text{righty:}\\ \\theta_1 = \\gamma - \\alpha,\\ \\theta_2 = \\pi - \\beta \\qquad\\qquad \\text{lefty:}\\ \\theta_1 = \\gamma + \\alpha,\\ \\theta_2 = \\beta - \\pi`}/>
            <T
                en={<p>
                    The two-argument arctangent <InlineMath math='\operatorname{atan2}(y, x)'/> is essential here: it
                    returns the correct quadrant over <InlineMath math='(-\pi, \pi]'/>, unlike{" "}
                    <InlineMath math='\tan^{-1}(y/x)'/>. Drag the target below through the workspace and watch both
                    solutions track it; drag it outside the annulus and both disappear.
                </p>}
                ko={<p>
                    두 인자 아크탄젠트 <InlineMath math='\operatorname{atan2}(y, x)'/> 가 여기서 핵심이다. 이는{" "}
                    <InlineMath math='\tan^{-1}(y/x)'/> 와 달리 <InlineMath math='(-\pi, \pi]'/> 범위에서 올바른
                    사분면을 돌려준다. 아래 목표점을 작업 공간 안에서 드래그하며 두 해가 그것을 따라가는 것을 보라.
                    annulus 밖으로 끌면 두 해 모두 사라진다.
                </p>}
            />
            <AnalyticIK2R/>
            <T
                en={<p>
                    The same decoupling scales to six-dof arms of special design. For a <strong>PUMA-type</strong> 6R
                    arm the three wrist axes intersect at a point, the <em>wrist center</em>{" "}
                    <InlineMath math='p = (p_x, p_y, p_z)'/>, so the problem splits in two. Take in the
                    structure below first. The key feature is the three wrist axes meeting at one red point:
                </p>}
                ko={<p>
                    같은 분리 기법은 특수하게 설계된 6자유도 팔로 확장된다. <strong>PUMA 형</strong> 6R 팔은 손목 축
                    셋이 한 점, 곧 <em>손목 중심</em> <InlineMath math='p = (p_x, p_y, p_z)'/> 에서 교차하므로
                    문제가 둘로 나뉜다. 아래 구조 모식도에서 형태를 먼저 눈에 담아 두자. 핵심은 손목 세 축이
                    빨간 점 하나에서 만난다는 것이다:
                </p>}
            />
            <Puma3D/>
            <T
                en={<p>
                    The <strong>inverse-position</strong> subproblem places the wrist center with the first
                    three joints. Looking straight down the base axis,
                </p>}
                ko={<p>
                    <strong>역위치</strong> 부분 문제는 처음 세 관절로 손목 중심을 놓는 일이다. 베이스
                    축을 따라 내려다보면,
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math='\theta_1 = \operatorname{atan2}(p_y, p_x),
\qquad
\cos\theta_3 = \frac{p_x^2 + p_y^2 + p_z^2 - a_2^2 - a_3^2}{2a_2a_3} = D,
\qquad
\theta_3 = \operatorname{atan2}\big(\pm\sqrt{1 - D^2},\, D\big)'/>
            </div>
            <div className="overflow-x-auto">
                <BlockMath math='\theta_2 = \operatorname{atan2}\Big(p_z, \sqrt{p_x^2 + p_y^2}\Big)
- \operatorname{atan2}\big(a_3\sin\theta_3,\, a_2 + a_3\cos\theta_3\big)'/>
            </div>
            <T
                en={<p>
                    This is the planar 2R solution again, lifted into the vertical plane through the arm:{" "}
                    <InlineMath math='D'/> is the law of cosines, and the <InlineMath math='\pm'/> in{" "}
                    <InlineMath math='\theta_3'/> is elbow-up versus elbow-down. A base rotated by{" "}
                    <InlineMath math='\pi'/> gives a second <InlineMath math='\theta_1'/> (and a shoulder
                    offset <InlineMath math='d_1'/> shifts both by an{" "}
                    <InlineMath math='\operatorname{atan2}'/> correction), so a PUMA arm generally has{" "}
                    <strong>four</strong> inverse-position solutions. When{" "}
                    <InlineMath math='p_x = p_y = 0'/> the wrist center sits on the base axis, and{" "}
                    <InlineMath math='\theta_1'/> has infinitely many solutions: a singularity. The{" "}
                    <strong>inverse-orientation</strong> subproblem is then bookkeeping. With{" "}
                    <InlineMath math='\theta_1, \theta_2, \theta_3'/> known, move them to the other side,
                </p>}
                ko={<p>
                    이는 팔을 지나는 수직 평면 위의 2R 해를 그대로 들어 올린 것이다. <InlineMath math='D'/> 가
                    코사인 법칙이고, <InlineMath math='\theta_3'/> 의 <InlineMath math='\pm'/> 가
                    elbow-up/elbow-down 이다. 베이스를 <InlineMath math='\pi'/> 만큼 돌린 두 번째{" "}
                    <InlineMath math='\theta_1'/> 도 있으므로(어깨 offset <InlineMath math='d_1'/> 이 있으면 둘 다{" "}
                    <InlineMath math='\operatorname{atan2}'/> 보정이 붙는다), PUMA 팔의 역위치 해는 일반적으로{" "}
                    <strong>네 개</strong>다. <InlineMath math='p_x = p_y = 0'/> 이면 손목 중심이 베이스 축 위에
                    있어 <InlineMath math='\theta_1'/> 의 해가 무한히 많아진다. Singularity 다.{" "}
                    <strong>역방향</strong> 부분 문제는 그다음 장부 정리다.{" "}
                    <InlineMath math='\theta_1, \theta_2, \theta_3'/> 를 알았으니 반대쪽으로 넘기면,
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math='e^{[\mathcal{S}_4]\theta_4}e^{[\mathcal{S}_5]\theta_5}e^{[\mathcal{S}_6]\theta_6}
= e^{-[\mathcal{S}_3]\theta_3}e^{-[\mathcal{S}_2]\theta_2}e^{-[\mathcal{S}_1]\theta_1}XM^{-1}'/>
            </div>
            <T
                en={<p>
                    The right side is now a known rotation <InlineMath math='R'/>, and with wrist axes{" "}
                    <InlineMath math='\hat{\mathrm{z}}, \hat{\mathrm{y}}, \hat{\mathrm{x}}'/> the equation{" "}
                    <InlineMath math='\operatorname{Rot}(\hat{\mathrm{z}},\theta_4)\operatorname{Rot}(\hat{\mathrm{y}},\theta_5)\operatorname{Rot}(\hat{\mathrm{x}},\theta_6) = R'/>{" "}
                    is exactly the ZYX Euler-angle problem. A <strong>Stanford-type</strong> arm replaces the
                    elbow with a prismatic joint; the position solution becomes even simpler because the third
                    "angle" is a length:
                </p>}
                ko={<p>
                    우변은 이제 알려진 회전 <InlineMath math='R'/> 이고, 손목 축이{" "}
                    <InlineMath math='\hat{\mathrm{z}}, \hat{\mathrm{y}}, \hat{\mathrm{x}}'/> 이면{" "}
                    <InlineMath math='\operatorname{Rot}(\hat{\mathrm{z}},\theta_4)\operatorname{Rot}(\hat{\mathrm{y}},\theta_5)\operatorname{Rot}(\hat{\mathrm{x}},\theta_6) = R'/>{" "}
                    은 정확히 ZYX Euler 각 문제다. <strong>Stanford 형</strong> 팔은 팔꿈치를 prismatic 관절로
                    바꾼 것인데, 셋째 "각"이 길이가 되어 위치 해가 오히려 더 단순해진다:
                </p>}
            />
            <Stanford3D/>
            <div className="overflow-x-auto">
                <BlockMath math='\theta_1 = \operatorname{atan2}(p_y, p_x),
\qquad \theta_2 = \operatorname{atan2}(s, r),
\qquad \theta_3 = \sqrt{r^2 + s^2} - a_2'/>
            </div>
            <T
                en={<p>
                    with <InlineMath math='r^2 = p_x^2 + p_y^2'/> and <InlineMath math='s = p_z - d_1'/>; the
                    orientation subproblem is identical to the PUMA case.
                </p>}
                ko={<p>
                    여기서 <InlineMath math='r^2 = p_x^2 + p_y^2'/>, <InlineMath math='s = p_z - d_1'/> 이고,
                    방향 부분 문제는 PUMA 와 동일하다.
                </p>}
            />

            <T en={<h2>Numerical Inverse Kinematics</h2>} ko={<h2>수치적 Inverse Kinematics</h2>}/>
            <T
                en={<p>
                    Most robots have no closed-form solution. The <strong>Newton–Raphson</strong> method solves{" "}
                    <InlineMath math='x_d - f(\theta) = 0'/> iteratively, and its whole logic is one Taylor
                    expansion. Around a guess <InlineMath math='\theta^0'/> the forward kinematics is
                    approximately linear:
                </p>}
                ko={<p>
                    대부분의 로봇은 닫힌 형태의 해가 없다. <strong>Newton–Raphson</strong> 방법은{" "}
                    <InlineMath math='x_d - f(\theta) = 0'/> 을 반복적으로 푸는데, 그 논리 전체가 Taylor 전개
                    하나다. 추정 <InlineMath math='\theta^0'/> 주변에서 Forward Kinematics는 근사적으로
                    선형이다:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math='x_d = f(\theta_d) \approx f(\theta^0) + \underbrace{\frac{\partial f}{\partial \theta}(\theta^0)}_{J(\theta^0)}\underbrace{(\theta_d - \theta^0)}_{\Delta\theta}
\quad\Longrightarrow\quad J(\theta^0)\,\Delta\theta = x_d - f(\theta^0)'/>
            </div>
            <T
                en={<p>
                    Discard the higher-order terms and solve the linear equation for{" "}
                    <InlineMath math='\Delta\theta'/>:
                </p>}
                ko={<p>
                    고차항을 버리고 이 선형 방정식을 <InlineMath math='\Delta\theta'/> 에 대해 풀면:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math='\Delta\theta = J^{\dagger}(\theta^0)\big(x_d - f(\theta^0)\big)
\quad\Longrightarrow\quad \theta^1 = \theta^0 + \Delta\theta'/>
            </div>
            <T
                en={<p>
                    The corrected guess <InlineMath math='\theta^1'/> lands closer to the true root. Each
                    step therefore corrects the guess by
                </p>}
                ko={<p>
                    보정된 추정 <InlineMath math='\theta^1'/> 은 참 해에 더 가까워진다. 따라서 각 스텝은
                    추정을 다음과 같이 보정한다
                </p>}
            />
            <BlockMath math={`\\theta^{k+1} = \\theta^{k} + J^{\\dagger}(\\theta^{k})\\big(x_d - f(\\theta^{k})\\big)`}/>
            <T
                en={<p>
                    where <InlineMath math='J^{\dagger}'/> is the Moore–Penrose <strong>pseudoinverse</strong>, which
                    reduces to <InlineMath math='J^{-1}'/> when the Jacobian is square and nonsingular. When it is
                    not square, the pseudoinverse still gives the most sensible answer in each direction:
                </p>}
                ko={<p>
                    여기서 <InlineMath math='J^{\dagger}'/> 는 Moore–Penrose <strong>pseudoinverse</strong>로,
                    Jacobian이 정사각이고 비특이일 때는 <InlineMath math='J^{-1}'/> 로 귀착된다. 정사각이 아닐
                    때도 방향별로 가장 합리적인 답을 준다:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math='\begin{gathered}
J^{\dagger} = J^{\mathsf T}(JJ^{\mathsf T})^{-1} \;\;(n > m,\ \text{min-norm solution})\\[4pt]
J^{\dagger} = (J^{\mathsf T}J)^{-1}J^{\mathsf T} \;\;(n < m,\ \text{least-squares solution})
\end{gathered}'/>
            </div>
            <T
                en={<p>
                    Both formulas come from a short optimization argument.{" "}
                    <strong>Fat case</strong> (more joints than task coordinates,{" "}
                    <InlineMath math='n > m'/>): infinitely many <InlineMath math='y'/> satisfy{" "}
                    <InlineMath math='Jy = z'/>, so ask for the smallest one.
                </p>}
                ko={<p>
                    두 공식 모두 짧은 최적화 논증으로 나온다. <strong>가로로 긴 경우</strong> (관절이 task
                    좌표보다 많은 <InlineMath math='n > m'/>): <InlineMath math='Jy = z'/> 를 만족하는{" "}
                    <InlineMath math='y'/> 가 무한히 많으니, 그중 가장 작은 것을 요구한다.
                </p>}
            />
            <ol className="list-decimal pl-6 space-y-1">
                <li>
                    <T
                        en={<span>Minimize <InlineMath math='\tfrac{1}{2}\|y\|^2'/> subject to{" "}
                            <InlineMath math='Jy = z'/>, with a Lagrange multiplier{" "}
                            <InlineMath math='\lambda'/>:</span>}
                        ko={<span><InlineMath math='Jy = z'/> 를 조건으로{" "}
                            <InlineMath math='\tfrac{1}{2}\|y\|^2'/> 을 최소화한다. Lagrange 승수{" "}
                            <InlineMath math='\lambda'/> 를 붙이면:</span>}
                    />
                    <BlockMath math='L(y, \lambda) = \tfrac{1}{2}y^{\mathsf T}y - \lambda^{\mathsf T}(Jy - z)'/>
                </li>
                <li>
                    <T
                        en={<span>Set the derivative in <InlineMath math='y'/> to zero:</span>}
                        ko={<span><InlineMath math='y'/> 에 대한 미분을 0 으로 놓는다:</span>}
                    />
                    <BlockMath math='\frac{\partial L}{\partial y} = y - J^{\mathsf T}\lambda = 0
\;\Rightarrow\; y = J^{\mathsf T}\lambda'/>
                </li>
                <li>
                    <T
                        en={<span>Substitute into the constraint to find <InlineMath math='\lambda'/>:</span>}
                        ko={<span>제약식에 대입해 <InlineMath math='\lambda'/> 를 구한다:</span>}
                    />
                    <BlockMath math='z = Jy = (JJ^{\mathsf T})\lambda
\;\Rightarrow\; \lambda = (JJ^{\mathsf T})^{-1}z'/>
                </li>
                <li>
                    <T
                        en={<span>Back-substitute to get the min-norm solution:</span>}
                        ko={<span>다시 대입하면 min-norm 해가 나온다:</span>}
                    />
                    <BlockMath math='y^* = J^{\mathsf T}(JJ^{\mathsf T})^{-1}z
\;\Rightarrow\; J^{\dagger} = J^{\mathsf T}(JJ^{\mathsf T})^{-1}'/>
                </li>
                <li>
                    <T
                        en={<span>Why it is the smallest: any other solution is{" "}
                            <InlineMath math='y^* + n'/> with <InlineMath math='Jn = 0'/>, and{" "}
                            <InlineMath math='y^{*\mathsf T}n = \lambda^{\mathsf T}Jn = 0'/>, so by
                            Pythagoras:</span>}
                        ko={<span>왜 가장 작은가: 다른 해는 모두 <InlineMath math='Jn = 0'/> 인{" "}
                            <InlineMath math='n'/> 을 더한 <InlineMath math='y^* + n'/> 꼴이고,{" "}
                            <InlineMath math='y^{*\mathsf T}n = \lambda^{\mathsf T}Jn = 0'/> 이라
                            피타고라스로:</span>}
                    />
                    <BlockMath math='\|y^* + n\|^2 = \|y^*\|^2 + \|n\|^2 \;\ge\; \|y^*\|^2'/>
                </li>
            </ol>
            <T
                en={<p>
                    <strong>Tall case</strong> (<InlineMath math='n < m'/>): no exact solution exists, so
                    minimize the error instead.
                </p>}
                ko={<p>
                    <strong>세로로 긴 경우</strong> (<InlineMath math='n < m'/>): 정확한 해가 없으니 대신
                    오차를 최소화한다.
                </p>}
            />
            <ol className="list-decimal pl-6 space-y-1">
                <li>
                    <T
                        en={<span>Choose the error to minimize:</span>}
                        ko={<span>최소화할 오차를 잡는다:</span>}
                    />
                    <BlockMath math='E(y) = \|Jy - z\|^2'/>
                </li>
                <li>
                    <T
                        en={<span>Set the gradient to zero to get the normal equation:</span>}
                        ko={<span>gradient 를 0 으로 놓으면 normal equation 이 나온다:</span>}
                    />
                    <BlockMath math='\nabla E = 2J^{\mathsf T}Jy - 2J^{\mathsf T}z = 0
\;\Rightarrow\; J^{\mathsf T}Jy = J^{\mathsf T}z'/>
                </li>
                <li>
                    <T
                        en={<span>Solve to get the least-squares solution:</span>}
                        ko={<span>풀면 least-squares 해다:</span>}
                    />
                    <BlockMath math='y^* = (J^{\mathsf T}J)^{-1}J^{\mathsf T}z
\;\Rightarrow\; J^{\dagger} = (J^{\mathsf T}J)^{-1}J^{\mathsf T}'/>
                </li>
            </ol>
            <T
                en={<p>
                    Iteration continues until the error{" "}
                    <InlineMath math='\lVert x_d - f(\theta)\rVert'/> falls below a tolerance. Step
                    through the iteration below: the tip walks toward the goal, converging in a handful of
                    steps.
                </p>}
                ko={<p>
                    오차 <InlineMath math='\lVert x_d - f(\theta)\rVert'/> 가 허용치 아래로 떨어질 때까지
                    반복한다. 아래에서 한 스텝씩 진행해 보라. 끝점이 목표를 향해 걸어가며 몇 스텝 만에
                    수렴한다.
                </p>}
            />
            <NewtonRaphsonIK/>
            <T
                en={<p>
                    Which of the several IK solutions does the method find? Whichever one's{" "}
                    <em>basin of attraction</em> contains the initial guess. The map below makes that phrase
                    literal: every pixel is an initial guess <InlineMath math='(\theta_1, \theta_2)'/>, colored
                    by the solution Newton–Raphson reaches from there. Most guesses flow to the nearby
                    solution, but the boundary is intricate, and guesses near it (or near the gray singular
                    band at <InlineMath math='\theta_2 \approx 0'/>) can wander or fail. This is why real
                    controllers seed each IK call with the <em>previous timestep's</em> answer:
                </p>}
                ko={<p>
                    여러 IK 해 중 이 방법은 어느 것을 찾을까? 초기 추정이 속한 <em>basin of attraction</em> 의
                    해다. 아래 지도가 그 말을 문자 그대로 보여준다. 픽셀 하나하나가 초기 추정{" "}
                    <InlineMath math='(\theta_1, \theta_2)'/> 이고, 거기서 Newton–Raphson 이 도달한 해의 색으로
                    칠했다. 대부분의 추정은 가까운 해로 흘러가지만 경계는 복잡하게 얽혀 있고, 경계 근처나{" "}
                    <InlineMath math='\theta_2 \approx 0'/> 의 회색 특이 띠 근처의 추정은 헤매거나 실패한다.
                    실제 제어기가 매 IK 호출의 초기 추정으로 <em>직전 시각의 답</em>을 쓰는 이유가 이것이다:
                </p>}
            />
            <BasinOfAttraction/>
            <T
                en={<p>
                    To drive a full pose <InlineMath math='T_{sd} \in SE(3)'/> rather than a coordinate vector, the same
                    algorithm uses the body Jacobian <InlineMath math='J_b'/> and replaces the error with the body twist{" "}
                    <InlineMath math='[\mathcal{V}_b] = \log\!\big(T_{sb}^{-1}(\theta)\,T_{sd}\big)'/> that would carry
                    the current frame to the goal in unit time.
                </p>}
                ko={<p>
                    좌표 벡터가 아니라 완전한 자세 <InlineMath math='T_{sd} \in SE(3)'/> 를 구동하려면, 같은 알고리즘이
                    바디 Jacobian <InlineMath math='J_b'/> 를 쓰고 오차를 바디 twist{" "}
                    <InlineMath math='[\mathcal{V}_b] = \log\!\big(T_{sb}^{-1}(\theta)\,T_{sd}\big)'/> 로 대체한다. 이
                    twist는 현재 프레임을 단위 시간에 목표로 옮기는 twist이다.
                </p>}
            />

            <T en={<h2>Inverse Velocity Kinematics</h2>} ko={<h2>Inverse Velocity Kinematics</h2>}/>
            <T
                en={<p>
                    A related problem underlies trajectory following: given a desired end-effector twist{" "}
                    <InlineMath math='\mathcal{V}_d'/>, what joint velocities produce it? Inverting{" "}
                    <InlineMath math='J(\theta)\dot\theta = \mathcal{V}_d'/> with the pseudoinverse gives
                </p>}
                ko={<p>
                    이와 관련된 문제가 Trajectory 추종의 바탕에 깔려 있다. 원하는 end-effector twist{" "}
                    <InlineMath math='\mathcal{V}_d'/> 가 주어졌을 때, 어떤 관절 속도가 그것을 만들어내는가?{" "}
                    <InlineMath math='J(\theta)\dot\theta = \mathcal{V}_d'/> 를 pseudoinverse로 뒤집으면 다음을 얻는다
                </p>}
            />
            <BlockMath math={`\\dot\\theta = J^{\\dagger}(\\theta)\\,\\mathcal{V}_d`}/>
            <T
                en={<p>
                    For a redundant robot (<InlineMath math='n > 6'/>) this returns the minimum-norm joint velocity,
                    leaving an <InlineMath math='(n-6)'/>-dimensional family of internal motions free. But
                    treating all joint velocities as equally costly is a choice. A base joint hauls the whole
                    arm while a wrist joint moves almost nothing, so a better cost is the kinetic energy{" "}
                    <InlineMath math='\tfrac{1}{2}\dot\theta^{\mathsf T}M(\theta)\dot\theta'/> with{" "}
                    <InlineMath math='M(\theta)'/> the mass matrix of Chapter 8. Minimizing it subject to{" "}
                    <InlineMath math='J\dot\theta = \mathcal{V}_d'/> gives the <em>weighted</em> pseudoinverse:
                </p>}
                ko={<p>
                    Redundant 로봇(<InlineMath math='n > 6'/>)에서 이는 크기가 가장 작은 관절 속도를 돌려주며,{" "}
                    <InlineMath math='(n-6)'/> 차원의 내부 운동은 자유롭게 남는다. 그런데 모든 관절 속도를 같은
                    비용으로 치는 것도 하나의 선택일 뿐이다. 베이스 관절은 팔 전체를 끌고 다니고 손목 관절은 거의
                    아무것도 안 움직이니, 더 나은 비용은 8장의 mass matrix <InlineMath math='M(\theta)'/> 를 쓴
                    운동 에너지 <InlineMath math='\tfrac{1}{2}\dot\theta^{\mathsf T}M(\theta)\dot\theta'/> 다.{" "}
                    <InlineMath math='J\dot\theta = \mathcal{V}_d'/> 를 만족하며 이를 최소화하면{" "}
                    <em>가중</em> pseudoinverse가 나온다:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math='\dot\theta = M^{-1}J^{\mathsf T}\big(JM^{-1}J^{\mathsf T}\big)^{-1}\mathcal{V}_d'/>
            </div>
            <T
                en={<p>
                    A secondary objective can ride along too, like descending a potential{" "}
                    <InlineMath math='h(\theta)'/> (gravity, or an artificial obstacle-avoidance field) inside
                    the null space of <InlineMath math='J'/>. One caution for redundant arms: even if the
                    end-effector trajectory is a closed loop (<InlineMath math='T_{sd}(0) = T_{sd}(t_f)'/>),
                    these velocity-level schemes generally bring the <em>joints</em> back somewhere else
                    (<InlineMath math='\theta(0) \ne \theta(t_f)'/>). Repeating a cyclic task drifts through
                    joint space unless extra conditions enforce a closed loop there as well.
                </p>}
                ko={<p>
                    부차 목표도 함께 실을 수 있다. 예컨대 <InlineMath math='J'/> 의 null space 안에서 potential{" "}
                    <InlineMath math='h(\theta)'/> (중력, 또는 장애물 회피용 인공 potential)를 내려가게 하는
                    식이다. Redundant 팔에 대한 주의 하나: end-effector 궤적이 닫힌 고리여도
                    (<InlineMath math='T_{sd}(0) = T_{sd}(t_f)'/>), 이런 속도 수준의 방법은 일반적으로{" "}
                    <em>관절</em>을 다른 곳으로 데려다 놓는다(<InlineMath math='\theta(0) \ne \theta(t_f)'/>).
                    주기 작업을 반복하면 관절 공간에서는 계속 표류하므로, 관절 쪽 닫힘까지 원하면 추가 조건이
                    필요하다.
                </p>}
            />
        </>
    )
}

export default Chapter6
