import React, { Component } from 'react';
import { PLAYER_TO_TEAM } from '../utils/constants';

class Schedule extends Component {
    constructor(props) {
        super(props);
        this.state = {
            teams: null,
            team: null,
            loading: false,
            loading2: false,
            loading3: false,
            error: null,
            player1Search: '',
            player2Search: '',
            availability: {},
            eloDiff: 200,
        };
    }

    fetchTeams = async () => {
        try {
            const response = await fetch('https://us-central1-bingo-db-57e75.cloudfunctions.net/api/teams2');
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            const data = await response.json();
            const teams = data.teams || [];
            return teams;
        } catch (error) {
            console.error('Error fetching teams:', error);
            return [];
        }
    }

    getGameValue = (obj, key) => {
        if (!obj) return null;
        const v = obj.info[key];
        if (v && typeof v === 'object' && 'stringValue' in v) return v.stringValue;
        if (v && typeof v === 'object' && 'timestampValue' in v) return v.timestampValue;
        if (v && typeof v === 'object' && 'integerValue' in v) return v.integerValue;
        return v;
    }

    hourToLocal = (hr) => {
        const d = new Date(Date.UTC(2026, 0, 1, hr, 0, 0));
        return d.toLocaleTimeString();
    }

    toggleBlock = (day, hr) => {
        var prev = this.state.availability;
        const current = prev[day] || [];
        const next = current.includes(hr) ? current.filter((h) => h !== hr) : [...current, hr];
        this.setState({ availability: { ...prev, [day]: next } });
    }

    convertToFirebase = (availability) => {
        const result = {};
        for (const [day, hours] of Object.entries(availability)) {
            result[day.toLowerCase()] = { arrayValue: { values: hours.map((h) => ({ integerValue: h })) } };
        }
        return { mapValue: { fields: result } };
    }

    convertFromFirebase = (firebaseAvailability) => {
        const availability = {};
        if (!firebaseAvailability || !firebaseAvailability.mapValue || !firebaseAvailability.mapValue.fields) return availability;
        for (const [day, hoursObj] of Object.entries(firebaseAvailability.mapValue.fields)) {
            if (hoursObj.arrayValue && hoursObj.arrayValue.values) {
                availability[day.charAt(0).toUpperCase() + day.slice(1)] = hoursObj.arrayValue.values.map((h) => parseInt(h.integerValue));
            }
        }
        return availability;
    }

    render() {
        const { loading, loading2, loading3, error, availability, eloDiff } = this.state;
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

        var rawName, nameParts, eloValue, wins, gamesPlayed, winRate;
        if (this.state.team !== null) {
            rawName = this.getGameValue(this.state.team[0], 'name') || '';
            nameParts = rawName.split(',');
            eloValue = Math.round(parseFloat(this.getGameValue(this.state.team[0], 'elo')));
            wins = parseInt(this.getGameValue(this.state.team[0], 'wins'));
            gamesPlayed = parseInt(this.getGameValue(this.state.team[0], 'gamesPlayed'));
            winRate = Math.round((wins / (gamesPlayed === 0 ? 1 : gamesPlayed)) * 100);
            var teamName = PLAYER_TO_TEAM.get(nameParts[0]);
            for (const n of nameParts)
                if (PLAYER_TO_TEAM.get(n) !== teamName)
                    teamName = null;
        }

        const handleSearchSubmit = async (e) => {
            e.preventDefault();
            const player1Name = this.state.player1Search.trim();
            const player2Name = this.state.player2Search.trim();
            if (player1Name && player2Name) {
                this.setState({
                    team: null,
                    loading2: true,
                    error: null
                });
                try {
                    const response = await fetch('https://us-central1-bingo-db-57e75.cloudfunctions.net/api/teams2/name/' + encodeURIComponent([player1Name, player2Name].sort().join(',')));
                    if (!response.ok) {
                        throw new Error(`API error: ${response.status}`);
                    }
                    const data = await response.json();
                    const teams = data.teams || [];
                    // console.log('Fetched team:', teams);
                    this.setState({
                        teams: null,
                        eloDiff: 200,
                        team: teams,
                        loading2: false,
                        error: null,
                        availability: teams.length > 0 ? this.convertFromFirebase(teams[0].info.availability) : {}
                    });
                } catch (error) {
                    console.error('Error fetching teams:', error);
                    this.setState({
                        error: error.message,
                        loading2: false
                    });
                }
            }
        };

        const createTeam = async () => {
            const player1Name = this.state.player1Search.trim();
            const player2Name = this.state.player2Search.trim();
            if (player1Name && player2Name) {
                // console.log(`Creating team for ${[player1Name, player2Name].sort().join(',')}`);
                this.setState({
                    team: null,
                    loading2: true,
                    error: null
                });
                try {
                    var response = await fetch('https://us-central1-bingo-db-57e75.cloudfunctions.net/api/team2', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            name: [player1Name, player2Name].sort().join(',')
                        })
                    });
                    if (!response.ok) {
                        throw new Error(`API error: ${response.status}`);
                    }

                    response = await fetch('https://us-central1-bingo-db-57e75.cloudfunctions.net/api/teams2/name/' + encodeURIComponent([player1Name, player2Name].sort().join(',')));
                    if (!response.ok) {
                        throw new Error(`API error: ${response.status}`);
                    }
                    const data = await response.json();
                    const teams = data.teams || [];
                    // console.log('Fetched team:', teams);
                    this.setState({
                        teams: null,
                        eloDiff: 200,
                        team: teams,
                        loading2: false,
                        error: null,
                        availability: teams.length > 0 ? this.convertFromFirebase(teams[0].info.availability) : {}
                    });
                } catch (error) {
                    console.error('Error creating team:', error);
                    this.setState({
                        error: error.message,
                        loading2: false
                    });
                }
            }
        };

        const saveTime = async (loading = true) => {
            const team = this.state.team[0];
            if (!team) return;
            // console.log(`Saving time for team ${this.getGameValue(team, 'name')}`);
            this.setState({
                loading2: loading,
                error: null
            });
            try {
                var response = await fetch(`https://us-central1-bingo-db-57e75.cloudfunctions.net/api/team222/${this.getGameValue(team, 'id')}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: this.getGameValue(team, 'name'),
                        availability: this.convertToFirebase(this.state.availability)
                    }),
                });
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }

                response = await fetch('https://us-central1-bingo-db-57e75.cloudfunctions.net/api/teams2/name/' + this.getGameValue(team, 'name'));
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }
                const data = await response.json();
                const teams = data.teams || [];
                // console.log('Fetched team:', teams);
                this.setState({
                    teams: null,
                    team: teams,
                    loading2: false,
                    error: null,
                    availability: teams.length > 0 ? this.convertFromFirebase(teams[0].info.availability) : {}
                });
            } catch (error) {
                console.error('Error saving availability:', error);
                this.setState({
                    error: error.message,
                    loading2: false,
                    availability: {},
                });
            }
        };

        const searchTeams = async () => {
            const team = this.state.team[0];
            if (!team) return;
            // console.log(`Searching for opponents for team ${this.getGameValue(team, 'name')} with ELO diff ${eloDiff}`);
            this.setState({
                loading3: true,
                error: null
            });
            await saveTime(false);
            try {
                var teams = await this.fetchTeams();
                var opponents = [];
                for (const t of teams) {
                    const elo = parseInt(this.getGameValue(t, 'elo'));
                    const teamElo = parseInt(this.getGameValue(team, 'elo'));
                    if (Math.abs(elo - teamElo) <= eloDiff && this.getGameValue(t, 'name') !== this.getGameValue(team, 'name')) {
                        const teamAvailability = this.convertFromFirebase(t.info.availability);
                        const commonAvailability = {};
                        for (const day of Object.keys(availability).sort((a, b) => days.indexOf(a) - days.indexOf(b))) {
                            if (teamAvailability[day]) {
                                const commonHours = availability[day].filter((h) => teamAvailability[day].includes(h));
                                if (commonHours.length > 0) {
                                    commonAvailability[day] = commonHours;
                                }
                            }
                        }
                        if (Object.keys(commonAvailability).length > 0) {
                            opponents.push({ team: t, commonAvailability });
                        }
                    }
                }
                this.setState({
                    teams: opponents,
                    loading3: false,
                    error: null,
                });
            } catch (error) {
                console.error('Error searching for opponents:', error);
                this.setState({
                    teams: null,
                    error: error.message,
                    loading3: false,
                });
            }
        };

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
                    <h1 className="text-4xl font-bold text-white mb-4">Find Your Team</h1>
                    <p className="mb-4">Enter the <span className="font-bold">Steam</span> username for each player on your team.</p>

                    {loading ? (
                        <div className="flex items-center justify-center py-24">
                            <p className="text-white text-xl">Loading teams...</p>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center py-24">
                            <p className="text-red-400 text-xl">Error loading teams</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            <form onSubmit={handleSearchSubmit} className="m-auto relative flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                    Player 1:
                                    <input
                                        type="search"
                                        placeholder="Username"
                                        value={this.state.player1Search}
                                        onChange={(e) => this.setState({ player1Search: e.target.value })}
                                        className="px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 w-48"
                                    />
                                    Player 2:
                                    <input
                                        type="search"
                                        placeholder="Username"
                                        value={this.state.player2Search}
                                        onChange={(e) => this.setState({ player2Search: e.target.value })}
                                        className="px-3 py-2 rounded bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 w-48"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="px-4 py-2 w-fit mx-auto relative bg-blue-500 text-white rounded hover:bg-blue-600 disabled:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                                    disabled={loading2}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                    </svg>
                                    <span className="pl-5">
                                        Search
                                    </span>
                                </button>
                            </form>

                            {loading2 ? (
                                <div className="flex items-center justify-center py-24">
                                    <p className="text-white text-xl">Loading team...</p>
                                </div>
                            ) : error ? (
                                <div className="flex items-center justify-center py-24">
                                    <p className="text-red-400 text-xl">Error loading team</p>
                                </div>
                            ) : this.state.team && (
                                this.state.team.length === 0 ? (
                                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                                        <p className="text-gray-400">No team found for those players.</p>
                                        <p className="text-gray-400">Would you like to create one?</p>
                                        <button
                                            className="px-4 py-2 mt-4 w-fit mx-auto relative bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                                            onClick={createTeam}
                                        >
                                            <span className="">
                                                Create Team
                                            </span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col">
                                        <div className="flex flex-col mx-auto mb-6 min-w-[75%]">
                                            <div className="flex flex-row bg-gray-800 border border-gray-700 rounded-lg p-6 cursor-default">
                                                <div className="flex flex-col my-auto">
                                                    <div className="flex flex-row items-center">
                                                        {teamName &&
                                                            <img
                                                                src={`https://firebasestorage.googleapis.com/v0/b/bingo-db-57e75.firebasestorage.app/o/team_icons%2FThe ${teamName}.png?alt=media`}
                                                                alt="Team Logo"
                                                                className="w-5 h-5 mt-1 mr-2"
                                                                title={`The ${teamName}`}
                                                            />}
                                                        <p className="text-2xl font-bold">
                                                            {nameParts.map((player, idx) =>
                                                                `${player}${idx === nameParts.length - 1 ? '' : ' & '}`
                                                            )}
                                                        </p>
                                                    </div>
                                                    <p>
                                                        <span className={`text-xl font-bold`}>
                                                            {eloValue}
                                                        </span> elo • <span className="text-xl font-semibold">{winRate}</span>% winrate
                                                    </p>
                                                </div>
                                                <div className="ml-auto my-auto text-right">
                                                    <p>
                                                        {this.getGameValue(this.state.team[0], 'gamesPlayed')} {this.getGameValue(this.state.team[0], 'gamesPlayed') === "1" ? "game" : "games"} • {wins}W {this.getGameValue(this.state.team[0], 'losses')}L
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <hr className="my-8 border-gray-700" />
                                        <h1 className="mb-4 text-4xl font-bold text-white">Team Availability</h1>
                                        <div className="mb-4 flex flex-col">
                                            <span>Click blocks to mark when your team is free.</span>
                                            <span>Each block covers a 2-hour window.</span>
                                        </div>
                                        <div className="flex flex-col items-center mx-auto mb-6 min-w-[75%]">
                                            <div className="flex flex-col">
                                                <table>
                                                    <tbody>
                                                        <tr>
                                                            {days.map((day) => (
                                                                <td key={day} className="text-center font-bold pb-4">{day}</td>
                                                            ))}
                                                        </tr>
                                                        {[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22].map((h) => (
                                                            <tr key={h}>
                                                                {days.map((day) => {
                                                                    const active = (availability[day] || []).includes(h);
                                                                    return (
                                                                        <td key={`${day}-${h}`} className="p-1">
                                                                            <button
                                                                                onClick={() => this.toggleBlock(day, h)}
                                                                                className={`w-full rounded p-2 ${active ? "bg-blue-500 opacity-90" : "bg-gray-700 opacity-40"} transition-colors duration-100`}
                                                                            >
                                                                                {this.hourToLocal(h)}
                                                                            </button>
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <button className="px-4 py-2 mt-6 w-fit mx-auto relative bg-green-500 text-white rounded hover:bg-green-600 disabled:hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-green-400 focus:border-green-400" onClick={saveTime} disabled={loading2}>
                                                Save Time
                                            </button>
                                        </div>
                                        <hr className="my-8 border-gray-700" />
                                        <h1 className="mb-4 text-4xl font-bold text-white">Schedule Match</h1>
                                        <div className="mb-4 flex flex-col">
                                            <span>Search for opponents with matching availability and in your elo range.</span>
                                        </div>
                                        <div className="flex flex-col items-center mx-auto mb-48 min-w-[75%]">
                                            <div className="flex flex-row items-center gap-2">
                                                <button className="px-4 py-2 mr-8 w-fit relative bg-blue-500 text-white rounded hover:bg-blue-600 disabled:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400" onClick={searchTeams} disabled={loading3}>
                                                    Search for Opponents
                                                </button>
                                                <div className="flex items-center gap-2">
                                                    <label>ELO diff</label>
                                                    <span className="font-bold">{`±${eloDiff}`}</span>
                                                </div>
                                                {/* <input type="range" min={50} max={400} step={25} value={eloDiff} onChange={(e) => this.setState({ eloDiff: Number(e.target.value) })} className="w-full" /> */}
                                            </div>

                                            {loading3 ? (
                                                <div className="flex items-center justify-center py-12">
                                                    <p className="text-white text-xl">Searching for opponents...</p>
                                                </div>
                                            ) : error ? (
                                                <div className="flex items-center justify-center py-12">
                                                    <p className="text-red-400 text-xl">Error searching for opponents</p>
                                                </div>
                                            ) : this.state.teams && this.state.teams.length === 0 ? (
                                                <div className="flex items-center justify-center py-12">
                                                    <p className="text-gray-400 text-xl">No opponents found with that ELO diff and availability.</p>
                                                </div>
                                            ) : this.state.teams && (
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                                    {this.state.teams.map(({ team, commonAvailability }) => {
                                                        const rawName = this.getGameValue(team, 'name') || '';
                                                        const nameParts = rawName.split(',');
                                                        const eloValue = Math.round(parseFloat(this.getGameValue(team, 'elo')));
                                                        const wins = parseInt(this.getGameValue(team, 'wins'));
                                                        const gamesPlayed = parseInt(this.getGameValue(team, 'gamesPlayed'));
                                                        const winRate = Math.round((wins / (gamesPlayed === 0 ? 1 : gamesPlayed)) * 100);
                                                        var teamName = PLAYER_TO_TEAM.get(nameParts[0]);
                                                        for (const n of nameParts)
                                                            if (PLAYER_TO_TEAM.get(n) !== teamName)
                                                                teamName = null;

                                                        return (
                                                            <div key={this.getGameValue(team, 'id')} className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                                                                <div className="mb-2 flex flex-col my-auto">
                                                                    <div className="flex flex-row items-center">
                                                                        {teamName &&
                                                                            <img
                                                                                src={`https://firebasestorage.googleapis.com/v0/b/bingo-db-57e75.firebasestorage.app/o/team_icons%2FThe ${teamName}.png?alt=media`}
                                                                                alt="Team Logo"
                                                                                className="w-5 h-5 mt-1 mr-2"
                                                                                title={`The ${teamName}`}
                                                                            />}
                                                                        <p className="text-2xl font-bold">
                                                                            {nameParts.map((player, idx) =>
                                                                                `${player}${idx === nameParts.length - 1 ? '' : ' & '}`
                                                                            )}
                                                                        </p>
                                                                    </div>
                                                                    <p>
                                                                        <span className={`text-xl font-bold`}>
                                                                            {eloValue}
                                                                        </span> elo • <span className="text-xl font-semibold">{winRate}</span>% winrate
                                                                    </p>
                                                                </div>
                                                                <div className="flex flex-col gap-2">
                                                                    {Object.keys(commonAvailability).map((slot, index) => (
                                                                        <p key={index} className="w-fit rounded-md bg-gray-600 py-0.5 px-2.5 text-sm shadow-sm">
                                                                            {slot} {commonAvailability[slot].map((h) => this.hourToLocal(h)).join(', ')}
                                                                        </p>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default Schedule;
