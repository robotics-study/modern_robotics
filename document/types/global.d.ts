import {JSX} from "react";

export interface ISupportedExample {
    python?: boolean,
    "c++"?: boolean,
    "javascript?": boolean,
}

export interface IChapterData {
    title: String,
    chapter: number,
    supportedExample: ISupportedExample | undefined
    contents: () => JSX.Element | undefined
}
