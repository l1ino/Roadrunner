import { Screen } from "../core/Screen";
import { Color } from "./color.js";
declare type Sprite = ImageData;
export declare class DrawLib {
    private screen;
    private fontMap;
    constructor(screen: Screen);
    private _cameraOffsetX;
    private _cameraOffsetY;
    setOffset(x: number, y: number): void;
    loadFont(url: string, characters: string, charWidth: number): Promise<void>;
    pixel(x: number, y: number, c: Color): void;
    rect(x: number, y: number, w: number, h: number, c: Color): void;
    sprite(x: number, y: number, sprite: Sprite): void;
    spriteExt(x: number, y: number, sprite: Sprite, scale: number, color?: Color): void;
    text(x: number, y: number, text: string, c: Color, scale?: number, leftMargin?: number): void;
    measureText(text: string, scale?: number, leftMargin?: number): number;
    fragment(x: number, y: number, sprite: Sprite, calc: (pixels: Uint8Array, ndx: number) => Color, scale?: number): void;
}
export {};
