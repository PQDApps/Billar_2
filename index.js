var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/game.html');
});

// New socket connection
io.on('connection', function(socket){
  // Socket connection successful
  console.log('a user connected '+ socket.id);

  // Socket chat message
  socket.on('chat message', onChatMessage);

  // Socket disconnection execute following function
  socket.on('disconnect', onSocketDisconnect);

  // Listen for new score
  socket.on('newscore', onNewScore);

  // Listen for player shooting
  socket.on('tookShot', onShot);
});


// On chat message 
function onChatMessage (msg) {
  io.emit('chat message', msg);
}

// Socket disconnected
function onSocketDisconnect () {
  console.log('Disconnected from socket server')
}

// New score
function onNewScore (score) {
  io.emit('newscore', score);
  console.log(score + ' + points');
}

//Took shot
function onShot (px, py) {
  io.emit('tookShot', px, py);
  //console.log( px + ' + ' + py);
}


http.listen(process.env.PORT || 5000, function(){
  console.log('listening on *:5000');
});