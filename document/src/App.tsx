import {useMemo} from "react";
import chapters from "./pages/chapters";
import Header from "./components/Header";
import Home from "./pages/home/Home";
import ChapterContents from "./components/ChapterContents";
import {useSearchParams, BrowserRouter, Routes, Route} from "react-router-dom";

const PageSelector = () => {
    const [searchParam] = useSearchParams()
    const chapter = useMemo(() => {
        return parseInt(searchParam.get('chapter'))
    }, [searchParam])
    const contents = useMemo(() => {
        const currentChapter = chapters.find((item) => item.default.chapter == chapter)
        return currentChapter ? <ChapterContents {...currentChapter.default}/> :
            <Home/>
    }, [chapter]);

    return <div>
        <Header></Header>
        {contents}
    </div>
}

const App = () => {
    return <BrowserRouter>
        <Routes>
            <Route path={"/modern_robotics"} element={<PageSelector/>}></Route>
        </Routes>
    </BrowserRouter>
}

export default App
