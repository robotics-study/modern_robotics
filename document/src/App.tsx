import {Suspense, useMemo} from "react";
import chapters from "./pages/chapters";
import Header from "./components/Header";
import Home from "./pages/home/Home";
import ChapterContents from "./components/ChapterContents";
import {BASE_PATH} from "./libs/url";
import {useSearchParams, BrowserRouter, Routes, Route} from "react-router-dom";

const PageSelector = () => {
    const [searchParam] = useSearchParams()
    const chapter = useMemo(() => {
        return parseInt(searchParam.get('chapter') ?? '')
    }, [searchParam])
    const contents = useMemo(() => {
        const currentChapter = chapters.find((item) => item.chapter == chapter)
        return currentChapter && currentChapter.contents
            ? <ChapterContents {...currentChapter}/>
            : <Home/>
    }, [chapter]);

    return <div className="flex flex-col min-h-full">
        <Header/>
        <Suspense fallback={<div className="grid place-items-center py-24 text-muted text-sm">Loading…</div>}>
            {contents}
        </Suspense>
    </div>
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
