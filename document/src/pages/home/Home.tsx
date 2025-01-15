import chapters from "../chapters";
import HomeChapterListItem from "../../components/HomeChapterListItem";

interface HomeProps {
    updateChapterParam(): void
}

const Home = ({
                  updateChapterParam
              }: HomeProps) => {

    return <ul className="divide-y">
        {
            chapters.map(({
                              default: {
                                  ...props
                              }
                          }, index) => {
                return <HomeChapterListItem key={index} {...props} updateChapterParam={updateChapterParam}/>
            })
        }
    </ul>
}


export default Home
