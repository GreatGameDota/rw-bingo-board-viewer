import { Component } from "react";

const IMAGES = [
    "url(https://firebasestorage.googleapis.com/v0/b/bingo-db-57e75.firebasestorage.app/o/WatcherCoral_RavenMind2.png?alt=media)",
    "url(https://firebasestorage.googleapis.com/v0/b/bingo-db-57e75.firebasestorage.app/o/rw_bingo_2_tweaked.png?alt=media)",
    "url(https://firebasestorage.googleapis.com/v0/b/bingo-db-57e75.firebasestorage.app/o/rainworld_nightmare_flat.png?alt=media)",
    "url(https://firebasestorage.googleapis.com/v0/b/bingo-db-57e75.firebasestorage.app/o/bingo_art_hunter.png?alt=media)",
    "url(https://firebasestorage.googleapis.com/v0/b/bingo-db-57e75.firebasestorage.app/o/bingo_art_survivor.png?alt=media)",
    "url(https://firebasestorage.googleapis.com/v0/b/bingo-db-57e75.firebasestorage.app/o/image_for_yall.png?alt=media)",
    "url(https://firebasestorage.googleapis.com/v0/b/bingo-db-57e75.firebasestorage.app/o/scenic2.png?alt=media)",
    "url(https://firebasestorage.googleapis.com/v0/b/bingo-db-57e75.firebasestorage.app/o/Illustration807.png?alt=media)",
];

class AnimatedBackground extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentIndex: Math.floor(Math.random() * IMAGES.length),
            opacity: 1,
        };
        this.timer = null;
    }

    componentDidMount() {
        this.scheduleNext();
    }

    componentWillUnmount() {
        clearTimeout(this.timer);
    }

    scheduleNext() {
        this.timer = setTimeout(() => this.fadeOut(), 24000 + 2500);
    }

    fadeOut() {
        this.setState({ opacity: 0 }, () => {
            this.timer = setTimeout(() => this.swapAndFadeIn(), 2500 + 100);
        });
    }

    swapAndFadeIn() {
        this.setState(
            (prev) => ({
                currentIndex: (prev.currentIndex + 1) % IMAGES.length,
                opacity: 1,
            }),
            () => this.scheduleNext()
        );
    }

    render() {
        return (
            <div className="relative overflow-hidden bg-black">
                <div
                    className="absolute -inset-10 bg-cover bg-center animate-shake"
                    style={{
                        backgroundImage: IMAGES[this.state.currentIndex],
                        opacity: this.state.opacity,
                        transition: `opacity 2500ms ease-in-out`,
                    }}
                />
                <div
                    className="absolute inset-0"
                    style={{ boxShadow: "inset 0 0 50px 50px rgba(0,0,0,0.5)" }}
                />
                <div className="relative">
                    {this.props.children}
                </div>
            </div>
        );
    }
}

export default AnimatedBackground;
