import chapters from "../chapters";
import HomeChapterListItem from "../../components/HomeChapterListItem";

const Home = () => {
    return <ul className="divide-y">
        {
            chapters.map(({
                              default: {
                                  ...props
                              }
                          }, index) => {
                return <HomeChapterListItem key={index} {...props}/>
            })
        }
    </ul>
}


export default Home
