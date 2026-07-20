import {lazy} from "react";
import {IChapterData} from "../../../types/global";

// 챕터 메타데이터는 여기서만 관리한다. 무거운 콘텐츠 모듈(특히 Ch2 의 Babylon 3D)은
// lazy import 로 분리해 홈/목록 화면에서는 불러오지 않는다 (초기 번들 축소).
// sections 의 en/ko 문자열은 각 언어로 렌더된 본문 h2 헤딩과 정확히 일치해야
// 사이드바/TOC/검색 앵커(slug)가 맞는다.
const data: IChapterData[] = [
    {
        chapter: 1,
        title: {en: "Preview", ko: "Preview"},
        contents: lazy(() => import("./Chapter1")),
        sections: [
            {en: "What Is a Robot?", ko: "로봇이란 무엇인가?"},
            {en: "Actuators, Transmissions, and Sensors", ko: "구동기, 동력 전달 장치, 센서"},
            {en: "Configuration and Degrees of Freedom", ko: "Configuration과 자유도"},
            {en: "Chapter Roadmap", ko: "챕터 로드맵"},
        ],
    },
    {
        chapter: 2,
        title: {en: "Configuration Space", ko: "Configuration 공간"},
        supportedExample: {python: true},
        contents: lazy(() => import("./Chapter2")),
        sections: [
            {en: "Degrees of Freedom of a Rigid Body", ko: "강체의 자유도"},
            {en: "Degrees of Freedom of a Robot", ko: "로봇의 자유도"},
            {en: "Grübler's Formula", ko: "Grübler 공식"},
            {en: "Configuration Space: Topology and Representation", ko: "Configuration 공간: 위상과 표현"},
            {en: "Configuration and Velocity Constraints", ko: "Configuration 제약과 속도 제약"},
            {en: "Task Space and Workspace", ko: "Task 공간과 작업 공간"},
        ],
    },
    {
        chapter: 3,
        title: {en: "Rigid-Body Motions", ko: "Rigid-Body Motion"},
        supportedExample: {python: true},
        contents: lazy(() => import("./Chapter3")),
        sections: [
            {en: "Rigid-Body Motion", ko: "Rigid-Body Motion"},
            {en: "Angular velocities", ko: "각속도"},
            {en: "Exponential Coordinate Representation of Rotation", ko: "회전의 Exponential Coordinate 표현"},
            {en: "Homogeneous Transformation", ko: "Homogeneous Transformation"},
            {en: "Rigid-Body Motions and Twists", ko: "Rigid-Body Motion과 Twist"},
            {en: "Wrenches", ko: "Wrench"},
        ],
    },
    {
        chapter: 4,
        title: {en: "Forward Kinematics", ko: "Forward Kinematics"},
        contents: lazy(() => import("./Chapter4")),
        sections: [
            {en: "Forward Kinematics", ko: "Forward Kinematics"},
            {en: "Product of Exponentials: Space Form", ko: "Product of Exponentials(PoE): Space Form"},
            {en: "Product of Exponentials: Body Form", ko: "Product of Exponentials(PoE): Body Form"},
            {en: "Universal Robot Description Format (URDF)", ko: "URDF (Universal Robot Description Format)"},
        ],
    },
    {
        chapter: 5,
        title: {en: "Velocity Kinematics and Statics", ko: "Velocity Kinematics와 Statics"},
        contents: lazy(() => import("./Chapter5")),
        sections: [
            {en: "Manipulator Jacobian", ko: "Manipulator Jacobian"},
            {en: "Space and Body Jacobian", ko: "Space Jacobian과 Body Jacobian"},
            {en: "Statics of Open Chains", ko: "Open Chain의 Statics"},
            {en: "Singularities", ko: "Singularity"},
            {en: "Manipulability and Force Ellipsoids", ko: "Manipulability Ellipsoid와 Force Ellipsoid"},
        ],
    },
    {
        chapter: 6,
        title: {en: "Inverse Kinematics", ko: "Inverse Kinematics"},
        contents: lazy(() => import("./Chapter6")),
        sections: [
            {en: "Inverse Kinematics", ko: "Inverse Kinematics"},
            {en: "Analytic Inverse Kinematics", ko: "해석적 Inverse Kinematics"},
            {en: "Numerical Inverse Kinematics", ko: "수치적 Inverse Kinematics"},
            {en: "Inverse Velocity Kinematics", ko: "Inverse Velocity Kinematics"},
        ],
    },
    {
        chapter: 7,
        title: {en: "Kinematics of Closed Chains", ko: "Closed Chain의 Kinematics"},
        contents: lazy(() => import("./Chapter7")),
        sections: [
            {en: "Closed Chains and Parallel Mechanisms", ko: "Closed Chain과 Parallel Mechanism"},
            {en: "Forward and Inverse Kinematics", ko: "Forward Kinematics와 Inverse Kinematics"},
            {en: "Differential Kinematics", ko: "Differential Kinematics"},
            {en: "Singularities", ko: "Singularity"},
        ],
    },
    {
        chapter: 8,
        title: {en: "Dynamics of Open Chains", ko: "Open Chain의 Dynamics"},
        contents: lazy(() => import("./Chapter8")),
        sections: [
            {en: "The Equations of Motion", ko: "운동 방정식"},
            {en: "Lagrangian Dynamics of a 2R Arm", ko: "2R 팔의 Lagrangian Dynamics"},
            {en: "Dynamics of a Single Rigid Body", ko: "단일 강체의 Dynamics"},
            {en: "Newton–Euler Inverse Dynamics", ko: "Newton–Euler Inverse Dynamics"},
            {en: "Forward Dynamics and Simulation", ko: "Forward Dynamics와 시뮬레이션"},
            {en: "Task Space and Constrained Dynamics", ko: "Task Space와 Constrained Dynamics"},
            {en: "Motors, Gearing, and Friction", ko: "모터, 기어, 마찰"},
        ],
    },
    {
        chapter: 9,
        title: {en: "Trajectory Generation", ko: "Trajectory Generation"},
        contents: lazy(() => import("./Chapter9")),
        sections: [
            {en: "Paths and Time Scaling", ko: "경로와 Time Scaling"},
            {en: "Polynomial Time Scaling", ko: "다항식 Time Scaling"},
            {en: "Trapezoidal and S-Curve Profiles", ko: "Trapezoidal·S-Curve 프로파일"},
            {en: "Via Point Trajectories", ko: "Via Point Trajectory"},
            {en: "Time-Optimal Time Scaling", ko: "시간 최적 Time Scaling"},
        ],
    },
    {
        chapter: 10,
        title: {en: "Motion Planning", ko: "Motion Planning"},
        contents: lazy(() => import("./Chapter10")),
        sections: [
            {en: "Overview of Motion Planning", ko: "Motion Planning 개관"},
            {en: "Configuration Space Obstacles", ko: "C-space 장애물"},
            {en: "Graph Search: A*", ko: "그래프 탐색: A*"},
            {en: "Grid Methods", ko: "Grid 방법"},
            {en: "Sampling Methods: RRT and PRM", ko: "Sampling 방법: RRT와 PRM"},
            {en: "Virtual Potential Fields", ko: "Virtual Potential Field"},
            {en: "Nonlinear Optimization and Smoothing", ko: "최적화와 Smoothing"},
        ],
    },
    {
        chapter: 11,
        title: {en: "Robot Control", ko: "Robot Control"},
        contents: lazy(() => import("./Chapter11")),
        sections: [
            {en: "Control System Overview", ko: "제어 시스템 개관"},
            {en: "Error Dynamics", ko: "오차 동역학"},
            {en: "Motion Control with Velocity Inputs", ko: "속도 입력 Motion Control"},
            {en: "Motion Control with Torque Inputs", ko: "토크 입력 Motion Control"},
            {en: "Force Control", ko: "Force Control"},
            {en: "Hybrid Motion–Force Control", ko: "Hybrid Motion–Force Control"},
            {en: "Impedance Control", ko: "Impedance Control"},
            {en: "Low-Level Torque Control and Other Topics", ko: "저수준 토크 제어와 기타 주제"},
        ],
    },
    {
        chapter: 12,
        title: {en: "Grasping and Manipulation", ko: "Grasping과 Manipulation"},
        contents: lazy(() => import("./Chapter12")),
        sections: [
            {en: "Overview and Mathematical Preliminaries", ko: "개관과 수학 준비"},
            {en: "Contact Kinematics", ko: "Contact Kinematics"},
            {en: "Planar Twists as Rotation Centers", ko: "평면 twist 와 CoR"},
            {en: "Form Closure", ko: "Form Closure"},
            {en: "Friction and Wrench Cones", ko: "마찰과 Wrench Cone"},
            {en: "Force Closure", ko: "Force Closure"},
            {en: "Manipulation", ko: "Manipulation"},
        ],
    },
]

export default data.sort((a, b) => a.chapter - b.chapter)
