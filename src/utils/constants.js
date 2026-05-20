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

export const BINGO_TEAMS = [
    'Adept', 'Apostle', 'Arbiter', 'Aristocrat', 'Champion', 'Collective', 'Custodian', 'Cycle', 'Doomed', 'Echo', 'Exiled', 'Forbidden', 'Forgotten', 'Gambler', 'Gatherer', 'Guide', 'Helping Hand', 'Hermit', 'Hoarder', 'Innovative', 'Inquisitive', 'Lost', 'Martyr', 'Messenger', 'Migration', 'Outsider', 'Peacekeeper', 'Probably Will Not Use This One', 'Pupil', 'Reaper', 'Retainer', 'Scholar', 'Steward', 'Temperate', 'Voyager', 'Vulture Slayer', 'Wanderlust', 'Ward', 'Warlord'
];

export var TEAM_NAMES_TO_IMAGE = new Map();
TEAM_NAMES_TO_IMAGE.set("Winterglide,YSHM", "Warlord");
TEAM_NAMES_TO_IMAGE.set("Moxie2017,some_dingus", "Reaper");
TEAM_NAMES_TO_IMAGE.set("GreatGameDota,Polarcat", "Doomed");
TEAM_NAMES_TO_IMAGE.set("107651,Wet Fish", "Messenger");
TEAM_NAMES_TO_IMAGE.set("Irri,Twizlet", "Gatherer");
TEAM_NAMES_TO_IMAGE.set("BrianTheDrummer,Gzethicus", "Adept");
TEAM_NAMES_TO_IMAGE.set("Potato!,TimaFrolov", "Pupil");
TEAM_NAMES_TO_IMAGE.set("Supervillain Joe,Tactical Ferret", "Gambler");

export var PLAYER_TO_TEAM = new Map();
PLAYER_TO_TEAM.set("Winterglide", "Warlord");
PLAYER_TO_TEAM.set("YSHM", "Warlord");
PLAYER_TO_TEAM.set("Moxie2017", "Reaper");
PLAYER_TO_TEAM.set("some_dingus", "Reaper");
PLAYER_TO_TEAM.set("Polarcat", "Doomed");
PLAYER_TO_TEAM.set("GreatGameDota", "Doomed");
PLAYER_TO_TEAM.set("107651", "Messenger");
PLAYER_TO_TEAM.set("Wet Fish", "Messenger");
PLAYER_TO_TEAM.set("Irri", "Gatherer");
PLAYER_TO_TEAM.set("Twizlet", "Gatherer");
PLAYER_TO_TEAM.set("BrianTheDrummer", "Adept");
PLAYER_TO_TEAM.set("Gzethicus", "Adept");
PLAYER_TO_TEAM.set("Potato!", "Pupil");
PLAYER_TO_TEAM.set("TimaFrolov", "Pupil");
PLAYER_TO_TEAM.set("Supervillain Joe", "Gambler");
PLAYER_TO_TEAM.set("Tactical Ferret", "Gambler");

export function getTeamName(teamIndex) {
    if (teamIndex === undefined || teamIndex === null) return null;
    const i = Number(teamIndex);
    return `Team ${TEAM_NAMES[i]}` ?? `Team ${i}`;
}
