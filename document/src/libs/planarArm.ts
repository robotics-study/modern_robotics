// 평면 개방연쇄(planar open chain)의 공용 기구학. Ch4~6 의 2R/3R 그림이 공유해
// 정방향/역방향 기구학·Jacobian·조작성 타원 계산을 한 곳에서 관리한다.

export interface Vec2 {
    x: number;
    y: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// 관절각을 base 부터 누적해 각 관절 위치와 end-effector 방향 φ 를 구한다.
export function planarFk(thetas: number[], links: number[]): {points: Vec2[]; phi: number} {
    let x = 0, y = 0, a = 0;
    const points: Vec2[] = [{x, y}];
    for (let i = 0; i < links.length; i++) {
        a += thetas[i];
        x += links[i] * Math.cos(a);
        y += links[i] * Math.sin(a);
        points.push({x, y});
    }
    return {points, phi: a};
}

// 2R 팔의 2×2 기하 Jacobian. 각 열은 해당 관절만 단위 속도로 돌 때의 tip 속도 벡터다.
export function jacobian2R(t1: number, t2: number, l1: number, l2: number): [Vec2, Vec2] {
    const s1 = Math.sin(t1), c1 = Math.cos(t1);
    const s12 = Math.sin(t1 + t2), c12 = Math.cos(t1 + t2);
    return [
        {x: -l1 * s1 - l2 * s12, y: l1 * c1 + l2 * c12},
        {x: -l2 * s12, y: l2 * c12},
    ];
}

// det J = l1 l2 sin θ2 — 0 이 되는 곳(θ2 = 0 또는 π)이 특이점이다.
export function det2R(t2: number, l1: number, l2: number): number {
    return l1 * l2 * Math.sin(t2);
}

export interface Ellipse2 {
    // 주축(major)·부축(minor) 반지름 = J 의 특이값(√(JJᵀ 고윳값)). angle 은 major 축 방향.
    major: number;
    minor: number;
    angle: number;
}

// 조작성 타원: 단위 관절속도 원을 J 로 사상한 타원. JJᵀ 의 고유분해로 반축과 방향을 얻는다.
export function manipulabilityEllipse(j1: Vec2, j2: Vec2): Ellipse2 {
    const a = j1.x * j1.x + j2.x * j2.x;
    const b = j1.x * j1.y + j2.x * j2.y;
    const c = j1.y * j1.y + j2.y * j2.y;
    const mid = (a + c) / 2;
    const half = Math.sqrt(Math.max(0, ((a - c) / 2) ** 2 + b * b));
    return {
        major: Math.sqrt(Math.max(0, mid + half)),
        minor: Math.sqrt(Math.max(0, mid - half)),
        angle: 0.5 * Math.atan2(2 * b, a - c),
    };
}

// 원(c1,r1)·원(c2,r2)의 교점. 폐연쇄(four-bar 등)의 loop-closure 를 푸는 기본 연산으로,
// sign 이 두 교점(조립 모드) 중 하나를 고른다. h 는 중심선에서 교점까지의 수직 오프셋 —
// h=0 이면 두 모드가 합쳐지는 특이 배치다. 두 원이 만나지 않으면 null.
export function circleCircleIntersect(
    c1: Vec2,
    r1: number,
    c2: Vec2,
    r2: number,
    sign: number,
): {p: Vec2; h: number} | null {
    const dx = c2.x - c1.x, dy = c2.y - c1.y;
    const d = Math.hypot(dx, dy);
    if (d > r1 + r2 + 1e-9 || d < Math.abs(r1 - r2) - 1e-9 || d < 1e-9) return null;
    const ell = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
    const h = Math.sqrt(Math.max(0, r1 * r1 - ell * ell));
    const bx = c1.x + (ell / d) * dx, by = c1.y + (ell / d) * dy;
    return {p: {x: bx + sign * (h / d) * -dy, y: by + sign * (h / d) * dx}, h};
}

export interface IkSolution {
    theta1: number;
    theta2: number;
}

// 2R 위치 역기구학. 작업공간(annulus) 밖이면 reachable=false, 안이면 lefty/righty 두 해를 준다.
export function ik2R(
    x: number,
    y: number,
    l1: number,
    l2: number,
): {reachable: boolean; righty?: IkSolution; lefty?: IkSolution} {
    const r2 = x * x + y * y;
    const r = Math.sqrt(r2);
    if (r > l1 + l2 + 1e-9 || r < Math.abs(l1 - l2) - 1e-9) return {reachable: false};
    const gamma = Math.atan2(y, x);
    const beta = Math.acos(clamp((l1 * l1 + l2 * l2 - r2) / (2 * l1 * l2), -1, 1));
    const alpha = Math.acos(clamp((r2 + l1 * l1 - l2 * l2) / (2 * l1 * r), -1, 1));
    return {
        reachable: true,
        righty: {theta1: gamma - alpha, theta2: Math.PI - beta},
        lefty: {theta1: gamma + alpha, theta2: beta - Math.PI},
    };
}
