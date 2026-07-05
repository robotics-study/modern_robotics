import {Suspense, useCallback, useMemo, useState} from "react";
import chapters from "./pages/chapters";
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
