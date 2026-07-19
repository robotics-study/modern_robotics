import {BlockMath, InlineMath} from "../../components/math/Tex";
import FiveBarSingularity from "../../components/pages/chapter7/FiveBarSingularity";
import FourBarLinkage from "../../components/pages/chapter7/FourBarLinkage";
import RPRParallel from "../../components/pages/chapter7/RPRParallel";
import StewartGough3D from "../../components/pages/chapter7/StewartGough3D";
import {T} from "../../libs/i18n";

const Chapter7 = () => {
    return (
        <>
            <T en={<h2>Closed Chains and Parallel Mechanisms</h2>} ko={<h2>Closed Chain과 Parallel Mechanism</h2>}/>
            <T
                en={<p>
                    Every mechanism so far has been an <strong>open chain</strong>: a single serial string of links
                    running from base to end-effector. A <strong>closed chain</strong> instead contains one or more{" "}
                    <strong>loops</strong>, so a link can be reached by more than one path. The most important closed
                    chains are <strong>parallel mechanisms</strong>: a <strong>fixed platform</strong> and a{" "}
                    <strong>moving platform</strong> joined by several <strong>legs</strong>, each usually a short open
                    chain. Two famous examples set the tone. The <strong>Stewart–Gough platform</strong> carries flight
                    simulators and doubles as a six-axis force–torque sensor, since any external load shows up as
                    measurable linear forces in its six legs. The <strong>Delta robot</strong> keeps all three motors on
                    the fixed base, so its moving parts are light and it can be extremely fast.
                </p>}
                ko={<p>
                    지금까지 다룬 모든 메커니즘은 <strong>Open Chain</strong>이었다. 베이스에서 end-effector까지 이어지는
                    하나의 직렬 링크 열이다. 반면 <strong>Closed Chain</strong>은 하나 이상의 <strong>루프</strong>를
                    포함해, 한 링크에 둘 이상의 경로로 도달할 수 있다. 가장 중요한 Closed Chain은{" "}
                    <strong>Parallel Mechanism</strong>이다. <strong>고정 플랫폼</strong>과 <strong>가동 플랫폼</strong>을
                    여러 개의 <strong>다리(leg)</strong>로 이은 것이며, 각 다리는 보통 짧은 Open Chain이다. 유명한 두
                    예가 분위기를 잡아 준다. <strong>Stewart–Gough 플랫폼</strong>은 비행 시뮬레이터를 싣고, 여섯 다리에
                    걸리는 힘을 재면 외부 하중을 알 수 있어 6축 힘–토크 센서로도 쓰인다. <strong>Delta 로봇</strong>은
                    모터 세 개가 전부 고정 베이스에 붙어 있어 움직이는 부분이 가볍고, 그래서 극단적으로 빠르다.
                </p>}
            />
            <T
                en={<p>
                    Two features make closed chains harder than open ones. First, <strong>only some joints are
                    actuated</strong>; the rest are passive and simply follow. Second, the joint variables are not free:
                    they must satisfy <strong>loop-closure constraints</strong> that keep every leg attached to the same
                    rigid platform. This also creates a striking role reversal against serial arms. For an open chain,
                    forward kinematics is a direct evaluation while inverse kinematics is the hard multi-solution
                    problem. For a parallel mechanism the roles flip: <strong>inverse kinematics is usually easy</strong>{" "}
                    (the actuator values follow directly from the platform pose), <strong>while forward kinematics is
                    hard</strong>. A chosen set of actuator values may be geometrically infeasible, or may correspond to
                    several distinct platform poses at once.
                </p>}
                ko={<p>
                    Closed Chain을 Open Chain보다 어렵게 만드는 특징은 둘이다. 첫째, <strong>관절 중 일부만
                    구동</strong>되고 나머지는 수동으로 따라온다. 둘째, 관절 변수들이 자유롭지 않다. 모든 다리를 같은
                    강체 플랫폼에 붙어 있게 하는 <strong>루프 폐합 제약</strong>을 만족해야 한다. 이 때문에 직렬 팔과
                    역할이 정확히 뒤집힌다. Open Chain에서는 Forward Kinematics가 직접 계산이고 Inverse Kinematics가
                    어려운 다중해 문제였다. Parallel Mechanism에서는 <strong>Inverse Kinematics가 대개 쉽고</strong>{" "}
                    (구동기 값이 플랫폼 자세에서 곧바로 나온다) <strong>Forward Kinematics가 어렵다</strong>. 선택한
                    구동기 값이 기하학적으로 실현 불가능할 수도 있고, 서로 다른 여러 플랫폼 자세에 동시에 대응할 수도
                    있다.
                </p>}
            />
            <T
                en={<p>
                    Mobility is counted the same way as before, with <strong>Grübler's formula</strong>. For a mechanism
                    of <InlineMath math='N'/> links (including ground) connected by <InlineMath math='J'/> joints in an{" "}
                    <InlineMath math='m'/>-dof space (<InlineMath math='m=3'/> planar, <InlineMath math='m=6'/> spatial),
                </p>}
                ko={<p>
                    자유도는 이전과 같은 방식으로 <strong>Grübler 공식</strong>으로 센다.{" "}
                    <InlineMath math='m'/>-자유도 공간(<InlineMath math='m=3'/> 평면, <InlineMath math='m=6'/> 공간)에서{" "}
                    <InlineMath math='N'/>개의 링크(지면 포함)가 <InlineMath math='J'/>개의 관절로 연결된 메커니즘에
                    대해,
                </p>}
            />
            <BlockMath math={`\\mathrm{dof} = m(N - 1 - J) + \\sum_{i=1}^{J} f_i`}/>
            <T
                en={<p>
                    where <InlineMath math='f_i'/> is the number of freedoms at joint <InlineMath math='i'/>. The{" "}
                    <strong>four-bar linkage</strong> below is the simplest closed chain: four links (one is ground) and
                    four revolute joints form a single loop. Grübler gives{" "}
                    <InlineMath math='3(4 - 1 - 4) + 4 = 1'/>, so its entire configuration space is{" "}
                    <strong>one-dimensional</strong>. Turning the input crank determines everything else through loop
                    closure. In fact the output angle can be solved in closed form, in four short steps. Put the input
                    crank <InlineMath math='L_1'/> at the origin with angle <InlineMath math='\theta'/>, the ground
                    link <InlineMath math='L_4'/> along the x-axis, the output rocker <InlineMath math='L_3'/> at the
                    far ground pivot with angle <InlineMath math='\phi'/>, and the coupler <InlineMath math='L_2'/>{" "}
                    joining the two moving tips:
                </p>}
                ko={<p>
                    여기서 <InlineMath math='f_i'/>는 관절 <InlineMath math='i'/>의 자유도 수다. 아래의{" "}
                    <strong>Four-Bar Linkage</strong>는 가장 단순한 Closed Chain이다. 네 개의 링크(하나는 지면)와 네 개의
                    revolute 관절이 하나의 루프를 이룬다. Grübler 공식은{" "}
                    <InlineMath math='3(4 - 1 - 4) + 4 = 1'/>을 주므로, 전체 configuration 공간이{" "}
                    <strong>1차원</strong>이다. 입력 크랭크를 돌리면 루프 폐합을 통해 나머지 전부가 결정된다. 실제로
                    출력각은 짧은 네 단계로 닫힌 형태로 풀린다. 입력 크랭크 <InlineMath math='L_1'/>을 원점에 각{" "}
                    <InlineMath math='\theta'/>로, 지면 링크 <InlineMath math='L_4'/>를 x축을 따라, 출력 로커{" "}
                    <InlineMath math='L_3'/>을 반대쪽 지면 피벗에 각 <InlineMath math='\phi'/>로 두고, 커플러{" "}
                    <InlineMath math='L_2'/>가 움직이는 두 끝점을 잇는다고 하자:
                </p>}
            />
            <ol className="list-decimal pl-6 space-y-1">
                <li>
                    <T
                        en={<span>Loop closure says the coupler must bridge the two moving tips, whose positions are{" "}
                            <InlineMath math='A = (L_1\cos\theta,\, L_1\sin\theta)'/> and{" "}
                            <InlineMath math='B = (L_4 + L_3\cos\phi,\, L_3\sin\phi)'/>:</span>}
                        ko={<span>루프 폐합은 커플러가 움직이는 두 끝점{" "}
                            <InlineMath math='A = (L_1\cos\theta,\, L_1\sin\theta)'/>,{" "}
                            <InlineMath math='B = (L_4 + L_3\cos\phi,\, L_3\sin\phi)'/> 사이를 이어야 한다는 뜻이다:</span>}
                    />
                    <BlockMath math={`\\lVert B - A \\rVert^2 = L_2^2`}/>
                </li>
                <li>
                    <T
                        en={<span>Expand the squares. The cross terms{" "}
                            <InlineMath math='\cos\phi\cos\theta + \sin\phi\sin\theta'/> collect, and everything sorts
                            into a part multiplying <InlineMath math='\cos\phi'/>, a part multiplying{" "}
                            <InlineMath math='\sin\phi'/>, and a part with no <InlineMath math='\phi'/> at all:</span>}
                        ko={<span>제곱을 전개한다. 교차항{" "}
                            <InlineMath math='\cos\phi\cos\theta + \sin\phi\sin\theta'/>이 모이고, 전체가{" "}
                            <InlineMath math='\cos\phi'/>에 붙는 부분, <InlineMath math='\sin\phi'/>에 붙는 부분,{" "}
                            <InlineMath math='\phi'/>가 전혀 없는 부분으로 정리된다:</span>}
                    />
                    <div className="overflow-x-auto">
                        <BlockMath math={`\\underbrace{(2L_3L_4 - 2L_1L_3\\cos\\theta)}_{\\alpha}\\cos\\phi
+ \\underbrace{(-2L_1L_3\\sin\\theta)}_{\\beta}\\sin\\phi
= \\underbrace{L_2^2 - L_4^2 - L_3^2 - L_1^2 + 2L_1L_4\\cos\\theta}_{\\gamma}`}/>
                    </div>
                    <T
                        en={<span>All three helper numbers <InlineMath math='\alpha, \beta, \gamma'/> depend only on{" "}
                            <InlineMath math='\theta'/> and the link lengths, so this is one equation{" "}
                            <InlineMath math='\alpha\cos\phi + \beta\sin\phi = \gamma'/> in the single unknown{" "}
                            <InlineMath math='\phi'/>.</span>}
                        ko={<span>보조 수 <InlineMath math='\alpha, \beta, \gamma'/> 셋은 전부{" "}
                            <InlineMath math='\theta'/>와 링크 길이만의 값이다. 그래서 이는 미지수{" "}
                            <InlineMath math='\phi'/> 하나에 대한 방정식{" "}
                            <InlineMath math='\alpha\cos\phi + \beta\sin\phi = \gamma'/>다.</span>}
                    />
                </li>
                <li>
                    <T
                        en={<span>A weighted sum of cosine and sine is a single shifted cosine. Writing{" "}
                            <InlineMath math='\alpha = r\cos\delta'/>, <InlineMath math='\beta = r\sin\delta'/> with{" "}
                            <InlineMath math='r = \sqrt{\alpha^2+\beta^2}'/> and{" "}
                            <InlineMath math='\delta = \operatorname{atan2}(\beta, \alpha)'/>, the cosine difference
                            identity gives:</span>}
                        ko={<span>코사인과 사인의 가중합은 하나의 이동된 코사인이다.{" "}
                            <InlineMath math='r = \sqrt{\alpha^2+\beta^2}'/>,{" "}
                            <InlineMath math='\delta = \operatorname{atan2}(\beta, \alpha)'/>로{" "}
                            <InlineMath math='\alpha = r\cos\delta'/>, <InlineMath math='\beta = r\sin\delta'/>라 쓰면,
                            코사인 차 공식에 의해:</span>}
                    />
                    <BlockMath math={`\\alpha\\cos\\phi + \\beta\\sin\\phi = r\\cos(\\phi - \\delta) = \\gamma
\\;\\;\\Longrightarrow\\;\\; \\cos(\\phi - \\delta) = \\frac{\\gamma}{\\sqrt{\\alpha^2+\\beta^2}}`}/>
                </li>
                <li>
                    <T
                        en={<span>Invert the cosine. It is even, so two angles qualify:</span>}
                        ko={<span>코사인을 뒤집는다. 코사인은 짝함수라 두 각이 자격이 있다:</span>}
                    />
                    <BlockMath math={`\\phi = \\tan^{-1}\\!\\Big(\\frac{\\beta}{\\alpha}\\Big) \\pm \\cos^{-1}\\!\\Big(\\frac{\\gamma}{\\sqrt{\\alpha^2+\\beta^2}}\\Big)`}/>
                </li>
            </ol>
            <T
                en={<p>
                    The <InlineMath math='\pm'/> is not a technicality: it is the choice between the{" "}
                    <strong>two assembly branches</strong>, and no solution exists when{" "}
                    <InlineMath math='\gamma^2 > \alpha^2 + \beta^2'/> (the loop cannot close at that crank angle). Sweep
                    the driving angle below, flip the branch button, and watch the C-space panel: the mechanism traces
                    exactly one of the two curves.
                </p>}
                ko={<p>
                    <InlineMath math='\pm'/>는 사소한 기호가 아니다. <strong>두 조립 가지(assembly branch)</strong>{" "}
                    사이의 선택이며, <InlineMath math='\gamma^2 > \alpha^2 + \beta^2'/>이면 해가 없다 (그 크랭크 각에서는
                    루프가 닫히지 않는다). 아래에서 구동각을 훑고 branch 버튼을 눌러 보라. C-space 패널에서 메커니즘은
                    두 곡선 중 정확히 하나를 따라간다.
                </p>}
            />
            <FourBarLinkage/>

            <T en={<h2>Forward and Inverse Kinematics</h2>} ko={<h2>Forward Kinematics와 Inverse Kinematics</h2>}/>
            <T
                en={<p>
                    Take the planar <strong>3&times;RPR</strong> mechanism as a case study: a moving platform held by
                    three legs, each a passive <strong>R</strong>evolute base joint, an actuated{" "}
                    <strong>P</strong>rismatic leg, and a passive <strong>R</strong>evolute platform joint. It has three
                    degrees of freedom, matching the planar pose <InlineMath math='(p_x, p_y, \phi)'/> of the platform.
                    Fix the notation first, with every symbol in words:
                </p>}
                ko={<p>
                    평면 <strong>3&times;RPR</strong> 메커니즘을 사례 연구로 삼자. 가동 플랫폼을 세 다리가 받치고, 각
                    다리는 수동 <strong>R</strong>evolute 베이스 관절, 구동 <strong>P</strong>rismatic 다리, 수동{" "}
                    <strong>R</strong>evolute 플랫폼 관절로 이뤄진다. 자유도는 3이고, 플랫폼의 평면 자세{" "}
                    <InlineMath math='(p_x, p_y, \phi)'/>와 일치한다. 기호부터 말로 못 박아 두자:
                </p>}
            />
            <T
                en={<ul className="list-disc pl-6 space-y-1">
                    <li><InlineMath math='p'/>: vector from the fixed frame <InlineMath math='\{s\}'/> origin to the
                        platform frame <InlineMath math='\{b\}'/> origin, <InlineMath math='\phi'/>: angle from{" "}
                        <InlineMath math='\hat x_s'/> to <InlineMath math='\hat x_b'/></li>
                    <li><InlineMath math='a_i'/>: position of base joint <InlineMath math='i'/> (constant, in{" "}
                        <InlineMath math='\{s\}'/> coordinates)</li>
                    <li><InlineMath math='b_i'/>: platform attachment point <InlineMath math='i'/> (constant, in{" "}
                        <InlineMath math='\{b\}'/> coordinates)</li>
                    <li><InlineMath math='d_i'/>: vector along leg <InlineMath math='i'/>, from base joint to platform
                        joint; its length is the leg extension <InlineMath math='s_i'/></li>
                </ul>}
                ko={<ul className="list-disc pl-6 space-y-1">
                    <li><InlineMath math='p'/>: 고정 좌표계 <InlineMath math='\{s\}'/> 원점에서 플랫폼 좌표계{" "}
                        <InlineMath math='\{b\}'/> 원점까지의 벡터, <InlineMath math='\phi'/>:{" "}
                        <InlineMath math='\hat x_s'/>에서 <InlineMath math='\hat x_b'/>까지 잰 각</li>
                    <li><InlineMath math='a_i'/>: 베이스 관절 <InlineMath math='i'/>의 위치 (상수,{" "}
                        <InlineMath math='\{s\}'/> 좌표)</li>
                    <li><InlineMath math='b_i'/>: 플랫폼 부착점 <InlineMath math='i'/> (상수,{" "}
                        <InlineMath math='\{b\}'/> 좌표)</li>
                    <li><InlineMath math='d_i'/>: 다리 <InlineMath math='i'/>를 따라 베이스 관절에서 플랫폼 관절로 가는
                        벡터. 그 길이가 다리 길이 <InlineMath math='s_i'/>다</li>
                </ul>}
            />
            <T
                en={<p>
                    Walking base &rarr; platform along leg <InlineMath math='i'/> must land on the same point as walking
                    through the platform pose, so (after rotating <InlineMath math='b_i'/> into{" "}
                    <InlineMath math='\{s\}'/> coordinates with <InlineMath math='R(\phi)'/>):
                </p>}
                ko={<p>
                    다리 <InlineMath math='i'/>를 따라 베이스에서 플랫폼으로 걸어가나, 플랫폼 자세를 거쳐 가나 같은 점에
                    도착해야 한다. 그래서 (<InlineMath math='b_i'/>를 <InlineMath math='R(\phi)'/>로{" "}
                    <InlineMath math='\{s\}'/> 좌표로 돌려놓으면):
                </p>}
            />
            <BlockMath math={`d_i = p + R(\\phi)\\,b_i - a_i, \\qquad s_i^2 = d_i^{\\mathsf T} d_i`}/>
            <T
                en={<p>
                    Written out in components,
                </p>}
                ko={<p>
                    성분으로 풀어 쓰면,
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math={`s_i^2 = \\big(p_x + b_{ix}\\cos\\phi - b_{iy}\\sin\\phi - a_{ix}\\big)^2 + \\big(p_y + b_{ix}\\sin\\phi + b_{iy}\\cos\\phi - a_{iy}\\big)^2`}/>
            </div>
            <T
                en={<p>
                    <strong>Inverse kinematics is therefore a direct evaluation</strong>: plug in the pose and read off
                    the three leg lengths, with no iteration and no branching. Drag the pose sliders below and watch{" "}
                    <InlineMath math='s_1, s_2, s_3'/> update instantly; this trivial pose-to-actuator map is the whole
                    point of the figure.
                </p>}
                ko={<p>
                    <strong>따라서 Inverse Kinematics는 직접 계산이다</strong>: 자세를 대입하고 세 다리 길이를 읽어내면
                    되며, 반복도 분기도 없다. 아래의 자세 슬라이더를 끌면서{" "}
                    <InlineMath math='s_1, s_2, s_3'/>가 즉시 갱신되는 것을 보라. 이 단순한 자세→구동기 대응이 바로 이
                    그림의 핵심이다.
                </p>}
            />
            <RPRParallel/>
            <T
                en={<p>
                    The <strong>forward</strong> problem is the hard direction. Given the three lengths{" "}
                    <InlineMath math='s_1, s_2, s_3'/>, finding the pose <InlineMath math='(p_x, p_y, \phi)'/> means
                    solving the three constraint equations simultaneously. The standard trick is the{" "}
                    <strong>tangent half-angle substitution</strong>, which turns every trigonometric term into a
                    polynomial one:
                </p>}
                ko={<p>
                    <strong>Forward</strong> 문제가 어려운 방향이다. 세 길이{" "}
                    <InlineMath math='s_1, s_2, s_3'/>가 주어졌을 때 자세{" "}
                    <InlineMath math='(p_x, p_y, \phi)'/>를 찾는 것은 세 제약 방정식을 동시에 푸는 일이다. 표준 요령은{" "}
                    <strong>tangent half-angle 치환</strong>으로, 모든 삼각함수 항을 다항식 항으로 바꾼다:
                </p>}
            />
            <BlockMath math={`t = \\tan\\frac{\\phi}{2}, \\qquad \\sin\\phi = \\frac{2t}{1+t^2}, \\qquad \\cos\\phi = \\frac{1-t^2}{1+t^2}`}/>
            <T
                en={<p>
                    Why this ends in a <strong>sixth-order polynomial</strong> is worth tracing:
                </p>}
                ko={<p>
                    왜 결말이 <strong>6차 다항식</strong>인지는 따라가 볼 가치가 있다:
                </p>}
            />
            <ol className="list-decimal pl-6 space-y-1">
                <li>
                    <T
                        en={<span>Expanding each constraint, the quadratic part is always the same{" "}
                            <InlineMath math='p_x^2 + p_y^2'/>; only the linear coefficients and the constant depend on{" "}
                            <InlineMath math='\phi'/> (and on the constants <InlineMath math='a_i, b_i, s_i'/>):</span>}
                        ko={<span>각 제약식을 전개하면 2차 부분은 항상 같은{" "}
                            <InlineMath math='p_x^2 + p_y^2'/>이고, 1차 계수와 상수만{" "}
                            <InlineMath math='\phi'/> (그리고 상수 <InlineMath math='a_i, b_i, s_i'/>)에 의존한다:</span>}
                    />
                    <BlockMath math={`p_x^2 + p_y^2 + c_{i1}(\\phi)\\,p_x + c_{i2}(\\phi)\\,p_y + c_{i3}(\\phi) = 0, \\qquad i = 1,2,3`}/>
                </li>
                <li>
                    <T
                        en={<span>Subtract equation 1 from equations 2 and 3. The common{" "}
                            <InlineMath math='p_x^2 + p_y^2'/> cancels, leaving two equations that are{" "}
                            <strong>linear</strong> in <InlineMath math='p_x, p_y'/>, with coefficients built from{" "}
                            <InlineMath math='\cos\phi'/> and <InlineMath math='\sin\phi'/>.</span>}
                        ko={<span>식 1을 식 2, 식 3에서 뺀다. 공통의{" "}
                            <InlineMath math='p_x^2 + p_y^2'/>이 소거되고, <InlineMath math='p_x, p_y'/>에 대해{" "}
                            <strong>선형</strong>인 두 식이 남는다. 계수는 <InlineMath math='\cos\phi'/>와{" "}
                            <InlineMath math='\sin\phi'/>로 이루어진다.</span>}
                    />
                </li>
                <li>
                    <T
                        en={<span>Solve that 2&times;2 linear system: <InlineMath math='p_x'/> and{" "}
                            <InlineMath math='p_y'/> become rational functions of <InlineMath math='\phi'/>. The
                            half-angle substitution turns them into rational functions of{" "}
                            <InlineMath math='t'/>.</span>}
                        ko={<span>그 2&times;2 선형계를 푼다. <InlineMath math='p_x'/>와{" "}
                            <InlineMath math='p_y'/>가 <InlineMath math='\phi'/>의 유리식이 되고, 반각 치환이 이를{" "}
                            <InlineMath math='t'/>의 유리식으로 바꾼다.</span>}
                    />
                </li>
                <li>
                    <T
                        en={<span>Substitute back into equation 1 and clear denominators. What remains is a single
                            polynomial in <InlineMath math='t'/>, and counting degrees shows it is of{" "}
                            <strong>degree six</strong>. Each real root is one platform pose, so a given set of leg
                            lengths can correspond to <strong>up to six distinct poses</strong>.</span>}
                        ko={<span>식 1에 되대입하고 분모를 곱해 없앤다. 남는 것은 <InlineMath math='t'/>의 다항식
                            하나이고, 차수를 세어 보면 <strong>6차</strong>다. 실근 하나가 플랫폼 자세 하나이므로,
                            주어진 다리 길이 집합은 <strong>최대 여섯 개의 서로 다른 자세</strong>에 대응할 수
                            있다.</span>}
                    />
                </li>
            </ol>
            <T
                en={<p>
                    Symmetric leg lengths also expose a singular configuration: with all legs equal and as short as
                    possible, extending them makes the platform rotate, but clockwise and counterclockwise are equally
                    valid. Which way it snaps cannot be predicted. That is a first taste of the closed-chain
                    singularities treated below.
                </p>}
                ko={<p>
                    대칭인 다리 길이는 singular configuration도 드러낸다. 세 다리를 모두 같게, 가장 짧게 만든 상태에서
                    다리를 늘리면 플랫폼이 회전하는데, 시계 방향과 반시계 방향이 똑같이 유효하다. 어느 쪽으로 튈지
                    예측할 수 없다. 아래에서 다룰 closed-chain singularity의 첫 맛보기다.
                </p>}
            />
            <T
                en={<p>
                    The spatial analogue is the <strong>6&times;SPS Stewart–Gough platform</strong>: six actuated legs,
                    each a <strong>S</strong>pherical&ndash;<strong>P</strong>rismatic&ndash;<strong>S</strong>pherical
                    chain between the fixed and moving platforms. Exactly the same vector walk gives{" "}
                    <InlineMath math='d_i = p + R b_i - a_i'/> with <InlineMath math='R \in SO(3)'/> now a full 3D
                    rotation, so the inverse kinematics is again immediate:
                </p>}
                ko={<p>
                    공간 버전이 <strong>6&times;SPS Stewart–Gough 플랫폼</strong>이다. 고정 플랫폼과 가동 플랫폼 사이를{" "}
                    <strong>S</strong>pherical&ndash;<strong>P</strong>rismatic&ndash;<strong>S</strong>pherical 체인인
                    구동 다리 여섯 개가 잇는다. 똑같은 벡터 걷기로 <InlineMath math='d_i = p + R b_i - a_i'/>가 나오며,
                    이제 <InlineMath math='R \in SO(3)'/>은 완전한 3차원 회전이다. 그래서 Inverse Kinematics는 역시
                    즉답이다:
                </p>}
            />
            <BlockMath math={`s_i = \\lVert p + R\\,b_i - a_i \\rVert, \\qquad i = 1,\\dots,6`}/>
            <StewartGough3D/>
            <T
                en={<p>
                    Forward kinematics is a different story. Given the six lengths we must solve for{" "}
                    <InlineMath math='p \in \mathbb{R}^3'/> and <InlineMath math='R \in SO(3)'/>: the six leg equations
                    plus the six independent constraints hidden in <InlineMath math='R^{\mathsf T}R = I'/> (a symmetric
                    3&times;3 matrix equation, hence six independent entries) give{" "}
                    <strong>12 equations in 12 unknowns</strong> (three for <InlineMath math='p'/>, nine for{" "}
                    <InlineMath math='R'/>). No closed form is known in general, and the general 6&ndash;6 platform
                    admits <strong>up to 40 forward-kinematics solutions</strong>. This is the serial/parallel role
                    reversal in its most extreme form.
                </p>}
                ko={<p>
                    Forward Kinematics는 전혀 다른 이야기다. 여섯 길이가 주어지면{" "}
                    <InlineMath math='p \in \mathbb{R}^3'/>와 <InlineMath math='R \in SO(3)'/>을 풀어야 한다. 다리 방정식
                    여섯 개에 <InlineMath math='R^{\mathsf T}R = I'/>에 숨은 독립 제약 여섯 개(대칭 3&times;3 행렬
                    방정식이라 독립 성분이 6개다)를 더하면{" "}
                    <strong>미지수 12개에 방정식 12개</strong>다 (<InlineMath math='p'/>가 3개,{" "}
                    <InlineMath math='R'/>이 9개). 일반적인 닫힌 해는 알려져 있지 않고, 일반 6&ndash;6 플랫폼은{" "}
                    <strong>최대 40개의 Forward Kinematics 해</strong>를 허용한다. 직렬/병렬 역할 역전의 가장 극단적인
                    형태다.
                </p>}
            />
            <T
                en={<p>
                    What about a <strong>general parallel mechanism</strong>, with no special geometry to exploit?
                    Suppose the two platforms are joined by three open-chain legs whose forward kinematics are{" "}
                    <InlineMath math='T_1(\theta)'/>, <InlineMath math='T_2(\phi)'/>,{" "}
                    <InlineMath math='T_3(\psi)'/> with <InlineMath math='\theta \in \mathbb{R}^m'/>,{" "}
                    <InlineMath math='\phi \in \mathbb{R}^n'/>, <InlineMath math='\psi \in \mathbb{R}^p'/>. Every leg
                    must deliver the same platform frame <InlineMath math='T_{sb}'/>, so eliminating{" "}
                    <InlineMath math='T_{sb}'/>:
                </p>}
                ko={<p>
                    이용할 특수 기하가 없는 <strong>일반 Parallel Mechanism</strong>은 어떨까? 두 플랫폼을 세 개의 Open
                    Chain 다리가 잇고, 각 다리의 Forward Kinematics가 <InlineMath math='T_1(\theta)'/>,{" "}
                    <InlineMath math='T_2(\phi)'/>, <InlineMath math='T_3(\psi)'/>{" "}
                    (<InlineMath math='\theta \in \mathbb{R}^m'/>, <InlineMath math='\phi \in \mathbb{R}^n'/>,{" "}
                    <InlineMath math='\psi \in \mathbb{R}^p'/>)라고 하자. 어느 다리로 가도 같은 플랫폼 frame{" "}
                    <InlineMath math='T_{sb}'/>에 도착해야 하므로, <InlineMath math='T_{sb}'/>를 소거하면:
                </p>}
            />
            <BlockMath math={`T_1(\\theta) = T_2(\\phi), \\qquad T_2(\\phi) = T_3(\\psi)`}/>
            <T
                en={<p>
                    Each matrix equation looks like 12 scalar equations (nine rotation entries, three position entries),
                    but only <strong>six are independent</strong>: <InlineMath math='R^{\mathsf T}R = I'/> already ties
                    the nine rotation entries down to three independent ones. So the two loop equations impose{" "}
                    <InlineMath math='12'/> independent constraints on <InlineMath math='m+n+p'/> joint variables, and
                    the mechanism has
                </p>}
                ko={<p>
                    각 행렬 방정식은 스칼라 방정식 12개처럼 보이지만 (회전 성분 9개, 위치 성분 3개){" "}
                    <strong>독립인 것은 6개</strong>뿐이다. <InlineMath math='R^{\mathsf T}R = I'/>가 회전 성분 9개를
                    이미 독립 3개로 묶어 두기 때문이다. 따라서 루프 방정식 두 개는 관절 변수{" "}
                    <InlineMath math='m+n+p'/>개에 독립 제약 <InlineMath math='12'/>개를 부과하고, 자유도는
                </p>}
            />
            <BlockMath math={`d = m + n + p - 12`}/>
            <T
                en={<p>
                    Forward kinematics then means: given <InlineMath math='d'/> actuated joint values, solve the loop
                    equations for the remaining passive ones, then evaluate any one leg's forward kinematics. Inverse
                    kinematics means: set <InlineMath math='T_1 = T_2 = T_3 = T_{sb}'/> and solve for all joint
                    variables. Both directions generally have multiple solutions, and practical analyses exploit
                    whatever mechanism-specific structure is available, exactly as the straight-line legs did for the
                    Stewart&ndash;Gough platform.
                </p>}
                ko={<p>
                    이제 Forward Kinematics는 이렇게 읽힌다. 구동 관절 값 <InlineMath math='d'/>개가 주어지면 루프
                    방정식을 풀어 나머지 수동 관절을 구하고, 아무 다리 하나의 Forward Kinematics를 계산한다. Inverse
                    Kinematics는 <InlineMath math='T_1 = T_2 = T_3 = T_{sb}'/>로 놓고 모든 관절 변수를 푸는 것이다. 두
                    방향 모두 일반적으로 해가 여러 개이고, 실전 분석은 Stewart&ndash;Gough 플랫폼의 직선 다리처럼
                    메커니즘 고유의 구조를 최대한 이용한다.
                </p>}
            />

            <T en={<h2>Differential Kinematics</h2>} ko={<h2>Differential Kinematics</h2>}/>
            <T
                en={<p>
                    Velocity kinematics for a closed chain must respect the loops. Only the <strong>actuated</strong>{" "}
                    joints receive commanded velocities; the <strong>passive</strong> joint velocities are whatever the
                    constraints force them to be. The whole derivation is four short steps (three legs with five joints
                    each, <InlineMath math='d = 5+5+5-12 = 3'/>, actuated joints{" "}
                    <InlineMath math='q_a = (\theta_1, \phi_1, \psi_1)'/>):
                </p>}
                ko={<p>
                    Closed Chain의 속도 kinematics는 루프를 지켜야 한다. <strong>구동</strong> 관절만 명령 속도를 받고,{" "}
                    <strong>수동</strong> 관절 속도는 제약이 강제하는 값이 된다. 유도 전체가 짧은 네 단계다 (다리 셋,
                    다리마다 관절 다섯: <InlineMath math='d = 5+5+5-12 = 3'/>, 구동 관절{" "}
                    <InlineMath math='q_a = (\theta_1, \phi_1, \psi_1)'/>):
                </p>}
            />
            <ol className="list-decimal pl-6 space-y-1">
                <li>
                    <T
                        en={<span>Differentiate the loop equations in time. Since{" "}
                            <InlineMath math='\dot T_i T_i^{-1} = [\mathcal{V}_i]'/> is each leg's spatial twist, equal
                            frames force equal twists, expressed through each leg's Jacobian:</span>}
                        ko={<span>루프 방정식을 시간 미분한다. <InlineMath math='\dot T_i T_i^{-1} = [\mathcal{V}_i]'/>가
                            각 다리의 spatial twist이므로, frame이 같으면 twist도 같아야 하고, 이를 각 다리의 Jacobian으로
                            쓰면:</span>}
                    />
                    <BlockMath math={`J_1(\\theta)\\,\\dot\\theta = J_2(\\phi)\\,\\dot\\phi, \\qquad J_2(\\phi)\\,\\dot\\phi = J_3(\\psi)\\,\\dot\\psi`}/>
                </li>
                <li>
                    <T
                        en={<span>Stack the two equations into one homogeneous linear system in all 15 joint
                            rates:</span>}
                        ko={<span>두 식을 관절 속도 15개 전체에 대한 하나의 동차 선형계로 쌓는다:</span>}
                    />
                    <div className="overflow-x-auto">
                        <BlockMath math={`\\begin{bmatrix} J_1(\\theta) & -J_2(\\phi) & 0 \\\\ 0 & -J_2(\\phi) & J_3(\\psi) \\end{bmatrix}
\\begin{bmatrix} \\dot\\theta \\\\ \\dot\\phi \\\\ \\dot\\psi \\end{bmatrix} = 0`}/>
                    </div>
                </li>
                <li>
                    <T
                        en={<span>Reorder the columns into actuated <InlineMath math='q_a \in \mathbb{R}^3'/> and
                            passive <InlineMath math='q_p \in \mathbb{R}^{12}'/> parts. This is the{" "}
                            <strong>constraint Jacobian</strong>, the object with no open-chain counterpart:</span>}
                        ko={<span>열을 구동 <InlineMath math='q_a \in \mathbb{R}^3'/>과 수동{" "}
                            <InlineMath math='q_p \in \mathbb{R}^{12}'/> 부분으로 재배열한다. 이것이 Open Chain에
                            대응물이 없는 <strong>제약 Jacobian</strong>이다:</span>}
                    />
                    <BlockMath math={`H_a(q)\\,\\dot q_a + H_p(q)\\,\\dot q_p = 0, \\qquad H_a \\in \\mathbb{R}^{12\\times 3},\\; H_p \\in \\mathbb{R}^{12\\times 12}`}/>
                </li>
                <li>
                    <T
                        en={<span>Wherever <InlineMath math='H_p'/> is invertible, the passive rates are uniquely
                            determined by the actuated ones:</span>}
                        ko={<span><InlineMath math='H_p'/>가 가역인 곳에서는 수동 속도가 구동 속도로 유일하게
                            결정된다:</span>}
                    />
                    <BlockMath math={`\\dot q_p = -H_p^{-1}(q)\\,H_a(q)\\,\\dot q_a`}/>
                </li>
            </ol>
            <T
                en={<p>
                    The platform twist then comes from any single leg. Using leg 1,{" "}
                    <InlineMath math='\mathcal{V}_s = J_1(\theta)\dot\theta'/>, and step 4 expresses every{" "}
                    <InlineMath math='\dot\theta_i'/> as a row vector times <InlineMath math='\dot q_a'/>{" "}
                    (<InlineMath math='\dot\theta_1 = e_1^{\mathsf T}\dot q_a'/> trivially, and for the passive ones{" "}
                    <InlineMath math='\dot\theta_i = g_i^{\mathsf T}\dot q_a'/>, where{" "}
                    <InlineMath math='g_i^{\mathsf T}'/> is the corresponding row of{" "}
                    <InlineMath math='-H_p^{-1}H_a'/>). Stacking those rows gives the forward-kinematics Jacobian with
                    respect to the actuators:
                </p>}
                ko={<p>
                    플랫폼 twist는 아무 다리 하나에서 나온다. 다리 1을 쓰면{" "}
                    <InlineMath math='\mathcal{V}_s = J_1(\theta)\dot\theta'/>이고, 4단계가 모든{" "}
                    <InlineMath math='\dot\theta_i'/>를 행벡터 곱 <InlineMath math='\dot q_a'/>로 표현해 준다
                    (<InlineMath math='\dot\theta_1 = e_1^{\mathsf T}\dot q_a'/>는 자명하고, 수동 관절은{" "}
                    <InlineMath math='\dot\theta_i = g_i^{\mathsf T}\dot q_a'/>다. 여기서{" "}
                    <InlineMath math='g_i^{\mathsf T}'/>는 <InlineMath math='-H_p^{-1}H_a'/>의 해당 행이다). 그 행들을
                    쌓으면 구동기 기준의 Forward Kinematics Jacobian이 된다:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math={`\\mathcal{V}_s = J_a(q)\\,\\dot q_a, \\qquad J_a(q) = J_1(\\theta)
\\begin{bmatrix} e_1^{\\mathsf T} \\\\ g_2^{\\mathsf T} \\\\ \\vdots \\\\ g_5^{\\mathsf T} \\end{bmatrix}`}/>
            </div>
            <T
                en={<p>
                    For the Stewart&ndash;Gough platform there is a shortcut that avoids all of this: a{" "}
                    <strong>static analysis</strong> hands over the inverse Jacobian directly. Three steps:
                </p>}
                ko={<p>
                    Stewart&ndash;Gough 플랫폼에는 이 전부를 건너뛰는 지름길이 있다. <strong>statics</strong>가 inverse
                    Jacobian을 직접 건네준다. 세 단계다:
                </p>}
            />
            <ol className="list-decimal pl-6 space-y-1">
                <li>
                    <T
                        en={<span>A leg's two spherical joints cannot transmit any torque, so the force each leg applies
                            to the platform must act <strong>along the leg line</strong>:{" "}
                            <InlineMath math='f_i = \hat n_i \tau_i'/>, where <InlineMath math='\hat n_i'/> is the unit
                            vector along leg <InlineMath math='i'/> and <InlineMath math='\tau_i'/> the force
                            magnitude.</span>}
                        ko={<span>다리 양 끝의 spherical 관절은 토크를 전혀 전달하지 못한다. 그래서 다리가 플랫폼에
                            가하는 힘은 <strong>다리 직선을 따라</strong> 작용해야 한다:{" "}
                            <InlineMath math='f_i = \hat n_i \tau_i'/>. 여기서 <InlineMath math='\hat n_i'/>는 다리{" "}
                            <InlineMath math='i'/> 방향 단위벡터, <InlineMath math='\tau_i'/>는 힘의 크기다.</span>}
                    />
                </li>
                <li>
                    <T
                        en={<span>Because the force's line of action is the leg itself, its moment about the fixed
                            origin can be computed at <em>either</em> end of the leg. The base end is the convenient
                            one, since the base joint position <InlineMath math='q_i'/> is constant:{" "}
                            <InlineMath math='m_i = q_i \times f_i'/>.</span>}
                        ko={<span>힘의 작용선이 다리 그 자체이므로, 고정 원점에 대한 모멘트는 다리의 <em>어느</em> 끝에서
                            계산해도 같다. 베이스 쪽 관절 위치 <InlineMath math='q_i'/>가 상수라서 그쪽이 편하다:{" "}
                            <InlineMath math='m_i = q_i \times f_i'/>.</span>}
                    />
                </li>
                <li>
                    <T
                        en={<span>Sum the six leg wrenches <InlineMath math='\mathcal{F}_i = (m_i, f_i)'/> and compare
                            with the open-chain duality <InlineMath math='\tau = J^{\mathsf T}\mathcal{F}'/>:</span>}
                        ko={<span>여섯 다리의 wrench <InlineMath math='\mathcal{F}_i = (m_i, f_i)'/>를 더하고, Open
                            Chain의 duality <InlineMath math='\tau = J^{\mathsf T}\mathcal{F}'/>와 비교한다:</span>}
                    />
                    <div className="overflow-x-auto">
                        <BlockMath math={`\\mathcal{F}_s = \\sum_{i=1}^{6}
\\begin{bmatrix} -\\hat n_i \\times q_i \\\\ \\hat n_i \\end{bmatrix} \\tau_i
= J_s^{-\\mathsf T}\\,\\tau
\\;\\;\\Longrightarrow\\;\\;
J_s^{-1} = \\begin{bmatrix} (-\\hat n_1 \\times q_1)^{\\mathsf T} & \\hat n_1^{\\mathsf T} \\\\ \\vdots & \\vdots \\\\ (-\\hat n_6 \\times q_6)^{\\mathsf T} & \\hat n_6^{\\mathsf T} \\end{bmatrix}`}/>
                    </div>
                </li>
            </ol>
            <T
                en={<p>
                    Each row of <InlineMath math='J_s^{-1}'/> is just the screw of one straight leg line, so{" "}
                    <InlineMath math='\dot s = J_s^{-1}\mathcal{V}_s'/> comes straight from the leg geometry. No
                    differentiation of a forward-kinematics map is ever needed.
                </p>}
                ko={<p>
                    <InlineMath math='J_s^{-1}'/>의 각 행은 곧 다리 직선 하나의 screw다. 그래서{" "}
                    <InlineMath math='\dot s = J_s^{-1}\mathcal{V}_s'/>가 다리 기하에서 곧바로 나온다. Forward
                    Kinematics를 미분할 일이 아예 없다.
                </p>}
            />

            <T en={<h2>Singularities</h2>} ko={<h2>Singularity</h2>}/>
            <T
                en={<p>
                    Closed chains are richer than open ones near singularities, and it helps to separate three distinct
                    kinds. Write the differential loop constraints as{" "}
                    <InlineMath math='H(q)\dot q = [\,H_a \; H_p\,](\dot q_a, \dot q_p) = 0'/> with{" "}
                    <InlineMath math='a'/> actuated and <InlineMath math='p'/> passive joints, so{" "}
                    <InlineMath math='H \in \mathbb{R}^{p \times (a+p)}'/> and{" "}
                    <InlineMath math='H_p \in \mathbb{R}^{p \times p}'/>.
                </p>}
                ko={<p>
                    Closed Chain은 singularity 근처에서 Open Chain보다 풍부하며, 세 가지 서로 다른 종류로 나눠 보면
                    이해가 쉽다. 미분 루프 제약을{" "}
                    <InlineMath math='H(q)\dot q = [\,H_a \; H_p\,](\dot q_a, \dot q_p) = 0'/>로 쓰자. 구동 관절{" "}
                    <InlineMath math='a'/>개, 수동 관절 <InlineMath math='p'/>개이면{" "}
                    <InlineMath math='H \in \mathbb{R}^{p \times (a+p)}'/>,{" "}
                    <InlineMath math='H_p \in \mathbb{R}^{p \times p}'/>다.
                </p>}
            />
            <T
                en={<ul className="list-disc pl-6 space-y-1">
                    <li>
                        <strong>Configuration-space singularities</strong> (<InlineMath math='\operatorname{rank} H < p'/>):
                        points where the constraint surface itself fails to be a smooth surface, such as
                        self-intersections and bifurcations. They are a property of the geometry alone and are{" "}
                        <strong>independent of which joints are actuated</strong>. Every such point is also an actuator
                        singularity for every possible actuator choice.
                    </li>
                    <li>
                        <strong>Actuator singularities</strong> (<InlineMath math='\operatorname{rank} H_p < p'/>):
                        configurations where the passive joints are no longer pinned down by the actuated ones. In a{" "}
                        <em>nondegenerate</em> actuator singularity the actuators can no longer be commanded
                        independently (pulling them apart tears the mechanism, pushing them together makes it buckle
                        unpredictably); in a <em>degenerate</em> one, even locking every actuator leaves internal links
                        free to move. These depend on the <strong>choice of actuated joints</strong> and can often be
                        removed by relocating an actuator.
                    </li>
                    <li>
                        <strong>End-effector singularities</strong>: the moving platform loses the ability to move
                        instantaneously in some direction, exactly as for an open chain. Checked by rank-testing the
                        Jacobian of <InlineMath math='f(q_a) = T_{sb}'/> away from actuator singularities. These depend
                        on the <strong>placement of the end-effector frame</strong>, not on the actuator choice.
                    </li>
                </ul>}
                ko={<ul className="list-disc pl-6 space-y-1">
                    <li>
                        <strong>Configuration-space singularity</strong> (<InlineMath math='\operatorname{rank} H < p'/>):
                        제약 곡면 자체가 매끄러운 곡면이기를 그치는 점들이다. 자기 교차나 분기점 같은 곳이다. 오로지
                        기하의 성질이며 <strong>어느 관절을 구동하는지와 무관하다</strong>. 이런 점은 어떤 구동기 선택에
                        대해서도 actuator singularity이기도 하다.
                    </li>
                    <li>
                        <strong>Actuator singularity</strong> (<InlineMath math='\operatorname{rank} H_p < p'/>): 수동
                        관절이 더 이상 구동 관절에 의해 못 박히지 않는 configuration이다. <em>nondegenerate</em>{" "}
                        actuator singularity에서는 구동기를 독립적으로 명령할 수 없다 (벌리면 메커니즘이 찢어지고,
                        모으면 예측 불가능하게 꺾인다). <em>degenerate</em>에서는 구동기를 전부 잠가도 내부 링크가
                        자유롭게 움직인다. 이들은 <strong>구동 관절의 선택</strong>에 의존하며, 구동기를 다른 관절로
                        옮기면 없앨 수 있는 경우가 많다.
                    </li>
                    <li>
                        <strong>End-effector singularity</strong>: Open Chain에서와 똑같이, 가동 플랫폼이 어떤 방향으로
                        순간적으로 움직이는 능력을 잃는다. actuator singularity가 아닌 곳에서{" "}
                        <InlineMath math='f(q_a) = T_{sb}'/>의 Jacobian rank를 검사하면 된다. 구동기 선택이 아니라{" "}
                        <strong>end-effector frame의 배치</strong>에 의존한다.
                    </li>
                </ul>}
            />
            <T
                en={<p>
                    The <strong>five-bar linkage</strong> makes the middle kind tangible. Its loop closure, with{" "}
                    <InlineMath math='\theta_5'/> eliminated in advance, is two equations in four unknowns:
                </p>}
                ko={<p>
                    <strong>5절 링크</strong>가 가운데 종류를 손에 잡히게 한다. <InlineMath math='\theta_5'/>를 미리
                    소거한 루프 폐합은 미지수 4개에 방정식 2개다:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math={`\\begin{aligned}
L_1\\cos\\theta_1 + L_2\\cos(\\theta_1{+}\\theta_2) + L_3\\cos(\\theta_1{+}\\theta_2{+}\\theta_3) + L_4\\cos(\\theta_1{+}\\cdots{+}\\theta_4) &= L_5\\\\
L_1\\sin\\theta_1 + L_2\\sin(\\theta_1{+}\\theta_2) + L_3\\sin(\\theta_1{+}\\theta_2{+}\\theta_3) + L_4\\sin(\\theta_1{+}\\cdots{+}\\theta_4) &= 0
\\end{aligned}`}/>
            </div>
            <T
                en={<p>
                    Writing this as <InlineMath math='f(\theta_1,\dots,\theta_4) = 0'/> with{" "}
                    <InlineMath math='f : \mathbb{R}^4 \to \mathbb{R}^2'/>, the C-space is a two-dimensional surface in{" "}
                    <InlineMath math='\mathbb{R}^4'/>, and points where{" "}
                    <InlineMath math='\operatorname{rank}(\partial f/\partial\theta) < 2'/> are its configuration-space
                    singularities. Now actuate the two ground joints and try to <em>reach</em> an actuator singularity
                    by hand: drive the cranks until the two passive couplers line up. At that instant the two candidate
                    positions for the middle joint merge, and whether it buckles up or down is anyone's guess.
                </p>}
                ko={<p>
                    이를 <InlineMath math='f(\theta_1,\dots,\theta_4) = 0'/>,{" "}
                    <InlineMath math='f : \mathbb{R}^4 \to \mathbb{R}^2'/>로 쓰면 C-space는{" "}
                    <InlineMath math='\mathbb{R}^4'/> 안의 2차원 곡면이고,{" "}
                    <InlineMath math='\operatorname{rank}(\partial f/\partial\theta) < 2'/>인 점이 configuration-space
                    singularity다. 이제 지면의 두 관절을 구동해서 actuator singularity를 직접 <em>만들어</em> 보자. 두
                    수동 coupler가 일직선이 될 때까지 크랭크를 몰아 보라. 그 순간 가운데 관절의 후보 위치 둘이 하나로
                    합쳐지고, 위로 꺾일지 아래로 꺾일지는 아무도 모른다.
                </p>}
            />
            <FiveBarSingularity/>
            <T
                en={<p>
                    Two remarks complete the picture. If the two couplers have equal lengths and the actuated cranks
                    fold them onto each other exactly, the singularity becomes <em>degenerate</em>: even with both
                    actuators locked, the overlapped inner links can still swing freely. And placing an end-effector
                    frame on the five-bar exposes the third kind: whenever an effective two-link chain from a ground
                    pivot to the end-effector straightens out, the end-effector cannot move along the line of those
                    links at that instant, exactly like a straightened 2R arm.
                </p>}
                ko={<p>
                    두 가지 부연으로 그림이 완성된다. 두 coupler의 길이가 같고 구동 크랭크가 그 둘을 정확히 겹쳐
                    접으면 singularity는 <em>degenerate</em>가 된다. 구동기 둘을 다 잠가도 겹쳐진 내부 링크가 여전히
                    자유롭게 흔들린다. 그리고 5절 링크에 end-effector frame을 얹으면 세 번째 종류가 드러난다. 지면
                    피벗에서 end-effector까지의 유효 2링크 체인이 일직선으로 펴지는 순간, end-effector는 그 링크
                    방향으로는 움직일 수 없다. 쭉 편 2R 팔과 정확히 같다.
                </p>}
            />
            <T
                en={<p>
                    The four-bar figure at the top of this chapter shows the first kind. In its C-space panel the two
                    curves are the two assembly branches, and the marked points where they meet are{" "}
                    <strong>configuration-space singularities</strong>: bifurcation points where the coupler and rocker
                    become collinear, the two circle intersections merge, and the mechanism can switch branches. Because
                    the meeting is a feature of the loop-closure surface itself, it stays put no matter which joint we
                    choose to drive.
                </p>}
                ko={<p>
                    이 챕터 맨 위의 Four-Bar Linkage 그림이 첫 번째 종류를 보여준다. C-space 패널의 두 곡선이 두 조립
                    가지이고, 그 곡선들이 만나는 표시된 점들이 <strong>configuration-space singularity</strong>다.
                    커플러와 로커가 일직선이 되고, 두 원의 교점이 합쳐지며, 메커니즘이 가지를 갈아탈 수 있는 분기점이다.
                    이 만남은 루프 폐합 곡면 자체의 특징이므로, 어느 관절을 구동하기로 선택하든 그 자리에 그대로 있다.
                </p>}
            />
        </>
    )
}

export default Chapter7
