import Physics3DCanvas from "../../3d/Physics3DCanvas";
import {Animation, Color3, IAnimationKey, Mesh, Vector3} from "@babylonjs/core";
import {useCallback} from "react";
import {useScene} from "react-babylonjs";

interface PrismaticLinkProps {
    color: Color3,
    position: Vector3,
    pivotPosition: Vector3,
    size: Vector3,
    direction: number
}

const PrismaticLink = ({
                           color,
                           position,
                           pivotPosition,
                           size,
                           direction
                       }: PrismaticLinkProps) => {
    const scene = useScene()
    const generateMeshAnimation = useCallback((instance: Mesh) => {
        const animation = new Animation(
            "xSlice",
            "position",
            30,
            Animation.ANIMATIONTYPE_VECTOR3,
            Animation.ANIMATIONLOOPMODE_CYCLE
        )
        const initialPoint = instance.position.add(pivotPosition)
        const keys: IAnimationKey[] = [
            {
                frame: 0,
                value: initialPoint
            }, {
                frame: 60,
                value: initialPoint.add(new Vector3(direction * 2.75, 0, 0))
            }, {
                frame: 120,
                value: initialPoint
            }
        ]
        animation.setKeys(keys)
        return [animation]
    }, [])
    return <box
        name={`${direction}_prismatic_joint`}
        width={size.x}
        height={size.y}
        depth={size.z}
        position={position}
        onCreated={instance => {
            instance.setPivotPoint(pivotPosition)
            instance.animations = generateMeshAnimation(instance)
            scene!.beginAnimation(instance, 0, 120, true)
        }}
    >
        <standardMaterial
            name={`${direction}_prismatic_joint_mat`}
            diffuseColor={color}
        ></standardMaterial>
    </box>
}
const PrismaticJoint = () => {
    return <div className="flex flex-col items-center justify-center p-3 w-1/2 md:w-1/4 gap-1">
        <Physics3DCanvas
            className="aspect-square w-full rounded-lg"
            initialView={{
                radius: 25,
                at: {
                    x: -3,
                    y: 1,
                    z: 5
                }
            }}
            axis
            ground={{
                opacity: 0.8
            }}
        >
            <PrismaticLink
                size={new Vector3(10, 2, 4)}
                position={new Vector3(-4, 0, 0)}
                pivotPosition={new Vector3(4, 0, 0)}
                color={new Color3(0.5, 0, 0.5)}
                direction={-1}
            />
            <PrismaticLink
                size={new Vector3(10, 1, 2)}
                position={new Vector3(4, 0, 0)}
                pivotPosition={new Vector3(-4, 0, 0)}
                color={new Color3(0, 0.5, 0.5)}
                direction={1}
            />
        </Physics3DCanvas>
        <span className="text-xs text-gray-400">prismatic joint</span>
    </div>
}

export default PrismaticJoint
