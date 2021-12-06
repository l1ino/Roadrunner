class Scene {
    entities = [];
    _apateInstance;
    set apateInstance(value) {
        this._apateInstance = value;
        // automaticlly reinit entities when instance is changed
        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i].apate = value;
            this.entities[i].init();
            this.entities[i].isInitialized = true;
        }
    }
    constructor() { }
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
}

const planeVerts = [-1, 1, 0, 0, 1, 1, 1, 0, -1, -1, 0, 1, 1, -1, 1, 1];
class Screen {
    canvas;
    gl;
    textureWidth = 128;
    textureHeight = 128;
    pixelBuffer;
    constructor() {
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.textureWidth;
        this.canvas.height = this.textureHeight;
        this.gl = this.canvas.getContext("webgl");
        this.pixelBuffer = new Uint8Array(this.textureWidth * this.textureHeight * 3);
        this.initGL();
        this.updateScreen();
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
        let screenWidth = this.textureWidth;
        let screenHeight = this.textureHeight;
        let scaleWidth = Math.floor((windowsWidth / screenWidth));
        let scaleHeight = Math.floor((windowsHeight / screenHeight));
        return Math.min(scaleWidth, scaleHeight);
    }
}
const vs = `attribute vec2 aVertexPosition;attribute vec2 aTextureCoord;varying vec2 vTextureCoord;void main() {gl_Position = vec4(aVertexPosition, 0, 1);vTextureCoord = aTextureCoord;}`;
const fs = `precision mediump float;varying vec2 vTextureCoord;uniform sampler2D uTexture;void main() {gl_FragColor = texture2D(uTexture, vTextureCoord);}`;

class Button {
    static up = new Button("up", ["KeyW", "ArrowUp"]);
    static down = new Button("down", ["KeyS", "ArrowDown"]);
    static left = new Button("left", ["KeyA", "ArrowLeft"]);
    static right = new Button("right", ["KeyD", "ArrowRight"]);
    static action1 = new Button("action1", ["KeyZ", "KeyN", "KeyC", "Space"]);
    static action2 = new Button("action2", ["KeyX", "KeyM", "KeyV"]);
    name;
    keybinds;
    constructor(name, keybinds) {
        this.name = name;
        this.keybinds = keybinds;
    }
}

// TODO: Controller handling
class Input {
    pressedKeys = [];
    isMousePressed = true;
    registeredButtons = {};
    constructor(rootElement) {
        window.addEventListener("keydown", this.onKeyDown.bind(this));
        window.addEventListener("keyup", this.onKeyUp.bind(this));
        rootElement.addEventListener("mousedown", this.onMouseDown.bind(this));
        rootElement.addEventListener("mouseup", this.onMouseUp.bind(this));
        for (const btn of [Button.up, Button.down, Button.left, Button.right, Button.action1, Button.action2]) {
            this.registerButton(btn);
        }
    }
    registerButton(btn) {
        this.registeredButtons[btn.name] = btn;
    }
    onKeyDown(ev) {
        this.pressedKeys.push(ev.code);
    }
    onKeyUp(ev) {
        this.pressedKeys = this.pressedKeys.filter((code) => code != ev.code);
    }
    onMouseDown(ev) { }
    onMouseUp(ev) { }
    isButtonDown(btn) {
        if (typeof btn == "string") {
            if (!this.registeredButtons[btn]) {
                console.warn("No button with this name registered: " + btn);
                return false;
            }
            btn = this.registeredButtons[btn];
        }
        for (let i = 0; i < btn.keybinds.length; i++) {
            if (this.pressedKeys.includes(btn.keybinds[i]))
                return true;
        }
        return false;
    }
    getAxis() {
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
}

class SpriteLib {
    canvas;
    constructor() {
        this.canvas = document.createElement("canvas");
    }
    async load(url) {
        let img = new Image();
        try {
            await new Promise((res, rej) => {
                img.onload = res;
                img.onerror = rej;
                img.src = url;
            });
        }
        catch {
            console.error("Couldn't load resource: " + url);
            return { width: 1, height: 1, data: new Uint8ClampedArray([255, 0, 255, 255]) };
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
            sprites.push({ data: new Uint8ClampedArray(part), width, height });
        }
        return sprites;
    }
}
var spritelib = new SpriteLib();

class DrawLib {
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

class Color {
    static white = new Color(230, 230, 230);
    static black = new Color(20, 20, 20);
    static gray = new Color(40, 40, 40);
    static light_gray = new Color(60, 60, 60);
    static yellow = new Color(255, 215, 0);
    static ocher = new Color(190, 150, 0);
    static orange = new Color(255, 155, 0);
    static brown = new Color(165, 110, 30);
    static red = new Color(255, 75, 75);
    static dark_red = new Color(170, 50, 50);
    static pink = new Color(230, 85, 150);
    static magenta = new Color(185, 50, 110);
    static light_purple = new Color(170, 90, 190);
    static purple = new Color(110, 50, 120);
    static indigo = new Color(100, 100, 190);
    static dark_indigo = new Color(70, 70, 140);
    static blue = new Color(65, 90, 160);
    static dark_blue = new Color(50, 70, 120);
    static agua = new Color(80, 170, 220);
    static dark_agua = new Color(50, 135, 180);
    static cyan = new Color(60, 220, 200);
    static dark_cyan = new Color(40, 170, 155);
    static mint = new Color(70, 200, 140);
    static jade = new Color(40, 145, 100);
    static light_green = new Color(100, 220, 100);
    static green = new Color(50, 165, 50);
    static lime = new Color(190, 220, 90);
    static avocado = new Color(160, 190, 50);
    r;
    g;
    b;
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
}

class Random {
    seed;
    a;
    b;
    c;
    constructor(seed) {
        if (!seed)
            seed = new Date().getTime();
        this.seed = seed;
        this.a = seed;
        this.b = seed;
        this.c = seed;
    }
    next() {
        this.a = (171 * this.a) % 30269;
        this.b = (172 * this.b) % 30307;
        this.c = (170 * this.c) % 30323;
        return (this.a / 30269 + this.b / 30307 + this.c / 30323) % 1;
    }
    between(min, max) {
        return this.next() * (max - min) + min;
    }
    betweenInt(min, max) {
        return Math.round(this.next() * (max - min) + min);
    }
}

class PhysicLib {
    monitoredCollisions = [];
    constructor() { }
    isCollisionRect(rect1, rect2) {
        return !(rect1.x + rect1.w <= rect2.x || rect2.x + rect2.w <= rect1.x || rect1.y + rect1.h <= rect2.y || rect2.y + rect2.h <= rect1.y);
    }
    isCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
        return !(x1 + w1 <= x2 || x2 + w2 <= x1 || y1 + h1 <= y2 || y2 + h2 <= y1);
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
            if (this.isCollisionRect(this.monitoredCollisions[i].a, this.monitoredCollisions[i].b))
                this.monitoredCollisions[i].action();
        }
    }
}

class Engine {
    isCursorVisible = false;
    _activeScene = new Scene();
    lastFrame = false;
    screen;
    draw;
    input;
    random;
    physic;
    showInfo = false;
    autoScale = false;
    clearColor = Color.black;
    set activeScene(value) {
        // Disable old scene
        if (this._activeScene.apateInstance)
            this._activeScene.apateInstance = null;
        this._activeScene = value;
        this._activeScene.apateInstance = this;
    }
    get activeScene() {
        return this._activeScene;
    }
    constructor() {
        this._activeScene.apateInstance = this;
        this.random = new Random();
        this.screen = new Screen();
        this.screen.scale = this.screen.maxScale;
        this.draw = new DrawLib(this.screen);
        this.input = new Input(this.screen.canvas);
        this.physic = new PhysicLib();
        this.draw.loadFont("/res/default_text.png", "ABCDEFGHIJKLMNOPQRSTUVWXYZ.!?:+-*/=()0123456789", 4);
        document.body.append(this.screen.canvas);
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }
    run() {
        this.lastFrame = false;
        var lastTime = new Date().getTime();
        var time = 0;
        var delta = 0;
        var nextSecond = 100;
        var lastFrames = 0;
        var frameCounter = 0;
        var loop = () => {
            time = new Date().getTime();
            delta = time - lastTime;
            nextSecond -= delta;
            if (nextSecond < 0) {
                nextSecond = 1000;
                lastFrames = frameCounter;
                frameCounter = 0;
            }
            this.screen.clear(this.clearColor.r, this.clearColor.g, this.clearColor.b);
            // update
            this._activeScene.update(delta);
            this.physic.checkAllCollisions();
            // draw
            this._activeScene.draw(this.draw);
            if (this.showInfo)
                this.draw.text(1, 1, "FPS:" + lastFrames, Color.white);
            this.screen.updateScreen();
            lastTime = time;
            frameCounter++;
            if (!this.lastFrame)
                window.requestAnimationFrame(loop);
        };
        window.requestAnimationFrame(loop);
    }
    clear() {
        this.screen.clear(this.clearColor.r, this.clearColor.g, this.clearColor.b);
    }
    stop() {
        this.lastFrame = true;
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
    // init called from scene after entity is appended
    isInitialized = false;
    // after init scene sets acitve engine
    apate;
    doUpdate = true;
    doDraw = true;
    set isActive(value) {
        this.doUpdate = value;
        this.doDraw = value;
    }
    config;
    storage; // used to save entity vars -> easily saveable
    constructor(config) {
        this.config = { ...defaultConfig, ...config };
        this.storage = this.config.storage;
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
    x = 0;
    y = 0;
    color;
    sprite;
    velX = 0;
    velY = 0;
    scale = 1;
    lifetime = Infinity;
    constructor(particle) {
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
    particles = [];
    isRunning;
    particlesPerSecond;
    nextSpawn;
    applyDelta;
    constructor(autoStart = true, pps = 1, applyDelta = false) {
        super({ allowOwnEvents: true });
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
            if (this.particles[i].sprite && this.particles[i].color)
                draw.spriteExt(Math.round(this.particles[i].x), Math.round(this.particles[i].y), this.particles[i].sprite, 1, this.particles[i].color);
            else if (this.particles[i].sprite)
                draw.sprite(Math.round(this.particles[i].x), Math.round(this.particles[i].y), this.particles[i].sprite);
            else if (this.particles[i].color)
                draw.pixel(Math.round(this.particles[i].x), Math.round(this.particles[i].y), this.particles[i].color);
            else
                draw.pixel(Math.round(this.particles[i].x), Math.round(this.particles[i].y), Color.magenta);
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

export { Engine as Apate, Button, Color, Entity, Particle, ParticleSystem, Random, Scene, spritelib };
