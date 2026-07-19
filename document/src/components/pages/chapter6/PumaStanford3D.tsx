import {ReactNode} from "react";
import {Animation, Color3, DynamicTexture, IAnimationKey, Mesh, StandardMaterial, TransformNode, Vector3} from "@babylonjs/core";
import {useScene} from "react-babylonjs";
import Physics3DCanvas from "../../3d/Physics3DCanvas";
import CanvasFigure from "../../CanvasFigure";
import AxisTriad, {AXIS_COLORS} from "../../3d/AxisTriad";
import {useTr} from "../../../libs/i18n";
import {HOUSING_DARK, Housing, LINK_GRAY, Metal, TOOL_RED, Tube} from "../../3d/CobotParts";

// 해석적 IK 가 풀리는 두 구조를 관절 축 중심으로 보여주는 "구조 모식도"다 (실제 제품 외형이 아니다).
// RViz2 interactive marker 처럼 관절을 그린다: revolute 는 노란 축봉 + 사선 줄무늬 회전 링(색 = 도는
// 축의 RGB 색), prismatic 은 양방향 직선 화살표. 손목 세 축은 빨간 wrist center 한 점에서 교차한다.
const AXIS_YELLOW = new Color3(0.95, 0.75, 0.15);

const cssColor = (c: Color3) =>
    `rgb(${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)})`;

// RViz2 의 rotate 링: 사선 줄무늬 패턴이 든 hoop 밴드 (캡 없는 원통 옆면). 축 둘레를 도는 자유도 표시.
const StripedRing = ({name, color, ringR, band = 0.26}: {
    name: string; color: Color3; ringR: number; band?: number;
}) => {
    const scene = useScene();
    return (
        <cylinder name={`${name}-ring`} diameter={ringR * 2} height={band} tessellation={48}
                  cap={Mesh.NO_CAP} sideOrientation={Mesh.DOUBLESIDE}>
            <standardMaterial name={`${name}-ring-mat`} backFaceCulling={false}
                              emissiveColor={color.scale(0.4)}
                              onCreated={(mat: StandardMaterial) => {
                                  if (!scene) return;
                                  const dt = new DynamicTexture(`${name}-ring-tex`, {width: 256, height: 32}, scene, false);
                                  const ctx = dt.getContext() as CanvasRenderingContext2D;
                                  ctx.fillStyle = cssColor(color);
                                  ctx.fillRect(0, 0, 256, 32);
                                  // 45° 사선 스트라이프. 간격이 텍스처 폭을 나누어 떨어져야 이음매가 맞는다.
                                  ctx.strokeStyle = cssColor(color.scale(0.45));
                                  ctx.lineWidth = 8;
                                  for (let x = -32; x < 256 + 32; x += 32) {
                                      ctx.beginPath();
                                      ctx.moveTo(x, 36);
                                      ctx.lineTo(x + 40, -4);
                                      ctx.stroke();
                                  }
                                  dt.update();
                                  mat.diffuseTexture = dt;
                              }}/>
        </cylinder>
    );
};

const oscillate = (property: string, base: number, amplitude: number): Animation => {
    const anim = new Animation("osc", property, 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
    const keys: IAnimationKey[] = [
        {frame: 0, value: base},
        {frame: 60, value: base + amplitude},
        {frame: 120, value: base},
        {frame: 180, value: base - amplitude},
        {frame: 240, value: base},
    ];
    anim.setKeys(keys);
    return anim;
};

const Animated = ({name, property, base = 0, amplitude, children}: {
    name: string; property: string; base?: number; amplitude: number; children?: ReactNode;
}) => {
    const scene = useScene();
    return (
        <transformNode name={name} onCreated={(node: TransformNode) => {
            node.animations = [oscillate(property, base, amplitude)];
            scene?.beginAnimation(node, 0, 240, true);
        }}>
            {children}
        </transformNode>
    );
};

// revolute 축 표시: 로컬 +Y 노란 축봉 + 도는 축 색의 줄무늬 회전 링 (옆 AxisTriad 와 같은 색).
const RevoluteAxis = ({name, axisColor, length = 2.2, ringR = 0.75}: {
    name: string; axisColor: Color3; length?: number; ringR?: number;
}) => (
    <>
        <cylinder name={`${name}-rod`} diameter={0.07} height={length} tessellation={12}>
            <standardMaterial name={`${name}-rod-mat`} diffuseColor={AXIS_YELLOW}
                              emissiveColor={AXIS_YELLOW.scale(0.5)}/>
        </cylinder>
        <StripedRing name={name} color={axisColor} ringR={ringR}/>
    </>
);

// prismatic 축 표시: 로컬 +Y 방향의 양방향 화살표.
const PrismaticAxis = ({name, length = 2.6}: {name: string; length?: number}) => (
    <>
        <cylinder name={`${name}-rod`} diameter={0.07} height={length} tessellation={12}>
            <standardMaterial name={`${name}-rod-mat`} diffuseColor={AXIS_YELLOW}
                              emissiveColor={AXIS_YELLOW.scale(0.5)}/>
        </cylinder>
        {[1, -1].map((s) => (
            <cylinder key={s} name={`${name}-tip${s}`} diameter={0.18} diameterTop={0} height={0.3}
                      tessellation={12} position={new Vector3(0, s * (length / 2 + 0.12), 0)}
                      rotation={new Vector3(s > 0 ? 0 : Math.PI, 0, 0)}>
                <standardMaterial name={`${name}-tip${s}-mat`} diffuseColor={AXIS_YELLOW}
                                  emissiveColor={AXIS_YELLOW.scale(0.5)}/>
            </cylinder>
        ))}
    </>
);

// 손목 축 하나: 노란 축봉이 wrist center 를 관통하고, 도는 축 색의 줄무늬 링을 두른다.
const WristAxis = ({name, ringColor, ringR, rotation}: {
    name: string; ringColor: Color3; ringR: number; rotation: Vector3;
}) => (
    <transformNode name={name} rotation={rotation}>
        <cylinder name={`${name}-rod`} diameter={0.05} height={1.6} tessellation={12}>
            <standardMaterial name={`${name}-rod-mat`} diffuseColor={AXIS_YELLOW}
                              emissiveColor={AXIS_YELLOW.scale(0.5)}/>
        </cylinder>
        <StripedRing name={name} color={ringColor} ringR={ringR} band={0.16}/>
    </transformNode>
);

// 손목 뭉치: 세 회전축이 전부 빨간 wrist center 한 점을 지난다. RViz2 의 3축 rotate 마커처럼
// 줄무늬 링 세 개가 gimbal 형태로 겹친다 (반지름을 조금씩 달리해 z-fighting 을 피한다).
const Wrist = () => (
    <>
        <WristAxis name="w1" ringColor={AXIS_COLORS.y} ringR={0.4} rotation={Vector3.Zero()}/>
        <WristAxis name="w2" ringColor={AXIS_COLORS.x} ringR={0.46} rotation={new Vector3(0, 0, Math.PI / 2)}/>
        <WristAxis name="w3" ringColor={AXIS_COLORS.z} ringR={0.52} rotation={new Vector3(Math.PI / 2, 0, 0)}/>
        <sphere name="wc" diameter={0.28}>
            <standardMaterial name="wc-mat" diffuseColor={TOOL_RED} emissiveColor={TOOL_RED.scale(0.6)}/>
        </sphere>
        <AxisTriad name="wrist-tf" size={1} radius={0.045}/>
    </>
);

// 공통 하체: 받침대 + J1(수직 요, 축 표시) + 어깨 J2(피치, 축 표시).
const LowerBody = ({name, children}: {name: string; children?: ReactNode}) => (
    <>
        <cylinder name={`${name}-pedestal`} diameter={2.1} height={0.4} tessellation={32}
                  position={new Vector3(0, 0.2, 0)}>
            <Metal name={`${name}-pedestal`} color={HOUSING_DARK}/>
        </cylinder>
        <transformNode name={`${name}-j1o`} position={new Vector3(0, 0.4, 0)}>
            <Animated name={`${name}-j1`} property="rotation.y" amplitude={0.5}>
                <transformNode name={`${name}-j1h`} position={new Vector3(0, 0.5, 0)}>
                    <Housing name={`${name}-j1`} radius={0.6} width={1} vertical/>
                    <RevoluteAxis name={`${name}-j1ax`} axisColor={AXIS_COLORS.y} length={2.4} ringR={0.85}/>
                    <AxisTriad name={`${name}-j1tf`} size={1.1} radius={0.045}/>
                </transformNode>
                <transformNode name={`${name}-j2o`} position={new Vector3(0, 1.25, 0)}>
                    <Housing name={`${name}-j2`} radius={0.55} width={1.25}/>
                    <transformNode name={`${name}-j2ax`} rotation={new Vector3(Math.PI / 2, 0, 0)}>
                        <RevoluteAxis name={`${name}-j2ax`} axisColor={AXIS_COLORS.z} length={2.2} ringR={0.8}/>
                    </transformNode>
                    <AxisTriad name={`${name}-j2tf`} size={1.1} radius={0.045}/>
                    {children}
                </transformNode>
            </Animated>
        </transformNode>
    </>
);

const PumaArm = () => (
    <LowerBody name="puma">
        <Animated name="puma-j2" property="rotation.z" base={-0.45} amplitude={0.3}>
            <Tube name="puma-upper" radius={0.38} length={2.6} position={new Vector3(0, 0, 0.55)}/>
            <transformNode name="puma-j3o" position={new Vector3(0, 2.6, 0.55)}>
                <Housing name="puma-j3" radius={0.46} width={0.95}/>
                <transformNode name="puma-j3ax" rotation={new Vector3(Math.PI / 2, 0, 0)}>
                    <RevoluteAxis name="puma-j3ax" axisColor={AXIS_COLORS.z} length={2} ringR={0.7}/>
                </transformNode>
                <AxisTriad name="puma-j3tf" size={1} radius={0.045}/>
                <Animated name="puma-j3" property="rotation.z" base={0.75} amplitude={0.4}>
                    {/* wrist center 구·링이 링크에 파묻히지 않게 짧게 끊는다 */}
                    <Tube name="puma-fore" radius={0.28} length={1.55} position={new Vector3(0, 0, -0.25)}/>
                    <transformNode name="puma-wrist" position={new Vector3(0, 2.2, -0.25)}>
                        <Wrist/>
                    </transformNode>
                </Animated>
            </transformNode>
        </Animated>
    </LowerBody>
);

const StanfordArm = () => (
    <LowerBody name="stan">
        <Animated name="stan-j2" property="rotation.z" base={-0.55} amplitude={0.25}>
            <cylinder name="stan-sleeve" diameter={0.95} height={2.2} tessellation={28}
                      position={new Vector3(0, 1.1, 0.55)}>
                <Metal name="stan-sleeve" color={HOUSING_DARK}/>
            </cylinder>
            <transformNode name="stan-inner-root" position={new Vector3(0, 0, 0.55)}>
                {/* prismatic 축: 슬리브를 따라 늘어나는 방향 */}
                <transformNode name="stan-d3ax" position={new Vector3(0, 2.2, 0)}>
                    <PrismaticAxis name="stan-d3ax" length={3}/>
                </transformNode>
                <Animated name="stan-d3" property="position.y" base={1.6} amplitude={0.85}>
                    {/* wrist center 구·링이 링크에 파묻히지 않게 짧게 끊는다 */}
                    <Tube name="stan-inner" radius={0.28} length={1.75} position={Vector3.Zero()}/>
                    <transformNode name="stan-wrist" position={new Vector3(0, 2.4, 0)}>
                        <Wrist/>
                    </transformNode>
                </Animated>
            </transformNode>
        </Animated>
    </LowerBody>
);

interface SceneProps {
    canvasClassName: string;
    kind: "puma" | "stanford";
}

const ArmScene = ({canvasClassName, kind}: SceneProps) => {
    const t = useTr();
    return (
        <div className="flex flex-col gap-2 w-full">
            {/* Stanford 는 곧게 뻗은 팔이 카메라 쪽으로 기울어 있어 더 멀리·높게 잡아야 프레임에 든다 */}
            <Physics3DCanvas
                className={canvasClassName}
                initialView={kind === "puma"
                    ? {radius: 14, at: {x: 8, y: 7, z: 10}, to: {x: 0, y: 3, z: 0}}
                    : {radius: 16, at: {x: 10, y: 8, z: 12}, to: {x: -0.4, y: 3.4, z: 0}}}
                ground={{opacity: 0.45}}
            >
                {kind === "puma" ? <PumaArm/> : <StanfordArm/>}
            </Physics3DCanvas>
            <div className="text-xs text-muted text-center">
                <span style={{color: "#f2c026"}} className="font-semibold">
                    ● {t("yellow rod: joint axis", "노란 봉: 관절 축")}
                </span>
                {" · "}
                <span className="font-semibold">
                    {t("striped ring: rotation, colored like the triad axis it turns about (double arrow = sliding)",
                        "줄무늬 링: 회전 (색 = 도는 축, RGB 삼축과 같은 색 · 양방향 화살표 = 미끄럼)")}
                </span>
                {" · "}
                <span style={{color: "#d9453a"}} className="font-semibold">● wrist center</span>
            </div>
        </div>
    );
};

export const Puma3D = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "PUMA-type (6R) structural schematic: elbow is revolute; the three wrist axes pass through the red wrist center",
            "PUMA 형 (6R) 구조 모식도: 팔꿈치가 revolute 이고, 손목 세 축이 빨간 wrist center 를 지난다",
        )}
        className="w-full sm:w-2/3 mx-auto"
        bodyClassName="w-[min(80vmin,560px)]"
        modal={<ArmScene kind="puma" canvasClassName="aspect-[4/3] w-full rounded-lg"/>}
    >
        <ArmScene kind="puma" canvasClassName="aspect-[4/3] w-full rounded-lg"/>
    </CanvasFigure>;
};

export const Stanford3D = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "Stanford-type (RRPRRR) structural schematic: the elbow is replaced by a telescoping prismatic joint",
            "Stanford 형 (RRPRRR) 구조 모식도: 팔꿈치가 망원경식 prismatic 관절로 바뀌었다",
        )}
        className="w-full sm:w-2/3 mx-auto"
        bodyClassName="w-[min(80vmin,560px)]"
        modal={<ArmScene kind="stanford" canvasClassName="aspect-[4/3] w-full rounded-lg"/>}
    >
        <ArmScene kind="stanford" canvasClassName="aspect-[4/3] w-full rounded-lg"/>
    </CanvasFigure>;
};
