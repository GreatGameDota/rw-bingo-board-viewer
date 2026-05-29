import React, { Component } from 'react';

class Credits extends Component {

    componentDidMount() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    render() {
        const Link = ({ href, children }) => {
            return <a href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition-colors duration-200 underline font-bold w-fit">{children}</a>
        };

        return (
            <div className="flex flex-row min-w-full min-h-[100vh]">
                {/* <div className="w-full h-32 overflow-hidden">
                    <img
                        src="https://firebasestorage.googleapis.com/v0/b/bingo-db-57e75.firebasestorage.app/o/Illustration807.png?alt=media"
                        alt="Bingo Board Banner"
                        className="w-full h-full object-cover"
                    />
                </div> */}
                <div className="hidden sm:flex w-[25%] bg-gradient-to-br from-red-600 to-blue-600 shadow-[inset_50px_0_50px_rgba(0,0,0,0.2)]" />
                <div className="flex flex-col p-8 min-w-[75%] h-full mx-auto bg-gray-700">
                    <h1 className="text-4xl font-bold text-white mb-8" style={{ fontFamily: 'RainWorldRodondo', fontSize: '48px' }}>Credits</h1>

                    <p><span style={{ fontFamily: 'RainWorldRodondo', fontSize: '36px' }}>T3sl4co1l</span> <span>@t3sl4co1l</span></p>
                    <div className="mb-4 ml-8 flex flex-col">
                        <p>Creator of <Link href="https://t3sl4co1l.github.io/bingovista/bingovista.html">BingoVista</Link> which this project forks for all bingo board displays. Also the main inspiration for this project.</p>
                        <Link href="https://github.com/T3sl4co1l/bingovista/">Github</Link>
                        <Link href="https://www.seventransistorlabs.com/">Website</Link>
                    </div>

                    <p><span style={{ fontFamily: 'RainWorldRodondo', fontSize: '36px' }}>shrub</span> <span>@shrubfromtomorrow</span></p>
                    <div className="mb-4 ml-8 flex flex-col">
                        <p>Maker of Bingo logo assets and main developer of the <Link href="https://steamcommunity.com/sharedfiles/filedetails/?id=3441764924">Bingo mod</Link>.</p>
                        <Link href="https://www.twitch.tv/shrubfromtomorrow">Twitch</Link>
                        <Link href="https://www.youtube.com/channel/UCHnYWAEcd17omBMB0Z4wlyg">Youtube</Link>
                    </div>

                    <p><span style={{ fontFamily: 'RainWorldRodondo', fontSize: '36px' }}>Ken</span> <span>@glamnet</span></p>
                    <div className="mb-4 ml-8 flex flex-col">
                        <p>Creator of slugcat sprite art</p>
                        <Link href="https://tumblr.com/netdraws">Tumblr</Link>
                        <Link href="https://x.com/glamnet_">Twitter</Link>
                    </div>

                    <p><span style={{ fontFamily: 'RainWorldRodondo', fontSize: '36px' }}>Saren</span> <span>@saren.exe</span></p>
                    <div className="mb-4 ml-8 flex flex-col">
                        <p>Creator of the survivor Bingo menu art and apart of the home page art slideshow</p>
                        <Link href="https://www.twitch.tv/saren">Twitch</Link>
                        <Link href="https://bsky.app/profile/sarenstone.com">Bluesky</Link>
                        <Link href="http://sarenstone.com/">Website</Link>
                    </div>

                    <p><span style={{ fontFamily: 'RainWorldRodondo', fontSize: '36px' }}>AnnoyingFlower</span> <span>@annoying_flower</span></p>
                    <div className="mb-4 ml-8 flex flex-col">
                        <p>Creator of the Watcher Bingo menu art</p>
                        <Link href="https://x.com/annoying_flower">Twitter</Link>
                    </div>

                    <p><span style={{ fontFamily: 'RainWorldRodondo', fontSize: '36px' }}>WILD</span> <span>@wildslugcat</span></p>
                    <div className="mb-4 ml-8 flex flex-col">
                        <p>Bingo event artist, more than one artwork featured on the home page and used for other page backgrounds</p>
                        <Link href="https://bsky.app/profile/bewilderbark.bsky.social">Bluesky</Link>
                    </div>

                    <p><span style={{ fontFamily: 'RainWorldRodondo', fontSize: '36px' }}>Ravenmind</span> <span>@ravenmind_artist</span></p>
                    <div className="mb-4 ml-8 flex flex-col">
                        <p>Bingo event artist, apart of the home page art slideshow, and Watcher region artist</p>
                        <Link href="https://linktr.ee/ravenmind_artist">LinkTree</Link>
                        <Link href="https://bsky.app/profile/ravenmind.bsky.social">Bluesky</Link>
                    </div>

                    <p><span style={{ fontFamily: 'RainWorldRodondo', fontSize: '36px' }}>Mantis</span> <span>@the_rivulet</span></p>
                    <div className="mb-4 ml-8 flex flex-col">
                        <p>Extracted and converted <span style={{ fontFamily: 'RainWorldMenu', fontSize: '20px' }}>Rain World's menu font to ttf, used for board display.</span></p>
                        <Link href="https://www.youtube.com/channel/UCrdXLtM8H3u41r475efFuFg">Youtube</Link>
                    </div>

                    <p><span style={{ fontFamily: 'RainWorldRodondo', fontSize: '36px' }}>Nanoferret</span> <span>@nanoferret</span></p>
                    <div className="mb-4 ml-8 flex flex-col">
                        <p>Bingo event artist, apart of the home page art slideshow</p>
                        <Link href="https://nanoferret-comms.carrd.co/">Carrd</Link>
                    </div>

                    <p><span style={{ fontFamily: 'RainWorldRodondo', fontSize: '36px' }}>unmatchedpowerofthesun</span> <span>@unmatchedpowerofthesun</span></p>
                    <div className="mb-4 ml-8 flex flex-col">
                        <p>Bingo event artist, apart of the home page art slideshow</p>
                    </div>

                    <hr className="mt-4" />
                    <h1 className="mt-8 text-4xl font-bold text-white mb-8" style={{ fontFamily: 'RainWorldRodondo', fontSize: '48px' }}>Watcher region art credits</h1>

                    <p><span style={{ fontFamily: 'RainWorldRodondo', fontSize: '36px' }}>Kalidoesart (WVWA)</span> <span>@kalidoesart</span></p>
                    <div className="mb-4 ml-8 flex flex-col">
                        <Link href="https://x.com/kalidoesart">Twitter</Link>
                    </div>

                    <p><span style={{ fontFamily: 'RainWorldRodondo', fontSize: '36px' }}>Smudge (WARG)</span> <span>@anglesmudge</span></p>
                    <div className="mb-4 ml-8 flex flex-col">
                        <Link href="https://bsky.app/profile/anglesmudge.bsky.social">Bluesky</Link>
                    </div>

                    <p><span style={{ fontFamily: 'RainWorldRodondo', fontSize: '36px' }}>Astroik (WARA, WRFB)</span> <span>@astroik_</span></p>
                    <div className="mb-4 ml-8 flex flex-col">
                        <Link href="https://www.instagram.com/astroik_">Instagram</Link>
                    </div>

                    <p><span style={{ fontFamily: 'RainWorldRodondo', fontSize: '36px' }}>YSHM (WPTA, WARC, WVWB (+Sigma))</span> <span>@yshm</span></p>
                    <div className="mb-4 ml-8 flex flex-col">
                        <Link href="https://www.tumblr.com/blog/yyshm">Tumblr</Link>
                    </div>

                    <p><span style={{ fontFamily: 'RainWorldRodondo', fontSize: '36px' }}>Sparkbreeze (WSKD, WHIR)</span> <span>@sparkbreeze</span></p>
                    <div className="mb-4 ml-8 flex flex-col">
                        <Link href="https://x.com/thesparkbreeze">Twitter</Link>
                        <Link href="https://bsky.app/profile/sparkbreeze.bsky.social">Bluesky</Link>
                    </div>

                    <p><span style={{ fontFamily: 'RainWorldRodondo', fontSize: '36px' }}>Headintheklouds (WTDA)</span> <span>@headintheklouds</span></p>
                    <div className="mb-4 ml-8 flex flex-col">
                        <Link href="https://www.tumblr.com/headin-theklouds">Tumblr</Link>
                    </div>

                    <p><span style={{ fontFamily: 'RainWorldRodondo', fontSize: '36px' }}>Yellow Ghost (WTDB)</span> <span>@yellow_ghozt</span></p>
                    <div className="mb-4 ml-8 flex flex-col">
                        <Link href="https://www.youtube.com/@yellow_ghozt">Youtube</Link>
                    </div>

                    <p><span style={{ fontFamily: 'RainWorldRodondo', fontSize: '36px' }}>River the Gremlin (WARE, WSUR)</span> <span>@_river_the_gremlin_</span></p>
                    <div className="mb-4 ml-8 flex flex-col">
                        <Link href="https://bsky.app/profile/riverthegremlin.bsky.social">Bluesky</Link>
                        <Link href="https://www.tumblr.com/riverthegremlin">Tumblr</Link>
                    </div>

                    <p><span style={{ fontFamily: 'RainWorldRodondo', fontSize: '36px' }}>Opsiian (WORA, WGWR)</span> <span>@opsiian</span></p>
                    <div className="mb-4 ml-8 flex flex-col">
                        <Link href="https://www.tumblr.com/darkopsiian">Tumblr</Link>
                        <Link href="https://x.com/NockzuisBunk">Twitter</Link>
                        <Link href="https://bsky.app/profile/darksopsiian.bsky.social">Bluesky</Link>
                    </div>

                    <p><span style={{ fontFamily: 'RainWorldRodondo', fontSize: '36px' }}>Irri (WBLA, WARD, WMPA, WARB, WSKA (+Alkali))</span> <span>@irritatorchallengeri.</span></p>
                    <div className="mb-4 ml-8 flex flex-col">
                        <Link href="https://www.youtube.com/@Irritator_challengeri-1313">Youtube</Link>
                    </div>

                    <p><span style={{ fontFamily: 'RainWorldRodondo', fontSize: '36px' }}>Alkali (WSKA (+Irri))</span> <span>@alkali</span></p>
                    <div className="mb-4 ml-8 flex flex-col">
                    </div>

                    <p><span style={{ fontFamily: 'RainWorldRodondo', fontSize: '36px' }}>Cas (WARF, WSKB)</span> <span>@casver_w</span></p>
                    <div className="mb-4 ml-8 flex flex-col">
                        <Link href="https://x.com/Casver_W">Twitter</Link>
                        <Link href="https://bsky.app/profile/casver.bsky.social">Bluesky</Link>
                    </div>

                    <p><span style={{ fontFamily: 'RainWorldRodondo', fontSize: '36px' }}>Willow (WPGA)</span> <span>@willowwisperr</span></p>
                    <div className="mb-4 ml-8 flex flex-col">
                        <Link href="https://www.tumblr.com/willowwisperr">Tumblr</Link>
                        <Link href="https://bsky.app/profile/willowwisperr.bsky.social">Bluesky</Link>
                    </div>

                    <p><span style={{ fontFamily: 'RainWorldRodondo', fontSize: '36px' }}>Ravenmind (WRRA, WAUA, WDSR, WSSR)</span> <span>@ravenmind_artist</span></p>
                    <div className="mb-4 ml-8 flex flex-col">
                        <Link href="https://linktr.ee/ravenmind_artist">LinkTree</Link>
                        <Link href="https://bsky.app/profile/ravenmind.bsky.social">Bluesky</Link>
                    </div>

                    <p><span style={{ fontFamily: 'RainWorldRodondo', fontSize: '36px' }}>Fishnoid (WRFA)</span> <span>@fishnoid</span></p>
                    <div className="mb-4 ml-8 flex flex-col">
                        <Link href="https://www.youtube.com/@fishnoid9672">Youtube</Link>
                    </div>

                    <p><span style={{ fontFamily: 'RainWorldRodondo', fontSize: '36px' }}>NOTOCORDA (WSKC)</span> <span>@notocorda</span></p>
                    <div className="mb-4 ml-8 flex flex-col">
                        <Link href="https://notocorda.carrd.co/">Carrd</Link>
                    </div>

                    <p><span style={{ fontFamily: 'RainWorldRodondo', fontSize: '36px' }}>Sigma (WVWB (+YSHM))</span> <span>@sigmanin</span></p>
                    <div className="mb-4 ml-8 flex flex-col">
                        <Link href="https://x.com/Sigmanin">Twitter</Link>
                        <Link href="https://www.youtube.com/@Sigmanins">Youtube</Link>
                    </div>
                </div>
                <div className="hidden sm:flex w-[25%] bg-gradient-to-tr from-cyan-600 to-orange-600 shadow-[inset_-50px_0_50px_rgba(0,0,0,0.2)]" />
            </div >
        );
    }
}

export default Credits;
