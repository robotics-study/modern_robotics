import {T} from "../libs/i18n";

const LICENSE_URL = "https://github.com/robotics-study/modern_robotics/blob/main/LICENSE"
const BOOK_URL = "https://modernrobotics.org"

const Footer = () => (
    <footer className="site-footer">
        <T
            en={<p>
                Study notes on Lynch &amp; Park's <em>Modern Robotics</em> (Cambridge University Press) ·{" "}
                <a href={BOOK_URL} target="_blank" rel="noopener noreferrer">modernrobotics.org</a>
            </p>}
            ko={<p>
                Lynch &amp; Park 의 <em>Modern Robotics</em> (Cambridge University Press) 를 공부하며 만든 노트 ·{" "}
                <a href={BOOK_URL} target="_blank" rel="noopener noreferrer">modernrobotics.org</a>
            </p>}
        />
        <T
            en={<p>
                © 2026 robotics-study ·{" "}
                <a href={LICENSE_URL} target="_blank" rel="noopener noreferrer">MIT License</a>
                {" "}· Unofficial study notes
            </p>}
            ko={<p>
                © 2026 robotics-study ·{" "}
                <a href={LICENSE_URL} target="_blank" rel="noopener noreferrer">MIT License</a>
                {" "}· 비공식 학습 노트
            </p>}
        />
    </footer>
)

export default Footer
