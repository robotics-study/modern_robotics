import {BlockMath, InlineMath} from "../../components/math/Tex";
import FourBarLinkage from "../../components/pages/chapter7/FourBarLinkage";
import RPRParallel from "../../components/pages/chapter7/RPRParallel";
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
                    chains are <strong>parallel mechanisms</strong> — a <strong>fixed platform</strong> and a{" "}
                    <strong>moving platform</strong> joined by several <strong>legs</strong>, each usually a short open
                    chain. Only some of the joints are <strong>actuated</strong>; the rest are passive and simply go
                    along for the ride. Because the legs share the moving platform, the joint variables are not free:
                    they must satisfy <strong>loop-closure constraints</strong> that keep every leg attached to the same
                    rigid platform.
                </p>}
                ko={<p>
                    지금까지 다룬 모든 메커니즘은 <strong>Open Chain</strong>이었다. 베이스에서 end-effector까지 이어지는
                    하나의 직렬 링크 열이다. 반면 <strong>Closed Chain</strong>은 하나 이상의 <strong>루프</strong>를
                    포함해, 한 링크에 둘 이상의 경로로 도달할 수 있다. 가장 중요한 Closed Chain은{" "}
                    <strong>Parallel Mechanism</strong>으로, <strong>고정 플랫폼</strong>과 <strong>가동 플랫폼</strong>을
                    여러 개의 <strong>다리(leg)</strong>로 이은 것이며, 각 다리는 보통 짧은 Open Chain이다. 관절 중
                    일부만 <strong>구동</strong>되고 나머지는 수동적으로 따라 움직인다. 다리들이 가동 플랫폼을
                    공유하므로 관절 변수들은 자유롭지 않다. 모든 다리를 같은 강체 플랫폼에 붙어 있게 하는{" "}
                    <strong>루프 폐합 제약</strong>을 만족해야 한다.
                </p>}
            />
            <T
                en={<p>
                    This creates a striking <strong>duality</strong> with serial arms. For an open chain forward
                    kinematics is a direct evaluation while inverse kinematics is the hard, multi-solution problem. For a
                    parallel mechanism the roles flip: <strong>inverse kinematics is usually easy — the actuator values
                    follow directly from the platform pose — while forward kinematics is hard.</strong> A chosen set of
                    actuator values may be geometrically infeasible (the legs simply cannot close the loop), or it may
                    correspond to several distinct platform poses at once.
                </p>}
                ko={<p>
                    이는 직렬 팔과의 뚜렷한 <strong>쌍대성</strong>을 만든다. Open Chain에서는 Forward Kinematics가 직접 계산이고
                    Inverse Kinematics가 어려운 다중해 문제다. Parallel Mechanism에서는 역할이 뒤바뀐다.{" "}
                    <strong>Inverse Kinematics는 대개 쉽다 — 구동기 값이 플랫폼 자세에서 곧바로 나온다 — 반면 Forward Kinematics는
                    어렵다.</strong> 선택한 구동기 값의 집합이 기하학적으로 실현 불가능할 수도 있고(다리들이 루프를
                    닫을 수 없음), 여러 개의 서로 다른 플랫폼 자세에 동시에 대응할 수도 있다.
                </p>}
            />
            <T
                en={<p>
                    Mobility is counted the same way as before, with <strong>Grübler's formula</strong>. For a mechanism
                    of <InlineMath math='N'/> links (including ground) connected by <InlineMath math='J'/> joints in a{" "}
                    <InlineMath math='m'/>-dof space (<InlineMath math='m=3'/> planar, <InlineMath math='m=6'/> spatial),
                </p>}
                ko={<p>
                    가동성은 이전과 같은 방식으로, <strong>그뤼블러 공식</strong>으로 센다.{" "}
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
                    <strong>one-dimensional</strong> — turning the input crank determines everything else through
                    loop closure. Sweep the driving angle and watch the coupler and rocker follow.
                </p>}
                ko={<p>
                    여기서 <InlineMath math='f_i'/>는 관절 <InlineMath math='i'/>의 자유도 수다. 아래의{" "}
                    <strong>Four-Bar Linkage</strong>는 가장 단순한 Closed Chain이다. 네 개의 링크(하나는 지면)와 네 개의 Revolute
                    Joint가 하나의 루프를 이룬다. 그뤼블러 공식은{" "}
                    <InlineMath math='3(4 - 1 - 4) + 4 = 1'/>을 주므로, 전체 configuration 공간이{" "}
                    <strong>1차원</strong>이다 — 입력 크랭크를 돌리면 루프 폐합을 통해 나머지 모두가 결정된다. 구동
                    각도를 훑으며 커플러와 로커가 따라 움직이는 것을 보라.
                </p>}
            />
            <FourBarLinkage/>

            <T en={<h2>Forward and Inverse Kinematics</h2>} ko={<h2>Forward Kinematics와 Inverse Kinematics</h2>}/>
            <T
                en={<p>
                    Take the planar <strong>3&times;RPR</strong> mechanism as a case study: a moving platform is held by
                    three legs, each an <strong>R</strong>evolute base joint, an actuated <strong>P</strong>rismatic
                    leg, and an <strong>R</strong>evolute platform joint. It has three degrees of freedom, matching the
                    planar pose <InlineMath math='(p_x, p_y, \phi)'/> of the platform; the three prismatic legs are
                    actuated and every revolute joint is passive. Let the fixed base points be{" "}
                    <InlineMath math='a_i'/> (in the fixed frame <InlineMath math='\{s\}'/>) and the platform attachment
                    points be <InlineMath math='b_i'/> (in the body frame <InlineMath math='\{b\}'/>).
                </p>}
                ko={<p>
                    평면 <strong>3&times;RPR</strong> 메커니즘을 사례 연구로 삼자. 가동 플랫폼이 세 개의 다리로
                    지지되며, 각 다리는 <strong>R</strong>evolute 베이스 관절, 구동되는 <strong>P</strong>rismatic
                    다리, 그리고 <strong>R</strong>evolute 플랫폼 관절로 이뤄진다. 자유도는 3이며, 플랫폼의 평면 자세{" "}
                    <InlineMath math='(p_x, p_y, \phi)'/>와 일치한다. 세 개의 Prismatic 다리가 구동되고 모든 Revolute Joint는
                    수동이다. 고정 베이스 점을 <InlineMath math='a_i'/>(고정 좌표계{" "}
                    <InlineMath math='\{s\}'/>), 플랫폼 부착 점을 <InlineMath math='b_i'/>(본체 좌표계{" "}
                    <InlineMath math='\{b\}'/>)라 하자.
                </p>}
            />
            <T
                en={<p>
                    Given the pose, each platform point in the fixed frame is{" "}
                    <InlineMath math='B_i = p + R(\phi)\,b_i'/>, so the leg length is simply the distance from{" "}
                    <InlineMath math='a_i'/> to <InlineMath math='B_i'/>:
                </p>}
                ko={<p>
                    자세가 주어지면, 고정 좌표계에서의 각 플랫폼 점은{" "}
                    <InlineMath math='B_i = p + R(\phi)\,b_i'/>이므로, 다리 길이는 단순히{" "}
                    <InlineMath math='a_i'/>에서 <InlineMath math='B_i'/>까지의 거리다:
                </p>}
            />
            <BlockMath math={`s_i^2 = \\big(p_x + b_{ix}\\cos\\phi - b_{iy}\\sin\\phi - a_{ix}\\big)^2 + \\big(p_y + b_{ix}\\sin\\phi + b_{iy}\\cos\\phi - a_{iy}\\big)^2`}/>
            <T
                en={<p>
                    <strong>Inverse kinematics is therefore a direct evaluation</strong> — plug in the pose and read off
                    the three leg lengths, with no iteration and no branching. Drag the pose sliders below and watch{" "}
                    <InlineMath math='s_1, s_2, s_3'/> update instantly; this trivial forward-to-actuator map is the
                    whole point of the figure.
                </p>}
                ko={<p>
                    <strong>따라서 Inverse Kinematics는 직접 계산이다</strong> — 자세를 대입하고 세 다리 길이를 읽어내면
                    되며, 반복도 분기도 없다. 아래의 자세 슬라이더를 끌면서{" "}
                    <InlineMath math='s_1, s_2, s_3'/>가 즉시 갱신되는 것을 보라. 이 단순한 자세-구동기 사상이 바로 이
                    그림의 핵심이다.
                </p>}
            />
            <RPRParallel/>
            <T
                en={<p>
                    The <strong>forward</strong> problem is the hard direction. Given the three lengths{" "}
                    <InlineMath math='s_1, s_2, s_3'/>, finding the pose <InlineMath math='(p_x, p_y, \phi)'/> means
                    solving the three constraint equations simultaneously. Applying the{" "}
                    <strong>tangent half-angle substitution</strong> <InlineMath math='t = \tan(\phi/2)'/> eliminates
                    the trigonometric terms and reduces the system to a single{" "}
                    <strong>sixth-order polynomial</strong> — so a given set of leg lengths can correspond to{" "}
                    <strong>up to six distinct platform poses</strong>.
                </p>}
                ko={<p>
                    <strong>Forward</strong> 문제가 어려운 방향이다. 세 길이{" "}
                    <InlineMath math='s_1, s_2, s_3'/>가 주어졌을 때 자세{" "}
                    <InlineMath math='(p_x, p_y, \phi)'/>를 찾는 것은 세 제약 방정식을 동시에 푸는 것을 뜻한다.{" "}
                    <strong>탄젠트 반각 치환</strong> <InlineMath math='t = \tan(\phi/2)'/>을 적용하면 삼각함수 항이
                    사라지고 계가 하나의 <strong>6차 다항식</strong>으로 줄어든다 — 따라서 주어진 다리 길이 집합이{" "}
                    <strong>최대 여섯 개의 서로 다른 플랫폼 자세</strong>에 대응할 수 있다.
                </p>}
            />
            <T
                en={<p>
                    The spatial analogue is the <strong>6&times;SPS Stewart–Gough platform</strong>, six actuated legs
                    each a <strong>S</strong>pherical–<strong>P</strong>rismatic–<strong>S</strong>pherical chain
                    between a fixed and a moving platform. Its inverse kinematics is just as trivial —{" "}
                    <InlineMath math='s_i = \lVert p + R b_i - a_i \rVert'/> — but its forward kinematics is far worse
                    than the planar case: it admits <strong>up to 40 solutions</strong>. This is exactly the serial/
                    parallel duality in its most extreme form.
                </p>}
                ko={<p>
                    공간에서의 대응물은 <strong>6&times;SPS 스튜어트–고프 플랫폼</strong>으로, 고정 플랫폼과 가동
                    플랫폼 사이에 각각 <strong>S</strong>pherical–<strong>P</strong>rismatic–<strong>S</strong>pherical
                    체인인 여섯 개의 구동 다리를 둔다. Inverse Kinematics는 마찬가지로 단순하지만 —{" "}
                    <InlineMath math='s_i = \lVert p + R b_i - a_i \rVert'/> — Forward Kinematics는 평면 경우보다 훨씬 나쁘다.{" "}
                    <strong>최대 40개의 해</strong>를 허용한다. 이것이 바로 가장 극단적인 형태의 직렬/병렬 쌍대성이다.
                </p>}
            />

            <T en={<h2>Differential Kinematics</h2>} ko={<h2>Differential Kinematics</h2>}/>
            <T
                en={<p>
                    Velocity kinematics for a closed chain must respect the loops. Only the <strong>actuated</strong>{" "}
                    joints receive commanded velocities; the <strong>passive</strong> joint velocities are then
                    determined by the constraints. Partition the joint vector into actuated{" "}
                    <InlineMath math='q_a'/> and passive <InlineMath math='q_p'/>. Differentiating the loop-closure
                    constraints with respect to time gives a linear relation between the two,
                </p>}
                ko={<p>
                    Closed Chain의 속도 Kinematics는 루프를 지켜야 한다. <strong>구동</strong> 관절만 명령 속도를 받고,{" "}
                    <strong>수동</strong> 관절 속도는 제약에 의해 결정된다. 관절 벡터를 구동{" "}
                    <InlineMath math='q_a'/>과 수동 <InlineMath math='q_p'/>으로 나눈다. 루프 폐합 제약을 시간에 대해
                    미분하면 둘 사이의 선형 관계가 나온다,
                </p>}
            />
            <BlockMath math={`H_a(q)\\,\\dot q_a + H_p(q)\\,\\dot q_p = 0 \\quad\\Longrightarrow\\quad \\dot q_p = -H_p^{-1}(q)\\,H_a(q)\\,\\dot q_a`}/>
            <T
                en={<p>
                    valid wherever <InlineMath math='H_p'/> is invertible. Once the passive velocities are recovered,
                    the end-effector twist is obtained from any single leg as{" "}
                    <InlineMath math='\mathcal{V} = J(q_a, q_p)\,\dot q_a'/>. The <strong>constraint Jacobian</strong> is
                    the piece that has no counterpart in an open chain: it is what couples the legs together, and its
                    rank governs how the commanded actuator velocities propagate to the platform.
                </p>}
                ko={<p>
                    이는 <InlineMath math='H_p'/>가 가역인 곳이면 어디서나 성립한다. 수동 속도를 복원하고 나면,
                    end-effector twist는 임의의 한 다리로부터{" "}
                    <InlineMath math='\mathcal{V} = J(q_a, q_p)\,\dot q_a'/>로 얻어진다. <strong>제약 Jacobian</strong>은
                    Open Chain에 대응물이 없는 부분이다. 다리들을 서로 결합하는 것이 바로 이것이며, 그 계수(rank)가
                    명령된 구동기 속도가 플랫폼으로 어떻게 전파되는지를 지배한다.
                </p>}
            />
            <T
                en={<p>
                    Statics gives an especially clean route for the Stewart–Gough platform. Because each leg is a
                    prismatic strut, the force it exerts on the platform acts <strong>along the leg</strong>, a pure
                    wrench whose screw axis is the leg's line. Collecting these six lines and applying the same
                    velocity–force duality used for open chains, <InlineMath math='\tau = J^{\mathsf T}\mathcal{F}'/>,
                    yields the <strong>inverse Jacobian</strong> directly from the leg geometry — no differentiation of a
                    forward-kinematics map is required.
                </p>}
                ko={<p>
                    Statics는 스튜어트–고프 플랫폼에 특히 깔끔한 경로를 준다. 각 다리가 Prismatic 스트럿이므로, 다리가
                    플랫폼에 가하는 힘은 <strong>다리를 따라</strong> 작용하며, 그 screw 축이 다리의 직선인 순수
                    wrench다. 이 여섯 개의 직선을 모아 Open Chain에 쓰던 것과 같은 속도–힘 쌍대성{" "}
                    <InlineMath math='\tau = J^{\mathsf T}\mathcal{F}'/>을 적용하면, 다리 기하로부터 곧바로{" "}
                    <strong>역 Jacobian</strong>이 나온다 — Forward Kinematics 사상의 미분이 전혀 필요 없다.
                </p>}
            />

            <T en={<h2>Singularities</h2>} ko={<h2>Singularity</h2>}/>
            <T
                en={<p>
                    Closed chains are richer than open ones near singularities, and it helps to separate three distinct
                    kinds.
                </p>}
                ko={<p>
                    Closed Chain은 Singularity 근처에서 Open Chain보다 풍부하며, 세 가지 서로 다른 종류로 나눠 보면 이해에
                    도움이 된다.
                </p>}
            />
            <T
                en={<ul className="list-disc pl-6 space-y-1">
                    <li>
                        <strong>Configuration-space singularities</strong> — points where the constraint-surface itself
                        is not a smooth manifold: self-intersections and bifurcations where the constraint Jacobian{" "}
                        <InlineMath math='\partial f/\partial\theta'/> loses rank. They are a property of the geometry
                        alone and are <strong>independent of which joints are actuated</strong>.
                    </li>
                    <li>
                        <strong>Actuator singularities</strong> — configurations where <InlineMath math='H_p'/> drops
                        rank (<InlineMath math='\operatorname{rank} H_p < p'/>), so the actuated joints can no longer be
                        controlled independently. A <em>nondegenerate</em> actuator singularity rigidifies the
                        mechanism when the actuators are locked; a <em>degenerate</em> one lets the inner links move
                        even with the actuators locked. These depend on the <strong>choice of actuated joints</strong>{" "}
                        and can often be removed by relocating an actuator.
                    </li>
                    <li>
                        <strong>End-effector singularities</strong> — the moving platform loses the ability to move
                        instantaneously in some direction, exactly as for an open chain. These depend on the
                        <strong> placement of the end-effector frame</strong>, not on the actuator choice.
                    </li>
                </ul>}
                ko={<ul className="list-disc pl-6 space-y-1">
                    <li>
                        <strong>configuration 공간 Singularity</strong> — 제약 곡면 자체가 매끄러운 다양체가 아닌 점들이다.
                        제약 Jacobian <InlineMath math='\partial f/\partial\theta'/>이 계수를 잃는 자기 교차와
                        분기점이다. 이는 오로지 기하의 성질이며 <strong>어느 관절이 구동되는지와 무관하다</strong>.
                    </li>
                    <li>
                        <strong>구동기 Singularity</strong> — <InlineMath math='H_p'/>가 계수를 잃는(
                        <InlineMath math='\operatorname{rank} H_p < p'/>) configuration으로, 구동 관절을 더 이상
                        독립적으로 제어할 수 없다. <em>비퇴화</em> 구동기 Singularity는 구동기를 잠갔을 때 메커니즘을
                        강체화한다. <em>퇴화</em> Singularity는 구동기를 잠가도 내부 링크가 움직이게 한다. 이들은{" "}
                        <strong>구동 관절의 선택</strong>에 의존하며 구동기를 재배치해 없앨 수 있는 경우가 많다.
                    </li>
                    <li>
                        <strong>end-effector Singularity</strong> — Open Chain에서와 똑같이, 가동 플랫폼이 어떤 방향으로
                        순간적으로 움직이는 능력을 잃는다. 이들은 구동기 선택이 아니라
                        <strong> end-effector 좌표계의 배치</strong>에 의존한다.
                    </li>
                </ul>}
            />
            <T
                en={<p>
                    The four-bar figure above makes the first kind visible. In its C-space panel the two curves are the
                    two <strong>assembly branches</strong>, and the marked points where they meet are{" "}
                    <strong>configuration-space singularities</strong> — bifurcation points where the coupler and rocker
                    become collinear, the two circle intersections merge, and the mechanism can switch from one branch to
                    the other. Because the meeting is a feature of the loop-closure surface itself, it stays put no
                    matter which joint we choose to drive.
                </p>}
                ko={<p>
                    위의 Four-Bar Linkage 그림이 첫 번째 종류를 눈에 보이게 한다. C-space 패널에서 두 곡선은 두{" "}
                    <strong>조립 가지</strong>이고, 그 곡선들이 만나는 표시된 점들이{" "}
                    <strong>configuration 공간 Singularity</strong>이다 — 커플러와 로커가 일직선이 되고, 두 원의 교점이
                    합쳐지며, 메커니즘이 한 가지에서 다른 가지로 전환될 수 있는 분기점이다. 이 만남은 루프 폐합 곡면
                    자체의 특징이므로, 어느 관절을 구동하기로 선택하든 그 자리에 그대로 있다.
                </p>}
            />
        </>
    )
}

export default Chapter7
