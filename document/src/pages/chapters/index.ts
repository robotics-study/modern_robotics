import {lazy} from "react";
import {IChapterData} from "../../../types/global";

// 챕터 메타데이터는 여기서만 관리한다. 무거운 콘텐츠 모듈(특히 Ch2 의 Babylon 3D)은
// lazy import 로 분리해 홈/목록 화면에서는 불러오지 않는다 (초기 번들 축소).
const data: IChapterData[] = [
    {chapter: 1, title: "Preview"},
    {
        chapter: 2,
        title: "Configuration Space",
        supportedExample: {python: true},
        contents: lazy(() => import("./Chapter2")),
    },
    {
        chapter: 3,
        title: "Rigid-Body Motions",
        supportedExample: {"c++": true},
        contents: lazy(() => import("./Chapter3")),
    },
    {
        chapter: 4,
        title: "Forward Kinematics",
        supportedExample: {python: true},
        contents: lazy(() => import("./Chapter4")),
    },
]

export default data.sort((a, b) => a.chapter - b.chapter)
