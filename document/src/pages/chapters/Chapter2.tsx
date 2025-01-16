import {IChapterData} from "../../../types/global";
import {BlockMath, InlineMath} from "react-katex";
import {BlockMatrix, InlineMatrix} from "../../components/math/Matrix";

const Chapter2 = () => {
    return (
        <div>
            the explanation will be displayed here.
            <p>test equation :
            </p>
            <BlockMath math='\int_{a}^{b} x^2 dx'/>
            <BlockMatrix math={`
                \\cos(\\theta) & -\\sin(\\theta) \\\\ 
                \\sin(\\theta) & \\cos(\\theta)
                `
            }/>
            <div className="text-xs">
                <InlineMatrix math={`
                \\cos(\\theta) & -\\sin(\\theta) \\\\ 
                \\sin(\\theta) & \\cos(\\theta)
                `
                }/>
            </div>
            <p className="text-lg">
                <InlineMath math='\int_{a^2}^{b^3} 2x\sqrt{x^2} \frac{\delta{x}}{\delta{t}}'/>
            </p>
        </div>
    )
}
export default {
    title: "Configuration Space",
    chapter: 2,
    contents: Chapter2,
    supportedExample: {
        python: true
    }
} as IChapterData
