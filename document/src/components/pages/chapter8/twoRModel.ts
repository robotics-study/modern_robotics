// Chapter 8 의 그림들과 Chapter 9 의 시간 최적 time scaling 이 같은 팔을 쓰도록 팔 파라미터와
// 점질량 2R 동역학 항들을 한 곳에서 정의한다 — 한쪽 상수만 바뀌면 그림마다 서로 다른 팔이 되기 때문이다.
export const TWO_R = {l1: 1.4, l2: 1.1, m1: 1, m2: 1, g: 9.81} as const;

// 점질량 2R 팔의 대칭 질량행렬 [M11, M12, M22]. M12 는 두 관절을 결합한다(관성 커플링).
export const massMatrix2R = (t2: number): [number, number, number] => {
    const {l1, l2, m1, m2} = TWO_R;
    const c2 = Math.cos(t2);
    const m11 = m1 * l1 * l1 + m2 * (l1 * l1 + 2 * l1 * l2 * c2 + l2 * l2);
    const m12 = m2 * (l1 * l2 * c2 + l2 * l2);
    const m22 = m2 * l2 * l2;
    return [m11, m12, m22];
};

// 원심(θ̇ᵢ²)·코리올리(θ̇ᵢθ̇ⱼ) 항 c(θ, θ̇).
export const coriolis2R = (t2: number, d1: number, d2: number): [number, number] => {
    const {l1, l2, m2} = TWO_R;
    const s2 = Math.sin(t2);
    return [
        -m2 * l1 * l2 * s2 * (2 * d1 * d2 + d2 * d2),
        m2 * l1 * l2 * d1 * d1 * s2,
    ];
};

// 중력항 g(θ).
export const gravity2R = (t1: number, t2: number): [number, number] => {
    const {l1, l2, m1, m2, g} = TWO_R;
    const c1 = Math.cos(t1), c12 = Math.cos(t1 + t2);
    return [
        (m1 + m2) * l1 * g * c1 + m2 * g * l2 * c12,
        m2 * g * l2 * c12,
    ];
};
