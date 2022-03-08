var http = require('http'); //module for the creation of the server
var fs = require("fs"); //store a CSV with the messages recived, useful for debug
var mysql = require('mysql'); //module to connect with MySQL


//CREATE THE SERVER
http.createServer(function (req, res) {
  var body = "";
  req.on('data', function (chunk) {
    body += chunk;
  });

  req.on('end', function () {
    //body is the JSON sent by the app
    storeToFile(body)
    storeToDB(body)

    //we don't need to respond to the client, but let
    res.writeHead(200);
    res.write("Recived!")
    res.end();
  });
}).listen(8124);


/**
 * STORE THE MESSAGE RECIVED TO A CSV FILE
 * @param pacchetto is the message recived, we need to convert it in a JSON format with (JSON.parse(pacchetto))
 */
function storeToFile(pacchetto) {
    let jsonPack = JSON.parse(pacchetto);
    let strTmp = jsonPack.batteryLevel+","+jsonPack.inCharge+","+jsonPack.name+","+jsonPack.date+","+jsonPack.time+"\n";

    fs.appendFile('dataset.csv',strTmp,function(err){
        if(err){
            console.error(err);
        }
        console.log("Saved");
    });
}

/**
 * STORE THE MESSAGE RECIVED IN THE MYSQL DATABASE (create connection, and make a insert query)
 * @param pacchetto is the message recived, we need to convert it in a JSON format with (JSON.parse(pacchetto))
 */
function storeToDB(pacchetto) {
    let jsonPack = JSON.parse(pacchetto);

    //create the connection
    var con = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "Fixed23!!",
      database: "byce"
    });

    //check the connection
    con.connect(function(err) {
      if (err) throw err;
      console.log("Connected!");

      //connected, so make the query
      var sql = "INSERT INTO Dataset (battery, incharge, name, data, tempo) VALUES (" + jsonPack.batteryLevel+","+jsonPack.inCharge+",'"+jsonPack.name+"','"+jsonPack.date+"','"+jsonPack.time+"');";

      //execute the query
      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
      });
    });

}
