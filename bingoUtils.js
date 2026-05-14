
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
                    line.every(i =>
                        grid[i][other] !== "2" &&
                        (grid[i][other] === "1" || activeTeams.every(t => t === other || grid[i][t] !== "1"))
                    )
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
    var firstMatch;
    if (boardString.split(";").length === 4)
        firstMatch = boardString.match(/^[^;]+;[^;]+;[^;]+;([A-Za-z]+Challenge)~/);
    else if (boardString.split(";").length === 3)
        firstMatch = boardString.match(/^[^;]+;[^;]+;([A-Za-z]+Challenge)~/);
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

async function calcElo(match, token) {
    const isRanked = match.info.ranked2?.booleanValue;

    if (!isRanked && !match.info.ranked?.booleanValue) {
        const games = match.info.games?.arrayValue?.values || [];

        const allPlayers = [];
        let winningTeam = null;

        for (const gameRef of games) {
            const gameId = gameRef.stringValue;
            const gameResponse = await fetch(`https://us-central1-bingo-db-57e75.cloudfunctions.net/api/games/${gameId}`);
            const gameData = await gameResponse.json();

            const playerName = gameData.game.name?.stringValue;
            const team = gameData.game.team?.stringValue;
            const gameWinningTeam = gameData.game.winningTeam?.stringValue;

            allPlayers.push({ name: playerName, team });

            if (!winningTeam) {
                winningTeam = gameWinningTeam;
            }
        }

        const winners = allPlayers.filter(p => p.team === winningTeam).map(p => p.name);
        const losers = allPlayers.filter(p => p.team !== winningTeam).map(p => p.name);
        if (winners.length !== 2 || losers.length !== 2) {
            console.log(`Match ${match.info.id.stringValue} has no clear winning team. Skipping...`);
            return;
        }

        var response = await fetch(`https://us-central1-bingo-db-57e75.cloudfunctions.net/api/teams2/name/${winners.sort().join(",")}`);
        var team1 = (await response.json()).teams[0];
        if (!team1) {
            response = await fetch("https://us-central1-bingo-db-57e75.cloudfunctions.net/api/team2", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: winners.sort().join(","),
                }),
            });
            const res = await response.json();
            team1 = { info: { id: { stringValue: res.id } } };
        }

        response = await fetch(`https://us-central1-bingo-db-57e75.cloudfunctions.net/api/teams2/name/${losers.sort().join(",")}`);
        var team2 = (await response.json()).teams[0];
        if (!team2) {
            response = await fetch("https://us-central1-bingo-db-57e75.cloudfunctions.net/api/team2", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: losers.sort().join(","),
                }),
            });
            const res = await response.json();
            team2 = { info: { id: { stringValue: res.id } } };
        }

        const winK = parseInt(team1.info.gamesPlayed?.integerValue || 0) < 2 ? 80 : 32;
        const loseK = parseInt(team2.info.gamesPlayed?.integerValue || 0) < 2 ? 80 : 32;

        const expectedWin = 1 / (1 + Math.pow(10, (parseFloat(team2.info.elo?.stringValue || 1200) - parseFloat(team1.info.elo?.stringValue || 1200)) / 400));

        var elo1 = parseFloat(team1.info.elo?.stringValue || 1200) + winK * (1 - expectedWin);
        var elo2 = parseFloat(team2.info.elo?.stringValue || 1200) + loseK * (0 - (1 - expectedWin));

        response = await fetch(`https://us-central1-bingo-db-57e75.cloudfunctions.net/api/team22/${team1.info.id.stringValue}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({
                name: winners.sort().join(","),
                gamesPlayed: parseInt(team1.info.gamesPlayed?.integerValue || 0) + 1,
                wins: parseInt(team1.info.wins?.integerValue || 0) + 1,
                elo: String(elo1),
                eloChange: String(winK * (1 - expectedWin)),
                matchId: match.info.id.stringValue,
            }),
        });
        var res = await response.json();

        response = await fetch(`https://us-central1-bingo-db-57e75.cloudfunctions.net/api/team22/${team2.info.id.stringValue}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({
                name: losers.sort().join(","),
                gamesPlayed: parseInt(team2.info.gamesPlayed?.integerValue || 0) + 1,
                losses: parseInt(team2.info.losses?.integerValue || 0) + 1,
                elo: String(elo2),
                eloChange: String(loseK * (0 - (1 - expectedWin))),
                matchId: match.info.id.stringValue,
            }),
        });
        var res = await response.json();

        await fetch(`https://us-central1-bingo-db-57e75.cloudfunctions.net/api/match/${match.info.id.stringValue}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({
                boardId: match.info.boardId.stringValue,
                ranked2: match.info.games.arrayValue.values.length === 4,
            }),
        });
    }
}

async function saveGame(gameId, won, token) {
    var response = await fetch(`https://us-central1-bingo-db-57e75.cloudfunctions.net/api/games/${gameId}`);
    const game = { info: (await response.json()).game };

    // Create or update user with name and gameId
    response = await fetch(`https://us-central1-bingo-db-57e75.cloudfunctions.net/api/users/name/${game.info.name.stringValue}`);
    var user = (await response.json()).users[0];
    if (!user) {
        response = await fetch("https://us-central1-bingo-db-57e75.cloudfunctions.net/api/user", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({
                name: game.info.name.stringValue,
            }),
        });
        const res = await response.json();
        user = { info: { id: { stringValue: res.id } } };
    }
    response = await fetch(`https://us-central1-bingo-db-57e75.cloudfunctions.net/api/user/${user.info.id.stringValue}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
            name: game.info.name.stringValue,
            gameId: game.info.id.stringValue,
        }),
    });
    var res = await response.json();

    // Create or update match with boardId, gameId and playerId
    var boardId = deriveGameId(game.info.boardString.stringValue);
    response = await fetch(`https://us-central1-bingo-db-57e75.cloudfunctions.net/api/matches/board/${boardId}`);
    var match = (await response.json()).matches[0];
    var body = {
        playerId: user.info.id.stringValue,
        playerName: game.info.name.stringValue,
        gameId: game.info.id.stringValue,
        boardId: boardId,
    };
    if (won) body.winnerName = game.info.name.stringValue;
    if (!match) {
        response = await fetch("https://us-central1-bingo-db-57e75.cloudfunctions.net/api/match", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(body),
        });
        const res = await response.json();
        match = { info: { id: { stringValue: res.id } } };
    }
    else {
        response = await fetch(`https://us-central1-bingo-db-57e75.cloudfunctions.net/api/match/${match.info.id.stringValue}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify(body),
        });
        const res = await response.json();
    }

    // Set match ranked if it has 4 games
    // response = await fetch(`https://us-central1-bingo-db-57e75.cloudfunctions.net/api/admin/rankedTime`);
    // var rankedTime = new Date((await response.json()).rankedTime.rankedTime.timestampValue);

    response = await fetch(`https://us-central1-bingo-db-57e75.cloudfunctions.net/api/matches/${match.info.id.stringValue}`);
    match = { info: (await response.json()).match };
    // await fetch(`https://us-central1-bingo-db-57e75.cloudfunctions.net/api/match/${match.info.id.stringValue}`, {
    //     method: "PATCH",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({
    //         boardId: match.info.boardId.stringValue,
    //         ranked: match.info.games.arrayValue.values.length === 4 && new Date(match.info.createdAt.timestampValue) <= rankedTime,
    //     }),
    // });
    // match.info.ranked = {};
    // match.info.ranked.booleanValue = match.info.games.arrayValue.values.length === 4 && new Date(match.info.createdAt.timestampValue) <= rankedTime;

    // Add matchId to user
    response = await fetch(`https://us-central1-bingo-db-57e75.cloudfunctions.net/api/user/${user.info.id.stringValue}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
            name: game.info.name.stringValue,
            matchId: match.info.id.stringValue,
        }),
    });
    res = await response.json();

    // Add matchId to game
    response = await fetch(`https://us-central1-bingo-db-57e75.cloudfunctions.net/api/game/${game.info.id.stringValue}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
            name: game.info.name.stringValue,
            matchId: match.info.id.stringValue,
        }),
    });
    res = await response.json();

    await calcElo(match, token);
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
    const deaths = parts[6] ?? "";
    const gameId = deriveGameId(boardString);
    const playerKey = `${gameId}|${playerName}`;
    return { gameId, playerKey, boardString, boardState, playerName, teamNumber, time, completedGoals, deaths };
}

async function processMessage(raw) {
    let parsed;
    try { parsed = parseMessage(raw); }
    catch (e) { return { saved: false, record: null, player: null, reason: `Parse error: ${e.message}` }; }

    const { gameId, playerKey, boardString, boardState, playerName, teamNumber, time, completedGoals, deaths } = parsed;
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

    if (gameOver && !players.has(playerKey) && !apiCompletedIds.has(gameId)) {
        players.set(playerKey, player);
        if (teamNumber !== 8) {
            try {
                var response = await fetch("https://us-central1-bingo-db-57e75.cloudfunctions.net/api/admin/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: process.env.ADMIN_EMAIL,
                        password: process.env.ADMIN_PASSWORD,
                    }),
                });
                if (!response.ok) throw new Error(`Login failed with status ${response.status}`);
                const data = await response.json();
                const token = data.refreshToken;

                response = await fetch("https://us-central1-bingo-db-57e75.cloudfunctions.net/api/game", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify({
                        boardString: boardString,
                        boardState: boardState,
                        name: playerName,
                        team: String(teamNumber),
                        winningTeam: String(result.winningTeam),
                        time: time,
                        completedGoals: String(completedGoals),
                        deaths: deaths,
                    }),
                });
                const res = await response.json();
                console.log(`[API] POST response: ${response.status}`, res);
                await saveGame(res.id, teamNumber === result.winningTeam, token);
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
            var response = await fetch("https://us-central1-bingo-db-57e75.cloudfunctions.net/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: process.env.ADMIN_EMAIL,
                    password: process.env.ADMIN_PASSWORD,
                }),
            });
            if (!response.ok) throw new Error(`Login failed with status ${response.status}`);
            const data = await response.json();
            const token = data.refreshToken;

            response = await fetch("https://us-central1-bingo-db-57e75.cloudfunctions.net/api/game", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({
                    boardString: boardString,
                    boardState: boardState,
                    name: playerName,
                    team: String(teamNumber),
                    winningTeam: String(result.winningTeam),
                    time: time,
                    completedGoals: String(completedGoals),
                    deaths: deaths,
                }),
            });
            const res = await response.json();
            console.log(`[API] POST response: ${response.status}`, res);
            await saveGame(res.id, teamNumber === result.winningTeam, token);
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
