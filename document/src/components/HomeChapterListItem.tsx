import {IChapterData} from "../../types/global";
import React, {useCallback} from "react";

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

    return <li className="flex w-full p-2">
        <span className="grow font-semibold">Chapter {chapter}</span>
        <button onClick={callback}>
            <h2 className="font-medium">{title}
            </h2>
        </button>
    </li>
}

export default HomeChapterListItem
