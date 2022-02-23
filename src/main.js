import { Button } from './engine/apate.js';
import Apate, { color } from './engine/legacy-wrapper.js';
import game from './scripts/game.js';

const apate = new Apate();

apate.autoPauseOnLeave = false;
apate.setParentElement(document.querySelector('#screen'));
apate.clearColor = color(230, 230, 230);
apate.screen.pixelScreen.resize(256, 128);

// settings and data storage
apate.on('load', () => {
    console.log('Loading user data...');
    let savefile = apate.loadObjFromBrowser('roadrunner');
    if (savefile) {
        game.highscore = savefile.highscore ?? game.highscore;
    }
});

apate.on('save', () => {
    console.log('Saving user data...');
    apate.saveObjToBrowser('roadrunner', { highscore: game.highscore });
});

// initalize entities
game.init(apate);
apate.activeScene.init(game);
apate.activeScene.init(game.entities.road);
apate.activeScene.init(game.entities.player);
apate.activeScene.init(game.entities.carMgr);
apate.activeScene.init(game.entities.background);

apate.run();

// additional controls
apate._apate.input.addButton(new Button('up', ['Space', 'KeyW', 'ArrowUp']));
document.body.addEventListener('touchstart', () => {
    if (game.isAlive) {
        game.entities.player.jump();
    } else {
        game.restart();
    }
});
