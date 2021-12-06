import type { DrawLib } from "../utils/drawlib.js";
import { Engine } from "./Engine.js";
import { Entity } from "./Entity.js";
export declare class Scene {
    protected entities: Entity[];
    private _apateInstance?;
    set apateInstance(value: Engine);
    constructor();
    add(entity: Entity): void;
    remove(entity: Entity): void;
    update(delta: number): void;
    draw(draw: DrawLib): void;
}
