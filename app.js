/**
* Copyright Jayaprakash Pasala
* Created on 11/26/2013
*
* A simple proxy server using nodejs. This is a very simple proxy server. Developed this in less
* than 24 hours. Meant to be a simple reference project or for personal use.
*
* Make your changes in user-agent callback to find and replace strings.
*
* THIS PROGRAM COMES WITH ABSOLUTELY NO WARRANTY.
*/

var net = require('net');
var stream = require('stream');

var DEBUG_LEVEL = {
    ERROR:   {value:  0, name: "Error"},
    WARNING: {value: 10, name: "Warning"},
    INFO:    {value: 20, name: "Info" },
    FINE:    {value: 30, name: "Fine" },
    FINEST:  {value: 40, name: "Finest"}
}

var debug_level_use = 20;

function consoleLog(level, msg) {
    if(level.value <= debug_level_use) {
        console.log(msg);
    }
}

var server = net.createServer(function(c) {
	consoleLog(DEBUG_LEVEL.INFO, 'server connected');
	var host = null;
    var protocol = null;
    var port = null;
    var client = null;
	c.on('end', function() {
	    if (client!=null)
	        client.end();
	    else
	        consoleLog(DEBUG_LEVEL.WARNING, 'Client is null');

	    consoleLog(DEBUG_LEVEL.FINE, 'server disconnected');
	});

	c.on('data', function(data) {
		consoleLog(DEBUG_LEVEL.INFO, 'data received');
		var d = ''+data;
		var indexOfSpace = d.indexOf(' ');
		if (indexOfSpace > 0) {
		    consoleLog(DEBUG_LEVEL.FINE, 'read data '+d);
		    var path = null;
            var replacedData = d;
			    var token = d.substring(0, indexOfSpace+1);
			    //consoleLog(DEBUG_LEVEL.FINEST, 'token read = '+token);
			    if (token == "GET " || token == "POST " || token == "CONNECT ") {
				    consoleLog(DEBUG_LEVEL.INFO, "found get or post");
				    var headers = d.split('\n', 2);
				    var tokens = headers[0].split(" ");
				    var pathIndex = tokens[1].indexOf('/',9);
				    if (pathIndex > 0) {
				        host = tokens[1].substring(0,pathIndex);
				        path = tokens[1].substring(pathIndex);
				    } else {
				        host = tokens[1];
				    }
				    var protocolIndex = host.indexOf('://');
				    if (protocolIndex > 0) {
				        protocol = host.substring(0,protocolIndex)+'://';
				        host = host.substring(protocolIndex+3);
				    }

				    var portIndex = host.indexOf(':');
				    if (portIndex > 0) {
				        port = host.substring(portIndex+1);
				        host = host.substring(0, portIndex);
				        if (port == "443" && protocol == null) {
				            protocol = "https";
				        }
				    } else {
				        if (protocol == "https://")
				            port = 443;
				        else
				            port = 80;
				    }
				    if (protocol == null)
				        protocol = "http://";

                if (token != "CONNECT ") {
				    consoleLog(DEBUG_LEVEL.FINE, "host ="+host+" port = "+port+" protocol = "+protocol+" path ="+path);
                    replacedData = tokens[0];
                    replacedData = replacedData + ' '+path+' '+tokens[2]+'\n'+data.slice(headers[0].length+1);
                }
                else {
                    consoleLog(DEBUG_LEVEL.FINE, "host ="+host+" port = "+port+" protocol = "+protocol+" path ="+path);
                    replacedData = '';
                }

                consoleLog(DEBUG_LEVEL.FINE, 'writing data '+replacedData);

                client = net.connect({port: port, host: host, allowHalfOpen: true},
                                function() { //'connect' listener
                              if (token != "CONNECT ")
                                client.write(replacedData);
                              else
                                c.write("HTTP/1.1 200 Connection established\n\n");
                            });
                            client.on('data', function(client_data) {
                              c.write(client_data);
                            });
                            client.on('end', function() {
                              //console.log('client disconnected');
                              //c.end();
                            });
                return;
                }
		}

		if (client!==null) {
		        //consoleLog(DEBUG_LEVEL.INFO, "client is not null");
		        consoleLog(DEBUG_LEVEL.INFO, d);
		        client.write(data);
		} else {
                consoleLog(DEBUG_LEVEL.INFO, "client is null !!!");
                //consoleLog(DEBUG_LEVEL.INFO, d);
		}
        //consoleLog(DEBUG_LEVEL.INFO, 'data end');
	});
	c.on('error', function(err) {
		consoleLog(DEBUG_LEVEL.ERROR, 'Error received');
		console.log(err);
	});
	//c.write('hello');
	//c.end();
});

server.on('error', function(e) {
	if (e.code == 'EADDRINUSE') {
		consoleLog(DEBUG_LEVEL.INFO, "Address in use");
		setTimeout(function() {
				server.close();
		},1000);
	}
});

server.listen(9090, function() {
	consoleLog(DEBUG_LEVEL.INFO, 'server ready to process');
});


