var Pool = {
    //showDebug: true,
    white: 0,
    yellow: 1,
    blue: 2,
    red: 3,
    pink: 4,
    orange: 5,
    green: 6,
    violet: 7,
    black: 8,
    strYhellow: 9,
    strBlue: 10,
    strRed: 11,
    strPink: 12,
    strOrange: 13,
    strGreen: 14,
    strViolet: 15,
};

var Player = {
    name: null,
    user: username,
    number: null,
    isStripe: false,
    isSolid: false,
    isActive: false,
    socketId: null,
    room: roomName,
}
var activePlayer = 1;
var madeShot = false;
var missedShot = false;
var pocketBalls = [];

var GameBalls = [];

var socket = io();
socket.emit('joinroom', roomName);

var playerNumber = 0;
var textnode = document.createTextNode("HELLO");

function isInt(i) {
   return i % 1 === 0;
}

Pool.Preloader = function () {};

Pool.Preloader.prototype = {

    init: function () {

        this.input.maxPointers = 1;

        this.scale.pageAlignHorizontally = true;

        this.game.renderer.renderSession.roundPixels = true;

        this.physics.startSystem(Phaser.Physics.P2JS);

    },

    preload: function () {

        this.load.path = 'assets/';

        this.load.bitmapFont('fat-and-tiny');

        this.load.images([ 'logo', 'tableTwo.fw', 'ballContainerTwo', 'rightRectangle', 'leftRectangle', 'cue', 'fill', 'line', 'effectBall', 'effectPointer', 'effectPlus', 'powerMeter', 'powerLevel', 'activePlayerBox', 'activePlayerArrow', 'solidBall', 'stripeBall' ]);

        this.load.spritesheet('balls', 'spriteBalls.png', 24, 24);
        this.load.spritesheet('startBtn','startBtnSheet.png', 67, 28);
        this.load.spritesheet('practiceBtn','practiceBtnSheet.png', 67, 28);
        this.load.spritesheet('standupBtn','standupBtnSheet.png', 67, 28);


        this.load.physics('table');

    },

    create: function () {

        this.state.start('Pool.MainMenu');

    }

};

Pool.MainMenu = function () {};

Pool.MainMenu.prototype = {

    create: function () {

        this.stage.backgroundColor = 0xF8FAF8;

        var logo = this.add.image(this.world.centerX, 140, 'logo');
        logo.anchor.x = 0.5;

        var start = this.add.bitmapText(this.world.centerX, 460, 'fat-and-tiny', 'CLICK TO PLAY', 64);
        start.anchor.x = 0.5;
        start.smoothed = false;
        start.tint = 0xff0000;

        //this.input.onDown.addOnce(this.start, this);
        this.start();
    },

    start: function () {
        
        this.state.start('Pool.Game');
    }
};

Pool.Game = function (game) {

    this.score = 0;
    this.scoreText = null;
    
    this.mode = {
        practice: false,
        multiplayer: false,
        singleplayer: false,
    };

    this.powerText = null;

    this.speed = 0;
    this.allowShotSpeed = 0.01;

    this.balls = null;
    this.pocketBalls = null;
   // this.shadows = null;

    this.cue = null;
    this.fill = null;
    this.fillRect = null;
    this.powerRect = null;
    this.aimLine = null;

    this.line = null; // The sprite line that shows where you are aiming
    this.shootLine = null; // The geometry line that shows aiming, only shows in debug
    this.lineRect = null; // Rectangle to crop line
    this.ray = null;
    this.reflection = null;
    this.hypotenuse = null; // Hypotenuse from cueball to ball the user is pointing at
    this.opposite = null; // Opposite of the hypotenuse, the line used to aim is the adjacent

    this.cueball = null;

    this.resetting = false; // Wether it's resetting because cue ball fell in pocket
    this.firstPlacement = false; // Holds the value if it's the first time you place the cue ball
    this.placeball = null;
   // this.placeballShadow = null;
    this.placeRect = null;
    this.cueballPlaceRect = null;

    this.pauseKey = null;
    this.debugKey = null;

    this.pressedDown = false;
    this.solidOrStripe = '';
    this.id = socket.id;
    this.bitmap = null;
    this.bitmap2 = null;
};

Pool.Game.prototype = {

    init: function () {

        this.score = 0;
        this.speed = 0;
        this.resetting = false;
        this.firstPlacement = false;

    },

    create: function () {
        socket.on('newscore', this.updateScore.bind(this)); // Receives new score through socket
        socket.on('tookShot', this.shotTaken.bind(this));        
        socket.on('placeball', this.placeBallForOtherPlayer.bind(this));
        socket.on('solidstripe', this.setSolidStripe.bind(this));
        socket.on('apControl', this.activePlayerControl.bind(this));
        socket.on('assignNumber', this.assignNumber.bind(this));
        socket.on('ready', this.ready.bind(this));
        socket.on('startgame', this.startReady.bind(this));
        
        this.stage.backgroundColor = 0x001b07;

        this.pocketBalls = this.add.physicsGroup(Phaser.Physics.P2JS);
        this.pocketBalls.enableBodyDebug = Pool.showDebug;

        //  The table
        this.table = this.add.sprite(400, 300, 'tableTwo.fw');

        this.physics.p2.enable(this.table, Pool.showDebug);

        this.table.body.static = true;
        this.table.body.clearShapes();
        this.table.body.loadPolygon('table', 'table');

        this.tableMaterial = this.physics.p2.createMaterial('tableMaterial', this.table.body);
        
        // Active player box        
        this.activePlayerBox = this.add.sprite(0, 100, 'activePlayerBox');        
        this.activePlayerArrow = this.add.sprite(90, 105, 'activePlayerArrow');
        this.solidBall = this.add.sprite(678, 103, 'solidBall');
        this.stripeBall = this.add.sprite(328, 103, 'stripeBall');
        
        // Rectangles, buttons and graphics around the pool table
        this.ballContainer = this.add.sprite(80, 474, 'ballContainerTwo'); // The container the balls go into once you score

        this.rightRect = this.add.sprite(720, 0, 'rightRectangle'); // The right light green rectangle
        this.effectBall = this.add.sprite(725, 100, 'effectBall'); // The white ball on the right side
        this.effectPointer = this.add.sprite(740, 116, 'effectPointer'); // The effect pointer circle
        //this.effectPointer.inputEnabled = true;
        //this.effectPointer.events.onInputDown.add(this.movePlus, this);

        this.effectPlus = this.add.sprite(750, 124, 'effectPlus'); // The plus sign inside the pointer circle
        this.effectPlus.inputEnabled = true;
        this.effectPlus.input.enableDrag();

        this.effect = "none"; //Effect parameter: none, stop, back, left, right
        this.angle = 0; // Holds the original angle of the shot to calculate the effect
        this.firstCollision = 1; // Holds to say if it's the first collision of the cueball
        this.effectSpeed = 0;


        this.powerMeter = this.add.sprite(730, 200, 'powerMeter');
        this.powerLevel = this.add.sprite(733, 442, 'powerLevel');
        this.powerRect = new Phaser.Rectangle(0, 0, 26, 0);
        //this.powerLevel.anchor.setTo(.5, 1);
        //this.powerLevel.anchor.x = 1;
        this.powerLevel.anchor.y = 1;
        this.powerLevel.crop(this.powerRect);

        this.leftRect = this.add.sprite(0, 0, 'leftRectangle'); // The left blue rectagle that holds the buttons
        this.startButton = this.add.button(8, 60, 'startBtn', this.hitPocket, this, 2, 0, 1);
        this.practiceButton = this.add.button(8, 100, 'practiceBtn', this.practiceActivate, this, 2, 0, 1);
        this.standupButton = this.add.button(8, 160, 'standupBtn', this.hitPocket, this, 2, 0, 1);
        //this.startButton.onInputOver(over, this.startButton);


        //  The pockets
        this.pockets = this.add.sprite();

        this.physics.p2.enable(this.pockets, Pool.showDebug);

        this.pockets.body.static = true;

        this.pockets.body.clearShapes();

        this.pockets.body.addCircle(14, 118, 164); // Top left pocket 14
        this.pockets.body.addCircle(10, 400, 152); // Top center pocket 10
        this.pockets.body.addCircle(14, 682, 164); // Top right pocket

        this.pockets.body.addCircle(14, 118, 436); // Bottom left pocket
        this.pockets.body.addCircle(10, 400, 448); // Bottom center pocket
        this.pockets.body.addCircle(14, 682, 436); // Bottom right pocket

        //  Ball shadows
        //this.shadows = this.add.group();

        //  The cushions sit above the shadow layer
        //this.add.sprite(0, 0, 'cushions');

        //  The balls

        this.balls = this.add.physicsGroup(Phaser.Physics.P2JS);
        this.balls.enableBodyDebug = Pool.showDebug;

        this.ballMaterial = this.physics.p2.createMaterial('ballMaterial');

        this.ballCollisionGroup = this.physics.p2.createCollisionGroup();
        this.cueballCollisionGroup = this.physics.p2.createCollisionGroup();

        //  Row 1 (5 balls)

        var y = 250;

        this.makeBall(622, y, Pool.violet);
        this.makeBall(622, y + 26, Pool.red);
        this.makeBall(622, y + 52, Pool.strGreen);
        this.makeBall(622, y + 78, Pool.strViolet);
        this.makeBall(622, y + 104, Pool.strPink);

        //  Row 2 (4 balls)

        y = 263;

        this.makeBall(600, y, Pool.strYhellow);
        this.makeBall(600, y + 26, Pool.orange);
        this.makeBall(600, y + 52, Pool.pink);
        this.makeBall(600, y + 78, Pool.strBlue);

        //  Row 3 (3 balls including black)

        y = 276;
        // x = 264
        this.makeBall(578, y, Pool.strRed);
        this.makeBall(578, y + 26, Pool.black);
        this.makeBall(578, y + 52, Pool.green);

        //  Row 4 (2 balls)

        y = 289;

        this.makeBall(556, y, Pool.blue);
        this.makeBall(556, y + 26, Pool.strOrange);

        //  Row 5 (single red ball)

        this.makeBall(534, 302, Pool.yellow);

        //  The cue ball
        //x = 576, x = 264
        this.cueball = this.makeCueBall(250, 302, Pool.WHITE);
        this.cueball.body.onBeginContact.add(this.hitBall, this);
        this.cueball.inputEnabled = true;
        this.cueball.events.onInputDown.add(this.moveCueBall, this);
        //this.cueball.input.enableDrag();

        //this.cueball.body.createBodyCallback(this.balls, this.hitBall, this);
        //this.cueball.body.collides([this.ballCollisionGroup, this.cueballCollisionGroup]);
        //this.cueball.body.collides(this.ballCollisionGroup, this.hitBall, this);

        //  Our placing cue ball and its shadow
        this.placeball = this.add.sprite(0, 0, 'balls', Pool.WHITE);
        this.placeball.anchor.set(0.5);
        this.placeball.visible = false;

        //this.placeballShadow = this.shadows.create(0, 0, 'balls', 4);
        //this.placeballShadow.anchor.set(0.5);
        //this.placeballShadow.visible = false;

        this.placeRect = new Phaser.Rectangle(138, 182, 526, 236);
        this.cueballPlaceRect = new Phaser.Rectangle(138, 182, 124, 236);

        //  P2 Impact Events

        this.physics.p2.setImpactEvents(true);

        var ballVsTableMaterial = this.physics.p2.createContactMaterial(
            this.ballMaterial, this.tableMaterial);

        ballVsTableMaterial.restitution = 0.6;

        var ballVsBallMaterial = this.physics.p2.createContactMaterial(
            this.ballMaterial, this.ballMaterial);

        ballVsBallMaterial.restitution = 0.9;

        //  The cue
        this.cue = this.add.sprite(0, 0, 'cue');
        this.cue.anchor.y = 0.5;

        this.fill = this.add.sprite(0, 0, 'fill');
        this.fill.anchor.y = 0.5;
        this.fillRect = new Phaser.Rectangle(0, 0, 6, 332);

        this.fill.crop(this.fillRect);

        // Geometry lines, help point cue and shoot line
        this.aimLine = new Phaser.Line(this.cueball.x, this.cueball.y, this.cueball.x, this.cueball.y);
        this.shootLine = new Phaser.Line(this.cueball.x, this.cueball.y, this.cueball.x, this.cueball.y);

        // Shoot line sprite
        this.line = this.add.sprite(0, 0, 'line');
        this.line.anchor.y = 0.5;
        this.line.visible = false;

        //this.physics.p2.enable(this.line, true);
        //this.line.body.setCircle(10);
        //this.line.body.data.shapes[0].sensor = true;
        //this.line.x = 400;
        //this.line.y = 300;
        
        this.lineRect = new Phaser.Rectangle(0, 0, 300, 6);
        this.reflection = new Phaser.Line(0, 0, 0, 0);
        this.hypotenuse = new Phaser.Line(0, 0, 0, 0);
        this.opposite = new Phaser.Line(0, 0, 0, 0);

        this.physics.p2.enable(this.lineRect, false);
        this.lineRect.sensor = false;
        //this.lineRect.body.onBeginContact.add(this.balls, this.lineRect);
        //this.lineRect.body.data.shapes[0].sensor = true;

        //this.lineRect.sensor = true;
        //this.line.crop(this.lineRect);

        //  Score
        this.scoreText = this.add.bitmapText(100, 0, 'fat-and-tiny', 'SCORE: 0', 32);
        this.scoreText.text = "SCORE: " + this.score;
        this.scoreText.smoothed = false;
        
        this.powerText = this.add.bitmapText(728, 450, 'fat-and-tiny', 'POWER', 28);
        
        this.playerNumberText = this.add.bitmapText(590, 0, 'fat-and-tiny', 'PLAYER '+playerNumber, 32);

        this.firstBall = true;
        this.ssText = this.add.bitmapText(590, 30, 'fat-and-tiny', this.solidOrStripe, 28);
        
        this.turnText = this.add.bitmapText(100, 70, 'fat-and-tiny', 'YOUR TURN', 34);
        this.turnText.visible = false;
        
        //  Press P to pause and resume the game
        this.pauseKey = this.input.keyboard.addKey(Phaser.Keyboard.P);
        this.pauseKey.onDown.add(this.togglePause, this);

        //  Press D to toggle the debug display
        this.debugKey = this.input.keyboard.addKey(Phaser.Keyboard.D);
        this.debugKey.onDown.add(this.toggleDebug, this);

        this.input.addMoveCallback(this.updateCue, this); // Updates every frame position of cue
        this.input.onUp.add(this.takeShot, this); // Doesn't shoot until user lets go of mouse button
        this.input.onDown.add(this.pressed, this); // Changes flag if mouse is pressed
        
        this.cue.visible = false;        

        this.bitmap = this.game.add.bitmapData(800, 600);
        this.bitmap.context.fillStyle = 'rgb(255, 255, 255)';
        this.bitmap.context.strokeStyle = 'rgb(255, 255, 255)';
        this.game.add.image(0, 0, this.bitmap);

        this.bitmap2 = this.game.add.bitmapData(800, 600);
        this.bitmap2.context.fillStyle = 'rgb(255, 255, 255)';
        this.bitmap2.context.strokeStyle = 'rgb(255, 255, 255)';
        this.game.add.image(0, 0, this.bitmap2);

        this.ray = new Phaser.Line(this.cueball.x, this.cueball.y, 0, 0);
        this.ray.visible = false;
        
        // Once game starts assign number, socket id and other player information to Player object
        socket.emit('assignNumber', roomName, Player);
        this.okay = 0;
        this.afterShot = 0;                
    },
    
    // Server emits the player info once both have connected to one room
    assignNumber: function(i) {
        Player.name = i.name;
        Player.number = i.number;
        Player.isStripe = i.isStripe;
        Player.isActive = i.isActive;
        Player.socketId = i.socketId;
        this.playerNumberText.text = i.name;
        var gameballs = [];
        for (var i = 0; i < this.balls.length; i++)
        {
            var ball = this.balls.children[i];
            var serverBall = {color: ball.color, isStripe: ball.body.sprite.isStripe, x: ball.x, y: ball.y};
            gameballs.push(serverBall);
            console.log(ball.color);
            console.log(ball.x + " " + ball.y);
            console.log(ball.body.sprite.isStripe);
        }
        socket.emit('ready', roomName, Player, gameballs);
        //this.resetCueBall(true);
    },

    // Both players are ready, Player 1 starts and places cue ball
    ready: function() {
        if (Player.number == 1) {
            Player.isActive = true;
            this.resetCueBall(true);
            // Emit the balls to server
        }
    },
    
    startReady: function() {
      console.log("YO YO YO YO");  
    },
    
    activePlayerControl: function(p) {
        if (p == Player.number){
            this.okay = 0;
            Player.isActive = true;
            if (Player.isStripe){
                this.activePlayerArrow.x = 90;
                this.activePlayerArrow.y = 105;
                this.playerNumberText.x = 180;
                this.playerNumberText.y = 98;
            } else if (Player.isSolid){
                this.activePlayerArrow.x = 480;
                this.activePlayerArrow.y = 105;
                this.playerNumberText.x = 520;
                this.playerNumberText.y = 98;
            }
        } else {
            this.okay = 0;
            if (!Player.isStripe){
                this.activePlayerArrow.x = 90;
                this.activePlayerArrow.y = 105;

            } else if (!Player.isSolid){
                this.activePlayerArrow.x = 480;
                this.activePlayerArrow.y = 105;
            }
            this.cue.visible = false;
            Player.isActive = false;
        }
    },
    
    setSolidStripe: function (type) {
        this.okay = 0;
        if (!Player.isActive) {
            if (type != 'stripe')
            {
                Player.isStripe = true;
                this.playerNumberText.x = 180;
                this.playerNumberText.y = 98; 
                this.ssText.text = 'STRIPE';
            }
            else if (type != 'solid')
            {
                Player.isSolid = true;
                this.playerNumberText.x = 480;
                this.playerNumberText.y = 98;
                this.ssText.text = 'SOLID';
            }
        }
        else if (Player.isActive)
        {
             if (type == 'stripe')
            {
                Player.isStripe = true;
                this.playerNumberText.x = 180;
                this.playerNumberText.y = 98; 
                this.ssText.text = 'STRIPE';
                this.activePlayerArrow.x = 90;
                this.activePlayerArrow.y = 105;
            }
            else if (type == 'solid')
            {
                Player.isSolid = true;
                this.playerNumberText.x = 520;
                this.playerNumberText.y = 98;
                this.ssText.text = 'SOLID';
                this.activePlayerArrow.x = 480;
                this.activePlayerArrow.y = 105;
            }
        }
    },
    
    movePlus : function (sprite, pointer) {
        this.effectPlus.x = pointer.x;
        this.effectPlus.y = pointer.y;
    },

    pressed : function () {
        var x1 = 80; // left x point of table
        var x2 = 720; // right x point of table
        var y1 = 125; // Top y point of table
        var y2 = 475; // Bottom y point of table 
        
        var x = this.input.activePointer.x;
        var y = this.input.activePointer.y;
        
        if (x > x1 && x < x2 && y > y1 && y < y2) {
            this.pressedDown = true;
        }
    },

    practiceActivate : function () {
        this.mode.practice = true;
    },

    moveCueBall : function () {
        if (this.mode.practice){
            this.cue.visible = false;
            this.resetCueBall();
        }

    },

    updateScore: function (score) {
        console.log(score);
        this.score = score;
        this.scoreText.text = "SCORE: " + this.score;
    },

    shotTaken: function (px, py, effect) {
        this.effect = effect;
        console.log(px + " " + py);
        this.cueball.body.applyImpulse([ px, py ], this.cueball.x, this.cueball.y);
    },

    togglePause: function () {

        this.game.paused = (this.game.paused) ? false : true;

    },

    toggleDebug: function () {
        Pool.showDebug = (Pool.showDebug) ? false : true;
        this.state.restart();
    },

    makeBall: function (x, y, color) {
        var ball = this.balls.create(x, y, 'balls', color);
        ball.color = color;
        if (color > 8){
            ball.isStripe = true; // 1 means Ball is stripe
            ball.body.setCollisionGroup(this.ballCollisionGroup);
        } else if (color < 8){
            ball.isStripe = false; // 0 means Ball is not stripe
            ball.body.setCollisionGroup(this.ballCollisionGroup);
        } else{
            ball.isStripe = 8; // 8 for the 8 ball
            ball.body.setCollisionGroup(this.cueballCollisionGroup);
        }
        ball.body.collides([this.cueballCollisionGroup, this.ballCollisionGroup]);
        ball.body.setCircle(12);
        ball.body.fixedRotation = true;
        ball.body.setMaterial(this.ballMaterial);
        ball.body.damping = 0.70;
        ball.body.angularDamping = 0.75;
        ball.body.createBodyCallback(this.pockets, this.hitPocket, this);
        
        return ball;
    },

    makePocketBall: function (x, y, color) {
        var ball = this.pocketBalls.create(x, y, 'balls', color);
        ball.color = color;
        ball.body.setCircle(10);
        ball.body.setMaterial(this.ballMaterial);
        ball.body.fixedRotation = true;
        //ball.body.bounce = 0;
        ball.body.applyImpulse([ -40, 0 ], ball.x, ball.y);
        //ball.body.velocity.x = -55;
        ball.body.damping = 0.70;
        ball.body.angularDamping = 0.75;
        ball.body.onBeginContact.add(this.stopPocketBall, this);
        //ball.body.collides([this.cueballCollisionGroup, this.ballCollisionGroup]);
        /*
        ball.body.setCircle(12);
        ball.body.fixedRotation = true;
        ball.body.setMaterial(this.ballMaterial);
        ball.body.damping = 0.70;
        ball.body.angularDamping = 0.75;
        ball.body.createBodyCallback(this.pockets, this.hitPocket, this);
        */
        return ball;
    },

    stopPocketBall: function(body, bodyB, shapeA, shapeB, equation) {
        if(body){
            //body.setZeroVelocity();
        }
    },

    makeCueBall: function (x, y, color) {
        var ball = this.add.sprite(x, y, 'balls', color);
        this.physics.p2.enable(ball,false);
        ball.body.setCircle(12);
        ball.body.fixedRotation = true;
        ball.body.setMaterial(this.ballMaterial);
        ball.body.damping = 0.70;
        ball.body.angularDamping = 0.75;
        ball.body.createBodyCallback(this.pockets, this.hitPocket, this);
        return ball;
    },

    takeShot: function () {       
        if (this.speed > 0)
        {
            return;
        }
        if(Player.isActive){
            this.afterShot = 1; // Shot was taken, so it is now after the shot
        }
        if (Player.isActive && this.okay == 0 && this.afterShot == 1) // Allow shot if active, okay, and shot's been taken
        {            
            this.okay = 1; // Make it so the player can't shoot until we know he made a shot
            //socket.emit('apControl', Player, "shot");                    
            var upDown = this.effectPlus.y - this.effectBall.y - 24; // The vertical position of the plus
            var leftRight = this.effectPlus.x - this.effectBall.x - 25; // The horizontal position of the plus

            // Set the effect of the shot depending on the plus sign location
            if(upDown > 10 && upDown <= 18 && leftRight < 5 && leftRight > -5){
                this.effect = "stop";
            } else if(upDown > 18 && leftRight < 5 && leftRight > -5){
                this.effect = "back";
            } else if (upDown < -16 && leftRight < 5 && leftRight > -5){
                this.effect = "front";
            }
            else if(leftRight > 12 && upDown < 5 && upDown > -5 ){
                this.effect = "right";
            } else if(leftRight < -12 && upDown < 5 && upDown > -5  ){
                this.effect = "left";
            } else {
                this.effect = "none";
            }
            console.log(this.effect);
            
            var x1 = 80 - 60;
            var x2 = 720 + 60;
            var y1 = 125 - 60;
            var y2 = 475 + 60;
            
            var x = this.input.activePointer.x;
            var y = this.input.activePointer.y;

            if (this.pressedDown == true){
                var relativeSpeed = 0;
                if (this.aimLine.length > 50 && this.aimLine.length < 125) 
                {
                    relativeSpeed = 10;
                } 
                else if (this.aimLine.length > 124 && this.aimLine.length < 130)
                {
                    relativeSpeed = 35;
                } 
                else if (this.aimLine.length > 129)
                {
                    relativeSpeed = 55;    
                }
                
                var speed = ((this.aimLine.length + relativeSpeed) / 2);
                if (speed > 112)
                {
                    speed = 112;
                }
                console.log("RELATIVE SPEED: " + relativeSpeed);
                console.log("LENGTH: " + this.aimLine.length);
                console.log("SPEED: " + speed);
                //this.updateCue();
                //this.pressedDown = false; // Mouse no longer pressed

                var px = (Math.cos(this.aimLine.angle) * speed);
                var py = (Math.sin(this.aimLine.angle) * speed);
                console.log(px + " " + py);
                
                this.angle = this.aimLine.angle;
                if(speed > 10){
                    this.effectSpeed = speed/4;
                } else {
                    this.effectSpeed = speed/4;
                }

                this.cueball.body.applyImpulse([ px, py ], this.cueball.x, this.cueball.y);

                this.speed = 50;

                // Hides cue and aim lines when shot happens
                this.bitmap.context.clearRect(0, 0, this.game.width, this.game.height);
                this.bitmap2.context.clearRect(0, 0, this.game.width, this.game.height);

                this.line.visible = false;
                this.cue.visible = false;
                this.fill.visible = false;
                this.powerRect.height = 0;
                this.powerLevel.updateCrop();
                var emitEffect = this.effect;
                socket.emit('tookShot', px, py, emitEffect, roomName);
                this.firstCollision = 0;
                this.effectPlus.x = this.effectBall.x - 25;
                this.effectPlus.y = this.effectBall.y- 24 ;                
            }
            this.pressedDown = false; // Mouse no longer pressed
        }
    },

    // Function executed when cueball collides with anything
    hitBall: function(body, bodyB, shapeA, shapeB, equation){
        if(body){
            if(body.sprite.key == "balls"){
                this.time.events.add(50, this.doEffect, this);
            } else if(body.sprite.key == "tableTwo.fw"){
                this.time.events.add(50, this.doEffectTable, this);
            }
            var result = "You last hit: " + body.sprite.key;
            console.log(result);
        }
    },

    // This executes the effect
    doEffectTable: function (){
        if (this.firstCollision == 0) {
            this.firstCollision = 1;
            var e = this.effect;
            if (e == "left") {
                var newAngle = this.angle - 2.356;
                var px = (Math.cos(newAngle) * this.effectSpeed);
                var py = (Math.sin(newAngle) * this.effectSpeed);
                this.cueball.body.applyImpulse([px, py], this.cueball.x, this.cueball.y);
            } else if (e == "right") {
                var newAngle = this.angle + 1.08;
                var px = (Math.cos(newAngle) * this.effectSpeed);
                var py = (Math.sin(newAngle) * this.effectSpeed);
                this.cueball.body.applyImpulse([px, py], this.cueball.x, this.cueball.y);
            }
        }
    },

    // This executes the effect
    doEffect: function (){
        if (this.firstCollision == 0) {
            this.firstCollision = 1;
            var e = this.effect;
            if (e == "stop") {
                this.cueball.body.setZeroVelocity();
            } else if (e == "back") {
                var newAngle = this.angle + 3.14;
                var px = (Math.cos(newAngle) * this.effectSpeed);
                var py = (Math.sin(newAngle) * this.effectSpeed);
                this.cueball.body.applyImpulse([px, py], this.cueball.x, this.cueball.y);
            } else if (e == "front") {
                var newAngle = this.angle + 3.14;
                var px = (Math.cos(newAngle) * -this.effectSpeed);
                var py = (Math.sin(newAngle) * -this.effectSpeed);
                this.cueball.body.applyImpulse([px, py], this.cueball.x, this.cueball.y);
            } else if (e == "left") {
                var newAngle = this.angle - 1.5708;
                var px = (Math.cos(newAngle) * this.effectSpeed);
                var py = (Math.sin(newAngle) * this.effectSpeed);
                this.cueball.body.applyImpulse([px, py], this.cueball.x, this.cueball.y);
            } else if (e == "right") {
                var newAngle = this.angle + 1.5708;
                var px = (Math.cos(newAngle) * this.effectSpeed);
                var py = (Math.sin(newAngle) * this.effectSpeed);
                this.cueball.body.applyImpulse([px, py], this.cueball.x, this.cueball.y);
            }
        }
    },

    hitPocket: function (ball, pocket) {
        // Keep track of the balls that hit the pocket in pocketBalls array
        // Once all balls are stopped
        pocketBalls.push(ball.sprite.isStripe);
        
        //  Cue ball reset
        if (ball.sprite === this.cueball)
        {
            this.resetCueBall();
        }
        else
        {             
            this.makePocketBall(150, 495, ball.sprite.color);
            ball.sprite.destroy();

            this.score += 30;
            //socket.emit('newscore', this.score, roomName);
            
            if (this.balls.total === 1)
            {
                this.time.events.add(3000, this.gameOver, this);
            }
        }
    },

    resetCueBall: function (first) {

        this.cueball.body.setZeroVelocity();

        //  Move it to a 'safe' area
        this.cueball.body.x = 16;
        this.cueball.body.y = 16;

        if (first == true) {
            this.firstPlacement = true;
        } else {
            this.resetting = true;    
        }
        
        if (Player.isActive){                              
            this.cueball.visible = false;            
            this.placeball.x = this.input.activePointer.x;
            this.placeball.y = this.input.activePointer.y;
            this.placeball.visible = true;
            
            this.input.onUp.remove(this.takeShot, this);
            this.input.onDown.add(this.placeCueBall, this);
        } else if (!Player.isActive){
            
        }
    },
    
    placeBallForOtherPlayer: function (x, y) {
        if (!Player.isActive){
            this.placeCueBall(x,y);
            //this.cue.visible = false;
        }
    },
    
    placeCueBall: function (x, y) {
        //  Check it's not colliding with other balls
        x = x || this.placeball.x;
        y = y || this.placeball.y;
        var cuex = this.placeball.x;
        var cuey = this.placeball.y;
        if (Player.isActive){
            socket.emit('placeball', cuex, cuey, roomName);
        }                     
        var a = new Phaser.Circle(x, y, 26);
        var b = new Phaser.Circle(0, 0, 26);

        for (var i = 0; i < this.balls.length; i++)
        {
            var ball = this.balls.children[i];

            if (ball.frame !== 2 && ball.exists)
            {
                b.x = ball.x;
                b.y = ball.y;

                if (Phaser.Circle.intersects(a, b))
                {
                    //  No point going any further
                    return;
                }
            }
        }
        
        if (!Player.isActive){
            this.cueball.reset(x, y);
            this.cueball.body.reset(x, y);
            this.cue.visible = false;
        } else {
            this.cueball.reset(this.placeball.x, this.placeball.y);
            this.cueball.body.reset(this.placeball.x, this.placeball.y);
            this.cue.visible = true;  
        }
        //this.cueball.visible = true;
        //this.cueball.shadow.visible = true;

        this.placeball.visible = false;
        //this.placeballShadow.visible = false;

        this.resetting = false;
        this.firstPlacement = false;

        this.input.onDown.remove(this.placeCueBall, this); // Remove on click, place ball
        //this.input.onUp.add(this.takeShot, this);   
        setTimeout(this.allowShots.bind(this), 1000); // One second after ball is placed allow a shot                              
    },
    
    allowShots: function() {
        this.input.onUp.add(this.takeShot, this);   
    },
    
    updateCue: function () {

        this.aimLine.start.set(this.cueball.x, this.cueball.y);
        this.aimLine.end.set(this.input.activePointer.x, this.input.activePointer.y);

        this.shootLine.fromAngle(this.cueball.x, this.cueball.y, this.aimLine.angle + 3.14, 1000);

        // Places the line on the same angle as the shootLine
        this.line.position.copyFrom(this.shootLine.start);
        this.line.rotation = this.shootLine.angle;

        // Clear the bitmap where we are drawing our lines
        this.bitmap.context.clearRect(0, 0, this.game.width, this.game.height);
        this.bitmap2.context.clearRect(0, 0, this.game.width, this.game.height);

        if (this.speed == 0)
        {
                
            // Calculate 
            var rayX = this.cueball.x + 500 * Math.cos(this.shootLine.angle); 
            var rayY = this.cueball.y + 500 * Math.sin(this.shootLine.angle);

            this.ray = new Phaser.Line(this.cueball.x, this.cueball.y, rayX, rayY);
            
            //ray.angle = this.shootLine.angle;
            //var intersect = Phaser.Line.intersects(ray, this.balls.children[0].geo);
            var intersect = this.getIntersect(this.ray);
            
            // Draw a line from the ball to the person
            if (intersect){
                var closestball = this.getNearestBall(intersect);

                var bounceLine = new Phaser.Line(intersect.x, intersect.y-5, intersect.x, intersect.y +5);
                //var bounceCircle = new Phaser.Circle(closestball.x, closestball.y, 10);
                
                // The line from the cueball to the ball being aimed at
                this.hypotenuse = new Phaser.Line(this.cueball.x, this.cueball.y, closestball.x, closestball.y);
                //console.log("Hypotenuse: " + this.hypotenuse.length);
                
                var acuteAngle = this.shootLine.angle - this.hypotenuse.angle;// - this.shootLine.angle;
                var oppositeAngle = this.hypotenuse.angle - this.opposite.angle;
                var oppositeLength = this.hypotenuse.length * Math.sin(acuteAngle);
                var adjacentLength = Math.pow(24,2) - Math.pow(oppositeLength, 2);
                adjacentLength = Math.sqrt(adjacentLength);
                var hypo = 24;
                var bAngle = Math.asin(oppositeLength/24) - this.shootLine.angle;
                bAngle = bAngle - 3.14;// + 6.28319;// - acuteAngle;
                
                // The point where the white guide ball is drawn                              
                var pointContact = new Phaser.Point(closestball.x + Math.cos(bAngle) * hypo, closestball.y - Math.sin(bAngle) * hypo);      
                // Te point where the shot angle line ends
                var angleContact = new Phaser.Point(pointContact.x + Math.cos(bAngle) * hypo, pointContact.y - Math.sin(bAngle) * hypo);
                
                
                var ninetyDegrees = 1.5708;
                if (this.shootLine.angle < this.hypotenuse.angle){
                    ninetyDegrees = ninetyDegrees * -1;
                }
                // The line that creates a 90 degree angle with the shootLine and intersects the hypotenuse
                this.opposite.fromAngle(closestball.x, closestball.y, this.shootLine.angle + ninetyDegrees, 100);
                
                var outgoing = this.ray.reflect(bounceLine);
                //this.reflection.fromAngle(closestball.x, closestball.y, outgoing, 50);
                
                // Draw the line, circle, and line showing predicted trajectory
                this.bitmap.context.beginPath();
                this.bitmap.context.moveTo(this.cueball.x, this.cueball.y);
                this.bitmap.context.lineTo(pointContact.x, pointContact.y);
                this.bitmap.context.moveTo(pointContact.x, pointContact.y);
                this.bitmap.context.lineTo(angleContact.x, angleContact.y);
                
                // TODO: DO math here to know what the x and y of the circle should be                        
                this.bitmap.context.stroke();
                
                
                this.bitmap2.context.beginPath();
                this.bitmap2.context.arc(pointContact.x, pointContact.y, 10, 0, Math.PI*2, true);
                this.bitmap2.context.stroke();
            } else {
                this.bitmap.context.beginPath();
                this.bitmap.context.moveTo(this.cueball.x, this.cueball.y);
                this.bitmap.context.lineTo(rayX, rayY);
                this.bitmap.context.stroke();
            }
        }

        // If mouse isn't pressed, keep cue next to white ball, else follow mouse pointer position
        if (this.pressedDown == false) {
            this.cue.position.copyFrom(this.aimLine.start);
        } else {
            this.cue.x = this.input.activePointer.x;
            this.cue.y = this.input.activePointer.y;
            var relativeSpeed = 0;
            if (this.aimLine.length > 50 && this.aimLine.length < 125) 
            {
                relativeSpeed = 10;
            } 
            else if (this.aimLine.length > 124 && this.aimLine.length < 130)
            {
                relativeSpeed = 35;
            } 
            else if (this.aimLine.length > 129)
            {
                relativeSpeed = 65;    
            }
            this.powerRect.height = this.aimLine.length + relativeSpeed;
            this.powerLevel.updateCrop();
        }
        //this.cue.x = this.input.activePointer.x;
        //this.cue.y = this.input.activePointer.y;
        this.cue.rotation = this.aimLine.angle;

        this.fill.position.copyFrom(this.aimLine.start);
        this.fill.rotation = this.aimLine.angle;

        //this.fillRect.width = this.aimLine.length;
        //this.fill.updateCrop();
        
        this.scoreText.text = "SCORE: " + this.score;

    },

    getIntersect: function (ray) {
        var distanceToWall = Number.POSITIVE_INFINITY;
        var closestIntersection = null;

        // For each of the walls...
        this.balls.forEach(function(ball) {
            // Create an array of lines that represent the four edges of each wall
            var lines = [
                new Phaser.Line(ball.x - 12, ball.y - 12, ball.x - 12 + ball.width, ball.y - 12), // Top wall
                new Phaser.Line(ball.x - 12, ball.y - 12, ball.x - 12, ball.y + ball.height -12 ), // Left wall
                new Phaser.Line(ball.x - 12 + ball.width, ball.y - 12, ball.x - 12 + ball.width, ball.y + ball.height - 12), // Right wall
                new Phaser.Line(ball.x - 12, ball.y - 12 + ball.height, ball.x - 12 + ball.width, ball.y + ball.height - 12) // Bottom wall
            ];
            this.game.debug.geom(lines);
            // Test each of the edges in this wall against the ray.
            // If the ray intersects any of the edges then the wall must be in the way.
            for(var i = 0; i < lines.length; i++) {
                var intersect = Phaser.Line.intersects(ray, lines[i]);
                if (intersect) {
                    // Find the closest intersection
                    distance =
                        this.game.math.distance(ray.start.x, ray.start.y, intersect.x, intersect.y);
                    if (distance < distanceToWall) {
                        distanceToWall = distance;
                        closestIntersection = intersect;
                    }
                }
            }
        }, this);

        return closestIntersection;
    },
    
    getNearestBall: function (intersect) {
        // The color of the
        var closestBall = {color: 0, x:0, y:0}
        var length = 5000;
        var tempLength = 0; 
        this.balls.forEach(function(ball) {
            tempLength = Math.pow((intersect.x - ball.x), 2) + Math.pow((intersect.y - ball.y), 2);
            tempLength = Math.sqrt(tempLength);
            if (tempLength < length){
                length = tempLength;
                closestBall.color = ball.body.color;
                closestBall.x = ball.x;
                closestBall.y = ball.y;
            }
        }, this);
        return closestBall;
    },
    
    checkPocketBalls: function () {
        this.afterShot = 0; // After Shot is now 0, and we will not check the pocket balls any longer.        
        if (pocketBalls.length == 0){
            // No balls got into a pocket, so we change player
            if (Player.isActive){
                //socket.emit('apControl', Player, 'change');    
            }                   
        } else {
            if (Player.isActive){
                pocketBalls.forEach(function(b) { // Check each ball                            
                    if (!b == Player.isSolid && b == Player.isStripe){

                    } else if (Player.isSolid == false && Player.isStripe == false){
                        if(b == false){
                            Player.isSolid = true;
                            //Player.emitting = true;
                            //Player.isActive = true;
                            this.okay = 0;
                            //socket.emit('solidstripe', 'solid', roomName);
                            //this.ssText.text = 'SOLID';
                        } else if (b == true){
                            Player.isStripe = true;
                            //Player.emitting = true;
                            //Player.isActive = true;
                            this.okay = 0;
                            //socket.emit('solidstripe', 'stripe', roomName);
                            //this.ssText.text = 'STRIPE';
                        }
                    } else {
                        // Wrong ball dropped into the 
                        if (Player.isActive){
                            //socket.emit('apControl', Player, 'change');    
                        }
                    }
                });
            }
        }
        this.okay = 0;
        pocketBalls = []; // Empty the pocket balls array
    },
    
    update: function () {
        if (this.speed == 0)
        {            
            if (this.okay > 0 && this.afterShot == 1) // If it's okay and shot's been taken, check the pocket balls
            {
                this.checkPocketBalls();
            }
        }
        
        if (madeShot && this.okay == 0)
        {
            //this.okay++;
            //madeShot = false;
            //this.shotMade();   
        }
        
        if (missedShot) {
            //missedShot = false;
            //setTimeout(this.shotMissed, 1000);
        }
        
        if (this.resetting)
        {
            this.placeball.x = this.math.clamp(this.input.x, this.placeRect.left, this.placeRect.right);
            this.placeball.y = this.math.clamp(this.input.y, this.placeRect.top, this.placeRect.bottom);
           /* this.placeballShadow.x = this.placeball.x + 10;
            this.placeballShadow.y = this.placeball.y + 10;*/
        }
        else if (this.firstPlacement){
            this.placeball.x = this.math.clamp(this.input.x, this.cueballPlaceRect.left, this.cueballPlaceRect.right);
            this.placeball.y = this.math.clamp(this.input.y, this.cueballPlaceRect.top, this.cueballPlaceRect.bottom);
        }
        else
        {
            this.updateSpeed();
            this.updateCue();            
        }

        if (this.checkOverlap(this.effectPointer, this.effectPlus)) {
            //console.log("true");
        }
        else {
            this.effectPlus.input.draggable = false;
            //this.effectPlus.input.enableDrag();
            this.effectPlus.x = 750;
            this.effectPlus.y = 124;
            this.effectPlus.input.draggable = true;
        }
    },
    
    checkOverlap: function (spriteA, spriteB) {
        var boundsA = spriteA.getBounds();
        var boundsB = spriteB.getBounds();

        return Phaser.Rectangle.intersects(boundsA, boundsB);
    },

    checkOverlapBalls: function (spriteA, spriteB) {
        var boundsA = spriteA.getBounds();
        var boundsB = spriteB.getBounds();

        return Phaser.Rectangle.intersects(boundsA, boundsB);
    },

    checkOverlapTable: function (spriteA, spriteB) {
        var boundsA = spriteA.getBounds();
        var boundsB = spriteB.getBounds();

        return Phaser.Rectangle.intersects(boundsA, boundsB);
    },

    updateSpeed: function () {

        this.speed = Math.sqrt(this.cueball.body.velocity.x * this.cueball.body.velocity.x + this.cueball.body.velocity.y * this.cueball.body.velocity.y);
        this.balls.forEach(function(b) {
            var ballSpeed = Math.sqrt(b.body.velocity.x * b.body.velocity.x + b.body.velocity.y * b.body.velocity.y);
            this.speed = this.speed + ballSpeed;
        });
        if (this.speed == 0)
        {
            if (!this.cue.visible)
            {
                // Shows cues and lines once speed is slow enough                
                if (!Player.isActive){
                    this.line.visible = false;
                    this.cue.visible = false;
                } else {
                    this.line.visible = true;
                    this.cue.visible = true;    
                }                
                this.fill.visible = true;                
            }
        }
        else if (this.speed < 3.0)
        {
            this.cueball.body.setZeroVelocity();
        }

    },

    preRender: function () {

       /* this.balls.forEach(this.positionShadow, this);*/

    },

    positionShadow: function (ball) {

       /* ball.shadow.x = ball.x + 4;
        ball.shadow.y = ball.y + 4;*/

    },

    gameOver: function () {

        this.state.start('Pool.MainMenu');

    },

    render: function () {

        if (Pool.showDebug)
        {
            if (this.speed < 6)
            {
                //this.game.debug.geom(this.aimLine);
                this.game.debug.geom(this.shootLine);
                this.game.debug.geom(this.reflection);
                this.game.debug.geom(this.hypotenuse);
                this.game.debug.geom(this.opposite);
            }

            this.game.debug.text("speed: " + this.speed, 540, 24);
            this.game.debug.text("power: " + (this.aimLine.length / 3), 540, 48);
            this.game.debug.text("aAngle: " + (this.aimLine.angle), 540, 72);
            this.game.debug.text("sAngle: " + (this.shootLine.angle), 540, 96);
        }

    }

};

var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'game', null, false, true);

game.state.add('Pool.Preloader', Pool.Preloader);
game.state.add('Pool.MainMenu', Pool.MainMenu);
game.state.add('Pool.Game', Pool.Game);

game.state.start('Pool.Preloader');

