const defaultConfig = {
    allowOwnEvents: false,
    bindThisOnEventAction: true,
    storage: {},
};
export class Entity {
    // init called from scene after entity is appended
    isInitialized = false;
    // after init scene sets acitve engine
    apate;
    doUpdate = true;
    doDraw = true;
    set isActive(value) {
        this.doUpdate = value;
        this.doDraw = value;
    }
    config;
    storage; // used to save entity vars -> easily saveable
    constructor(config) {
        this.config = { ...defaultConfig, ...config };
        this.storage = this.config.storage;
    }
    set(events) {
        let newEvents = Object.keys(events);
        for (let i = 0; i < newEvents.length; i++) {
            if (this[newEvents[i]] || this.config.allowOwnEvents) {
                this[newEvents[i]] = this.config.bindThisOnEventAction ? events[newEvents[i]].bind(this) : events[newEvents[i]];
            }
            else {
                console.warn("Not allowed to use event " + newEvents[i]);
            }
        }
    }
    on(event, action) {
        let ev = {};
        ev[event] = action;
        this.set(ev);
    }
    init() { }
    update(delta) { }
    draw(draw) { }
    destroy() { }
}
