import {BlockMath, InlineMath, MathComponentProps} from "react-katex";

export const BlockMatrix = ({
                                math,
                                ...props
                            }: MathComponentProps) => {
    return <BlockMath
        math={`\\left[\\hspace{5pt} \\def\\arraystretch{1.5} \\begin{matrix} ${math} \\end{matrix} \\hspace{5pt} \\right]`} {...props}/>
}

export const InlineMatrix = ({
                                 math,
                                 ...props
                             }) => {
    return <InlineMath
        math={`\\left[\\hspace{5pt} \\def\\arraystretch{1.5} \\begin{matrix} ${math} \\end{matrix} \\hspace{5pt} \\right]`} {...props}/>
}
