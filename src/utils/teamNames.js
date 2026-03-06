export const TEAM_NAMES = [
    'Red',
    'Blue',
    'Green',
    'Orange',
    'Pink',
    'Cyan',
    'Black',
    'Hurricane',
    'Board Viewer'
];

export function getTeamName(teamIndex) {
    if (teamIndex === undefined || teamIndex === null) return null;
    const i = Number(teamIndex);
    return `Team ${TEAM_NAMES[i]}` ?? `Team ${i}`;
}
