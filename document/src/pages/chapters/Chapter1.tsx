import {InlineMath} from "../../components/math/Tex";
import {T} from "../../libs/i18n";

const Chapter1 = () => {
    return (
        <>
            <T
                en={<p>
                    This book is about the <strong>mechanics</strong>, <strong>planning</strong>, and{" "}
                    <strong>control</strong> of robot mechanisms. This chapter previews the ideas that the
                    following chapters build on.
                </p>}
                ko={<p>
                    이 책은 로봇 메커니즘의 <strong>역학</strong>, <strong>계획</strong>, <strong>제어</strong>를
                    다룬다. 이 장은 이후 장들이 딛고 설 아이디어를 미리 훑어본다.
                </p>}
            />

            <T en={<h2>What Is a Robot?</h2>} ko={<h2>로봇이란 무엇인가?</h2>}/>
            <T
                en={<p>
                    A robot mechanism is built from rigid bodies, called <strong>links</strong>, connected by{" "}
                    <strong>joints</strong> so that relative motion between adjacent links is possible.{" "}
                    <strong>Actuators</strong> (typically electric motors) drive the joints, causing the robot to
                    move and to exert forces.
                </p>}
                ko={<p>
                    로봇 메커니즘은 <strong>링크</strong>라 불리는 강체들이 <strong>관절</strong>로 연결되어, 인접한
                    링크 사이의 상대 운동이 가능하도록 만들어진다. <strong>구동기</strong>(보통 전기 모터)가 관절을
                    구동해 로봇을 움직이고 힘을 내게 한다.
                </p>}
            />
            <T
                en={<p>
                    The links may be arranged in a serial <strong>open chain</strong> (a familiar robot arm, where
                    every joint is actuated) or they may form <strong>closed loops</strong> (such as the
                    Stewart–Gough platform, where only some joints are actuated).
                </p>}
                ko={<p>
                    링크들은 직렬 <strong>Open Chain</strong>(모든 관절이 구동되는 익숙한 로봇 팔)으로 배치될 수도 있고,{" "}
                    <strong>닫힌 루프</strong>(일부 관절만 구동되는 스튜어트–고프 플랫폼 등)를 이룰 수도 있다.
                </p>}
            />
            <T
                en={<p>
                    Real links flex and real joints have elasticity, backlash, and friction. Throughout this book we
                    ignore those effects and treat every link as a perfect <strong>rigid body</strong>.
                </p>}
                ko={<p>
                    실제 링크는 휘고, 실제 관절에는 탄성·백래시·마찰이 있다. 이 책 전반에서 우리는 그런 효과를 무시하고
                    모든 링크를 완벽한 <strong>강체</strong>로 취급한다.
                </p>}
            />

            <T en={<h2>Configuration and Degrees of Freedom</h2>} ko={<h2>Configuration과 자유도</h2>}/>
            <T
                en={<p>
                    The <strong>configuration</strong> of a robot is a specification of the position of every one of
                    its points. A rigid body in the plane needs three numbers to pin down — two for position and one
                    for orientation <InlineMath math='(x, y, \theta)'/> — while a rigid body in space needs six
                    (three for position, three for orientation).
                </p>}
                ko={<p>
                    로봇의 <strong>configuration</strong>은 로봇의 모든 점의 위치를 지정하는 것이다. 평면 위의 강체는
                    세 개의 수 — 위치를 나타내는 둘과 방향을 나타내는 하나{" "}
                    <InlineMath math='(x, y, \theta)'/> — 로 정해지고, 공간 안의 강체는 여섯 개(위치 셋, 방향 셋)가
                    필요하다.
                </p>}
            />
            <T
                en={<p>
                    That count is the number of <strong>degrees of freedom</strong> (DOF), which is also the
                    dimension of the <strong>configuration space</strong> (C-space) — the set of all configurations
                    the body can take. A robot's DOF is the sum of its links' freedoms minus the constraints imposed
                    by its joints.
                </p>}
                ko={<p>
                    이 개수가 바로 <strong>자유도</strong>(DOF)이며, 이는 곧 <strong>configuration 공간</strong>(C-space,
                    강체가 취할 수 있는 모든 configuration의 집합)의 차원이기도 하다. 로봇의 자유도는 링크들이 가진
                    자유도의 합에서 관절이 부과하는 제약을 뺀 값이다.
                </p>}
            />

            <T en={<h2>Chapter Roadmap</h2>} ko={<h2>챕터 로드맵</h2>}/>
            <T
                en={<p>The rest of these notes follow the book's development:</p>}
                ko={<p>이 노트의 나머지는 책의 전개를 따라간다:</p>}
            />
            <T
                en={<ul className="list-disc pl-6 space-y-1">
                    <li>
                        <strong>Ch.2 · Configuration Space</strong> — DOF of bodies and robots, Grübler's formula,
                        the topology and representation of the C-space, task space and workspace.
                    </li>
                    <li>
                        <strong>Ch.3 · Rigid-Body Motions</strong> — rotation matrices{" "}
                        <InlineMath math='SO(3)'/>, angular velocity, the exponential-coordinate (screw) description
                        of rotations, homogeneous transforms <InlineMath math='SE(3)'/>, and twists.
                    </li>
                    <li>
                        <strong>Ch.4 · Forward Kinematics</strong> — computing the end-effector pose from the joint
                        values with the product of exponentials (PoE) formula.
                    </li>
                    <li className="text-muted">
                        <strong>Coming soon</strong> — Ch.5 Velocity Kinematics &amp; Statics (the Jacobian), Ch.6
                        Inverse Kinematics.
                    </li>
                </ul>}
                ko={<ul className="list-disc pl-6 space-y-1">
                    <li>
                        <strong>2장 · configuration 공간</strong> — 강체와 로봇의 자유도, 그뤼블러 공식, C-space 의
                        위상과 표현, task 공간과 작업 공간.
                    </li>
                    <li>
                        <strong>3장 · Rigid-Body Motion</strong> — 회전 행렬 <InlineMath math='SO(3)'/>, 각속도, 회전의
                        Exponential Coordinates(screw) 표현, Homogeneous Transformation <InlineMath math='SE(3)'/>, 그리고 twist.
                    </li>
                    <li>
                        <strong>4장 · Forward Kinematics</strong> — Product of Exponentials(PoE) 공식으로 관절 값에서 end-effector 자세를 계산한다.
                    </li>
                    <li className="text-muted">
                        <strong>준비 중</strong> — 5장 Velocity Kinematics와 Statics(Jacobian), 6장 Inverse Kinematics.
                    </li>
                </ul>}
            />
        </>
    )
}

export default Chapter1
