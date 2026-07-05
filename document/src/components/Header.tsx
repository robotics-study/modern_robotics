import {useCallback, useState} from "react";
import {useSearchParams} from "react-router-dom";
import chapters from "../pages/chapters";

const BrandLogo = () => (
    <svg className="w-6 h-6 flex-none" width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <defs>
            <linearGradient id="mrLogoGrad" x1="4" y1="20" x2="20" y2="4" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366f1"/>
                <stop offset="1" stopColor="#06b6d4"/>
            </linearGradient>
        </defs>
        <path d="M6 17 18 7" stroke="url(#mrLogoGrad)" strokeWidth="2.4" strokeLinecap="round"/>
        <circle cx="6" cy="17" r="2.7" fill="url(#mrLogoGrad)"/>
        <circle cx="18" cy="7" r="2.7" fill="url(#mrLogoGrad)"/>
    </svg>
)

const getTheme = () => document.documentElement.getAttribute("data-theme")
    ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")

const Header = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [theme, setTheme] = useState<string>(getTheme)

    const chapterNum = parseInt(searchParams.get("chapter") ?? "")
    const current = chapters.find(c => c.chapter === chapterNum && c.contents)

    const goHome = useCallback(() => {
        const next = new URLSearchParams(searchParams)
        next.delete("chapter")
        setSearchParams(next)
    }, [searchParams, setSearchParams])

    const toggleTheme = useCallback(() => {
        const next = getTheme() === "dark" ? "light" : "dark"
        document.documentElement.setAttribute("data-theme", next)
        try {
            localStorage.setItem("mr-theme", next)
        } catch (e) { /* 저장 실패해도 UI 는 정상 동작 */
        }
        setTheme(next)
    }, [])

    return (
        <header className="mr-topbar">
            <button className="flex items-center gap-2.5 font-bold text-[1.05rem]" onClick={goHome}
                    aria-label="Home">
                <BrandLogo/>
                <span className="tracking-tight">modern<span className="text-muted font-semibold"> robotics</span></span>
            </button>

            {current && (
                <span className="hidden sm:flex items-center gap-1.5 text-sm text-muted min-w-0">
                    <span className="text-border">/</span>
                    <span className="font-medium">Ch.{current.chapter}</span>
                    <span className="truncate">{current.title}</span>
                </span>
            )}

            <span className="flex-1"/>

            <button className="mr-iconbtn" onClick={toggleTheme}
                    aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}>
                {theme === "dark" ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="4"/>
                        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>
                    </svg>
                ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>
                    </svg>
                )}
            </button>
        </header>
    )
}

export default Header
