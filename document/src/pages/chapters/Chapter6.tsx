import {BlockMath, InlineMath} from "../../components/math/Tex";
import AnalyticIK2R from "../../components/pages/chapter6/AnalyticIK2R";
import NewtonRaphsonIK from "../../components/pages/chapter6/NewtonRaphsonIK";
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
                    point <InlineMath math='(x, y)'/>. Its reachable set — the <strong>workspace</strong> — is the
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

            <T en={<h2>Analytic Inverse Kinematics</h2>} ko={<h2>해석적 Inverse Kinematics</h2>}/>
            <T
                en={<p>
                    When the geometry is simple enough, the solution can be written in closed form. For the 2R arm the
                    law of cosines gives the interior angles directly. With <InlineMath math='r^2 = x^2 + y^2'/>,
                </p>}
                ko={<p>
                    기하 구조가 충분히 단순하면 해를 닫힌 형태로 적을 수 있다. 2R 팔의 경우 코사인 법칙이 내부 각들을
                    바로 준다. <InlineMath math='r^2 = x^2 + y^2'/> 이라 하면,
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
                    환형 영역 밖으로 끌면 두 해 모두 사라진다.
                </p>}
            />
            <AnalyticIK2R/>
            <T
                en={<p>
                    The same decoupling scales to six-dof arms of special design. For a <strong>PUMA-type</strong> 6R
                    arm the wrist axes intersect at a point, so the problem splits into an <strong>inverse-position</strong>{" "}
                    subproblem for the first three joints (solved with the same planar-arm trigonometry, giving up to
                    four arm postures) and an <strong>inverse-orientation</strong> subproblem for the wrist, solved as a
                    set of ZYX Euler angles. A <strong>Stanford-type</strong> arm replaces the elbow with a prismatic
                    joint and is handled the same way.
                </p>}
                ko={<p>
                    같은 분리 기법은 특수하게 설계된 6자유도 팔로 확장된다. <strong>PUMA 형</strong> 6R 팔은 손목 축들이
                    한 점에서 교차하므로, 문제가 처음 세 관절에 대한 <strong>역위치</strong> 부분 문제(같은 평면 팔
                    삼각법으로 풀리며, 최대 네 가지 팔 자세를 준다)와 손목에 대한 <strong>역방향</strong> 부분 문제(ZYX
                    오일러 각 집합으로 풀린다)로 나뉜다. <strong>Stanford 형</strong> 팔은 팔꿈치를 직동 관절로 바꾼
                    것으로, 같은 방식으로 다룬다.
                </p>}
            />

            <T en={<h2>Numerical Inverse Kinematics</h2>} ko={<h2>수치적 Inverse Kinematics</h2>}/>
            <T
                en={<p>
                    Most robots have no closed-form solution. The <strong>Newton–Raphson</strong> method solves{" "}
                    <InlineMath math='x_d - f(\theta) = 0'/> iteratively. Expanding the forward kinematics to first
                    order about a guess <InlineMath math='\theta^0'/> gives{" "}
                    <InlineMath math='J(\theta^0)\,\Delta\theta = x_d - f(\theta^0)'/>, so each step corrects the guess
                    by
                </p>}
                ko={<p>
                    대부분의 로봇은 닫힌 형태의 해가 없다. <strong>뉴턴–랩슨</strong> 방법은{" "}
                    <InlineMath math='x_d - f(\theta) = 0'/> 을 반복적으로 푼다. 추정 <InlineMath math='\theta^0'/>{" "}
                    주변에서 Forward Kinematics를 1차까지 전개하면 <InlineMath math='J(\theta^0)\,\Delta\theta = x_d - f(\theta^0)'/>{" "}
                    가 되어, 각 스텝마다 추정을 다음과 같이 보정한다
                </p>}
            />
            <BlockMath math={`\\theta^{k+1} = \\theta^{k} + J^{\\dagger}(\\theta^{k})\\big(x_d - f(\\theta^{k})\\big)`}/>
            <T
                en={<p>
                    where <InlineMath math='J^{\dagger}'/> is the Moore–Penrose <strong>pseudoinverse</strong>, which
                    reduces to <InlineMath math='J^{-1}'/> when the Jacobian is square and nonsingular but still gives a
                    sensible least-squares (or minimum-norm) answer when the robot is redundant or near a singularity.
                    Iteration continues until the error <InlineMath math='\lVert x_d - f(\theta)\rVert'/> falls below a
                    tolerance. Step through the iteration below: the tip walks toward the goal, converging in a handful
                    of steps. Drag the goal to see the process restart — the method converges to whichever solution's{" "}
                    <em>basin of attraction</em> contains the initial guess.
                </p>}
                ko={<p>
                    여기서 <InlineMath math='J^{\dagger}'/> 는 무어–펜로즈 <strong>pseudoinverse</strong>로, Jacobian이
                    정사각이고 비특이일 때는 <InlineMath math='J^{-1}'/> 로 귀착되지만, 로봇이 여유 자유도를 갖거나
                    Singularity 근처일 때도 합리적인 최소제곱(또는 최소노름) 답을 준다. 오차{" "}
                    <InlineMath math='\lVert x_d - f(\theta)\rVert'/> 가 허용 오차 아래로 떨어질 때까지 반복이
                    계속된다. 아래에서 반복을 한 스텝씩 진행해 보라. 끝점이 목표점을 향해 걸어가며 몇 스텝 만에
                    수렴한다. 목표점을 드래그하면 과정이 다시 시작된다. 이 방법은 초기 추정이 속한{" "}
                    <em>끌개 영역(basin of attraction)</em>에 해당하는 해로 수렴한다.
                </p>}
            />
            <NewtonRaphsonIK/>
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
                    leaving an <InlineMath math='(n-6)'/>-dimensional family of internal motions free. Those extra
                    degrees of freedom can be used to optimize a secondary criterion — for instance weighting the joints
                    by the mass they move, so the solution minimizes kinetic energy while still realizing{" "}
                    <InlineMath math='\mathcal{V}_d'/>.
                </p>}
                ko={<p>
                    여유 자유도를 가진 로봇(<InlineMath math='n > 6'/>)의 경우 이는 최소노름 관절 속도를 돌려주며,{" "}
                    <InlineMath math='(n-6)'/> 차원의 내부 운동 계열을 자유롭게 남긴다. 이 여분의 자유도는 부차적
                    기준을 최적화하는 데 쓸 수 있다. 예를 들어 각 관절이 움직이는 질량으로 관절에 가중치를 주면,
                    해가 <InlineMath math='\mathcal{V}_d'/> 를 실현하면서도 운동 에너지를 최소화한다.
                </p>}
            />
        </>
    )
}

export default Chapter6
