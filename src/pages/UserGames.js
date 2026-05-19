import React, { Component } from 'react';
import { atlases } from '../lib/bingovista/bingovista';
import GameCard from '../components/GameCard';

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
        });

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

        return (
            <div className="flex-grow">
                <div className="p-6 max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold text-white mb-8">{decodeURIComponent(userName || '')}</h1>

                    {loading ? (
                        <div className="flex items-center justify-center py-24">
                            <p className="text-white text-xl">Loading games...</p>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center py-24">
                            <p className="text-red-400 text-xl">Error loading games</p>
                        </div>
                    ) : games.length === 0 ? (
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                            <p className="text-gray-400">No games found.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {games.map((game, index) => <GameCard game={game} idx={index} type="list" />)}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default UserGames;
