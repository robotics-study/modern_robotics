import {useCallback} from "react";
import {useSearchParams} from "react-router-dom";

interface HeaderProps {
}

const Header = ({}: HeaderProps) => {

    const [searchParams, setSearchParams] = useSearchParams()
    const callback = useCallback(() => {
        if (searchParams.get("chapter")) {
            searchParams.delete('chapter')
            setSearchParams(searchParams)
        } else {
            window.location.href = "/"
        }
    }, [])

    return <h1
        className="w-full text-2xl font-bold py-2 flex items-center justify-center bg-gray-700 text-gray-100 h-10 sm:tracking-widest">
        <label onClick={callback}>
            <button>{searchParams.get("chapter") ? "Modern Robotics Study" : "Robotics study"}</button>
        </label>
    </h1>
}

export default Header
