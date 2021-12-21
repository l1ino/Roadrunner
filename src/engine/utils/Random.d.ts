/**
 * A pseudorandom number generator using the Wichman-Hill algorithm
 */
export declare class Random {
    seed: number;
    private a;
    private b;
    private c;
    constructor(seed?: number);
    next(): number;
    /**
     * @param min inclusive minimum
     * @param max exclusive maximum
     */
    between(min: number, max: number): number;
    /**
     * @param min inclusive minimum
     * @param max exclusive maximum
     */
    betweenInt(min: number, max: number): number;
    /**
     * Generates a random number using JS random
     * @param min inclusive minimum
     * @param max exclusive maximum
     */
    seedlessBetween(min: number, max: number): number;
    /**
     * Generates a random integer using JS random
     * @param min inclusive minimum
     * @param max exclusive maximum
     */
    seedlessBetweenInt(min: number, max: number): number;
}
