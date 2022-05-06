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
                    resolve(true);
                    console.log("\t [correct password]");
                }else{
                    console.log("\t [wrong password]");
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
        dataPack = JSON.parse(body);
        checkPsw(dataPack.password).then(resPsw=>{
            registerDevice(dataPack);
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
        dataPack = JSON.parse (body)
        checkPsw(dataPack.password).then(resPsw=>{
            if(resPsw){
                storeDataToFile(dataPack);
                storeDataToDB(dataPack);
            }
        }).catch(err=>{
            console.log("Error reading password's file");
        });

        //we don't have to respond to the client here
    });

}).listen(8124);

/**
 * Store data received into a CSV file
 * @param  {[JSON]} dataPack the json of the message
 */
function storeDataToFile(dataPack) {
    let strTmp = dataPack.batteryLevel+","+dataPack.inCharge+","+dataPack.name+","+dataPack.date+","+dataPack.time+"\n";

    fs.appendFile('dataset.csv',strTmp,function(err){
        if(err){
            console.error(err);
        }
    });
}


/**
 * Store data into a MySQL database (create connection, and make a insert query)
 * @param  {[JSON]} dataPack  the json of the message
 */
function storeDataToDB(dataPack){

    //create the connection
    var con = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "Fixed23",
      database: "BYCE"
    });

    //check the connection
    con.connect(function(err) {
      if (err) throw err;

      //connected, make the query
      var sql = "INSERT INTO DATALOG(UID,LOG_DATE,LOG_TIME,BAT_LEVEL,INCHARGE) VALUES ('" + dataPack.UID+"','"+dataPack.LOG_DATE+"','"+dataPack.LOG_TIME+"',"+dataPack.BAT_LEVEL+","+dataPack.INCHARGE+");";

      //execute the query
      con.query(sql, function (err, result) {
        if (!err){
            console.log("SUCCESS: info stored to db");
        }else{
            console.log(err);
        };
      });
    });
}

/**
 * Register new device into a MySQL database (create connection, and make a insert query)
 * If the device already exists will be ignored the error (of duplicate key) message.
 * TODO: stored procedure
 * @param  {[JSON]} dataPack  the json of the message
 */
function registerDevice(dataPack){

    //create the connection
    var con = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "Fixed23",
      database: "BYCE"
    });

    //check the connection
    con.connect(function(err) {
      if (err) throw err;

      //connected, make the query
      var sql = "INSERT INTO DEVICES(UID,NAME_DEVICE,MODEL,OS_VERSION) VALUES ('" + dataPack.UID+"','"+dataPack.NAME_DEVICE+"','"+dataPack.MODEL+"','"+dataPack.OS_VERSION+"');";

      //execute the query
      con.query(sql, function (err, result) {
        if (!err){
            console.log("New device stored.");
        }
      });
    });
}
