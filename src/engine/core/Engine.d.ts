import { Scene } from "./Scene.js";
import { Screen } from "./Screen.js";
import { Input } from "./Input.js";
import { DrawLib } from "../utils/drawlib.js";
import { Color } from "../utils/color.js";
import { Random } from "../utils/random.js";
import { PhysicLib } from "../utils/physiclib.js";
export declare class Engine {
    private _activeScene;
    private _lastFrame;
    private _cursor;
    private _camera;
    protected screen: Screen;
    draw: DrawLib;
    input: Input;
    random: Random;
    physic: PhysicLib;
    drawCursor: boolean;
    showInfo: boolean;
    autoScale: boolean;
    clearColor: Color;
    set activeScene(value: Scene);
    get activeScene(): Scene;
    constructor();
    loadCursor(url: string, point?: {
        x: number;
        y: number;
    }, scale?: number): Promise<void>;
    loadCursorSync(img: HTMLImageElement, point?: {
        x: number;
        y: number;
    }, scale?: number): Promise<void>;
    run(): void;
    clear(): void;
    camera(x: number, y: number): void;
    stop(): void;
    resize(width: number, height: number): void;
    rescale(scale: number): void;
    get htmlElement(): HTMLElement;
    private onWindowResize;
}
