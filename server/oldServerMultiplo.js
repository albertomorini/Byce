const http = require('http');
var url = require("url");



var bfr

//CLIENT -> 10.0.0.3:8124/?mac=EF:23:13&bat=98
http.createServer(function(req,res){


	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	console.log(query)

}).listen(8124,() => console.log("Server in ascolto sulla porta 8124"));



http.createServer(function(req,res){
	res.writeHead(200, {'content-type':'text/plain'});
	res.write(bfr)
	res.end()
}).listen(8127,() => console.log("Server in ascolto sulla porta 8127"));


