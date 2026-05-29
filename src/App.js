import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom";
import MenuBar from "./components/MenuBar";
import Footer from "./components/Footer";
import Viewer from "./pages/Viewer";
import AllGames from "./pages/AllGames";
import UserGames from "./pages/UserGames";
import Schedule from "./pages/Schedule";
import Leaderboard from "./pages/Leaderboard";
import Ranked from "./pages/Ranked";
import Credits from "./pages/Credits";

function UserGamesRoute() {
    const { userName } = useParams();
    return <UserGames userName={userName} />;
}

function App() {
    return (
        <Router>
            <div className="flex flex-col min-h-screen bg-gray-950 text-white">
                <MenuBar />
                <Routes>
                    {/* <Route path="/" element={<Viewer />} /> */}
                    <Route path="/rw-bingo-board-viewer" element={<Viewer />} />
                    <Route path="/rw-bingo-board-viewer/schedule" element={<Schedule />} />
                    <Route path="/rw-bingo-board-viewer/leaderboard" element={<Leaderboard />} />
                    <Route path="/rw-bingo-board-viewer/ranked" element={<Ranked />} />
                    <Route path="/rw-bingo-board-viewer/all-games" element={<AllGames />} />
                    <Route path="/rw-bingo-board-viewer/user/:userName" element={<UserGamesRoute />} />
                    <Route path="/rw-bingo-board-viewer/credits" element={<Credits />} />
                </Routes>
                <Footer />
            </div>
        </Router>
    );
}

export default App;
