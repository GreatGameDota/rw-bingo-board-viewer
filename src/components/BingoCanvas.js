import React, { Component } from "react";
import { CHALLENGES, BingoEnum_CharToDisplayText, drawSquare, atlases, board } from "../lib/bingovista/bingovista.js";

class BingoCanvas extends Component {
    constructor(props) {
        super(props);
        this.canvasRef = React.createRef();
    }

    async componentDidMount() {
        // Adapted from bingovista.js
        const square = {
            width: 85,
            height: 85,
            margin: 4,
            border: 2,
            color: "#ffffff",
            background: "#020204",
            font: "600 10pt \"Segoe UI\", sans-serif"
        };
        var transpose = true;

        //	Prepare atlases
        atlases[0].img = await import("../lib/bingovista/bvicons.png");
        atlases[0].txt = await import("../lib/bingovista/bvicons.txt");
        atlases[1].img = await import("../lib/bingovista/bingoicons.png");
        atlases[1].txt = await import("../lib/bingovista/bingoicons.txt");
        atlases[2].img = await import("../lib/bingovista/uispritesmsc.png");
        atlases[2].txt = await import("../lib/bingovista/uispritesmsc.txt");
        atlases[3].img = await import("../lib/bingovista/uiSprites.png");
        atlases[3].txt = await import("../lib/bingovista/uiSprites.txt");

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
                img.src = src.default; // IMPORTANT: Changed to .default because we import modules
            });
        }

        function loadJson(src, dest) {
            return fetch(src.default).then(function (response, reject) { // IMPORTANT: Changed to .default because we import modules
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
        }).finally(() => {
            var s = this.props.bingoString;
            s = s.trim().replace(/\s*bChG\s*/g, "bChG");
            var goals = s.split(/bChG/);
            var size = Math.ceil(Math.sqrt(goals.length));

            board.comments = "Untitled";
            board.character = "Any";
            board.perks = 0;
            board.shelter = "";
            board.mods = [];
            board.size = size;
            board.width = size;
            board.height = size;
            board.goals = [];
            board.toBin = undefined;
            
            if (goals[0].search(/[A-Za-z]{1,12}[_;]/) == 0) {
                //	Seems 0.86 or 0.90, find which
                if (goals[0].indexOf(";") > 0) {
                    board.version = "0.90";
                    board.character = goals[0].substring(0, goals[0].indexOf(";"));
                    goals[0] = goals[0].substring(goals[0].indexOf(";") + 1);
                } else if (goals[0].indexOf("_") > 0) {
                    board.version = "0.86";
                    board.character = goals[0].substring(0, goals[0].indexOf("_"));
                    goals[0] = goals[0].substring(goals[0].indexOf("_") + 1);
                }
                board.character = BingoEnum_CharToDisplayText[board.character] || "Any";
            } else {
                board.version = "0.85";
            }

            for (var i = 0; i < goals.length; i++) {
                var type, desc;
                if (goals[i].search("~") > 0 && goals[i].search("><") > 0) {
                    [type, desc] = goals[i].split("~");
                    desc = desc.split(/></);
                    if (type === "BingoMoonCloak") type = "BingoMoonCloakChallenge";	//	1.08 hack
                    if (CHALLENGES[type] !== undefined) {
                        try {
                            board.goals.push(CHALLENGES[type](desc));
                        } catch (er) {
                            board.goals.push(CHALLENGES["BingoChallenge"]([
                                "Error: " + er.message + "; descriptor: " + desc.join("><")]));
                        }
                    } else {
                        board.goals.push(CHALLENGES["BingoChallenge"](["Error: unknown type: [" + type + "," + desc.join(",") + "]"]));
                    }
                } else {
                    board.goals.push(CHALLENGES["BingoChallenge"](["Error extracting goal: " + goals[i]]));
                }
            }

            var canv = this.canvasRef.current;
            square.margin = Math.max(Math.round((canv.width + canv.height) * 2 / ((board.width + board.height) * 91)) * 2, 2);
            square.width = Math.round((canv.width / board.width) - square.margin - square.border);
            square.height = Math.round((canv.height / board.height) - square.margin - square.border);

            var ctx = this.canvasRef.current.getContext("2d");
            ctx.fillStyle = square.background;
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            for (var i = 0; i < board.goals.length; i++) {
                var x, y, t;
                x = Math.floor(i / board.height) * (square.width + square.margin + square.border)
                    + (square.border + square.margin) / 2;
                y = (i % board.height) * (square.height + square.margin + square.border)
                    + (square.border + square.margin) / 2;
                if (transpose) {
                    t = y; y = x; x = t;
                }
                drawSquare(ctx, board.goals[i], x, y, square);
            }
        });
    }

    render() {
        return (
            <div>
                <canvas ref={this.canvasRef} width="454" height="454" id="board">Canvas support and scripting are required.</canvas>
            </div>
        );
    }
}

export default BingoCanvas;
