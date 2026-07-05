import {Suspense, useCallback, useEffect, useMemo, useState} from "react";
import chapters from "./pages/chapters";
import {applyPageMeta, chapterMeta} from "./libs/seo";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Toc from "./components/Toc";
import Footer from "./components/Footer";
import Home from "./pages/home/Home";
import ChapterContents from "./components/ChapterContents";
import {BASE_PATH} from "./libs/url";
import {useSearchParams, BrowserRouter, Routes, Route} from "react-router-dom";
import cn from "./libs/cn";

const PageSelector = () => {
    const [searchParam] = useSearchParams()
    const [menuOpen, setMenuOpen] = useState(false)
    const closeMenu = useCallback(() => setMenuOpen(false), [])

    const chapter = useMemo(() => parseInt(searchParam.get("chapter") ?? ""), [searchParam])
    const current = useMemo(
        () => chapters.find((item) => item.chapter === chapter && item.contents),
        [chapter],
    )

    // 챕터 전환마다 제목·메타를 현재 뷰에 맞춘다 (SPA 이므로 크롤러/프리뷰용 갱신).
    useEffect(() => {
        applyPageMeta(chapterMeta(current))
    }, [current])

    return (
        <>
            <Header onMenu={() => setMenuOpen((o) => !o)} showMenu={!!current}/>
            {current ? (
                <>
                    <div className="layout">
                        <Sidebar open={menuOpen} onNavigate={closeMenu}/>
                        <Suspense fallback={
                            <main className="content">
                                <div className="grid place-items-center py-24 text-muted text-sm">Loading…</div>
                            </main>
                        }>
                            <ChapterContents {...current}/>
                        </Suspense>
                        <Toc chapter={current.chapter}/>
                    </div>
                    <div className={cn("backdrop", menuOpen && "open")} onClick={closeMenu}/>
                </>
            ) : (
                <Home/>
            )}
            <Footer/>
        </>
    )
}

const App = () => {
    return <BrowserRouter basename={BASE_PATH || "/"}
                          future={{v7_startTransition: true, v7_relativeSplatPath: true}}>
        <Routes>
            <Route path={"/"} element={<PageSelector/>}/>
        </Routes>
    </BrowserRouter>
}

export default App
