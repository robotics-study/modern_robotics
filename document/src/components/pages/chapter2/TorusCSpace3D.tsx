import {useMemo, useState} from "react";
import {Color3, Vector3} from "@babylonjs/core";
import Physics3DCanvas from "../../3d/Physics3DCanvas";
import CanvasFigure from "../../CanvasFigure";
import Label3D from "../../3d/Label3D";
import {useTr} from "../../../libs/i18n";

// 2R 팔의 C-space T² = S¹×S¹ 를 실제 torus 표면으로 보여준다. θ1 은 큰 원(가로 방향),
// θ2 는 작은 원(튜브 둘레)을 돌고, 두 각이 정하는 점 하나가 곧 로봇의 configuration 이다.
const R = 4;        // torus 중심원 반지름
const TUBE = 1.6;   // 튜브 반지름

const POINT_COLOR = new Color3(0.39, 0.4, 0.95);
const U_COLOR = new Color3(0.95, 0.65, 0.23);   // θ1 방향 원
const V_COLOR = new Color3(0.88, 0.33, 0.24);   // θ2 방향 원
const SURFACE_COLOR = new Color3(0.45, 0.52, 0.68);

// torus 매개변수화: u = θ1 (큰 원), v = θ2 (작은 원).
const torusPoint = (u: number, v: number) =>
    new Vector3((R + TUBE * Math.cos(v)) * Math.cos(u), TUBE * Math.sin(v), (R + TUBE * Math.cos(v)) * Math.sin(u));

const circlePoints = (fn: (s: number) => Vector3): Vector3[] =>
    Array.from({length: 65}, (_, i) => fn((i / 64) * 2 * Math.PI));

interface SceneProps {
    canvasClassName: string;
}

const TorusScene = ({canvasClassName}: SceneProps) => {
    const t = useTr();
    const [theta, setTheta] = useState<[number, number]>([0.9, 0.7]);
    const [u, v] = theta;

    const p = torusPoint(u, v);
    // θ1 원: v 고정, u 스윕 / θ2 원: u 고정, v 스윕 — 현재 점을 지나는 두 S¹ 인자.
    const uCircle = useMemo(() => circlePoints((s) => torusPoint(s, v)), [v]);
    const vCircle = useMemo(() => circlePoints((s) => torusPoint(u, s)), [u]);

    const setJoint = (i: number, val: number) =>
        setTheta((prev) => {
            const next = [...prev] as [number, number];
            next[i] = val;
            return next;
        });

    const degrees = (rad: number) => Math.round(rad * 180 / Math.PI);

    return (
        <div className="flex flex-col gap-2 w-full">
            <Physics3DCanvas
                className={canvasClassName}
                initialView={{radius: 16, at: {x: 9, y: 8, z: 9}, to: {x: 0, y: 0, z: 0}}}
                ground={{opacity: 0.4}}
            >
                <torus name="cspace-torus" diameter={2 * R} thickness={2 * TUBE} tessellation={48}>
                    <standardMaterial
                        name="cspace-torus-mat"
                        diffuseColor={SURFACE_COLOR}
                        alpha={0.4}
                        specularColor={Color3.Black()}
                    />
                </torus>
                <lines name="u-circle" points={uCircle} color={U_COLOR}/>
                <lines name="v-circle" points={vCircle} color={V_COLOR}/>
                <sphere name="config-point" diameter={0.55} position={p}>
                    <standardMaterial name="config-point-mat" diffuseColor={POINT_COLOR}
                                      emissiveColor={POINT_COLOR.scale(0.5)}/>
                </sphere>
                <Label3D text="θ1" color="#f2a63a" position={torusPoint(u + 0.5, v).scale(1.12)} size={1.4}/>
                <Label3D text="θ2" color="#e0533d" position={torusPoint(u, v + 1.4).scale(1.12)} size={1.4}/>
            </Physics3DCanvas>
            <div className="w-full flex flex-col gap-1 text-xs text-muted px-2 pb-1">
                {[0, 1].map((i) => (
                    <label key={i} className="flex items-center gap-2">
                        <span className="w-8 shrink-0">θ{i + 1}</span>
                        <input
                            type="range"
                            min={-Math.PI}
                            max={Math.PI}
                            step={0.01}
                            value={theta[i]}
                            onChange={(e) => setJoint(i, parseFloat(e.target.value))}
                            className="w-full accent-[var(--accent)]"
                            aria-label={`joint angle theta ${i + 1}`}
                        />
                        <span className="w-12 shrink-0 text-right tabular-nums">{degrees(theta[i])}°</span>
                    </label>
                ))}
                <div className="text-center pt-0.5">
                    (θ1, θ2) ∈ S¹ × S¹ = T² ·{" "}
                    {t("one point = one arm configuration", "점 하나 = 팔의 configuration 하나")}
                </div>
            </div>
        </div>
    );
};

const TorusCSpace3D = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "the C-space of a 2R arm is a torus · θ1 runs around the big circle, θ2 around the tube",
            "2R 팔의 C-space 는 torus · θ1 은 큰 원을, θ2 는 튜브 둘레를 돈다",
        )}
        className="w-full sm:w-2/3 mx-auto"
        bodyClassName="w-[min(100%,76vh)]"
        modal={<TorusScene canvasClassName="aspect-square w-full rounded-lg"/>}
    >
        <TorusScene canvasClassName="aspect-square w-full rounded-lg"/>
    </CanvasFigure>;
};

export default TorusCSpace3D;
