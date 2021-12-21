import { Button } from "../utils/button.js";
// TODO: Controller handling
export class Input {
    pressedKeys = [];
    isMousePressed = false;
    mousePos = { x: 0, y: 0 };
    buttons = {};
    registeredButtons = { up: [], down: [] };
    controllers = [];
    _screen;
    _rootElement;
    constructor(rootElement, screen) {
        this._screen = screen;
        this._rootElement = rootElement;
        window.addEventListener("keydown", this.onKeyDown.bind(this));
        window.addEventListener("keyup", this.onKeyUp.bind(this));
        rootElement.addEventListener("mousedown", this.onMouseDown.bind(this));
        rootElement.addEventListener("mouseup", this.onMouseUp.bind(this));
        rootElement.addEventListener("mousemove", this.onMouseMove.bind(this));
        rootElement.addEventListener("touchstart", this.onTouchStart.bind(this));
        rootElement.addEventListener("touchend", this.onTouchEnd.bind(this));
        rootElement.addEventListener("touchmove", this.onTouchMove.bind(this));
        window.addEventListener("gamepadconnected", this.onGamepadConnected.bind(this));
        window.addEventListener("gamepaddisconnected", this.onGamepadDisconnected.bind(this));
        for (const btn of [Button.up, Button.down, Button.left, Button.right, Button.action1, Button.action2, Button.cancel]) {
            this.addButton(btn);
        }
    }
    onGamepadConnected(ev) {
        console.log("Controller connected! Name: " + ev.gamepad.id);
        this.controllers = navigator.getGamepads();
        console.log(this.controllers);
        console.log(ev);
    }
    onGamepadDisconnected(ev) {
        console.log("Controller disconnected!");
        this.controllers = navigator.getGamepads();
    }
    onKeyDown(ev) {
        this.pressedKeys.push(ev.code);
        this.runRegisteredActions("down", ev.code);
    }
    onKeyUp(ev) {
        this.pressedKeys = this.pressedKeys.filter((code) => code != ev.code);
        this.runRegisteredActions("up", ev.code);
    }
    runRegisteredActions(ev, key) {
        for (let i = 0; i < this.registeredButtons[ev].length; i++) {
            if (this.registeredButtons[ev][i].btn.keybinds.includes(key)) {
                this.registeredButtons[ev][i].action();
            }
        }
    }
    onMouseDown(ev) {
        this.isMousePressed = true;
        this.runRegisteredActions("down", "mouse");
    }
    onMouseUp(ev) {
        this.isMousePressed = false;
        this.runRegisteredActions("up", "mouse");
    }
    onMouseMove(ev) {
        this.mousePos.x = Math.floor(ev.offsetX / this._screen.scale);
        this.mousePos.y = Math.floor(ev.offsetY / this._screen.scale);
    }
    onTouchStart(ev) {
        this.isMousePressed = true;
        this.runRegisteredActions("down", "mouse");
    }
    onTouchEnd(ev) {
        this.isMousePressed = false;
        this.runRegisteredActions("up", "mouse");
    }
    onTouchMove(ev) {
        ev.preventDefault();
        this.mousePos.x = Math.floor(ev.touches[0].pageX / this._screen.scale);
        this.mousePos.y = Math.floor(ev.touches[0].pageY / this._screen.scale);
    }
    on(btn, ev, action) {
        if (typeof btn == "string") {
            this.registeredButtons[ev].push({ btn: new Button(btn, [btn]), action });
        }
        else {
            this.registeredButtons[ev].push({ btn, action });
        }
    }
    addButton(btn) {
        this.buttons[btn.name] = btn;
    }
    removeButton(btn) {
        delete this.buttons[btn.name];
    }
    clearButtons() {
        this.buttons = {};
    }
    isButtonDown(btn) {
        if (typeof btn == "string") {
            if (!this.buttons[btn]) {
                console.warn("No button with this name registered: " + btn);
                return false;
            }
            btn = this.buttons[btn];
        }
        for (let i = 0; i < btn.keybinds.length; i++) {
            if (this.pressedKeys.includes(btn.keybinds[i]))
                return true;
        }
        if (btn.controllerBind != null && this.controllers.length > 0) {
            this.controllers = navigator.getGamepads(); // need to call getGamepads to refresh list
            for (let i = 0; i < this.controllers.length; i++) {
                if (this.controllers[i].buttons[btn.controllerBind].pressed) {
                    return true;
                }
            }
        }
        return false;
    }
    getAxis() {
        let axis = { v: 0, h: 0 };
        if (this.controllers.length > 0) {
            axis.h = navigator.getGamepads()[0].axes[0];
            axis.v = navigator.getGamepads()[0].axes[1] * -1;
            if (axis.h != 0 || axis.v != 0)
                return axis;
        }
        if (this.isButtonDown(Button.up))
            axis.v += 1;
        if (this.isButtonDown(Button.down))
            axis.v -= 1;
        if (this.isButtonDown(Button.right))
            axis.h += 1;
        if (this.isButtonDown(Button.left))
            axis.h -= 1;
        return axis;
    }
}
