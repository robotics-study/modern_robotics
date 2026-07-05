import {Fragment, ReactNode} from "react";

// 의존성 없이 XML/xacro 를 토큰별로 색칠한다. 색은 테마 CSS 변수(--tok-*)에서 읽어 라이트/다크 모두 대응.
type TokClass = "comment" | "tag" | "attr" | "string" | "expr" | "punct" | "text";

interface Tok {
    c: TokClass;
    t: string;
}

// 문자열 값 안의 xacro 식 ${...} 을 분리해 별도 색으로 칠한다.
const splitExpr = (str: string, base: TokClass): Tok[] =>
    str.split(/(\$\{[^}]*\})/).filter(Boolean).map((part) =>
        part.startsWith("${") ? {c: "expr" as const, t: part} : {c: base, t: part});

const tokenizeTag = (tag: string): Tok[] => {
    const out: Tok[] = [];
    const open = tag.match(/^<\/?/)![0];
    out.push({c: "punct", t: open});
    let rest = tag.slice(open.length);
    const name = rest.match(/^[^\s>/]+/);
    if (name) {
        out.push({c: "tag", t: name[0]});
        rest = rest.slice(name[0].length);
    }
    // 속성/문자열/연산자/닫는 괄호를 순서대로 소비한다. 마지막 [^] 로 남는 문자까지 흡수해 유실 방지.
    const re = /("[^"]*")|('[^']*')|([A-Za-z_][\w:.-]*)|(=)|(\??\/?>)|(\s+)|([^])/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(rest))) {
        if (m[1] || m[2]) out.push(...splitExpr(m[0], "string"));
        else if (m[3]) out.push({c: "attr", t: m[3]});
        else if (m[4] || m[5] || m[7]) out.push({c: "punct", t: m[0]});
        else out.push({c: "text", t: m[0]});
    }
    return out;
};

const tokenize = (src: string): Tok[] => {
    const out: Tok[] = [];
    const re = /(<!--[\s\S]*?-->)|(<\/?[^>]+>)|([^<]+)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(src))) {
        if (m[1]) out.push({c: "comment", t: m[1]});
        else if (m[2]) out.push(...tokenizeTag(m[2]));
        else out.push({c: "text", t: m[3]});
    }
    return out;
};

const renderTok = (tok: Tok, i: number): ReactNode =>
    tok.c === "text"
        ? <Fragment key={i}>{tok.t}</Fragment>
        : <span key={i} style={{color: `var(--tok-${tok.c})`}}>{tok.t}</span>;

interface XmlCodeProps {
    code: string;
    className?: string;
}

const XmlCode = ({code, className}: XmlCodeProps) => (
    <pre className={className}><code>{tokenize(code).map(renderTok)}</code></pre>
);

export default XmlCode;
