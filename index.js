var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/game.html');
});


io.on('connection', function(socket){
  // Socket connection successful
  console.log('a user connected');
  // Socket disconnection
  socket.on('disconnect', onSocketDisconnect);

  socket.on('newscore', onNewScore);
});


var setEventHandlers = function () {

  // On socket disconnect
  //socket.on('disconnect', function(){
    //console.log('user disconnected');
  //});

  //socket.on('chat message', function(msg){
    //io.emit('chat message', msg);
    //console.log('message: ' + msg);
  //});

}

// Socket disconnected
function onSocketDisconnect () {
  console.log('Disconnected from socket server')
}

// New score
function onNewScore (score) {
  io.emit('newscore', score);
  //this.scoreText.text = "SCORE: " + this.score;
  console.log(score + ' + points');
}


http.listen(process.env.PORT || 5000, function(){
  console.log('listening on *:5000');
});