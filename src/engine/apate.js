class Scene {
    constructor(transition, apateInstace) {
        this.entities = [];
        this._transition = transition;
        this._apateInstance = apateInstace;
    }
    set apateInstance(value) {
        this._apateInstance = value;
        // automaticlly reinit entities when instance is changed
        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i].apate = value;
            this.entities[i].init();
            this.entities[i].isInitialized = true;
        }
    }
    get apateInstance() {
        return this._apateInstance;
    }
    add(entity) {
        this.entities.push(entity);
        // init
        if (this._apateInstance) {
            entity.apate = this._apateInstance;
            entity.init();
            entity.isInitialized = true;
        }
    }
    remove(entity) {
        let i = this.entities.indexOf(entity);
        if (i > -1)
            this.entities.splice(i, 1);
    }
    update(delta) {
        for (let i = 0; i < this.entities.length; i++) {
            if (this.entities[i].doUpdate)
                this.entities[i].update(delta);
        }
    }
    draw(draw) {
        for (let i = 0; i < this.entities.length; i++) {
            if (this.entities[i].doDraw)
                this.entities[i].draw(draw);
        }
    }
    onLoad() { }
    async load() {
        if (this._apateInstance) {
            if (this._apateInstance.activeScene._transition) {
                this._apateInstance.activeScene.add(this._apateInstance.activeScene._transition);
                await this._apateInstance.activeScene._transition.do("start");
                this._apateInstance.activeScene.remove(this._apateInstance.activeScene._transition);
            }
            this._apateInstance.activeScene = this;
            if (this._transition) {
                this.add(this._transition);
                await this._transition.do("end");
                this.remove(this._transition);
            }
        }
        else
            console.error("Can't load scene without apate instance");
    }
}

const planeVerts = [-1, 1, 0, 0, 1, 1, 1, 0, -1, -1, 0, 1, 1, -1, 1, 1];
class Screen {
    constructor() {
        this.textureWidth = 128;
        this.textureHeight = 128;
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.textureWidth;
        this.canvas.height = this.textureHeight;
        this.gl = this.canvas.getContext("webgl");
        this.pixelBuffer = new Uint8Array(this.textureWidth * this.textureHeight * 3);
        this.initGL();
        this.updateScreen();
    }
    get width() {
        return this.textureWidth;
    }
    get height() {
        return this.textureHeight;
    }
    initGL() {
        let vbuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(planeVerts), this.gl.STATIC_DRAW);
        let vshader = this.gl.createShader(this.gl.VERTEX_SHADER);
        let fshader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        this.gl.shaderSource(vshader, vs);
        this.gl.shaderSource(fshader, fs);
        this.gl.compileShader(vshader);
        this.gl.compileShader(fshader);
        let sprogram = this.gl.createProgram();
        this.gl.attachShader(sprogram, vshader);
        this.gl.attachShader(sprogram, fshader);
        this.gl.linkProgram(sprogram);
        this.gl.useProgram(sprogram);
        let shaderLocations = {
            vertPos: this.gl.getAttribLocation(sprogram, "aVertexPosition"),
            textPos: this.gl.getAttribLocation(sprogram, "aTextureCoord"),
            sampPos: this.gl.getUniformLocation(sprogram, "uTexture"),
        };
        this.gl.vertexAttribPointer(shaderLocations.vertPos, 2, this.gl.FLOAT, false, 16, 0);
        this.gl.enableVertexAttribArray(shaderLocations.vertPos);
        this.gl.vertexAttribPointer(shaderLocations.textPos, 2, this.gl.FLOAT, false, 16, 8);
        this.gl.enableVertexAttribArray(shaderLocations.textPos);
        let texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.uniform1i(shaderLocations.sampPos, 0);
    }
    updateScreen() {
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGB, this.textureWidth, this.textureHeight, 0, this.gl.RGB, this.gl.UNSIGNED_BYTE, this.pixelBuffer);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }
    clear(r, g, b) {
        for (let i = 0; i < this.pixelBuffer.length; i += 3) {
            this.pixelBuffer[i] = r;
            this.pixelBuffer[i + 1] = g;
            this.pixelBuffer[i + 2] = b;
        }
    }
    setPixel(x, y, r, g, b) {
        if (x >= 0 && x < this.textureWidth && y >= 0 && y < this.textureHeight) {
            let i = (this.textureWidth * y + x) * 3;
            if (i > this.pixelBuffer.length)
                return;
            this.pixelBuffer[i] = r;
            this.pixelBuffer[i + 1] = g;
            this.pixelBuffer[i + 2] = b;
        }
    }
    resize(textureWidth, textureHeight) {
        this.textureWidth = textureWidth;
        this.textureHeight = textureHeight;
        this.pixelBuffer = new Uint8Array(this.textureWidth * this.textureHeight * 3);
        this.scale = this.scale;
    }
    set scale(value) {
        this.canvas.width = this.textureWidth * value;
        this.canvas.height = this.textureHeight * value;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
    get scale() {
        return this.canvas.width / this.textureWidth;
    }
    get maxScale() {
        let canvasRect = this.canvas.getBoundingClientRect();
        let windowsWidth = window.innerWidth - canvasRect.left;
        let windowsHeight = window.innerHeight - canvasRect.top;
        let scaleWidth = Math.floor(windowsWidth / this.textureWidth);
        let scaleHeight = Math.floor(windowsHeight / this.textureHeight);
        return Math.min(scaleWidth, scaleHeight);
    }
}
const vs = `attribute vec2 aVertexPosition;attribute vec2 aTextureCoord;varying vec2 vTextureCoord;void main() {gl_Position = vec4(aVertexPosition, 0, 1);vTextureCoord = aTextureCoord;}`;
const fs = `precision mediump float;varying vec2 vTextureCoord;uniform sampler2D uTexture;void main() {gl_FragColor = texture2D(uTexture, vTextureCoord);}`;

class Button {
    constructor(name, keybinds, controllerBind) {
        this.name = name;
        this.keybinds = keybinds;
        this.controllerBind = controllerBind;
    }
    addKeybind(key) {
        this.keybinds.push(key);
    }
    removeKeybind(key) {
        let i = this.keybinds.indexOf(key);
        if (i > -1)
            this.keybinds.splice(i, 1);
    }
}
Button.up = new Button("up", ["KeyW", "ArrowUp"], 12);
Button.down = new Button("down", ["KeyS", "ArrowDown"], 13);
Button.left = new Button("left", ["KeyA", "ArrowLeft"], 14);
Button.right = new Button("right", ["KeyD", "ArrowRight"], 15);
Button.action1 = new Button("action1", ["KeyZ", "KeyN", "KeyC", "Space"], 0);
Button.action2 = new Button("action2", ["KeyX", "KeyM", "KeyV"], 2);
Button.cancel = new Button("cancel", ["Backspace", "Escape"], 1);

class Input {
    constructor(screen) {
        this.pressedKeys = [];
        this.isMousePressed = false;
        this.mousePos = { x: 0, y: 0 };
        this.buttons = {};
        this.registeredButtons = { up: [], down: [] };
        this.gamepads = [];
        this.gamepadPressedButtons = [];
        this.gamepadDeadzone = 0.18;
        this._screen = screen;
        window.addEventListener("keydown", this.onKeyDown.bind(this));
        window.addEventListener("keyup", this.onKeyUp.bind(this));
        screen.canvas.addEventListener("mousedown", this.onMouseDown.bind(this));
        screen.canvas.addEventListener("mouseup", this.onMouseUp.bind(this));
        screen.canvas.addEventListener("mousemove", this.onMouseMove.bind(this));
        screen.canvas.addEventListener("touchstart", this.onTouchStart.bind(this));
        screen.canvas.addEventListener("touchend", this.onTouchEnd.bind(this));
        screen.canvas.addEventListener("touchmove", this.onTouchMove.bind(this));
        window.addEventListener("gamepadconnected", this.onGamepadConnected.bind(this));
        window.addEventListener("gamepaddisconnected", this.onGamepadDisconnected.bind(this));
        for (const btn of [Button.up, Button.down, Button.left, Button.right, Button.action1, Button.action2, Button.cancel]) {
            this.addButton(btn);
        }
    }
    onKeyDown(ev) {
        this.pressedKeys.push(ev.code);
        this.runRegisteredActions("down", ev.code);
    }
    onKeyUp(ev) {
        this.pressedKeys = this.pressedKeys.filter((code) => code != ev.code);
        this.runRegisteredActions("up", ev.code);
    }
    onMouseDown(ev) {
        this.isMousePressed = true;
        this.runRegisteredActions("down", "mouse");
    }
    onMouseUp(ev) {
        this.isMousePressed = false;
        this.runRegisteredActions("up", "mouse");
    }
    onMouseMove(ev) {
        this.mousePos.x = Math.floor(ev.offsetX / this._screen.scale);
        this.mousePos.y = Math.floor(ev.offsetY / this._screen.scale);
    }
    onTouchStart(ev) {
        this.isMousePressed = true;
        this.runRegisteredActions("down", "mouse");
    }
    onTouchEnd(ev) {
        this.isMousePressed = false;
        this.runRegisteredActions("up", "mouse");
    }
    onTouchMove(ev) {
        ev.preventDefault();
        this.mousePos.x = Math.floor(ev.touches[0].pageX / this._screen.scale);
        this.mousePos.y = Math.floor(ev.touches[0].pageY / this._screen.scale);
    }
    on(btn, ev, action) {
        if (typeof btn == "string") {
            this.registeredButtons[ev].push({ btn: new Button(btn, [btn]), action });
        }
        else {
            this.registeredButtons[ev].push({ btn, action });
        }
    }
    clearRegisteredButtons() {
        this.registeredButtons = { up: [], down: [] };
    }
    runRegisteredActions(ev, key) {
        for (let i = 0; i < this.registeredButtons[ev].length; i++) {
            if (this.registeredButtons[ev][i].btn.keybinds.includes(key)) {
                this.registeredButtons[ev][i].action();
            }
        }
    }
    runRegisteredGamepadActions(ev, btnBind) {
        for (let i = 0; i < this.registeredButtons[ev].length; i++) {
            if (this.registeredButtons[ev][i].btn.controllerBind === btnBind) {
                this.registeredButtons[ev][i].action();
            }
        }
    }
    onGamepadConnected(ev) {
        let gamepad = ev.gamepad;
        console.log(`Gamepad connected! Index: ${gamepad.index}, Name: ${gamepad.id}`);
        this.gamepads[gamepad.index] = gamepad;
    }
    onGamepadDisconnected(ev) {
        let gamepad = ev.gamepad;
        console.log(`Gamepad disconnected! Index: ${gamepad.index}`);
        delete this.gamepads[gamepad.index];
    }
    updateGamepads() {
        // refresh gamepad list outside of firefox
        if (!("ongamepadconnected" in window)) {
            // get gamepad object and convert it to an array
            this.gamepads = Object.entries(navigator.getGamepads()).map(([key, value]) => value);
        }
        let gamepad = this.getGamepad();
        if (gamepad) {
            for (let i = 0; i < gamepad.buttons.length; i++) {
                if (gamepad.buttons[i].pressed && !this.gamepadPressedButtons[i]) {
                    this.gamepadPressedButtons[i] = true;
                    this.runRegisteredGamepadActions("down", i);
                }
                else if (!gamepad.buttons[i].pressed && this.gamepadPressedButtons[i]) {
                    this.gamepadPressedButtons[i] = false;
                    this.runRegisteredGamepadActions("up", i);
                }
            }
        }
    }
    addButton(btn) {
        this.buttons[btn.name] = btn;
    }
    getButton(btnName) {
        return this.buttons[btnName];
    }
    removeButton(btn) {
        delete this.buttons[btn.name];
    }
    clearButtons() {
        this.buttons = {};
    }
    isButtonDown(btn) {
        if (typeof btn == "string") {
            if (!this.buttons[btn]) {
                console.warn("No button with this name registered: " + btn);
                return false;
            }
            btn = this.buttons[btn];
        }
        for (let i = 0; i < btn.keybinds.length; i++) {
            if (this.pressedKeys.includes(btn.keybinds[i]))
                return true;
        }
        if (btn.controllerBind != null && this.isGamepadConnected()) {
            if (this.getGamepad().buttons[btn.controllerBind].pressed) {
                return true;
            }
        }
        return false;
    }
    getAxis() {
        if (this.isGamepadConnected()) {
            let gamepad = this.getGamepad();
            let ch = gamepad.axes[0];
            let cv = gamepad.axes[1] * -1;
            if (ch > this.gamepadDeadzone || ch < -this.gamepadDeadzone || cv > this.gamepadDeadzone || cv < -this.gamepadDeadzone) {
                return { v: cv, h: ch };
            }
        }
        let axis = { v: 0, h: 0 };
        if (this.isButtonDown(Button.up))
            axis.v += 1;
        if (this.isButtonDown(Button.down))
            axis.v -= 1;
        if (this.isButtonDown(Button.right))
            axis.h += 1;
        if (this.isButtonDown(Button.left))
            axis.h -= 1;
        return axis;
    }
    isGamepadConnected() {
        return this.gamepads.filter((n) => n).length > 0;
    }
    getGamepad() {
        if (this.isGamepadConnected()) {
            // get first non null element
            return this.gamepads.find((c) => c != null);
        }
        else {
            // TODO: return dummy gamepad?
            return null;
        }
    }
}

class SpriteLib {
    constructor() {
        this.canvas = document.createElement("canvas");
    }
    async load(url) {
        let img = new Image();
        img.crossOrigin = "Anonymous";
        try {
            await new Promise((res, rej) => {
                img.onload = res;
                img.onerror = rej;
                img.src = url;
            });
        }
        catch {
            console.error("Couldn't load resource: " + url);
            return new ImageData(new Uint8ClampedArray([255, 0, 255, 255]), 1, 1);
        }
        return this.loadSync(img);
    }
    loadSync(img) {
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        let ctx = this.canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        return ctx.getImageData(0, 0, img.width, img.height);
    }
    split(sprite, width, height, yOffset = 0) {
        let sprites = [];
        for (let i = 0; i < sprite.width / width; i++) {
            let part = [];
            for (let y = yOffset; y < yOffset + height; y++) {
                for (let x = i * width; x < i * width + width; x++) {
                    let ndx = (sprite.width * y + x) * 4;
                    part.push(sprite.data[ndx], sprite.data[ndx + 1], sprite.data[ndx + 2], sprite.data[ndx + 3]);
                }
            }
            sprites.push(new ImageData(new Uint8ClampedArray(part), width, height));
        }
        return sprites;
    }
    filp(sprite, horizontal = true, vertical = false) {
        this.canvas.width = sprite.width;
        this.canvas.height = sprite.height;
        let ctx = this.canvas.getContext("2d");
        ctx.putImageData(sprite, 0, 0);
        let tmpC = document.createElement("canvas");
        tmpC.width = this.canvas.width;
        tmpC.height = this.canvas.height;
        let tmpCtx = tmpC.getContext("2d");
        tmpCtx.translate(horizontal ? sprite.width : 0, vertical ? sprite.height : 0);
        tmpCtx.scale(horizontal ? -1 : 1, vertical ? -1 : 1);
        tmpCtx.drawImage(this.canvas, 0, 0);
        tmpCtx.setTransform(1, 0, 0, 1, 0, 0);
        return tmpCtx.getImageData(0, 0, sprite.width, sprite.height);
    }
    createCopy(sprite) {
        return new ImageData(new Uint8ClampedArray(sprite.data), sprite.width, sprite.height);
    }
    replaceColor(sprite, from, to) {
        for (let i = 0; i < sprite.data.length; i += 4) {
            if (sprite.data[i + 3] == 0)
                continue;
            else if (sprite.data[i] == from.r && sprite.data[i + 1] == from.g && sprite.data[i + 2] == from.b) {
                sprite.data[i] = to.r;
                sprite.data[i + 1] = to.g;
                sprite.data[i + 2] = to.b;
            }
        }
        return sprite;
    }
}
var spritelib = new SpriteLib();

class DrawLib {
    constructor(screen) {
        this.fontMap = {};
        this._cameraOffsetX = 0;
        this._cameraOffsetY = 0;
        this.screen = screen;
    }
    setOffset(x, y) {
        this._cameraOffsetX = x;
        this._cameraOffsetY = y;
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
        this.screen.setPixel(x + this._cameraOffsetX, y + this._cameraOffsetY, c.r, c.g, c.b);
    }
    rect(x, y, w, h, c) {
        for (let i = 0; i < w; i++) {
            for (let j = 0; j < h; j++) {
                this.screen.setPixel(i + x + this._cameraOffsetX, j + y + this._cameraOffsetY, c.r, c.g, c.b);
            }
        }
    }
    sprite(x, y, sprite) {
        if (!sprite) {
            console.warn("Sprite not ready! skipping draw");
            return;
        }
        x += this._cameraOffsetX;
        y += this._cameraOffsetY;
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
        x += this._cameraOffsetX;
        y += this._cameraOffsetY;
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
    fragment(x, y, sprite, calc, scale = 1) {
        if (!sprite) {
            console.warn("Sprite not ready! skipping draw");
            return;
        }
        scale = Math.round(scale);
        x += this._cameraOffsetX;
        y += this._cameraOffsetY;
        let i, px, py, dx, dy;
        for (i = 0, px = 0, py = 0; i < sprite.data.length; i += 4, px += scale) {
            if (px >= sprite.width * scale) {
                px = 0;
                py += scale;
            }
            if (sprite.data[i + 3] > 0) {
                for (dx = 0; dx < scale; dx++) {
                    for (dy = 0; dy < scale; dy++) {
                        let color = calc(this.screen.pixelBuffer, (this.screen.width * (py + dy + y) + (px + dx + x)) * 3);
                        this.screen.setPixel(px + dx + x, py + dy + y, color.r, color.g, color.b);
                    }
                }
            }
        }
    }
}

class Color {
    /**
     * @param r red (0-255)
     * @param g green (0-255)
     * @param b blue (0-255)
     */
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
}
Color.white = new Color(230, 230, 230);
Color.black = new Color(20, 20, 20);
Color.gray = new Color(40, 40, 40);
Color.light_gray = new Color(60, 60, 60);
Color.yellow = new Color(255, 215, 0);
Color.ocher = new Color(190, 150, 0);
Color.orange = new Color(255, 155, 0);
Color.brown = new Color(165, 110, 30);
Color.red = new Color(255, 75, 75);
Color.dark_red = new Color(170, 50, 50);
Color.pink = new Color(230, 85, 150);
Color.magenta = new Color(185, 85, 110);
Color.light_purple = new Color(170, 90, 190);
Color.purple = new Color(110, 50, 120);
Color.indigo = new Color(100, 100, 190);
Color.dark_indigo = new Color(70, 70, 140);
Color.blue = new Color(65, 90, 160);
Color.dark_blue = new Color(50, 70, 120);
Color.agua = new Color(80, 170, 220);
Color.dark_agua = new Color(50, 135, 180);
Color.cyan = new Color(60, 220, 180);
Color.dark_cyan = new Color(40, 170, 155);
Color.mint = new Color(70, 200, 140);
Color.jade = new Color(40, 145, 100);
Color.light_green = new Color(100, 220, 100);
Color.green = new Color(50, 165, 50);
Color.lime = new Color(190, 220, 90);
Color.avocado = new Color(160, 190, 50);

/**
 * A pseudorandom number generator using the Wichman-Hill algorithm
 */
class Random {
    constructor(seed) {
        this.seed = seed ?? new Date().getTime();
    }
    set seed(value) {
        this._seed = value;
        this.a = value;
        this.b = value;
        this.c = value;
    }
    get seed() {
        return this._seed;
    }
    next() {
        this.a = (171 * this.a) % 30269;
        this.b = (172 * this.b) % 30307;
        this.c = (170 * this.c) % 30323;
        return (this.a / 30269 + this.b / 30307 + this.c / 30323) % 1;
    }
    /**
     * Generates a random number
     * @param min inclusive minimum
     * @param max exclusive maximum
     */
    between(min, max) {
        return this.next() * (max - min) + min;
    }
    /**
     * Generates a random integer
     * @param min inclusive minimum
     * @param max exclusive maximum
     */
    betweenInt(min, max) {
        return Math.round(this.next() * (max - min) + min);
    }
    /**
     * Generates a random number using JS random
     * @param min inclusive minimum
     * @param max exclusive maximum
     */
    seedlessBetween(min, max) {
        return Math.random() * (max - min) + min;
    }
    /**
     * Generates a random integer using JS random
     * @param min inclusive minimum
     * @param max exclusive maximum
     */
    seedlessBetweenInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }
}

const sideNames = ["top", "right", "bottom", "left"];
class PhysicLib {
    constructor() {
        this.monitoredCollisions = [];
    }
    isCollisionRect(rect1, rect2) {
        return !(rect1.x + rect1.w <= rect2.x || rect2.x + rect2.w <= rect1.x || rect1.y + rect1.h <= rect2.y || rect2.y + rect2.h <= rect1.y);
    }
    isCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
        return !(x1 + w1 <= x2 || x2 + w2 <= x1 || y1 + h1 <= y2 || y2 + h2 <= y1);
    }
    getCollisionInfo(x1, y1, w1, h1, x2, y2, w2, h2) {
        var sides = [y1 + h1 - y2, x2 + w2 - x1, y2 + h2 - y1, x1 + w1 - x2];
        let nearestSide = 0;
        for (let i = 0; i < 4; i++)
            if (sides[i] < sides[nearestSide])
                nearestSide = i;
        return {
            top: sides[0],
            right: sides[1],
            bottom: sides[2],
            left: sides[3],
            nearestSide: nearestSide,
            nearestSideName: sideNames[nearestSide],
        };
    }
    watch(rect1, rect2, action) {
        this.monitoredCollisions.push({ a: rect1, b: rect2, action });
        return this.monitoredCollisions[this.monitoredCollisions.length - 1];
    }
    drop(ccm) {
        let i = this.monitoredCollisions.indexOf(ccm);
        if (i > -1)
            this.monitoredCollisions.splice(i, 1);
    }
    checkAllCollisions() {
        for (let i = 0; i < this.monitoredCollisions.length; i++) {
            if (this.isCollisionRect(this.monitoredCollisions[i].a, this.monitoredCollisions[i].b)) {
                this.monitoredCollisions[i].action();
            }
        }
    }
}

class Engine {
    constructor() {
        this._activeScene = new Scene();
        this._lastFrame = false;
        this._cursor = { x: 0, y: 0, scale: 1 };
        this._camera = { x: 0, y: 0 };
        this.drawCursor = false;
        this.showInfo = false;
        this.autoScale = true;
        this.clearColor = Color.black;
        this._activeScene.apateInstance = this;
        this.screen = new Screen();
        this.screen.scale = this.screen.maxScale;
        this.draw = new DrawLib(this.screen);
        this.input = new Input(this.screen);
        this.random = new Random();
        this.physic = new PhysicLib();
        this.draw.loadFont("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAANwAAAAFCAYAAAAua4JmAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAA3KADAAQAAAABAAAABQAAAADuh69NAAACAklEQVRYCa2UW04DQQwECeL+Vw5pkopKjWdn0TJSsPvhtsNHbh/Pd3/V26PShwrOg9vp8U4e5qPnde6TPc8zn7lkTzsnjTnf49mdnkw/ZnvuDPbdzvFt7DqTF29nMg+PB569wexAY8b34DGH3xno7Qd7Jj274JkPzkzr+K7Uo8xJa864+9zV3zWen/duHij9FZxAz+8wXmr8fuHRuuJrD77o1v4De+eqP7sfX1dyuZeKzzp9NPSpwuFPbc44PZjK7ArDU9nRmBxXeya+9R3eZXg+fWPPu8dHPavhu3/RVSWQXxfkxvD2h2tsrvvg3Ute/2J4prWd3/fROw+O3Mb2/rXnf0h25sknC9xe854jC52cVDLM2UfvjJ6JBz05zKQ3D0ZHA0c/+7yTHGaNycYPjje+fNDC9XNWaxNeZbFnmnlzn68uIatD3+bymOeLwTUO7y826cym+pbg+JsLv3o7/7Q/+eHz0NnZ+Ok6/us8cjIBD+ed1uHh8Adfeewnf/pu7LIXLruZme6YZo785HUW9zUf3LeEw88uMPd4Jn5e+JWGxzW5kz8cO+3/1Xs4vT+Y4YLpU3nmzLcebP1ozlrnoK3y7MfDXioe687d8dM8nHfQk2288tuLn3uozTcmGz/Y2WietW+lk4EXH7j1CePtWfjpJrQr9Uzu5GnOuHtjbg13/wZnlB52mTDTXwAAAABJRU5ErkJggg==", "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÜÖ0123456789.!?':+-*/=()<>[]", 4);
        this.screen.canvas.style.cursor = "none";
        document.body.append(this.screen.canvas);
        window.addEventListener("resize", this.onWindowResize.bind(this));
        this.loadCursor("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAAqADAAQAAAABAAAAAgAAAADtGLyqAAAAEElEQVQIHWP8DwQMIABjAABXzAf6jU4fqAAAAABJRU5ErkJggg==");
    }
    get screenOffset() {
        return { x: -this._camera.x, y: this._camera.y };
    }
    set activeScene(value) {
        this._activeScene = value;
        this._activeScene.apateInstance = this;
        this._activeScene.onLoad();
    }
    get activeScene() {
        return this._activeScene;
    }
    async loadCursor(url, point, scale = 1) {
        this._cursor = {
            img: await spritelib.load(url),
            x: point?.x ?? 0,
            y: point?.y ?? 0,
            scale,
        };
    }
    async loadCursorSync(img, point, scale = 1) {
        this._cursor = {
            img: spritelib.loadSync(img),
            x: point?.x ?? 0,
            y: point?.y ?? 0,
            scale,
        };
    }
    run() {
        this._lastFrame = false;
        var lastTime = new Date().getTime();
        var time = 0;
        var delta = 0;
        var nextSecond = 100;
        var lastFrames = 0;
        var frameCounter = 0;
        var tmp = 0;
        var calcCursorColor = (pixels, ndx) => {
            tmp = 255 - (pixels[ndx] + pixels[ndx + 1] + pixels[ndx + 2]) / 3;
            return { r: tmp, g: tmp, b: tmp };
        };
        var loop = () => {
            time = new Date().getTime();
            delta = time - lastTime;
            nextSecond -= delta;
            if (nextSecond < 0) {
                nextSecond = 1000;
                lastFrames = frameCounter;
                frameCounter = 0;
            }
            if (delta > 400) {
                console.info("Skipping frame");
                window.requestAnimationFrame(loop);
                lastTime = time;
                return;
            }
            this.screen.clear(this.clearColor.r, this.clearColor.g, this.clearColor.b);
            this.draw.setOffset(this._camera.x, this._camera.y);
            // update
            // @ts-ignore
            this.input.updateGamepads();
            this._activeScene.update(delta);
            this.physic.checkAllCollisions();
            // draw
            this._activeScene.draw(this.draw);
            this.draw.setOffset(0, 0);
            if (this.showInfo) {
                this.draw.text(1, 1, "FPS:" + lastFrames, Color.white);
            }
            if (this.drawCursor) {
                this.draw.fragment(this.input.mousePos.x, this.input.mousePos.y, this._cursor.img, calcCursorColor, this._cursor.scale);
            }
            this.screen.updateScreen();
            lastTime = time;
            frameCounter++;
            if (!this._lastFrame)
                window.requestAnimationFrame(loop);
        };
        window.requestAnimationFrame(loop);
    }
    clear() {
        this.screen.clear(this.clearColor.r, this.clearColor.g, this.clearColor.b);
    }
    camera(x, y) {
        this._camera.x = x;
        this._camera.y = y;
    }
    stop() {
        this._lastFrame = true;
    }
    resize(width, height) {
        this.screen.resize(width, height);
        if (this.autoScale) {
            this.screen.scale = this.screen.maxScale;
        }
    }
    rescale(scale) {
        this.screen.scale = scale;
    }
    get htmlElement() {
        return this.screen.canvas;
    }
    onWindowResize(ev) {
        if (this.autoScale) {
            this.screen.scale = this.screen.maxScale;
        }
    }
}

const defaultConfig = {
    allowOwnEvents: false,
    bindThisOnEventAction: true,
    storage: {},
};
class Entity {
    constructor(config) {
        // init called from scene after entity is appended
        this.isInitialized = false;
        this.doUpdate = true;
        this.doDraw = true;
        this.config = { ...defaultConfig, ...config };
        this.storage = this.config.storage;
    }
    set isActive(value) {
        this.doUpdate = value;
        this.doDraw = value;
    }
    set(events) {
        let newEvents = Object.keys(events);
        for (let i = 0; i < newEvents.length; i++) {
            if (this[newEvents[i]] || this.config.allowOwnEvents) {
                this[newEvents[i]] = this.config.bindThisOnEventAction ? events[newEvents[i]].bind(this) : events[newEvents[i]];
            }
            else {
                console.warn("Not allowed to use event " + newEvents[i]);
            }
        }
    }
    on(event, action) {
        let ev = {};
        ev[event] = action;
        this.set(ev);
    }
    init() { }
    update(delta) { }
    draw(draw) { }
    destroy() { }
}

class Particle {
    constructor(particle) {
        this.x = 0;
        this.y = 0;
        this.velX = 0;
        this.velY = 0;
        this.gravityX = 0;
        this.gravityY = 0;
        this.scale = 1;
        this.lifetime = Infinity;
        if (!particle)
            particle = {};
        let keys = Object.keys(particle);
        for (let i = 0; i < keys.length; i++) {
            this[keys[i]] = particle[keys[i]];
        }
    }
}
const defaultParticle = new Particle();
class ParticleSystem extends Entity {
    constructor(autoStart = true, pps = 1, applyDelta = false) {
        super({ allowOwnEvents: true });
        this.particles = [];
        this.isRunning = autoStart;
        this.particlesPerSecond = pps;
        this.nextSpawn = 1000 / pps;
        this.applyDelta = applyDelta;
    }
    init() { }
    spawn(particle) {
        this.particles.push({ ...defaultParticle, ...particle });
    }
    update(delta) {
        if (!this.isRunning)
            return;
        this.nextSpawn -= delta;
        if (this.nextSpawn < 0) {
            this.nextSpawn = 1000 / this.particlesPerSecond;
            this.spawn(this.generateParticle());
        }
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].lifetime -= delta;
            if (this.particles[i].lifetime < 0) {
                this.particles.splice(i, 1);
                i--;
                continue;
            }
            this.particles[i].velX += this.particles[i].gravityX * delta * 0.0001;
            this.particles[i].velY += this.particles[i].gravityY * delta * 0.0001;
            if (this.applyDelta) {
                this.particles[i].x += this.particles[i].velX * delta * 0.05;
                this.particles[i].y += this.particles[i].velY * delta * 0.05;
            }
            else {
                this.particles[i].x += this.particles[i].velX;
                this.particles[i].y += this.particles[i].velY;
            }
        }
        this.lateUpdate(delta);
    }
    draw(draw) {
        for (let i = 0; i < this.particles.length; i++) {
            if (this.particles[i].sprite && this.particles[i].color) {
                draw.spriteExt(Math.round(this.particles[i].x), Math.round(this.particles[i].y), this.particles[i].sprite, 1, this.particles[i].color);
            }
            else if (this.particles[i].sprite) {
                draw.sprite(Math.round(this.particles[i].x), Math.round(this.particles[i].y), this.particles[i].sprite);
            }
            else if (this.particles[i].color) {
                draw.pixel(Math.round(this.particles[i].x), Math.round(this.particles[i].y), this.particles[i].color);
            }
            else {
                draw.pixel(Math.round(this.particles[i].x), Math.round(this.particles[i].y), Color.magenta);
            }
        }
    }
    kill(particle) {
        let i = this.particles.indexOf(particle);
        if (i > -1)
            this.particles.splice(i, 1);
    }
    clearAll() {
        this.particles = [];
    }
    lateUpdate(delta) { }
    generateParticle() {
        return defaultParticle;
    }
    destroy() { }
}

class Transition extends Entity {
    constructor(duration) {
        super();
        this.index = 0;
        this.duration = 200;
        this.progress = 0;
        this.duration = duration;
    }
    done() { }
    update(delta) {
        if (this.index < 0)
            return;
        this.index -= delta;
        this.progress = this.index / this.duration;
        if (this.type == "start")
            this.progress = 1 - this.progress;
        if (this.index < 0)
            this.done();
    }
    do(type) {
        return new Promise((res, rej) => {
            this.index = this.duration;
            this.type = type;
            this.done = res;
            setTimeout(res, this.duration * 2);
        });
    }
}

class ColorLib {
    constructor() { }
    componentToHex(c) {
        let hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
    hexToColor(hex) {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (!result)
            return null;
        return { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) };
    }
    colorToHex(color) {
        return "#" + this.componentToHex(color.r) + this.componentToHex(color.g) + this.componentToHex(color.b);
    }
    isSame(colorA, colorB, tolerance) {
        // TODO: implement tolerance
        return colorA.r == colorB.r && colorA.g == colorB.g && colorA.b == colorB.b;
    }
}
var colorlib = new ColorLib();

export { Engine as Apate, Button, Color, DrawLib, Entity, Input, Particle, ParticleSystem, PhysicLib, Random, Scene, Transition, colorlib, spritelib };
