import Physics3DCanvas from "../../3d/Physics3DCanvas";
import {Animation, Color3, IAnimationKey, Mesh, Vector3} from "@babylonjs/core";
import {useCallback} from "react";
import {BabylonNode, useScene} from "react-babylonjs";

interface CylindricalLinkProps {
    name: string,
    color: Color3,
    position: Vector3,
    pivotPosition: Vector3,
    children?: BabylonNode<any>,
    animationOffsets?: {
        y: number,
        r: number
    }[]
}

const CylindricalLink = ({
                             name,
                             color,
                             position,
                             pivotPosition,
                             children,
                             animationOffsets
                         }: CylindricalLinkProps) => {
    const scene = useScene()
    const generateMeshAnimation = useCallback((instance: Mesh) => {
        const animationRotation = new Animation(
            "rotation",
            "rotation.y",
            30,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CYCLE
        )
        const animationRotationKeys: IAnimationKey[] = animationOffsets?.map((item, index) => {
            return {
                frame: index * 60,
                value: item.r + instance.rotation.y
            }
        })

        const animationLinear = new Animation(
            "Position",
            "position",
            30,
            Animation.ANIMATIONTYPE_VECTOR3,
            Animation.ANIMATIONLOOPMODE_CYCLE
        )
        const animationLinearKeys: IAnimationKey[] = animationOffsets?.map((item, index) => {
            return {
                frame: index * 60,
                value: position.add(new Vector3(0, item.y, 0))
            }
        })
        animationRotation.setKeys(animationRotationKeys ?? [])
        animationLinear.setKeys(animationLinearKeys ?? [])
        return [animationRotation, animationLinear]
    }, [])
    return <mesh
        name={name}
        position={position}
        onCreated={instance => {
            instance.setPivotPoint(pivotPosition)
            instance.animations = generateMeshAnimation(instance)
            scene?.beginAnimation(instance, 0, 240, true)
        }}
    >
        <box
            name={`${name}_cylindrical_joint`}
            width={10}
            height={1}
            depth={1}
            position={new Vector3(4, 0, 0)}
        >
            <standardMaterial
                name={`${name}_cylindrical_joint_mat`}
                diffuseColor={color}
            />
        </box>
        <cylinder
            name={`${name}_cylindrical_joint_sub`}
            height={1}
            diameter={2.5}
        >
            <standardMaterial
                name={`${name}_cylindrical_joint_mat`}
                diffuseColor={color}
            />
        </cylinder>
        {children}
    </mesh>
}
const CylindricalJoint = () => {
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
            <CylindricalLink
                name={"under"}
                position={new Vector3(0, -2, 0)}
                pivotPosition={new Vector3(0, 0, 0)}
                color={new Color3(0.5, 0, 0.5)}
                animationOffsets={[{
                    y: 0,
                    r: 0
                }, {
                    y: 2,
                    r: Math.PI / 2
                }, {
                    y: 0,
                    r: 0
                }, {
                    y: -2,
                    r: -Math.PI / 2
                }, {
                    y: 0,
                    r: 0
                }]}
            >
                <cylinder
                    name={"1_axis"}
                    height={1}
                    diameter={1}
                    position={new Vector3(0, 1, 0)}
                >
                    <standardMaterial
                        name={`1_cylindrical_point_mat`}
                        diffuseColor={new Color3(0.5, 0, 0.5)}
                    />
                </cylinder>
            </CylindricalLink>
            <CylindricalLink
                name={"upper"}
                position={new Vector3(0, 4, 0)}
                pivotPosition={new Vector3(0, 0, 0)}
                color={new Color3(0, 0.5, 0.5)}
                animationOffsets={[{
                    y: 0,
                    r: Math.PI
                }, {
                    y: -2,
                    r: -Math.PI / 2 + Math.PI
                }, {
                    y: 0,
                    r: Math.PI
                }, {
                    y: 2,
                    r: Math.PI / 2 + Math.PI
                }, {
                    y: 0,
                    r: Math.PI
                }]}
            >
                <cylinder
                    name={"2_axis"}
                    height={12}
                    diameter={0.5}
                    position={new Vector3(0, -6, 0)}
                >
                    <standardMaterial
                        name={`2_cylindrical_point_mat`}
                        diffuseColor={new Color3(0, 0.5, 0.5)}
                    />
                </cylinder>
            </CylindricalLink>
        </Physics3DCanvas>
        <span className="text-xs text-gray-400">cylindrical joint</span>
    </div>
}

export default CylindricalJoint
