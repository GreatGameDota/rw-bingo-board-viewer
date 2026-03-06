
class ReconnectingWebSocket {
    constructor(url) {
        this.url = url;
        this.ws = null;

        this.reconnectAttempts = 0;
        this.baseDelayMs = 3000;
        this.shouldReconnect = true;

        this._listeners = {
            open: new Set(),
            message: new Set(),
            close: new Set(),
            error: new Set()
        };

        this.connect();
    }

    addEventListener(type, fn) {
        const set = this._listeners[type];
        if (!set) throw new Error(`Unknown event type: ${type}`);
        set.add(fn);
        return () => this.removeEventListener(type, fn);
    }

    removeEventListener(type, fn) {
        const set = this._listeners[type];
        if (!set) return;
        set.delete(fn);
    }

    _emit(type, arg) {
        const set = this._listeners[type];
        if (set) {
            for (const fn of set) {
                try {
                    fn(arg);
                } catch (e) {
                    console.error(`WebSocket listener error (${type})`, e);
                }
            }
        }
    }

    connect() {
        if (!this.shouldReconnect) return;
        try {
            this.ws = new WebSocket(this.url);

            this.ws.onopen = (e) => {
                this.reconnectAttempts = 0;
                this._emit('open', e);
            };

            this.ws.onmessage = (e) => {
                this._emit('message', e);
            };

            this.ws.onclose = (e) => {
                this._emit('close', e);
                this._attemptReconnect();
            };

            this.ws.onerror = (e) => {
                this._emit('error', e);
            };
        } catch (e) {
            this._attemptReconnect();
        }
    }

    _attemptReconnect() {
        if (!this.shouldReconnect) return;
        this.reconnectAttempts += 1;
        setTimeout(() => this.connect(), this.baseDelayMs);
    }

    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(data);
        }
    }

    close() {
        this.shouldReconnect = false;
        if (this.ws) this.ws.close();
    }
}

export default ReconnectingWebSocket;