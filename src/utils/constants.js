export const TEAM_NAMES = [
    'Red',
    'Blue',
    'Green',
    'Orange',
    'Pink',
    'Cyan',
    'Black',
    'Indigo',
    'Peach',
    'Blizzard',
    'Board Viewer'
];

export const teamColors = ["#e60e0e66", "#0080ff66", "#33ff0066", "#ff990066", "#ff00ff66", "#00e8e666", "#5e5e6f66", "#5833ca66", "#ff788366", "#c7d9ff66", "#ffff7366", "#ffffff66"];

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

export const CHARACTER_TO_IMG = new Map();
CHARACTER_TO_IMG.set("White", "surv");
CHARACTER_TO_IMG.set("Yellow", "monk");
CHARACTER_TO_IMG.set("Red", "hunt");
CHARACTER_TO_IMG.set("Gourmand", "gourm");
CHARACTER_TO_IMG.set("Saint", "saint");
CHARACTER_TO_IMG.set("Spear", "spear");
CHARACTER_TO_IMG.set("Rivulet", "riv");
CHARACTER_TO_IMG.set("Artificer", "arti");
CHARACTER_TO_IMG.set("Inv", "inv");
CHARACTER_TO_IMG.set("Watcher", "wa");

export const CHARACTER_TO_NAME = new Map();
CHARACTER_TO_NAME.set("White", "Survivor");
CHARACTER_TO_NAME.set("Yellow", "Monk");
CHARACTER_TO_NAME.set("Red", "Hunter");
CHARACTER_TO_NAME.set("Gourmand", "Gourmand");
CHARACTER_TO_NAME.set("Saint", "Saint");
CHARACTER_TO_NAME.set("Spear", "Spearmaster");
CHARACTER_TO_NAME.set("Rivulet", "Rivulet");
CHARACTER_TO_NAME.set("Artificer", "Artificer");
CHARACTER_TO_NAME.set("Inv", "Inv");
CHARACTER_TO_NAME.set("Watcher", "Watcher");

export const CHARACTER_TO_BG = new Map();
CHARACTER_TO_BG.set("White", "landscape - su - flat");
CHARACTER_TO_BG.set("Yellow", "yellow intro b - flat");
CHARACTER_TO_BG.set("Red", "landscape - lf - flat");
CHARACTER_TO_BG.set("Gourmand", "landscape - oe - flat");
CHARACTER_TO_BG.set("Saint", "landscape - cl - flat");
CHARACTER_TO_BG.set("Spear", "landscape - dm - flat");
CHARACTER_TO_BG.set("Rivulet", "landscape - ms - flat");
CHARACTER_TO_BG.set("Artificer", "landscape - lc - flat");
CHARACTER_TO_BG.set("Inv", "outro 3 - face - flatb");
CHARACTER_TO_BG.set("Watcher", "outro prince 3-1 - flat");

export const CHARACTER_TO_BG2 = new Map();
CHARACTER_TO_BG2.set("White", "landscape - wpga - flat");
CHARACTER_TO_BG2.set("Yellow", "landscape - waua - flat");
CHARACTER_TO_BG2.set("Red", "landscape - wbla - flat");
CHARACTER_TO_BG2.set("Gourmand", "landscape - wskb - flat");
CHARACTER_TO_BG2.set("Saint", "landscape - wpta - flat");
CHARACTER_TO_BG2.set("Spear", "landscape - ward - flat");
CHARACTER_TO_BG2.set("Rivulet", "landscape - wrra - flat");
CHARACTER_TO_BG2.set("Artificer", "landscape - ware - flat");
CHARACTER_TO_BG2.set("Inv", "outro 3 - face - flatb");
CHARACTER_TO_BG2.set("Watcher", "outro prince 3-1 - flat");

export function getTeamName(teamIndex) {
    if (teamIndex === undefined || teamIndex === null) return null;
    const i = Number(teamIndex);
    return `Team ${TEAM_NAMES[i]}` ?? `Team ${i}`;
}
