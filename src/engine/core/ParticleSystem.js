import { Color } from "../utils/color.js";
import { Entity } from "./Entity.js";
export class Particle {
    x = 0;
    y = 0;
    color;
    sprite;
    velX = 0;
    velY = 0;
    gravityX = 0;
    gravityY = 0;
    scale = 1;
    lifetime = Infinity;
    constructor(particle) {
        if (!particle)
            particle = {};
        let keys = Object.keys(particle);
        for (let i = 0; i < keys.length; i++) {
            this[keys[i]] = particle[keys[i]];
        }
    }
}
const defaultParticle = new Particle();
export class ParticleSystem extends Entity {
    particles = [];
    isRunning;
    particlesPerSecond;
    nextSpawn;
    applyDelta;
    constructor(autoStart = true, pps = 1, applyDelta = false) {
        super({ allowOwnEvents: true });
        this.isRunning = autoStart;
        this.particlesPerSecond = pps;
        this.nextSpawn = 1000 / pps;
        this.applyDelta = applyDelta;
    }
    init() { }
    spawn(particle) {
        this.particles.push({ ...defaultParticle, ...particle });
    }
    update(delta) {
        if (!this.isRunning)
            return;
        this.nextSpawn -= delta;
        if (this.nextSpawn < 0) {
            this.nextSpawn = 1000 / this.particlesPerSecond;
            this.spawn(this.generateParticle());
        }
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].lifetime -= delta;
            if (this.particles[i].lifetime < 0) {
                this.particles.splice(i, 1);
                i--;
                continue;
            }
            this.particles[i].velX += this.particles[i].gravityX * delta * 0.0001;
            this.particles[i].velY += this.particles[i].gravityY * delta * 0.0001;
            if (this.applyDelta) {
                this.particles[i].x += this.particles[i].velX * delta * 0.05;
                this.particles[i].y += this.particles[i].velY * delta * 0.05;
            }
            else {
                this.particles[i].x += this.particles[i].velX;
                this.particles[i].y += this.particles[i].velY;
            }
        }
        this.lateUpdate(delta);
    }
    draw(draw) {
        for (let i = 0; i < this.particles.length; i++) {
            if (this.particles[i].sprite && this.particles[i].color) {
                draw.spriteExt(Math.round(this.particles[i].x), Math.round(this.particles[i].y), this.particles[i].sprite, 1, this.particles[i].color);
            }
            else if (this.particles[i].sprite) {
                draw.sprite(Math.round(this.particles[i].x), Math.round(this.particles[i].y), this.particles[i].sprite);
            }
            else if (this.particles[i].color) {
                draw.pixel(Math.round(this.particles[i].x), Math.round(this.particles[i].y), this.particles[i].color);
            }
            else {
                draw.pixel(Math.round(this.particles[i].x), Math.round(this.particles[i].y), Color.magenta);
            }
        }
    }
    kill(particle) {
        let i = this.particles.indexOf(particle);
        if (i > -1)
            this.particles.splice(i, 1);
    }
    clearAll() {
        this.particles = [];
    }
    lateUpdate(delta) { }
    generateParticle() {
        return defaultParticle;
    }
    destroy() { }
}
