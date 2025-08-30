import React, { Component, useEffect } from "react";
import './App.css';
import BingoCanvas from "./components/BingoCanvas";

class App extends Component {
    render() {
        var s = "Gourmand;BingoGourmandCrushChallenge~0><System.Int32|9|Amount|0|NULL><0><0><bChGBingoDontKillChallenge~System.String|DaddyLongLegs|Creature Type|0|creatures><0><0bChGBingoTradeTradedChallenge~0><System.Int32|2|Amount of Items|0|NULL><empty><0><0bChGBingoPearlDeliveryChallenge~System.String|VS|Pearl from Region|0|regions><0><0bChGBingoAchievementChallenge~System.String|Friend|Passage|0|passage><0><0bChGBingoPearlHoardChallenge~System.Boolean|false|Common Pearls|0|NULL><System.Boolean|true|Any Shelter|2|NULL><0><System.Int32|3|Amount|1|NULL><System.String|LF|Region|3|regions><0><0><bChGBingoTradeChallenge~0><System.Int32|12|Value|0|NULL><0><0bChGBingoBombTollChallenge~System.Boolean|false|Specific toll|0|NULL><System.String|su_c02|Scavenger Toll|3|tolls><System.Boolean|false|Pass the Toll|2|NULL><0><System.Int32|3|Amount|1|NULL><empty><0><0bChGBingoDontKillChallenge~System.String|MotherSpider|Creature Type|0|creatures><0><0bChGBingoVistaChallenge~OE><System.String|OE_RUINCourtYard|Room|0|vista><2133><1397><0><0bChGBingoEnterRegionChallenge~System.String|SH|Region|0|regionsreal><0><0bChGBingoEchoChallenge~System.Boolean|false|Specific Echo|0|NULL><System.String|CC|Region|1|echoes><System.Boolean|false|While Starving|3|NULL><0><System.Int32|5|Amount|2|NULL><0><0><bChGBingoMoonCloakChallenge~System.Boolean|true|Deliver|0|NULL><0><0bChGBingoCraftChallenge~System.String|Lantern|Item to Craft|0|craft><System.Int32|3|Amount|1|NULL><0><0><0bChGBingoAchievementChallenge~System.String|Hunter|Passage|0|passage><0><0bChGBingoCycleScoreChallenge~System.Int32|25|Target Score|0|NULL><0><0bChGBingoDodgeLeviathanChallenge~0><0bChGBingoDodgeNootChallenge~System.Int32|6|Amount|0|NULL><0><0><0bChGBingoUnlockChallenge~System.String|SI|Unlock|0|unlocks><0><0bChGBingoCraftChallenge~System.String|FirecrackerPlant|Item to Craft|0|craft><System.Int32|2|Amount|1|NULL><0><0><0bChGBingoAllRegionsExcept~System.String|SU|Region|0|regionsreal><CC|DS|HI|GW|SI|SU|SH|SL|LF|UW|SB|SS|MS|OE|HR|LM|DM|LC|RM|CL|UG|VS><0><System.Int32|9|Amount|1|NULL><0><0bChGBingoCreatureGateChallenge~System.String|CicadaB|Creature Type|1|transport><0><System.Int32|4|Amount|0|NULL><empty><0><0bChGBingoVistaChallenge~SH><System.String|SH_A14|Room|0|vista><273><556><0><0bChGBingoLickChallenge~0><System.Int32|3|Amount|0|NULL><0><0><bChGBingoPopcornChallenge~0><System.Int32|2|Amount|0|NULL><0><0";
        return (
            <div>
                <BingoCanvas bingoString={s} />
            </div>
        );
    }
}

export default App;
