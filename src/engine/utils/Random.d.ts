export declare class Random {
    seed: number;
    private a;
    private b;
    private c;
    constructor(seed?: number);
    next(): number;
    between(min: number, max: number): number;
    betweenInt(min: number, max: number): number;
}
