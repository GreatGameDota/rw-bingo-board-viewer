const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
    port: process.env.PORT || 8080,
    httpPort: 3000,
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
    gameStats: {
        totalConnections: 0,
        activeConnections: 0,
        messagesReceived: 0,
        lastUpdate: null
    },
};

// Utility functions
function generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

function logMessage(level, message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
}

// WebSocket Server
const wss = new WebSocket.Server({
    port: config.port,
    clientTracking: true
});

var clients = new Map();

wss.on('connection', (ws, req) => {
    const sessionId = generateSessionId();
    const clientIP = req.socket.remoteAddress;
    clients.set(ws, { id: sessionId, ip: clientIP, spectator: false });

    gameData.gameStats.totalConnections++;
    gameData.gameStats.activeConnections++;

    logMessage('info', `New client connected: ${sessionId} from ${clientIP}`);

    // Set up heartbeat
    ws.isAlive = true;
    ws.sessionId = sessionId;

    ws.on('pong', () => {
        ws.isAlive = true;
    });

    ws.on('message', (message) => {
        try {
            var client = clients.get(ws);
            if (message.toString().startsWith("Spectator")) {
                client.spectator = true;
            }

            handleGameData(sessionId, message, ws);

            if (!message.toString().startsWith("Spectator")) {
                wss.clients.forEach((c) => {
                    var _client = clients.get(c);
                    if (_client !== client && _client.spectator) {
                        c.send(message);
                    }
                });
            }
        } catch (error) {
            logMessage('error', `Invalid JSON from client ${sessionId}: ${error.message}`);
        }
    });

    ws.on('close', () => {
        logMessage('info', `Client disconnected: ${sessionId}`);
        gameData.gameStats.activeConnections = Math.max(0, gameData.gameStats.activeConnections - 1);
        clients.delete(ws);
    });

    ws.on('error', (error) => {
        logMessage('error', `WebSocket error for client ${sessionId}: ${error.message}`);
        gameData.gameStats.activeConnections = Math.max(0, gameData.gameStats.activeConnections - 1);
        clients.delete(ws);
    });

    // Send welcome message
    // ws.send(JSON.stringify({
    //     type: 'welcome',
    //     sessionId: sessionId,
    //     message: 'Connected to game data server'
    // }));
});

// Handle incoming game data
function handleGameData(sessionId, data, ws) {
    gameData.gameStats.messagesReceived++;
    gameData.gameStats.lastUpdate = new Date();

    logMessage('debug', `Custom data from ${sessionId}: ${data}`);
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
