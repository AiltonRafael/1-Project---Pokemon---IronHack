import loadingScene from './scenes/loadingScene.js'
import { gameScene } from './scenes/gameScene.js'
import bagScene from './scenes/bagScene.js'
import battleScene from './scenes/battleScene.js'
import pokemonScene from './scenes/pokemonScene.js'

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
        bagScene,
        battleScene,
        pokemonScene
        ]
    }

    const game = new Phaser.Game(config);