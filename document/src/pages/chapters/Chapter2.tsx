import {InlineMath} from "../../components/math/Tex";
import CoordinateExample from "../../components/pages/chapter2/CoordinateExample";
import UniversalJoint from "../../components/pages/chapter2/UniversalJoint";
import RevoluteJoint from "../../components/pages/chapter2/RevoluteJoint";
import PrismaticJoint from "../../components/pages/chapter2/PrismaticJoint";
import HelicalJoint from "../../components/pages/chapter2/HelicalJoint";
import CylindricalJoint from "../../components/pages/chapter2/CylindricalJoint";
import SphericalJoint from "../../components/pages/chapter2/SphericalJoint";
import {T} from "../../libs/i18n";

const Chapter2 = () => {
    return (
        <>
            <T
                en={<p>
                    A robot is a collection of rigid bodies (<strong>links</strong>) connected by{" "}
                    <strong>joints</strong>. Its <strong>configuration</strong> specifies the position of every
                    point of the robot; the minimum number of real-valued coordinates needed to describe it is the
                    number of <strong>degrees of freedom</strong> (DOF), and the space of all configurations is the{" "}
                    <strong>configuration space</strong> (C-space).
                </p>}
                ko={<p>
                    로봇은 <strong>관절</strong>로 연결된 강체들(<strong>링크</strong>)의 모음이다. 로봇의{" "}
                    <strong>configuration</strong>은 로봇의 모든 점의 위치를 지정한다. 이를 기술하는 데 필요한 최소한의
                    실수 좌표 개수가 <strong>자유도</strong>(DOF)이며, 모든 configuration의 공간이{" "}
                    <strong>configuration 공간</strong>(C-space)이다.
                </p>}
            />

            <T en={<h2>Degrees of Freedom of a Rigid Body</h2>} ko={<h2>강체의 자유도</h2>}/>
            <T
                en={<p>
                    A rigid body confined to the <strong>plane</strong> has three degrees of freedom: two to locate
                    a reference point <InlineMath math='(x, y)'/> and one for the orientation{" "}
                    <InlineMath math='\theta'/>. A rigid body free to move in <strong>space</strong> has six degrees
                    of freedom — three for position and three for orientation.
                </p>}
                ko={<p>
                    <strong>평면</strong>에 갇힌 강체는 자유도가 셋이다. 기준점{" "}
                    <InlineMath math='(x, y)'/> 을 정하는 둘과 방향{" "}
                    <InlineMath math='\theta'/> 을 정하는 하나다. <strong>공간</strong>에서 자유롭게 움직이는 강체는
                    자유도가 여섯 — 위치 셋과 방향 셋 — 이다.
                </p>}
            />
            <T
                en={<p>
                    A point constrained to a circle of radius <InlineMath math='r'/> is a small example: a single
                    angle <InlineMath math='\theta'/> is enough to place it, so its coordinates follow from
                </p>}
                ko={<p>
                    반지름 <InlineMath math='r'/> 의 원 위에 구속된 점이 간단한 예다. 하나의 각{" "}
                    <InlineMath math='\theta'/> 만으로 위치를 정할 수 있으므로, 좌표는 다음에서 얻어진다
                </p>}
            />
            <p className="justify-center flex gap-5">
                <InlineMath math='x = r \cos\theta'/>
                <InlineMath math='y = r \sin\theta'/>
            </p>
            <T
                en={<p>Drag the point below to see position and orientation change together.</p>}
                ko={<p>아래 점을 드래그하면 위치와 방향이 함께 변하는 것을 볼 수 있다.</p>}
            />
            <CoordinateExample className="bg-surface border border-border rounded-lg h-48"/>

            <T en={<h2>Degrees of Freedom of a Robot</h2>} ko={<h2>로봇의 자유도</h2>}/>
            <T
                en={<p>
                    Each joint connects two links and permits some freedoms while removing others. The DOF a joint
                    provides between the bodies it connects is shown with each joint below — a{" "}
                    <strong>revolute</strong> or <strong>prismatic</strong> joint gives one, while a{" "}
                    <strong>spherical</strong> joint gives three.
                </p>}
                ko={<p>
                    각 관절은 두 링크를 연결하며 일부 자유도를 허용하고 나머지를 제거한다. 관절이 연결하는 강체 사이에
                    제공하는 자유도는 아래 각 관절과 함께 표시했다 — <strong>Revolute</strong> Joint나{" "}
                    <strong>Prismatic</strong> Joint는 하나를, <strong>Spherical</strong> Joint는 셋을 제공한다.
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
            <T
                en={<p>
                    The DOF of the whole mechanism follows from <strong>Grübler's formula</strong>, which sums the
                    link freedoms and subtracts the joint constraints:
                </p>}
                ko={<p>
                    메커니즘 전체의 자유도는 <strong>그뤼블러 공식</strong>에서 얻어지는데, 링크들의 자유도를 더하고
                    관절 제약을 빼는 방식이다:
                </p>}
            />
            <p className="justify-center flex">
                <InlineMath math='\text{dof} = m(N - 1 - J) + \sum_{i=1}^{J} f_i'/>
            </p>
            <T
                en={<p>
                    Here <InlineMath math='m = 3'/> for planar and <InlineMath math='m = 6'/> for spatial
                    mechanisms, <InlineMath math='N'/> is the number of links (including ground),{" "}
                    <InlineMath math='J'/> the number of joints, and <InlineMath math='f_i'/> the DOF of joint{" "}
                    <InlineMath math='i'/>. When the joint constraints are not independent, the formula gives a lower
                    bound on the DOF.
                </p>}
                ko={<p>
                    여기서 <InlineMath math='m = 3'/> 은 평면, <InlineMath math='m = 6'/> 은 공간
                    메커니즘에 해당하고, <InlineMath math='N'/> 은 링크의 수(그라운드 포함),{" "}
                    <InlineMath math='J'/> 는 관절의 수, <InlineMath math='f_i'/> 는 관절{" "}
                    <InlineMath math='i'/> 의 자유도다. 관절 제약이 서로 독립이 아닐 때, 이 공식은 자유도의 하한을
                    준다.
                </p>}
            />

            <T en={<h2>Configuration Space: Topology and Representation</h2>} ko={<h2>Configuration 공간: 위상과 표현</h2>}/>
            <T
                en={<p>
                    Two C-spaces of the same dimension can still have different <strong>topology</strong> (shape) —
                    a plane and the surface of a sphere are both two-dimensional yet clearly different. The shape
                    determines how we <strong>represent</strong> the space.
                </p>}
                ko={<p>
                    차원이 같은 두 C-space 라도 <strong>위상</strong>(모양)은 다를 수 있다 — 평면과 구의 표면은
                    둘 다 2차원이지만 분명히 다르다. 이 모양이 공간을 어떻게 <strong>표현</strong>할지를 결정한다.
                </p>}
            />
            <T
                en={<p>
                    An <strong>explicit</strong> parametrization uses the minimum number{" "}
                    <InlineMath math='n'/> of coordinates (e.g. latitude and longitude on a sphere). An{" "}
                    <strong>implicit</strong> representation uses <InlineMath math='m > n'/> coordinates subject to{" "}
                    <InlineMath math='m - n'/> constraints (e.g. <InlineMath math='(x, y, z)'/> with{" "}
                    <InlineMath math='x^2 + y^2 + z^2 = 1'/>). This book favors implicit representations of
                    rigid-body configurations.
                </p>}
                ko={<p>
                    <strong>명시적</strong> 매개변수화는 최소 개수{" "}
                    <InlineMath math='n'/> 의 좌표를 사용한다(예: 구 위의 위도와 경도). <strong>암시적</strong>{" "}
                    표현은 <InlineMath math='m > n'/> 개의 좌표를{" "}
                    <InlineMath math='m - n'/> 개의 제약 아래 사용한다(예: <InlineMath math='(x, y, z)'/> 에{" "}
                    <InlineMath math='x^2 + y^2 + z^2 = 1'/>). 이 책은 강체 configuration의 암시적 표현을 선호한다.
                </p>}
            />

            <T en={<h2>Configuration and Velocity Constraints</h2>} ko={<h2>Configuration 제약과 속도 제약</h2>}/>
            <T
                en={<p>
                    A <strong>holonomic</strong> constraint restricts the configuration itself and reduces the
                    dimension of the C-space (this is how closed loops constrain a mechanism). A{" "}
                    <strong>velocity constraint</strong> restricts the allowed velocities; when such a Pfaffian
                    constraint cannot be integrated into a configuration constraint it is called{" "}
                    <strong>nonholonomic</strong> — the rolling of a wheel without slipping is the classic example.
                </p>}
                ko={<p>
                    <strong>holonomic</strong> 제약은 configuration 자체를 제한하여 C-space 의 차원을 줄인다(닫힌
                    루프가 메커니즘을 구속하는 방식이 이것이다). <strong>속도 제약</strong>은 허용되는 속도를
                    제한하는데, 이러한 Pfaffian 제약이 configuration 제약으로 적분될 수 없을 때{" "}
                    <strong>nonholonomic</strong>이라 부른다 — 미끄러짐 없이 구르는 바퀴가 대표적인 예다.
                </p>}
            />

            <T en={<h2>Task Space and Workspace</h2>} ko={<h2>Task 공간과 작업 공간</h2>}/>
            <T
                en={<p>
                    A robot arm usually carries an <strong>end-effector</strong> (a hand or gripper). The{" "}
                    <strong>task space</strong> is the space of positions and orientations of the end-effector frame,
                    chosen for the task rather than tied to any particular robot. The{" "}
                    <strong>workspace</strong> is the subset of the task space the end-effector frame can actually
                    reach.
                </p>}
                ko={<p>
                    로봇 팔은 보통 <strong>end-effector</strong>(손 또는 그리퍼)를 지닌다. <strong>task 공간</strong>은
                    end-effector 프레임의 위치와 방향의 공간으로, 특정 로봇에 얽매이지 않고 task를 기준으로 선택된다.{" "}
                    <strong>작업 공간</strong>은 end-effector 프레임이 실제로 도달할 수 있는 task 공간의 부분집합이다.
                </p>}
            />
        </>
    )
}

export default Chapter2
