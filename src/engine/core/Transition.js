import { Entity } from "./Entity.js";
export class Transition extends Entity {
    index = 0;
    type;
    duration = 200;
    progress = 0;
    constructor(duration) {
        super();
        this.duration = duration;
    }
    done() { }
    update(delta) {
        if (this.index < 0)
            return;
        this.index -= delta;
        this.progress = this.index / this.duration;
        if (this.type == "start")
            this.progress = 1 - this.progress;
        if (this.index < 0)
            this.done();
    }
    do(type) {
        return new Promise((res, rej) => {
            this.index = this.duration;
            this.type = type;
            this.done = res;
        });
    }
}
