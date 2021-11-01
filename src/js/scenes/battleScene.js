let BootScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
    function BootScene ()
    {
        Phaser.Scene.call(this, { key: 'BootScene' });
    },
    preload: function ()
    {
        this.load.spritesheet('player', '../../assets/images/dude.png', { frameWidth: 16, frameHeight: 16 });
        this.load.image('dragonblue', '../../assets/images/dude.png');
        this.load.image('dragonorrange', '../../assets/images/dude.png');
    },
    create: function ()
    {
        this.scene.start('BattleScene');
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