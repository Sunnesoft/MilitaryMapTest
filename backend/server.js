console.log('Запуск сервера...')

var WebSocketServer = new require('ws');

// подключенные клиенты
var clients = {};

var mongoose  = require('mongoose');
var db        = mongoose.connect('mongodb://localhost/mapstorage');
var oppull    = new require('./operation.js');

oppull.register('hi',function(data,client){
  client.appLocalData = {};
  client.appLocalData.token = new require('./token.js');
  client.appLocalData.token.parse(data);

  console.log(client.appLocalData.token.getRole());
});

// WebSocket-сервер на порту 8081
var webSocketServer = new WebSocketServer.Server({port: 8081});
webSocketServer.on('connection', function(ws) {

  var id = Math.random();
  clients[id] = ws;
  console.log("новое соединение " + id);

  ws.on('message', function(message) {
    console.log('получено сообщение ' + message);

    oppull.run('hi',message,ws);

    for(var key in clients) {
      clients[key].send(message);
    }
  });

  ws.on('close', function() {
    console.log('соединение закрыто ' + id);
    delete clients[id];
  });

});

    // var Map = require('./models.js').Map(db);

    // Map.create({ title: message, targets: [{target_id:0,pos:{x:10,y:2}}] }, function (err, map) {
    //   if (err) 
    //   {
    //     console.log(err);
    //     return;
    //   }

    //   Map.find({title:message}, function (err, docs) {
    //     if (err) 
    //     {
    //       console.log(err);
    //       return;
    //     }

    //     console.log(docs)
    //   });
    // });
