// Chapter 8 의 두 그림(동역학 시뮬레이터·질량행렬 타원)이 같은 팔을 그리도록 팔 파라미터와
// 점질량 2R 질량행렬을 한 곳에서 정의한다 — 한쪽 상수만 바뀌면 두 그림이 서로 다른 팔이 되기 때문이다.
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
