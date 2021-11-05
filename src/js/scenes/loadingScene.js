import { pokedex } from '../pokedex/index.js'
import { attackpoint } from '../../data/moves.js'

let i = Math.floor(Math.random()*pokedex.length)
        export let name = pokedex[i].name.english;
        export let type = pokedex[i].type[0]
        export let hp = pokedex[i].base.hp * 2
        export let damage = pokedex[i].base.attack
        export let pokemonBack = pokedex[i].frame.back
        export let pokemonFront = pokedex[i].frame.front

       export let menuAttack = {
            'attack1': pokedex[i].special[0][0].toUpperCase() + pokedex[i].special[0].slice(1),
            'attack2': pokedex[i].special[1][0].toUpperCase() + pokedex[i].special[1].slice(1),
            'attack3': pokedex[i].special[2][0].toUpperCase() + pokedex[i].special[2].slice(1),
            'attack4': pokedex[i].special[3][0].toUpperCase() + pokedex[i].special[3].slice(1),
        }


export default class loadingScene extends Phaser.Scene {
    constructor(){
        super({
            key: 'loadingScene'
        });
    }

    preload(){
        this.load.image("tiles", "https://mikewesthad.github.io/phaser-3-tilemap-blog-posts/post-1/assets/tilesets/tuxmon-sample-32px-extruded.png");
        this.load.tilemapTiledJSON("map", "https://raw.githubusercontent.com/AiltonRafael/1-Project---Pokemon---IronHack/main/src/assets/Tilemap/map.json")
        
        this.load.atlas("atlas", "https://mikewesthad.github.io/phaser-3-tilemap-blog-posts/post-1/assets/atlas/atlas.png", "https://mikewesthad.github.io/phaser-3-tilemap-blog-posts/post-1/assets/atlas/atlas.json");
        this.load.image('player', pokemonBack)
        this.load.image('enemy', pokemonFront)
        this.load.atlas('i')
        this.load.atlas('attackpoint')

        this.load.on('complete', () => {
            this.scene.start('gameScene');
        })
    }

    

}
