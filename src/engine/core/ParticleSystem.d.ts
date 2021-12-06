import { Color } from "../utils/Color.js";
import type { DrawLib } from "../utils/drawlib.js";
import { Entity } from "./Entity.js";
declare type Sprite = ImageData;
export declare class Particle {
    x: number;
    y: number;
    color?: Color;
    sprite?: Sprite;
    velX: number;
    velY: number;
    scale: number;
    lifetime: number;
    constructor(particle?: Particle);
}
export declare class ParticleSystem extends Entity {
    particles: Particle[];
    isRunning: boolean;
    particlesPerSecond: number;
    private nextSpawn;
    private applyDelta;
    constructor(autoStart?: boolean, pps?: number, applyDelta?: boolean);
    init(): void;
    spawn(particle: Particle): void;
    update(delta: number): void;
    draw(draw: DrawLib): void;
    kill(particle: Particle): void;
    clearAll(): void;
    lateUpdate(delta: any): void;
    generateParticle(): Particle;
    destroy(): void;
}
export {};
