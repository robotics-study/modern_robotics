import {IChapterData} from "../../../types/global";
import * as CH1 from './Chapter1'
import * as CH2 from './Chapter2'
import * as CH3 from './Chapter3'
import * as CH4 from './Chapter4'

const data: { readonly default: IChapterData }[] = [
    CH1,
    CH2,
    CH3,
    CH4
]
export default data.sort((a, b) => {
    return a.default.chapter - b.default.chapter
})
