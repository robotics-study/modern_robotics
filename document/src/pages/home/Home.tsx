import {Suspense} from "react";
import {ISupportedExample, Localized} from "../../../types/global";
import chapters from "../chapters";
import BrandLogo from "../../components/BrandLogo";
import Hero3D from "../../components/Hero3D";
import {useChapterNav} from "../../libs/nav";
import {T, useLang, useTr, pick} from "../../libs/i18n";

const REPO = "https://github.com/robotics-study/modern_robotics"

const ChapterCard = ({chapter, title, supportedExample, onOpen}: {
    chapter: number
    title: Localized
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
                <span className="dc-num">{chapter}</span>
                <span className="dc-title">{pick(lang, title)}</span>
            </div>
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
    const planned = chapters.filter((c) => !c.contents)
    const first = ready[0]?.chapter ?? 2

    return (
        <main className="lander">
            <div className="lander-top">
                <BrandLogo size={54} gradId="mrLanderLogo"/>
                <h1>modern<span className="wm-dim"> robotics</span></h1>
                <T
                    en={<p className="sub">
                        Interactive study notes on Kevin&nbsp;M.&nbsp;Lynch &amp; Frank&nbsp;C.&nbsp;Park's <em>Modern
                        Robotics</em> — configuration space, rigid-body motions, and forward kinematics with live 3D
                        joint visualizations.
                    </p>}
                    ko={<p className="sub">
                        Kevin&nbsp;M.&nbsp;Lynch &amp; Frank&nbsp;C.&nbsp;Park 의 <em>Modern Robotics</em> 인터랙티브
                        학습 노트 — configuration 공간, rigid-body motion, 그리고 실시간 3D 관절 시각화로 배우는 forward kinematics.
                    </p>}
                />
                <div className="lander-btns">
                    <button className="btn btn-primary" onClick={() => go(first)}>{t("Start reading", "학습 시작")}</button>
                    <a className="btn btn-ghost" href={REPO} target="_blank" rel="noopener noreferrer">GitHub</a>
                </div>
            </div>

            <Suspense fallback={<div className="hero-3d" style={{height: 320}}/>}>
                <Hero3D/>
            </Suspense>

            <div className="lander-cats">
                <div className="lander-cat">
                    <h3>{t("Chapters", "챕터")}</h3>
                    <div className="card-grid">
                        {ready.map((c) => (
                            <ChapterCard key={c.chapter} chapter={c.chapter} title={c.title}
                                         supportedExample={c.supportedExample} onOpen={() => go(c.chapter)}/>
                        ))}
                    </div>
                </div>

                <div className="lander-cat">
                    <h3>{t("Roadmap", "로드맵")} <span className="soon">soon</span></h3>
                    <div className="chips">
                        {planned.map((c) => (
                            <span key={c.chapter} className="dim">Ch.{c.chapter} · {pick(lang, c.title)}</span>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Home
