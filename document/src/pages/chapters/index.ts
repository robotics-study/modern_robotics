import {lazy} from "react";
import {IChapterData} from "../../../types/global";

// 챕터 메타데이터는 여기서만 관리한다. 무거운 콘텐츠 모듈(특히 Ch2 의 Babylon 3D)은
// lazy import 로 분리해 홈/목록 화면에서는 불러오지 않는다 (초기 번들 축소).
// sections 는 본문 h2 헤딩 제목과 정확히 일치해야 사이드바/TOC/검색 앵커가 맞는다.
const data: IChapterData[] = [
    {chapter: 1, title: "Preview"},
    {
        chapter: 2,
        title: "Configuration Space",
        supportedExample: {python: true},
        contents: lazy(() => import("./Chapter2")),
        sections: ["Intro", "Degree of Freedom (DOF)"],
    },
    {
        chapter: 3,
        title: "Rigid-Body Motions",
        supportedExample: {"c++": true},
        contents: lazy(() => import("./Chapter3")),
        sections: [
            "Rigid-Body Motion",
            "Angular velocities",
            "Exponential Coordinate Representation of Rotation",
            "Rigid-Body Motions and Twists",
            "Homogeneous Transformation",
        ],
    },
    {
        chapter: 4,
        title: "Forward Kinematics",
        supportedExample: {python: true},
        contents: lazy(() => import("./Chapter4")),
        sections: [
            "Rigid-Body Motion",
            "Angular velocities",
            "Exponential Coordinate Representation of Rotation",
            "Rigid-Body Motions and Twists",
            "Homogeneous Transformation",
        ],
    },
    // 아직 집필 전인 후속 챕터 — 사이드바/랜딩에서 dim 처리로 로드맵을 보여준다.
    {chapter: 5, title: "Velocity Kinematics and Statics"},
    {chapter: 6, title: "Inverse Kinematics"},
]

export default data.sort((a, b) => a.chapter - b.chapter)
