export default class battleScene extends Phaser.Scene {
	constructor() {
		super("battleScene");
	}

	preload() {
	}

	create(data) {
		this.pokedexData = data.pokedexData;
		this.pokemon_rarity_cumulative = data.pokemon_rarity_cumulative;
		this.pokemons = data.pokemons;
		this.moves = data.moves;
		this.currentPokemonIndex = -1;
		this.menuInitialized = false;
		this.isTyping = false;
		this.isAttacking = false;
		this.isBattleScene = true;
		this.ownPokemon = null;
		this.pauseCursor = false;
		this.numMoves = data.numMoves;
		this.tempMoves = data.tempMoves;
		this.typeMoves = data.typeMoves;
		this.selectedMenu = 'Fight';
		this.currentMenu = 'Menu';
		this.cursors = this.input.keyboard.createCursorKeys();
		this.yesKey = this.input.keyboard.addKey('A');
		this.noKey = this.input.keyboard.addKey('B');
		this.pokeballAnim();
		this.isFromPokemonScene = false;

		
		this.isUpPress = false;
		this.isDownPress = false;
		this.isLeftPress = false;
		this.isRightPress = false;
		this.isYesPress = false;
		this.isNoPress = false;
		this.isEnterPress = false;

		

		this.events.addListener("Up", this.up, this);
		this.events.addListener("Down", this.down, this);
		this.events.addListener("Left", this.left, this);
		this.events.addListener("Right", this.right, this);
		this.events.addListener("Yes", this.yes, this);
		this.events.addListener("No", this.no, this);
		this.events.addListener("Enter", this.enter, this);

		var d = Math.random();
		var cumulative = d * this.pokemon_rarity_cumulative[this.pokemon_rarity_cumulative.length - 1];
		this.wild_pokemon_index;
		for (let i = 0; i < 151; i++) {
			if (this.pokemon_rarity_cumulative[i] >= cumulative) {
				this.wild_pokemon_index = i;
				break;
			}
		}

		this.opponent_pokemon_types = this.pokedexData[this.wild_pokemon_index]["type"];
		this.opponent_pokemon_moves = [];
		this.opponent_pokemon_num_types = this.opponent_pokemon_types.length;
		for (var i = 0; i < 4; i++) {
			do {
				var move_type_index = this.getRandomInt(0, this.opponent_pokemon_num_types - 1);
				var type = this.opponent_pokemon_types[move_type_index];
				if (!(type in this.typeMoves)) {
					continue;
				}
				var num_moves = this.typeMoves[type].length;
				var move_index = this.getRandomInt(0, num_moves - 1);
				var move = this.typeMoves[type][move_index];
				this.opponent_pokemon_moves.push([move["ename"], move["pp"]]);
			}
			while (!(type in this.typeMoves));
		}
		console.log(this.opponent_pokemon_moves);

		this.opponentPokemon = {
			pokemon: this.pokedexData[this.wild_pokemon_index]["name"]["english"],
			moves: this.opponent_pokemon_moves,
			hp: 100,
			maxHp: 100,
			pokedex: this.wild_pokemon_index + 1
		};

		this.numPokemon = this.pokemons.length;
		for (let i = 0; i < this.numPokemon; i++) {
			if (this.pokemons[i]["hp"] > 0) {
				this.currentPokemonIndex = i;
				break;
			}
		}

		if (this.currentPokemonIndex == -1) {

		}

		var background = this.add.image(300, 300, 'battle-background');
		var own_pokemon_bar = this.add.image(420, 410, 'battle-bar');
		var opponent_pokemon_bar = this.add.image(175, 220, 'opponent-battle-bar');

		this.own_pokemon_hp_bar = this.add.image(405, 405, "hp-bar").setOrigin(0).setScale(1.3);
		this.own_pokemon_hp_bar.displayWidth = this.pokemons[this.currentPokemonIndex]["hp"] / this.pokemons[this.currentPokemonIndex]["maxHp"] * 147;
		this.opponent_pokemon_hp_bar = this.add.image(139, 226, "hp-bar").setOrigin(0).setScale(1.2);
		this.opponent_pokemon_hp_bar.displayWidth = this.opponentPokemon["hp"] / this.opponentPokemon["maxHp"] * 143;

		this.own_pokemon_name_text = this.add.text(310, 367, this.pokemons[this.currentPokemonIndex]["pokemon"], { color: '#000000' }).setFontSize('25px');
		this.opponent_pokemon_name_text = this.add.text(44, 188, this.opponentPokemon["pokemon"], { color: '#000000' }).setFontSize('25px');
		this.own_pokemon_hp_text = this.add.text(440, 423, this.pokemons[this.currentPokemonIndex]["hp"] + "/" + this.pokemons[this.currentPokemonIndex]["maxHp"], { color: '#000000' }).setFontSize('25px');

		this.graphics = this.add.graphics();
		this.graphics.fillStyle(0xdc5436, 1);
		this.graphics.fillRoundedRect(5, 475, 590, 115, 20);
		this.graphics.fillStyle(0x629ba0, 1);
		this.graphics.fillRoundedRect(25, 480, 550, 105, 20);

		var pokemonName = this.pokemons[this.currentPokemonIndex]["pokemon"];
		this.typing_4 = this.initializeTyping();
		this.typing = this.initializeTyping();
		this.typing.on('complete', () => {
			this.isTyping = false;
			this.typing.start("");
			this.summonPokemon();
		});
		this.typing.start('Wild ' + this.pokedexData[this.wild_pokemon_index]["name"]["english"] + ' appeared!');

		this.opponent_pokemon_sprite = this.add.image(430, 290, 'pokemon' + (this.wild_pokemon_index + 1).toString()).setScale(2.0);
		
		this.openingSequence();
	}

	left() {
		this.isLeftPress = true;
	}
	right() {
		this.isRightPress = true;
	}
	up() {
		this.isUpPress = true;
	}
	down() {
		this.isDownPress = true;
	}
	yes() {
		this.isYesPress = true;
	}
	no() {
		this.isNoPress = true;
	}
	enter() {
		this.isEnterPress = true;
	}

	openingSequence() {
		this.openingTop = this.add.rectangle(300, 150, 600, 300, 0x000000);
		this.openingBottom = this.add.rectangle(300, 450, 600, 300, 0x000000);
		this.openingBottom.angle = 180;
		this.tweens.add({
			targets: this.openingTop,
			height: 0,
			duration: 1000,
		});
		this.tweens.add({
			targets: this.openingBottom,
			height: 0,
			duration: 1000,
		});
	}

	pokeballAnim() {
		this.frames = [];
		for (var i = 0; i < 17; i++) {
			this.frames.push(0 + i * 25);
		}
		this.anims.create({
			key: 'pokeball_throw',
			frames: this.anims.generateFrameNames('pokeball_animation',
				{
					prefix: '',
					suffix: '',
					zeroPad: 0,
					frames: this.frames
				}),
			frameRate: 10,
			repeat: 0
		});
	}

	catchPokemon() {
		this.setMenu(false);
		this.pokeball2 = this.physics.add.sprite(150, 400, 'pokeball_animation');
		this.pokeball2.anims.play('pokeball_throw');

		this.pointsArray = [{x: 150, y: 400}, {x: 200, y: 300}, {x: 400, y: 100}, {x: 430, y: 290}];
		this.bezierCurve = new Phaser.Curves.CubicBezier(this.pointsArray[0], this.pointsArray[1], this.pointsArray[2], this.pointsArray[3]);
		var tweenObject = {
            val: 0
        }
        this.tweens.add({
            targets: tweenObject,
            val: 1,
            duration: 1000,
            yoyo: false,
            repeat: 0,
            ease: "Sine.easeInOut",
            callbackScope: this,
            onUpdate: function(tween, target){
                var position = this.bezierCurve.getPoint(target.val);
                this.pokeball2.x = position.x;
                this.pokeball2.y = position.y;
			},
			onComplete: function() {
				this.tweens.add({
					targets: this.pokeball2,
					y: this.pokeball2.y - 50,
					duration: 1000,
					ease: function (k) {
						return -4 * k * k + 4 * k + 0;
					},
					yoyo: false,
					onComplete: function () {
						this.opponent_pokemon_sprite.destroy();
						this.pokeball2.anims.play('pokeball_throw');
						if(this.pokemons.length < 6) {
							this.pokemon_caught_text = this.opponentPokemon["pokemon"] + " has been caught!";
						} else {
							this.pokemon_caught_text = "Pokemon party is full";
						}
						this.typing_5 = this.initializeTyping();
						this.typing_5.start(this.pokemon_caught_text);
						this.typing_5.on("complete", () => {
							this.pokeball2.destroy();
							this.isTyping = false;
							this.pauseCursor = true;
							if (this.pokemons.length < 6) {
								this.pokemons.push(this.opponentPokemon);
							}
							else {

							}
							this.time.delayedCall(1000, function(){
								this.pauseCursor = true;
								this.game.scene.stop('battleScene');
								this.game.scene.run('mainScene', this);
							}, null, this);
						});
					},
					onCompleteScope: this
				});
			}
        });
	}

	setOwnPokemonHP() {
		this.own_pokemon_hp_text.setText(this.pokemons[this.currentPokemonIndex]["hp"] + "/" + this.pokemons[this.currentPokemonIndex]["maxHp"]);
		this.own_pokemon_hp_bar.displayWidth = this.pokemons[this.currentPokemonIndex]["hp"] / this.pokemons[this.currentPokemonIndex]["maxHp"] * 147;
	}

	summonPokemon() {
		this.pokeball = this.physics.add.sprite(150, 400, 'pokeball_animation');

		if(this.ownPokemon != null) {
			this.ownPokemon.destroy();
		}

		if(!this.isFromPokemonScene) {
			for(var i=0; i<this.pokemons.length; i++) {
				if(this.pokemons[i]["hp"] > 0) {
					this.currentPokemonIndex = i;
					break;
				}
			}
		}

		if (this.isFromPokemonScene || this.ownPokemon != null) {
			this.own_pokemon_name_text.setText(this.pokemons[this.currentPokemonIndex]["pokemon"]);
			this.own_pokemon_hp_text.setText(this.pokemons[this.currentPokemonIndex]["hp"] + "/" + this.pokemons[this.currentPokemonIndex]["maxHp"]);
			this.own_pokemon_hp_bar.displayWidth = this.pokemons[this.currentPokemonIndex]["hp"] / this.pokemons[this.currentPokemonIndex]["maxHp"] * 147;
			this.isFromPokemonScene = false;
		}

		this.typing_4.start("Go " + this.pokemons[this.currentPokemonIndex]["pokemon"] + "!");
		if(this.menu) {
			this.setMenu(false);
			this.setPointer(false);
		}
		
		this.pauseCursor = true;
		this.pokeball.anims.play('pokeball_throw');
		this.pokeball.on("animationcomplete", function () {
		
			this.ownPokemon = this.add.image(150, 390, 'pokemon-back' + this.pokemons[this.currentPokemonIndex]["pokedex"].toString()).setScale(2.0);

			this.pokeball.setVisible(false);
			this.typing_4.start("");
			this.initializeMenu();
			this.initializePPMenu();
			this.setPPMenu(false);
			this.initializePointer();
			this.setMenu(true);
			this.pauseCursor = false;
		}, this);
	}

	closest(array, num) {
		var i = 0;
		var minDiff = 1000;
		var ans;
		for (i in array) {
			var m = Math.abs(num - array[i]);
			if (m < minDiff) {
				minDiff = m;
				ans = array[i];
			}
		}
		return ans;
	}

	initializeTyping() {
		this.isTyping = true;
		this.bottom_text = this.add.text(35, 490, '').setFontSize('25px');
		return this.plugins.get('rexTextTyping').add(this.bottom_text, { speed: 50 });
	}

	initializeMenu() {
		if (this.menu != null) {
			this.menu.destroy();
			this.fightText.destroy();
			this.pokemonText.destroy();
			this.bagText.destroy();
			this.runText.destroy();
			this.menuInitialized = true;
		}
		this.menu = this.add.rectangle(430, 533, 300, 105, 0xffffff);
		this.fightText = this.add.text(320, 500, 'FIGHT', { color: '#000000' }).setFontSize('30px');
		this.pokemonText = this.add.text(320, 540, 'POKeMON', { color: '#000000' }).setFontSize('30px');
		this.bagText = this.add.text(480, 500, 'BAG', { color: '#000000' }).setFontSize('30px');
		this.runText = this.add.text(480, 540, 'RUN', { color: '#000000' }).setFontSize('30px');
		this.menuInitialized = true;
	}

	initializePPMenu() {
		if (this.moveMenu != null) {
			this.moveMenu.destroy();
			this.moveMenu.destroy();
			this.ppMenu.destroy();
			this.move_1_text.destroy();
			this.move_2_text.destroy();
			this.move_3_text.destroy();
			this.move_4_text.destroy();
			this.pp_text.destroy();
			this.pp_count_text.destroy();
			this.pp_type_text.destroy();
		}
		this.moveMenu = this.add.rectangle(220, 533, 400, 105, 0xffffff);
		this.ppMenu = this.add.rectangle(500, 533, 160, 105, 0xffffff);
		this.move_1_text = this.add.text(40, 500, this.pokemons[this.currentPokemonIndex]["moves"][0][0], { color: '#000000' }).setFontSize('30px');
		this.move_2_text = this.add.text(40, 540, this.pokemons[this.currentPokemonIndex]["moves"][1][0], { color: '#000000' }).setFontSize('30px');
		this.move_3_text = this.add.text(220, 500, this.pokemons[this.currentPokemonIndex]["moves"][2][0], { color: '#000000' }).setFontSize('30px');
		this.move_4_text = this.add.text(220, 540, this.pokemons[this.currentPokemonIndex]["moves"][3][0], { color: '#000000' }).setFontSize('30px');
		this.pp_text = this.add.text(430, 500, 'PP', { color: '#000000' }).setFontSize('20px');
		this.pp_count_text = this.add.text(470, 500, this.pokemons[this.currentPokemonIndex]["moves"][0][1] + "/15", { color: '#000000' }).setFontSize('20px');
		this.pp_type_text = this.add.text(430, 540, 'Type/Normal', { color: '#000000' }).setFontSize('20px');
	}

	initializePointer() {
		if (this.menuPointer != null) {
			this.menuPointer.destroy();
		}
		this.menuPointer = this.add.polygon(310, 513, [0, 0, 0, 20, 10, 10], 0x636363);
	}

	setMenu(flag) {
		this.menu.setVisible(flag);
		this.fightText.setVisible(flag);
		this.pokemonText.setVisible(flag);
		this.bagText.setVisible(flag);
		this.runText.setVisible(flag);
		this.menuPointer.setVisible(flag);
		if (flag) {
			this.setPointer(true);
			this.menuPointer.x = 310;
			this.menuPointer.y = 513;
			this.currentMenu = 'Menu';
			this.selectedMenu = 'Fight';
		}
	}

	setPPMenu(flag) {
		this.moveMenu.setVisible(flag);
		this.ppMenu.setVisible(flag);
		this.move_1_text.setVisible(flag);
		this.move_2_text.setVisible(flag);
		this.move_3_text.setVisible(flag);
		this.move_4_text.setVisible(flag);
		this.pp_text.setVisible(flag);
		this.pp_count_text.setVisible(flag);
		this.pp_type_text.setVisible(flag);
	}

	setPointer(flag) {
		this.menuPointer.setVisible(flag);
	}

	attack(move_no) {
		this.setPPMenu(false);
		this.setPointer(false);
		if (this.pokemons[this.currentPokemonIndex]["moves"][move_no][1] == 0) {
			this.typing_2 = this.initializeTyping();
			this.typing_2.start("No PP left.").on('complete', () => {
				this.setMenu(true);
				this.isAttacking = false;
				this.typing_2.start("");
				this.isTyping = false;
			});
		} else {
			this.move = this.pokemons[this.currentPokemonIndex]["moves"][move_no][0];
			this.pokemons[this.currentPokemonIndex]["moves"][move_no][1] -= 1;
			this.typing_2 = this.initializeTyping();
			this.typing_2.start(this.pokemons[this.currentPokemonIndex]["pokemon"] + " uses " + this.move).on('complete', () => {
				this.typing_2.start("");

				this.own_pokemon_battle_tween = this.tweens.add({
					targets: this.ownPokemon,
					x: this.ownPokemon.x + 20,
					y: this.ownPokemon.y - 20,
					duration: 200,
					repeat: 0,
					loop: 0,
					yoyo: true,
					onComplete: function () {
						this.opponentPokemon["hp"] -= this.moves[this.move]["power"];
						if (this.opponentPokemon["hp"] < 0) {
							this.opponentPokemon["hp"] = 0;
						}

						this.tweens.add({
							targets: this.opponent_pokemon_hp_bar,
							displayWidth: this.opponentPokemon["hp"] / this.opponentPokemon["maxHp"] * 143,
							duration: 800,
							yoyo: false,
							repeat: 0,
							onComplete: function () {

								if (this.opponentPokemon["hp"] <= 0) {
									this.opponentPokemonFaint();
								}
								else {
									this.opponentPokemonMove();
								}
							},
							onCompleteScope: this
						});

					},
					onCompleteScope: this
				});
			});
		}
	}

	opponentPokemonMove() {

		var d = this.getRandomInt(0, 3);
		this.move = this.opponentPokemon["moves"][d][0];
		this.typing_3 = this.initializeTyping();
		this.typing_3.start(this.opponentPokemon["pokemon"] + " uses " + this.move).on('complete', () => {
			this.isTyping = false;
			this.typing_3.start("");

			this.tweens.add({
				targets: this.opponent_pokemon_sprite,
				x: this.opponent_pokemon_sprite.x - 20,
				y: this.opponent_pokemon_sprite.y + 20,
				duration: 200,
				repeat: 0,
				loop: 0,
				yoyo: true,
				onComplete: function () {

					if (this.moves[this.move]["power"] == null) {
						this.moves[this.move]["power"] = 40;
					}
					this.pokemons[this.currentPokemonIndex]["hp"] -= this.moves[this.move]["power"];
					if (this.pokemons[this.currentPokemonIndex]["hp"] < 0) {
						this.pokemons[this.currentPokemonIndex]["hp"] = 0;
					}
					this.own_pokemon_hp_text.setText(this.pokemons[this.currentPokemonIndex]["hp"] + "/" + this.pokemons[this.currentPokemonIndex]["maxHp"]);

					this.tweens.add({
						targets: this.own_pokemon_hp_bar,
						displayWidth: this.pokemons[this.currentPokemonIndex]["hp"] / this.pokemons[this.currentPokemonIndex]["maxHp"] * 147,
						duration: 800,
						yoyo: false,
						repeat: 0,
						onComplete: function () {

							if (this.pokemons[this.currentPokemonIndex]["hp"] <= 0) {
								this.pokemons[this.currentPokemonIndex]["hp"] = 0;
								this.ownPokemonFaint();
							} else {
								this.setMenu(true);
								this.isAttacking = false;
							}
							console.log(this.pokemons[this.currentPokemonIndex]["hp"], this.opponentPokemon["hp"]);
						},
						onCompleteScope: this
					});
				},
				onCompleteScope: this
			});
		});
	}

	ownPokemonFaint() {
		this.tweens.add({
			targets: this.ownPokemon,
			y: this.ownPokemon.y + 100,
			duration: 200,
			yoyo: false,
			onComplete: function () {
				this.ownPokemon.setVisible(false);
				this.own_pokemon_faint_text = this.initializeTyping();
				this.own_pokemon_faint_text.on('complete', () => {
					this.isTyping = false;
					this.own_pokemon_faint_text.start("");
				});
				this.own_pokemon_faint_text.start(this.pokemons[this.currentPokemonIndex]["pokemon"] + " fainted!");
				this.own_pokemon_faint_text.on("complete", () => {
					this.isAttacking = false;

					this.pauseCursor = true;

					var blackout = true;
					for(var i=0; i<this.pokemons.length; i++) {
						if(this.pokemons[i]["hp"] > 0) {
							blackout = false;
							break;
						}
					}

					if(blackout) {
						this.typing_6 = this.initializeTyping();
						this.typing_6.on("complete", () => {
							this.typing_6.start("");
							this.typing_7 = this.initializeTyping();
							this.typing_7.on("complete", () => {

								this.pauseCursor = false;
							});
							this.typing_7.start("You whited out.");
						});
						this.typing_6.start("You are out of Pokemon.");
					}

					else {
						this.summonPokemon();
					}
				});
			},
			onCompleteScope: this
		});
	}

	opponentPokemonFaint() {
		this.tweens.add({
			targets: this.opponent_pokemon_sprite,
			y: this.opponent_pokemon_sprite.y + 100,
			duration: 200,
			yoyo: false,
			onComplete: function () {
				this.opponent_pokemon_sprite.setVisible(false);
				this.opponent_pokemon_faint_text = this.initializeTyping();
				this.opponent_pokemon_faint_text.on('complete', () => {
					this.isTyping = false;
					this.opponent_pokemon_faint_text.start("");

					this.game.scene.stop('battleScene');
					this.game.scene.run('mainScene');
				});
				this.opponent_pokemon_faint_text.start(this.opponentPokemon["pokemon"] + " fainted!");
				this.isAttacking = false;
			},
			onCompleteScope: this
		});
	}

	update(time, delta) {
		if (this.menuInitialized && !this.isTyping && !this.isAttacking && !this.pauseCursor) {
			if (Phaser.Input.Keyboard.JustDown(this.cursors.down) || this.isDownPress) {
				if (this.currentMenu == 'Menu') {
					if (this.selectedMenu == 'Fight') {
						this.selectedMenu = 'Pokemon';
						this.menuPointer.y += 40;
					}
					else if (this.selectedMenu == 'Bag') {
						this.selectedMenu = 'Run';
						this.menuPointer.y += 40;
					}
				}
				else if (this.currentMenu == 'Fight') {
					if (this.selectedMenu == 'Move 1') {
						this.selectedMenu = 'Move 2';
						this.menuPointer.y += 40;
						this.pp_count_text.setText(this.pokemons[this.currentPokemonIndex]["moves"][1][1] + "/15");
					}
					else if (this.selectedMenu == 'Move 3') {
						this.selectedMenu = 'Move 4';
						this.menuPointer.y += 40;
						this.pp_count_text.setText(this.pokemons[this.currentPokemonIndex]["moves"][3][1] + "/15");
					}
				}
				this.isDownPress = false;
			}
			else if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || this.isUpPress) {
				if (this.currentMenu == 'Menu') {
					if (this.selectedMenu == 'Pokemon') {
						this.selectedMenu = 'Fight';
						this.menuPointer.y -= 40;
					}
					else if (this.selectedMenu == 'Run') {
						this.selectedMenu = 'Bag';
						this.menuPointer.y -= 40;
					}
				}
				else if (this.currentMenu == 'Fight') {
					if (this.selectedMenu == 'Move 2') {
						this.selectedMenu = 'Move 1';
						this.menuPointer.y -= 40;
						this.pp_count_text.setText(this.pokemons[this.currentPokemonIndex]["moves"][0][1] + "/15");
					}
					else if (this.selectedMenu == 'Move 4') {
						this.selectedMenu = 'Move 3';
						this.menuPointer.y -= 40;
						this.pp_count_text.setText(this.pokemons[this.currentPokemonIndex]["moves"][2][1] + "/15");
					}
				}
				this.isUpPress = false;
			}
			else if (Phaser.Input.Keyboard.JustDown(this.cursors.left) || this.isLeftPress) {
				if (this.currentMenu == 'Menu') {
					if (this.selectedMenu == 'Bag') {
						this.selectedMenu = 'Fight';
						this.menuPointer.x -= 160;
					}
					else if (this.selectedMenu == 'Run') {
						this.selectedMenu = 'Pokemon';
						this.menuPointer.x -= 160;
					}
				}
				else if (this.currentMenu == 'Fight') {
					if (this.selectedMenu == 'Move 3') {
						this.selectedMenu = 'Move 1';
						this.menuPointer.x -= 180;
						this.pp_count_text.setText(this.pokemons[this.currentPokemonIndex]["moves"][0][1] + "/15");
					}
					else if (this.selectedMenu == 'Move 4') {
						this.selectedMenu = 'Move 2';
						this.menuPointer.x -= 180;
						this.pp_count_text.setText(this.pokemons[this.currentPokemonIndex]["moves"][1][1] + "/15");
					}
				}
				this.isLeftPress = false;
			}
			else if (Phaser.Input.Keyboard.JustDown(this.cursors.right) || this.isRightPress) {
				if (this.currentMenu == 'Menu') {
					if (this.selectedMenu == 'Fight') {
						this.selectedMenu = 'Bag';
						this.menuPointer.x += 160;
					}
					else if (this.selectedMenu == 'Pokemon') {
						this.selectedMenu = 'Run';
						this.menuPointer.x += 160;
					}
				}
				else if (this.currentMenu == 'Fight') {
					if (this.selectedMenu == 'Move 1') {
						this.selectedMenu = 'Move 3';
						this.menuPointer.x += 180;
						this.pp_count_text.setText(this.pokemons[this.currentPokemonIndex]["moves"][2][1] + "/15");
					}
					else if (this.selectedMenu == 'Move 2') {
						this.selectedMenu = 'Move 4';
						this.menuPointer.x += 180;
						this.pp_count_text.setText(this.pokemons[this.currentPokemonIndex]["moves"][3][1] + "/15");
					}
				}
				this.isRightPress = false;
			}

			else if (Phaser.Input.Keyboard.JustDown(this.yesKey) || this.isYesPress) {
				switch (this.selectedMenu) {
					case 'Fight':
						this.setMenu(false);
						this.setPPMenu(true);
						this.setPointer(true);
						this.menuPointer.x = 30;
						this.currentMenu = 'Fight';
						this.selectedMenu = 'Move 1';
						this.isYesPress = false;
						break;
					case 'Pokemon':
						this.game.scene.sleep("battleScene");
						this.game.scene.run("pokemonScene", this);
						this.isYesPress = false;
						break;
					case 'Bag':
						this.game.scene.sleep("battleScene");
						this.game.scene.run("bagScene", this);
						this.isYesPress = false;
						break;
					case 'Run':
						this.game.scene.stop('battleScene');
						this.game.scene.run('mainScene');
						this.isYesPress = false;
						break;
					case 'Move 1':
						this.isAttacking = true;
						this.attack(0);
						this.isYesPress = false;
						break;
					case 'Move 2':
						this.isAttacking = true;
						this.attack(1);
						this.isYesPress = false;
						break;
					case 'Move 3':
						this.isAttacking = true;
						this.attack(2);
						this.isYesPress = false;
						break;
					case 'Move 4':
						this.isAttacking = true;
						this.attack(3);
						this.isYesPress = false;
						break;
				}
			}

			else if (Phaser.Input.Keyboard.JustDown(this.noKey) || this.isNoPress) {
				switch (this.currentMenu) {
					case 'Fight':
						this.setPPMenu(false);
						this.setMenu(true);
						this.isNoPress = false;
						break;
				}
			}
		}
	}

	getRandomInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
}