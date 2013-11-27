/*var http = require("http");

http.createServer(function(request, response) {
  
  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write("Hello World");
  response.end();
}).listen(9000);
*/

var net = require('net');
var server = net.createServer(function(c) { //'connection' listener
  console.log('server connected');
  c.on('end', function() {
    console.log('server disconnected');
  });

  c.on('data', function(data) {
	console.log('data received'+data);
  });

  c.write('hello\r\n');
  c.pipe(c);
});
server.listen(9000, function() { //'listening' listener
  console.log('server bound');
});

