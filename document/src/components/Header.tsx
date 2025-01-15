import {useCallback} from "react";

interface HeaderProps {
    updateChapterParam(): void
}
const Header = ({
                    updateChapterParam
                }: HeaderProps) => {

    const callback = useCallback(() => {
        updateChapterParam()
    }, [])

    return <h1
        className="w-full text-2xl font-bold py-2 flex items-center justify-center bg-gray-700 text-gray-100 h-10 sm:tracking-widest">
        <label onClick={callback}>
            <button>Modern Robotics Study</button>
        </label>
    </h1>
}

export default Header
