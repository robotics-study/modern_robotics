import {useCallback} from "react";
import {useLocation, useNavigate, useSearchParams} from "react-router-dom";

// 챕터 전환 단일 진입점. 챕터는 /chapter/N 경로로, 언어는 ?lang=ko 쿼리로, 섹션 딥링크는
// #anchor 해시로 표현한다. 경로 기반이라 빌드 시 챕터별 정적 셸(dist/chapter/N/index.html)을
// 미리 만들 수 있고, 크롤러가 챕터마다 다른 메타를 본다.
// chapter 가 null/0 이면 홈(랜딩). anchor 가 있으면 TOC 가 헤딩에 id 를 부여한 뒤 해당
// 위치로 스크롤하고, 없으면 최상단으로 올린다.
export function useChapterNav() {
    const navigate = useNavigate()
    const location = useLocation()
    const [params] = useSearchParams()
    const match = location.pathname.match(/^\/chapter\/(\d+)/)
    const current = match ? parseInt(match[1]) : 0

    const go = useCallback((chapter: number | null, anchor?: string) => {
        // 언어 선택은 URL 로 유지한다 (공유·크롤링 시 언어 변형이 살아남도록).
        const sp = new URLSearchParams()
        const lang = params.get("lang")
        if (lang) sp.set("lang", lang)
        const search = sp.toString()
        navigate({
            pathname: chapter && chapter > 0 ? `/chapter/${chapter}` : "/",
            search: search ? `?${search}` : "",
            hash: anchor ? `#${anchor}` : "",
        })
        if (!anchor) window.scrollTo({top: 0})
    }, [navigate, params])

    return {current, go}
}
