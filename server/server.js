var http = require('http');
var fs = require("fs");
const { Pool, Client } = require('pg')
var mysql = require('mysql');


http.createServer(function (req, res) {
  var body = "";
  req.on('data', function (chunk) {
    body += chunk;
  });
  req.on('end', function () {
    storeToFile(body)
    smistaDati(body)

    res.writeHead(200);
    res.write("HEYY"+body)
    res.end();
  });
}).listen(8124);

function storeToFile(pacchetto) {
    jsonPack = JSON.parse(pacchetto);
    strTmp = jsonPack.batteryLevel+","+jsonPack.inCharge+","+jsonPack.name+","+jsonPack.date+","+jsonPack.time+"\n";
    
    fs.appendFile('dataset.csv',strTmp,function(err){
        if(err){
            console.error(err);
        }
        console.log("Saved");
    });

}

function smistaDati(pacchetto) {
    console.log(JSON.parse(pacchetto))


    var con = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "Fixed23!!",    
      database: "byce"
    });

    con.connect(function(err) {
      if (err) throw err;
      console.log("Connected!");

      var sql = "INSERT INTO Dataset (battery, incharge, name, data, tempo) VALUES (64,true,'AlbyAndroid','2022/03/08','12:34');"

      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
      });
    });

}
