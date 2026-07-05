import {useCallback} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";

// 챕터 전환 단일 진입점. 챕터는 ?chapter=N 쿼리로, 섹션 딥링크는 #anchor 해시로 표현한다.
// chapter 가 null/0 이면 홈(랜딩). anchor 가 있으면 TOC 가 헤딩에 id 를 부여한 뒤
// 해당 위치로 스크롤하고(해시 기반), 없으면 최상단으로 올린다.
export function useChapterNav() {
    const navigate = useNavigate()
    const [params] = useSearchParams()
    const current = parseInt(params.get("chapter") ?? "") || 0

    const go = useCallback((chapter: number | null, anchor?: string) => {
        const sp = new URLSearchParams()
        if (chapter && chapter > 0) sp.set("chapter", String(chapter))
        const search = sp.toString()
        navigate({
            pathname: "/",
            search: search ? `?${search}` : "",
            hash: anchor ? `#${anchor}` : "",
        })
        if (!anchor) window.scrollTo({top: 0})
    }, [navigate])

    return {current, go}
}
