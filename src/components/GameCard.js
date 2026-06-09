import BingoCanvas from '../components/BingoCanvas';
import { CHARACTER_TO_BG, CHARACTER_TO_BG2, CHARACTER_TO_IMG, CHARACTER_TO_NAME, getTeamName, PLAYER_TO_TEAM } from '../utils/constants';

const GameCard = ({ game, idx, type }) => {
    const getGameValue = (obj, key) => {
        if (!obj) return null;
        const v = obj.info[key];
        if (v && typeof v === 'object' && 'stringValue' in v) return v.stringValue;
        if (v && typeof v === 'object' && 'timestampValue' in v) return v.timestampValue;
        if (v && typeof v === 'object' && 'integerValue' in v) return v.integerValue;
        if (v && typeof v === 'object' && 'booleanValue' in v) return Boolean(v.booleanValue);
        if (v && typeof v === 'object' && 'arrayValue' in v) return v.arrayValue.values;
        return v;
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }

    const extractChallengeNames = (text) => {
        const shelter = text.split(";").length === 3 ? text.split(";")[1] : text.split(";")[2];
        if (shelter[0] === 'r' || shelter[0] === 's') {
            const _text = text.split(";");
            _text[2] = _text[2].substring(1);
            text = _text.join(";");
        }

        const lastSemicolon = text.lastIndexOf(';');
        const challenges = text.substring(lastSemicolon + 1).split("bChG");

        const size = Math.round(Math.sqrt(challenges.length));
        let next = 0;
        let _challenges = "";

        for (let j = 0; j < size; j++) {
            for (let i = 0; i < size; i++) {
                const array11 = challenges[next].split("~");
                const type = array11[0];
                var replaced;

                const separator = next === challenges.length - 1 ? "" : "bChG";

                if (type === "BingoDontUseItemChallenge" || type === "WatcherBingoDontUseItemChallenge") {
                    const segs = challenges[next].split("><");
                    segs[2] = "0";
                    segs[3] = "0";
                    replaced = segs.join("><");
                    _challenges += replaced + separator;
                } else if (type === "BingoVistaChallenge") {
                    const segs = challenges[next].split("><");
                    segs[4] = "0";
                    segs[5] = "0";
                    replaced = segs.join("><");
                    _challenges += replaced + separator;
                } else if (type === "BingoBombTollChallenge" || type === "WatcherBingoBombTollChallenge") {
                    const segs = challenges[next].split("><");
                    if (segs.length === 4) {
                        segs[2] = "0";
                        segs[3] = "0";
                    } else {
                        segs[3] = "0";
                        segs[5] = "empty";
                        segs[6] = "0";
                        segs[7] = "0";
                    }
                    replaced = segs.join("><");
                    _challenges += replaced + separator;
                } else if (type === "BingoCollectPearlChallenge" || type === "WatcherBingoCollectPearlChallenge") {
                    const segs = challenges[next].split("><");
                    segs[2] = "0";
                    segs[4] = "0";
                    segs[5] = "0";
                    segs[6] = "";
                    replaced = segs.join("><");
                    _challenges += replaced + separator;
                } else if (type === "BingoCreatureGateChallenge") {
                    const segs = challenges[next].split("><");
                    segs[1] = "0";
                    segs[3] = "empty";
                    segs[4] = "0";
                    segs[5] = "0";
                    replaced = segs.join("><");
                    _challenges += replaced + separator;
                } else if (type === "BingoEatChallenge" || type === "WatcherBingoEatChallenge") {
                    const segs = challenges[next].split("><");
                    segs[1] = "0";
                    segs[segs.length === 6 ? 4 : 5] = "0";
                    segs[segs.length === 6 ? 5 : 6] = "0";
                    replaced = segs.join("><");
                    _challenges += replaced + separator;
                } else if (type === "BingoEchoChallenge") {
                    const segs = challenges[next].split("><");
                    if (segs.length === 4) {
                        segs[2] = "0";
                        segs[3] = "0";
                    } else {
                        segs[3] = "0";
                        segs[5] = "0";
                        segs[6] = "0";
                        segs[7] = "";
                    }
                    replaced = segs.join("><");
                    _challenges += replaced + separator;
                } else if (type === "BingoHatchNoodleChallenge") {
                    const segs = challenges[next].split("><");
                    if (segs.length === 5) {
                        const segs2 = segs[0].split("~");
                        segs2[1] = "0";
                        segs[0] = segs2.join("~");
                        segs[3] = "0";
                        segs[4] = "0";
                    } else {
                        segs[3] = "0";
                        segs[5] = "";
                        segs[6] = "0";
                        segs[7] = "0";
                    }
                    replaced = segs.join("><");
                    _challenges += replaced + separator;
                } else if (type === "BingoItemHoardChallenge") {
                    const segs = challenges[next].split("><");
                    if (segs.length === 4) {
                        segs[2] = "0";
                        segs[3] = "0";
                    } else if (segs.length === 7) {
                        segs[1] = "0";
                        segs[4] = "0";
                        segs[5] = "0";
                        segs[6] = "";
                    } else {
                        segs[1] = "0";
                        segs[5] = "0";
                        segs[6] = "0";
                        segs[7] = "";
                    }
                    replaced = segs.join("><");
                    _challenges += replaced + separator;
                } else if (type === "BingoKarmaFlowerChallenge") {
                    const segs = challenges[next].split("><");
                    if (segs.length === 4) {
                        const segs2 = segs[0].split("~");
                        segs2[1] = "0";
                        segs[0] = segs2.join("~");
                        segs[2] = "0";
                        segs[3] = "0";
                    } else {
                        segs[3] = "0";
                        segs[5] = "";
                        segs[6] = "0";
                        segs[7] = "0";
                    }
                    replaced = segs.join("><");
                    _challenges += replaced + separator;
                } else if (type === "BingoKillChallenge") {
                    const segs = challenges[next].split("><");
                    segs[3] = "0";
                    segs[9] = "0";
                    segs[10] = "0";
                    replaced = segs.join("><");
                    _challenges += replaced + separator;
                } else if (type === "BingoMaulTypesChallenge") {
                    const segs = challenges[next].split("><");
                    const segs2 = segs[0].split("~");
                    segs2[1] = "0";
                    segs[0] = segs2.join("~");
                    segs[2] = "0";
                    segs[3] = "0";
                    segs[4] = "";
                    replaced = segs.join("><");
                    _challenges += replaced + separator;
                } else if (type === "BingoPearlHoardChallenge") {
                    const segs = challenges[next].split("><");
                    if (segs.length === 5) {
                        segs[3] = "0";
                        segs[4] = "0";
                    } else {
                        segs[2] = "0";
                        segs[5] = "0";
                        segs[6] = "0";
                        segs[7] = "";
                    }
                    replaced = segs.join("><");
                    _challenges += replaced + separator;
                } else if (type === "BingoPinChallenge") {
                    const segs = challenges[next].split("><");
                    const segs2 = segs[0].split("~");
                    segs2[1] = "0";
                    segs[0] = segs2.join("~");
                    segs[3] = "";
                    segs[5] = "0";
                    segs[6] = "0";
                    replaced = segs.join("><");
                    _challenges += replaced + separator;
                } else if (type === "BingoPopcornChallenge") {
                    const segs = challenges[next].split("><");
                    if (segs.length === 4) {
                        const segs2 = segs[0].split("~");
                        segs2[1] = "0";
                        segs[0] = segs2.join("~");
                        segs[2] = "0";
                        segs[3] = "0";
                    } else {
                        segs[3] = "0";
                        segs[5] = "";
                        segs[6] = "0";
                        segs[7] = "0";
                    }
                    replaced = segs.join("><");
                    _challenges += replaced + separator;
                } else if (type === "BingoTameChallenge" || type === "WatcherBingoTameChallenge") {
                    const segs = challenges[next].split("><");
                    if (segs.length === 3) {
                        segs[1] = "0";
                        segs[2] = "0";
                    } else if (segs.length === 7) {
                        segs[2] = "0";
                        segs[4] = "0";
                        segs[5] = "0";
                        segs[6] = "";
                    } else {
                        segs[2] = "0";
                        segs[4] = "0";
                        segs[5] = "0";
                        segs[6] = "";
                        segs[7] = "";
                    }
                    replaced = segs.join("><");
                    _challenges += replaced + separator;
                } else if (type === "BingoTradeTradedChallenge") {
                    const segs = challenges[next].split("><");
                    const segs2 = segs[0].split("~");
                    segs2[1] = "0";
                    segs[0] = segs2.join("~");
                    segs[2] = "empty";
                    segs[3] = "0";
                    segs[4] = "0";
                    replaced = segs.join("><");
                    _challenges += replaced + separator;
                } else if (type === "BingoTransportChallenge") {
                    const segs = challenges[next].split("><");
                    segs[3] = "";
                    segs[4] = "0";
                    segs[5] = "0";
                    replaced = segs.join("><");
                    _challenges += replaced + separator;
                } else if (type === "BingoGourmandCrushChallenge") {
                    const segs = challenges[next].split("><");
                    const segs2 = segs[0].split("~");
                    segs2[1] = "0";
                    segs[0] = segs2.join("~");
                    segs[2] = "0";
                    segs[3] = "0";
                    segs[4] = "";
                    replaced = segs.join("><");
                    _challenges += replaced + separator;
                } else if (type === "BingoLickChallenge") {
                    const segs = challenges[next].split("><");
                    const segs2 = segs[0].split("~");
                    segs2[1] = "0";
                    segs[0] = segs2.join("~");
                    segs[2] = "0";
                    segs[3] = "0";
                    segs[4] = "";
                    replaced = segs.join("><");
                    _challenges += replaced + separator;
                } else if (type === "WatcherBingoSpinningTopChallenge") {
                    const segs = challenges[next].split("><");
                    segs[3] = "0";
                    segs[5] = "0";
                    segs[6] = "0";
                    segs[7] = "";
                    replaced = segs.join("><");
                    _challenges += replaced + separator;
                } else if (type === "WatcherBingoOpenMelonsChallenge") {
                    const segs = challenges[next].split("><");
                    if (segs.length === 4) {
                        const segs2 = segs[0].split("~");
                        segs2[1] = "0";
                        segs[0] = segs2.join("~");
                        segs[2] = "0";
                        segs[3] = "0";
                    } else if (segs.length === 5) {
                        const segs2 = segs[0].split("~");
                        segs2[1] = "0";
                        segs[0] = segs2.join("~");
                        segs[3] = "0";
                        segs[4] = "0";
                    } else {
                        segs[3] = "0";
                        segs[5] = "";
                        segs[6] = "0";
                        segs[7] = "0";
                    }
                    replaced = segs.join("><");
                    _challenges += replaced + separator;
                } else if (type === "WatcherBingoCreaturePortalChallenge") {
                    const segs = challenges[next].split("><");
                    segs[1] = "0";
                    segs[3] = "empty";
                    segs[4] = "0";
                    segs[5] = "0";
                    replaced = segs.join("><");
                    _challenges += replaced + separator;
                } else if (type === "BingoShelterChallenge") {
                    const segs = challenges[next].split("><");
                    segs[3] = "0";
                    segs[5] = "";
                    segs[6] = "0";
                    segs[7] = "0";
                    replaced = segs.join("><");
                    _challenges += replaced + separator;
                }
                else {
                    const replaced = challenges[next].replace(/[<~]-?\d+>|[<~]-?\d+$/g, m => {
                        const inner = m.endsWith(">") ? m.substring(1, m.length - 1) : m.substring(1);
                        return !isNaN(parseInt(inner, 10)) ? (m.endsWith(">") ? m[0] + "0>" : m[0] + "0") : m;
                    });
                    _challenges += replaced + separator;
                }

                next++;
            }
        }

        return text.substring(0, lastSemicolon + 1) + _challenges;
    }

    const name = getGameValue(game, 'name') ?? 'Unknown';
    const team = getGameValue(game, 'team');
    const completedGoals = getGameValue(game, 'completedGoals') ?? 0;
    const deaths = getGameValue(game, 'deaths') ?? "";
    const regions = getGameValue(game, 'regions') ?? "";
    const tames = getGameValue(game, 'tames') ?? "na";
    const startingShelter = getGameValue(game, 'startingShelter') ?? "";
    const isRandomShelter = getGameValue(game, 'isRandomShelter') ?? "na";
    const passageUsed = getGameValue(game, 'passageUsed') ?? "na";
    const winningTeam = getGameValue(game, 'winningTeam');
    const time = getGameValue(game, 'time');
    const createdAt = getGameValue(game, 'createdAt');
    const updatedAt = getGameValue(game, 'updatedAt');
    const boardState = getGameValue(game, 'boardState');
    const boardString = getGameValue(game, 'boardString');
    const matchId = getGameValue(game, 'matchId');
    const wm = boardString.split(";").length === 4 && boardString.split(";")[1] === "1";

    return (
        <div
            key={idx}
            className={`bg-gray-800 border border-gray-700 rounded-lg flex ${type === "ranked" ? "flex-col" : "flex-col md:flex-row"}`}
        >
            <div className={`${type === "ranked" ? "flex flex-col p-4 space-y-2" : "flex flex-col lg:w-1/3 p-4 border-r border-gray-700 gap-2"}`}>
                <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-row justify-center items-center">
                        <span className="text-white font-semibold mr-2">{name}</span>
                        {PLAYER_TO_TEAM.get(name) &&
                            <img
                                src={`https://firebasestorage.googleapis.com/v0/b/bingo-db-57e75.firebasestorage.app/o/team_icons%2FThe ${PLAYER_TO_TEAM.get(name)}.png?alt=media`}
                                alt="Team Logo"
                                className="w-5 h-5 mt-1"
                                title={`The ${PLAYER_TO_TEAM.get(name)}`}
                            />}
                    </div>
                    <span className="text-gray-400">{getTeamName(team)}</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-gray-400">Goals locked: {completedGoals}</span>
                    {winningTeam === team ?
                        <span className="px-2 py-0.5 rounded bg-green-400 text-gray-900 font-medium">Won ({getTeamName(winningTeam)})</span> :
                        winningTeam === "null" ?
                            <span className="px-2 py-0.5 rounded bg-gray-400 text-gray-900 font-semibold">{type === "ranked" ? "UNFINISHED" : "ONGOING"}</span> :
                            <span className="px-2 py-0.5 rounded bg-red-400 text-gray-900 font-medium">Lost ({getTeamName(winningTeam)})</span>
                    }
                </div>
                <span className="text-gray-400">Duration: {time}</span>
                <p>
                    <span className="text-gray-400">Regions visited: {regions === "" ? 0 : regions.split(',').length} </span>
                    <span className="text-gray-500 text-sm break-all">[{regions}]</span>
                </p>
                <p>
                    <span className="text-gray-400">Deaths: {deaths === "" ? 0 : deaths.split(',').length} </span>
                    <span className="text-gray-500 text-sm break-all">[{deaths}]</span>
                </p>
                <p>
                    <span className="text-gray-400">Friends made: {tames === "na" ? "" :
                        (tames.length === 0 ? <span className="text-gray-500 text-sm break-all">{"none :("}</span> :
                            tames.split(',').map((name, index) =>
                                <span key={index}>{name.split('|')[0]} <span className="text-gray-500 text-sm">{name.split('|')[1]}</span>{index === tames.split(',').length - 1 ? '' : ', '}</span>))}
                    </span>
                </p>
                <span className="text-gray-400">Starting shelter: {startingShelter}<span className="text-gray-500 text-sm">{isRandomShelter === "na" ? "" : (isRandomShelter ? " (random)" : " (set)")}</span></span>
                <span className="text-gray-400">Passage used: {passageUsed === "na" ? "" : (passageUsed ? "Yes" : "No")}</span>
                <div className={`flex ${type === "ranked" ? "flex-row" : "flex-row h-full"}`}>
                    <button
                        onClick={() => navigator.clipboard.writeText(matchId)}
                        className={`flex flex-row text-xs p-1 w-fit ${type === "ranked" ? "" : "mt-auto"} text-gray-400 rounded hover:bg-gray-700 transition-colors`}
                        title="Copy Match ID"
                    >
                        <span className="mr-1 mt-1">Match ID</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z" />
                        </svg>
                    </button>
                    <p className="mt-auto ml-auto w-fit text-gray-500 text-xs">
                        {updatedAt ? formatDate(updatedAt) : formatDate(createdAt)}
                    </p>
                </div>
            </div>
            <div className={`p-4 relative bg-gray-900/50 ${type === "list" ? "lg:w-2/3" : ""}`}>
                <div className="absolute inset-0 bg-cover bg-center opacity-10"
                    style={{
                        backgroundImage: `url(https://firebasestorage.googleapis.com/v0/b/bingo-db-57e75.firebasestorage.app/o/${encodeURIComponent(wm ? CHARACTER_TO_BG2.get(boardString.split(";")[0]) : CHARACTER_TO_BG.get(boardString.split(";")[0]))}.png?alt=media)`,
                        boxSizing: "border-box",
                        boxShadow: "inset 0 0 50px 50px rgba(0,0,0,0.9)"
                    }}
                />
                <div className="absolute bottom-0 left-1">
                    <div className="flex flex-row">
                        <img
                            src={`https://firebasestorage.googleapis.com/v0/b/bingo-db-57e75.firebasestorage.app/o/emotes%2F${CHARACTER_TO_IMG.get(boardString.split(";")[0])}_thingie${wm && boardString.split(";")[0] !== "Watcher" ? "_wm" : ""}.png?alt=media`}
                            alt="Board cat icon"
                            className="w-8 h-8 mr-1"
                            title={`${CHARACTER_TO_NAME.get(boardString.split(";")[0])} board`}
                        />
                        {wm && boardString.split(";")[0] !== "Watcher" && <img
                            src={`https://firebasestorage.googleapis.com/v0/b/bingo-db-57e75.firebasestorage.app/o/uispriteswatcher22.png?alt=media`}
                            alt="Board cat icon"
                            className="w-8 h-8 pb-[2px]" />}
                    </div>
                </div>
                <div className="absolute bottom-0 right-0">
                    <button
                        onClick={() => navigator.clipboard.writeText(extractChallengeNames(boardString))}
                        className={`flex flex-row text-xs p-1 w-fit ${type === "ranked" ? "ml-auto" : "mt-auto"} text-gray-400 rounded hover:bg-gray-700 transition-colors`}
                        title="Copy Board String"
                    >
                        <span className="mr-1 mt-1">Board String</span>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z" />
                        </svg>
                    </button>
                </div>
                <div className="w-fit mx-auto">
                    <BingoCanvas
                        bingoString={boardString}
                        boardState={boardState ? boardState.split("<>") : []}
                        team={Number(team)}
                        size={type === "ranked" ? 400 : 500}
                    />
                </div>
            </div>
        </div>
    );
};

export default GameCard;
