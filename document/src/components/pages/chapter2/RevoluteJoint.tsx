import Physics3DCanvas from "../../3d/Physics3DCanvas";
import {Animation, Color3, IAnimationKey, Mesh, Vector3} from "@babylonjs/core";
import {useCallback} from "react";
import {useScene} from "react-babylonjs";

interface RevoluteLinkProps {
    color: Color3,
    position: Vector3,
    pivotPosition: Vector3,
    direction: number
}

const RevoluteLink = ({
                          color,
                          position,
                          pivotPosition,
                          direction
                      }: RevoluteLinkProps) => {
    const scene = useScene()
    const generateMeshAnimation = useCallback((instance: Mesh) => {
        const animation = new Animation(
            "rotation",
            "rotation.y",
            30,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CYCLE
        )
        const keys: IAnimationKey[] = [
            {
                frame: 0,
                value: instance.rotation.y
            }, {
                frame: 60,
                value: instance.rotation.y + direction * Math.PI / 4
            }, {
                frame: 120,
                value: instance.rotation.y
            }, {
                frame: 180,
                value: instance.rotation.y - direction * Math.PI / 4
            }, {
                frame: 240,
                value: instance.rotation.y
            }
        ]
        animation.setKeys(keys)
        return [animation]
    }, [])
    return <box
        name={`${direction}_revolute_joint`}
        width={10}
        height={1}
        depth={1}
        position={position}
        onCreated={instance => {
            instance.setPivotPoint(pivotPosition)
            instance.animations = generateMeshAnimation(instance)
            scene?.beginAnimation(instance, 0, 240, true)
        }}
    >
        <standardMaterial
            name={`${direction}_revolute_joint_mat`}
            diffuseColor={color}
        ></standardMaterial>
    </box>
}
const RevoluteJoint = () => {
    return <div className="flex flex-col items-center justify-center p-3 w-1/2 md:w-1/4 gap-1">
        <Physics3DCanvas
            className="aspect-square w-full rounded-lg"
            initialView={{
                radius: 25,
                at: {
                    x: 0,
                    y: 5,
                    z: 5
                }
            }}
            axis
            ground={{
                opacity: 0.8
            }}
        >
            <RevoluteLink
                position={new Vector3(4, -0.5, 0)}
                pivotPosition={new Vector3(-4, 0, 0)}
                color={new Color3(0.5, 0, 0.5)}
                direction={1}
            />
            <RevoluteLink
                position={new Vector3(-4, 0.5, 0)}
                pivotPosition={new Vector3(4, 0, 0)}
                color={new Color3(0, 0.5, 0.5)}
                direction={-1}
            />
        </Physics3DCanvas>
        <span className="text-xs text-gray-400">revolute joint</span>
    </div>
}

export default RevoluteJoint
