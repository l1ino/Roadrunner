//

class SpriteMgr {
    /**
     * @typedef Sprite
     * @type {object}
     * @property {{r: number, g: number, b: number}[]} pixels
     */

    constructor() {
        this.canvas = document.createElement('canvas');
    }

    /**
     * Loads a sprite object from a given url
     * @param {string} url
     * @returns {Promise<Sprite>}
     */
    async loadSpriteFromURL(url) {
        let res = await fetch(url);
        let json = await res.json();
        return json;
    }

    /**
     * Loads an image from a given url
     * @param {string} url
     * @returns {Promise<HTMLImageElement>}
     */
    loadImgFromUrl(url) {
        let img = new Image();
        return new Promise((res, rej) => {
            img.onload = () => {
                res(img);
            };
            img.src = url;
        });
    }

    /**
     * Converts an image to a sprite object
     * @param {HTMLImageElement} img
     * @returns {Sprite}
     */
    imgToSprite(img) {
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        let ctx = this.canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        let image = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        let sprite = [];
        let x = -1;
        let y = 0;
        for (let i = 0; i < image.data.length; i += 4) {
            x++;
            if (x >= image.width) {
                y++;
                x = 0;
            }
            let r = image.data[i],
                g = image.data[i + 1],
                b = image.data[i + 2],
                a = image.data[i + 3];

            if (a == 0) continue;

            sprite.push({
                x,
                y,
                c: { r, g, b }
            });
        }
        return sprite;
    }

    /**
     * Converts an image to an aminated sprite object
     * @param {HTMLImageElement} img
     * @param {number} frameWidth
     * @returns {Sprite[]}
     */
    imgToAnimatedSprite(img, frameWidth) {
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        let ctx = this.canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        let image = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        let sprites = [];
        let length = image.width / frameWidth;

        for (let frame = 0; frame < length; frame++) {
            let sprite = [];

            let x = 0;
            let y = 0;

            for (let i = 0; i < image.data.length; i += 4) {
                if (x >= frameWidth * frame && x < frameWidth * frame + frameWidth) {
                    let r = image.data[i],
                        g = image.data[i + 1],
                        b = image.data[i + 2],
                        a = image.data[i + 3];

                    if (a != 0) {
                        sprite.push({
                            x: x - frameWidth * frame,
                            y,
                            c: { r, g, b }
                        });
                    }
                }

                x++;
                if (x >= image.width) {
                    y++;
                    x = 0;
                }
            }

            sprites.push(sprite);
        }
        return sprites;
    }

    /**
     * Cuts a part out of a bigger Sprite
     * @param {Sprite} sprite
     * @param {number} x x-pos
     * @param {number} y x-pos
     * @param {number} w width
     * @param {number} h height
     */
    subSprite(sprite, x, y, w, h) {
        let newSprite = [];

        for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
                let pixel = sprite.find((p) => p.x == x + i && p.y == y + j);
                if (pixel) {
                    newSprite.push({
                        x: i,
                        y: j,
                        c: pixel.c
                    });
                }
            }
        }
        return newSprite;
    }

    /**
     * @param {Sprite} sprite
     * @returns {Sprite}
     */
    filpHorizontal(sprite) {
        let maxX = 0;
        for (let i = 0; i < sprite.length; i++) {
            maxX = sprite[i].x > maxX ? sprite[i].x : maxX;
        }
        let newSprite = [];
        for (let i = 0; i < sprite.length; i++) {
            newSprite.push({
                x: Math.abs(sprite[i].x - maxX),
                y: sprite[i].y,
                c: sprite[i].c
            });
        }
        return newSprite;
    }

    /**
     * @param {Sprite} sprite
     * @returns {Sprite}
     */
    filpVertical(sprite) {
        let maxY = 0;
        for (let i = 0; i < sprite.length; i++) {
            maxY = sprite[i].y > maxY ? sprite[i].y : maxY;
        }

        let newSprite = [];
        for (let i = 0; i < sprite.length; i++) {
            newSprite.push({
                x: sprite[i].x,
                y: Math.abs(sprite[i].y - maxY),
                c: sprite[i].c
            });
        }
        return newSprite;
    }
}

new SpriteMgr();

class Tilemap {
    /**
     * @param {number} width
     * @param {number} height
     */
    constructor(width, height) {
        this.tileWidth = width;
        this.tileHeight = height;
        this.tiles = [];
        this.tileMap = {};
    }

    /**
     * @param {string} name
     * @param {SpriteMgr} sprite
     */
    addSprite(name, sprite) {
        this.tileMap[name] = sprite;
    }

    /**
     * @param {number} x x-pos
     * @param {number} y y-pos
     * @param {string} name
     */
    setTile(x, y, name) {
        this.tiles.push({ x, y, name });
    }

    /**
     * @param {number} x x-pos
     * @param {number} y y-pos
     */
    removeTile(x, y) {
        let i = this.tiles.findIndex((t) => t.x == x && t.y == y);
        if (i > -1) this.tiles.splice(i, 1);
    }

    /**
     * @param {number} x x-pos
     * @param {number} y y-pos
     * @returns {{x: number, y: number, name: string}}
     */
    getTile(x, y) {
        return this.tiles.find((t) => t.x == x && t.y == y);
    }

    /**
     * @returns {JSON}
     */
    toJSON() {
        return {
            sprites: this.tileMap,
            tiles: this.tiles
        };
    }

    /**
     * @param {JSON} json
     */
    fromJSON(json) {
        this.tileMap = json.sprites;
        this.tiles = json.tiles;
    }
}

/*
{
    sprites: {
        name: [...sprite...],
        ...
    },
    tiles: [
        {x,y,name},
        ...
    ]
}
*/

var charSpriteMap = {
    '�': {
        len: 3,
        pixels: [
            { x: 0, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: 2 },
            { x: 0, y: 3 },
            { x: 0, y: 4 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 3, y: 0 },
            { x: 3, y: 1 },
            { x: 3, y: 2 },
            { x: 3, y: 3 },
            { x: 3, y: 4 },
            { x: 1, y: 4 },
            { x: 2, y: 4 }
        ]
    },
    '!': {
        len: 1,
        pixels: [
            { x: 0, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: 2 },
            { x: 0, y: 4 }
        ]
    },
    '"': {
        len: 3,
        pixels: [
            { x: 0, y: 0 },
            { x: 2, y: 0 },
            { x: 0, y: 1 },
            { x: 2, y: 1 }
        ]
    },
    '%': {
        len: 4,
        pixels: [
            { x: 0, y: 0 },
            { x: 0, y: 4 },
            { x: 1, y: 3 },
            { x: 2, y: 2 },
            { x: 3, y: 1 },
            { x: 4, y: 0 },
            { x: 4, y: 4 }
        ]
    },
    '&': {
        len: 4,
        pixels: [
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 0, y: 1 },
            { x: 2, y: 1 },
            { x: 0, y: 2 },
            { x: 1, y: 2 },
            { x: 3, y: 2 },
            { x: 0, y: 3 },
            { x: 2, y: 3 },
            { x: 0, y: 4 },
            { x: 1, y: 4 },
            { x: 3, y: 4 }
        ]
    },
    "'": {
        len: 1,
        pixels: [
            { x: 0, y: 0 },
            { x: 0, y: 1 }
        ]
    },
    '(': {
        len: 2,
        pixels: [
            { x: 1, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: 2 },
            { x: 0, y: 3 },
            { x: 1, y: 4 }
        ]
    },
    ')': {
        len: 2,
        pixels: [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
            { x: 1, y: 2 },
            { x: 1, y: 3 },
            { x: 0, y: 4 }
        ]
    },
    '*': {
        len: 3,
        pixels: [
            { x: 0, y: 1 },
            { x: 2, y: 1 },
            { x: 1, y: 2 },
            { x: 0, y: 3 },
            { x: 2, y: 3 }
        ]
    },
    '+': {
        len: 3,
        pixels: [
            { x: 1, y: 1 },
            { x: 0, y: 2 },
            { x: 1, y: 2 },
            { x: 2, y: 2 },
            { x: 1, y: 3 }
        ]
    },
    ',': {
        len: 1,
        pixels: [
            { x: 0, y: 3 },
            { x: 0, y: 4 }
        ]
    },
    '-': {
        len: 3,
        pixels: [
            { x: 0, y: 2 },
            { x: 1, y: 2 },
            { x: 2, y: 2 }
        ]
    },
    '.': {
        len: 1,
        pixels: [{ x: 0, y: 4 }]
    },
    '/': {
        len: 3,
        pixels: [
            { x: 2, y: 0 },
            { x: 1, y: 1 },
            { x: 1, y: 2 },
            { x: 1, y: 3 },
            { x: 0, y: 4 }
        ]
    },
    0: {
        len: 3,
        pixels: [
            { x: 1, y: 0 },
            { x: 0, y: 1 },
            { x: 2, y: 1 },
            { x: 0, y: 2 },
            { x: 2, y: 2 },
            { x: 0, y: 3 },
            { x: 2, y: 3 },
            { x: 1, y: 4 }
        ]
    },
    1: {
        len: 2,
        pixels: [
            { x: 1, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 1 },
            { x: 1, y: 2 },
            { x: 1, y: 3 },
            { x: 1, y: 4 }
        ]
    },
    2: {
        len: 3,
        pixels: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 2, y: 1 },
            { x: 1, y: 2 },
            { x: 2, y: 2 },
            { x: 0, y: 3 },
            { x: 0, y: 4 },
            { x: 1, y: 4 },
            { x: 2, y: 4 }
        ]
    },
    3: {
        len: 3,
        pixels: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 1 },
            { x: 0, y: 2 },
            { x: 1, y: 2 },
            { x: 2, y: 3 },
            { x: 0, y: 4 },
            { x: 1, y: 4 }
        ]
    },
    4: {
        len: 4,
        pixels: [
            { x: 2, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 1 },
            { x: 0, y: 2 },
            { x: 2, y: 2 },
            { x: 0, y: 3 },
            { x: 1, y: 3 },
            { x: 2, y: 3 },
            { x: 3, y: 3 },
            { x: 2, y: 4 }
        ]
    },
    5: {
        len: 3,
        pixels: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: 2 },
            { x: 1, y: 2 },
            { x: 2, y: 3 },
            { x: 0, y: 4 },
            { x: 1, y: 4 }
        ]
    },
    6: {
        len: 4,
        pixels: [
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 3, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: 2 },
            { x: 1, y: 2 },
            { x: 2, y: 2 },
            { x: 3, y: 2 },
            { x: 0, y: 3 },
            { x: 3, y: 3 },
            { x: 1, y: 4 },
            { x: 2, y: 4 }
        ]
    },
    7: {
        len: 3,
        pixels: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 0, y: 1 },
            { x: 2, y: 1 },
            { x: 2, y: 2 },
            { x: 2, y: 3 },
            { x: 2, y: 4 }
        ]
    },
    8: {
        len: 4,
        pixels: [
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 0, y: 1 },
            { x: 3, y: 1 },
            { x: 1, y: 2 },
            { x: 2, y: 2 },
            { x: 0, y: 3 },
            { x: 3, y: 3 },
            { x: 1, y: 4 },
            { x: 2, y: 4 }
        ]
    },
    9: {
        len: 4,
        pixels: [
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 0, y: 1 },
            { x: 3, y: 1 },
            { x: 1, y: 2 },
            { x: 2, y: 2 },
            { x: 3, y: 2 },
            { x: 3, y: 3 },
            { x: 1, y: 4 },
            { x: 2, y: 4 }
        ]
    },
    ':': {
        len: 1,
        pixels: [
            { x: 0, y: 1 },
            { x: 0, y: 3 }
        ]
    },
    ';': {
        len: 1,
        pixels: [
            { x: 0, y: 1 },
            { x: 0, y: 3 },
            { x: 0, y: 4 }
        ]
    },
    '<': {
        len: 3,
        pixels: [
            { x: 2, y: 0 },
            { x: 1, y: 1 },
            { x: 0, y: 2 },
            { x: 1, y: 3 },
            { x: 2, y: 4 }
        ]
    },
    '=': {
        len: 2,
        pixels: [
            { x: 0, y: 1 },
            { x: 1, y: 1 },
            { x: 0, y: 3 },
            { x: 1, y: 3 }
        ]
    },
    '>': {
        len: 3,
        pixels: [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 2 },
            { x: 1, y: 3 },
            { x: 0, y: 4 }
        ]
    },
    '?': {
        len: 3,
        pixels: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 2, y: 1 },
            { x: 1, y: 2 },
            { x: 1, y: 4 }
        ]
    },
    A: {
        len: 4,
        pixels: [
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 0, y: 1 },
            { x: 3, y: 1 },
            { x: 0, y: 2 },
            { x: 3, y: 2 },
            { x: 0, y: 3 },
            { x: 1, y: 3 },
            { x: 2, y: 3 },
            { x: 3, y: 3 },
            { x: 0, y: 4 },
            { x: 3, y: 4 }
        ]
    },
    B: {
        len: 4,
        pixels: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 0, y: 1 },
            { x: 3, y: 1 },
            { x: 0, y: 2 },
            { x: 1, y: 2 },
            { x: 2, y: 2 },
            { x: 0, y: 3 },
            { x: 3, y: 3 },
            { x: 0, y: 4 },
            { x: 1, y: 4 },
            { x: 2, y: 4 }
        ]
    },
    C: {
        len: 4,
        pixels: [
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 0, y: 1 },
            { x: 3, y: 1 },
            { x: 0, y: 2 },
            { x: 0, y: 3 },
            { x: 3, y: 3 },
            { x: 1, y: 4 },
            { x: 2, y: 4 }
        ]
    },
    D: {
        len: 4,
        pixels: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 0, y: 1 },
            { x: 3, y: 1 },
            { x: 0, y: 2 },
            { x: 3, y: 2 },
            { x: 0, y: 3 },
            { x: 3, y: 3 },
            { x: 0, y: 4 },
            { x: 1, y: 4 },
            { x: 2, y: 4 }
        ]
    },
    E: {
        len: 4,
        pixels: [
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 3, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: 2 },
            { x: 1, y: 2 },
            { x: 2, y: 2 },
            { x: 0, y: 3 },
            { x: 1, y: 4 },
            { x: 2, y: 4 },
            { x: 3, y: 4 }
        ]
    },
    F: {
        len: 4,
        pixels: [
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 3, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: 2 },
            { x: 1, y: 2 },
            { x: 2, y: 2 },
            { x: 0, y: 3 },
            { x: 0, y: 4 }
        ]
    },
    G: {
        len: 4,
        pixels: [
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 3, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: 2 },
            { x: 2, y: 2 },
            { x: 3, y: 2 },
            { x: 0, y: 3 },
            { x: 3, y: 3 },
            { x: 1, y: 4 },
            { x: 2, y: 4 }
        ]
    },
    H: {
        len: 4,
        pixels: [
            { x: 0, y: 0 },
            { x: 3, y: 0 },
            { x: 0, y: 1 },
            { x: 3, y: 1 },
            { x: 0, y: 2 },
            { x: 1, y: 2 },
            { x: 2, y: 2 },
            { x: 3, y: 2 },
            { x: 0, y: 3 },
            { x: 3, y: 3 },
            { x: 0, y: 4 },
            { x: 3, y: 4 }
        ]
    },
    I: {
        len: 3,
        pixels: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 1, y: 1 },
            { x: 1, y: 2 },
            { x: 1, y: 3 },
            { x: 0, y: 4 },
            { x: 1, y: 4 },
            { x: 2, y: 4 }
        ]
    },
    J: {
        len: 3,
        pixels: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 2, y: 1 },
            { x: 2, y: 2 },
            { x: 0, y: 3 },
            { x: 2, y: 3 },
            { x: 1, y: 4 },
            { x: 2, y: 4 }
        ]
    },
    K: {
        len: 4,
        pixels: [
            { x: 0, y: 0 },
            { x: 3, y: 0 },
            { x: 0, y: 1 },
            { x: 2, y: 1 },
            { x: 0, y: 2 },
            { x: 1, y: 2 },
            { x: 0, y: 3 },
            { x: 2, y: 3 },
            { x: 0, y: 4 },
            { x: 3, y: 4 }
        ]
    },
    L: {
        len: 3,
        pixels: [
            { x: 0, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: 2 },
            { x: 0, y: 3 },
            { x: 0, y: 4 },
            { x: 1, y: 4 },
            { x: 2, y: 4 }
        ]
    },
    M: {
        len: 5,
        pixels: [
            { x: 1, y: 0 },
            { x: 3, y: 0 },
            { x: 0, y: 1 },
            { x: 2, y: 1 },
            { x: 4, y: 1 },
            { x: 0, y: 2 },
            { x: 2, y: 2 },
            { x: 4, y: 2 },
            { x: 0, y: 3 },
            { x: 4, y: 3 },
            { x: 0, y: 4 },
            { x: 4, y: 4 }
        ]
    },
    N: {
        len: 4,
        pixels: [
            { x: 0, y: 0 },
            { x: 3, y: 0 },
            { x: 0, y: 1 },
            { x: 3, y: 1 },
            { x: 0, y: 2 },
            { x: 1, y: 2 },
            { x: 3, y: 2 },
            { x: 0, y: 3 },
            { x: 2, y: 3 },
            { x: 3, y: 3 },
            { x: 0, y: 4 },
            { x: 3, y: 4 }
        ]
    },
    O: {
        len: 4,
        pixels: [
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 0, y: 1 },
            { x: 3, y: 1 },
            { x: 0, y: 2 },
            { x: 3, y: 2 },
            { x: 0, y: 3 },
            { x: 3, y: 3 },
            { x: 1, y: 4 },
            { x: 2, y: 4 }
        ]
    },
    P: {
        len: 4,
        pixels: [
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 3, y: 0 },
            { x: 0, y: 1 },
            { x: 3, y: 1 },
            { x: 0, y: 2 },
            { x: 1, y: 2 },
            { x: 2, y: 2 },
            { x: 0, y: 3 },
            { x: 0, y: 4 }
        ]
    },
    Q: {
        len: 5,
        pixels: [
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 0, y: 1 },
            { x: 3, y: 1 },
            { x: 0, y: 2 },
            { x: 3, y: 2 },
            { x: 0, y: 3 },
            { x: 3, y: 3 },
            { x: 1, y: 4 },
            { x: 2, y: 4 },
            { x: 4, y: 4 }
        ]
    },
    R: {
        len: 4,
        pixels: [
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 3, y: 0 },
            { x: 0, y: 1 },
            { x: 3, y: 1 },
            { x: 0, y: 2 },
            { x: 1, y: 2 },
            { x: 2, y: 2 },
            { x: 0, y: 3 },
            { x: 3, y: 3 },
            { x: 0, y: 4 },
            { x: 3, y: 4 }
        ]
    },
    S: {
        len: 4,
        pixels: [
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 3, y: 0 },
            { x: 0, y: 1 },
            { x: 1, y: 2 },
            { x: 2, y: 2 },
            { x: 3, y: 3 },
            { x: 0, y: 4 },
            { x: 1, y: 4 },
            { x: 2, y: 4 }
        ]
    },
    T: {
        len: 3,
        pixels: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 1, y: 1 },
            { x: 1, y: 2 },
            { x: 1, y: 3 },
            { x: 1, y: 4 }
        ]
    },
    U: {
        len: 4,
        pixels: [
            { x: 0, y: 0 },
            { x: 3, y: 0 },
            { x: 0, y: 1 },
            { x: 3, y: 1 },
            { x: 0, y: 2 },
            { x: 3, y: 2 },
            { x: 0, y: 3 },
            { x: 3, y: 3 },
            { x: 1, y: 4 },
            { x: 2, y: 4 }
        ]
    },
    V: {
        len: 5,
        pixels: [
            { x: 0, y: 0 },
            { x: 4, y: 0 },
            { x: 0, y: 1 },
            { x: 4, y: 1 },
            { x: 0, y: 2 },
            { x: 4, y: 2 },
            { x: 1, y: 3 },
            { x: 3, y: 3 },
            { x: 2, y: 4 }
        ]
    },
    W: {
        len: 5,
        pixels: [
            { x: 0, y: 0 },
            { x: 4, y: 0 },
            { x: 0, y: 1 },
            { x: 4, y: 1 },
            { x: 0, y: 2 },
            { x: 2, y: 2 },
            { x: 4, y: 2 },
            { x: 0, y: 3 },
            { x: 2, y: 3 },
            { x: 4, y: 3 },
            { x: 1, y: 4 },
            { x: 2, y: 4 },
            { x: 3, y: 4 }
        ]
    },
    X: {
        len: 3,
        pixels: [
            { x: 0, y: 0 },
            { x: 2, y: 0 },
            { x: 0, y: 1 },
            { x: 2, y: 1 },
            { x: 1, y: 2 },
            { x: 0, y: 3 },
            { x: 2, y: 3 },
            { x: 0, y: 4 },
            { x: 2, y: 4 }
        ]
    },
    Y: {
        len: 3,
        pixels: [
            { x: 0, y: 0 },
            { x: 2, y: 0 },
            { x: 0, y: 1 },
            { x: 2, y: 1 },
            { x: 0, y: 2 },
            { x: 1, y: 2 },
            { x: 2, y: 2 },
            { x: 1, y: 3 },
            { x: 1, y: 4 }
        ]
    },
    Z: {
        len: 4,
        pixels: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 3, y: 0 },
            { x: 3, y: 1 },
            { x: 1, y: 2 },
            { x: 2, y: 2 },
            { x: 0, y: 3 },
            { x: 0, y: 4 },
            { x: 1, y: 4 },
            { x: 2, y: 4 },
            { x: 3, y: 4 }
        ]
    },
    '[': {
        len: 2,
        pixels: [
            { x: 1, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: 2 },
            { x: 0, y: 3 },
            { x: 0, y: 4 },
            { x: 1, y: 4 }
        ]
    },
    '\\': {
        len: 3,
        pixels: [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
            { x: 1, y: 2 },
            { x: 1, y: 3 },
            { x: 2, y: 4 }
        ]
    },
    ']': {
        len: 2,
        pixels: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 1, y: 2 },
            { x: 1, y: 3 },
            { x: 1, y: 4 },
            { x: 0, y: 4 }
        ]
    },
    '^': {
        len: 3,
        pixels: [
            { x: 1, y: 0 },
            { x: 0, y: 1 },
            { x: 2, y: 1 }
        ]
    },
    _: {
        len: 3,
        pixels: [
            { x: 0, y: 4 },
            { x: 1, y: 4 },
            { x: 2, y: 4 }
        ]
    },
    '`': {
        len: 1,
        pixels: [
            { x: 0, y: 0 },
            { x: 1, y: 1 }
        ]
    },
    '{': {
        len: 3,
        pixels: [
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 1, y: 1 },
            { x: 0, y: 2 },
            { x: 1, y: 3 },
            { x: 1, y: 4 },
            { x: 2, y: 4 }
        ]
    },
    '|': {
        len: 1,
        pixels: [
            { x: 0, y: 0 },
            { x: 0, y: 1 },
            { x: 0, y: 2 },
            { x: 0, y: 3 },
            { x: 0, y: 4 }
        ]
    },
    '}': {
        len: 3,
        pixels: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 2 },
            { x: 1, y: 3 },
            { x: 1, y: 4 },
            { x: 0, y: 4 }
        ]
    },
    '~': {
        len: 4,
        pixels: [
            { x: 0, y: 3 },
            { x: 1, y: 2 },
            { x: 2, y: 3 },
            { x: 3, y: 2 }
        ]
    }
};

//

class PixelScreen {
    /**
     * @param {HTMLElement} parentElement
     * @param {number} width screen width
     * @param {number} height screen height
     */
    constructor(parentElement, width, height) {
        const element = parentElement.querySelector('#pixelscreen');
        if (element) {
            this.canvas = element;
        } else {
            this.canvas = document.createElement('canvas');
            parentElement.appendChild(this.canvas);
        }
        this.canvas.id = 'pixelscreen';
        this.canvas.style.cursor = 'none';

        this.width = width ?? 128;
        this.height = height ?? 128;
        this.pixel = new Uint8Array(this.width * this.height * 3);

        try {
            this.gl = this.canvas.getContext('webgl2');
            this.webgl2 = true;
        } catch {
            this.gl = null;
        }
        if (!this.gl) {
            this.gl = this.canvas.getContext('webgl');
            this.webgl2 = false;
        }
        this.gl.clearColor(0, 0, 0, 1);

        this.scale = this.maxScale;
        this.scaleMulti = 1.0;
        this.rescale(this.scale);

        this.initShaderProgram();

        this.setUpBuffers();
        this.setUpAttributes();

        this.createTexture();
    }

    /**
     * Calculates the maximum screen scale
     * @returns {number}
     */
    get maxScale() {
        let canvasRect = this.canvas.getBoundingClientRect();

        let windowsWidth = window.innerWidth - canvasRect.left;
        let windowsHeight = window.innerHeight - canvasRect.top;

        let screenWidth = this.width;
        let screenHeight = this.height;

        let scaleWidth = Math.floor((windowsWidth / screenWidth) * this.scaleMulti);
        let scaleHeight = Math.floor((windowsHeight / screenHeight) * this.scaleMulti);

        return Math.min(scaleWidth, scaleHeight);
    }

    /**
     * @param {number} scale 
     */
    rescale(scale) {
        this.scale = scale;
        this.canvas.width = this.width * scale;
        this.canvas.height = this.height * scale;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * @param {number} width 
     * @param {number} height 
     */
    resize(width, height) {
        this.width = width;
        this.height = height;
        this.pixel = new Uint8Array(this.width * this.height * 3);

        this.rescale(this.maxScale);
    }

    setUpBuffers() {
        const vertices = [
            -1, 1, 0, 0, // top left
            1, 1, 1, 0, // top right
            -1, -1, 0, 1, // bottom left
            1, -1, 1, 1 // bottom right
        ];

        this.vbuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vbuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
    }

    setUpAttributes() {
        this.vertexPostion = this.gl.getAttribLocation(this.shaderProgram, 'aVertexPosition');
        this.texturePosition = this.gl.getAttribLocation(this.shaderProgram, 'aTextureCoord');
        this.sampler2DPosition = this.gl.getUniformLocation(this.shaderProgram, 'uTexture');

        this.gl.vertexAttribPointer(this.vertexPostion, 2, this.gl.FLOAT, false, 16, 0);
        this.gl.enableVertexAttribArray(this.vertexPostion);

        this.gl.vertexAttribPointer(this.texturePosition, 2, this.gl.FLOAT, false, 16, 8);
        this.gl.enableVertexAttribArray(this.texturePosition);
    }

    initShaderProgram() {
        let vertShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        if (this.webgl2) this.gl.shaderSource(vertShader, vs2);
        else this.gl.shaderSource(vertShader, vs);
        this.gl.compileShader(vertShader);

        let fragShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        if (this.webgl2) this.gl.shaderSource(fragShader, fs2);
        else this.gl.shaderSource(fragShader, fs);
        this.gl.compileShader(fragShader);

        this.shaderProgram = this.gl.createProgram();

        this.gl.attachShader(this.shaderProgram, vertShader);
        this.gl.attachShader(this.shaderProgram, fragShader);

        this.gl.linkProgram(this.shaderProgram);

        this.gl.useProgram(this.shaderProgram);
    }

    createTexture() {
        this.texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);

        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);

        this.updateTexture();

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);

        this.gl.uniform1i(this.sampler2DPosition, 0);
    }

    updateTexture() {
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGB, this.width, this.height, 0, this.gl.RGB, this.gl.UNSIGNED_BYTE, this.pixel);
    }

    render() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }

    /**
     * Changes the color of a pixel
     * @param {number} x x-coord
     * @param {number} y y-coord
     * @param {number} r
     * @param {number} g
     * @param {number} b
     */
    setPixel(x, y, r, g, b) {
        if (x >= 0 && x < this.width && y >= 0 && this.height) {
            let index = (this.width * y + x) * 3;
            if (index > this.pixel.length) return;
            this.pixel[index] = r;
            this.pixel[index + 1] = g;
            this.pixel[index + 2] = b;
        }
    }

    /**
     * Get the color of a pixel
     * @param {number} x
     * @param {number} y
     * @returns {{r,g,b}} color-object
     */
    getPixel(x, y) {
        let c = {
            r: 255,
            g: 255,
            b: 255
        };

        if (x >= 0 && x < this.width && y >= 0 && this.height) {
            let index = (this.width * y + x) * 3;
            if (index > this.pixel.length) return c;
            c.r = this.pixel[index];
            c.g = this.pixel[index + 1];
            c.b = this.pixel[index + 2];
        }
        return c;
    }

    clear(r, g, b) {
        for (let i = 0; i < this.pixel.length; i += 3) {
            this.pixel[i] = r;
            this.pixel[i + 1] = g;
            this.pixel[i + 2] = b;
        }
    }
}

//#region Shader

const vs = `
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

varying vec2 vTextureCoord;

void main() {
    gl_Position = vec4(aVertexPosition, 0, 1);
    vTextureCoord = aTextureCoord;
}
`;

const fs = `
precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D uTexture;

void main() {
    gl_FragColor = texture2D(uTexture, vTextureCoord);
}
`;

const vs2 = `#version 300 es
in vec2 aVertexPosition;
in vec2 aTextureCoord;

out vec2 vTextureCoord;

void main() {
    gl_Position = vec4(aVertexPosition, 0, 1);
    vTextureCoord = aTextureCoord;
}
`;

const fs2 = `#version 300 es
precision mediump float;

in vec2 vTextureCoord;
uniform sampler2D uTexture;
out vec4 fragColor;

void main() {
    fragColor = vec4(texture(uTexture, vTextureCoord).xyz,1);
}
`;

//#endregion

class Screen {
    /**
     * @param {HTMLElement} element
     */
    constructor(element) {
        this.element = element;
        this.pixelScreen = new PixelScreen(this.element);
        this.clear({ r: 0, g: 0, b: 0 });
    }

    clear(c) {
        this.pixelScreen.clear(c.r, c.g, c.b);
    }

    /**
     * @param {number} x x-coord
     * @param {number} y y-coord
     * @param {{r,g,b}} c color
     */
    drawPixel(x, y, c) {
        x = Math.round(x);
        y = Math.round(y);

        this.pixelScreen.setPixel(x, y, c.r, c.g, c.b);
    }

    /**
     * Draws a rectangle
     * @param {number} x x-coord
     * @param {number} y x-coord
     * @param {number} w width
     * @param {number} h height
     * @param {{r,g,b}} c color
     */
    drawRect(x, y, w, h, c) {
        x = Math.round(x);
        y = Math.round(y);
        w = Math.round(w);
        h = Math.round(h);

        for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
                this.pixelScreen.setPixel(x + i, y + j, c.r, c.g, c.b);
            }
        }
    }

    /**
     * Draws a straight line
     * @param {number} x1 line begin x-coord
     * @param {number} y1 line begin y-coord
     * @param {number} x2 line end x-coord
     * @param {number} y2 line end y-coord
     * @param {number} c line color
     */
    drawLine(x1, y1, x2, y2, c) {
        x1 = Math.round(x1);
        y1 = Math.round(y1);
        x2 = Math.round(x2);
        y2 = Math.round(y2);

        this.drawPixel(x1, y1, c);
        if (x1 == x2 && y1 == y2) return;

        let [dx, dy] = [x2 - x1, y2 - y1];
        let l = Math.sqrt(dx * dx + dy * dy);
        (dx /= l), (dy /= l);

        let [x, y] = [x1, y1];
        do {
            (x += dx), (y += dy);
            this.drawPixel(Math.round(x), Math.round(y), c);
        } while (!(Math.round(x) == x2 && Math.round(y) == y2));
    }

    /**
     * @param {number} x x-coord
     * @param {number} y y-coord
     * @param {any} spriteObj sprite format: [{x,y,hex},...]
     * @param {number} scale
     */
    drawSprite(x, y, spriteObj, scale) {
        x = Math.round(x);
        y = Math.round(y);
        for (let i = 0; i < spriteObj.length; i++) {
            this.drawRect(x + spriteObj[i].x * scale, y + spriteObj[i].y * scale, scale, scale, spriteObj[i].c);
        }
    }

    drawAnimatedSprite(x, y, animSpriteObj, scale, frame) {
        this.drawSprite(x, y, animSpriteObj[frame], scale);
    }

    /**
     * @param {number} x x-coord
     * @param {number} y y-coord
     * @param {{r,g,b}} c color of the text
     * @param {string} text
     * @param {{scale: number, leftSpace: number, topSpace: number}} options
     */
    drawText(x, y, text, c, options) {
        options = {
            scale: 1,
            leftSpace: 1,
            topSpace: 1,
            ...options
        };
        options.leftSpace *= options.scale;
        options.topSpace *= options.scale;

        let xOffset = x;
        for (let i = 0; i < text.length; i++) {
            let char = text[i].toUpperCase();

            if (char == ' ') {
                xOffset += 4 + options.leftSpace;
                continue;
            }
            if (char == '\n') {
                xOffset = x;
                y += 5 + options.topSpace;
                continue;
            }
            let charSprite = charSpriteMap[char];
            if (!charSprite) {
                charSprite = charSpriteMap['�'];
            }

            for (let j = 0; j < charSprite.pixels.length; j++) {
                this.drawRect(charSprite.pixels[j].x * options.scale + xOffset, charSprite.pixels[j].y * options.scale + y, options.scale, options.scale, c);
            }
            xOffset += charSprite.len + options.leftSpace;
        }
    }

    /**
     * @param {number} x x-coord
     * @param {number} y y-coord
     * @param {Tilemap} tilemap
     */
    drawTilemap(x, y, tilemap) {
        for (let i = 0; i < tilemap.tiles.length; i++) {
            this.drawSprite(x + tilemap.tiles[i].x * tilemap.tileWidth, y + tilemap.tiles[i].y * tilemap.tileHeight, tilemap.tileMap[tilemap.tiles[i].name], 1);
        }
    }

    /**
     * @param {number} x x-coord
     * @param {number} y y-coord
     * @param {{r,g,b}} c color
     * @param {string} func Function to draw (f(x) = Math.sin(x))
     * @param {number} start starting x
     * @param {number} end ending x
     */
    drawFunction(x, y, c, func, start, end) {
        if (func.includes('=')) {
            func = func.substring(func.indexOf('=') + 1);
        }

        let lastTy = eval(func.replaceAll('x', start)) + y;
        let ty = 0;

        for (let i = start + 1; i < end; i++) {
            ty = Math.round(eval(func.replaceAll('x', i)) + y);

            this.drawLine(i - 1 + x, lastTy, x + i, ty, c);

            lastTy = ty;
        }
    }

    /**
     * Draws a circle
     * @param {number} x x-coord
     * @param {number} y y-coord
     * @param {number} r radius
     * @param {{r,g,b}} c color
     */
    drawCircle(x, y, r, c) {
        let d = (5 - r * 4) / 4;
        let px = 0;
        let py = r;

        do {
            this.drawPixel(x + px, y + py, c);
            this.drawPixel(x - px, y + py, c);
            this.drawPixel(x + px, y - py, c);
            this.drawPixel(x - px, y - py, c);
            this.drawPixel(x + py, y + px, c);
            this.drawPixel(x - py, y + px, c);
            this.drawPixel(x + py, y - px, c);
            this.drawPixel(x - py, y - px, c);

            if (d < 0) {
                d += 2 * px + 1;
            } else {
                d += 2 * (px - py) + 1;
                py--;
            }
            px++;
        } while (px <= py);
    }

    /**
     * Draws a fcircle
     * @param {number} x x-coord
     * @param {number} y y-coord
     * @param {number} r radius
     * @param {{r,g,b}} c color
     */
    drawFilledCircle(x, y, r, c) {
        let d = (5 - r * 4) / 4;
        let px = 0;
        let py = r;

        do {
            this.drawLine(x - px, y + py, x + px, y + py, c);
            this.drawLine(x - px, y - py, x + px, y - py, c);
            this.drawLine(x - py, y + px, x + py, y + px, c);
            this.drawLine(x - py, y - px, x + py, y - px, c);

            if (d < 0) {
                d += 2 * px + 1;
            } else {
                d += 2 * (px - py) + 1;
                py--;
            }
            px++;
        } while (px <= py);
    }
}

class ApateUI {
    constructor(engine) {
        this.engine = engine;

        this.maxControlLength = 0;

        this.controlls = [];
        this.addControl('continue', () => {
            this.engine.IsRunning = true;
        });

        /**
         * @type {HTMLElement}
         */
        let el = this.engine.screen.pixelScreen.canvas;
        let fullscreen = false;

        this.addControl('fullscreen: off', (c) => {
            fullscreen = !fullscreen;

            c.name = `fullscreen: ${fullscreen ? 'on' : 'off'}`;

            // toggle fulscree
            if (fullscreen) {
                if (el.requestFullscreen) {
                    el.requestFullscreen();
                } else if (el.webkitRequestFullscreen) {
                    /* Safari */
                    el.webkitRequestFullscreen();
                } else if (el.msRequestFullscreen) {
                    /* IE11 */
                    el.msRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) document.exitFullscreen();
                if (document.webkitExitFullScreen) document.webkitExitFullScreen();
            }
        });

        this.addControl('reload page', () => {
            window.location.reload();
        });

        this.currentIndex = 0;

        this.backColor = color$1(30, 30, 30);
        this.shadowColor = color$1(0, 0, 0);
        this.fontColor = color$1(255, 255, 255);
        this.selectedColor = color$1(255, 120, 102);

        this.isFirstPress = true;
        this.keyDelay = 100;
        this.nextListen = 0;
    }

    /**
     * @param {number} delta
     */
    update(delta) {
        this.nextListen -= delta;

        if (this.nextListen < 0) {
            if (this.engine.isButtonPressed('engine_submit')) {
                this.controlls[this.currentIndex].execute();

                this.nextListen = this.isFirstPress ? this.keyDelay * 3 : this.keyDelay;
                this.isFirstPress = false;
            } else if (this.engine.isButtonPressed('up')) {
                this.currentIndex--;
                if (this.currentIndex < 0) this.currentIndex = this.controlls.length - 1;

                this.nextListen = this.isFirstPress ? this.keyDelay * 3 : this.keyDelay;
                this.isFirstPress = false;
            } else if (this.engine.isButtonPressed('down')) {
                this.currentIndex++;
                if (this.currentIndex >= this.controlls.length) this.currentIndex = 0;

                this.nextListen = this.isFirstPress ? this.keyDelay * 3 : this.keyDelay;
                this.isFirstPress = false;
            }
        } else {
            this.nextListen = this.engine.keys.length == 0 ? 0 : this.nextListen;
        }
        if (!this.isFirstPress && this.engine.keys.length == 0) this.isFirstPress = true;
    }

    draw() {
        let width = this.engine.screen.pixelScreen.width;
        let height = this.engine.screen.pixelScreen.height;

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                let c = this.engine.screen.pixelScreen.getPixel(x, y);
                c.r = c.r - 128 < 0 ? 0 : c.r - 128;
                c.g = c.g - 128 < 0 ? 0 : c.g - 128;
                c.b = c.b - 128 < 0 ? 0 : c.b - 128;
                this.engine.screen.drawPixel(x, y, c);
            }
        }

        let w = this.maxControlLength * 5;
        let h = this.controlls.length * 8;

        let minX = Math.round(width / 2 - w / 2);
        let minY = Math.round(height / 2 - h / 2);

        this.engine.screen.drawRect(minX + 2, minY + 2, w, h, this.shadowColor);
        this.engine.screen.drawRect(minX, minY, w, h, this.backColor);

        for (let i = 0; i < this.controlls.length; i++) {
            if (i == this.currentIndex) {
                this.engine.screen.drawText(minX + 1, minY + 2 + 7 * i, this.controlls[i].name, this.selectedColor);
            } else {
                this.engine.screen.drawText(minX + 1, minY + 2 + 7 * i, this.controlls[i].name, this.fontColor);
            }
        }
    }

    /**
     * TODO: rethink this code
     * @param {string} name Name of the control to add
     * @param {(obj: {name: string}) => void} onClick Event which is triggered when control is clicked
     */
    addControl(name, onClick) {
        let c = { name };

        c.execute = () => {
            onClick(c);
        };

        this.controlls.push(c);

        this.maxControlLength = name.length > this.maxControlLength ? name.length : this.maxControlLength;
    }
}

function color$1(r, g, b) {
    return { r, g, b };
}

//

class Random {
    /**
     * @param {number} seed
     */
    constructor(seed) {
        this.setSeed(seed ?? new Date().getTime());
    }

    /**
     * Set the seed with is used by the random generator
     * @param {number} seed
     */
    setSeed(seed) {
        this.a = seed;
        this.b = seed;
        this.c = seed;
        this.seed = seed;
    }

    /**
     * Generates a random number
     * @returns {number}
     */
    next() {
        this.a = (171 * this.a) % 30269;
        this.b = (172 * this.b) % 30307;
        this.c = (170 * this.c) % 30323;
        return (this.a / 30269 + this.b / 30307 + this.c / 30323) % 1;
    }

    /**
     * Generates a random number in the given range
     * @param {number} min minimum
     * @param {number} max maximum
     * @returns {number}
     */
    between(min, max) {
        return this.next() * (max - min) + min;
    }

    /**
     * Generates an random Integer in the given range
     * @param {number} min minimum
     * @param {number} max maximum
     * @returns {number}
     */
    betweenInt(min, max) {
        return Math.round(this.between(min, max));
    }
}

//

class Entity {
    constructor() {
        this.isInitialized = false;
        this.isActive = true;
        this.priority = 0;
    }

    /**
     * @param {'init' | 'update' | 'draw' | 'click' | 'mouseDown' | 'mouseUp'  | 'btnDown' | 'btnUp'} event
     * @param {() => void} callback
     */
    on(event, callback) {
        this[event] = callback;
    }

    /**
     * @param {any} obj loads a object into the entity and makes a 'backup'
     */
    loadAttributes(obj) {
        this.backup = obj;
        let keys = Object.keys(obj);
        for (let i = 0; i < keys.length; i++) {
            this[keys[i]] = obj[keys[i]];
        }
    }

    /**
     * Jump back to the last 'backup'
     */
    reset() {
        this.isInitialized = false;
        this.isActive = true;

        this.loadAttributes(this.backup);
    }

    /**
     * Once called on start
     */
    init() {}
    /**
     * Called every tick
     * @param {number} delta Time since last call
     */
    update(delta) {}
    /**
     * Called every frame
     */
    draw() {}
    /**
     * @param {{isLeftClick: boolean}} clickInfo
     */
    click(clickInfo) {}
    /**
     * Triggered when left mouse button is pressed down
     */
    mouseDown() {}
    /**
     * Triggered when left mouse button is released
     */
    mouseUp() {}
    /**
     * Triggered when any key pressed down
     * @param {{key: string, shift: boolean, metaKey: boolean}} keyInfo
     */
    btnDown(keyInfo) {}
    /**
     * Triggered when any key is released
     * @param {{key: string, shift: boolean, metaKey: boolean}} keyInfo
     */
    btnUp(keyInfo) {}
}

class Scene {
    constructor() {
        this.entities = [];
    }

    /**
     * Instanciates an entity in a current scene
     * @param {Entity} entity
     */
    init(entity) {
        this.entities.push(entity);

        this.entities = this.entities.sort((a, b) => a.priority - b.priority);
    }

    /**
     * Destroys the gives entity
     * @param {Entity} entity
     */
    delete(entity) {
        let i = this.entities.findIndex((e) => e == entity);
        if (i >= 0) this.entities.splice(i, 1);
    }

    /**
     * Copies all entities from another scene to this scene
     * @param {Scene} scene Scene to copy from
     */
    merge(scene) {
        for (let i = 0; i < scene.entities.length; i++) {
            this.entities.push(scene.entities[i]);
        }
    }

    /**
     * Executes the given event for all currently active entities with the given args
     * TODO: Fix (async)'init' being called mutliple times
     * @param {string} event
     * @param {*} args
     */
    async run(event, args) {
        for (let i = 0; i < this.entities.length; i++) {
            if ((!this.entities[i].isInitialized || event == 'init') && this.entities[i]['init']) {
                await this.entities[i]['init'](args);
                this.entities[i].isInitialized = true;
                if (event == 'init') return;
            }
            if (this.entities[i][event] && this.entities[i].isActive) this.entities[i][event](args);
        }
    }
}

/**
 * @typedef ParticleSystemProperties
 * @property {number?} seed
 * @property {number?} amount
 * @property {number?} emitDelay
 * @property {{x:number, y: number, w: number, h: number}?} origin
 * @property {{x:number, y: number, randomMinX: number, randomMinY: number, randomMaxX: number, randomMaxY: number}?} velocity
 * @property {{x:number, y: number}?} gravity
 *
 * @property {number?} lifetime
 * @property {{r: number, g: number, b: number}[]?} colors
 */

class ParticleSystem extends Entity {
    /**
     * @param {ParticleSystemProperties} properties
     */
    constructor(properties) {
        super();
        this.isActive = false;

        this.random = new Random();

        this.backup = properties ?? {};
        this.loadProperties(properties ?? {});

        this.particles = [];
    }

    /**
     * @param {ParticleSystemProperties} properties
     */
    loadProperties(properties) {
        if (properties.seed) this.random.setSeed(properties.seed);

        this.amount = properties.amount ?? Infinity;
        this.emitDelay = properties.emitDelay ?? 0;
        this.nextEmit = this.emitDelay;

        this.origin = {
            x: 0,
            y: -20,
            w: 128,
            h: 0,
            ...properties.origin
        };

        if (properties.origin && !properties.origin.w) this.origin.w = 0;
        if (properties.origin && !properties.origin.h) this.origin.h = 0;

        this.lifetime = properties.lifetime ?? Infinity;

        this.velocity = {
            x: 0,
            y: 0,
            ...properties.velocity
        };
        this.gravity = {
            x: 0,
            y: 0,
            ...properties.gravity
        };

        this.colors = properties.colors ?? [{ r: 255, g: 255, b: 255 }];
    }

    start() {
        this.isActive = true;
    }

    pause() {
        this.isActive = false;
    }

    reset() {
        this.isActive = false;
        this.loadProperties(this.backup);
    }

    setVelocity(vel) {
        this.velocity = {
            ...this.velocity,
            ...vel
        };
    }

    update(delta) {
        this.nextEmit -= delta;

        // create particle
        if (this.amount && this.nextEmit < 0 && this.isActive) {
            this.amount--;
            this.nextEmit = this.emitDelay;

            let x = this.origin.x;
            let y = this.origin.y;

            if (this.origin.w) x += this.random.between(0, this.origin.w);
            if (this.origin.h) y += this.random.between(0, this.origin.h);

            let velx = this.velocity.randomMinX ? this.random.between(this.velocity.randomMinX, this.velocity.randomMaxX) : this.velocity.x;
            let vely = this.velocity.randomMinY ? this.random.between(this.velocity.randomMinY, this.velocity.randomMaxY) : this.velocity.y;

            let c = this.colors[Math.floor(this.random.between(0, this.colors.length))];

            this.particles.push({ x, y, vx: velx, vy: vely, lifetime: this.lifetime, c });
        }

        // update all particles
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].vx += this.gravity.x;
            this.particles[i].vy += this.gravity.y;

            this.particles[i].x += (this.particles[i].vx * delta) / 1000;
            this.particles[i].y += (this.particles[i].vy * delta) / 1000;

            this.particles[i].lifetime--;
            if (this.particles[i].lifetime <= 0) {
                this.particles.splice(i, 1);
                i--;
            }
        }
    }

    init() {
        console.log(this);
    }

    /**
     * @param {Screen} screen
     */
    draw(screen) {
        for (const parti of this.particles) {
            screen.drawPixel(Math.floor(parti.x), Math.floor(parti.y), parti.c);
        }
    }
}

class Apate {
    constructor() {
        this.random = new Random();
        this.spriteMgr = new SpriteMgr();

        this.colors = defaultColors;
        this.clearColor = defaultColors.black;
        this.clearScreen = true;

        this.screen = new Screen(document.body);

        this.keyMap = defaultKeyMap;
        this.keys = [];

        this.controllerAxes = [];

        this.IsRunning = false;
        this.IsDebug = false;

        this.activeScene = new Scene();

        this.ui = new ApateUI(this);

        this.mouseX = 0;
        this.mouseY = 0;
        this.IsMouseDown = false;

        this.ShowMouse = false;
        this.autoResize = true;

        this.screen.pixelScreen.canvas.addEventListener('mousemove', (e) => {
            this.mouseX = Math.round(e.offsetX / this.screen.pixelScreen.scale);
            this.mouseY = Math.round(e.offsetY / this.screen.pixelScreen.scale);
        });

        this.screen.pixelScreen.canvas.addEventListener('click', (e) => {
            this['click']({ isLeftClick: false });
            this.activeScene.run('click', { isLeftClick: false });
        });
        this.screen.pixelScreen.canvas.addEventListener('contextmenu', (e) => {
            this['click']({ isLeftClick: true });
            this.activeScene.run('click', { isLeftClick: true });
            e.preventDefault();
            return false;
        });
        this.screen.pixelScreen.canvas.addEventListener('mousedown', (e) => {
            this.IsMouseDown = true;
            this['mouseDown']();
            this.activeScene.run('mouseDown');
        });
        this.screen.pixelScreen.canvas.addEventListener('mouseup', (e) => {
            this.IsMouseDown = false;
            this['mouseUp']();
            this.activeScene.run('mouseUp');
        });

        this.autoPauseOnLeave = true;
        document.addEventListener('blur', () => {
            if (this.autoPauseOnLeave) {
                this.IsRunning = false;
            }
        });

        this.autoResumeOnFocus = false;
        document.addEventListener('focus', () => {
            if (this.autoResumeOnFocus) {
                this.IsRunning = true;
            }
        });

        document.addEventListener('keydown', (e) => {
            this.keys.push(e.code.toLowerCase());

            this.activeScene.run('btnDown', { key: e.code.toLowerCase(), shift: e.shiftKey, metaKey: e.metaKey });
            if (this['btnDown']) this['btnDown']({ key: e.code.toLowerCase(), shift: e.shiftKey, metaKey: e.metaKey });

            if (this.isButtonPressed('engine_menu')) this.IsRunning = !this.IsRunning;
            if (!e.metaKey) e.preventDefault();
        });

        document.addEventListener('keyup', (e) => {
            this.keys = this.keys.filter((code) => code != e.code.toLowerCase());

            this.activeScene.run('btnUp', { key: e.code.toLowerCase(), shift: e.shiftKey, metaKey: e.metaKey });
            if (this['btnUp']) this['btnUp']({ key: e.code.toLowerCase(), shift: e.shiftKey, metaKey: e.metaKey });
        });
        window.addEventListener('gamepadconnected', (e) => {
            console.log('gamepad connected!', e);
        });

        window.addEventListener('resize', (e) => {
            if (this.autoResize) {
                this.screen.pixelScreen.rescale(this.screen.pixelScreen.maxScale);
            }
        });
        if (this.autoResize) this.screen.pixelScreen.rescale(this.screen.pixelScreen.maxScale);
    }

    /**
     * @deprecated Use screen.pixelScreen.maxScale instead
     */
    get maxScreenScale() {
        let width = window.innerWidth;
        let height = window.innerHeight;
        let max = width >= height ? height : width;

        let maxScreen = this.screen.pixelScreen.width >= this.screen.pixelScreen.height ? this.screen.pixelScreen.width : this.screen.pixelScreen.height;

        let scale = Math.floor(max / maxScreen);
        return scale;
    }

    /**
     * Once called on start
     */
    start() {}
    /**
     * Called every tick
     * @param {number} delta Time since last call
     */
    update(delta) {}
    /**
     * Called every frame
     */
    draw() {}
    /**
     * @param {{isLeftClick: boolean}} clickInfo
     */
    click(clickInfo) {}
    /**
     * Triggered when left mouse button is pressed down
     */
    mouseDown() {}
    /**
     * Triggered when left mouse button is released
     */
    mouseUp() {}
    /**
     * Triggered when any key pressed down
     * @param {{key: string, shift: boolean, metaKey: boolean}} keyInfo
     */
    btnDown(keyInfo) {}
    /**
     * Triggered when any key is released
     * @param {{key: string, shift: boolean, metaKey: boolean}} keyInfo
     */
    btnUp(keyInfo) {}

    /**
     * Starts the current instance
     *
     * Calls update every tick (max. ~230 ticks per second, depending on browser limit)
     * Calls draw evrey frame (depends on browsers refresh rate)
     */
    async run() {
        this.IsRunning = true;

        // load game files
        if (this['load']) await this['load']();
        // start game (download rescources)
        if (this['start']) await this['start']();
        await this.activeScene.run('init');

        // create variables
        let self = this;

        // timing
        let lastTime = new Date().getTime();
        let time = 0;
        let delta = 0;

        let frames = 0;
        let ticks = 0;

        //start render loop
        let renderLoop = function () {
            if (self.clearScreen) self.screen.clear(self.clearColor);

            self['draw']?.(self.screen);
            self.activeScene.run('draw', self.screen);

            if (!self.IsRunning) self.ui.draw();
            if (self.IsRunning && self.ShowMouse) drawMouse(self.mouseX, self.mouseY, 1, self);

            frames++;

            self.screen.pixelScreen.updateTexture();
            self.screen.pixelScreen.render();

            if (!self.isStopped) window.requestAnimationFrame(renderLoop);
        };
        window.requestAnimationFrame(renderLoop);

        // draw info
        this.infoLoop = setInterval(() => {
            if (this.IsDebug) console.log({ frames, ticks });
            frames = 0;
            ticks = 0;
        }, 1000);

        const maxTicks = 500;
        let nextUpdate = 1000 / maxTicks;
        let updateDelta = 0;
        // set update intervall and update objects
        this.updateLoop = setInterval(() => {
            time = new Date().getTime();
            delta = time - lastTime;
            nextUpdate -= delta;
            updateDelta += delta;

            if (this.IsRunning && nextUpdate < 0) {
                nextUpdate = 1000 / maxTicks;

                if (this['update']) this['update'](updateDelta);
                this.activeScene.run('update', updateDelta);

                ticks++;
                updateDelta = 0;
            } else {
                this.ui.update(delta);
            }
            lastTime = time;
        }, 0);
    }

    /**
     * Stops the current running instance
     */
    stop() {
        clearInterval(this.updateLoop);
        clearInterval(this.infoLoop);
        this.isStopped = true;
    }

    /**
     * @param {'start' | 'update' | 'draw' | 'click' | 'mouseDown' | 'mouseUp'  | 'btnDown' | 'btnUp'} event
     * @param {() => void} handler
     */
    on(event, handler) {
        this[event.toLowerCase()] = handler;
    }

    /**
     * @param {'Up' | 'Down' | 'Left' | 'Right' | 'Action1' | 'Action2'} name
     * @returns {boolean}
     */
    isButtonPressed(name) {
        name = name.toLowerCase();

        if (navigator.getGamepads()[0]) {
            if (name == 'up' && navigator.getGamepads()[0].axes[1] < -0.3) return true;
            else if (name == 'down' && navigator.getGamepads()[0].axes[1] > 0.3) return true;
            else if (name == 'left' && navigator.getGamepads()[0].axes[0] < -0.3) return true;
            else if (name == 'right' && navigator.getGamepads()[0].axes[0] > 0.3) return true;
            else if (name == 'action1' && navigator.getGamepads()[0].buttons[controllerMap['action1']].pressed) return true;
            else if (name == 'action2' && navigator.getGamepads()[0].buttons[controllerMap['action2']].pressed) return true;
            else if (name == 'engine_menu' && navigator.getGamepads()[0].buttons[controllerMap['engine_menu']].pressed) return true;
            else if (name == 'engine_submit' && navigator.getGamepads()[0].buttons[controllerMap['engine_submit']].pressed) return true;
        }

        if (this.keyMap[name]) {
            for (let i = 0; i < this.keyMap[name].length; i++) {
                if (this.keys.includes(this.keyMap[name][i].toLowerCase())) return true;
            }
        } else {
            if (this.keys.includes(name)) return true;
        }

        return false;
    }

    /**
     * Saves an object to the local storage
     * @param {string} name
     * @param {*} obj
     */
    saveObjToBrowser(name, obj) {
        localStorage.setItem(name, JSON.stringify(obj));
    }

    /**
     * Loads an object from the local storage
     * @param {string} name
     */
    loadObjFromBrowser(name) {
        let obj = localStorage.getItem(name);
        return obj ? JSON.parse(obj) : null;
    }

    /**
     * Sets the root element where the main canvas is located
     * @param {HTMLElement} parent
     */
    setParentElement(parent) {
        parent.appendChild(this.screen.pixelScreen.canvas);
    }
}

const defaultMouse = [
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 0 }
];

/**
 * @param {number} x
 * @param {number} y
 * @param {number} scale
 * @param {Engine} engine
 */
function drawMouse(x, y, scale, engine) {
    for (let mp = 0; mp < defaultMouse.length; mp++) {
        for (let i = 0; i < scale; i++) {
            for (let j = 0; j < scale; j++) {
                let pixel = engine.screen.pixelScreen.getPixel(x + i + defaultMouse[mp].x * scale, y + j + defaultMouse[mp].y * scale);
                let mousePixel = 255 - (pixel.r + pixel.g + pixel.b) / 3;

                engine.screen.drawPixel(x + i + defaultMouse[mp].x * scale, y + j + defaultMouse[mp].y * scale, color(mousePixel, mousePixel, mousePixel));
            }
        }
    }
}

const defaultKeyMap = {
    up: ['KeyW', 'ArrowUp'],
    down: ['KeyS', 'ArrowDown'],
    left: ['KeyA', 'ArrowLeft'],
    right: ['KeyD', 'ArrowRight'],

    action1: ['KeyZ', 'KeyN', 'KeyC', 'Space'],
    action2: ['KeyX', 'KeyM', 'KeyV'],

    engine_menu: ['Escape'],
    engine_submit: ['Enter', 'NumpadEnter']
};

const controllerMap = {
    action1: 0,
    action2: 2,
    engine_menu: 1,
    engine_submit: 0
};

function color(r, g, b) {
    return { r, g, b };
}

/**
 * A collection of the best colors
 */
const defaultColors = {
    white: color(230, 230, 230),
    black: color(20, 20, 20),
    gray: color(40, 40, 40),
    light_gray: color(60, 60, 60),

    yellow: color(255, 215, 0),
    ocher: color(190, 150, 0),
    orange: color(255, 155, 0),
    brown: color(165, 110, 30),
    red: color(255, 75, 75),
    dark_red: color(170, 50, 50),
    pink: color(230, 85, 150),
    magenta: color(185, 50, 110),

    light_purple: color(170, 90, 190),
    purple: color(110, 50, 120),
    indigo: color(100, 100, 190),
    dark_indigo: color(70, 70, 140),
    blue: color(65, 90, 160),
    dark_blue: color(50, 70, 120),
    agua: color(80, 170, 220),
    dark_agua: color(50, 135, 180),

    cyan: color(60, 220, 200),
    dark_cyan: color(40, 170, 155),
    mint: color(70, 200, 140),
    jade: color(40, 145, 100),
    light_green: color(100, 220, 100),
    green: color(50, 165, 50),
    lime: color(190, 220, 90),
    avocado: color(160, 190, 50)
};

let spriteMgr = new SpriteMgr();

export { Entity, ParticleSystem, Scene, SpriteMgr, Tilemap, color, spriteMgr, Apate as default };
