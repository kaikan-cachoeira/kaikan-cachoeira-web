import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";

// Aqui ficam as rotas (endereços) do site
function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/inicio" element={<Home />} />
    </Routes>
  );
}

export default App;
