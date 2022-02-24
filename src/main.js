import { Apate, Button, Color } from './engine/apate.js';
import game from './scripts/game.js';

const apate = new Apate();

apate.autoPauseOnLeave = false;
document.querySelector('#screen').append(apate.htmlElement);
apate.clearColor = new Color(230, 230, 230);
apate.screen.resize(256, 128);
apate.showInfo = true;

// settings and data storage
apate['load'] = () => {
    console.log('Loading user data...');
    let savefile = localStorage.getItem('roadrunner');
    if (savefile) {
        game.highscore = savefile.highscore ?? game.highscore;
    }
};

apate['save'] = () => {
    console.log('Saving user data...');
    localStorage.setItem('roadrunner', { highscore: game.highscore });
};

// initalize entities
console.log(apate);
game.setApate(apate);
apate.activeScene.add(game.entities.background);
apate.activeScene.add(game.entities.road);
apate.activeScene.add(game.entities.carMgr);
apate.activeScene.add(game.entities.player);
apate.activeScene.add(game);

apate.load();
apate.run();

// additional controls
Button.up.addKeybind('Space');
document.body.addEventListener('touchstart', () => {
    if (game.isAlive) {
        game.entities.player.jump();
    } else {
        game.restart();
    }
});
