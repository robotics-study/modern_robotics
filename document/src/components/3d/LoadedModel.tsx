import {useEngine, useScene} from "react-babylonjs";
import {MutableRefObject, useEffect, forwardRef} from "react";
import {AbstractMesh, Color3, SceneLoader, StandardMaterial, Vector3, Animation} from "@babylonjs/core";
import "@babylonjs/loaders"
import "babylonjs-loaders"
import {resolvePath} from "../../libs/url";

type AnimationFun = (mesh: AbstractMesh) => Animation[]

interface LoadedModelProps {
    path: string,
    position?: Vector3,
    scale?: Vector3,
    rotation?: Vector3,
    pivotPoint?: Vector3,
    animations?: Animation[] | AnimationFun,
    autoStartAnimation?: boolean,
    onLoad?: (mesh: AbstractMesh) => void
}

const LoadedModel = ({
                         path,
                         scale,
                         position,
                         rotation,
                         pivotPoint,
                         animations,
                         autoStartAnimation,
                         onLoad
                     }: LoadedModelProps, ref?: MutableRefObject<AbstractMesh>) => {
    const scene = useScene()
    useEffect(() => {
        if (scene) {
            SceneLoader.ImportMeshAsync(
                null,
                "",
                resolvePath(path),
                scene
            ).then(res => {
                const [mesh] = res.meshes
                mesh.setPivotPoint(pivotPoint ?? new Vector3(0, 0, 0))
                mesh.scaling = scale ?? Vector3.One()
                mesh.position = position ?? Vector3.Zero()
                mesh.rotation = rotation ?? Vector3.Zero()
                const material = new StandardMaterial("mash-color", mesh.getScene())
                material.diffuseColor = new Color3(0, 0.5, 0.5)
                mesh.material = material
                if (animations) {
                    if (animations instanceof Array) {
                        mesh.animations = animations ?? []
                    } else {
                        mesh.animations = (animations as AnimationFun)(mesh)
                    }
                }
                if (autoStartAnimation && mesh.animations?.length) {
                    let maxFrame = 0
                    mesh.animations.forEach(item => {
                        item.getKeys().forEach(k => {
                            maxFrame = Math.max(k.frame, maxFrame)
                        })
                    })
                    scene?.beginAnimation(mesh, 0, maxFrame, true)
                }
                if (ref) {
                    ref.current = mesh
                }
                if (onLoad) {
                    onLoad(mesh)
                }
            })

        }
    }, []);
    return null
}

export default forwardRef(LoadedModel)
