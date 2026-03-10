import React, { Component } from 'react';
import BingoCanvas from '../components/BingoCanvas';
import { atlases } from '../lib/bingovista/bingovista';
import { getTeamName } from '../utils/teamNames';

class UserGames extends Component {
    constructor(props) {
        super(props);
        this.state = {
            games: [],
            loading: true,
            error: null
        };
    }

    async componentDidMount() {
        // Adapted from bingovista.js – prepare atlases (same as AllGames)
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
        }).finally(() => this.setState({ loading: false }));

        this.fetchUserGames();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.userName !== this.props.userName) {
            this.setState({ loading: true, error: null });
            this.fetchUserGames();
        }
    }

    fetchUserGames = async () => {
        const { userName } = this.props;
        if (!userName) return;
        try {
            const response = await fetch('https://us-central1-bingo-db-57e75.cloudfunctions.net/api/games/user/' + encodeURIComponent(userName));
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            const data = await response.json();
            const games = data.games || [];
            this.setState({
                games,
                loading: false,
                error: null
            });
        } catch (error) {
            console.error('Error fetching games:', error);
            this.setState({
                error: error.message,
                loading: false
            });
        }
    }

    formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }

    getGameValue = (obj, key) => {
        if (!obj) return null;
        const v = obj.info[key];
        if (v && typeof v === 'object' && 'stringValue' in v) return v.stringValue;
        if (v && typeof v === 'object' && 'timestampValue' in v) return v.timestampValue;
        if (v && typeof v === 'object' && 'integerValue' in v) return v.integerValue;
        return v;
    }

    render() {
        const { games, loading, error } = this.state;
        const { userName } = this.props;

        if (loading) {
            return (
                <div className="flex-grow p-6 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-white text-xl">Loading games...</p>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex-grow p-6 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-red-400 text-xl">Error loading games</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex-grow">
                <div className="p-6 max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold text-white mb-8">{decodeURIComponent(userName || '')}</h1>

                    {games.length === 0 ? (
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                            <p className="text-gray-400">No games found for this user.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {games.map((game, index) => {
                                const name = this.getGameValue(game, 'name') ?? 'Unknown';
                                const team = this.getGameValue(game, 'team');
                                const completedGoals = this.getGameValue(game, 'completedGoals') ?? 0;
                                const deaths = this.getGameValue(game, 'deaths') ?? "";
                                const winningTeam = this.getGameValue(game, 'winningTeam');
                                const time = this.getGameValue(game, 'time');
                                const createdAt = this.getGameValue(game, 'createdAt');
                                const boardState = this.getGameValue(game, 'boardState');
                                const boardString = this.getGameValue(game, 'boardString');

                                return (
                                    <div
                                        key={index}
                                        className="bg-gray-800 border border-gray-700 rounded-lg flex flex-row"
                                    >
                                        <div className="flex flex-col lg:w-1/3 p-4 border-r border-gray-700 space-y-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-white font-semibold">{name}</span>
                                                <span className="text-gray-400">{getTeamName(team)}</span>
                                            </div>
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <span className="text-gray-400">Goals locked: {completedGoals}</span>
                                                {winningTeam === team ?
                                                    <span className="px-2 py-0.5 rounded bg-green-400 text-gray-900 font-medium">Won ({getTeamName(winningTeam)})</span> :
                                                    <span className="px-2 py-0.5 rounded bg-red-400 text-gray-900 font-medium">Lost ({getTeamName(winningTeam)})</span>
                                                }
                                            </div>
                                            <span className="text-gray-400">Duration: {time}</span>
                                            <p>
                                                <span className="text-gray-400">Deaths: {deaths === "" ? 0 : deaths.split(',').length} </span>
                                                <span className="text-gray-400 text-sm">[{deaths}]</span>
                                            </p>
                                            <p className="text-gray-500 text-xs">
                                                {this.formatDate(createdAt)}
                                            </p>
                                        </div>
                                        <div className="p-4 flex justify-center bg-gray-900/50 flex-1">
                                            <BingoCanvas
                                                bingoString={boardString}
                                                boardState={boardState ? boardState.split("<>") : []}
                                                team={Number(team)}
                                                size={500}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default UserGames;
