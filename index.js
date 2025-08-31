const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
    port: process.env.PORT || 8080,
    httpPort: 3000,
    logToFile: false,
    logDirectory: './game_logs',
    maxLogFiles: 100,
    clientTimeout: 30000 // 30 seconds
};

// Create Express app for HTTP endpoints and dashboard
const app = express();
// const srcPath = "src/lib/bingovista";
// const staticPath = "src/lib/bingovista";
// const htmlPath = "/bingovista.html";
const srcPath = "build";
// const staticPath = "build";
const htmlPath = "/index.html";
const buildPath = path.join(__dirname, srcPath);
if (fs.existsSync(buildPath))
    app.use(express.static(buildPath));
app.use(cors());
app.use(express.json());
// app.use(express.static(staticPath));

// Game data storage
let gameData = {
    sessions: new Map(),
    currentPlayers: new Map(),
    gameStats: {
        totalConnections: 0,
        activeConnections: 0,
        messagesReceived: 0,
        lastUpdate: null
    },
    recentEvents: []
};

// Ensure log directory exists
if (config.logToFile && !fs.existsSync(config.logDirectory)) {
    fs.mkdirSync(config.logDirectory, { recursive: true });
}

// Utility functions
function generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function logMessage(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        level,
        message,
        data
    };

    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);

    if (config.logToFile) {
        const logFile = path.join(config.logDirectory, `game_data_${new Date().toISOString().split('T')[0]}.log`);
        fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
    }
}

function cleanOldLogs() {
    if (!config.logToFile) return;

    try {
        const files = fs.readdirSync(config.logDirectory)
            .filter(file => file.startsWith('game_data_') && file.endsWith('.log'))
            .sort()
            .reverse();

        if (files.length > config.maxLogFiles) {
            const filesToDelete = files.slice(config.maxLogFiles);
            filesToDelete.forEach(file => {
                fs.unlinkSync(path.join(config.logDirectory, file));
                logMessage('info', `Deleted old log file: ${file}`);
            });
        }
    } catch (error) {
        logMessage('error', 'Error cleaning old logs:', error.message);
    }
}

// WebSocket Server
const wss = new WebSocket.Server({
    port: config.port,
    clientTracking: true
});

wss.on('connection', (ws, req) => {
    const sessionId = generateSessionId();
    const clientIP = req.socket.remoteAddress;

    // Initialize session
    gameData.sessions.set(sessionId, {
        id: sessionId,
        ip: clientIP,
        connectedAt: new Date(),
        lastSeen: new Date(),
        messagesReceived: 0,
        playerData: null,
        gameState: null
    });

    gameData.gameStats.totalConnections++;
    gameData.gameStats.activeConnections++;

    logMessage('info', `New client connected: ${sessionId} from ${clientIP}`);

    // Set up heartbeat
    ws.isAlive = true;
    ws.sessionId = sessionId;

    ws.on('pong', () => {
        ws.isAlive = true;
        if (gameData.sessions.has(sessionId)) {
            gameData.sessions.get(sessionId).lastSeen = new Date();
        }
    });

    ws.on('message', (message) => {
        try {
            // const data = JSON.parse(message);
            handleGameData(sessionId, message, ws);
        } catch (error) {
            logMessage('error', `Invalid JSON from client ${sessionId}:`, error.message);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Invalid JSON format'
            }));
        }
    });

    ws.on('close', () => {
        logMessage('info', `Client disconnected: ${sessionId}`);
        gameData.sessions.delete(sessionId);
        gameData.currentPlayers.delete(sessionId);
        gameData.gameStats.activeConnections = Math.max(0, gameData.gameStats.activeConnections - 1);
    });

    ws.on('error', (error) => {
        logMessage('error', `WebSocket error for client ${sessionId}:`, error.message);
    });

    // Send welcome message
    ws.send(JSON.stringify({
        type: 'welcome',
        sessionId: sessionId,
        message: 'Connected to game data server'
    }));
});

// Handle incoming game data
function handleGameData(sessionId, data, ws) {
    const session = gameData.sessions.get(sessionId);
    if (!session) return;

    session.messagesReceived++;
    session.lastSeen = new Date();
    gameData.gameStats.messagesReceived++;
    gameData.gameStats.lastUpdate = new Date();

    handleCustomData(sessionId, data);

    logMessage('debug', `Received data from ${sessionId}`, data);
}

function handleCustomData(sessionId, customData) {
    // Handle any custom data sent by the mod
    logMessage('debug', `Custom data from ${sessionId}: ${customData}`, customData);
}

app.get("/favicon.ico", (req, res) => {
    const faviconPath = path.join(__dirname, srcPath + "/favicon.ico");
    if (fs.existsSync(faviconPath))
        res.sendFile(faviconPath);
    else
        res.status(204).end();
})

app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, srcPath + htmlPath);
    if (fs.existsSync(indexPath))
        res.sendFile(indexPath);
    else
        res.status(404).send("React app not found.");
});

// Heartbeat to detect broken connections
const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (!ws.isAlive) {
            logMessage('info', `Terminating dead connection: ${ws.sessionId}`);
            return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping();
    });
}, config.clientTimeout);

// Clean up old logs daily
setInterval(cleanOldLogs, 24 * 60 * 60 * 1000);
setInterval(() => logMessage("info", "keep alive"), 1000 * 60);

// Start servers
wss.on('listening', () => {
    logMessage('info', `WebSocket server listening on port ${config.port}`);
});

// app.listen(config.httpPort, () => {
//     logMessage('info', `HTTP server listening on port ${config.httpPort}`);
//     logMessage('info', `Dashboard available at http://localhost:${config.httpPort}`);
// });

// Graceful shutdown
process.on('SIGTERM', () => {
    logMessage('info', 'Received SIGTERM, shutting down gracefully');
    clearInterval(heartbeatInterval);
    wss.close(() => {
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logMessage('info', 'Received SIGINT, shutting down gracefully');
    clearInterval(heartbeatInterval);
    wss.close(() => {
        process.exit(0);
    });
});
