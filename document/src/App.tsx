import {useMemo, useState} from "react";
import chapters from "./pages/chapters";
import Header from "./components/Header";
import Home from "./pages/home/Home";
import ChapterContents from "./components/ChapterContents";

const App = () => {
    const [chapter, setChapter] = useState<number>(parseInt(new URLSearchParams(window.location.search).get('chapter')));
    const updateChapterParam = (chapter?: number) => {
        const url = new URL(window.location.href);
        if (chapter) {
            url.searchParams.set('chapter', chapter.toString());
        } else {
            url.searchParams.delete('chapter')
        }
        window.history.pushState(null, '', url)
        setChapter(chapter);
    };

    const contents = useMemo(() => {
        const currentChapter = chapters.find((item) => item.default.chapter == chapter)
        return currentChapter ? <ChapterContents {...currentChapter.default}/> :
            <Home updateChapterParam={updateChapterParam}/>
    }, [chapter]);

    return <div>
        <Header updateChapterParam={updateChapterParam}></Header>
        {contents}
    </div>
}

export default App
