import {BlockMath, InlineMath} from "../../components/math/Tex";
import {resolvePath} from "../../libs/url";
import {T} from "../../libs/i18n";
import RotatingFrame from "../../components/pages/chapter3/RotatingFrame";
import ExponentialRotation from "../../components/pages/chapter3/ExponentialRotation";
import HomogeneousTransform from "../../components/pages/chapter3/HomogeneousTransform";
import ScrewMotion from "../../components/pages/chapter3/ScrewMotion";

const Chapter3 = () => {
    return (
        <>
            <T en={<h2>Rigid-Body Motion</h2>} ko={<h2>Rigid-Body Motion</h2>}/>
            <T
                en={<p><strong>Definition</strong> : The special orthogonal group <InlineMath math='SO(3)'/>, also known as
                    the group of rotation matrices, is the set
                    of all 3 x 3 real matrices <InlineMath math='R'/> that satisfy the followings
                </p>}
                ko={<p><strong>정의</strong> : 특수 직교군 <InlineMath math='SO(3)'/>는 회전 행렬의 군이라고도 하며,
                    다음을 만족하는 모든 3 x 3 실수 행렬 <InlineMath math='R'/> 의 집합이다
                </p>}
            />
            <BlockMath math='R^TR=I \ \text{and}\ \det R = 1'/>
            <T
                en={<p><strong> Properties of rotation matrices</strong> : inverse, closure, associative, not commutative
                </p>}
                ko={<p><strong> 회전 행렬의 성질</strong> : 역행렬, 닫힘, 결합법칙, 비가환
                </p>}
            />
            <T
                en={<p><strong>Skew-symmetric matrices Definition</strong> : The set of all <InlineMath
                    math='3 \times 3'/> real skew-symmetric matrices
                    is called <InlineMath math='\mathfrak{so}(3)'/>.
                </p>}
                ko={<p><strong>반대칭 행렬 정의</strong> : 모든 <InlineMath
                    math='3 \times 3'/> 실수 반대칭 행렬의 집합을{" "}
                    <InlineMath math='\mathfrak{so}(3)'/> 라 한다.
                </p>}
            />
            <T
                en={<p><strong>Proposition</strong> : Given any <InlineMath math='\omega \in \mathbb{R}^3'/> and <InlineMath
                    math='R \in SO(3)'/> the following always holds:
                </p>}
                ko={<p><strong>명제</strong> : 임의의 <InlineMath math='\omega \in \mathbb{R}^3'/> 와 <InlineMath
                    math='R \in SO(3)'/> 에 대해 다음이 항상 성립한다:
                </p>}
            />
            <BlockMath math='R[\omega]R^T = [R\omega]'/>

            <T en={<h2>Angular velocities</h2>} ko={<h2>각속도</h2>}/>
            <T en={<p><strong>Definition</strong> :</p>} ko={<p><strong>정의</strong> :</p>}/>
            <img
                className="w-1/2 mx-auto rounded-lg border border-border"
                src={resolvePath("img/3_1.png")}
                alt="Angular velocity of a rotating frame"
                loading="lazy"
            />
            <T
                en={<p>
                    Angular velocity <InlineMath math='\omega'/> (orange) is a vector: its direction is the rotation
                    axis and its length the rate <InlineMath math='\dot{\theta}'/>. Every point of the body then moves
                    with velocity <InlineMath math='v = \omega \times r'/> — always <strong>tangent</strong> to the
                    circle it traces (cyan arrows at the axis tips). A point lying on the axis itself, like the{" "}
                    <InlineMath math='\hat{y}'/> tip along <InlineMath math='\omega'/>, has{" "}
                    <InlineMath math='\omega \times r = 0'/> and stays put — which is why the linear velocities below
                    are <InlineMath math='\dot{\hat{x}} = \omega \times \hat{x}'/> and so on.
                </p>}
                ko={<p>
                    각속도 <InlineMath math='\omega'/>(주황)는 벡터이다: 방향은 회전축이고 크기는 회전률{" "}
                    <InlineMath math='\dot{\theta}'/> 이다. 그러면 물체의 모든 점은 속도{" "}
                    <InlineMath math='v = \omega \times r'/> 로 움직이며 — 그 점이 그리는 원에 항상{" "}
                    <strong>접선</strong> 방향이다(축 끝의 청록 화살표). 축 위에 놓인 점, 예컨대{" "}
                    <InlineMath math='\omega'/> 방향의 <InlineMath math='\hat{y}'/> 끝점은{" "}
                    <InlineMath math='\omega \times r = 0'/> 이라 제자리에 머문다 — 아래의 선속도가{" "}
                    <InlineMath math='\dot{\hat{x}} = \omega \times \hat{x}'/> 등인 이유다.
                </p>}
            />
            <RotatingFrame/>
            <T en={<p><strong>Angular velocity</strong> :</p>} ko={<p><strong>각속도</strong> :</p>}/>
            <BlockMath math='\omega = \hat{\omega}\dot{\theta}'/>
            <T en={<p><strong>Linear velocity</strong> :</p>} ko={<p><strong>선속도</strong> :</p>}/>
            <BlockMath math={`\\begin{gathered}
                            \\dot{\\hat{x}} = \\omega \\times \\hat{x} \\\\
                            \\dot{\\hat{y}} = \\omega \\times \\hat{y} \\\\
                            \\dot{\\hat{z}} = \\omega \\times \\hat{z}
                            \\end{gathered}`}/>
            <T
                en={<p><strong>Angular velocity in different frame</strong>:</p>}
                ko={<p><strong>다른 좌표계에서의 각속도</strong>:</p>}
            />
            <BlockMath
                math={`\\begin{gathered}
                    \\dot{R} =
                    \\begin{bmatrix}
                    \\omega_s \\times r_1, & \\omega_s \\times r_2, & \\omega_s \\times r_3
                    \\end{bmatrix} = \\omega_s \\times R \\\\[6pt]
                    [\\omega_s] R = \\dot{R} \\\\[6pt]
                    [\\omega_s] = \\dot{R} R^{-1} \\\\[6pt]
                    \\text{Let's write } R \\text{ explicitly as } R_{sb}. \\\\[6pt]
                    \\text{By our subscript cancellation rule, } \\omega_s = R_{sb} \\omega_b, \\text{ therefore} \\\\[6pt]
                    \\omega_b = R_{sb}^{-1} \\omega_s = R^{-1} \\omega_s = R^T \\omega_s
                    \\end{gathered}`}/>

            <BlockMath math={`[\\omega_b] = [R^T \\omega_s]
                    = R^T [\\omega_s] R
                    = R^T (\\dot{R} R^{-1}) R = R^T \\dot{R}
                    = R^{-1} \\dot{R} `}/>

            <T
                en={<p><strong> Properties</strong> : Let <InlineMath math='R(t)'/> denote the orientation of the rotating
                    frame as seen from the fixed frame. Denote by <InlineMath math='\omega'/> the angular velocity of the
                    rotating frame. Then
                </p>}
                ko={<p><strong> 성질</strong> : 고정 좌표계에서 본 회전하는 좌표계의 방향을 <InlineMath math='R(t)'/> 라
                    하자. 회전하는 좌표계의 각속도를 <InlineMath math='\omega'/> 라 하자. 그러면
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
            <BlockMath math='R = e^{[\hat{\omega}]\theta}'/>
            <T
                en={<p>
                    Drag the slider to sweep the angle <InlineMath math='\theta'/> about a fixed axis{" "}
                    <InlineMath math='\hat{\omega}'/> (orange). The body frame traces the one-parameter family of
                    rotations <InlineMath math='e^{[\hat{\omega}]\theta}'/>; at <InlineMath math='\theta = 0'/> it
                    coincides with the fixed frame.
                </p>}
                ko={<p>
                    슬라이더를 끌어 고정된 축 <InlineMath math='\hat{\omega}'/>(주황) 둘레로 회전각{" "}
                    <InlineMath math='\theta'/> 를 훑어보라. 물체 좌표계는 회전의 한-매개변수 족{" "}
                    <InlineMath math='e^{[\hat{\omega}]\theta}'/> 를 그리며, <InlineMath math='\theta = 0'/> 에서는
                    고정 좌표계와 일치한다.
                </p>}
            />
            <ExponentialRotation/>

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
                    The rotation <InlineMath math='R'/> carries the orientation of the body frame and the vector{" "}
                    <InlineMath math='p'/> its origin, packaged into one matrix so a single object represents both
                    position and orientation. An element is sometimes written <InlineMath math='T = (R, p)'/>.
                </p>}
                ko={<p>
                    회전 <InlineMath math='R'/> 은 물체 좌표계의 방향을 담고 벡터{" "}
                    <InlineMath math='p'/> 는 그 원점을 담아, 하나의 행렬로 묶여 단일 객체가 위치와 방향을 모두
                    나타낸다. 원소는 때때로 <InlineMath math='T = (R, p)'/> 로 쓴다.
                </p>}
            />
            <T
                en={<p>
                    Below, the body frame moves as a rigid body: at every instant it has a position{" "}
                    <InlineMath math='p'/> (violet vector from the origin) and an orientation <InlineMath math='R'/> —
                    a single <InlineMath math='T'/> capturing both. Drag to orbit.
                </p>}
                ko={<p>
                    아래에서 물체 좌표계는 강체로서 움직인다: 매 순간 위치{" "}
                    <InlineMath math='p'/>(원점에서 나온 보라색 벡터)와 방향 <InlineMath math='R'/> 을 가지며 —
                    단일 <InlineMath math='T'/> 가 둘 다 담는다. 끌어서 시점을 돌려보라.
                </p>}
            />
            <HomogeneousTransform/>
            <T
                en={<p><strong>Inverse</strong> : the inverse of a transformation is itself a transformation,</p>}
                ko={<p><strong>역변환</strong> : 변환의 역은 그 자체로 변환이며,</p>}
            />
            <BlockMath math={`T^{-1} = \\begin{bmatrix} R^T & -R^T p \\\\ 0 & 1 \\end{bmatrix}`}/>
            <T
                en={<p><strong>Properties</strong> : closure, associative, not commutative, and identity{" "}
                    <InlineMath math='T T^{-1} = T^{-1} T = I'/>.
                </p>}
                ko={<p><strong>성질</strong> : 닫힘, 결합법칙, 비가환, 그리고 항등원{" "}
                    <InlineMath math='T T^{-1} = T^{-1} T = I'/>.
                </p>}
            />
            <T
                en={<p><strong>Uses</strong> : a transformation is used to (1) represent the configuration of a rigid
                    body, (2) change the reference frame in which a vector or frame is expressed, and (3) displace a
                    vector or frame. Homogeneous coordinates append a 1 to a point, <InlineMath
                        math='\tilde{p} = (p, 1)'/>, so that <InlineMath math='T \tilde{p}'/> applies the rotation and
                    translation together, and the subscript-cancellation rule <InlineMath
                        math='T_{ac} = T_{ab} T_{bc}'/> composes motions.
                </p>}
                ko={<p><strong>용도</strong> : 변환은 (1) 강체의 configuration을 나타내고, (2) 벡터나 좌표계가 표현되는
                    기준 좌표계를 바꾸며, (3) 벡터나 좌표계를 이동시키는 데 쓰인다. 동차 좌표는 점에 1 을 덧붙여 <InlineMath
                        math='\tilde{p} = (p, 1)'/> 로 만들어, <InlineMath math='T \tilde{p}'/> 가 회전과
                    병진을 함께 적용하고, 아래첨자 소거 규칙 <InlineMath
                        math='T_{ac} = T_{ab} T_{bc}'/> 가 운동을 합성한다.
                </p>}
            />

            <T en={<h2>Rigid-Body Motions and Twists</h2>} ko={<h2>Rigid-Body Motion과 Twist</h2>}/>
            <T
                en={<p><strong>Twist</strong> : the spatial velocity of a rigid body, stacking its angular and linear
                    velocity into a single six-vector. Expressed in the body frame it is
                </p>}
                ko={<p><strong>Twist</strong> : 강체의 공간 속도로, 각속도와 선속도를 하나의 6-벡터로 쌓은 것이다.
                    물체 좌표계로 표현하면
                </p>}
            />
            <BlockMath math='\mathcal{V}_b = \begin{bmatrix} \omega_b \\ v_b \end{bmatrix} \in \mathbb{R}^6'/>
            <T
                en={<p>
                    and in the fixed (space) frame it is <InlineMath math='\mathcal{V}_s'/>. Just as{" "}
                    <InlineMath math='[\omega_b] = R^{-1}\dot{R}'/> gives the body angular velocity, the body twist
                    comes from <InlineMath math='[\mathcal{V}_b] = T^{-1}\dot{T}'/>, and the two frames are related by
                    the adjoint map <InlineMath math='\mathcal{V}_s = [\mathrm{Ad}_{T_{sb}}]\,\mathcal{V}_b'/>. Any
                    twist is the scaled screw axis <InlineMath math='\mathcal{V} = \mathcal{S}\dot{\theta}'/>, the
                    geometric picture behind the exponential coordinates of rigid-body motion.
                </p>}
                ko={<p>
                    고정(공간) 좌표계로 표현하면 <InlineMath math='\mathcal{V}_s'/> 이다. <InlineMath
                        math='[\omega_b] = R^{-1}\dot{R}'/> 가 물체 각속도를 주듯이, 물체 twist는{" "}
                    <InlineMath math='[\mathcal{V}_b] = T^{-1}\dot{T}'/> 에서 나오며, 두 좌표계는 수반 사상{" "}
                    <InlineMath math='\mathcal{V}_s = [\mathrm{Ad}_{T_{sb}}]\,\mathcal{V}_b'/> 로 관계된다.
                    모든 twist는 크기가 곱해진 screw 축{" "}
                    <InlineMath math='\mathcal{V} = \mathcal{S}\dot{\theta}'/> 이며, Rigid-Body Motion의 Exponential Coordinates 뒤에
                    있는 기하학적 그림이다.
                </p>}
            />
            <T
                en={<p>
                    A screw axis combines rotation about a line with translation along it. The body frame below turns
                    about the vertical axis while advancing along it, tracing the helix (orange) that a constant twist
                    produces.
                </p>}
                ko={<p>
                    screw 축은 한 직선 둘레의 회전과 그 직선을 따른 병진을 결합한다. 아래의 물체 좌표계는 수직 축
                    둘레로 돌면서 그 축을 따라 나아가, 일정한 twist가 만들어내는 나선(주황)을 그린다.
                </p>}
            />
            <ScrewMotion/>
        </>
    )
}

export default Chapter3
