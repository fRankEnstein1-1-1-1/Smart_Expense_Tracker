import Home from "../pages/Home";
import Signup from "../pages/Signup";
import Login from "../pages/Login";
import Results from "../pages/Results"
import History from "../pages/History";
import { BrowserRouter,Routes,Route } from "react-router-dom";


function App(){
  return<>
  <BrowserRouter>
  <Routes>
    <Route path = "/home" element={<Home/>}/>
    <Route path ="/" element ={<Login/>}/>
    <Route path = "/sign" element = {<Signup/>}/>
    <Route path = "/results" element ={<Results/>}/>
    <Route path="/history" element ={<History/>}/>
  </Routes>
  </BrowserRouter>
  </>
}

export default App;