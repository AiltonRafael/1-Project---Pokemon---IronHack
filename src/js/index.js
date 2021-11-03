import loadingScene from './scenes/loadingScene.js'
import { gameScene } from './scenes/gameScene.js'
import { BattleScene, BootScene, UIScene} from './scenes/battleScene.js'

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: "game-container",
    pixelArt: true,
    physics: {
        debug: true,
        default: "arcade",
        arcade: {
            gravity: { y: 0 } 
            }, 
        },
  
    scene: [
        loadingScene,
        gameScene,
        BattleScene,
        BootScene,
        UIScene
        ]
    }

    const game = new Phaser.Game(config);