export let gameScene = new Phaser.Class({

  Extends: Phaser.Scene,

    initialize: 

    function gameScene(){
      Phaser.Scene.call(this, {key: 'gameScene'});

    },

    create(){
       
        const map = this.make.tilemap({ key: "map" });

        const tileset = map.addTilesetImage("tuxmon-sample-32px-extruded", "tiles");
      
        const belowLayer = map.createLayer("Below Player", tileset, 0, 0);
        const worldLayer = map.createLayer("World", tileset, 0, 0);
        const aboveLayer = map.createLayer("Above Player", tileset, 0, 0);
        const arbortsLayer = map.createLayer("Arbots", tileset, 0, 0);

        arbortsLayer.setCollisionByProperty(121);
        worldLayer.setCollisionByProperty({ collides: true });
      
        
        aboveLayer.setDepth(10);
      
        
        const spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point");
      
        
        this.player = this.physics.add.
        sprite(spawnPoint.x, spawnPoint.y, "atlas", "misa-front").
        setSize(30, 40).
        setOffset(0, 24);
      
        this.physics.add.collider(this.player, worldLayer, this.onMeetEnemy, false, this);
        this.physics.add.collider(this.player, arbortsLayer, upper, false, this);
        this.physics.add.collider(this.player, arbortsLayer, this.onMeetEnemy, false, this);

        this.sys.events.on('wake', this.wake, this);


        function upper(){
          console.log('this is arbouts')
        }


        const anims = this.anims;
        anims.create({
          key: "misa-left-walk",
          frames: anims.generateFrameNames("atlas", { prefix: "misa-left-walk.", start: 0, end: 3, zeroPad: 3 }),
          frameRate: 10,
          repeat: -1 });
      
        anims.create({
          key: "misa-right-walk",
          frames: anims.generateFrameNames("atlas", { prefix: "misa-right-walk.", start: 0, end: 3, zeroPad: 3 }),
          frameRate: 10,
          repeat: -1 });
      
        anims.create({
          key: "misa-front-walk",
          frames: anims.generateFrameNames("atlas", { prefix: "misa-front-walk.", start: 0, end: 3, zeroPad: 3 }),
          frameRate: 10,
          repeat: -1 });
      
        anims.create({
          key: "misa-back-walk",
          frames: anims.generateFrameNames("atlas", { prefix: "misa-back-walk.", start: 0, end: 3, zeroPad: 3 }),
          frameRate: 10,
          repeat: -1 });
      
      
        const camera = this.cameras.main;
        camera.startFollow(this.player);
        camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
      
        this.cursors = this.input.keyboard.createCursorKeys();
      
        this.add.
        text(16, 16, 'Arrow keys to move\nPress "D" to show hitboxes', {
          font: "18px monospace",
          fill: "#000000",
          padding: { x: 20, y: 10 },
          backgroundColor: "#ffffff" }).
      
        setScrollFactor(0).
        setDepth(30);
      
        this.input.keyboard.once("keydown-D", event => {
          this.physics.world.createDebugGraphic();
      
          const graphics = this.add.
          graphics().
          setAlpha(0.75).
          setDepth(20);
          worldLayer.renderDebug(graphics, {
            tileColor: null, 
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), 
            faceColor: new Phaser.Display.Color(40, 39, 37, 255)
          });
        });
    },

    onMeetEnemy: function(player, zone) {
      this.camera = this.cameras.main.shake(300);
      
      this.input.stopPropagation();
      this.scene.sleep('gameScene')
      this.scene.run('game', this)
      window.location.href = 'https://game-play-pokemon.vercel.app/'               
  },
    wake() {
        this.cursors.left.reset();
        this.cursors.right.reset();
        this.cursors.up.reset();
        this.cursors.down.reset();
    },

    update(time, delta) {
        const speed = 175;
        const prevVelocity = this.player.body.velocity.clone();
      
        this.player.body.setVelocity(0);
      
        if (this.cursors.left.isDown) {
          this.player.body.setVelocityX(-speed);
        } else if (this.cursors.right.isDown) {
          this.player.body.setVelocityX(speed);
        }
      
        if (this.cursors.up.isDown) {
          this.player.body.setVelocityY(-speed);
        } else if (this.cursors.down.isDown) {
          this.player.body.setVelocityY(speed);
        }
      
        this.player.body.velocity.normalize().scale(speed);
      
        if (this.cursors.left.isDown) {
          this.player.anims.play("misa-left-walk", true);
        } else if (this.cursors.right.isDown) {
          this.player.anims.play("misa-right-walk", true);
        } else if (this.cursors.up.isDown) {
          this.player.anims.play("misa-back-walk", true);
        } else if (this.cursors.down.isDown) {
          this.player.anims.play("misa-front-walk", true);
        } else {
          this.player.anims.stop();
      
          if (prevVelocity.x < 0) this.player.setTexture("atlas", "misa-left");else
          if (prevVelocity.x > 0) this.player.setTexture("atlas", "misa-right");else
          if (prevVelocity.y < 0) this.player.setTexture("atlas", "misa-back");else
          if (prevVelocity.y > 0) this.player.setTexture("atlas", "misa-front");
        }
    }
})