import Apate, { Entity } from '../engine/legacy-wrapper.js';
import Background from './background.js';
import CarMgr from './carMgr.js';
import Player from './player.js';
import Road from './road.js';

const speedUpdateTime = 2000;
const scoreUpdateTime = 400;
const dayTimeColorChange = 0.05;
const screenDarkerChange = 42;

class Game extends Entity {
    constructor() {
        super();

        /** @type {Apate} */
        this.apate = null;
        this.isInitialized = false;
        this.priority = 100;

        this.debugMode = false;

        this.isFirstLoad = true;
        this.gravity = 0.025;
        this.highscore = 0;
        this.reset();
    }

    /**
     * @param {Apate} apate
     */
    init(apate) {
        this.apate = apate;
        this.entities = {
            road: new Road(apate),
            player: new Player(apate),
            carMgr: new CarMgr(apate),
            background: new Background(apate)
        };
        this.isInitialized = true;
    }

    reset() {
        this.score = 0;
        this.isAlive = false;
        this.gameSpeed = 0.08;
        this.isNight = false;
        this.dayTimeColorMix = 0;
        this.nextSpeedUpdate = 0;
        this.nextScoreUpdate = 0;
    }

    start() {
        this.isFirstLoad = false;
        this.score = 1;
        this.isAlive = true;
        this.gameSpeed = 1.0;
        this.nextSpeedUpdate = speedUpdateTime;
        this.nextScoreUpdate = scoreUpdateTime;
    }

    gameOver() {
        if (!this.isAlive) return;

        this.isAlive = false;
        this.highscore = this.score > this.highscore ? this.score : this.highscore;
        this.apate.save();
    }

    draw() {
        if (this.isNight) {
            let pixels = this.apate.screen.pixelScreen.pixel;
            let screenDarkerMix = Math.floor(screenDarkerChange * (this.dayTimeColorMix / 100));
            for (let i = 0; i < pixels.length; i++) {
                pixels[i] = pixels[i] - screenDarkerMix < 0 ? 0 : pixels[i] - screenDarkerMix;
            }
        }

        if (this.isAlive) {
            let text = `Score: ${Math.floor(this.score)}`;
            let textpixelwidth = (text.length * 4 + 3) * 2;
            this.apate.screen.drawText(256 / 2 - textpixelwidth / 2, 10, text, this.apate.colors.white, { scale: 2, leftSpace: 3 });

            if (this.debugMode) {
                this.apate.screen.drawText(2, 10, `Daytimemix: ${this.dayTimeColorMix.toFixed(2)}`, this.apate.colors.white);
                this.apate.screen.drawText(2, 2, `Gamespeed: ${Math.round(this.gameSpeed * 100)}`, this.apate.colors.white);
            }
        } else if (this.isFirstLoad) {
            this.apate.screen.drawText(32, 48, 'Press Space to start', this.apate.colors.black, { scale: 1.5, leftSpace: 3 });
            if (this.apate.isButtonPressed('up')) {
                this.start();
            }
        } else {
            let color = this.isNight ? this.apate.colors.white : this.apate.colors.black;
            this.apate.screen.drawText(80, 19, 'Game Over', color, { scale: 2, leftSpace: 3 });
            this.apate.screen.drawText(95, 49, `Score: ${this.score}\nHighscore: ${this.highscore}`, color, { topSpace: 4 });
            this.apate.screen.drawText(95, 75, 'Restart (Space)', color);
        }
    }

    update(delta) {
        if (this.dayTimeColorMix > 0 && !this.isNight) this.dayTimeColorMix -= dayTimeColorChange * delta;
        if (this.dayTimeColorMix < 100 && this.isNight) this.dayTimeColorMix += dayTimeColorChange * delta;
        if (this.dayTimeColorMix < 0) this.dayTimeColorMix = 0;
        if (this.dayTimeColorMix > 100) this.dayTimeColorMix = 100;

        if (this.isAlive) {
            this.nextSpeedUpdate -= delta;
            this.nextScoreUpdate -= delta;

            if (this.nextSpeedUpdate <= 0) {
                this.nextSpeedUpdate = speedUpdateTime;
                this.gameSpeed += 0.01;
            }

            if (this.nextScoreUpdate <= 0) {
                this.nextScoreUpdate = scoreUpdateTime;
                this.score++;

                if (Math.floor(this.score) % 50 == 0) {
                    this.isNight = !this.isNight;
                }
            }
        } else {
            if (this.apate.isButtonPressed('Action1') || this.apate.isButtonPressed('Action2')) {
                this.restart();
            }
        }
    }

    restart() {
        this.reset();
        for (const obj in this.entities) {
            this.entities[obj].reset();
        }
        this.start();
    }
}

export default new Game();
