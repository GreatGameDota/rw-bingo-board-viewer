import React, { Component } from 'react';
import { atlases } from '../lib/bingovista/bingovista';
import BingoCanvas from '../components/BingoCanvas';

class Board extends Component {
    constructor(props) {
        super(props);
        this.state = {
            boardData: null,
            loading: true,
            error: null,
        };
    }

    async componentDidMount() {
        // Adapted from bingovista.js – prepare atlases (same as AllGames)
        atlases[0].img = (await import("../lib/bingovista/bvicons.png")).default;
        atlases[0].txt = (await import("../lib/bingovista/bvicons.txt")).default;
        atlases[1].img = (await import("../lib/bingovista/bingoicons.png")).default;
        atlases[1].txt = (await import("../lib/bingovista/bingoicons.txt")).default;
        atlases[2].img = (await import("../lib/bingovista/uispritesmsc.png")).default;
        atlases[2].txt = (await import("../lib/bingovista/uispritesmsc.txt")).default;
        atlases[3].img = (await import("../lib/bingovista/uiSprites.png")).default;
        atlases[3].txt = (await import("../lib/bingovista/uiSprites.txt")).default;
        atlases[4].img = (await import("../lib/bingovista/uispriteswatcher.png")).default;
        atlases[4].txt = (await import("../lib/bingovista/uispriteswatcher.txt")).default;

        function loadImage(src, dest) {
            return new Promise(function (resolve, reject) {
                var img = document.createElement("img");
                img.addEventListener("load", function () {
                    var canv = document.createElement("canvas");
                    canv.width = img.naturalWidth; canv.height = img.naturalHeight;
                    var ctx = canv.getContext("2d");
                    ctx.drawImage(img, 0, 0);
                    dest.canv = canv;
                    resolve();
                });
                img.crossOrigin = "anonymous";
                img.addEventListener("error", () => reject({ message: "Error loading image " + src + "." }));
                img.src = src;
            });
        }

        function loadJson(src, dest) {
            return fetch(src).then(function (response, reject) {
                if (!response.ok)
                    return reject(new DOMException("URL " + response.url + " error " + response.status + " " + response.statusText + ".", "NetworkError"));
                return response.text();
            }).catch((e) => {
                return Promise.reject(e);
            }).then((s) => {
                dest.frames = JSON.parse(s).frames;
            });
        }

        function loadClosure(s, d, f) {
            return f(s, d);
        }

        var loaders = [];
        for (var i = 0; i < atlases.length; i++) {
            loaders.push(loadClosure(atlases[i].img, atlases[i], loadImage));
        };
        for (var i = 0; i < atlases.length; i++) {
            loaders.push(loadClosure(atlases[i].txt, atlases[i], loadJson));
        };
        Promise.all(loaders).catch(function (e) {
            console.log("Promise.all(): failed to complete fetches. Error: " + e.message);
        });

        this.fetchBoardData();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.boardId !== this.props.boardId) {
            this.setState({ loading: true, error: null, boardData: null });
            this.fetchBoardData();
        }
    }

    fetchBoardData = async () => {
        const { boardId } = this.props;
        if (!boardId) return;
        try {
            const response = await fetch('https://us-central1-bingo-db-57e75.cloudfunctions.net/api/boardRepo/' + encodeURIComponent(boardId));
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            const data = await response.json();
            const games = data.board || [];
            this.setState({
                boardData: games,
                loading: false,
                error: null,
            });
        } catch (error) {
            console.error('Error fetching games:', error);
            this.setState({
                error: error.message,
                loading: false
            });
        }
    }

    render() {
        const { boardData, loading, error } = this.state;
        const { boardId } = this.props;

        return (
            <div className="flex-grow">
                {loading ? <p>Loading...</p> :
                    <div className="w-fit mx-auto">
                        <BingoCanvas
                            bingoString={boardData.boardString.stringValue}
                            boardState={"000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000<>000000000".split("<>")}
                            team={Number(0)}
                            size={500}
                        />
                    </div>}
            </div>
        );
    }
}

export default Board;
