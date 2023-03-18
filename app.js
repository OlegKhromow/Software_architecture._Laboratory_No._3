const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const objectId = require("mongodb").ObjectID;

const app = express();
const jsonParser = express.json();

const mongoClient = new MongoClient("mongodb://127.0.0.1:27017/", { useUnifiedTopology: true });

let dbClient;

app.use(express.static(__dirname + "/public"));

mongoClient.connect(function(err,client) {
    if(err) return console.log(err);
    dbClient = client;
    app.locals.collection = client.db("cinema").collection("sessions");
    app.listen(3000, function(){
        console.log("Сервер очікує підключення...");
    });
});

app.get("/api/sessions", function(req, res){

    const collection = req.app.locals.collection;
    collection.find({}).toArray(function(err, sessions){

        if(err) return console.log(err);
        res.send(sessions)
    });

});
app.get("/api/sessions/:id", function(req, res){

    const id = new objectId(req.params.id);
    const collection = req.app.locals.collection;
    collection.findOne({_id: id}, function(err, sessions){

        if(err) return console.log(err);
        res.send(sessions);
    });
});

app.post("/api/sessions", jsonParser, function (req, res) {

    if(!req.body) return res.sendStatus(400);

    const movieName = req.body.movie;
    const dateM = req.body.date;
    const timeM = req.body.time;
    const session = {movie: movieName, date: dateM, time: timeM};

    const collection = req.app.locals.collection;
    collection.insertOne(session, function(err, result){

        if(err) return console.log(err);
        res.send(session);
    });
});

app.delete("/api/sessions/:id", function(req, res){

    const id = new objectId(req.params.id);
    const collection = req.app.locals.collection;
    collection.findOneAndDelete({_id: id}, function(err, result){
        if(err) return console.log(err);
        let session = result.value;
        res.send(session);
    });
});

app.put("/api/sessions", jsonParser, function(req, res){

    if(!req.body) return res.sendStatus(400);
    const id = new objectId(req.body.id);
    const movieName = req.body.movie;
    const dateM = req.body.date;
    const timeM = req.body.time;

    const collection = req.app.locals.collection;
    collection.findOneAndUpdate({_id: id}, { $set: {movie: movieName, date: dateM, time: timeM}},
        {returnDocument: 'after' },function(err, result){
            if(err) return console.log(err);
            const session = result.value;
            res.send(session);
        });
});

// (ctrl-c)
process.on("SIGINT", () => {
    dbClient.close();
    process.exit();
});
