declare class Screen {
    canvas: HTMLCanvasElement;
    private gl;
    private textureWidth;
    private textureHeight;
    pixelBuffer: Uint8Array;
    get width(): number;
    get height(): number;
    constructor();
    private initGL;
    updateScreen(): void;
    clear(r: number, g: number, b: number): void;
    setPixel(x: number, y: number, r: number, g: number, b: number): void;
    resize(textureWidth: number, textureHeight: number): void;
    set scale(value: number);
    get scale(): number;
    get maxScale(): number;
}

declare class Color {
    static white: Color;
    static black: Color;
    static gray: Color;
    static light_gray: Color;
    static yellow: Color;
    static ocher: Color;
    static orange: Color;
    static brown: Color;
    static red: Color;
    static dark_red: Color;
    static pink: Color;
    static magenta: Color;
    static light_purple: Color;
    static purple: Color;
    static indigo: Color;
    static dark_indigo: Color;
    static blue: Color;
    static dark_blue: Color;
    static agua: Color;
    static dark_agua: Color;
    static cyan: Color;
    static dark_cyan: Color;
    static mint: Color;
    static jade: Color;
    static light_green: Color;
    static green: Color;
    static lime: Color;
    static avocado: Color;
    r: number;
    g: number;
    b: number;
    /**
     * @param r red (0-255)
     * @param g green (0-255)
     * @param b blue (0-255)
     */
    constructor(r: number, g: number, b: number);
}

declare type Sprite$2 = ImageData;
declare class DrawLib {
    private screen;
    private fontMap;
    constructor(screen: Screen);
    private _cameraOffsetX;
    private _cameraOffsetY;
    setOffset(x: number, y: number): void;
    loadFont(url: string, characters: string, charWidth: number): Promise<void>;
    pixel(x: number, y: number, c: Color): void;
    rect(x: number, y: number, w: number, h: number, c: Color): void;
    sprite(x: number, y: number, sprite: Sprite$2): void;
    spriteExt(x: number, y: number, sprite: Sprite$2, scale: number, color?: Color): void;
    text(x: number, y: number, text: string, c: Color, scale?: number, leftMargin?: number): void;
    measureText(text: string, scale?: number, leftMargin?: number): number;
    fragment(x: number, y: number, sprite: Sprite$2, calc: (pixels: Uint8Array, ndx: number) => Color, scale?: number): void;
}

interface ApateEventCollection {
    init?: () => void;
    update?: (delta: number) => void;
    draw?: (draw: DrawLib) => void;
    destroy?: () => void;
}
interface EntityConfig {
    allowOwnEvents?: boolean;
    bindThisOnEventAction?: boolean;
    storage?: any;
}
declare class Entity {
    isInitialized: boolean;
    apate?: Engine;
    doUpdate: boolean;
    doDraw: boolean;
    set isActive(value: boolean);
    private config;
    storage: any;
    constructor(config?: EntityConfig);
    set(events: ApateEventCollection): void;
    on(event: string, action: () => void): void;
    setApate(): void;
    update(delta: number): void;
    draw(draw: DrawLib): void;
    destroy(): void;
}

declare class Transition extends Entity {
    private index;
    protected type: "start" | "end";
    protected duration: number;
    protected progress: number;
    constructor(duration?: number);
    private done;
    update(delta: number): void;
    do(type: "start" | "end"): Promise<void>;
}

declare class Scene {
    protected entities: Entity[];
    private _apateInstance?;
    private _transition?;
    set apateInstance(value: Engine);
    get apateInstance(): Engine;
    constructor(transition?: Transition, apateInstace?: Engine);
    add(entity: Entity): void;
    remove(entity: Entity): void;
    update(delta: number): void;
    draw(draw: DrawLib): void;
    onLoad(): void;
    load(): Promise<void>;
}

declare class Button {
    static up: Button;
    static down: Button;
    static left: Button;
    static right: Button;
    static action1: Button;
    static action2: Button;
    static cancel: Button;
    name: string;
    keybinds: string[];
    controllerBind?: number;
    constructor(name: string, keybinds: string[], controllerBind?: number);
    addKeybind(key: string): void;
    removeKeybind(key: string): void;
}

declare class Input {
    private _screen;
    private pressedKeys;
    isMousePressed: boolean;
    mousePos: {
        x: number;
        y: number;
    };
    private buttons;
    private registeredButtons;
    private gamepads;
    private gamepadPressedButtons;
    gamepadDeadzone: number;
    constructor(screen: Screen);
    private onKeyDown;
    private onKeyUp;
    private onMouseDown;
    private onMouseUp;
    private onMouseMove;
    private onTouchStart;
    private onTouchEnd;
    private onTouchMove;
    on(btn: Button | "mouse" | string, ev: "up" | "down", action: () => void): void;
    clearRegisteredButtons(): void;
    private runRegisteredActions;
    private runRegisteredGamepadActions;
    private onGamepadConnected;
    private onGamepadDisconnected;
    private updateGamepads;
    addButton(btn: Button): void;
    getButton(btnName: string): Button;
    removeButton(btn: Button): void;
    clearButtons(): void;
    isButtonDown(btn: Button | string): boolean;
    getAxis(): {
        v: number;
        h: number;
    };
    isGamepadConnected(): boolean;
    getGamepad(): Gamepad;
}

/**
 * A pseudorandom number generator using the Wichman-Hill algorithm
 */
declare class Random {
    private _seed;
    private a;
    private b;
    private c;
    set seed(value: number);
    get seed(): number;
    constructor(seed?: number);
    next(): number;
    /**
     * Generates a random number
     * @param min inclusive minimum
     * @param max exclusive maximum
     */
    between(min: number, max: number): number;
    /**
     * Generates a random integer
     * @param min inclusive minimum
     * @param max exclusive maximum
     */
    betweenInt(min: number, max: number): number;
    /**
     * Generates a random number using JS random
     * @param min inclusive minimum
     * @param max exclusive maximum
     */
    seedlessBetween(min: number, max: number): number;
    /**
     * Generates a random integer using JS random
     * @param min inclusive minimum
     * @param max exclusive maximum
     */
    seedlessBetweenInt(min: number, max: number): number;
}

interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
}
interface CollisionCheckModel {
    a: Rect;
    b: Rect;
    action: () => void;
}
declare class PhysicLib {
    private monitoredCollisions;
    constructor();
    isCollisionRect(rect1: Rect, rect2: Rect): boolean;
    isCollision(x1: any, y1: any, w1: any, h1: any, x2: any, y2: any, w2: any, h2: any): boolean;
    getCollisionInfo(x1: any, y1: any, w1: any, h1: any, x2: any, y2: any, w2: any, h2: any): {
        top: number;
        right: number;
        bottom: number;
        left: number;
        nearestSide: number;
        nearestSideName: string;
    };
    watch(rect1: Rect, rect2: Rect, action: () => void): CollisionCheckModel;
    drop(ccm: CollisionCheckModel): void;
    checkAllCollisions(): void;
}

declare class Engine {
    private _activeScene;
    private _lastFrame;
    private _cursor;
    private _camera;
    get screenOffset(): {
        x: number;
        y: number;
    };
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

declare type Sprite$1 = ImageData;
declare class Particle {
    x: number;
    y: number;
    color?: Color;
    sprite?: Sprite$1;
    velX: number;
    velY: number;
    gravityX: number;
    gravityY: number;
    scale: number;
    lifetime: number;
    constructor(particle?: Particle);
}
declare class ParticleSystem extends Entity {
    particles: Particle[];
    isRunning: boolean;
    particlesPerSecond: number;
    private nextSpawn;
    private applyDelta;
    constructor(autoStart?: boolean, pps?: number, applyDelta?: boolean);
    setApate(): void;
    spawn(particle: Particle): void;
    update(delta: number): void;
    draw(draw: DrawLib): void;
    kill(particle: Particle): void;
    clearAll(): void;
    lateUpdate(delta: any): void;
    generateParticle(): Particle;
    destroy(): void;
}

declare class ColorLib {
    constructor();
    private componentToHex;
    hexToColor(hex: string): Color;
    colorToHex(color: Color): string;
    isSame(colorA: Color, colorB: Color, tolerance?: number): boolean;
}
declare var colorlib: ColorLib;

declare type Sprite = ImageData;
declare class SpriteLib {
    canvas: HTMLCanvasElement;
    constructor();
    load(url: string): Promise<Sprite>;
    loadSync(img: HTMLImageElement): Sprite;
    split(sprite: Sprite, width: number, height: number, yOffset?: number): Sprite[];
    filp(sprite: Sprite, horizontal?: boolean, vertical?: boolean): Sprite;
    createCopy(sprite: Sprite): ImageData;
    replaceColor(sprite: Sprite, from: Color, to: Color): ImageData;
}
declare var spritelib: SpriteLib;

export { Engine as Apate, Button, Color, DrawLib, Entity, Input, Particle, ParticleSystem, PhysicLib, Random, Scene, Transition, colorlib, spritelib };
