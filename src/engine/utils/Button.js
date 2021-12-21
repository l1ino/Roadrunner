export class Button {
    static up = new Button("up", ["KeyW", "ArrowUp"], 12);
    static down = new Button("down", ["KeyS", "ArrowDown"], 13);
    static left = new Button("left", ["KeyA", "ArrowLeft"], 14);
    static right = new Button("right", ["KeyD", "ArrowRight"], 15);
    static action1 = new Button("action1", ["KeyZ", "KeyN", "KeyC", "Space"], 0);
    static action2 = new Button("action2", ["KeyX", "KeyM", "KeyV"], 2);
    static cancel = new Button("cancel", ["Backspace", "ESC"], 1);
    name;
    keybinds;
    controllerBind;
    constructor(name, keybinds, controllerBind) {
        this.name = name;
        this.keybinds = keybinds;
        this.controllerBind = controllerBind;
    }
    addKeybind(key) {
        this.keybinds.push(key);
    }
    removeKeybind(key) {
        let i = this.keybinds.indexOf(key);
        if (i > -1)
            this.keybinds.splice(i, 1);
    }
}
