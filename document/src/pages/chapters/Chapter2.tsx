import {BlockMath, InlineMath} from "../../components/math/Tex";
import CoordinateExample from "../../components/pages/chapter2/CoordinateExample";
import GrublerExplorer from "../../components/pages/chapter2/GrublerExplorer";
import RigidBodyPointCount from "../../components/pages/chapter2/RigidBodyPointCount";
import RollingCoin from "../../components/pages/chapter2/RollingCoin";
import TorusCSpace3D from "../../components/pages/chapter2/TorusCSpace3D";
import WorkspaceComparison from "../../components/pages/chapter2/WorkspaceComparison";
import UniversalJoint from "../../components/pages/chapter2/UniversalJoint";
import RevoluteJoint from "../../components/pages/chapter2/RevoluteJoint";
import PrismaticJoint from "../../components/pages/chapter2/PrismaticJoint";
import HelicalJoint from "../../components/pages/chapter2/HelicalJoint";
import CylindricalJoint from "../../components/pages/chapter2/CylindricalJoint";
import SphericalJoint from "../../components/pages/chapter2/SphericalJoint";
import {T, useTr} from "../../libs/i18n";

// Table 2.1 — 관절이 주는 자유도 f 와 제약 c (f + c = m).
const JOINT_TABLE: Array<{joint: string; f: number; cPlanar: string; cSpatial: number}> = [
    {joint: "Revolute (R)", f: 1, cPlanar: "2", cSpatial: 5},
    {joint: "Prismatic (P)", f: 1, cPlanar: "2", cSpatial: 5},
    {joint: "Helical (H)", f: 1, cPlanar: "–", cSpatial: 5},
    {joint: "Cylindrical (C)", f: 2, cPlanar: "–", cSpatial: 4},
    {joint: "Universal (U)", f: 2, cPlanar: "–", cSpatial: 4},
    {joint: "Spherical (S)", f: 3, cPlanar: "–", cSpatial: 3},
];

const Chapter2 = () => {
    const t = useTr();
    return (
        <>
            <T
                en={<p>
                    Perhaps the most fundamental question one can ask about a robot is: <em>where is it?</em>{" "}
                    The answer is the robot's <strong>configuration</strong>: a specification of the position of{" "}
                    <em>every</em> point of the robot. A door needs one number (the hinge angle{" "}
                    <InlineMath math='\theta'/>), a point on a plane needs two <InlineMath math='(x, y)'/>, and a
                    coin lying on a table needs three <InlineMath math='(x, y, \theta)'/>. The minimum number{" "}
                    <InlineMath math='n'/> of real-valued coordinates needed is the number of{" "}
                    <strong>degrees of freedom</strong> (DOF), and the <InlineMath math='n'/>-dimensional space of
                    all configurations is the <strong>configuration space</strong> (C-space): the robot's
                    configuration is a single point in it.
                </p>}
                ko={<p>
                    로봇에 관해 던질 수 있는 가장 근본적인 질문은 <em>지금 어디에 있는가?</em>다. 그 답이 로봇의{" "}
                    <strong>configuration</strong>, 곧 로봇의 <em>모든</em> 점의 위치를 지정하는 것이다. 문은 숫자
                    하나(경첩 각 <InlineMath math='\theta'/>), 평면 위의 점은 둘 <InlineMath math='(x, y)'/>, 탁자
                    위에 놓인 동전은 셋 <InlineMath math='(x, y, \theta)'/>이면 된다. 필요한 실수 좌표의 최소 개수{" "}
                    <InlineMath math='n'/> 이 <strong>자유도</strong>(DOF)이고, 모든 configuration이 이루는{" "}
                    <InlineMath math='n'/>차원 공간이 <strong>configuration 공간</strong>(C-space)이다. 로봇의
                    configuration은 그 안의 한 점이다.
                </p>}
            />

            <T en={<h2>Degrees of Freedom of a Rigid Body</h2>} ko={<h2>강체의 자유도</h2>}/>
            <T
                en={<p>
                    Why exactly three numbers for the planar coin? Pick three points{" "}
                    <InlineMath math='A, B, C'/> fixed to it. Their six coordinates would be six freedoms if the
                    points were independent. But rigidity fixes the three distances, e.g.
                </p>}
                ko={<p>
                    평면 동전에는 왜 정확히 세 개의 수가 필요할까? 동전에 고정된 세 점{" "}
                    <InlineMath math='A, B, C'/> 를 골라 보자. 점들이 서로 독립이라면 좌표 여섯 개가 그대로 여섯
                    자유도가 되겠지만, 강체라는 조건이 세 거리를 고정한다. 예컨대
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math='d(A, B) = \sqrt{(x_A - x_B)^2 + (y_A - y_B)^2} = d_{AB}'/>
            </div>
            <T
                en={<p>
                    Now count: <InlineMath math='A'/> can go anywhere (<strong>+2</strong>). Given{" "}
                    <InlineMath math='A'/>, the constraint <InlineMath math='d(A,B) = d_{AB}'/> traps{" "}
                    <InlineMath math='B'/> on a circle, so one angle <InlineMath math='\varphi_{AB}'/> suffices
                    (<strong>+1</strong>). Given <InlineMath math='A'/> and <InlineMath math='B'/>, the two
                    remaining constraints put <InlineMath math='C'/> at the intersection of two circles: just{" "}
                    <em>two</em> discrete points, heads or tails (<strong>+0</strong>). Any further point adds two
                    coordinates and two independent constraints, so nothing changes. Try it below.
                </p>}
                ko={<p>
                    이제 세어 보자. <InlineMath math='A'/> 는 어디든 갈 수 있다(<strong>+2</strong>).{" "}
                    <InlineMath math='A'/> 가 정해지면 제약 <InlineMath math='d(A,B) = d_{AB}'/> 이{" "}
                    <InlineMath math='B'/> 를 원 위에 가두므로 각 하나 <InlineMath math='\varphi_{AB}'/> 면
                    충분하다(<strong>+1</strong>). <InlineMath math='A'/> 와 <InlineMath math='B'/> 가 정해지면 남은
                    두 제약이 <InlineMath math='C'/> 를 두 원의 교점에 못박는다. heads 또는 tails, 딱 <em>두</em>
                    개의 이산적 후보만 남는 것이다(<strong>+0</strong>). 점을 더 추가해도 좌표 둘과 독립 제약 둘이 함께 생겨
                    달라지는 게 없다. 아래에서 직접 해 보자.
                </p>}
            />
            <RigidBodyPointCount/>
            <T
                en={<p>
                    We have been applying a general rule that works for any system:
                </p>}
                ko={<p>
                    지금 쓴 것은 어떤 시스템에나 통하는 일반 규칙이다:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math='\text{dof} = (\text{sum of freedoms of the points}) - (\text{number of independent constraints})'/>
            </div>
            <T
                en={<p>
                    The same count in three dimensions gives a <strong>spatial</strong> rigid body six freedoms:{" "}
                    <InlineMath math='A'/> is free in space (+3), <InlineMath math='B'/> lies on a sphere around{" "}
                    <InlineMath math='A'/> (latitude and longitude, +2), and <InlineMath math='C'/> lies on the
                    circle where two spheres intersect (+1): <InlineMath math='3 + 2 + 1 = 6'/>. A planar body is
                    just a spatial body with the three constraints <InlineMath math='z_A = z_B = z_C = 0'/>,
                    leaving <InlineMath math='6 - 3 = 3'/>.
                </p>}
                ko={<p>
                    같은 셈을 3차원에서 하면 <strong>공간</strong> 강체의 자유도 여섯이 나온다:{" "}
                    <InlineMath math='A'/> 는 공간에서 자유롭고(+3), <InlineMath math='B'/> 는{" "}
                    <InlineMath math='A'/> 중심의 구면 위에(위도와 경도, +2), <InlineMath math='C'/> 는 두 구가
                    만나는 원 위(+1)에 놓인다: <InlineMath math='3 + 2 + 1 = 6'/>. 평면 강체는 공간 강체에 제약
                    셋 <InlineMath math='z_A = z_B = z_C = 0'/> 을 건 것이니 <InlineMath math='6 - 3 = 3'/> 이다.
                </p>}
            />
            <T
                en={<p>
                    A point constrained to a circle of radius <InlineMath math='r'/> is the smallest example of
                    constraint counting: one angle <InlineMath math='\theta'/> places it, via{" "}
                    <InlineMath math='x = r \cos\theta'/>, <InlineMath math='y = r \sin\theta'/>. Drag the body
                    below to see position and orientation change together.
                </p>}
                ko={<p>
                    반지름 <InlineMath math='r'/> 의 원에 구속된 점은 제약 셈의 가장 작은 예다. 각 하나{" "}
                    <InlineMath math='\theta'/> 가 <InlineMath math='x = r \cos\theta'/>,{" "}
                    <InlineMath math='y = r \sin\theta'/> 로 위치를 정한다. 아래 물체를 드래그하면 위치와 방향이
                    함께 변하는 것을 볼 수 있다.
                </p>}
            />
            <CoordinateExample className="bg-surface border border-border rounded-lg h-48"/>

            <T en={<h2>Degrees of Freedom of a Robot</h2>} ko={<h2>로봇의 자유도</h2>}/>
            <T
                en={<p>
                    Every joint connects exactly two links. A joint can be seen two equivalent ways: as{" "}
                    <em>providing freedoms</em> (a hinge lets the door rotate) or as{" "}
                    <em>imposing constraints</em> (the hinge removes five of the door's six spatial freedoms).
                    Since a free body has <InlineMath math='m'/> freedoms (<InlineMath math='m = 3'/> planar,{" "}
                    <InlineMath math='m = 6'/> spatial), a joint with <InlineMath math='f'/> freedoms imposes
                    exactly <InlineMath math='c = m - f'/> constraints.
                </p>}
                ko={<p>
                    모든 관절은 정확히 두 링크를 연결한다. 관절은 두 가지 동등한 방식으로 볼 수 있다:{" "}
                    <em>자유도를 주는 것</em>(경첩은 문을 회전하게 한다) 또는 <em>제약을 거는 것</em>(경첩은 문이
                    가진 공간 자유도 여섯 중 다섯을 제거한다). 자유로운 강체의 자유도가{" "}
                    <InlineMath math='m'/> (평면 <InlineMath math='m = 3'/>, 공간 <InlineMath math='m = 6'/>)이므로,
                    자유도 <InlineMath math='f'/> 를 주는 관절은 정확히 <InlineMath math='c = m - f'/> 개의 제약을
                    건다.
                </p>}
            />
            <div className="flex flex-wrap justify-around">
                <RevoluteJoint/>
                <PrismaticJoint/>
                <HelicalJoint/>
                <CylindricalJoint/>
                <UniversalJoint/>
                <SphericalJoint/>
            </div>
            <div className="overflow-x-auto">
                <table className="table-center text-sm">
                    <thead>
                    <tr className="border-b border-border text-muted">
                        <th className="px-4 py-1.5">{t("Joint", "관절")}</th>
                        <th className="px-4 py-1.5"><InlineMath math='f'/> (dof)</th>
                        <th className="px-4 py-1.5">
                            <InlineMath math='c'/> {t("planar", "평면")} (<InlineMath math='3 - f'/>)
                        </th>
                        <th className="px-4 py-1.5">
                            <InlineMath math='c'/> {t("spatial", "공간")} (<InlineMath math='6 - f'/>)
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {JOINT_TABLE.map((r) => (
                        <tr key={r.joint} className="border-b border-border">
                            <td className="px-4 py-1.5">{r.joint}</td>
                            <td className="px-4 py-1.5 tabular-nums">{r.f}</td>
                            <td className="px-4 py-1.5 tabular-nums">{r.cPlanar}</td>
                            <td className="px-4 py-1.5 tabular-nums">{r.cSpatial}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <T en={<h2>Grübler's Formula</h2>} ko={<h2>Grübler 공식</h2>}/>
            <T
                en={<p>
                    The counting rule now yields a formula. Take a mechanism with{" "}
                    <InlineMath math='N'/> links (counting ground as a link) and <InlineMath math='J'/> joints
                    where joint <InlineMath math='i'/> provides <InlineMath math='f_i'/> freedoms. The moving
                    bodies contribute <InlineMath math='m(N-1)'/> freedoms, and each joint takes away{" "}
                    <InlineMath math='c_i = m - f_i'/> of them:
                </p>}
                ko={<p>
                    이제 셈 규칙이 공식이 된다. 링크 <InlineMath math='N'/> 개(그라운드도 링크로 센다)와 관절{" "}
                    <InlineMath math='J'/> 개로 이루어진 메커니즘을 보자. 관절 <InlineMath math='i'/> 는 자유도{" "}
                    <InlineMath math='f_i'/> 를 제공한다. 움직이는 링크들이 <InlineMath math='m(N-1)'/> 의 자유도를
                    가져오고, 각 관절이 그중 <InlineMath math='c_i = m - f_i'/> 개를 걷어간다:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath
                    math='\text{dof} \;=\; \underbrace{m(N-1)}_{\text{rigid-body freedoms}} \;-\; \underbrace{\textstyle\sum_{i=1}^{J} c_i}_{\text{joint constraints}} \;=\; m(N-1) - \sum_{i=1}^{J}(m - f_i) \;=\; m(N-1-J) + \sum_{i=1}^{J} f_i'/>
            </div>
            <T
                en={<p>
                    This is <strong>Grübler's formula</strong>. It assumes all joint constraints are{" "}
                    <em>independent</em>; when they are not, it only gives a <em>lower bound</em>. The
                    parallelogram linkage below is the classic offender. Work through each mechanism:
                </p>}
                ko={<p>
                    이것이 <strong>Grübler 공식</strong>이다. 모든 관절 제약이 <em>독립</em>이라는 가정이 깔려
                    있으며, 그렇지 않으면 <em>하한</em>만 준다. 아래의 평행사변형 링크가 그 고전적 반례다.
                    메커니즘을 하나씩 대입해 보자:
                </p>}
            />
            <GrublerExplorer/>
            <T
                en={<p>
                    The same bookkeeping scales to real machines. The <strong>Delta robot</strong>{" "}
                    (<InlineMath math='N = 17'/>, nine revolute and twelve spherical joints) gives{" "}
                    <InlineMath math='\text{dof} = 6(17-1-21) + 9(1) + 12(3) = 15'/>, but only three of those
                    freedoms move the end-effector platform (which stays parallel to the base); the other twelve
                    are internal torsions of the parallelogram-leg links about their own axes. Grübler counts{" "}
                    <em>all</em> freedoms, visible at the end-effector or not.
                </p>}
                ko={<p>
                    같은 셈은 실제 기계에도 그대로 통한다. <strong>Delta 로봇</strong>{" "}
                    (<InlineMath math='N = 17'/>, revolute 9개와 spherical 12개)은{" "}
                    <InlineMath math='\text{dof} = 6(17-1-21) + 9(1) + 12(3) = 15'/> 가 되는데, 그중 end-effector
                    플랫폼(항상 베이스와 평행을 유지)을 움직이는 것은 셋뿐이고, 나머지 열둘은 평행사변형 다리
                    링크들이 제 축을 도는 내부 비틀림이다. Grübler 공식은 end-effector 에 보이든 안 보이든{" "}
                    <em>모든</em> 자유도를 센다.
                </p>}
            />

            <T en={<h2>Configuration Space: Topology and Representation</h2>} ko={<h2>Configuration 공간: 위상과 표현</h2>}/>
            <T
                en={<p>
                    Dimension is not the whole story: C-spaces also have <strong>shape</strong>. A point on a
                    plane and a point on a sphere both have two-dimensional C-spaces, yet the plane extends
                    forever while the sphere wraps around. Two spaces are <strong>topologically equivalent</strong>{" "}
                    if one can be continuously deformed into the other without cutting or gluing: a sphere and an
                    (American) football are equivalent; a sphere and a plane are not. The basic one-dimensional
                    shapes are the circle <InlineMath math='S^1'/>, the line{" "}
                    <InlineMath math='\mathbb{E}^1 \,(\cong \mathbb{R}^1)'/>, and the closed interval{" "}
                    <InlineMath math='[a, b]'/> (an <em>open</em> interval stretches to a line, so it is
                    equivalent to <InlineMath math='\mathbb{R}^1'/>).
                </p>}
                ko={<p>
                    차원이 전부가 아니다. C-space 에는 <strong>모양</strong>도 있다. 평면 위의 점과 구면 위의 점은
                    둘 다 2차원 C-space 를 갖지만, 평면은 무한히 뻗고 구면은 감아 돈다. 한 공간을 자르거나 붙이지
                    않고 연속 변형만으로 다른 공간으로 만들 수 있으면 두 공간은{" "}
                    <strong>위상적으로 동치</strong>다: 구와 (미식)축구공은 동치지만, 구와 평면은 아니다. 1차원의
                    기본 모양은 원 <InlineMath math='S^1'/>, 직선{" "}
                    <InlineMath math='\mathbb{E}^1 \,(\cong \mathbb{R}^1)'/>, 닫힌 구간{" "}
                    <InlineMath math='[a, b]'/> 이다 (<em>열린</em> 구간은 늘이면 직선이 되므로{" "}
                    <InlineMath math='\mathbb{R}^1'/> 과 동치다).
                </p>}
            />
            <T
                en={<p>
                    Many C-spaces are <strong>Cartesian products</strong> of simpler ones, so the factors can be
                    read straight off the mechanism: a planar rigid body has C-space{" "}
                    <InlineMath math='\mathbb{R}^2 \times S^1'/>; a PR arm,{" "}
                    <InlineMath math='\mathbb{R}^1 \times S^1'/>; a spatial rigid body,{" "}
                    <InlineMath math='\mathbb{R}^3 \times S^2 \times S^1'/> (position, direction, roll: the{" "}
                    <InlineMath math='3+2+1'/> count again); and a 2R arm,{" "}
                    <InlineMath math='S^1 \times S^1 = T^2'/>. That last one is the <strong>torus</strong>, not the sphere{" "}
                    <InlineMath math='S^2'/>. Below, the two joint angles literally live on a doughnut.
                </p>}
                ko={<p>
                    많은 C-space 는 더 단순한 공간들의 <strong>데카르트 곱</strong>이라서 메커니즘에서 인자를 바로
                    읽어낼 수 있다: 평면 강체는 <InlineMath math='\mathbb{R}^2 \times S^1'/>, PR 팔은{" "}
                    <InlineMath math='\mathbb{R}^1 \times S^1'/>, 공간 강체는{" "}
                    <InlineMath math='\mathbb{R}^3 \times S^2 \times S^1'/> (위치, 방향, 롤: 다시 그{" "}
                    <InlineMath math='3+2+1'/> 셈)이다. 그리고 2R 팔은 <InlineMath math='S^1 \times S^1 = T^2'/>,
                    곧 구면 <InlineMath math='S^2'/> 이 아니라 <strong>torus</strong> 다. 아래에서 두 관절각은 말
                    그대로 도넛 위에 산다.
                </p>}
            />
            <TorusCSpace3D/>
            <T
                en={<p>
                    To compute we must <strong>represent</strong> the space with real numbers, and the shape
                    dictates the options. An <strong>explicit parametrization</strong> uses exactly{" "}
                    <InlineMath math='n'/> coordinates, like latitude and longitude on a sphere. Its price is{" "}
                    <strong>singularities of the representation</strong>: walk at constant speed near the North
                    Pole and your longitude changes wildly, even though the sphere itself looks the same
                    everywhere. The singularity belongs to the coordinates, not the space. One fix is an{" "}
                    <strong>atlas</strong> of overlapping charts, switching charts before a singularity is
                    reached; the bookkeeping is the cost.
                </p>}
                ko={<p>
                    계산을 하려면 공간을 실수들로 <strong>표현</strong>해야 하는데, 공간의 모양이 선택지를 결정한다.{" "}
                    <strong>명시적 매개변수화</strong>는 정확히 <InlineMath math='n'/> 개의 좌표를 쓴다. 구면의
                    위도·경도가 그 예다. 그 대가가 <strong>표현의 특이점</strong>이다: 북극 근처를 일정한 속력으로
                    걸어도 경도는 요동친다. 구면 자체는 어디서나 똑같이 생겼으니, 특이점은 공간이 아니라 좌표의
                    것이다. 해결책 하나는 겹치는 차트들의 <strong>아틀라스</strong>를 만들어 특이점에 닿기 전에
                    차트를 갈아타는 것인데, 그 장부 관리가 비용이다.
                </p>}
            />
            <T
                en={<p>
                    The other fix, and the one this book adopts, is an <strong>implicit representation</strong>:
                    embed the space in a higher-dimensional Euclidean space and impose constraints, like the unit
                    sphere as <InlineMath math='(x, y, z)'/> with{" "}
                    <InlineMath math='x^2 + y^2 + z^2 = 1'/>. More numbers, but <em>no</em> singularities, one
                    chart for the whole space. And for closed chains an implicit representation is exactly what
                    the loop-closure equations already give us. The flagship example arrives in Chapter 3: nine
                    numbers with six constraints, the <strong>rotation matrix</strong>, representing the three
                    orientation freedoms.
                </p>}
                ko={<p>
                    다른 해결책이자 여기서 택하는 쪽은 <strong>암시적 표현</strong>이다: 공간을 더 높은 차원의
                    유클리드 공간에 넣고 제약을 거는 것으로, 단위 구면을 <InlineMath math='(x, y, z)'/> 와{" "}
                    <InlineMath math='x^2 + y^2 + z^2 = 1'/> 로 나타내는 식이다. 숫자는 늘지만 특이점이{" "}
                    <em>없고</em>, 차트 하나로 공간 전체를 덮는다. 그리고 closed chain 에서는 루프 방정식이 이미
                    암시적 표현을 공짜로 준다. 대표 사례는 3장에서 만난다: 방향 자유도 셋을 아홉 개의 수와 여섯
                    개의 제약으로 나타내는 <strong>회전 행렬</strong>이다.
                </p>}
            />

            <T en={<h2>Configuration and Velocity Constraints</h2>} ko={<h2>Configuration 제약과 속도 제약</h2>}/>
            <T
                en={<p>
                    For the one-DOF four-bar linkage, view the loop as a serial 4R chain whose tip must return to
                    the origin with horizontal orientation. That single demand is three equations in the four
                    joint angles, the <strong>loop-closure equations</strong>:
                </p>}
                ko={<p>
                    자유도 1 의 4절 링크에서, 루프를 "tip 이 반드시 원점으로 돌아와 수평 방향을 유지해야 하는 직렬
                    4R 체인"으로 보자. 그 요구 하나가 관절각 네 개에 대한 방정식 세 개, 곧{" "}
                    <strong>루프 닫힘(loop-closure) 방정식</strong>이 된다:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math='\begin{aligned}
L_1 \cos\theta_1 + L_2 \cos(\theta_1 + \theta_2) + \cdots + L_4 \cos(\theta_1 + \cdots + \theta_4) &= 0\\
L_1 \sin\theta_1 + L_2 \sin(\theta_1 + \theta_2) + \cdots + L_4 \sin(\theta_1 + \cdots + \theta_4) &= 0\\
\theta_1 + \theta_2 + \theta_3 + \theta_4 - 2\pi &= 0
\end{aligned}'/>
            </div>
            <T
                en={<p>
                    Four unknowns minus three independent equations leaves a one-dimensional solution curve in
                    the joint space: the C-space. In general, <InlineMath math='k'/> independent{" "}
                    <strong>holonomic constraints</strong> <InlineMath math='g(\theta) = 0'/>,{" "}
                    <InlineMath math='g: \mathbb{R}^n \to \mathbb{R}^k'/>, carve an{" "}
                    <InlineMath math='(n-k)'/>-dimensional surface in <InlineMath math='\mathbb{R}^n'/>.
                    Differentiating <InlineMath math='g(\theta(t)) = 0'/> along any motion gives a constraint on
                    velocities:
                </p>}
                ko={<p>
                    미지수 넷에서 독립 방정식 셋을 빼면 관절 공간 안의 1차원 해 곡선이 남는다. 그것이 C-space 다.
                    일반적으로 <InlineMath math='k'/> 개의 독립 <strong>holonomic 제약</strong>{" "}
                    <InlineMath math='g(\theta) = 0'/>, <InlineMath math='g: \mathbb{R}^n \to \mathbb{R}^k'/> 는{" "}
                    <InlineMath math='\mathbb{R}^n'/> 안에 <InlineMath math='(n-k)'/> 차원 곡면을 깎아낸다. 임의의
                    운동을 따라 <InlineMath math='g(\theta(t)) = 0'/> 을 미분하면 속도에 대한 제약이 나온다:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math='\frac{d}{dt}\, g(\theta(t)) = \frac{\partial g}{\partial \theta}(\theta)\, \dot\theta = 0
\quad\Longrightarrow\quad A(\theta)\,\dot\theta = 0,\;\; A(\theta) \in \mathbb{R}^{k \times n}'/>
            </div>
            <T
                en={<p>
                    Velocity constraints of the form <InlineMath math='A(\theta)\dot\theta = 0'/> are called{" "}
                    <strong>Pfaffian constraints</strong>. When <InlineMath math='A'/> is the Jacobian of some{" "}
                    <InlineMath math='g'/>, the constraint is <strong>integrable</strong> back into a
                    configuration constraint; such constraints are holonomic. But not every Pfaffian constraint integrates. The
                    classic counterexample: an upright coin of radius <InlineMath math='r'/> rolling without
                    slipping, with configuration{" "}
                    <InlineMath math='q = (x, y, \phi, \theta) \in \mathbb{R}^2 \times T^2'/> (contact point,
                    steering angle, rolling angle). No slip means the contact point moves only along the heading,
                    at speed <InlineMath math='r\dot\theta'/>:
                </p>}
                ko={<p>
                    <InlineMath math='A(\theta)\dot\theta = 0'/> 꼴의 속도 제약을{" "}
                    <strong>Pfaffian 제약</strong>이라 부른다. <InlineMath math='A'/> 가 어떤{" "}
                    <InlineMath math='g'/> 의 Jacobian 이면 제약은 configuration 제약으로 되돌려{" "}
                    <strong>적분 가능</strong>하다. 즉 holonomic 이다. 그러나 모든 Pfaffian 제약이 적분되는 것은
                    아니다. 고전적 반례가 미끄러짐 없이 구르는 반지름 <InlineMath math='r'/> 의 세워진 동전으로,
                    configuration 은{" "}
                    <InlineMath math='q = (x, y, \phi, \theta) \in \mathbb{R}^2 \times T^2'/> (접촉점, 조향각,
                    굴림각)이다. 미끄러지지 않는다는 것은 접촉점이 오직 진행 방향으로, 속력{" "}
                    <InlineMath math='r\dot\theta'/> 로만 움직인다는 뜻이다:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math='\begin{bmatrix} \dot x \\ \dot y \end{bmatrix} = r\dot\theta \begin{bmatrix} \cos\phi \\ \sin\phi \end{bmatrix}
\quad\Longleftrightarrow\quad
\begin{bmatrix} 1 & 0 & 0 & -r\cos\phi \\ 0 & 1 & 0 & -r\sin\phi \end{bmatrix} \dot q = 0'/>
            </div>
            <T
                en={<p>
                    Try to integrate the first row: <InlineMath math='\partial g_1/\partial x = 1'/> forces{" "}
                    <InlineMath math='g_1 = x + h(\phi, \theta)'/>, but{" "}
                    <InlineMath math='\partial g_1/\partial \theta = -r\cos\phi'/> forces a{" "}
                    <InlineMath math='\phi'/>-dependent term <InlineMath math='-r\theta\cos\phi'/>, contradicting{" "}
                    <InlineMath math='\partial g_1/\partial \phi = 0'/>. No such <InlineMath math='g'/> exists:
                    the constraint is <strong>nonholonomic</strong>. It cuts the dimension of feasible{" "}
                    <em>velocities</em> from 4 to 2, yet the coin can still reach <em>every</em> point of its
                    4-dimensional C-space. A car's wheels obey exactly the same constraint. Drive the one
                    below, then let it show you the parallel-parking trick:
                </p>}
                ko={<p>
                    첫 행을 적분해 보자. <InlineMath math='\partial g_1/\partial x = 1'/> 은{" "}
                    <InlineMath math='g_1 = x + h(\phi, \theta)'/> 를 강제하는데,{" "}
                    <InlineMath math='\partial g_1/\partial \theta = -r\cos\phi'/> 는{" "}
                    <InlineMath math='\phi'/> 에 의존하는 항 <InlineMath math='-r\theta\cos\phi'/> 를 요구해서{" "}
                    <InlineMath math='\partial g_1/\partial \phi = 0'/> 과 모순이다. 그런{" "}
                    <InlineMath math='g'/> 는 존재하지 않는다: 이 제약은 <strong>nonholonomic</strong> 이다. 허용{" "}
                    <em>속도</em>의 차원을 4에서 2로 줄이지만, 동전은 여전히 4차원 C-space 의 <em>모든</em> 점에
                    도달할 수 있다. 자동차 바퀴가 정확히 같은 제약을 따른다. 아래 차를 직접 몰아 보고, 평행
                    주차 시연도 시켜 보자:
                </p>}
            />
            <RollingCoin/>

            <T en={<h2>Task Space and Workspace</h2>} ko={<h2>Task 공간과 작업 공간</h2>}/>
            <T
                en={<p>
                    Two last spaces concern only the <strong>end-effector</strong>, not the whole robot. The{" "}
                    <strong>task space</strong> is where the task naturally lives. It is chosen by the task,
                    independent of the robot: <InlineMath math='\mathbb{R}^2'/> for plotting with a pen, the
                    rigid-body C-space for manipulating an object, <InlineMath math='S^2'/> for aiming a laser.
                    The <strong>workspace</strong> is the set of end-effector configurations the robot can
                    actually reach; it is determined by the robot's structure, independent of any task.
                </p>}
                ko={<p>
                    마지막 두 공간은 로봇 전체가 아니라 <strong>end-effector</strong> 만을 다룬다.{" "}
                    <strong>Task 공간</strong>은 task 가 자연스럽게 사는 곳으로, 로봇과 무관하게 task 가 정한다:
                    펜으로 그리는 일이면 <InlineMath math='\mathbb{R}^2'/>, 물체 조작이면 강체의 C-space, 레이저
                    조준이면 <InlineMath math='S^2'/>. <strong>작업 공간</strong>은 end-effector 가 실제로 도달할
                    수 있는 configuration 의 집합으로, task 와 무관하게 로봇의 구조가 정한다.
                </p>}
            />
            <T
                en={<p>
                    Neither is the C-space: a single end-effector point may be reachable in many robot
                    configurations (a 7-joint arm at a 6-DOF pose), robots with <em>different</em> C-spaces can
                    share the <em>same</em> workspace, and vice versa. Below, a 2R arm with links{" "}
                    <InlineMath math='(3, 3)'/> and a 3R arm with links <InlineMath math='(2, 2, 2)'/> sweep
                    exactly the same disk:
                </p>}
                ko={<p>
                    둘 다 C-space 는 아니다: end-effector 의 한 점이 여러 robot configuration 으로 도달될 수 있고
                    (7관절 팔의 6자유도 자세), C-space 가 <em>다른</em> 로봇들이 <em>같은</em> 작업 공간을 가질
                    수도, 그 반대일 수도 있다. 아래에서 링크 <InlineMath math='(3, 3)'/> 의 2R 팔과 링크{" "}
                    <InlineMath math='(2, 2, 2)'/> 의 3R 팔은 정확히 같은 원판을 쓸어낸다:
                </p>}
            />
            <WorkspaceComparison/>
            <T
                en={<p>
                    Real examples: the <strong>SCARA</strong> arm (RRRP) has end-effector configurations{" "}
                    <InlineMath math='(x, y, z, \phi)'/>, so its task space is{" "}
                    <InlineMath math='\mathbb{R}^3 \times S^1'/> and its workspace the reachable{" "}
                    <InlineMath math='(x, y, z)'/> volume (every <InlineMath math='\phi'/> is available
                    everywhere). A 3R wrist whose axes meet at a point can orient a frame arbitrarily but never
                    move its center: its workspace is the orientation space{" "}
                    <InlineMath math='S^2 \times S^1'/>, distinct from its C-space <InlineMath math='T^3'/>.
                </p>}
                ko={<p>
                    실제 예: <strong>SCARA</strong> 팔(RRRP)의 end-effector configuration 은{" "}
                    <InlineMath math='(x, y, z, \phi)'/> 여서 task 공간은{" "}
                    <InlineMath math='\mathbb{R}^3 \times S^1'/>, 작업 공간은 도달 가능한{" "}
                    <InlineMath math='(x, y, z)'/> 부피다 (모든 <InlineMath math='\phi'/> 가 어디서든 가능).
                    세 축이 한 점에서 만나는 3R 손목은 프레임의 방향은 마음대로 만들지만 중심은 결코 옮기지
                    못한다: 작업 공간은 방향 공간 <InlineMath math='S^2 \times S^1'/> 이고, C-space{" "}
                    <InlineMath math='T^3'/> 과는 다르다.
                </p>}
            />
        </>
    )
}

export default Chapter2
