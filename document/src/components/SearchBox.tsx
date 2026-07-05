import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {searchDocs, SearchEntry} from "../libs/search";
import {useChapterNav} from "../libs/nav";
import cn from "../libs/cn";

// nav_study 검색 드롭다운의 React 포팅 — 점수 정렬·키보드 탐색·바깥 클릭 닫기.
const SearchBox = () => {
    const {go} = useChapterNav()
    const [query, setQuery] = useState("")
    const [sel, setSel] = useState(-1)
    const [open, setOpen] = useState(false)
    const boxRef = useRef<HTMLDivElement>(null)

    const results = useMemo<SearchEntry[]>(() => (query.trim() ? searchDocs(query) : []), [query])

    // 쿼리가 비면 선택/열림 초기화
    useEffect(() => {
        setSel(-1)
        setOpen(!!query.trim())
    }, [query])

    const goResult = useCallback((r: SearchEntry) => {
        setOpen(false)
        setQuery("")
        go(r.chapter, r.anchor)
    }, [go])

    const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown") {
            e.preventDefault()
            setSel((s) => Math.min(s + 1, results.length - 1))
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setSel((s) => Math.max(s - 1, 0))
        } else if (e.key === "Enter") {
            const pick = results[sel] ?? results[0]
            if (pick) goResult(pick)
        } else if (e.key === "Escape") {
            setOpen(false)
                ; (e.target as HTMLInputElement).blur()
        }
    }, [results, sel, goResult])

    // 바깥 클릭 시 닫기
    useEffect(() => {
        const onClick = (e: MouseEvent) => {
            if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener("click", onClick)
        return () => document.removeEventListener("click", onClick)
    }, [])

    return (
        <div className="search" ref={boxRef}>
            <svg className="s-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7"/>
                <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
                type="search"
                placeholder="Search…"
                autoComplete="off"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setOpen(!!query.trim())}
                onKeyDown={onKeyDown}
            />
            <div className={cn("search-results", open && "open")}>
                {results.length === 0
                    ? <div className="r-empty">No results</div>
                    : results.map((r, i) => (
                        <a key={`${r.chapter}-${r.anchor ?? "top"}`}
                           className={cn(i === sel && "sel")}
                           onMouseEnter={() => setSel(i)}
                           onClick={(e) => {
                               e.preventDefault()
                               goResult(r)
                           }}>
                            <span className="r-title">{r.title}</span><br/>
                            <span className="r-crumb">{r.crumb}</span>
                        </a>
                    ))}
            </div>
        </div>
    )
}

export default SearchBox
