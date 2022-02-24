import { Apate, Color, DrawLib, Entity, ParticleSystem } from '../engine/apate.js';
import game from './game.js';

const skyStepSize = 128 / 8;
const skyStepHeight = Math.round(128 / skyStepSize);
const skyDayColor1 = new Color(255, 64, 0);
const skyDayColor2 = new Color(255, 255, 0);
const skyNightColor1 = new Color(0, 0, 85);
const skyNightColor2 = new Color(90, 0, 85);

const skyFallOfDay_red = (skyDayColor1.r - skyDayColor2.r) / skyStepSize;
const skyFallOfDay_green = (skyDayColor1.g - skyDayColor2.g) / skyStepSize;
const skyFallOfDay_blue = (skyDayColor1.b - skyDayColor2.b) / skyStepSize;

const skyFallOfNight_red = (skyNightColor1.r - skyNightColor2.r) / skyStepSize;
const skyFallOfNight_green = (skyNightColor1.g - skyNightColor2.g) / skyStepSize;
const skyFallOfNight_blue = (skyNightColor1.b - skyNightColor2.b) / skyStepSize;

export default class Background extends Entity {
    /** @param {Apate} apate */
    constructor(apate) {
        super();

        this.apate = apate;
        this.priority = 0;

        this.stars = new ParticleSystem(true, 10, true);
        this.stars.generateParticle = () => {
            return {
                origin: { x: 60, y: 0, w: 200, h: 30 },
                velocity: { x: -15 },
                emitDelay: 400,
                colors: [new Color(255, 218, 42)],
                lifetime: 5000
            };
        };
    }

    reset() {
        this.stars.clearAll();
    }

    /**
     * @param {DrawLib} drawlib
     */
    draw(drawlib) {
        for (let i = 0; i < skyStepSize; i++) {
            let changeDay = {
                r: skyDayColor1.r - skyFallOfDay_red * i,
                g: skyDayColor1.g - skyFallOfDay_green * i,
                b: skyDayColor1.b - skyFallOfDay_blue * i
            };
            let changeNight = {
                r: skyNightColor1.r - skyFallOfNight_red * i,
                g: skyNightColor1.g - skyFallOfNight_green * i,
                b: skyNightColor1.b - skyFallOfNight_blue * i
            };

            let dayMulti = 1 - game.dayTimeColorMix / 100;
            let nightMulti = game.dayTimeColorMix / 100;

            let c = {
                r: changeDay.r * dayMulti + changeNight.r * nightMulti,
                g: changeDay.g * dayMulti + changeNight.g * nightMulti,
                b: changeDay.b * dayMulti + changeNight.b * nightMulti
            };

            drawlib.rect(0, skyStepHeight * i, 256, skyStepHeight, c);
        }

        if (game.isNight) {
            this.stars.draw(drawlib);
        }
    }

    update(delta) {
        if (!game.isAlive) return;

        this.stars.update(delta);
    }
}
