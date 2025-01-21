import {IChapterData} from "../../types/global";
import 'katex/dist/katex.min.css';
import {useSearchParams} from "react-router-dom";
import chapters from "../pages/chapters";
import {useCallback, useMemo} from "react";

interface ChapterContentsProps extends IChapterData {
}

const ChapterContents = ({
                             title,
                             chapter,
                             contents: Contents
                         }: ChapterContentsProps) => {
    const [searchParam, setSearchParam] = useSearchParams()
    const changeCallback = useCallback((data: number) => {
        if (data == 1) {
            searchParam.delete("chapter")
        } else {
            searchParam.set("chapter", data.toString())
        }
        setSearchParam(searchParam)
    }, [chapter, searchParam])

    return <div>
        <h2 className="w-full py-1 px-2 flex justify-between items-center bg-gray-700 text-gray-300 tracking-wider gap-2">
            <span className="text-sm break-keep whistespace-nowrap">Chapter.{chapter}</span>
            <span className="text-base font-semibold flex flex-wrap justify-end text-right">{title}</span>
        </h2>
        <div className="p-2 tracking-wide">
            <Contents/>
        </div>
        <div className="flex sticky bottom-0 h-12 w-full bg-transparent px-5 justify-between">
            {
                chapters.find(item => item.default.chapter == chapter - 1 && item.default.contents) || chapter == 2
                    ? <button
                        onClick={() => changeCallback(chapter - 1)}
                        className="w-28 border rounded-lg p-2 h-fit text-xs font-bold bg-gray-700 text-gray-200 break-keep whitespace-nowrap"
                    >
                        <span>{
                            chapter == 2 ? "Home" : "Prev Chapter"
                        }</span>
                    </button> : <div></div>
            }
            {
                chapters.find(item => item.default.chapter == chapter + 1 && item.default.contents)
                    ? <button
                        onClick={() => changeCallback(chapter + 1)}
                        className="w-28 border rounded-lg p-2 h-fit text-xs font-bold bg-gray-700 text-gray-200 break-keep whitespace-nowrap"
                    >
                        <span>Next Chapter</span>
                    </button> : <div></div>
            }
        </div>
    </div>
}


export default ChapterContents
