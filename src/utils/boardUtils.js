
export const extractChallengeNames = (text) => {
    if (!text) return '';

    let normalizedText = text;
    const shelter = normalizedText.split(';').length === 3 ? normalizedText.split(';')[1] : normalizedText.split(';')[2];
    if (shelter && shelter !== "random" && (shelter[0] === 'r' || shelter[0] === 's')) {
        const parts = normalizedText.split(';');
        parts[2] = parts[2].substring(1);
        normalizedText = parts.join(';');
    }

    const lastSemicolon = normalizedText.lastIndexOf(';');
    const challenges = normalizedText.substring(lastSemicolon + 1).split('bChG');
    const size = Math.round(Math.sqrt(challenges.length));
    let next = 0;
    let cleanedChallenges = '';

    for (let j = 0; j < size; j += 1) {
        for (let i = 0; i < size; i += 1) {
            const array11 = challenges[next].split('~');
            const type = array11[0];
            let replaced;
            const separator = next === challenges.length - 1 ? '' : 'bChG';

            if (type === 'BingoDontUseItemChallenge' || type === 'WatcherBingoDontUseItemChallenge') {
                const segs = challenges[next].split('><');
                segs[2] = '0';
                segs[3] = '0';
                replaced = segs.join('><');
                cleanedChallenges += replaced + separator;
            } else if (type === 'BingoVistaChallenge') {
                const segs = challenges[next].split('><');
                segs[4] = '0';
                segs[5] = '0';
                replaced = segs.join('><');
                cleanedChallenges += replaced + separator;
            } else if (type === 'BingoBombTollChallenge' || type === 'WatcherBingoBombTollChallenge') {
                const segs = challenges[next].split('><');
                if (segs.length === 4) {
                    segs[2] = '0';
                    segs[3] = '0';
                } else {
                    segs[3] = '0';
                    segs[5] = 'empty';
                    segs[6] = '0';
                    segs[7] = '0';
                }
                replaced = segs.join('><');
                cleanedChallenges += replaced + separator;
            } else if (type === 'BingoCollectPearlChallenge' || type === 'WatcherBingoCollectPearlChallenge') {
                const segs = challenges[next].split('><');
                segs[2] = '0';
                segs[4] = '0';
                segs[5] = '0';
                segs[6] = '';
                replaced = segs.join('><');
                cleanedChallenges += replaced + separator;
            } else if (type === 'BingoCreatureGateChallenge') {
                const segs = challenges[next].split('><');
                segs[1] = '0';
                segs[3] = 'empty';
                segs[4] = '0';
                segs[5] = '0';
                replaced = segs.join('><');
                cleanedChallenges += replaced + separator;
            } else if (type === 'BingoEatChallenge' || type === 'WatcherBingoEatChallenge') {
                const segs = challenges[next].split('><');
                segs[1] = '0';
                segs[segs.length === 6 ? 4 : 5] = '0';
                segs[segs.length === 6 ? 5 : 6] = '0';
                replaced = segs.join('><');
                cleanedChallenges += replaced + separator;
            } else if (type === 'BingoEchoChallenge') {
                const segs = challenges[next].split('><');
                if (segs.length === 4) {
                    segs[2] = '0';
                    segs[3] = '0';
                } else {
                    segs[3] = '0';
                    segs[5] = '0';
                    segs[6] = '0';
                    segs[7] = '';
                }
                replaced = segs.join('><');
                cleanedChallenges += replaced + separator;
            } else if (type === 'BingoHatchNoodleChallenge') {
                const segs = challenges[next].split('><');
                if (segs.length === 5) {
                    const segs2 = segs[0].split('~');
                    segs2[1] = '0';
                    segs[0] = segs2.join('~');
                    segs[3] = '0';
                    segs[4] = '0';
                } else {
                    segs[3] = '0';
                    segs[5] = '';
                    segs[6] = '0';
                    segs[7] = '0';
                }
                replaced = segs.join('><');
                cleanedChallenges += replaced + separator;
            } else if (type === 'BingoItemHoardChallenge') {
                const segs = challenges[next].split('><');
                if (segs.length === 4) {
                    segs[2] = '0';
                    segs[3] = '0';
                } else if (segs.length === 7) {
                    segs[1] = '0';
                    segs[4] = '0';
                    segs[5] = '0';
                    segs[6] = '';
                } else {
                    segs[1] = '0';
                    segs[5] = '0';
                    segs[6] = '0';
                    segs[7] = '';
                }
                replaced = segs.join('><');
                cleanedChallenges += replaced + separator;
            } else if (type === 'BingoKarmaFlowerChallenge') {
                const segs = challenges[next].split('><');
                if (segs.length === 4) {
                    const segs2 = segs[0].split('~');
                    segs2[1] = '0';
                    segs[0] = segs2.join('~');
                    segs[2] = '0';
                    segs[3] = '0';
                } else {
                    segs[3] = '0';
                    segs[5] = '';
                    segs[6] = '0';
                    segs[7] = '0';
                }
                replaced = segs.join('><');
                cleanedChallenges += replaced + separator;
            } else if (type === 'BingoKillChallenge') {
                const segs = challenges[next].split('><');
                segs[3] = '0';
                segs[9] = '0';
                segs[10] = '0';
                replaced = segs.join('><');
                cleanedChallenges += replaced + separator;
            } else if (type === 'BingoMaulTypesChallenge') {
                const segs = challenges[next].split('><');
                const segs2 = segs[0].split('~');
                segs2[1] = '0';
                segs[0] = segs2.join('~');
                segs[2] = '0';
                segs[3] = '0';
                segs[4] = '';
                replaced = segs.join('><');
                cleanedChallenges += replaced + separator;
            } else if (type === 'BingoPearlHoardChallenge') {
                const segs = challenges[next].split('><');
                if (segs.length === 5) {
                    segs[3] = '0';
                    segs[4] = '0';
                } else {
                    segs[2] = '0';
                    segs[5] = '0';
                    segs[6] = '0';
                    segs[7] = '';
                }
                replaced = segs.join('><');
                cleanedChallenges += replaced + separator;
            } else if (type === 'BingoPinChallenge') {
                const segs = challenges[next].split('><');
                const segs2 = segs[0].split('~');
                segs2[1] = '0';
                segs[0] = segs2.join('~');
                segs[3] = '';
                segs[5] = '0';
                segs[6] = '0';
                replaced = segs.join('><');
                cleanedChallenges += replaced + separator;
            } else if (type === 'BingoPopcornChallenge') {
                const segs = challenges[next].split('><');
                if (segs.length === 4) {
                    const segs2 = segs[0].split('~');
                    segs2[1] = '0';
                    segs[0] = segs2.join('~');
                    segs[2] = '0';
                    segs[3] = '0';
                } else {
                    segs[3] = '0';
                    segs[5] = '';
                    segs[6] = '0';
                    segs[7] = '0';
                }
                replaced = segs.join('><');
                cleanedChallenges += replaced + separator;
            } else if (type === 'BingoTameChallenge' || type === 'WatcherBingoTameChallenge') {
                const segs = challenges[next].split('><');
                if (segs.length === 3) {
                    segs[1] = '0';
                    segs[2] = '0';
                } else if (segs.length === 7) {
                    segs[2] = '0';
                    segs[4] = '0';
                    segs[5] = '0';
                    segs[6] = '';
                } else {
                    segs[2] = '0';
                    segs[4] = '0';
                    segs[5] = '0';
                    segs[6] = '';
                    segs[7] = '';
                }
                replaced = segs.join('><');
                cleanedChallenges += replaced + separator;
            } else if (type === 'BingoTradeTradedChallenge') {
                const segs = challenges[next].split('><');
                const segs2 = segs[0].split('~');
                segs2[1] = '0';
                segs[0] = segs2.join('~');
                segs[2] = 'empty';
                segs[3] = '0';
                segs[4] = '0';
                replaced = segs.join('><');
                cleanedChallenges += replaced + separator;
            } else if (type === 'BingoTransportChallenge') {
                const segs = challenges[next].split('><');
                segs[3] = '';
                segs[4] = '0';
                segs[5] = '0';
                replaced = segs.join('><');
                cleanedChallenges += replaced + separator;
            } else if (type === 'BingoGourmandCrushChallenge') {
                const segs = challenges[next].split('><');
                const segs2 = segs[0].split('~');
                segs2[1] = '0';
                segs[0] = segs2.join('~');
                segs[2] = '0';
                segs[3] = '0';
                segs[4] = '';
                replaced = segs.join('><');
                cleanedChallenges += replaced + separator;
            } else if (type === 'BingoLickChallenge') {
                const segs = challenges[next].split('><');
                const segs2 = segs[0].split('~');
                segs2[1] = '0';
                segs[0] = segs2.join('~');
                segs[2] = '0';
                segs[3] = '0';
                segs[4] = '';
                replaced = segs.join('><');
                cleanedChallenges += replaced + separator;
            } else if (type === 'WatcherBingoSpinningTopChallenge') {
                const segs = challenges[next].split('><');
                segs[3] = '0';
                segs[5] = '0';
                segs[6] = '0';
                segs[7] = '';
                replaced = segs.join('><');
                cleanedChallenges += replaced + separator;
            } else if (type === 'WatcherBingoOpenMelonsChallenge') {
                const segs = challenges[next].split('><');
                if (segs.length === 4) {
                    const segs2 = segs[0].split('~');
                    segs2[1] = '0';
                    segs[0] = segs2.join('~');
                    segs[2] = '0';
                    segs[3] = '0';
                } else if (segs.length === 5) {
                    const segs2 = segs[0].split('~');
                    segs2[1] = '0';
                    segs[0] = segs2.join('~');
                    segs[3] = '0';
                    segs[4] = '0';
                } else {
                    segs[3] = '0';
                    segs[5] = '';
                    segs[6] = '0';
                    segs[7] = '0';
                }
                replaced = segs.join('><');
                cleanedChallenges += replaced + separator;
            } else if (type === 'WatcherBingoCreaturePortalChallenge') {
                const segs = challenges[next].split('><');
                segs[1] = '0';
                segs[3] = 'empty';
                segs[4] = '0';
                segs[5] = '0';
                replaced = segs.join('><');
                cleanedChallenges += replaced + separator;
            } else if (type === 'BingoShelterChallenge') {
                const segs = challenges[next].split('><');
                segs[3] = '0';
                segs[5] = '';
                segs[6] = '0';
                segs[7] = '0';
                replaced = segs.join('><');
                cleanedChallenges += replaced + separator;
            } else if (type === 'WatcherBingoAllRegionsExceptChallenge' || type === 'BingoAllRegionsExceptChallenge') {
                const segs = challenges[next].split('><');
                segs[1] = 'CC|DS|HI|GW|SI|SU|SH|SL|LF|UW|SB|SS|MS|OE|HR|LM|DM|LC|RM|CL|UG|VS|WVWA|WVWB|WRRA|WPGA|WARA|WARB|WARC|WARD|WARE|WARF|WARG|WMPA|WAUA|WBLA|WPTA|WRFA|WRFB|WRSA|WSKA|WSKB|WSKC|WSKD|WTDA|WTDB|WORA|WDSR|WGWR|WHIR|WSSR|WSUR';
                segs[2] = '0';
                segs[4] = '0';
                segs[5] = '0';
                replaced = segs.join('><');
                cleanedChallenges += replaced + separator;
            } else {
                replaced = challenges[next].replace(/[<~]-?\d+>|[<~]-?\d+$/g, (m) => {
                    const inner = m.endsWith('>') ? m.substring(1, m.length - 1) : m.substring(1);
                    return !isNaN(parseInt(inner, 10)) ? (m.endsWith('>') ? m[0] + '0>' : m[0] + '0') : m;
                });
                cleanedChallenges += replaced + separator;
            }

            next += 1;
        }
    }

    return normalizedText.substring(0, lastSemicolon + 1) + cleanedChallenges;
};
