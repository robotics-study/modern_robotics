import {IChapterData} from "../../types/global";

interface ChapterContentsProps extends IChapterData {
}

const ChapterContents = ({
                             title,
                             chapter,
                             contents: Contents
                         }: ChapterContentsProps) => {
    return <div>
        <h2 className="w-full py-2 px-2 flex justify-between items-center bg-gray-700 text-gray-300 h-8 tracking-wider">
            <span className="text-sm break-keep">Chapter.{chapter}</span>
            <span className="text-base font-semibold flex flex-wrap justify-end">{title}</span>
        </h2>
        <div className="p-2">
            <Contents/>
        </div>
    </div>
}


export default ChapterContents
