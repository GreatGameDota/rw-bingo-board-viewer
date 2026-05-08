import React, { Component } from 'react';
// import BingoCanvas from '../components/BingoCanvas';
// import { atlases } from '../lib/bingovista/bingovista';
// import { getTeamName } from '../utils/teamNames';

class Leaderboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            teams: [],
            loading: true,
            error: null
        };
    }

    async componentDidMount() {
        this.fetchTeams();
    }

    // componentDidUpdate(prevProps) {
    //     if (prevProps.userName !== this.props.userName) {
    //         this.setState({ loading: true, error: null });
    //         this.fetchUserGames();
    //     }
    // }

    fetchTeams = async () => {
        try {
            const response = await fetch('https://us-central1-bingo-db-57e75.cloudfunctions.net/api/teams');
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            const data = await response.json();
            const teams = data.teams || [];
            teams.sort((a, b) => {
                const eloA = Math.round(parseFloat(this.getGameValue(a, 'elo')));
                const eloB = Math.round(parseFloat(this.getGameValue(b, 'elo')));
                if (eloA === eloB) {
                    const gamesA = parseInt(this.getGameValue(a, 'gamesPlayed'));
                    const gamesB = parseInt(this.getGameValue(b, 'gamesPlayed'));
                    if (gamesA === 0 && gamesB === 0) {
                        const nameA = this.getGameValue(a, 'name');
                        const nameB = this.getGameValue(b, 'name');
                        return nameA.localeCompare(nameB);
                    }
                    const winsA = parseInt(this.getGameValue(a, 'wins'));
                    const winsB = parseInt(this.getGameValue(b, 'wins'));
                    if (winsA === winsB) {
                        const nameA = this.getGameValue(a, 'name');
                        const nameB = this.getGameValue(b, 'name');
                        return nameA.localeCompare(nameB);
                    }
                    return winsB - winsA;
                }
                return eloB - eloA;
            });
            this.setState({
                teams: teams,
                loading: false,
                error: null
            });
        } catch (error) {
            console.error('Error fetching teams:', error);
            this.setState({
                error: error.message,
                loading: false
            });
        }
    }

    formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }

    getGameValue = (obj, key) => {
        if (!obj) return null;
        const v = obj.info[key];
        if (v && typeof v === 'object' && 'stringValue' in v) return v.stringValue;
        if (v && typeof v === 'object' && 'timestampValue' in v) return v.timestampValue;
        if (v && typeof v === 'object' && 'integerValue' in v) return v.integerValue;
        return v;
    }

    render() {
        const { teams, loading, error } = this.state;
        var cutoffFirst = false, cutoffEnd = false;

        return (
            <div className="flex-grow">
                <div className="w-full h-32 overflow-hidden">
                    <img
                        src="https://firebasestorage.googleapis.com/v0/b/bingo-db-57e75.firebasestorage.app/o/watcherthumbnailfull.png?alt=media"
                        alt="Bingo Board Banner"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="p-6 max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold text-white mb-8">Leaderboard</h1>

                    {loading ? (
                        <div className="flex items-center justify-center py-24">
                            <p className="text-white text-xl">Loading teams...</p>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center py-24">
                            <p className="text-red-400 text-xl">Error loading teams</p>
                        </div>
                    ) : teams.length === 0 ? (
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                            <p className="text-gray-400">No teams found.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6 mb-6">
                            {teams.map((team, index) => {
                                const rawName = this.getGameValue(team, 'name') || '';
                                const nameParts = rawName.split(',');
                                const eloValue = Math.round(parseFloat(this.getGameValue(team, 'elo')));
                                const wins = parseFloat(this.getGameValue(team, 'wins'));
                                const gamesPlayed = Math.max(parseFloat(this.getGameValue(team, 'gamesPlayed')), 1);
                                const winRate = Math.round((wins / gamesPlayed) * 100);
                                const showCutoffFirst = !cutoffFirst && this.getGameValue(team, 'gamesPlayed') === "0";
                                const showCutoffEnd = cutoffFirst && !cutoffEnd && this.getGameValue(team, 'gamesPlayed') !== "0";
                                if (showCutoffFirst) cutoffFirst = true;
                                if (showCutoffEnd) cutoffEnd = true;

                                return (
                                    <div key={index}>
                                        {(showCutoffFirst || showCutoffEnd) && <hr className="mb-6 border-t-2 border-dotted border-gray-400" />}
                                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                                            <div className="flex flex-row">
                                                <div className="min-w-16 p-4 mr-8">
                                                    <p className="text-2xl font-semibold">{index + 1}</p>
                                                </div>
                                                <div className="flex flex-col my-auto">
                                                    <p className="text-2xl font-bold">
                                                        {nameParts.map((player, idx) =>
                                                            `${player}${idx === nameParts.length - 1 ? '' : ' & '}`
                                                        )}
                                                    </p>
                                                    <p>
                                                        <span
                                                            className={`text-xl font-semibold
                                                            ${index === 0 ? 'bg-gradient-to-r from-yellow-500 via-yellow-50 to-yellow-500 bg-clip-text text-transparent animate-gradient bg-[length:300%_300%]' : ''}
                                                            ${index === 1 ? 'bg-gradient-to-r from-gray-500 via-gray-50 to-gray-500 bg-clip-text text-transparent animate-gradient bg-[length:300%_300%]' : ''}
                                                            ${index === 2 ? 'bg-gradient-to-r from-[#7d3b2e] via-[#c55b42] to-[#7d3b2e] bg-clip-text text-transparent animate-gradient bg-[length:300%_300%]' : ''}`}
                                                        >
                                                            {eloValue}
                                                        </span> elo • <span className="text-xl font-semibold">{winRate}</span>% winrate</p>
                                                </div>
                                                <div className="ml-auto my-auto text-right">
                                                    <p>
                                                        {this.getGameValue(team, 'gamesPlayed')} {this.getGameValue(team, 'gamesPlayed') === "1" ? "game" : "games"} • {wins}W {this.getGameValue(team, 'losses')}L
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default Leaderboard;
