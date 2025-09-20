import {BrowserRouter as Router,Route,Routes } from "react-router-dom";
import Home from "./components/Student/Home";
import Recurter from "./components/Recruter/Recurter";
import Frontoage from "./components/Home/Frontpage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Frontoage />} />
        <Route path="/applicants" element={<Home />} />
        <Route path="/recruiter" element={<Recurter />} />
      </Routes>
    </Router>
  )
}

export default App