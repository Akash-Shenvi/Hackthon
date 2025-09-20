import {BrowserRouter as Router,Route,Routes } from "react-router-dom";
import Home from "./components/Student/Home";
import Recurter from "./components/Recruter/Recurter";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recurter" element={<Recurter />} />
      </Routes>
    </Router>
  )
}

export default App