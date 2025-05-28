import Apate, { Entity, color } from '../engine/legacy-wrapper.js';
import game from './game.js';

const beamTimeout = 500;
const beamColor = color(255, 0, 0);

export default class Laser extends Entity {
    /** @param {Apate} apate */
    constructor(apate) {
        super();

        this.apate = apate;
        this.priority = 10;

        this.reset();
    }

    reset() {
        this.countdown = 0;
        this.active = 0;
        this.targetX = 0;
        this.targetY = 0;
    }

    draw() {
        if (this.active > 0) {
            let player = game.entities.player;
            this.drawLine(player.posX + 10, player.posY + 5, this.targetX + 10, this.targetY + 10, beamColor);
        }
    }

    drawLine(x1, y1, x2, y2, c) {
        let dx = x2 - x1;
        let dy = y2 - y1;
        if (Math.abs(dx) > Math.abs(dy)) {
            let k = dy / dx;
            for (let x = 0; dx >= 0 ? x < dx : x > dx; dx >= 0 ? x++ : x--) {
                this.apate.screen.drawPixel(x + x1, Math.round(k * x) + y1, c);
            }
        } else {
            let k = dx / dy;
            for (let y = 0; dy >= 0 ? y < dy : y > dy; dy >= 0 ? y++ : y--) {
                this.apate.screen.drawPixel(Math.round(k * y) + x1, y + y1, c);
            }
        }

        this.apate.screen.drawPixel(x1, y1, c);
        this.apate.screen.drawPixel(x2, y2, c);
    }

    update(delta) {
        if (!game.isAlive) return;

        if (this.countdown > 0) {
            this.countdown--;
        }
        if (this.active > 0) {
            this.active--;
        }

        if (this.apate.isButtonPressed('laser') && this.countdown == 0) {
            let carMgr = game.entities.carMgr;
            if (carMgr.cars.length > 0) {
                let car = carMgr.cars[0];
                carMgr.cars.splice(0, 1);
                this.targetX = car.x;
                this.targetY = car.y;

                this.countdown = beamTimeout;
                this.active = 10;
            }
        }
    }
}
