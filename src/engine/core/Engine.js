import { Scene } from "./Scene.js";
import { Screen } from "./Screen.js";
import { Input } from "./Input.js";
import { DrawLib } from "../utils/drawlib.js";
import { Color } from "../utils/Color.js";
import { Random } from "../utils/Random.js";
import { PhysicLib } from "../utils/physiclib.js";
export class Engine {
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
        this.draw.loadFont("https://raw.githubusercontent.com/juiian7/ApateJS-Retro/4d178bfea79a0ef601130d7d0c6a69c473e7e1ae/res/default_text.png", "ABCDEFGHIJKLMNOPQRSTUVWXYZ.!?:+-*/=()0123456789", 4);
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
