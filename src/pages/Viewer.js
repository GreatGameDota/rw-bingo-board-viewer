import React, { Component } from "react";
import BingoCanvas from "../components/BingoCanvas";
import { atlases } from '../lib/bingovista/bingovista';
import { getLiveSocketService } from "../live/liveSocketService";
import { TEAM_NAMES } from "../utils/teamNames";

class Viewer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            s: "Watcher;BingoDodgeLeviathanChallenge~0><0bChGBingoDodgeLeviathanChallenge~0><0bChGBingoDodgeLeviathanChallenge~0><0bChGBingoDodgeLeviathanChallenge~0><0bChGBingoDodgeLeviathanChallenge~0><0bChGBingoDodgeLeviathanChallenge~0><0bChGBingoDodgeLeviathanChallenge~0><0bChGBingoDodgeLeviathanChallenge~0><0bChGBingoDodgeLeviathanChallenge~0><0bChGBingoDodgeLeviathanChallenge~0><0bChGBingoDodgeLeviathanChallenge~0><0bChGBingoDodgeLeviathanChallenge~0><0bChGBingoDodgeLeviathanChallenge~0><0bChGBingoDodgeLeviathanChallenge~0><0bChGBingoDodgeLeviathanChallenge~0><0bChGBingoDodgeLeviathanChallenge~0><0bChGBingoDodgeLeviathanChallenge~0><0bChGBingoDodgeLeviathanChallenge~0><0bChGBingoDodgeLeviathanChallenge~0><0bChGBingoDodgeLeviathanChallenge~0><0bChGBingoDodgeLeviathanChallenge~0><0bChGBingoDodgeLeviathanChallenge~0><0bChGBingoDodgeLeviathanChallenge~0><0bChGBingoDodgeLeviathanChallenge~0><0bChGBingoDodgeLeviathanChallenge~0><0",
            boardState: "000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000".split("<>"),
            team: null,
            messages: [],
            clients: new Map(),
            selectedClientId: null,
            connected: false,
            boardSize: this.calculateBoardSize()
        };
    }

    applyLiveSnapshot = (snap) => {
        const clients = snap?.clients ?? new Map();
        const connected = Boolean(snap?.connected);

        let selectedClientId = this.state.selectedClientId;
        const sortedClients = Array.from(clients.values()).sort((a, b) => a.name.localeCompare(b.name));
        if (!selectedClientId && sortedClients.length > 0) {
            selectedClientId = sortedClients[0].name;
        }

        const next = {
            connected,
            clients,
            selectedClientId
        };

        if (selectedClientId && clients.has(selectedClientId)) {
            const client = clients.get(selectedClientId);
            next.s = client?.board ?? this.state.s;
            next.boardState = client?.state ? client.state.split("<>") : this.state.boardState;
            next.team = client?.team ?? this.state.team;
        }

        this.setState(next);
    };

    calculateBoardSize = () => {
        let availableWidth = Math.min(window.innerWidth - 96, 1024);
        let boardAreaWidth = availableWidth * (2 / 3);
        let boardSize = Math.max(Math.min(boardAreaWidth * 0.95, 700), 350);
        return boardSize;
    }

    handleResize = () => {
        this.setState({ boardSize: this.calculateBoardSize() });
    }

    async componentDidMount() {
        this.unsubscribeLive = getLiveSocketService().subscribe(this.applyLiveSnapshot);

        // Adapted from bingovista.js
        //	Prepare atlases
        atlases[0].img = (await import("../lib/bingovista/bvicons.png")).default;
        atlases[0].txt = (await import("../lib/bingovista/bvicons.txt")).default;
        atlases[1].img = (await import("../lib/bingovista/bingoicons.png")).default;
        atlases[1].txt = (await import("../lib/bingovista/bingoicons.txt")).default;
        atlases[2].img = (await import("../lib/bingovista/uispritesmsc.png")).default;
        atlases[2].txt = (await import("../lib/bingovista/uispritesmsc.txt")).default;
        atlases[3].img = (await import("../lib/bingovista/uiSprites.png")).default;
        atlases[3].txt = (await import("../lib/bingovista/uiSprites.txt")).default;
        atlases[4].img = (await import("../lib/bingovista/uispriteswatcher.png")).default;
        atlases[4].txt = (await import("../lib/bingovista/uispriteswatcher.txt")).default;

        function loadImage(src, dest) {
            return new Promise(function (resolve, reject) {
                var img = document.createElement("img");
                img.addEventListener("load", function () {
                    var canv = document.createElement("canvas");
                    canv.width = img.naturalWidth; canv.height = img.naturalHeight;
                    var ctx = canv.getContext("2d");
                    ctx.drawImage(img, 0, 0);
                    dest.canv = canv;
                    resolve();
                });
                img.crossOrigin = "anonymous";
                img.addEventListener("error", () => reject({ message: "Error loading image " + src + "." }));
                img.src = src;
            });
        }

        function loadJson(src, dest) {
            return fetch(src).then(function (response, reject) {
                if (!response.ok)
                    return reject(new DOMException("URL " + response.url + " error " + response.status + " " + response.statusText + ".", "NetworkError"));
                return response.text();
            }).catch((e) => {
                return Promise.reject(e);
            }).then((s) => {
                dest.frames = JSON.parse(s).frames;
            });
        }

        function loadClosure(s, d, f) {
            return f(s, d);
        }

        var loaders = [];
        for (var i = 0; i < atlases.length; i++) {
            loaders.push(loadClosure(atlases[i].img, atlases[i], loadImage));
        };
        for (var i = 0; i < atlases.length; i++) {
            loaders.push(loadClosure(atlases[i].txt, atlases[i], loadJson));
        };
        Promise.all(loaders).catch(function (e) {
            console.log("Promise.all(): failed to complete fetches. Error: " + e.message);
        });

        window.addEventListener('resize', this.handleResize);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
        if (this.unsubscribeLive)
            this.unsubscribeLive();
    }

    handleClientChange = (clientId) => {
        const client = this.state.clients.get(clientId);
        this.setState({
            selectedClientId: clientId,
            s: client ? client.board : this.state.s,
            boardState: client ? client.state.split("<>") : this.state.boardState,
            team: client ? client.team : this.state.team
        });
    };

    render() {
        const sortedClients = Array.from(this.state.clients.values()).sort((a, b) => a.name.localeCompare(b.name));
        const activePlayersList = sortedClients.map((c) => (
            <div
                key={c.name}
                onClick={() => this.handleClientChange(c.name)}
                className={`flex flex-col w-full px-4 py-2 cursor-pointer rounded transition-all
                    ${this.state.selectedClientId === c.name ? 'bg-green-400 text-gray-900 font-semibold' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
            >
                <span>{c.name} ({TEAM_NAMES[c.team]})</span>
                <span>{c.time}</span>
            </div >
        ));

        return (
            <div className="flex-grow flex flex-col w-full">
                <div className="w-full h-32 overflow-hidden">
                    <img
                        src="https://firebasestorage.googleapis.com/v0/b/bingo-db-57e75.firebasestorage.app/o/watcherthumbnailfull.png?alt=media"
                        alt="Bingo Board Banner"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="flex-grow p-6 flex flex-col items-center">
                    <div className="max-w-5xl mb-6 px-6 py-2">
                        <div className="flex items-center mx-auto">
                            <span className="font-semibold text-white">Want to track your games? Get the mod on</span>
                            <a
                                href="https://steamcommunity.com/sharedfiles/filedetails/?id=3562250272"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex ml-1 text-blue-400 hover:text-blue-300 transition-colors duration-200 underline"
                            >
                                Steam
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5 mt-[3px]">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div className="w-full max-w-5xl bg-gray-800 border border-gray-700 rounded-lg p-6">
                        <div className="flex flex-col lg:flex-row gap-6 h-full">
                            <div className="lg:w-1/3 flex flex-col">
                                <h2 className="text-lg font-bold text-green-400 mb-4">Active Games ({this.state.clients.size})</h2>
                                <div className="space-y-2 overflow-y-auto flex-grow">
                                    {activePlayersList.length > 0 ? (
                                        activePlayersList
                                    ) : (
                                        <p className="text-gray-400 text-sm">No active players</p>
                                    )}
                                </div>
                            </div>

                            <div className="lg:w-2/3 flex flex-col items-center justify-center">
                                <div className="flex items-center justify-center">
                                    <BingoCanvas
                                        size={this.state.boardSize}
                                        bingoString={this.state.s}
                                        boardState={this.state.boardState}
                                        team={this.state.team}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Viewer;
