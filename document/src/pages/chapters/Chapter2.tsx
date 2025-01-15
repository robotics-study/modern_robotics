import {IChapterData} from "../../../types/global";
import {BlockMath, InlineMath} from "react-katex";

const Chapter2 = () => {
    return (
        <div>
            the explanation will be displayed here.
            <p>test equation :
            </p>
            <BlockMath math='\int_{a}^{b} x^2 dx'/>
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
