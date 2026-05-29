import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const [memberCount, setMemberCount] = useState(0);
    const [iconLink, setIconLink] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('https://discord.com/api/v9/invites/D3Yy3sYx2v?with_counts=true');
                if (!res.ok) throw new Error(`API error: ${res.status}`);
                const result = await res.json();
                setMemberCount(result?.approximate_presence_count ?? 0);
                setIconLink(`https://cdn.discordapp.com/icons/${result?.guild.id}/${result?.guild.icon}.png`);
            } catch (error) {
                console.error('Error fetching match games:', error);
            }
        };
        fetchData();
    }, []);

    return (
        <footer className="bg-gray-900 border-t border-gray-700">
            <div className="max-w-full mx-auto px-6 py-6">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="text-gray-400 text-sm mb-4 md:mb-0">
                        <p>&copy; {new Date().getFullYear()} GreatGameDota</p>
                    </div>
                    <a href="https://discord.gg/D3Yy3sYx2v"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-row font-bold hover:bg-gray-800 hover:text-white transition-all duration-200 px-4 py-1 rounded-md">
                        <img src={iconLink} alt="RWSE Discord Icon" className="w-6 h-6 mr-1" />
                        <span className="mr-2 underline">Join the RWSE Discord!</span>
                        <span className="mr-2 text-green-400">•</span>
                        <span>{memberCount} online</span>
                    </a>
                    <div className="text-gray-400">
                        <Link
                            to="/rw-bingo-board-viewer/credits"
                            className="flex items-center rounded-lg px-3.5 py-1 hover:bg-gray-800 hover:text-white transition-all duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                            </svg>
                            Credits
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
