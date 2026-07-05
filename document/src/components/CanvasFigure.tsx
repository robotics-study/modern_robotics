import {ReactNode, useState} from "react";
import cn from "../libs/cn";
import Modal from "./Modal";

interface CanvasFigureProps {
    label: string;
    // 인라인 썸네일로 렌더할 캔버스.
    children: ReactNode;
    // 모달용 확대 캔버스. 생략하면 children 을 큰 컨테이너에 그대로 재사용한다.
    modal?: ReactNode;
    // 외곽 래퍼(레이아웃 폭 등).
    className?: string;
    // 모달 내부 캔버스 컨테이너 크기.
    bodyClassName?: string;
    // 고정 픽셀 크기 캔버스(예: Konva)는 래퍼를 콘텐츠에 밀착시켜 zoom 버튼이 캔버스 모서리에 붙게 한다.
    tight?: boolean;
}

const ZoomIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7"/>
        <path d="m21 21-4.3-4.3M11 8v6M8 11h6"/>
    </svg>
);

const CanvasFigure = ({label, children, modal, className, bodyClassName, tight}: CanvasFigureProps) => {
    const [open, setOpen] = useState(false);
    return (
        <div className={cn("flex flex-col items-center justify-center p-3 gap-1", className)}>
            <div className={cn("relative group", tight ? "w-fit max-w-full" : "w-full")}>
                {children}
                <button type="button" className="canvas-zoom-btn" onClick={() => setOpen(true)}
                        aria-label={`Expand ${label}`}>
                    <ZoomIcon/>
                </button>
            </div>
            <span className="text-xs text-muted">{label}</span>
            <Modal open={open} onClose={() => setOpen(false)} title={label}>
                <div className={cn("mx-auto", bodyClassName ?? "w-[min(80vmin,560px)] aspect-square")}>
                    {/* 열렸을 때만 확대 인스턴스를 마운트한다 (불필요한 WebGL 컨텍스트 방지). */}
                    {open ? (modal ?? children) : null}
                </div>
            </Modal>
        </div>
    );
};

export default CanvasFigure;
