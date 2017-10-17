"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var https = require("https");
var fs = require("fs");
var url = require("url");
var path = require("path");
var PORT = 8443;
var options = {
    key: fs.readFileSync('server-key.pem'),
    cert: fs.readFileSync('server-crt.pem'),
    requestCert: true,
    rejectUnauthorized: true,
    ca: [fs.readFileSync('client-crt.pem'), fs.readFileSync('client-crt2.pem')]
};
https.createServer(options, function (req, res) {
    if (req.method === 'GET') {
        var uri = url.parse(req.url).pathname, filename_1 = path.join(process.cwd(), uri);
        fs.exists(filename_1, function (exists) {
            if (!exists) {
                res.writeHead(404, { "Content-Type": "text/plain" });
                res.write("404 Not Found\n");
                res.end();
                console.log("404 " + req.url);
                return;
            }
            if (fs.statSync(filename_1).isDirectory()) {
                filename_1 += '/index.html';
            }
            fs.readFile(filename_1, "binary", function (err, file) {
                if (err) {
                    res.writeHead(500, { "Content-Type": "text/plain" });
                    res.write(err + "\n");
                    res.end();
                    console.log("500 " + req.url);
                    return;
                }
                res.write(file, "binary");
                console.log("200 " + req.url);
                res.end();
            });
        });
    }
}).listen(PORT, function () { return console.log("Listening " + PORT); });
