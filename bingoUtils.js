
var wins = new Map();
var players = new Map();
var userCompletedGameIdsCache = new Map();

const BINGO_LINES = [
    // Rows
    [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
    // Columns
    [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22],
    [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
    // Diagonals
    [0, 6, 12, 18, 24], [4, 8, 12, 16, 20],
];

function checkWin(grid) {
    const activeTeams = [];
    for (let team = 0; team < 9; team++) {
        if (grid.some(c => c[team] !== "0")) {
            activeTeams.push(team);
        }
    }

    for (const line of BINGO_LINES) {
        for (const team of activeTeams) {
            if (line.every(i => grid[i][team] === "1")) {
                return {
                    winner: "bingo",
                    winningTeam: team,
                    winningLine: line,
                    score: grid.filter(c => c[team] === "1").length,
                    threshold: null,
                };
            }
        }
    }

    const allFailedCount = grid.filter(c => activeTeams.every(team => c[team] === "2")).length;
    const effectiveCells = grid.length - allFailedCount;
    const half = Math.ceil(effectiveCells / 2);

    for (const team of activeTeams) {
        const score = grid.filter(c => c[team] === "1").length;
        if (score >= half) {
            const otherTeams = activeTeams.filter(t => t !== team);
            const potentialBingoExists = otherTeams.some(other =>
                BINGO_LINES.some(line =>
                    line.every(i => grid[i][other] !== "2")
                )
            );
            if (potentialBingoExists) continue;

            return {
                winner: "majority",
                winningTeam: team,
                score,
                threshold: half,
                winningLine: null,
            };
        }
    }

    return { winner: null, winningTeam: null, winningLine: null };
}

function hashString(str) {
    let hashCode = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hashCode = (hashCode << 6) + (hashCode << 16) - hashCode + char;
    }
    return hashCode;
}

function extractChallengeNames(boardString) {
    const names = [];
    const firstMatch = boardString.match(/^[^;]+;[^;]+;([A-Za-z]+Challenge)~/);
    if (firstMatch) names.push(firstMatch[1]);
    const re = /bChG([A-Za-z]+Challenge)~/g;
    let m;
    while ((m = re.exec(boardString)) !== null) names.push(m[1]);
    return names;
}

function deriveGameId(boardString) {
    const seed = boardString.slice(0, boardString.indexOf(";"));
    const challengeHash = hashString(extractChallengeNames(boardString).join("|"));
    return `${seed}:${challengeHash}`;
}

async function getCompletedGameIdsForUser(userName) {
    const now = Date.now();
    const cached = userCompletedGameIdsCache.get(userName);
    if (cached && cached.expires > now) return cached;

    let apiCompletedIds;
    let apiIds;
    try {
        const response = await fetch(`https://us-central1-bingo-db-57e75.cloudfunctions.net/api/games/user/${encodeURIComponent(userName)}`);
        if (!response.ok) return { apiCompletedIds: new Set(), apiIds: new Map(), expires: now };

        const data = await response.json();
        const games = data.games || [];
        apiCompletedIds = new Set();
        apiIds = new Map();
        for (const game of games) {
            if (!game.info) continue;

            const boardString = game.info.boardString.stringValue;
            const derivedId = deriveGameId(boardString);
            apiCompletedIds.add(derivedId);

            apiIds.set(derivedId, game.info.id.stringValue);
        }
        const cachedValue = { apiCompletedIds, apiIds, expires: now + 60000 };
        userCompletedGameIdsCache.set(userName, cachedValue);
        return cachedValue;
    } catch (e) {
        console.error(`getCompletedGameIdsForUser ${e.message}`);
        const fallback = { apiCompletedIds: new Set(), apiIds: new Map(), expires: now + 10000 };
        userCompletedGameIdsCache.set(userName, fallback);
        return fallback;
    }
}

function parseMessage(raw) {
    const parts = raw.split(";;");
    if (parts.length < 4) throw new Error("Invalid message");
    const boardString = parts[0];
    const boardState = parts[1];
    const playerName = parts[2];
    const teamNumber = parseInt(parts[3]);
    const time = parts[4];
    const completedGoals = parseInt(parts[5]);
    const gameId = deriveGameId(boardString);
    const playerKey = `${gameId}|${playerName}`;
    return { gameId, playerKey, boardString, boardState, playerName, teamNumber, time, completedGoals };
}

async function processMessage(raw) {
    let parsed;
    try { parsed = parseMessage(raw); }
    catch (e) { return { saved: false, record: null, player: null, reason: `Parse error: ${e.message}` }; }

    const { gameId, playerKey, boardString, boardState, playerName, teamNumber, time, completedGoals } = parsed;
    const player = {
        playerKey, gameId, playerName, teamNumber,
        lastBoardState: boardState,
        boardString,
        lastSeen: new Date().toISOString(),
    };

    // Check win conditions
    let result;
    try {
        result = checkWin(boardState.split("<>"));
    }
    catch (e) {
        return { saved: false, record: null, player, reason: `State error: ${e.message}` };
    }

    if (!result.winner || boardState.split("<>").length !== 25) {
        return {
            saved: false, record: null, player,
            reason: `No win yet from "${playerName}" (score: ${result.score}/${result.threshold})`,
        };
    }

    const { apiCompletedIds, apiIds } = await getCompletedGameIdsForUser(playerName);

    let gameOver = wins.has(gameId);

    if (!gameOver && apiCompletedIds.has(gameId)) {
        const existingId = apiIds.get(gameId);
        if (existingId) {
            try {
                const response = await fetch(`https://us-central1-bingo-db-57e75.cloudfunctions.net/api/games/${existingId}`);
                if (response.ok) {
                    const data = await response.json();
                    const game = data.game;

                    const existingBoardString = game.boardString.stringValue;
                    const existingBoardState = game.boardState.stringValue;
                    const name = game.name.stringValue;
                    const rawTeam = game.team.stringValue;
                    const existingTeamNumber = parseInt(String(rawTeam));
                    const createdAt = new Date().toISOString();

                    const apiRecord = {
                        gameId,
                        boardString: existingBoardString,
                        boardState: existingBoardState,
                        playerName: name,
                        teamNumber: existingTeamNumber,
                        winner: null,
                        winningLine: null,
                        score: null,
                        threshold: null,
                        bothFailed: undefined,
                        timestamp: createdAt,
                    };

                    wins.set(gameId, apiRecord);
                    gameOver = true;
                }
            } catch (e) {
                console.error(`error for gameId ${gameId} ${existingId}: ${e.message}`);
            }
        }
    }

    if (gameOver && !players.has(playerKey)) {
        players.set(playerKey, player);
        if (teamNumber !== 8) {
            try {
                const response = await fetch("https://us-central1-bingo-db-57e75.cloudfunctions.net/api/game", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        boardString: boardString,
                        boardState: boardState,
                        name: playerName,
                        team: String(teamNumber),
                        winningTeam: String(result.winningTeam),
                        time: time,
                        completedGoals: String(completedGoals),
                    }),
                });
                const res = await response.json();
                console.log(`[API] POST response: ${response.status}`, res);
            } catch (e) {
                console.error(`[API] POST error: ${e.message}`);
            }
        }
        return {
            saved: true,
            record: wins.get(gameId),
            player,
            reason: `Game already won by "${wins.get(gameId).playerName}", saved final snapshot for "${playerName}"`,
        };
    }
    if (gameOver)
        return {
            saved: false, record: wins.get(gameId), player,
            reason: `Game already won by "${wins.get(gameId).playerName}", ignoring update from "${playerName}"`,
        };

    const record = {
        gameId, boardString, boardState,
        playerName, teamNumber,
        winner: result.winner,
        winningLine: result.winningLine ?? null,
        score: result.score,
        threshold: result.threshold ?? null,
        bothFailed: result.bothFailed,
        timestamp: new Date().toISOString(),
    };
    wins.set(gameId, record);
    players.set(playerKey, player);

    if (teamNumber !== 8) {
        try {
            const response = await fetch("https://us-central1-bingo-db-57e75.cloudfunctions.net/api/game", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    boardString: boardString,
                    boardState: boardState,
                    name: playerName,
                    team: String(teamNumber),
                    winningTeam: String(result.winningTeam),
                    time: time,
                    completedGoals: String(completedGoals),
                }),
            });
            const res = await response.json();
            console.log(`[API] POST response: ${response.status}`, res);
        } catch (e) {
            console.error(`[API] POST error: ${e.message}`);
        }
    }

    return {
        saved: true, record, player,
        reason: `Game over! "${playerName}" triggered a win: ${result.winner === "bingo" ? `Bingo [${result.winningLine}]` : `Majority (${result.score}/${result.threshold})`}`,
    };
}

module.exports = { processMessage };
