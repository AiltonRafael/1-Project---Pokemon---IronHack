import { pokedex } from '../pokedex/index.js'

let i = Math.floor(Math.random()*pokedex.length)
        let name = pokedex[i].name.english;
        let type = pokedex[i].type[0]
        let hp = pokedex[i].base.hp * 2
        let damage = pokedex[i].base.attack
        let pokemonBack = pokedex[i].frame.back
        let pokemonFront = pokedex[i].frame.front

        let menuAttack = {
            'attack1': pokedex[i].special[0][0].toUpperCase() + pokedex[i].special[0].slice(1),
            'attack2': pokedex[i].special[1][0].toUpperCase() + pokedex[i].special[1].slice(1),
            'attack3': pokedex[i].special[2][0].toUpperCase() + pokedex[i].special[2].slice(1),
            'attack4': pokedex[i].special[3][0].toUpperCase() + pokedex[i].special[3].slice(1),
        }
        
export let BootScene = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize:
    function BootScene ()
    {
        Phaser.Scene.call(this, { key: 'BootScene' });
    },
    preload: function ()
    {
        this.load.image('player', pokemonBack);
        this.load.image('enemy', pokemonFront);
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
        this.damage = damage;              
    },
    attack: function(target) {
        target.takeDamage(this.damage);      
    },
    attack1: function(target) {
        target.takeDamage(this.damage);      
    },
    attack2: function(target) {
        target.takeDamage(this.damage);      
    },
    attack3: function(target) {
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

let PlayerCharacter = new Phaser.Class({
    Extends: Unit,
    initialize:
    function PlayerCharacter(scene, x, y, texture, frame, type, hp, damage) {
        Unit.call(this, scene, x, y, texture, frame, type, hp, damage);
        
        this.setScale(2);
    }
});

let MenuItem = new Phaser.Class({
    Extends: Phaser.GameObjects.Text,
    
    initialize:
            
    function MenuItem(x, y, text, scene) {
        Phaser.GameObjects.Text.call(this, scene, x, y, text, { color: '#000000', boundsAlignH: 'center', strokeThickness: 10, align: 'center', fontSize: 15});
    },
    
    select: function() {
        this.setColor('red');
    },
    
    deselect: function() {
        this.setColor('black');
    }
    
});

let Menu = new Phaser.Class({
    Extends: Phaser.GameObjects.Container,
    
    initialize:
            
    function Menu(x, y, scene, heroes) {
        Phaser.GameObjects.Container.call(this, scene, x, y);
        this.menuItems = [];
        this.menuItemIndex = 0;
        this.heroes = heroes;
        this.x = x;
        this.y = y;
    },     
    addMenuItem: function(unit) {
        let menuItem = new MenuItem(20, this.menuItems.length * 20, unit, this.scene);
        this.menuItems.push(menuItem);
        this.add(menuItem);        
    },        
    moveSelectionUp: function() {
        this.menuItems[this.menuItemIndex].deselect();
        this.menuItemIndex--;
        if(this.menuItemIndex < 0)
            this.menuItemIndex = this.menuItems.length - 1;
        this.menuItems[this.menuItemIndex].select();
    },
    moveSelectionDown: function() {
        this.menuItems[this.menuItemIndex].deselect();
        this.menuItemIndex++;
        if(this.menuItemIndex >= this.menuItems.length)
            this.menuItemIndex = 0;
        this.menuItems[this.menuItemIndex].select();
    },
    // select the menu as a whole and an element with index from it
    select: function(index) {
        if(!index)
            index = 0;
        this.menuItems[this.menuItemIndex].deselect();
        this.menuItemIndex = index;
        this.menuItems[this.menuItemIndex].select();
    },
    // deselect this menu
    deselect: function() {        
        this.menuItems[this.menuItemIndex].deselect();
        this.menuItemIndex = 0;
    },
    confirm: function() {
        // wen the player confirms his slection, do the action
    },

    clear: function() {
        for(let i = 0; i < this.menuItems.length; i++) {
            this.menuItems[i].destroy();
        }
        this.menuItems.length = 0;
        this.menuItemIndex = 0;
    },
    remap: function(units) {
        this.clear();        
        for(let i = 0; i < units.length; i++) {
            let unit = units[i];
            this.addMenuItem(unit.type);
        }
    }
});

let HeroesMenu = new Phaser.Class({
    constructor(){
    },

    Extends: Menu,

    initialize:
            
    function HeroesMenu(x, y, scene) {
        Menu.call(this, x, y, scene); 
    }
});
let ActionsMenu = new Phaser.Class({
    Extends: Menu,
    
    initialize:
            
    function ActionsMenu(x, y, scene) {
        Menu.call(this, x, y, scene);   
        this.addMenuItem(menuAttack.attack1);
        this.addMenuItem(menuAttack.attack2);
        this.addMenuItem(menuAttack.attack3);
        this.addMenuItem(menuAttack.attack4);
    },
    confirm: function() {
        this.scene.events.emit('SelectEnemies');        
    }
    
});
let EnemiesMenu = new Phaser.Class({
    Extends: Menu,
    
    initialize:
            
    function EnemiesMenu(x, y, scene) {
        Menu.call(this, x, y, scene);        
    },       
    confirm: function() {        
        this.scene.events.emit("Enemy", this.menuItemIndex);
    },
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
        this.scene.run('UIScene');
        this.cameras.main.setBackgroundColor(0xCCE9CA);

        // player character - mage
        // scene, x, y, texture, frame, type, hp, damage
        let pokemonPlayer = new PlayerCharacter(this, 120, 400, 'player', 4, name, hp, damage);
        this.add.existing(pokemonPlayer);  

        
        let pokemonEnemy = new Enemy(this, 700, 150, 'enemy', null, name, hp, damage);
        this.add.existing(pokemonEnemy);
 
        // array with heroes
        this.heroes = [ pokemonPlayer ];
        // array with enemies
        this.enemies = [ pokemonEnemy ];
        // array with both parties, who will attack
        this.units = this.heroes.concat(this.enemies);
        
        // Run UI Scene at the same time
        this.scene.run('UIScene');

        this.battleScene = this.scene.get('BattleScene');

        this.index = -1;

    },

    receivePlayerSelection: function(action, target) {
        if(action == 'attack') {            
            this.units[this.index].attack(this.enemies[target]);              
        }
        this.time.addEvent({ delay: 3000, callback: this.nextTurn, callbackScope: this });        
    },

    nextTurn: function() {
        this.index++;
        // if there are no more units, we start again from the first one
        if(this.index >= this.units.length) {
            this.index = 0;
        }
        if(this.units[this.index]) {
            // if its player hero
            if(this.units[this.index] instanceof PlayerCharacter) {                
                this.events.emit('PlayerSelect', this.index);
            } else { // else if its enemy unit
                // pick random hero
                let r = Math.floor(Math.random() * this.heroes.length);
                // call the enemy's attack function 
                this.units[this.index].attack(this.heroes[r]);  
                // add timer for the next turn, so will have smooth gameplay
                this.time.addEvent({ delay: 3000, callback: this.nextTurn, callbackScope: this });
            }
        }
    },

});
export let UIScene = new Phaser.Class({
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

        this.menus = this.add.container();
                
        this.heroesMenu = new HeroesMenu(60, 310, this);           
        this.actionsMenu = new ActionsMenu(300, 500, this);            
        this.enemiesMenu = new EnemiesMenu(650, 30, this);   
        
        // the currently selected menu 
        this.currentMenu = this.actionsMenu;
        
        // add menus to the container
        this.menus.add(this.heroesMenu);
        this.menus.add(this.actionsMenu);
        this.menus.add(this.enemiesMenu);

        // the currently selected menu 
        this.currentMenu = this.actionsMenu;

        // add menus to the container
        this.menus.add(this.heroesMenu);
        this.menus.add(this.actionsMenu);
        this.menus.add(this.enemiesMenu);

        this.battleScene = this.scene.get("BattleScene");      
        
        this.remapHeroes();
        this.remapEnemies();

        this.input.keyboard.on('keydown', this.onKeyInput, this);

        this.battleScene.events.on("PlayerSelect", this.onPlayerSelect, this);

        this.events.on("SelectEnemies", this.onSelectEnemies, this);

        this.events.on("Enemy", this.onEnemy, this);

        this.message = new Message(this, this.battleScene.events);

        this.add.existing(this.message);

        this.battleScene.nextTurn();

    },

    onEnemy: function(index) {
        this.heroesMenu.deselect();
        this.actionsMenu.deselect();
        this.enemiesMenu.deselect();
        this.currentMenu = null;
        this.battleScene.receivePlayerSelection('attack', index);
    },

    onSelectEnemies: function() {
        this.currentMenu = this.enemiesMenu;
        this.enemiesMenu.select(0);
    },

    onPlayerSelect: function(id) {
        this.heroesMenu.select(id);
        this.actionsMenu.select(0);
        this.currentMenu = this.actionsMenu;
    },
       
    onKeyInput: function(event) {
        if(this.currentMenu) {
            if(event.code === "ArrowUp") {
                this.currentMenu.moveSelectionUp();
            } else if(event.code === "ArrowDown") {
                this.currentMenu.moveSelectionDown();
            } else if(event.code === "ArrowRight" || event.code === "Shift") {
            } else if(event.code === "Space" || event.code === "ArrowLeft") {
                this.currentMenu.confirm();
            } 
        }
    },

    remapHeroes: function() {
        let heroes = this.battleScene.heroes;
        this.heroesMenu.remap(heroes);
    },
    remapEnemies: function() {
        let enemies = this.battleScene.enemies;
        this.enemiesMenu.remap(enemies);
    },
});

let Message = new Phaser.Class({
    Extends: Phaser.GameObjects.Container,
    initialize:
    function Message(scene, events) {
        Phaser.GameObjects.Container.call(this, scene, 160, 30);
        let graphics = this.scene.add.graphics();
        this.add(graphics);
        graphics.lineStyle(1, 0xffffff, 0.8);
        graphics.fillStyle(0x031f4c, 0.3);        
        graphics.strokeRect(-90, -15, 180, 30);
        graphics.fillRect(-90, -15, 180, 30);
        this.text = new Phaser.GameObjects.Text(scene, 0, 0, "", { color: '#ffffff', align: 'center', fontSize: 13, wordWrap: { width: 160, useAdvancedWrap: true }});
        this.add(this.text);
        this.text.setOrigin(0.5);        
        events.on("Message", this.showMessage, this);
        this.visible = false;
    },
    showMessage: function(text) {
        this.text.setText(text);
        this.visible = true;
        if(this.hideEvent)
            this.hideEvent.remove(false);
        this.hideEvent = this.scene.time.addEvent({ delay: 2000, callback: this.hideMessage, callbackScope: this });
    },
    hideMessage: function() {
        this.hideEvent = null;
        this.visible = false;
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