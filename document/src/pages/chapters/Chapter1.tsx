import {InlineMath} from "../../components/math/Tex";
import CSpacePreview2R from "../../components/pages/chapter1/CSpacePreview2R";
import OpenVsClosedChain from "../../components/pages/chapter1/OpenVsClosedChain";
import {T, useTr} from "../../libs/i18n";
import {useChapterNav} from "../../libs/nav";
import {CHAPTER_BLURBS} from "./roadmap";

// 챕터 카드 데이터는 홈과 공유한다. 1장 자신은 제외.
const ROADMAP = CHAPTER_BLURBS.filter((c) => c.n >= 2);


const Chapter1 = () => {
    const {go} = useChapterNav();
    const t = useTr();
    return (
        <>
            <T
                en={<p>
                    These notes are about the <strong>mechanics</strong>, <strong>planning</strong>, and{" "}
                    <strong>control</strong> of robot mechanisms: robot arms, wheeled vehicles, and arms
                    mounted on wheeled vehicles. Robotics also draws on artificial intelligence and computer
                    perception, but the essential feature of a robot is that it <em>moves in the physical
                    world</em>; that is where these notes stay focused. This chapter previews the ideas the
                    following chapters build on.
                </p>}
                ko={<p>
                    이 노트는 로봇 메커니즘의 <strong>역학(mechanics)</strong>, <strong>계획(planning)</strong>,{" "}
                    <strong>제어(control)</strong>를 다룬다. 로봇 팔, 바퀴 달린 이동체, 그리고 그 위에 얹힌
                    로봇 팔이 모두 여기에 속한다. 로보틱스는 인공지능과 컴퓨터 인식도 아우르지만,
                    로봇의 본질은 <em>물리 세계 안에서 움직인다</em>는 것이며 이 노트는 거기에 집중한다. 이
                    장은 이후 장들이 딛고 설 아이디어를 미리 훑어본다.
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
                    The links may be arranged in a serial <strong>open chain</strong> (the familiar robot arm,
                    where <em>every</em> joint is actuated), or they may form <strong>closed loops</strong>, as in
                    the Stewart–Gough platform used in flight simulators, where only a subset of the joints is
                    actuated and the rest are <strong>passive</strong>: their motion is dictated by the
                    requirement that every loop stay closed. Watch the difference below: the serial arm's three
                    joints move independently, while the four-bar loop on the right is driven entirely by its
                    one actuated crank.
                </p>}
                ko={<p>
                    링크들은 직렬 <strong>open chain</strong>으로 배치될 수도 있고(<em>모든</em> 관절이 구동되는
                    익숙한 로봇 팔이 이 형태다), 비행 시뮬레이터에 쓰이는 Stewart–Gough 플랫폼처럼{" "}
                    <strong>닫힌 루프</strong>를 이룰 수도 있다. 닫힌 루프에서는 일부 관절만 구동되고 나머지는{" "}
                    <strong>수동(passive)</strong> 관절로, 모든 루프가 닫힌 채 유지되어야 한다는 조건이 그 움직임을
                    결정한다. 아래에서 차이를 보자. 직렬 팔의 세 관절은 제각기 독립적으로 움직이지만, 오른쪽 4절
                    링크 루프는 구동되는 크랭크 하나가 전체를 이끈다.
                </p>}
            />
            <OpenVsClosedChain/>
            <T
                en={<p>
                    Real links flex, and real joints have elasticity, backlash, friction, and hysteresis.
                    Throughout this book we ignore those effects and treat every link as a perfect{" "}
                    <strong>rigid body</strong>. This assumption is what makes the elegant geometry of the
                    coming chapters possible.
                </p>}
                ko={<p>
                    실제 링크는 휘고, 실제 관절에는 탄성·백래시·마찰·히스테리시스가 있다. 이 노트 전반에서 우리는
                    그런 효과를 무시하고 모든 링크를 완벽한 <strong>강체</strong>로 취급한다. 이 가정 덕분에 이후
                    장들의 우아한 기하학이 가능해진다.
                </p>}
            />

            <T en={<h2>Actuators, Transmissions, and Sensors</h2>} ko={<h2>구동기, 동력 전달 장치, 센서</h2>}/>
            <T
                en={<p>
                    A quick look at the technology the theory will command. Joints are moved by{" "}
                    <strong>actuators</strong>: most often DC or AC electric motors, but also stepper motors,
                    pneumatic or hydraulic cylinders, and shape-memory alloys. An ideal motor would be light,
                    spin slowly (hundreds of RPM), and produce large torque; real motors do the opposite, so a{" "}
                    <strong>transmission</strong> (gears, cable drives, belts and pulleys) provides speed
                    reduction and torque amplification. A good transmission has little slippage and little{" "}
                    <strong>backlash</strong> (the free play at the output when the input is held still).
                </p>}
                ko={<p>
                    이론이 부리게 될 기술을 잠깐 살펴보자. 관절은 <strong>구동기</strong>가 움직인다. 대개 DC·AC
                    전기 모터이고, 스테퍼 모터, 공압·유압 실린더, 형상기억합금도 쓰인다. 이상적인 모터는 가볍고,
                    천천히 돌고(수백 RPM), 큰 토크를 내야 하지만 실제 모터는 그 반대라서,{" "}
                    <strong>동력 전달 장치</strong>(기어, 케이블 드라이브, 벨트·풀리)가 감속과 토크 증폭을 맡는다.
                    좋은 전달 장치는 미끄러짐과 <strong>백래시</strong>(입력을 고정했을 때 출력단에 남는 유격)가
                    작아야 한다.
                </p>}
            />
            <T
                en={<p>
                    To be controlled, a robot must also sense its own motion: <strong>encoders</strong>,
                    potentiometers, or resolvers measure displacement at each revolute or prismatic joint, and
                    tachometers measure velocity. Force–torque sensors read the loads at the joints or at the
                    end-effector, while cameras, RGB-D sensors, and laser range finders localize the robot and
                    the objects around it.
                </p>}
                ko={<p>
                    제어를 하려면 로봇이 자신의 움직임을 감지해야 한다: 각 회전(revolute)·직동(prismatic) 관절의
                    변위는 <strong>엔코더</strong>·포텐셔미터·리졸버가, 속도는 타코미터가 측정한다. 힘–토크 센서는
                    관절이나 end-effector에 걸리는 하중을 읽고, 카메라·RGB-D 센서·레이저 거리계는 로봇과 주변
                    물체의 위치를 파악한다.
                </p>}
            />

            <T en={<h2>Configuration and Degrees of Freedom</h2>} ko={<h2>Configuration과 자유도</h2>}/>
            <T
                en={<p>
                    The <strong>configuration</strong> of a robot is a specification of the position of{" "}
                    <em>every one of its points</em>. For rigid bodies this takes remarkably few numbers: a body
                    confined to the plane needs three <InlineMath math='(x, y, \theta)'/>, and a body in space
                    needs six (three for position, three for orientation).
                </p>}
                ko={<p>
                    로봇의 <strong>configuration</strong>은 로봇의 <em>모든 점</em>의 위치를 지정하는 것이다.
                    강체라면 놀랄 만큼 적은 수로 충분하다: 평면에 갇힌 강체는 세 개{" "}
                    <InlineMath math='(x, y, \theta)'/>, 공간 안의 강체는 여섯 개(위치 셋, 방향 셋)면 된다.
                </p>}
            />
            <T
                en={<p>
                    The minimum number of coordinates needed is the number of{" "}
                    <strong>degrees of freedom</strong> (DOF), and the set of all configurations is the{" "}
                    <strong>configuration space</strong> (C-space); the DOF is its dimension. For the 2R arm
                    below, two joint angles pin down every point of both links, so the C-space is
                    two-dimensional: the square of all pairs <InlineMath math='(\theta_1, \theta_2)'/>. Since
                    each axis is really a circle (<InlineMath math='\pm 180^\circ'/> are the same angle), the
                    square's opposite edges glue together, so the C-space is a <strong>torus</strong>. This is a
                    first hint that C-spaces have <em>shapes</em>, not just dimensions.
                </p>}
                ko={<p>
                    필요한 좌표의 최소 개수가 <strong>자유도</strong>(DOF)이고, 모든 configuration의 집합이{" "}
                    <strong>configuration 공간</strong>(C-space)이며, 자유도는 그 차원이다. 아래 2R 팔에서는
                    관절각 두 개가 두 링크의 모든 점을 결정하므로 C-space는 2차원, 곧 모든 쌍{" "}
                    <InlineMath math='(\theta_1, \theta_2)'/>이 이루는 정사각형이다. 각 축은 사실 원이므로
                    (<InlineMath math='\pm 180^\circ'/>는 같은 각), 정사각형의 마주보는 변이 서로 이어붙는다.
                    즉 C-space는 <strong>torus</strong>다. C-space가 차원뿐 아니라 <em>모양</em>을 갖는다는 첫
                    힌트다.
                </p>}
            />
            <CSpacePreview2R/>
            <T
                en={<p>
                    A robot's DOF is the sum of its links' freedoms minus the constraints imposed by its joints.
                    For open chains this is simply the number of joints, while for closed chains the loop
                    constraints remove freedoms (the four-bar above has four joints but only <em>one</em> DOF).
                    Making this bookkeeping precise is where the next chapter begins.
                </p>}
                ko={<p>
                    로봇의 자유도는 링크들이 가진 자유도의 합에서 관절이 부과하는 제약을 뺀 값이다. open
                    chain에서는 그저 관절 수이지만, closed chain에서는 루프 제약이 자유도를 앗아간다(위 4절
                    링크는 관절이 넷이지만 자유도는 <em>하나</em>다). 이 셈을 엄밀하게 만드는 데서 다음 장이
                    시작된다.
                </p>}
            />

            <T en={<h2>Chapter Roadmap</h2>} ko={<h2>챕터 로드맵</h2>}/>
            <T
                en={<p>
                    The notes run in order. Chapters 2 and 3 lay the foundations
                    (configurations and rigid-body motions), Chapters 4–7 build kinematics on top of them,
                    Chapter 8 adds dynamics, Chapter 9 turns motions into executable trajectories, and
                    Chapters 10–13 cover planning, control, manipulation, and mobile robots. Click a
                    card to jump in.
                </p>}
                ko={<p>
                    차례는 이렇다. 2·3장이 토대(configuration과 rigid-body motion)를 놓고,
                    4–7장이 그 위에 kinematics를 쌓으며, 8장이 dynamics를 더하고, 9장이 움직임을 실행 가능한
                    trajectory로 바꾸며, 10–13장이 planning·제어·manipulation·모바일 로봇을 다룬다.
                    카드를 눌러 바로 이동해 보자.
                </p>}
            />
            <div className="card-grid">
                {ROADMAP.map(({n, title, blurb}) => (
                    <div key={n} className="doc-card clickable" role="button" tabIndex={0}
                         onClick={() => go(n)}
                         onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && go(n)}>
                        <div className="dc-head">
                            <span className="dc-num">{n}</span>
                            <span className="dc-title">{t(title.en, title.ko)}</span>
                        </div>
                        <p className="text-sm text-muted m-0">{t(blurb.en, blurb.ko)}</p>
                    </div>
                ))}
            </div>
        </>
    )
}

export default Chapter1
