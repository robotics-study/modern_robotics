import {IChapterData} from "../../types/global";
import React, {useCallback} from "react";

interface ExampleLinkProps {
    chapter: number
    language: string
}

const ExampleLinkProps = ({
                              chapter,
                              language
                          }: ExampleLinkProps) => {
    return <label className="px-2 text-sm border rounded-full py-0.5 shadow">
        <a target="_blank"
           href={`https://github.com/robotics-study/modern_robotics/tree/main/sample_code/chapter${chapter}/${language}`}>{
            language
        } code</a>
    </label>
}

interface ChapterLayerProps extends IChapterData {
    updateChapterParam(chapter?: number): void
}

const HomeChapterListItem = ({
                                 title,
                                 supportedExample,
                                 contents: Contents,
                                 chapter,
                                 updateChapterParam
                             }: ChapterLayerProps) => {
    const callback = useCallback(() => {
        if (Contents) {
            updateChapterParam(chapter)
        }
    }, [Contents])

    return <li className="flex w-full flex-col p-2">
        <div className="flex">
            <span className="grow font-semibold">Chapter {chapter}</span>
            <button onClick={callback}>
                <h2 className="font-medium">{title}
                </h2>
            </button>
        </div>
        {
            supportedExample ? <div className="flex justify-end pt-1.5">
                {
                    Object.keys(supportedExample).map((language, index) => {
                        return <ExampleLinkProps key={index} language={language} chapter={chapter}></ExampleLinkProps>
                    })
                }
            </div> : null
        }
    </li>
}

export default HomeChapterListItem
