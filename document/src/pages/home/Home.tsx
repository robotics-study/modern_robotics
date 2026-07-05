import {Suspense} from "react";
import {ISupportedExample} from "../../../types/global";
import chapters from "../chapters";
import BrandLogo from "../../components/BrandLogo";
import Hero3D from "../../components/Hero3D";
import {useChapterNav} from "../../libs/nav";

const REPO = "https://github.com/robotics-study/modern_robotics"

const ChapterCard = ({chapter, title, supportedExample, onOpen}: {
    chapter: number
    title: string
    supportedExample?: ISupportedExample
    onOpen: () => void
}) => {
    const langs = supportedExample
        ? Object.entries(supportedExample).filter(([, v]) => v).map(([lang]) => lang)
        : []
    return (
        <div className="doc-card clickable" role="button" tabIndex={0}
             onClick={onOpen}
             onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen()}>
            <div className="dc-head">
                <span className="dc-num">{chapter}</span>
                <span className="dc-title">{title}</span>
            </div>
            {langs.length > 0 && (
                <div className="chips">
                    {langs.map((lang) => (
                        <a key={lang} className="mini-chip" target="_blank" rel="noreferrer"
                           onClick={(e) => e.stopPropagation()}
                           href={`${REPO}/tree/main/sample_code/chapter${chapter}/${lang}`}>
                            {lang} code
                        </a>
                    ))}
                </div>
            )}
        </div>
    )
}

const Home = () => {
    const {go} = useChapterNav()
    const ready = chapters.filter((c) => c.contents)
    const planned = chapters.filter((c) => !c.contents)
    const first = ready[0]?.chapter ?? 2

    return (
        <main className="lander">
            <div className="lander-top">
                <BrandLogo size={54} gradId="mrLanderLogo"/>
                <h1>modern<span className="wm-dim"> robotics</span></h1>
                <p className="sub">
                    Interactive study notes on Kevin&nbsp;M.&nbsp;Lynch &amp; Frank&nbsp;C.&nbsp;Park's <em>Modern
                    Robotics</em> — configuration space, rigid-body motions, and forward kinematics with live 3D
                    joint visualizations.
                </p>
                <div className="lander-btns">
                    <button className="btn btn-primary" onClick={() => go(first)}>Start reading</button>
                    <a className="btn btn-ghost" href={REPO} target="_blank" rel="noopener noreferrer">GitHub</a>
                </div>
            </div>

            <Suspense fallback={<div className="hero-3d" style={{height: 320}}/>}>
                <Hero3D/>
            </Suspense>

            <div className="lander-cats">
                <div className="lander-cat">
                    <h3>Chapters</h3>
                    <div className="card-grid">
                        {ready.map((c) => (
                            <ChapterCard key={c.chapter} chapter={c.chapter} title={c.title}
                                         supportedExample={c.supportedExample} onOpen={() => go(c.chapter)}/>
                        ))}
                    </div>
                </div>

                <div className="lander-cat">
                    <h3>Roadmap <span className="soon">soon</span></h3>
                    <div className="chips">
                        {planned.map((c) => (
                            <span key={c.chapter} className="dim">Ch.{c.chapter} · {c.title}</span>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Home
