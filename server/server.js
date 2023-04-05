var http = require('http');

var nStatic = require('node-static');

var fileServer = new nStatic.Server('../public');

http.createServer(function (req, res) {
    
    fileServer.serve(req, res);

}).listen(80, /*"192.168.4.66"*/ "161.31.108.165");