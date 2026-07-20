// 12장 그림들이 공유하는 평면 wrench 계산. 평면 wrench 는 F = (mz, fx, fy),
// twist 는 V = (ωz, vx, vy) 로 두고 접촉 제약은 Fᵀ V ≥ 0 이다.
export type Wrench3 = [number, number, number];

// 접촉점 p 에서 힘 방향 f 로 만드는 wrench: mz = px·fy − py·fx.
export const contactWrench = (px: number, py: number, fx: number, fy: number): Wrench3 =>
    [px * fy - py * fx, fx, fy];

// pos({Fi}) = R³ 인지(= form/force closure)를 방향 샘플링으로 판정한다.
// closure 가 아니면 모든 Fi 와 둔각 이하(FᵀV ≤ 0)를 이루는 twist 방향이 존재하고,
// 그 방향이 "빠져나가는 운동"이다. 골든 스파이럴로 단위구를 촘촘히 훑는다.
// charLen 은 모멘트(mz)와 힘(f)의 단위를 맞추는 특성 길이.
export const positiveSpanTest = (
    wrenches: Wrench3[],
    charLen = 1,
    samples = 4000,
): {closed: boolean; escape: [number, number, number] | null} => {
    if (wrenches.length === 0) return {closed: false, escape: [1, 0, 0]};
    const scaled = wrenches.map(([m, fx, fy]) => [m / charLen, fx, fy] as Wrench3);
    const golden = Math.PI * (3 - Math.sqrt(5));
    let bestDir: [number, number, number] | null = null;
    let bestMax = Infinity;
    for (let i = 0; i < samples; i++) {
        const z = 1 - (2 * i + 1) / samples;
        const r = Math.sqrt(Math.max(0, 1 - z * z));
        const th = golden * i;
        const w: [number, number, number] = [z, r * Math.cos(th), r * Math.sin(th)];
        let mx = -Infinity;
        for (const [m, fx, fy] of scaled) {
            const d = m * w[0] + fx * w[1] + fy * w[2];
            if (d > mx) mx = d;
        }
        if (mx < bestMax) {
            bestMax = mx;
            bestDir = w;
        }
    }
    // 모든 방향에서 어떤 Fi 든 양의 성분을 가지면 positive span 이 R³ 전체다.
    if (bestMax > 1e-6) return {closed: true, escape: null};
    // 모든 Fi 와 음의 내적을 갖는 방향 w 를 찾았다면, 접촉이 허용하는 탈출 twist 는
    // 그 반대 방향 V = −w 다 (FᵀV ≥ 0). 모멘트 성분의 스케일을 되돌린다.
    return {closed: false, escape: [-bestDir![0] / charLen, -bestDir![1], -bestDir![2]]};
};

// twist (ωz, vx, vy) 아래에서 점 p 의 속도.
export const pointVel = (
    v: [number, number, number], px: number, py: number,
): [number, number] => [v[1] - v[0] * py, v[2] + v[0] * px];
