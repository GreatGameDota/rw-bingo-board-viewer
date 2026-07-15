import React, { Component, Fragment } from 'react';
import { atlases } from '../lib/bingovista/bingovista';
import GameCard from '../components/GameCard';
import LineGraph from '../components/LineGraph';
import { PLAYER_TO_TEAM } from '../utils/constants';

class Ranked extends Component {
    constructor(props) {
        super(props);
        this.state = {
            teams: [],
            loading: true,
            error: null,
            selectedTeam: null,
            showDrawer: false,
            drawerMatches: [],
            drawerGames: [],
            selectedMatch: null,
            drawerLoading: false,
            drawerError: null,
            matchGamesLoading: false
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

        this.fetchTeams();
    }

    fetchTeams = async () => {
        try {
            const response = await fetch('https://us-central1-bingo-db-57e75.cloudfunctions.net/api/teams');
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            const data = await response.json();
            const teams = data.teams || [];
            teams.sort((a, b) => {
                const eloA = Math.round(parseFloat(this.getGameValue(a, 'elo')));
                const eloB = Math.round(parseFloat(this.getGameValue(b, 'elo')));
                if (eloA === eloB) {
                    const gamesA = parseInt(this.getGameValue(a, 'gamesPlayed'));
                    const gamesB = parseInt(this.getGameValue(b, 'gamesPlayed'));
                    if (gamesA === 0 && gamesB === 0) {
                        const nameA = this.getGameValue(a, 'name');
                        const nameB = this.getGameValue(b, 'name');
                        return nameA.localeCompare(nameB);
                    }
                    const winsA = parseInt(this.getGameValue(a, 'wins'));
                    const winsB = parseInt(this.getGameValue(b, 'wins'));
                    if (winsA === winsB) {
                        const nameA = this.getGameValue(a, 'name');
                        const nameB = this.getGameValue(b, 'name');
                        return nameA.localeCompare(nameB);
                    }
                    return winsB - winsA;
                }
                return eloB - eloA;
            });
            this.setState({
                teams: teams,
                loading: false,
                error: null
            });
        } catch (error) {
            console.error('Error fetching teams:', error);
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
        if (v && typeof v === 'object' && 'arrayValue' in v) return v.arrayValue.values;
        return v;
    }

    handleTeamClick = (team) => {
        const teamName = this.getGameValue(team, 'name');
        this.setState({
            selectedTeam: team,
            showDrawer: true,
            drawerLoading: true,
            drawerError: null
        }, () => {
            this.fetchTeamGames(teamName);
        });
    }

    fetchTeamGames = async (teamName) => {
        try {
            const team = this.state.teams.filter(t => this.getGameValue(t, 'name') === teamName);
            const matchIds = [...this.getGameValue(team[0], 'matches') || []];
            matchIds.reverse();

            const matches = [];
            for (var matchId of matchIds) {
                const response = await fetch('https://us-central1-bingo-db-57e75.cloudfunctions.net/api/matches/' + matchId.stringValue);
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                const data = await response.json();
                const currentTeamPlayers = teamName.split(',');
                const playerNames = data.match.playerNames.arrayValue.values || [];
                const opponent = await this.extractOpponent(playerNames, currentTeamPlayers);
                const winnerNames = data.match.winnerNames.arrayValue.values || [];

                matches.push({
                    id: matchId.stringValue,
                    info: data.match,
                    gameIds: data.match.games.arrayValue.values,
                    opponent: opponent,
                    won: winnerNames.some(w => currentTeamPlayers.includes(w.stringValue))
                });
                if (this.state.showDrawer === false || this.getGameValue(this.state.selectedTeam, 'name') !== teamName) {
                    return;
                }
            }
            if (this.state.showDrawer === false || this.getGameValue(this.state.selectedTeam, 'name') !== teamName) {
                return;
            }
            this.setState({
                drawerMatches: matches,
                drawerLoading: false,
                drawerError: null,
                selectedMatch: matches.length > 0 ? 0 : null,
                drawerGames: []
            }, () => {
                if (matches.length > 0) {
                    this.fetchMatchGames(matches[0], teamName);
                }
            });
        } catch (error) {
            console.error('Error fetching team games:', error);
            this.setState({
                drawerError: error.message,
                drawerLoading: false,
                drawerMatches: []
            });
        }
    }

    fetchMatchGames = async (match, teamName) => {
        try {
            this.setState({ matchGamesLoading: true });
            const games = [];
            for (var gameId of match.gameIds) {
                const gameResponse = await fetch('https://us-central1-bingo-db-57e75.cloudfunctions.net/api/games/' + gameId.stringValue);
                if (!gameResponse.ok) {
                    throw new Error(`API error: ${gameResponse.status}`);
                }
                const gameData = await gameResponse.json();
                games.push({ ...gameId, info: gameData.game });
                if (this.state.showDrawer === false || this.getGameValue(this.state.selectedTeam, 'name') !== teamName || this.state.selectedMatch === null || this.state.drawerMatches[this.state.selectedMatch].id !== match.id) {
                    return;
                }
            }
            if (this.state.showDrawer === false || this.getGameValue(this.state.selectedTeam, 'name') !== teamName || this.state.selectedMatch === null || this.state.drawerMatches[this.state.selectedMatch].id !== match.id) {
                return;
            }
            this.setState({
                drawerGames: games,
                matchGamesLoading: false
            });
        } catch (error) {
            console.error('Error fetching match games:', error);
            this.setState({
                matchGamesLoading: false
            });
        }
    }

    extractOpponent = async (playerNames, currentTeamPlayers) => {
        try {
            const _playerNames = [];
            for (const name of playerNames) {
                if (!currentTeamPlayers.includes(name.stringValue)) {
                    _playerNames.push(name.stringValue);
                }
            }

            if (_playerNames.length > 0)
                return _playerNames.sort((a, b) => a.localeCompare(b)).join(' & ');
            return 'Unknown';
        } catch (error) {
            console.error('Error extracting opponent from players:', error);
            return 'Unknown';
        }
    }

    handleMatchSelect = (index, match) => {
        if (this.state.selectedMatch === index) return;
        this.setState({ selectedMatch: index }, () => {
            this.fetchMatchGames(match, this.getGameValue(this.state.selectedTeam, 'name'));
        });
    }

    closeDrawer = () => {
        this.setState({
            showDrawer: false,
            selectedTeam: null,
            drawerMatches: [],
            drawerGames: [],
            selectedMatch: null,
            drawerLoading: false,
            drawerError: null
        });
    }

    render() {
        const { teams, loading, error, showDrawer, selectedTeam } = this.state;
        const selectedTeamNames = selectedTeam ? (this.getGameValue(selectedTeam, 'name') || '').split(',').sort((a, b) => a.localeCompare(b)) : [];
        const selectedTeamEloValue = Math.round(parseFloat(this.getGameValue(selectedTeam, 'elo')));
        const selectedTeamWins = parseInt(this.getGameValue(selectedTeam, 'wins'));
        const selectedTeamGamesPlayed = parseInt(this.getGameValue(selectedTeam, 'gamesPlayed'));
        const selectedTeamWinRate = Math.round((selectedTeamWins / (selectedTeamGamesPlayed === 0 ? 1 : selectedTeamGamesPlayed)) * 100);
        var selectedTeamName = selectedTeamNames.length !== 0 ? PLAYER_TO_TEAM.get(selectedTeamNames[0].toLowerCase()) : null;
        for (const n of selectedTeamNames)
            if (PLAYER_TO_TEAM.get(n.toLowerCase()) !== selectedTeamName)
                selectedTeamName = null;
        var cutoffFirst = false, cutoffEnd = false;
        var matchesCard = null;
        const selectedTeamAllElo = this.getGameValue(selectedTeam, 'allElo');

        if (showDrawer && !this.state.matchGamesLoading && this.state.drawerMatches.length !== 0 && this.state.drawerGames.length !== 0) {
            const opponentNames = this.state.drawerMatches[this.state.selectedMatch]?.opponent?.split(' & ') || [];

            const currentTeamGames = [];
            const opponentGames = [];

            for (const game of this.state.drawerGames) {
                const gameTeamName = this.getGameValue(game, 'name') || '';
                if (opponentNames.includes(gameTeamName)) {
                    opponentGames.push(game);
                } else {
                    currentTeamGames.push(game);
                }
            }
            currentTeamGames.sort((a, b) => {
                const nameA = this.getGameValue(a, 'name') || '';
                const nameB = this.getGameValue(b, 'name') || '';
                return nameA.localeCompare(nameB);
            });
            opponentGames.sort((a, b) => {
                const nameA = this.getGameValue(a, 'name') || '';
                const nameB = this.getGameValue(b, 'name') || '';
                return nameA.localeCompare(nameB);
            });

            matchesCard = (
                <Fragment>
                    {currentTeamGames.length > 0 && (
                        <div>
                            <div className="flex flex-col gap-4">
                                {currentTeamGames.map((game, idx) => <GameCard key={`current-${idx}`} game={game} idx={`current-${idx}`} type="ranked" />)}
                            </div>
                        </div>
                    )}

                    {currentTeamGames.length > 0 && opponentGames.length > 0 && (
                        <div className="flex items-center gap-4 my-4 cursor-default">
                            <div className="flex-1 border-t border-gray-700" />
                            <span className="text-gray-500 font-semibold text-sm">VS</span>
                            <div className="flex-1 border-t border-gray-700" />
                        </div>
                    )}

                    {opponentGames.length > 0 && (
                        <div>
                            <div className="flex flex-col gap-4">
                                {opponentGames.map((game, idx) => <GameCard key={`opponent-${idx}`} game={game} idx={`opponent-${idx}`} type="ranked" />)}
                            </div>
                        </div>
                    )}
                </Fragment>
            );
        }

        return (
            <div className="flex-grow">
                <div className="w-full h-32 overflow-hidden">
                    <img
                        src="https://firebasestorage.googleapis.com/v0/b/bingo-db-57e75.firebasestorage.app/o/watcherthumbnailfull.png?alt=media"
                        alt="Bingo Board Banner"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="p-6 max-w-7xl mx-auto">
                    <div className="flex flex-row my-12">
                        <div className="flex flex-col justify-between">
                            <h1 className="text-4xl font-bold text-white mb-8" style={{ fontFamily: 'RainWorldRodondo', fontSize: '48px' }}>Ranked</h1>
                            <p>Official leaderboard for 2v2 ranked matches.</p>
                            <p className="mb-8">Click on a team to view their matches.</p>
                        </div>
                        <div className="flex flex-col mx-auto items-center justify-between">
                            <img
                                src="https://firebasestorage.googleapis.com/v0/b/bingo-db-57e75.firebasestorage.app/o/Bingo7_Temporal_Twist.png?alt=media"
                                alt="Bingo Board Banner"
                                className="w-[456px] h-[120px] object-cover"
                            />
                            {new Date() <= new Date(2026, 7, 18) ?
                                (<p className="rounded-md bg-gray-600 py-0.5 px-2.5 font-bold shadow-sm">Starting July 18th</p>) :
                                (<p className="rounded-md bg-green-600 py-0.5 px-2.5 font-bold shadow-sm">LIVE <span className="ml-1 text-red-600">•</span></p>)}
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-24">
                            <p className="text-white text-xl">Loading teams...</p>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center py-24">
                            <p className="text-red-400 text-xl">Error loading teams</p>
                        </div>
                    ) : teams.length === 0 ? (
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                            <p className="text-gray-400">No teams found.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6 mb-6">
                            {teams.map((team, index) => {
                                const rawName = this.getGameValue(team, 'name') || '';
                                const nameParts = rawName.split(',').sort((a, b) => a.localeCompare(b));
                                const eloValue = Math.round(parseFloat(this.getGameValue(team, 'elo')));
                                const wins = parseInt(this.getGameValue(team, 'wins'));
                                const gamesPlayed = parseInt(this.getGameValue(team, 'gamesPlayed'));
                                const winRate = Math.round((wins / (gamesPlayed === 0 ? 1 : gamesPlayed)) * 100);
                                const showCutoffFirst = !cutoffFirst && this.getGameValue(team, 'gamesPlayed') === "0";
                                const showCutoffEnd = cutoffFirst && !cutoffEnd && this.getGameValue(team, 'gamesPlayed') !== "0";
                                if (showCutoffFirst) cutoffFirst = true;
                                if (showCutoffEnd) cutoffEnd = true;
                                var teamName = PLAYER_TO_TEAM.get(nameParts[0].toLowerCase());
                                for (const n of nameParts)
                                    if (PLAYER_TO_TEAM.get(n.toLowerCase()) !== teamName)
                                        teamName = null;

                                return (
                                    <div key={index} className="relative">
                                        {(showCutoffFirst || showCutoffEnd) && <hr className="mb-6 border-t-2 border-dotted border-gray-400" />}
                                        <div
                                            onClick={() => this.handleTeamClick(team)}
                                            className="relative bg-gray-800 border border-gray-700 rounded-lg p-6 cursor-pointer hover:bg-[#2b3646] transition-colors duration-200 overflow-hidden"
                                            title={teamName ? `The ${teamName}` : ""}
                                        >
                                            {teamName &&
                                                <img
                                                    src={`https://firebasestorage.googleapis.com/v0/b/bingo-db-57e75.firebasestorage.app/o/team_icons%2FThe ${teamName}.png?alt=media`}
                                                    alt="Team Logo"
                                                    className="absolute h-[164px] z-0 -left-16 top-0 opacity-40"
                                                    style={{ translate: "0 -15%" }}
                                                />}
                                            {teamName &&
                                                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,rgba(243,176,65,0.2),transparent_40%)]"></div>}
                                            <div className="flex flex-row relative z-1">
                                                <div className="min-w-16 pl-4 mr-8">
                                                    <p style={{ fontFamily: "RainWorldRodondo", fontSize: "36px" }}>{index + 1}</p>
                                                </div>
                                                <div className="flex flex-col my-auto">
                                                    <div className="flex flex-row items-center">
                                                        {teamName &&
                                                            <img
                                                                src={`https://firebasestorage.googleapis.com/v0/b/bingo-db-57e75.firebasestorage.app/o/team_icons%2FThe ${teamName}.png?alt=media`}
                                                                alt="Team Logo"
                                                                className="w-5 h-5 mt-1 mr-2"
                                                            />}
                                                        <p className="text-2xl font-bold">
                                                            {nameParts.map((player, idx) =>
                                                                `${player}${idx === nameParts.length - 1 ? '' : ' & '}`
                                                            )}
                                                        </p>
                                                    </div>
                                                    <p>
                                                        <span
                                                            className={`text-xl font-bold
                                                            ${index === 0 ? 'bg-gradient-to-r from-yellow-500 via-yellow-50 to-yellow-500 bg-clip-text text-transparent animate-gradient bg-[length:300%_300%]' : ''}
                                                            ${index === 1 ? 'bg-gradient-to-r from-gray-500 via-gray-50 to-gray-500 bg-clip-text text-transparent animate-gradient bg-[length:300%_300%]' : ''}
                                                            ${index === 2 ? 'bg-gradient-to-r from-[#7d3b2e] via-[#c55b42] to-[#7d3b2e] bg-clip-text text-transparent animate-gradient bg-[length:300%_300%]' : ''}`}
                                                        >
                                                            {eloValue}
                                                        </span> elo • <span className="text-xl font-semibold">{winRate}</span>% winrate
                                                    </p>
                                                </div>
                                                <div className="ml-auto my-auto text-right">
                                                    <p>
                                                        {this.getGameValue(team, 'gamesPlayed')} {this.getGameValue(team, 'gamesPlayed') === "1" ? "game" : "games"} • {wins}W {this.getGameValue(team, 'losses')}L
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {showDrawer && (
                    <div className="fixed inset-0 z-40">
                        <div
                            className="absolute inset-0 bg-black bg-opacity-50 drawer-overlay"
                            onClick={this.closeDrawer}
                        />

                        <div className="absolute inset-y-0 right-0 w-full md:w-3/4 bg-gray-800 border-l border-gray-700 shadow-lg z-50 drawer-panel flex flex-col">
                            <div className="flex items-center gap-2 p-6 bg-gray-800 border-b border-gray-700 flex-shrink-0">
                                <div className="flex flex-col my-auto cursor-default">
                                    <div className="flex flex-row items-center">
                                        {selectedTeamName &&
                                            <img
                                                src={`https://firebasestorage.googleapis.com/v0/b/bingo-db-57e75.firebasestorage.app/o/team_icons%2FThe ${selectedTeamName}.png?alt=media`}
                                                alt="Team Logo"
                                                className="w-5 h-5 mt-1 mr-2"
                                                title={`The ${selectedTeamName}`}
                                            />}
                                        <h2 className="text-2xl font-bold text-white">
                                            {selectedTeamNames.map((player, idx) =>
                                                `${player}${idx === selectedTeamNames.length - 1 ? '' : ' & '}`
                                            )}
                                        </h2>
                                    </div>
                                    <p>
                                        <span className={`text-xl font-bold`}>
                                            {selectedTeamEloValue}
                                        </span> elo • <span className="text-xl font-semibold">{selectedTeamWinRate}</span>% winrate
                                        • {selectedTeamGamesPlayed} {selectedTeamGamesPlayed === "1" ? "game" : "games"} • {selectedTeamWins}W {this.getGameValue(selectedTeam, 'losses')}L
                                    </p>
                                </div>
                                <button
                                    onClick={this.closeDrawer}
                                    className="text-gray-400 hover:text-white transition-colors text-2xl md:ml-auto md:pr-4"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="border-b border-gray-700">
                                <div className="p-4 w-100 md:w-[50vw] h-[25vh] md:mx-auto">
                                    <LineGraph values={selectedTeamAllElo} />
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                                <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-700 overflow-y-auto h-[25vh] md:h-[100%]">
                                    {this.state.drawerLoading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <p className="text-white text-lg">Loading matches...</p>
                                        </div>
                                    ) : this.state.drawerError ? (
                                        <div className="flex items-center justify-center py-12">
                                            <p className="text-red-400 text-lg">Error loading matches</p>
                                        </div>
                                    ) : this.state.drawerMatches.length === 0 ? (
                                        <div className="p-6">
                                            <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                                                <p className="text-gray-300">No matches found.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col">
                                            {this.state.drawerMatches.map((match, idx) => {
                                                const isSelected = this.state.selectedMatch === idx;
                                                var selectedTeamNames = match.opponent.split(" & ");
                                                var selectedTeamName = selectedTeamNames.length !== 0 ? PLAYER_TO_TEAM.get(selectedTeamNames[0].toLowerCase()) : null;
                                                for (const n of selectedTeamNames)
                                                    if (PLAYER_TO_TEAM.get(n.toLowerCase()) !== selectedTeamName)
                                                        selectedTeamName = null;
                                                return (
                                                    <div
                                                        key={idx}
                                                        onClick={() => this.handleMatchSelect(idx, match)}
                                                        className={`p-4 flex flex-row border-b border-gray-700 cursor-pointer transition-colors ${isSelected ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                                                    >
                                                        <div>
                                                            <div className="flex flex-row items-center">
                                                                <p className="text-white font-semibold mr-2">{match.opponent || 'Unknown'}</p>
                                                                {selectedTeamName &&
                                                                    <img
                                                                        src={`https://firebasestorage.googleapis.com/v0/b/bingo-db-57e75.firebasestorage.app/o/team_icons%2FThe ${selectedTeamName}.png?alt=media`}
                                                                        alt="Team Logo"
                                                                        className="w-4 h-4 mt-[2px]"
                                                                        title={`The ${selectedTeamName}`}
                                                                    />}
                                                            </div>
                                                            <p className="text-sm text-gray-400">{this.formatDate(match.info.createdAt.timestampValue)}</p>
                                                        </div>
                                                        <p className={`ml-auto my-auto font-semibold ${match.won ? 'text-green-400' : 'text-red-400'}`}>
                                                            {match.won ? 'WON' : 'LOST'}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 overflow-y-auto p-6 bg-gray-950">
                                    {this.state.matchGamesLoading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <p className="text-white text-lg">Loading games...</p>
                                        </div>
                                    ) : this.state.drawerMatches.length === 0 ? (
                                        <div />
                                    ) : this.state.drawerGames.length === 0 ? (
                                        <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                                            <p className="text-gray-300">No games in this match.</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-4">
                                            {matchesCard}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default Ranked;
