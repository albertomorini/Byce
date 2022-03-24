var https = require('https'); //module for the creation of the server
var fs = require("fs"); //store a CSV with the messages recived, useful for debug
var mysql = require('mysql'); //module to connect with MySQL
var crypto = require('crypto'); //module to get MD5 of password

var options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
}

/**
 * check if the password provided is correct
 * retrive the MD5 of the password stored into file
 * @param  {[String]} password   the password provided by the client
 * @return {[Promise]} return a Promise with the result of the password (true or false)
 */
function checkPsw(password){

    //create the MD5 of the password provided by the client
    let hash = crypto.createHash('md5').update(password).digest('hex');

    return new Promise((resolve,reject)=>{
        fs.readFile('pswMD5.txt', function(err,data){
            if (err) {
                reject(err)
            }else{
                if(hash.trim()==data.toString()){
                    console.log("--->password corretta");
                    resolve(true)
                }else{
                    console.log("--->password sbagliata");
                    resolve(false)
                }
            }
        });
    });
}


//AUTH SERVER-> check if password is correct and replay to client true (or false) as string
https.createServer(options,function(req,res){
    var body = "";
        req.on('data', function (chunk) {
        body += chunk;
    });

    req.on('end', () => {
        console.log("AUTH: ");
        //convert the message into a JSON
        jsonPack = JSON.parse(body)
        checkPsw(jsonPack.password).then(resPsw=>{
            res.write(resPsw.toString())
            res.end()
        }).catch(err=>{
            console.log("Error reading password's file");
        });
    });
}).listen(8127);


//STORING SERVER -> get the data (check the password) and store the data into CSV/DB
https.createServer(options,function (req, res) {

    var body = "";
        req.on('data', function (chunk) {
        body += chunk;
    });

    req.on('end', () => {
        console.log("DATA:");
        //convert the message into a JSON
        jsonPack = JSON.parse (body)
        checkPsw(jsonPack.password).then(resPsw=>{
            if(resPsw){
                storeToFile(jsonPack)
                storeToDB(jsonPack)
            }
        }).catch(err=>{
            console.log("Error reading password's file");
        });
        //we don't have to respond to the client here
    });

}).listen(8124);

/**
 * STORE THE MESSAGE RECIVED TO A CSV FILE
 * @param  {[JSON]} jsonPack              the json of the message recived
 */
function storeToFile(jsonPack) {
    let strTmp = jsonPack.batteryLevel+","+jsonPack.inCharge+","+jsonPack.name+","+jsonPack.date+","+jsonPack.time+"\n";

    fs.appendFile('dataset.csv',strTmp,function(err){
        if(err){
            console.error(err);
        }
    });
}

/**
 * STORE THE MESSAGE RECIVED IN THE MYSQL DATABASE (create connection, and make a insert query)
 * @param  {[JSON]} jsonPack              the json of the message recived
 */
function storeToDB(jsonPack) {

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

      //connected, so make the query
      var sql = "INSERT INTO Dataset (battery, incharge, name, data, tempo) VALUES (" + jsonPack.batteryLevel+","+jsonPack.inCharge+",'"+jsonPack.name+"','"+jsonPack.date+"','"+jsonPack.time+"');";

      //execute the query
      con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("SUCCESS: info stored to db");
      });
    });
}
