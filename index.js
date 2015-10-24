var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname));
app.get('/', function(req, res){
  res.sendFile(__dirname + '/game.html');
});


io.on('connection', function(socket){
  // a socket just connected
  console.log('a user connected');

  // On socket disconnect
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });


  //socket.on('chat message', function(msg){
    //io.emit('chat message', msg);
    //console.log('message: ' + msg);
  //});
});


http.listen(process.env.PORT || 5000, function(){
  console.log('listening on *:5000');
});