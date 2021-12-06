import { DrawLib } from "../utils/drawlib.js";
import type { Engine } from "./Engine.js";
interface ApateEventCollection {
    init?: () => void;
    update?: (delta: number) => void;
    draw?: (draw: DrawLib) => void;
    destroy?: () => void;
}
interface EntityConfig {
    allowOwnEvents?: boolean;
    bindThisOnEventAction?: boolean;
    storage?: any;
}
export declare class Entity {
    isInitialized: boolean;
    apate?: Engine;
    doUpdate: boolean;
    doDraw: boolean;
    set isActive(value: boolean);
    private config;
    storage: any;
    constructor(config?: EntityConfig);
    set(events: ApateEventCollection): void;
    on(event: string, action: Function): void;
    init(): void;
    update(delta: number): void;
    draw(draw: DrawLib): void;
    destroy(): void;
}
export {};
