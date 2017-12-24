/*global Phaser*/

//define some variables that the game uses a lot
var players;
var player;
var thrownSwords;
var thrown;
var turretEnemies;
var bullets;
var bullet;

var game = new Phaser.Game(1000, 600, Phaser.CANVAS, '');
var game_state = {};

game_state.boot = function() {};
game_state.boot.prototype = {

    preload: function() {
        game.load.spritesheet('hashi', 'assets/hashi7.png', 32, 32);
        game.load.spritesheet('turret', 'assets/turret4.png', 32, 32);
        game.load.image('bullet', 'assets/sovietBullet.png');
        game.load.spritesheet('thrownSword', 'assets/swordBullet2.png', 32, 32);
        game.load.image('sky', 'assets/sky.png');
        game.load.spritesheet('star', 'assets/star.png', 32, 32);
        game.load.image('endDoor', 'assets/flag.png');
        game.load.tilemap('level1', 'assets/maps/map4.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('gameTiles', 'assets/maps/newTiles.png');
        game.load.spritesheet('explosion', 'assets/splode.png', 16, 16);
        //config
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        //prevent smoothing
        game.stage.smoothed = false;
    },

    create: function() {
        //hacc to preload custom font
        game.add.text(-100, -100, "hack", { font: "1px japan", fill: "#FFFFFF" });
        //initialize physics
        game.physics.startSystem(Phaser.Physics.ARCADE);
        //set background color
        game.stage.backgroundColor = '#000000';
        //small delay to allow the font hacc to work
        game.time.events.add(Phaser.Timer.SECOND * 1, this.doneBooting, this);

    },
    doneBooting: function() {
        this.state.start('story');
    }
};

//title screen
game_state.story = function() {};
game_state.story.prototype = {
    create: function() {
        game.stage.backgroundColor = '#EC1818';
        //click to advance story
        game.input.onDown.addOnce(this.advanceStory, this);
        this.spaceBar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.spaceBar.onDown.addOnce(this.skipStory, this);

        this.enter = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        this.enter.onDown.addOnce(this.controls, this);
        //explain advance or skip controls
        this.explain = game.add.text(game.world.centerX, game.world.centerY + 225, "click: story\nspacebar: start\nenter: controls\ntest.js", { font: "32px courier", fill: "#FFFFFF" });
        this.explain.anchor.set(0.5);
        this.explain.align = 'center';
        //TITLE TEXT
        this.title = game.add.text(game.world.centerX, game.world.centerY, "SHOGUN", { font: "150px japan", fill: "#FFFFFF" });
        this.title.anchor.set(0.5);
        this.title.align = 'center';
        //awesome reflection
        this.textReflect = game.add.text(game.world.centerX, game.world.centerY + 100, "SHOGUN", { font: "150px japan", fill: "#FFFFFF" });
        this.textReflect.anchor.set(0.5);
        this.textReflect.align = 'center';
        this.textReflect.scale.y = -1;
        //linear gradient
        this.grd = this.textReflect.context.createLinearGradient(0, 0, 0, this.title.canvas.height);
        //Add in 2 color stops
        this.grd.addColorStop(0, 'rgba(255,255,255,0)');
        this.grd.addColorStop(1, 'rgba(255,255,255,0.2)');
        //And apply to the Text
        this.textReflect.fill = this.grd;
    },
    skipStory: function() {
        //this.state.start('storyScene');
        this.state.start('main');
    },
    advanceStory: function() {
        this.state.start('storyScene');
    },
    controls: function() {
        this.state.start('controls');
    }
};

//story
game_state.story2 = function() {};
game_state.story2.prototype = {

    create: function() {
        //index starts at 1, not 0. remember! this is so you can just count the text
        this.storyIndex = 0;
        this.story = [
            "1954", "THE DISTANT FUTURE",
            "NUCLEAR WAR HAS ENGULFED THE WORLD",
            "EXCEPT FOR ASIA", "FOR SOME REASON",
            "OUT OF THE ASHES OF THE OLD WORLD ROSE:",
            "DRAGON SHOGUN",
            "COMMANDING VILE ARMIES,\nHE TOOK CONTROL OF THE BROKEN LANDS",
            "RUSSIA", "CHINA", "INDIA", "KOREA", "JAPAN",
            "WITH THE FIVE KINGDOMS UNITED\nUNDER HIS IRON CLAW,\nTHE WORLD HAS NO CHANCE.",
            "THAT'S WHERE YOU COME IN.",
            "RONIN HASHI!", "FORGET YOUR DISHONORABLE PAST", "DON THE ARMOR",
            "STOP THE FIVE GENERALS", "AND BRING AN END TO THIS VILE REGIME!!!"
        ];
        //start with the first index of 0
        this.storyText = game.add.text(game.world.centerX, game.world.centerY, this.story[0], { font: "50px Courier", fill: "#FFFFFF" });
        this.storyText.anchor.set(0.5);
        this.storyText.align = 'center';
        //on click, update text
        game.input.onDown.add(this.readStory, this);
    },
    readStory: function() {
        //increment index by 1 and replace text
        this.storyIndex++;
        this.storyText.text = this.story[this.storyIndex];
        //special text sizes
        if (this.storyIndex > 17) {
            game.time.events.add(Phaser.Timer.SECOND * 3, this.storyOver, this);
        }
        else if (this.storyIndex >= 1 && this.storyIndex != 6) {
            this.storyText.fontSize = 32;
            this.storyText.font = 'courier';
        }
        else {
            //dragon shogun
            this.storyText.fontSize = 100;
            this.storyText.font = 'japan';
        }
    },
    storyOver: function() {
        this.state.start('main');

    }
};


//story
game_state.controls = function() {};
game_state.controls.prototype = {

    create: function() {
        this.controlText = game.add.text(game.world.centerX, game.world.centerY, "Arrow keys to move\nSpace to throw sword\nHold up and use left/right arrows to wall jump\nPress enter to play", { font: "32px courier", fill: "#FFFFFF" });
        this.controlText.anchor.set(0.5);
        this.controlText.align = 'center';
        this.enter = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        this.enter.onDown.addOnce(this.controlsOver, this);
    },
    controlsOver: function() {
        this.state.start('main');
    }
};

//actual game
game_state.main = function() {};
game_state.main.prototype = {

    create: function() {
        //background
        this.sky = game.add.sprite(0, 0, 'sky');
        game.stage.backgroundColor = '#000000';
        this.sky.scale.setTo(40, 2.5);
        //tilemaps
        this.map = this.game.add.tilemap('level1');
        this.map.addTilesetImage('newTiles', 'gameTiles');
        //create layer
        this.backgroundLayer = this.map.createLayer('background');
        this.blockedLayer = this.map.createLayer('blocked');
        //collision on blockedLayer
        this.map.setCollisionBetween(1, 2000, true, 'blocked');
        //resizes the game world to match the layer dimensions
        this.blockedLayer.resizeWorld();

        //"explosions"
        this.explosions = game.add.group();
        this.explosions.enableBody = true;
        this.explosions.physicsBodyType = Phaser.Physics.ARCADE;
        this.explosions.createMultiple(30, 'explosion');
        this.explosions.setAll('anchor.x', 0.5);
        this.explosions.setAll('anchor.y', 0.5);
        this.explosions.forEach(function(explosion) {
            explosion.animations.add('explosion');
        });
        //score text
        var style = { font: "32px japan", fill: "#FFFFFF" };
        this.scoreText = game.add.text(16, 16, 'Score: 0', style);
        this.score = 0;
        this.scoreText.fixedToCamera = true;
        this.scoreText.cameraOffset.setTo(20, 20);

        //adding players
        players = game.add.group();
        players.enableBody = true;
        var result = this.findObjectsByType('playerStart', this.map, 'object');
        // player spawns at player object
        player = new Player(game, result[0].x, result[0].y);
        players.add(player);

        //thrownSword
        thrownSwords = game.add.group();
        thrownSwords.enableBody = true;
        thrown = new sword(game, 32, 576);
        thrownSwords.add(thrown);

        //enemy bullets
        bullets = game.add.group();
        bullets.enableBody = true;
        //spawn game objects
        //stars
        this.createItems();
        //exit
        this.createDoors();
        //enemies
        this.createEnemies();
        //game timer
        //20 seconds is my record!
        this.time = 0;
        game.time.events.add(Phaser.Timer.SECOND * 1, this.checkTime, this);
        this.timeText = game.add.text(16, 16, 'Time: 0', style);
        this.timeText.fixedToCamera = true;
        this.timeText.cameraOffset.setTo(20, 50);
    },

    update: function() {
        //collide player and tilemap
        game.physics.arcade.collide(players, this.blockedLayer);
        //collide sword and tilemap
        game.physics.arcade.collide(thrownSwords, this.blockedLayer);
        //player touches star
        game.physics.arcade.overlap(players, this.items, this.collectStar, null, this);
        //player touches sword
        game.physics.arcade.overlap(players, thrownSwords, this.collectSword, null, this);
        //turret can be stomped
        game.physics.arcade.overlap(players, turretEnemies, this.stompTurret, null, this);
        //or slashed with the thrown sword
        game.physics.arcade.overlap(thrownSwords, turretEnemies, this.slashTurret, null, this);
        //bullets can be slashed too
        game.physics.arcade.overlap(thrownSwords, bullets, this.slashBullet, null, this);
        //player collides with turrets
        game.physics.arcade.collide(players, turretEnemies);
        //turret collides with the world
        game.physics.arcade.collide(turretEnemies, this.blockedLayer);
        //bullets collides with platforms and die on hit
        game.physics.arcade.overlap(bullets, this.blockedLayer, this.killBullet, null, this);
        //restart level if hit by bullet
        game.physics.arcade.overlap(players, bullets, this.restartGame, null, this);
        //restart level if player reaches end
        game.physics.arcade.overlap(players, this.doors, this.endLevel, null, this);
    },
    checkTime: function(){
        this.time += 1;
        this.timeText.text = 'Time: ' + this.time;
        game.time.events.add(Phaser.Timer.SECOND * 1, this.checkTime, this);
    },
    collectStar: function(player, star) {
        star.kill();
        this.score += 1;
        this.scoreText.text = 'Score: ' + this.score;
    },
    stompTurret: function(player, turretEnemy) {
        if (turretEnemy.body.touching.up && player.body.touching.down) {
            player.body.velocity.y = -350;
            turretEnemy.kill();
            this.score += 1;
            this.scoreText.text = 'Score: ' + this.score;
            var explosion = this.explosions.getFirstExists(false);
            explosion.reset(turretEnemy.body.x + turretEnemy.body.halfWidth, turretEnemy.body.y + turretEnemy.body.halfHeight);
            explosion.alpha = 1;
            explosion.scale.x = 4;
            explosion.scale.y = 4;
            explosion.play('explosion', 30, false, true);
        }
    },
    killBullet: function(bullet, blockedLayer) {
        bullet.kill();
    },
    slashBullet: function(thrown, bullet) {
        bullet.kill();
    },
    restartGame: function(player, bullet) {
        game.state.start('main');
    },
    endLevel: function(player, door) {
        game.state.start('main');
    },
    createItems: function() {
        //create items
        this.items = this.game.add.group();
        this.items.enableBody = true;
        var item;
        result = this.findObjectsByType('item', this.map, 'object');
        result.forEach(function(element) {
            this.createFromTiledObject(element, this.items);
        }, this);

    },
    createDoors: function() {
        //create doors
        this.doors = this.game.add.group();
        this.doors.enableBody = true;
        result = this.findObjectsByType('door', this.map, 'object');

        result.forEach(function(element) {
            this.createFromTiledObject(element, this.doors);
        }, this);
    },
    createEnemies: function() {
        //create items
        turretEnemies = this.game.add.group();
        turretEnemies.enableBody = true;

        result = this.findObjectsByType('enemy', this.map, 'object');
        result.forEach(function(element) {
            var turretEnemy = new turret(game, element.x, element.y);
            turretEnemies.add(turretEnemy);
        }, this);

    },
    //find objects in a Tiled layer that containt a property called "type" equal to a certain value
    findObjectsByType: function(type, map, layer) {
        var result = new Array();
        map.objects[layer].forEach(function(element) {
            if (element.properties.type === type) {
                //Phaser uses top left, Tiled bottom left so we have to adjust the y position
                //also keep in mind that the cup images are a bit smaller than the tile which is 16x16
                //so they might not be placed in the exact pixel position as in Tiled
                element.y -= map.tileHeight;
                result.push(element);
            }
        });
        return result;
    },
    //create a sprite from an object
    createFromTiledObject: function(element, group) {
        var sprite = group.create(element.x, element.y, element.properties.sprite);
        if (group == this.items) {
            this.items.callAll('animations.add', 'animations', 'spin', [0, 1, 2, 3, 4, 5, 6, 7], 10, true);

            //  And play them
            this.items.callAll('animations.play', 'animations', 'spin');
        }
    },
    slashTurret: function(thrown, turretEnemy) {
        turretEnemy.kill();
        this.score += 1;
        this.scoreText.text = 'Score: ' + this.score;
        var explosion = this.explosions.getFirstExists(false);
        explosion.reset(turretEnemy.body.x + turretEnemy.body.halfWidth, turretEnemy.body.y + turretEnemy.body.halfHeight);
        explosion.alpha = 1;
        explosion.scale.x = 4;
        explosion.scale.y = 4;
        explosion.play('explosion', 30, false, true);
    },

    collectSword: function(player, thrown) {
        if (thrown.swordTimer >= 20) {
            thrown.kill();
            thrown.swordCalled = 0;
        }
    },
    render: function() {
        //game.debug.body(thrown); 
        //this.items.forEachAlive(this.renderGroup, this);
        //game.debug.text(' ' + this.result, 16, 550);
    },
    renderGroup: function(member) {
        game.debug.body(member);
        game.debug.spriteInfo(member, 400, 32);
    }
};

//level up screen after level
game_state.RPG = function() {};
game_state.RPG.prototype = {

    create: function() {
        game.stage.backgroundColor = '#EC1818';
        
        var style = { font: "64px japan", fill: "#FFFFFF" };
        this.titleText = game.add.text(game.world.centerX, 64, 'LEVEL UP', style);
        this.titleText.anchor.set(0.5);
        this.titleText.align = 'center';
        this.rpgText = game.add.text(game.world.centerX, game.world.centerY, "Use your accumulated points to upgrade!", { font: "16px courier", fill: "#FFFFFF" });
        this.rpgText.anchor.set(0.5);
        this.rpgText.align = 'center';
        //this.enter = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        //this.enter.onDown.addOnce(this.finishLevelUp, this);
    },
    
    finishLevelUp: function() {
        this.state.start('main');
    }
};

Player = function(game, x, y) {
    //create player
    Phaser.Sprite.call(this, game, x, y, "hashi");
    //enable physics
    game.physics.enable(this, Phaser.Physics.ARCADE);
    //hitbox
    this.body.setSize(15, 25, 0, 4);
    //movement
    this.body.maxVelocity.x = 350;
    this.body.maxVelocity.y = 750;
    this.moveSpeed = 0;
    this.body.gravity.y = 500;
    this.body.collideWorldBounds = true;
    this.anchor.set(0.5);
    this.frame = 0;
    this.lastJumpedFrom = 0;
    this.lastJumpedX = null;
    //running
    this.animations.add('running', [4, 5, 6, 7, 8, 1, 2, 3], 20, true);
    //jumping
    var jumpAnim = this.animations.add('jumpStart', [9, 10, 11], 15, false);
    this.animations.add('jumpFall', [12, 13, 14], 9, false);
    jumpAnim.onComplete.add(this.jumpAnimStopped, this);
    this.jumpAnimStoppedVar = 1;
    //controls
    this.cursors = game.input.keyboard.createCursorKeys();
    //walljumping
    this.cursors.right.onDown.add(this.wallJump, this);
    this.cursors.left.onDown.add(this.wallJump, this);
    //camera
    game.camera.follow(this);
};

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function() {
    this.handleMovement();
};

Player.prototype.jumpAnimStopped = function() {
    this.jumpAnimStoppedVar = 1;
};

Player.prototype.handleMovement = function() {
    //reset player movement speed
    this.body.velocity.x = 0;
    if (this.body.onFloor()) {

        this.lastJumpedX = null;
    }
    //hold up to go higher, let go to drop quickly
    if (!this.cursors.up.isDown || this.body.velocity.y >= -250) {
        this.body.velocity.y += 20;
    }
    //if falling, play falling animation
    if (this.body.velocity.y >= 100 && this.jumpAnimStoppedVar == 1) {

        this.animations.play('jumpFall');
    }
    //moving left or right
    if (this.cursors.left.isDown || this.cursors.right.isDown) {
        //if left, turn left
        if (this.cursors.left.isDown) {
            this.direction = -1;
            this.scale.x = -1;
        }
        //if right, turn right
        else {
            this.direction = 1;
            this.scale.x = 1;
        }
        //increase momentum
        this.moveSpeed += 35;
        this.body.velocity.x = this.moveSpeed * this.scale.x;
        //if on floor, run!
        if (this.body.onFloor()) {
            this.animations.play('running');
        }
        //otherwise FLY
        else if (this.body.velocity.y <= 100) {
            this.frame = 11;
        }
    }
    //if on floor and standing still
    else if (this.body.onFloor()) {
        //stop animations and idle
        this.animations.stop();
        this.frame = 0;
        this.moveSpeed = 0;
    }
    //up to jump if touching ground
    if (this.cursors.up.isDown && this.body.onFloor()) {
        this.body.velocity.y = -400;
        this.animations.play('jumpStart');
    }
    //wallslide
    if (this.body.blocked.right && this.body.velocity.y > 0 || this.body.blocked.left && this.body.velocity.y > 0) {
        if (this.body.onFloor()) {

        }
        else {
            this.frame = 15;
        }
        if (this.cursors.down.isDown) {
            this.body.velocity.y = 200;
        }
        else {
            this.body.velocity.y = 10;
        }
    }
};

Player.prototype.wallJump = function() {

    if (this.body.blocked.right || this.body.blocked.left) {
        if (this.cursors.up.isDown && !this.body.onFloor()) {

            if (this.body.blocked.right && this.lastJumpedFrom != 1 || this.lastJumpedX != this.x) {
                this.body.velocity.y = -400;
                this.lastJumpedFrom = 1;
                this.lastJumpedX = this.x;
            }
            if (this.body.blocked.left && this.lastJumpedFrom != -1 || this.lastJumpedX != this.x) {
                this.body.velocity.y = -400;
                this.lastJumpedFrom = -1;
                this.lastJumpedX = this.x;
            }
        }
    }

};

turret = function(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'turret');
    //enemy config
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.animations.add('shooting', [2, 3, 1], 10, false);
    this.body.gravity.y = 500;
    this.body.bounce.x = 1;
    this.body.collideWorldBounds = true;
    this.body.drag.x = 100;
    this.frame = 1;
    this.scale.x = 1;
    this.anchor.set(0.5);
    this.chasing = 0;
    this.body.immovable = true;
    this.timer = 1;
};

turret.prototype = Object.create(Phaser.Sprite.prototype);
turret.prototype.constructor = turret;

turret.prototype.update = function() {
    if (player.y <= this.y + 100 && player.y >= this.y - 100 && player.x <= this.x + 300 && player.x >= this.x - 300) {
        if (player.x >= this.x) {
            this.scale.x = 1;
        }
        else {
            this.scale.x = -1;
        }
        //shoot!
        if (this.body.onFloor()) {
            this.shoot();
        }

    }
    else {
        if (this.body.blocked.right || this.body.blocked.left) {
            this.scale.x *= -1;
        }
        //hop!
        if (this.body.onFloor()) {
            this.jump();
            this.frame = 1;
        }
        else {
            this.frame = 0;
        }
    }
};

turret.prototype.jump = function() {
    if (this.timer == 1) {
        this.body.velocity.y = -100;
        this.body.velocity.x = 100 * this.scale.x;
        this.timer = 0;
        game.time.events.add(Phaser.Timer.SECOND * 1, this.enemyTimer, this);
    }
};

turret.prototype.shoot = function() {
    if (this.timer == 1) {
        this.animations.play('shooting');
        bullet = new Bullet(game, this.x, this.y + 10, this.scale.x);
        bullets.add(bullet);
        this.timer = 0;
        game.time.events.add(Phaser.Timer.SECOND * 1, this.enemyTimer, this);
    }
};

turret.prototype.enemyTimer = function() {
    this.timer = 1;
};

Bullet = function(game, x, y, direction) {
    Phaser.Sprite.call(this, game, x, y, 'bullet');
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.body.velocity.x = 200 * direction;
    this.scale.x = 1.5 * direction;
    this.scale.y = 1.5;
    this.anchor.set(0.5);
    this.body.immovable = true;
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.body.setSize(8, 6, 0, 0);
};
Bullet.prototype = Object.create(Phaser.Sprite.prototype);
Bullet.prototype.constructor = Bullet;

sword = function(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'thrownSword');
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.scale.x = 1;
    this.scale.y = 1;
    this.anchor.set(0.5);
    this.body.immovable = true;
    this.checkWorldBounds = true;
    this.body.collideWorldBounds = true;
    this.animations.add('spin', [0, 1, 2, 3], 40, true);
    this.animations.play('spin');
    this.kill();
    this.thrownStartingPosY = 0;
    this.swordTimer = 0;
    this.swordCalled = 0;
    this.swordDirection = 0;
    //shoot with space and call back
    this.spaceBar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this.spaceBar.onDown.add(this.throwSword, this);
};
sword.prototype = Object.create(Phaser.Sprite.prototype);
sword.prototype.constructor = sword;

sword.prototype.update = function() {
    // //time sword alive length
    if (this.alive) {
        this.swordTimer += 1;
        //momentum and return to sender
        if (Math.abs(this.body.velocity.x) <= 200) {
            //fall after peak
            this.body.gravity.y = 100;
        }
        if (this.swordDirection == 1) {
            if (player.x < this.x) {
                //reverse movement
                this.body.velocity.x += -5 * this.swordDirection;
            }
        }
        else if (player.x > this.x) {
            this.body.velocity.x += -5 * this.swordDirection;
        }
        //reverse movement earlier if hitting wall
        if (this.body.blocked.right || this.body.blocked.left) {
            this.body.velocity.x = -50 * this.swordDirection;
        }
    }
    //sword time-out if unreachable
    if (this.swordTimer >= 400) {
        this.kill();
        this.swordCalled = 0;
    }
};

sword.prototype.throwSword = function() {
    //if bullet is alive
    if (this.alive) {

        if (this.swordCalled == 0) {
            //call the sword backwards
            this.swordTimer = 20;
            this.swordCalled = 1;
        }
        //make the sword stop moving forwards
        if (this.swordDirection == 1) {
            if (player.x < this.x) {
                //forwards is relative to the player
                this.body.velocity.x = 0;
            }
        }

        else {
            if (player.x > this.x) {
                this.body.velocity.x = 0;
            }

        }

    }
    else {
        //reset variables
        this.swordTimer = 0;
        this.swordCalled = 0;
        //set scale
        this.scale.setTo(1, 1);
        //set direction player was facing when he/she threw sword
        this.swordDirection = player.scale.x;
        //sword direction visually
        if (this.swordDirection == 1) {
            this.scale.x = 1;
        }
        else {
            this.scale.x = -1;
        }
        if (player.body.blocked.right || player.body.blocked.left) {
            this.swordDirection *= -1;
        }
        //teleport to player
        this.reset(player.x, player.y);
        if (player.body.blocked.right || player.body.blocked.left) {
            //if blocked by a wall, shoot opposite side
            this.body.velocity.x = -400 * player.scale.x;
        }
        //if player is running fast, make bullet faster
        else if (player.body.velocity.x >= 600 || player.body.velocity.x <= -600) {
            this.body.velocity.x = 450 * player.scale.x;
        }
        //standing still or moving slow
        else {
            this.body.velocity.x = 400 * player.scale.x;
        }
        //float higher if jumping
        this.body.velocity.y = player.body.velocity.y * 0.40;
    }
};

//don't touch!
//states
game.state.add('boot', game_state.boot);
game.state.add('story', game_state.story);
game.state.add('storyScene', game_state.story2);
game.state.add('controls', game_state.controls);
game.state.add('main', game_state.main);
game.state.add('RPG', game_state.RPG);

//start the boot phase
game.state.start('boot');
