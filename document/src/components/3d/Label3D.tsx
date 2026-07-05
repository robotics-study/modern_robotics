import {DynamicTexture, Mesh, MeshBuilder, StandardMaterial, Vector3} from "@babylonjs/core";
import {useScene} from "react-babylonjs";
import {useEffect, useRef} from "react";

// 3D 씬 안에 텍스트 라벨을 띄운다. DynamicTexture 를 빌보드 평면에 그려 카메라를 항상 바라보게 한다.
// (@babylonjs/gui 의존성 없이 core 만으로 구현.) 어두운 외곽선을 둘러 라이트/다크 배경 모두 가독.
// text/color 가 바뀌면 텍스처만 다시 그린다 (슬라이더로 값이 갱신되는 라벨 대응).
interface Label3DProps {
    text: string;
    color: string;
    position: Vector3;
    size?: number;
    onReady?: (mesh: Mesh) => void;
}

const TEX_W = 384;
const TEX_H = 128;

const Label3D = ({text, color, position, size = 1.3, onReady}: Label3DProps) => {
    const scene = useScene();
    const dtRef = useRef<DynamicTexture | null>(null);

    const draw = (t: string, c: string) => {
        const dt = dtRef.current;
        if (!dt) return;
        // Babylon 의 ICanvasRenderingContext 타입엔 textAlign 등이 없지만 브라우저에선 실제 2D 컨텍스트다.
        const ctx = dt.getContext() as unknown as CanvasRenderingContext2D;
        ctx.clearRect(0, 0, TEX_W, TEX_H);
        ctx.font = "bold 64px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineJoin = "round";
        ctx.lineWidth = 10;
        ctx.strokeStyle = "rgba(0,0,0,0.6)";
        ctx.strokeText(t, TEX_W / 2, TEX_H / 2);
        ctx.fillStyle = c;
        ctx.fillText(t, TEX_W / 2, TEX_H / 2);
        dt.update();
    };

    useEffect(() => {
        if (!scene) return;
        const dt = new DynamicTexture("label", {width: TEX_W, height: TEX_H}, scene, false);
        dt.hasAlpha = true;
        dtRef.current = dt;
        draw(text, color);

        const plane = MeshBuilder.CreatePlane("label-plane", {width: size * (TEX_W / TEX_H), height: size}, scene);
        const mat = new StandardMaterial("label-mat", scene);
        mat.diffuseTexture = dt;
        mat.emissiveTexture = dt;
        mat.useAlphaFromDiffuseTexture = true;
        mat.disableLighting = true;
        mat.backFaceCulling = false;
        plane.material = mat;
        plane.billboardMode = Mesh.BILLBOARDMODE_ALL;
        plane.position = position;
        plane.isPickable = false;
        onReady?.(plane);
        return () => {
            plane.dispose();
            mat.dispose();
            dt.dispose();
            dtRef.current = null;
        };
        // 최초 1회 생성. text/color 변경은 아래 effect 가 다시 그린다.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scene]);

    useEffect(() => {
        draw(text, color);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [text, color]);

    return null;
};

export default Label3D;
