import {useCallback} from "react";
import {Animation, Color3, IAnimationKey, Mesh, Vector3} from "@babylonjs/core";
import {useScene} from "react-babylonjs";
import Physics3DCanvas from "./3d/Physics3DCanvas";

// 랜딩 히어로용 회전 링크. Ch.2 revolute joint 시연을 히어로 크기로 단순 재현한다.
const SpinLink = ({color, position, pivotPosition, direction}: {
    color: Color3, position: Vector3, pivotPosition: Vector3, direction: number
}) => {
    const scene = useScene()
    const makeAnimation = useCallback((instance: Mesh) => {
        const animation = new Animation(
            "rotation", "rotation.y", 30,
            Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE,
        )
        const base = instance.rotation.y
        const keys: IAnimationKey[] = [
            {frame: 0, value: base},
            {frame: 60, value: base + direction * Math.PI / 4},
            {frame: 120, value: base},
            {frame: 180, value: base - direction * Math.PI / 4},
            {frame: 240, value: base},
        ]
        animation.setKeys(keys)
        return [animation]
    }, [direction])

    return (
        <box name={`hero_link_${direction}`} width={10} height={1} depth={1} position={position}
             onCreated={(instance) => {
                 instance.setPivotPoint(pivotPosition)
                 instance.animations = makeAnimation(instance)
                 scene?.beginAnimation(instance, 0, 240, true)
             }}>
            <standardMaterial name={`hero_link_${direction}_mat`} diffuseColor={color}/>
        </box>
    )
}

const Hero3D = () => (
    <div className="hero-3d">
        <Physics3DCanvas
            className="w-full h-[320px] sm:h-[380px]"
            initialView={{radius: 26, at: {x: 6, y: 7, z: 9}}}
            axis
            ground={{opacity: 0.7}}
        >
            <SpinLink position={new Vector3(4, -0.5, 0)} pivotPosition={new Vector3(-4, 0, 0)}
                      color={new Color3(0.39, 0.4, 0.95)} direction={1}/>
            <SpinLink position={new Vector3(-4, 0.5, 0)} pivotPosition={new Vector3(4, 0, 0)}
                      color={new Color3(0.13, 0.83, 0.93)} direction={-1}/>
        </Physics3DCanvas>
        <div className="hero-cap"><span className="dot"/>live · drag to orbit</div>
    </div>
)

export default Hero3D
