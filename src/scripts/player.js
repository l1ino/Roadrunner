import { Apate, Entity } from '../engine/apate.js';
import { spriteMgr } from '../engine/legacy-wrapper.js';
import game from './game.js';

const playerImgElement = document.querySelector('#player');
const playerSprites = spriteMgr.imgToSprite(playerImgElement);

const playerMainSprite = spriteMgr.subSprite(playerSprites, 0, 0, 16, 16);
const playerDeathSprite = spriteMgr.subSprite(playerSprites, 32, 64, 16, 16);

const playerAnimationSprites = (function () {
    let sprites = [];
    for (let i = 0; i < 8; i++) {
        sprites.push(spriteMgr.subSprite(playerSprites, 16 * i, 16, 16, 16));
    }
    return sprites;
})();

export default class Player extends Entity {
    /** @param {Apate} apate */
    constructor(apate) {
        super();

        this.apate = apate;
        this.priority = 10;
        this.playerGroundHeight = 86;

        this.posX = 16;
        this.posY = 86;
        this.imgHeight = 16;
        this.imgWidth = 16;

        this.jumpForce = 0.25;
        this.mass = 1;

        this.animantionFPS = 10;

        this.reset();
    }

    reset() {
        this.posX = 16;
        this.posY = 86;

        this.velY = 0;
        this.readyToJump = true;

        this.nextAnimationFrame = 1000 / this.animantionFPS;
        this.currentAnimationFrame = 0;
    }

    draw() {
        if (game.isAlive) {
            this.apate.screen.drawSprite(Math.floor(this.posX), Math.floor(this.posY), playerAnimationSprites[this.currentAnimationFrame], 2);
        } else if (game.isFirstLoad) {
            this.apate.screen.drawSprite(Math.floor(this.posX), Math.floor(this.posY), playerMainSprite, 2);
        } else {
            this.apate.screen.drawSprite(Math.floor(this.posX), Math.floor(this.posY), playerDeathSprite, 2);
        }
    }

    update(delta) {
        if (!game.isAlive) return;

        this.nextAnimationFrame -= delta;
        if (this.nextAnimationFrame < 0) {
            this.currentAnimationFrame++;
            if (this.currentAnimationFrame == 8) this.currentAnimationFrame = 0;

            this.nextAnimationFrame = 1000 / this.animantionFPS;
        }

        if (this.apate.isButtonPressed('up') && !this.apate.isButtonPressed('down')) {
            this.jump();
        }

        this.mass = this.apate.isButtonPressed('down') ? 1.7 : 1;

        this.physicsUpdate(delta);
    }

    physicsUpdate(delta) {
        this.velY = this.velY + Math.pow(game.gravity * this.mass, 2) * delta;
        this.posY = this.posY + this.velY * delta;

        if (this.posY > this.playerGroundHeight) {
            this.posY = this.playerGroundHeight;
            this.readyToJump = true;
            this.velY = 0;
        }
    }

    jump() {
        if (!this.readyToJump) return;

        this.readyToJump = false;
        this.velY = -this.jumpForce;
    }
}
