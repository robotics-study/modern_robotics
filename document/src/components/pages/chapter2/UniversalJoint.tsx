import Physics3DCanvas from "../../3d/Physics3DCanvas";
import LoadedModel from "../../3d/LoadedModel";
import {Animation, IAnimationKey, Vector3, MeshBuilder, Color4} from "@babylonjs/core";

const UniversalJoint = () => {

    return <div className="flex flex-col items-center justify-center py-3 gap-1">
        <Physics3DCanvas
            className="aspect-square w-60 rounded-lg"
            initialView={{
                at: {
                    x: 5,
                    y: 1,
                    z: 5
                }
            }}
            axis
            ground={{
                opacity: 0.8
            }}
        >
            <LoadedModel
                path={"universal/core.stl"}
                rotation={new Vector3(0, 0, Math.PI / 2)}
                position={new Vector3(0.4, 0.705, -0.35)}
            />
            <LoadedModel
                path={"universal/link.stl"}
                scale={new Vector3(0.4, 0.4, 0.4)}
                rotation={new Vector3(0, Math.PI / 2, 0)}
                position={new Vector3(0.75, -1.75, -1.75)}
                pivotPoint={new Vector3(-0.75, 1.75, 1.75)}
                autoStartAnimation
                animations={(mesh) => {
                    const animation = new Animation(
                        "rotation",
                        "rotation.x",
                        30,
                        Animation.ANIMATIONTYPE_FLOAT,
                        Animation.ANIMATIONLOOPMODE_CYCLE
                    )
                    const keys: IAnimationKey[] = [
                        {
                            frame: 0,
                            value: mesh.rotation.x
                        }, {
                            frame: 60,
                            value: mesh.rotation.x + Math.PI / 5
                        }, {
                            frame: 120,
                            value: mesh.rotation.x
                        }, {
                            frame: 180,
                            value: mesh.rotation.x - Math.PI / 5
                        }, {
                            frame: 240,
                            value: mesh.rotation.x
                        }
                    ]
                    animation.setKeys(keys)
                    return [animation]
                }}
            />
            <LoadedModel
                path={"universal/link.stl"}
                scale={new Vector3(0.4, 0.4, 0.4)}
                rotation={new Vector3(Math.PI, Math.PI / 2, Math.PI / 2)}
                position={new Vector3(0.75, -1.75, -1.75)}
                pivotPoint={new Vector3(-0.75, 1.75, 1.75)}
                autoStartAnimation
                animations={(mesh) => {
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
                            value: mesh.rotation.y
                        }, {
                            frame: 60,
                            value: mesh.rotation.y + Math.PI / 5
                        }, {
                            frame: 120,
                            value: mesh.rotation.y
                        }, {
                            frame: 180,
                            value: mesh.rotation.y - Math.PI / 5
                        }, {
                            frame: 240,
                            value: mesh.rotation.y
                        }
                    ]
                    animation.setKeys(keys)
                    return [animation]
                }}
            />
        </Physics3DCanvas>
        <span className="text-xs text-gray-400">universal joint</span>
    </div>
}


export default UniversalJoint
