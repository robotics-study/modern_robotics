import {Route, Router} from 'wouter';
import Home from "./pages/home/Home";

const App = () => {
    return <Router>
        <Route path="/" component={Home}/>
        <Route path="/cv" component={Home}/>
        <Route path="/projects" component={Home}/>
    </Router>
}

export default App
