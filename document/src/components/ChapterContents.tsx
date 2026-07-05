import {IChapterData} from "../../types/global";
import 'katex/dist/katex.min.css';
import {useSearchParams} from "react-router-dom";
import chapters from "../pages/chapters";
import {useCallback} from "react";

const ChapterContents = ({
                             title,
                             chapter,
                             contents: Contents,
                         }: IChapterData) => {
    const [searchParam, setSearchParam] = useSearchParams()
    const goToChapter = useCallback((data: number) => {
        const next = new URLSearchParams(searchParam)
        if (data <= 1) {
            next.delete("chapter")
        } else {
            next.set("chapter", data.toString())
        }
        setSearchParam(next)
        window.scrollTo({top: 0})
    }, [searchParam, setSearchParam])

    const hasPrev = chapter === 2 || !!chapters.find(item => item.chapter === chapter - 1 && item.contents)
    const hasNext = !!chapters.find(item => item.chapter === chapter + 1 && item.contents)

    return (
        <div className="flex-1 w-full">
            <div className="max-w-4xl mx-auto w-full px-5 sm:px-6 pt-8 pb-3">
                <div className="flex items-baseline gap-3">
                    <span className="mr-grad-text text-3xl font-bold leading-none tabular-nums">Ch.{chapter}</span>
                    <h1 className="text-2xl font-bold tracking-tight break-keep">{title}</h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto w-full px-5 sm:px-6 pb-8">
                {Contents ? <Contents/> : null}
            </div>

            <nav className="max-w-4xl mx-auto w-full px-5 sm:px-6 pb-10 flex justify-between gap-3">
                {hasPrev
                    ? <button className="mr-btn" onClick={() => goToChapter(chapter - 1)}>
                        <span aria-hidden="true">←</span>{chapter === 2 ? "Home" : `Chapter ${chapter - 1}`}
                    </button>
                    : <span/>}
                {hasNext
                    ? <button className="mr-btn" onClick={() => goToChapter(chapter + 1)}>
                        Chapter {chapter + 1}<span aria-hidden="true">→</span>
                    </button>
                    : <span/>}
            </nav>
        </div>
    )
}

export default ChapterContents
