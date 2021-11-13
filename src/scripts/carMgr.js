import Apate, { Entity, spriteMgr } from '../engine/apate-mini.js';
import game from './game.js';

const carImages = document.getElementsByClassName('carImg');
const carSprites = (function () {
    let sprites = [];
    for (const img of carImages) {
        sprites.push({
            image: spriteMgr.imgToSprite(img),
            imgHeight: img.height,
            imgWidth: img.width
        });
    }
    return sprites;
})();
const carSpeedMulit = 0.14;

export default class CarMgr extends Entity {
    /** @param {Apate} apate */
    constructor(apate) {
        super();

        this.apate = apate;
        this.priority = 2;

        this.reset();
    }

    reset() {
        this.cars = [];
        this.spawnRate = 3;
        this.nextSpawn = 0;
    }

    draw() {
        for (let i = 0; i < this.cars.length; i++) {
            const car = this.cars[i];
            this.apate.screen.drawSprite(car.x, car.y, carSprites[car.imgId].image, 2);
        }
    }

    update(delta) {
        if (!game.isAlive) return;

        this.nextSpawn -= delta;
        if (this.nextSpawn <= 0) {
            this.nextSpawn = 1000 / this.spawnRate;

            if (this.cars.length < 2 && Math.random() >= 0.5) {
                this.cars.push({ x: 250, y: 100, imgId: this.apate.random.betweenInt(0, 1) });
            }
        }

        this.physicsUpdate(delta);
    }

    physicsUpdate(delta) {
        for (let i = 0; i < this.cars.length; i++) {
            this.cars[i].x -= game.gameSpeed * carSpeedMulit * delta;

            if (this.cars[i].x < -carSprites[this.cars[i].imgId].imgWidth - 5) {
                this.cars.splice(i, 1);
                i--;
                continue;
            }
        }
        for (let i = 0; i < this.cars.length; i++) {
            const car = this.cars[i];
            const player = game.entities.player;
            if (player.posX + player.imgWidth >= car.x - 5 && player.posX <= car.x + 10 && player.posY + player.imgHeight > car.y - 4) {
                console.log('car hitted player :(');
                game.gameOver();
            }
        }
    }
}
