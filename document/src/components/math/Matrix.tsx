import {MathComponentPropsWithMath} from "react-katex";
import {BlockMath, InlineMath} from "./Tex";

// 대괄호로 감싼 행렬 표기 헬퍼. 아직 챕터에서 사용되진 않지만 수식 콘텐츠 확장용으로 둔다.
export const BlockMatrix = ({math, ...props}: MathComponentPropsWithMath) => {
    return <BlockMath
        math={`\\left[\\hspace{5pt} \\def\\arraystretch{1.5} \\begin{matrix} ${math} \\end{matrix} \\hspace{5pt} \\right]`} {...props}/>
}

export const InlineMatrix = ({math, ...props}: MathComponentPropsWithMath) => {
    return <InlineMath
        math={`\\left[\\hspace{5pt} \\def\\arraystretch{1.5} \\begin{matrix} ${math} \\end{matrix} \\hspace{5pt} \\right]`} {...props}/>
}
