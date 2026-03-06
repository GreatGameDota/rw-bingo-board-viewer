import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 border-t border-gray-700">
            <div className="max-w-full mx-auto px-6 py-6">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="text-gray-400 text-sm mb-4 md:mb-0">
                        <p>&copy; {new Date().getFullYear()} GreatGameDota</p>
                    </div>
                    <div className="text-gray-400 text-sm">
                        <p>
                            Bingo board display fork of
                            <a
                                href="https://t3sl4co1l.github.io/bingovista/bingovista.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-1 text-blue-400 hover:text-blue-300 transition-colors duration-200"
                            >
                                T3sl4co1l's Bingo Vista
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
