var express = require('express');
var app = require('express')();
var router = express.Router();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var io = require('socket.io')(http);
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var users = [];
var activeplayer = 1;
var allowPlayer = 0; // Add to this variable when shot is taken and ball hits pocket
var playerObj;
var rooms = [];
var games = [];
/*
Game consists of:
array of current balls and room name
Game = balls:[], roomName, 
*/

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(__dirname));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/game.html');
});

var numberOfClients = 0; // Keep track of clients connected to socket

////////////////////////////
// Mongo Database Testing //
////////////////////////////
//var mongoURL = "mongodb://localhost:27017/local";
var mongoURL = "mongodb://user:user@ds025792.mlab.com:25792/survey_info";
MongoClient.connect(mongoURL, function(err, db) {
    if(!err) {
        console.log("Connected to Mongo Local");
    }
    if(err) {
      console.log(err);
    }
});

// New socket connection
io.on('connection', function(socket){
  // Socket connection successful
  console.log('a user connected '+ socket.id);
  //numberOfClients++; //Increment when user connects
  
  socket.on('assignNumber', function(roomName, playerClient){
    numberOfClients = numberOfClients++;
    MongoClient.connect(mongoURL, function(err, db) {
      if(!err){
        var rooms = db.collection("rooms");
        rooms.findOne({"room" : roomName}, function findRoom (err, roomItem) {
          if (err) {
            console.log("Mongo error: " + err);
            //res.status(409).send({Message: "Room name already exists."});
          }
          if (roomItem) {
            console.log("Adding user to room");
            var playerNumber = "";
            var canSet = true;

            // Check if the user is already in this room
            if (roomItem.playerOne == playerClient.user || roomItem.playerTwo == playerClient.user) {
              console.log("This user is already in this room");
              canSet = false;
              if (roomItem.playerOne == playerClient.user){
                var player = new Player('Player 1', playerClient.user, 1, false, false, false, socket.id); 
                socket.emit('assignNumber', player);
              } else {
                var player = new Player('Player 2', playerClient.user, 2, false, false, false, socket.id); 
                socket.emit('assignNumber', player);
              }
            }
            // If user is not part of the room yet assign the user to a room
            if (canSet == true) {
              // TODO: Make this if statement just one rooms.update by using a variable in $set
              if (roomItem.playerOne == null) { // No users in room, set player one
                rooms.update({"room":roomName}, {$set: {"playerOne": playerClient.user}}, function createRoom (err, result){
                  if (err) {
                    //TODO: do something with error
                  }
                  console.log(result);
                  // Create user and emit user back to player
                  var player = new Player('Player 1', playerClient.user, 1, false, false, false, socket.id);
                  socket.emit('assignNumber', player);
                });
              } else if (roomItem.playerTwo == null) { // One user in room, set player two
                rooms.update({"room":roomName}, {$set: {"playerTwo": playerClient.user}}, function createRoom (err, result){
                  if (err) {
                    //TODO: do something with error
                  }
                  console.log(result);
                  var player = new Player('Player 2', playerClient.user, 2, false, false, false, socket.id); 
                  socket.emit('assignNumber', player);
                });
              } else {
                console.log("Room is full");
              }
            }
          }
        })
      }
    })
  });

  // Both players are in the room and ready to play 
  socket.on('ready', function(room, player, balls){
    if (player.number == 2) {
      console.log(balls);
      games.push({room: room, balls: balls});
      io.to(room).emit('ready');  
    }
  });
  
  // Compare the state of the server and client games
  socket.on('compareState', function(room, player, balls){
    var serverGame = games.filter(function (obj) {
      return obj.room === room;
    });
    console.log(serverGame);
    var serverBalls = serverGame[0].balls;
    
    // Same amount of balls, switch player
    if (serverBalls.length == balls.length){
      // Still the same number of balls, change activeplayer
      io.to(room).emit('changePlayer', player.number); 
      console.log(Player.user + " " + "didn't make a shot");
    }
    
    // Different amount of balls
    if (serverBalls.length != balls.length){
      // The number of balls in the server and client are different
      console.log(Player.user + " " + "made a shot");
      
      var missingBalls = []; // Array that holds which balls are no longer on the client side
      var stripeCount = 0;
      var solidCount = 0;      
      // Serverballs length is 15 so you need to set the isStripe flag on both users
      if (serverBalls.length == 15){        
        for (var i = 0; i < serverBalls.length; i++){
          var missingBallColor = null; // Hold the color of the server ball
          var check = balls.filter(function (obj) {
            missingBallColor = serverBalls[i].color
            return obj.color === serverBalls[i].color;
          });
          
          // If client ball is missing check if the ball isStripe
          if (check.length == 0){
            var findBall = serverBalls.filter(function (obj) {           
              return obj.color === missingBallColor;
            });
            missingBalls.push(findBall[0]);
          }
          console.log(check);
        }
        
        // If client ball is missing check if the ball isStripe        
        for (var i=0; i < missingBalls.length; i++){
          if (missingBalls[i].isStripe == false){
            solidCount++;            
          } else {
            stripeCount++;
          }          
        }

        // Stripe count or solid count is 0 assign isStripe to player 
        if (solidCount == 0){
          // Emit isStripe = true to the player
          io.to(room).emit('solidstripe', player.number, 'stripe');
          io.to(room).emit('dontChangePlayer', player.number);
        }
        if (stripeCount == 0){
          // Emit isStripe = false to the player
          io.to(room).emit('solidstripe', player.number, 'solid');
          io.to(room).emit('dontChangePlayer', player.number);
        }
        
        // If both solids and stripes made it into the pockets
        if (solidCount > 0 && stripeCount > 0){
          io.to(room).emit('solidstripe', player.number, 'solid');
          // Two balls fell so change player
          io.to(room).emit('changePlayer', player.number);
        }       
      }
      
      // Serverballs length is less than 15, compare the arrays      
      if (serverBalls.length < 15){
        for (var i = 0; i < serverBalls.length; i++){
          var missingBallColor = null; // Hold the color of the server ball
          var check = balls.filter(function (obj) {
            missingBallColor = serverBalls[i].color
            return obj.color === serverBalls[i].color;
          });
          
          // If client ball is missing check if the ball isStripe
          if (check.length == 0){
            var findBall = serverBalls.filter(function (obj) {           
              return obj.color === missingBallColor;
            });
            missingBalls.push(findBall[0]);
          }
          console.log(check);
          
          var playertype = !player.isStripe;
          // See if there's a ball in the pocket that the isn't the players type, stripe/solid
          var findDifferentBall = missingBalls.filter(function (obj) {           
            return obj.isStripe === playertype;
          });
          
          if (findDifferentBall.length > 0){
            // Change players
            io.to(room).emit('changePlayer', player.number);
          } else {
            // Dont change player
            io.to(room).emit('dontChangePlayer', player.number); 
          }
                   
          for (var i=0; i < missingBalls.length; i++){
            if (missingBalls[i].isStripe == true){
              solidCount++;            
            } else {
              stripeCount++;
            }          
          }                  
        }                
      }
      
      serverGame[0].balls = balls;
    }
  });
  
  // Save balls for the room
  socket.on('startgame', function(room, balls){
    console.log("Stop");
  });
  
  // Assign room
  socket.on('joinroom' , function(room, player) {
    console.log("User joined room: " + room);
    socket.join(room);
    //socket.room = room;
  });
  
  // Socket chat message
  socket.on('chat message', function(msg, room, username) {
    var message = username + " " + msg;
    io.to(room).emit('chat message', message);
    //io.emit('chat message', msg);
  });

  // Socket disconnection execute following function
  socket.on('disconnect', function() {    
    console.log("Disconnected from socekt server:" + socket.id);
    var minusPlayer;
    for(var i = 0; i < users.length; i++){
      if(users[i].socketId == socket.id){
        minusPlayer = i;
      }
    }
    users.splice(minusPlayer, 1);
    numberOfClients = users.length; // Decrement when user disconnects    
  });

  // Listen for new score
  socket.on('newscore', function(score, room) {
    io.to(room).emit('newscore', score);
    console.log(room + " " + score + ' + points');
  });
  
  // Listen for player placing the ball
  socket.on('placeball', function(x, y, room) {
    //io.emit('placeball', x, y);
    if (room == "")
    {
       io.emit('placeball', x, y); 
    }
    else
    {
        io.to(room).emit('placeball', x, y);
    }
    console.log("X: " + x + " Y: " + y);
  });

  // Listen for player shooting
  socket.on('tookShot', function(px, py, effect, room){
    socket.broadcast.to(room).emit('tookShot', px, py, effect);
  });
  
  // Set solid or stripe
  socket.on('solidstripe', function(type, room){
    io.to(room).emit('solidstripe', type);
  })
  
  // Hold who the activeplayer is here
  socket.on('apControl', function(player, shot){
    //1. Client will make Player.isActive = false when shot is taken
    //2. Client will send Player object here and server will hold the activeplayer number
    /*if (player.number == activeplayer){
      //activeplayer = player.number;
      if (player.number == 1){
        activeplayer = 2;
      } else {
        activeplayer = 1;
      }
      io.emit('apControl', activeplayer);
    }*/
    console.log("Player number: " + player.number);
    console.log("Active Player: " + activeplayer);
    if (player.number == activeplayer)
    {  
      if (shot == "change") { // Shot was taken, we will wait to see if a ball hits the pocket  
        //activeplayer = player.number;
        if (player.number == 1){
            activeplayer = 2;
        } else {
            activeplayer = 1;
        }
        io.to(player.room).emit('apControl', activeplayer);
      }              
    }
    
    //3. We will wait to see if  that player made a shot with the correct type of ball, if so the client sends the Player object again with description
    // of the shot.
    
    //4. We see that a shot was made, we emit back to the player and set Player.isActive back to true.
    
  }) 
});



// APIs
function saveNewUser(user, pass) {  
  MongoClient.connect(mongoURL, function(err, db) {
  if (!err) {
    var users = db.collection("users")
    users.insert({email: user, password: pass}, function(err, result){
        if (err) {
          return err; 
        }        
        console.log(result);
        return this.result;          
      });
    } 
  })   
}

// API Example: localhost:5000/api
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

// Stuff
router.post('/login', function(req, res){
  var user = req.body.userName;
  var pass = req.body.password;
  MongoClient.connect(mongoURL, function(err, db) {
    if (!err) {
      var users = db.collection("users");
      users.findOne({"email" : user}, function findUser (err, usersItem){ // Find the user
        if (err) {
          console.log("Mongo error: " + err);
        }
        console.log(usersItem);        
        if (usersItem) { //If user is found       
          if (usersItem.password == pass) { // compare the password and the hash in mongo           
              res.status(200).send({Status: 'Success', Username: user});
            } else {
               res.status(401).send({Message: 'Password is incorrect'});
            }
        } else {
          res.status(404).send({Message: 'Username does not exist'});
        }
      }); 
    }
  });
})

//Sign up API, userName and password
router.post('/signupnow', function(req,res){
  console.log(req);
  //res.json({message: req.body});
  var user = req.body.userName;
  var pass = req.body.password;
  // var userExists = false;
  //var resultOfInsert = saveNewUser(user, pass);
  MongoClient.connect(mongoURL, function(err, db) {
    if (!err) {
      var users = db.collection("users");
      users.findOne({"email" : user}, function findUser (err, usersItem){
        if (err) {
          console.log("Mongo error: " + err);
        }
        if (!usersItem) {
          console.log("User not found, creating new user");
          users.insert({email: user, password: pass}, function createUser (err, result){
            if (err) {
              res.status(500).send({Status: error, error: err});
            }
            console.log(result);
            res.status(200).send({Status: 'Success'});
          });
        }  
      })
    }  
  }) 
})

// Create a room in the rooms collection 
router.post('/createroom', function(req,res){
  var roomName = req.body.roomName;
  var username = req.body.username;
  console.log(roomName);
  MongoClient.connect(mongoURL, function(err, db) {
    if(!err){
      var rooms = db.collection("rooms");
      rooms.findOne({"room" : roomName}, function findRoom (err, roomItem) {
        if (err) {
          console.log("Mongo error: " + err);
          res.status(409).send({Message: "Room name already exists."});
        }
        if (!roomItem) {
          console.log("Room name not found, creating a new room");
          rooms.insert({room:roomName, createdBy: username, playerOne : null, playerTwo : null}, function createRoom (err, result){
            if (err) {
              res.status(500).send({Status: error, error: err});
            }
            console.log(result);
            res.status(200).send({Status: 'Successfully Created Room'});
          });
        }
      })
    }
  })
})

router.put('/updateroom', function(req, res){
  var roomName = req.body.roomName
})

// Register our api urls with /api
app.use('/api', router);

http.listen(process.env.PORT || 5000, function(){
  console.log('listening on *:5000');
});


// Player object
function Player(name, user, number, isStripe, isSolid, isActive, isCurrent, socketId) {
    this.name = name;
    this.user = user;
    this.number = number;
    this.isStripe = isStripe;
    this.isSolid = isSolid;
    this.isActive = isActive;
    this.isCurrent = isCurrent;
    this.socketId = socketId;
}