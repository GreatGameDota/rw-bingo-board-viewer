import ReconnectingWebSocket from './ReconnectingWebSocket';

let singleton = null;

class LiveSocketService {
    constructor() {
        this._subscribers = new Set();
        this._state = {
            connected: false,
            clients: new Map()
        };

        this.socket = new ReconnectingWebSocket('wss://rw-bingo-board-viewer.onrender.com');

        this.socket.addEventListener('open', () => {
            this._state.connected = true;
            this._notify();
            this.socket.send('Spectator connected');
        });

        this.socket.addEventListener('close', () => {
            this._state.connected = false;
            this._notify();
        });

        this.socket.addEventListener('message', async (e) => {
            try {
                const text = await e.data.text();
                if (text.startsWith('Arena'))
                    return;
                const data = text.split(';;');

                const clientId = data[2];
                if (!clientId) return;

                this._state.clients.set(clientId, {
                    board: data[0],
                    state: data[1],
                    name: data[2],
                    team: data[3],
                    time: data[4]
                });
                this._notify();
            } catch (err) {
                console.error('Failed to process websocket message', err);
            }
        });
    }

    createSnapshot(state) {
        return {
            connected: state.connected,
            clients: new Map(state.clients)
        };
    }

    _notify() {
        const snap = this.createSnapshot(this._state);
        for (const fn of this._subscribers) {
            try {
                fn(snap);
            } catch (e) {
                console.error('LiveSocketService subscriber error', e);
            }
        }
    }

    subscribe(fn) {
        this._subscribers.add(fn);
        fn(this.createSnapshot(this._state));
        return () => this._subscribers.delete(fn);
    }
}

export function getLiveSocketService() {
    if (!singleton) singleton = new LiveSocketService();
    return singleton;
}
