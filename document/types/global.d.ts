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
    // 본문 major 섹션(h2) 제목 목록 — 사이드바/TOC/검색 인덱스가 공유한다.
    // 실제 렌더된 헤딩 텍스트와 문자열이 일치해야 앵커(slug)가 맞는다.
    sections?: string[],
}
