import React, { Component } from "react";
import './App.css';
import BingoCanvas from "./components/BingoCanvas";
import { atlases } from './lib/bingovista/bingovista';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            s: "Gourmand;BingoGourmandCrushChallenge~0><System.Int32|9|Amount|0|NULL><0><0><bChGBingoDontKillChallenge~System.String|DaddyLongLegs|Creature Type|0|creatures><0><0bChGBingoTradeTradedChallenge~0><System.Int32|2|Amount of Items|0|NULL><empty><0><0bChGBingoPearlDeliveryChallenge~System.String|VS|Pearl from Region|0|regions><0><0bChGBingoAchievementChallenge~System.String|Friend|Passage|0|passage><0><0bChGBingoPearlHoardChallenge~System.Boolean|false|Common Pearls|0|NULL><System.Boolean|true|Any Shelter|2|NULL><0><System.Int32|3|Amount|1|NULL><System.String|LF|Region|3|regions><0><0><bChGBingoTradeChallenge~0><System.Int32|12|Value|0|NULL><0><0bChGBingoBombTollChallenge~System.Boolean|false|Specific toll|0|NULL><System.String|su_c02|Scavenger Toll|3|tolls><System.Boolean|false|Pass the Toll|2|NULL><0><System.Int32|3|Amount|1|NULL><empty><0><0bChGBingoDontKillChallenge~System.String|MotherSpider|Creature Type|0|creatures><0><0bChGBingoVistaChallenge~OE><System.String|OE_RUINCourtYard|Room|0|vista><2133><1397><0><0bChGBingoEnterRegionChallenge~System.String|SH|Region|0|regionsreal><0><0bChGBingoEchoChallenge~System.Boolean|false|Specific Echo|0|NULL><System.String|CC|Region|1|echoes><System.Boolean|false|While Starving|3|NULL><0><System.Int32|5|Amount|2|NULL><0><0><bChGBingoMoonCloakChallenge~System.Boolean|true|Deliver|0|NULL><0><0bChGBingoCraftChallenge~System.String|Lantern|Item to Craft|0|craft><System.Int32|3|Amount|1|NULL><0><0><0bChGBingoAchievementChallenge~System.String|Hunter|Passage|0|passage><0><0bChGBingoCycleScoreChallenge~System.Int32|25|Target Score|0|NULL><0><0bChGBingoDodgeLeviathanChallenge~0><0bChGBingoDodgeNootChallenge~System.Int32|6|Amount|0|NULL><0><0><0bChGBingoUnlockChallenge~System.String|SI|Unlock|0|unlocks><0><0bChGBingoCraftChallenge~System.String|FirecrackerPlant|Item to Craft|0|craft><System.Int32|2|Amount|1|NULL><0><0><0bChGBingoAllRegionsExcept~System.String|SU|Region|0|regionsreal><CC|DS|HI|GW|SI|SU|SH|SL|LF|UW|SB|SS|MS|OE|HR|LM|DM|LC|RM|CL|UG|VS><0><System.Int32|9|Amount|1|NULL><0><0bChGBingoCreatureGateChallenge~System.String|CicadaB|Creature Type|1|transport><0><System.Int32|4|Amount|0|NULL><empty><0><0bChGBingoVistaChallenge~SH><System.String|SH_A14|Room|0|vista><273><556><0><0bChGBingoLickChallenge~0><System.Int32|3|Amount|0|NULL><0><0><bChGBingoPopcornChallenge~0><System.Int32|2|Amount|0|NULL><0><0",
            boardState: "000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>001000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>111110000<>000000000".split("<>"),
            messages: [],
            clients: new Map(),
            selectedClientId: null
        };

        this.props.socket.onmessage = async (e) => {
            const text = await e.data.text();
            var data = text.split(",");

            var _clients = new Map(this.state.clients);
            _clients.set(data[2], { board: data[0], state: data[1] });
            this.setState((prevState) => ({
                messages: [...prevState.messages, text],
                clients: _clients
            }));
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
            boardState: client ? client.state.split("<>") : this.state.boardState
        });
    };

    render() {
        const messages = this.state.messages.map((m, i) => (<div key={i}>Message from {m.split(",")[2]}</div>));
        const clientOptions = Array.from(this.state.clients.keys()).map(id => (
            <option key={id} value={id}>{id}</option>
        ));
        return (
            <div style={{margin: '12px'}}>
                <label>
                    <span style={{marginRight: '8px'}}>Select Client:</span>
                    <select value={this.state.selectedClientId || ""} onChange={this.handleClientChange}>
                        <option value="" disabled>Select a client</option>
                        {clientOptions}
                    </select>
                </label>
                <BingoCanvas bingoString={this.state.s} boardState={this.state.boardState} />
                {messages}
            </div>
        );
    }
}

export default App;
