import {useEffect, useRef} from "react";
import {AbstractMesh, Color3, Scene, TransformNode, Vector3} from "@babylonjs/core";
import {useScene} from "react-babylonjs";
import Physics3DCanvas from "./3d/Physics3DCanvas";
import {HOUSING_DARK, Housing, LINK_GRAY, Metal, RING_ORANGE, Tube} from "./3d/CobotParts";

// 랜딩 히어로: 모바일 매니퓰레이터. mecanum 스타일 베이스가 8자 경로를 crab 주행으로
// 돌고 (몸의 방향과 진행 방향이 따로 논다), 그 위의 협동로봇 팔이 부드럽게 움직이며
// end-effector 궤적을 발광 점으로 남긴다. 파츠는 4장의 CobotParts 를 재사용한다.
const ACCENT = new Color3(0.39, 0.4, 0.95);
const CYAN = new Color3(0.13, 0.83, 0.93);
const WHEEL_DARK = new Color3(0.16, 0.17, 0.2);
const ROLLER_GRAY = new Color3(0.62, 0.63, 0.66);
const TRAIL_N = 40;
const BASE_TRAIL_N = 46;
const N_ROLLERS = 8;

const MobileManipulator = () => {
    const scene = useScene();
    const base = useRef<TransformNode | null>(null);
    const wheels = useRef<Array<AbstractMesh | null>>([null, null, null, null]);
    const j1 = useRef<TransformNode | null>(null);
    const j2 = useRef<TransformNode | null>(null);
    const j3 = useRef<TransformNode | null>(null);
    const j4 = useRef<TransformNode | null>(null);
    const marker = useRef<TransformNode | null>(null);
    const trail = useRef<Array<AbstractMesh | null>>(new Array(TRAIL_N).fill(null));
    const trailAge = useRef<number[]>(new Array(TRAIL_N).fill(1e9));
    const head = useRef(0);
    const lastDrop = useRef(new Vector3(1e9, 1e9, 1e9));
    const lastPos = useRef(new Vector3(0, 0, 0));
    // 베이스 바닥 궤적 (ring buffer).
    const baseTrail = useRef<Array<AbstractMesh | null>>(new Array(BASE_TRAIL_N).fill(null));
    const baseTrailAge = useRef<number[]>(new Array(BASE_TRAIL_N).fill(1e9));
    const baseHead = useRef(0);
    const lastBaseDrop = useRef(new Vector3(1e9, 0, 1e9));

    useEffect(() => {
        if (!scene) return;
        let t = 0;
        let pausedUntil = 0;
        const obs = (scene as Scene).onBeforeRenderObservable.add(() => {
            const dt = scene.getEngine().getDeltaTime() / 1000;
            t += dt;
            // 베이스: 8자(lissajous) 경로. 몸의 yaw 는 경로와 무관하게 천천히 흔들린다.
            // 진행 방향과 바라보는 방향이 따로 노는 것이 omnidirectional 베이스의 매력이다.
            if (base.current) {
                // 진폭은 장애물과 여유를 두도록 잡는다 (차체 스윕 반경 ~1.65).
                const bx = 2.0 * Math.sin(0.21 * t);
                const bz = 1.5 * Math.sin(0.42 * t + 0.8);
                base.current.position.set(bx, 0, bz);
                base.current.rotation.y = 0.7 * Math.sin(0.12 * t + 0.4);
                const spd = Vector3.Distance(new Vector3(bx, 0, bz), lastPos.current) / Math.max(dt, 1e-4);
                lastPos.current.set(bx, 0, bz);
                wheels.current.forEach((w, i) => {
                    if (w) w.rotation.y += (i % 2 === 0 ? 1 : 1.25) * spd * 2.2 * dt;
                });
                // 베이스 바닥 궤적: 일정 거리마다 바닥에 점을 내려놓는다.
                const bp = new Vector3(bx, 0.03, bz);
                if (Vector3.Distance(bp, lastBaseDrop.current) > 0.22) {
                    lastBaseDrop.current = bp.clone();
                    const i = baseHead.current;
                    baseHead.current = (baseHead.current + 1) % BASE_TRAIL_N;
                    const m = baseTrail.current[i];
                    if (m) {
                        m.position.copyFrom(bp);
                        baseTrailAge.current[i] = 0;
                    }
                }
                baseTrail.current.forEach((m, i) => {
                    if (!m) return;
                    baseTrailAge.current[i] += dt;
                    const life = Math.max(0, 1 - baseTrailAge.current[i] / 9);
                    const s = 0.35 + 0.65 * life;
                    m.scaling.set(s, 1, s);
                    m.isVisible = life > 0.01;
                });
            }
            // 팔 관절: 주기와 위상이 다른 sine 들.
            if (j1.current) j1.current.rotation.y = 0.9 * Math.sin(0.45 * t + 0.7);
            if (j2.current) j2.current.rotation.z = -0.4 + 0.28 * Math.sin(0.6 * t + 1.1);
            if (j3.current) j3.current.rotation.z = 0.95 + 0.4 * Math.sin(0.77 * t + 0.4);
            if (j4.current) j4.current.rotation.y = 1.1 * Math.sin(0.95 * t);
            // 카메라 자동 회전 (드래그하면 6초 쉼).
            const cam = scene.getCameraByName("camera1") as {alpha?: number} | null;
            if (cam && cam.alpha !== undefined && t > pausedUntil) cam.alpha += 0.05 * dt;
            // end-effector 발광 궤적.
            if (marker.current) {
                const p = marker.current.getAbsolutePosition();
                if (Vector3.Distance(p, lastDrop.current) > 0.15) {
                    lastDrop.current = p.clone();
                    const i = head.current;
                    head.current = (head.current + 1) % TRAIL_N;
                    const m = trail.current[i];
                    if (m) {
                        m.position.copyFrom(p);
                        trailAge.current[i] = 0;
                    }
                }
                trail.current.forEach((m, i) => {
                    if (!m) return;
                    trailAge.current[i] += dt;
                    const life = Math.max(0, 1 - trailAge.current[i] / 6);
                    const s = 0.05 + 0.15 * life;
                    m.scaling.set(s, s, s);
                    m.isVisible = life > 0.01;
                });
            }
        });
        const pointerObs = (scene as Scene).onPointerObservable.add((info) => {
            if (info.type === 1) pausedUntil = t + 6;
        });
        return () => {
            (scene as Scene).onBeforeRenderObservable.remove(obs);
            (scene as Scene).onPointerObservable.remove(pointerObs);
        };
    }, [scene]);

    return (
        <>
            <transformNode name="hero-base" onCreated={(n) => {
                base.current = n;
            }}>
                {/* 섀시: 낮은 몸통 + 상판 */}
                <box name="hero-chassis" width={2.5} height={0.42} depth={1.6}
                     position={new Vector3(0, 0.55, 0)}>
                    <Metal name="hero-chassis" color={LINK_GRAY}/>
                </box>
                <box name="hero-deck" width={1.9} height={0.16} depth={1.25}
                     position={new Vector3(0, 0.84, 0)}>
                    <Metal name="hero-deck" color={HOUSING_DARK}/>
                </box>
                {/* mecanum 바퀴 4개: 허브 둘레에 45° 기울어진 롤러들 (X 자 배치) */}
                {([[-0.95, 0.86], [0.95, 0.86], [-0.95, -0.86], [0.95, -0.86]] as Array<[number, number]>)
                    .map(([wx, wz], i) => {
                        const gammaSign = i === 0 || i === 3 ? 1 : -1;
                        return (
                            <transformNode key={i} name={`hero-wheelmount-${i}`}
                                           position={new Vector3(wx, 0.36, wz)}
                                           rotation={new Vector3(Math.PI / 2, 0, 0)}>
                                <cylinder name={`hero-wheel-${i}`} diameter={0.5} height={0.26}
                                          tessellation={20}
                                          onCreated={(m) => {
                                              wheels.current[i] = m;
                                          }}>
                                    <Metal name={`hero-wheel-${i}`} color={WHEEL_DARK}/>
                                    {/* 롤러: 림을 따라 45° 로 누운 작은 원통들. 바퀴와 같이 돈다 */}
                                    {Array.from({length: N_ROLLERS}, (_, k) => (
                                        <transformNode key={k} name={`hero-roller-yaw-${i}-${k}`}
                                                       rotation={new Vector3(0, (2 * Math.PI * k) / N_ROLLERS, 0)}>
                                            <transformNode name={`hero-roller-pos-${i}-${k}`}
                                                           position={new Vector3(0.3, 0, 0)}
                                                           rotation={new Vector3(gammaSign * Math.PI / 4, 0, 0)}>
                                                <cylinder name={`hero-roller-${i}-${k}`} diameter={0.13}
                                                          height={0.24} tessellation={10}>
                                                    <Metal name={`hero-roller-${i}-${k}`} color={ROLLER_GRAY}/>
                                                </cylinder>
                                            </transformNode>
                                        </transformNode>
                                    ))}
                                </cylinder>
                                <cylinder name={`hero-wheelring-${i}`} diameter={0.52} height={0.08}
                                          tessellation={20}>
                                    <standardMaterial name={`hero-wheelring-${i}-mat`} diffuseColor={CYAN}
                                                      emissiveColor={CYAN.scale(0.3)}/>
                                </cylinder>
                            </transformNode>
                        );
                    })}
                {/* 팔 (0.62 스케일로 상판 위에) */}
                <transformNode name="hero-armroot" position={new Vector3(-0.35, 0.92, 0)}
                               scaling={new Vector3(0.62, 0.62, 0.62)}>
                    <cylinder name="hero-pedestal" diameter={1.6} height={0.3} tessellation={32}
                              position={new Vector3(0, 0.15, 0)}>
                        <Metal name="hero-pedestal" color={HOUSING_DARK}/>
                    </cylinder>
                    <transformNode name="hero-j1o" position={new Vector3(0, 0.3, 0)}
                                   onCreated={(n) => {
                                       j1.current = n;
                                   }}>
                        <transformNode name="hero-j1h" position={new Vector3(0, 0.55, 0)}>
                            <Housing name="hero-j1" radius={0.66} width={1.1} vertical/>
                        </transformNode>
                        <transformNode name="hero-j2o" position={new Vector3(0, 1.35, 0)}>
                            <Housing name="hero-j2" radius={0.6} width={1.35}/>
                            <transformNode name="hero-j2r"
                                           onCreated={(n) => {
                                               j2.current = n;
                                           }}>
                                <Tube name="hero-upper" radius={0.42} length={3.1}
                                      position={new Vector3(0, 0, 0.62)}/>
                                <transformNode name="hero-j3o" position={new Vector3(0, 3.1, 0.62)}>
                                    <Housing name="hero-j3" radius={0.5} width={1.05}/>
                                    <transformNode name="hero-j3r"
                                                   onCreated={(n) => {
                                                       j3.current = n;
                                                   }}>
                                        <Tube name="hero-fore" radius={0.34} length={2.6}
                                              position={new Vector3(0, 0, -0.3)}/>
                                        <transformNode name="hero-wrist"
                                                       position={new Vector3(0, 2.6, -0.3)}
                                                       onCreated={(n) => {
                                                           j4.current = n;
                                                       }}>
                                            <Housing name="hero-w1" radius={0.36} width={0.8}
                                                     ring={RING_ORANGE}/>
                                            <cylinder name="hero-flange" diameter={0.5} height={0.5}
                                                      tessellation={24}
                                                      position={new Vector3(0, 0.5, 0)}>
                                                <Metal name="hero-flange" color={LINK_GRAY}/>
                                            </cylinder>
                                            <sphere name="hero-ee" diameter={0.34}
                                                    position={new Vector3(0, 0.92, 0)}>
                                                <standardMaterial name="hero-ee-mat" diffuseColor={CYAN}
                                                                  emissiveColor={CYAN.scale(0.75)}/>
                                            </sphere>
                                            <transformNode name="hero-marker"
                                                           position={new Vector3(0, 0.92, 0)}
                                                           onCreated={(n) => {
                                                               marker.current = n;
                                                           }}/>
                                        </transformNode>
                                    </transformNode>
                                </transformNode>
                            </transformNode>
                        </transformNode>
                    </transformNode>
                </transformNode>
            </transformNode>
            {/* 베이스 바닥 궤적: 납작한 디스크들 */}
            {Array.from({length: BASE_TRAIL_N}, (_, i) => (
                <cylinder key={`bt${i}`} name={`hero-basetrail-${i}`} diameter={0.26} height={0.02}
                          tessellation={14} position={new Vector3(0, -100, 0)}
                          onCreated={(m) => {
                              baseTrail.current[i] = m;
                              m.isVisible = false;
                          }}>
                    <standardMaterial name={`hero-basetrail-${i}-mat`} diffuseColor={CYAN}
                                      emissiveColor={CYAN.scale(0.55)} alpha={0.5}/>
                </cylinder>
            ))}
            {/* 궤적 점들 (씬 루트 고정: 베이스가 움직여도 세계에 남는다) */}
            {Array.from({length: TRAIL_N}, (_, i) => (
                <sphere key={i} name={`hero-trail-${i}`} diameter={1} segments={10}
                        position={new Vector3(0, -100, 0)}
                        onCreated={(m) => {
                            trail.current[i] = m;
                            m.isVisible = false;
                        }}>
                    <standardMaterial name={`hero-trail-${i}-mat`} diffuseColor={ACCENT}
                                      emissiveColor={ACCENT.scale(0.85)} alpha={0.75}/>
                </sphere>
            ))}
        </>
    );
};

// 주행 경로(8자, |x| ≤ 2.6, |z| ≤ 2.0) 바깥에 놓인 정적인 방: 벽 두 장, 테이블, 상자들.
const Room = () => (
    <>
        {/* L 자 벽 */}
        <box name="hero-wall1" width={0.18} height={1.7} depth={6.6}
             position={new Vector3(-4.6, 0.85, -0.6)}>
            <Metal name="hero-wall1" color={LINK_GRAY}/>
        </box>
        <box name="hero-wall2" width={5.8} height={1.7} depth={0.18}
             position={new Vector3(-1.8, 0.85, -4.0)}>
            <Metal name="hero-wall2" color={LINK_GRAY}/>
        </box>
        {/* 테이블 */}
        <transformNode name="hero-table" position={new Vector3(4.9, 0, -2.4)}>
            <box name="hero-tabletop" width={1.7} height={0.1} depth={1.15}
                 position={new Vector3(0, 0.86, 0)}>
                <Metal name="hero-tabletop" color={HOUSING_DARK}/>
            </box>
            {([[-0.72, -0.45], [0.72, -0.45], [-0.72, 0.45], [0.72, 0.45]] as Array<[number, number]>)
                .map(([lx, lz], i) => (
                    <box key={i} name={`hero-tableleg-${i}`} width={0.1} height={0.82} depth={0.1}
                         position={new Vector3(lx, 0.41, lz)}>
                        <Metal name={`hero-tableleg-${i}`} color={HOUSING_DARK}/>
                    </box>
                ))}
        </transformNode>
        {/* 상자들 */}
        <box name="hero-crate1" width={0.75} height={0.75} depth={0.75}
             position={new Vector3(4.6, 0.375, 2.6)} rotation={new Vector3(0, 0.5, 0)}>
            <Metal name="hero-crate1" color={new Color3(0.72, 0.6, 0.45)}/>
        </box>
        <box name="hero-crate2" width={0.5} height={0.5} depth={0.5}
             position={new Vector3(-4.1, 0.25, 3.1)} rotation={new Vector3(0, -0.4, 0)}>
            <Metal name="hero-crate2" color={new Color3(0.72, 0.6, 0.45)}/>
        </box>
    </>
);

const Hero3D = () => (
    <div className="hero-3d">
        <Physics3DCanvas
            className="w-full h-[320px] sm:h-[380px]"
            initialView={{radius: 13.5, at: {x: 8, y: 5.5, z: 7.5}, to: {x: 0, y: 2.0, z: 0}}}
            ground={{opacity: 0.55}}
        >
            <MobileManipulator/>
            <Room/>
        </Physics3DCanvas>
        <div className="hero-cap"><span className="dot"/>live · drag to orbit</div>
    </div>
)

export default Hero3D
