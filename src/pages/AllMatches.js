import React, { Component } from 'react';
import { atlases } from '../lib/bingovista/bingovista';
import GameCard from '../components/GameCard';
import { CHARACTER_TO_NAME, getTeamName, teamColors } from '../utils/constants';

const IMAGES = [
    "https://firebasestorage.googleapis.com/v0/b/bingo-db-57e75.firebasestorage.app/o/regions.png?alt=media",
    "https://firebasestorage.googleapis.com/v0/b/bingo-db-57e75.firebasestorage.app/o/regions2.png?alt=media",
    "https://firebasestorage.googleapis.com/v0/b/bingo-db-57e75.firebasestorage.app/o/regions3.png?alt=media",
];

class AllMatches extends Component {
    constructor(props) {
        super(props);
        this.state = {
            matches: [],
            loading: true,
            error: null,
            page: 0,
            total: 0,
            currentIndex: Math.floor(Math.random() * IMAGES.length),
            pageInput: '1',
            expandedMatchIds: new Set(),
            expandedMatchGames: {},
            expandedMatchLoading: {},
        };
    }

    async componentDidMount() {
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

        await this.fetchPage(0);
    }

    fetchPage = async (page) => {
        this.setState({ loading: true, error: null, pageInput: (page + 1).toString() });
        const min = page * 10;
        const max = min + 10;
        try {
            const response = await fetch(`https://us-central1-bingo-db-57e75.cloudfunctions.net/api/matches?min=${min}&max=${max}`);
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            const data = await response.json();
            const matches = data.matches || [];
            this.setState({
                matches,
                page,
                total: data.total ?? 0,
                loading: false,
                expandedMatchIds: new Set(),
                expandedMatchGames: {},
                error: null,
            });
        } catch (error) {
            console.error('Error fetching matches:', error);
            this.setState({
                error: error.message,
                loading: false
            });
        }
    };

    handlePrev = () => {
        const { page } = this.state;
        if (page > 0) this.fetchPage(page - 1);
    };

    handleNext = () => {
        const { page, total } = this.state;
        const totalPages = Math.ceil(total / 10);
        if (page < totalPages - 1) this.fetchPage(page + 1);
    };

    handleJumpToPage = (e) => {
        if (e.key !== 'Enter')
            return;

        const pageNum = parseInt(e.target.value);
        const totalPages = Math.ceil(this.state.total / 10);

        if (isNaN(pageNum) || pageNum < 1 || pageNum > totalPages) {
            this.setState({ pageInput: (this.state.page + 1).toString() });
            return;
        }

        this.fetchPage(pageNum - 1);
    };

    handlePageInputChange = (e) => {
        this.setState({ pageInput: e.target.value });
    };

    formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };

    getGameValue = (obj, key) => {
        if (!obj) return null;
        const v = obj.info ? obj.info[key] : obj[key];
        if (v && typeof v === 'object' && 'stringValue' in v) return v.stringValue;
        if (v && typeof v === 'object' && 'timestampValue' in v) return v.timestampValue;
        if (v && typeof v === 'object' && 'integerValue' in v) return v.integerValue;
        if (v && typeof v === 'object' && 'arrayValue' in v) return v.arrayValue.values;
        return v;
    };

    groupGamesByTeam = (games) => {
        const teams = {};
        games.forEach(game => {
            const teamNum = this.getGameValue(game, 'team') || 'Unknown';
            if (!teams[teamNum]) {
                teams[teamNum] = [];
            }
            teams[teamNum].push(game);
        });
        return teams;
    };

    renderTeamGames = (matchGames) => {
        const teamGroups = this.groupGamesByTeam(matchGames);
        const teamNames = Object.keys(teamGroups).sort();

        return teamNames.map((teamName, teamIdx) => (
            <div key={teamName}>
                <div className="flex flex-col gap-4">
                    {teamGroups[teamName].sort((a, b) => this.getGameValue(a, 'name').localeCompare(this.getGameValue(b, 'name'))).map((game, gameIdx) => (
                        <GameCard key={gameIdx} game={game} idx={gameIdx} type="list" />
                    ))}
                </div>
                {teamIdx < teamNames.length - 1 && (
                    <div className="flex items-center gap-4 my-8 cursor-default">
                        <div className="flex-1 border-t border-gray-700" />
                        <span className="text-gray-500 font-semibold text-sm">VS</span>
                        <div className="flex-1 border-t border-gray-700" />
                    </div>
                )}
            </div>
        ));
    };

    handleMatchToggle = (matchId) => {
        const expandedMatchIds = new Set(this.state.expandedMatchIds);
        if (expandedMatchIds.has(matchId)) {
            expandedMatchIds.delete(matchId);
            const expandedMatchGames = { ...this.state.expandedMatchGames };
            delete expandedMatchGames[matchId];
            const expandedMatchLoading = { ...this.state.expandedMatchLoading };
            delete expandedMatchLoading[matchId];
            this.setState({ expandedMatchIds, expandedMatchGames, expandedMatchLoading });
        } else {
            expandedMatchIds.add(matchId);
            const expandedMatchLoading = { ...this.state.expandedMatchLoading, [matchId]: true };
            this.setState({ expandedMatchIds, expandedMatchLoading }, () => {
                this.fetchMatchGames(matchId);
            });
        }
    };

    fetchMatchGames = async (matchId) => {
        try {
            const response = await fetch(`https://us-central1-bingo-db-57e75.cloudfunctions.net/api/matches/${matchId}`);
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            const data = await response.json();
            const gameIds = data.match.games.arrayValue.values || [];
            const games = [];

            for (var gameId of gameIds) {
                const gameResponse = await fetch(`https://us-central1-bingo-db-57e75.cloudfunctions.net/api/games/${gameId.stringValue}`);
                if (!gameResponse.ok) {
                    throw new Error(`API error: ${gameResponse.status}`);
                }
                const gameData = await gameResponse.json();
                games.push({ ...gameId, info: gameData.game });
            }

            const expandedMatchGames = { ...this.state.expandedMatchGames, [matchId]: games };
            const expandedMatchLoading = { ...this.state.expandedMatchLoading, [matchId]: false };
            this.setState({ expandedMatchGames, expandedMatchLoading });
        } catch (error) {
            console.error('Error fetching match games:', error);
            const expandedMatchLoading = { ...this.state.expandedMatchLoading, [matchId]: false };
            this.setState({
                expandedMatchLoading,
                error: error.message
            });
        }
    };

    renderPagination = () => {
        const { page, total, loading } = this.state;
        const totalPages = Math.ceil(total / 10);
        if (totalPages === 0) return null;

        return (
            <div className="flex items-center justify-between my-8">
                <button
                    onClick={this.handlePrev}
                    disabled={page === 0 || loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white font-medium
                               disabled:opacity-30 disabled:cursor-not-allowed
                               hover:bg-gray-700 hover:border-gray-500 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                </button>
                <div>
                    <span className="text-gray-400 text-sm">Page</span>
                    <input
                        type="text"
                        inputMode="numeric"
                        value={this.state.pageInput}
                        onChange={this.handlePageInputChange}
                        onKeyPress={this.handleJumpToPage}
                        className="mx-2 w-12 px-2 py-1 rounded bg-gray-900"
                        disabled={loading}
                    />
                    <span className="text-gray-400 text-sm">of {totalPages}</span>
                </div>
                <button
                    onClick={this.handleNext}
                    disabled={page >= totalPages - 1 || loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white font-medium
                               disabled:opacity-30 disabled:cursor-not-allowed
                               hover:bg-gray-700 hover:border-gray-500 transition-colors"
                >
                    Next
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        );
    }

    render() {
        const { matches, total, loading, error, currentIndex, expandedMatchIds, expandedMatchGames, expandedMatchLoading } = this.state;

        return (
            <div className="flex-grow">
                <div className="w-full h-32 overflow-hidden">
                    <img
                        src={IMAGES[currentIndex]}
                        alt="Bingo Board Banner"
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="p-6 max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold text-white mb-8" style={{ fontFamily: 'RainWorldRodondo', fontSize: '48px' }}>All Matches ({total})</h1>

                    {loading ? (
                        <div className="flex items-center justify-center py-24">
                            <p className="text-white text-xl">Loading matches...</p>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center py-24">
                            <p className="text-red-400 text-xl">Error loading matches</p>
                        </div>
                    ) : matches.length === 0 ? (
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                            <p className="text-gray-400">No matches found.</p>
                        </div>
                    ) : (
                        <div>
                            {this.renderPagination()}
                            <div className="flex flex-col gap-6">
                                {matches.map((match, index) => {
                                    const matchId = this.getGameValue(match, 'id');
                                    const isExpanded = expandedMatchIds.has(matchId);
                                    const playerNames = this.getGameValue(match, 'playerNames') || [];
                                    const playerNameStrings = playerNames.map(p => p.stringValue || '').sort((a, b) => a.localeCompare(b)).join(' & ');
                                    const createdAt = this.getGameValue(match, 'createdAt');
                                    const matchGames = expandedMatchGames[matchId] || [];
                                    const isLoading = expandedMatchLoading[matchId] || false;
                                    const winningTeam = this.getGameValue(match, 'winnerTeam');

                                    return (
                                        <div key={index}>
                                            <div
                                                onClick={() => this.handleMatchToggle(matchId)}
                                                className="bg-gray-800 border border-gray-700 rounded-lg p-6 cursor-pointer hover:bg-[#2b3646] transition-colors duration-200"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <p className="text-2xl font-bold text-white">{playerNameStrings || 'Unknown'}</p>
                                                        <p className="text-sm text-gray-400">{this.formatDate(createdAt)}</p>
                                                    </div>
                                                    <div className="ml-auto my-auto text-right">
                                                        <p>
                                                            {CHARACTER_TO_NAME.get(this.getGameValue(match, 'boardId').split(':')[0])} game <span className="mx-4">•</span> {winningTeam && (
                                                                winningTeam === "null" ?
                                                                    <span className="px-2 py-0.5 rounded bg-gray-400 text-gray-900 font-semibold">UNFINISHED</span> :
                                                                    <span style={{ "backgroundColor": teamColors[winningTeam] }} className={`px-2 py-0.5 rounded text-white font-semibold`}>{getTeamName(winningTeam)} win</span>
                                                                )}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="bg-gray-900 border border-t-0 border-gray-700 rounded-lg p-4">
                                                    {isLoading ? (
                                                        <div className="flex flex-col gap-4">
                                                            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 animate-pulse">
                                                                <div className="flex justify-between items-start">
                                                                    <div className="flex-1">
                                                                        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                                                                        <div className="h-3 bg-gray-700 rounded w-1/2 mb-3"></div>
                                                                        <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                                                                    </div>
                                                                    <div className="h-8 w-8 bg-gray-700 rounded ml-4 flex-shrink-0"></div>
                                                                </div>
                                                            </div>
                                                            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 animate-pulse">
                                                                <div className="flex justify-between items-start">
                                                                    <div className="flex-1">
                                                                        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                                                                        <div className="h-3 bg-gray-700 rounded w-1/2 mb-3"></div>
                                                                        <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                                                                    </div>
                                                                    <div className="h-8 w-8 bg-gray-700 rounded ml-4 flex-shrink-0"></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : matchGames.length === 0 ? (
                                                        <div className="text-gray-400">
                                                            <p>No games in this match.</p>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col">
                                                            {this.renderTeamGames(matchGames)}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            {this.renderPagination()}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default AllMatches;
