import { Apate, Button, DrawLib, Entity, spritelib } from '../engine/apate.js';
import game from './game.js';

const playerImgElement = document.querySelector('#player');
const playerSprites = spritelib.loadSync(playerImgElement);
const playerSpriteMap = {
    main: spritelib.split(playerSprites, 16, 16, 0)[0],
    death: spritelib.split(playerSprites, 16, 16, 64)[3],
    animation: (function () {
        let sprites = [];
        for (let i = 0; i < 8; i++) {
            sprites.push(spritelib.split(playerSprites, 16, 16, 16)[i]);
        }
        return sprites;
    })()
};

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

    /**
     * @param {DrawLib} drawlib
     */
    draw(drawlib) {
        if (game.isAlive) {
            drawlib.spriteExt(Math.floor(this.posX), Math.floor(this.posY), playerSpriteMap.animation[this.currentAnimationFrame], 2);
        } else if (game.isFirstLoad) {
            drawlib.spriteExt(Math.floor(this.posX), Math.floor(this.posY), playerSpriteMap.main, 2);
        } else {
            drawlib.spriteExt(Math.floor(this.posX), Math.floor(this.posY), playerSpriteMap.death, 2);
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

        if (this.apate.input.isButtonDown(Button.up) && !this.apate.input.isButtonDown(Button.down)) {
            this.jump();
        }

        this.mass = this.apate.input.isButtonDown(Button.down) ? 1.7 : 1;

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
