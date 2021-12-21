declare type Sprite = ImageData;
declare class SpriteLib {
    canvas: HTMLCanvasElement;
    constructor();
    load(url: string): Promise<Sprite>;
    loadSync(img: HTMLImageElement): Sprite;
    split(sprite: Sprite, width: number, height: number, yOffset?: number): Sprite[];
    filp(sprite: Sprite, horizontal?: boolean, vertical?: boolean): Sprite;
}
export declare var spritelib: SpriteLib;
export {};
