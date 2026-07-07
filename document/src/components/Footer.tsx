const REPO = "https://github.com/robotics-study/modern_robotics"

const Footer = () => (
    <footer className="site-footer">
        <p>modern robotics — interactive study notes on Lynch &amp; Park's <em>Modern Robotics</em></p>
        <p>Built as a static site · <a href={REPO} target="_blank" rel="noopener noreferrer">GitHub</a></p>
        <p>Unofficial, non-commercial study notes · not affiliated with or endorsed by the authors or Cambridge University Press.</p>
    </footer>
)

export default Footer
