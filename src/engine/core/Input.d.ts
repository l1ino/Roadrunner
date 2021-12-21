import { Button } from "../utils/button.js";
import { Screen } from "./Screen.js";
export declare class Input {
    private pressedKeys;
    isMousePressed: boolean;
    mousePos: {
        x: number;
        y: number;
    };
    private buttons;
    private registeredButtons;
    private controllers;
    private _screen;
    private _rootElement;
    constructor(rootElement: HTMLElement, screen: Screen);
    private onGamepadConnected;
    private onGamepadDisconnected;
    private onKeyDown;
    private onKeyUp;
    private runRegisteredActions;
    private onMouseDown;
    private onMouseUp;
    private onMouseMove;
    private onTouchStart;
    private onTouchEnd;
    private onTouchMove;
    on(btn: Button | "mouse" | string, ev: "up" | "down", action: Function): void;
    addButton(btn: Button): void;
    removeButton(btn: Button): void;
    clearButtons(): void;
    isButtonDown(btn: Button | string): boolean;
    getAxis(): {
        v: number;
        h: number;
    };
}
