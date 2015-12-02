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
  socket.on('chat message', function(msg) {
    socket.broadcast.emit('chat message', msg);
  });

  // Socket disconnection execute following function
  socket.on('disconnect', function() {
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


http.listen(process.env.PORT || 5000, function(){
  console.log('listening on *:5000');
});