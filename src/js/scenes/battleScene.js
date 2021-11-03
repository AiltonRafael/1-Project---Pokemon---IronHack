import { name, type, hp, damage, menuAttack, pokemonBack, pokemonFront} from './loadingScene.js'
        
export let BootScene = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize:
    function BootScene ()
    {
        Phaser.Scene.call(this, { key: 'BootScene' });
    },
    preload: function (){
        
    },
    create: function ()
    {
        this.scene.start('BattleScene');
        this.add.image('player', pokemonBack);
        this.add.image('enemy', pokemonFront);
    }
});

let Unit = new Phaser.Class({
    Extends: Phaser.GameObjects.Sprite,
    initialize:
    function Unit(scene, x, y, texture, frame, type, hp, damage) {
        Phaser.GameObjects.Sprite.call(this, scene, x, y, texture, frame)
        this.type = type;
        this.hp = hp;
        this.damage = damage;
        this.living = true;
        this.menuItem = null;   
    },

    setMenuItem: function(item) {
        this.menuItem = item;
    },

    attack: function(target) {
        if(target.living) {
            target.takeDamage(this.damage);
            this.scene.events.emit("", `${this.type} attacks ${target.type} for ${this.damage} damage`);
        }
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
        if(this.hp <= 0) {
            this.hp = 0;
            this.menuItem.unitKilled();
            this.living = false;
            this.visible = false;   
            this.menuItem = null;
        }
    },
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
    select: function(index) {
        if(!index)
            index = 0;
        this.menuItems[this.menuItemIndex].deselect();
        this.menuItemIndex = index;
        this.menuItems[this.menuItemIndex].select();
    },
    deselect: function() {        
        this.menuItems[this.menuItemIndex].deselect();
        this.menuItemIndex = 0;
    },
    confirm: function() {
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
        this.scene.run('UIScene');
        this.cameras.main.setBackgroundColor(0xCCE9CA);

        
        let pokemonPlayer = new PlayerCharacter(this, 120, 400, 'player', 4, name, hp, damage);
        this.add.existing(pokemonPlayer);  

        
        let pokemonEnemy = new Enemy(this, 700, 150, 'enemy', null, name, hp, damage);
        this.add.existing(pokemonEnemy);
 
        this.heroes = [ pokemonPlayer ];
        this.enemies = [ pokemonEnemy ];
        this.units = this.heroes.concat(this.enemies);
        
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
        if(this.index >= this.units.length) {
            this.index = 0;
        }
        if(this.units[this.index]) {
            if(this.units[this.index] instanceof PlayerCharacter) {                
                this.events.emit('PlayerSelect', this.index);
            } else { 
                let r = Math.floor(Math.random() * this.heroes.length);
                this.units[this.index].attack(this.heroes[r]);  
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
        
        this.currentMenu = this.actionsMenu;
        
        this.menus.add(this.heroesMenu);
        this.menus.add(this.actionsMenu);
        this.menus.add(this.enemiesMenu);

        this.currentMenu = this.actionsMenu;

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


        this.sys.events.on('wake', this.wake, this);

    },

    wake: function() {
        this.scene.run('UIScene');  
        this.time.addEvent({delay: 2000, callback: this.exitBattle, callbackScope: this});        
    },

    exitBattle: function() {
        this.scene.sleep('UIScene');
        this.scene.switch('WorldScene');
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
        var graphics = this.scene.add.graphics();
        this.add(graphics);
        graphics.lineStyle(1, 0xffffff, 0.8);
        graphics.fillStyle(0x031f4c, 0.3);        
        graphics.strokeRect(-90, -15, 180, 30);
        graphics.fillRect(-90, -15, 180, 30);
        this.text = new Phaser.GameObjects.Text(scene, 0, 0, "", { color: "#ffffff", align: "center", fontSize: 13, wordWrap: { width: 170, useAdvancedWrap: true }});
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
