import { Apate, Button, Color, DrawLib, Entity } from '../engine/apate.js';
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
    setApate(apate) {
        this.apate = apate;
        console.log(apate);
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

    /**
     * @param {DrawLib} drawlib 
     */
     draw(drawlib) {
        if (this.isNight) {
            let pixels = this.apate.screen.pixelBuffer;
            let screenDarkerMix = Math.floor(screenDarkerChange * (this.dayTimeColorMix / 100));
            for (let i = 0; i < pixels.length; i++) {
                pixels[i] = pixels[i] - screenDarkerMix < 0 ? 0 : pixels[i] - screenDarkerMix;
            }
        }

        if (this.isAlive) {
            let text = `Score: ${Math.floor(this.score)}`;
            let textpixelwidth = (text.length * 4 + 3) * 2;
            drawlib.text(256 / 2 - textpixelwidth / 2, 10, text, Color.white, { scale: 2, leftSpace: 3 });

            if (this.debugMode) {
                drawlib.text(2, 10, `Daytimemix: ${this.dayTimeColorMix.toFixed(2)}`, Color.white);
                drawlib.text(2, 2, `Gamespeed: ${Math.round(this.gameSpeed * 100)}`, Color.white);
            }
        } else if (this.isFirstLoad) {
            drawlib.text(32, 48, 'Press Space to start', Color.black, { scale: 1.5, leftSpace: 3 });
            if (this.apate.input.isButtonDown(Button.up)) {
                this.start();
            }
        } else {
            let color = this.isNight ? Color.white : Color.black;
            drawlib.text(80, 19, 'Game Over', color, 2, 3);
            drawlib.text(95, 20, `Score: ${this.score}\nHighscore: ${this.highscore}`, color, 2);
            drawlib.text(95, 75, 'Restart (Space)', color);
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

                if (Math.floor(this.score) % 20 == 0) {
                    this.isNight = !this.isNight;
                }
            }
        } else {
            if (this.apate.input.isButtonDown(Button.action1) || this.apate.input.isButtonDown(Button.action2)) {
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
