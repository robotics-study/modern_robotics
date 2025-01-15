import {IChapterData} from "../../../types/global";
import * as CH1 from './Chapter1'
import * as CH2 from './Chapter2'

const data: { readonly default: IChapterData }[] = [
    CH1,
    CH2
]
export default data.sort((a, b) => {
    return a.default.chapter - b.default.chapter
})
