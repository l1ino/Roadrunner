import { Entity } from "./Entity.js";
export declare class Transition extends Entity {
    private index;
    protected type: "start" | "end";
    protected duration: number;
    protected progress: number;
    constructor(duration?: number);
    private done;
    update(delta: number): void;
    do(type: "start" | "end"): Promise<void>;
}
