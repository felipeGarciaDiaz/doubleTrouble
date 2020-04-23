var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);


var PORT = 3332;

app.use("/", express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


mongoose.connect("mongodb://localhost/playerDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
var db = mongoose.connection;
db.once('open', function(cb) {
    console.log("connection established");

});



io.on('connection', function(socket) {
    console.log('user connected ' + socket.id + " ip " + socket.conn.remoteAddress);

    socket.on("chooseName", function(newName) {

        var data = {
            nickname: newName.toUpperCase(),
            highscore: 0
        };
        db.collection('playerStats').findOne({nickname: data.nickname }, function(err, doc) {
            if(err) throw err;

            if(doc) {
                io.to(socket.id).emit('nnError', 1);
            } else if( !newName.match(/^[a-z0-9]+$/i)) {
                io.to(socket.id).emit('nnError', 2);
            } else if (newName.length > 15) {
                io.to(socket.id).emit('nnError', 3);
            }else{
                db.collection('playerStats').insertOne(data, function(err) {
                    console.log(doc + "  |}}}}  " + JSON.stringify(data.nickname));

                    if(err) throw err;
                    console.log('rec estab');
                    io.to(socket.id).emit("newNickname", null);
                });
            }

        });
    });

    socket.on('player', function (player) {

        socket.on('highscore', function (hs) {
            console.log(player.toUpperCase() + ": " + hs);
            db.collection('playerStats').findOne({nickname: player.toUpperCase()}, function (err) {
                console.log('found player');

                if(err) throw err;
                db.collection('playerStats').updateOne({nickname: player.toUpperCase()}, {$set: {highscore: hs}});
                console.log('highscore updated');
            });
        });

    });

    var dbOverflow = false;
    socket.on('hsGo', function() {
        if(dbOverflow === false) {
            db.collection('playerStats')
                .find({}, {projection: {_id: 0}})
                .sort({highscore : -1})
                .limit(100).toArray()
                .then(function (doc) {
                    io.to(socket.id).emit('topPlayers', doc);
                    dbOverflow = true;
                });
        }
    });
});




http.listen(PORT, function () {
    console.log("server is up and running using port " + PORT);
});
