var express = require('express');
var app = require('express')();
var router = express.Router();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var io = require('socket.io')(http);
var MongoClient = require('mongodb').MongoClient;

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
  numberOfClients++; //Increment when user connects

  socket.on('assignNumber', function(){
    var i = numberOfClients;
    socket.emit('assignNumber', i);
  });

  // Socket chat message
  socket.on('chat message', function(msg) {
    io.emit('chat message', msg);
  });

  // Socket disconnection execute following function
  socket.on('disconnect', function() {
    numberOfClients--; // Decrement when user disconnects
    console.log("Disconnected from socekt server");
  });

  // Listen for new score
  socket.on('newscore', function(score) {
    io.emit('newscore', score);
    console.log(score + ' + points');
  });

  // Listen for player shooting
  socket.on('tookShot', function(px, py){
    socket.broadcast.emit('tookShot', px, py);
    //console.log( px + ' + ' + py);
  });
});

///////////////////////////
// Mongo Database Testing
///////////////////////////
var mongoURL = "mongodb://192.168.1.64:27017/local";
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
        if (err) throw err;
        console.log(result);          
      });
    } 
  })   
}

// API Example: localhost:5000/api
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

//Sign up API, userName and password
router.post('/signupnow', function(req,res){
  console.log(req);
  res.json({message: req.body});
  var user = req.userName;
  var pass = req.password;
  saveNewUser(user, pass);
})

// Register our api urls with /api
app.use('/api', router);

http.listen(process.env.PORT || 5000, function(){
  console.log('listening on *:5000');
});