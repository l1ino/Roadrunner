import { Button } from "../utils/Button.js";
export declare class Input {
    private pressedKeys;
    isMousePressed: boolean;
    private registeredButtons;
    constructor(rootElement: HTMLElement);
    registerButton(btn: Button): void;
    private onKeyDown;
    private onKeyUp;
    private onMouseDown;
    private onMouseUp;
    isButtonDown(btn: Button | string): boolean;
    getAxis(): {
        v: number;
        h: number;
    };
}
