import Physics3DCanvas from "../../3d/Physics3DCanvas";
import {Animation, Color3, IAnimationKey, Mesh, StandardMaterial, Vector3, VertexData} from "@babylonjs/core";
import {useCallback} from "react";
import {useScene} from "react-babylonjs";


const Skew = () => {
    const scene = useScene()
    return <cylinder
        name="screw"
        height={15}
        diameter={0.7}
        tessellation={64}
        onCreated={(instance) => {
            const customMesh = new Mesh("screw_spine", instance.getScene());

            //Set arrays for positions and indices
            const positions = [];
            const indices = [];

            const v = new Vector3();
            const radius1 = 0.35;
            const radius2 = 0.45;
            const count = 15 / 0.0025;
            const heightDelta = 0.0025;
            for (let i = 0; i < count; i++) {
                let ng = i * 0.1;
                v.x = Math.cos(ng) * radius1;
                v.y = 15 / 2 - i * heightDelta;
                v.z = Math.sin(ng) * radius1;
                positions.push(v.x, v.y, v.z);

                v.x = Math.cos(ng) * radius2;
                v.y = 15 / 2 - i * heightDelta;
                v.z = Math.sin(ng) * radius2;
                positions.push(v.x, v.y, v.z);
            }

            for (let i = 0; i < count - 1; i++) {
                indices.push(i * 2, i * 2 + 1, i * 2 + 2);
                indices.push(i * 2 + 1, i * 2 + 3, i * 2 + 2);
            }

            //Empty array to contain calculated values
            const normals = [];

            const vertexData = new VertexData();
            VertexData.ComputeNormals(positions, indices, normals);

            //Assign positions, indices and normals to vertexData
            vertexData.positions = positions;
            vertexData.indices = indices;
            vertexData.normals = normals;
            vertexData.applyToMesh(customMesh)

            const material = new StandardMaterial("screw_spine_mat", instance.getScene())
            material.diffuseColor = new Color3(0.7, 0.3, 0.3)
            material.backFaceCulling = false
            customMesh.material = material

            instance.addChild(customMesh)

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
                    value: instance.position.y
                }, {
                    frame: 60,
                    value: instance.position.y + Math.PI  * 10
                }, {
                    frame: 120,
                    value: instance.position.y
                }, {
                    frame: 180,
                    value: instance.position.y - Math.PI * 10
                }, {
                    frame: 240,
                    value: instance.position.y
                }
            ]
            animation.setKeys(keys)
            instance.animations = [animation]
            scene?.beginAnimation(instance, 0, 240, true)
        }}
    >
        <standardMaterial
            name="skew_mat"
            diffuseColor={new Color3(0.7, 0.3, 0.3)}
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
            name={`${direction}_helical_joint_mat`}
            diffuseColor={color}
        ></standardMaterial>
    </box>
}
const HelicalJoint = () => {
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
