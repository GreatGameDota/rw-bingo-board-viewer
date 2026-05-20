import BingoCanvas from '../components/BingoCanvas';
import { CHARACTER_TO_IMG, CHARACTER_TO_NAME, getTeamName, PLAYER_TO_TEAM } from '../utils/constants';

const GameCard = ({ game, idx, type }) => {
    const getGameValue = (obj, key) => {
        if (!obj) return null;
        const v = obj.info[key];
        if (v && typeof v === 'object' && 'stringValue' in v) return v.stringValue;
        if (v && typeof v === 'object' && 'timestampValue' in v) return v.timestampValue;
        if (v && typeof v === 'object' && 'integerValue' in v) return v.integerValue;
        if (v && typeof v === 'object' && 'arrayValue' in v) return v.arrayValue.values;
        return v;
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }

    const name = getGameValue(game, 'name') ?? 'Unknown';
    const team = getGameValue(game, 'team');
    const completedGoals = getGameValue(game, 'completedGoals') ?? 0;
    const deaths = getGameValue(game, 'deaths') ?? "";
    const winningTeam = getGameValue(game, 'winningTeam');
    const time = getGameValue(game, 'time');
    const createdAt = getGameValue(game, 'createdAt');
    const updatedAt = getGameValue(game, 'updatedAt');
    const boardState = getGameValue(game, 'boardState');
    const boardString = getGameValue(game, 'boardString');
    const matchId = getGameValue(game, 'matchId');

    return (
        <div
            key={idx}
            className={`bg-gray-800 border border-gray-700 rounded-lg flex ${type === "ranked" ? "flex-col" : "flex-row"}`}
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
                    <span className="text-gray-400">Deaths: {deaths === "" ? 0 : deaths.split(',').length} </span>
                    <span className="text-gray-500 text-sm break-all">[{deaths}]</span>
                </p>
                <div className={`flex ${type === "ranked" ? "flex-row" : "flex-col h-full"}`}>
                    <p className="w-fit text-gray-500 text-xs">
                        {updatedAt ? formatDate(updatedAt) : formatDate(createdAt)}
                    </p>
                    <button
                        onClick={() => navigator.clipboard.writeText(matchId)}
                        className={`p-1 w-fit ${type === "ranked" ? "ml-auto" : "mt-auto"} text-gray-400 rounded hover:bg-gray-700 transition-colors`}
                        title="Copy Match ID"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z" />
                        </svg>
                    </button>
                </div>
            </div>
            <div className={`p-4 relative bg-gray-900/50 ${type === "list" ? "lg:w-2/3" : ""}`}>
                <img
                    src={`https://firebasestorage.googleapis.com/v0/b/bingo-db-57e75.firebasestorage.app/o/emotes%2F${CHARACTER_TO_IMG.get(boardString.split(";")[0])}_thingie.png?alt=media`}
                    alt="Board cat icon"
                    className="w-8 h-8 absolute bottom-0 left-1"
                    title={`${CHARACTER_TO_NAME.get(boardString.split(";")[0])} board`}
                />
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
