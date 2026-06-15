import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const MenuBar = () => {
    const [search, setSearch] = useState('');
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const userName = search.trim();
        if (userName) {
            navigate(`/rw-bingo-board-viewer/user/${encodeURIComponent(userName)}`);
        }
    };

    return (
        <nav className="relative bg-gray-900 border-b border-gray-700 shadow-lg">
            <div className="max-w-full mx-auto px-6 py-4">
                <div className="flex items-center">
                    <Link to="/rw-bingo-board-viewer">
                        <img
                            src="https://firebasestorage.googleapis.com/v0/b/bingo-db-57e75.firebasestorage.app/o/logo%20color%20glow%20shadow.png?alt=media"
                            alt="Bingo Logo"
                            className="h-10 w-auto"
                        />
                    </Link>
                    <ul className="hidden md:flex ml-0 md:ml-12 space-x-8 items-center">
                        <li>
                            <Link
                                to="/rw-bingo-board-viewer"
                                className="text-gray-300 hover:text-white transition-colors duration-200"
                            >
                                Live
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/rw-bingo-board-viewer/all-games"
                                className="text-gray-300 hover:text-white transition-colors duration-200"
                            >
                                All Games
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/rw-bingo-board-viewer/all-matches"
                                className="text-gray-300 hover:text-white transition-colors duration-200"
                            >
                                All Matches
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/rw-bingo-board-viewer/leaderboard"
                                className="text-gray-300 hover:text-white transition-colors duration-200"
                            >
                                Leaderboard
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/rw-bingo-board-viewer/ranked"
                                className="text-gray-300 hover:text-white transition-colors duration-200"
                            >
                                Ranked
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/rw-bingo-board-viewer/schedule"
                                className="text-gray-300 hover:text-white transition-colors duration-200"
                            >
                                Schedule
                            </Link>
                        </li>
                    </ul>
                    <form onSubmit={handleSearchSubmit} className="hidden md:block ml-auto relative">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                        <input
                            type="search"
                            placeholder="Username"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-3 py-2 rounded bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 w-48"
                        />
                    </form>
                    <button className="md:hidden ml-auto text-gray-300 hover:text-white focus:outline-none" onClick={() => setMenuOpen((prev) => !prev)}>
                        {menuOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
            {menuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 z-50 bg-gray-900 border-t border-gray-700 px-6 pb-4">
                    <ul className="flex flex-col space-y-3 pt-3">
                        <li>
                            <Link
                                to="/rw-bingo-board-viewer"
                                className="text-gray-300 hover:text-white transition-colors duration-200"
                                onClick={() => setMenuOpen(false)}
                            >
                                Live
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/rw-bingo-board-viewer/all-games"
                                className="text-gray-300 hover:text-white transition-colors duration-200"
                                onClick={() => setMenuOpen(false)}
                            >
                                All Games
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/rw-bingo-board-viewer/all-matches"
                                className="text-gray-300 hover:text-white transition-colors duration-200"
                                onClick={() => setMenuOpen(false)}
                            >
                                All Matches
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/rw-bingo-board-viewer/leaderboard"
                                className="text-gray-300 hover:text-white transition-colors duration-200"
                                onClick={() => setMenuOpen(false)}
                            >
                                Leaderboard
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/rw-bingo-board-viewer/ranked"
                                className="text-gray-300 hover:text-white transition-colors duration-200"
                                onClick={() => setMenuOpen(false)}
                            >
                                Ranked
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/rw-bingo-board-viewer/schedule"
                                className="text-gray-300 hover:text-white transition-colors duration-200"
                                onClick={() => setMenuOpen(false)}
                            >
                                Schedule
                            </Link>
                        </li>
                    </ul>

                    <form onSubmit={(e) => { handleSearchSubmit(e); setMenuOpen(false); }} className="mt-4 relative">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                        </svg>
                        <input
                            type="search"
                            placeholder="Username"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                        />
                    </form>
                </div>
            )}
        </nav>
    );
};

export default MenuBar;
