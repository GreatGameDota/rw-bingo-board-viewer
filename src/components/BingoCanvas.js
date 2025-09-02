import React, { Component } from "react";
import { CHALLENGES, BingoEnum_CharToDisplayText, drawSquare } from "../lib/bingovista/bingovista.js";

class BingoCanvas extends Component {
    constructor(props) {
        super(props);
        this.canvasRef = React.createRef();
    }

    componentDidMount() {
        this.renderCanvas();
    }

    componentDidUpdate(prevProps) {
        this.renderCanvas();
    }

    renderCanvas() {
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
        const colors = ["#e60e0e66", "#0080ff66", "#33ff0066", "#ff990066", "#ff00ff66", "#00e8e666", "#5e5e6f66", "#4d00ff66", "#ffffff66"];

        var s = this.props.bingoString;
        s = s.trim().replace(/\s*bChG\s*/g, "bChG");
        var goals = s.split(/bChG/);
        var size = Math.ceil(Math.sqrt(goals.length));

        var board = {};
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
                        board.goals.push(CHALLENGES[type](desc, board));
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

            var _colors = [];
            for (var j = 0; j < colors.length; j++) {
                // 1 = goal completed, 2 = goal failed
                if (this.props.boardState[i][j] === '1') {
                    _colors.push(colors[j]);
                }
            }

            if (_colors.length === 1) {
                ctx.fillStyle = _colors[0];
                ctx.fillRect(x, y, square.width, square.height);
            } else if (_colors.length > 1) {
                const numColors = _colors.length;

                // Create clipping region for the square
                ctx.save();
                ctx.beginPath();
                ctx.fillStyle = "#020204";
                ctx.rect(x, y, square.width, square.height);
                ctx.clip();

                // Calculate stripe width - each color gets equal width
                const stripeWidth = square.width / numColors;
                const slantOffset = square.width * 0.15;

                for (let i = 0; i < numColors; i++) {
                    ctx.fillStyle = _colors[i];

                    // Draw diagonal stripe
                    ctx.beginPath();

                    const stripeLeft = x + i * stripeWidth - (i === 0 ? stripeWidth : 0); // Extend widths of first and last stripes to fill in gaps
                    const stripeRight = x + (i + 1) * stripeWidth + (i === numColors - 1 ? stripeWidth : 0);

                    // Create parallelogram stripe
                    ctx.moveTo(stripeLeft + slantOffset, y);
                    ctx.lineTo(stripeRight + slantOffset, y);
                    ctx.lineTo(stripeRight - slantOffset, y + square.height);
                    ctx.lineTo(stripeLeft - slantOffset, y + square.height);
                    ctx.closePath();
                    ctx.fill();
                }

                ctx.restore();
            }

            drawSquare(ctx, board.goals[i], x, y, square);

            // Square outline, only with 1 color
            if (_colors.length === 1) {
                ctx.beginPath();
                ctx.strokeStyle = _colors[0].substring(0, 7);
                ctx.lineWidth = square.border;
                ctx.lineCap = "butt";
                ctx.moveTo(x, y);
                ctx.lineTo(x + square.width, y);
                ctx.moveTo(x + square.width, y);
                ctx.lineTo(x + square.width, y + square.height);
                ctx.moveTo(x + square.width, y + square.height);
                ctx.lineTo(x, y + square.height);
                ctx.moveTo(x, y + square.height);
                ctx.lineTo(x, y);
                ctx.stroke();
            }
        }
    }

    render() {
        return (
            <div>
                <canvas ref={this.canvasRef} width="800" height="800" id="board">Canvas support and scripting are required.</canvas>
            </div>
        );
    }
}

export default BingoCanvas;
