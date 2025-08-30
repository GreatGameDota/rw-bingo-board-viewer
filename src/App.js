import React, { Component } from "react";
import './App.css';
import BingoCanvas from "./components/BingoCanvas";
import { atlases } from './lib/bingovista/bingovista';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            s: "Gourmand;BingoGourmandCrushChallenge~0><System.Int32|9|Amount|0|NULL><0><0><bChGBingoDontKillChallenge~System.String|DaddyLongLegs|Creature Type|0|creatures><0><0bChGBingoTradeTradedChallenge~0><System.Int32|2|Amount of Items|0|NULL><empty><0><0bChGBingoPearlDeliveryChallenge~System.String|VS|Pearl from Region|0|regions><0><0bChGBingoAchievementChallenge~System.String|Friend|Passage|0|passage><0><0bChGBingoPearlHoardChallenge~System.Boolean|false|Common Pearls|0|NULL><System.Boolean|true|Any Shelter|2|NULL><0><System.Int32|3|Amount|1|NULL><System.String|LF|Region|3|regions><0><0><bChGBingoTradeChallenge~0><System.Int32|12|Value|0|NULL><0><0bChGBingoBombTollChallenge~System.Boolean|false|Specific toll|0|NULL><System.String|su_c02|Scavenger Toll|3|tolls><System.Boolean|false|Pass the Toll|2|NULL><0><System.Int32|3|Amount|1|NULL><empty><0><0bChGBingoDontKillChallenge~System.String|MotherSpider|Creature Type|0|creatures><0><0bChGBingoVistaChallenge~OE><System.String|OE_RUINCourtYard|Room|0|vista><2133><1397><0><0bChGBingoEnterRegionChallenge~System.String|SH|Region|0|regionsreal><0><0bChGBingoEchoChallenge~System.Boolean|false|Specific Echo|0|NULL><System.String|CC|Region|1|echoes><System.Boolean|false|While Starving|3|NULL><0><System.Int32|5|Amount|2|NULL><0><0><bChGBingoMoonCloakChallenge~System.Boolean|true|Deliver|0|NULL><0><0bChGBingoCraftChallenge~System.String|Lantern|Item to Craft|0|craft><System.Int32|3|Amount|1|NULL><0><0><0bChGBingoAchievementChallenge~System.String|Hunter|Passage|0|passage><0><0bChGBingoCycleScoreChallenge~System.Int32|25|Target Score|0|NULL><0><0bChGBingoDodgeLeviathanChallenge~0><0bChGBingoDodgeNootChallenge~System.Int32|6|Amount|0|NULL><0><0><0bChGBingoUnlockChallenge~System.String|SI|Unlock|0|unlocks><0><0bChGBingoCraftChallenge~System.String|FirecrackerPlant|Item to Craft|0|craft><System.Int32|2|Amount|1|NULL><0><0><0bChGBingoAllRegionsExcept~System.String|SU|Region|0|regionsreal><CC|DS|HI|GW|SI|SU|SH|SL|LF|UW|SB|SS|MS|OE|HR|LM|DM|LC|RM|CL|UG|VS><0><System.Int32|9|Amount|1|NULL><0><0bChGBingoCreatureGateChallenge~System.String|CicadaB|Creature Type|1|transport><0><System.Int32|4|Amount|0|NULL><empty><0><0bChGBingoVistaChallenge~SH><System.String|SH_A14|Room|0|vista><273><556><0><0bChGBingoLickChallenge~0><System.Int32|3|Amount|0|NULL><0><0><bChGBingoPopcornChallenge~0><System.Int32|2|Amount|0|NULL><0><0",
            boardNum: 1
        };
    }

    async componentDidMount() {
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
        }).finally(() => this.setState({ boardNum: 1 }));
    }

    render() {
        const onClick = () => {
            if (this.state.boardNum === 1) {
                this.setState({ s: "Artificer;BingoVistaChallenge~CC><System.String|CC_C05|Room|0|vista><449><2330><0><0bChGBingoIteratorChallenge~System.Boolean|false|Looks to the Moon|0|NULL><0><0bChGBingoBombTollChallenge~System.Boolean|false|Specific toll|0|NULL><System.String|gw_c05|Scavenger Toll|3|tolls><System.Boolean|true|Pass the Toll|2|NULL><0><System.Int32|3|Amount|1|NULL><empty><0><0bChGBingoCollectPearlChallenge~System.Boolean|false|Specific Pearl|0|NULL><System.String|SI_chat5|Pearl|1|pearls><0><System.Int32|6|Amount|3|NULL><0><0><bChGBingoKillChallenge~System.String|TubeWorm|Creature Type|0|creatures><System.String|ScavengerBomb|Weapon Used|6|weaponsnojelly><System.Int32|4|Amount|1|NULL><0><System.String|Any Region|Region|5|regions><System.Boolean|false|In one Cycle|3|NULL><System.Boolean|false|Via a Death Pit|7|NULL><System.Boolean|false|While Starving|2|NULL><System.Boolean|false|While under mushroom effect|8|NULL><0><0bChGBingoDepthsChallenge~System.String|SmallNeedleWorm|Creature Type|0|depths><0><0bChGBingoEchoChallenge~System.Boolean|false|Specific Echo|0|NULL><System.String|SB|Region|1|echoes><System.Boolean|true|While Starving|3|NULL><0><System.Int32|2|Amount|2|NULL><0><0><bChGBingoEnterRegionFromChallenge~System.String|CC|From|0|regionsreal><System.String|HI|To|0|regionsreal><0><0bChGBingoCreatureGateChallenge~System.String|CicadaB|Creature Type|1|transport><0><System.Int32|4|Amount|0|NULL><empty><0><0bChGBingoGlobalScoreChallenge~0><System.Int32|291|Target Score|0|NULL><0><0bChGBingoAllRegionsExcept~System.String|HI|Region|0|regionsreal><CC|DS|HI|GW|SI|SU|SH|SL|LF|UW|SB|SS|MS|OE|HR|LM|DM|LC|RM|CL|UG|VS><0><System.Int32|3|Amount|1|NULL><0><0bChGBingoMaulXChallenge~0><System.Int32|25|Amount|0|NULL><0><0bChGBingoDontKillChallenge~System.String|Centipede|Creature Type|0|creatures><0><0bChGBingoKillChallenge~System.String|DropBug|Creature Type|0|creatures><System.String|Any Weapon|Weapon Used|6|weaponsnojelly><System.Int32|4|Amount|1|NULL><0><System.String|Any Region|Region|5|regions><System.Boolean|false|In one Cycle|3|NULL><System.Boolean|false|Via a Death Pit|7|NULL><System.Boolean|false|While Starving|2|NULL><System.Boolean|false|While under mushroom effect|8|NULL><0><0bChGBingoDodgeNootChallenge~System.Int32|4|Amount|0|NULL><0><0><0bChGBingoNoRegionChallenge~System.String|GW|Region|0|regionsreal><0><0bChGBingoTameChallenge~System.String|CicadaA|Creature Type|0|friend><0><0bChGBingoEatChallenge~System.Int32|5|Amount|1|NULL><0><0><System.String|SlimeMold|Food type|0|food><0><0bChGBingoPinChallenge~0><System.Int32|4|Amount|0|NULL><System.String|YellowLizard|Creature Type|1|creatures><><System.String|LC|Region|2|regions><0><0bChGBingoEnterRegionChallenge~System.String|UW|Region|0|regionsreal><0><0bChGBingoStealChallenge~System.String|Rock|Item|1|theft><System.Boolean|false|From Scavenger Toll|0|NULL><0><System.Int32|3|Amount|2|NULL><0><0bChGBingoPearlDeliveryChallenge~System.String|UW|Pearl from Region|0|regions><0><0bChGBingoItemHoardChallenge~System.Boolean|true|Any Shelter|2|NULL><0><System.Int32|3|Amount|0|NULL><System.String|FlyLure|Item|1|expobject><0><0><bChGBingoDontKillChallenge~System.String|CicadaA|Creature Type|0|creatures><0><0bChGBingoKillChallenge~System.String|Salamander|Creature Type|0|creatures><System.String|LillyPuck|Weapon Used|6|weaponsnojelly><System.Int32|9|Amount|1|NULL><0><System.String|Any Region|Region|5|regions><System.Boolean|false|In one Cycle|3|NULL><System.Boolean|false|Via a Death Pit|7|NULL><System.Boolean|false|While Starving|2|NULL><System.Boolean|false|While under mushroom effect|8|NULL><0><0" });
                this.setState({ boardNum: 2 });
            } else {
                this.setState({ s: "Gourmand;BingoGourmandCrushChallenge~0><System.Int32|9|Amount|0|NULL><0><0><bChGBingoDontKillChallenge~System.String|DaddyLongLegs|Creature Type|0|creatures><0><0bChGBingoTradeTradedChallenge~0><System.Int32|2|Amount of Items|0|NULL><empty><0><0bChGBingoPearlDeliveryChallenge~System.String|VS|Pearl from Region|0|regions><0><0bChGBingoAchievementChallenge~System.String|Friend|Passage|0|passage><0><0bChGBingoPearlHoardChallenge~System.Boolean|false|Common Pearls|0|NULL><System.Boolean|true|Any Shelter|2|NULL><0><System.Int32|3|Amount|1|NULL><System.String|LF|Region|3|regions><0><0><bChGBingoTradeChallenge~0><System.Int32|12|Value|0|NULL><0><0bChGBingoBombTollChallenge~System.Boolean|false|Specific toll|0|NULL><System.String|su_c02|Scavenger Toll|3|tolls><System.Boolean|false|Pass the Toll|2|NULL><0><System.Int32|3|Amount|1|NULL><empty><0><0bChGBingoDontKillChallenge~System.String|MotherSpider|Creature Type|0|creatures><0><0bChGBingoVistaChallenge~OE><System.String|OE_RUINCourtYard|Room|0|vista><2133><1397><0><0bChGBingoEnterRegionChallenge~System.String|SH|Region|0|regionsreal><0><0bChGBingoEchoChallenge~System.Boolean|false|Specific Echo|0|NULL><System.String|CC|Region|1|echoes><System.Boolean|false|While Starving|3|NULL><0><System.Int32|5|Amount|2|NULL><0><0><bChGBingoMoonCloakChallenge~System.Boolean|true|Deliver|0|NULL><0><0bChGBingoCraftChallenge~System.String|Lantern|Item to Craft|0|craft><System.Int32|3|Amount|1|NULL><0><0><0bChGBingoAchievementChallenge~System.String|Hunter|Passage|0|passage><0><0bChGBingoCycleScoreChallenge~System.Int32|25|Target Score|0|NULL><0><0bChGBingoDodgeLeviathanChallenge~0><0bChGBingoDodgeNootChallenge~System.Int32|6|Amount|0|NULL><0><0><0bChGBingoUnlockChallenge~System.String|SI|Unlock|0|unlocks><0><0bChGBingoCraftChallenge~System.String|FirecrackerPlant|Item to Craft|0|craft><System.Int32|2|Amount|1|NULL><0><0><0bChGBingoAllRegionsExcept~System.String|SU|Region|0|regionsreal><CC|DS|HI|GW|SI|SU|SH|SL|LF|UW|SB|SS|MS|OE|HR|LM|DM|LC|RM|CL|UG|VS><0><System.Int32|9|Amount|1|NULL><0><0bChGBingoCreatureGateChallenge~System.String|CicadaB|Creature Type|1|transport><0><System.Int32|4|Amount|0|NULL><empty><0><0bChGBingoVistaChallenge~SH><System.String|SH_A14|Room|0|vista><273><556><0><0bChGBingoLickChallenge~0><System.Int32|3|Amount|0|NULL><0><0><bChGBingoPopcornChallenge~0><System.Int32|2|Amount|0|NULL><0><0" });
                this.setState({ boardNum: 1 });
            }
        }
        var board2 = "Artificer;BingoUnlockChallenge~System.String|LC|Unlock|0|unlocks><0><0bChGBingoUnlockChallenge~System.String|DS|Unlock|0|unlocks><0><0bChGBingoGlobalScoreChallenge~0><System.Int32|210|Target Score|0|NULL><0><0bChGBingoEnterRegionChallenge~System.String|LM|Region|0|regionsreal><0><0bChGBingoLickChallenge~0><System.Int32|4|Amount|0|NULL><0><0><bChGBingoDodgeNootChallenge~System.Int32|4|Amount|0|NULL><0><0><0bChGBingoStealChallenge~System.String|Lantern|Item|1|theft><System.Boolean|false|From Scavenger Toll|0|NULL><0><System.Int32|2|Amount|2|NULL><0><0bChGBingoAchievementChallenge~System.String|Hunter|Passage|0|passage><0><0bChGBingoKarmaFlowerChallenge~0><System.Int32|5|Amount|0|NULL><0><0bChGBingoKillChallenge~System.String|TentaclePlant|Creature Type|0|creatures><System.String|Any Weapon|Weapon Used|6|weaponsnojelly><System.Int32|4|Amount|1|NULL><0><System.String|Any Region|Region|5|regions><System.Boolean|false|In one Cycle|3|NULL><System.Boolean|false|Via a Death Pit|7|NULL><System.Boolean|false|While Starving|2|NULL><System.Boolean|false|While under mushroom effect|8|NULL><0><0bChGBingoTransportChallenge~System.String|SI|From Region|0|regions><System.String|CC|To Region|1|regions><System.String|CicadaB|Creature Type|2|transport><><0><0bChGBingoBombTollChallenge~System.Boolean|true|Specific toll|0|NULL><System.String|gw_c11|Scavenger Toll|3|tolls><System.Boolean|false|Pass the Toll|2|NULL><0><System.Int32|2|Amount|1|NULL><empty><0><0bChGBingoUnlockChallenge~System.String|SB|Unlock|0|unlocks><0><0bChGBingoTransportChallenge~System.String|LM|From Region|0|regions><System.String|Any Region|To Region|1|regions><System.String|JetFish|Creature Type|2|transport><><0><0bChGBingoEnterRegionChallenge~System.String|LC|Region|0|regionsreal><0><0bChGBingoTameChallenge~System.Boolean|false|Specific Creature Type|0|NULL><System.String|Salamander|Creature Type|1|friend><0><System.Int32|4|Amount|2|NULL><0><0><bChGBingoKillChallenge~System.String|MirosBird|Creature Type|0|creatures><System.String|Any Weapon|Weapon Used|6|weaponsnojelly><System.Int32|2|Amount|1|NULL><0><System.String|Any Region|Region|5|regions><System.Boolean|false|In one Cycle|3|NULL><System.Boolean|false|Via a Death Pit|7|NULL><System.Boolean|false|While Starving|2|NULL><System.Boolean|false|While under mushroom effect|8|NULL><0><0bChGBingoVistaChallenge~CC><System.String|CC_C05|Room|0|vista><449><2330><0><0bChGBingoEchoChallenge~System.Boolean|false|Specific Echo|0|NULL><System.String|SH|Region|1|echoes><System.Boolean|false|While Starving|3|NULL><0><System.Int32|2|Amount|2|NULL><0><0><bChGBingoDamageChallenge~System.String|Spear|Weapon|0|weapons><System.String|DropBug|Creature Type|1|creatures><0><System.Int32|4|Amount|2|NULL><System.Boolean|false|In One Cycle|3|NULL><System.String|Any Region|Region|5|regions><0><0bChGBingoIteratorChallenge~System.Boolean|false|Looks to the Moon|0|NULL><0><0bChGBingoMaulTypesChallenge~0><System.Int32|5|Amount|0|NULL><0><0><bChGBingoPinChallenge~0><System.Int32|2|Amount|0|NULL><System.String|GreenLizard|Creature Type|1|creatures><><System.String|Any Region|Region|2|regions><0><0bChGBingoVistaChallenge~SB><System.String|SB_D04|Room|0|vista><483><1045><0><0bChGBingoPearlHoardChallenge~System.Boolean|true|Common Pearls|0|NULL><System.Boolean|false|Any Shelter|2|NULL><0><System.Int32|3|Amount|1|NULL><System.String|SU|Region|3|regions><0><0><";
        return (
            <div>
                <BingoCanvas bingoString={this.state.s} />
                <button onClick={onClick}>test</button>
                <BingoCanvas bingoString={board2} />
            </div>
        );
    }
}

export default App;
