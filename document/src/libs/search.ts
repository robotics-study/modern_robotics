import chapters from "../pages/chapters";
import {slugify} from "./slug";

export interface SearchEntry {
    title: string
    crumb: string
    chapter: number
    anchor?: string   // 섹션 앵커(slug). 없으면 챕터 최상단.
    text: string      // 매칭용 추가 텍스트
}

// 챕터 메타데이터(제목 + 섹션)로 정적 검색 인덱스를 구성한다. nav_study 의
// search-index.json 과 동일한 역할 — SPA 라 빌드 대신 런타임에 한 번 만든다.
function buildIndex(): SearchEntry[] {
    const entries: SearchEntry[] = []
    for (const c of chapters) {
        if (!c.contents) continue   // 집필된 챕터만 검색 대상
        const crumb = `Ch.${c.chapter} · ${c.title}`
        entries.push({title: c.title, crumb: `Chapter ${c.chapter}`, chapter: c.chapter, text: c.title})
        for (const s of c.sections ?? []) {
            entries.push({title: s, crumb, chapter: c.chapter, anchor: slugify(s), text: s})
        }
    }
    return entries
}

const INDEX = buildIndex()

export function searchDocs(query: string, limit = 8): SearchEntry[] {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return INDEX
        .map((it) => {
            const ti = it.title.toLowerCase()
            const hay = `${it.title} ${it.crumb} ${it.text}`.toLowerCase()
            let score = 0
            if (ti.indexOf(q) === 0) score += 100
            else if (ti.indexOf(q) >= 0) score += 50
            if (hay.indexOf(q) >= 0) score += 10
            return {it, score}
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((x) => x.it)
}
