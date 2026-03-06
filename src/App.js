import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MenuBar from "./components/MenuBar";
import Footer from "./components/Footer";
import Viewer from "./pages/Viewer";
import AllGames from "./pages/AllGames";

function App() {
    return (
        <Router>
            <div className="flex flex-col min-h-screen bg-gray-950 text-white">
                <MenuBar />
                <Routes>
                    <Route path="/" element={<Viewer />} />
                    <Route path="/rw-bingo-board-viewer" element={<Viewer />} />
                    <Route path="/all-games" element={<AllGames />} />
                </Routes>
                <Footer />
            </div>
        </Router>
    );
}

export default App;
