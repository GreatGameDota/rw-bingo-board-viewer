
var wins = new Map();
var players = new Map();

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

function parseState(stateStr) {
    const cells = stateStr.split("<>");
    if (cells.length !== 25)
        throw new Error(`Invalid board state: expected 25 cells, got ${cells.length}`);
    return cells.map(cell => ({ hasOne: cell.includes("1"), hasTwo: cell.includes("2") }));
}

function checkWin(grid) {
    for (const line of BINGO_LINES) {
        if (line.every(i => grid[i].hasOne)) {
            return {
                winner: "bingo",
                winningLine: line,
                score: grid.filter(c => c.hasOne).length,
                threshold: null,
                bothFailed: 0,
            };
        }
    }

    const score = grid.filter(c => c.hasOne).length;
    const bothFailed = grid.filter(c => c.hasTwo).length;
    const threshold = 13 - bothFailed;

    if (score >= threshold) {
        return { winner: "majority", score, threshold, bothFailed, winningLine: null };
    }

    return { winner: null, score, threshold, bothFailed, winningLine: null };
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
    const firstSemi = boardString.indexOf(";");
    const secondSemi = boardString.indexOf(";", firstSemi + 1);
    const seed = boardString.slice(0, secondSemi);
    const challengeHash = hashString(extractChallengeNames(boardString).join("|"));
    return `${seed}:${challengeHash}`;
}

function parseMessage(raw) {
    const parts = raw.split(";;");
    if (parts.length < 4) throw new Error("Invalid message");
    const boardString = parts[0];
    const boardState = parts[1];
    const playerName = parts[2];
    const teamNumber = parseInt(parts[3], 10);
    const gameId = deriveGameId(boardString);
    const playerKey = `${gameId}|${playerName}`;
    return { gameId, playerKey, boardString, boardState, playerName, teamNumber };
}

async function processMessage(raw) {
    let parsed;
    try { parsed = parseMessage(raw); }
    catch (e) { return { saved: false, record: null, player: null, reason: `Parse error: ${e.message}` }; }

    const { gameId, playerKey, boardString, boardState, playerName, teamNumber } = parsed;
    const gameOver = wins.has(gameId);
    const player = {
        playerKey, gameId, playerName, teamNumber,
        lastBoardState: boardState,
        boardString,
        lastSeen: new Date().toISOString(),
    };

    if (gameOver && !players.has(playerKey)) {
        players.set(playerKey, player);
        try {
            const response = await fetch("https://us-central1-bingo-db-57e75.cloudfunctions.net/api/game", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    boardString: boardString,
                    boardState: boardState,
                    name: playerName,
                    team: String(teamNumber),
                }),
            });
            const result = await response.json();
            console.log(`[API] POST response: ${response.status}`, result);
        } catch (e) {
            console.error(`[API] POST error: ${e.message}`);
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

    // Check win conditions
    let grid, result;
    try { grid = parseState(boardState); result = checkWin(grid); }
    catch (e) { return { saved: false, record: null, player, reason: `State error: ${e.message}` }; }

    if (!result.winner) {
        return {
            saved: false, record: null, player,
            reason: `No win yet from "${playerName}" (score: ${result.score}/${result.threshold})`,
        };
    }

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
    try {
        const response = await fetch("https://us-central1-bingo-db-57e75.cloudfunctions.net/api/game", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                boardString: boardString,
                boardState: boardState,
                name: playerName,
                team: String(teamNumber),
            }),
        });
        const result = await response.json();
        console.log(`[API] POST response: ${response.status}`, result);
    } catch (e) {
        console.error(`[API] POST error: ${e.message}`);
    }

    return {
        saved: true, record, player,
        reason: `Game over! "${playerName}" triggered a win: ${result.winner === "bingo" ? `Bingo [${result.winningLine}]` : `Majority (${result.score}/${result.threshold})`}`,
    };
}

module.exports = { processMessage };
