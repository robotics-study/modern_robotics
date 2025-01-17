import React, {createContext, Suspense, useEffect, useRef} from "react";
import * as CANNON from "cannon";
import {Engine, Model, Scene} from "react-babylonjs";
import * as BABYLON from "@babylonjs/core";

import cn from "../libs/cn";
import {GridMaterial} from "@babylonjs/materials";
import "@babylonjs/loaders"

interface Physics3DCanvasContext {
    world: CANNON.World
}

export const CannonContext = createContext<Physics3DCanvasContext | undefined>(undefined)

const Ground = ({
                    name,
                }: {
    name: string,
}) => {
    return <ground
        layerMask={-1}
        name={name}
        width={100}
        height={100}
        subdivisions={1}
        receiveShadows={true}
        onCreated={instance => {
            const gridMaterial = new GridMaterial(`${name}-mat`, instance.getScene())
            gridMaterial.gridRatio = 1;
            gridMaterial.majorUnitFrequency = 5;
            gridMaterial.minorUnitVisibility = 0.5;
            gridMaterial.lineColor = new BABYLON.Color3(0, 0.4, 0.4)
            instance.material = gridMaterial
        }}
    >
    </ground>
}

const Test = () => {


    return <Suspense>
        <Model
            name={"test"}
            scaling={new BABYLON.Vector3(3, 3, 3)}
            rootUrl={""}
            sceneFilename={process.env.NODE_ENV == "production" ? "/universal_joint.glb" : "/modern_robotics/universal_joint.glb"}
            position={new BABYLON.Vector3(0, 0, 0)}
        />
    </Suspense>
}
const Content = ({
                     children,
                     className,
                     ground,
                     axis,
                     initialView
                 }: Physics3DCanvasProps) => {
    const world = useRef<CANNON.World>()
    const sceneRef = useRef<BABYLON.Scene>();

    useEffect(() => {
        if (!window.CANNON) {
            window.CANNON = CANNON
        }
    }, []);
    return <CannonContext.Provider value={world.current ? {
        world: world.current!,
    } : undefined}>
        <div
            className={cn(className, "overflow-hidden")}
        >
            <Engine antialias>
                <Scene
                    onCreated={(scene) => {
                        sceneRef.current = scene
                        scene.enablePhysics(new BABYLON.Vector3(0, -9.82, 0), new BABYLON.CannonJSPlugin());
                    }}
                >
                    <arcRotateCamera
                        noPreventDefault={false}
                        name="camera1"
                        target={new BABYLON.Vector3(initialView?.to?.x ?? 0, initialView?.to?.y ?? 0, initialView?.to?.z ?? 0)}
                        alpha={0}
                        beta={0}
                        radius={10}
                        position={new BABYLON.Vector3(initialView?.at?.x ?? 50, initialView?.at?.y ?? 50, initialView?.at?.z ?? 30)}
                    />
                    <hemisphericLight
                        name="sun"
                        intensity={1}
                        direction={new BABYLON.Vector3(-1, 1, -1)}
                    />
                    {
                        ground ? <Ground name="ground"/> : null
                    }
                    {
                        axis ?
                            <>
                                <cylinder
                                    name={"x-axis"}
                                    height={100}
                                    diameter={0.15}
                                    rotation={new BABYLON.Vector3(Math.PI / 2, 0, 0)}
                                    position={new BABYLON.Vector3(0, 0, 0)}
                                >
                                    <standardMaterial
                                        name="x-axis-mat"
                                        diffuseColor={BABYLON.Color3.Red()}
                                    />
                                </cylinder>
                                <cylinder
                                    name={"y-axis"}
                                    height={100}
                                    diameter={0.15}
                                    rotation={new BABYLON.Vector3(0, 0, Math.PI / 2)}
                                    position={new BABYLON.Vector3(0, 0, 0)}
                                    onCreated={instance => {
                                        const zMaterial = new BABYLON.StandardMaterial("yMaterial", instance.getScene());
                                        zMaterial.diffuseColor = BABYLON.Color3.Green()
                                        instance.material = zMaterial
                                    }}
                                >
                                    <standardMaterial
                                        name="y-axis-mat"
                                        diffuseColor={BABYLON.Color3.Green()}
                                    />
                                </cylinder>
                                <cylinder
                                    name={"z-axis"}
                                    height={100}
                                    diameter={0.15}
                                    rotation={new BABYLON.Vector3(0, 0, 0)}
                                    position={new BABYLON.Vector3(0, 0, 0)}
                                >
                                    <standardMaterial
                                        name="z-axis-mat"
                                        diffuseColor={BABYLON.Color3.Blue()}
                                    />
                                </cylinder>
                            </>
                            : null
                    }
                    <Test></Test>
                    {children}
                </Scene>
            </Engine>
        </div>
    </CannonContext.Provider>
}

export interface Physics3DCanvasProps extends React.PropsWithChildren {
    className?: string
    ground?: boolean
    axis?: boolean
    initialView?: {
        at: {
            x: number,
            y: number,
            z: number
        },
        to: {
            x: number,
            y: number,
            z: number
        }
    }
}

const Physics3DCanvas = ({
                             children,
                             className,
                             ground,
                             axis,
                             initialView
                         }: Physics3DCanvasProps) => {
    return <Content className={className} ground={ground} initialView={initialView} axis={axis}>
        {children}
    </Content>

}

export default Physics3DCanvas
