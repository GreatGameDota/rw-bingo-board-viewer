import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { PLAYER_TO_TEAM } from '../utils/constants';

class Users extends Component {
    constructor(props) {
        super(props);
        this.state = {
            users: [],
            loading: true,
            error: null,
        };
    }

    componentDidMount() {
        this.fetchUsers();
    }

    fetchUsers = async () => {
        try {
            const response = await fetch('https://us-central1-bingo-db-57e75.cloudfunctions.net/api/users?min=0&max=1000');
            const data = await response.json();
            const users = data.users;

            if (users.length > 0) {
                users.sort((a, b) => parseFloat(this.getGameValue(b, 'elo')) - parseFloat(this.getGameValue(a, 'elo')));
                this.setState({
                    users,
                    loading: false,
                    error: null,
                });
                return;
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }

        this.setState({
            loading: false,
            error: 'Error loading users',
        });
    };

    getGameValue = (obj, key) => {
        if (!obj) return null;
        const value = obj.info?.[key];
        if (value && typeof value === 'object' && 'stringValue' in value) return value.stringValue;
        if (value && typeof value === 'object' && 'timestampValue' in value) return value.timestampValue;
        if (value && typeof value === 'object' && 'integerValue' in value) return parseInt(value.integerValue);
        if (value && typeof value === 'object' && 'arrayValue' in value) return value.arrayValue.values;
        return value;
    };

    render() {
        const { users, loading, error } = this.state;

        return (
            <div className="flex-grow">
                <div className="p-6 max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold text-white mb-8" style={{ fontFamily: 'RainWorldRodondo', fontSize: '48px' }}>
                        Users
                    </h1>
                    <div className="mb-8">
                        <p>Counts games with an opponent and a winner. Doesn't include games before matches were added (mid May)</p>
                        <p>Includes any game: 1v1, 2v2, 1v2, 3v3, etc.</p>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-24">
                            <p className="text-white text-xl">Loading users...</p>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center py-24">
                            <p className="text-red-400 text-xl">{error}</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                            <p className="text-gray-400">No users found.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {users.map((user, index) => {
                                const name = this.getGameValue(user, 'name');
                                const elo = Math.round(parseFloat(this.getGameValue(user, 'elo')));
                                const wins = Math.round(this.getGameValue(user, 'wins'));
                                const gamesPlayed = Math.round(this.getGameValue(user, 'gamesPlayed'));
                                const losses = Math.max(gamesPlayed - wins, 0);
                                const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;
                                const teamName = PLAYER_TO_TEAM.get(name.toLowerCase());

                                return (
                                    <Link
                                        key={`${name}-${index}`}
                                        to={`/rw-bingo-board-viewer/user/${encodeURIComponent(name)}`}
                                        className="block bg-gray-800 border border-gray-700 rounded-lg p-6 hover:bg-[#2b3646] transition-colors duration-200"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="min-w-16 pl-4 mr-4">
                                                    <p style={{ fontFamily: "RainWorldRodondo", fontSize: "36px" }}>{index + 1}</p>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        {teamName && (
                                                            <img
                                                                src={`https://firebasestorage.googleapis.com/v0/b/bingo-db-57e75.firebasestorage.app/o/team_icons%2FThe ${teamName}.png?alt=media`}
                                                                alt="Team Logo"
                                                                className="w-5 h-5"
                                                                title={teamName ? `The ${teamName}` : ""}
                                                            />
                                                        )}
                                                        <p className="text-xl font-semibold text-white">{name}</p>
                                                    </div>
                                                    <p className="text-sm text-gray-400">{gamesPlayed} games</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                                <div className="rounded-lg border border-gray-700 bg-gray-900/60 px-3 py-2">
                                                    <p className="text-gray-400">Elo</p>
                                                    <p className="text-white font-semibold">{elo}</p>
                                                </div>
                                                <div className="rounded-lg border border-gray-700 bg-gray-900/60 px-3 py-2">
                                                    <p className="text-gray-400">Winrate</p>
                                                    <p className="text-white font-semibold">{winRate}%</p>
                                                </div>
                                                <div className="rounded-lg border border-gray-700 bg-gray-900/60 px-3 py-2">
                                                    <p className="text-gray-400">Wins</p>
                                                    <p className="text-white font-semibold">{wins}</p>
                                                </div>
                                                <div className="rounded-lg border border-gray-700 bg-gray-900/60 px-3 py-2">
                                                    <p className="text-gray-400">Losses</p>
                                                    <p className="text-white font-semibold">{losses}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default Users;
