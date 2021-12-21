import { Color } from "./color.js";
declare class ColorLib {
    constructor();
    private componentToHex;
    hexToColor(hex: string): Color;
    colorToHex(color: Color): string;
}
export declare var colorlib: ColorLib;
export {};
