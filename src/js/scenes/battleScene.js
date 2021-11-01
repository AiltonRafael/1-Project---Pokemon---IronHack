let BootScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
    function BootScene ()
    {
        Phaser.Scene.call(this, { key: 'BootScene' });
    },
    preload: function ()
    {
        this.load.image('player', '../../assets/images/dude.png' /* { frameWidth: 16, frameHeight: 16 } */);
        this.load.image('dragonblue', 'https://img.pokemondb.net/sprites/go/normal/bayleef.png');
    },
    create: function ()
    {
        this.scene.start('BattleScene');
    }
});

let Unit = new Phaser.Class({
    Extends: Phaser.GameObjects.Sprite,
    initialize:
    function Unit(scene, x, y, texture, frame, type, hp, damage) {
        Phaser.GameObjects.Sprite.call(this, scene, x, y, texture, frame)
        this.type = type;
        this.maxHp = this.hp = hp;
        this.damage = damage; // default damage                
    },
    attack: function(target) {
        target.takeDamage(this.damage);      
    },
    takeDamage: function(damage) {
        this.hp -= damage;        
    }
});

let Enemy = new Phaser.Class({
    Extends: Unit,
    initialize:
    function Enemy(scene, x, y, texture, frame, type, hp, damage) {
        Unit.call(this, scene, x, y, texture, frame, type, hp, damage);
    }
});

var PlayerCharacter = new Phaser.Class({
    Extends: Unit,
    initialize:
    function PlayerCharacter(scene, x, y, texture, frame, type, hp, damage) {
        Unit.call(this, scene, x, y, texture, frame, type, hp, damage);
        // flip the image so I don't have to edit it manually
        this.flipX = true;
        
        this.setScale(2);
    }
});

export let BattleScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
    function BattleScene ()
    {
        Phaser.Scene.call(this, { key: 'BattleScene' });
    },
    create: function ()
    {
        // Run UI Scene at the same time
        this.scene.launch('UIScene');
        this.cameras.main.setBackgroundColor(0xCCE9CA);
       
        // player character - mage
        var mage = new PlayerCharacter(this, 100, 400, 'player', 4, 'Mage', 80, 8);
        this.add.existing(mage);            
        
        var dragonblue = new Enemy(this, 700, 100, 'dragonblue', null, 'Dragon', 50, 3);
        this.add.existing(dragonblue);
 
        // array with heroes
        this.heroes = [ mage ];
        // array with enemies
        this.enemies = [ dragonblue ];
        // array with both parties, who will attack
        this.units = this.heroes.concat(this.enemies);
        
        // Run UI Scene at the same time
        this.scene.launch('UIScene');

    }
});
let UIScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
    function UIScene ()
    {
        Phaser.Scene.call(this, { key: 'UIScene' });
    },
    create: function ()
    {    
        
        this.graphics = this.add.graphics();
        const menuView = this.graphics.lineStyle(5, 0xDAB55B);

        this.graphics.fillStyle(0xF6F6F6, 10); 

        menuView.fillRect(0, 495, 600, 100)
        this.graphics.strokeRect(0, 495, 600, 100);

        const menuStatus = this.graphics.lineStyle(5, 0xDAB55B);
        menuStatus.fillRect(600, 495, 200, 100)
        this.graphics.strokeRect(600, 495, 200, 100);

    }
});
let config = {
    type: Phaser.AUTO,
    parent: 'content',
    width: 800,
    height: 600,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
    scene: [ BootScene, BattleScene, UIScene ]
};
let game = new Phaser.Game(config);