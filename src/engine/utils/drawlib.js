import { spritelib } from "./spritelib.js";
export class DrawLib {
    screen;
    fontMap = {};
    constructor(screen) {
        this.screen = screen;
    }
    async loadFont(url, characters, charWidth) {
        let data;
        data = await spritelib.load(url);
        let chars = spritelib.split(data, charWidth, data.height, 0);
        if (chars.length != characters.length)
            console.error("Characters do not match with image!");
        for (let i = 0; i < characters.length; i++) {
            // color white for color addition
            for (let j = 0; j < chars[i].data.length; j += 4) {
                if (chars[i].data[j + 3] > 0) {
                    chars[i].data[j] = 255;
                    chars[i].data[j + 1] = 255;
                    chars[i].data[j + 2] = 255;
                }
            }
            this.fontMap[characters[i]] = chars[i];
        }
        console.log(this.fontMap);
    }
    pixel(x, y, c) {
        this.screen.setPixel(x, y, c.r, c.g, c.b);
    }
    rect(x, y, w, h, c) {
        for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
                this.screen.setPixel(i + x, j + y, c.r, c.g, c.b);
            }
        }
    }
    sprite(x, y, sprite) {
        if (!sprite) {
            console.warn("Sprite not ready! skipping draw");
            return;
        }
        for (let i = 0, px = 0, py = 0; i < sprite.data.length; i += 4, px++) {
            if (px >= sprite.width) {
                px = 0;
                py++;
            }
            if (sprite.data[i + 3] > 0) {
                this.screen.setPixel(px + x, py + y, sprite.data[i], sprite.data[i + 1], sprite.data[i + 2]);
            }
        }
    }
    spriteExt(x, y, sprite, scale, color) {
        if (!sprite) {
            console.warn("Sprite not ready! skipping draw");
            return;
        }
        scale = Math.round(scale);
        let i, px, py, dx, dy;
        for (i = 0, px = 0, py = 0; i < sprite.data.length; i += 4, px += scale) {
            if (px >= sprite.width * scale) {
                px = 0;
                py += scale;
            }
            if (sprite.data[i + 3] > 0) {
                for (dx = 0; dx < scale; dx++) {
                    for (dy = 0; dy < scale; dy++) {
                        if (color)
                            this.screen.setPixel(px + dx + x, py + dy + y, (sprite.data[i] + color.r) / 2, (sprite.data[i + 1] + color.g) / 2, (sprite.data[i + 2] + color.b) / 2);
                        else
                            this.screen.setPixel(px + dx + x, py + dy + y, sprite.data[i], sprite.data[i + 1], sprite.data[i + 2]);
                    }
                }
            }
        }
    }
    text(x, y, text, c, scale = 1, leftMargin = 1) {
        text = text.toUpperCase();
        for (let i = 0, char; i < text.length; i++) {
            if (text[i] == " ")
                continue;
            char = this.fontMap[text[i]];
            if (char) {
                this.spriteExt(x + i * (char.width + leftMargin) * scale, y, char, scale, { r: (c.r - 128) * 2, g: (c.g - 128) * 2, b: (c.b - 128) * 2 }); // to overwrite color
            }
            else
                this.pixel(x + i * (4 + leftMargin) * scale, y, c);
        }
    }
    measureText(text, scale = 1, leftMargin = 1) {
        let sum = 0;
        for (let i = 0; i < text.length; i++) {
            if (text[i] == " " || !this.fontMap[text[i]])
                sum += (4 + leftMargin) * scale;
            else
                sum += (this.fontMap[text[i]].width + leftMargin) * scale;
        }
        return sum;
    }
}
