import React, {useEffect, useRef} from "react";
import * as CANNON from "cannon";
import {Engine, Scene} from "react-babylonjs";
import {CannonJSPlugin, Color3, Color4, Scene as BabylonScene, Vector3} from "@babylonjs/core";

import cn from "../../libs/cn";
import {GridMaterial} from "@babylonjs/materials";
import {useTheme} from "../../libs/useTheme";

// 캔버스는 CSS 변수를 못 읽으므로 테마별 배경/그리드 색을 여기서 직접 정의한다.
const SCENE_THEME = {
    dark: {clear: new Color4(0.02, 0.02, 0.02, 1), grid: new Color3(0.02, 0.02, 0.02)},
    light: {clear: new Color4(0.97, 0.98, 0.99, 1), grid: new Color3(0.97, 0.98, 0.99)},
} as const;

const Ground = ({
                    name,
                    yzPlane,
                    zxPlain,
                    opacity,
                    mainColor
                }: {
    name: string,
    yzPlane?: boolean
    zxPlain?: boolean
    opacity?: number
    mainColor: Color3
}) => {
    return <ground
        rotation={zxPlain ? new Vector3(Math.PI / 2, 0, 0) : (yzPlane ? new Vector3(0, 0, Math.PI / 2) : Vector3.Zero())}
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
            gridMaterial.lineColor = zxPlain ? new Color3(0.4, 0, 0.4) : (yzPlane ? new Color3(0.4, 0.4, 0) : new Color3(0, 0.4, 0.4))
            gridMaterial.mainColor = mainColor
            gridMaterial.backFaceCulling = false
            gridMaterial.opacity = opacity ?? 0.5
            instance.material = gridMaterial
        }}
    >
    </ground>
}
const Content = ({
                     children,
                     className,
                     ground,
                     axis,
                     physics,
                     initialView
                 }: Physics3DCanvasProps) => {
    const sceneRef = useRef<BabylonScene>();
    const theme = useTheme();
    const palette = SCENE_THEME[theme];

    useEffect(() => {
        if (!window.CANNON && physics) {
            window.CANNON = CANNON
            sceneRef.current?.enablePhysics(new Vector3(0, -9.82, 0), new CannonJSPlugin());
        }
    }, []);
    // Scene 은 clearColor 를 최초 1회만 읽으므로, 테마가 바뀌면 이미 만들어진 scene 에도 반영한다.
    useEffect(() => {
        if (sceneRef.current) sceneRef.current.clearColor = palette.clear;
    }, [palette]);
    return <>
        <div
            className={cn(className, "overflow-hidden")}
        >
            <Engine antialias>
                <Scene
                    clearColor={palette.clear}
                    onCreated={(scene) => {
                        sceneRef.current = scene
                    }}
                >
                    <arcRotateCamera
                        ignoreParentScaling={true}
                        noPreventDefault={false}
                        name="camera1"
                        target={new Vector3(initialView?.to?.x ?? 0, initialView?.to?.y ?? 0, initialView?.to?.z ?? 0)}
                        alpha={0}
                        beta={0}
                        lowerRadiusLimit={2}
                        upperRadiusLimit={50}
                        radius={initialView?.radius ?? 10}
                        position={new Vector3(initialView?.at?.x ?? 5, initialView?.at?.y ?? 5, initialView?.at?.z ?? 3)}
                    />
                    <hemisphericLight
                        name="sun"
                        intensity={1}
                        direction={new Vector3(-1, 1, -1)}
                    />
                    {
                        ground ? <>
                            {(typeof ground == "object" && 'xy' in ground && ground.xy) ?
                                <Ground name="xyGround" mainColor={palette.grid}
                                        opacity={typeof ground.xy === "object" ? ground.xy.opacity : undefined}/> :
                                <Ground name="xyGround" mainColor={palette.grid}
                                        opacity={typeof ground == "object" ? ground.opacity : undefined}/>}
                            {(typeof ground == "object" && 'yz' in ground && ground.yz) ?
                                <Ground name="yzGround" yzPlane mainColor={palette.grid}
                                        opacity={typeof ground.yz === "object" ? ground.yz.opacity : undefined}/> : null}
                            {(typeof ground == "object" && 'xz' in ground && ground.xz) ?
                                <Ground name="xzGround" zxPlain mainColor={palette.grid}
                                        opacity={typeof ground.xz === "object" ? ground.xz.opacity : undefined}/> : null}
                        </> : null
                    }
                    {
                        axis ?
                            <>
                                <cylinder
                                    name={"x-axis"}
                                    height={100}
                                    diameter={0.15}
                                    rotation={new Vector3(Math.PI / 2, 0, 0)}
                                    position={new Vector3(0, 0, 0)}
                                >
                                    <standardMaterial
                                        name="x-axis-mat"
                                        diffuseColor={Color3.Red()}
                                    />
                                </cylinder>
                                <cylinder
                                    name={"y-axis"}
                                    height={100}
                                    diameter={0.15}
                                    rotation={new Vector3(0, 0, Math.PI / 2)}
                                    position={new Vector3(0, 0, 0)}
                                >
                                    <standardMaterial
                                        name="y-axis-mat"
                                        diffuseColor={Color3.Green()}
                                    />
                                </cylinder>
                                <cylinder
                                    name={"z-axis"}
                                    height={100}
                                    diameter={0.15}
                                    rotation={new Vector3(0, 0, 0)}
                                    position={new Vector3(0, 0, 0)}
                                >
                                    <standardMaterial
                                        name="z-axis-mat"
                                        diffuseColor={Color3.Blue()}
                                    />
                                </cylinder>
                            </>
                            : null
                    }
                    {children}
                </Scene>
            </Engine>
        </div>
    </>
}

export interface Physics3DCanvasProps extends React.PropsWithChildren {
    className?: string
    ground?: {
        xy?: {
            opacity?: number
        } | boolean,
        yz?: {
            opacity?: number
        } | boolean,
        xz?: {
            opacity?: number
        } | boolean,
        opacity?: number
    } | boolean,
    axis?: boolean
    physics?: boolean,
    initialView?: {
        radius?: number,
        at?: {
            x: number,
            y: number,
            z: number
        },
        to?: {
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
                             physics,
                             initialView
                         }: Physics3DCanvasProps) => {
    return <Content className={className} ground={ground} initialView={initialView} axis={axis} physics={physics}>
        {children}
    </Content>

}

export default Physics3DCanvas
