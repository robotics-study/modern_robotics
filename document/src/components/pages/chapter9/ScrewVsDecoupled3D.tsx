import {useEffect, useRef, useState} from "react";
import {Color3, Matrix, Quaternion, Vector3} from "@babylonjs/core";
import Physics3DCanvas from "../../3d/Physics3DCanvas";
import CanvasFigure from "../../CanvasFigure";
import AxisTriad from "../../3d/AxisTriad";
import {useTr} from "../../../libs/i18n";

// SE(3) 의 "직선" 두 가지를 나란히 재생한다. screw path 는 고정 screw 축을 도는 한 번의
// 나사 운동이라 원점이 곡선을 그리고, decoupled path 는 원점은 직선, 회전은 일정 각속도로
// 따로 간다. 같은 Xstart → Xend 인데 지나는 길이 다르다는 것이 요점이다.
type Mat3 = number[];               // row-major 3×3

const I3: Mat3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];

const matMul = (a: Mat3, b: Mat3): Mat3 => {
    const r = new Array(9).fill(0);
    for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++)
            for (let k = 0; k < 3; k++) r[3 * i + j] += a[3 * i + k] * b[3 * k + j];
    return r;
};
const matT = (a: Mat3): Mat3 => [a[0], a[3], a[6], a[1], a[4], a[7], a[2], a[5], a[8]];
const matVec = (a: Mat3, v: number[]): number[] => [
    a[0] * v[0] + a[1] * v[1] + a[2] * v[2],
    a[3] * v[0] + a[4] * v[1] + a[5] * v[2],
    a[6] * v[0] + a[7] * v[1] + a[8] * v[2],
];
const skew = (w: number[]): Mat3 => [0, -w[2], w[1], w[2], 0, -w[0], -w[1], w[0], 0];
const matAdd = (a: Mat3, b: Mat3, sb = 1): Mat3 => a.map((v, i) => v + sb * b[i]);
const matScale = (a: Mat3, k: number): Mat3 => a.map((v) => v * k);

// Rodrigues: R = I + sinθ[ŵ] + (1−cosθ)[ŵ]².
const rodrigues = (wHat: number[], th: number): Mat3 => {
    const W = skew(wHat);
    return matAdd(matAdd(I3, matScale(W, Math.sin(th))), matScale(matMul(W, W), 1 - Math.cos(th)));
};

// SO(3) log: 회전각과 단위 축. (이 figure 의 입력은 θ ∈ (0, π) 로 골라 특수분기를 피한다.)
const logSO3 = (R: Mat3): {wHat: number[]; th: number} => {
    const tr = R[0] + R[4] + R[8];
    const th = Math.acos(Math.min(1, Math.max(-1, (tr - 1) / 2)));
    const s = 2 * Math.sin(th);
    return {wHat: [(R[7] - R[5]) / s, (R[2] - R[6]) / s, (R[3] - R[1]) / s], th};
};

// SE(3) exp/log (단위 축 ŵ, 각 θ 기준): p(θ) = G(θ)v̂, G(θ) = Iθ + (1−cosθ)[ŵ] + (θ−sinθ)[ŵ]².
const Gmat = (wHat: number[], th: number): Mat3 => {
    const W = skew(wHat);
    return matAdd(matAdd(matScale(I3, th), matScale(W, 1 - Math.cos(th))),
        matScale(matMul(W, W), th - Math.sin(th)));
};
const GmatInv = (wHat: number[], th: number): Mat3 => {
    const W = skew(wHat);
    const cot = 1 / Math.tan(th / 2);
    return matAdd(matAdd(matScale(I3, 1 / th), matScale(W, -0.5)),
        matScale(matMul(W, W), 1 / th - 0.5 * cot));
};

// 시작·끝 자세. 회전은 축 (0.25, 1, 0.35) 둘레 140°, 원점은 대각선으로 이동한다.
const P_START = [-1.7, 0.7, 0.6];
const P_END = [1.7, 2.3, -0.6];
const AXIS_RAW = [0.25, 1, 0.35];
const AXIS = (() => {
    const n = Math.hypot(...AXIS_RAW);
    return AXIS_RAW.map((v) => v / n);
})();
const R_START = I3;
const R_END = rodrigues(AXIS, (140 * Math.PI) / 180);

// screw path: X(s) = Xstart · exp(log(Xstart⁻¹Xend)·s).
const REL_R = matMul(matT(R_START), R_END);
const REL_P = matVec(matT(R_START), [P_END[0] - P_START[0], P_END[1] - P_START[1], P_END[2] - P_START[2]]);
const {wHat: REL_W, th: REL_TH} = logSO3(REL_R);
const REL_V = matVec(GmatInv(REL_W, REL_TH), REL_P);   // 단위 시간 twist 의 v̂ (θ 스케일 전)

const screwPose = (s: number): {R: Mat3; p: number[]} => {
    const th = REL_TH * s;
    const Re = rodrigues(REL_W, th);
    const pe = matVec(Gmat(REL_W, th), REL_V);
    return {
        R: matMul(R_START, Re),
        p: [
            P_START[0] + matVec(R_START, pe)[0],
            P_START[1] + matVec(R_START, pe)[1],
            P_START[2] + matVec(R_START, pe)[2],
        ],
    };
};

// decoupled path: 원점은 직선, 회전은 같은 축을 일정 속도로.
const decoupledPose = (s: number): {R: Mat3; p: number[]} => ({
    R: matMul(R_START, rodrigues(REL_W, REL_TH * s)),
    p: [
        P_START[0] + s * (P_END[0] - P_START[0]),
        P_START[1] + s * (P_END[1] - P_START[1]),
        P_START[2] + s * (P_END[2] - P_START[2]),
    ],
});

const toQuat = (R: Mat3): Quaternion => {
    const m = Matrix.Identity();
    // Babylon Matrix 는 row-major set: 회전 3×3 을 채운다.
    m.setRowFromFloats(0, R[0], R[1], R[2], 0);
    m.setRowFromFloats(1, R[3], R[4], R[5], 0);
    m.setRowFromFloats(2, R[6], R[7], R[8], 0);
    m.setRowFromFloats(3, 0, 0, 0, 1);
    // row-major 행렬을 Babylon(column 기준) 회전으로 바꾸려면 transpose 가 필요하다.
    return Quaternion.FromRotationMatrix(Matrix.Transpose(m));
};

const SCREW_COLOR = "#f2a63a";

const tracePoints = (pose: (s: number) => {p: number[]}): Vector3[] => {
    const pts: Vector3[] = [];
    for (let i = 0; i <= 60; i++) {
        const {p} = pose(i / 60);
        pts.push(new Vector3(p[0], p[1], p[2]));
    }
    return pts;
};
const SCREW_TRACE = tracePoints(screwPose);
const LINE_TRACE = tracePoints(decoupledPose);

interface SceneProps {
    canvasClassName: string;
}

const ScrewScene = ({canvasClassName}: SceneProps) => {
    const t = useTr();
    const [s, setS] = useState(0);
    const [playing, setPlaying] = useState(true);
    const rafRef = useRef<number>();
    const baseRef = useRef(0);

    useEffect(() => {
        if (!playing) return;
        const start = performance.now();
        const offset = baseRef.current;
        const tick = (now: number) => {
            const cur = (offset + (now - start) / 4200) % 1.25;   // 끝에서 잠깐 쉬도록 1.25 주기
            baseRef.current = cur;
            setS(Math.min(cur, 1));
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [playing]);

    const sp = screwPose(s);
    const dp = decoupledPose(s);

    return (
        <div className="flex flex-col gap-2 w-full">
            <Physics3DCanvas
                className={canvasClassName}
                initialView={{radius: 9, at: {x: 5, y: 5, z: 7}, to: {x: 0, y: 1.4, z: 0}}}
                ground={{opacity: 0.4}}
            >
                {/* 두 경로의 원점 자취 */}
                <lines name="screw-trace" points={SCREW_TRACE} color={new Color3(0.95, 0.65, 0.2)}/>
                <lines name="line-trace" points={LINE_TRACE} color={new Color3(0.42, 0.44, 0.9)}/>
                {/* 이동하는 frame 둘 */}
                <transformNode name="screw-frame" position={new Vector3(sp.p[0], sp.p[1], sp.p[2])}
                               rotationQuaternion={toQuat(sp.R)}>
                    <AxisTriad name="screw-tf" size={0.85} radius={0.05}/>
                </transformNode>
                <transformNode name="line-frame" position={new Vector3(dp.p[0], dp.p[1], dp.p[2])}
                               rotationQuaternion={toQuat(dp.R)}>
                    <AxisTriad name="line-tf" size={0.85} radius={0.05}/>
                </transformNode>
                {/* 시작/끝 표시 구 */}
                <sphere name="start-dot" diameter={0.16} position={new Vector3(P_START[0], P_START[1], P_START[2])}>
                    <standardMaterial name="start-dot-mat" diffuseColor={new Color3(0.4, 0.42, 0.46)}
                                      emissiveColor={new Color3(0.15, 0.16, 0.18)}/>
                </sphere>
                <sphere name="end-dot" diameter={0.16} position={new Vector3(P_END[0], P_END[1], P_END[2])}>
                    <standardMaterial name="end-dot-mat" diffuseColor={new Color3(0.85, 0.27, 0.22)}
                                      emissiveColor={new Color3(0.4, 0.12, 0.1)}/>
                </sphere>
            </Physics3DCanvas>
            <div className="flex items-center justify-center gap-3 text-xs text-muted">
                <button
                    type="button"
                    onClick={() => setPlaying((p) => !p)}
                    className="px-2.5 py-1 rounded border border-[var(--accent)] text-[var(--accent)] font-semibold"
                >
                    {playing ? "❚❚ Pause" : "▶ Play"}
                </button>
                <span className="tabular-nums">s = {s.toFixed(2)}</span>
            </div>
            <div className="text-xs text-muted text-center">
                <span style={{color: SCREW_COLOR}} className="font-semibold">
                    {t("curved trace: screw path (one fixed screw axis)", "곡선 자취: screw path (고정 screw 축 하나)")}
                </span>
                {" · "}
                <span className="font-semibold">
                    {t("straight trace: decoupled path (line + constant-axis rotation)",
                        "직선 자취: decoupled path (직선 + 일정 축 회전)")}
                </span>
            </div>
        </div>
    );
};

const ScrewVsDecoupled3D = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "two straight lines in SE(3): the same Xstart → Xend by a screw motion and by a decoupled motion",
            "SE(3) 의 두 가지 직선: 같은 Xstart → Xend 를 screw 운동으로, 그리고 decoupled 운동으로",
        )}
        className="w-full sm:w-2/3 mx-auto"
        bodyClassName="w-[min(100%,104vh)]"
        modal={<ScrewScene canvasClassName="aspect-[4/3] w-full rounded-lg"/>}
    >
        <ScrewScene canvasClassName="aspect-[4/3] w-full rounded-lg"/>
    </CanvasFigure>;
};

export default ScrewVsDecoupled3D;
