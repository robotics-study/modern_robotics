import {Suspense} from "react";
import {ISupportedExample, Localized} from "../../../types/global";
import chapters from "../chapters";
import {CHAPTER_BLURBS, PARTS} from "../chapters/roadmap";
import BrandLogo from "../../components/BrandLogo";
import Hero3D from "../../components/Hero3D";
import {useChapterNav} from "../../libs/nav";
import {useLang, useTr, pick} from "../../libs/i18n";

const REPO = "https://github.com/robotics-study/modern_robotics"

const ChapterCard = ({chapter, title, blurb, supportedExample, onOpen}: {
    chapter: number
    title: Localized
    blurb?: Localized
    supportedExample?: ISupportedExample
    onOpen: () => void
}) => {
    const {lang} = useLang()
    const t = useTr()
    const langs = supportedExample
        ? Object.entries(supportedExample).filter(([, v]) => v).map(([lang]) => lang)
        : []
    return (
        <div className="doc-card clickable" role="button" tabIndex={0}
             onClick={onOpen}
             onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onOpen()}>
            <div className="dc-head">
                <span className="dc-num">{String(chapter).padStart(2, "0")}</span>
                <span className="dc-title">{pick(lang, title)}</span>
            </div>
            {blurb && <p className="dc-blurb">{pick(lang, blurb)}</p>}
            {langs.length > 0 && (
                <div className="chips">
                    {langs.map((codeLang) => (
                        <a key={codeLang} className="mini-chip" target="_blank" rel="noreferrer"
                           onClick={(e) => e.stopPropagation()}
                           href={`${REPO}/tree/main/sample_code/chapter${chapter}/${codeLang}`}>
                            {t(`${codeLang} code`, `${codeLang} 코드`)}
                        </a>
                    ))}
                </div>
            )}
        </div>
    )
}

const Home = () => {
    const {go} = useChapterNav()
    const {lang} = useLang()
    const t = useTr()
    const ready = chapters.filter((c) => c.contents)
    const first = ready[0]?.chapter ?? 1
    const blurbOf = (n: number) => CHAPTER_BLURBS.find((b) => b.n === n)?.blurb

    return (
        <main className="lander">
            <div className="lander-top">
                <BrandLogo size={54} gradId="mrLanderLogo"/>
                <h1>modern<span className="wm-dim"> robotics</span></h1>
                <div className="lander-chips">
                    <span className="chip">Screw Theory</span>
                    <span className="chip">Kinematics</span>
                    <span className="chip">Dynamics</span>
                    <span className="chip">Trajectory</span>
                    <span className="chip">Motion Planning</span>
                    <span className="chip">Control</span>
                    <span className="chip">Grasping</span>
                    <span className="chip">Mobile Robots</span>
                </div>
                <div className="lander-btns">
                    <button className="btn btn-primary" onClick={() => go(first)}>{t("Start reading", "학습 시작")}</button>
                    <a className="btn btn-ghost" href={REPO} target="_blank" rel="noopener noreferrer">GitHub</a>
                </div>
            </div>

            <Suspense fallback={<div className="hero-3d" style={{height: 320}}/>}>
                <Hero3D/>
            </Suspense>

            <div className="lander-cats">
                {PARTS.map((part, pi) => (
                    <div key={part.title.en} className="lander-cat">
                        <div className="part-head">
                            <h3>
                                <span className="part-index">{["I", "II", "III", "IV", "V"][pi]}</span>
                                {pick(lang, part.title)}
                            </h3>
                            <p className="part-desc">{pick(lang, part.desc)}</p>
                        </div>
                        <div className="card-grid">
                            {ready
                                .filter((c) => c.chapter >= part.range[0] && c.chapter <= part.range[1])
                                .map((c) => (
                                    <ChapterCard key={c.chapter} chapter={c.chapter} title={c.title}
                                                 blurb={blurbOf(c.chapter)}
                                                 supportedExample={c.supportedExample}
                                                 onOpen={() => go(c.chapter)}/>
                                ))}
                        </div>
                    </div>
                ))}
            </div>
        </main>
    )
}

export default Home
