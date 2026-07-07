import {lazy} from "react";
import {IChapterData} from "../../../types/global";

// 챕터 메타데이터는 여기서만 관리한다. 무거운 콘텐츠 모듈(특히 Ch2 의 Babylon 3D)은
// lazy import 로 분리해 홈/목록 화면에서는 불러오지 않는다 (초기 번들 축소).
// sections 는 본문 h2 헤딩 제목과 정확히 일치해야 사이드바/TOC/검색 앵커가 맞는다.
const data: IChapterData[] = [
    {
        chapter: 1,
        title: "Preview",
        contents: lazy(() => import("./Chapter1")),
        sections: [
            "What Is a Robot?",
            "Configuration and Degrees of Freedom",
            "Chapter Roadmap",
        ],
    },
    {
        chapter: 2,
        title: "Configuration Space",
        supportedExample: {python: true},
        contents: lazy(() => import("./Chapter2")),
        sections: [
            "Degrees of Freedom of a Rigid Body",
            "Degrees of Freedom of a Robot",
            "Configuration Space: Topology and Representation",
            "Configuration and Velocity Constraints",
            "Task Space and Workspace",
        ],
    },
    {
        chapter: 3,
        title: "Rigid-Body Motions",
        supportedExample: {python: true},
        contents: lazy(() => import("./Chapter3")),
        sections: [
            "Rigid-Body Motion",
            "Angular velocities",
            "Exponential Coordinate Representation of Rotation",
            "Homogeneous Transformation",
            "Rigid-Body Motions and Twists",
        ],
    },
    {
        chapter: 4,
        title: "Forward Kinematics",
        contents: lazy(() => import("./Chapter4")),
        sections: [
            "Forward Kinematics",
            "Product of Exponentials: Space Form",
            "Product of Exponentials: Body Form",
            "Universal Robot Description Format (URDF)",
        ],
    },
    {
        chapter: 5,
        title: "Velocity Kinematics and Statics",
        contents: lazy(() => import("./Chapter5")),
        sections: [
            "Manipulator Jacobian",
            "Space and Body Jacobian",
            "Statics of Open Chains",
            "Singularities",
            "Manipulability and Force Ellipsoids",
        ],
    },
    {
        chapter: 6,
        title: "Inverse Kinematics",
        contents: lazy(() => import("./Chapter6")),
        sections: [
            "Inverse Kinematics",
            "Analytic Inverse Kinematics",
            "Numerical Inverse Kinematics",
            "Inverse Velocity Kinematics",
        ],
    },
    {
        chapter: 7,
        title: "Kinematics of Closed Chains",
        contents: lazy(() => import("./Chapter7")),
        sections: [
            "Closed Chains and Parallel Mechanisms",
            "Forward and Inverse Kinematics",
            "Differential Kinematics",
            "Singularities",
        ],
    },
    {
        chapter: 8,
        title: "Dynamics of Open Chains",
        contents: lazy(() => import("./Chapter8")),
        sections: [
            "The Equations of Motion",
            "Lagrangian Dynamics of a 2R Arm",
            "Newton–Euler Inverse Dynamics",
            "Forward Dynamics and Simulation",
        ],
    },
    {
        chapter: 9,
        title: "Trajectory Generation",
        contents: lazy(() => import("./Chapter9")),
        sections: [
            "Paths and Time Scaling",
            "Polynomial Time Scaling",
            "Trapezoidal and S-Curve Profiles",
            "Via Point Trajectories",
        ],
    },
]

export default data.sort((a, b) => a.chapter - b.chapter)
