export class Scene {
    entities = [];
    _apateInstance;
    set apateInstance(value) {
        this._apateInstance = value;
        // automaticlly reinit entities when instance is changed
        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i].apate = value;
            this.entities[i].init();
            this.entities[i].isInitialized = true;
        }
    }
    constructor() { }
    add(entity) {
        this.entities.push(entity);
        // init
        if (this._apateInstance) {
            entity.apate = this._apateInstance;
            entity.init();
            entity.isInitialized = true;
        }
    }
    remove(entity) {
        let i = this.entities.indexOf(entity);
        if (i > -1)
            this.entities.splice(i, 1);
    }
    update(delta) {
        for (let i = 0; i < this.entities.length; i++) {
            if (this.entities[i].doUpdate)
                this.entities[i].update(delta);
        }
    }
    draw(draw) {
        for (let i = 0; i < this.entities.length; i++) {
            if (this.entities[i].doDraw)
                this.entities[i].draw(draw);
        }
    }
}
