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
var playerObj;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(__dirname));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/game.html');
});

var numberOfClients = 0; // Keep track of clients connected to socket

// New socket connection
io.on('connection', function(socket){
  // Socket connection successful
  console.log('a user connected '+ socket.id);
  //numberOfClients++; //Increment when user connects
  
  socket.on('assignNumber', function(){
    numberOfClients = users.length;
    var player = new Player('Player ' + (numberOfClients + 1), (numberOfClients + 1), null, null, socket.id);
    if (player.number == 1){
      player.isActive = true;
    } else {
      player.isActive = false;
    }
    users.push(player);
    var i = numberOfClients;
    socket.emit('assignNumber', player);
  });

  // Socket chat message
  socket.on('chat message', function(msg) {
    io.emit('chat message', msg);
  });

  // Socket disconnection execute following function
  socket.on('disconnect', function() {
    numberOfClients--; // Decrement when user disconnects
    console.log("Disconnected from socekt server:" + socket.id);
    var minusPlayer;
    for(var i = 0; i < users.length; i++){
      if(users[i].socketId == socket.id){
        minusPlayer = i;
      }
    }
    users.splice(minusPlayer, 1);    
  });

  // Listen for new score
  socket.on('newscore', function(score) {
    io.emit('newscore', score);
    console.log(score + ' + points');
  });
  
  // Listen for player placing the ball
  socket.on('placeball', function(x, y) {
    io.emit('placeball', x, y);
    console.log("X: " + x + " Y: " + y);
  });

  // Listen for player shooting
  socket.on('tookShot', function(px, py){
    socket.broadcast.emit('tookShot', px, py);
  });
  
  // Set solid or stripe
  socket.on('solidstripe', function(type){
    io.emit('solidstripe', type);
  })
  
  // Change the activeplayer
  socket.on('changeplayer', function(){
    io.emit('changeplayer');
  });
  
  // Hold who the activeplayer is here
  socket.on('apControl', function(player, shot){
    //1. Client will make Player.isActive = false when shot is taken
    //2. Client will send Player object here and sever will hold the activeplayer number
    //3. We will wait to see if that player made a shot with the correct type of ball, if so the client sends the Player object again with description
    // of the shot. 
    //4. We see that a shot was made, we emit back to the player and set Player.isActive back to true.
  }) 
});

////////////////////////////
// Mongo Database Testing //
////////////////////////////
var mongoURL = "mongodb://localhost:27017/local";
MongoClient.connect(mongoURL, function(err, db) {
    if(!err) {
        console.log("Connected to Mongo Local");
    }
});

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
router.get('/login', function(req, res){
  res.status(200).send({message : "HELLO"})
})

//Sign up API, userName and password
router.post('/signupnow', function(req,res){
  console.log(req);
  //res.json({message: req.body});
  var user = req.body.userName;
  var pass = req.body.password;
  var userExists = false;
  //var resultOfInsert = saveNewUser(user, pass);
  MongoClient.connect(mongoURL, function(err, db) {
  if (!err) {
    var users = db.collection("users");
    var cursor = db.collection('users').findOne({ "email" : user});
    cursor.each(function(err, doc){
      assert.equal(err, null);
      if (doc != null) {
        userExists = true;               
      }  
    });
    users.insert({email: user, password: pass}, function createUser (err, result){
        if (err) {
          res.json({Success: false, error: err})           
        }        
        console.log(result);
        res.json({Status: 'Success'});
        //res.sendStatus(200);                  
      });
    }
  })
  //res.json({Status: true});
  //res.sendStatus(200); 
})

// Register our api urls with /api
app.use('/api', router);

http.listen(process.env.PORT || 5000, function(){
  console.log('listening on *:5000');
});


// Player object
function Player(name, number, isStripe, isActive, socketId) {
    this.name = name;
    this.number = number;
    this.isStripe = isStripe;
    this.isActive = isActive;
    this.socketId = socketId;
}