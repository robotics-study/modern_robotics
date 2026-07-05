// 관절(joint) 모티프 로고 — indigo→cyan 그라디언트 링크. Topbar 와 랜딩이 공유한다.
// 같은 페이지에 두 개가 동시에 렌더될 수 있어 그라디언트 id 를 인스턴스마다 달리 받는다.
const BrandLogo = ({size = 26, gradId = "mrLogo"}: { size?: number; gradId?: string }) => (
    <svg className="logo" width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <defs>
            <linearGradient id={gradId} x1="4" y1="20" x2="20" y2="4" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366f1"/>
                <stop offset="1" stopColor="#06b6d4"/>
            </linearGradient>
        </defs>
        <path d="M6 17 18 7" stroke={`url(#${gradId})`} strokeWidth="2.4" strokeLinecap="round"/>
        <circle cx="6" cy="17" r="2.7" fill={`url(#${gradId})`}/>
        <circle cx="18" cy="7" r="2.7" fill={`url(#${gradId})`}/>
    </svg>
)

export default BrandLogo
