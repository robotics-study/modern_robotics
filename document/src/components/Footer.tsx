import {T} from "../libs/i18n";

const REPO = "https://github.com/robotics-study/modern_robotics"

const Footer = () => (
    <footer className="site-footer">
        <T
            en={<p>modern robotics — interactive study notes on Lynch &amp; Park's <em>Modern Robotics</em></p>}
            ko={<p>modern robotics — Lynch &amp; Park 의 <em>Modern Robotics</em> 인터랙티브 학습 노트</p>}
        />
        <T
            en={<p>Built as a static site · <a href={REPO} target="_blank" rel="noopener noreferrer">GitHub</a></p>}
            ko={<p>정적 사이트로 제작 · <a href={REPO} target="_blank" rel="noopener noreferrer">GitHub</a></p>}
        />
        <T
            en={<p>Unofficial, non-commercial study notes · not affiliated with or endorsed by the authors or Cambridge University Press.</p>}
            ko={<p>비공식·비영리 학습 노트 · 저자 또는 Cambridge University Press 와 제휴하거나 승인받지 않았습니다.</p>}
        />
    </footer>
)

export default Footer
