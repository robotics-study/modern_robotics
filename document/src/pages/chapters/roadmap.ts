import {Localized} from "../../../types/global";

// 홈 카드와 Chapter 1 로드맵이 공유하는 챕터 한 줄 소개. 챕터를 추가하면 여기에 함께 적는다.
export interface ChapterBlurb {
    n: number;
    title: Localized<string>;
    blurb: Localized<string>;
}

export const CHAPTER_BLURBS: ChapterBlurb[] = [
    {
        n: 1,
        title: {en: "Preview", ko: "Preview"},
        blurb: {
            en: "What a robot is, and the map of everything that follows: joints, actuators, " +
                "sensors, and degrees of freedom.",
            ko: "로봇이란 무엇인가. 관절, 구동기, 센서, 자유도, 그리고 이후 전체 내용의 지도.",
        },
    },
    {
        n: 2,
        title: {en: "Configuration Space", ko: "Configuration 공간"},
        blurb: {
            en: "How many numbers describe a robot's pose? DOF of bodies and mechanisms, " +
                "Grübler's formula, the shape (topology) of the C-space, task space and workspace.",
            ko: "로봇의 자세는 숫자 몇 개로 정해질까? 강체와 메커니즘의 자유도, Grübler 공식, " +
                "C-space의 모양(위상), task 공간과 작업 공간.",
        },
    },
    {
        n: 3,
        title: {en: "Rigid-Body Motions", ko: "Rigid-Body Motion"},
        blurb: {
            en: "Rotation matrices SO(3) and transforms SE(3), exponential coordinates " +
                "(rotate about ω̂ by θ), and screw theory: twists and wrenches.",
            ko: "회전 행렬 SO(3)와 변환 SE(3), exponential 좌표(ω̂ 축으로 θ만큼 회전), " +
                "그리고 screw 이론: twist와 wrench.",
        },
    },
    {
        n: 4,
        title: {en: "Forward Kinematics", ko: "Forward Kinematics"},
        blurb: {
            en: "Joint values in, end-effector pose out: the product of exponentials (PoE) " +
                "formula, needing only a base frame and an end-effector frame.",
            ko: "관절값을 넣으면 end-effector 자세가 나온다. base 프레임과 end-effector " +
                "프레임만 있으면 되는 product of exponentials(PoE) 공식.",
        },
    },
    {
        n: 5,
        title: {en: "Velocity Kinematics and Statics", ko: "Velocity Kinematics와 Statics"},
        blurb: {
            en: "The Jacobian maps joint rates to end-effector twists; singularities, " +
                "manipulability ellipsoids, and static force analysis all follow from it.",
            ko: "Jacobian은 관절 속도를 end-effector twist로 보낸다; singularity, " +
                "manipulability ellipsoid, 정역학 힘 해석이 모두 여기서 나온다.",
        },
    },
    {
        n: 6,
        title: {en: "Inverse Kinematics", ko: "Inverse Kinematics"},
        blurb: {
            en: "Desired pose in, joint values out. Closed-form solutions for special 6-DOF " +
                "arms and Jacobian-based numerical iteration for everything else.",
            ko: "원하는 자세를 넣으면 관절값이 나온다. 특수한 6자유도 팔의 닫힌형 해와, " +
                "그 밖의 모든 경우를 위한 Jacobian 기반 수치 반복.",
        },
    },
    {
        n: 7,
        title: {en: "Kinematics of Closed Chains", ko: "Closed Chain의 Kinematics"},
        blurb: {
            en: "Mechanisms with loops (five-bar, Stewart–Gough): multiple forward-kinematics " +
                "solutions, passive joints, and richer singularity behavior.",
            ko: "루프를 가진 메커니즘(5절 링크, Stewart–Gough): 여러 개의 forward kinematics 해, " +
                "수동 관절, 더 풍부한 singularity 거동.",
        },
    },
    {
        n: 8,
        title: {en: "Dynamics of Open Chains", ko: "Open Chain의 Dynamics"},
        blurb: {
            en: "The forces and torques behind the motion: Lagrangian and recursive " +
                "Newton–Euler formulations of the equations of motion.",
            ko: "움직임 뒤의 힘과 토크: 운동 방정식의 Lagrangian 정식화와 재귀적 " +
                "Newton–Euler 정식화.",
        },
    },
    {
        n: 9,
        title: {en: "Trajectory Generation", ko: "Trajectory Generation"},
        blurb: {
            en: "Turning a path into a motion: polynomial and trapezoidal time scalings and " +
                "smooth trajectories through timed via points.",
            ko: "경로를 움직임으로 바꾸기: 다항식·trapezoidal time scaling과 시각이 지정된 " +
                "via point를 지나는 매끄러운 trajectory.",
        },
    },
    {
        n: 10,
        title: {en: "Motion Planning", ko: "Motion Planning"},
        blurb: {
            en: "Collision-free paths: grid search, sampling planners (RRT, PRM), " +
                "and virtual potential fields.",
            ko: "충돌 없는 경로: grid 탐색, sampling planner (RRT, PRM), " +
                "그리고 virtual potential field.",
        },
    },
    {
        n: 11,
        title: {en: "Robot Control", ko: "Robot Control"},
        blurb: {
            en: "Motion, force, hybrid, and impedance control, from error dynamics " +
                "to computed torque.",
            ko: "오차 동역학에서 computed torque 까지, motion·force·hybrid·impedance 제어.",
        },
    },
    {
        n: 12,
        title: {en: "Grasping and Manipulation", ko: "Grasping과 Manipulation"},
        blurb: {
            en: "Contact kinematics, friction cones, form and force closure, " +
                "and manipulation beyond grasping.",
            ko: "접촉 kinematics, friction cone, form closure 와 force closure, " +
                "그리고 잡기 너머의 manipulation.",
        },
    },
    {
        n: 13,
        title: {en: "Wheeled Mobile Robots", ko: "Wheeled Mobile Robot"},
        blurb: {
            en: "Omnidirectional and nonholonomic bases, Lie brackets, shortest paths, " +
                "odometry, and mobile manipulation.",
            ko: "omnidirectional·nonholonomic 베이스, Lie bracket, 최단 경로, " +
                "odometry, mobile manipulation.",
        },
    },
];

// 홈에서 챕터를 묶어 보여 주는 파트 구분.
export const PARTS: Array<{
    range: [number, number];
    title: Localized<string>;
    desc: Localized<string>;
}> = [
    {
        range: [1, 3],
        title: {en: "Foundations", ko: "Foundations"},
        desc: {
            en: "The language of robots: degrees of freedom, configuration space, rigid-body motion.",
            ko: "로봇을 말하는 언어: 자유도, configuration 공간, rigid-body motion.",
        },
    },
    {
        range: [4, 7],
        title: {en: "Kinematics", ko: "Kinematics"},
        desc: {
            en: "Where the robot is and how fast it moves: forward, velocity, and inverse kinematics, open and closed chains.",
            ko: "로봇이 어디에 있고 얼마나 빨리 움직이는가: forward·velocity·inverse kinematics 와 closed chain.",
        },
    },
    {
        range: [8, 9],
        title: {en: "Dynamics & Trajectories", ko: "Dynamics & Trajectories"},
        desc: {
            en: "The forces behind the motion, and how to turn paths into time-parametrized trajectories.",
            ko: "움직임 뒤의 힘과 토크, 그리고 경로를 시간이 매겨진 trajectory 로 바꾸는 법.",
        },
    },
    {
        range: [10, 11],
        title: {en: "Planning & Control", ko: "Planning & Control"},
        desc: {
            en: "Finding collision-free motions and making the real robot follow them.",
            ko: "충돌 없는 움직임을 찾고, 실제 로봇이 그것을 따라가게 만드는 일.",
        },
    },
    {
        range: [12, 13],
        title: {en: "Interaction & Mobility", ko: "Interaction & Mobility"},
        desc: {
            en: "Robots touching the world: grasping and manipulation, then robots that roll.",
            ko: "세상과 접촉하는 로봇: grasping 과 manipulation, 그리고 바퀴로 구르는 로봇.",
        },
    },
];
