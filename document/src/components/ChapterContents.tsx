import {IChapterData} from "../../types/global";
import 'katex/dist/katex.min.css';
import chapters from "../pages/chapters";
import {useChapterNav} from "../libs/nav";

const REPO = "https://github.com/robotics-study/modern_robotics"

// supportedExample(python/c++...) → 소스코드 chip 링크. nav_study 의 .code-links 와 동일한 룩.
const codeLinkFor = (chapter: number, language: string) =>
    `${REPO}/tree/main/sample_code/chapter${chapter}/${language}`

const ChapterContents = ({title, chapter, contents: Contents, supportedExample}: IChapterData) => {
    const {go} = useChapterNav()

    const prev = chapters.find((c) => c.chapter === chapter - 1 && c.contents)
    const next = chapters.find((c) => c.chapter === chapter + 1 && c.contents)
    // Ch.2 의 이전은 홈(Preview 는 미집필)
    const prevTarget = prev ?? (chapter === 2 ? {chapter: 1, title: "Overview"} : undefined)

    const codeLinks = supportedExample
        ? Object.entries(supportedExample).filter(([, v]) => v).map(([lang]) => lang)
        : []

    return (
        <main className="content">
            <article className="content-inner">
                <p className="eyebrow">Chapter {chapter}</p>
                <h1>{title}</h1>

                {codeLinks.length > 0 && (
                    <div className="code-links">
                        <span className="cl-label">Sample code</span>
                        {codeLinks.map((lang) => (
                            <a key={lang} href={codeLinkFor(chapter, lang)} target="_blank" rel="noopener noreferrer">
                                {lang}
                            </a>
                        ))}
                    </div>
                )}

                {Contents ? <Contents/> : null}

                <nav className="pager">
                    {prevTarget
                        ? <a onClick={() => go(prevTarget.chapter === 1 ? null : prevTarget.chapter)}>
                            <div className="dir">← Prev</div>
                            <div className="ttl">{prevTarget.chapter === 1 ? "Home" : prevTarget.title}</div>
                        </a>
                        : <span/>}
                    {next
                        ? <a className="next" onClick={() => go(next.chapter)}>
                            <div className="dir">Next →</div>
                            <div className="ttl">{next.title}</div>
                        </a>
                        : <span/>}
                </nav>
            </article>
        </main>
    )
}

export default ChapterContents
