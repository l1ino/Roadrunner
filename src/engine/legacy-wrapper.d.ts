import { Apate as Engine, Color, Scene as Scene_O, Entity as Entity_O, Random } from "./apate.js";
declare class PixelScreen {
    private _apate;
    constructor(apate: Apate_M);
    resize(w: any, h: any): void;
    get pixel(): Uint8Array;
}
declare type Color_M = {
    r: number;
    g: number;
    b: number;
};
export declare function color(r: any, g: any, b: any): Color;
declare class Screen {
    pixelScreen: PixelScreen;
    _apate: Apate_M;
    constructor(apate: Apate_M);
    drawPixel(x: number, y: number, c: Color_M): void;
    drawRect(x: number, y: number, w: number, h: number, c: Color_M): void;
    drawSprite(x: number, y: number, spriteObj: any, scale: number): void;
    drawText(x: number, y: number, text: string, c: Color_M, options: any): void;
}
declare class Apate_M extends Engine {
    constructor();
    get screen_O(): import("./core/Screen.js").Screen;
}
export default class Apate {
    private _apate;
    screen: Screen;
    private _activeScene;
    get random(): Random;
    colors: typeof Color;
    keyMap: {
        up: string[];
        down: string[];
        left: string[];
        right: string[];
        action1: string[];
        action2: string[];
        engine_menu: string[];
        engine_submit: string[];
    };
    set activeScene(val: Scene);
    get activeScene(): Scene;
    constructor();
    autoPauseOnLeave: boolean;
    setParentElement(el: HTMLElement): void;
    set autoScale(val: any);
    set clearColor(val: Color);
    get clearColor(): Color;
    on(ev: any, fun: any): void;
    run(): void;
    isButtonPressed(name: any): boolean;
    loadObjFromBrowser(name: string): string;
    saveObjToBrowser(name: string, obj: any): void;
}
declare class Scene_M extends Scene_O {
    constructor();
    get entities_O(): Entity_O[];
}
export declare class Scene {
    _scene: Scene_M;
    _ents: Entity[];
    constructor();
    init(e: Entity): void;
    run(ev: any, ...args: any[]): void;
}
export declare class Entity {
    priority: number;
    _entity: Entity_O;
    constructor();
    on(ev: any, fun: any): void;
    update(delta: any): void;
    draw(draw: any): void;
}
export declare class SpriteMgr {
    imgToSprite(img: HTMLImageElement): ImageData;
    subSprite(sprite: ImageData, x: any, y: any, w: any, h: any): ImageData;
}
export declare class ParticleSystem {
    private _particleSystem;
    /**
     * @param {ParticleSystemProperties} properties
     */
    constructor(properties: ParticleSystemProperties);
    start(): void;
    reset(): void;
    stop(): void;
    update(delta: any): void;
    draw(screen: Screen): void;
}
export declare var spriteMgr: SpriteMgr;
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
interface ParticleSystemProperties {
    seed?: number;
    amount?: number;
    emitDelay?: number;
    origin?: {
        x?: number;
        y?: number;
        w?: number;
        h?: number;
    };
    velocity?: {
        x?: number;
        y?: number;
        randomMinX?: number;
        randomMinY?: number;
        randomMaxX?: number;
        randomMaxY?: number;
    };
    gravity?: {
        x?: number;
        y?: number;
    };
    lifetime?: number;
    colors?: {
        r?: number;
        g?: number;
        b?: number;
    }[];
}
export {};
