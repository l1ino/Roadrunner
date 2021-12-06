interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
}
interface CollisionCheckModel {
    a: Rect;
    b: Rect;
    action: Function;
}
export declare class PhysicLib {
    private monitoredCollisions;
    constructor();
    isCollisionRect(rect1: Rect, rect2: Rect): boolean;
    isCollision(x1: any, y1: any, w1: any, h1: any, x2: any, y2: any, w2: any, h2: any): boolean;
    watch(rect1: Rect, rect2: Rect, action: Function): CollisionCheckModel;
    drop(ccm: CollisionCheckModel): void;
    checkAllCollisions(): void;
}
export {};
