var mongoose = require('mongoose');
var bodyParser = require("body-parser");
var express = require("express");
var app = express();


var PORT = 45050;

app.use("/", express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/gamedata", {
    useNewUrlParser: true
});


var gameSchema = new mongoose.Schema({
    nickname: String
});
var User = mongoose.model("User", gameSchema);














app.post("/addNickname", (req, res) =>{
    var playerNickname = new User(req.body.pickName);
    playerNickname.save()
    .then(item => {
        console.log("nickname created")
        res.send("item saved to database");

    })
    .catch(err => {
        res.status(400).send("unable to save to database");
    });
});









app.listen(PORT, function () {
    console.log("server is up and running using port " + PORT)
});