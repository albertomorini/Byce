var https = require('https'); //module for the creation of the server
var fs = require("fs"); //store a CSV with the messages received, useful for debug
var mysql = require('mysql'); //module to connect with MySQL
var crypto = require('crypto'); //module to get MD5's hash of password sent by client

//Loading of the self-signed certified in way to create HTTPS server.
var options = {
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem')
}

/**
 * Check if the hash of password provided by client is the same of the one stored into './pswMD5.txt'
 * @param  {[String]} password the password provided by the client
 * @return {[Promise]} return a Promise with the result of the password (true or false)
 */
function checkPsw(password){

    //hash the password provided
    let hash = crypto.createHash('md5').update(password).digest('hex');

    return new Promise((resolve,reject)=>{
        fs.readFile('pswMD5.txt', function(err,data){
            if (err) {
                reject(err);
            }else{
                if(hash==data.toString()){
                    console.log("--->password corretta");
                    resolve(true);
                }else{
                    console.log("--->password sbagliata");
                    resolve(false);
                }
            }
        });
    });
}


//(AUTH SERVER)@8127 -> check if password is correct and respond to client (true or false)
https.createServer(options,function(req,res){
    var body = "";
        req.on('data', function (chunk) {
        body += chunk;
    });

    req.on('end', () => {
        console.log("AUTH: ");
        //convert the message into a JSON
        jsonPack = JSON.parse(body);
        checkPsw(jsonPack.password).then(resPsw=>{
            res.write(resPsw.toString()); //we can't send boolean, need to cast it into string
            res.end();
        }).catch(err=>{
            console.log("Error reading password's file");
        });
    });
}).listen(8127);


//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////


//(STORING SERVER)@8124 -> get the data (check the password) and store the data into CSV/DB
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
                storeToFile(jsonPack);
                storeToDB(jsonPack);
            }
        }).catch(err=>{
            console.log("Error reading password's file");
        });

        //we don't have to respond to the client here
    });

}).listen(8124);

/**
 * Store data received into a CSV file
 * @param  {[JSON]} jsonPack the json of the message
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
 * Store data into a MySQL database (create connection, and make a insert query)
 * @param  {[JSON]} jsonPack  the json of the message
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
