const assert = require('assert');
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017'; // Connection URL
const dbName = 'Games'; // Database Name

var db;

MongoClient.connect(url,{useNewUrlParser: true}, function(err,client){
    db = client.db(dbName);
    db.Gamedata = db.collection('Gamedata');
});

// 게임 데이터 제공
exports.GameList = function(obj){
    db.Gamedata.findOne(obj.query, function(err,docs){
        if(err){
            console.log(err.message)
        }else{
            obj.callback(docs);
        }
    });
}


// 유저 항목 추가
exports.insertGame = function(insertData){
    db.Gamedata.insertOne({
        title:insertData.title,
        Count: 0,
        SP: 0,
        Participants: []
        },
        function(err, result){
            if(err){
                console.log(err.message)
            }else{
                console.log('data inserted')
            }
        })
}

exports.updateGSP = function(insertData){
    db.Gamedata.updateOne(insertData.title,{
        $set: {SP: this.SP+insertData.SP}
        
    }, (err)=>{
        console.log(err);
    })
}