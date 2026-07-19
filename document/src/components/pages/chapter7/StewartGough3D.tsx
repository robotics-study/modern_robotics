import {useEffect, useRef, useState} from "react";
import {Matrix, Quaternion, Vector3} from "@babylonjs/core";
import Physics3DCanvas from "../../3d/Physics3DCanvas";
import CanvasFigure from "../../CanvasFigure";
import AxisTriad from "../../3d/AxisTriad";
import {HOUSING_DARK, LINK_GRAY, Metal, RING_ORANGE, TOOL_RED} from "../../3d/CobotParts";
import {useTr} from "../../../libs/i18n";

// Stewart–Gough 플랫폼 (6×SPS) 구조 모식도. 여섯 개의 prismatic 다리(구동)가 고정 플랫폼과
// 가동 플랫폼을 잇고, 다리 양 끝은 spherical 관절(수동)이다. 플랫폼 자세 (R, p) 가 정해지면
// 다리 길이 sᵢ = ‖p + R bᵢ − aᵢ‖ 는 대입만으로 나온다: inverse kinematics 가 자명하다는 것을
// 자세를 흔들면서 실시간 sᵢ 읽기로 체험하게 한다.
const BASE_R = 2.2;
const PLAT_R = 1.15;
const HOME_H = 2.5;

// 6-6 배치: 세 방향에 두 개씩 짝지은 부착점. 다리는 base[i]→plat[i] 로 엇갈리게 이어
// 실제 SG 플랫폼처럼 삼각 트러스 형태가 된다.
const deg = (d: number) => (d * Math.PI) / 180;
const ring = (r: number, angles: number[], y = 0) =>
    angles.map((a) => new Vector3(r * Math.cos(deg(a)), y, r * Math.sin(deg(a))));
const BASE_PTS = ring(BASE_R, [15, 105, 135, 225, 255, 345]);
// 상판 부착점은 판 아랫면(-0.1)보다 아래로 내려, 다리 로드·관절 구가 판을 뚫고 나오지 않게 한다.
const PLAT_PTS = ring(PLAT_R, [75, 45, 195, 165, 315, 285], -0.22);

// +Y 원통을 dir 방향으로 돌리는 회전 (dir 이 ±Y 와 평행하면 항등/반전 처리).
const yTo = (dir: Vector3): Quaternion => {
    const d = dir.normalize();
    const dot = Math.min(1, Math.max(-1, Vector3.Dot(Vector3.Up(), d)));
    const axis = Vector3.Cross(Vector3.Up(), d);
    if (axis.lengthSquared() < 1e-10) {
        return dot > 0 ? Quaternion.Identity() : Quaternion.RotationAxis(new Vector3(1, 0, 0), Math.PI);
    }
    return Quaternion.RotationAxis(axis.normalize(), Math.acos(dot));
};

// 망원경식 다리: 아래쪽 굵은 sleeve + 위쪽 piston, 양 끝 spherical 관절 구.
const Leg = ({name, a, b}: {name: string; a: Vector3; b: Vector3}) => {
    const d = b.subtract(a);
    const len = d.length();
    const mid = a.add(d.scale(0.5));
    const q = yTo(d);
    const sleeveLen = Math.min(len * 0.62, 1.9);
    return (
        <transformNode name={`${name}-root`} position={mid} rotationQuaternion={q}>
            <cylinder name={`${name}-sleeve`} diameter={0.17} height={sleeveLen} tessellation={16}
                      position={new Vector3(0, -(len - sleeveLen) / 2, 0)}>
                <Metal name={`${name}-sleeve`} color={HOUSING_DARK}/>
            </cylinder>
            {/* piston 은 양 끝 관절 구 너머까지 살짝 관통시켜, 짧은 자세에서도 상판과 끊겨 보이지 않게 한다 */}
            <cylinder name={`${name}-piston`} diameter={0.11} height={len + 0.24} tessellation={12}>
                <Metal name={`${name}-piston`} color={LINK_GRAY}/>
            </cylinder>
            {[-1, 1].map((s) => (
                <sphere key={s} name={`${name}-ball${s}`} diameter={0.2} segments={12}
                        position={new Vector3(0, (s * len) / 2, 0)}>
                    <standardMaterial name={`${name}-ball${s}-mat`} diffuseColor={RING_ORANGE}
                                      emissiveColor={RING_ORANGE.scale(0.3)}/>
                </sphere>
            ))}
        </transformNode>
    );
};

interface SceneProps {
    canvasClassName: string;
}

const SGScene = ({canvasClassName}: SceneProps) => {
    const t = useTr();
    const [playing, setPlaying] = useState(true);
    const [time, setTime] = useState(0);
    const rafRef = useRef<number>();
    const baseRef = useRef(0);

    useEffect(() => {
        if (!playing) return;
        const start = performance.now();
        const offset = baseRef.current;
        const tick = (now: number) => {
            const cur = offset + (now - start) / 1000;
            baseRef.current = cur;
            setTime(cur);
            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [playing]);

    // 6자유도를 전부 조금씩 흔드는 자세: 위치 p + 회전 (yaw, pitch, roll).
    const p = new Vector3(0.35 * Math.sin(0.7 * time), HOME_H + 0.3 * Math.sin(1.1 * time),
        0.35 * Math.sin(0.5 * time + 1.2));
    const q = Quaternion.RotationYawPitchRoll(
        0.4 * Math.sin(0.45 * time), 0.16 * Math.sin(0.9 * time + 0.7), 0.16 * Math.sin(0.8 * time));
    const rot = new Matrix();
    q.toRotationMatrix(rot);
    const platWorld = PLAT_PTS.map((b) => Vector3.TransformCoordinates(b, rot).add(p));
    const lengths = platWorld.map((w, i) => w.subtract(BASE_PTS[i]).length());

    return (
        <div className="flex flex-col gap-2 w-full">
            <Physics3DCanvas
                className={canvasClassName}
                initialView={{radius: 11, at: {x: 7, y: 6, z: 8}, to: {x: 0, y: 1.8, z: 0}}}
                ground={{opacity: 0.45}}
            >
                {/* 고정 플랫폼 */}
                <cylinder name="sg-base" diameter={BASE_R * 2 + 0.5} height={0.28} tessellation={48}
                          position={new Vector3(0, 0.14, 0)}>
                    <Metal name="sg-base" color={HOUSING_DARK}/>
                </cylinder>
                {/* 가동 플랫폼 + body frame 삼축 + 중심점 */}
                <transformNode name="sg-plat-root" position={p} rotationQuaternion={q}>
                    <cylinder name="sg-plat" diameter={PLAT_R * 2 + 0.4} height={0.2} tessellation={48}>
                        <Metal name="sg-plat" color={LINK_GRAY}/>
                    </cylinder>
                    {/* 부착점(판 아래 -0.22)과 판 밑면을 잇는 마운트 기둥: 다리가 판에서 떨어져 보이지 않게 */}
                    {PLAT_PTS.map((pt, i) => (
                        <cylinder key={i} name={`sg-mount${i}`} diameter={0.13} height={0.2} tessellation={12}
                                  position={new Vector3(pt.x, -0.14, pt.z)}>
                            <Metal name={`sg-mount${i}`} color={HOUSING_DARK}/>
                        </cylinder>
                    ))}
                    {/* body frame 표시는 판 윗면 위로 올려 판 속에 파묻히지 않게 한다 */}
                    <transformNode name="sg-tf-root" position={new Vector3(0, 0.11, 0)}>
                        <sphere name="sg-center" diameter={0.16}>
                            <standardMaterial name="sg-center-mat" diffuseColor={TOOL_RED}
                                              emissiveColor={TOOL_RED.scale(0.5)}/>
                        </sphere>
                        <AxisTriad name="sg-tf" size={1.1} radius={0.04}/>
                    </transformNode>
                </transformNode>
                {/* 6개의 SPS 다리 */}
                {BASE_PTS.map((a, i) => (
                    <Leg key={i} name={`sg-leg${i}`} a={new Vector3(a.x, 0.24, a.z)} b={platWorld[i]}/>
                ))}
            </Physics3DCanvas>
            <div className="flex items-center justify-center gap-3 text-xs text-muted">
                <button
                    type="button"
                    onClick={() => setPlaying((v) => !v)}
                    className="px-2.5 py-1 rounded border border-[var(--accent)] text-[var(--accent)] font-semibold"
                >
                    {playing ? "❚❚ Pause" : `▶ ${t("move the platform", "플랫폼 흔들기")}`}
                </button>
                <span className="tabular-nums">
                    s = [{lengths.map((l) => l.toFixed(2)).join(", ")}]
                </span>
            </div>
            <div className="text-xs text-muted text-center">
                {t("actuated: the 6 prismatic legs · passive: the spherical joints (orange) at both ends",
                    "구동: prismatic 다리 6개 · 수동: 다리 양 끝의 spherical 관절 (주황)")}
            </div>
        </div>
    );
};

const StewartGough3D = () => {
    const t = useTr();
    return <CanvasFigure
        label={t(
            "Stewart–Gough platform (6×SPS) structural schematic: as the pose moves, the six leg lengths are read off instantly",
            "Stewart–Gough 플랫폼 (6×SPS) 구조 모식도: 자세가 움직이는 동안 여섯 다리 길이가 즉시 읽힌다",
        )}
        className="w-full sm:w-2/3 mx-auto"
        bodyClassName="w-[min(100%,104vh)]"
        modal={<SGScene canvasClassName="aspect-[4/3] w-full rounded-lg"/>}
    >
        <SGScene canvasClassName="aspect-[4/3] w-full rounded-lg"/>
    </CanvasFigure>;
};

export default StewartGough3D;
