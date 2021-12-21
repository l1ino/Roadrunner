import type { DrawLib } from "../utils/drawlib.js";
import { Engine } from "./Engine.js";
import { Entity } from "./Entity.js";
import { Transition } from "./Transition.js";
export declare class Scene {
    protected entities: Entity[];
    private _apateInstance?;
    private _transition?;
    set apateInstance(value: Engine);
    get apateInstance(): Engine;
    constructor(transition?: Transition, apateInstace?: Engine);
    add(entity: Entity): void;
    remove(entity: Entity): void;
    update(delta: number): void;
    draw(draw: DrawLib): void;
    onLoad(): void;
    load(): Promise<void>;
}
