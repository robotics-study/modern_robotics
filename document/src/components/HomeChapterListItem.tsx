import {IChapterData} from "../../types/global";
import React, {useCallback} from "react";
import {useSearchParams} from "react-router-dom";

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
}

const HomeChapterListItem = ({
                                 title,
                                 supportedExample,
                                 contents: Contents,
                                 chapter,
                             }: ChapterLayerProps) => {
    const [searchParam, setSearchParams] = useSearchParams()

    const callback = useCallback(() => {
        if (Contents) {
            searchParam.set("chapter", chapter.toString())
            setSearchParams(searchParam)
        }
    }, [Contents])

    return <li className="flex w-full flex-col p-2">
        <button className="flex" onClick={callback}>
            <span className="font-semibold break-keep whitespace-nowrap">Chapter {chapter}</span>
            <h2 className="font-medium flex flex-wrap justify-end grow">{title}
            </h2>
        </button>
        {
            supportedExample ? <div className="flex justify-end pt-1.5">
                {
                    Object.entries(supportedExample).filter(([_, value]) => value).map(([language, _], index) => {
                        return <ExampleLinkProps key={index} language={language} chapter={chapter}></ExampleLinkProps>
                    })
                }
            </div> : null
        }
    </li>
}

export default HomeChapterListItem
