import Physics3DCanvas from "../../3d/Physics3DCanvas";
import {Animation, Color3, IAnimationKey, Mesh, Vector3} from "@babylonjs/core";
import {useCallback} from "react";
import {useScene} from "react-babylonjs";


const Skew = () => {

    return <cylinder
        name="skew"
        height={10}
        diameter={0.5}
        tessellation={64}
    >
        <standardMaterial
            name="skew_mat"
            diffuseColor={new Color3(0.3, 0.3, 0.6)}
        >
        </standardMaterial>
    </cylinder>
}

interface HelicalLinkProps {
    color: Color3,
    position: Vector3,
    pivotPosition: Vector3,
    direction: number
}

const HelicalLink = ({
                         color,
                         position,
                         pivotPosition,
                         direction
                     }: HelicalLinkProps) => {
    const scene = useScene()
    const generateMeshAnimation = useCallback((instance: Mesh) => {
        const positionAnimation = new Animation(
            "position",
            "position",
            30,
            Animation.ANIMATIONTYPE_VECTOR3,
            Animation.ANIMATIONLOOPMODE_CYCLE
        )
        const positionKeys: IAnimationKey[] = [
            {
                frame: 0,
                value: position
            }, {
                frame: 60,
                value: position.add(new Vector3(0, 1, 0))
            }, {
                frame: 120,
                value: position
            }, {
                frame: 180,
                value: position.subtract(new Vector3(0, 1, 0))
            }, {
                frame: 240,
                value: position
            }
        ]
        positionAnimation.setKeys(positionKeys)
        const rotationAnimation = new Animation(
            "rotationAnimation",
            "rotation.y",
            30,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CYCLE
        )
        const rotationAnimationKeys: IAnimationKey[] = [
            {
                frame: 0,
                value: instance.rotation.y
            }, {
                frame: 60,
                value: instance.rotation.y + Math.PI / 4
            }, {
                frame: 120,
                value: instance.rotation.y
            }, {
                frame: 180,
                value: instance.rotation.y - Math.PI / 4
            }, {
                frame: 240,
                value: instance.rotation.y
            }
        ]
        rotationAnimation.setKeys(rotationAnimationKeys)
        return [rotationAnimation, positionAnimation]
    }, [])
    return <box
        name={`${direction}_helical_joint`}
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
            name={`test`}
            diffuseColor={color}
        ></standardMaterial>
    </box>
}
const HelicalJoint = () => {
    return <div className="flex flex-col items-center justify-center p-3 w-1/2 md:w-1/4 gap-1">
        <Physics3DCanvas
            className="aspect-square w-full rounded-lg"
            initialView={{
                radius: 20,
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
            <Skew/>
            <HelicalLink
                position={new Vector3(4, -2, 0)}
                pivotPosition={new Vector3(-4, 0, 0)}
                color={new Color3(0.5, 0, 0.5)}
                direction={1}
            />
            <HelicalLink
                position={new Vector3(-4, 2, 0)}
                pivotPosition={new Vector3(4, 0, 0)}
                color={new Color3(0, 0.5, 0.5)}
                direction={-1}
            />
        </Physics3DCanvas>
        <span className="text-xs text-gray-400">helical joint</span>
    </div>
}

export default HelicalJoint
