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

var socket = io();

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

        this.load.images([ 'logo', 'tableTwo.fw', 'ballContainer', 'rightRectangle', 'leftRectangle', 'cue', 'fill', 'line', 'effectBall', 'effectPointer', 'effectPlus', 'powerMeter', 'powerLevel' ]);

        this.load.spritesheet('balls', 'spriteBalls.png', 24, 24);

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

        this.input.onDown.addOnce(this.start, this);

    },

    start: function () {

        this.state.start('Pool.Game');

    }

};

Pool.Game = function (game) {

    this.score = 0;
    this.scoreText = null;
    
    this.powerText = null;

    this.speed = 0;
    this.allowShotSpeed = 20.0;

    this.balls = null;
   // this.shadows = null;

    this.cue = null;
    this.fill = null;
    this.fillRect = null;
    this.aimLine = null;
    this.line = null; // The sprite line that shows where you are aiming
    this.shootLine = null; // The geometry line that shows aiming, only shows in debug
    this.lineRect = null; // Rectangle to crop line

    this.cueball = null;

    this.resetting = false;
    this.placeball = null;
   // this.placeballShadow = null;
    this.placeRect = null;

    this.pauseKey = null;
    this.debugKey = null;

    this.pressedDown = false;
    this.id = socket.id;
    // this.socket = io() //io.connect("http://localhost", {port: 5000, transports: ["websocket"]});
    //this.socket.listen(http);

};

Pool.Game.prototype = {

    init: function () {

        this.score = 0;
        this.speed = 0;
        this.resetting = false;

    },

    create: function () {

        this.stage.backgroundColor = 0x001b07;

        //  The table
        this.table = this.add.sprite(400, 300, 'tableTwo.fw');

        this.physics.p2.enable(this.table, Pool.showDebug);

        this.table.body.static = true;
        this.table.body.clearShapes();
        this.table.body.loadPolygon('table', 'tableJson');

        this.tableMaterial = this.physics.p2.createMaterial('tableMaterial', this.table.body);
        
        // Rectangles, buttons and graphics around the pool table
        this.ballContainer = this.add.sprite(80, 476, 'ballContainer'); // The container the balls go into once you score

        this.rightRect = this.add.sprite(720, 0, 'rightRectangle'); // The right light green rectangle
        this.effectBall = this.add.sprite(725, 100, 'effectBall'); // The white ball on the right side
        this.effectPointer = this.add.sprite(740, 116, 'effectPointer'); // The effect pointer circle
        this.effectPlus = this.add.sprite(750, 124, 'effectPlus'); // The plus sign inside the pointer circle
        this.powerMeter = this.add.sprite(730, 200, 'powerMeter');
        this.powerLevel = this.add.sprite(733, 202, 'powerLevel');

        this.leftRect = this.add.sprite(0, 0, 'leftRectangle'); // The left blue rectagle that holds the buttons
        



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
        this.cueball = this.makeBall(250, 302, Pool.WHITE);

        //  Our placing cue ball and its shadow
        this.placeball = this.add.sprite(0, 0, 'balls', Pool.WHITE);
        this.placeball.anchor.set(0.5);
        this.placeball.visible = false;

        //this.placeballShadow = this.shadows.create(0, 0, 'balls', 4);
        //this.placeballShadow.anchor.set(0.5);
        //this.placeballShadow.visible = false;

        this.placeRect = new Phaser.Rectangle(112, 128, 576, 352);

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
        this.fillRect = new Phaser.Rectangle(0, 0, 332, 6);

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

        this.physics.p2.enable(this.lineRect, false);
        this.lineRect.sensor = false;
        //this.lineRect.body.onBeginContact.add(this.balls, this.lineRect);
        //this.lineRect.body.data.shapes[0].sensor = true;

        //this.lineRect.sensor = true;
        this.line.crop(this.lineRect);

        //  Score
        this.scoreText = this.add.bitmapText(100, 0, 'fat-and-tiny', 'SCORE: 0', 32);
        this.scoreText.text = "SCORE: " + this.score;
        this.scoreText.smoothed = false;
        
        this.powerText = this.add.bitmapText(500, 0, 'fat-and-tiny', 'POWER', 32);
        

        //  Press P to pause and resume the game
        this.pauseKey = this.input.keyboard.addKey(Phaser.Keyboard.P);
        this.pauseKey.onDown.add(this.togglePause, this);

        //  Press D to toggle the debug display
        this.debugKey = this.input.keyboard.addKey(Phaser.Keyboard.D);
        this.debugKey.onDown.add(this.toggleDebug, this);

        this.input.addMoveCallback(this.updateCue, this); // Updates every frame position of cue
        this.input.onUp.add(this.takeShot, this); // Doesn't shoot until user lets go of mouse button
        this.input.onDown.add(this.pressed, this); // Changes flag if mouse is pressed

        socket.on('newscore', this.updateScore.bind(this)); // Receives new score through socket
        socket.on('tookShot', this.shotTaken.bind(this));
    },

    pressed : function () {
        this.pressedDown = true;
    },

    updateScore: function (score) {
        console.log(score);
        this.score = score;
        this.scoreText.text = "SCORE: " + this.score;
    },

    shotTaken: function (px, py) {
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

        ball.body.setCircle(12);
        ball.body.fixedRotation = true;
        ball.body.setMaterial(this.ballMaterial);
        ball.body.damping = 0.70;
        ball.body.angularDamping = 0.75;
        ball.body.createBodyCallback(this.pockets, this.hitPocket, this);

        //  Link the two sprites together
      /* var shadow = this.shadows.create(x + 4, y + 4, 'balls', 2);
        shadow.anchor.set(0.5);

        ball.shadow = shadow;*/

        return ball;

    },

    takeShot: function () {

        if (this.speed > this.allowShotSpeed)
        {
            return;
        }

        var speed = (this.aimLine.length / 3);

        if (speed > 112)
        {
            speed = 112;
        }

        //this.updateCue();
        this.pressedDown = false; // Mouse no longer pressed

        var px = (Math.cos(this.aimLine.angle) * speed);
        var py = (Math.sin(this.aimLine.angle) * speed);

        this.cueball.body.applyImpulse([ px, py ], this.cueball.x, this.cueball.y);

        this.speed = 50;

        // Hides cue and aim lines when shot happens
        this.line.visible = false;
        this.cue.visible = false;
        this.fill.visible = false;

        socket.emit('tookShot', px, py);
    },

    hitPocket: function (ball, pocket) {

        //  Cue ball reset
        if (ball.sprite === this.cueball)
        {
            this.resetCueBall();
        }
        else
        {
            /*ball.sprite.shadow.destroy();*/
            ball.sprite.destroy();

            this.score += 30;
            //this.scoreText.text = "SCORE: " + this.score;
            socket.emit('newscore', this.score);
            
            
            if (this.balls.total === 1)
            {
                this.time.events.add(3000, this.gameOver, this);
            }

        }

    },

    resetCueBall: function () {

        this.cueball.body.setZeroVelocity();

        //  Move it to a 'safe' area
        this.cueball.body.x = 16;
        this.cueball.body.y = 16;

        this.resetting = true;

        //  We disable the physics body and stick the ball to the pointer
        this.cueball.visible = false;
       /* this.cueball.shadow.visible = false;*/

        this.placeball.x = this.input.activePointer.x;
        this.placeball.y = this.input.activePointer.y;
        this.placeball.visible = true;

        /*this.placeballShadow.x = this.placeball.x + 10;
        this.placeballShadow.y = this.placeball.y + 10;
        this.placeballShadow.visible = true;*/

        this.input.onUp.remove(this.takeShot, this);
        this.input.onDown.add(this.placeCueBall, this);

    },

    placeCueBall: function () {

        //  Check it's not colliding with other balls

        var a = new Phaser.Circle(this.placeball.x, this.placeball.y, 26);
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

        this.cueball.reset(this.placeball.x, this.placeball.y);
        this.cueball.body.reset(this.placeball.x, this.placeball.y);
        this.cueball.visible = true;
        //this.cueball.shadow.visible = true;

        this.placeball.visible = false;
        //this.placeballShadow.visible = false;

        this.resetting = false;

        this.input.onDown.remove(this.placeCueBall, this);
        this.input.onUp.add(this.takeShot, this);

    },

    updateCue: function () {

        this.aimLine.start.set(this.cueball.x, this.cueball.y);
        this.aimLine.end.set(this.input.activePointer.x, this.input.activePointer.y);

        this.shootLine.fromAngle(this.cueball.x, this.cueball.y, this.aimLine.angle + 3.14, 1000);

        // Places the line on the same angle as the shootLine
        this.line.position.copyFrom(this.shootLine.start);
        this.line.rotation = this.shootLine.angle;

        // If mouse isn't pressed, keep cue next to white ball, else follow mouse pointer position
        if (this.pressedDown == false) {
            this.cue.position.copyFrom(this.aimLine.start);
        } else {
            this.cue.x = this.input.activePointer.x;
            this.cue.y = this.input.activePointer.y;
        }
        //this.cue.x = this.input.activePointer.x;
        //this.cue.y = this.input.activePointer.y;
        this.cue.rotation = this.aimLine.angle;

        this.fill.position.copyFrom(this.aimLine.start);
        this.fill.rotation = this.aimLine.angle;

        this.fillRect.width = this.aimLine.length;
        this.fill.updateCrop();

        this.scoreText.text = "SCORE: " + this.score;

    },

    update: function () {

        if (this.resetting)
        {
            this.placeball.x = this.math.clamp(this.input.x, this.placeRect.left, this.placeRect.right);
            this.placeball.y = this.math.clamp(this.input.y, this.placeRect.top, this.placeRect.bottom);
           /* this.placeballShadow.x = this.placeball.x + 10;
            this.placeballShadow.y = this.placeball.y + 10;*/
        }
        else
        {
            this.updateSpeed();
            this.updateCue();
        }

    },

    updateSpeed: function () {

        this.speed = Math.sqrt(this.cueball.body.velocity.x * this.cueball.body.velocity.x + this.cueball.body.velocity.y * this.cueball.body.velocity.y);

        if (this.speed < this.allowShotSpeed)
        {
            if (!this.cue.visible)
            {
                // Shows cues and lines once speed is slow enough
                this.line.visible = false;
                this.cue.visible = true;
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
                this.game.debug.geom(this.aimLine);
                this.game.debug.geom(this.shootLine);
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

