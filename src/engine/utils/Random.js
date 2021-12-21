/**
 * A pseudorandom number generator using the Wichman-Hill algorithm
 */
export class Random {
    seed;
    a;
    b;
    c;
    constructor(seed) {
        if (!seed)
            seed = new Date().getTime();
        this.seed = seed;
        this.a = seed;
        this.b = seed;
        this.c = seed;
    }
    next() {
        this.a = (171 * this.a) % 30269;
        this.b = (172 * this.b) % 30307;
        this.c = (170 * this.c) % 30323;
        return (this.a / 30269 + this.b / 30307 + this.c / 30323) % 1;
    }
    /**
     * @param min inclusive minimum
     * @param max exclusive maximum
     */
    between(min, max) {
        return this.next() * (max - min) + min;
    }
    /**
     * @param min inclusive minimum
     * @param max exclusive maximum
     */
    betweenInt(min, max) {
        return Math.round(this.next() * (max - min) + min);
    }
    /**
     * Generates a random number using JS random
     * @param min inclusive minimum
     * @param max exclusive maximum
     */
    seedlessBetween(min, max) {
        return Math.random() * (max - min) + min;
    }
    /**
     * Generates a random integer using JS random
     * @param min inclusive minimum
     * @param max exclusive maximum
     */
    seedlessBetweenInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }
}
