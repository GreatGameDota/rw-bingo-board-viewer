import React, { Component } from 'react';
import BingoCanvas from '../components/BingoCanvas';
import { CHARACTER_TO_NAME } from '../utils/constants';
import { extractChallengeNames } from '../utils/boardUtils';
import { atlases } from '../lib/bingovista/bingovista';

class BoardRepo extends Component {
    constructor(props) {
        super(props);
        this.state = {
            boards: [],
            loading: true,
            error: null,
            selectedCharacter: 'all',
            watcherMode: 'yes',
            previewBoard: null,
            rankedBoardsOnly: 'no',
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
        for (let i = 0; i < atlases.length; i++) {
            loaders.push(loadClosure(atlases[i].img, atlases[i], loadImage));
        }
        for (let i = 0; i < atlases.length; i++) {
            loaders.push(loadClosure(atlases[i].txt, atlases[i], loadJson));
        }
        Promise.all(loaders).catch(function (e) {
            console.log("Promise.all(): failed to complete fetches. Error: " + e.message);
        });

        this.fetchBoards();
    }

    fetchBoards = async () => {
        this.setState({ loading: true, error: null });

        try {
            const response = await fetch('https://us-central1-bingo-db-57e75.cloudfunctions.net/api/matches?min=0&max=10000');
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            const matches = data.matches || [];
            const boardsByKey = new Map();

            for (const match of matches) {
                const gameRefs = match?.info?.games?.arrayValue?.values || [];
                const firstGameRef = gameRefs[0];
                const gameId = firstGameRef?.stringValue;
                if (!gameId) {
                    console.log("no game found");
                    continue;
                }
                const gameResponse = await fetch(`https://us-central1-bingo-db-57e75.cloudfunctions.net/api/games/${gameId}`);
                const gameData = await gameResponse.json();
                const game = gameData.game;
                const boardString = extractChallengeNames(game.boardString?.stringValue);
                const boardKey = match?.info?.boardId?.stringValue;

                if (!boardsByKey.has(boardKey)) {
                    const parts = boardString.split(';');
                    const rawCharacter = parts[0] || 'Unknown';
                    const character = CHARACTER_TO_NAME.get(rawCharacter) || rawCharacter;
                    const watcherMode = parts.length === 4 && parts[1] === '1';
                    boardsByKey.set(boardKey, {
                        id: boardKey,
                        boardString,
                        character,
                        watcherMode,
                        ranked: Boolean(match?.info?.ranked?.booleanValue)
                    });
                } else if (!boardsByKey.get(boardKey).ranked && Boolean(match?.info?.ranked?.booleanValue)) {
                    boardsByKey.get(boardKey).ranked = true;
                }
            }

            const boards = Array.from(boardsByKey.values());
            this.setState({ boards, loading: false, error: null });
        } catch (error) {
            console.error('Error fetching boards ', error);
            this.setState({ loading: false, error: 'Unable to load board repository.' });
        }
    };

    getGameValue = (obj, key) => {
        if (!obj) return null;
        const value = obj.info?.[key];
        if (value && typeof value === 'object' && 'stringValue' in value) return value.stringValue;
        if (value && typeof value === 'object' && 'timestampValue' in value) return value.timestampValue;
        if (value && typeof value === 'object' && 'integerValue' in value) return parseInt(value.integerValue);
        if (value && typeof value === 'object' && 'arrayValue' in value) return value.arrayValue.values;
        return value;
    };

    copyBoard = async (boardString, board = null) => {
        await navigator.clipboard.writeText(boardString);
        this.setState({ previewBoard: board ?? this.state.previewBoard });
    };

    copyRandomBoard = (filteredBoards) => {
        if (!filteredBoards.length) return;
        const randomBoard = filteredBoards[Math.floor(Math.random() * filteredBoards.length)];
        this.copyBoard(randomBoard.boardString, randomBoard);
    };

    handleCharacterFilter = (event) => {
        this.setState({ selectedCharacter: event.target.value, previewBoard: null });
    };

    handleWatcherFilter = (event) => {
        this.setState({ watcherMode: event.target.value, previewBoard: null });
    };

    handleRankedFilter = (event) => {
        this.setState({ rankedBoardsOnly: event.target.value, previewBoard: null });
    };

    render() {
        const { boards, loading, error, selectedCharacter, watcherMode, rankedBoardsOnly, previewBoard } = this.state;
        const characters = ['all', ...Array.from(CHARACTER_TO_NAME.values())];
        const filteredBoards = boards.filter((board) => {
            const characterMatch = selectedCharacter === 'all' || board.character === selectedCharacter;
            const watcherMatch = watcherMode === 'all' || (watcherMode === 'yes' ? board.watcherMode : !board.watcherMode);
            const rankedMatch = rankedBoardsOnly === 'yes' ? board.ranked : true;
            return characterMatch && watcherMatch && rankedMatch;
        });

        return (
            <div className="flex-grow">
                <div className="p-6 max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold text-white mb-8" style={{ fontFamily: 'RainWorldRodondo', fontSize: '48px' }}>
                        Board Repo
                    </h1>
                    <p className="text-gray-400 mb-8">
                        Collects unique boards from every match. Browse, filter, and copy them quickly.
                        <br />
                        Expect this to take 30+ seconds to load
                    </p>

                    <div className="mb-8 flex flex-col gap-4 rounded-lg border border-gray-700 bg-gray-800/70 p-4 md:flex-row md:items-end md:justify-between">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-gray-400" htmlFor="character-filter">Slugcat</label>
                            <select
                                id="character-filter"
                                value={selectedCharacter}
                                onChange={this.handleCharacterFilter}
                                className="rounded border border-gray-600 bg-gray-900 px-3 py-2 text-white"
                            >
                                {characters.map((character) => (
                                    <option key={character} value={character}>
                                        {character === 'all' ? 'All characters' : character}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-gray-400" htmlFor="watcher-filter">Watcher mode</label>
                            <select
                                id="watcher-filter"
                                value={watcherMode}
                                onChange={this.handleWatcherFilter}
                                className="rounded border border-gray-600 bg-gray-900 px-3 py-2 text-white"
                            >
                                <option value="yes">On</option>
                                <option value="no">Off</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-gray-400" htmlFor="ranked-filter">Ranked Only</label>
                            <select
                                id="ranked-filter"
                                value={rankedBoardsOnly}
                                onChange={this.handleRankedFilter}
                                className="rounded border border-gray-600 bg-gray-900 px-3 py-2 text-white"
                            >
                                <option value="yes">On</option>
                                <option value="no">Off</option>
                            </select>
                        </div>

                        <div className="text-sm text-gray-400">
                            <p>{filteredBoards.length} of {boards.length} boards shown</p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-24">
                            <p className="text-white text-xl">Scanning matches and boards...</p>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center py-24">
                            <p className="text-red-400 text-xl">{error}</p>
                        </div>
                    ) : filteredBoards.length === 0 ? (
                        <div className="rounded-lg border border-gray-700 bg-gray-800 p-6 text-gray-400">
                            No boards match the selected filters.
                        </div>
                    ) : (
                        <div>
                            <div className="flex flex-col items-center gap-3 mb-8">
                                <button
                                    onClick={() => this.copyRandomBoard(filteredBoards)}
                                    disabled={filteredBoards.length === 0}
                                    className="w-64 rounded border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-gray-200 transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Copy random board
                                </button>

                                {previewBoard && (
                                    <div className="w-full max-w-md rounded-lg border border-gray-700 bg-gray-900/50 p-4">
                                        <p className="mb-3 text-xl font-semibold text-white">{CHARACTER_TO_NAME.get(previewBoard.boardString.split(";")[0])}</p>
                                        <div className="mx-auto w-fit">
                                            <BingoCanvas
                                                bingoString={previewBoard.boardString}
                                                boardState={"00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000".split("<>")}
                                                team={0}
                                                size={400}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="grid gap-6 lg:grid-cols-2">
                                {filteredBoards.map((board) => (
                                    <div key={`${board.id || board.boardString}`} className="rounded-lg border border-gray-700 bg-gray-800 p-4">
                                        <div className="mb-4 flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-xl font-semibold text-white">{board.character}</p>
                                            </div>
                                            <button
                                                onClick={() => this.copyBoard(board.boardString)}
                                                className="w-28 rounded border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-gray-200 transition hover:bg-gray-700"
                                            >
                                                Copy board
                                            </button>
                                        </div>

                                        <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-3 w-fit mx-auto">
                                            <BingoCanvas
                                                bingoString={board.boardString}
                                                boardState={"00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000<>00000000000".split("<>")}
                                                team={0}
                                                size={400}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default BoardRepo;
