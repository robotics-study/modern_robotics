import {useEffect, useState} from "react";
import cn from "../libs/cn";
import Modal from "./Modal";
import XmlCode from "./XmlCode";

const ZoomIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7"/>
        <path d="m21 21-4.3-4.3M11 8v6M8 11h6"/>
    </svg>
);

const CopyIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="11" height="11" rx="2"/>
        <path d="M5 15V5a2 2 0 0 1 2-2h10"/>
    </svg>
);

const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5"/>
    </svg>
);

const CopyButton = ({code}: {code: string}) => {
    const [copied, setCopied] = useState(false);
    // 복사 확인 상태를 잠시 뒤 되돌린다. 언마운트 시 타이머 정리.
    useEffect(() => {
        if (!copied) return;
        const id = window.setTimeout(() => setCopied(false), 1600);
        return () => window.clearTimeout(id);
    }, [copied]);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
        } catch {
            // 클립보드 접근 불가(비보안 컨텍스트 등)면 조용히 무시한다.
        }
    };
    return (
        <button type="button" className={cn("code-fig-btn", copied && "is-copied")} onClick={copy}
                aria-label={copied ? "Copied" : "Copy code"}>
            {copied ? <CheckIcon/> : <CopyIcon/>}
        </button>
    );
};

interface CodeFigureProps {
    code: string;
    label: string;
    className?: string;
    // 인라인 코드블록 스타일(스크롤 높이 등). 모달 안에서는 무시된다.
    codeClassName?: string;
}

const CodeFigure = ({code, label, className, codeClassName}: CodeFigureProps) => {
    const [open, setOpen] = useState(false);
    return (
        <div className={cn("flex flex-col items-center gap-1 p-3", className)}>
            <div className="relative group w-full">
                <XmlCode code={code} className={cn("w-full !my-0", codeClassName)}/>
                <div className="code-fig-tools">
                    <CopyButton code={code}/>
                    <button type="button" className="code-fig-btn" onClick={() => setOpen(true)}
                            aria-label={`Expand ${label}`} style={{cursor: "zoom-in"}}>
                        <ZoomIcon/>
                    </button>
                </div>
            </div>
            <span className="text-xs text-muted">{label}</span>
            <Modal open={open} onClose={() => setOpen(false)} title={label}>
                <div className="relative group w-full">
                    <XmlCode code={code} className="w-full !my-0 text-sm"/>
                    <div className="code-fig-tools">
                        <CopyButton code={code}/>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default CodeFigure;
