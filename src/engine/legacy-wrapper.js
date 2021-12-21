import { Apate as Engine, Color, Scene as Scene_O, Entity as Entity_O, spritelib, ParticleSystem as ParticleSystem_O, Random } from "./apate.js";
const random = new Random();
class PixelScreen {
    _apate;
    constructor(apate) {
        this._apate = apate;
    }
    resize(w, h) {
        this._apate.resize(w, h);
    }
    get pixel() {
        return this._apate.screen_O.pixelBuffer;
    }
}
export function color(r, g, b) {
    return new Color(r, g, b);
}
class Screen {
    pixelScreen;
    _apate;
    constructor(apate) {
        this.pixelScreen = new PixelScreen(apate);
        this._apate = apate;
    }
    drawPixel(x, y, c) {
        this._apate.draw.pixel(Math.round(x), Math.round(y), c);
    }
    drawRect(x, y, w, h, c) {
        this._apate.draw.rect(Math.round(x), Math.round(y), w, h, c);
    }
    drawSprite(x, y, spriteObj, scale) {
        this._apate.draw.spriteExt(Math.round(x), Math.round(y), spriteObj, scale, null);
    }
    drawText(x, y, text, c, options) {
        let lines = text.split("\n");
        for (let i = 0; i < lines.length; i++) {
            this._apate.draw.text(Math.round(x), Math.round(y + i * (5 + (options?.topSpace ?? 1))), lines[i], c, Math.round(options?.scale ?? 1));
        }
    }
}
class Apate_M extends Engine {
    constructor() {
        super();
    }
    get screen_O() {
        return this.screen;
    }
}
export default class Apate {
    _apate;
    screen;
    _activeScene;
    get random() {
        return this._apate.random;
    }
    colors = Color;
    keyMap = defaultkeyMap;
    set activeScene(val) {
        this._activeScene = val;
        this._activeScene._scene.apateInstance = this._apate;
    }
    get activeScene() {
        return this._activeScene;
    }
    constructor() {
        this._apate = new Apate_M();
        this._apate["test"] = "ok";
        this.screen = new Screen(this._apate);
        this.activeScene = new Scene();
        this.autoScale = true;
    }
    autoPauseOnLeave = true;
    setParentElement(el) {
        el.append(this._apate.htmlElement);
    }
    set autoScale(val) {
        this._apate.autoScale = val;
    }
    set clearColor(val) {
        this._apate.clearColor = val;
    }
    get clearColor() {
        return this._apate.clearColor;
    }
    on(ev, fun) {
        this[ev] = fun;
    }
    run() {
        if (this["load"])
            this["load"];
        if (this["init"])
            this["init"];
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
            this._apate.screen_O.clear(this.clearColor.r, this.clearColor.g, this.clearColor.b);
            // update
            this._activeScene.run("update", delta);
            // draw
            this._activeScene.run("draw", this.screen);
            this._apate.draw.text(1, 1, "FPS:" + lastFrames, Color.white);
            this._apate.screen_O.updateScreen();
            lastTime = time;
            frameCounter++;
            window.requestAnimationFrame(loop);
        };
        window.requestAnimationFrame(loop);
    }
    isButtonPressed(name) {
        return this._apate.input.isButtonDown(name.toLowerCase());
    }
    loadObjFromBrowser(name) {
        return window.localStorage.getItem(name);
    }
    saveObjToBrowser(name, obj) {
        window.localStorage.setItem(name, obj);
    }
}
class Scene_M extends Scene_O {
    constructor() {
        super();
    }
    get entities_O() {
        return this.entities;
    }
}
export class Scene {
    _scene;
    _ents = [];
    constructor() {
        this._scene = new Scene_M();
    }
    init(e) {
        this._ents.push(e);
        this._scene.add(e._entity);
        this._ents.sort((a, b) => a.priority - b.priority);
    }
    run(ev, ...args) {
        for (let i = 0; i < this._ents.length; i++) {
            if (this._ents[i][ev])
                this._ents[i][ev](...args);
        }
    }
}
export class Entity {
    priority = 0;
    _entity;
    constructor() {
        this._entity = new Entity_O({ allowOwnEvents: true, bindThisOnEventAction: true, storage: {} });
    }
    on(ev, fun) {
        this[ev] = fun;
    }
    update(delta) { }
    draw(draw) { }
}
const defaultkeyMap = {
    up: ["KeyW", "ArrowUp"],
    down: ["KeyS", "ArrowDown"],
    left: ["KeyA", "ArrowLeft"],
    right: ["KeyD", "ArrowRight"],
    action1: ["KeyZ", "KeyN", "KeyC", "Space"],
    action2: ["KeyX", "KeyM", "KeyV"],
    engine_menu: ["Escape"],
    engine_submit: ["Enter", "NumpadEnter"],
};
export class SpriteMgr {
    imgToSprite(img) {
        return spritelib.loadSync(img);
    }
    subSprite(sprite, x, y, w, h) {
        return spritelib.split(sprite, w, h, y)[x / w];
    }
}
export class ParticleSystem {
    _particleSystem;
    /**
     * @param {ParticleSystemProperties} properties
     */
    constructor(properties) {
        let emitDelay = properties?.emitDelay ?? -1;
        this._particleSystem = new ParticleSystem_O(false, emitDelay > 0 ? 1000 / emitDelay : 0, true);
        this._particleSystem.generateParticle = () => {
            return {
                lifetime: properties.lifetime ?? Infinity,
                scale: 1,
                velX: properties.velocity?.x ?? 0,
                velY: properties.velocity?.y ?? 0,
                x: random.betweenInt(properties.origin.x, properties.origin.x + properties.origin.w),
                y: random.betweenInt(properties.origin.y, properties.origin.y + properties.origin.h),
                color: new Color(properties.colors[0].r, properties.colors[0].g, properties.colors[0].b) ?? Color.magenta,
                gravityX: properties.gravity?.x ?? 0,
                gravityY: properties.gravity?.y ?? 0,
            };
        };
    }
    start() {
        this._particleSystem.isRunning = true;
    }
    reset() {
        this._particleSystem.clearAll();
    }
    stop() {
        this._particleSystem.isRunning = false;
    }
    update(delta) {
        this._particleSystem.update(delta);
    }
    draw(screen) {
        this._particleSystem.draw(screen._apate.draw);
    }
}
export var spriteMgr = new SpriteMgr();
