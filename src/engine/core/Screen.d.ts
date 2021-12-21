export declare class Screen {
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
