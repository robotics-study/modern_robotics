import chapters from "../pages/chapters";
import {useChapterNav} from "../libs/nav";
import cn from "../libs/cn";

// 좌측 챕터 네비게이션. 집필된 챕터는 링크, 미집필(로드맵) 챕터는 dim 처리.
const Sidebar = ({open: mobileOpen, onNavigate}: { open?: boolean; onNavigate?: () => void }) => {
    const {current, go} = useChapterNav()

    const ready = chapters.filter((c) => c.contents)
    const planned = chapters.filter((c) => !c.contents)

    const open = (chapter: number) => {
        go(chapter)
        onNavigate?.()
    }

    return (
        <aside className={cn("sidebar", mobileOpen && "open")}>
            <h4>Overview</h4>
            <a className={cn(current === 0 && "active")} onClick={() => {
                go(null)
                onNavigate?.()
            }}>Home</a>

            <h4>Chapters</h4>
            {ready.map((c) => (
                <a key={c.chapter} className={cn(current === c.chapter && "active")} onClick={() => open(c.chapter)}>
                    <span className="num">{c.chapter}</span>{c.title}
                </a>
            ))}

            <h4>Coming soon <span className="soon">soon</span></h4>
            {planned.map((c) => (
                <span key={c.chapter} className="planned">
                    <span className="num">{c.chapter}</span>{c.title}
                </span>
            ))}
        </aside>
    )
}

export default Sidebar
