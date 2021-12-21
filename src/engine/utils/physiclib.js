const sideNames = ["top", "right", "bottom", "left"];
export class PhysicLib {
    monitoredCollisions = [];
    constructor() { }
    isCollisionRect(rect1, rect2) {
        return !(rect1.x + rect1.w <= rect2.x || rect2.x + rect2.w <= rect1.x || rect1.y + rect1.h <= rect2.y || rect2.y + rect2.h <= rect1.y);
    }
    isCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
        return !(x1 + w1 <= x2 || x2 + w2 <= x1 || y1 + h1 <= y2 || y2 + h2 <= y1);
    }
    getCollisionInfo(x1, y1, w1, h1, x2, y2, w2, h2) {
        var sides = [y1 + h1 - y2, x2 + w2 - x1, y2 + h2 - y1, x1 + w1 - x2];
        let nearestSide = 0;
        for (let i = 0; i < 4; i++)
            if (sides[i] < sides[nearestSide])
                nearestSide = i;
        return {
            top: sides[0],
            right: sides[1],
            bottom: sides[2],
            left: sides[3],
            nearestSide: nearestSide,
            nearestSideName: sideNames[nearestSide],
        };
    }
    watch(rect1, rect2, action) {
        this.monitoredCollisions.push({ a: rect1, b: rect2, action });
        return this.monitoredCollisions[this.monitoredCollisions.length - 1];
    }
    drop(ccm) {
        let i = this.monitoredCollisions.indexOf(ccm);
        if (i > -1)
            this.monitoredCollisions.splice(i, 1);
    }
    checkAllCollisions() {
        for (let i = 0; i < this.monitoredCollisions.length; i++) {
            if (this.isCollisionRect(this.monitoredCollisions[i].a, this.monitoredCollisions[i].b))
                this.monitoredCollisions[i].action();
        }
    }
}
