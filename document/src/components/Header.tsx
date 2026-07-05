import BrandLogo from "./BrandLogo";
import SearchBox from "./SearchBox";
import {useChapterNav} from "../libs/nav";

const REPO = "https://github.com/robotics-study/modern_robotics"
const TEXTBOOK = "https://hades.mech.northwestern.edu/index.php/Modern_Robotics"

const ExtIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M7 17 17 7M8 7h9v9"/>
    </svg>
)

// 스티키 상단 바 — 브랜드 · 네비 · 검색. 테마 토글은 없다(시스템 설정을 그대로 따름).
const Header = ({onMenu, showMenu}: { onMenu: () => void; showMenu: boolean }) => {
    const {go} = useChapterNav()

    return (
        <header className="topbar">
            {showMenu && (
                <button className="iconbtn menu-btn" onClick={onMenu} aria-label="menu">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                         strokeLinecap="round" aria-hidden="true">
                        <path d="M4 7h16M4 12h16M4 17h16"/>
                    </svg>
                </button>
            )}

            <button className="brand" onClick={() => go(null)} aria-label="Home">
                <BrandLogo gradId="mrBrandLogo"/>
                <span className="wm">modern<span className="wm-dim"> robotics</span></span>
            </button>

            <nav className="topnav">
                <a onClick={() => go(null)}>Overview</a>
                <a href={REPO} target="_blank" rel="noopener noreferrer">GitHub<ExtIcon/></a>
                <a href={TEXTBOOK} target="_blank" rel="noopener noreferrer">Textbook<ExtIcon/></a>
            </nav>

            <span className="spacer"/>
            <SearchBox/>
        </header>
    )
}

export default Header
