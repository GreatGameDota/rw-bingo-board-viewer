import React, { Component } from "react";
import BingoCanvas from "./components/BingoCanvas";
import { atlases } from './lib/bingovista/bingovista';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            s: "Watcher;random;BingoDamageChallenge~System.String|Any Weapon|Weapon|0|weapons><System.String|SkyWhale|Creature Type|1|creatures><0><System.Int32|4|Amount|2|NULL><System.Boolean|true|In One Cycle|3|NULL><System.String|Any Region|Region|5|regions><0><0bChGBingoItemHoardChallenge~System.Boolean|true|Any Shelter|2|NULL><0><System.Int32|3|Amount|0|NULL><System.String|JellyFish|Item|1|expobject><System.String|Any Region|Region|4|regions><0><0><bChGBingoDamageChallenge~System.String|Boomerang|Weapon|0|weapons><System.String|Any Creature|Creature Type|1|creatures><0><System.Int32|6|Amount|2|NULL><System.Boolean|false|In One Cycle|3|NULL><System.String|Any Region|Region|5|regions><0><0bChGBingoVistaChallenge~WSKC><System.String|WSKC_A27|Room|0|vista><110><185><0><0bChGWatcherBingoSpinningTopChallenge~System.Boolean|true|Specific location|0|NULL><System.String|WTDB|Region|1|spinners><System.Boolean|false|While Starving|3|NULL><0><System.Int32|2|Amount|2|NULL><0><0><bChGBingoKillChallenge~System.String|Barnacle|Creature Type|0|creatures><System.String|Any Weapon|Weapon Used|6|weaponsnojelly><System.Int32|3|Amount|1|NULL><0><System.String|Any Region|Region|5|regions><System.Boolean|false|In one Cycle|3|NULL><System.Boolean|false|Via a Death Pit|7|NULL><System.Boolean|false|While Starving|2|NULL><System.Boolean|false|While under mushroom effect|8|NULL><0><0bChGWatcherBingoCollectRippleSpawnChallenge~0><System.Int32|30|Amount|0|NULL><System.Boolean|false|In one Cycle|1|NULL><0><0bChGBingoPopcornChallenge~System.String|Any Region|Region|1|popcornRegions><System.Boolean|true|Different Regions|2|NULL><System.Boolean|false|In one Cycle|3|NULL><0><System.Int32|5|Amount|0|NULL><><0><0bChGBingoPinChallenge~0><System.Int32|1|Amount|0|NULL><System.String|BasiliskLizard|Creature Type|1|creatures><><System.String|Any Region|Region|2|regions><0><0bChGWatcherBingoCollectPearlChallenge~System.Boolean|false|Specific Pearl|0|NULL><System.String|WTDA_AUDIO_JAM1|Pearl|1|Wpearls><0><System.Int32|3|Amount|3|NULL><0><0><bChGWatcherBingoEatChallenge~System.Int32|4|Amount|3|NULL><0><0><System.String|FireSpriteLarva|Food type|0|Wfood><System.Boolean|false|While Starving|2|NULL><0><0bChGBingoDamageChallenge~System.String|Any Weapon|Weapon|0|weapons><System.String|Rattler|Creature Type|1|creatures><0><System.Int32|4|Amount|2|NULL><System.Boolean|false|In One Cycle|3|NULL><System.String|Any Region|Region|5|regions><0><0bChGBingoPearlHoardChallenge~System.Boolean|false|Common Pearls|0|NULL><System.Boolean|false|Any Shelter|2|NULL><0><System.Int32|2|Amount|1|NULL><System.String|WRFA|Region|3|regions><0><0><bChGBingoGlobalScoreChallenge~0><System.Int32|130|Target Score|0|NULL><0><0bChGBingoUnlockChallenge~System.String|WARG|Unlock|0|unlocks><0><0bChGBingoVistaChallenge~WPGA><System.String|WPGA_A14|Room|0|vista><491><630><0><0bChGWatcherBingoTameChallenge~System.Boolean|true|Specific Creature Type|0|NULL><System.String|Salamander|Creature Type|1|Wfriend><0><System.Int32|2|Amount|2|NULL><0><0><bChGBingoKarmaFlowerChallenge~System.String|WORA|Region|1|regions><System.Boolean|false|Different Regions|2|NULL><System.Boolean|false|In one Cycle|3|NULL><0><System.Int32|7|Amount|0|NULL><><0><0bChGBingoTradeChallenge~0><System.Int32|20|Value|0|NULL><0><0bChGWatcherBingoAchievementChallenge~System.String|Chieftain|Passage|0|Wpassage><0><0bChGBingoLickChallenge~0><System.Int32|4|Amount|0|NULL><0><0><bChGBingoItemHoardChallenge~System.Boolean|false|Any Shelter|2|NULL><0><System.Int32|2|Amount|0|NULL><System.String|FlyLure|Item|1|expobject><System.String|Any Region|Region|4|regions><0><0><bChGWatcherBingoCreaturePortalChallenge~System.String|PeachLizard|Creature Type|1|Wtransport><0><System.Int32|2|Amount|0|NULL><empty><0><0bChGWatcherBingoEnterRegionChallenge~System.String|WARB|Region|0|regionsreal><0><0bChGBingoKillChallenge~System.String|Vulture|Creature Type|0|creatures><System.String|Any Weapon|Weapon Used|6|weaponsnojelly><System.Int32|1|Amount|1|NULL><0><System.String|Any Region|Region|5|regions><System.Boolean|false|In one Cycle|3|NULL><System.Boolean|false|Via a Death Pit|7|NULL><System.Boolean|false|While Starving|2|NULL><System.Boolean|false|While under mushroom effect|8|NULL><0><0",
            boardState: "000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>001000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>111110000<>000000000".split("<>"),
            team: null,
            messages: [],
            clients: new Map(),
            selectedClientId: null,
            connected: false
        };

        this.props.socket.onmessage = async (e) => {
            const text = await e.data.text();
            var data = text.split(";;");

            var _clients = new Map(this.state.clients);
            _clients.set(data[2], { board: data[0], state: data[1], team: data[3] });
            this.setState((prevState) => ({
                messages: [...prevState.messages, text],
                clients: _clients
            }));
            if (data[2] === this.state.selectedClientId) {
                this.setState({
                    s: data[0],
                    boardState: data[1].split("<>"),
                    team: data[3]
                });
            }
        };
        this.props.socket.onopen = () => {
            this.setState({ connected: true });
            this.props.socket.send("Spectator connected");
        };
        this.props.socket.onclose = () => {
            this.setState({ connected: false });
        };
        this.props.socket.onerror = () => (e) => {
            console.log(e);
            this.setState({ connected: false });
        };
    }

    async componentDidMount() {
        // Adapted from bingovista.js
        //	Prepare atlases
        atlases[0].img = (await import("./lib/bingovista/bvicons.png")).default;
        atlases[0].txt = (await import("./lib/bingovista/bvicons.txt")).default;
        atlases[1].img = (await import("./lib/bingovista/bingoicons.png")).default;
        atlases[1].txt = (await import("./lib/bingovista/bingoicons.txt")).default;
        atlases[2].img = (await import("./lib/bingovista/uispritesmsc.png")).default;
        atlases[2].txt = (await import("./lib/bingovista/uispritesmsc.txt")).default;
        atlases[3].img = (await import("./lib/bingovista/uiSprites.png")).default;
        atlases[3].txt = (await import("./lib/bingovista/uiSprites.txt")).default;
        atlases[4].img = (await import("./lib/bingovista/uispriteswatcher.png")).default;
        atlases[4].txt = (await import("./lib/bingovista/uispriteswatcher.txt")).default;

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
        }).finally(() => this.setState({ loading: false }));
    }

    handleClientChange = (e) => {
        const clientId = e.target.value;
        const client = this.state.clients.get(clientId);
        this.setState({
            selectedClientId: clientId,
            s: client ? client.board : this.state.s,
            boardState: client ? client.state.split("<>") : this.state.boardState,
            team: client ? client.team : this.state.team
        });
    };

    render() {
        const messages = this.state.messages.map((m, i) => (<li key={i}>Message from {m.split(";;")[2]}</li>));
        const clientOptions = Array.from(this.state.clients.keys()).map(id => (
            <option key={id} value={id}>{id}</option>
        ));
        return (
            <div style={{ minHeight: "100vh", backgroundColor: "#181a1b", color: "white" }}>
                <div style={{ padding: "12px", display: "flex", flexDirection: "row" }}>
                    <BingoCanvas bingoString={this.state.s} boardState={this.state.boardState} team={this.state.team} />
                    <div style={{ marginLeft: "8px", display: "flex", flexDirection: "column", height: "fit", width: "100%", minWidth: "300px" }}>
                        <span style={{ color: this.state.connected ? "#00ff00" : "#ff0000" }}>{this.state.connected ? "Connected" : "Disconnected"}</span>
                        <label>
                            <span style={{ marginRight: '8px' }}>Select Client:</span>
                            <select value={this.state.selectedClientId || ""} onChange={this.handleClientChange}>
                                <option value="" disabled>Select a client</option>
                                {clientOptions}
                            </select>
                        </label>
                        <div style={{ maxHeight: "75vh", overflowY: "auto" }}>
                            {messages}
                        </div>
                    </div>
                </div>
                <div style={{ marginLeft: "12px", marginBottom: "12px" }}>This viewer is a fork of <a href="https://t3sl4co1l.github.io/bingovista/bingovista.html" style={{ color: "#0080ff" }}>T3sl4co1l's Bingo Vista board viewer</a></div>
            </div>
        );
    }
}

export default App;
