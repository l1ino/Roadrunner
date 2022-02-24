import { Apate, DrawLib, Entity, spritelib } from '../engine/apate.js';
import game from './game.js';

const roadImgScale = 2;
const roadImgElement = document.querySelector('#road');
const roadSprite = spritelib.loadSync(roadImgElement);
const roadlength = roadImgElement.width * roadImgScale;

export default class Road extends Entity {
    /** @param {Apate} apate */
    constructor(apate) {
        super();

        this.apate = apate;
        this.priority = 2;

        this.roadY = 100;
        this.sectionsStarts = [0, roadlength];
    }

    reset() {}

    /**
     * @param {DrawLib} drawlib 
     */
    draw(drawlib) {
        drawlib.spriteExt(Math.floor(this.sectionsStarts[0]), this.roadY, roadSprite, roadImgScale);
        drawlib.spriteExt(Math.floor(this.sectionsStarts[1]), this.roadY, roadSprite, roadImgScale);
    }

    update(delta) {
        if (!game.isAlive) return;

        let xChange = (game.gameSpeed / 10) * delta;
        this.sectionsStarts[0] -= xChange;
        this.sectionsStarts[1] -= xChange;

        if (this.sectionsStarts[0] + roadlength + 4 < 0) {
            this.sectionsStarts[0] = this.sectionsStarts[1] + roadlength;
        }
        if (this.sectionsStarts[1] + roadlength + 4 < 0) {
            this.sectionsStarts[1] = this.sectionsStarts[0] + roadlength;
        }
    }
}
