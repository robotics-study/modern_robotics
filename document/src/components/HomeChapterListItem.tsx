import {IChapterData} from "../../types/global";
import {useCallback} from "react";
import {useSearchParams} from "react-router-dom";
import cn from "../libs/cn";

interface ExampleLinkProps {
    chapter: number
    language: string
}

const ExampleLink = ({chapter, language}: ExampleLinkProps) => (
    <a
        className="mr-chip"
        target="_blank"
        rel="noreferrer"
        onClick={e => e.stopPropagation()}
        href={`https://github.com/robotics-study/modern_robotics/tree/main/sample_code/chapter${chapter}/${language}`}
    >
        {language} code
    </a>
)

const HomeChapterListItem = ({
                                 title,
                                 supportedExample,
                                 contents: Contents,
                                 chapter,
                             }: IChapterData) => {
    const [searchParam, setSearchParams] = useSearchParams()

    const open = useCallback(() => {
        if (!Contents) return
        const next = new URLSearchParams(searchParam)
        next.set("chapter", chapter.toString())
        setSearchParams(next)
    }, [Contents, chapter, searchParam, setSearchParams])

    const clickable = !!Contents

    return (
        <div
            className={cn("mr-card flex flex-col gap-3", clickable ? "cursor-pointer" : "opacity-60 cursor-default")}
            onClick={open}
            role={clickable ? "button" : undefined}
            tabIndex={clickable ? 0 : undefined}
            onKeyDown={e => clickable && (e.key === "Enter" || e.key === " ") && open()}
        >
            <div className="flex items-baseline gap-3">
                <span className="mr-grad-text text-2xl font-bold tabular-nums leading-none">{chapter}</span>
                <h2 className="font-semibold text-[1.05rem] leading-snug break-keep">{title}</h2>
                {!clickable && <span className="mr-chip ml-auto self-center">soon</span>}
            </div>
            {supportedExample && (
                <div className="flex flex-wrap gap-2">
                    {Object.entries(supportedExample)
                        .filter(([, value]) => value)
                        .map(([language]) => (
                            <ExampleLink key={language} language={language} chapter={chapter}/>
                        ))}
                </div>
            )}
        </div>
    )
}

export default HomeChapterListItem
