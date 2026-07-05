import chapters from "../chapters";
import HomeChapterListItem from "../../components/HomeChapterListItem";

const Home = () => {
    return (
        <main className="w-full max-w-4xl mx-auto px-6 py-12 sm:py-16">
            <div className="text-center mb-12">
                <svg className="w-14 h-14 mx-auto" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <defs>
                        <linearGradient id="mrHomeGrad" x1="4" y1="20" x2="20" y2="4" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#6366f1"/>
                            <stop offset="1" stopColor="#06b6d4"/>
                        </linearGradient>
                    </defs>
                    <path d="M6 17 18 7" stroke="url(#mrHomeGrad)" strokeWidth="2.4" strokeLinecap="round"/>
                    <circle cx="6" cy="17" r="2.7" fill="url(#mrHomeGrad)"/>
                    <circle cx="18" cy="7" r="2.7" fill="url(#mrHomeGrad)"/>
                </svg>
                <h1 className="mr-grad-text text-4xl font-bold tracking-tight mt-4">modern robotics</h1>
                <p className="text-muted max-w-xl mx-auto mt-3 leading-relaxed">
                    Interactive study notes for Kevin&nbsp;M.&nbsp;Lynch &amp; Frank&nbsp;C.&nbsp;Park's <em>Modern
                    Robotics</em> — configuration space, rigid-body motions, and forward kinematics with 3D joint
                    visualizations.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {chapters.map((chapter) => (
                    <HomeChapterListItem key={chapter.chapter} {...chapter}/>
                ))}
            </div>
        </main>
    )
}

export default Home
