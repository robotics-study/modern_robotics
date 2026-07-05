import {ComponentType} from "react";

export interface ISupportedExample {
    python?: boolean,
    "c++"?: boolean,
    javascript?: boolean,
}

export interface IChapterData {
    title: string,
    chapter: number,
    supportedExample?: ISupportedExample,
    // 지연 로딩(React.lazy)된 컴포넌트일 수 있다. contents 가 없으면 아직 준비되지 않은 챕터.
    contents?: ComponentType,
}
