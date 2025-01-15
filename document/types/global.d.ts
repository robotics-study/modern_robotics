import {JSX} from "react";

export interface ISupportedExample {
    python?: string
}

export interface IChapterData {
    title: String,
    chapter: number,
    supportedExample: ISupportedExample | undefined
    contents: () => JSX.Element | undefined
}
