// SPA 라 챕터 전환은 페이지 리로드 없이 일어난다. 크롤러/링크 프리뷰가 현재 뷰를 반영하도록
// document.title 과 description·Open Graph·canonical 메타를 클라이언트에서 갱신한다.
// index.html 에 정적으로 심어 둔 태그를 찾아 값만 바꾸고, 없으면(사이드 이펙트 대비) 만든다.

import {Lang, pick} from "./i18n";
import {IChapterData} from "../../types/global";

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

function setCanonical(href: string) {
    let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!el) {
        el = document.createElement("link")
        el.rel = "canonical"
        document.head.appendChild(el)
    }
    el.href = href
}

function clamp(text: string, max = 155): string {
    return text.length <= max ? text : text.slice(0, max - 1).trimEnd() + "…"
}

export interface PageMeta {
    title: string
    description: string
}

export function applyPageMeta({title, description}: PageMeta) {
    const desc = clamp(description)
    const url = window.location.href
    document.title = title
    upsertMeta("name", "description", desc)
    upsertMeta("property", "og:title", title)
    upsertMeta("property", "og:description", desc)
    upsertMeta("property", "og:url", url)
    upsertMeta("name", "twitter:title", title)
    upsertMeta("name", "twitter:description", desc)
    setCanonical(url)
}

const HOME_DESC: Record<Lang, string> = {
    en:
        "Interactive study notes for Kevin M. Lynch & Frank C. Park's 'Modern Robotics': " +
        "configuration space, rigid-body motions, and forward kinematics with 3D joint visualizations.",
    ko:
        "Kevin M. Lynch & Frank C. Park 의 'Modern Robotics' 인터랙티브 학습 노트 — " +
        "configuration 공간, rigid-body motion, 3D 관절 시각화로 배우는 forward kinematics.",
}

// 챕터 → 페이지 메타. 홈(챕터 없음)은 사이트 기본값으로 되돌린다.
export function chapterMeta(lang: Lang, chapter?: IChapterData): PageMeta {
    if (!chapter) {
        return {title: SITE[lang], description: HOME_DESC[lang]}
    }
    const title = pick(lang, chapter.title)
    const topics = (chapter.sections ?? []).map((s) => pick(lang, s)).join(", ")
    const body = lang === "ko"
        ? `Modern Robotics ${chapter.chapter}장 — ${title}${topics ? `: ${topics}` : ""}.`
        : `Modern Robotics Ch.${chapter.chapter} — ${title}${topics ? `: ${topics}` : ""}.`
    return {
        title: `${title} · Ch.${chapter.chapter} · ${SITE[lang]}`,
        description: body,
    }
}
