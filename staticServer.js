const http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    port = process.argv[2] || 8888,
    mimeTypes = {
      "html": "text/html",
      "jpeg": "image/jpeg",
      "jpg": "image/jpeg",
      "png": "image/png",
      "js": "text/javascript",
      "css": "text/css",
      "pac": "application/x-ns-proxy-autoconfig"
    };
 
http.createServer(function(request, response) {

    // SSE
    if (request.url === '/events' && request.headers.accept && request.headers.accept === 'text/event-stream') {
        sendSSE(request, response);
    }
  else if (request.method === 'GET') {
	  let uri = url.parse(request.url).pathname,
	      filename = path.join(process.cwd(), uri);
	  
	  fs.exists(filename, function(exists) {
	    if(!exists) {
	      response.writeHead(404, { "Content-Type": "text/plain" });
	      response.write("404 Not Found\n");
	      response.end();
	      console.log("404 " + request.url);
	      return;
	    }
	 
	    if (fs.statSync(filename).isDirectory()) {
            filename += '/index.html';
        }
	 
	    fs.readFile(filename, "binary", function(err, file) {
	      if(err) {        
	        response.writeHead(500, {"Content-Type": "text/plain"});
	        response.write(err + "\n");
	        response.end();
	        console.log("500 " + request.url);
	        return;
	      }
	      
	      let mimeType = mimeTypes[filename.split('.').pop()];
	      
	      if (!mimeType) {
	        mimeType = 'text/plain';
	      }
	      let headers = { 'Content-Type': mimeType };

		  if (uri === '/index.html') {
//		  	headers['Cache-Control'] = 'private, max-age=46800';
//		  	headers['Expires'] = 'Fri, 24 Mar 2017 09:04:14 GMT';
		  	headers['Last-Modified'] =  (new Date()).toUTCString();
		  	headers['Set-Cookie'] = ['Proquote_TRADE_UAT1=1798508716.20480.0000;expires=Thu, 18 Dec 2020 12:00:00 UTC;path=/',
				     				 'Proquote_TRADE_UAT2=1798508716.20480.1111;expires=Thu, 18 Dec 2020 12:00:00 UTC;path=/',
					                 'Proquote_TRADE_UAT3=1798508716.20480.0000;expires=Thu, 18 Dec 2020 12:00:00 UTC;path=/',
                					 'JSESSIONID=' + (new Date()).toUTCString() + '; HttpOnly; path=/'
									];
//		    headers['Set-Cookie'] = 'JSESSIONID=' + (new Date()).toUTCString() + ";secure; HttpOnly; path=/";
		  	console.log(JSON.stringify(headers));
		  }	      

	      response.writeHead(200, headers);
	      response.write(file, "binary");
	      console.log("200 " + mimeType + " " + request.url);
	      response.end();
	    });
	  });
  }
  else if (request.method === 'POST') {
  	console.log(new Date());
  	console.log('POST', request.headers, request.url);
  	let body = '';
    request.on('data', function (data) {
        body += data;
    });
    request.on('end', function () {
        console.log("Body: " + body);
	    response.writeHead(200, {'Content-Type': 'text/html'});
	    response.end('post received');  	
    });
  }

}).listen(parseInt(port, 10));

function sendSSE(request, response) {

    // client code
    // var source = new EventSource('/events');
    // source.onmessage = function(e) { console.log(e) }

    response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });

    const id = (new Date()).toLocaleTimeString();

    // Sends a SSE every 5 seconds on a single connection.
    setInterval(function() {
        constructSSE(response, id, (new Date()).toLocaleTimeString());
    }, 5000);
    constructSSE(response, id, (new Date()).toLocaleTimeString());
}

function constructSSE(res, id, data) {
    res.write('id: ' + id + '\n');
    res.write("data: " + data + '\n\n');
}


console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");