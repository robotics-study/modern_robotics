import Physics3DCanvas from "../../3d/Physics3DCanvas";
import {Animation, Color3, IAnimationKey, Mesh, Vector3} from "@babylonjs/core";
import {useCallback} from "react";
import {useScene} from "react-babylonjs";

interface SphericalLinkProps {
    name: string,
    color: Color3,
    position: Vector3,
    pivotPosition: Vector3,
    rotation: Vector3,
    sphereSize: number,
    animationOffsets?: {
        y: number,
        x: number,
        z: number
    }[]
}

const SphericalLink = ({
                           name,
                           color,
                           position,
                           pivotPosition,
                           rotation,
                           sphereSize,
                           animationOffsets
                       }: SphericalLinkProps) => {
    const scene = useScene()
    const generateMeshAnimation = useCallback((instance: Mesh) => {
        const animationRotation = new Animation(
            "Rotation",
            "rotation",
            30,
            Animation.ANIMATIONTYPE_VECTOR3,
            Animation.ANIMATIONLOOPMODE_CYCLE
        )
        const animationRotationKeys: IAnimationKey[] = animationOffsets?.map((item, index) => {
            return {
                frame: index * 60,
                value: rotation.add(new Vector3(item.x, item.y, item.z))
            }
        })
        animationRotation.setKeys(animationRotationKeys ?? [])
        return [animationRotation]
    }, [])
    return <mesh
        name={name}
        position={position}
        rotation={rotation}
        onCreated={instance => {
            instance.setPivotPoint(pivotPosition)
            instance.animations = generateMeshAnimation(instance)
            scene?.beginAnimation(instance, 0, instance.animations[0].getKeys().at(-1).frame, true)
        }}
    >
        <box
            name={`${name}_spherical_joint`}
            width={10}
            height={1}
            depth={1}
            position={new Vector3(4.5, 0, 0)}
        >
            <standardMaterial
                name={`${name}_spherical_joint_mat`}
                diffuseColor={color}
            />
        </box>
        <mesh
            name={`${name}_spherical_ball_joint`}
        >
            <sphere
                name={`${name}_spherical_ball`}
                diameter={sphereSize}
                segments={64}
            >
                <standardMaterial
                    name={`${name}_spherical_sphere_mat`}
                    backFaceCulling={false}
                    diffuseColor={color}
                    specularColor={color}
                />
            </sphere>
        </mesh>
    </mesh>
}
const SphericalJoint = () => {
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
            <SphericalLink
                name={"under"}
                sphereSize={5}
                sphereArc={Math.PI}
                rotation={Vector3.Zero()}
                position={new Vector3(0, 0, 0)}
                pivotPosition={new Vector3(0, 0, 0)}
                color={new Color3(0.5, 0, 0.5)}
                animationOffsets={[{
                    x: 0,
                    y: 0,
                    z: 0
                }, {
                    x: Math.PI / 3,
                    y: 0,
                    z: 0
                }, {
                    x: 0,
                    y: 0,
                    z: 0
                }, {
                    x: 0,
                    y: Math.PI / 3,
                    z: 0
                }, {
                    x: 0,
                    y: 0,
                    z: 0
                }, {
                    x: 0,
                    y: 0,
                    z: Math.PI / 3
                }, {
                    x: 0,
                    y: 0,
                    z: 0
                }, {
                    x: -Math.PI / 3,
                    y: 0,
                    z: 0
                }, {
                    x: 0,
                    y: 0,
                    z: 0
                }, {
                    x: 0,
                    y: -Math.PI / 3,
                    z: 0
                }, {
                    x: 0,
                    y: 0,
                    z: 0
                }, {
                    x: 0,
                    y: 0,
                    z: -Math.PI / 3
                }, {
                    x: 0,
                    y: 0,
                    z: 0
                }]}
            >
            </SphericalLink>
            <SphericalLink
                name={"upper"}
                sphereSize={4}
                rotation={new Vector3(0, Math.PI, 0)}
                position={new Vector3(-1, 0, 0)}
                pivotPosition={new Vector3(0, 0, 0)}
                color={new Color3(0, 0.5, 0.5)}
                animationOffsets={[{
                    x: 0,
                    y: 0,
                    z: 0
                }, {
                    x: Math.PI / 3,
                    y: 0,
                    z: 0
                }, {
                    x: 0,
                    y: 0,
                    z: 0
                }, {
                    x: 0,
                    y: Math.PI / 3,
                    z: 0
                }, {
                    x: 0,
                    y: 0,
                    z: 0
                }, {
                    x: 0,
                    y: 0,
                    z: Math.PI / 3
                }, {
                    x: 0,
                    y: 0,
                    z: 0
                }, {
                    x: -Math.PI / 3,
                    y: 0,
                    z: 0
                }, {
                    x: 0,
                    y: 0,
                    z: 0
                }, {
                    x: 0,
                    y: -Math.PI / 3,
                    z: 0
                }, {
                    x: 0,
                    y: 0,
                    z: 0
                }, {
                    x: 0,
                    y: 0,
                    z: -Math.PI / 3
                }, {
                    x: 0,
                    y: 0,
                    z: 0
                }]}
            >
            </SphericalLink>
        </Physics3DCanvas>
        <span className="text-xs text-gray-400">spherical joint</span>
    </div>
}

export default SphericalJoint
