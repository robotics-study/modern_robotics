import {BlockMath, InlineMath} from "../../components/math/Tex";
import {T} from "../../libs/i18n";
import RotatingFrame from "../../components/pages/chapter3/RotatingFrame";
import ExponentialRotation from "../../components/pages/chapter3/ExponentialRotation";
import FixedVsBodyRotation from "../../components/pages/chapter3/FixedVsBodyRotation";
import HomogeneousTransform from "../../components/pages/chapter3/HomogeneousTransform";
import PlanarTwistCenter from "../../components/pages/chapter3/PlanarTwistCenter";
import ScrewMotion from "../../components/pages/chapter3/ScrewMotion";
import WrenchBalance from "../../components/pages/chapter3/WrenchBalance";
import WrenchIntuition from "../../components/pages/chapter3/WrenchIntuition";

const Chapter3 = () => {
    return (
        <>
            <T
                en={<p>
                    Chapter 2 told us a rigid body needs six numbers; this chapter builds the machinery that
                    actually carries them. We attach a frame to the body and represent its configuration as a{" "}
                    <InlineMath math='4 \times 4'/> matrix: an <em>implicit</em> representation with more
                    numbers than DOF but no singularities, and one whose matrix product does triple duty:
                    representing configurations, changing reference frames, and displacing bodies. Velocities
                    fare even better: although the C-space is curved, velocities live in a flat{" "}
                    <InlineMath math='\mathbb{R}^6'/> as <strong>twists</strong> (angular + linear velocity),
                    forces as <strong>wrenches</strong> (moment + force), and every rigid-body motion turns out
                    to be a <strong>screw motion</strong>. This is the geometric heart of the whole book.
                </p>}
                ko={<p>
                    2장에서 강체에는 여섯 개의 수가 필요함을 보았다. 이 장은 그 수들을 실제로 다루는 기계를
                    만든다. 물체에 프레임을 붙이고 그 configuration을 <InlineMath math='4 \times 4'/> 행렬로
                    나타낸다. 자유도보다 수가 많지만 특이점이 없는 <em>암시적</em> 표현이고, 행렬 곱 하나가
                    configuration 표현·기준 프레임 변경·강체 이동의 세 가지 일을 해낸다. 속도는 더 좋다:
                    C-space 는 굽어 있어도 속도는 평평한 <InlineMath math='\mathbb{R}^6'/> 에 산다.
                    각속도+선속도가 <strong>twist</strong>, 모멘트+힘이 <strong>wrench</strong> 가 되고, 모든
                    강체 운동은 <strong>screw motion</strong> 임이 드러난다. 이후 모든 장을 떠받치는 기하다.
                </p>}
            />

            <T en={<h2>Rigid-Body Motion</h2>} ko={<h2>Rigid-Body Motion</h2>}/>
            <T
                en={<p>
                    Start in the plane. Fix a frame <InlineMath math='\{s\}'/> and attach a frame{" "}
                    <InlineMath math='\{b\}'/> to the body. The configuration of <InlineMath math='\{b\}'/> is
                    its origin <InlineMath math='p'/> plus the directions of its axes, packaged as columns:
                </p>}
                ko={<p>
                    평면에서 시작하자. 고정 프레임 <InlineMath math='\{s\}'/> 를 두고 물체에 프레임{" "}
                    <InlineMath math='\{b\}'/> 를 붙인다. <InlineMath math='\{b\}'/> 의 configuration은 원점{" "}
                    <InlineMath math='p'/> 와 축의 방향들이고, 축들을 열로 묶으면:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math='P = [\hat{\mathrm{x}}_b \;\; \hat{\mathrm{y}}_b] =
\begin{bmatrix} \cos\theta & -\sin\theta \\ \sin\theta & \cos\theta \end{bmatrix}'/>
            </div>
            <T
                en={<p>
                    Four numbers, three constraints (unit columns, orthogonality), one DOF parametrized by{" "}
                    <InlineMath math='\theta'/>: our first <strong>rotation matrix</strong>. The pair{" "}
                    <InlineMath math='(P, p)'/> serves three purposes: it <em>represents</em>{" "}
                    <InlineMath math='\{b\}'/> in <InlineMath math='\{s\}'/>; it <em>changes reference
                    frames</em> (<InlineMath math='R = PQ,\; r = Pq + p'/> converts a frame expressed in{" "}
                    <InlineMath math='\{b\}'/> to <InlineMath math='\{s\}'/>); and it <em>displaces</em> rigid
                    bodies (<InlineMath math="R' = PR,\; r' = Pr + p"/>). And a preview of what is coming: any
                    such planar displacement equals a single rotation of some angle{" "}
                    <InlineMath math='\beta'/> about some fixed point <InlineMath math='s'/>: a planar{" "}
                    <strong>screw motion</strong> with coordinates <InlineMath math='(\beta, s_x, s_y)'/>.
                </p>}
                ko={<p>
                    수 넷에 제약 셋(단위 열, 직교)이니 자유도는 하나, <InlineMath math='\theta'/> 로 매개된다. 첫{" "}
                    <strong>회전 행렬</strong>이다. 쌍 <InlineMath math='(P, p)'/> 는 세 가지 일을 한다:{" "}
                    <InlineMath math='\{s\}'/> 안의 <InlineMath math='\{b\}'/> 를 <em>표현</em>하고, <em>기준
                    프레임을 바꾸며</em> (<InlineMath math='R = PQ,\; r = Pq + p'/> 가 <InlineMath math='\{b\}'/>{" "}
                    표현을 <InlineMath math='\{s\}'/> 표현으로 바꾼다), 강체를 <em>이동</em>시킨다
                    (<InlineMath math="R' = PR,\; r' = Pr + p"/>). 그리고 다가올 것의 예고편: 이런 평면 이동은
                    모두 어떤 고정점 <InlineMath math='s'/> 둘레의 단일 회전 <InlineMath math='\beta'/> 와 같다.
                    좌표 <InlineMath math='(\beta, s_x, s_y)'/> 를 갖는 평면 <strong>screw motion</strong> 이다.
                </p>}
            />
            <T
                en={<p>
                    In space the same story needs <InlineMath math='R = [\hat{\mathrm{x}}_b \;
                    \hat{\mathrm{y}}_b \; \hat{\mathrm{z}}_b] \in \mathbb{R}^{3\times 3}'/>. Where do its
                    constraints come from? Each column is a unit vector (3 equations) and the columns are
                    mutually orthogonal (3 more): six constraints on nine numbers, written compactly as{" "}
                    <InlineMath math='R^T R = I'/>. That still allows left-handed frames: taking determinants
                    gives <InlineMath math='\det R = \pm 1'/>, and demanding right-handedness{" "}
                    (<InlineMath math='\hat{\mathrm{x}}_b \times \hat{\mathrm{y}}_b = \hat{\mathrm{z}}_b'/>)
                    picks <InlineMath math='\det R = +1'/>. Hence:
                </p>}
                ko={<p>
                    공간에서는 <InlineMath math='R = [\hat{\mathrm{x}}_b \; \hat{\mathrm{y}}_b \;
                    \hat{\mathrm{z}}_b] \in \mathbb{R}^{3\times 3}'/> 가 필요하다. 제약은 어디서 오는가? 각
                    열이 단위 벡터(방정식 3개)이고 열들이 서로 직교(3개 더)다. 아홉 수에 여섯 제약이며, 이를
                    묶어 쓰면 <InlineMath math='R^T R = I'/> 다. 이것만으로는 왼손 프레임도 허용된다: 행렬식을
                    취하면 <InlineMath math='\det R = \pm 1'/> 이 나오고, 오른손 조건{" "}
                    (<InlineMath math='\hat{\mathrm{x}}_b \times \hat{\mathrm{y}}_b = \hat{\mathrm{z}}_b'/>)이{" "}
                    <InlineMath math='\det R = +1'/> 을 고른다. 따라서:
                </p>}
            />
            <T
                en={<p><strong>Definition</strong> : the special orthogonal group <InlineMath math='SO(3)'/>,
                    the group of rotation matrices, is the set of all <InlineMath math='3 \times 3'/> real
                    matrices <InlineMath math='R'/> satisfying
                </p>}
                ko={<p><strong>정의</strong> : 특수 직교군 <InlineMath math='SO(3)'/>, 곧 회전 행렬의 군은
                    다음을 만족하는 모든 <InlineMath math='3 \times 3'/> 실수 행렬 <InlineMath math='R'/> 의
                    집합이다
                </p>}
            />
            <BlockMath math='R^TR=I \ \text{and}\ \det R = 1'/>
            <T
                en={<p>
                    <strong>Group properties</strong>, each a one-line check: the inverse is{" "}
                    <InlineMath math='R^{-1} = R^T \in SO(3)'/> (from <InlineMath math='R^TR = I'/>); products
                    stay in the group (<InlineMath math='(R_1R_2)^T R_1 R_2 = R_2^T R_2 = I'/>,{" "}
                    <InlineMath math='\det R_1 R_2 = 1'/>); multiplication is associative but{" "}
                    <em>not commutative</em> (except in <InlineMath math='SO(2)'/>); and rotations preserve
                    lengths: <InlineMath math='\|Rx\|^2 = x^TR^TRx = \|x\|^2'/>.
                </p>}
                ko={<p>
                    <strong>군 성질</strong>은 각각 한 줄짜리 검산이다. 역행렬은{" "}
                    <InlineMath math='R^{-1} = R^T \in SO(3)'/> (<InlineMath math='R^TR = I'/> 에서); 곱은 군에
                    머문다 (<InlineMath math='(R_1R_2)^T R_1 R_2 = R_2^T R_2 = I'/>,{" "}
                    <InlineMath math='\det R_1 R_2 = 1'/>); 곱셈은 결합적이지만 <em>가환이 아니다</em>{" "}
                    (<InlineMath math='SO(2)'/> 만 예외); 그리고 회전은 길이를 보존한다:{" "}
                    <InlineMath math='\|Rx\|^2 = x^TR^TRx = \|x\|^2'/>.
                </p>}
            />
            <T
                en={<p>
                    Like <InlineMath math='(P, p)'/>, a rotation matrix has <strong>three uses</strong>:
                    representing an orientation (<InlineMath math='R_{sb}'/>), changing reference frames by the{" "}
                    <strong>subscript cancellation rule</strong>{" "}
                    <InlineMath math='R_{ab}R_{bc} = R_{ac},\; R_{ab}\,p_b = p_a'/>, and rotating. As an
                    operator, <InlineMath math='R = \operatorname{Rot}(\hat\omega, \theta)'/> rotates by{" "}
                    <InlineMath math='\theta'/> about the axis <InlineMath math='\hat\omega'/>, e.g.
                </p>}
                ko={<p>
                    <InlineMath math='(P, p)'/> 처럼 회전 행렬도 <strong>세 가지 용도</strong>를 갖는다: 방향의
                    표현 (<InlineMath math='R_{sb}'/>), <strong>아래첨자 소거 규칙</strong>{" "}
                    <InlineMath math='R_{ab}R_{bc} = R_{ac},\; R_{ab}\,p_b = p_a'/> 에 의한 기준 프레임 변경,
                    그리고 회전시키기. 연산자로서{" "}
                    <InlineMath math='R = \operatorname{Rot}(\hat\omega, \theta)'/> 는 축{" "}
                    <InlineMath math='\hat\omega'/> 둘레로 <InlineMath math='\theta'/> 만큼 돌린다. 예컨대
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math='\operatorname{Rot}(\hat{\mathrm{z}}, \theta) =
\begin{bmatrix} \cos\theta & -\sin\theta & 0 \\ \sin\theta & \cos\theta & 0 \\ 0 & 0 & 1 \end{bmatrix}'/>
            </div>
            <T
                en={<p>
                    But <em>which</em> axis? Multiplication order decides.{" "}
                    <InlineMath math='RR_{sb}'/> (pre-multiply) rotates <InlineMath math='\{b\}'/> about{" "}
                    <InlineMath math='\hat\omega'/> read in the <strong>fixed frame</strong>;{" "}
                    <InlineMath math='R_{sb}R'/> (post-multiply) rotates about the same numeric axis read in
                    the <strong>body frame</strong>. Sweep θ below and watch the two results diverge:
                </p>}
                ko={<p>
                    그런데 <em>어느</em> 축인가? 곱하는 순서가 결정한다. 앞곱 <InlineMath math='RR_{sb}'/> 는{" "}
                    <InlineMath math='\hat\omega'/> 를 <strong>고정 프레임</strong>에서 읽어{" "}
                    <InlineMath math='\{b\}'/> 를 돌리고, 뒤곱 <InlineMath math='R_{sb}R'/> 은 같은 수치의
                    축을 <strong>물체 프레임</strong>에서 읽어 돌린다. 아래에서 θ 를 훑으며 두 결과가 갈라지는
                    것을 보라:
                </p>}
            />
            <FixedVsBodyRotation/>
            <T
                en={<p><strong>Skew-symmetric matrices</strong> : for{" "}
                    <InlineMath math='x = (x_1, x_2, x_3)'/> define
                </p>}
                ko={<p><strong>반대칭 행렬</strong> : <InlineMath math='x = (x_1, x_2, x_3)'/> 에 대해 다음과
                    같이 정의한다
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math='[x] = \begin{bmatrix} 0 & -x_3 & x_2 \\ x_3 & 0 & -x_1 \\ -x_2 & x_1 & 0 \end{bmatrix},
\qquad [x]\,y = x \times y'/>
            </div>
            <T
                en={<p>
                    so the bracket turns cross products into matrix products. The set of all such matrices is{" "}
                    <InlineMath math='\mathfrak{so}(3)'/>. One identity we will use constantly, rotating a
                    cross product: for any <InlineMath math='\omega \in \mathbb{R}^3'/>,{" "}
                    <InlineMath math='R \in SO(3)'/>,
                </p>}
                ko={<p>
                    즉 괄호 표기는 외적을 행렬 곱으로 바꾼다. 이런 행렬 전체의 집합이{" "}
                    <InlineMath math='\mathfrak{so}(3)'/> 이다. 앞으로 줄곧 쓸 항등식 하나, 외적의 회전:
                    임의의 <InlineMath math='\omega \in \mathbb{R}^3'/>, <InlineMath math='R \in SO(3)'/> 에
                    대해
                </p>}
            />
            <BlockMath math='R[\omega]R^T = [R\omega]'/>

            <T en={<h2>Angular velocities</h2>} ko={<h2>각속도</h2>}/>
            <T
                en={<p>
                    Angular velocity <InlineMath math='\omega'/> (orange) is a vector: its direction is the rotation
                    axis and its length the rate <InlineMath math='\dot{\theta}'/>. Every point of the body then moves
                    with velocity <InlineMath math='v = \omega \times r'/>, always <strong>tangent</strong> to the
                    circle it traces (cyan arrows at the axis tips). A point lying on the axis itself, like the{" "}
                    <InlineMath math='\hat{y}'/> tip along <InlineMath math='\omega'/>, has{" "}
                    <InlineMath math='\omega \times r = 0'/> and stays put. This is why the linear velocities below
                    are <InlineMath math='\dot{\hat{x}} = \omega \times \hat{x}'/> and so on.
                </p>}
                ko={<p>
                    각속도 <InlineMath math='\omega'/>(주황)는 벡터이다: 방향은 회전축이고 크기는 회전률{" "}
                    <InlineMath math='\dot{\theta}'/> 이다. 그러면 물체의 모든 점은 속도{" "}
                    <InlineMath math='v = \omega \times r'/> 로 움직이며, 그 점이 그리는 원에 항상{" "}
                    <strong>접선</strong> 방향이다(축 끝의 청록 화살표). 축 위에 놓인 점, 예컨대{" "}
                    <InlineMath math='\omega'/> 방향의 <InlineMath math='\hat{y}'/> 끝점은{" "}
                    <InlineMath math='\omega \times r = 0'/> 이라 제자리에 머문다. 아래의 선속도가{" "}
                    <InlineMath math='\dot{\hat{x}} = \omega \times \hat{x}'/> 등인 이유다.
                </p>}
            />
            <RotatingFrame/>
            <T
                en={<p>
                    Write <InlineMath math='\omega = \hat\omega\dot\theta'/> and apply{" "}
                    <InlineMath math='\dot{\hat{x}} = \omega \times \hat{x}'/> to the three columns{" "}
                    <InlineMath math='r_i'/> of <InlineMath math='R'/> (the body axes expressed in{" "}
                    <InlineMath math='\{s\}'/>). Stacking the three column equations gives one matrix equation,
                    and the bracket removes the cross product:
                </p>}
                ko={<p>
                    <InlineMath math='\omega = \hat\omega\dot\theta'/> 로 쓰고,{" "}
                    <InlineMath math='\dot{\hat{x}} = \omega \times \hat{x}'/> 를 <InlineMath math='R'/> 의 세
                    열 <InlineMath math='r_i'/> (<InlineMath math='\{s\}'/> 로 표현한 물체 축들)에 적용하자. 세
                    열 방정식을 쌓으면 행렬 방정식 하나가 되고, 괄호 표기가 외적을 지운다:
                </p>}
            />
            <BlockMath
                math={`\\begin{gathered}
                    \\dot{R} =
                    \\begin{bmatrix}
                    \\omega_s \\times r_1, & \\omega_s \\times r_2, & \\omega_s \\times r_3
                    \\end{bmatrix} = \\omega_s \\times R \\\\[6pt]
                    [\\omega_s] R = \\dot{R}
                    \\quad\\Longrightarrow\\quad
                    [\\omega_s] = \\dot{R} R^{-1}
                    \\end{gathered}`}/>
            <T
                en={<p>
                    For the body-frame version, write <InlineMath math='R'/> explicitly as{" "}
                    <InlineMath math='R_{sb}'/>; subscript cancellation gives{" "}
                    <InlineMath math='\omega_b = R_{sb}^{-1}\omega_s = R^T\omega_s'/>, and with{" "}
                    <InlineMath math='R[\omega]R^T = [R\omega]'/>:
                </p>}
                ko={<p>
                    물체 프레임 버전은 <InlineMath math='R'/> 을 <InlineMath math='R_{sb}'/> 로 명시해 쓰면
                    아래첨자 소거로 <InlineMath math='\omega_b = R_{sb}^{-1}\omega_s = R^T\omega_s'/> 가 되고,{" "}
                    <InlineMath math='R[\omega]R^T = [R\omega]'/> 를 쓰면:
                </p>}
            />
            <BlockMath math={`[\\omega_b] = [R^T \\omega_s]
                    = R^T [\\omega_s] R
                    = R^T (\\dot{R} R^{-1}) R = R^T \\dot{R}
                    = R^{-1} \\dot{R} `}/>
            <T
                en={<p>
                    Note the symmetry: <InlineMath math='\dot RR^{-1} = [\omega_s]'/> and{" "}
                    <InlineMath math='R^{-1}\dot R = [\omega_b]'/>. Also note what{" "}
                    <InlineMath math='\omega_b'/> is <em>not</em>: it is not "angular velocity relative to a
                    moving frame". It is the same physical <InlineMath math='\mathrm{w}'/>, merely expressed
                    in the stationary frame that momentarily coincides with the body.
                </p>}
                ko={<p>
                    대칭에 주목하라: <InlineMath math='\dot RR^{-1} = [\omega_s]'/>,{" "}
                    <InlineMath math='R^{-1}\dot R = [\omega_b]'/>. 그리고 <InlineMath math='\omega_b'/> 가{" "}
                    <em>아닌</em> 것도 봐 두자: "움직이는 프레임에 상대적인 각속도"가 아니라, 같은 물리량{" "}
                    <InlineMath math='\mathrm{w}'/> 를 지금 이 순간 물체와 겹쳐 있는 정지 프레임에서 표현한
                    것일 뿐이다.
                </p>}
            />

            <T
                en={<h2>Exponential Coordinate Representation of Rotation</h2>}
                ko={<h2>회전의 Exponential Coordinate 표현</h2>}
            />
            <T
                en={<p><strong>Definition</strong> : The exponential coordinates parametrize
                    a rotation matrix in terms of a rotation axis (represented by a unit vector <InlineMath
                        math='\hat{\omega}'/>)
                    and an angle of rotation <InlineMath math='\theta'/> about that axis; the vector <InlineMath
                        math='\hat{\omega}\theta \in \mathbb{R}^3'/> then
                    serves as the three-parameter exponential coordinate representation of the rotation.
                </p>}
                ko={<p><strong>정의</strong> : Exponential Coordinates는 회전 행렬을 회전축(단위 벡터 <InlineMath
                        math='\hat{\omega}'/> 로 표현)과
                    그 축 둘레의 회전각 <InlineMath math='\theta'/> 로 매개변수화한다; 그러면 벡터 <InlineMath
                        math='\hat{\omega}\theta \in \mathbb{R}^3'/> 가
                    회전의 세 파라미터 Exponential Coordinate 표현이 된다.
                </p>}
            />
            <T
                en={<p>
                    Why "exponential"? Rotate a vector <InlineMath math='p'/> about{" "}
                    <InlineMath math='\hat\omega'/> at 1 rad/s. Its tip traces a circle, so its velocity is{" "}
                    <InlineMath math='\dot p = \hat\omega \times p = [\hat\omega]\,p'/>, a <em>linear</em>{" "}
                    ODE. The scalar equation <InlineMath math='\dot x = ax'/> has solution{" "}
                    <InlineMath math='x(t) = e^{at}x_0'/>; for the matrix version we <em>define</em>
                </p>}
                ko={<p>
                    왜 "exponential"인가? 벡터 <InlineMath math='p'/> 를 <InlineMath math='\hat\omega'/> 둘레로
                    1 rad/s 로 돌리자. 끝점은 원을 그리므로 속도는{" "}
                    <InlineMath math='\dot p = \hat\omega \times p = [\hat\omega]\,p'/>, 즉 <em>선형</em>{" "}
                    미분방정식이다. 스칼라 방정식 <InlineMath math='\dot x = ax'/> 의 해가{" "}
                    <InlineMath math='x(t) = e^{at}x_0'/> 이듯, 행렬 버전에서는 다음과 같이 <em>정의</em>한다
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math='e^{At} = I + At + \frac{(At)^2}{2!} + \frac{(At)^3}{3!} + \cdots
\quad\Longrightarrow\quad p(\theta) = e^{[\hat\omega]\theta} p(0)'/>
            </div>
            <T
                en={<p>
                    The series looks infinite, but the powers of <InlineMath math='[\hat\omega]'/> repeat: a
                    direct computation gives <InlineMath math='[\hat\omega]^3 = -[\hat\omega]'/>, so every
                    higher power folds back to <InlineMath math='[\hat\omega]'/> or{" "}
                    <InlineMath math='[\hat\omega]^2'/>. Grouping the two families,
                </p>}
                ko={<p>
                    급수는 무한해 보이지만 <InlineMath math='[\hat\omega]'/> 의 거듭제곱은 반복된다: 직접
                    계산하면 <InlineMath math='[\hat\omega]^3 = -[\hat\omega]'/> 이고, 따라서 모든 고차항이{" "}
                    <InlineMath math='[\hat\omega]'/> 아니면 <InlineMath math='[\hat\omega]^2'/> 로 접힌다. 두
                    갈래로 모으면,
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math='e^{[\hat\omega]\theta} = I +
\underbrace{\left(\theta - \frac{\theta^3}{3!} + \frac{\theta^5}{5!} - \cdots\right)}_{\sin\theta}[\hat\omega] +
\underbrace{\left(\frac{\theta^2}{2!} - \frac{\theta^4}{4!} + \cdots\right)}_{1 - \cos\theta}[\hat\omega]^2'/>
            </div>
            <T
                en={<p>
                    and the two parenthesized series are exactly <InlineMath math='\sin\theta'/> and{" "}
                    <InlineMath math='1 - \cos\theta'/>. The infinite series collapses to{" "}
                    <strong>Rodrigues' formula</strong>:
                </p>}
                ko={<p>
                    괄호 안 두 급수는 정확히 <InlineMath math='\sin\theta'/> 와{" "}
                    <InlineMath math='1 - \cos\theta'/> 다. 무한 급수가{" "}
                    <strong>Rodrigues 공식</strong>으로 접힌다:
                </p>}
            />
            <BlockMath math='R = e^{[\hat{\omega}]\theta} = I + \sin\theta\,[\hat\omega] + (1 - \cos\theta)\,[\hat\omega]^2 \in SO(3)'/>
            <T
                en={<p>
                    Drag the slider to sweep the angle <InlineMath math='\theta'/> about a fixed axis{" "}
                    <InlineMath math='\hat{\omega}'/> (orange) and watch the nine entries of{" "}
                    <InlineMath math='R'/>, computed live from Rodrigues' formula, track the frame.
                </p>}
                ko={<p>
                    슬라이더로 고정축 <InlineMath math='\hat{\omega}'/>(주황) 둘레의 각{" "}
                    <InlineMath math='\theta'/> 를 훑으며, Rodrigues 공식으로 실시간 계산되는{" "}
                    <InlineMath math='R'/> 의 아홉 성분이 프레임을 따라가는 것을 보라.
                </p>}
            />
            <ExponentialRotation/>
            <T
                en={<p>
                    <strong>Matrix logarithm</strong> is the inverse problem: given <InlineMath math='R'/>,
                    recover <InlineMath math='\hat\omega\theta'/>. Subtract the transpose of Rodrigues'
                    formula from itself: the <InlineMath math='I'/> and{" "}
                    <InlineMath math='[\hat\omega]^2'/> terms are symmetric and cancel, leaving{" "}
                    <InlineMath math='R - R^T = 2\sin\theta\,[\hat\omega]'/>. Take the trace of Rodrigues'
                    formula: <InlineMath math='\operatorname{tr} R = 1 + 2\cos\theta'/>. Hence the algorithm,
                    for <InlineMath math='\theta \in [0, \pi]'/>:
                </p>}
                ko={<p>
                    <strong>Matrix logarithm</strong> 은 역문제다: <InlineMath math='R'/> 이 주어졌을 때{" "}
                    <InlineMath math='\hat\omega\theta'/> 를 되찾기. Rodrigues 공식에서 전치를 빼면{" "}
                    <InlineMath math='I'/> 와 <InlineMath math='[\hat\omega]^2'/> 항은 대칭이라 소거되고{" "}
                    <InlineMath math='R - R^T = 2\sin\theta\,[\hat\omega]'/> 만 남는다. 트레이스를 취하면{" "}
                    <InlineMath math='\operatorname{tr} R = 1 + 2\cos\theta'/>. 여기서{" "}
                    <InlineMath math='\theta \in [0, \pi]'/> 에 대한 알고리즘이 나온다:
                </p>}
            />
            <ul className="list-disc pl-6 space-y-1">
                <T
                    en={<li>If <InlineMath math='R = I'/>: <InlineMath math='\theta = 0'/>,{" "}
                        <InlineMath math='\hat\omega'/> undefined.</li>}
                    ko={<li><InlineMath math='R = I'/> 이면: <InlineMath math='\theta = 0'/>,{" "}
                        <InlineMath math='\hat\omega'/> 는 정의되지 않는다.</li>}
                />
                <T
                    en={<li>If <InlineMath math='\operatorname{tr} R = -1'/>:{" "}
                        <InlineMath math='\theta = \pi'/> and, from{" "}
                        <InlineMath math='R = I + 2[\hat\omega]^2'/>,{" "}
                        <InlineMath math='\hat\omega = \frac{1}{\sqrt{2(1+r_{33})}}(r_{13}, r_{23}, 1+r_{33})'/>{" "}
                        (or the analogous formula on another column); both{" "}
                        <InlineMath math='\pm\hat\omega'/> work.</li>}
                    ko={<li><InlineMath math='\operatorname{tr} R = -1'/> 이면:{" "}
                        <InlineMath math='\theta = \pi'/> 이고,{" "}
                        <InlineMath math='R = I + 2[\hat\omega]^2'/> 에서{" "}
                        <InlineMath math='\hat\omega = \frac{1}{\sqrt{2(1+r_{33})}}(r_{13}, r_{23}, 1+r_{33})'/>{" "}
                        (또는 다른 열 기준의 대응식). <InlineMath math='\pm\hat\omega'/> 둘 다 답이다.</li>}
                />
                <T
                    en={<li>Otherwise:{" "}
                        <InlineMath math='\theta = \cos^{-1}\!\big(\tfrac{1}{2}(\operatorname{tr} R - 1)\big)'/>{" "}
                        and <InlineMath math='[\hat\omega] = \frac{1}{2\sin\theta}(R - R^T)'/>.</li>}
                    ko={<li>그 밖에는:{" "}
                        <InlineMath math='\theta = \cos^{-1}\!\big(\tfrac{1}{2}(\operatorname{tr} R - 1)\big)'/>,{" "}
                        <InlineMath math='[\hat\omega] = \frac{1}{2\sin\theta}(R - R^T)'/>.</li>}
                />
            </ul>
            <T
                en={<p>
                    Since the log always returns <InlineMath math='\|\hat\omega\theta\| \le \pi'/>, we can
                    picture <InlineMath math='SO(3)'/> as a <strong>solid ball of radius{" "}
                    <InlineMath math='\pi'/></strong>: a point <InlineMath math='r'/> in the ball is the
                    rotation by <InlineMath math='\|r\|'/> about <InlineMath math='r/\|r\|'/>, and antipodal
                    surface points are the <em>same</em> rotation (the <InlineMath math='\theta = \pi'/>{" "}
                    ambiguity above). Singularities like this are the fate of <em>every</em> three-parameter
                    representation (Euler angles included), which is precisely why we compute with{" "}
                    <InlineMath math='R'/> itself.
                </p>}
                ko={<p>
                    로그는 항상 <InlineMath math='\|\hat\omega\theta\| \le \pi'/> 를 돌려주므로{" "}
                    <InlineMath math='SO(3)'/> 를 <strong>반지름 <InlineMath math='\pi'/> 의 꽉 찬 공</strong>으로
                    그릴 수 있다: 공 안의 점 <InlineMath math='r'/> 은 축 <InlineMath math='r/\|r\|'/> 둘레{" "}
                    <InlineMath math='\|r\|'/> 회전이고, 표면의 대척점 쌍은 <em>같은</em> 회전이다. 위의{" "}
                    <InlineMath math='\theta = \pi'/> 모호성이 그것이다. 이런 특이점은 <em>모든</em> 세-파라미터
                    표현(오일러 각 포함)의 숙명이고, 그래서 여기서는 <InlineMath math='R'/> 자체로 계산한다.
                </p>}
            />

            <T en={<h2>Homogeneous Transformation</h2>} ko={<h2>Homogeneous Transformation</h2>}/>
            <T
                en={<p><strong>Definition</strong> : The special Euclidean group <InlineMath math='SE(3)'/>, also known as
                    the group of rigid-body motions or homogeneous transformation matrices in <InlineMath
                        math='\mathbb{R}^3'/>, is the set of all <InlineMath math='4 \times 4'/> real matrices <InlineMath
                        math='T'/> of the form
                </p>}
                ko={<p><strong>정의</strong> : 특수 유클리드군 <InlineMath math='SE(3)'/>는 <InlineMath
                        math='\mathbb{R}^3'/> 에서의 Rigid-Body Motion 또는 Homogeneous Transformation 행렬의 군이라고도 하며, 다음 형태의 모든{" "}
                    <InlineMath math='4 \times 4'/> 실수 행렬 <InlineMath
                        math='T'/> 의 집합이다
                </p>}
            />
            <BlockMath math={`T = \\begin{bmatrix} R & p \\\\ 0 & 1 \\end{bmatrix}, \\quad R \\in SO(3), \\ p \\in \\mathbb{R}^3`}/>
            <T
                en={<p>
                    Below, the body frame moves as a rigid body: at every instant it has a position{" "}
                    <InlineMath math='p'/> (violet vector from the origin) and an orientation <InlineMath math='R'/>,
                    and a single <InlineMath math='T'/> captures both. Drag to orbit.
                </p>}
                ko={<p>
                    아래에서 물체 좌표계는 강체로서 움직인다: 매 순간 위치{" "}
                    <InlineMath math='p'/>(원점에서 나온 보라색 벡터)와 방향 <InlineMath math='R'/> 을 가지며,
                    단일 <InlineMath math='T'/> 가 둘 다 담는다. 끌어서 시점을 돌려보라.
                </p>}
            />
            <HomogeneousTransform/>
            <T
                en={<p>
                    Why the funny last row? Append a 1 to a point,{" "}
                    <InlineMath math='\tilde{x} = (x, 1)'/>: then{" "}
                    <InlineMath math='T\tilde{x} = (Rx + p,\, 1)'/>. One matrix product applies rotation{" "}
                    <em>and</em> translation. These <strong>homogeneous coordinates</strong> also make
                    composition and inversion pure linear algebra:
                </p>}
                ko={<p>
                    마지막 행은 왜 붙는가? 점에 1 을 덧붙여 <InlineMath math='\tilde{x} = (x, 1)'/> 로 만들면{" "}
                    <InlineMath math='T\tilde{x} = (Rx + p,\, 1)'/> 이 된다. 행렬 곱 한 번이 회전<em>과</em> 병진을
                    함께 적용한다. 이 <strong>동차 좌표</strong> 덕에 합성과 역변환도 순수한 선형대수가 된다:
                </p>}
            />
            <BlockMath math={`T^{-1} = \\begin{bmatrix} R^T & -R^T p \\\\ 0 & 1 \\end{bmatrix},
\\qquad T_{ab}T_{bc} = T_{ac}, \\qquad T_{ab}\\,v_b = v_a`}/>
            <T
                en={<p>
                    <InlineMath math='T'/> preserves distances and angles between points, which is exactly what
                    "rigid" means. And like <InlineMath math='R'/>, it has the same <strong>three uses</strong>:
                    represent, change frames, displace. As a displacement operator{" "}
                    <InlineMath math='T = \operatorname{Trans}(p)\operatorname{Rot}(\hat\omega, \theta)'/>, the
                    order question returns with the same answer:
                </p>}
                ko={<p>
                    <InlineMath math='T'/> 는 점들 사이의 거리와 각을 보존한다. "강체"의 뜻 그대로다. 그리고{" "}
                    <InlineMath math='R'/> 처럼 같은 <strong>세 가지 용도</strong>(표현, 프레임 변경, 이동)를
                    갖는다. 이동 연산자{" "}
                    <InlineMath math='T = \operatorname{Trans}(p)\operatorname{Rot}(\hat\omega, \theta)'/> 로
                    쓰면, 곱 순서 문제가 같은 답과 함께 돌아온다:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math='TT_{sb}\;(\text{fixed frame: rotate about } \hat\omega \text{ in } \{s\}\text{, translate in } \{s\})
\qquad
T_{sb}T\;(\text{body frame})'/>
            </div>
            <T
                en={<p>
                    Chained frames solve real problems. A camera <InlineMath math='\{d\}'/> sees a wheeled base{" "}
                    <InlineMath math='\{b\}'/> and an object <InlineMath math='\{e\}'/>{" "}
                    (<InlineMath math='T_{db}, T_{de}'/>); joint angles give the hand{" "}
                    <InlineMath math='T_{bc}'/>; the camera pose <InlineMath math='T_{ad}'/> is known. What is
                    the object relative to the hand? Chain and cancel subscripts:
                </p>}
                ko={<p>
                    프레임 사슬은 실제 문제를 푼다. 카메라 <InlineMath math='\{d\}'/> 가 이동 베이스{" "}
                    <InlineMath math='\{b\}'/> 와 물체 <InlineMath math='\{e\}'/> 를 보고{" "}
                    (<InlineMath math='T_{db}, T_{de}'/>), 관절각이 손의 <InlineMath math='T_{bc}'/> 를 주며,
                    카메라 자세 <InlineMath math='T_{ad}'/> 는 이미 안다. 손에 대한 물체의 자세는? 사슬을 잇고
                    아래첨자를 소거하면 된다:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math='T_{ce} = T_{bc}^{-1} T_{db}^{-1} T_{de}
= (T_{ad}T_{db}T_{bc})^{-1}\,T_{ad}T_{de}'/>
            </div>

            <T en={<h2>Rigid-Body Motions and Twists</h2>} ko={<h2>Rigid-Body Motion과 Twist</h2>}/>
            <T
                en={<p>
                    For rotations, <InlineMath math='R^{-1}\dot R'/> was the angular velocity. What is{" "}
                    <InlineMath math='T^{-1}\dot T'/>? Multiply the blocks:
                </p>}
                ko={<p>
                    회전에서는 <InlineMath math='R^{-1}\dot R'/> 이 각속도였다.{" "}
                    <InlineMath math='T^{-1}\dot T'/> 는 무엇일까? 블록끼리 곱해 보자:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math='T^{-1}\dot T =
\begin{bmatrix} R^T & -R^Tp \\ 0 & 1 \end{bmatrix}
\begin{bmatrix} \dot R & \dot p \\ 0 & 0 \end{bmatrix} =
\begin{bmatrix} R^T\dot R & R^T\dot p \\ 0 & 0 \end{bmatrix} =
\begin{bmatrix} [\omega_b] & v_b \\ 0 & 0 \end{bmatrix} = [\mathcal{V}_b] \in \mathfrak{se}(3)'/>
            </div>
            <T
                en={<p>
                    The top-left block is the body angular velocity we already know, and{" "}
                    <InlineMath math='v_b = R^T\dot p'/> is the velocity of the frame origin expressed in{" "}
                    <InlineMath math='\{b\}'/>. Stacked, <InlineMath
                    math='\mathcal{V}_b = (\omega_b, v_b) \in \mathbb{R}^6'/> is the <strong>body
                    twist</strong>. The other order gives the <strong>spatial twist</strong>:
                </p>}
                ko={<p>
                    좌상단 블록은 이미 아는 물체 각속도이고, <InlineMath math='v_b = R^T\dot p'/> 는 프레임
                    원점의 속도를 <InlineMath math='\{b\}'/> 로 표현한 것이다. 쌓으면{" "}
                    <InlineMath math='\mathcal{V}_b = (\omega_b, v_b) \in \mathbb{R}^6'/> 이{" "}
                    <strong>body twist</strong> 다. 곱 순서를 바꾸면 <strong>spatial twist</strong> 가 나온다:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math='\dot TT^{-1} =
\begin{bmatrix} [\omega_s] & v_s \\ 0 & 0 \end{bmatrix} = [\mathcal{V}_s],
\qquad v_s = \dot p - \omega_s \times p = \dot p + \omega_s \times (-p)'/>
            </div>
            <T
                en={<p>
                    Here is the subtlety: <InlineMath math='v_s'/> is <em>not</em>{" "}
                    <InlineMath math='\dot p'/>. Imagine the moving body extended to fill all of space;{" "}
                    <InlineMath math='v_s'/> is the velocity of the body point <em>currently passing through
                    the <InlineMath math='\{s\}'/> origin</em>. The planar demo makes this concrete: every
                    planar twist is an instantaneous rotation about some center <InlineMath math='q'/>, and{" "}
                    <InlineMath math='v_s'/> is the red arrow at the origin:
                </p>}
                ko={<p>
                    미묘한 점이 여기 있다: <InlineMath math='v_s'/> 는 <InlineMath math='\dot p'/> 가{" "}
                    <em>아니다</em>. 움직이는 물체를 공간 전체를 채울 만큼 키웠다고 상상하면,{" "}
                    <InlineMath math='v_s'/> 는 <em>지금 <InlineMath math='\{s\}'/> 원점을 지나고 있는 물체
                    점</em>의 속도다. 평면 데모가 이를 손에 잡히게 한다. 모든 평면 twist 는 어떤 중심{" "}
                    <InlineMath math='q'/> 둘레의 순간 회전이고, <InlineMath math='v_s'/> 는 원점의 빨간
                    화살표다:
                </p>}
            />
            <PlanarTwistCenter/>
            <T
                en={<p>
                    How do the two representations relate? Conjugation:{" "}
                    <InlineMath math='[\mathcal{V}_s] = T[\mathcal{V}_b]T^{-1}'/>. Expanding the blocks and
                    using <InlineMath math='R[\omega]R^T = [R\omega]'/> packages the result as a{" "}
                    <InlineMath math='6\times 6'/> matrix, the <strong>adjoint representation</strong>:
                </p>}
                ko={<p>
                    두 표현은 어떻게 이어지는가? Conjugation{" "}
                    <InlineMath math='[\mathcal{V}_s] = T[\mathcal{V}_b]T^{-1}'/> 이다. 블록을 전개하고{" "}
                    <InlineMath math='R[\omega]R^T = [R\omega]'/> 를 쓰면 결과가{" "}
                    <InlineMath math='6\times 6'/> 행렬 하나로 묶인다. <strong>adjoint 표현</strong>이다:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math='\mathcal{V}_s = [\mathrm{Ad}_{T_{sb}}]\,\mathcal{V}_b,
\qquad [\mathrm{Ad}_T] = \begin{bmatrix} R & 0 \\ [p]R & R \end{bmatrix} \in \mathbb{R}^{6\times 6},
\qquad [\mathrm{Ad}_{T_1}][\mathrm{Ad}_{T_2}] = [\mathrm{Ad}_{T_1T_2}]'/>
            </div>
            <T
                en={<p>
                    <strong>Screws.</strong> Just as <InlineMath math='\omega = \hat\omega\dot\theta'/>, every
                    twist is a <strong>screw axis</strong> times a speed:{" "}
                    <InlineMath math='\mathcal{V} = \mathcal{S}\dot\theta'/>. Geometrically a screw axis is{" "}
                    <InlineMath math='\{q, \hat s, h\}'/>: a line through <InlineMath math='q'/> in direction{" "}
                    <InlineMath math='\hat s'/> with pitch <InlineMath math='h'/> (advance per radian), and
                    the twist of a rotation rate <InlineMath math='\dot\theta'/> about it is
                </p>}
                ko={<p>
                    <strong>Screw.</strong> <InlineMath math='\omega = \hat\omega\dot\theta'/> 이듯 모든
                    twist 는 <strong>screw 축</strong> 곱하기 속력이다:{" "}
                    <InlineMath math='\mathcal{V} = \mathcal{S}\dot\theta'/>. 기하적으로 screw 축은{" "}
                    <InlineMath math='\{q, \hat s, h\}'/>, 곧 점 <InlineMath math='q'/> 를 지나고 방향{" "}
                    <InlineMath math='\hat s'/>, 피치 <InlineMath math='h'/> (라디안당 전진량)를 갖는 직선이고, 그 둘레의 회전률 <InlineMath math='\dot\theta'/> 가 만드는 twist 는
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math='\mathcal{V} = \begin{bmatrix} \omega \\ v \end{bmatrix} =
\begin{bmatrix} \hat s\dot\theta \\ -\hat s\dot\theta \times q + h\hat s\dot\theta \end{bmatrix}'/>
            </div>
            <T
                en={<p>
                    Rather than carry <InlineMath math='\{q, \hat s, h\}'/> around (with{" "}
                    <InlineMath math='h = \infty'/> for pure translations), we define{" "}
                    <InlineMath math='\mathcal{S} = (\omega, v)'/> as a <em>normalized twist</em>: if{" "}
                    <InlineMath math='\omega \ne 0'/>, scale so <InlineMath math='\|\omega\| = 1'/>; if{" "}
                    <InlineMath math='\omega = 0'/>, scale so <InlineMath math='\|v\| = 1'/>. Below, a constant
                    twist follows its screw axis, tracing the helix:
                </p>}
                ko={<p>
                    <InlineMath math='\{q, \hat s, h\}'/> 를 들고 다니는 대신(순수 병진이면{" "}
                    <InlineMath math='h = \infty'/> 가 되는 불편까지), <InlineMath math='\mathcal{S} = (\omega, v)'/>{" "}
                    를 <em>정규화된 twist</em> 로 정의한다: <InlineMath math='\omega \ne 0'/> 이면{" "}
                    <InlineMath math='\|\omega\| = 1'/> 로, <InlineMath math='\omega = 0'/> 이면{" "}
                    <InlineMath math='\|v\| = 1'/> 로 맞춘다. 아래에서 일정한 twist 가 제 screw 축을 따라가며
                    나선을 그린다:
                </p>}
            />
            <ScrewMotion/>
            <T
                en={<p>
                    <strong>Exponential coordinates of rigid-body motions.</strong> The{" "}
                    <strong>Chasles–Mozzi theorem</strong> says every displacement is a screw motion about a
                    single fixed axis, so <InlineMath math='\mathcal{S}\theta \in \mathbb{R}^6'/> plays the
                    role <InlineMath math='\hat\omega\theta'/> played for rotations. Expanding{" "}
                    <InlineMath math='e^{[\mathcal{S}]\theta}'/> in series, the rotation block reproduces
                    Rodrigues, and the translation block collects into{" "}
                    <InlineMath math='G(\theta)v'/>, where <InlineMath math='[\omega]^3 = -[\omega]'/> folds
                    the series again:
                </p>}
                ko={<p>
                    <strong>Rigid-Body Motion의 Exponential Coordinates.</strong>{" "}
                    <strong>Chasles–Mozzi 정리</strong>에 따르면 모든 강체 이동은 단 하나의 고정 screw 축
                    둘레의 screw motion 이다. 그래서 회전에서 <InlineMath math='\hat\omega\theta'/> 가 하던
                    역할을 <InlineMath math='\mathcal{S}\theta \in \mathbb{R}^6'/> 이 맡는다.{" "}
                    <InlineMath math='e^{[\mathcal{S}]\theta}'/> 를 급수로 펼치면 회전 블록은 Rodrigues 를
                    재현하고, 병진 블록은 <InlineMath math='G(\theta)v'/> 로 모인다.{" "}
                    <InlineMath math='[\omega]^3 = -[\omega]'/> 이 급수를 다시 접는다:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math='e^{[\mathcal{S}]\theta} =
\begin{bmatrix} e^{[\omega]\theta} & G(\theta)v \\ 0 & 1 \end{bmatrix},
\qquad G(\theta) = I\theta + (1 - \cos\theta)[\omega] + (\theta - \sin\theta)[\omega]^2'/>
            </div>
            <T
                en={<p>
                    (For <InlineMath math='\omega = 0'/> it degenerates gracefully to pure translation,{" "}
                    <InlineMath math='T = (I, v\theta)'/>.) The matrix logarithm inverts this: find{" "}
                    <InlineMath math='\omega, \theta'/> from the <InlineMath math='SO(3)'/> log of{" "}
                    <InlineMath math='R'/> (if <InlineMath math='R = I'/>, it is a pure translation with{" "}
                    <InlineMath math='v = p/\|p\|,\ \theta = \|p\|'/>), then recover{" "}
                    <InlineMath math='v = G^{-1}(\theta)\,p'/> with
                </p>}
                ko={<p>
                    (<InlineMath math='\omega = 0'/> 이면 순수 병진 <InlineMath math='T = (I, v\theta)'/> 로
                    자연스럽게 퇴화한다.) Matrix logarithm 은 이를 뒤집는다: <InlineMath math='R'/> 의{" "}
                    <InlineMath math='SO(3)'/> 로그에서 <InlineMath math='\omega, \theta'/> 를 얻고
                    (<InlineMath math='R = I'/> 면 순수 병진으로{" "}
                    <InlineMath math='v = p/\|p\|,\ \theta = \|p\|'/>), 다음으로{" "}
                    <InlineMath math='v = G^{-1}(\theta)\,p'/> 를 복원한다:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math='G^{-1}(\theta) = \frac{1}{\theta}I - \frac{1}{2}[\omega]
+ \left(\frac{1}{\theta} - \frac{1}{2}\cot\frac{\theta}{2}\right)[\omega]^2'/>
            </div>
            <T
                en={<p>
                    A planar example: frames <InlineMath math='\{b\}'/> at{" "}
                    <InlineMath math='(1, 2)'/> with heading 30° and <InlineMath math='\{c\}'/> at{" "}
                    <InlineMath math='(2, 1)'/> with heading 60° are joined by the screw motion{" "}
                    <InlineMath math='T_{sc} = e^{[\mathcal{S}]\theta}\,T_{sb}'/> with{" "}
                    <InlineMath math='\theta = 30^\circ'/> and{" "}
                    <InlineMath math='\mathcal{S} = (0, 0, 1,\; 3.37, -3.37, 0)'/>: a pure rotation (zero
                    pitch) about the axis through <InlineMath math='q = (3.37, 3.37)'/>: one screw, both
                    displacement components at once.
                </p>}
                ko={<p>
                    평면 예제 하나: 위치 <InlineMath math='(1, 2)'/>·방향 30° 의 <InlineMath math='\{b\}'/> 와
                    위치 <InlineMath math='(2, 1)'/>·방향 60° 의 <InlineMath math='\{c\}'/> 는{" "}
                    <InlineMath math='\theta = 30^\circ'/>,{" "}
                    <InlineMath math='\mathcal{S} = (0, 0, 1,\; 3.37, -3.37, 0)'/> 인 screw motion{" "}
                    <InlineMath math='T_{sc} = e^{[\mathcal{S}]\theta}\,T_{sb}'/> 로 이어진다: 점{" "}
                    <InlineMath math='q = (3.37, 3.37)'/> 를 지나는 축 둘레의 순수 회전(피치 0)이다. screw 하나가
                    회전과 병진을 한꺼번에 해치운다.
                </p>}
            />

            <T en={<h2>Wrenches</h2>} ko={<h2>Wrench</h2>}/>
            <T
                en={<p>
                    Push a wrench (spanner) handle: the bolt at the pivot feels your push <em>and</em> a twist.
                    And the farther from the bolt you push, the stronger the twist, even though your force
                    never changed. So a single force <InlineMath math='f'/> is not enough to describe what a
                    rigid body feels; <em>where</em> it acts matters. Instead of carrying the application
                    point around, we record its turning effect about the frame origin, the{" "}
                    <strong>moment</strong> <InlineMath math='m = r \times f'/>, and package the two as the{" "}
                    <strong>wrench</strong> <InlineMath math='\mathcal{F} = (m, f) \in \mathbb{R}^6'/>: the
                    complete "what the body feels". The pair loses nothing: sliding the application point
                    along the force's <em>line of action</em> changes neither <InlineMath math='f'/> nor{" "}
                    <InlineMath math='m'/> (and indeed <InlineMath math='|m| = |f| \cdot d'/>, with{" "}
                    <InlineMath math='d'/> the distance from the origin to that line). Try it:
                </p>}
                ko={<p>
                    스패너 손잡이를 밀어 보라. 축의 볼트는 미는 힘<em>과 함께</em> 비틀림을 느낀다. 그리고
                    같은 힘이라도 볼트에서 멀리 밀수록 비틀림은 세진다. 즉 힘 <InlineMath math='f'/> 하나로는
                    강체가 느끼는 것을 다 말할 수 없다. <em>어디에</em> 작용하는지가 중요하다. 작용점을 들고
                    다니는 대신 원점 기준의 회전 효과, 곧 <strong>모멘트</strong>{" "}
                    <InlineMath math='m = r \times f'/> 를 기록하고, 둘을 묶은 것이 <strong>wrench</strong>{" "}
                    <InlineMath math='\mathcal{F} = (m, f) \in \mathbb{R}^6'/> 다. "물체가 느끼는 것 전부"인 셈이다. 이
                    쌍은 정보를 잃지 않는다: 작용점을 힘의 <em>작용선</em>을 따라 미끄러뜨리면{" "}
                    <InlineMath math='f'/> 도 <InlineMath math='m'/> 도 변하지 않는다 (실제로{" "}
                    <InlineMath math='|m| = |f| \cdot d'/>, <InlineMath math='d'/> 는 원점에서 작용선까지의
                    거리다). 직접 해 보자:
                </p>}
            />
            <WrenchIntuition/>
            <T
                en={<p>
                    Wrenches expressed in the same frame simply add, and a wrench with{" "}
                    <InlineMath math='f = 0'/> is a <em>pure moment</em>: a twist with no net push, like
                    turning a screwdriver between your fingertips.
                </p>}
                ko={<p>
                    같은 프레임으로 표현된 wrench 는 그냥 더하면 되고, <InlineMath math='f = 0'/> 인 wrench 는{" "}
                    <em>순수 모멘트</em>다. 알짜 밀기 없이 비틀기만 있는 것으로, 손끝으로 드라이버를 돌리는 것과 같다.
                </p>}
            />
            <T
                en={<p>
                    How does a wrench change frames? No new machinery is needed, only the fact that{" "}
                    <strong>power is frame-independent</strong> (we cannot create energy by renaming
                    coordinates). Power is <InlineMath math='\mathcal{V}^T\mathcal{F}'/>, so with{" "}
                    <InlineMath math='\mathcal{V}_a = [\mathrm{Ad}_{T_{ab}}]\mathcal{V}_b'/>:
                </p>}
                ko={<p>
                    wrench 는 프레임을 어떻게 갈아타는가? 새 도구는 필요 없다. <strong>일률(power)은 프레임과
                    무관하다</strong>는 사실만 있으면 된다(좌표 이름을 바꿔서 에너지를 만들 수는 없다). 일률은{" "}
                    <InlineMath math='\mathcal{V}^T\mathcal{F}'/> 이므로,{" "}
                    <InlineMath math='\mathcal{V}_a = [\mathrm{Ad}_{T_{ab}}]\mathcal{V}_b'/> 를 대입하면:
                </p>}
            />
            <div className="overflow-x-auto">
                <BlockMath math='\mathcal{V}_b^T\mathcal{F}_b = \mathcal{V}_a^T\mathcal{F}_a
= \big([\mathrm{Ad}_{T_{ab}}]\mathcal{V}_b\big)^T\mathcal{F}_a
= \mathcal{V}_b^T[\mathrm{Ad}_{T_{ab}}]^T\mathcal{F}_a
\quad\Longrightarrow\quad
\mathcal{F}_b = [\mathrm{Ad}_{T_{ab}}]^T\mathcal{F}_a'/>
            </div>
            <T
                en={<p>
                    Note the direction of the subscripts: the <em>transpose</em> of the adjoint that carries
                    twists from <InlineMath math='\{b\}'/> to <InlineMath math='\{a\}'/> carries wrenches the
                    other way. You already know this formula in your bones: hold a dumbbell at your chest,
                    then at arm's length. It does not get heavier (same <InlineMath math='f'/>), yet your
                    wrist suffers, because the <em>moment</em> grows with distance. A robot's wrist
                    force–torque sensor feels exactly that. Below, the sensor <InlineMath math='\{f\}'/> holds
                    a hand plus an apple; stretch <InlineMath math='L_2'/> and watch the two bars: the force
                    bar stays frozen while the moment bar grows. What the sensor reads is each gravity wrench
                    moved into its frame by <InlineMath math='[\mathrm{Ad}]^T'/> and summed:
                </p>}
                ko={<p>
                    아래첨자의 방향에 주목하라: twist 를 <InlineMath math='\{b\}'/> 에서{" "}
                    <InlineMath math='\{a\}'/> 로 보내는 adjoint 의 <em>전치</em>가 wrench 는 반대 방향으로
                    보낸다. 이 공식은 사실 몸이 이미 알고 있다: 아령을 가슴에 붙여 들 때와 팔을 쭉 뻗어 들
                    때를 비교해 보라. 아령이 더 무거워지는 게 아닌데(같은 <InlineMath math='f'/>) 손목은 훨씬 힘들다.{" "}
                    <em>모멘트</em>가 거리와 함께 자라기 때문이다. 로봇 손목의 힘–토크 센서가 느끼는 것이
                    정확히 이것이다. 아래에서 센서 <InlineMath math='\{f\}'/> 가 손과 사과를 들고 있다:{" "}
                    <InlineMath math='L_2'/> 를 늘리며 두 막대를 보라. 힘 막대는 얼어붙어 있고 모멘트 막대만
                    자란다. 센서가 읽는 값은 각 중력 wrench 를 <InlineMath math='[\mathrm{Ad}]^T'/> 로 센서
                    프레임에 옮겨 더한 것이다:
                </p>}
            />
            <WrenchBalance/>
        </>
    )
}

export default Chapter3
