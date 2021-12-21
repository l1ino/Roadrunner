export declare class Button {
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
    constructor(name: any, keybinds: any, controllerBind?: number);
    addKeybind(key: string): void;
    removeKeybind(key: string): void;
}
