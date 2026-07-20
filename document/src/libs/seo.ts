// SPA 라 챕터 전환은 페이지 리로드 없이 일어난다. 크롤러/링크 프리뷰가 현재 뷰를 반영하도록
// document.title, description, Open Graph, canonical, hreflang, JSON-LD 를 클라이언트에서
// 갱신한다. index.html 에 정적으로 심어 둔 태그를 찾아 값만 바꾸고, 없으면 만든다.
// 설명문은 마케팅 문구가 아니라 학습 내용(주제·개념) 중심으로 쓴다.

import {Lang, pick} from "./i18n";
import {IChapterData} from "../../types/global";
import {CHAPTER_BLURBS} from "../pages/chapters/roadmap";

const ORIGIN = "https://robotics-study.github.io";
const BASE_PATH = "/modern_robotics/";

const SITE: Record<Lang, string> = {
    en: "Modern Robotics · Study",
    ko: "모던 로보틱스 · 스터디",
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
    let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
    if (!el) {
        el = document.createElement("meta")
        el.setAttribute(attr, key)
        document.head.appendChild(el)
    }
    el.setAttribute("content", content)
}

function upsertLink(rel: string, href: string, hreflang?: string) {
    const selector = hreflang
        ? `link[rel="${rel}"][hreflang="${hreflang}"]`
        : `link[rel="${rel}"]`
    let el = document.head.querySelector<HTMLLinkElement>(selector)
    if (!el) {
        el = document.createElement("link")
        el.rel = rel
        if (hreflang) el.hreflang = hreflang
        document.head.appendChild(el)
    }
    el.href = href
}

function upsertJsonLd(id: string, data: object) {
    let el = document.head.querySelector<HTMLScriptElement>(`script#${id}`)
    if (!el) {
        el = document.createElement("script")
        el.id = id
        el.type = "application/ld+json"
        document.head.appendChild(el)
    }
    el.textContent = JSON.stringify(data)
}

function clamp(text: string, max = 155): string {
    return text.length <= max ? text : text.slice(0, max - 1).trimEnd() + "…"
}

// 해시·잡다한 파라미터를 뺀 정규화 URL. 언어 변형은 ?lang=ko 로만 표현한다.
export function pageUrl(lang: Lang, chapter?: number): string {
    const params = new URLSearchParams()
    if (chapter !== undefined) params.set("chapter", String(chapter))
    if (lang === "ko") params.set("lang", "ko")
    const qs = params.toString()
    return `${ORIGIN}${BASE_PATH}${qs ? `?${qs}` : ""}`
}

export interface PageMeta {
    title: string
    description: string
    lang: Lang
    chapter?: IChapterData
}

export function applyPageMeta({title, description, lang, chapter}: PageMeta) {
    const desc = clamp(description)
    const canonical = pageUrl(lang, chapter?.chapter)
    document.title = title
    document.documentElement.lang = lang
    upsertMeta("name", "description", desc)
    upsertMeta("property", "og:title", title)
    upsertMeta("property", "og:description", desc)
    upsertMeta("property", "og:url", canonical)
    upsertMeta("property", "og:locale", lang === "ko" ? "ko_KR" : "en_US")
    upsertMeta("name", "twitter:title", title)
    upsertMeta("name", "twitter:description", desc)
    upsertLink("canonical", canonical)
    // 언어별 대체 URL: 같은 챕터의 en/ko 쌍.
    upsertLink("alternate", pageUrl("en", chapter?.chapter), "en")
    upsertLink("alternate", pageUrl("ko", chapter?.chapter), "ko")
    upsertLink("alternate", pageUrl("en", chapter?.chapter), "x-default")
    // 페이지 구조화 데이터.
    if (chapter) {
        upsertJsonLd("page-jsonld", {
            "@context": "https://schema.org",
            "@type": "TechArticle",
            headline: title,
            description: desc,
            inLanguage: lang,
            url: canonical,
            isPartOf: {
                "@type": "WebSite",
                name: SITE[lang],
                url: pageUrl(lang),
            },
            about: (chapter.sections ?? []).map((s) => pick(lang, s)),
            isBasedOn: {
                "@type": "Book",
                name: "Modern Robotics: Mechanics, Planning, and Control",
                author: ["Kevin M. Lynch", "Frank C. Park"],
                publisher: "Cambridge University Press",
            },
        })
    } else {
        upsertJsonLd("page-jsonld", {
            "@context": "https://schema.org",
            "@type": "LearningResource",
            name: SITE[lang],
            description: desc,
            url: canonical,
            inLanguage: ["en", "ko"],
            learningResourceType: "Study notes",
            about: [
                "Robotics", "Configuration Space", "Screw Theory", "Rigid-Body Motion",
                "Forward Kinematics", "Inverse Kinematics", "Jacobian", "Robot Dynamics",
                "Trajectory Generation", "Motion Planning", "Robot Control",
                "Grasping", "Wheeled Mobile Robots",
            ],
            isBasedOn: {
                "@type": "Book",
                name: "Modern Robotics: Mechanics, Planning, and Control",
                author: ["Kevin M. Lynch", "Frank C. Park"],
                publisher: "Cambridge University Press",
            },
        })
    }
}

const HOME_DESC: Record<Lang, string> = {
    en:
        "Study notes on Lynch & Park's Modern Robotics: configuration space, " +
        "screw theory, forward and inverse kinematics, Jacobians, dynamics, trajectory generation, " +
        "motion planning, robot control, grasping, and wheeled mobile robots.",
    ko:
        "Lynch & Park 의 Modern Robotics 학습 노트: configuration 공간, screw 이론, " +
        "정·역기구학, Jacobian, dynamics, trajectory 생성, motion planning, 로봇 제어, grasping, " +
        "wheeled mobile robot.",
}

// 챕터 → 페이지 메타. 설명은 챕터 한 줄 소개(내용 요약) + 주요 절 제목으로 만든다.
export function chapterMeta(lang: Lang, chapter?: IChapterData): PageMeta {
    if (!chapter) {
        return {title: SITE[lang], description: HOME_DESC[lang], lang}
    }
    const title = pick(lang, chapter.title)
    const blurb = CHAPTER_BLURBS.find((b) => b.n === chapter.chapter)?.blurb
    const topics = (chapter.sections ?? []).map((s) => pick(lang, s)).join(", ")
    const intro = blurb ? pick(lang, blurb) : ""
    const body = lang === "ko"
        ? `${intro} ${topics ? `주요 내용: ${topics}.` : ""}`.trim()
        : `${intro} ${topics ? `Topics: ${topics}.` : ""}`.trim()
    return {
        title: `${title} · Ch.${chapter.chapter} · ${SITE[lang]}`,
        description: body,
        lang,
        chapter,
    }
}
