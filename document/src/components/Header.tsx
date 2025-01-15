import {useCallback} from "react";
import {useSearchParams} from "react-router-dom";

interface HeaderProps {
}
const Header = ({
                }: HeaderProps) => {

    const [searchParams, setSearchParams] = useSearchParams()
    const callback = useCallback(() => {
        searchParams.delete('chapter')
        setSearchParams(searchParams)
    }, [])

    return <h1
        className="w-full text-2xl font-bold py-2 flex items-center justify-center bg-gray-700 text-gray-100 h-10 sm:tracking-widest">
        <label onClick={callback}>
            <button>Modern Robotics Study</button>
        </label>
    </h1>
}

export default Header
