import {useEffect, useMemo, useRef, useState} from "react";
import {Color3, Quaternion, TransformNode, Vector3} from "@babylonjs/core";
import Physics3DCanvas from "../../3d/Physics3DCanvas";
import CanvasFigure from "../../CanvasFigure";
import AxisTriad from "../../3d/AxisTriad";
import Label3D from "../../3d/Label3D";
import {useTr} from "../../../libs/i18n";

// R·Rsb vs Rsb·R — 같은 R = Rot(축, θ) 인데 곱하는 순서에 따라 회전축의 의미가 달라진다.
// 왼쪽은 고정 프레임의 수직축(ω̂ in {s}) 둘레로, 오른쪽은 물체 프레임의 같은 수치 축(ω̂ in {b})
// 둘레로 돈다. 씬 그래프의 부모∘자식 합성이 곧 행렬 곱이라 수학과 그림이 1:1 로 대응한다.
const OFFSET = 5.2;
// 초기 자세 Rsb: 단일 axis-angle 이라 합성 순서 모호성이 없다.
const Q_SB = Quaternion.RotationAxis(new Vector3(1, 0, 1).normalize(), 0.9);
const AXIS_COLOR = new Color3(0.95, 0.65, 0.2);

// 수직(여기서는 Babylon +Y) 회전축 막대. 부모 노드의 방향을 그대로 따른다.
const AxisRod = ({name}: {name: string}) => (
    <>
        <cylinder name={`${name}-rod`} height={13} diameter={0.14} tessellation={16}>
            <standardMaterial name={`${name}-rod-mat`} diffuseColor={AXIS_COLOR}
                              emissiveColor={AXIS_COLOR.scale(0.4)}/>
        </cylinder>
        <cylinder name={`${name}-tip`} height={0.9} diameterTop={0} diameterBottom={0.45}
                  tessellation={16} position={new Vector3(0, 6.5, 0)}>
            <standardMaterial name={`${name}-tip-mat`} diffuseColor={AXIS_COLOR}
                              emissiveColor={AXIS_COLOR.scale(0.4)}/>
        </cylinder>
    </>
);

interface SceneProps {
    canvasClassName: string;
}

const FixedVsBodyScene = ({canvasClassName}: SceneProps) => {
    const t = useTr();
    const [theta, setTheta] = useState(1.0);
    // 왼쪽: 부모(θ 회전) ∘ 자식(Rsb) = R·Rsb / 오른쪽: 부모(Rsb) ∘ 자식(θ 회전) = Rsb·R
    const leftParentRef = useRef<TransformNode | null>(null);
    const rightChildRef = useRef<TransformNode | null>(null);
    const qTheta = useMemo(() => Quaternion.RotationAxis(Vector3.Up(), theta), [theta]);

    useEffect(() => {
        if (leftParentRef.current) leftParentRef.current.rotationQuaternion = qTheta;
        if (rightChildRef.current) rightChildRef.current.rotationQuaternion = qTheta;
    }, [qTheta]);

    return (
        <div className="flex flex-col gap-2 w-full">
            <Physics3DCanvas
                className={canvasClassName}
                initialView={{radius: 26, at: {x: 0, y: 13, z: 20}, to: {x: 0, y: 2, z: 0}}}
                ground={{opacity: 0.5}}
            >
                {/* 고정 프레임 회전: R·Rsb — 회전축은 {s} 의 수직축 (θ 가 변해도 축은 세워져 있다) */}
                <transformNode name="fixed-offset" position={new Vector3(-OFFSET, 0, 0)}>
                    <AxisRod name="fixed-axis"/>
                    <transformNode name="fixed-rot"
                                   onCreated={(n: TransformNode) => {
                                       leftParentRef.current = n;
                                       n.rotationQuaternion = qTheta;
                                   }}>
                        <AxisTriad name="fixed-triad" size={4}
                                   onReady={(n) => { n.rotationQuaternion = Q_SB.clone(); }}/>
                    </transformNode>
                </transformNode>
                <Label3D text="R·Rsb" color="#e8ecf7" position={new Vector3(-OFFSET, 8.6, 0)} size={2}/>
                <Label3D text={t("axis in {s}", "{s} 의 축")} color="#f2a63a"
                         position={new Vector3(-OFFSET, 7.2, 0)} size={1.4}/>

                {/* 물체 프레임 회전: Rsb·R — 회전축은 {b} 의 같은 수치 축 (Rsb 로 기울어져 있다) */}
                <transformNode name="body-offset" position={new Vector3(OFFSET, 0, 0)}>
                    <transformNode name="body-base"
                                   onCreated={(n: TransformNode) => { n.rotationQuaternion = Q_SB.clone(); }}>
                        <AxisRod name="body-axis"/>
                        <transformNode name="body-rot"
                                       onCreated={(n: TransformNode) => {
                                           rightChildRef.current = n;
                                           n.rotationQuaternion = qTheta;
                                       }}>
                            <AxisTriad name="body-triad" size={4}/>
                        </transformNode>
                    </transformNode>
                </transformNode>
                <Label3D text="Rsb·R" color="#e8ecf7" position={new Vector3(OFFSET, 8.6, 0)} size={2}/>
                <Label3D text={t("axis in {b}", "{b} 의 축")} color="#f2a63a"
                         position={new Vector3(OFFSET, 7.2, 0)} size={1.4}/>
            </Physics3DCanvas>
            <div className="px-2 pb-1">
                <input
                    type="range"
                    min={0}
                    max={2 * Math.PI}
                    step={0.01}
                    value={theta}
                    onChange={(e) => setTheta(parseFloat(e.target.value))}
                    className="w-full accent-[var(--accent)]"
                    aria-label={t("rotation angle theta", "회전각 theta")}
                />
                <div className="text-xs text-muted text-center">
                    R = Rot(ω̂, θ) · θ = {(theta * 180 / Math.PI).toFixed(0)}° ·{" "}
                    {t("same R, different multiplication order", "같은 R, 곱하는 순서만 다르다")}
                </div>
            </div>
        </div>
    );
};

const FixedVsBodyRotation = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "pre-multiply R·Rsb rotates about the fixed-frame axis; post-multiply Rsb·R about the body-frame axis",
            "앞곱 R·Rsb 는 고정 프레임 축, 뒤곱 Rsb·R 은 물체 프레임 축 둘레로 돈다",
        )}
        className="w-full sm:w-4/5 mx-auto"
        bodyClassName="w-[min(100%,104vh)]"
        modal={<FixedVsBodyScene canvasClassName="aspect-[4/3] w-full rounded-lg"/>}
    >
        <FixedVsBodyScene canvasClassName="aspect-[4/3] w-full rounded-lg"/>
    </CanvasFigure>;
};

export default FixedVsBodyRotation;
